

// import React, { useState, useCallback, useMemo, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useAuth } from '../../context/AuthContext';
// import { useTheme } from '../../context/ThemeContext';
// import {
//   MessageSquare, Settings, BarChart3, Filter, Users, Clock,
//   AlertCircle, CheckCircle, XCircle, RefreshCw, Search,
//   Bell, Zap, Activity, Download, Shield, Server, Loader,
//   Menu, X, Database, Cpu, Globe, Wifi, WifiOff, LayoutDashboard,
//   FileText, Play, Pause, Plus, Eye, EyeOff, Copy, Trash2,
//   ChevronDown, ChevronUp, Calendar, DollarSign, Tag, TrendingUp,
//   Grid, List, User, Phone, Mail, Clock3
// } from 'lucide-react';

// // Components
// import { EnhancedSelect, getThemeClasses } from '../../components/ServiceManagement/Shared/components';
// import GatewayManager from '../../components/SMSAutomation/components/GatewayManager';
// import TemplateManager from '../../components/SMSAutomation/components/TemplateManager';
// import MessageManager from '../../components/SMSAutomation/components/MessageManager';
// import AutomationRules from '../../components/SMSAutomation/components/AutomationRules';
// import AnalyticsDashboard from '../../components/SMSAutomation/components/AnalyticsDashboard';
// import QueueMonitor from '../../components/SMSAutomation/components/QueueMonitor';
// import ExportManager from '../../components/SMSAutomation/components/ExportManager';
// import CreateModal from '../../components/SMSAutomation/components/CreateModal';

// // Hooks
// import { useWebSocket } from '../../components/SMSAutomation/hooks/useWebSocket';
// import { useSMSData } from '../../components/SMSAutomation/hooks/useSMSData';
// import { usePerformanceMonitor } from '../../components/SMSAutomation/hooks/usePerformanceMonitor';

// // Utils
// import { formatCurrency, formatNumber, formatPercentage } from '../../components/SMSAutomation/utils/formatters';
// import api from '../../api';
// import { validatePhoneNumber } from '../../components/SMSAutomation/utils/validators';

// // Constants
// import { SMS_API_ENDPOINTS, SMS_CONSTANTS } from '../../components/SMSAutomation/constants/apiEndpoints';

// /**
//  * SMS Automation Main Component
//  * Manages SMS gateways, templates, messages, automation rules, and analytics
//  */
// const SMSAutomation = () => {
//   // ===========================================================================
//   // Hooks and Context
//   // ===========================================================================
//   const { user } = useAuth();
//   const { theme } = useTheme();
//   const themeClasses = getThemeClasses(theme);

//   // ===========================================================================
//   // Local State
//   // ===========================================================================
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [showFilters, setShowFilters] = useState(false);
//   const [viewMode, setViewMode] = useState('grid');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [dateRange, setDateRange] = useState({ start: null, end: null });
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [createType, setCreateType] = useState('message');
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [globalError, setGlobalError] = useState(null);
//   const [connectionQuality, setConnectionQuality] = useState('good');
//   const [successMessage, setSuccessMessage] = useState(null);

//   // ===========================================================================
//   // Custom Hooks
//   // ===========================================================================
//   const {
//     gateways,
//     templates,
//     messages,
//     rules,
//     queue,
//     analytics,
//     dashboardStats,
//     loading: dataLoading,
//     isRefreshing,
//     error: dataError,
//     pagination,
//     refreshData,
//     fetchAllData,
//     fetchGateways,
//     fetchTemplates,
//     fetchMessages,
//     fetchRules,
//     fetchQueue,
//     fetchAnalytics,
//     loadMoreMessages,
//     loadMoreQueue,
//     hasActiveFilters,
//     clearFilters
//   } = useSMSData();

//   const {
//     metrics: performanceMetrics,
//     isActive: perfMonitoring,
//     toggleMonitoring: togglePerfMonitoring,
//     getPerformanceScore
//   } = usePerformanceMonitor({
//     enabled: true,
//     sampleInterval: 5000
//   });

//   const {
//     isConnected,
//     lastMessage,
//     connectionError: wsError,
//     connectionState,
//     reconnectAttempts,
//     sendMessage,
//     disconnect,
//     reconnect
//   } = useWebSocket({
//     url: process.env.NODE_ENV === 'production'
//       ? `wss://${window.location.host}/ws/sms/status/`
//       : 'ws://localhost:8000/ws/sms/status/',
//     autoConnect: !!user,
//     reconnectInterval: 3000,
//     maxReconnectAttempts: 20,
//     heartbeatInterval: 25000,
//     onMessage: (data) => handleRealTimeUpdate(data),
//     onOpen: () => {
//       console.log('✅ WebSocket connected');
//       setConnectionQuality('good');
//       setGlobalError(null);
//     },
//     onClose: (event) => {
//       if (event.code !== 1000) {
//         setConnectionQuality('poor');
//       }
//     },
//     onError: () => setConnectionQuality('degraded')
//   });

//   // ===========================================================================
//   // Memoized Values
//   // ===========================================================================
//   const tabs = useMemo(() => [
//     { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview and key metrics' },
//     { id: 'messages', label: 'Messages', icon: MessageSquare, description: 'Send and track SMS messages' },
//     { id: 'templates', label: 'Templates', icon: FileText, description: 'Manage message templates' },
//     { id: 'gateways', label: 'Gateways', icon: Server, description: 'Configure SMS providers' },
//     { id: 'automation', label: 'Automation', icon: Zap, description: 'Automated SMS rules' },
//     { id: 'queue', label: 'Queue', icon: Clock, description: 'Message queue monitor' },
//     { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Detailed analytics' },
//     { id: 'export', label: 'Export', icon: Download, description: 'Export SMS data' }
//   ], []);

//   const statusOptions = useMemo(() => [
//     { value: 'all', label: 'All Statuses' },
//     { value: 'pending', label: 'Pending' },
//     { value: 'sent', label: 'Sent' },
//     { value: 'delivered', label: 'Delivered' },
//     { value: 'failed', label: 'Failed' }
//   ], []);

//   const createOptions = useMemo(() => [
//     { value: 'message', label: 'New Message' },
//     { value: 'template', label: 'New Template' },
//     { value: 'gateway', label: 'New Gateway' },
//     { value: 'rule', label: 'New Automation Rule' }
//   ], []);

//   // ===========================================================================
//   // Helper Functions
//   // ===========================================================================
//   const safeArray = (data) => {
//     if (Array.isArray(data)) return data;
//     if (data && typeof data === 'object') return Object.values(data);
//     return [];
//   };

//   const getQueueStats = () => {
//     const queueArray = safeArray(queue);
//     return {
//       total: queueArray.length,
//       pending: queueArray.filter(q => q.status === 'pending').length,
//       processing: queueArray.filter(q => q.status === 'processing').length,
//       completed: queueArray.filter(q => q.status === 'completed').length,
//       failed: queueArray.filter(q => q.status === 'failed').length
//     };
//   };

//   const getGatewayStats = () => {
//     const gatewaysArray = safeArray(gateways);
//     return {
//       total: gatewaysArray.length,
//       online: gatewaysArray.filter(g => g.is_online).length,
//       offline: gatewaysArray.filter(g => !g.is_online).length,
//       active: gatewaysArray.filter(g => g.is_active).length
//     };
//   };

//   // ===========================================================================
//   // API Handlers for Create Operations
//   // ===========================================================================
//   const handleCreateMessage = async (data) => {
//     try {
//       const response = await api.post(SMS_API_ENDPOINTS.MESSAGES.CREATE, {
//         ...data,
//         scheduled_for: data.scheduled_for || null,
//         gateway_id: data.gateway_id || null,
//         template_id: data.template_id || null,
//         priority: data.priority || 'normal'
//       });
      
