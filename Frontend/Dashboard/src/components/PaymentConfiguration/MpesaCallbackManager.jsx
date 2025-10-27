


// // src/components/PaymentConfiguration/MpesaCallbackManager.jsx
// import React, { useState, useCallback, useMemo, useEffect } from 'react';
// import {
//   IoAddCircleOutline as AddIcon,
//   IoSaveOutline as SaveIcon,
//   IoPencilOutline as EditIcon,
//   IoTrashOutline as DeleteIcon,
//   IoSearchOutline as SearchIcon,
//   IoServerOutline as RouterIcon,
//   IoShieldCheckmarkOutline as SecurityIcon,
//   IoStatsChartOutline as AnalyticsIcon,
//   IoReloadOutline as RefreshIcon,
//   IoWarningOutline as WarningIcon,
//   IoEyeOutline as EyeIcon,
//   IoEyeOffOutline as EyeOffIcon,
//   IoTrendingUpOutline as TrendIcon,
//   IoTimeOutline as TimeIcon,
// } from 'react-icons/io5';
// import { FiChevronUp, FiChevronDown, FiCopy, FiPlayCircle } from 'react-icons/fi';
// import { toast } from 'react-toastify';
// import { Puff } from 'react-loading-icons';
// import api from '../../api';
// import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
// import { debounce } from 'lodash';

// const MpesaCallbackManager = ({ routers, events, securityProfiles, gatewayId, initialStats, initialCallbacks, methodType }) => {
//   const [callbacks, setCallbacks] = useState(initialCallbacks || []);
//   const [stats, setStats] = useState(initialStats || null);
//   const [loading, setLoading] = useState(false);
//   const [newCallback, setNewCallback] = useState({
//     router: routers[0]?.id || '',
//     event: events[0]?.name || '',
//     callback_url: '',
//     security_level: 'medium',
//     security_profile: securityProfiles[0]?.id || '',
//     is_active: true,
//     retry_enabled: true,
//     max_retries: 3,
//     timeout_seconds: 30,
//   });
//   const [editingId, setEditingId] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [activeFilter, setActiveFilter] = useState('all');
//   const [selectedRouter, setSelectedRouter] = useState('all');
//   const [showTestModal, setShowTestModal] = useState(false);
//   const [testConfig, setTestConfig] = useState({ configuration_id: '', test_payload: '{}' });
//   const [showSecrets, setShowSecrets] = useState(false);
//   const [showAnalytics, setShowAnalytics] = useState(true);
//   const [sortConfig, setSortConfig] = useState({ key: 'router', direction: 'ascending' });
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;
//   const [validationErrors, setValidationErrors] = useState({});

//   // Initialize data
//   useEffect(() => {
//     setCallbacks(initialCallbacks || []);
//     setStats(initialStats || null);
//   }, [initialCallbacks, initialStats]);

//   // Load data with caching
//   const loadData = async () => {
//     try {
//       setLoading(true);
//       const [callbacksResponse, statsResponse] = await Promise.all([
//         api.get('/api/payments/mpesa-callbacks/configurations/'),
//         api.get('/api/payments/mpesa-callbacks/analytics/'),
//       ]);
//       setCallbacks(callbacksResponse.data.filter(cb => cb.gateway === gatewayId));
//       setStats(statsResponse.data);
//     } catch (error) {
//       console.error('Failed to load callback data:', error);
//       toast.error('Failed to load callback configurations');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Debounced search
//   const debouncedSearch = useCallback(
//     debounce((value) => setSearchTerm(value), 300),
//     []
//   );

//   // Handle input changes
//   const handleChange = useCallback((e, field) => {
//     const { value } = e.target;
//     setNewCallback(prev => ({ ...prev, [field]: value }));
//     // Inline validation
//     setValidationErrors(prev => ({
//       ...prev,
//       [field]: value ? '' : 'This field is required',
//     }));
//   }, []);

//   const handleCheckboxChange = useCallback((field, value) => {
//     setNewCallback(prev => ({ ...prev, [field]: value }));
//   }, []);

//   // Add or update callback
//   const addOrUpdateCallback = useCallback(async () => {
//     if (!newCallback.router || !newCallback.event || !newCallback.callback_url) {
//       toast.error('Please fill in all required fields');
//       setValidationErrors({
//         router: !newCallback.router ? 'Router is required' : '',
//         event: !newCallback.event ? 'Event is required' : '',
//         callback_url: !newCallback.callback_url ? 'Callback URL is required' : '',
//       });
//       return;
//     }

//     try {
//       setLoading(true);
//       const payload = {
//         router: newCallback.router,
//         event: newCallback.event,
//         callback_url: newCallback.callback_url,
//         security_level: newCallback.security_level,
//         security_profile: newCallback.security_profile || null,
//         is_active: newCallback.is_active,
//         retry_enabled: newCallback.retry_enabled,
//         max_retries: parseInt(newCallback.max_retries),
//         timeout_seconds: parseInt(newCallback.timeout_seconds),
//         gateway: gatewayId,
//       };

//       let updatedCallbacks;
//       if (editingId) {
//         await api.put(`/api/payments/mpesa-callbacks/configurations/${editingId}/`, payload);
//         updatedCallbacks = callbacks.map(cb =>
//           cb.id === editingId ? { ...cb, ...payload } : cb
//         );
//         toast.success('Callback updated successfully');
//       } else {
//         const response = await api.post('/api/payments/mpesa-callbacks/configurations/', payload);
//         updatedCallbacks = [...callbacks, response.data];
//         toast.success('Callback added successfully');
//       }

//       setCallbacks(updatedCallbacks);
//       setNewCallback({
//         router: routers[0]?.id || '',
//         event: events[0]?.name || '',
//         callback_url: '',
//         security_level: 'medium',
//         security_profile: securityProfiles[0]?.id || '',
//         is_active: true,
//         retry_enabled: true,
//         max_retries: 3,
//         timeout_seconds: 30,
//       });
//       setEditingId(null);
//       setValidationErrors({});
//     } catch (error) {
//       console.error('Error saving callback:', error);
//       toast.error('Failed to save callback configuration');
//     } finally {
//       setLoading(false);
//     }
//   }, [newCallback, editingId, gatewayId, callbacks, routers, events, securityProfiles]);

//   // Edit callback
//   const editCallback = useCallback((callback) => {
//     setEditingId(callback.id);
//     setNewCallback({
//       router: callback.router,
//       event: callback.event,
//       callback_url: callback.callback_url,
//       security_level: callback.security_level,
//       security_profile: callback.security_profile || '',
//       is_active: callback.is_active,
//       retry_enabled: callback.retry_enabled,
//       max_retries: callback.max_retries,
//       timeout_seconds: callback.timeout_seconds,
//     });
//   }, []);

//   // Delete callback
//   const deleteCallback = useCallback(async (id) => {
//     try {
//       setLoading(true);
//       await api.delete(`/api/payments/mpesa-callbacks/configurations/${id}/`);
//       setCallbacks(callbacks.filter(cb => cb.id !== id));
//       toast.success('Callback deleted successfully');
//     } catch (error) {
//       console.error('Error deleting callback:', error);
//       toast.error('Failed to delete callback');
//     } finally {
//       setLoading(false);
//     }
//   }, [callbacks]);

//   // Toggle callback status
//   const toggleCallbackStatus = useCallback(async (callback) => {
//     try {
//       setLoading(true);
//       const updatedCallback = { ...callback, is_active: !callback.is_active };
//       await api.put(`/api/payments/mpesa-callbacks/configurations/${callback.id}/`, updatedCallback);
//       setCallbacks(callbacks.map(cb => (cb.id === callback.id ? updatedCallback : cb)));
//       toast.success(`Callback ${callback.is_active ? 'deactivated' : 'activated'}`);
//     } catch (error) {
//       console.error('Error toggling callback status:', error);
//       toast.error('Failed to toggle callback status');
//     } finally {
//       setLoading(false);
//     }
//   }, [callbacks]);

//   // Test callback
//   const testCallback = useCallback((callback) => {
//     setTestConfig({
//       configuration_id: callback.id,
//       test_payload: JSON.stringify(
//         {
//           TransactionType: methodType === 'mpesa_paybill' ? 'Pay Bill' : 'CustomerBuyGoodsOnline',
//           TransID: 'TEST123456789',
//           TransTime: new Date().toISOString(),
//           TransAmount: '100.00',
//           BusinessShortCode: methodType === 'mpesa_paybill' ? '123456' : '654321',
//           BillRefNumber: methodType === 'mpesa_paybill' ? 'TEST001' : '',
//           InvoiceNumber: '',
//           OrgAccountBalance: '5000.00',
//           ThirdPartyTransID: '',
//           MSISDN: '254712345678',
//           FirstName: 'Test',
//           MiddleName: 'User',
//           LastName: 'Callback',
//         },
//         null,
//         2
//       ),
//     });
//     setShowTestModal(true);
//   }, [methodType]);

//   const runTest = useCallback(async () => {
//     try {
//       setLoading(true);
//       const payload = {
//         configuration_id: testConfig.configuration_id,
//         test_payload: JSON.parse(testConfig.test_payload),
//         validate_security: true,
//       };
//       const response = await api.post('/api/payments/mpesa-callbacks/test/', payload);
//       if (response.data.success) {
//         toast.success('Test completed successfully!');
//       } else {
//         toast.error(`Test failed: ${response.data.message}`);
//       }
//       setShowTestModal(false);
//     } catch (error) {
//       console.error('Error testing callback:', error);
//       toast.error('Failed to run test');
//     } finally {
//       setLoading(false);
//     }
//   }, [testConfig]);

//   const requestSort = (key) => {
//     let direction = 'ascending';
//     if (sortConfig.key === key && sortConfig.direction === 'ascending') {
//       direction = 'descending';
//     }
//     setSortConfig({ key, direction });
//   };

//   // Filtering and sorting
//   const filteredCallbacks = useMemo(() => {
//     return callbacks.filter(callback => {
//       const matchesSearch =
//         callback.callback_url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         callback.event_details?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         callback.router_details?.name?.toLowerCase().includes(searchTerm.toLowerCase());

//       const matchesFilter =
//         activeFilter === 'all' ||
//         (activeFilter === 'active' && callback.is_active) ||
//         (activeFilter === 'inactive' && !callback.is_active);

//       const matchesRouter =
//         selectedRouter === 'all' || String(callback.router) === String(selectedRouter);

//       return matchesSearch && matchesFilter && matchesRouter;
//     });
//   }, [callbacks, searchTerm, activeFilter, selectedRouter]);

//   const sortedCallbacks = useMemo(() => {
//     let sortableItems = [...filteredCallbacks];
//     if (sortConfig !== null) {
//       sortableItems.sort((a, b) => {
//         const aValue = a[sortConfig.key] || '';
//         const bValue = b[sortConfig.key] || '';
//         if (aValue < bValue) {
//           return sortConfig.direction === 'ascending' ? -1 : 1;
//         }
//         if (aValue > bValue) {
//           return sortConfig.direction === 'ascending' ? 1 : -1;
//         }
//         return 0;
//       });
//     }
//     return sortableItems;
//   }, [filteredCallbacks, sortConfig]);

//   const paginatedCallbacks = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;
//     return sortedCallbacks.slice(start, start + itemsPerPage);
//   }, [sortedCallbacks, currentPage]);

