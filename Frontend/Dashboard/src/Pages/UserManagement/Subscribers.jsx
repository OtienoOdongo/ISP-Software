

// import React, { useState, useCallback, useMemo } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useAuth } from '../../context/AuthContext';
// import { useTheme } from '../../context/ThemeContext';
// import {
//   Users, BarChart3, CreditCard, LayoutDashboard,
//   Filter, RefreshCw, Download, Plus, Search,
//   AlertCircle, Grid, List, User,
//   Calendar, DollarSign, Activity,
//   TrendingUp, TrendingDown, CheckCircle, XCircle, Clock,
//   Eye, Edit, Trash2, Send, Star, Lock,
//   X, Menu, Wifi, Globe, Shield,
//   Zap, Target, PieChart, LogOut
// } from 'lucide-react';

// // Components
// import ClientFilters from '../../components/ClientManagement/ClientFilters';
// import ClientProfile from '../../components/ClientManagement/ClientProfile';
// import ClientMetrics from '../../components/ClientManagement/ClientMetrics';
// import ClientActions from '../../components/ClientManagement/ClientActions';
// import CommissionTracker from '../../components/ClientManagement/CommissionTracker';
// import AnalyticsChart from '../../components/ClientManagement/AnalyticsChart';
// import { EnhancedSelect, getThemeClasses } from '../../components/ServiceManagement/Shared/components';

// // Hooks
// import useClientData from '../../components/ClientManagement/hooks/useClientData';
// import useAnalytics from '../../components/ClientManagement/hooks/useAnalytics';
// import useCommission from '../../components/ClientManagement/hooks/useCommission';

// // Utils
// import { formatCurrency } from '../../components/ClientManagement/utils/formatters';
// import { validatePhoneNumber } from '../../components/ClientManagement/utils/validators';
// import ExportService from '../../components/ClientManagement/services/ExportService';

// // Constants
// import { 
//   CONNECTION_TYPES, 
//   TIME_RANGES,
//   PAGE_SIZES 
// } from '../../components/ClientManagement/constants/clientConstants';

// /**
//  * Subscribers Management Component
//  * Handles client management, analytics, and commission tracking
//  */
// const Subscribers = () => {
//   // ===========================================================================
//   // Hooks and Context
//   // ===========================================================================
//   const { user, logout } = useAuth();
//   const { theme } = useTheme();
//   const themeClasses = getThemeClasses(theme);

//   // ===========================================================================
//   // Local State
//   // ===========================================================================
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showExportModal, setShowExportModal] = useState(false);
//   const [showFilters, setShowFilters] = useState(true);
//   const [viewMode, setViewMode] = useState('grid');
//   const [timeRange, setTimeRange] = useState('30d');
//   const [connectionTypeFilter, setConnectionTypeFilter] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [exportFormat, setExportFormat] = useState('csv');
  
//   // Create client form state
//   const [createFormData, setCreateFormData] = useState({
//     name: '',
//     phone_number: '',
//     connection_type: 'pppoe',
//     client_type: 'residential',
//     location: '',
//     referral_code: '',
//     send_sms: true,
//     assign_marketer: false
//   });
//   const [createErrors, setCreateErrors] = useState({});

//   // ===========================================================================
//   // Custom Hooks
//   // ===========================================================================
//   const {
//     clients,
//     filteredClients,
//     selectedClient,
//     dashboardData,
//     isLoading: clientsLoading,
//     isRefreshing,
//     error: clientError,
//     filters,
//     pagination,
//     stats,
//     handleFilterChange,
//     handlePageChange,
//     handlePageSizeChange,
//     handleSelectClient,
//     handleRefresh,
//     handleClearFilters,
//     updateClient,
//     createClient,
//     deleteClient,
//     exportClients,
//     hasActiveFilters
//   } = useClientData();

//   const {
//     dashboardData: analyticsDashboard,
//     analyticsData,
//     isLoading: analyticsLoading,
//     error: analyticsError,
//     handleTimeRangeChange,
//     handleConnectionTypeChange,
//     refreshAnalytics
//   } = useAnalytics(timeRange, connectionTypeFilter);

//   const {
//     transactions,
//     summary: commissionSummary,
//     isLoading: commissionLoading,
//     error: commissionError,
//     refreshCommissions
//   } = useCommission(user?.id);

//   // ===========================================================================
//   // Derived State
//   // ===========================================================================
//   const error = clientError || analyticsError || commissionError;
//   const isLoading = clientsLoading || analyticsLoading || commissionLoading;

//   // ===========================================================================
//   // Memoized Values
//   // ===========================================================================
//   const tabs = useMemo(() => [
//     { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
//     { id: 'clients', label: 'Clients', icon: Users },
//     { id: 'analytics', label: 'Analytics', icon: BarChart3 },
//     { id: 'commissions', label: 'Commissions', icon: CreditCard }
//   ], []);

//   const timeRangeOptions = useMemo(() => 
//     TIME_RANGES.map(range => ({
//       value: range.value,
//       label: range.label
//     })), []
//   );

//   const connectionTypeOptions = useMemo(() => [
//     { value: 'all', label: 'All Connections' },
//     ...Object.entries(CONNECTION_TYPES).map(([value, label]) => ({
//       value,
//       label
//     }))
//   ], []);

//   const pageSizeOptions = useMemo(() => 
//     PAGE_SIZES.map(size => ({
//       value: size,
//       label: `${size} per page`
//     })), []
//   );

//   const exportFormatOptions = useMemo(() => [
//     { value: 'csv', label: 'CSV (Spreadsheet)' },
//     { value: 'json', label: 'JSON (Data)' }
//   ], []);

//   // ===========================================================================
//   // Helper Functions
//   // ===========================================================================
  
//   /**
//    * Safely get array from data
//    */
//   const safeArray = (data) => {
//     if (Array.isArray(data)) return data;
//     if (data && typeof data === 'object') return Object.values(data);
//     return [];
//   };

//   /**
//    * Safely get revenue segments
//    */
//   const getRevenueSegments = () => {
//     if (!analyticsData?.financial) return [];
    
//     const segments = analyticsData.financial.revenue_segments;
    
//     // If it's an array, return it
//     if (Array.isArray(segments)) return segments;
    
//     // If it's an object, convert to array
//     if (segments && typeof segments === 'object') {
//       return Object.entries(segments).map(([key, value]) => ({
//         revenue_segment: key,
//         total_revenue: value.total_revenue || value,
//         count: value.count || 0
//       }));
//     }
    
//     return [];
//   };

//   /**
//    * Safely get top clients
//    */
//   const getTopClients = () => {
//     if (!analyticsData?.financial) return [];
    
//     const topClients = analyticsData.financial.top_clients;
    
//     if (Array.isArray(topClients)) return topClients;
//     if (topClients && typeof topClients === 'object') return Object.values(topClients);
    
//     return [];
//   };

//   /**
//    * Safely get usage patterns
//    */
//   const getUsagePatterns = () => {
//     if (!analyticsData?.usage) return [];
    
//     const patterns = analyticsData.usage.usage_patterns;
    
//     if (Array.isArray(patterns)) return patterns;
//     if (patterns && typeof patterns === 'object') return Object.values(patterns);
    
//     return [];
//   };

//   /**
//    * Safely get top users
//    */
//   const getTopUsers = () => {
//     if (!analyticsData?.usage) return [];
    
//     const topUsers = analyticsData.usage.top_users;
    
//     if (Array.isArray(topUsers)) return topUsers;
//     if (topUsers && typeof topUsers === 'object') return Object.values(topUsers);
    
//     return [];
//   };

//   // ===========================================================================
//   // Callback Handlers
//   // ===========================================================================

//   const handleCreateClient = useCallback(async () => {
//     const phoneValidation = validatePhoneNumber(createFormData.phone_number);
//     if (!phoneValidation.valid) {
//       setCreateErrors({ phone_number: phoneValidation.message });
//       return;
//     }

//     if (!createFormData.name.trim()) {
//       setCreateErrors({ name: 'Full name is required' });
//       return;
//     }

//     const result = await createClient({
//       ...createFormData,
//       phone_number: phoneValidation.normalized
//     }, createFormData.connection_type);

//     if (result.success) {
//       setShowCreateModal(false);
//       setCreateFormData({
//         name: '',
//         phone_number: '',
//         connection_type: 'pppoe',
//         client_type: 'residential',
//         location: '',
//         referral_code: '',
//         send_sms: true,
//         assign_marketer: false
//       });
//       setCreateErrors({});
//     }
//   }, [createFormData, createClient]);