//       setSuccessMessage('Message sent successfully!');
//       setTimeout(() => setSuccessMessage(null), 3000);
//       refreshData();
//       return response.data;
//     } catch (error) {
//       console.error('Failed to send message:', error);
//       throw error;
//     }
//   };

//   const handleCreateTemplate = async (data) => {
//     try {
//       const response = await api.post(SMS_API_ENDPOINTS.TEMPLATES.LIST, {
//         ...data,
//         is_active: data.is_active ?? true,
//         allow_unicode: data.allow_unicode || false,
//         variables: data.message_template?.match(/\{\{([^}]+)\}\}/g)?.map(v => v.replace(/[{}]/g, '')) || []
//       });
      
//       setSuccessMessage('Template created successfully!');
//       setTimeout(() => setSuccessMessage(null), 3000);
//       refreshData();
//       return response.data;
//     } catch (error) {
//       console.error('Failed to create template:', error);
//       throw error;
//     }
//   };

//   const handleCreateGateway = async (data) => {
//     try {
//       const response = await api.post(SMS_API_ENDPOINTS.GATEWAYS.LIST, {
//         ...data,
//         is_active: data.is_active ?? true,
//         is_default: data.is_default || false,
//         max_messages_per_minute: data.max_messages_per_minute || 60,
//         max_messages_per_hour: data.max_messages_per_hour || 1000,
//         max_messages_per_day: data.max_messages_per_day || 10000
//       });
      
//       setSuccessMessage('Gateway added successfully!');
//       setTimeout(() => setSuccessMessage(null), 3000);
//       refreshData();
//       return response.data;
//     } catch (error) {
//       console.error('Failed to create gateway:', error);
//       throw error;
//     }
//   };

//   const handleCreateRule = async (data) => {
//     try {
//       const response = await api.post(SMS_API_ENDPOINTS.RULES.LIST, {
//         ...data,
//         is_active: data.is_active ?? true,
//         is_recurring: data.is_recurring || false,
//         condition: data.condition_field && data.condition_operator && data.condition_value ? {
//           field: data.condition_field,
//           operator: data.condition_operator,
//           value: data.condition_value
//         } : null,
//         delay_minutes: data.delay_minutes || 0,
//         priority: data.priority || 'normal'
//       });
      
//       setSuccessMessage('Automation rule created successfully!');
//       setTimeout(() => setSuccessMessage(null), 3000);
//       refreshData();
//       return response.data;
//     } catch (error) {
//       console.error('Failed to create rule:', error);
//       throw error;
//     }
//   };

//   // ===========================================================================
//   // Callback Handlers
//   // ===========================================================================
//   const handleRealTimeUpdate = useCallback((update) => {
//     if (!update) return;

//     switch (update.type) {
//       case 'sms_sent':
//       case 'sms_delivered':
//       case 'sms_failed':
//       case 'queue_update':
//       case 'gateway_update':
//         refreshData();
//         break;
//       case 'ping':
//         sendMessage({ type: 'pong' });
//         break;
//       default:
//         break;
//     }
//   }, [refreshData, sendMessage]);

//   const handleTabChange = useCallback((tabId) => {
//     setActiveTab(tabId);
//     setIsMobileMenuOpen(false);
//   }, []);

//   const handleRefresh = useCallback(async () => {
//     try {
//       await refreshData();
//     } catch (err) {
//       console.error('Refresh failed:', err);
//       setGlobalError('Failed to refresh data');
//     }
//   }, [refreshData]);

//   const handleSearch = useCallback((e) => {
//     const value = e.target.value;
//     setSearchTerm(value);
    
//     const timeoutId = setTimeout(() => {
//       // Apply search filter based on active tab
//       if (activeTab === 'messages') {
//         fetchMessages(1, { search: value });
//       }
//     }, 300);

//     return () => clearTimeout(timeoutId);
//   }, [activeTab, fetchMessages]);

//   const handleCreate = useCallback((type) => {
//     setCreateType(type);
//     setShowCreateModal(true);
//   }, []);

//   const handleCreateSubmit = useCallback(async (data) => {
//     switch (createType) {
//       case 'message':
//         await handleCreateMessage(data);
//         break;
//       case 'template':
//         await handleCreateTemplate(data);
//         break;
//       case 'gateway':
//         await handleCreateGateway(data);
//         break;
//       case 'rule':
//         await handleCreateRule(data);
//         break;
//       default:
//         break;
//     }
//   }, [createType]);

//   const handleCreateModalClose = useCallback((success) => {
//     setShowCreateModal(false);
//     if (success) {
//       refreshData();
//     }
//   }, [refreshData]);

//   // ===========================================================================
//   // Render Helpers
//   // ===========================================================================
//   const renderError = () => {
//     const error = globalError || dataError || wsError;
//     if (!error) return null;

//     return (
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, y: -20 }}
//         className={`mb-4 p-4 rounded-lg border ${themeClasses.bg.danger} ${themeClasses.border.danger}`}
//       >
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <AlertCircle className="text-red-500" size={20} />
//             <span className={themeClasses.text.primary}>{error}</span>
//           </div>
//           <button
//             onClick={() => setGlobalError(null)}
//             className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
//           >
//             <X size={16} />
//           </button>
//         </div>
//       </motion.div>
//     );
//   };

//   const renderSuccess = () => {
//     if (!successMessage) return null;

//     return (
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, y: -20 }}
//         className={`mb-4 p-4 rounded-lg border bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800`}
//       >
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <CheckCircle className="text-green-500" size={20} />
//             <span className={themeClasses.text.primary}>{successMessage}</span>
//           </div>
//           <button
//             onClick={() => setSuccessMessage(null)}
//             className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/30"
//           >
//             <X size={16} />
//           </button>
//         </div>
//       </motion.div>
//     );
//   };

//   const renderConnectionStatus = () => {
//     let statusColor = 'bg-green-500';
//     let statusText = 'Connected';
//     let statusIcon = <Wifi className="w-4 h-4" />;

//     if (!isConnected) {
//       if (reconnectAttempts > 0) {
//         statusColor = 'bg-yellow-500 animate-pulse';
//         statusText = `Reconnecting (${reconnectAttempts})`;
//         statusIcon = <WifiOff className="w-4 h-4" />;
//       } else {
//         statusColor = 'bg-red-500';
//         statusText = 'Disconnected';
//         statusIcon = <WifiOff className="w-4 h-4" />;
//       }
//     }

//     return (
//       <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${themeClasses.bg.secondary}`}>
//         {statusIcon}
//         <div className={`w-2 h-2 rounded-full ${statusColor}`} />
//         <span className="text-sm hidden sm:inline">{statusText}</span>
//       </div>
//     );
//   };

//   const renderHeader = () => (
//     <header className="mb-6 relative z-10">
//       {/* Mobile Header */}
//       <div className="lg:hidden flex items-center justify-between mb-4">
//         <button
//           onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//           className={`p-2 rounded-lg ${themeClasses.bg.secondary}`}
//           aria-label="Toggle menu"
//         >
//           {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
//         </button>
        
//         <h1 className={`text-xl font-bold ${themeClasses.text.primary}`}>
//           SMS Automation
//         </h1>

//         <button
//           onClick={() => handleCreate(createType)}
//           className={`p-2 rounded-lg ${themeClasses.button.primary}`}
//           aria-label="Create new"
//         >
//           <Plus size={20} />
//         </button>
//       </div>

//       {/* Desktop Header */}
//       <div className="hidden lg:flex lg:flex-col lg:gap-4">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className={`text-3xl font-bold mb-1 ${themeClasses.text.primary}`}>
//               SMS Automation
//             </h1>
//             <p className={`text-sm ${themeClasses.text.secondary}`}>
//               Manage SMS gateways, templates, and automated messaging
//             </p>
//           </div>