//   const getRouterName = (routerId) => {
//     const router = routers.find(r => r.id === routerId);
//     return router ? router.name : 'Unknown Router';
//   };

//   const getEventName = (eventKey) => {
//     const event = events.find(e => e.name === eventKey);
//     return event ? event.name : 'Unknown Event';
//   };

//   // Analytics chart data (placeholder)
//   const chartData = useMemo(() => {
//     if (!stats || !stats.response_times) return [];
//     return stats.response_times.history?.map((entry, index) => ({
//       name: `T${index + 1}`,
//       responseTime: entry.duration,
//     })) || [];
//   }, [stats]);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center p-8 bg-white rounded-xl shadow-sm">
//         <div className="text-center">
//           <Puff stroke="#3B82F6" className="w-12 h-12 mx-auto" />
//           <p className="mt-4 text-gray-600 font-medium">Loading callback configurations...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 bg-white p-6 rounded-xl shadow-md border border-gray-200" role="region" aria-label="M-Pesa Callback Manager">
//       {/* Header with Filters - Made more compact and modern */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
//         <h3 className="text-lg font-semibold text-gray-900 flex items-center">
//           <AnalyticsIcon className="mr-2 text-green-600" size={24} />
//           M-Pesa {methodType === 'mpesa_paybill' ? 'Paybill' : 'Till'} Callback Manager
//         </h3>
//         <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
//           <div className="relative flex-grow">
//             <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//             <input
//               type="text"
//               placeholder="Search by URL, event, or router..."
//               onChange={(e) => debouncedSearch(e.target.value)}
//               className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full transition-all"
//               aria-label="Search callbacks"
//             />
//           </div>
//           <select
//             value={activeFilter}
//             onChange={(e) => setActiveFilter(e.target.value)}
//             className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
//             aria-label="Filter by status"
//           >
//             <option value="all">All Statuses</option>
//             <option value="active">Active Only</option>
//             <option value="inactive">Inactive Only</option>
//           </select>
//           <select
//             value={selectedRouter}
//             onChange={(e) => setSelectedRouter(e.target.value)}
//             className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
//             aria-label="Filter by router"
//           >
//             <option value="all">All Routers</option>
//             {routers.map(router => (
//               <option key={router.id} value={router.id}>{router.name}</option>
//             ))}
//           </select>
//           <button
//             onClick={loadData}
//             className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none flex items-center transition-all"
//             aria-label="Refresh callback data"
//           >
//             <RefreshIcon className="mr-2" size={18} />
//             Refresh
//           </button>
//         </div>
//       </div>

//       {/* Form for Add/Edit - Made collapsible for "separate page" feel within the component */}
//       <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200">
//         <button
//           onClick={() => setShowAnalytics(!showAnalytics)} // Reusing showAnalytics for toggle, but could add new state if needed
//           className="w-full flex justify-between items-center text-left text-md font-semibold text-gray-900 mb-4 hover:text-green-600 transition-colors"
//         >
//           {editingId ? 'Edit Existing Callback' : 'Add New Callback Configuration'}
//           {showAnalytics ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
//         </button>
//         {showAnalytics && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Router <span className="text-red-500">*</span>
//               </label>
//               <select
//                 value={newCallback.router}
//                 onChange={(e) => handleChange(e, 'router')}
//                 className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
//                 aria-label="Select router"
//               >
//                 <option value="">Select Router</option>
//                 {routers.map(router => (
//                   <option key={router.id} value={router.id}>{router.name}</option>
//                 ))}
//               </select>
//               {validationErrors.router && <p className="text-red-500 text-xs mt-1">{validationErrors.router}</p>}
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Event <span className="text-red-500">*</span>
//               </label>
//               <select
//                 value={newCallback.event}
//                 onChange={(e) => handleChange(e, 'event')}
//                 className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
//                 aria-label="Select event"
//               >
//                 <option value="">Select Event</option>
//                 {events.map(event => (
//                   <option key={event.name} value={event.name}>
//                     {event.name} {methodType === 'mpesa_paybill' && event.name === 'payment_success' ? '(Paybill)' : event.name === 'payment_success' ? '(Till)' : ''}
//                   </option>
//                 ))}
//               </select>
//               {validationErrors.event && <p className="text-red-500 text-xs mt-1">{validationErrors.event}</p>}
//             </div>
//             <div className="lg:col-span-2">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Callback URL <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   value={newCallback.callback_url}
//                   onChange={(e) => handleChange(e, 'callback_url')}
//                   className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
//                   placeholder="https://your-callback-url.com"
//                   aria-label="Callback URL"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => {
//                     const generatedUrl = `https://api.yourdomain.com/callbacks/${gatewayId}/${newCallback.event || 'event'}`;
//                     setNewCallback(prev => ({ ...prev, callback_url: generatedUrl }));
//                   }}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 hover:text-green-800 transition-colors"
//                   aria-label="Generate callback URL"
//                 >
//                   <FiPlayCircle size={18} />
//                 </button>
//               </div>
//               {validationErrors.callback_url && <p className="text-red-500 text-xs mt-1">{validationErrors.callback_url}</p>}
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Security Level
//               </label>
//               <select
//                 value={newCallback.security_level}
//                 onChange={(e) => handleChange(e, 'security_level')}
//                 className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
//                 aria-label="Select security level"
//               >
//                 <option value="low">Low</option>
//                 <option value="medium">Medium</option>
//                 <option value="high">High</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Security Profile
//               </label>
//               <select
//                 value={newCallback.security_profile}
//                 onChange={(e) => handleChange(e, 'security_profile')}
//                 className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
//                 aria-label="Select security profile"
//               >
//                 <option value="">None</option>
//                 {securityProfiles.map(profile => (
//                   <option key={profile.id} value={profile.id}>{profile.name}</option>
//                 ))}
//               </select>
//             </div>
//             <div className="flex items-center gap-6 lg:col-span-2">
//               <label className="flex items-center">
//                 <input
//                   type="checkbox"
//                   checked={newCallback.is_active}
//                   onChange={(e) => handleCheckboxChange('is_active', e.target.checked)}
//                   className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded transition-colors"
//                   aria-label="Enable callback"
//                 />
//                 <span className="ml-2 text-sm text-gray-700">Active</span>
//               </label>
//               <label className="flex items-center">
//                 <input
//                   type="checkbox"
//                   checked={newCallback.retry_enabled}
//                   onChange={(e) => handleCheckboxChange('retry_enabled', e.target.checked)}
//                   className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded transition-colors"
//                   aria-label="Enable retries"
//                 />
//                 <span className="ml-2 text-sm text-gray-700">Enable Retries</span>
//               </label>
//               <div className="flex gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Max Retries</label>
//                   <input
//                     type="number"
//                     value={newCallback.max_retries}
//                     onChange={(e) => handleChange(e, 'max_retries')}
//                     className="w-20 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
//                     min="1"
//                     max="5"
//                     aria-label="Maximum retries"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Timeout (s)</label>
//                   <input
//                     type="number"
//                     value={newCallback.timeout_seconds}
//                     onChange={(e) => handleChange(e, 'timeout_seconds')}
//                     className="w-20 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
//                     min="10"
//                     max="120"
//                     aria-label="Timeout in seconds"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//         <div className="mt-6 flex justify-end">
//           <button
//             onClick={addOrUpdateCallback}
//             className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none flex items-center transition-all shadow-sm"
//             disabled={loading}
//             aria-label={editingId ? 'Update callback' : 'Add callback'}
//           >
//             {loading ? (
//               <Puff stroke="#fff" className="w-5 h-5 mr-2" />
//             ) : editingId ? (
//               <SaveIcon className="mr-2" size={18} />
//             ) : (
//               <AddIcon className="mr-2" size={18} />
//             )}
//             {editingId ? 'Update Callback' : 'Add Callback'}
//           </button>
//         </div>
//       </div>

