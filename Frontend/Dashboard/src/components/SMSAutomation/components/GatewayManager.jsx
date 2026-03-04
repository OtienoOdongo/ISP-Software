


// import React, { useState, useMemo } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Server, Wifi, WifiOff, Settings, RefreshCw, Power,
//   AlertTriangle, CheckCircle, XCircle, Edit, Trash2,
//   Plus, Loader, Shield, Battery, Globe, Activity,
//   DollarSign, Clock, BarChart3, ChevronDown, ChevronUp,
//   Eye, EyeOff, Filter, Search, Copy
// } from 'lucide-react';
// import { EnhancedSelect, ConfirmationModal, EmptyState, getThemeClasses } from '../../../components/ServiceManagement/Shared/components';
// import { formatCurrency, formatNumber, formatTimeAgo, formatPercentage } from '../utils/formatters';

// const GatewayManager = ({
//   gateways = [],
//   loading,
//   theme,
//   themeClasses,
//   onRefresh,
//   onTestConnection,
//   onSetDefault,
//   onToggleActive,
//   onEdit,
//   onDelete,
//   viewMode = 'grid',
//   searchTerm = '',
//   statusFilter = 'all'
// }) => {
//   const [expandedGateway, setExpandedGateway] = useState(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [gatewayToDelete, setGatewayToDelete] = useState(null);
//   const [testing, setTesting] = useState(new Set());
//   const [showApiKey, setShowApiKey] = useState({});

//   // Gateway type configuration
//   const gatewayTypes = useMemo(() => ({
//     africas_talking: { 
//       name: "Africa's Talking", 
//       color: 'orange', 
//       bgColor: 'bg-orange-100',
//       textColor: 'text-orange-600',
//       icon: Globe,
//       docs: 'https://developers.africastalking.com/docs'
//     },
//     twilio: { 
//       name: 'Twilio', 
//       color: 'blue', 
//       bgColor: 'bg-blue-100',
//       textColor: 'text-blue-600',
//       icon: Server,
//       docs: 'https://www.twilio.com/docs'
//     },
//     smpp: { 
//       name: 'SMPP', 
//       color: 'green', 
//       bgColor: 'bg-green-100',
//       textColor: 'text-green-600',
//       icon: Wifi,
//       docs: '#'
//     },
//     custom: { 
//       name: 'Custom API', 
//       color: 'purple', 
//       bgColor: 'bg-purple-100',
//       textColor: 'text-purple-600',
//       icon: Settings,
//       docs: '#'
//     }
//   }), []);

//   // Filter gateways
//   const filteredGateways = useMemo(() => {
//     let filtered = gateways;

//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(g =>
//         g.name?.toLowerCase().includes(term) ||
//         g.gateway_type?.toLowerCase().includes(term) ||
//         g.sender_id?.toLowerCase().includes(term)
//       );
//     }

//     if (statusFilter !== 'all') {
//       if (statusFilter === 'online') {
//         filtered = filtered.filter(g => g.is_online);
//       } else if (statusFilter === 'offline') {
//         filtered = filtered.filter(g => !g.is_online);
//       } else if (statusFilter === 'active') {
//         filtered = filtered.filter(g => g.is_active);
//       } else if (statusFilter === 'inactive') {
//         filtered = filtered.filter(g => !g.is_active);
//       } else if (Object.keys(gatewayTypes).includes(statusFilter)) {
//         filtered = filtered.filter(g => g.gateway_type === statusFilter);
//       }
//     }

//     return filtered;
//   }, [gateways, searchTerm, statusFilter, gatewayTypes]);

//   // Gateway statistics
//   const stats = useMemo(() => {
//     const total = gateways.length;
//     const online = gateways.filter(g => g.is_online).length;
//     const active = gateways.filter(g => g.is_active).length;
//     const healthy = gateways.filter(g => g.health_status === 'healthy').length;
//     const totalMessages = gateways.reduce((sum, g) => sum + (g.total_messages_sent || 0), 0);
//     const avgSuccessRate = gateways.length > 0
//       ? gateways.reduce((sum, g) => sum + (g.success_rate || 0), 0) / gateways.length
//       : 0;

//     return { total, online, active, healthy, totalMessages, avgSuccessRate };
//   }, [gateways]);

//   // Get health badge
//   const getHealthBadge = (status) => {
//     const configs = {
//       healthy: { 
//         color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', 
//         icon: CheckCircle,
//         label: 'Healthy'
//       },
//       offline: { 
//         color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', 
//         icon: WifiOff,
//         label: 'Offline'
//       },
//       no_balance: { 
//         color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', 
//         icon: AlertTriangle,
//         label: 'No Balance'
//       },
//       poor_performance: { 
//         color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', 
//         icon: Activity,
//         label: 'Poor Performance'
//       },
//       inactive: { 
//         color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', 
//         icon: Power,
//         label: 'Inactive'
//       }
//     };

//     const config = configs[status] || configs.inactive;
//     const Icon = config.icon;

//     return (
//       <span className={`px-3 py-1 rounded-full text-xs flex items-center gap-1.5 ${config.color}`}>
//         <Icon className="w-3 h-3" />
//         {config.label}
//       </span>
//     );
//   };

//   const handleTestConnection = async (gatewayId) => {
//     setTesting(prev => new Set([...prev, gatewayId]));
//     try {
//       await onTestConnection(gatewayId);
//       onRefresh();
//     } catch (error) {
//       console.error('Test connection failed:', error);
//     } finally {
//       setTesting(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(gatewayId);
//         return newSet;
//       });
//     }
//   };

//   const handleToggleActive = async (gatewayId) => {
//     try {
//       await onToggleActive(gatewayId);
//       onRefresh();
//     } catch (error) {
//       console.error('Toggle failed:', error);
//     }
//   };

//   const handleSetDefault = async (gatewayId) => {
//     try {
//       await onSetDefault(gatewayId);
//       onRefresh();
//     } catch (error) {
//       console.error('Set default failed:', error);
//     }
//   };

//   const handleDelete = async () => {
//     if (!gatewayToDelete) return;
//     try {
//       await onDelete(gatewayToDelete.id);
//       onRefresh();
//       setShowDeleteModal(false);
//       setGatewayToDelete(null);
//     } catch (error) {
//       console.error('Delete failed:', error);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
//         <span className={`ml-3 ${themeClasses.text.secondary}`}>Loading gateways...</span>
//       </div>
//     );
//   }

//   if (filteredGateways.length === 0) {
//     return (
//       <EmptyState
//         icon={Server}
//         title="No gateways found"
//         description={searchTerm || statusFilter !== 'all'
//           ? "No gateways match your search criteria"
//           : "Add your first SMS gateway to get started"
//         }
//         actionLabel="Add Gateway"
//         onAction={() => { }}
//         theme={theme}
//       />
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {/* Statistics - Responsive grid */}
//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//         <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>Total Gateways</p>
//           <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>{stats.total}</p>
//         </div>
//         <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>Online</p>
//           <p className={`text-2xl font-bold text-green-500`}>{stats.online}</p>
//         </div>
//         <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>Healthy</p>
//           <p className={`text-2xl font-bold text-indigo-500`}>{stats.healthy}</p>
//         </div>
//         <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>Total Messages</p>
//           <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>{formatNumber(stats.totalMessages)}</p>
//         </div>
//       </div>

//       {/* Gateway Grid/List - Responsive */}
//       {viewMode === 'grid' ? (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {filteredGateways.map((gateway) => {
//             const typeConfig = gatewayTypes[gateway.gateway_type] || gatewayTypes.custom;
//             const TypeIcon = typeConfig.icon;
//             const successRate = gateway.success_rate || 0;

//             return (
//               <motion.div
//                 key={gateway.id}
//                 layout
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 className={`p-5 rounded-lg border transition-all hover:shadow-lg ${
//                   themeClasses.bg.card
//                 } ${themeClasses.border.light} ${
//                   gateway.is_default ? 'ring-2 ring-indigo-500' : ''
//                 } ${expandedGateway === gateway.id ? 'ring-2 ring-indigo-500' : ''}`}
//               >
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="flex items-center gap-3">
//                     <div className={`p-2.5 rounded-xl ${typeConfig.bgColor} ${typeConfig.textColor}`}>
//                       <TypeIcon className="w-5 h-5" />
//                     </div>
//                     <div>
//                       <h3 className={`font-medium flex items-center gap-2 ${themeClasses.text.primary}`}>
//                         {gateway.name}
//                         {gateway.is_default && (
//                           <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full">
//                             Default
//                           </span>
//                         )}
//                       </h3>
//                       <p className={`text-xs ${themeClasses.text.secondary}`}>
//                         {typeConfig.name}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-1">
//                     <button
//                       onClick={() => handleTestConnection(gateway.id)}
//                       disabled={testing.has(gateway.id)}
//                       className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//                       title="Test connection"
//                     >
//                       {testing.has(gateway.id) ? (
//                         <Loader className="w-4 h-4 animate-spin" />
//                       ) : (
//                         <RefreshCw className="w-4 h-4" />
//                       )}
//                     </button>