//   const handleExport = useCallback(async () => {
//     try {
//       if (exportFormat === 'csv') {
//         const result = await exportClients('csv');
//         if (result.success) {
//           setShowExportModal(false);
//         }
//       } else if (exportFormat === 'json') {
//         const formattedData = ExportService.prepareClientExportData(filteredClients);
//         const result = await ExportService.exportAsJSON(
//           formattedData, 
//           `clients_export_${new Date().toISOString().split('T')[0]}`
//         );
//         if (result.success) {
//           setShowExportModal(false);
//         }
//       }
//     } catch (error) {
//       console.error('Export failed:', error);
//       alert('Export failed. Please try again.');
//     }
//   }, [exportClients, exportFormat, filteredClients]);

//   const handleSearch = useCallback((e) => {
//     const value = e.target.value;
//     setSearchTerm(value);
    
//     const timeoutId = setTimeout(() => {
//       handleFilterChange('search', value);
//     }, 300);

//     return () => clearTimeout(timeoutId);
//   }, [handleFilterChange]);

//   const handleRefreshAll = useCallback(() => {
//     handleRefresh();
//     refreshAnalytics();
//     refreshCommissions();
//   }, [handleRefresh, refreshAnalytics, refreshCommissions]);

//   const handleCreateFormChange = useCallback((field, value) => {
//     setCreateFormData(prev => ({ ...prev, [field]: value }));
//     if (createErrors[field]) {
//       setCreateErrors(prev => ({ ...prev, [field]: null }));
//     }
//   }, [createErrors]);

//   const handleTabChange = useCallback((tabId) => {
//     setActiveTab(tabId);
//   }, []);

//   // ===========================================================================
//   // Render Helpers
//   // ===========================================================================

//   const renderError = () => {
//     if (!error) return null;

//     return (
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, y: -20 }}
//         className="mt-4"
//       >
//         <div className={`p-4 rounded-lg border ${themeClasses.bg.danger} ${themeClasses.border.danger}`}>
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <AlertCircle className="text-red-500" size={20} />
//               <span className={themeClasses.text.primary}>{error}</span>
//             </div>
//             <button
//               onClick={() => window.location.reload()}
//               className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
//               aria-label="Reload page"
//             >
//               <RefreshCw size={16} />
//             </button>
//           </div>
//         </div>
//       </motion.div>
//     );
//   };

//   const renderHeader = () => (
//     <header className="mb-8">
//       <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
//         <div>
//           <h1 className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-2 ${themeClasses.text.primary}`}>
//             Client Management System
//           </h1>
//           <p className={`text-sm md:text-base ${themeClasses.text.secondary}`}>
//             Manage clients, track analytics, and monitor commissions
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-2">
//           <button
//             onClick={() => setShowCreateModal(true)}
//             className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 ${themeClasses.button.primary}`}
//             aria-label="Create new client"
//           >
//             <Plus size={18} />
//             <span className="hidden sm:inline">New Client</span>
//           </button>

//           <button
//             onClick={handleRefreshAll}
//             disabled={isRefreshing}
//             className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 ${themeClasses.button.secondary}`}
//             aria-label="Refresh data"
//           >
//             <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
//             <span className="hidden sm:inline">Refresh</span>
//           </button>

//           <button
//             onClick={() => setShowExportModal(true)}
//             className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 ${themeClasses.button.success}`}
//             aria-label="Export data"
//           >
//             <Download size={18} />
//             <span className="hidden sm:inline">Export</span>
//           </button>

//           <button
//             onClick={() => setShowFilters(!showFilters)}
//             className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 lg:hidden ${themeClasses.button.secondary}`}
//             aria-label={showFilters ? 'Hide filters' : 'Show filters'}
//           >
//             {showFilters ? <X size={18} /> : <Menu size={18} />}
//             <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
//           </button>

//           <button
//             onClick={logout}
//             className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 ${themeClasses.button.danger}`}
//             aria-label="Logout"
//           >
//             <LogOut size={18} />
//             <span className="hidden sm:inline">Logout</span>
//           </button>
//         </div>
//       </div>

//       <AnimatePresence>
//         {renderError()}
//       </AnimatePresence>
//     </header>
//   );

//   const renderTabs = () => (
//     <div className="mb-6">
//       <nav className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-2 overflow-x-auto">
//         {tabs.map((tab) => {
//           const Icon = tab.icon;
//           const isActive = activeTab === tab.id;
          
//           return (
//             <button
//               key={tab.id}
//               onClick={() => handleTabChange(tab.id)}
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
//                 isActive
//                   ? themeClasses.button.primary
//                   : themeClasses.button.secondary
//               }`}
//               aria-current={isActive ? 'page' : undefined}
//             >
//               <Icon size={18} />
//               {tab.label}
//             </button>
//           );
//         })}
//       </nav>
//     </div>
//   );

//   const renderDashboardTab = () => (
//     <>
//       <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//         <div className="flex flex-col sm:flex-row sm:items-center gap-4">
//           <div className="flex items-center gap-2">
//             <Calendar size={18} className={themeClasses.text.secondary} />
//             <span className={themeClasses.text.primary}>Time Range:</span>
//           </div>
//           <div className="w-full sm:w-48">
//             <EnhancedSelect
//               value={timeRange}
//               onChange={(value) => {
//                 setTimeRange(value);
//                 handleTimeRangeChange(value);
//               }}
//               options={timeRangeOptions}
//               theme={theme}
//             />
//           </div>
//           <div className="flex items-center gap-2 ml-auto">
//             <Globe size={18} className={themeClasses.text.secondary} />
//             <span className={themeClasses.text.primary}>Connection:</span>
//           </div>
//           <div className="w-full sm:w-48">
//             <EnhancedSelect
//               value={connectionTypeFilter}
//               onChange={(value) => {
//                 setConnectionTypeFilter(value);
//                 handleConnectionTypeChange(value);
//               }}
//               options={connectionTypeOptions}
//               theme={theme}
//             />
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//           <div className="flex items-center justify-between mb-2">
//             <h3 className={`text-sm font-medium ${themeClasses.text.secondary}`}>Total Clients</h3>
//             <Users size={18} className="text-blue-500" />
//           </div>
//           <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>
//             {stats?.total?.toLocaleString() || '0'}
//           </p>
//         </div>

//         <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//           <div className="flex items-center justify-between mb-2">
//             <h3 className={`text-sm font-medium ${themeClasses.text.secondary}`}>Active Clients</h3>
//             <CheckCircle size={18} className="text-green-500" />
//           </div>
//           <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>
//             {stats?.active?.toLocaleString() || '0'}
//           </p>
//           <p className={`text-xs mt-1 ${themeClasses.text.secondary}`}>
//             {stats?.total ? `${((stats.active / stats.total) * 100).toFixed(1)}% of total` : '0% of total'}
//           </p>
//         </div>

//         <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//           <div className="flex items-center justify-between mb-2">
//             <h3 className={`text-sm font-medium ${themeClasses.text.secondary}`}>At Risk</h3>
//             <AlertCircle size={18} className="text-red-500" />
//           </div>
//           <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>
//             {stats?.atRisk?.toLocaleString() || '0'}
//           </p>
//         </div>

//         <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//           <div className="flex items-center justify-between mb-2">
//             <h3 className={`text-sm font-medium ${themeClasses.text.secondary}`}>Total Revenue</h3>
//             <DollarSign size={18} className="text-purple-500" />
//           </div>
//           <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>
//             {formatCurrency(stats?.totalRevenue || 0)}
//           </p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//           <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>Revenue Trend</h3>
//           <AnalyticsChart
//             data={analyticsDashboard?.charts?.revenue}
//             type="line"
//             height={300}
//             theme={theme}
//             loading={analyticsLoading}
//           />
//         </div>
//         <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//           <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>Client Growth</h3>
//           <AnalyticsChart
//             data={analyticsDashboard?.charts?.clients}
//             type="line"
//             height={300}
//             theme={theme}
//             loading={analyticsLoading}
//           />
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//           <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>Connection Distribution</h3>
//           <AnalyticsChart
//             data={analyticsDashboard?.charts?.connectionDistribution}
//             type="pie"
//             height={300}
//             theme={theme}
//             loading={analyticsLoading}
//           />
//         </div>
//         <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//           <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>Tier Distribution</h3>
//           <AnalyticsChart
//             data={analyticsDashboard?.charts?.tierDistribution}
//             type="pie"
//             height={300}
//             theme={theme}
//             loading={analyticsLoading}
//           />
//         </div>
//       </div>
//     </>
//   );