//       {/* Table - Improved responsiveness and styling */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
//           <h4 className="text-md font-semibold text-gray-900">
//             Configured Callbacks ({filteredCallbacks.length})
//           </h4>
//           <button
//             onClick={() => setShowAnalytics(!showAnalytics)}
//             className="text-green-600 hover:text-green-800 flex items-center transition-colors"
//             aria-label={showAnalytics ? 'Hide analytics' : 'Show analytics'}
//           >
//             <AnalyticsIcon className="mr-2" size={18} />
//             {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
//           </button>
//         </div>
//         {filteredCallbacks.length === 0 ? (
//           <div className="text-center py-12 text-gray-500 bg-gray-50">
//             <RouterIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
//             <p className="text-lg font-medium">No callback configurations found</p>
//             <p className="text-sm mt-1">Add your first configuration using the form above</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th
//                     onClick={() => requestSort('router')}
//                     className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors"
//                     aria-sort={sortConfig.key === 'router' ? sortConfig.direction : 'none'}
//                   >
//                     Router{' '}
//                     {sortConfig.key === 'router' && (
//                       sortConfig.direction === 'ascending' ? <FiChevronUp className="inline" /> : <FiChevronDown className="inline" />
//                     )}
//                   </th>
//                   <th
//                     onClick={() => requestSort('event')}
//                     className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors"
//                     aria-sort={sortConfig.key === 'event' ? sortConfig.direction : 'none'}
//                   >
//                     Event{' '}
//                     {sortConfig.key === 'event' && (
//                       sortConfig.direction === 'ascending' ? <FiChevronUp className="inline" /> : <FiChevronDown className="inline" />
//                     )}
//                   </th>
//                   <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
//                   <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Security</th>
//                   <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                   <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {paginatedCallbacks.map((callback) => (
//                   <tr key={callback.id} className="hover:bg-gray-50 transition-colors duration-200">
//                     <td className="px-4 md:px-6 py-4 text-sm text-gray-900">{getRouterName(callback.router)}</td>
//                     <td className="px-4 md:px-6 py-4 text-sm text-gray-900">
//                       {getEventName(callback.event)}
//                       {methodType === 'mpesa_paybill' && callback.event === 'payment_success' ? ' (Paybill)' : callback.event === 'payment_success' ? ' (Till)' : ''}
//                     </td>
//                     <td className="px-4 md:px-6 py-4 text-sm text-blue-600 break-all">
//                       <div className="flex items-center gap-2">
//                         {showSecrets ? callback.callback_url : '••••••••'}
//                         <button
//                           onClick={() => setShowSecrets(!showSecrets)}
//                           className="text-gray-500 hover:text-gray-700 transition-colors"
//                           aria-label={showSecrets ? 'Hide URL' : 'Show URL'}
//                         >
//                           {showSecrets ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
//                         </button>
//                         <button
//                           onClick={() => {
//                             navigator.clipboard.writeText(callback.callback_url);
//                             toast.info('URL copied to clipboard');
//                           }}
//                           className="text-gray-500 hover:text-gray-700 transition-colors"
//                           aria-label="Copy URL"
//                         >
//                           <FiCopy size={16} />
//                         </button>
//                       </div>
//                     </td>
//                     <td className="px-4 md:px-6 py-4">
//                       <span
//                         className={`px-3 py-1 text-xs font-medium rounded-full ${
//                           callback.security_level === 'high'
//                             ? 'bg-green-100 text-green-800'
//                             : callback.security_level === 'medium'
//                             ? 'bg-blue-100 text-blue-800'
//                             : 'bg-yellow-100 text-yellow-800'
//                         }`}
//                       >
//                         {callback.security_level.charAt(0).toUpperCase() + callback.security_level.slice(1)}
//                       </span>
//                     </td>
//                     <td className="px-4 md:px-6 py-4">
//                       <span
//                         className={`px-3 py-1 text-xs font-medium rounded-full ${
//                           callback.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//                         }`}
//                       >
//                         {callback.is_active ? 'Active' : 'Inactive'}
//                       </span>
//                     </td>
//                     <td className="px-4 md:px-6 py-4 flex items-center gap-3">
//                       <button
//                         onClick={() => editCallback(callback)}
//                         className="text-blue-600 hover:text-blue-800 transition-colors"
//                         title="Edit callback"
//                         aria-label="Edit callback"
//                       >
//                         <EditIcon className="w-5 h-5" />
//                       </button>
//                       <button
//                         onClick={() => toggleCallbackStatus(callback)}
//                         className="text-yellow-600 hover:text-yellow-800 transition-colors"
//                         title={callback.is_active ? 'Deactivate callback' : 'Activate callback'}
//                         aria-label={callback.is_active ? 'Deactivate callback' : 'Activate callback'}
//                       >
//                         {callback.is_active ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
//                       </button>
//                       <button
//                         onClick={() => deleteCallback(callback.id)}
//                         className="text-red-600 hover:text-red-800 transition-colors"
//                         title="Delete callback"
//                         aria-label="Delete callback"
//                       >
//                         <DeleteIcon className="w-5 h-5" />
//                       </button>
//                       <button
//                         onClick={() => testCallback(callback)}
//                         className="text-green-600 hover:text-green-800 transition-colors"
//                         title="Test callback"
//                         aria-label="Test callback"
//                       >
//                         <FiPlayCircle className="w-5 h-5" />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//             {/* Pagination - Improved styling */}
//             <div className="flex justify-center items-center gap-4 py-4 bg-gray-50">
//               <button
//                 disabled={currentPage === 1}
//                 onClick={() => setCurrentPage(prev => prev - 1)}
//                 className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                 aria-label="Previous page"
//               >
//                 Previous
//               </button>
//               <span className="text-sm text-gray-600 font-medium">
//                 Page {currentPage} of {Math.ceil(sortedCallbacks.length / itemsPerPage)}
//               </span>
//               <button
//                 disabled={currentPage === Math.ceil(sortedCallbacks.length / itemsPerPage)}
//                 onClick={() => setCurrentPage(prev => prev + 1)}
//                 className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                 aria-label="Next page"
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Analytics Section - Made toggleable and more visual */}
//       {showAnalytics && stats && (
//         <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm border border-gray-200 animate-fadeIn">
//           <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
//             <AnalyticsIcon className="mr-2 text-blue-600" size={20} />
//             Real-Time Callback Analytics
//           </h4>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//             <div className="p-4 bg-white rounded-lg shadow-sm border border-blue-100">
//               <p className="text-sm text-blue-600 font-medium flex items-center"><TrendIcon className="mr-1" /> Success Rate</p>
//               <p className="text-2xl font-bold text-blue-800">{stats.success_rate}%</p>
//             </div>
//             <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
//               <p className="text-sm text-gray-600 font-medium flex items-center"><AnalyticsIcon className="mr-1" /> Total Callbacks</p>
//               <p className="text-2xl font-bold text-gray-800">{stats.total_callbacks}</p>
//             </div>
//             <div className="p-4 bg-white rounded-lg shadow-sm border border-green-100">
//               <p className="text-sm text-green-600 font-medium flex items-center"><SecurityIcon className="mr-1" /> Successful</p>
//               <p className="text-2xl font-bold text-green-800">{stats.successful_callbacks}</p>
//             </div>
//           </div>
//           <div className="mt-4">
//             <p className="text-sm font-medium text-gray-700 mb-2 flex items-center"><TimeIcon className="mr-1" /> Response Time Trend</p>
//             <div className="h-64 bg-white rounded-lg p-4 shadow-inner">
//               <ResponsiveContainer width="100%" height="100%">
//                 <LineChart data={chartData}>
//                   <XAxis dataKey="name" stroke="#6B7280" />
//                   <YAxis stroke="#6B7280" />
//                   <Tooltip />
//                   <Line type="monotone" dataKey="responseTime" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Test Modal - Improved with formatting button */}
//       {showTestModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl p-6 w-full max-w-3xl mx-4 shadow-2xl">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//               <FiPlayCircle className="mr-2 text-green-600" size={20} />
//               Test Callback Configuration
//             </h3>
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Test Payload (JSON)
//               </label>
//               <textarea
//                 value={testConfig.test_payload}
//                 onChange={(e) => setTestConfig(prev => ({ ...prev, test_payload: e.target.value }))}
//                 rows={12}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-y"
//                 placeholder="Enter test payload in JSON format"
//                 aria-label="Test payload"
//               />
//               {testConfig.test_payload && (
//                 <button
//                   onClick={() => {
//                     try {
//                       const formatted = JSON.stringify(JSON.parse(testConfig.test_payload), null, 2);
//                       setTestConfig(prev => ({ ...prev, test_payload: formatted }));
//                       toast.info('JSON formatted successfully');
//                     } catch {
//                       toast.error('Invalid JSON format - please check your payload');
//                     }
//                   }}
//                   className="mt-2 px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm"
//                   aria-label="Format JSON"
//                 >
//                   Format JSON
//                 </button>
//               )}
//             </div>
//             <div className="flex justify-end space-x-4">
//               <button
//                 onClick={() => setShowTestModal(false)}
//                 className="px-6 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 transition-colors shadow-sm"
//                 aria-label="Cancel test"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={runTest}
//                 className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center transition-colors shadow-sm"
//                 disabled={loading}
//                 aria-label="Run test"
//               >
//                 {loading ? <Puff stroke="#fff" className="w-5 h-5 mr-2" /> : <FiPlayCircle className="w-5 h-5 mr-2" />}
//                 Run Test
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MpesaCallbackManager;






// import React, { useState, useCallback, useMemo, useEffect } from 'react';
// import {
//   IoAddCircleOutline as AddIcon,
//   IoSaveOutline as SaveIcon,
//   IoPencilOutline as EditIcon,
//   IoTrashOutline as DeleteIcon,
//   IoSearchOutline as SearchIcon,
//   IoServerOutline as RouterIcon,
//   IoShieldCheckmarkOutline as SecurityIcon,
//   IoStatsChartOutline as AnalyticsIcon,
//   IoReloadOutline as RefreshIcon,
//   IoWarningOutline as WarningIcon,
//   IoEyeOutline as EyeIcon,
//   IoEyeOffOutline as EyeOffIcon,
//   IoTrendingUpOutline as TrendIcon,
//   IoTimeOutline as TimeIcon,
// } from 'react-icons/io5';
// import { FiChevronUp, FiChevronDown, FiCopy, FiPlayCircle } from 'react-icons/fi';
// import { toast } from 'react-toastify';
// import { Puff } from 'react-loading-icons';
// import api from '../../api';
// import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
// import { debounce } from 'lodash';

// const MpesaCallbackManager = ({ 
//   routers, 
//   events, 
//   securityProfiles, 
//   gatewayId, 
//   initialStats, 
//   initialCallbacks, 
//   methodType,
//   theme = 'light' 
// }) => {
//   // Theme-based CSS classes
//   const containerClass = theme === 'dark'
//     ? 'bg-gray-800/80 backdrop-blur-md border border-gray-700'
//     : 'bg-white border border-gray-200';

//   const headerClass = theme === 'dark'
//     ? 'bg-gradient-to-r from-green-900/50 to-emerald-900/50'
//     : 'bg-gradient-to-r from-green-50 to-emerald-50';

//   const inputClass = theme === 'dark'
//     ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500'
//     : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500';

//   const buttonPrimaryClass = theme === 'dark'
//     ? 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 text-white'
//     : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 text-white';

//   const buttonSecondaryClass = theme === 'dark'
//     ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 focus:ring-2 focus:ring-gray-500'
//     : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500';

//   const tableHeaderClass = theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50';
//   const tableRowClass = theme === 'dark' ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50';
//   const tableDividerClass = theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200';

//   const [callbacks, setCallbacks] = useState(initialCallbacks || []);
//   const [stats, setStats] = useState(initialStats || null);
//   const [loading, setLoading] = useState(false);
//   const [newCallback, setNewCallback] = useState({
//     router: routers[0]?.id || '',
//     event: events[0]?.name || '',
//     callback_url: '',
//     security_level: 'medium',
//     security_profile: securityProfiles[0]?.id || '',
//     is_active: true,
//     retry_enabled: true,
//     max_retries: 3,
//     timeout_seconds: 30,
//   });
//   const [editingId, setEditingId] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [activeFilter, setActiveFilter] = useState('all');
//   const [selectedRouter, setSelectedRouter] = useState('all');
//   const [showTestModal, setShowTestModal] = useState(false);
//   const [testConfig, setTestConfig] = useState({ configuration_id: '', test_payload: '{}' });
//   const [showSecrets, setShowSecrets] = useState(false);
//   const [showAnalytics, setShowAnalytics] = useState(true);
//   const [sortConfig, setSortConfig] = useState({ key: 'router', direction: 'ascending' });
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;
//   const [validationErrors, setValidationErrors] = useState({});

//   // Initialize data
//   useEffect(() => {
//     setCallbacks(initialCallbacks || []);
//     setStats(initialStats || null);
//   }, [initialCallbacks, initialStats]);

//   // Load data with caching
//   const loadData = async () => {
//     try {
//       setLoading(true);
//       const [callbacksResponse, statsResponse] = await Promise.all([
//         api.get('/api/payments/mpesa-callbacks/configurations/'),
//         api.get('/api/payments/mpesa-callbacks/analytics/'),
//       ]);
//       setCallbacks(callbacksResponse.data.filter(cb => cb.gateway === gatewayId));
//       setStats(statsResponse.data);
//     } catch (error) {
//       console.error('Failed to load callback data:', error);
//       toast.error('Failed to load callback configurations');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Debounced search
//   const debouncedSearch = useCallback(
//     debounce((value) => setSearchTerm(value), 300),
//     []
//   );

//   // Handle input changes
//   const handleChange = useCallback((e, field) => {
//     const { value } = e.target;
//     setNewCallback(prev => ({ ...prev, [field]: value }));
//     // Inline validation
//     setValidationErrors(prev => ({
//       ...prev,
//       [field]: value ? '' : 'This field is required',
//     }));
//   }, []);

//   const handleCheckboxChange = useCallback((field, value) => {
//     setNewCallback(prev => ({ ...prev, [field]: value }));
//   }, []);

//   // Add or update callback
//   const addOrUpdateCallback = useCallback(async () => {
//     if (!newCallback.router || !newCallback.event || !newCallback.callback_url) {
//       toast.error('Please fill in all required fields');
//       setValidationErrors({
//         router: !newCallback.router ? 'Router is required' : '',
//         event: !newCallback.event ? 'Event is required' : '',
//         callback_url: !newCallback.callback_url ? 'Callback URL is required' : '',
//       });
//       return;
//     }

