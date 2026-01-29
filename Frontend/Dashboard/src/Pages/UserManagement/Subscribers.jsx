// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { useTheme } from '../../context/ThemeContext';
// import {
//   FiFilter,
//   FiRefreshCw,
//   FiDownload,
//   FiUsers,
//   FiPlus,
//   FiSearch,
//   FiAlertCircle,
//   FiGrid,
//   FiBarChart2,
//   FiCreditCard,
//   FiUser
// } from 'react-icons/fi';
// import { FaSpinner } from 'react-icons/fa';

// // Hooks
// import useClientData from '../../hooks/useClientData';
// import useAnalytics from '../../hooks/useAnalytics';
// import useClientFilters from '../../hooks/useClientFilters';

// // Components
// import Card from '../../components/UI/Card';
// import StatsCard from '../../components/UI/StatsCard';
// import Modal from '../../components/UI/Modal';
// import DataTable from '../../components/UI/DataTable';
// import ResponsiveGrid from '../../components/Layouts/ResponsiveGrid';

// // Client Management Components
// import ClientDashboard from '../../components/ClientManagement/ClientDashboard';
// import ClientFilters from '../../components/ClientManagement/ClientFilters';
// import ClientList from '../../components/ClientManagement/ClientList';
// import ClientProfile from '../../components/ClientManagement/ClientProfile';
// import ClientMetrics from '../../components/ClientManagement/ClientMetrics';
// import ClientActions from '../../components/ClientManagement/ClientActions';
// import AnalyticsChart from '../../components/ClientManagement/AnalyticsChart';
// import CommissionTracker from '../../components/ClientManagement/CommissionTracker';

// // Utils
// import { exportToCSV, exportToExcel } from '../../utils/exporters';
// import { formatCurrency, formatDate, formatPhoneNumber } from '../../utils/formatters';
// import { validateForm } from '../../utils/validators';

// const Subscribers = () => {
//   const { isAuthenticated, user } = useAuth();
//   const { theme } = useTheme();

//   // Active tab state
//   const [activeTab, setActiveTab] = useState('clients');
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showExportModal, setShowExportModal] = useState(false);
//   const [showFilters, setShowFilters] = useState(true);
//   const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

//   // Use custom hooks for data management
//   const {
//     clients,
//     filteredClients,
//     selectedClient,
//     dashboardData,
//     analytics,
//     isLoading,
//     isRefreshing,
//     error,
//     filters,
//     pagination,
//     handleFilterChange,
//     handlePageChange,
//     handlePageSizeChange,
//     handleSelectClient,
//     handleRefresh,
//     handleClearFilters,
//     updateClient,
//     createClient,
//     deleteClient
//   } = useClientData();

//   // Use analytics hook
//   const {
//     analyticsData: processedAnalytics,
//     performanceMetrics,
//     alerts,
//     handleExport: handleExportAnalytics,
//     handleRefresh: handleRefreshAnalytics
//   } = useAnalytics('30d', 'all');

//   // Use client filters hook
//   const {
//     filterOptions,
//     filteredStats,
//     filterSummary,
//     hasActiveFilters,
//     activeFilterCount,
//     clearAllFilters
//   } = useClientFilters(clients);

//   // Tab configurations
//   const tabs = [
//     { id: 'clients', label: 'Clients', icon: FiUsers },
//     { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
//     { id: 'commissions', label: 'Commissions', icon: FiCreditCard },
//     { id: 'dashboard', label: 'Dashboard', icon: FiGrid }
//   ];

//   // Handle export
//   const handleExport = async (format = 'csv') => {
//     try {
//       if (format === 'csv') {
//         exportToCSV(filteredClients, 'clients_export');
//       } else if (format === 'excel') {
//         exportToExcel(filteredClients, 'clients_export');
//       }
//       setShowExportModal(false);
//     } catch (err) {
//       console.error('Export failed:', err);
//     }
//   };

//   // Handle client creation
//   const handleCreateClient = async (clientData) => {
//     try {
//       const result = await createClient(clientData);
//       if (result.success) {
//         setShowCreateModal(false);
//       }
//     } catch (err) {
//       console.error('Client creation failed:', err);
//     }
//   };

//   // Handle client deletion
//   const handleDeleteClient = async (clientId) => {
//     if (window.confirm('Are you sure you want to delete this client?')) {
//       await deleteClient(clientId);
//     }
//   };

