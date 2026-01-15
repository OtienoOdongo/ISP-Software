








// import React, { useState, useMemo, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Network, Server, Check, X, AlertTriangle, Filter,
//   Wifi, Cable, Search, Download, Upload, Settings, Info, BarChart3
// } from "lucide-react";
// import { getThemeClasses, EnhancedSelect } from "../../../components/ServiceManagement/Shared/components";
// import api from "../../../api";

// const RouterCompatibility = ({ plans, routers, theme }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [selectedRouter, setSelectedRouter] = useState(null);
//   const [viewMode, setViewMode] = useState("plan-view");
//   const [searchTerm, setSearchTerm] = useState("");

//   // Enhanced compatibility check with better error handling
//   const checkCompatibility = useCallback((plan, router) => {
//     if (!plan || !router) return false;
    
//     // If plan is not router-specific, it's compatible with all routers
//     if (!plan.router_specific) return true;
    
//     // Check if router is in allowed routers list
//     const allowedRouters = plan.allowed_routers_ids || 
//                           plan.allowed_routers?.map(r => r.id) || 
//                           [];
//     return allowedRouters.includes(router.id);
//   }, []);

//   // Filter routers based on search term
//   const filteredRouters = useMemo(() => {
//     if (!searchTerm) return routers;
//     return routers.filter(router => 
//       router.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       router.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       router.ip_address?.includes(searchTerm)
//     );
//   }, [routers, searchTerm]);

//   // Get compatibility data for plan view
//   const planCompatibility = useMemo(() => {
//     if (!selectedPlan) return [];
    
//     return filteredRouters.map(router => ({
//       router,
//       compatible: checkCompatibility(selectedPlan, router),
//       enabledMethods: selectedPlan.enabled_access_methods || 
//                      selectedPlan.get_enabled_access_methods?.() || 
//                      []
//     }));
//   }, [selectedPlan, filteredRouters, checkCompatibility]);

//   // Get compatibility data for router view
//   const routerCompatibility = useMemo(() => {
//     if (!selectedRouter) return [];
    
//     return plans.map(plan => ({
//       plan,
//       compatible: checkCompatibility(plan, selectedRouter),
//       enabledMethods: plan.enabled_access_methods || 
//                      plan.get_enabled_access_methods?.() || 
//                      []
//     }));
//   }, [selectedRouter, plans, checkCompatibility]);

//   // Statistics for the selected view
//   const stats = useMemo(() => {
//     if (viewMode === "plan-view" && selectedPlan) {
//       const compatible = planCompatibility.filter(c => c.compatible).length;
//       const incompatible = planCompatibility.filter(c => !c.compatible).length;
//       return { compatible, incompatible, total: planCompatibility.length };
//     } else if (viewMode === "router-view" && selectedRouter) {
//       const compatible = routerCompatibility.filter(c => c.compatible).length;
//       const incompatible = routerCompatibility.filter(c => !c.compatible && c.plan.router_specific).length;
//       return { compatible, incompatible, total: routerCompatibility.length };
//     }
//     return { compatible: 0, incompatible: 0, total: 0 };
//   }, [viewMode, selectedPlan, selectedRouter, planCompatibility, routerCompatibility]);

//   const handlePlanSelect = useCallback((planId) => {
//     const plan = plans.find(p => p.id.toString() === planId);
//     setSelectedPlan(plan || null);
//   }, [plans]);

//   const handleRouterSelect = useCallback((routerId) => {
//     const router = routers.find(r => r.id.toString() === routerId);
//     setSelectedRouter(router || null);
//   }, [routers]);

//   return (
//     <div className="space-y-6">
//       {/* View Mode and Selection */}
//       <SelectionHeader
//         viewMode={viewMode}
//         selectedPlan={selectedPlan}
//         selectedRouter={selectedRouter}
//         plans={plans}
//         routers={routers}
//         searchTerm={searchTerm}
//         onViewModeChange={setViewMode}
//         onPlanSelect={handlePlanSelect}
//         onRouterSelect={handleRouterSelect}
//         onSearchChange={setSearchTerm}
//         theme={theme}
//       />