//                     <button
//                       onClick={() => setExpandedGateway(expandedGateway === gateway.id ? null : gateway.id)}
//                       className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//                     >
//                       {expandedGateway === gateway.id ? (
//                         <ChevronUp className="w-4 h-4" />
//                       ) : (
//                         <ChevronDown className="w-4 h-4" />
//                       )}
//                     </button>
//                   </div>
//                 </div>

//                 <div className="flex items-center justify-between mb-4">
//                   {getHealthBadge(gateway.health_status)}
//                   <span className={`font-mono text-lg font-bold ${gateway.balance > 0 ? 'text-green-500' : 'text-red-500'}`}>
//                     {formatCurrency(gateway.balance, gateway.currency)}
//                   </span>
//                 </div>

//                 <div className="mb-4">
//                   <div className="flex items-center justify-between text-xs mb-1">
//                     <span className={themeClasses.text.secondary}>Success Rate</span>
//                     <span className={`font-medium ${
//                       successRate >= 80 ? 'text-green-500' :
//                       successRate >= 60 ? 'text-yellow-500' : 'text-red-500'
//                     }`}>
//                       {formatPercentage(successRate)}
//                     </span>
//                   </div>
//                   <div className={`w-full h-2 rounded-full ${themeClasses.bg.secondary}`}>
//                     <div
//                       className={`h-2 rounded-full transition-all ${
//                         successRate >= 80 ? 'bg-green-500' :
//                         successRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
//                       }`}
//                       style={{ width: `${Math.min(successRate, 100)}%` }}
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-2 mb-4">
//                   <div className={`p-2 rounded-lg ${themeClasses.bg.secondary}`}>
//                     <p className={`text-xs ${themeClasses.text.secondary}`}>Messages</p>
//                     <p className={`text-sm font-medium ${themeClasses.text.primary}`}>
//                       {formatNumber(gateway.total_messages_sent || 0)}
//                     </p>
//                   </div>
//                   <div className={`p-2 rounded-lg ${themeClasses.bg.secondary}`}>
//                     <p className={`text-xs ${themeClasses.text.secondary}`}>Cost/SMS</p>
//                     <p className={`text-sm font-medium ${themeClasses.text.primary}`}>
//                       {formatCurrency(gateway.cost_per_message, gateway.currency)}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => handleSetDefault(gateway.id)}
//                     disabled={gateway.is_default}
//                     className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm ${
//                       gateway.is_default
//                         ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800'
//                         : themeClasses.button.primary
//                     }`}
//                   >
//                     <CheckCircle className="w-4 h-4" />
//                     {gateway.is_default ? 'Default' : 'Set Default'}
//                   </button>

//                   <button
//                     onClick={() => handleToggleActive(gateway.id)}
//                     className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm ${
//                       gateway.is_active
//                         ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400'
//                         : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
//                     }`}
//                   >
//                     {gateway.is_active ? (
//                       <>
//                         <Power className="w-4 h-4" />
//                         <span className="hidden sm:inline">Deactivate</span>
//                       </>
//                     ) : (
//                       <>
//                         <Power className="w-4 h-4" />
//                         <span className="hidden sm:inline">Activate</span>
//                       </>
//                     )}
//                   </button>

//                   <button
//                     onClick={() => {
//                       setGatewayToDelete(gateway);
//                       setShowDeleteModal(true);
//                     }}
//                     className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm ${
//                       themeClasses.button.danger
//                     }`}
//                   >
//                     <Trash2 className="w-4 h-4" />
//                     <span className="hidden sm:inline">Delete</span>
//                   </button>
//                 </div>

//                 {/* Expanded Details */}
//                 {expandedGateway === gateway.id && (
//                   <motion.div
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: 'auto' }}
//                     exit={{ opacity: 0, height: 0 }}
//                     className={`mt-4 pt-4 border-t ${themeClasses.border.light}`}
//                   >
//                     <div className="space-y-3 text-sm">
//                       {/* Sender ID */}
//                       <div className="flex justify-between">
//                         <span className={themeClasses.text.secondary}>Sender ID:</span>
//                         <span className={`font-mono ${themeClasses.text.primary}`}>
//                           {gateway.sender_id || 'Default'}
//                         </span>
//                       </div>

