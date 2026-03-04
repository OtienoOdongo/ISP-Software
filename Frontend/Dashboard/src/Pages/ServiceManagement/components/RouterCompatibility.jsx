// // src/components/ServiceOperations/RouterCompatibility.jsx
// import React, { useState, useMemo, useCallback } from 'react';
// import { motion } from 'framer-motion';
// import {
//   Wifi, Cable, Check, X, AlertTriangle, Search, Filter,
//   Server, Globe, MapPin, Tag, RefreshCw, Download,
//   ChevronDown, ChevronUp, Info, Zap, Clock
// } from 'lucide-react';
// import { API_ENDPOINTS } from './constants';
// import { useApi } from './hooks/useApi';
// import { useDebounce } from './hooks/useDebounce';
// import { getThemeClasses } from '../../../components/ServiceManagement/Shared/components';
// import { TableSkeleton } from './common/TableSkeleton';
// import { ErrorBoundary } from './common/ErrorBoundary';

// const RouterCompatibility = ({ plans = [], routers = [], theme, addNotification }) => {
//   const themeClasses = getThemeClasses(theme);
  
//   // State
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterAccess, setFilterAccess] = useState('all');
//   const [filterCategory, setFilterCategory] = useState('all');
//   const [filterRouterSpecific, setFilterRouterSpecific] = useState('all');
//   const [expandedPlan, setExpandedPlan] = useState(null);
//   const [selectedRouter, setSelectedRouter] = useState(null);
//   const [viewMode, setViewMode] = useState('matrix'); // 'matrix', 'grid', 'list'
  
//   // Debounced search
//   const debouncedSearch = useDebounce(searchTerm, 300);
  
//   // Fetch data if not provided as props
//   const { data: fetchedPlans, loading: plansLoading } = useApi(
//     API_ENDPOINTS.INTERNET_PLANS,
//     { cacheKey: 'plans', cache: true }
//   );
  
//   const { data: fetchedRouters, loading: routersLoading } = useApi(
//     API_ENDPOINTS.NETWORK_ROUTERS,
//     { cacheKey: 'routers', cache: true }
//   );
  
//   // Use props if provided, otherwise use fetched data
//   const effectivePlans = plans.length > 0 ? plans : (fetchedPlans || []);
//   const effectiveRouters = routers.length > 0 ? routers : (fetchedRouters || []);
  
//   // Get unique categories
//   const categories = useMemo(() => {
//     const cats = new Set(effectivePlans.map(p => p.category).filter(Boolean));
//     return Array.from(cats).sort();
//   }, [effectivePlans]);
  
//   // Filter plans
//   const filteredPlans = useMemo(() => {
//     return effectivePlans.filter(plan => {
//       // Search filter
//       const matchesSearch = debouncedSearch === '' ||
//         plan.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
//         plan.category?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
//         plan.description?.toLowerCase().includes(debouncedSearch.toLowerCase());
      
//       // Access method filter
//       const matchesAccess = filterAccess === 'all' ||
//         (filterAccess === 'hotspot' && plan.accessType === 'hotspot') ||
//         (filterAccess === 'pppoe' && plan.accessType === 'pppoe') ||
//         (filterAccess === 'dual' && plan.accessType === 'dual');
      
//       // Category filter
//       const matchesCategory = filterCategory === 'all' || plan.category === filterCategory;
      
//       // Router-specific filter
//       const matchesRouterSpecific = filterRouterSpecific === 'all' ||
//         (filterRouterSpecific === 'specific' && plan.router_specific) ||
//         (filterRouterSpecific === 'global' && !plan.router_specific);
      
//       return matchesSearch && matchesAccess && matchesCategory && matchesRouterSpecific;
//     });
//   }, [effectivePlans, debouncedSearch, filterAccess, filterCategory, filterRouterSpecific]);
  
//   // Calculate compatibility matrix
//   const compatibilityMatrix = useMemo(() => {
//     const matrix = {};
    
//     filteredPlans.forEach(plan => {
//       matrix[plan.id] = {};
//       effectiveRouters.forEach(router => {
//         const isHotspot = plan.accessType === 'hotspot' || plan.accessType === 'dual';
//         const isPPPoE = plan.accessType === 'pppoe' || plan.accessType === 'dual';
//         const routerSpecific = plan.router_specific;
//         const allowedIds = plan.allowed_routers_ids || [];
        
//         // Check compatibility
//         let compatible = true;
//         let reasons = [];
        
//         if (routerSpecific && !allowedIds.includes(router.id)) {
//           compatible = false;
//           reasons.push('Router not in allowed list');
//         }
        
//         if (router.type === 'hotspot' && !isHotspot) {
//           compatible = false;
//           reasons.push('Router only supports hotspot');
//         }
        
//         if (router.type === 'pppoe' && !isPPPoE) {
//           compatible = false;
//           reasons.push('Router only supports PPPoE');
//         }
        
//         matrix[plan.id][router.id] = {
//           compatible,
//           reasons,
//           allowed: allowedIds.includes(router.id),
//         };
//       });
//     });
    
//     return matrix;
//   }, [filteredPlans, effectiveRouters]);
  