//       {/* Statistics */}
//       {(selectedPlan || selectedRouter) && (
//         <CompatibilityStats stats={stats} viewMode={viewMode} theme={theme} />
//       )}

//       {/* Compatibility Results */}
//       <AnimatePresence mode="wait">
//         {viewMode === "plan-view" && selectedPlan && (
//           <PlanCompatibilityView 
//             key={`plan-${selectedPlan.id}`}
//             plan={selectedPlan}
//             compatibility={planCompatibility}
//             theme={theme}
//           />
//         )}

//         {viewMode === "router-view" && selectedRouter && (
//           <RouterCompatibilityView
//             key={`router-${selectedRouter.id}`}
//             router={selectedRouter}
//             compatibility={routerCompatibility}
//             theme={theme}
//           />
//         )}

//         {(!selectedPlan && viewMode === "plan-view") || (!selectedRouter && viewMode === "router-view") && (
//           <EmptyState viewMode={viewMode} theme={theme} />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// // Selection Header Component
// const SelectionHeader = ({
//   viewMode,
//   selectedPlan,
//   selectedRouter,
//   plans,
//   routers,
//   searchTerm,
//   onViewModeChange,
//   onPlanSelect,
//   onRouterSelect,
//   onSearchChange,
//   theme
// }) => {
//   const themeClasses = getThemeClasses(theme);

//   return (
//     <div className={`p-4 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
//         {/* View Mode Toggle */}
//         <div className="flex gap-2">
//           <button
//             onClick={() => onViewModeChange("plan-view")}
//             className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
//               viewMode === "plan-view" 
//                 ? "bg-indigo-600 text-white shadow-md" 
//                 : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
//             }`}
//           >
//             <BarChart3 className="w-4 h-4" />
//             Plan View
//           </button>
//           <button
//             onClick={() => onViewModeChange("router-view")}
//             className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
//               viewMode === "router-view" 
//                 ? "bg-indigo-600 text-white shadow-md" 
//                 : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
//             }`}
//           >
//             <Server className="w-4 h-4" />
//             Router View
//           </button>
//         </div>
        
//         {/* Selection Dropdown */}
//         <div className="flex-1 min-w-0">
//           {viewMode === "plan-view" ? (
//             <EnhancedSelect
//               value={selectedPlan?.id?.toString() || ""}
//               onChange={onPlanSelect}
//               options={[
//                 { value: "", label: "Select a plan...", disabled: true },
//                 ...plans.map(plan => ({ 
//                   value: plan.id.toString(), 
//                   label: plan.name,
//                   description: `${plan.plan_type} - Ksh ${plan.price}`
//                 }))
//               ]}
//               theme={theme}
//             />
//           ) : (
//             <EnhancedSelect
//               value={selectedRouter?.id?.toString() || ""}
//               onChange={onRouterSelect}
//               options={[
//                 { value: "", label: "Select a router...", disabled: true },
//                 ...routers.map(router => ({ 
//                   value: router.id.toString(), 
//                   label: router.name,
//                   description: `${router.location || 'No location'} - ${router.status}`
//                 }))
//               ]}
//               theme={theme}
//             />
//           )}
//         </div>

//         {/* Search for Router View */}
//         {viewMode === "plan-view" && (
//           <div className="w-full lg:w-64">
//             <div className="relative">
//               <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.text.tertiary}`} />
//               <input
//                 type="text"
//                 placeholder="Search routers..."
//                 value={searchTerm}
//                 onChange={(e) => onSearchChange(e.target.value)}
//                 className={`w-full pl-10 pr-4 py-2 rounded-lg border ${themeClasses.input}`}
//               />
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Compatibility Statistics Component
// const CompatibilityStats = ({ stats, viewMode, theme }) => {
//   const themeClasses = getThemeClasses(theme);