//                       {/* Last Used */}
//                       {gateway.last_used && (
//                         <div className="flex justify-between">
//                           <span className={themeClasses.text.secondary}>Last Used:</span>
//                           <span className={themeClasses.text.primary}>
//                             {formatTimeAgo(gateway.last_used)}
//                           </span>
//                         </div>
//                       )}

//                       {/* Last Check */}
//                       {gateway.last_online_check && (
//                         <div className="flex justify-between">
//                           <span className={themeClasses.text.secondary}>Last Check:</span>
//                           <span className={themeClasses.text.primary}>
//                             {formatTimeAgo(gateway.last_online_check)}
//                           </span>
//                         </div>
//                       )}

//                       {/* API Key (masked) */}
//                       {gateway.api_key && (
//                         <div className="flex justify-between items-center">
//                           <span className={themeClasses.text.secondary}>API Key:</span>
//                           <div className="flex items-center gap-2">
//                             <span className={`font-mono ${themeClasses.text.primary}`}>
//                               {showApiKey[gateway.id] 
//                                 ? gateway.api_key 
//                                 : '••••••••' + (gateway.api_key?.slice(-4) || '')}
//                             </span>
//                             <button
//                               onClick={() => setShowApiKey(prev => ({ 
//                                 ...prev, 
//                                 [gateway.id]: !prev[gateway.id] 
//                               }))}
//                               className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
//                             >
//                               {showApiKey[gateway.id] ? (
//                                 <EyeOff className="w-3 h-3" />
//                               ) : (
//                                 <Eye className="w-3 h-3" />
//                               )}
//                             </button>
//                           </div>
//                         </div>
//                       )}

//                       {/* Rate Limits */}
//                       <div className={`pt-2 mt-2 border-t ${themeClasses.border.light}`}>
//                         <h4 className={`font-medium mb-2 text-xs uppercase tracking-wider ${themeClasses.text.secondary}`}>
//                           Rate Limits
//                         </h4>
//                         <div className="grid grid-cols-3 gap-2">
//                           <div className="text-center">
//                             <p className={`text-xs ${themeClasses.text.secondary}`}>Per Min</p>
//                             <p className={`font-medium ${themeClasses.text.primary}`}>
//                               {gateway.max_messages_per_minute || 60}
//                             </p>
//                           </div>
//                           <div className="text-center">
//                             <p className={`text-xs ${themeClasses.text.secondary}`}>Per Hour</p>
//                             <p className={`font-medium ${themeClasses.text.primary}`}>
//                               {gateway.max_messages_per_hour || 1000}
//                             </p>
//                           </div>
//                           <div className="text-center">
//                             <p className={`text-xs ${themeClasses.text.secondary}`}>Per Day</p>
//                             <p className={`font-medium ${themeClasses.text.primary}`}>
//                               {gateway.max_messages_per_day || 10000}
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </motion.div>
//                 )}
//               </motion.div>
//             );
//           })}
//         </div>
//       ) : (
//         <div className={`rounded-lg border overflow-x-auto ${themeClasses.border.light}`}>
//           <table className="w-full min-w-[800px]">
//             <thead className={themeClasses.bg.secondary}>
//               <tr>
//                 <th className="p-4 text-left text-xs font-medium">Gateway</th>
//                 <th className="p-4 text-left text-xs font-medium">Status</th>
//                 <th className="p-4 text-right text-xs font-medium">Balance</th>
//                 <th className="p-4 text-right text-xs font-medium">Success Rate</th>
//                 <th className="p-4 text-right text-xs font-medium">Messages</th>
//                 <th className="p-4 text-left text-xs font-medium">Last Used</th>
//                 <th className="p-4 text-center text-xs font-medium">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//               {filteredGateways.map((gateway) => {
//                 const typeConfig = gatewayTypes[gateway.gateway_type] || gatewayTypes.custom;
//                 const TypeIcon = typeConfig.icon;
//                 const successRate = gateway.success_rate || 0;

//                 return (
//                   <tr key={gateway.id} className={`hover:${themeClasses.bg.secondary} transition-colors`}>
//                     <td className="p-4">
//                       <div className="flex items-center gap-3">
//                         <div className={`p-2 rounded-lg ${typeConfig.bgColor} ${typeConfig.textColor}`}>
//                           <TypeIcon className="w-4 h-4" />
//                         </div>
//                         <div>
//                           <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
//                             {gateway.name}
//                           </span>
//                           {gateway.is_default && (
//                             <span className="ml-2 px-1.5 py-0.5 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 rounded">
//                               Default
//                             </span>
//                           )}
//                           <p className={`text-xs ${themeClasses.text.secondary}`}>
//                             {typeConfig.name} • {gateway.sender_id || 'No Sender ID'}
//                           </p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="p-4">
//                       <div className="flex items-center gap-2">
//                         <div className={`w-2 h-2 rounded-full ${gateway.is_online ? 'bg-green-500' : 'bg-red-500'}`} />
//                         <span className={`text-sm ${gateway.is_online ? 'text-green-500' : 'text-red-500'}`}>
//                           {gateway.is_online ? 'Online' : 'Offline'}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="p-4 text-right">
//                       <span className={`text-sm font-mono font-medium ${
//                         gateway.balance > 0 ? 'text-green-500' : 'text-red-500'
//                       }`}>
//                         {formatCurrency(gateway.balance, gateway.currency)}
//                       </span>
//                     </td>
//                     <td className="p-4 text-right">
//                       <span className={`text-sm font-medium ${
//                         successRate >= 80 ? 'text-green-500' :
//                         successRate >= 60 ? 'text-yellow-500' : 'text-red-500'
//                       }`}>
//                         {formatPercentage(successRate)}
//                       </span>
//                     </td>
//                     <td className="p-4 text-right text-sm">
//                       {formatNumber(gateway.total_messages_sent || 0)}
//                     </td>
//                     <td className="p-4 text-sm">
//                       {gateway.last_used ? formatTimeAgo(gateway.last_used) : 'Never'}
//                     </td>
//                     <td className="p-4">
//                       <div className="flex items-center justify-center gap-2">
//                         <button
//                           onClick={() => handleTestConnection(gateway.id)}
//                           className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
//                           title="Test connection"
//                         >
//                           <RefreshCw className="w-4 h-4" />
//                         </button>
//                         <button
//                           onClick={() => handleToggleActive(gateway.id)}
//                           className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
//                           title={gateway.is_active ? 'Deactivate' : 'Activate'}
//                         >
//                           {gateway.is_active ? (
//                             <Power className="w-4 h-4 text-yellow-500" />
//                           ) : (
//                             <Power className="w-4 h-4 text-green-500" />
//                           )}
//                         </button>
//                         <button
//                           onClick={() => handleSetDefault(gateway.id)}
//                           className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
//                           title="Set as default"
//                         >
//                           <CheckCircle className="w-4 h-4" />
//                         </button>
//                         <button
//                           onClick={() => {
//                             setGatewayToDelete(gateway);
//                             setShowDeleteModal(true);
//                           }}
//                           className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
//                           title="Delete"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       <AnimatePresence>
//         {showDeleteModal && (
//           <ConfirmationModal
//             isOpen={showDeleteModal}
//             onClose={() => {
//               setShowDeleteModal(false);
//               setGatewayToDelete(null);
//             }}
//             onConfirm={handleDelete}
//             title="Delete Gateway"
//             message={`Are you sure you want to delete "${gatewayToDelete?.name}"? This action cannot be undone.`}
//             type="danger"
//             theme={theme}
//           />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default GatewayManager;









import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server, Wifi, WifiOff, Settings, RefreshCw, Power,
  AlertTriangle, CheckCircle, XCircle, Edit, Trash2,
  Plus, Loader, Shield, Battery, Globe, Activity,
  DollarSign, Clock, BarChart3, ChevronDown, ChevronUp,
  Eye, EyeOff, Filter, Search, Copy
} from 'lucide-react';
import { EnhancedSelect, ConfirmationModal, EmptyState, getThemeClasses } from '../../../components/ServiceManagement/Shared/components';
import { formatCurrency, formatNumber, formatTimeAgo, formatPercentage } from '../utils/formatters';