//           <div className="flex items-center gap-2">
//             {renderConnectionStatus()}

//             {perfMonitoring && (
//               <div className={`hidden xl:flex items-center gap-2 px-3 py-2 rounded-lg ${themeClasses.bg.secondary}`}>
//                 <Cpu className="w-4 h-4" />
//                 <span className="text-sm font-medium">
//                   Score: <span className="text-blue-500">{getPerformanceScore()}</span>
//                 </span>
//               </div>
//             )}

//             <button
//               onClick={togglePerfMonitoring}
//               className={`p-2 rounded-lg ${themeClasses.button.secondary}`}
//               title={perfMonitoring ? 'Disable performance monitor' : 'Enable performance monitor'}
//             >
//               <Activity size={18} className={perfMonitoring ? 'text-blue-500' : ''} />
//             </button>
//           </div>
//         </div>

//         {/* Action Bar */}
//         <div className="flex flex-wrap items-center gap-3">
//           {/* Search - Desktop */}
//           <div className="relative flex-1 min-w-[200px] max-w-md">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//             <input
//               type="text"
//               value={searchTerm}
//               onChange={handleSearch}
//               placeholder="Search..."
//               className={`w-full pl-10 pr-4 py-2 rounded-lg border text-sm ${themeClasses.input}`}
//             />
//           </div>

//           <button
//             onClick={() => setShowFilters(!showFilters)}
//             className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
//               themeClasses.button.secondary
//             }`}
//           >
//             <Filter size={18} />
//             <span className="hidden sm:inline">{showFilters ? 'Hide' : 'Show'} Filters</span>
//           </button>

//           <button
//             onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
//             className={`p-2 rounded-lg ${themeClasses.button.secondary}`}
//             title={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
//           >
//             {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
//           </button>

//           <button
//             onClick={handleRefresh}
//             disabled={isRefreshing}
//             className={`p-2 rounded-lg ${themeClasses.button.secondary}`}
//           >
//             <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
//           </button>

//           <div className="flex items-center gap-2">
//             <EnhancedSelect
//               value={createType}
//               onChange={setCreateType}
//               options={createOptions}
//               theme={theme}
//               className="w-40"
//             />

//             <button
//               onClick={() => handleCreate(createType)}
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
//                 themeClasses.button.primary
//               } hover:scale-105 transition-all`}
//             >
//               <Plus size={18} />
//               <span className="hidden sm:inline">Create</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       <AnimatePresence>{renderError()}</AnimatePresence>
//       <AnimatePresence>{renderSuccess()}</AnimatePresence>
//     </header>
//   );

//   const renderTabs = () => (
//     <div className="mb-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10">
//       <nav className="flex flex-nowrap gap-1 sm:gap-2 border-b border-gray-200 dark:border-gray-700 pb-2 min-w-max">
//         {tabs.map((tab) => {
//           const Icon = tab.icon;
//           const isActive = activeTab === tab.id;
          
//           return (
//             <button
//               key={tab.id}
//               onClick={() => handleTabChange(tab.id)}
//               className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
//                 isActive 
//                   ? themeClasses.button.primary 
//                   : `${themeClasses.button.secondary} hover:bg-gray-100 dark:hover:bg-gray-800`
//               }`}
//               title={tab.description}
//             >
//               <Icon size={18} />
//               {/* Hide label on small screens, show only icons */}
//               <span className="hidden sm:inline">{tab.label}</span>
//               {tab.id === 'queue' && getQueueStats().pending > 0 && (
//                 <span className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
//                   {getQueueStats().pending}
//                 </span>
//               )}
//             </button>
//           );
//         })}
//       </nav>
//     </div>
//   );

//   const renderMobileMenu = () => {
//     if (!isMobileMenuOpen) return null;

//     return (
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 z-[9998] bg-black/50 lg:hidden"
//         onClick={() => setIsMobileMenuOpen(false)}
//       >
//         <motion.div
//           initial={{ x: -300 }}
//           animate={{ x: 0 }}
//           exit={{ x: -300 }}
//           transition={{ type: "spring", damping: 25 }}
//           className={`absolute left-0 top-0 h-full w-64 ${themeClasses.bg.card} shadow-xl p-4`}
//           onClick={(e) => e.stopPropagation()}
//         >
//           <div className="flex justify-between items-center mb-6">
//             <h2 className={`font-bold ${themeClasses.text.primary}`}>Menu</h2>
//             <button
//               onClick={() => setIsMobileMenuOpen(false)}
//               className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
//             >
//               <X size={18} />
//             </button>
//           </div>

//           {/* Mobile Search */}
//           <div className="relative mb-4">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
//             <input
//               type="text"
//               value={searchTerm}
//               onChange={handleSearch}
//               placeholder="Search..."
//               className={`w-full pl-9 pr-3 py-2 rounded-lg border text-sm ${themeClasses.input}`}
//             />
//           </div>

//           {/* Mobile Tabs */}
//           <div className="space-y-1">
//             {tabs.map((tab) => {
//               const Icon = tab.icon;
//               const isActive = activeTab === tab.id;
              
//               return (
//                 <button
//                   key={tab.id}
//                   onClick={() => handleTabChange(tab.id)}
//                   className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${
//                     isActive ? themeClasses.button.primary : themeClasses.button.secondary
//                   }`}
//                 >
//                   <Icon size={18} />
//                   <span className="flex-1 text-left">{tab.label}</span>
//                   {tab.id === 'queue' && getQueueStats().pending > 0 && (
//                     <span className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
//                       {getQueueStats().pending}
//                     </span>
//                   )}
//                 </button>
//               );
//             })}
//           </div>

//           {/* Mobile Actions */}
//           <div className={`mt-6 pt-6 border-t ${themeClasses.border.light}`}>
//             <div className="space-y-2">
//               <EnhancedSelect
//                 value={createType}
//                 onChange={setCreateType}
//                 options={createOptions}
//                 theme={theme}
//                 className="w-full"
//               />
              
//               <button
//                 onClick={() => {
//                   handleCreate(createType);
//                   setIsMobileMenuOpen(false);
//                 }}
//                 className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium ${
//                   themeClasses.button.primary
//                 }`}
//               >
//                 <Plus size={18} />
//                 Create
//               </button>
//             </div>
//           </div>
//         </motion.div>
//       </motion.div>
//     );
//   };

//   const renderFilters = () => {
//     if (!showFilters) return null;

//     return (
//       <motion.aside
//         initial={{ opacity: 0, x: -20 }}
//         animate={{ opacity: 1, x: 0 }}
//         exit={{ opacity: 0, x: -20 }}
//         className="w-full lg:w-80 mb-6 lg:mb-0 relative z-10"
//       >
//         <div className={`p-5 rounded-xl border sticky top-6 ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//           <div className="flex items-center justify-between mb-4">
//             <h3 className={`font-semibold ${themeClasses.text.primary}`}>Filters</h3>
//             {hasActiveFilters && (
//               <button
//                 onClick={clearFilters}
//                 className={`text-sm ${themeClasses.text.secondary} hover:text-indigo-500`}
//               >
//                 Clear all
//               </button>
//             )}
//           </div>
          
//           <div className="space-y-4">
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                 Status
//               </label>
//               <EnhancedSelect
//                 value={statusFilter}
//                 onChange={setStatusFilter}
//                 options={statusOptions}
//                 theme={theme}
//               />
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                 Date Range
//               </label>
//               <div className="space-y-2">
//                 <input
//                   type="date"
//                   value={dateRange.start || ''}
//                   onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
//                   className={`w-full px-3 py-2 rounded-lg border text-sm ${themeClasses.input}`}
//                 />
//                 <input
//                   type="date"
//                   value={dateRange.end || ''}
//                   onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
//                   className={`w-full px-3 py-2 rounded-lg border text-sm ${themeClasses.input}`}
//                 />
//               </div>
//             </div>