//     try {
//       setLoading(true);
//       const payload = {
//         router: newCallback.router,
//         event: newCallback.event,
//         callback_url: newCallback.callback_url,
//         security_level: newCallback.security_level,
//         security_profile: newCallback.security_profile || null,
//         is_active: newCallback.is_active,
//         retry_enabled: newCallback.retry_enabled,
//         max_retries: parseInt(newCallback.max_retries),
//         timeout_seconds: parseInt(newCallback.timeout_seconds),
//         gateway: gatewayId,
//       };

//       let updatedCallbacks;
//       if (editingId) {
//         await api.put(`/api/payments/mpesa-callbacks/configurations/${editingId}/`, payload);
//         updatedCallbacks = callbacks.map(cb =>
//           cb.id === editingId ? { ...cb, ...payload } : cb
//         );
//         toast.success('Callback updated successfully');
//       } else {
//         const response = await api.post('/api/payments/mpesa-callbacks/configurations/', payload);
//         updatedCallbacks = [...callbacks, response.data];
//         toast.success('Callback added successfully');
//       }

//       setCallbacks(updatedCallbacks);
//       setNewCallback({
//         router: routers[0]?.id || '',
//         event: events[0]?.name || '',
//         callback_url: '',
//         security_level: 'medium',
//         security_profile: securityProfiles[0]?.id || '',
//         is_active: true,
//         retry_enabled: true,
//         max_retries: 3,
//         timeout_seconds: 30,
//       });
//       setEditingId(null);
//       setValidationErrors({});
//     } catch (error) {
//       console.error('Error saving callback:', error);
//       toast.error('Failed to save callback configuration');
//     } finally {
//       setLoading(false);
//     }
//   }, [newCallback, editingId, gatewayId, callbacks, routers, events, securityProfiles]);

//   // Edit callback
//   const editCallback = useCallback((callback) => {
//     setEditingId(callback.id);
//     setNewCallback({
//       router: callback.router,
//       event: callback.event,
//       callback_url: callback.callback_url,
//       security_level: callback.security_level,
//       security_profile: callback.security_profile || '',
//       is_active: callback.is_active,
//       retry_enabled: callback.retry_enabled,
//       max_retries: callback.max_retries,
//       timeout_seconds: callback.timeout_seconds,
//     });
//   }, []);

//   // Delete callback
//   const deleteCallback = useCallback(async (id) => {
//     try {
//       setLoading(true);
//       await api.delete(`/api/payments/mpesa-callbacks/configurations/${id}/`);
//       setCallbacks(callbacks.filter(cb => cb.id !== id));
//       toast.success('Callback deleted successfully');
//     } catch (error) {
//       console.error('Error deleting callback:', error);
//       toast.error('Failed to delete callback');
//     } finally {
//       setLoading(false);
//     }
//   }, [callbacks]);

//   // Toggle callback status
//   const toggleCallbackStatus = useCallback(async (callback) => {
//     try {
//       setLoading(true);
//       const updatedCallback = { ...callback, is_active: !callback.is_active };
//       await api.put(`/api/payments/mpesa-callbacks/configurations/${callback.id}/`, updatedCallback);
//       setCallbacks(callbacks.map(cb => (cb.id === callback.id ? updatedCallback : cb)));
//       toast.success(`Callback ${callback.is_active ? 'deactivated' : 'activated'}`);
//     } catch (error) {
//       console.error('Error toggling callback status:', error);
//       toast.error('Failed to toggle callback status');
//     } finally {
//       setLoading(false);
//     }
//   }, [callbacks]);

//   // Test callback
//   const testCallback = useCallback((callback) => {
//     setTestConfig({
//       configuration_id: callback.id,
//       test_payload: JSON.stringify(
//         {
//           TransactionType: methodType === 'mpesa_paybill' ? 'Pay Bill' : 'CustomerBuyGoodsOnline',
//           TransID: 'TEST123456789',
//           TransTime: new Date().toISOString(),
//           TransAmount: '100.00',
//           BusinessShortCode: methodType === 'mpesa_paybill' ? '123456' : '654321',
//           BillRefNumber: methodType === 'mpesa_paybill' ? 'TEST001' : '',
//           InvoiceNumber: '',
//           OrgAccountBalance: '5000.00',
//           ThirdPartyTransID: '',
//           MSISDN: '254712345678',
//           FirstName: 'Test',
//           MiddleName: 'User',
//           LastName: 'Callback',
//         },
//         null,
//         2
//       ),
//     });
//     setShowTestModal(true);
//   }, [methodType]);

//   const runTest = useCallback(async () => {
//     try {
//       setLoading(true);
//       const payload = {
//         configuration_id: testConfig.configuration_id,
//         test_payload: JSON.parse(testConfig.test_payload),
//         validate_security: true,
//       };
//       const response = await api.post('/api/payments/mpesa-callbacks/test/', payload);
//       if (response.data.success) {
//         toast.success('Test completed successfully!');
//       } else {
//         toast.error(`Test failed: ${response.data.message}`);
//       }
//       setShowTestModal(false);
//     } catch (error) {
//       console.error('Error testing callback:', error);
//       toast.error('Failed to run test');
//     } finally {
//       setLoading(false);
//     }
//   }, [testConfig]);

//   const requestSort = (key) => {
//     let direction = 'ascending';
//     if (sortConfig.key === key && sortConfig.direction === 'ascending') {
//       direction = 'descending';
//     }
//     setSortConfig({ key, direction });
//   };

//   // Filtering and sorting
//   const filteredCallbacks = useMemo(() => {
//     return callbacks.filter(callback => {
//       const matchesSearch =
//         callback.callback_url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         callback.event_details?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         callback.router_details?.name?.toLowerCase().includes(searchTerm.toLowerCase());

//       const matchesFilter =
//         activeFilter === 'all' ||
//         (activeFilter === 'active' && callback.is_active) ||
//         (activeFilter === 'inactive' && !callback.is_active);

//       const matchesRouter =
//         selectedRouter === 'all' || String(callback.router) === String(selectedRouter);

//       return matchesSearch && matchesFilter && matchesRouter;
//     });
//   }, [callbacks, searchTerm, activeFilter, selectedRouter]);

//   const sortedCallbacks = useMemo(() => {
//     let sortableItems = [...filteredCallbacks];
//     if (sortConfig !== null) {
//       sortableItems.sort((a, b) => {
//         const aValue = a[sortConfig.key] || '';
//         const bValue = b[sortConfig.key] || '';
//         if (aValue < bValue) {
//           return sortConfig.direction === 'ascending' ? -1 : 1;
//         }
//         if (aValue > bValue) {
//           return sortConfig.direction === 'ascending' ? 1 : -1;
//         }
//         return 0;
//       });
//     }
//     return sortableItems;
//   }, [filteredCallbacks, sortConfig]);

//   const paginatedCallbacks = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;
//     return sortedCallbacks.slice(start, start + itemsPerPage);
//   }, [sortedCallbacks, currentPage]);

//   const getRouterName = (routerId) => {
//     const router = routers.find(r => r.id === routerId);
//     return router ? router.name : 'Unknown Router';
//   };

//   const getEventName = (eventKey) => {
//     const event = events.find(e => e.name === eventKey);
//     return event ? event.name : 'Unknown Event';
//   };

//   // Analytics chart data (placeholder)
//   const chartData = useMemo(() => {
//     if (!stats || !stats.response_times) return [];
//     return stats.response_times.history?.map((entry, index) => ({
//       name: `T${index + 1}`,
//       responseTime: entry.duration,
//     })) || [];
//   }, [stats]);

//   if (loading) {
//     return (
//       <div className={`flex items-center justify-center p-8 rounded-xl shadow-md ${containerClass}`}>
//         <div className="text-center">
//           <Puff stroke={theme === 'dark' ? '#60A5FA' : '#3B82F6'} className="w-12 h-12 mx-auto" />
//           <p className={`mt-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
//             Loading callback configurations...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`space-y-6 p-6 rounded-xl shadow-md ${containerClass}`} role="region" aria-label="M-Pesa Callback Manager">
//       {/* Header with Filters */}
//       <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 rounded-lg ${headerClass}`}>
//         <h3 className={`text-lg font-semibold flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//           <AnalyticsIcon className={`mr-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} size={24} />
//           M-Pesa {methodType === 'mpesa_paybill' ? 'Paybill' : 'Till'} Callback Manager
//         </h3>
//         <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
//           <div className="relative flex-grow">
//             <SearchIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} size={18} />
//             <input
//               type="text"
//               placeholder="Search by URL, event, or router..."
//               onChange={(e) => debouncedSearch(e.target.value)}
//               className={`pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none transition-all w-full ${inputClass}`}
//               aria-label="Search callbacks"
//             />
//           </div>
//           <select
//             value={activeFilter}
//             onChange={(e) => setActiveFilter(e.target.value)}
//             className={`px-4 py-2.5 border rounded-lg focus:outline-none transition-all ${inputClass}`}
//             aria-label="Filter by status"
//           >
//             <option value="all">All Statuses</option>
//             <option value="active">Active Only</option>
//             <option value="inactive">Inactive Only</option>
//           </select>
//           <select
//             value={selectedRouter}
//             onChange={(e) => setSelectedRouter(e.target.value)}
//             className={`px-4 py-2.5 border rounded-lg focus:outline-none transition-all ${inputClass}`}
//             aria-label="Filter by router"
//           >
//             <option value="all">All Routers</option>
//             {routers.map(router => (
//               <option key={router.id} value={router.id}>{router.name}</option>
//             ))}
//           </select>
//           <button
//             onClick={loadData}
//             className={`px-4 py-2.5 rounded-lg focus:outline-none flex items-center transition-all ${buttonPrimaryClass}`}
//             aria-label="Refresh callback data"
//           >
//             <RefreshIcon className="mr-2" size={18} />
//             Refresh
//           </button>
//         </div>
//       </div>