const GatewayManager = ({
  gateways = [],
  loading,
  theme,
  themeClasses,
  onRefresh,
  onCreateClick,
  onTestConnection,
  onSetDefault,
  onToggleActive,
  onEdit,
  onDelete,
  viewMode = 'grid',
  searchTerm = '',
  statusFilter = 'all'
}) => {
  const [expandedGateway, setExpandedGateway] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gatewayToDelete, setGatewayToDelete] = useState(null);
  const [testing, setTesting] = useState(new Set());
  const [showApiKey, setShowApiKey] = useState({});

  // Gateway type configuration
  const gatewayTypes = useMemo(() => ({
    africas_talking: { 
      name: "Africa's Talking", 
      color: 'orange', 
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      icon: Globe,
      docs: 'https://developers.africastalking.com/docs'
    },
    twilio: { 
      name: 'Twilio', 
      color: 'blue', 
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      icon: Server,
      docs: 'https://www.twilio.com/docs'
    },
    smpp: { 
      name: 'SMPP', 
      color: 'green', 
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      icon: Wifi,
      docs: '#'
    },
    custom: { 
      name: 'Custom API', 
      color: 'purple', 
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      icon: Settings,
      docs: '#'
    }
  }), []);

  // Filter gateways
  const filteredGateways = useMemo(() => {
    let filtered = gateways;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(g =>
        g.name?.toLowerCase().includes(term) ||
        g.gateway_type?.toLowerCase().includes(term) ||
        g.sender_id?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'online') {
        filtered = filtered.filter(g => g.is_online);
      } else if (statusFilter === 'offline') {
        filtered = filtered.filter(g => !g.is_online);
      } else if (statusFilter === 'active') {
        filtered = filtered.filter(g => g.is_active);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(g => !g.is_active);
      } else if (Object.keys(gatewayTypes).includes(statusFilter)) {
        filtered = filtered.filter(g => g.gateway_type === statusFilter);
      }
    }

    return filtered;
  }, [gateways, searchTerm, statusFilter, gatewayTypes]);

  // Gateway statistics
  const stats = useMemo(() => {
    const total = gateways.length;
    const online = gateways.filter(g => g.is_online).length;
    const active = gateways.filter(g => g.is_active).length;
    const healthy = gateways.filter(g => g.health_status === 'healthy').length;
    const totalMessages = gateways.reduce((sum, g) => sum + (g.total_messages_sent || 0), 0);
    const avgSuccessRate = gateways.length > 0
      ? gateways.reduce((sum, g) => sum + (g.success_rate || 0), 0) / gateways.length
      : 0;

    return { total, online, active, healthy, totalMessages, avgSuccessRate };
  }, [gateways]);

  // Get health badge
  const getHealthBadge = (status) => {
    const configs = {
      healthy: { 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', 
        icon: CheckCircle,
        label: 'Healthy'
      },
      offline: { 
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', 
        icon: WifiOff,
        label: 'Offline'
      },
      no_balance: { 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', 
        icon: AlertTriangle,
        label: 'No Balance'
      },
      poor_performance: { 
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', 
        icon: Activity,
        label: 'Poor Performance'
      },
      inactive: { 
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', 
        icon: Power,
        label: 'Inactive'
      }
    };

    const config = configs[status] || configs.inactive;
    const Icon = config.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-xs flex items-center gap-1.5 ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const handleTestConnection = async (gatewayId) => {
    setTesting(prev => new Set([...prev, gatewayId]));
    try {
      await onTestConnection(gatewayId);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Test connection failed:', error);
    } finally {
      setTesting(prev => {
        const newSet = new Set(prev);
        newSet.delete(gatewayId);
        return newSet;
      });
    }
  };

  const handleToggleActive = async (gatewayId) => {
    try {
      await onToggleActive(gatewayId);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Toggle failed:', error);
    }
  };

  const handleSetDefault = async (gatewayId) => {
    try {
      await onSetDefault(gatewayId);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Set default failed:', error);
    }
  };

  const handleDelete = async () => {
    if (!gatewayToDelete) return;
    try {
      await onDelete(gatewayToDelete.id);
      if (onRefresh) onRefresh();
      setShowDeleteModal(false);
      setGatewayToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className={`ml-3 ${themeClasses.text.secondary}`}>Loading gateways...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-xl font-bold ${themeClasses.text.primary}`}>
            Gateways
          </h2>
          <p className={`text-sm ${themeClasses.text.secondary}`}>
            {filteredGateways.length} gateway{filteredGateways.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button
          onClick={onCreateClick}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-medium flex items-center gap-2 hover:shadow-lg hover:scale-105 transition-all"
        >
          <Plus size={18} />
          Add Gateway
        </button>
      </div>

      {/* Statistics - Responsive grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
          <p className={`text-xs ${themeClasses.text.secondary}`}>Total Gateways</p>
          <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>{stats.total}</p>
        </div>
        <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
          <p className={`text-xs ${themeClasses.text.secondary}`}>Online</p>
          <p className={`text-2xl font-bold text-green-500`}>{stats.online}</p>
        </div>
        <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
          <p className={`text-xs ${themeClasses.text.secondary}`}>Healthy</p>
          <p className={`text-2xl font-bold text-indigo-500`}>{stats.healthy}</p>
        </div>
        <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
          <p className={`text-xs ${themeClasses.text.secondary}`}>Total Messages</p>
          <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>{formatNumber(stats.totalMessages)}</p>
        </div>
      </div>

      {/* Gateway Grid/List */}
      {filteredGateways.length === 0 ? (
        <EmptyState
          icon={Server}
          title="No gateways found"
          description={searchTerm || statusFilter !== 'all'
            ? "No gateways match your search criteria"
            : "Add your first SMS gateway to get started"
          }
          actionLabel="Add Gateway"
          onAction={onCreateClick}
          theme={theme}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGateways.map((gateway) => {
            const typeConfig = gatewayTypes[gateway.gateway_type] || gatewayTypes.custom;
            const TypeIcon = typeConfig.icon;
            const successRate = gateway.success_rate || 0;

            return (
              <motion.div
                key={gateway.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`p-5 rounded-lg border transition-all hover:shadow-lg ${
                  themeClasses.bg.card
                } ${themeClasses.border.light} ${
                  gateway.is_default ? 'ring-2 ring-indigo-500' : ''
                } ${expandedGateway === gateway.id ? 'ring-2 ring-indigo-500' : ''}`}
              >
                {/* Gateway card content - keep existing */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${typeConfig.bgColor} ${typeConfig.textColor}`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`font-medium flex items-center gap-2 ${themeClasses.text.primary}`}>
                        {gateway.name}
                        {gateway.is_default && (
                          <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full">
                            Default
                          </span>
                        )}
                      </h3>
                      <p className={`text-xs ${themeClasses.text.secondary}`}>
                        {typeConfig.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTestConnection(gateway.id)}
                      disabled={testing.has(gateway.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Test connection"
                    >
                      {testing.has(gateway.id) ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => setExpandedGateway(expandedGateway === gateway.id ? null : gateway.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {expandedGateway === gateway.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  {getHealthBadge(gateway.health_status)}
                  <span className={`font-mono text-lg font-bold ${gateway.balance > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(gateway.balance, gateway.currency)}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={themeClasses.text.secondary}>Success Rate</span>
                    <span className={`font-medium ${
                      successRate >= 80 ? 'text-green-500' :
                      successRate >= 60 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {formatPercentage(successRate)}
                    </span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${themeClasses.bg.secondary}`}>
                    <div
                      className={`h-2 rounded-full transition-all ${
                        successRate >= 80 ? 'bg-green-500' :
                        successRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(successRate, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className={`p-2 rounded-lg ${themeClasses.bg.secondary}`}>
                    <p className={`text-xs ${themeClasses.text.secondary}`}>Messages</p>
                    <p className={`text-sm font-medium ${themeClasses.text.primary}`}>
                      {formatNumber(gateway.total_messages_sent || 0)}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${themeClasses.bg.secondary}`}>
                    <p className={`text-xs ${themeClasses.text.secondary}`}>Cost/SMS</p>
                    <p className={`text-sm font-medium ${themeClasses.text.primary}`}>
                      {formatCurrency(gateway.cost_per_message, gateway.currency)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleSetDefault(gateway.id)}
                    disabled={gateway.is_default}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      gateway.is_default
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800'
                        : themeClasses.button.primary
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {gateway.is_default ? 'Default' : 'Set Default'}
                  </button>

                  <button
                    onClick={() => handleToggleActive(gateway.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      gateway.is_active
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                    }`}
                  >
                    {gateway.is_active ? (
                      <>
                        <Power className="w-4 h-4" />
                        <span className="hidden sm:inline">Deactivate</span>
                      </>
                    ) : (
                      <>
                        <Power className="w-4 h-4" />
                        <span className="hidden sm:inline">Activate</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setGatewayToDelete(gateway);
                      setShowDeleteModal(true);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      themeClasses.button.danger
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>

                {/* Expanded Details */}
                {expandedGateway === gateway.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`mt-4 pt-4 border-t ${themeClasses.border.light}`}
                  >
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className={themeClasses.text.secondary}>Sender ID:</span>
                        <span className={`font-mono ${themeClasses.text.primary}`}>
                          {gateway.sender_id || 'Default'}
                        </span>
                      </div>

                      {gateway.last_used && (
                        <div className="flex justify-between">
                          <span className={themeClasses.text.secondary}>Last Used:</span>
                          <span className={themeClasses.text.primary}>
                            {formatTimeAgo(gateway.last_used)}
                          </span>
                        </div>
                      )}

                      {gateway.last_online_check && (
                        <div className="flex justify-between">
                          <span className={themeClasses.text.secondary}>Last Check:</span>
                          <span className={themeClasses.text.primary}>
                            {formatTimeAgo(gateway.last_online_check)}
                          </span>
                        </div>
                      )}

                      {gateway.api_key && (
                        <div className="flex justify-between items-center">
                          <span className={themeClasses.text.secondary}>API Key:</span>
                          <div className="flex items-center gap-2">
                            <span className={`font-mono ${themeClasses.text.primary}`}>
                              {showApiKey[gateway.id] 
                                ? gateway.api_key 
                                : '••••••••' + (gateway.api_key?.slice(-4) || '')}
                            </span>
                            <button
                              onClick={() => setShowApiKey(prev => ({ 
                                ...prev, 
                                [gateway.id]: !prev[gateway.id] 
                              }))}
                              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              {showApiKey[gateway.id] ? (
                                <EyeOff className="w-3 h-3" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      <div className={`pt-2 mt-2 border-t ${themeClasses.border.light}`}>
                        <h4 className={`font-medium mb-2 text-xs uppercase tracking-wider ${themeClasses.text.secondary}`}>
                          Rate Limits
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center">
                            <p className={`text-xs ${themeClasses.text.secondary}`}>Per Min</p>
                            <p className={`font-medium ${themeClasses.text.primary}`}>
                              {gateway.max_messages_per_minute || 60}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className={`text-xs ${themeClasses.text.secondary}`}>Per Hour</p>
                            <p className={`font-medium ${themeClasses.text.primary}`}>
                              {gateway.max_messages_per_hour || 1000}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className={`text-xs ${themeClasses.text.secondary}`}>Per Day</p>
                            <p className={`font-medium ${themeClasses.text.primary}`}>
                              {gateway.max_messages_per_day || 10000}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className={`rounded-lg border overflow-x-auto ${themeClasses.border.light}`}>
          <table className="w-full min-w-[800px]">
            <thead className={themeClasses.bg.secondary}>
              <tr>
                <th className="p-4 text-left text-xs font-medium">Gateway</th>
                <th className="p-4 text-left text-xs font-medium">Status</th>
                <th className="p-4 text-right text-xs font-medium">Balance</th>
                <th className="p-4 text-right text-xs font-medium">Success Rate</th>
                <th className="p-4 text-right text-xs font-medium">Messages</th>
                <th className="p-4 text-left text-xs font-medium">Last Used</th>
                <th className="p-4 text-center text-xs font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredGateways.map((gateway) => {
                const typeConfig = gatewayTypes[gateway.gateway_type] || gatewayTypes.custom;
                const TypeIcon = typeConfig.icon;
                const successRate = gateway.success_rate || 0;

                return (
                  <tr key={gateway.id} className={`hover:${themeClasses.bg.secondary} transition-colors`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${typeConfig.bgColor} ${typeConfig.textColor}`}>
                          <TypeIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
                            {gateway.name}
                          </span>
                          {gateway.is_default && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 rounded">
                              Default
                            </span>
                          )}
                          <p className={`text-xs ${themeClasses.text.secondary}`}>
                            {typeConfig.name} • {gateway.sender_id || 'No Sender ID'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${gateway.is_online ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={`text-sm ${gateway.is_online ? 'text-green-500' : 'text-red-500'}`}>
                          {gateway.is_online ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`text-sm font-mono font-medium ${
                        gateway.balance > 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {formatCurrency(gateway.balance, gateway.currency)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`text-sm font-medium ${
                        successRate >= 80 ? 'text-green-500' :
                        successRate >= 60 ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {formatPercentage(successRate)}
                      </span>
                    </td>
                    <td className="p-4 text-right text-sm">
                      {formatNumber(gateway.total_messages_sent || 0)}
                    </td>
                    <td className="p-4 text-sm">
                      {gateway.last_used ? formatTimeAgo(gateway.last_used) : 'Never'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleTestConnection(gateway.id)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Test connection"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(gateway.id)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          title={gateway.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {gateway.is_active ? (
                            <Power className="w-4 h-4 text-yellow-500" />
                          ) : (
                            <Power className="w-4 h-4 text-green-500" />
                          )}
                        </button>
                        <button
                          onClick={() => handleSetDefault(gateway.id)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Set as default"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setGatewayToDelete(gateway);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <ConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setGatewayToDelete(null);
            }}
            onConfirm={handleDelete}
            title="Delete Gateway"
            message={`Are you sure you want to delete "${gatewayToDelete?.name}"? This action cannot be undone.`}
            type="danger"
            theme={theme}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GatewayManager;