//   // Get router status color
//   const getRouterStatusColor = useCallback((status) => {
//     const statusMap = {
//       connected: 'bg-green-500',
//       disconnected: 'bg-red-500',
//       connecting: 'bg-yellow-500',
//       error: 'bg-orange-500',
//       maintenance: 'bg-purple-500',
//     };
//     return statusMap[status] || 'bg-gray-500';
//   }, []);
  
//   // Export compatibility report
//   const exportReport = useCallback(() => {
//     const headers = ['Plan', 'Category', 'Access Type', 'Router Specific', ...effectiveRouters.map(r => r.name)];
//     const rows = filteredPlans.map(plan => [
//       plan.name,
//       plan.category || 'N/A',
//       plan.accessType || 'N/A',
//       plan.router_specific ? 'Yes' : 'No',
//       ...effectiveRouters.map(router => {
//         const compatible = compatibilityMatrix[plan.id]?.[router.id]?.compatible;
//         return compatible ? 'Compatible' : 'Incompatible';
//       }),
//     ]);
    
//     const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `compatibility-matrix-${new Date().toISOString().split('T')[0]}.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);
    
//     addNotification({ type: 'success', message: 'Compatibility report exported successfully' });
//   }, [filteredPlans, effectiveRouters, compatibilityMatrix, addNotification]);
  
//   if (plansLoading || routersLoading) {
//     return <TableSkeleton rows={10} columns={effectiveRouters.length + 4} />;
//   }
  
//   if (effectivePlans.length === 0 || effectiveRouters.length === 0) {
//     return (
//       <div className={`p-12 text-center rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//         <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
//         <h3 className="text-xl font-bold mb-2">No Data Available</h3>
//         <p className="text-gray-600 mb-4">
//           {effectivePlans.length === 0 ? 'No plans configured' : 'No routers configured'}
//         </p>
//         <button
//           onClick={() => window.location.reload()}
//           className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//         >
//           Refresh
//         </button>
//       </div>
//     );
//   }
  
//   return (
//     <ErrorBoundary>
//       <div className={`space-y-6 ${themeClasses.bg.primary}`}>
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//           <div>
//             <h2 className="text-2xl font-bold">Router & Plan Compatibility Matrix</h2>
//             <p className="text-sm text-gray-600 mt-1">
//               Check which plans work with which routers
//             </p>
//           </div>
          
//           <div className="flex gap-3">
//             {/* View Toggle */}
//             <div className="flex border rounded-lg overflow-hidden">
//               <button
//                 onClick={() => setViewMode('matrix')}
//                 className={`px-4 py-2 text-sm font-medium ${
//                   viewMode === 'matrix'
//                     ? 'bg-indigo-600 text-white'
//                     : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'
//                 }`}
//               >
//                 Matrix
//               </button>
//               <button
//                 onClick={() => setViewMode('grid')}
//                 className={`px-4 py-2 text-sm font-medium ${
//                   viewMode === 'grid'
//                     ? 'bg-indigo-600 text-white'
//                     : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'
//                 }`}
//               >
//                 Grid
//               </button>
//               <button
//                 onClick={() => setViewMode('list')}
//                 className={`px-4 py-2 text-sm font-medium ${
//                   viewMode === 'list'
//                     ? 'bg-indigo-600 text-white'
//                     : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'
//                 }`}
//               >
//                 List
//               </button>
//             </div>
            
//             <button
//               onClick={exportReport}
//               className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
//             >
//               <Download className="w-4 h-4" />
//               Export
//             </button>
//           </div>
//         </div>
        
//         {/* Summary Stats */}
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//           <div className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//             <div className="text-2xl font-bold text-blue-600">{effectivePlans.length}</div>
//             <div className="text-sm text-gray-600">Total Plans</div>
//           </div>
//           <div className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//             <div className="text-2xl font-bold text-green-600">
//               {effectivePlans.filter(p => !p.router_specific).length}
//             </div>
//             <div className="text-sm text-gray-600">Global Plans</div>
//           </div>
//           <div className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//             <div className="text-2xl font-bold text-purple-600">
//               {effectivePlans.filter(p => p.router_specific).length}
//             </div>
//             <div className="text-sm text-gray-600">Router-Specific</div>
//           </div>
//           <div className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//             <div className="text-2xl font-bold text-orange-600">{effectiveRouters.length}</div>
//             <div className="text-sm text-gray-600">Routers</div>
//           </div>
//         </div>
        
//         {/* Filters */}
//         <div className="flex flex-col lg:flex-row gap-4">
//           {/* Search */}
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search plans by name or category..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className={`pl-10 pr-4 py-3 rounded-lg border ${themeClasses.input} w-full`}
//             />
//           </div>
          
//           {/* Access Method Filter */}
//           <select
//             value={filterAccess}
//             onChange={(e) => setFilterAccess(e.target.value)}
//             className={`px-4 py-3 rounded-lg border ${themeClasses.input} min-w-40`}
//           >
//             <option value="all">All Access Methods</option>
//             <option value="hotspot">Hotspot Only</option>
//             <option value="pppoe">PPPoE Only</option>
//             <option value="dual">Dual Access</option>
//           </select>
          
//           {/* Category Filter */}
//           <select
//             value={filterCategory}
//             onChange={(e) => setFilterCategory(e.target.value)}
//             className={`px-4 py-3 rounded-lg border ${themeClasses.input} min-w-40`}
//           >
//             <option value="all">All Categories</option>
//             {categories.map(cat => (
//               <option key={cat} value={cat}>{cat}</option>
//             ))}
//           </select>
          
//           {/* Router-Specific Filter */}
//           <select
//             value={filterRouterSpecific}
//             onChange={(e) => setFilterRouterSpecific(e.target.value)}
//             className={`px-4 py-3 rounded-lg border ${themeClasses.input} min-w-40`}
//           >
//             <option value="all">All Plans</option>
//             <option value="specific">Router-Specific Only</option>
//             <option value="global">Global Plans Only</option>
//           </select>
//         </div>
        
//         {/* Results count */}
//         <div className="text-sm text-gray-600">
//           Showing {filteredPlans.length} of {effectivePlans.length} plans across {effectiveRouters.length} routers
//         </div>
        
//         {/* Compatibility Display */}
//         {viewMode === 'matrix' && (
//           <div className={`rounded-xl overflow-hidden shadow-lg ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//             <div className="overflow-x-auto">
//               <table className="w-full min-w-max">
//                 <thead className={`${themeClasses.bg.secondary}`}>
//                   <tr>
//                     <th className="p-4 text-left sticky left-0 bg-inherit z-10">Plan</th>
//                     <th className="p-4 text-left">Category</th>
//                     <th className="p-4 text-center">Access</th>
//                     <th className="p-4 text-center">Type</th>
//                     {effectiveRouters.map(router => (
//                       <th key={router.id} className="p-4 text-center min-w-32">
//                         <div className="flex flex-col items-center">
//                           <div className="flex items-center gap-1">
//                             <Server className="w-4 h-4" />
//                             <span>{router.name || router.hostname}</span>
//                           </div>
//                           <div className={`w-2 h-2 rounded-full ${getRouterStatusColor(router.status)} mt-1`} />
//                           <div className="text-xs text-gray-500 mt-1">{router.ip_address}</div>
//                           {router.location && (
//                             <div className="text-xs text-gray-500 flex items-center gap-1">
//                               <MapPin className="w-3 h-3" />
//                               {router.location}
//                             </div>
//                           )}
//                         </div>
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredPlans.map((plan, index) => (
//                     <React.Fragment key={plan.id}>
//                       <tr className={`border-t hover:bg-gray-50 dark:hover:bg-gray-800 ${index % 2 === 0 ? themeClasses.bg.card : ''}`}>
//                         <td className={`p-4 font-medium sticky left-0 bg-inherit`}>
//                           <div>
//                             <div>{plan.name}</div>
//                             <div className="text-xs text-gray-500 mt-1">{plan.id}</div>
//                           </div>
//                         </td>
//                         <td className="p-4">
//                           <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs">
//                             {plan.category || 'N/A'}
//                           </span>
//                         </td>
//                         <td className="p-4 text-center">
//                           <div className="flex items-center justify-center gap-1">
//                             {plan.accessType === 'hotspot' && <Wifi className="w-5 h-5 text-blue-600" />}
//                             {plan.accessType === 'pppoe' && <Cable className="w-5 h-5 text-green-600" />}
//                             {plan.accessType === 'dual' && (
//                               <>
//                                 <Wifi className="w-5 h-5 text-blue-600" />
//                                 <Cable className="w-5 h-5 text-green-600" />
//                               </>
//                             )}
//                           </div>
//                         </td>
//                         <td className="p-4 text-center">
//                           {plan.router_specific ? (
//                             <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
//                               Specific
//                             </span>
//                           ) : (
//                             <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
//                               Global
//                             </span>
//                           )}
//                         </td>
//                         {effectiveRouters.map(router => {
//                           const compatibility = compatibilityMatrix[plan.id]?.[router.id];
//                           return (
//                             <td key={router.id} className="p-4 text-center">
//                               {compatibility?.compatible ? (
//                                 <motion.div
//                                   whileHover={{ scale: 1.2 }}
//                                   className="inline-block cursor-help"
//                                   title={compatibility.reasons.join(', ') || 'Compatible'}
//                                 >
//                                   <Check className="w-6 h-6 text-green-500 mx-auto" />
//                                 </motion.div>
//                               ) : (
//                                 <motion.div
//                                   whileHover={{ scale: 1.2 }}
//                                   className="inline-block cursor-help"
//                                   title={compatibility?.reasons.join(', ') || 'Incompatible'}
//                                 >
//                                   <X className="w-6 h-6 text-red-500 mx-auto" />
//                                 </motion.div>
//                               )}
//                             </td>
//                           );
//                         })}
//                       </tr>
                      
//                       {/* Expanded row for additional plan details */}
//                       {expandedPlan === plan.id && (
//                         <tr>
//                           <td colSpan={effectiveRouters.length + 4} className="p-4 bg-gray-50 dark:bg-gray-900">
//                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                               <div>
//                                 <h4 className="font-medium text-sm mb-2">Description</h4>
//                                 <p className="text-sm text-gray-600">{plan.description || 'No description'}</p>
//                               </div>
//                               <div>
//                                 <h4 className="font-medium text-sm mb-2">Price</h4>
//                                 <p className="text-sm font-bold">KSH {plan.base_price || plan.price}</p>
//                               </div>
//                               <div>
//                                 <h4 className="font-medium text-sm mb-2">Allowed Routers</h4>
//                                 {plan.router_specific ? (
//                                   <div className="space-y-1">
//                                     {plan.allowed_routers_ids?.length > 0 ? (
//                                       plan.allowed_routers_ids.map(id => {
//                                         const router = effectiveRouters.find(r => r.id === id);
//                                         return (
//                                           <div key={id} className="text-sm flex items-center gap-2">
//                                             <Server className="w-3 h-3" />
//                                             {router?.name || id}
//                                           </div>
//                                         );
//                                       })
//                                     ) : (
//                                       <p className="text-sm text-gray-600">None specified</p>
//                                     )}
//                                   </div>
//                                 ) : (
//                                   <p className="text-sm text-gray-600">Global - All routers</p>
//                                 )}
//                               </div>
//                               <div>
//                                 <h4 className="font-medium text-sm mb-2">Technical Specs</h4>
//                                 <div className="text-sm space-y-1">
//                                   <div>Speed: {plan.download_speed}/{plan.upload_speed} Mbps</div>
//                                   <div>Data: {plan.data_limit}</div>
//                                   <div>Validity: {plan.validity_period}</div>
//                                 </div>
//                               </div>
//                             </div>
//                           </td>
//                         </tr>
//                       )}
//                     </React.Fragment>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
        
//         {viewMode === 'grid' && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {filteredPlans.map(plan => {
//               const compatibleCount = effectiveRouters.filter(r => 
//                 compatibilityMatrix[plan.id]?.[r.id]?.compatible
//               ).length;
              
//               const incompatibleCount = effectiveRouters.length - compatibleCount;
              
//               return (
//                 <motion.div
//                   key={plan.id}
//                   whileHover={{ scale: 1.02 }}
//                   className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light} hover:shadow-lg transition-all`}
//                 >
//                   <div className="flex justify-between items-start mb-3">
//                     <div>
//                       <h3 className="font-bold">{plan.name}</h3>
//                       <p className="text-sm text-gray-600">{plan.category}</p>
//                     </div>
//                     <div className="flex gap-1">
//                       {plan.accessType === 'hotspot' && <Wifi className="w-5 h-5 text-blue-600" />}
//                       {plan.accessType === 'pppoe' && <Cable className="w-5 h-5 text-green-600" />}
//                       {plan.accessType === 'dual' && (
//                         <>
//                           <Wifi className="w-5 h-5 text-blue-600" />
//                           <Cable className="w-5 h-5 text-green-600" />
//                         </>
//                       )}
//                     </div>
//                   </div>
                  
//                   <div className="space-y-2 mb-4">
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-600">Compatible Routers:</span>
//                       <span className="font-medium text-green-600">{compatibleCount}</span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-600">Incompatible:</span>
//                       <span className="font-medium text-red-600">{incompatibleCount}</span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-600">Type:</span>
//                       <span className="font-medium">
//                         {plan.router_specific ? 'Router-Specific' : 'Global'}
//                       </span>
//                     </div>
//                   </div>
                  
//                   <div className="w-full bg-gray-200 rounded-full h-2">
//                     <div
//                       className="bg-green-500 h-2 rounded-full"
//                       style={{ width: `${(compatibleCount / effectiveRouters.length) * 100}%` }}
//                     />
//                   </div>
                  
//                   <div className="mt-3 flex flex-wrap gap-1">
//                     {effectiveRouters.slice(0, 5).map(router => (
//                       <div
//                         key={router.id}
//                         className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
//                           ${compatibilityMatrix[plan.id]?.[router.id]?.compatible
//                             ? 'bg-green-100 text-green-800'
//                             : 'bg-red-100 text-red-800'
//                           }`}
//                         title={router.name}
//                       >
//                         {router.name?.[0] || 'R'}
//                       </div>
//                     ))}
//                     {effectiveRouters.length > 5 && (
//                       <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
//                         +{effectiveRouters.length - 5}
//                       </div>
//                     )}
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </div>
//         )}
        
//         {viewMode === 'list' && (
//           <div className={`rounded-xl overflow-hidden shadow-lg ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
//             <div className="divide-y">
//               {filteredPlans.map(plan => {
//                 const compatibleCount = effectiveRouters.filter(r => 
//                   compatibilityMatrix[plan.id]?.[r.id]?.compatible
//                 ).length;
                
//                 return (
//                   <div key={plan.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
//                     <div className="flex items-center gap-4">
//                       <div className="flex-1">
//                         <div className="font-medium">{plan.name}</div>
//                         <div className="text-sm text-gray-600">{plan.category}</div>
//                       </div>
//                       <div className="w-32">
//                         <div className="text-sm font-medium">{compatibleCount}/{effectiveRouters.length}</div>
//                         <div className="text-xs text-gray-600">routers</div>
//                       </div>
//                       <div className="w-32">
//                         <div className="flex gap-1">
//                           {plan.accessType === 'hotspot' && <Wifi className="w-4 h-4 text-blue-600" />}
//                           {plan.accessType === 'pppoe' && <Cable className="w-4 h-4 text-green-600" />}
//                           {plan.accessType === 'dual' && (
//                             <>
//                               <Wifi className="w-4 h-4 text-blue-600" />
//                               <Cable className="w-4 h-4 text-green-600" />
//                             </>
//                           )}
//                         </div>
//                       </div>
//                       <div className="w-32">
//                         {plan.router_specific ? (
//                           <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
//                             Specific
//                           </span>
//                         ) : (
//                           <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
//                             Global
//                           </span>
//                         )}
//                       </div>
//                       <button
//                         onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
//                         className="p-2 hover:bg-gray-200 rounded-lg"
//                       >
//                         {expandedPlan === plan.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//                       </button>
//                     </div>
                    
//                     <AnimatePresence>
//                       {expandedPlan === plan.id && (
//                         <motion.div
//                           initial={{ opacity: 0, height: 0 }}
//                           animate={{ opacity: 1, height: 'auto' }}
//                           exit={{ opacity: 0, height: 0 }}
//                           className="mt-4 pt-4 border-t"
//                         >
//                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                             {effectiveRouters.map(router => {
//                               const compatibility = compatibilityMatrix[plan.id]?.[router.id];
//                               return (
//                                 <div key={router.id} className="flex items-center gap-2">
//                                   {compatibility?.compatible ? (
//                                     <Check className="w-4 h-4 text-green-500" />
//                                   ) : (
//                                     <X className="w-4 h-4 text-red-500" />
//                                   )}
//                                   <div>
//                                     <div className="text-sm font-medium">{router.name}</div>
//                                     <div className="text-xs text-gray-600">{router.ip_address}</div>
//                                   </div>
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         </motion.div>
//                       )}
//                     </AnimatePresence>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}
//       </div>
//     </ErrorBoundary>
//   );
// };

// export default RouterCompatibility;





// src/Pages/ServiceManagement/components/RouterCompatibility.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi, Cable, Check, X, AlertTriangle, Search, Filter,
  Server, Globe, MapPin, Tag, RefreshCw, Download,
  ChevronDown, ChevronUp, Info, Zap, Clock
} from 'lucide-react';
import { API_ENDPOINTS } from './constants';
import { useApi } from './hooks/useApi';
import { useDebounce } from './hooks/useDebounce';
import { getThemeClasses, EnhancedSelect } from '../../../components/ServiceManagement/Shared/components';
import { TableSkeleton } from './common/TableSkeleton';
import { ErrorBoundary } from './common/ErrorBoundary';

const RouterCompatibility = ({ plans = [], routers = [], theme, addNotification }) => {
  const themeClasses = getThemeClasses(theme);
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAccess, setFilterAccess] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRouterSpecific, setFilterRouterSpecific] = useState('all');
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [viewMode, setViewMode] = useState('matrix'); // 'matrix', 'grid', 'list'
  
  // Debounced search
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  // Fetch data if not provided as props
  const { data: fetchedPlans, loading: plansLoading } = useApi(
    API_ENDPOINTS.INTERNET_PLANS,
    { cacheKey: 'plans', cache: true }
  );
  
  const { data: fetchedRouters, loading: routersLoading } = useApi(
    API_ENDPOINTS.NETWORK_ROUTERS,
    { cacheKey: 'routers', cache: true }
  );
  
  // Use props if provided, otherwise use fetched data
  const effectivePlans = plans.length > 0 ? plans : (fetchedPlans || []);
  const effectiveRouters = routers.length > 0 ? routers : (fetchedRouters || []);
  
  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(effectivePlans.map(p => p.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [effectivePlans]);
  
  // Filter plans
  const filteredPlans = useMemo(() => {
    return effectivePlans.filter(plan => {
      // Search filter
      const matchesSearch = debouncedSearch === '' ||
        plan.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        plan.category?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        plan.description?.toLowerCase().includes(debouncedSearch.toLowerCase());
      
      // Access method filter
      const matchesAccess = filterAccess === 'all' ||
        (filterAccess === 'hotspot' && plan.accessType === 'hotspot') ||
        (filterAccess === 'pppoe' && plan.accessType === 'pppoe') ||
        (filterAccess === 'dual' && plan.accessType === 'dual');
      
      // Category filter
      const matchesCategory = filterCategory === 'all' || plan.category === filterCategory;
      
      // Router-specific filter
      const matchesRouterSpecific = filterRouterSpecific === 'all' ||
        (filterRouterSpecific === 'specific' && plan.router_specific) ||
        (filterRouterSpecific === 'global' && !plan.router_specific);
      
      return matchesSearch && matchesAccess && matchesCategory && matchesRouterSpecific;
    });
  }, [effectivePlans, debouncedSearch, filterAccess, filterCategory, filterRouterSpecific]);
  
  // Calculate compatibility matrix
  const compatibilityMatrix = useMemo(() => {
    const matrix = {};
    
    filteredPlans.forEach(plan => {
      matrix[plan.id] = {};
      effectiveRouters.forEach(router => {
        const isHotspot = plan.accessType === 'hotspot' || plan.accessType === 'dual';
        const isPPPoE = plan.accessType === 'pppoe' || plan.accessType === 'dual';
        const routerSpecific = plan.router_specific;
        const allowedIds = plan.allowed_routers_ids || [];
        
        // Check compatibility
        let compatible = true;
        let reasons = [];
        
        if (routerSpecific && !allowedIds.includes(router.id)) {
          compatible = false;
          reasons.push('Router not in allowed list');
        }
        
        if (router.type === 'hotspot' && !isHotspot) {
          compatible = false;
          reasons.push('Router only supports hotspot');
        }
        
        if (router.type === 'pppoe' && !isPPPoE) {
          compatible = false;
          reasons.push('Router only supports PPPoE');
        }
        
        matrix[plan.id][router.id] = {
          compatible,
          reasons,
          allowed: allowedIds.includes(router.id),
        };
      });
    });
    
    return matrix;
  }, [filteredPlans, effectiveRouters]);
  
  // Get router status color
  const getRouterStatusColor = useCallback((status) => {
    const statusMap = {
      connected: 'bg-green-500',
      disconnected: 'bg-red-500',
      connecting: 'bg-yellow-500',
      error: 'bg-orange-500',
      maintenance: 'bg-purple-500',
    };
    return statusMap[status] || 'bg-gray-500';
  }, []);
  
  // Export compatibility report
  const exportReport = useCallback(() => {
    const headers = ['Plan', 'Category', 'Access Type', 'Router Specific', ...effectiveRouters.map(r => r.name)];
    const rows = filteredPlans.map(plan => [
      plan.name,
      plan.category || 'N/A',
      plan.accessType || 'N/A',
      plan.router_specific ? 'Yes' : 'No',
      ...effectiveRouters.map(router => {
        const compatible = compatibilityMatrix[plan.id]?.[router.id]?.compatible;
        return compatible ? 'Compatible' : 'Incompatible';
      }),
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compatibility-matrix-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    addNotification({ type: 'success', message: 'Compatibility report exported successfully' });
  }, [filteredPlans, effectiveRouters, compatibilityMatrix, addNotification]);
  
  // Options for EnhancedSelect
  const accessOptions = [
    { value: 'all', label: 'All Access Methods' },
    { value: 'hotspot', label: 'Hotspot Only' },
    { value: 'pppoe', label: 'PPPoE Only' },
    { value: 'dual', label: 'Dual Access' }
  ];
  
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map(cat => ({
      value: cat,
      label: cat
    }))
  ];
  
  const routerSpecificOptions = [
    { value: 'all', label: 'All Plans' },
    { value: 'specific', label: 'Router-Specific Only' },
    { value: 'global', label: 'Global Plans Only' }
  ];
  
  const viewModeOptions = [
    { value: 'matrix', label: 'Matrix View' },
    { value: 'grid', label: 'Grid View' },
    { value: 'list', label: 'List View' }
  ];
  
  if (plansLoading || routersLoading) {
    return <TableSkeleton rows={10} columns={effectiveRouters.length + 4} theme={theme} />;
  }
  
  if (effectivePlans.length === 0 || effectiveRouters.length === 0) {
    return (
      <div className={`p-12 text-center rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className={`text-xl font-bold mb-2 ${themeClasses.text.primary}`}>No Data Available</h3>
        <p className={`text-sm ${themeClasses.text.secondary} mb-4`}>
          {effectivePlans.length === 0 ? 'No plans configured' : 'No routers configured'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Refresh
        </button>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <div className={`space-y-6`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className={`text-2xl font-bold ${themeClasses.text.primary}`}>Router & Plan Compatibility Matrix</h2>
            <p className={`text-sm ${themeClasses.text.secondary} mt-1`}>
              Check which plans work with which routers
            </p>
          </div>
          
          <div className="flex gap-3">
            {/* View Toggle - Desktop */}
            <div className="hidden sm:flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('matrix')}
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'matrix'
                    ? 'bg-indigo-600 text-white'
                    : `${themeClasses.bg.secondary} hover:bg-gray-200 dark:hover:bg-gray-700`
                }`}
              >
                Matrix
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white'
                    : `${themeClasses.bg.secondary} hover:bg-gray-200 dark:hover:bg-gray-700`
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white'
                    : `${themeClasses.bg.secondary} hover:bg-gray-200 dark:hover:bg-gray-700`
                }`}
              >
                List
              </button>
            </div>
            
            {/* View Toggle - Mobile with EnhancedSelect */}
            <div className="sm:hidden min-w-32">
              <EnhancedSelect
                value={viewMode}
                onChange={setViewMode}
                options={viewModeOptions}
                placeholder="View mode"
                theme={theme}
              />
            </div>
            
            <button
              onClick={exportReport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
            <div className="text-2xl font-bold text-blue-600">{effectivePlans.length}</div>
            <div className={`text-sm ${themeClasses.text.secondary}`}>Total Plans</div>
          </div>
          <div className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
            <div className="text-2xl font-bold text-green-600">
              {effectivePlans.filter(p => !p.router_specific).length}
            </div>
            <div className={`text-sm ${themeClasses.text.secondary}`}>Global Plans</div>
          </div>
          <div className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
            <div className="text-2xl font-bold text-purple-600">
              {effectivePlans.filter(p => p.router_specific).length}
            </div>
            <div className={`text-sm ${themeClasses.text.secondary}`}>Router-Specific</div>
          </div>
          <div className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
            <div className="text-2xl font-bold text-orange-600">{effectiveRouters.length}</div>
            <div className={`text-sm ${themeClasses.text.secondary}`}>Routers</div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search plans by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-3 rounded-lg border ${themeClasses.input} w-full`}
            />
          </div>
          
          {/* Access Method Filter - EnhancedSelect */}
          <div className="min-w-40">
            <EnhancedSelect
              value={filterAccess}
              onChange={setFilterAccess}
              options={accessOptions}
              placeholder="Filter by access"
              theme={theme}
            />
          </div>
          
          {/* Category Filter - EnhancedSelect */}
          <div className="min-w-40">
            <EnhancedSelect
              value={filterCategory}
              onChange={setFilterCategory}
              options={categoryOptions}
              placeholder="Filter by category"
              theme={theme}
            />
          </div>
          
          {/* Router-Specific Filter - EnhancedSelect */}
          <div className="min-w-40">
            <EnhancedSelect
              value={filterRouterSpecific}
              onChange={setFilterRouterSpecific}
              options={routerSpecificOptions}
              placeholder="Filter by type"
              theme={theme}
            />
          </div>
        </div>
        
        {/* Results count */}
        <div className={`text-sm ${themeClasses.text.tertiary}`}>
          Showing {filteredPlans.length} of {effectivePlans.length} plans across {effectiveRouters.length} routers
        </div>
        
        {/* Compatibility Display */}
        {viewMode === 'matrix' && (
          <div className={`rounded-xl overflow-hidden shadow-lg ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className={`${themeClasses.bg.secondary}`}>
                  <tr>
                    <th className="p-4 text-left sticky left-0 bg-inherit z-10">Plan</th>
                    <th className="p-4 text-left">Category</th>
                    <th className="p-4 text-center">Access</th>
                    <th className="p-4 text-center">Type</th>
                    {effectiveRouters.map(router => (
                      <th key={router.id} className="p-4 text-center min-w-32">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1">
                            <Server className="w-4 h-4" />
                            <span className={themeClasses.text.primary}>{router.name || router.hostname}</span>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${getRouterStatusColor(router.status)} mt-1`} />
                          <div className={`text-xs ${themeClasses.text.tertiary} mt-1`}>{router.ip_address}</div>
                          {router.location && (
                            <div className={`text-xs ${themeClasses.text.tertiary} flex items-center gap-1`}>
                              <MapPin className="w-3 h-3" />
                              {router.location}
                            </div>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPlans.map((plan, index) => (
                    <React.Fragment key={plan.id}>
                      <tr className={`border-t hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${themeClasses.border.light}`}>
                        <td className={`p-4 font-medium sticky left-0 bg-inherit ${themeClasses.text.primary}`}>
                          <div>
                            <div>{plan.name}</div>
                            <div className={`text-xs ${themeClasses.text.tertiary} mt-1`}>{plan.id}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 ${themeClasses.bg.secondary} rounded-full text-xs`}>
                            {plan.category || 'N/A'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {plan.accessType === 'hotspot' && <Wifi className="w-5 h-5 text-blue-600" title="Hotspot" />}
                            {plan.accessType === 'pppoe' && <Cable className="w-5 h-5 text-green-600" title="PPPoE" />}
                            {plan.accessType === 'dual' && (
                              <>
                                <Wifi className="w-5 h-5 text-blue-600" title="Hotspot" />
                                <Cable className="w-5 h-5 text-green-600" title="PPPoE" />
                              </>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          {plan.router_specific ? (
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                              Specific
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              Global
                            </span>
                          )}
                        </td>
                        {effectiveRouters.map(router => {
                          const compatibility = compatibilityMatrix[plan.id]?.[router.id];
                          return (
                            <td key={router.id} className="p-4 text-center">
                              {compatibility?.compatible ? (
                                <motion.div
                                  whileHover={{ scale: 1.2 }}
                                  className="inline-block cursor-help"
                                  title={compatibility.reasons.join(', ') || 'Compatible'}
                                >
                                  <Check className="w-6 h-6 text-green-500 mx-auto" />
                                </motion.div>
                              ) : (
                                <motion.div
                                  whileHover={{ scale: 1.2 }}
                                  className="inline-block cursor-help"
                                  title={compatibility?.reasons.join(', ') || 'Incompatible'}
                                >
                                  <X className="w-6 h-6 text-red-500 mx-auto" />
                                </motion.div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                      
                      {/* Expanded row for additional plan details */}
                      {expandedPlan === plan.id && (
                        <tr>
                          <td colSpan={effectiveRouters.length + 4} className={`p-4 ${themeClasses.bg.secondary}`}>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <h4 className={`font-medium text-sm mb-2 ${themeClasses.text.primary}`}>Description</h4>
                                <p className={`text-sm ${themeClasses.text.secondary}`}>{plan.description || 'No description'}</p>
                              </div>
                              <div>
                                <h4 className={`font-medium text-sm mb-2 ${themeClasses.text.primary}`}>Price</h4>
                                <p className={`text-sm font-bold ${themeClasses.text.primary}`}>
                                  KSH {plan.base_price || plan.price}
                                </p>
                              </div>
                              <div>
                                <h4 className={`font-medium text-sm mb-2 ${themeClasses.text.primary}`}>Allowed Routers</h4>
                                {plan.router_specific ? (
                                  <div className="space-y-1">
                                    {plan.allowed_routers_ids?.length > 0 ? (
                                      plan.allowed_routers_ids.map(id => {
                                        const router = effectiveRouters.find(r => r.id === id);
                                        return (
                                          <div key={id} className={`text-sm flex items-center gap-2 ${themeClasses.text.secondary}`}>
                                            <Server className="w-3 h-3" />
                                            {router?.name || id}
                                          </div>
                                        );
                                      })
                                    ) : (
                                      <p className={`text-sm ${themeClasses.text.secondary}`}>None specified</p>
                                    )}
                                  </div>
                                ) : (
                                  <p className={`text-sm ${themeClasses.text.secondary}`}>Global - All routers</p>
                                )}
                              </div>
                              <div>
                                <h4 className={`font-medium text-sm mb-2 ${themeClasses.text.primary}`}>Technical Specs</h4>
                                <div className={`text-sm space-y-1 ${themeClasses.text.secondary}`}>
                                  <div>Speed: {plan.download_speed}/{plan.upload_speed} Mbps</div>
                                  <div>Data: {plan.data_limit || 'Unlimited'}</div>
                                  <div>Validity: {plan.validity_period || 'N/A'}</div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlans.map(plan => {
              const compatibleCount = effectiveRouters.filter(r => 
                compatibilityMatrix[plan.id]?.[r.id]?.compatible
              ).length;
              
              const incompatibleCount = effectiveRouters.length - compatibleCount;
              
              return (
                <motion.div
                  key={plan.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light} hover:shadow-lg transition-all cursor-pointer`}
                  onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className={`font-bold ${themeClasses.text.primary}`}>{plan.name}</h3>
                      <p className={`text-sm ${themeClasses.text.secondary}`}>{plan.category}</p>
                    </div>
                    <div className="flex gap-1">
                      {plan.accessType === 'hotspot' && <Wifi className="w-5 h-5 text-blue-600" />}
                      {plan.accessType === 'pppoe' && <Cable className="w-5 h-5 text-green-600" />}
                      {plan.accessType === 'dual' && (
                        <>
                          <Wifi className="w-5 h-5 text-blue-600" />
                          <Cable className="w-5 h-5 text-green-600" />
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className={themeClasses.text.secondary}>Compatible Routers:</span>
                      <span className="font-medium text-green-600">{compatibleCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={themeClasses.text.secondary}>Incompatible:</span>
                      <span className="font-medium text-red-600">{incompatibleCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={themeClasses.text.secondary}>Type:</span>
                      <span className="font-medium">
                        {plan.router_specific ? 'Router-Specific' : 'Global'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(compatibleCount / effectiveRouters.length) * 100}%` }}
                    />
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-1">
                    {effectiveRouters.slice(0, 5).map(router => (
                      <div
                        key={router.id}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
                          ${compatibilityMatrix[plan.id]?.[router.id]?.compatible
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}
                        title={router.name}
                      >
                        {router.name?.[0] || 'R'}
                      </div>
                    ))}
                    {effectiveRouters.length > 5 && (
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                        +{effectiveRouters.length - 5}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        
        {viewMode === 'list' && (
          <div className={`rounded-xl overflow-hidden shadow-lg ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPlans.map(plan => {
                const compatibleCount = effectiveRouters.filter(r => 
                  compatibilityMatrix[plan.id]?.[r.id]?.compatible
                ).length;
                
                return (
                  <div key={plan.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className={`font-medium ${themeClasses.text.primary}`}>{plan.name}</div>
                        <div className={`text-sm ${themeClasses.text.secondary}`}>{plan.category}</div>
                      </div>
                      <div className="w-32">
                        <div className={`text-sm font-medium ${themeClasses.text.primary}`}>
                          {compatibleCount}/{effectiveRouters.length}
                        </div>
                        <div className={`text-xs ${themeClasses.text.tertiary}`}>routers</div>
                      </div>
                      <div className="w-32">
                        <div className="flex gap-1">
                          {plan.accessType === 'hotspot' && <Wifi className="w-4 h-4 text-blue-600" />}
                          {plan.accessType === 'pppoe' && <Cable className="w-4 h-4 text-green-600" />}
                          {plan.accessType === 'dual' && (
                            <>
                              <Wifi className="w-4 h-4 text-blue-600" />
                              <Cable className="w-4 h-4 text-green-600" />
                            </>
                          )}
                        </div>
                      </div>
                      <div className="w-32">
                        {plan.router_specific ? (
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                            Specific
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            Global
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                      >
                        {expandedPlan === plan.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    <AnimatePresence>
                      {expandedPlan === plan.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t"
                        >
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {effectiveRouters.map(router => {
                              const compatibility = compatibilityMatrix[plan.id]?.[router.id];
                              return (
                                <div key={router.id} className="flex items-center gap-2">
                                  {compatibility?.compatible ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <X className="w-4 h-4 text-red-500" />
                                  )}
                                  <div>
                                    <div className={`text-sm font-medium ${themeClasses.text.primary}`}>{router.name}</div>
                                    <div className={`text-xs ${themeClasses.text.tertiary}`}>{router.ip_address}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default RouterCompatibility;