//             {activeTab === 'gateways' && (
//               <div>
//                 <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                   Gateway Type
//                 </label>
//                 <EnhancedSelect
//                   value={statusFilter}
//                   onChange={setStatusFilter}
//                   options={[
//                     { value: 'all', label: 'All Types' },
//                     { value: 'africas_talking', label: "Africa's Talking" },
//                     { value: 'twilio', label: 'Twilio' },
//                     { value: 'smpp', label: 'SMPP' },
//                     { value: 'custom', label: 'Custom' }
//                   ]}
//                   theme={theme}
//                 />
//               </div>
//             )}

//             {activeTab === 'templates' && (
//               <div>
//                 <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                   Template Type
//                 </label>
//                 <EnhancedSelect
//                   value={statusFilter}
//                   onChange={setStatusFilter}
//                   options={[
//                     { value: 'all', label: 'All Types' },
//                     { value: 'welcome', label: 'Welcome' },
//                     { value: 'payment', label: 'Payment' },
//                     { value: 'reminder', label: 'Reminder' },
//                     { value: 'promotional', label: 'Promotional' }
//                   ]}
//                   theme={theme}
//                 />
//               </div>
//             )}
//           </div>
//         </div>
//       </motion.aside>
//     );
//   };

//   const renderMainContent = () => {
//     const commonProps = {
//       theme,
//       themeClasses,
//       onRefresh: refreshData,
//       loading: dataLoading
//     };

//     switch (activeTab) {
//       case 'dashboard':
//         return (
//           <AnalyticsDashboard
//             stats={dashboardStats}
//             analytics={analytics}
//             gateways={safeArray(gateways)}
//             messages={safeArray(messages)}
//             templates={safeArray(templates)}
//             queue={safeArray(queue)}
//             performanceData={performanceMetrics}
//             onRefresh={handleRefresh}
//             {...commonProps}
//           />
//         );
      
//       case 'messages':
//         return (
//           <MessageManager
//             messages={safeArray(messages)}
//             gateways={safeArray(gateways)}
//             templates={safeArray(templates)}
//             pagination={pagination.messages}
//             onLoadMore={loadMoreMessages}
//             onSendMessage={(data) => sendMessage({ type: 'send_sms', ...data })}
//             viewMode={viewMode}
//             searchTerm={searchTerm}
//             statusFilter={statusFilter}
//             dateRange={dateRange}
//             {...commonProps}
//           />
//         );
      
//       case 'templates':
//         return (
//           <TemplateManager
//             templates={safeArray(templates)}
//             onCreateClick={() => handleCreate('template')}
//             onDuplicate={async (id) => {
//               try {
//                 await api.post(SMS_API_ENDPOINTS.TEMPLATES.DUPLICATE(id));
//                 setSuccessMessage('Template duplicated successfully');
//                 refreshData();
//               } catch (error) {
//                 setGlobalError('Failed to duplicate template');
//               }
//             }}
//             onTestRender={async (id, data) => {
//               try {
//                 const response = await api.post(SMS_API_ENDPOINTS.TEMPLATES.TEST_RENDER(id), data);
//                 return response.data;
//               } catch (error) {
//                 throw error;
//               }
//             }}
//             onEdit={async (id, data) => {
//               try {
//                 await api.put(SMS_API_ENDPOINTS.TEMPLATES.DETAIL(id), data);
//                 setSuccessMessage('Template updated successfully');
//                 refreshData();
//               } catch (error) {
//                 setGlobalError('Failed to update template');
//               }
//             }}
//             onDelete={async (id) => {
//               try {
//                 await api.delete(SMS_API_ENDPOINTS.TEMPLATES.DETAIL(id));
//                 setSuccessMessage('Template deleted successfully');
//                 refreshData();
//               } catch (error) {
//                 setGlobalError('Failed to delete template');
//               }
//             }}
//             viewMode={viewMode}
//             searchTerm={searchTerm}
//             statusFilter={statusFilter}
//             {...commonProps}
//           />
//         );
      
//       case 'gateways':
//         return (
//           <GatewayManager
//             gateways={safeArray(gateways)}
//             onTestConnection={async (id) => {
//               try {
//                 const response = await api.post(SMS_API_ENDPOINTS.GATEWAYS.TEST_CONNECTION(id));
//                 if (response.data.success) {
//                   setSuccessMessage('Connection test successful');
//                 } else {
//                   setGlobalError('Connection test failed');
//                 }
//                 refreshData();
//               } catch (error) {
//                 setGlobalError('Connection test failed');
//               }
//             }}
//             onSetDefault={async (id) => {
//               try {
//                 await api.post(SMS_API_ENDPOINTS.GATEWAYS.SET_DEFAULT(id));
//                 setSuccessMessage('Default gateway updated');
//                 refreshData();
//               } catch (error) {
//                 setGlobalError('Failed to set default gateway');
//               }
//             }}
//             onToggleActive={async (id) => {
//               try {
//                 await api.post(SMS_API_ENDPOINTS.GATEWAYS.TOGGLE_ACTIVE(id));
//                 refreshData();
//               } catch (error) {
//                 setGlobalError('Failed to toggle gateway');
//               }
//             }}
//             onEdit={async (id, data) => {
//               try {
//                 await api.put(SMS_API_ENDPOINTS.GATEWAYS.DETAIL(id), data);
//                 setSuccessMessage('Gateway updated successfully');
//                 refreshData();
//               } catch (error) {
//                 setGlobalError('Failed to update gateway');
//               }
//             }}
//             onDelete={async (id) => {
//               try {
//                 await api.delete(SMS_API_ENDPOINTS.GATEWAYS.DETAIL(id));
//                 setSuccessMessage('Gateway deleted successfully');
//                 refreshData();
//               } catch (error) {
//                 setGlobalError('Failed to delete gateway');
//               }
//             }}
//             viewMode={viewMode}
//             searchTerm={searchTerm}
//             statusFilter={statusFilter}
//             {...commonProps}
//           />
//         );
      
//       case 'automation':
//         return (
//           <AutomationRules
//             rules={safeArray(rules)}
//             templates={safeArray(templates)}
//             onToggleActive={async (id) => {
//               try {
//                 await api.post(SMS_API_ENDPOINTS.RULES.TOGGLE_ACTIVE(id));
//                 refreshData();
//               } catch (error) {
//                 setGlobalError('Failed to toggle rule');
//               }
//             }}
//             onTestTrigger={async (id, data) => {
//               try {
//                 const response = await api.post(SMS_API_ENDPOINTS.RULES.TEST_TRIGGER(id), data);
//                 return response.data;
//               } catch (error) {
//                 throw error;
//               }
//             }}
//             onExecute={async (id, data) => {
//               try {
//                 await api.post(SMS_API_ENDPOINTS.RULES.EXECUTE(id), data);
//                 setSuccessMessage('Rule executed successfully');
//                 refreshData();
//               } catch (error) {
//                 setGlobalError('Failed to execute rule');
//               }
//             }}
//             onDuplicate={async (id) => {
//               try {
//                 await api.post(SMS_API_ENDPOINTS.RULES.DUPLICATE(id));
//                 setSuccessMessage('Rule duplicated successfully');
//                 refreshData();
//               } catch (error) {
//                 setGlobalError('Failed to duplicate rule');
//               }
//             }}
//             onDelete={async (id) => {
//               try {
//                 await api.delete(SMS_API_ENDPOINTS.RULES.DETAIL(id));
//                 setSuccessMessage('Rule deleted successfully');
//                 refreshData();
//               } catch (error) {
//                 setGlobalError('Failed to delete rule');
//               }
//             }}
//             viewMode={viewMode}
//             searchTerm={searchTerm}
//             statusFilter={statusFilter}
//             {...commonProps}
//           />
//         );
      