//   // Loading state
//   if (isLoading && !isRefreshing) {
//     return (
//       <div className={`min-h-screen flex items-center justify-center ${
//         theme === 'dark' 
//           ? 'bg-gradient-to-br from-gray-900 to-gray-950 text-gray-100'
//           : 'bg-gray-50 text-gray-900'
//       }`}>
//         <div className="text-center">
//           <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
//           <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
//             Loading client management system...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // Not authenticated
//   if (!isAuthenticated) {
//     return (
//       <div className={`min-h-screen flex items-center justify-center ${
//         theme === 'dark' 
//           ? 'bg-gradient-to-br from-gray-900 to-gray-950'
//           : 'bg-gray-50'
//       }`}>
//         <Card
//           title="Authentication Required"
//           subtitle="Please log in to access the client management system"
//           theme={theme}
//           className="max-w-md"
//         >
//           <div className="text-center py-6">
//             <FiAlertCircle className="text-4xl text-red-500 mx-auto mb-4" />
//             <p className="mb-4">You need to be logged in to view this page.</p>
//           </div>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className={`min-h-screen transition-colors duration-300 ${
//       theme === 'dark' 
//         ? 'bg-gradient-to-br from-gray-900 to-gray-950 text-gray-100'
//         : 'bg-gray-50 text-gray-900'
//     }`}>
//       <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
//         {/* Error Display */}
//         {error && (
//           <Card theme={theme} className="mb-6 border-red-200 dark:border-red-800">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <FiAlertCircle className="text-red-500" />
//                 <span>{error}</span>
//               </div>
//               <button
//                 onClick={() => console.log('Clear error')}
//                 className="text-red-500 hover:text-red-700"
//               >
//                 Dismiss
//               </button>
//             </div>
//           </Card>
//         )}

//         {/* Header Section */}
//         <header className="mb-8">
//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
//             <div className="flex-1">
//               <h1 className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-2 ${
//                 theme === 'dark' ? 'text-white' : 'text-gray-900'
//               }`}>
//                 Client Management System
//               </h1>
//               <p className={`text-sm md:text-base ${
//                 theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
//               }`}>
//                 Manage client profiles, analytics, and marketing campaigns
//               </p>
//             </div>

//             {/* Action Buttons */}
//             <div className="flex flex-wrap items-center gap-2">
//               <button
//                 onClick={() => setShowCreateModal(true)}
//                 className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
//                   theme === 'dark'
//                     ? 'bg-blue-600 hover:bg-blue-700 text-white'
//                     : 'bg-blue-500 hover:bg-blue-600 text-white'
//                 }`}
//               >
//                 <FiPlus size={18} />
//                 <span className="hidden sm:inline">Create Client</span>
//               </button>
              
//               <button
//                 onClick={handleRefresh}
//                 disabled={isRefreshing}
//                 className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
//                   theme === 'dark'
//                     ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
//                     : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
//                 }`}
//               >
//                 {isRefreshing ? (
//                   <FaSpinner className="animate-spin" size={18} />
//                 ) : (
//                   <FiRefreshCw size={18} />
//                 )}
//                 <span className="hidden sm:inline">Refresh</span>
//               </button>

//               <button
//                 onClick={() => setShowExportModal(true)}
//                 className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
//                   theme === 'dark'
//                     ? 'bg-green-600 hover:bg-green-700 text-white'
//                     : 'bg-green-500 hover:bg-green-600 text-white'
//                 }`}
//               >
//                 <FiDownload size={18} />
//                 <span className="hidden sm:inline">Export</span>
//               </button>

//               <button
//                 onClick={() => setShowFilters(!showFilters)}
//                 className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
//                   theme === 'dark'
//                     ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
//                     : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
//                 } lg:hidden`}
//               >
//                 <FiFilter size={18} />
//                 {showFilters ? 'Hide' : 'Show'} Filters
//               </button>
//             </div>
//           </div>
//         </header>

//         {/* Tab Navigation */}
//         <div className="mb-6">
//           <nav className="flex flex-wrap gap-2 border-b pb-2">
//             {tabs.map((tab) => {
//               const Icon = tab.icon;
//               return (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
//                     activeTab === tab.id
//                       ? theme === 'dark'
//                         ? 'bg-blue-600 text-white'
//                         : 'bg-blue-500 text-white'
//                       : theme === 'dark'
//                       ? 'text-gray-400 hover:text-white hover:bg-gray-700'
//                       : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
//                   }`}
//                 >
//                   <Icon size={18} />
//                   {tab.label}
//                 </button>
//               );
//             })}
//           </nav>
//         </div>