//   const renderClientGrid = (clientsToRender) => (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       {clientsToRender.map((client) => {
//         const isSelected = selectedClient?.id === client.id;
        
//         return (
//           <div
//             key={client.id}
//             onClick={() => handleSelectClient(client)}
//             className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-lg ${
//               isSelected ? 'ring-2 ring-indigo-500' : ''
//             } ${themeClasses.bg.card} ${themeClasses.border.light}`}
//           >
//             <div className="flex items-center gap-3 mb-3">
//               <div className={`p-2 rounded-full ${themeClasses.bg.secondary}`}>
//                 <User size={20} />
//               </div>
//               <div className="flex-1 min-w-0">
//                 <h4 className={`font-medium truncate ${themeClasses.text.primary}`}>
//                   {client.username}
//                 </h4>
//                 <p className={`text-sm truncate ${themeClasses.text.secondary}`}>
//                   {client.phone_display}
//                 </p>
//               </div>
//               <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                 client.status === 'active'
//                   ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
//                   : client.status === 'suspended'
//                   ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
//                   : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
//               }`}>
//                 {client.status_display}
//               </span>
//             </div>

//             <div className="grid grid-cols-3 gap-2 text-sm">
//               <div>
//                 <p className={`text-xs ${themeClasses.text.secondary}`}>Revenue</p>
//                 <p className={`font-medium ${themeClasses.text.primary}`}>
//                   {client.lifetime_value_formatted}
//                 </p>
//               </div>
//               <div>
//                 <p className={`text-xs ${themeClasses.text.secondary}`}>Risk</p>
//                 <p className={`font-medium ${
//                   client.churn_risk_score >= 7 ? 'text-red-500' :
//                   client.churn_risk_score >= 4 ? 'text-yellow-500' :
//                   'text-green-500'
//                 }`}>
//                   {client.churn_risk_score?.toFixed(1)}
//                 </p>
//               </div>
//               <div>
//                 <p className={`text-xs ${themeClasses.text.secondary}`}>Tier</p>
//                 <p className={`font-medium capitalize ${themeClasses.text.primary}`}>
//                   {client.tier_display}
//                 </p>
//               </div>
//             </div>

//             {client.is_at_risk && (
//               <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
//                 <div className="flex items-center gap-1 text-xs text-red-500">
//                   <AlertCircle size={12} />
//                   <span>At Risk - Needs Attention</span>
//                 </div>
//               </div>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );

//   const renderClientList = (clientsToRender) => (
//     <div className="overflow-x-auto">
//       <table className="w-full">
//         <thead className={themeClasses.bg.secondary}>
//           <tr>
//             <th className="p-3 text-left text-sm font-medium">Client</th>
//             <th className="p-3 text-left text-sm font-medium">Status</th>
//             <th className="p-3 text-left text-sm font-medium">Revenue</th>
//             <th className="p-3 text-left text-sm font-medium">Risk</th>
//             <th className="p-3 text-left text-sm font-medium">Tier</th>
//             <th className="p-3 text-left text-sm font-medium">Connection</th>
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//           {clientsToRender.map((client) => (
//             <tr
//               key={client.id}
//               onClick={() => handleSelectClient(client)}
//               className={`cursor-pointer transition-colors ${
//                 selectedClient?.id === client.id
//                   ? themeClasses.bg.info
//                   : 'hover:bg-gray-50 dark:hover:bg-gray-800'
//               }`}
//             >
//               <td className="p-3">
//                 <div className="flex items-center gap-2">
//                   <div className={`p-1.5 rounded-full ${themeClasses.bg.secondary}`}>
//                     <User size={14} />
//                   </div>
//                   <div>
//                     <p className={`font-medium ${themeClasses.text.primary}`}>
//                       {client.username}
//                     </p>
//                     <p className={`text-xs ${themeClasses.text.secondary}`}>
//                       {client.phone_display}
//                     </p>
//                   </div>
//                 </div>
//               </td>
//               <td className="p-3">
//                 <span className={`px-2 py-1 rounded-full text-xs ${
//                   client.status === 'active'
//                     ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
//                     : client.status === 'suspended'
//                     ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
//                     : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
//                 }`}>
//                   {client.status_display}
//                 </span>
//               </td>
//               <td className="p-3 font-medium">
//                 {client.lifetime_value_formatted}
//               </td>
//               <td className="p-3">
//                 <span className={
//                   client.churn_risk_score >= 7 ? 'text-red-500' :
//                   client.churn_risk_score >= 4 ? 'text-yellow-500' :
//                   'text-green-500'
//                 }>
//                   {client.churn_risk_score?.toFixed(1)}
//                 </span>
//               </td>
//               <td className="p-3 capitalize">
//                 {client.tier_display}
//               </td>
//               <td className="p-3 uppercase">
//                 {client.connection_type}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );

//   const renderPagination = () => {
//     if (pagination.totalPages <= 1) return null;

//     return (
//       <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
//         <p className={`text-sm ${themeClasses.text.secondary}`}>
//           Page {pagination.currentPage} of {pagination.totalPages}
//         </p>
//         <div className="flex gap-2">
//           <button
//             onClick={() => handlePageChange(pagination.currentPage - 1)}
//             disabled={pagination.currentPage === 1}
//             className={`px-3 py-1 rounded ${
//               pagination.currentPage === 1
//                 ? 'opacity-50 cursor-not-allowed'
//                 : themeClasses.button.secondary
//             }`}
//           >
//             Previous
//           </button>
//           <button
//             onClick={() => handlePageChange(pagination.currentPage + 1)}
//             disabled={pagination.currentPage === pagination.totalPages}
//             className={`px-3 py-1 rounded ${
//               pagination.currentPage === pagination.totalPages
//                 ? 'opacity-50 cursor-not-allowed'
//                 : themeClasses.button.secondary
//             }`}
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     );
//   };

//   const renderClientsTab = () => {
//     const paginatedClients = filteredClients.slice(
//       (pagination.currentPage - 1) * pagination.pageSize,
//       pagination.currentPage * pagination.pageSize
//     );

//     return (
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
//             <div>
//               <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
//                 Clients ({filteredClients.length})
//               </h3>
//               {hasActiveFilters && (
//                 <p className={`text-sm ${themeClasses.text.secondary}`}>Filtered results</p>
//               )}
//             </div>
            
//             <div className="flex flex-wrap items-center gap-2">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
//                 <input
//                   type="text"
//                   defaultValue={searchTerm}
//                   onChange={handleSearch}
//                   placeholder="Search clients..."
//                   className={`pl-10 pr-4 py-2 rounded-lg border text-sm ${themeClasses.input}`}
//                 />
//               </div>
              
//               <button
//                 onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
//                 className={`p-2 rounded ${themeClasses.button.secondary}`}
//                 title={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
//               >
//                 {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
//               </button>
              
//               <div className="w-32">
//                 <EnhancedSelect
//                   value={pagination.pageSize}
//                   onChange={handlePageSizeChange}
//                   options={pageSizeOptions}
//                   theme={theme}
//                 />
//               </div>
//             </div>
//           </div>

//           {clientsLoading ? (
//             <div className="flex justify-center py-12">
//               <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
//             </div>
//           ) : viewMode === 'grid' ? (
//             renderClientGrid(paginatedClients)
//           ) : (
//             renderClientList(paginatedClients)
//           )}

//           {renderPagination()}
//         </div>

//         {selectedClient ? (
//           <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//             <div className="space-y-6">
//               <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
//                 <div>
//                   <h2 className={`text-xl font-bold ${themeClasses.text.primary}`}>
//                     {selectedClient.username}
//                   </h2>
//                   <p className={`text-sm ${themeClasses.text.secondary}`}>
//                     {selectedClient.phone_display} • {selectedClient.connection_type_display}
//                   </p>
//                 </div>
//                 <ClientActions
//                   client={selectedClient}
//                   onUpdate={updateClient}
//                   onRefresh={handleRefresh}
//                   onDelete={deleteClient}
//                   theme={theme}
//                 />
//               </div>

//               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                 <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//                   <p className={`text-xs ${themeClasses.text.secondary}`}>LTV</p>
//                   <p className={`font-bold ${themeClasses.text.primary}`}>
//                     {selectedClient.lifetime_value_formatted}
//                   </p>
//                 </div>
//                 <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//                   <p className={`text-xs ${themeClasses.text.secondary}`}>Monthly</p>
//                   <p className={`font-bold ${themeClasses.text.primary}`}>
//                     {selectedClient.monthly_revenue_formatted}
//                   </p>
//                 </div>
//                 <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//                   <p className={`text-xs ${themeClasses.text.secondary}`}>Data Used</p>
//                   <p className={`font-bold ${themeClasses.text.primary}`}>
//                     {selectedClient.total_data_used_formatted}
//                   </p>
//                 </div>
//                 <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//                   <p className={`text-xs ${themeClasses.text.secondary}`}>Since</p>
//                   <p className={`font-bold text-sm ${themeClasses.text.primary}`}>
//                     {selectedClient.customer_since_formatted}
//                   </p>
//                 </div>
//               </div>

//               <ClientMetrics client={selectedClient} theme={theme} />

//               <ClientProfile
//                 client={selectedClient}
//                 onUpdate={updateClient}
//                 theme={theme}
//               />
//             </div>
//           </div>
//         ) : (
//           <div className={`p-6 rounded-xl border text-center ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//             <div className="py-12">
//               <User size={48} className="mx-auto mb-4 opacity-50" />
//               <h3 className={`text-lg font-medium mb-2 ${themeClasses.text.primary}`}>
//                 No Client Selected
//               </h3>
//               <p className={themeClasses.text.secondary}>
//                 Click on a client from the list to view details
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   const renderAnalyticsTab = () => {
//     if (!analyticsData) return null;

//     // Get safe arrays
//     const revenueSegments = getRevenueSegments();
//     const topClients = getTopClients();
//     const usagePatterns = getUsagePatterns();
//     const topUsers = getTopUsers();

//     return (
//       <div className="space-y-6">
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
//           <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//             <h3 className={`text-sm font-medium ${themeClasses.text.secondary} mb-1`}>Avg Churn Risk</h3>
//             <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>
//               {analyticsData.behavioral?.avg_churn_risk?.toFixed(1) || 0}/10
//             </p>
//           </div>
//           <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//             <h3 className={`text-sm font-medium ${themeClasses.text.secondary} mb-1`}>Avg Engagement</h3>
//             <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>
//               {analyticsData.behavioral?.avg_engagement?.toFixed(1) || 0}/10
//             </p>
//           </div>
//           <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//             <h3 className={`text-sm font-medium ${themeClasses.text.secondary} mb-1`}>Total Data Used</h3>
//             <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>
//               {analyticsData.usage?.total_data_used_gb?.toFixed(0) || 0} GB
//             </p>
//           </div>
//           <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//             <h3 className={`text-sm font-medium ${themeClasses.text.secondary} mb-1`}>Retention Rate</h3>
//             <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>
//               {analyticsData.behavioral?.retention_rate?.toFixed(1) || 0}%
//             </p>
//           </div>
//         </div>

//         <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//           <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>Financial Analytics</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <h4 className={`font-medium mb-3 ${themeClasses.text.primary}`}>
//                 Revenue by Segment
//               </h4>
//               <div className="space-y-3">
//                 {revenueSegments.length > 0 ? (
//                   revenueSegments.map((segment, index) => (
//                     <div key={index} className="flex items-center justify-between">
//                       <span className="capitalize">{segment.revenue_segment?.replace('_', ' ') || 'Unknown'}</span>
//                       <div className="flex items-center gap-3">
//                         <span className="font-medium">{formatCurrency(segment.total_revenue || 0)}</span>
//                         <span className={`text-sm ${themeClasses.text.secondary}`}>
//                           ({segment.count || 0} clients)
//                         </span>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <p className={`text-sm ${themeClasses.text.secondary}`}>No revenue segment data available</p>
//                 )}
//               </div>
//             </div>
//             <div>
//               <h4 className={`font-medium mb-3 ${themeClasses.text.primary}`}>
//                 Top Clients by Revenue
//               </h4>
//               <div className="space-y-3">
//                 {topClients.length > 0 ? (
//                   topClients.map((client, index) => (
//                     <div key={index} className="flex items-center justify-between">
//                       <span>{client.username || 'Unknown'}</span>
//                       <span className="font-medium">{formatCurrency(client.lifetime_value || 0)}</span>
//                     </div>
//                   ))
//                 ) : (
//                   <p className={`text-sm ${themeClasses.text.secondary}`}>No top client data available</p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//           <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>Usage Analytics</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <h4 className={`font-medium mb-3 ${themeClasses.text.primary}`}>
//                 Usage Patterns
//               </h4>
//               <div className="space-y-3">
//                 {usagePatterns.length > 0 ? (
//                   usagePatterns.map((pattern, index) => (
//                     <div key={index} className="flex items-center justify-between">
//                       <span className="capitalize">{pattern.usage_pattern?.replace('_', ' ') || 'Unknown'}</span>
//                       <div className="flex items-center gap-3">
//                         <span className="font-medium">{pattern.count || 0} clients</span>
//                         <span className={`text-sm ${themeClasses.text.secondary}`}>
//                           {pattern.avg_data?.toFixed(1) || 0} GB avg
//                         </span>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <p className={`text-sm ${themeClasses.text.secondary}`}>No usage pattern data available</p>
//                 )}
//               </div>
//             </div>
//             <div>
//               <h4 className={`font-medium mb-3 ${themeClasses.text.primary}`}>
//                 Top Data Users
//               </h4>
//               <div className="space-y-3">
//                 {topUsers.length > 0 ? (
//                   topUsers.map((user, index) => (
//                     <div key={index} className="flex items-center justify-between">
//                       <span>{user.username || 'Unknown'}</span>
//                       <span className="font-medium">{user.total_data_used_gb?.toFixed(1) || 0} GB</span>
//                     </div>
//                   ))
//                 ) : (
//                   <p className={`text-sm ${themeClasses.text.secondary}`}>No top user data available</p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const renderCommissionsTab = () => (
//     <CommissionTracker
//       marketerId={user?.id}
//       theme={theme}
//     />
//   );

//   const renderMainContent = () => {
//     try {
//       switch (activeTab) {
//         case 'dashboard':
//           return renderDashboardTab();
//         case 'clients':
//           return renderClientsTab();
//         case 'analytics':
//           return renderAnalyticsTab();
//         case 'commissions':
//           return renderCommissionsTab();
//         default:
//           return null;
//       }
//     } catch (err) {
//       console.error('Error rendering tab:', err);
//       return (
//         <div className={`p-6 rounded-xl border text-center ${themeClasses.bg.danger} ${themeClasses.border.danger}`}>
//           <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
//           <h3 className={`text-lg font-medium mb-2 ${themeClasses.text.primary}`}>
//             Error Loading Content
//           </h3>
//           <p className={themeClasses.text.secondary}>
//             {err.message || 'An error occurred while loading this tab.'}
//           </p>
//           <button
//             onClick={handleRefreshAll}
//             className={`mt-4 px-4 py-2 rounded-lg font-medium ${themeClasses.button.primary}`}
//           >
//             <RefreshCw size={18} className="inline mr-2" />
//             Refresh Page
//           </button>
//         </div>
//       );
//     }
//   };

//   const renderCreateModal = () => {
//     if (!showCreateModal) return null;

//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           exit={{ opacity: 0, scale: 0.9 }}
//           className={`w-full max-w-2xl rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}
//         >
//           <div className={`p-6 border-b ${themeClasses.border.light}`}>
//             <div className="flex items-center justify-between">
//               <h2 className={`text-xl font-semibold ${themeClasses.text.primary}`}>
//                 Create New Client
//               </h2>
//               <button
//                 onClick={() => setShowCreateModal(false)}
//                 className={`p-2 rounded ${themeClasses.button.secondary}`}
//               >
//                 <X size={18} />
//               </button>
//             </div>
//           </div>

//           <div className="p-6 space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                   Full Name *
//                 </label>
//                 <input
//                   type="text"
//                   value={createFormData.name}
//                   onChange={(e) => handleCreateFormChange('name', e.target.value)}
//                   className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
//                   placeholder="John Doe"
//                 />
//                 {createErrors.name && (
//                   <p className="text-sm text-red-500 mt-1">{createErrors.name}</p>
//                 )}
//               </div>

//               <div>
//                 <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                   Phone Number *
//                 </label>
//                 <input
//                   type="tel"
//                   value={createFormData.phone_number}
//                   onChange={(e) => handleCreateFormChange('phone_number', e.target.value)}
//                   className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
//                   placeholder="0712345678"
//                 />
//                 {createErrors.phone_number && (
//                   <p className="text-sm text-red-500 mt-1">{createErrors.phone_number}</p>
//                 )}
//               </div>

//               <div>
//                 <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                   Connection Type *
//                 </label>
//                 <select
//                   value={createFormData.connection_type}
//                   onChange={(e) => handleCreateFormChange('connection_type', e.target.value)}
//                   className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
//                 >
//                   <option value="pppoe">PPPoE</option>
//                   <option value="hotspot">Hotspot</option>
//                 </select>
//               </div>

//               <div>
//                 <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                   Client Type
//                 </label>
//                 <select
//                   value={createFormData.client_type}
//                   onChange={(e) => handleCreateFormChange('client_type', e.target.value)}
//                   className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
//                 >
//                   <option value="residential">Residential</option>
//                   <option value="business">Business</option>
//                   <option value="student">Student</option>
//                   <option value="tourist">Tourist</option>
//                 </select>
//               </div>

//               <div className="md:col-span-2">
//                 <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                   Location (Optional)
//                 </label>
//                 <input
//                   type="text"
//                   value={createFormData.location}
//                   onChange={(e) => handleCreateFormChange('location', e.target.value)}
//                   className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
//                   placeholder="e.g., Nairobi, Westlands"
//                 />
//               </div>

//               <div className="md:col-span-2">
//                 <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                   Referral Code (Optional)
//                 </label>
//                 <input
//                   type="text"
//                   value={createFormData.referral_code}
//                   onChange={(e) => handleCreateFormChange('referral_code', e.target.value)}
//                   className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
//                   placeholder="Enter referral code"
//                 />
//               </div>

//               <div className="md:col-span-2 space-y-2">
//                 <label className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     checked={createFormData.send_sms}
//                     onChange={(e) => handleCreateFormChange('send_sms', e.target.checked)}
//                     className="rounded border-gray-300 dark:border-gray-600"
//                   />
//                   <span className={themeClasses.text.secondary}>Send welcome SMS with credentials</span>
//                 </label>
//                 <label className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     checked={createFormData.assign_marketer}
//                     onChange={(e) => handleCreateFormChange('assign_marketer', e.target.checked)}
//                     className="rounded border-gray-300 dark:border-gray-600"
//                   />
//                   <span className={themeClasses.text.secondary}>Assign as marketer</span>
//                 </label>
//               </div>
//             </div>
//           </div>

//           <div className={`p-6 border-t flex justify-end gap-2 ${themeClasses.border.light}`}>
//             <button
//               onClick={() => setShowCreateModal(false)}
//               className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.secondary}`}
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleCreateClient}
//               disabled={clientsLoading}
//               className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.primary} ${
//                 clientsLoading ? 'opacity-50 cursor-not-allowed' : ''
//               }`}
//             >
//               {clientsLoading ? (
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                   <span>Creating...</span>
//                 </div>
//               ) : (
//                 'Create Client'
//               )}
//             </button>
//           </div>
//         </motion.div>
//       </div>
//     );
//   };