//   return (
//     <div className={`p-4 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
//           <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
//           <div className="text-sm text-blue-600">Total {viewMode === "plan-view" ? "Routers" : "Plans"}</div>
//         </div>
//         <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
//           <div className="text-2xl font-bold text-green-600">{stats.compatible}</div>
//           <div className="text-sm text-green-600">Compatible</div>
//         </div>
//         <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
//           <div className="text-2xl font-bold text-red-600">{stats.incompatible}</div>
//           <div className="text-sm text-red-600">Incompatible</div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Plan Compatibility View Component
// const PlanCompatibilityView = ({ plan, compatibility, theme }) => {
//   const themeClasses = getThemeClasses(theme);
//   const compatibleRouters = compatibility.filter(c => c.compatible);
//   const incompatibleRouters = compatibility.filter(c => !c.compatible);

//   return (
//     <div className="space-y-6">
//       {/* Plan Summary */}
//       <div className={`p-4 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <div className={`p-3 rounded-lg ${
//               plan.router_specific ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
//             }`}>
//               <Settings className="w-6 h-6" />
//             </div>
//             <div>
//               <h4 className="font-semibold text-gray-900 dark:text-white">{plan.name}</h4>
//               <p className="text-sm text-gray-600 dark:text-gray-400">
//                 {plan.router_specific 
//                   ? `Router-specific plan • ${compatibleRouters.length} compatible routers`
//                   : 'Available on all routers'
//                 }
//               </p>
//               <div className="flex items-center gap-4 mt-2 text-xs">
//                 <span className="flex items-center gap-1">
//                   <Wifi className="w-3 h-3" />
//                   {plan.enabled_access_methods?.includes('hotspot') ? 'Hotspot' : 'No Hotspot'}
//                 </span>
//                 <span className="flex items-center gap-1">
//                   <Cable className="w-3 h-3" />
//                   {plan.enabled_access_methods?.includes('pppoe') ? 'PPPoE' : 'No PPPoE'}
//                 </span>
//                 <span>Ksh {plan.price}</span>
//               </div>
//             </div>
//           </div>
//           <div className={`px-3 py-1 rounded-full text-sm font-medium ${
//             plan.router_specific 
//               ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
//               : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
//           }`}>
//             {plan.router_specific ? 'Router Specific' : 'Universal'}
//           </div>
//         </div>
//       </div>

//       {/* Compatible Routers */}
//       {compatibleRouters.length > 0 && (
//         <CompatibleSection
//           title={`Compatible Routers (${compatibleRouters.length})`}
//           items={compatibleRouters}
//           type="router"
//           theme={theme}
//         />
//       )}

//       {/* Incompatible Routers */}
//       {incompatibleRouters.length > 0 && plan.router_specific && (
//         <IncompatibleSection
//           title={`Incompatible Routers (${incompatibleRouters.length})`}
//           items={incompatibleRouters}
//           type="router"
//           theme={theme}
//         />
//       )}
//     </div>
//   );
// };

// // Router Compatibility View Component
// const RouterCompatibilityView = ({ router, compatibility, theme }) => {
//   const themeClasses = getThemeClasses(theme);
//   const compatiblePlans = compatibility.filter(c => c.compatible);
//   const incompatiblePlans = compatibility.filter(c => !c.compatible && c.plan.router_specific);

//   return (
//     <div className="space-y-6">
//       {/* Router Summary */}
//       <div className={`p-4 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <div className={`p-3 rounded-lg ${
//               router.status === 'connected' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
//             }`}>
//               <Server className="w-6 h-6" />
//             </div>
//             <div>
//               <h4 className="font-semibold text-gray-900 dark:text-white">{router.name}</h4>
//               <p className="text-sm text-gray-600 dark:text-gray-400">
//                 Status: <span className={
//                   router.status === 'connected' ? 'text-green-600' : 'text-red-600'
//                 }>{router.status}</span>
//                 {router.location && ` • Location: ${router.location}`}
//                 {router.ip_address && ` • IP: ${router.ip_address}`}
//               </p>
//               <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
//                 <span>Model: {router.model || 'Unknown'}</span>
//                 <span>Firmware: {router.firmware_version || 'Unknown'}</span>
//               </div>
//             </div>
//           </div>
//           <div className={`px-3 py-1 rounded-full text-sm font-medium ${
//             router.status === 'connected' 
//               ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
//               : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
//           }`}>
//             {router.status}
//           </div>
//         </div>
//       </div>