//         {/* Main Content */}
//         <ResponsiveGrid.Sidebar
//           sidebar={
//             showFilters && (
//               <Card title="Filters" theme={theme} className="sticky top-6">
//                 <ClientFilters
//                   filters={filters}
//                   onFilterChange={handleFilterChange}
//                   onClearFilters={() => {
//                     handleClearFilters();
//                     clearAllFilters();
//                   }}
//                   hasActiveFilters={hasActiveFilters}
//                   theme={theme}
//                   filterOptions={filterOptions}
//                 />
//               </Card>
//             )
//           }
//           main={
//             <div className="space-y-6">
//               {/* Dashboard Tab */}
//               {activeTab === 'dashboard' && dashboardData && (
//                 <>
//                   {/* Quick Stats */}
//                   <ResponsiveGrid cols={{ xs: 1, sm: 2, lg: 4 }} gap={4}>
//                     <StatsCard
//                       title="Total Clients"
//                       value={dashboardData.summary?.total_clients || 0}
//                       icon={FiUsers}
//                       color="blue"
//                       theme={theme}
//                       trend={{
//                         value: dashboardData.summary?.growth_rate
//                           ? `${dashboardData.summary.growth_rate > 0 ? '+' : ''}${dashboardData.summary.growth_rate}%`
//                           : '0%',
//                         direction: dashboardData.summary?.growth_rate > 0 ? 'up' : 'down'
//                       }}
//                     />
//                     <StatsCard
//                       title="Active Clients"
//                       value={dashboardData.summary?.active_clients || 0}
//                       icon={FiUsers}
//                       color="green"
//                       theme={theme}
//                     />
//                     <StatsCard
//                       title="At Risk"
//                       value={dashboardData.summary?.at_risk_clients || 0}
//                       icon={FiAlertCircle}
//                       color="red"
//                       theme={theme}
//                     />
//                     <StatsCard
//                       title="Total Revenue"
//                       value={`KES ${Math.round(dashboardData.summary?.revenue?.total || 0).toLocaleString()}`}
//                       icon={FiCreditCard}
//                       color="purple"
//                       theme={theme}
//                     />
//                   </ResponsiveGrid>

//                   {/* Dashboard Components */}
//                   <Card title="Client Overview" theme={theme}>
//                     <ClientDashboard 
//                       data={dashboardData} 
//                       theme={theme}
//                       onFilterChange={handleFilterChange}
//                     />
//                   </Card>

//                   {/* Alerts */}
//                   {alerts.length > 0 && (
//                     <Card title="System Alerts" theme={theme}>
//                       <div className="space-y-3">
//                         {alerts.slice(0, 5).map((alert, index) => (
//                           <div
//                             key={index}
//                             className={`p-3 rounded-lg ${
//                               alert.severity === 'high'
//                                 ? 'bg-red-900/20 border border-red-800/30'
//                                 : 'bg-yellow-900/20 border border-yellow-800/30'
//                             }`}
//                           >
//                             <div className="flex items-start justify-between">
//                               <div>
//                                 <p className="font-medium text-sm mb-1">{alert.title}</p>
//                                 <p className="text-xs opacity-80">{alert.description}</p>
//                               </div>
//                               <span className={`text-xs px-2 py-1 rounded ${
//                                 alert.severity === 'high'
//                                   ? 'bg-red-500 text-white'
//                                   : 'bg-yellow-500 text-white'
//                               }`}>
//                                 {alert.severity}
//                               </span>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </Card>
//                   )}
//                 </>
//               )}

//               {/* Clients Tab */}
//               {activeTab === 'clients' && (
//                 <ResponsiveGrid cols={{ xs: 1, lg: selectedClient ? 2 : 1 }} gap={6}>
//                   {/* Client List */}
//                   <Card 
//                     title={`Clients (${filteredClients.length})`}
//                     subtitle={filterSummary.length > 0 ? filterSummary.join(' • ') : 'All clients'}
//                     actions={() => (
//                       <div className="flex items-center gap-2">
//                         <button
//                           onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
//                           className={`p-2 rounded ${
//                             theme === 'dark'
//                               ? 'hover:bg-gray-700'
//                               : 'hover:bg-gray-200'
//                           }`}
//                         >
//                           {viewMode === 'grid' ? 'List View' : 'Grid View'}
//                         </button>
//                       </div>
//                     )}
//                     theme={theme}
//                   >
//                     {viewMode === 'grid' ? (
//                       <ResponsiveGrid cols={{ xs: 1, sm: 2, lg: selectedClient ? 2 : 3 }} gap={4}>
//                         {filteredClients.slice(0, 12).map((client) => (
//                           <Card
//                             key={client.id}
//                             theme={theme}
//                             className="cursor-pointer hover:shadow-md transition-shadow"
//                             onClick={() => handleSelectClient(client)}
//                           >
//                             <div className="flex items-center gap-3">
//                               <div className={`p-2 rounded-full ${
//                                 theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
//                               }`}>
//                                 <FiUser size={20} />
//                               </div>
//                               <div className="flex-1 min-w-0">
//                                 <h4 className="font-medium truncate">{client.username}</h4>
//                                 <p className="text-sm opacity-75 truncate">{client.phone_display}</p>
//                               </div>
//                               <div className={`px-2 py-1 rounded text-xs ${
//                                 client.status === 'active'
//                                   ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
//                                   : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
//                               }`}>
//                                 {client.status_display}
//                               </div>
//                             </div>
//                             <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
//                               <div>
//                                 <p className="opacity-75">Revenue</p>
//                                 <p className="font-medium">{client.lifetime_value_formatted}</p>
//                               </div>
//                               <div>
//                                 <p className="opacity-75">Risk</p>
//                                 <p className={`font-medium ${
//                                   client.churn_risk_score >= 7 ? 'text-red-500' :
//                                   client.churn_risk_score >= 4 ? 'text-yellow-500' :
//                                   'text-green-500'
//                                 }`}>
//                                   {client.churn_risk_score.toFixed(1)}
//                                 </p>
//                               </div>
//                               <div>
//                                 <p className="opacity-75">Tier</p>
//                                 <p className="font-medium">{client.tier_display}</p>
//                               </div>
//                             </div>
//                           </Card>
//                         ))}
//                       </ResponsiveGrid>
//                     ) : (
//                       <ClientList
//                         clients={filteredClients}
//                         selectedClient={selectedClient}
//                         onSelectClient={handleSelectClient}
//                         isLoading={isLoading}
//                         pagination={pagination}
//                         onPageChange={handlePageChange}
//                         onPageSizeChange={handlePageSizeChange}
//                         theme={theme}
//                       />
//                     )}
//                   </Card>