//   const renderExportModal = () => {
//     if (!showExportModal) return null;

//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           exit={{ opacity: 0, scale: 0.9 }}
//           className={`w-full max-w-md rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}
//         >
//           <div className={`p-6 border-b ${themeClasses.border.light}`}>
//             <h2 className={`text-xl font-semibold ${themeClasses.text.primary}`}>Export Data</h2>
//           </div>

//           <div className="p-6 space-y-4">
//             <p className={themeClasses.text.secondary}>Select export format:</p>
            
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                 Format
//               </label>
//               <select
//                 value={exportFormat}
//                 onChange={(e) => setExportFormat(e.target.value)}
//                 className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
//               >
//                 {exportFormatOptions.map(option => (
//                   <option key={option.value} value={option.value}>
//                     {option.label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="flex justify-end gap-2 pt-4">
//               <button
//                 onClick={() => setShowExportModal(false)}
//                 className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.secondary}`}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleExport}
//                 className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.primary}`}
//               >
//                 Export
//               </button>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     );
//   };

//   return (
//     <div className={`min-h-screen transition-colors duration-300 ${themeClasses.bg.primary}`}>
//       <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
//         {renderHeader()}
//         {renderTabs()}

//         <div className="flex flex-col lg:flex-row gap-6">
//           {showFilters && (
//             <motion.aside
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: -20 }}
//               className="lg:w-1/4"
//             >
//               <div className={`p-6 rounded-xl border sticky top-6 ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//                 <ClientFilters
//                   filters={filters}
//                   onFilterChange={handleFilterChange}
//                   onClearFilters={handleClearFilters}
//                   hasActiveFilters={hasActiveFilters}
//                   theme={theme}
//                 />
//               </div>
//             </motion.aside>
//           )}

//           <main className={showFilters ? 'lg:w-3/4' : 'w-full'}>
//             <div className="space-y-6">
//               {renderMainContent()}
//             </div>
//           </main>
//         </div>
//       </div>

//       <AnimatePresence>
//         {renderCreateModal()}
//         {renderExportModal()}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default Subscribers;





import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Users, BarChart3, CreditCard, LayoutDashboard,
  Filter, RefreshCw, Download, Plus, Search,
  AlertCircle, Grid, List, User,
  Calendar, DollarSign, Activity,
  TrendingUp, TrendingDown, CheckCircle, XCircle, Clock,
  Eye, Edit, Trash2, Send, Star, Lock,
  X, Menu, Wifi, Globe, Shield,
  Zap, Target, PieChart
} from 'lucide-react';

// Components
import ClientFilters from '../../components/ClientManagement/ClientFilters';
import ClientProfile from '../../components/ClientManagement/ClientProfile';
import ClientMetrics from '../../components/ClientManagement/ClientMetrics';
import ClientActions from '../../components/ClientManagement/ClientActions';
import CommissionTracker from '../../components/ClientManagement/CommissionTracker';
import AnalyticsChart from '../../components/ClientManagement/AnalyticsChart';
import { EnhancedSelect, getThemeClasses } from '../../components/ServiceManagement/Shared/components';

// Hooks
import useClientData from '../../components/ClientManagement/hooks/useClientData';
import useAnalytics from '../../components/ClientManagement/hooks/useAnalytics';
import useCommission from '../../components/ClientManagement/hooks/useCommission';

// Utils
import { formatCurrency } from '../../components/ClientManagement/utils/formatters';
import { validatePhoneNumber } from '../../components/ClientManagement/utils/validators';
import ExportService from '../../components/ClientManagement/services/ExportService';

// Constants
import { 
  CONNECTION_TYPES, 
  TIME_RANGES,
  PAGE_SIZES 
} from '../../components/ClientManagement/constants/clientConstants';

/**
 * Subscribers Management Component
 * Handles client management, analytics, and commission tracking
 */
const Subscribers = () => {
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false); // Default to false on all screens
  const [viewMode, setViewMode] = useState('grid');
  const [timeRange, setTimeRange] = useState('30d');
  const [connectionTypeFilter, setConnectionTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [exportFormat, setExportFormat] = useState('csv');
  
  // Create client form state
  const [createFormData, setCreateFormData] = useState({
    name: '',
    phone_number: '',
    connection_type: 'pppoe',
    client_type: 'residential',
    location: '',
    referral_code: '',
    send_sms: true,
    assign_marketer: false
  });
  const [createErrors, setCreateErrors] = useState({});

  // ===========================================================================
  // Custom Hooks
  // ===========================================================================
  const {
    clients,
    filteredClients,
    selectedClient,
    dashboardData,
    isLoading: clientsLoading,
    isRefreshing,
    error: clientError,
    filters,
    pagination,
    stats,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    handleSelectClient,
    handleRefresh,
    handleClearFilters,
    updateClient,
    createClient,
    deleteClient,
    exportClients,
    hasActiveFilters
  } = useClientData();

  const {
    dashboardData: analyticsDashboard,
    analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
    handleTimeRangeChange,
    handleConnectionTypeChange,
    refreshAnalytics
  } = useAnalytics(timeRange, connectionTypeFilter);

  const {
    transactions,
    summary: commissionSummary,
    isLoading: commissionLoading,
    error: commissionError,
    refreshCommissions
  } = useCommission(user?.id);

  // ===========================================================================
  // Derived State
  // ===========================================================================
  const error = clientError || analyticsError || commissionError;
  const isLoading = clientsLoading || analyticsLoading || commissionLoading;

  // ===========================================================================
  // Memoized Values
  // ===========================================================================
  const tabs = useMemo(() => [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'commissions', label: 'Commissions', icon: CreditCard }
  ], []);

  const timeRangeOptions = useMemo(() => 
    TIME_RANGES.map(range => ({
      value: range.value,
      label: range.label
    })), []
  );

  const connectionTypeOptions = useMemo(() => [
    { value: 'all', label: 'All Connections' },
    ...Object.entries(CONNECTION_TYPES).map(([value, label]) => ({
      value,
      label
    }))
  ], []);

  const connectionTypeCreateOptions = useMemo(() => 
    Object.entries(CONNECTION_TYPES).map(([value, label]) => ({
      value,
      label
    })), []
  );

  const clientTypeOptions = useMemo(() => [
    { value: 'residential', label: 'Residential' },
    { value: 'business', label: 'Business' },
    { value: 'student', label: 'Student' },
    { value: 'tourist', label: 'Tourist' }
  ], []);

  const pageSizeOptions = useMemo(() => 
    PAGE_SIZES.map(size => ({
      value: size,
      label: `${size} per page`
    })), []
  );

  const exportFormatOptions = useMemo(() => [
    { value: 'csv', label: 'CSV (Spreadsheet)' },
    { value: 'json', label: 'JSON (Data)' }
  ], []);

  // ===========================================================================
  // Helper Functions
  // ===========================================================================
  
  /**
   * Safely get array from data
   */
  const safeArray = (data) => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') return Object.values(data);
    return [];
  };

  /**
   * Safely get revenue segments
   */
  const getRevenueSegments = () => {
    if (!analyticsData?.financial) return [];
    
    const segments = analyticsData.financial.revenue_segments;
    
    // If it's an array, return it
    if (Array.isArray(segments)) return segments;
    
    // If it's an object, convert to array
    if (segments && typeof segments === 'object') {
      return Object.entries(segments).map(([key, value]) => ({
        revenue_segment: key,
        total_revenue: value.total_revenue || value,
        count: value.count || 0
      }));
    }
    
    return [];
  };

  /**
   * Safely get top clients
   */
  const getTopClients = () => {
    if (!analyticsData?.financial) return [];
    
    const topClients = analyticsData.financial.top_clients;
    
    if (Array.isArray(topClients)) return topClients;
    if (topClients && typeof topClients === 'object') return Object.values(topClients);
    
    return [];
  };

  /**
   * Safely get usage patterns
   */
  const getUsagePatterns = () => {
    if (!analyticsData?.usage) return [];
    
    const patterns = analyticsData.usage.usage_patterns;
    
    if (Array.isArray(patterns)) return patterns;
    if (patterns && typeof patterns === 'object') return Object.values(patterns);
    
    return [];
  };

  /**
   * Safely get top users
   */
  const getTopUsers = () => {
    if (!analyticsData?.usage) return [];
    
    const topUsers = analyticsData.usage.top_users;
    
    if (Array.isArray(topUsers)) return topUsers;
    if (topUsers && typeof topUsers === 'object') return Object.values(topUsers);
    
    return [];
  };

  // ===========================================================================
  // Callback Handlers
  // ===========================================================================

  const handleCreateClient = useCallback(async () => {
    const phoneValidation = validatePhoneNumber(createFormData.phone_number);
    if (!phoneValidation.valid) {
      setCreateErrors({ phone_number: phoneValidation.message });
      return;
    }

    if (!createFormData.name.trim()) {
      setCreateErrors({ name: 'Full name is required' });
      return;
    }

    const result = await createClient({
      ...createFormData,
      phone_number: phoneValidation.normalized
    }, createFormData.connection_type);

    if (result.success) {
      setShowCreateModal(false);
      setCreateFormData({
        name: '',
        phone_number: '',
        connection_type: 'pppoe',
        client_type: 'residential',
        location: '',
        referral_code: '',
        send_sms: true,
        assign_marketer: false
      });
      setCreateErrors({});
    }
  }, [createFormData, createClient]);

  const handleExport = useCallback(async () => {
    try {
      if (exportFormat === 'csv') {
        const result = await exportClients('csv');
        if (result.success) {
          setShowExportModal(false);
        }
      } else if (exportFormat === 'json') {
        const formattedData = ExportService.prepareClientExportData(filteredClients);
        const result = await ExportService.exportAsJSON(
          formattedData, 
          `clients_export_${new Date().toISOString().split('T')[0]}`
        );
        if (result.success) {
          setShowExportModal(false);
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  }, [exportClients, exportFormat, filteredClients]);

  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    const timeoutId = setTimeout(() => {
      handleFilterChange('search', value);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [handleFilterChange]);

  const handleRefreshAll = useCallback(() => {
    handleRefresh();
    refreshAnalytics();
    refreshCommissions();
  }, [handleRefresh, refreshAnalytics, refreshCommissions]);

  const handleCreateFormChange = useCallback((field, value) => {
    setCreateFormData(prev => ({ ...prev, [field]: value }));
    if (createErrors[field]) {
      setCreateErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [createErrors]);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  // ===========================================================================
  // Render Helpers
  // ===========================================================================

  const fieldVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    blur: { scale: 1 }
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mt-4"
      >
        <div className={`p-4 rounded-lg border ${themeClasses.bg.danger} ${themeClasses.border.danger}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-500" size={20} />
              <span className={themeClasses.text.primary}>{error}</span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
              aria-label="Reload page"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderHeader = () => (
    <header className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-2 ${themeClasses.text.primary}`}>
            Client Management System
          </h1>
          <p className={`text-sm md:text-base ${themeClasses.text.secondary}`}>
            Manage clients, track analytics, and monitor commissions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 ${themeClasses.button.primary}`}
            aria-label="Create new client"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">New Client</span>
          </button>

          <button
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 ${themeClasses.button.secondary}`}
            aria-label="Refresh data"
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 ${themeClasses.button.success}`}
            aria-label="Export data"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 ${themeClasses.button.secondary}`}
            aria-label={showFilters ? 'Hide filters' : 'Show filters'}
          >
            <Filter size={18} />
            <span className="hidden sm:inline">{showFilters ? 'Hide' : 'Show'} Filters</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {renderError()}
      </AnimatePresence>
    </header>
  );

  const renderTabs = () => (
    <div className="mb-6">
      <nav className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                isActive
                  ? themeClasses.button.primary
                  : themeClasses.button.secondary
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );

  const renderDashboardTab = () => (
    <>
      <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className={themeClasses.text.secondary} />
            <span className={themeClasses.text.primary}>Time Range:</span>
          </div>
          <div className="w-full sm:w-48">
            <EnhancedSelect
              value={timeRange}
              onChange={(value) => {
                setTimeRange(value);
                handleTimeRangeChange(value);
              }}
              options={timeRangeOptions}
              theme={theme}
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Globe size={18} className={themeClasses.text.secondary} />
            <span className={themeClasses.text.primary}>Connection:</span>
          </div>
          <div className="w-full sm:w-48">
            <EnhancedSelect
              value={connectionTypeFilter}
              onChange={(value) => {
                setConnectionTypeFilter(value);
                handleConnectionTypeChange(value);
              }}
              options={connectionTypeOptions}
              theme={theme}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-medium ${themeClasses.text.secondary}`}>Total Clients</h3>
            <Users size={18} className="text-blue-500" />
          </div>
          <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>
            {stats?.total?.toLocaleString() || '0'}
          </p>
        </div>

        <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-medium ${themeClasses.text.secondary}`}>Active Clients</h3>
            <CheckCircle size={18} className="text-green-500" />
          </div>
          <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>
            {stats?.active?.toLocaleString() || '0'}
          </p>
          <p className={`text-xs mt-1 ${themeClasses.text.secondary}`}>
            {stats?.total ? `${((stats.active / stats.total) * 100).toFixed(1)}% of total` : '0% of total'}
          </p>
        </div>

        <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-medium ${themeClasses.text.secondary}`}>At Risk</h3>
            <AlertCircle size={18} className="text-red-500" />
          </div>
          <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>
            {stats?.atRisk?.toLocaleString() || '0'}
          </p>
        </div>

        <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-medium ${themeClasses.text.secondary}`}>Total Revenue</h3>
            <DollarSign size={18} className="text-purple-500" />
          </div>
          <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>
            {formatCurrency(stats?.totalRevenue || 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
          <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>Revenue Trend</h3>
          <AnalyticsChart
            data={analyticsDashboard?.charts?.revenue}
            type="line"
            height={300}
            theme={theme}
            loading={analyticsLoading}
          />
        </div>
        <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
          <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>Client Growth</h3>
          <AnalyticsChart
            data={analyticsDashboard?.charts?.clients}
            type="line"
            height={300}
            theme={theme}
            loading={analyticsLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
          <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>Connection Distribution</h3>
          <AnalyticsChart
            data={analyticsDashboard?.charts?.connectionDistribution}
            type="pie"
            height={300}
            theme={theme}
            loading={analyticsLoading}
          />
        </div>
        <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
          <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>Tier Distribution</h3>
          <AnalyticsChart
            data={analyticsDashboard?.charts?.tierDistribution}
            type="pie"
            height={300}
            theme={theme}
            loading={analyticsLoading}
          />
        </div>
      </div>
    </>
  );

  const renderClientGrid = (clientsToRender) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {clientsToRender.map((client) => {
        const isSelected = selectedClient?.id === client.id;
        
        return (
          <div
            key={client.id}
            onClick={() => handleSelectClient(client)}
            className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-lg ${
              isSelected ? 'ring-2 ring-indigo-500' : ''
            } ${themeClasses.bg.card} ${themeClasses.border.light}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-full ${themeClasses.bg.secondary}`}>
                <User size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium truncate ${themeClasses.text.primary}`}>
                  {client.username}
                </h4>
                <p className={`text-sm truncate ${themeClasses.text.secondary}`}>
                  {client.phone_display}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                client.status === 'active'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : client.status === 'suspended'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {client.status_display}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className={`text-xs ${themeClasses.text.secondary}`}>Revenue</p>
                <p className={`font-medium ${themeClasses.text.primary}`}>
                  {client.lifetime_value_formatted}
                </p>
              </div>
              <div>
                <p className={`text-xs ${themeClasses.text.secondary}`}>Risk</p>
                <p className={`font-medium ${
                  client.churn_risk_score >= 7 ? 'text-red-500' :
                  client.churn_risk_score >= 4 ? 'text-yellow-500' :
                  'text-green-500'
                }`}>
                  {client.churn_risk_score?.toFixed(1)}
                </p>
              </div>
              <div>
                <p className={`text-xs ${themeClasses.text.secondary}`}>Tier</p>
                <p className={`font-medium capitalize ${themeClasses.text.primary}`}>
                  {client.tier_display}
                </p>
              </div>
            </div>

            {client.is_at_risk && (
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle size={12} />
                  <span>At Risk - Needs Attention</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderClientList = (clientsToRender) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className={themeClasses.bg.secondary}>
          <tr>
            <th className="p-3 text-left text-sm font-medium">Client</th>
            <th className="p-3 text-left text-sm font-medium">Status</th>
            <th className="p-3 text-left text-sm font-medium">Revenue</th>
            <th className="p-3 text-left text-sm font-medium">Risk</th>
            <th className="p-3 text-left text-sm font-medium">Tier</th>
            <th className="p-3 text-left text-sm font-medium">Connection</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {clientsToRender.map((client) => (
            <tr
              key={client.id}
              onClick={() => handleSelectClient(client)}
              className={`cursor-pointer transition-colors ${
                selectedClient?.id === client.id
                  ? themeClasses.bg.info
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-full ${themeClasses.bg.secondary}`}>
                    <User size={14} />
                  </div>
                  <div>
                    <p className={`font-medium ${themeClasses.text.primary}`}>
                      {client.username}
                    </p>
                    <p className={`text-xs ${themeClasses.text.secondary}`}>
                      {client.phone_display}
                    </p>
                  </div>
                </div>
              </td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  client.status === 'active'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : client.status === 'suspended'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {client.status_display}
                </span>
              </td>
              <td className="p-3 font-medium">
                {client.lifetime_value_formatted}
              </td>
              <td className="p-3">
                <span className={
                  client.churn_risk_score >= 7 ? 'text-red-500' :
                  client.churn_risk_score >= 4 ? 'text-yellow-500' :
                  'text-green-500'
                }>
                  {client.churn_risk_score?.toFixed(1)}
                </span>
              </td>
              <td className="p-3 capitalize">
                {client.tier_display}
              </td>
              <td className="p-3 uppercase">
                {client.connection_type}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className={`text-sm ${themeClasses.text.secondary}`}>
          Page {pagination.currentPage} of {pagination.totalPages}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className={`px-3 py-1 rounded ${
              pagination.currentPage === 1
                ? 'opacity-50 cursor-not-allowed'
                : themeClasses.button.secondary
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className={`px-3 py-1 rounded ${
              pagination.currentPage === pagination.totalPages
                ? 'opacity-50 cursor-not-allowed'
                : themeClasses.button.secondary
            }`}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const renderClientsTab = () => {
    const paginatedClients = filteredClients.slice(
      (pagination.currentPage - 1) * pagination.pageSize,
      pagination.currentPage * pagination.pageSize
    );

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
                Clients ({filteredClients.length})
              </h3>
              {hasActiveFilters && (
                <p className={`text-sm ${themeClasses.text.secondary}`}>Filtered results</p>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search clients..."
                  className={`pl-10 pr-4 py-2 rounded-lg border text-sm ${themeClasses.input}`}
                />
              </div>
              
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className={`p-2 rounded ${themeClasses.button.secondary}`}
                title={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
              >
                {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
              </button>
              
              <div className="w-32">
                <EnhancedSelect
                  value={pagination.pageSize}
                  onChange={handlePageSizeChange}
                  options={pageSizeOptions}
                  theme={theme}
                />
              </div>
            </div>
          </div>

          {clientsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : viewMode === 'grid' ? (
            renderClientGrid(paginatedClients)
          ) : (
            renderClientList(paginatedClients)
          )}

          {renderPagination()}
        </div>

        {selectedClient ? (
          <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h2 className={`text-xl font-bold ${themeClasses.text.primary}`}>
                    {selectedClient.username}
                  </h2>
                  <p className={`text-sm ${themeClasses.text.secondary}`}>
                    {selectedClient.phone_display} • {selectedClient.connection_type_display}
                  </p>
                </div>
                <ClientActions
                  client={selectedClient}
                  onUpdate={updateClient}
                  onRefresh={handleRefresh}
                  onDelete={deleteClient}
                  theme={theme}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
                  <p className={`text-xs ${themeClasses.text.secondary}`}>LTV</p>
                  <p className={`font-bold ${themeClasses.text.primary}`}>
                    {selectedClient.lifetime_value_formatted}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
                  <p className={`text-xs ${themeClasses.text.secondary}`}>Monthly</p>
                  <p className={`font-bold ${themeClasses.text.primary}`}>
                    {selectedClient.monthly_revenue_formatted}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
                  <p className={`text-xs ${themeClasses.text.secondary}`}>Data Used</p>
                  <p className={`font-bold ${themeClasses.text.primary}`}>
                    {selectedClient.total_data_used_formatted}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
                  <p className={`text-xs ${themeClasses.text.secondary}`}>Since</p>
                  <p className={`font-bold text-sm ${themeClasses.text.primary}`}>
                    {selectedClient.customer_since_formatted}
                  </p>
                </div>
              </div>

              <ClientMetrics client={selectedClient} theme={theme} />

              <ClientProfile
                client={selectedClient}
                onUpdate={updateClient}
                theme={theme}
              />
            </div>
          </div>
        ) : (
          <div className={`p-6 rounded-xl border text-center ${themeClasses.bg.card} ${themeClasses.border.light}`}>
            <div className="py-12">
              <User size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className={`text-lg font-medium mb-2 ${themeClasses.text.primary}`}>
                No Client Selected
              </h3>
              <p className={themeClasses.text.secondary}>
                Click on a client from the list to view details
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAnalyticsTab = () => {
    if (!analyticsData) return null;

    // Get safe arrays
    const revenueSegments = getRevenueSegments();
    const topClients = getTopClients();
    const usagePatterns = getUsagePatterns();
    const topUsers = getTopUsers();

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
            <h3 className={`text-sm font-medium ${themeClasses.text.secondary} mb-1`}>Avg Churn Risk</h3>
            <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>
              {analyticsData.behavioral?.avg_churn_risk?.toFixed(1) || 0}/10
            </p>
          </div>
          <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
            <h3 className={`text-sm font-medium ${themeClasses.text.secondary} mb-1`}>Avg Engagement</h3>
            <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>
              {analyticsData.behavioral?.avg_engagement?.toFixed(1) || 0}/10
            </p>
          </div>
          <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
            <h3 className={`text-sm font-medium ${themeClasses.text.secondary} mb-1`}>Total Data Used</h3>
            <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>
              {analyticsData.usage?.total_data_used_gb?.toFixed(0) || 0} GB
            </p>
          </div>
          <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
            <h3 className={`text-sm font-medium ${themeClasses.text.secondary} mb-1`}>Retention Rate</h3>
            <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>
              {analyticsData.behavioral?.retention_rate?.toFixed(1) || 0}%
            </p>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
          <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>Financial Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className={`font-medium mb-3 ${themeClasses.text.primary}`}>
                Revenue by Segment
              </h4>
              <div className="space-y-3">
                {revenueSegments.length > 0 ? (
                  revenueSegments.map((segment, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="capitalize">{segment.revenue_segment?.replace('_', ' ') || 'Unknown'}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{formatCurrency(segment.total_revenue || 0)}</span>
                        <span className={`text-sm ${themeClasses.text.secondary}`}>
                          ({segment.count || 0} clients)
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={`text-sm ${themeClasses.text.secondary}`}>No revenue segment data available</p>
                )}
              </div>
            </div>
            <div>
              <h4 className={`font-medium mb-3 ${themeClasses.text.primary}`}>
                Top Clients by Revenue
              </h4>
              <div className="space-y-3">
                {topClients.length > 0 ? (
                  topClients.map((client, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{client.username || 'Unknown'}</span>
                      <span className="font-medium">{formatCurrency(client.lifetime_value || 0)}</span>
                    </div>
                  ))
                ) : (
                  <p className={`text-sm ${themeClasses.text.secondary}`}>No top client data available</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
          <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>Usage Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className={`font-medium mb-3 ${themeClasses.text.primary}`}>
                Usage Patterns
              </h4>
              <div className="space-y-3">
                {usagePatterns.length > 0 ? (
                  usagePatterns.map((pattern, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="capitalize">{pattern.usage_pattern?.replace('_', ' ') || 'Unknown'}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{pattern.count || 0} clients</span>
                        <span className={`text-sm ${themeClasses.text.secondary}`}>
                          {pattern.avg_data?.toFixed(1) || 0} GB avg
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={`text-sm ${themeClasses.text.secondary}`}>No usage pattern data available</p>
                )}
              </div>
            </div>
            <div>
              <h4 className={`font-medium mb-3 ${themeClasses.text.primary}`}>
                Top Data Users
              </h4>
              <div className="space-y-3">
                {topUsers.length > 0 ? (
                  topUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{user.username || 'Unknown'}</span>
                      <span className="font-medium">{user.total_data_used_gb?.toFixed(1) || 0} GB</span>
                    </div>
                  ))
                ) : (
                  <p className={`text-sm ${themeClasses.text.secondary}`}>No top user data available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCommissionsTab = () => (
    <CommissionTracker
      marketerId={user?.id}
      theme={theme}
    />
  );

  const renderMainContent = () => {
    try {
      switch (activeTab) {
        case 'dashboard':
          return renderDashboardTab();
        case 'clients':
          return renderClientsTab();
        case 'analytics':
          return renderAnalyticsTab();
        case 'commissions':
          return renderCommissionsTab();
        default:
          return null;
      }
    } catch (err) {
      console.error('Error rendering tab:', err);
      return (
        <div className={`p-6 rounded-xl border text-center ${themeClasses.bg.danger} ${themeClasses.border.danger}`}>
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h3 className={`text-lg font-medium mb-2 ${themeClasses.text.primary}`}>
            Error Loading Content
          </h3>
          <p className={themeClasses.text.secondary}>
            {err.message || 'An error occurred while loading this tab.'}
          </p>
          <button
            onClick={handleRefreshAll}
            className={`mt-4 px-4 py-2 rounded-lg font-medium ${themeClasses.button.primary}`}
          >
            <RefreshCw size={18} className="inline mr-2" />
            Refresh Page
          </button>
        </div>
      );
    }
  };

  const renderCreateModal = () => {
    if (!showCreateModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`w-full max-w-2xl rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}
        >
          <div className={`p-6 border-b ${themeClasses.border.light}`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-semibold ${themeClasses.text.primary}`}>
                Create New Client
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className={`p-2 rounded ${themeClasses.button.secondary}`}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={fieldVariants} whileFocus="focus" initial="blur">
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={createFormData.name}
                  onChange={(e) => handleCreateFormChange('name', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input} transition-shadow focus:ring-2 focus:ring-indigo-500`}
                  placeholder="John Doe"
                />
                {createErrors.name && (
                  <p className="flex items-center gap-1 text-sm text-red-500 mt-1">
                    <AlertCircle size={12} />
                    {createErrors.name}
                  </p>
                )}
              </motion.div>

              <motion.div variants={fieldVariants} whileFocus="focus" initial="blur">
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={createFormData.phone_number}
                  onChange={(e) => handleCreateFormChange('phone_number', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input} transition-shadow focus:ring-2 focus:ring-indigo-500`}
                  placeholder="0712345678"
                />
                {createErrors.phone_number && (
                  <p className="flex items-center gap-1 text-sm text-red-500 mt-1">
                    <AlertCircle size={12} />
                    {createErrors.phone_number}
                  </p>
                )}
              </motion.div>

              <motion.div variants={fieldVariants} whileFocus="focus" initial="blur">
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                  Connection Type *
                </label>
                <EnhancedSelect
                  value={createFormData.connection_type}
                  onChange={(value) => handleCreateFormChange('connection_type', value)}
                  options={connectionTypeCreateOptions}
                  theme={theme}
                />
              </motion.div>

              <motion.div variants={fieldVariants} whileFocus="focus" initial="blur">
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                  Client Type
                </label>
                <EnhancedSelect
                  value={createFormData.client_type}
                  onChange={(value) => handleCreateFormChange('client_type', value)}
                  options={clientTypeOptions}
                  theme={theme}
                />
              </motion.div>

              <motion.div variants={fieldVariants} whileFocus="focus" initial="blur" className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={createFormData.location}
                  onChange={(e) => handleCreateFormChange('location', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input} transition-shadow focus:ring-2 focus:ring-indigo-500`}
                  placeholder="e.g., Nairobi, Westlands"
                />
              </motion.div>

              <motion.div variants={fieldVariants} whileFocus="focus" initial="blur" className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                  Referral Code (Optional)
                </label>
                <input
                  type="text"
                  value={createFormData.referral_code}
                  onChange={(e) => handleCreateFormChange('referral_code', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input} transition-shadow focus:ring-2 focus:ring-indigo-500`}
                  placeholder="Enter referral code"
                />
              </motion.div>

              <div className="md:col-span-2 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createFormData.send_sms}
                    onChange={(e) => handleCreateFormChange('send_sms', e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 focus:ring-indigo-500"
                  />
                  <span className={themeClasses.text.secondary}>Send welcome SMS with credentials</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createFormData.assign_marketer}
                    onChange={(e) => handleCreateFormChange('assign_marketer', e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 focus:ring-indigo-500"
                  />
                  <span className={themeClasses.text.secondary}>Assign as marketer</span>
                </label>
              </div>
            </div>
          </div>

          <div className={`p-6 border-t flex justify-end gap-2 ${themeClasses.border.light}`}>
            <button
              onClick={() => setShowCreateModal(false)}
              className={`px-6 py-2 rounded-lg font-medium transition-all hover:scale-105 ${themeClasses.button.secondary}`}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateClient}
              disabled={clientsLoading}
              className={`px-6 py-2 rounded-lg font-medium transition-all hover:scale-105 ${themeClasses.button.primary} ${
                clientsLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {clientsLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Client'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderExportModal = () => {
    if (!showExportModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`w-full max-w-md rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}
        >
          <div className={`p-6 border-b ${themeClasses.border.light}`}>
            <h2 className={`text-xl font-semibold ${themeClasses.text.primary}`}>Export Data</h2>
          </div>

          <div className="p-6 space-y-4">
            <p className={themeClasses.text.secondary}>Select export format:</p>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                Format
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
              >
                {exportFormatOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setShowExportModal(false)}
                className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.secondary}`}
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.primary}`}
              >
                Export
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses.bg.primary}`}>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {renderHeader()}
        {renderTabs()}

        <div className="flex flex-col lg:flex-row gap-6">
          {showFilters && (
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="lg:w-1/4"
            >
              <div className={`p-6 rounded-xl border sticky top-6 ${themeClasses.bg.card} ${themeClasses.border.light}`}>
                <ClientFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                  hasActiveFilters={hasActiveFilters}
                  theme={theme}
                />
              </div>
            </motion.aside>
          )}

          <main className={showFilters ? 'lg:w-3/4' : 'w-full'}>
            <div className="space-y-6">
              {renderMainContent()}
            </div>
          </main>
        </div>
      </div>

      <AnimatePresence>
        {renderCreateModal()}
        {renderExportModal()}
      </AnimatePresence>
    </div>
  );
};

export default Subscribers;