//       {/* Form for Add/Edit */}
//       <div className={`p-6 rounded-xl shadow-inner border ${
//         theme === 'dark' ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'
//       }`}>
//         <button
//           onClick={() => setShowAnalytics(!showAnalytics)}
//           className={`w-full flex justify-between items-center text-left text-md font-semibold mb-4 transition-colors ${
//             theme === 'dark' ? 'text-white hover:text-green-400' : 'text-gray-900 hover:text-green-600'
//           }`}
//         >
//           {editingId ? 'Edit Existing Callback' : 'Add New Callback Configuration'}
//           {showAnalytics ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
//         </button>
//         {showAnalytics && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${
//                 theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
//               }`}>
//                 Router <span className="text-red-500">*</span>
//               </label>
//               <select
//                 value={newCallback.router}
//                 onChange={(e) => handleChange(e, 'router')}
//                 className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none transition-all ${inputClass}`}
//                 aria-label="Select router"
//               >
//                 <option value="">Select Router</option>
//                 {routers.map(router => (
//                   <option key={router.id} value={router.id}>{router.name}</option>
//                 ))}
//               </select>
//               {validationErrors.router && <p className="text-red-500 text-xs mt-1">{validationErrors.router}</p>}
//             </div>
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${
//                 theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
//               }`}>
//                 Event <span className="text-red-500">*</span>
//               </label>
//               <select
//                 value={newCallback.event}
//                 onChange={(e) => handleChange(e, 'event')}
//                 className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none transition-all ${inputClass}`}
//                 aria-label="Select event"
//               >
//                 <option value="">Select Event</option>
//                 {events.map(event => (
//                   <option key={event.name} value={event.name}>
//                     {event.name} {methodType === 'mpesa_paybill' && event.name === 'payment_success' ? '(Paybill)' : event.name === 'payment_success' ? '(Till)' : ''}
//                   </option>
//                 ))}
//               </select>
//               {validationErrors.event && <p className="text-red-500 text-xs mt-1">{validationErrors.event}</p>}
//             </div>
//             <div className="lg:col-span-2">
//               <label className={`block text-sm font-medium mb-1 ${
//                 theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
//               }`}>
//                 Callback URL <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   value={newCallback.callback_url}
//                   onChange={(e) => handleChange(e, 'callback_url')}
//                   className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none transition-all ${inputClass}`}
//                   placeholder="https://your-callback-url.com"
//                   aria-label="Callback URL"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => {
//                     const generatedUrl = `https://api.yourdomain.com/callbacks/${gatewayId}/${newCallback.event || 'event'}`;
//                     setNewCallback(prev => ({ ...prev, callback_url: generatedUrl }));
//                   }}
//                   className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
//                     theme === 'dark' ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'
//                   }`}
//                   aria-label="Generate callback URL"
//                 >
//                   <FiPlayCircle size={18} />
//                 </button>
//               </div>
//               {validationErrors.callback_url && <p className="text-red-500 text-xs mt-1">{validationErrors.callback_url}</p>}
//             </div>
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${
//                 theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
//               }`}>
//                 Security Level
//               </label>
//               <select
//                 value={newCallback.security_level}
//                 onChange={(e) => handleChange(e, 'security_level')}
//                 className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none transition-all ${inputClass}`}
//                 aria-label="Select security level"
//               >
//                 <option value="low">Low</option>
//                 <option value="medium">Medium</option>
//                 <option value="high">High</option>
//               </select>
//             </div>
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${
//                 theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
//               }`}>
//                 Security Profile
//               </label>
//               <select
//                 value={newCallback.security_profile}
//                 onChange={(e) => handleChange(e, 'security_profile')}
//                 className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none transition-all ${inputClass}`}
//                 aria-label="Select security profile"
//               >
//                 <option value="">None</option>
//                 {securityProfiles.map(profile => (
//                   <option key={profile.id} value={profile.id}>{profile.name}</option>
//                 ))}
//               </select>
//             </div>
//             <div className="flex items-center gap-6 lg:col-span-2">
//               <label className="flex items-center">
//                 <input
//                   type="checkbox"
//                   checked={newCallback.is_active}
//                   onChange={(e) => handleCheckboxChange('is_active', e.target.checked)}
//                   className={`h-4 w-4 rounded focus:ring-2 transition-colors ${
//                     theme === 'dark' 
//                       ? 'text-green-500 focus:ring-green-500 border-gray-600 bg-gray-700' 
//                       : 'text-green-600 focus:ring-green-500 border-gray-300'
//                   }`}
//                   aria-label="Enable callback"
//                 />
//                 <span className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Active</span>
//               </label>
//               <label className="flex items-center">
//                 <input
//                   type="checkbox"
//                   checked={newCallback.retry_enabled}
//                   onChange={(e) => handleCheckboxChange('retry_enabled', e.target.checked)}
//                   className={`h-4 w-4 rounded focus:ring-2 transition-colors ${
//                     theme === 'dark' 
//                       ? 'text-green-500 focus:ring-green-500 border-gray-600 bg-gray-700' 
//                       : 'text-green-600 focus:ring-green-500 border-gray-300'
//                   }`}
//                   aria-label="Enable retries"
//                 />
//                 <span className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Enable Retries</span>
//               </label>
//               <div className="flex gap-4">
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${
//                     theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
//                   }`}>Max Retries</label>
//                   <input
//                     type="number"
//                     value={newCallback.max_retries}
//                     onChange={(e) => handleChange(e, 'max_retries')}
//                     className={`w-20 px-3 py-2.5 border rounded-lg focus:outline-none transition-all ${inputClass}`}
//                     min="1"
//                     max="5"
//                     aria-label="Maximum retries"
//                   />
//                 </div>
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${
//                     theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
//                   }`}>Timeout (s)</label>
//                   <input
//                     type="number"
//                     value={newCallback.timeout_seconds}
//                     onChange={(e) => handleChange(e, 'timeout_seconds')}
//                     className={`w-20 px-3 py-2.5 border rounded-lg focus:outline-none transition-all ${inputClass}`}
//                     min="10"
//                     max="120"
//                     aria-label="Timeout in seconds"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//         <div className="mt-6 flex justify-end">
//           <button
//             onClick={addOrUpdateCallback}
//             className={`px-6 py-2.5 rounded-lg focus:outline-none flex items-center transition-all shadow-sm ${buttonPrimaryClass}`}
//             disabled={loading}
//             aria-label={editingId ? 'Update callback' : 'Add callback'}
//           >
//             {loading ? (
//               <Puff stroke="#fff" className="w-5 h-5 mr-2" />
//             ) : editingId ? (
//               <SaveIcon className="mr-2" size={18} />
//             ) : (
//               <AddIcon className="mr-2" size={18} />
//             )}
//             {editingId ? 'Update Callback' : 'Add Callback'}
//           </button>
//         </div>
//       </div>

//       {/* Table */}
//       <div className={`rounded-xl shadow-sm border overflow-hidden ${containerClass}`}>
//         <div className={`p-4 md:p-6 border-b flex justify-between items-center ${tableHeaderClass} ${
//           theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
//         }`}>
//           <h4 className={`text-md font-semibold ${
//             theme === 'dark' ? 'text-white' : 'text-gray-900'
//           }`}>
//             Configured Callbacks ({filteredCallbacks.length})
//           </h4>
//           <button
//             onClick={() => setShowAnalytics(!showAnalytics)}
//             className={`flex items-center transition-colors ${
//               theme === 'dark' ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'
//             }`}
//             aria-label={showAnalytics ? 'Hide analytics' : 'Show analytics'}
//           >
//             <AnalyticsIcon className="mr-2" size={18} />
//             {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
//           </button>
//         </div>
//         {filteredCallbacks.length === 0 ? (
//           <div className={`text-center py-12 ${
//             theme === 'dark' ? 'bg-gray-700/30 text-gray-400' : 'bg-gray-50 text-gray-500'
//           }`}>
//             <RouterIcon className={`w-12 h-12 mx-auto mb-4 ${
//               theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
//             }`} />
//             <p className="text-lg font-medium">No callback configurations found</p>
//             <p className="text-sm mt-1">Add your first configuration using the form above</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className={tableHeaderClass}>
//                 <tr>
//                   <th
//                     onClick={() => requestSort('router')}
//                     className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${
//                       theme === 'dark' ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'
//                     }`}
//                     aria-sort={sortConfig.key === 'router' ? sortConfig.direction : 'none'}
//                   >
//                     Router{' '}
//                     {sortConfig.key === 'router' && (
//                       sortConfig.direction === 'ascending' ? <FiChevronUp className="inline" /> : <FiChevronDown className="inline" />
//                     )}
//                   </th>
//                   <th
//                     onClick={() => requestSort('event')}
//                     className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${
//                       theme === 'dark' ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'
//                     }`}
//                     aria-sort={sortConfig.key === 'event' ? sortConfig.direction : 'none'}
//                   >
//                     Event{' '}
//                     {sortConfig.key === 'event' && (
//                       sortConfig.direction === 'ascending' ? <FiChevronUp className="inline" /> : <FiChevronDown className="inline" />
//                     )}
//                   </th>
//                   <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
//                     theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
//                   }`}>URL</th>
//                   <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
//                     theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
//                   }`}>Security</th>
//                   <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
//                     theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
//                   }`}>Status</th>
//                   <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
//                     theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
//                   }`}>Actions</th>
//                 </tr>
//               </thead>
//               <tbody className={`divide-y ${tableDividerClass}`}>
//                 {paginatedCallbacks.map((callback) => (
//                   <tr key={callback.id} className={`transition-colors duration-200 ${tableRowClass}`}>
//                     <td className={`px-4 md:px-6 py-4 text-sm ${
//                       theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
//                     }`}>{getRouterName(callback.router)}</td>
//                     <td className={`px-4 md:px-6 py-4 text-sm ${
//                       theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
//                     }`}>
//                       {getEventName(callback.event)}
//                       {methodType === 'mpesa_paybill' && callback.event === 'payment_success' ? ' (Paybill)' : callback.event === 'payment_success' ? ' (Till)' : ''}
//                     </td>
//                     <td className="px-4 md:px-6 py-4 text-sm">
//                       <div className="flex items-center gap-2">
//                         <span className={theme === 'dark' ? 'text-blue-300' : 'text-blue-600 break-all'}>
//                           {showSecrets ? callback.callback_url : '••••••••'}
//                         </span>
//                         <button
//                           onClick={() => setShowSecrets(!showSecrets)}
//                           className={`transition-colors ${
//                             theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                           }`}
//                           aria-label={showSecrets ? 'Hide URL' : 'Show URL'}
//                         >
//                           {showSecrets ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
//                         </button>
//                         <button
//                           onClick={() => {
//                             navigator.clipboard.writeText(callback.callback_url);
//                             toast.info('URL copied to clipboard');
//                           }}
//                           className={`transition-colors ${
//                             theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                           }`}
//                           aria-label="Copy URL"
//                         >
//                           <FiCopy size={16} />
//                         </button>
//                       </div>
//                     </td>
//                     <td className="px-4 md:px-6 py-4">
//                       <span
//                         className={`px-3 py-1 text-xs font-medium rounded-full ${
//                           callback.security_level === 'high'
//                             ? theme === 'dark' ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'
//                             : callback.security_level === 'medium'
//                             ? theme === 'dark' ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'
//                             : theme === 'dark' ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
//                         }`}
//                       >
//                         {callback.security_level.charAt(0).toUpperCase() + callback.security_level.slice(1)}
//                       </span>
//                     </td>
//                     <td className="px-4 md:px-6 py-4">
//                       <span
//                         className={`px-3 py-1 text-xs font-medium rounded-full ${
//                           callback.is_active 
//                             ? theme === 'dark' ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'
//                             : theme === 'dark' ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800'
//                         }`}
//                       >
//                         {callback.is_active ? 'Active' : 'Inactive'}
//                       </span>
//                     </td>
//                     <td className="px-4 md:px-6 py-4 flex items-center gap-3">
//                       <button
//                         onClick={() => editCallback(callback)}
//                         className={`transition-colors ${
//                           theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
//                         }`}
//                         title="Edit callback"
//                         aria-label="Edit callback"
//                       >
//                         <EditIcon className="w-5 h-5" />
//                       </button>
//                       <button
//                         onClick={() => toggleCallbackStatus(callback)}
//                         className={`transition-colors ${
//                           theme === 'dark' ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-800'
//                         }`}
//                         title={callback.is_active ? 'Deactivate callback' : 'Activate callback'}
//                         aria-label={callback.is_active ? 'Deactivate callback' : 'Activate callback'}
//                       >
//                         {callback.is_active ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
//                       </button>
//                       <button
//                         onClick={() => deleteCallback(callback.id)}
//                         className={`transition-colors ${
//                           theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'
//                         }`}
//                         title="Delete callback"
//                         aria-label="Delete callback"
//                       >
//                         <DeleteIcon className="w-5 h-5" />
//                       </button>
//                       <button
//                         onClick={() => testCallback(callback)}
//                         className={`transition-colors ${
//                           theme === 'dark' ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'
//                         }`}
//                         title="Test callback"
//                         aria-label="Test callback"
//                       >
//                         <FiPlayCircle className="w-5 h-5" />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//             {/* Pagination */}
//             <div className={`flex justify-center items-center gap-4 py-4 ${
//               theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'
//             }`}>
//               <button
//                 disabled={currentPage === 1}
//                 onClick={() => setCurrentPage(prev => prev - 1)}
//                 className={`px-4 py-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonSecondaryClass}`}
//                 aria-label="Previous page"
//               >
//                 Previous
//               </button>
//               <span className={`text-sm font-medium ${
//                 theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
//               }`}>
//                 Page {currentPage} of {Math.ceil(sortedCallbacks.length / itemsPerPage)}
//               </span>
//               <button
//                 disabled={currentPage === Math.ceil(sortedCallbacks.length / itemsPerPage)}
//                 onClick={() => setCurrentPage(prev => prev + 1)}
//                 className={`px-4 py-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonSecondaryClass}`}
//                 aria-label="Next page"
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Analytics Section */}
//       {showAnalytics && stats && (
//         <div className={`p-6 rounded-xl shadow-sm border animate-fadeIn ${
//           theme === 'dark' ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-gray-200'
//         }`}>
//           <h4 className={`text-md font-semibold mb-4 flex items-center ${
//             theme === 'dark' ? 'text-white' : 'text-gray-900'
//           }`}>
//             <AnalyticsIcon className={`mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} size={20} />
//             Real-Time Callback Analytics
//           </h4>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//             <div className={`p-4 rounded-lg shadow-sm border ${
//               theme === 'dark' ? 'bg-gray-800 border-blue-700/50' : 'bg-white border-blue-100'
//             }`}>
//               <p className={`text-sm font-medium flex items-center ${
//                 theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
//               }`}><TrendIcon className="mr-1" /> Success Rate</p>
//               <p className={`text-2xl font-bold ${
//                 theme === 'dark' ? 'text-blue-100' : 'text-blue-800'
//               }`}>{stats.success_rate}%</p>
//             </div>
//             <div className={`p-4 rounded-lg shadow-sm border ${
//               theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-100'
//             }`}>
//               <p className={`text-sm font-medium flex items-center ${
//                 theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
//               }`}><AnalyticsIcon className="mr-1" /> Total Callbacks</p>
//               <p className={`text-2xl font-bold ${
//                 theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
//               }`}>{stats.total_callbacks}</p>
//             </div>
//             <div className={`p-4 rounded-lg shadow-sm border ${
//               theme === 'dark' ? 'bg-gray-800 border-green-700/50' : 'bg-white border-green-100'
//             }`}>
//               <p className={`text-sm font-medium flex items-center ${
//                 theme === 'dark' ? 'text-green-300' : 'text-green-600'
//               }`}><SecurityIcon className="mr-1" /> Successful</p>
//               <p className={`text-2xl font-bold ${
//                 theme === 'dark' ? 'text-green-100' : 'text-green-800'
//               }`}>{stats.successful_callbacks}</p>
//             </div>
//           </div>
//           <div className="mt-4">
//             <p className={`text-sm font-medium mb-2 flex items-center ${
//               theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
//             }`}><TimeIcon className="mr-1" /> Response Time Trend</p>
//             <div className={`h-64 rounded-lg p-4 shadow-inner ${
//               theme === 'dark' ? 'bg-gray-800' : 'bg-white'
//             }`}>
//               <ResponsiveContainer width="100%" height="100%">
//                 <LineChart data={chartData}>
//                   <XAxis dataKey="name" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
//                   <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
//                   <Tooltip 
//                     contentStyle={{
//                       backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
//                       borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
//                       color: theme === 'dark' ? '#F9FAFB' : '#111827',
//                     }}
//                   />
//                   <Line type="monotone" dataKey="responseTime" stroke={theme === 'dark' ? '#60A5FA' : '#3B82F6'} strokeWidth={3} dot={{ r: 4 }} />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Test Modal */}
//       {showTestModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className={`rounded-xl p-6 w-full max-w-3xl mx-4 shadow-2xl ${
//             theme === 'dark' ? 'bg-gray-800' : 'bg-white'
//           }`}>
//             <h3 className={`text-lg font-semibold mb-4 flex items-center ${
//               theme === 'dark' ? 'text-white' : 'text-gray-900'
//             }`}>
//               <FiPlayCircle className={`mr-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} size={20} />
//               Test Callback Configuration
//             </h3>
//             <div className="mb-4">
//               <label className={`block text-sm font-medium mb-2 ${
//                 theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
//               }`}>
//                 Test Payload (JSON)
//               </label>
//               <textarea
//                 value={testConfig.test_payload}
//                 onChange={(e) => setTestConfig(prev => ({ ...prev, test_payload: e.target.value }))}
//                 rows={12}
//                 className={`w-full px-4 py-3 border rounded-lg font-mono text-sm focus:outline-none transition-all resize-y ${
//                   theme === 'dark'
//                     ? 'bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500'
//                     : 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500'
//                 }`}
//                 placeholder="Enter test payload in JSON format"
//                 aria-label="Test payload"
//               />
//               {testConfig.test_payload && (
//                 <button
//                   onClick={() => {
//                     try {
//                       const formatted = JSON.stringify(JSON.parse(testConfig.test_payload), null, 2);
//                       setTestConfig(prev => ({ ...prev, test_payload: formatted }));
//                       toast.info('JSON formatted successfully');
//                     } catch {
//                       toast.error('Invalid JSON format - please check your payload');
//                     }
//                   }}
//                   className={`mt-2 px-4 py-1.5 rounded-lg transition-colors shadow-sm ${
//                     theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                   }`}
//                   aria-label="Format JSON"
//                 >
//                   Format JSON
//                 </button>
//               )}
//             </div>
//             <div className="flex justify-end space-x-4">
//               <button
//                 onClick={() => setShowTestModal(false)}
//                 className={`px-6 py-2.5 rounded-lg focus:outline-none transition-colors shadow-sm ${buttonSecondaryClass}`}
//                 aria-label="Cancel test"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={runTest}
//                 className={`px-6 py-2.5 rounded-lg focus:outline-none flex items-center transition-colors shadow-sm ${
//                   theme === 'dark'
//                     ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
//                     : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
//                 }`}
//                 disabled={loading}
//                 aria-label="Run test"
//               >
//                 {loading ? <Puff stroke="#fff" className="w-5 h-5 mr-2" /> : <FiPlayCircle className="w-5 h-5 mr-2" />}
//                 Run Test
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MpesaCallbackManager;










import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  IoAddCircleOutline as AddIcon,
  IoSaveOutline as SaveIcon,
  IoPencilOutline as EditIcon,
  IoTrashOutline as DeleteIcon,
  IoSearchOutline as SearchIcon,
  IoServerOutline as RouterIcon,
  IoShieldCheckmarkOutline as SecurityIcon,
  IoStatsChartOutline as AnalyticsIcon,
  IoReloadOutline as RefreshIcon,
  IoWarningOutline as WarningIcon,
  IoEyeOutline as EyeIcon,
  IoEyeOffOutline as EyeOffIcon,
  IoTrendingUpOutline as TrendIcon,
  IoTimeOutline as TimeIcon,
} from 'react-icons/io5';
import { FiChevronUp, FiChevronDown, FiCopy, FiPlayCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Puff } from 'react-loading-icons';
import api from '../../api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { debounce } from 'lodash';

const MpesaCallbackManager = ({ 
  routers, 
  events, 
  securityProfiles, 
  gatewayId, 
  initialStats, 
  initialCallbacks, 
  methodType,
  theme = 'light' 
}) => {
  // Theme-based CSS classes
  const containerClass = theme === 'dark'
    ? 'bg-gray-800/80 backdrop-blur-md border border-gray-700'
    : 'bg-white border border-gray-200';

  const headerClass = theme === 'dark'
    ? 'bg-gradient-to-r from-green-900/50 to-emerald-900/50'
    : 'bg-gradient-to-r from-green-50 to-emerald-50';

  const inputClass = theme === 'dark'
    ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500'
    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500';

  const buttonPrimaryClass = theme === 'dark'
    ? 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 text-white'
    : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 text-white';

  const buttonSecondaryClass = theme === 'dark'
    ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 focus:ring-2 focus:ring-gray-500'
    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500';

  const tableHeaderClass = theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50';
  const tableRowClass = theme === 'dark' ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50';
  const tableDividerClass = theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200';

  const [callbacks, setCallbacks] = useState(initialCallbacks || []);
  const [stats, setStats] = useState(initialStats || null);
  const [loading, setLoading] = useState(false);
  const [newCallback, setNewCallback] = useState({
    router: routers[0]?.id || '',
    event: events[0]?.name || '',
    callback_url: '',
    security_level: 'medium',
    security_profile: securityProfiles[0]?.id || '',
    is_active: true,
    retry_enabled: true,
    max_retries: 3,
    timeout_seconds: 30,
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedRouter, setSelectedRouter] = useState('all');
  const [showTestModal, setShowTestModal] = useState(false);
  const [testConfig, setTestConfig] = useState({ configuration_id: '', test_payload: '{}' });
  const [showSecrets, setShowSecrets] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'router', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [validationErrors, setValidationErrors] = useState({});

  // Initialize data
  useEffect(() => {
    setCallbacks(initialCallbacks || []);
    setStats(initialStats || null);
  }, [initialCallbacks, initialStats]);

  // Load data with caching
  const loadData = async () => {
    try {
      setLoading(true);
      const [callbacksResponse, statsResponse] = await Promise.all([
        api.get('/api/payments/mpesa-callbacks/configurations/'),
        api.get('/api/payments/mpesa-callbacks/analytics/'),
      ]);
      setCallbacks(callbacksResponse.data.filter(cb => cb.gateway === gatewayId));
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Failed to load callback data:', error);
      toast.error('Failed to load callback configurations');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value) => setSearchTerm(value), 300),
    []
  );

  // Handle input changes
  const handleChange = useCallback((e, field) => {
    const { value } = e.target;
    setNewCallback(prev => ({ ...prev, [field]: value }));
    // Inline validation
    setValidationErrors(prev => ({
      ...prev,
      [field]: value ? '' : 'This field is required',
    }));
  }, []);

  const handleCheckboxChange = useCallback((field, value) => {
    setNewCallback(prev => ({ ...prev, [field]: value }));
  }, []);

  // Add or update callback
  const addOrUpdateCallback = useCallback(async () => {
    if (!newCallback.router || !newCallback.event || !newCallback.callback_url) {
      toast.error('Please fill in all required fields');
      setValidationErrors({
        router: !newCallback.router ? 'Router is required' : '',
        event: !newCallback.event ? 'Event is required' : '',
        callback_url: !newCallback.callback_url ? 'Callback URL is required' : '',
      });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        router: newCallback.router,
        event: newCallback.event,
        callback_url: newCallback.callback_url,
        security_level: newCallback.security_level,
        security_profile: newCallback.security_profile || null,
        is_active: newCallback.is_active,
        retry_enabled: newCallback.retry_enabled,
        max_retries: parseInt(newCallback.max_retries),
        timeout_seconds: parseInt(newCallback.timeout_seconds),
        gateway: gatewayId,
      };

      let updatedCallbacks;
      if (editingId) {
        await api.put(`/api/payments/mpesa-callbacks/configurations/${editingId}/`, payload);
        updatedCallbacks = callbacks.map(cb =>
          cb.id === editingId ? { ...cb, ...payload } : cb
        );
        toast.success('Callback updated successfully');
      } else {
        const response = await api.post('/api/payments/mpesa-callbacks/configurations/', payload);
        updatedCallbacks = [...callbacks, response.data];
        toast.success('Callback added successfully');
      }

      setCallbacks(updatedCallbacks);
      setNewCallback({
        router: routers[0]?.id || '',
        event: events[0]?.name || '',
        callback_url: '',
        security_level: 'medium',
        security_profile: securityProfiles[0]?.id || '',
        is_active: true,
        retry_enabled: true,
        max_retries: 3,
        timeout_seconds: 30,
      });
      setEditingId(null);
      setValidationErrors({});
    } catch (error) {
      console.error('Error saving callback:', error);
      toast.error('Failed to save callback configuration');
    } finally {
      setLoading(false);
    }
  }, [newCallback, editingId, gatewayId, callbacks, routers, events, securityProfiles]);

  // Edit callback
  const editCallback = useCallback((callback) => {
    setEditingId(callback.id);
    setNewCallback({
      router: callback.router,
      event: callback.event,
      callback_url: callback.callback_url,
      security_level: callback.security_level,
      security_profile: callback.security_profile || '',
      is_active: callback.is_active,
      retry_enabled: callback.retry_enabled,
      max_retries: callback.max_retries,
      timeout_seconds: callback.timeout_seconds,
    });
  }, []);

  // Delete callback
  const deleteCallback = useCallback(async (id) => {
    try {
      setLoading(true);
      await api.delete(`/api/payments/mpesa-callbacks/configurations/${id}/`);
      setCallbacks(callbacks.filter(cb => cb.id !== id));
      toast.success('Callback deleted successfully');
    } catch (error) {
      console.error('Error deleting callback:', error);
      toast.error('Failed to delete callback');
    } finally {
      setLoading(false);
    }
  }, [callbacks]);

  // Toggle callback status
  const toggleCallbackStatus = useCallback(async (callback) => {
    try {
      setLoading(true);
      const updatedCallback = { ...callback, is_active: !callback.is_active };
      await api.put(`/api/payments/mpesa-callbacks/configurations/${callback.id}/`, updatedCallback);
      setCallbacks(callbacks.map(cb => (cb.id === callback.id ? updatedCallback : cb)));
      toast.success(`Callback ${callback.is_active ? 'deactivated' : 'activated'}`);
    } catch (error) {
      console.error('Error toggling callback status:', error);
      toast.error('Failed to toggle callback status');
    } finally {
      setLoading(false);
    }
  }, [callbacks]);

  // Test callback
  const testCallback = useCallback((callback) => {
    setTestConfig({
      configuration_id: callback.id,
      test_payload: JSON.stringify(
        {
          TransactionType: methodType === 'mpesa_paybill' ? 'Pay Bill' : 'CustomerBuyGoodsOnline',
          TransID: 'TEST123456789',
          TransTime: new Date().toISOString(),
          TransAmount: '100.00',
          BusinessShortCode: methodType === 'mpesa_paybill' ? '123456' : '654321',
          BillRefNumber: methodType === 'mpesa_paybill' ? 'TEST001' : '',
          InvoiceNumber: '',
          OrgAccountBalance: '5000.00',
          ThirdPartyTransID: '',
          MSISDN: '254712345678',
          FirstName: 'Test',
          MiddleName: 'User',
          LastName: 'Callback',
        },
        null,
        2
      ),
    });
    setShowTestModal(true);
  }, [methodType]);

  const runTest = useCallback(async () => {
    try {
      setLoading(true);
      const payload = {
        configuration_id: testConfig.configuration_id,
        test_payload: JSON.parse(testConfig.test_payload),
        validate_security: true,
      };
      const response = await api.post('/api/payments/mpesa-callbacks/test/', payload);
      if (response.data.success) {
        toast.success('Test completed successfully!');
      } else {
        toast.error(`Test failed: ${response.data.message}`);
      }
      setShowTestModal(false);
    } catch (error) {
      console.error('Error testing callback:', error);
      toast.error('Failed to run test');
    } finally {
      setLoading(false);
    }
  }, [testConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Filtering and sorting
  const filteredCallbacks = useMemo(() => {
    return callbacks.filter(callback => {
      const matchesSearch =
        callback.callback_url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        callback.event_details?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        callback.router_details?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'active' && callback.is_active) ||
        (activeFilter === 'inactive' && !callback.is_active);

      const matchesRouter =
        selectedRouter === 'all' || String(callback.router) === String(selectedRouter);

      return matchesSearch && matchesFilter && matchesRouter;
    });
  }, [callbacks, searchTerm, activeFilter, selectedRouter]);

  const sortedCallbacks = useMemo(() => {
    let sortableItems = [...filteredCallbacks];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredCallbacks, sortConfig]);

  const paginatedCallbacks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedCallbacks.slice(start, start + itemsPerPage);
  }, [sortedCallbacks, currentPage]);

  const getRouterName = (routerId) => {
    const router = routers.find(r => r.id === routerId);
    return router ? router.name : 'Unknown Router';
  };

  const getEventName = (eventKey) => {
    const event = events.find(e => e.name === eventKey);
    return event ? event.name : 'Unknown Event';
  };

  // Analytics chart data (placeholder)
  const chartData = useMemo(() => {
    if (!stats || !stats.response_times) return [];
    return stats.response_times.history?.map((entry, index) => ({
      name: `T${index + 1}`,
      responseTime: entry.duration,
    })) || [];
  }, [stats]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 rounded-xl shadow-md ${containerClass}`}>
        <div className="text-center">
          <Puff stroke={theme === 'dark' ? '#60A5FA' : '#3B82F6'} className="w-12 h-12 mx-auto" />
          <p className={`mt-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading callback configurations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 p-4 sm:p-6 rounded-xl shadow-md ${containerClass}`} role="region" aria-label="M-Pesa Callback Manager">
      {/* Header with Filters */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 rounded-lg ${headerClass}`}>
        <h3 className={`text-lg font-semibold flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <AnalyticsIcon className={`mr-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} size={24} />
          M-Pesa {methodType === 'mpesa_paybill' ? 'Paybill' : 'Till'} Callback Manager
        </h3>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <SearchIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} size={18} />
            <input
              type="text"
              placeholder="Search by URL, event, or router..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className={`pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none transition-all w-full ${inputClass}`}
              aria-label="Search callbacks"
            />
          </div>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className={`px-4 py-2.5 border rounded-lg focus:outline-none transition-all ${inputClass}`}
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
          <select
            value={selectedRouter}
            onChange={(e) => setSelectedRouter(e.target.value)}
            className={`px-4 py-2.5 border rounded-lg focus:outline-none transition-all ${inputClass}`}
            aria-label="Filter by router"
          >
            <option value="all">All Routers</option>
            {routers.map(router => (
              <option key={router.id} value={router.id}>{router.name}</option>
            ))}
          </select>
          <button
            onClick={loadData}
            className={`px-4 py-2.5 rounded-lg focus:outline-none flex items-center justify-center transition-all ${buttonPrimaryClass}`}
            aria-label="Refresh callback data"
          >
            <RefreshIcon className="mr-2" size={18} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Form for Add/Edit */}
      <div className={`p-4 sm:p-6 rounded-xl shadow-inner border ${
        theme === 'dark' ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'
      }`}>
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className={`w-full flex justify-between items-center text-left text-md font-semibold mb-4 transition-colors ${
            theme === 'dark' ? 'text-white hover:text-green-400' : 'text-gray-900 hover:text-green-600'
          }`}
        >
          {editingId ? 'Edit Existing Callback' : 'Add New Callback Configuration'}
          {showAnalytics ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
        </button>
        {showAnalytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Router <span className="text-red-500">*</span>
              </label>
              <select
                value={newCallback.router}
                onChange={(e) => handleChange(e, 'router')}
                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none transition-all ${inputClass}`}
                aria-label="Select router"
              >
                <option value="">Select Router</option>
                {routers.map(router => (
                  <option key={router.id} value={router.id}>{router.name}</option>
                ))}
              </select>
              {validationErrors.router && <p className="text-red-500 text-xs mt-1">{validationErrors.router}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Event <span className="text-red-500">*</span>
              </label>
              <select
                value={newCallback.event}
                onChange={(e) => handleChange(e, 'event')}
                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none transition-all ${inputClass}`}
                aria-label="Select event"
              >
                <option value="">Select Event</option>
                {events.map(event => (
                  <option key={event.name} value={event.name}>
                    {event.name} {methodType === 'mpesa_paybill' && event.name === 'payment_success' ? '(Paybill)' : event.name === 'payment_success' ? '(Till)' : ''}
                  </option>
                ))}
              </select>
              {validationErrors.event && <p className="text-red-500 text-xs mt-1">{validationErrors.event}</p>}
            </div>
            <div className="lg:col-span-2">
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Callback URL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={newCallback.callback_url}
                  onChange={(e) => handleChange(e, 'callback_url')}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none transition-all ${inputClass}`}
                  placeholder="https://your-callback-url.com"
                  aria-label="Callback URL"
                />
                <button
                  type="button"
                  onClick={() => {
                    const generatedUrl = `https://api.yourdomain.com/callbacks/${gatewayId}/${newCallback.event || 'event'}`;
                    setNewCallback(prev => ({ ...prev, callback_url: generatedUrl }));
                  }}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                    theme === 'dark' ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'
                  }`}
                  aria-label="Generate callback URL"
                >
                  <FiPlayCircle size={18} />
                </button>
              </div>
              {validationErrors.callback_url && <p className="text-red-500 text-xs mt-1">{validationErrors.callback_url}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Security Level
              </label>
              <select
                value={newCallback.security_level}
                onChange={(e) => handleChange(e, 'security_level')}
                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none transition-all ${inputClass}`}
                aria-label="Select security level"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Security Profile
              </label>
              <select
                value={newCallback.security_profile}
                onChange={(e) => handleChange(e, 'security_profile')}
                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none transition-all ${inputClass}`}
                aria-label="Select security profile"
              >
                <option value="">None</option>
                {securityProfiles.map(profile => (
                  <option key={profile.id} value={profile.id}>{profile.name}</option>
                ))}
              </select>
            </div>
            
            {/* FIXED: Mobile responsive section for checkboxes and number inputs */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Active Checkbox */}
                <div className="flex items-center col-span-1 sm:col-span-1">
                  <input
                    type="checkbox"
                    checked={newCallback.is_active}
                    onChange={(e) => handleCheckboxChange('is_active', e.target.checked)}
                    className={`h-4 w-4 rounded focus:ring-2 transition-colors flex-shrink-0 ${
                      theme === 'dark' 
                        ? 'text-green-500 focus:ring-green-500 border-gray-600 bg-gray-700' 
                        : 'text-green-600 focus:ring-green-500 border-gray-300'
                    }`}
                    aria-label="Enable callback"
                  />
                  <span className={`ml-2 text-sm whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Active</span>
                </div>
                
                {/* Retry Checkbox */}
                <div className="flex items-center col-span-1 sm:col-span-1">
                  <input
                    type="checkbox"
                    checked={newCallback.retry_enabled}
                    onChange={(e) => handleCheckboxChange('retry_enabled', e.target.checked)}
                    className={`h-4 w-4 rounded focus:ring-2 transition-colors flex-shrink-0 ${
                      theme === 'dark' 
                        ? 'text-green-500 focus:ring-green-500 border-gray-600 bg-gray-700' 
                        : 'text-green-600 focus:ring-green-500 border-gray-300'
                    }`}
                    aria-label="Enable retries"
                  />
                  <span className={`ml-2 text-sm whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Enable Retries</span>
                </div>
                
                {/* Max Retries Input */}
                <div className="col-span-1 sm:col-span-1">
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>Max Retries</label>
                  <input
                    type="number"
                    value={newCallback.max_retries}
                    onChange={(e) => handleChange(e, 'max_retries')}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none transition-all ${inputClass}`}
                    min="1"
                    max="5"
                    aria-label="Maximum retries"
                  />
                </div>
                
                {/* Timeout Input */}
                <div className="col-span-1 sm:col-span-1">
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>Timeout (s)</label>
                  <input
                    type="number"
                    value={newCallback.timeout_seconds}
                    onChange={(e) => handleChange(e, 'timeout_seconds')}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none transition-all ${inputClass}`}
                    min="10"
                    max="120"
                    aria-label="Timeout in seconds"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <button
            onClick={addOrUpdateCallback}
            className={`px-4 sm:px-6 py-2.5 rounded-lg focus:outline-none flex items-center transition-all shadow-sm w-full sm:w-auto justify-center ${buttonPrimaryClass}`}
            disabled={loading}
            aria-label={editingId ? 'Update callback' : 'Add callback'}
          >
            {loading ? (
              <Puff stroke="#fff" className="w-5 h-5 mr-2" />
            ) : editingId ? (
              <SaveIcon className="mr-2" size={18} />
            ) : (
              <AddIcon className="mr-2" size={18} />
            )}
            {editingId ? 'Update Callback' : 'Add Callback'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-xl shadow-sm border overflow-hidden ${containerClass}`}>
        <div className={`p-4 md:p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${tableHeaderClass} ${
          theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
        }`}>
          <h4 className={`text-md font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Configured Callbacks ({filteredCallbacks.length})
          </h4>
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`flex items-center transition-colors ${
              theme === 'dark' ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'
            }`}
            aria-label={showAnalytics ? 'Hide analytics' : 'Show analytics'}
          >
            <AnalyticsIcon className="mr-2" size={18} />
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>
        </div>
        {filteredCallbacks.length === 0 ? (
          <div className={`text-center py-12 ${
            theme === 'dark' ? 'bg-gray-700/30 text-gray-400' : 'bg-gray-50 text-gray-500'
          }`}>
            <RouterIcon className={`w-12 h-12 mx-auto mb-4 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <p className="text-lg font-medium">No callback configurations found</p>
            <p className="text-sm mt-1">Add your first configuration using the form above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={tableHeaderClass}>
                <tr>
                  <th
                    onClick={() => requestSort('router')}
                    className={`px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${
                      theme === 'dark' ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'
                    }`}
                    aria-sort={sortConfig.key === 'router' ? sortConfig.direction : 'none'}
                  >
                    <div className="flex items-center">
                      Router{' '}
                      {sortConfig.key === 'router' && (
                        sortConfig.direction === 'ascending' ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => requestSort('event')}
                    className={`px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${
                      theme === 'dark' ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'
                    }`}
                    aria-sort={sortConfig.key === 'event' ? sortConfig.direction : 'none'}
                  >
                    <div className="flex items-center">
                      Event{' '}
                      {sortConfig.key === 'event' && (
                        sortConfig.direction === 'ascending' ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th className={`px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>URL</th>
                  <th className={`hidden sm:table-cell px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>Security</th>
                  <th className={`hidden sm:table-cell px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>Status</th>
                  <th className={`px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${tableDividerClass}`}>
                {paginatedCallbacks.map((callback) => (
                  <tr key={callback.id} className={`transition-colors duration-200 ${tableRowClass}`}>
                    <td className={`px-3 sm:px-4 md:px-6 py-4 text-sm ${
                      theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}>{getRouterName(callback.router)}</td>
                    <td className={`px-3 sm:px-4 md:px-6 py-4 text-sm ${
                      theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}>
                      {getEventName(callback.event)}
                      {methodType === 'mpesa_paybill' && callback.event === 'payment_success' ? ' (Paybill)' : callback.event === 'payment_success' ? ' (Till)' : ''}
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'} break-all max-w-[120px] sm:max-w-[200px] md:max-w-none truncate`}>
                          {showSecrets ? callback.callback_url : '••••••••'}
                        </span>
                        <button
                          onClick={() => setShowSecrets(!showSecrets)}
                          className={`transition-colors flex-shrink-0 ${
                            theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                          }`}
                          aria-label={showSecrets ? 'Hide URL' : 'Show URL'}
                        >
                          {showSecrets ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(callback.callback_url);
                            toast.info('URL copied to clipboard');
                          }}
                          className={`transition-colors flex-shrink-0 ${
                            theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                          }`}
                          aria-label="Copy URL"
                        >
                          <FiCopy size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-4 md:px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          callback.security_level === 'high'
                            ? theme === 'dark' ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'
                            : callback.security_level === 'medium'
                            ? theme === 'dark' ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'
                            : theme === 'dark' ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {callback.security_level.charAt(0).toUpperCase() + callback.security_level.slice(1)}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-4 md:px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          callback.is_active 
                            ? theme === 'dark' ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'
                            : theme === 'dark' ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {callback.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => editCallback(callback)}
                          className={`transition-colors p-1 ${
                            theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                          }`}
                          title="Edit callback"
                          aria-label="Edit callback"
                        >
                          <EditIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => toggleCallbackStatus(callback)}
                          className={`transition-colors p-1 ${
                            theme === 'dark' ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-800'
                          }`}
                          title={callback.is_active ? 'Deactivate callback' : 'Activate callback'}
                          aria-label={callback.is_active ? 'Deactivate callback' : 'Activate callback'}
                        >
                          {callback.is_active ? <EyeOffIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                        <button
                          onClick={() => deleteCallback(callback.id)}
                          className={`transition-colors p-1 ${
                            theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'
                          }`}
                          title="Delete callback"
                          aria-label="Delete callback"
                        >
                          <DeleteIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => testCallback(callback)}
                          className={`transition-colors p-1 ${
                            theme === 'dark' ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'
                          }`}
                          title="Test callback"
                          aria-label="Test callback"
                        >
                          <FiPlayCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination */}
            <div className={`flex justify-center items-center gap-4 py-4 ${
              theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'
            }`}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className={`px-3 sm:px-4 py-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonSecondaryClass}`}
                aria-label="Previous page"
              >
                Previous
              </button>
              <span className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Page {currentPage} of {Math.ceil(sortedCallbacks.length / itemsPerPage)}
              </span>
              <button
                disabled={currentPage === Math.ceil(sortedCallbacks.length / itemsPerPage)}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className={`px-3 sm:px-4 py-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonSecondaryClass}`}
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Section */}
      {showAnalytics && stats && (
        <div className={`p-4 sm:p-6 rounded-xl shadow-sm border animate-fadeIn ${
          theme === 'dark' ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-gray-200'
        }`}>
          <h4 className={`text-md font-semibold mb-4 flex items-center ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <AnalyticsIcon className={`mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} size={20} />
            Real-Time Callback Analytics
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`p-4 rounded-lg shadow-sm border ${
              theme === 'dark' ? 'bg-gray-800 border-blue-700/50' : 'bg-white border-blue-100'
            }`}>
              <p className={`text-sm font-medium flex items-center ${
                theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
              }`}><TrendIcon className="mr-1" /> Success Rate</p>
              <p className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-blue-100' : 'text-blue-800'
              }`}>{stats.success_rate}%</p>
            </div>
            <div className={`p-4 rounded-lg shadow-sm border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-100'
            }`}>
              <p className={`text-sm font-medium flex items-center ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}><AnalyticsIcon className="mr-1" /> Total Callbacks</p>
              <p className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
              }`}>{stats.total_callbacks}</p>
            </div>
            <div className={`p-4 rounded-lg shadow-sm border ${
              theme === 'dark' ? 'bg-gray-800 border-green-700/50' : 'bg-white border-green-100'
            }`}>
              <p className={`text-sm font-medium flex items-center ${
                theme === 'dark' ? 'text-green-300' : 'text-green-600'
              }`}><SecurityIcon className="mr-1" /> Successful</p>
              <p className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-green-100' : 'text-green-800'
              }`}>{stats.successful_callbacks}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className={`text-sm font-medium mb-2 flex items-center ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}><TimeIcon className="mr-1" /> Response Time Trend</p>
            <div className={`h-64 rounded-lg p-4 shadow-inner ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="name" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                      borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                      color: theme === 'dark' ? '#F9FAFB' : '#111827',
                    }}
                  />
                  <Line type="monotone" dataKey="responseTime" stroke={theme === 'dark' ? '#60A5FA' : '#3B82F6'} strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Test Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-4 sm:p-6 w-full max-w-3xl mx-4 shadow-2xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <FiPlayCircle className={`mr-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} size={20} />
              Test Callback Configuration
            </h3>
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Test Payload (JSON)
              </label>
              <textarea
                value={testConfig.test_payload}
                onChange={(e) => setTestConfig(prev => ({ ...prev, test_payload: e.target.value }))}
                rows={12}
                className={`w-full px-4 py-3 border rounded-lg font-mono text-sm focus:outline-none transition-all resize-y ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500'
                    : 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500'
                }`}
                placeholder="Enter test payload in JSON format"
                aria-label="Test payload"
              />
              {testConfig.test_payload && (
                <button
                  onClick={() => {
                    try {
                      const formatted = JSON.stringify(JSON.parse(testConfig.test_payload), null, 2);
                      setTestConfig(prev => ({ ...prev, test_payload: formatted }));
                      toast.info('JSON formatted successfully');
                    } catch {
                      toast.error('Invalid JSON format - please check your payload');
                    }
                  }}
                  className={`mt-2 px-4 py-1.5 rounded-lg transition-colors shadow-sm ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  aria-label="Format JSON"
                >
                  Format JSON
                </button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setShowTestModal(false)}
                className={`px-4 sm:px-6 py-2.5 rounded-lg focus:outline-none transition-colors shadow-sm ${buttonSecondaryClass}`}
                aria-label="Cancel test"
              >
                Cancel
              </button>
              <button
                onClick={runTest}
                className={`px-4 sm:px-6 py-2.5 rounded-lg focus:outline-none flex items-center justify-center transition-colors shadow-sm ${
                  theme === 'dark'
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
                }`}
                disabled={loading}
                aria-label="Run test"
              >
                {loading ? <Puff stroke="#fff" className="w-5 h-5 mr-2" /> : <FiPlayCircle className="w-5 h-5 mr-2" />}
                Run Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MpesaCallbackManager;