//                   {/* Client Details */}
//                   {selectedClient && (
//                     <Card title="Client Details" theme={theme}>
//                       <div className="space-y-6">
//                         {/* Client Header */}
//                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                           <div>
//                             <h2 className="text-xl font-bold">{selectedClient.username}</h2>
//                             <p className="text-sm opacity-75">
//                               {formatPhoneNumber(selectedClient.phone_number)} • {selectedClient.connection_type_display}
//                             </p>
//                           </div>
//                           <ClientActions 
//                             client={selectedClient}
//                             onUpdate={updateClient}
//                             onRefresh={handleRefresh}
//                             theme={theme}
//                           />
//                         </div>

//                         {/* Quick Metrics */}
//                         <ClientMetrics client={selectedClient} theme={theme} />

//                         {/* Tab Navigation for Client Details */}
//                         <div className="border-b">
//                           <div className="flex gap-2">
//                             {['overview', 'profile', 'analytics'].map((tab) => (
//                               <button
//                                 key={tab}
//                                 onClick={() => setActiveTab(`client-${tab}`)}
//                                 className={`px-4 py-2 font-medium capitalize ${
//                                   activeTab === `client-${tab}`
//                                     ? 'border-b-2 border-blue-500'
//                                     : 'opacity-75 hover:opacity-100'
//                                 }`}
//                               >
//                                 {tab}
//                               </button>
//                             ))}
//                           </div>
//                         </div>

//                         {/* Client Profile */}
//                         <ClientProfile 
//                           client={selectedClient} 
//                           onUpdate={updateClient}
//                           theme={theme}
//                         />
//                       </div>
//                     </Card>
//                   )}
//                 </ResponsiveGrid>
//               )}

//               {/* Analytics Tab */}
//               {activeTab === 'analytics' && (
//                 <div className="space-y-6">
//                   {processedAnalytics && (
//                     <>
//                       {/* Performance Metrics */}
//                       <ResponsiveGrid cols={{ xs: 1, sm: 2, lg: 4 }} gap={4}>
//                         {performanceMetrics && Object.entries(performanceMetrics).map(([key, value]) => (
//                           <StatsCard
//                             key={key}
//                             title={key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
//                             value={typeof value === 'number' ? `${value}%` : value}
//                             color={
//                               typeof value === 'string' 
//                                 ? value === 'excellent' ? 'green' : 
//                                   value === 'good' ? 'blue' : 
//                                   value === 'needs_attention' ? 'yellow' : 'gray'
//                                 : value >= 70 ? 'green' : 
//                                   value >= 50 ? 'blue' : 'yellow'
//                             }
//                             theme={theme}
//                           />
//                         ))}
//                       </ResponsiveGrid>

//                       {/* Charts */}
//                       <ResponsiveGrid cols={{ xs: 1, lg: 2 }} gap={6}>
//                         {processedAnalytics.charts && Object.entries(processedAnalytics.charts).map(([key, chartData]) => (
//                           <AnalyticsChart
//                             key={key}
//                             data={chartData}
//                             title={key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
//                             type={key.includes('distribution') ? 'pie' : 'line'}
//                             theme={theme}
//                             height={300}
//                           />
//                         ))}
//                       </ResponsiveGrid>

//                       {/* Insights */}
//                       {processedAnalytics.insights && processedAnalytics.insights.length > 0 && (
//                         <Card title="Insights" theme={theme}>
//                           <ResponsiveGrid cols={{ xs: 1, sm: 2 }} gap={4}>
//                             {processedAnalytics.insights.map((insight, index) => (
//                               <div
//                                 key={index}
//                                 className={`p-4 rounded-lg ${
//                                   insight.type === 'success' ? 'bg-green-900/20' :
//                                   insight.type === 'warning' ? 'bg-yellow-900/20' :
//                                   insight.type === 'danger' ? 'bg-red-900/20' :
//                                   'bg-blue-900/20'
//                                 }`}
//                               >
//                                 <div className="flex items-start gap-3">
//                                   <span className="text-2xl">{insight.icon}</span>
//                                   <div>
//                                     <h4 className="font-medium mb-1">{insight.title}</h4>
//                                     <p className="text-sm opacity-90">{insight.message}</p>
//                                   </div>
//                                 </div>
//                               </div>
//                             ))}
//                           </ResponsiveGrid>
//                         </Card>
//                       )}
//                     </>
//                   )}
//                 </div>
//               )}

//               {/* Commissions Tab */}
//               {activeTab === 'commissions' && (
//                 <CommissionTracker
//                   marketerId={user?.id}
//                   theme={theme}
//                 />
//               )}
//             </div>
//           }
//           sidebarWidth={showFilters ? '1/4' : '0'}
//           gap={6}
//           collapseAt="lg"
//           className={!showFilters ? 'lg:!flex-row' : ''}
//         />
//       </div>

//       {/* Create Client Modal */}
//       {showCreateModal && (
//         <Modal
//           isOpen={showCreateModal}
//           onClose={() => setShowCreateModal(false)}
//           title="Create New Client"
//           theme={theme}
//           size="lg"
//         >
//           <div className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium mb-2">Username</label>
//                 <input
//                   type="text"
//                   className="w-full px-3 py-2 rounded-lg border bg-gray-700 dark:bg-gray-700 border-gray-600 text-white"
//                   placeholder="Enter username"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-2">Phone Number</label>
//                 <input
//                   type="tel"
//                   className="w-full px-3 py-2 rounded-lg border bg-gray-700 dark:bg-gray-700 border-gray-600 text-white"
//                   placeholder="07XXXXXXXX"
//                 />
//               </div>
//               <div className="col-span-2">
//                 <label className="block text-sm font-medium mb-2">Connection Type</label>
//                 <select className="w-full px-3 py-2 rounded-lg border bg-gray-700 dark:bg-gray-700 border-gray-600 text-white">
//                   <option value="pppoe">PPPoE</option>
//                   <option value="hotspot">Hotspot</option>
//                 </select>
//               </div>
//             </div>
//             <div className="flex justify-end gap-2">
//               <button
//                 onClick={() => setShowCreateModal(false)}
//                 className="px-4 py-2 rounded-lg font-medium bg-gray-700 hover:bg-gray-600"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => handleCreateClient({})}
//                 className="px-4 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white"
//               >
//                 Create Client
//               </button>
//             </div>
//           </div>
//         </Modal>
//       )}

//       {/* Export Modal */}
//       {showExportModal && (
//         <Modal
//           isOpen={showExportModal}
//           onClose={() => setShowExportModal(false)}
//           title="Export Data"
//           theme={theme}
//           size="sm"
//         >
//           <div className="space-y-4">
//             <p className="text-sm opacity-75">Select export format:</p>
//             <div className="grid grid-cols-2 gap-3">
//               <button
//                 onClick={() => handleExport('csv')}
//                 className="p-4 rounded-lg border text-center hover:bg-gray-700 dark:hover:bg-gray-700"
//               >
//                 <div className="text-lg mb-2">📊</div>
//                 <div className="font-medium">CSV</div>
//                 <div className="text-xs opacity-75">Spreadsheet format</div>
//               </button>
//               <button
//                 onClick={() => handleExport('excel')}
//                 className="p-4 rounded-lg border text-center hover:bg-gray-700 dark:hover:bg-gray-700"
//               >
//                 <div className="text-lg mb-2">📈</div>
//                 <div className="font-medium">Excel</div>
//                 <div className="text-xs opacity-75">Microsoft Excel</div>
//               </button>
//             </div>
//           </div>
//         </Modal>
//       )}
//     </div>
//   );
// };

// export default Subscribers;










// subscribers.jsx (Parent File)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FiFilter,
  FiRefreshCw,
  FiDownload,
  FiUsers,
  FiPlus,
  FiSearch,
  FiAlertCircle,
  FiGrid,
  FiBarChart2,
  FiCreditCard,
  FiUser
} from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
// Hooks
import useClientData from '../../components/ClientManagement/hooks/useClientData'
import useAnalytics from '../../components/ClientManagement/hooks/useAnalytics';
import useClientFilters from '../../components/ClientManagement/hooks/useClientFilters';
// Components
import Card from '../../components/ClientManagement/UI/Card'
import StatsCard from '../../components/ClientManagement/UI/StatsCard';
import Modal from '../../components/ClientManagement/UI/Modal';
import DataTable from '../../components/ClientManagement/UI/DataTable';
import ResponsiveGrid from '../../components/ClientManagement/Layout/ResponsiveGrid';
// Client Management Components
import ClientDashboard from '../../components/ClientManagement/ClientDashboard';
import ClientFilters from '../../components/ClientManagement/ClientFilters';
import ClientList from '../../components/ClientManagement/ClientList';
import ClientProfile from '../../components/ClientManagement/ClientProfile';
import ClientMetrics from '../../components/ClientManagement/ClientMetrics';
import ClientActions from '../../components/ClientManagement/ClientActions';
import AnalyticsChart from '../../components/ClientManagement/AnalyticsChart';
import CommissionTracker from '../../components/ClientManagement/CommissionTracker';
// Utils
// import { exportToCSV, exportToExcel } from '../../utils/exporters';
import { formatCurrency, formatDate, formatPhoneNumber } from '../../components/ClientManagement/utils/formatters'
import { validateForm } from '../../components/ClientManagement/utils/validators'
import { EnhancedSelect, getThemeClasses } from '../../components/ServiceManagement/Shared/components'