//       {/* Compatible Plans */}
//       {compatiblePlans.length > 0 && (
//         <CompatibleSection
//           title={`Compatible Plans (${compatiblePlans.length})`}
//           items={compatiblePlans}
//           type="plan"
//           theme={theme}
//         />
//       )}

//       {/* Incompatible Plans */}
//       {incompatiblePlans.length > 0 && (
//         <IncompatibleSection
//           title={`Incompatible Plans (${incompatiblePlans.length})`}
//           items={incompatiblePlans}
//           type="plan"
//           theme={theme}
//         />
//       )}
//     </div>
//   );
// };

// // Reusable Compatible Section Component
// const CompatibleSection = ({ title, items, type, theme }) => {
//   const themeClasses = getThemeClasses(theme);

//   return (
//     <div>
//       <h5 className="font-semibold mb-3 flex items-center text-green-600">
//         <Check className="w-4 h-4 mr-2" />
//         {title}
//       </h5>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {items.map((item, index) => (
//           <CompatibleItem
//             key={type === 'router' ? item.router.id : item.plan.id}
//             item={item}
//             type={type}
//             index={index}
//             theme={theme}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// // Reusable Incompatible Section Component
// const IncompatibleSection = ({ title, items, type, theme }) => {
//   return (
//     <div>
//       <h5 className="font-semibold mb-3 flex items-center text-red-600">
//         <X className="w-4 h-4 mr-2" />
//         {title}
//       </h5>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {items.map((item, index) => (
//           <IncompatibleItem
//             key={type === 'router' ? item.router.id : item.plan.id}
//             item={item}
//             type={type}
//             index={index}
//             theme={theme}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// // Compatible Item Component
// const CompatibleItem = ({ item, type, index, theme }) => {
//   const themeClasses = getThemeClasses(theme);
//   const data = type === 'router' ? item.router : item.plan;
//   const enabledMethods = item.enabledMethods || [];

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: index * 0.1 }}
//       className={`p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 hover:shadow-md transition-shadow`}
//     >
//       <div className="flex items-center justify-between mb-2">
//         <h6 className="font-semibold text-green-800 dark:text-green-200 truncate">
//           {data.name}
//         </h6>
//         <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
//       </div>
      
//       <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
//         {type === 'router' ? (
//           <>
//             <div className="flex justify-between">
//               <span>Status:</span>
//               <span className={data.status === 'connected' ? 'text-green-600' : 'text-red-600'}>
//                 {data.status}
//               </span>
//             </div>
//             {data.location && (
//               <div className="truncate" title={data.location}>
//                 Location: {data.location}
//               </div>
//             )}
//           </>
//         ) : (
//           <>
//             <div className="flex justify-between">
//               <span>Type:</span>
//               <span>{data.plan_type}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>Price:</span>
//               <span>Ksh {data.price}</span>
//             </div>
//           </>
//         )}
        
//         <div className="flex items-center gap-2 mt-2 pt-2 border-t border-green-200 dark:border-green-700">
//           <span className="text-xs">Access:</span>
//           {enabledMethods.includes('hotspot') && (
//             <Wifi className="w-3 h-3 text-blue-500" title="Hotspot" />
//           )}
//           {enabledMethods.includes('pppoe') && (
//             <Cable className="w-3 h-3 text-green-500" title="PPPoE" />
//           )}
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// // Incompatible Item Component
// const IncompatibleItem = ({ item, type, index, theme }) => {
//   const themeClasses = getThemeClasses(theme);
//   const data = type === 'router' ? item.router : item.plan;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: index * 0.1 }}
//       className={`p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 hover:shadow-md transition-shadow`}
//     >
//       <div className="flex items-center justify-between mb-2">
//         <h6 className="font-semibold text-red-800 dark:text-red-200 truncate">
//           {data.name}
//         </h6>
//         <X className="w-4 h-4 text-red-600 flex-shrink-0" />
//       </div>
      