//       case 'queue':
//         return (
//           <QueueMonitor
//             queue={safeArray(queue)}
//             onProcessBatch={async (data) => {
//               try {
//                 await api.post(SMS_API_ENDPOINTS.QUEUE.PROCESS_BATCH, data);
//                 setSuccessMessage('Batch processing started');
//                 refreshData();
//               } catch (error) {
//                 setGlobalError('Failed to process batch');
//               }
//             }}
//             onClearFailed={async (data) => {
//               try {
//                 await api.post(SMS_API_ENDPOINTS.QUEUE.CLEAR_FAILED, data);
//                 setSuccessMessage('Failed messages cleared');
//                 refreshData();
//               } catch (error) {
//                 setGlobalError('Failed to clear messages');
//               }
//             }}
//             realTimeUpdates={lastMessage}
//             viewMode={viewMode}
//             searchTerm={searchTerm}
//             statusFilter={statusFilter}
//             {...commonProps}
//           />
//         );
      
//       case 'analytics':
//         return (
//           <AnalyticsDashboard
//             stats={dashboardStats}
//             analytics={analytics}
//             gateways={safeArray(gateways)}
//             messages={safeArray(messages)}
//             templates={safeArray(templates)}
//             queue={safeArray(queue)}
//             detailed={true}
//             performanceData={performanceMetrics}
//             onRefresh={handleRefresh}
//             onExport={async (format) => {
//               try {
//                 if (format === 'csv') {
//                   window.location.href = SMS_API_ENDPOINTS.ANALYTICS.EXPORT;
//                 }
//                 setSuccessMessage('Data exported successfully');
//               } catch (error) {
//                 setGlobalError('Failed to export data');
//               }
//             }}
//             {...commonProps}
//           />
//         );
      
//       case 'export':
//         return (
//           <ExportManager
//             messages={safeArray(messages)}
//             templates={safeArray(templates)}
//             gateways={safeArray(gateways)}
//             rules={safeArray(rules)}
//             analytics={analytics}
//             onExport={async (format, data) => {
//               try {
//                 // Handle export based on format
//                 console.log('Exporting:', format, data);
//                 setSuccessMessage(`Data exported as ${format.toUpperCase()}`);
//               } catch (error) {
//                 setGlobalError('Failed to export data');
//               }
//             }}
//             {...commonProps}
//           />
//         );
      
//       default:
//         return null;
//     }
//   };

//   // ===========================================================================
//   // Main Render
//   // ===========================================================================
//   return (
//     <div className={`relative isolate min-h-screen transition-colors duration-300 ${themeClasses.bg.primary}`}>
//       <div className="p-3 sm:p-4 md:p-5 lg:p-6 max-w-7xl mx-auto">
//         {renderHeader()}
//         {renderTabs()}
//         <AnimatePresence>{renderMobileMenu()}</AnimatePresence>

//         <div className="flex flex-col lg:flex-row gap-6">
//           <AnimatePresence>{renderFilters()}</AnimatePresence>

//           <main className={showFilters ? 'w-full lg:flex-1' : 'w-full'}>
//             <div className="space-y-6">
//               {renderMainContent()}
//             </div>
//           </main>
//         </div>
//       </div>

//       {/* Create Modal - Rendered at root level with highest z-index */}
//       <CreateModal
//         isOpen={showCreateModal}
//         onClose={handleCreateModalClose}
//         type={createType}
//         onSubmit={handleCreateSubmit}
//         gateways={safeArray(gateways)}
//         templates={safeArray(templates)}
//         theme={theme}
//       />
//     </div>
//   );
// };

// export default SMSAutomation;









import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  MessageSquare, Settings, BarChart3, Filter, Users, Clock,
  AlertCircle, CheckCircle, XCircle, RefreshCw, Search,
  Bell, Zap, Activity, Download, Shield, Server, Loader,
  Menu, X, Database, Cpu, Globe, Wifi, WifiOff, LayoutDashboard,
  FileText, Play, Pause, Plus, Eye, EyeOff, Copy, Trash2,
  ChevronDown, ChevronUp, Calendar, DollarSign, Tag, TrendingUp,
  Grid, List, User, Phone, Mail, Clock3
} from 'lucide-react';

// Components
import { EnhancedSelect, getThemeClasses } from '../../components/ServiceManagement/Shared/components';
import GatewayManager from '../../components/SMSAutomation/components/GatewayManager';
import TemplateManager from '../../components/SMSAutomation/components/TemplateManager';
import MessageManager from '../../components/SMSAutomation/components/MessageManager';
import AutomationRules from '../../components/SMSAutomation/components/AutomationRules';
import AnalyticsDashboard from '../../components/SMSAutomation/components/AnalyticsDashboard';
import QueueMonitor from '../../components/SMSAutomation/components/QueueMonitor';
import ExportManager from '../../components/SMSAutomation/components/ExportManager';
import CreateModal from '../../components/SMSAutomation/components/CreateModal';

// Hooks
import { useWebSocket } from '../../components/SMSAutomation/hooks/useWebSocket';
import { useSMSData } from '../../components/SMSAutomation/hooks/useSMSData';
import { usePerformanceMonitor } from '../../components/SMSAutomation/hooks/usePerformanceMonitor';

// Utils
import { formatCurrency, formatNumber, formatPercentage } from '../../components/SMSAutomation/utils/formatters';
import api from '../../api';

// Constants
import { SMS_API_ENDPOINTS } from '../../components/SMSAutomation/constants/apiEndpoints';

/**
 * SMS Automation Main Component
 * Manages SMS gateways, templates, messages, automation rules, and analytics
 */
const SMSAutomation = () => {
  // ===========================================================================
  // Hooks and Context
  // ===========================================================================
  const { user } = useAuth();
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  // ===========================================================================
  // Local State
  // ===========================================================================
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState('message');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [connectionQuality, setConnectionQuality] = useState('good');
  const [successMessage, setSuccessMessage] = useState(null);

  // ===========================================================================
  // Custom Hooks
  // ===========================================================================
  const {
    gateways,
    templates,
    messages,
    rules,
    queue,
    analytics,
    dashboardStats,
    loading: dataLoading,
    isRefreshing,
    error: dataError,
    pagination,
    refreshData,
    fetchGateways,
    fetchTemplates,
    fetchMessages,
    fetchRules,
    fetchQueue,
    fetchAnalytics,
    loadMoreMessages,
    loadMoreQueue,
    hasActiveFilters,
    clearFilters
  } = useSMSData();

  const {
    metrics: performanceMetrics,
    isActive: perfMonitoring,
    toggleMonitoring: togglePerfMonitoring,
    getPerformanceScore
  } = usePerformanceMonitor({
    enabled: true,
    sampleInterval: 5000
  });

  const {
    isConnected,
    lastMessage,
    connectionError: wsError,
    connectionState,
    reconnectAttempts,
    sendMessage
  } = useWebSocket({
    url: process.env.NODE_ENV === 'production'
      ? `wss://${window.location.host}/ws/sms/status/`
      : 'ws://localhost:8000/ws/sms/status/',
    autoConnect: !!user,
    reconnectInterval: 3000,
    maxReconnectAttempts: 20,
    heartbeatInterval: 25000,
    onMessage: (data) => handleRealTimeUpdate(data),
    onOpen: () => {
      setConnectionQuality('good');
      setGlobalError(null);
    },
    onClose: (event) => {
      if (event.code !== 1000) {
        setConnectionQuality('poor');
      }
    },
    onError: () => setConnectionQuality('degraded')
  });

  // ===========================================================================
  // Memoized Values
  // ===========================================================================
  const tabs = useMemo(() => [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview and key metrics' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, description: 'Send and track SMS messages' },
    { id: 'templates', label: 'Templates', icon: FileText, description: 'Manage message templates' },
    { id: 'gateways', label: 'Gateways', icon: Server, description: 'Configure SMS providers' },
    { id: 'automation', label: 'Automation', icon: Zap, description: 'Automated SMS rules' },
    { id: 'queue', label: 'Queue', icon: Clock, description: 'Message queue monitor' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Detailed analytics' },
    { id: 'export', label: 'Export', icon: Download, description: 'Export SMS data' }
  ], []);

  const statusOptions = useMemo(() => [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'sent', label: 'Sent' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'failed', label: 'Failed' }
  ], []);

  const createOptions = useMemo(() => [
    { value: 'message', label: 'New Message', icon: MessageSquare },
    { value: 'template', label: 'New Template', icon: FileText },
    { value: 'gateway', label: 'New Gateway', icon: Server },
    { value: 'rule', label: 'New Automation Rule', icon: Zap }
  ], []);

  // ===========================================================================
  // Helper Functions
  // ===========================================================================
  const safeArray = (data) => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') return Object.values(data);
    return [];
  };

  const getQueueStats = () => {
    const queueArray = safeArray(queue);
    return {
      total: queueArray.length,
      pending: queueArray.filter(q => q.status === 'pending').length,
      processing: queueArray.filter(q => q.status === 'processing').length,
      completed: queueArray.filter(q => q.status === 'completed').length,
      failed: queueArray.filter(q => q.status === 'failed').length
    };
  };

  const getGatewayStats = () => {
    const gatewaysArray = safeArray(gateways);
    return {
      total: gatewaysArray.length,
      online: gatewaysArray.filter(g => g.is_online).length,
      offline: gatewaysArray.filter(g => !g.is_online).length,
      active: gatewaysArray.filter(g => g.is_active).length
    };
  };

  // ===========================================================================
  // API Handlers for Create Operations
  // ===========================================================================
  const handleCreateMessage = async (data) => {
    try {
      const response = await api.post(SMS_API_ENDPOINTS.MESSAGES.CREATE, {
        ...data,
        scheduled_for: data.scheduled_for || null,
        gateway_id: data.gateway_id || null,
        template_id: data.template_id || null,
        priority: data.priority || 'normal'
      });
      
      showSuccessMessage('Message sent successfully!');
      await refreshData();
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  const handleCreateTemplate = async (data) => {
    try {
      const response = await api.post(SMS_API_ENDPOINTS.TEMPLATES.LIST, {
        ...data,
        is_active: data.is_active ?? true,
        allow_unicode: data.allow_unicode || false,
        variables: data.message_template?.match(/\{\{([^}]+)\}\}/g)?.map(v => v.replace(/[{}]/g, '')) || []
      });
      
      showSuccessMessage('Template created successfully!');
      await refreshData();
      return response.data;
    } catch (error) {
      console.error('Failed to create template:', error);
      throw error;
    }
  };

  const handleCreateGateway = async (data) => {
    try {
      const response = await api.post(SMS_API_ENDPOINTS.GATEWAYS.LIST, {
        ...data,
        is_active: data.is_active ?? true,
        is_default: data.is_default || false,
        max_messages_per_minute: data.max_messages_per_minute || 60,
        max_messages_per_hour: data.max_messages_per_hour || 1000,
        max_messages_per_day: data.max_messages_per_day || 10000
      });
      
      showSuccessMessage('Gateway added successfully!');
      await refreshData();
      return response.data;
    } catch (error) {
      console.error('Failed to create gateway:', error);
      throw error;
    }
  };

  const handleCreateRule = async (data) => {
    try {
      const response = await api.post(SMS_API_ENDPOINTS.RULES.LIST, {
        ...data,
        is_active: data.is_active ?? true,
        is_recurring: data.is_recurring || false,
        condition: data.condition_field && data.condition_operator && data.condition_value ? {
          field: data.condition_field,
          operator: data.condition_operator,
          value: data.condition_value
        } : null,
        delay_minutes: data.delay_minutes || 0,
        priority: data.priority || 'normal'
      });
      
      showSuccessMessage('Automation rule created successfully!');
      await refreshData();
      return response.data;
    } catch (error) {
      console.error('Failed to create rule:', error);
      throw error;
    }
  };

  // ===========================================================================
  // Callback Handlers
  // ===========================================================================
  const handleRealTimeUpdate = useCallback((update) => {
    if (!update) return;

    switch (update.type) {
      case 'sms_sent':
      case 'sms_delivered':
      case 'sms_failed':
      case 'queue_update':
      case 'gateway_update':
        refreshData();
        break;
      case 'ping':
        sendMessage({ type: 'pong' });
        break;
      default:
        break;
    }
  }, [refreshData, sendMessage]);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      await refreshData();
    } catch (err) {
      setGlobalError('Failed to refresh data');
      setTimeout(() => setGlobalError(null), 5000);
    }
  }, [refreshData]);

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    const timeoutId = setTimeout(() => {
      if (activeTab === 'messages') {
        fetchMessages(1, { search: value });
      } else if (activeTab === 'templates') {
        fetchTemplates(1, { search: value });
      } else if (activeTab === 'gateways') {
        fetchGateways(1, { search: value });
      } else if (activeTab === 'automation') {
        fetchRules(1, { search: value });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [activeTab, fetchMessages, fetchTemplates, fetchGateways, fetchRules]);

  const handleCreate = useCallback((type) => {
    setCreateType(type);
    setShowCreateModal(true);
  }, []);

  const handleCreateSubmit = useCallback(async (data) => {
    try {
      switch (createType) {
        case 'message':
          await handleCreateMessage(data);
          break;
        case 'template':
          await handleCreateTemplate(data);
          break;
        case 'gateway':
          await handleCreateGateway(data);
          break;
        case 'rule':
          await handleCreateRule(data);
          break;
        default:
          break;
      }
    } catch (error) {
      throw error;
    }
  }, [createType]);

  const handleCreateModalClose = useCallback((success) => {
    setShowCreateModal(false);
    if (success) {
      refreshData();
    }
  }, [refreshData]);

  // ===========================================================================
  // Render Helpers
  // ===========================================================================
  const renderError = () => {
    const error = globalError || dataError || wsError;
    if (!error) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`mb-4 p-4 rounded-lg border ${themeClasses.bg.danger} ${themeClasses.border.danger}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-red-500" size={20} />
            <span className={themeClasses.text.primary}>{error}</span>
          </div>
          <button
            onClick={() => setGlobalError(null)}
            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    );
  };

  const renderSuccess = () => {
    if (!successMessage) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`mb-4 p-4 rounded-lg border bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-500" size={20} />
            <span className={themeClasses.text.primary}>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/30"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    );
  };

  const renderConnectionStatus = () => {
    let statusColor = 'bg-green-500';
    let statusText = 'Connected';
    let statusIcon = <Wifi className="w-4 h-4" />;

    if (!isConnected) {
      if (reconnectAttempts > 0) {
        statusColor = 'bg-yellow-500 animate-pulse';
        statusText = `Reconnecting (${reconnectAttempts})`;
        statusIcon = <WifiOff className="w-4 h-4" />;
      } else {
        statusColor = 'bg-red-500';
        statusText = 'Disconnected';
        statusIcon = <WifiOff className="w-4 h-4" />;
      }
    }

    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${themeClasses.bg.secondary}`}>
        {statusIcon}
        <div className={`w-2 h-2 rounded-full ${statusColor}`} />
        <span className="text-sm hidden sm:inline">{statusText}</span>
      </div>
    );
  };

  const renderHeader = () => (
    <header className="mb-6 relative z-10">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between mb-4">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`p-2 rounded-lg ${themeClasses.bg.secondary}`}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        <h1 className={`text-xl font-bold ${themeClasses.text.primary}`}>
          SMS Automation
        </h1>

        <button
          onClick={() => handleCreate(createType)}
          className={`p-2 rounded-lg ${themeClasses.button.primary}`}
          aria-label="Create new"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex lg:flex-col lg:gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold mb-1 ${themeClasses.text.primary}`}>
              SMS Automation
            </h1>
            <p className={`text-sm ${themeClasses.text.secondary}`}>
              Manage SMS gateways, templates, and automated messaging
            </p>
          </div>

          <div className="flex items-center gap-2">
            {renderConnectionStatus()}

            {perfMonitoring && (
              <div className={`hidden xl:flex items-center gap-2 px-3 py-2 rounded-lg ${themeClasses.bg.secondary}`}>
                <Cpu className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Score: <span className="text-blue-500">{getPerformanceScore()}</span>
                </span>
              </div>
            )}

            <button
              onClick={togglePerfMonitoring}
              className={`p-2 rounded-lg ${themeClasses.button.secondary}`}
              title={perfMonitoring ? 'Disable performance monitor' : 'Enable performance monitor'}
            >
              <Activity size={18} className={perfMonitoring ? 'text-blue-500' : ''} />
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search - Desktop */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search..."
              className={`w-full pl-10 pr-4 py-2 rounded-lg border text-sm ${themeClasses.input}`}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              themeClasses.button.secondary
            }`}
          >
            <Filter size={18} />
            <span className="hidden sm:inline">{showFilters ? 'Hide' : 'Show'} Filters</span>
          </button>

          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className={`p-2 rounded-lg ${themeClasses.button.secondary}`}
            title={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
          >
            {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-lg ${themeClasses.button.secondary}`}
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          </button>

          <div className="flex items-center gap-2">
            <EnhancedSelect
              value={createType}
              onChange={setCreateType}
              options={createOptions}
              theme={theme}
              className="w-40"
            />

            <button
              onClick={() => handleCreate(createType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                themeClasses.button.primary
              } hover:scale-105 transition-all`}
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Create</span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>{renderError()}</AnimatePresence>
      <AnimatePresence>{renderSuccess()}</AnimatePresence>
    </header>
  );

  const renderTabs = () => (
    <div className="mb-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10">
      <nav className="flex flex-nowrap gap-1 sm:gap-2 border-b border-gray-200 dark:border-gray-700 pb-2 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const queueStats = getQueueStats();
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                isActive 
                  ? themeClasses.button.primary 
                  : `${themeClasses.button.secondary} hover:bg-gray-100 dark:hover:bg-gray-800`
              }`}
              title={tab.description}
            >
              <Icon size={18} />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.id === 'queue' && queueStats.pending > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {queueStats.pending}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );

  const renderMobileMenu = () => {
    if (!isMobileMenuOpen) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] bg-black/50 lg:hidden"
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          transition={{ type: "spring", damping: 25 }}
          className={`absolute left-0 top-0 h-full w-64 ${themeClasses.bg.card} shadow-xl p-4`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className={`font-bold ${themeClasses.text.primary}`}>Menu</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X size={18} />
            </button>
          </div>

          {/* Mobile Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search..."
              className={`w-full pl-9 pr-3 py-2 rounded-lg border text-sm ${themeClasses.input}`}
            />
          </div>

          {/* Mobile Tabs */}
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const queueStats = getQueueStats();
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${
                    isActive ? themeClasses.button.primary : themeClasses.button.secondary
                  }`}
                >
                  <Icon size={18} />
                  <span className="flex-1 text-left">{tab.label}</span>
                  {tab.id === 'queue' && queueStats.pending > 0 && (
                    <span className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                      {queueStats.pending}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Actions */}
          <div className={`mt-6 pt-6 border-t ${themeClasses.border.light}`}>
            <div className="space-y-2">
              <EnhancedSelect
                value={createType}
                onChange={setCreateType}
                options={createOptions}
                theme={theme}
                className="w-full"
              />
              
              <button
                onClick={() => {
                  handleCreate(createType);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium ${
                  themeClasses.button.primary
                }`}
              >
                <Plus size={18} />
                Create
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="w-full lg:w-80 mb-6 lg:mb-0 relative z-10"
      >
        <div className={`p-5 rounded-xl border sticky top-6 ${themeClasses.bg.card} ${themeClasses.border.light}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${themeClasses.text.primary}`}>Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className={`text-sm ${themeClasses.text.secondary} hover:text-indigo-500`}
              >
                Clear all
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                Status
              </label>
              <EnhancedSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
                theme={theme}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                Date Range
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={dateRange.start || ''}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${themeClasses.input}`}
                />
                <input
                  type="date"
                  value={dateRange.end || ''}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${themeClasses.input}`}
                />
              </div>
            </div>

            {activeTab === 'gateways' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                  Gateway Type
                </label>
                <EnhancedSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: 'all', label: 'All Types' },
                    { value: 'africas_talking', label: "Africa's Talking" },
                    { value: 'twilio', label: 'Twilio' },
                    { value: 'smpp', label: 'SMPP' },
                    { value: 'custom', label: 'Custom' }
                  ]}
                  theme={theme}
                />
              </div>
            )}

            {activeTab === 'templates' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                  Template Type
                </label>
                <EnhancedSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: 'all', label: 'All Types' },
                    { value: 'welcome', label: 'Welcome' },
                    { value: 'payment', label: 'Payment' },
                    { value: 'reminder', label: 'Reminder' },
                    { value: 'promotional', label: 'Promotional' }
              ]}
                  theme={theme}
                />
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    );
  };

  const renderMainContent = () => {
    const commonProps = {
      theme,
      themeClasses,
      onRefresh: handleRefresh,
      loading: dataLoading,
      viewMode,
      searchTerm,
      statusFilter
    };

    switch (activeTab) {
      case 'dashboard':
        return (
          <AnalyticsDashboard
            stats={dashboardStats}
            analytics={analytics}
            gateways={safeArray(gateways)}
            messages={safeArray(messages)}
            templates={safeArray(templates)}
            queue={safeArray(queue)}
            performanceData={performanceMetrics}
            onRefresh={handleRefresh}
            {...commonProps}
          />
        );
      
      case 'messages':
        return (
          <MessageManager
            messages={safeArray(messages)}
            gateways={safeArray(gateways)}
            templates={safeArray(templates)}
            pagination={pagination.messages}
            onLoadMore={loadMoreMessages}
            onSendMessage={(data) => sendMessage({ type: 'send_sms', ...data })}
            dateRange={dateRange}
            {...commonProps}
          />
        );
      
      case 'templates':
        return (
          <TemplateManager
            templates={safeArray(templates)}
            onCreateClick={() => handleCreate('template')}
            onDuplicate={async (id) => {
              try {
                await api.post(SMS_API_ENDPOINTS.TEMPLATES.DUPLICATE(id));
                showSuccessMessage('Template duplicated successfully');
                await refreshData();
              } catch (error) {
                setGlobalError('Failed to duplicate template');
                setTimeout(() => setGlobalError(null), 5000);
              }
            }}
            onTestRender={async (id, data) => {
              try {
                const response = await api.post(SMS_API_ENDPOINTS.TEMPLATES.TEST_RENDER(id), data);
                return response.data;
              } catch (error) {
                throw error;
              }
            }}
            onEdit={async (id, data) => {
              try {
                await api.put(SMS_API_ENDPOINTS.TEMPLATES.DETAIL(id), data);
                showSuccessMessage('Template updated successfully');
                await refreshData();
              } catch (error) {
                setGlobalError('Failed to update template');
                setTimeout(() => setGlobalError(null), 5000);
              }
            }}
            onDelete={async (id) => {
              try {
                await api.delete(SMS_API_ENDPOINTS.TEMPLATES.DETAIL(id));
                showSuccessMessage('Template deleted successfully');
                await refreshData();
              } catch (error) {
                setGlobalError('Failed to delete template');
                setTimeout(() => setGlobalError(null), 5000);
              }
            }}
            {...commonProps}
          />
        );
      
      case 'gateways':
        return (
          <GatewayManager
            gateways={safeArray(gateways)}
            onCreateClick={() => handleCreate('gateway')}
            onTestConnection={async (id) => {
              try {
                const response = await api.post(SMS_API_ENDPOINTS.GATEWAYS.TEST_CONNECTION(id));
                if (response.data.success) {
                  showSuccessMessage('Connection test successful');
                } else {
                  setGlobalError('Connection test failed');
                  setTimeout(() => setGlobalError(null), 5000);
                }
                await refreshData();
              } catch (error) {
                setGlobalError('Connection test failed');
                setTimeout(() => setGlobalError(null), 5000);
              }
            }}
            onSetDefault={async (id) => {
              try {
                await api.post(SMS_API_ENDPOINTS.GATEWAYS.SET_DEFAULT(id));
                showSuccessMessage('Default gateway updated');
                await refreshData();
              } catch (error) {
                setGlobalError('Failed to set default gateway');
                setTimeout(() => setGlobalError(null), 5000);
              }
            }}
            onToggleActive={async (id) => {
              try {
                await api.post(SMS_API_ENDPOINTS.GATEWAYS.TOGGLE_ACTIVE(id));
                await refreshData();
              } catch (error) {
                setGlobalError('Failed to toggle gateway');
                setTimeout(() => setGlobalError(null), 5000);
              }
            }}
            onEdit={async (id, data) => {
              try {
                await api.put(SMS_API_ENDPOINTS.GATEWAYS.DETAIL(id), data);
                showSuccessMessage('Gateway updated successfully');
                await refreshData();
              } catch (error) {
                setGlobalError('Failed to update gateway');
                setTimeout(() => setGlobalError(null), 5000);
              }
            }}
            onDelete={async (id) => {
              try {
                await api.delete(SMS_API_ENDPOINTS.GATEWAYS.DETAIL(id));
                showSuccessMessage('Gateway deleted successfully');
                await refreshData();
              } catch (error) {
                setGlobalError('Failed to delete gateway');
                setTimeout(() => setGlobalError(null), 5000);
              }
            }}
            {...commonProps}
          />
        );
      
      case 'automation':
        return (
          <AutomationRules
            rules={safeArray(rules)}
            templates={safeArray(templates)}
            onCreateClick={() => handleCreate('rule')}
            onToggleActive={async (id) => {
              try {
                await api.post(SMS_API_ENDPOINTS.RULES.TOGGLE_ACTIVE(id));
                await refreshData();
              } catch (error) {
                setGlobalError('Failed to toggle rule');
                setTimeout(() => setGlobalError(null), 5000);
              }
            }}
            onTestTrigger={async (id, data) => {
              try {
                const response = await api.post(SMS_API_ENDPOINTS.RULES.TEST_TRIGGER(id), data);
                return response.data;
              } catch (error) {
                throw error;
              }
            }}
            onExecute={async (id, data) => {
              try {
                await api.post(SMS_API_ENDPOINTS.RULES.EXECUTE(id), data);
                showSuccessMessage('Rule executed successfully');
                await refreshData();
              } catch (error) {
                setGlobalError('Failed to execute rule');
                setTimeout(() => setGlobalError(null), 5000);
              }
            }}
            onDuplicate={async (id) => {
              try {
                await api.post(SMS_API_ENDPOINTS.RULES.DUPLICATE(id));
                showSuccessMessage('Rule duplicated successfully');
                await refreshData();
              } catch (error) {
                setGlobalError('Failed to duplicate rule');
                setTimeout(() => setGlobalError(null), 5000);
              }
            }}
            onDelete={async (id) => {
              try {
                await api.delete(SMS_API_ENDPOINTS.RULES.DETAIL(id));
                showSuccessMessage('Rule deleted successfully');
                await refreshData();
              } catch (error) {
                setGlobalError('Failed to delete rule');
                setTimeout(() => setGlobalError(null), 5000);
              }
            }}
            {...commonProps}
          />
        );
      
      case 'queue':
        return (
          <QueueMonitor
            queue={safeArray(queue)}
            onProcessBatch={async (data) => {
              try {
                await api.post(SMS_API_ENDPOINTS.QUEUE.PROCESS_BATCH, data);
                showSuccessMessage('Batch processing started');
                await refreshData();
              } catch (error) {
                setGlobalError('Failed to process batch');
                setTimeout(() => setGlobalError(null), 5000);
              }
            }}
            onClearFailed={async (data) => {
              try {
                await api.post(SMS_API_ENDPOINTS.QUEUE.CLEAR_FAILED, data);
                showSuccessMessage('Failed messages cleared');
                await refreshData();
              } catch (error) {
                setGlobalError('Failed to clear messages');
                setTimeout(() => setGlobalError(null), 5000);
              }
            }}
            realTimeUpdates={lastMessage}
            {...commonProps}
          />
        );
      
      case 'analytics':
        return (
          <AnalyticsDashboard
            stats={dashboardStats}
            analytics={analytics}
            gateways={safeArray(gateways)}
            messages={safeArray(messages)}
            templates={safeArray(templates)}
            queue={safeArray(queue)}
            detailed={true}
            performanceData={performanceMetrics}
            onRefresh={handleRefresh}
            onExport={async (format) => {
              try {
                if (format === 'csv') {
                  window.location.href = SMS_API_ENDPOINTS.ANALYTICS.EXPORT;
                }
                showSuccessMessage('Data exported successfully');
              } catch (error) {
                setGlobalError('Failed to export data');
                setTimeout(() => setGlobalError(null), 5000);
              }
            }}
            {...commonProps}
          />
        );
      
      case 'export':
        return (
          <ExportManager
            messages={safeArray(messages)}
            templates={safeArray(templates)}
            gateways={safeArray(gateways)}
            rules={safeArray(rules)}
            analytics={analytics}
            onExport={async (format, data) => {
              try {
                showSuccessMessage(`Data exported as ${format.toUpperCase()}`);
              } catch (error) {
                setGlobalError('Failed to export data');
                setTimeout(() => setGlobalError(null), 5000);
              }
            }}
            {...commonProps}
          />
        );
      
      default:
        return null;
    }
  };

  // ===========================================================================
  // Main Render
  // ===========================================================================
  return (
    <div className={`relative isolate min-h-screen transition-colors duration-300 ${themeClasses.bg.primary}`}>
      <div className="p-3 sm:p-4 md:p-5 lg:p-6 max-w-7xl mx-auto">
        {renderHeader()}
        {renderTabs()}
        <AnimatePresence>{renderMobileMenu()}</AnimatePresence>

        <div className="flex flex-col lg:flex-row gap-6">
          <AnimatePresence>{renderFilters()}</AnimatePresence>

          <main className={showFilters ? 'w-full lg:flex-1' : 'w-full'}>
            <div className="space-y-6">
              {renderMainContent()}
            </div>
          </main>
        </div>
      </div>

      {/* Create Modal - Rendered at root level with highest z-index */}
      <CreateModal
        isOpen={showCreateModal}
        onClose={handleCreateModalClose}
        type={createType}
        onSubmit={handleCreateSubmit}
        gateways={safeArray(gateways)}
        templates={safeArray(templates)}
        theme={theme}
      />
    </div>
  );
};

export default SMSAutomation;