const Subscribers = () => {
  const { isAuthenticated, user } = useAuth();
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme); // Use getThemeClasses to get theme-specific classes

  // Active tab state
  const [activeTab, setActiveTab] = useState('clients');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [createFormData, setCreateFormData] = useState({
    username: '',
    phone_number: '',
    connection_type: 'pppoe',
  });
  const [createErrors, setCreateErrors] = useState({});

  // Use custom hooks for data management
  const {
    clients,
    filteredClients,
    selectedClient,
    dashboardData,
    analytics,
    isLoading,
    isRefreshing,
    error,
    filters: dataFilters,
    pagination,
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
    hasActiveFilters,
  } = useClientData();

  // Use analytics hook
  const {
    dashboardData: analyticsDashboard,
    analyticsData: processedAnalytics,
    performanceMetrics,
    alerts,
    handleExport: handleExportAnalytics,
    handleRefresh: handleRefreshAnalytics
  } = useAnalytics('30d', 'all');

  // Use client filters hook
  const {
    filterOptions,
    filteredStats,
    filterSummary,
    hasActiveFilters: filtersActive,
    activeFilterCount,
    clearAllFilters
  } = useClientFilters(clients);

  // Tab configurations
  const tabs = [
    { id: 'clients', label: 'Clients', icon: FiUsers },
    { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
    { id: 'commissions', label: 'Commissions', icon: FiCreditCard },
    { id: 'dashboard', label: 'Dashboard', icon: FiGrid }
  ];

  // Handle export
  const handleExport = async (format = 'csv') => {
    try {
      await exportClients(format);
      setShowExportModal(false);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  // Handle form input change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle client creation
  const handleCreateClient = async () => {
    const validationErrors = validateForm(createFormData, {
      username: { required: true, minLength: 3 },
      phone_number: { required: true, pattern: /^07\d{8}$|^01\d{8}$/ },
      connection_type: { required: true }
    });
    setCreateErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      const result = await createClient(createFormData, createFormData.connection_type);
      if (result.success) {
        setShowCreateModal(false);
        setCreateFormData({
          username: '',
          phone_number: '',
          connection_type: 'pppoe',
        });
      }
    }
  };

  // Handle client deletion
  const handleDeleteClient = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      await deleteClient(clientId);
    }
  };

  // Loading state
  if (isLoading && !isRefreshing) {
    return (
      <div className={`${themeClasses.bg.primary} min-h-screen flex items-center justify-center`}>
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className={themeClasses.text.secondary}>
            Loading client management system...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className={`${themeClasses.bg.primary} min-h-screen flex items-center justify-center`}>
        <Card
          title="Authentication Required"
          subtitle="Please log in to access the client management system"
          theme={theme}
          className="max-w-md"
        >
          <div className="text-center py-6">
            <FiAlertCircle className="text-4xl text-red-500 mx-auto mb-4" />
            <p className="mb-4">You need to be logged in to view this page.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${themeClasses.bg.primary} min-h-screen transition-colors duration-300`}>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Error Display */}
        {error && (
          <Card theme={theme} className="mb-6 border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="text-red-500" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                Dismiss
              </button>
            </div>
          </Card>
        )}
        {/* Header Section */}
        <header className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-2 ${themeClasses.text.primary}`}>
                Client Management System
              </h1>
              <p className={`text-sm md:text-base ${themeClasses.text.secondary}`}>
                Manage client profiles, analytics, and marketing campaigns
              </p>
            </div>
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${themeClasses.button.primary}`}
              >
                <FiPlus size={18} />
                <span className="hidden sm:inline">Create Client</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${themeClasses.button.secondary}`}
              >
                {isRefreshing ? (
                  <FaSpinner className="animate-spin" size={18} />
                ) : (
                  <FiRefreshCw size={18} />
                )}
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${themeClasses.button.success}`}
              >
                <FiDownload size={18} />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${themeClasses.button.secondary} lg:hidden`}
              >
                <FiFilter size={18} />
                {showFilters ? 'Hide' : 'Show'} Filters
              </button>
            </div>
          </div>
        </header>
        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex flex-wrap gap-2 border-b pb-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors capitalize whitespace-nowrap ${
                    activeTab === tab.id ? themeClasses.button.primary : themeClasses.button.secondary
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
        {/* Main Content */}
        <ResponsiveGrid
          sidebar={
            showFilters && (
              <Card title="Filters" theme={theme} className="sticky top-6">
                <ClientFilters
                  filters={dataFilters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={() => {
                    handleClearFilters();
                    clearAllFilters();
                  }}
                  hasActiveFilters={hasActiveFilters}
                  theme={theme}
                  filterOptions={filterOptions}
                />
              </Card>
            )
          }
          main={
            <div className="space-y-6">
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && dashboardData && (
                <>
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                      title="Total Clients"
                      value={dashboardData.summary?.total_clients || 0}
                      icon={FiUsers}
                      color="blue"
                      theme={theme}
                      trend={{
                        value: dashboardData.summary?.growth_rate
                          ? `${dashboardData.summary.growth_rate > 0 ? '+' : ''}${dashboardData.summary.growth_rate}%`
                          : '0%',
                        direction: dashboardData.summary?.growth_rate > 0 ? 'up' : 'down'
                      }}
                    />
                    <StatsCard
                      title="Active Clients"
                      value={dashboardData.summary?.active_clients || 0}
                      icon={FiUsers}
                      color="green"
                      theme={theme}
                    />
                    <StatsCard
                      title="At Risk"
                      value={dashboardData.summary?.at_risk_clients || 0}
                      icon={FiAlertCircle}
                      color="red"
                      theme={theme}
                    />
                    <StatsCard
                      title="Total Revenue"
                      value={`KES ${Math.round(dashboardData.summary?.revenue?.total || 0).toLocaleString()}`}
                      icon={FiCreditCard}
                      color="purple"
                      theme={theme}
                    />
                  </div>
                  {/* Dashboard Components */}
                  <Card title="Client Overview" theme={theme}>
                    <ClientDashboard
                      data={dashboardData}
                      theme={theme}
                      onFilterChange={handleFilterChange}
                    />
                  </Card>
                  {/* Alerts */}
                  {alerts.length > 0 && (
                    <Card title="System Alerts" theme={theme}>
                      <div className="space-y-3">
                        {alerts.slice(0, 5).map((alert, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg ${
                              alert.severity === 'high'
                                ? themeClasses.bg.danger
                                : themeClasses.bg.warning
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-sm mb-1">{alert.title}</p>
                                <p className="text-xs opacity-80">{alert.description}</p>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded ${
                                alert.severity === 'high'
                                  ? themeClasses.text.danger
                                  : themeClasses.text.warning
                              }`}>
                                {alert.severity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </>
              )}
              {/* Clients Tab */}
              {activeTab === 'clients' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Client List */}
                  <Card
                    title={`Clients (${filteredClients.length})`}
                    subtitle={filterSummary.length > 0 ? filterSummary.join(' • ') : 'All clients'}
                    actions={() => (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                          className={`p-2 rounded ${themeClasses.button.secondary}`}
                        >
                          {viewMode === 'grid' ? 'List View' : 'Grid View'}
                        </button>
                      </div>
                    )}
                    theme={theme}
                  >
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredClients.slice(0, 12).map((client) => (
                          <Card
                            key={client.id}
                            theme={theme}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleSelectClient(client)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`${themeClasses.bg.secondary} p-2 rounded-full`}>
                                <FiUser size={20} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{client.username}</h4>
                                <p className="text-sm opacity-75 truncate">{client.phone_display}</p>
                              </div>
                              <div className={`px-2 py-1 rounded text-xs ${
                                client.status === 'active'
                                  ? themeClasses.bg.success
                                  : themeClasses.bg.danger
                              }`}>
                                {client.status_display}
                              </div>
                            </div>
                            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <p className="opacity-75">Revenue</p>
                                <p className="font-medium">{client.lifetime_value_formatted}</p>
                              </div>
                              <div>
                                <p className="opacity-75">Risk</p>
                                <p className={`font-medium ${
                                  client.churn_risk_score >= 7 ? 'text-red-500' :
                                  client.churn_risk_score >= 4 ? 'text-yellow-500' :
                                  'text-green-500'
                                }`}>
                                  {client.churn_risk_score.toFixed(1)}
                                </p>
                              </div>
                              <div>
                                <p className="opacity-75">Tier</p>
                                <p className="font-medium">{client.tier_display}</p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <ClientList
                        clients={filteredClients}
                        selectedClient={selectedClient}
                        onSelectClient={handleSelectClient}
                        isLoading={isLoading}
                        pagination={pagination}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                        theme={theme}
                      />
                    )}
                  </Card>
                  {/* Client Details */}
                  {selectedClient && (
                    <Card title="Client Details" theme={theme}>
                      <div className="space-y-6">
                        {/* Client Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <h2 className="text-xl font-bold">{selectedClient.username}</h2>
                            <p className="text-sm opacity-75">
                              {formatPhoneNumber(selectedClient.phone_number)} • {selectedClient.connection_type_display}
                            </p>
                          </div>
                          <ClientActions
                            client={selectedClient}
                            onUpdate={updateClient}
                            onRefresh={handleRefresh}
                            theme={theme}
                          />
                        </div>
                        {/* Quick Metrics */}
                        <ClientMetrics client={selectedClient} theme={theme} />
                        {/* Tab Navigation for Client Details */}
                        <div className="border-b">
                          <div className="flex gap-2 overflow-x-auto">
                            {['overview', 'profile', 'analytics'].map((tab) => (
                              <button
                                key={tab}
                                onClick={() => setActiveTab(`client-${tab}`)}
                                className={`px-4 py-2 font-medium capitalize whitespace-nowrap ${
                                  activeTab === `client-${tab}`
                                    ? 'border-b-2 border-blue-500'
                                    : 'opacity-75 hover:opacity-100'
                                }`}
                              >
                                {tab}
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* Client Profile */}
                        <ClientProfile
                          client={selectedClient}
                          onUpdate={updateClient}
                          theme={theme}
                        />
                      </div>
                    </Card>
                  )}
                </div>
              )}
              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  {processedAnalytics && (
                    <>
                      {/* Performance Metrics */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {performanceMetrics && Object.entries(performanceMetrics).map(([key, value]) => (
                          <StatsCard
                            key={key}
                            title={key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            value={typeof value === 'number' ? `${value}%` : value}
                            color={
                              typeof value === 'string'
                                ? value === 'excellent' ? 'green' :
                                  value === 'good' ? 'blue' :
                                  value === 'needs_attention' ? 'yellow' : 'gray'
                                : value >= 70 ? 'green' :
                                  value >= 50 ? 'blue' : 'yellow'
                            }
                            theme={theme}
                          />
                        ))}
                      </div>
                      {/* Charts */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {processedAnalytics.charts && Object.entries(processedAnalytics.charts).map(([key, chartData]) => (
                          <AnalyticsChart
                            key={key}
                            data={chartData}
                            title={key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            type={key.includes('distribution') ? 'pie' : 'line'}
                            theme={theme}
                            height={300}
                          />
                        ))}
                      </div>
                      {/* Insights */}
                      {processedAnalytics.insights && processedAnalytics.insights.length > 0 && (
                        <Card title="Insights" theme={theme}>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {processedAnalytics.insights.map((insight, index) => (
                              <div
                                key={index}
                                className={`p-4 rounded-lg ${
                                  insight.type === 'success' ? themeClasses.bg.success :
                                  insight.type === 'warning' ? themeClasses.bg.warning :
                                  insight.type === 'danger' ? themeClasses.bg.danger :
                                  themeClasses.bg.info
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-2xl">{insight.icon}</span>
                                  <div>
                                    <h4 className="font-medium mb-1">{insight.title}</h4>
                                    <p className="text-sm opacity-90">{insight.message}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      )}
                    </>
                  )}
                </div>
              )}
              {/* Commissions Tab */}
              {activeTab === 'commissions' && (
                <CommissionTracker
                  marketerId={user?.id}
                  theme={theme}
                />
              )}
            </div>
          }
          sidebarWidth={showFilters ? '1/4' : '0'}
          gap={6}
          collapseAt="lg"
          className={!showFilters ? 'lg:!flex-row' : ''}
        />
      </div>
      {/* Create Client Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Client"
          theme={theme}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={createFormData.username}
                  onChange={handleFormChange}
                  className={themeClasses.input}
                  placeholder="Enter username"
                />
                {createErrors.username && <p className={themeClasses.text.danger}>{createErrors.username}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={createFormData.phone_number}
                  onChange={handleFormChange}
                  className={themeClasses.input}
                  placeholder="07XXXXXXXX"
                />
                {createErrors.phone_number && <p className={themeClasses.text.danger}>{createErrors.phone_number}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-2">Connection Type</label>
                <EnhancedSelect
                  value={createFormData.connection_type}
                  onChange={(value) => setCreateFormData(prev => ({ ...prev, connection_type: value }))}
                  options={[
                    { value: 'pppoe', label: 'PPPoE' },
                    { value: 'hotspot', label: 'Hotspot' },
                  ]}
                  theme={theme}
                />
                {createErrors.connection_type && <p className={themeClasses.text.danger}>{createErrors.connection_type}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className={themeClasses.button.secondary}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateClient}
                className={themeClasses.button.primary}
              >
                Create Client
              </button>
            </div>
          </div>
        </Modal>
      )}
      {/* Export Modal */}
      {showExportModal && (
        <Modal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          title="Export Data"
          theme={theme}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm opacity-75">Select export format:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleExport('csv')}
                className={themeClasses.button.secondary}
              >
                <div className="text-lg mb-2">📊</div>
                <div className="font-medium">CSV</div>
                <div className="text-xs opacity-75">Spreadsheet format</div>
              </button>
              <button
                onClick={() => handleExport('excel')}
                className={themeClasses.button.secondary}
              >
                <div className="text-lg mb-2">📈</div>
                <div className="font-medium">Excel</div>
                <div className="text-xs opacity-75">Microsoft Excel</div>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Subscribers;