//       <div className="text-sm text-red-700 dark:text-red-300">
//         {type === 'router' ? (
//           <>
//             <div>Status: {data.status}</div>
//             {data.location && <div>Location: {data.location}</div>}
//           </>
//         ) : (
//           <>
//             <div>Router-specific plan</div>
//             <div>Not authorized for this router</div>
//           </>
//         )}
//       </div>
//     </motion.div>
//   );
// };

// // Empty State Component
// const EmptyState = ({ viewMode, theme }) => {
//   const themeClasses = getThemeClasses(theme);

//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.9 }}
//       animate={{ opacity: 1, scale: 1 }}
//       className={`p-8 text-center rounded-xl ${themeClasses.bg.card}`}
//     >
//       <Network className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//       <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
//         Select a {viewMode === "plan-view" ? "Plan" : "Router"}
//       </h4>
//       <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
//         Choose a {viewMode === "plan-view" ? "plan" : "router"} from the dropdown above to view compatibility information and see which {viewMode === "plan-view" ? "routers" : "plans"} are compatible.
//       </p>
//     </motion.div>
//   );
// };

// export default RouterCompatibility;






// src/pages/ServiceOperations/components/RouterCompatibility.jsx
import React from "react";
import { Wifi, Cable, Check, X } from "lucide-react";
import { getThemeClasses } from "../../Shared/components";

const RouterCompatibility = ({ plans = [], routers = [], theme }) => {
  const themeClasses = getThemeClasses(theme);

  return (
    <div className={`space-y-6 ${themeClasses.bg.primary}`}>
      <h2 className="text-2xl font-bold">Router & Plan Compatibility Matrix</h2>

      {routers.length === 0 || plans.length === 0 ? (
        <div className={`p-12 text-center rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
          <p className="text-lg text-gray-600">
            {routers.length === 0 ? "No routers configured" : "No plans available"}
          </p>
        </div>
      ) : (
        <div className={`rounded-xl overflow-hidden shadow-lg ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className={`${themeClasses.bg.secondary}`}>
                <tr>
                  <th className={`p-4 text-left sticky left-0 ${themeClasses.bg.card}`}>Plan</th>
                  <th className="p-4 text-center">Access Type</th>
                  <th className="p-4 text-center">Category</th>
                  {routers.map(router => (
                    <th key={router.id} className="p-4 text-center min-w-32">
                      {router.name || router.hostname}
                      <div className="text-xs text-gray-500 mt-1">{router.ip_address}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plans.map(plan => {
                  const isHotspot = plan.accessType === "hotspot";
                  const isPPPoE = plan.accessType === "pppoe";
                  const routerSpecific = plan.router_specific;
                  const allowedIds = plan.allowed_routers_ids || [];

                  return (
                    <tr key={plan.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className={`p-4 font-medium sticky left-0 ${themeClasses.bg.card}`}>
                        {plan.name}
                      </td>
                      <td className="p-4 text-center">
                        {isHotspot && <Wifi className="w-5 h-5 text-blue-600 inline" />}
                        {isPPPoE && <Cable className="w-5 h-5 text-green-600 inline ml-2" />}
                      </td>
                      <td className="p-4 text-center text-sm">{plan.category || "N/A"}</td>
                      {routers.map(router => {
                        const compatible = !routerSpecific || allowedIds.includes(router.id);
                        return (
                          <td key={router.id} className="p-4 text-center">
                            {compatible ? (
                              <Check className="w-6 h-6 text-green-500 mx-auto" />
                            ) : (
                              <X className="w-6 h-6 text-red-500 mx-auto" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouterCompatibility;