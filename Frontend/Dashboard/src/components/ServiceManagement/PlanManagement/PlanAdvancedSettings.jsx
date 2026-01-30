


// import React from "react";
// import { motion } from "framer-motion";
// import { EnhancedSelect, getThemeClasses } from "../Shared/components"
// import { priorityOptions } from "../Shared/constant"
// import { Settings, Router, Shield, TrendingDown } from "lucide-react";

// const PlanAdvancedSettings = ({ form, errors, onChange, routers, theme }) => {
//   const themeClasses = getThemeClasses(theme);

//   const toggleRouterSelection = (routerId) => {
//     const currentRouters = [...form.allowed_routers_ids];
//     const index = currentRouters.indexOf(routerId);
    
//     if (index > -1) {
//       currentRouters.splice(index, 1);
//     } else {
//       currentRouters.push(routerId);
//     }
    
//     onChange({ target: { name: 'allowed_routers_ids', value: currentRouters } });
//   };

//   // Priority level descriptions for better UX
//   const getPriorityDescription = (level) => {
//     const descriptions = {
//       1: "Background tasks, lowest priority",
//       2: "Standard browsing, low priority",
//       3: "Normal usage, medium priority",
//       4: "Streaming, high priority",
//       5: "Gaming, very high priority",
//       6: "Critical applications",
//       7: "Premium users",
//       8: "VIP/Administrative"
//     };
//     return descriptions[level] || "Standard priority";
//   };

//   return (
//     <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center">
//         <Settings className="w-5 h-5 mr-2 text-indigo-600" />
//         Advanced Settings
//       </h3>
      
//       <div className="space-y-6">
//         {/* Priority Level with Enhanced UX */}
//         <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-blue-900/10' : 'bg-blue-50'}`}>
//           <label className={`block text-sm font-medium mb-3 ${themeClasses.text.primary} flex items-center`}>
//             <TrendingDown className="w-4 h-4 mr-2" />
//             Network Priority
//           </label>
          
//           <div className="mb-3">
//             <EnhancedSelect
//               value={form.priority_level}
//               onChange={(value) => onChange({ target: { name: 'priority_level', value: parseInt(value, 10) } })}
//               options={priorityOptions.map(opt => ({ 
//                 value: opt.value, 
//                 label: `${opt.label} - Level ${opt.value}`
//               }))}
//               theme={theme}
//             />
//           </div>
          
//           <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-800/20' : 'bg-blue-100'}`}>
//             <p className="text-sm text-blue-700 dark:text-blue-300">
//               <strong>Current:</strong> {getPriorityDescription(form.priority_level)}
//             </p>
//             <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
//               Higher priority plans get better network performance during congestion
//             </p>
//           </div>
          
//           {errors.priority_level && <p className="text-red-500 text-xs mt-2">{errors.priority_level}</p>}
//         </div>
        
//         {/* Router Restrictions */}
//         <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-purple-900/10' : 'bg-purple-50'}`}>
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex-1">
//               <label className={`block text-sm font-medium ${themeClasses.text.primary} flex items-center`}>
//                 <Router className="w-4 h-4 mr-2" />
//                 Router Restrictions
//               </label>
//               <p className="text-xs text-gray-500 mt-1">
//                 Limit this plan to specific routers only
//               </p>
//             </div>
//             <div 
//               onClick={() => onChange({ target: { name: 'router_specific', type: 'checkbox', checked: !form.router_specific } })} 
//               className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
//                 form.router_specific 
//                   ? 'bg-indigo-600'
//                   : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//               }`}
//             >
//               <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//                 form.router_specific ? "translate-x-6" : "translate-x-1"
//               }`} />
//             </div>
//           </div>
          
//           {form.router_specific && (
//             <motion.div
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: 'auto' }}
//               transition={{ duration: 0.3 }}
//             >
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 Allowed Routers
//                 <span className="text-xs text-gray-500 ml-2">- Select where this plan will be available</span>
//               </label>
              
//               {routers.length === 0 ? (
//                 <div className={`p-4 text-center rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
//                   <p className={`text-sm ${themeClasses.text.secondary}`}>No routers available in your network.</p>
//                 </div>
//               ) : (
//                 <div className={`space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3 ${themeClasses.border.light} ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
//                   {routers.map((router) => (
//                     <div 
//                       key={router.id} 
//                       className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
//                         form.allowed_routers_ids.includes(router.id)
//                           ? theme === 'dark' ? 'bg-indigo-900/50 border-indigo-500' : 'bg-indigo-50 border-indigo-300'
//                           : theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
//                       } border`}
//                       onClick={() => toggleRouterSelection(router.id)}
//                     >
//                       <input 
//                         type="checkbox" 
//                         checked={form.allowed_routers_ids.includes(router.id)} 
//                         onChange={() => {}} // Handled by parent div click
//                         className={`h-4 w-4 focus:ring-indigo-500 border rounded ${
//                           theme === 'dark' 
//                             ? 'bg-gray-600 border-gray-500 text-indigo-600' 
//                             : 'text-indigo-600 border-gray-300'
//                         }`}
//                       />
//                       <label className={`ml-3 text-sm ${themeClasses.text.primary} flex-1 cursor-pointer`}>
//                         <div className="font-medium">{router.name || `Router ${router.id}`}</div>
//                         {router.location && (
//                           <div className="text-xs text-gray-500 mt-1">{router.location}</div>
//                         )}
//                       </label>
//                     </div>
//                   ))}
//                 </div>
//               )}
              
//               {form.allowed_routers_ids.length > 0 && (
//                 <p className="text-xs text-green-600 mt-2">
//                   {form.allowed_routers_ids.length} router(s) selected
//                 </p>
//               )}
//             </motion.div>
//           )}
//           {errors.router_specific && <p className="text-red-500 text-xs mt-2">{errors.router_specific}</p>}
//         </div>
        
//         {/* Fair Usage Policy */}
//         <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-orange-900/10' : 'bg-orange-50'}`}>
//           <label className={`block text-sm font-medium mb-3 ${themeClasses.text.primary} flex items-center`}>
//             <Shield className="w-4 h-4 mr-2" />
//             Fair Usage Policy (FUP)
//           </label>
          
//           <div className="space-y-4">
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 FUP Threshold
//                 <span className="text-xs text-gray-500 ml-2">- When to apply usage limits</span>
//               </label>
//               <div className="flex items-center space-x-4">
//                 <input 
//                   type="range" 
//                   value={form.FUP_threshold || 80} 
//                   onChange={(e) => onChange({ target: { name: 'FUP_threshold', value: parseInt(e.target.value, 10) || 80 } })} 
//                   className="flex-1"
//                   min="0" 
//                   max="100" 
//                   step="1" 
//                 />
//                 <span className="text-sm font-medium min-w-12">
//                   {form.FUP_threshold || 80}%
//                 </span>
//               </div>
//               <p className="text-xs text-gray-500 mt-1">
//                 Policy activates after {form.FUP_threshold || 80}% of usage limit is reached
//               </p>
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 Policy Description
//                 <span className="text-xs text-gray-500 ml-2">- What happens after threshold</span>
//               </label>
//               <textarea 
//                 value={form.FUP_policy || ""} 
//                 onChange={(e) => onChange(e)} 
//                 name="FUP_policy"
//                 rows={3}
//                 className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                 placeholder="e.g., Speed will be reduced to 1Mbps after reaching the usage threshold to ensure fair usage for all customers..."
//               />
//               <p className="text-xs text-gray-500 mt-1">
//                 Clearly describe what changes when the fair usage threshold is reached
//               </p>
//             </div>
//           </div>
//         </div>
        
//         {/* Summary Card */}
//         {(form.router_specific || form.FUP_policy || form.FUP_threshold) && (
//           <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-green-900/10' : 'bg-green-50'}`}>
//             <h4 className="text-sm font-semibold mb-3 text-green-700 dark:text-green-300">
//               Advanced Settings Summary
//             </h4>
//             <div className="space-y-2 text-sm">
//               {form.router_specific && (
//                 <p><strong>Router Restrictions:</strong> Enabled ({form.allowed_routers_ids.length} routers)</p>
//               )}
//               {form.FUP_threshold && (
//                 <p><strong>FUP Threshold:</strong> {form.FUP_threshold}% of usage limit</p>
//               )}
//               {form.FUP_policy && (
//                 <p><strong>FUP Policy:</strong> {form.FUP_policy.substring(0, 60)}...</p>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PlanAdvancedSettings;








// import React from "react";
// import { motion } from "framer-motion";
// import { EnhancedSelect, getThemeClasses } from "../Shared/components"
// import { priorityOptions } from "../Shared/constant"
// import { Settings, Router, Shield, TrendingDown } from "lucide-react";

// const PlanAdvancedSettings = ({ form, errors, onChange, routers, theme }) => {
//   const themeClasses = getThemeClasses(theme);

//   const toggleRouterSelection = (routerId) => {
//     const currentRouters = [...form.allowedRoutersIds];
//     const index = currentRouters.indexOf(routerId);
    
//     if (index > -1) {
//       currentRouters.splice(index, 1);
//     } else {
//       currentRouters.push(routerId);
//     }
    
//     onChange('allowedRoutersIds', currentRouters);
//   };

//   // Priority level descriptions for better UX
//   const getPriorityDescription = (level) => {
//     const descriptions = {
//       1: "Background tasks, lowest priority",
//       2: "Standard browsing, low priority",
//       3: "Normal usage, medium priority",
//       4: "Streaming, high priority",
//       5: "Gaming, very high priority",
//       6: "Critical applications",
//       7: "Premium users",
//       8: "VIP/Administrative"
//     };
//     return descriptions[level] || "Standard priority";
//   };

//   // Handle router specific toggle
//   const handleRouterSpecificToggle = () => {
//     const newValue = !form.router_specific;
//     onChange('router_specific', newValue);
    
//     // If disabling router specific, clear allowed routers
//     if (!newValue) {
//       onChange('allowedRoutersIds', []);
//     }
//   };

//   // Handle FUP threshold change
//   const handleFUPThresholdChange = (value) => {
//     const threshold = parseInt(value, 10) || 80;
//     onChange('FUP_threshold', threshold);
//   };

//   // Handle FUP policy change
//   const handleFUPPolicyChange = (value) => {
//     onChange('FUP_policy', value);
//   };

//   // Handle priority level change
//   const handlePriorityChange = (value) => {
//     onChange('priority_level', parseInt(value, 10));
//   };

//   // Check if free trial restrictions apply
//   const isFreeTrial = form.planType === 'free_trial';

//   return (
//     <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center">
//         <Settings className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
//         Advanced Settings
//       </h3>
      
//       <div className="space-y-6">
//         {/* Priority Level with Enhanced UX */}
//         <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-blue-900/10' : 'bg-blue-50'}`}>
//           <label className={`block text-sm font-medium mb-3 ${themeClasses.text.primary} flex items-center`}>
//             <TrendingDown className="w-4 h-4 mr-2" />
//             Network Priority
//           </label>
          
//           <div className="mb-3">
//             <EnhancedSelect
//               value={form.priority_level}
//               onChange={handlePriorityChange}
//               options={priorityOptions.map(opt => ({ 
//                 value: opt.value, 
//                 label: `${opt.label} - Level ${opt.value}`,
//                 disabled: isFreeTrial && opt.value > 4
//               }))}
//               theme={theme}
//               isDisabled={isFreeTrial}
//             />
//           </div>
          
//           {isFreeTrial && (
//             <div className={`p-3 rounded-lg mb-3 ${theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
//               <p className="text-sm text-yellow-700 dark:text-yellow-300">
//                 ⚠️ Free Trial plans cannot have premium priority levels (5-8)
//               </p>
//             </div>
//           )}
          
//           <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-800/20' : 'bg-blue-100'}`}>
//             <p className="text-sm text-blue-700 dark:text-blue-300">
//               <strong>Current:</strong> {getPriorityDescription(form.priority_level)}
//             </p>
//             <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
//               Higher priority plans get better network performance during congestion
//             </p>
//           </div>
          
//           {errors.priority_level && <p className="text-red-500 text-xs mt-2">{errors.priority_level}</p>}
//         </div>
        
//         {/* Router Restrictions */}
//         <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-purple-900/10' : 'bg-purple-50'}`}>
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
//             <div className="flex-1">
//               <label className={`block text-sm font-medium ${themeClasses.text.primary} flex items-center`}>
//                 <Router className="w-4 h-4 mr-2" />
//                 Router Restrictions
//               </label>
//               <p className="text-xs text-gray-500 mt-1">
//                 Limit this plan to specific routers only
//               </p>
//             </div>
//             <div 
//               onClick={isFreeTrial ? null : handleRouterSpecificToggle}
//               className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out flex-shrink-0 ${
//                 isFreeTrial 
//                   ? 'bg-gray-400 cursor-not-allowed'
//                   : form.router_specific 
//                     ? 'bg-indigo-600'
//                     : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//               }`}
//               title={isFreeTrial ? "Free Trial plans cannot be router-specific" : ""}
//             >
//               <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//                 form.router_specific ? "translate-x-6" : "translate-x-1"
//               }`} />
//             </div>
//           </div>
          
//           {isFreeTrial && (
//             <div className={`p-3 rounded-lg mb-3 ${theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
//               <p className="text-sm text-yellow-700 dark:text-yellow-300">
//                 ⚠️ Free Trial plans cannot be router-specific
//               </p>
//             </div>
//           )}
          
//           {form.router_specific && !isFreeTrial && (
//             <motion.div
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: 'auto' }}
//               transition={{ duration: 0.3 }}
//             >
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 Allowed Routers
//                 <span className="text-xs text-gray-500 ml-2">- Select where this plan will be available</span>
//               </label>
              
//               {routers && routers.length === 0 ? (
//                 <div className={`p-4 text-center rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
//                   <p className={`text-sm ${themeClasses.text.secondary}`}>No routers available in your network.</p>
//                 </div>
//               ) : (
//                 <div className={`space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3 ${themeClasses.border.light} ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
//                   {routers?.map((router) => (
//                     <div 
//                       key={router.id} 
//                       className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
//                         form.allowedRoutersIds?.includes(router.id)
//                           ? theme === 'dark' ? 'bg-indigo-900/50 border-indigo-500' : 'bg-indigo-50 border-indigo-300'
//                           : theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
//                       } border`}
//                       onClick={() => toggleRouterSelection(router.id)}
//                     >
//                       <input 
//                         type="checkbox" 
//                         checked={form.allowedRoutersIds?.includes(router.id)} 
//                         onChange={() => {}} // Handled by parent div click
//                         className={`h-4 w-4 focus:ring-indigo-500 border rounded ${
//                           theme === 'dark' 
//                             ? 'bg-gray-600 border-gray-500 text-indigo-600' 
//                             : 'text-indigo-600 border-gray-300'
//                         }`}
//                       />
//                       <label className={`ml-3 text-sm ${themeClasses.text.primary} flex-1 cursor-pointer`}>
//                         <div className="font-medium truncate">{router.name || `Router ${router.id}`}</div>
//                         {router.location && (
//                           <div className="text-xs text-gray-500 mt-1 truncate">{router.location}</div>
//                         )}
//                       </label>
//                     </div>
//                   ))}
//                 </div>
//               )}
              
//               {form.allowedRoutersIds?.length > 0 && (
//                 <p className="text-xs text-green-600 mt-2">
//                   {form.allowedRoutersIds.length} router(s) selected
//                 </p>
//               )}
//             </motion.div>
//           )}
//           {errors.router_specific && <p className="text-red-500 text-xs mt-2">{errors.router_specific}</p>}
//         </div>
        
//         {/* Fair Usage Policy */}
//         <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-orange-900/10' : 'bg-orange-50'}`}>
//           <label className={`block text-sm font-medium mb-3 ${themeClasses.text.primary} flex items-center`}>
//             <Shield className="w-4 h-4 mr-2" />
//             Fair Usage Policy (FUP)
//           </label>
          
//           <div className="space-y-4">
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 FUP Threshold
//                 <span className="text-xs text-gray-500 ml-2">- When to apply usage limits</span>
//               </label>
//               <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:space-x-4">
//                 <input 
//                   type="range" 
//                   value={form.FUP_threshold || 80} 
//                   onChange={(e) => handleFUPThresholdChange(e.target.value)} 
//                   className="flex-1"
//                   min="1" 
//                   max="100" 
//                   step="1" 
//                 />
//                 <span className="text-sm font-medium min-w-12 text-center sm:text-left">
//                   {form.FUP_threshold || 80}%
//                 </span>
//               </div>
//               <p className="text-xs text-gray-500 mt-1">
//                 Policy activates after {form.FUP_threshold || 80}% of usage limit is reached
//               </p>
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 Policy Description
//                 <span className="text-xs text-gray-500 ml-2">- What happens after threshold</span>
//               </label>
//               <textarea 
//                 value={form.FUP_policy || ""} 
//                 onChange={(e) => handleFUPPolicyChange(e.target.value)} 
//                 name="FUP_policy"
//                 rows={3}
//                 className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                 placeholder="e.g., Speed will be reduced to 1Mbps after reaching the usage threshold to ensure fair usage for all customers..."
//               />
//               <p className="text-xs text-gray-500 mt-1">
//                 Clearly describe what changes when the fair usage threshold is reached
//               </p>
//             </div>
//           </div>
//         </div>
        
//         {/* Summary Card */}
//         {(form.router_specific || form.FUP_policy || form.FUP_threshold) && (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.2 }}
//             className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-green-900/10' : 'bg-green-50'}`}
//           >
//             <h4 className="text-sm font-semibold mb-3 text-green-700 dark:text-green-300">
//               Advanced Settings Summary
//             </h4>
//             <div className="space-y-2 text-sm">
//               {form.router_specific && (
//                 <p className="flex flex-col xs:flex-row gap-1">
//                   <strong className="min-w-36">Router Restrictions:</strong>
//                   <span>Enabled ({form.allowedRoutersIds?.length || 0} routers)</span>
//                 </p>
//               )}
//               {form.FUP_threshold && (
//                 <p className="flex flex-col xs:flex-row gap-1">
//                   <strong className="min-w-36">FUP Threshold:</strong>
//                   <span>{form.FUP_threshold}% of usage limit</span>
//                 </p>
//               )}
//               {form.FUP_policy && (
//                 <p className="flex flex-col xs:flex-row gap-1">
//                   <strong className="min-w-36">FUP Policy:</strong>
//                   <span className="truncate">{form.FUP_policy.substring(0, 60)}...</span>
//                 </p>
//               )}
//             </div>
//           </motion.div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PlanAdvancedSettings;





// import React, { useState, useCallback, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { EnhancedSelect, getThemeClasses } from "../Shared/components";
// import { priorityOptions } from "../Shared/constant";
// import { Settings, Router, Shield, TrendingDown, Info, AlertTriangle, Check } from "lucide-react";

// const PlanAdvancedSettings = ({ form, errors, touched, onChange, onBlur, routers = [], theme }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [selectedRouters, setSelectedRouters] = useState(form.allowed_routers_ids || []);
//   const [localTouched, setLocalTouched] = useState({});

//   // Sync selected routers with form data
//   useEffect(() => {
//     setSelectedRouters(form.allowed_routers_ids || []);
//   }, [form.allowed_routers_ids]);

//   // FIXED: Enforce business rules with useEffect
//   useEffect(() => {
//     // Rule 1: Free trial plans cannot be router-specific
//     if (form.plan_type === 'free_trial' && form.router_specific) {
//       onChange({ target: { name: 'router_specific', type: 'checkbox', checked: false } });
//       onChange({ target: { name: 'allowed_routers_ids', value: [] } });
//       setSelectedRouters([]);
//     }
    
//     // Rule 2: Free trial plans cannot have priority > 4
//     if (form.plan_type === 'free_trial' && form.priority_level > 4) {
//       onChange({ target: { name: 'priority_level', value: 4 } });
//     }
//   }, [form.plan_type, form.router_specific, form.priority_level, onChange]);

//   // Toggle router selection
//   const toggleRouterSelection = useCallback((routerId) => {
//     const newSelection = selectedRouters.includes(routerId)
//       ? selectedRouters.filter(id => id !== routerId)
//       : [...selectedRouters, routerId];
    
//     setSelectedRouters(newSelection);
//     // Use proper event format
//     onChange({ target: { name: 'allowed_routers_ids', value: newSelection } });
    
//     // Mark as touched for validation
//     setLocalTouched(prev => ({ ...prev, allowed_routers_ids: true }));
//   }, [selectedRouters, onChange]);

//   // Priority level descriptions for better UX
//   const getPriorityDescription = useCallback((level) => {
//     const descriptions = {
//       1: "Background tasks - Email, file downloads",
//       2: "Standard browsing - Web surfing, social media",
//       3: "Normal usage - Video calls, online shopping",
//       4: "Streaming - HD video streaming, music",
//       5: "Gaming - Online gaming, low latency",
//       6: "Critical - VoIP, business applications",
//       7: "Premium - Reserved for VIP customers",
//       8: "Administrative - System operations only"
//     };
//     return descriptions[level] || "Standard priority";
//   }, []);

//   // Handle router specific toggle
//   const handleRouterSpecificToggle = useCallback(() => {
//     const newValue = !form.router_specific;
//     onChange({ target: { name: 'router_specific', type: 'checkbox', checked: newValue } });
    
//     // If disabling router specific, clear allowed routers
//     if (!newValue) {
//       setSelectedRouters([]);
//       onChange({ target: { name: 'allowed_routers_ids', value: [] } });
//     }
    
//     // Mark as touched for validation
//     setLocalTouched(prev => ({ ...prev, router_specific: true }));
//     if (onBlur) onBlur('router_specific');
//   }, [form.router_specific, onChange, onBlur]);

//   // Handle FUP threshold change
//   const handleFUPThresholdChange = useCallback((e) => {
//     let value = parseInt(e.target.value, 10) || 80;
//     // Clamp between 1 and 100
//     value = Math.max(1, Math.min(100, value));
//     onChange({ target: { name: 'FUP_threshold', value } });
//   }, [onChange]);

//   // Handle FUP policy change
//   const handleFUPPolicyChange = useCallback((e) => {
//     onChange(e);
//   }, [onChange]);

//   // Handle priority level change
//   const handlePriorityChange = useCallback((value) => {
//     onChange({ target: { name: 'priority_level', value: parseInt(value, 10) } });
    
//     // Mark as touched for validation
//     setLocalTouched(prev => ({ ...prev, priority_level: true }));
//     if (onBlur) onBlur('priority_level');
//   }, [onChange, onBlur]);

//   // Clear all selected routers
//   const handleClearRouters = useCallback(() => {
//     setSelectedRouters([]);
//     onChange({ target: { name: 'allowed_routers_ids', value: [] } });
    
//     // Mark as touched for validation
//     setLocalTouched(prev => ({ ...prev, allowed_routers_ids: true }));
//   }, [onChange]);

//   // Check if free trial restrictions apply
//   const isFreeTrial = form.plan_type === 'free_trial';

//   // Determine if field should show error
//   const shouldShowError = useCallback((fieldName) => {
//     return errors[fieldName] && (touched[fieldName] || localTouched[fieldName]);
//   }, [errors, touched, localTouched]);

//   // FIXED: Make router toggle button accessible
//   const handleRouterToggleKeyDown = useCallback((e) => {
//     if (e.key === 'Enter' || e.key === ' ') {
//       e.preventDefault();
//       if (!isFreeTrial) {
//         handleRouterSpecificToggle();
//       }
//     }
//   }, [isFreeTrial, handleRouterSpecificToggle]);

//   // FIXED: Make router selection cards accessible
//   const handleRouterCardKeyDown = useCallback((e, routerId) => {
//     if (e.key === 'Enter' || e.key === ' ') {
//       e.preventDefault();
//       toggleRouterSelection(routerId);
//     }
//   }, [toggleRouterSelection]);

//   return (
//     <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <h3 className="text-lg lg:text-xl font-semibold mb-6 flex items-center">
//         <Settings className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
//         Advanced Settings
//         <span className="ml-2 text-xs text-gray-500">(Optional configurations)</span>
//       </h3>
      
//       <div className="space-y-8">
//         {/* Priority Level with Enhanced UX */}
//         <div className={`p-4 lg:p-6 rounded-xl border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-blue-900/10' : 'bg-blue-50'}`}>
//           <div className="flex items-start justify-between mb-4">
//             <div className="flex-1">
//               <label className={`block text-lg font-semibold mb-2 ${themeClasses.text.primary} flex items-center`}>
//                 <TrendingDown className="w-5 h-5 mr-2 text-blue-600" />
//                 Network Priority Configuration
//               </label>
//               <p className="text-sm text-gray-600 dark:text-gray-400">
//                 Control how this plan's traffic is prioritized on the network
//               </p>
//             </div>
//             <div className="group relative">
//               <Info className="w-5 h-5 text-gray-400 cursor-help" />
//               <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50">
//                 <p><strong>Priority Levels:</strong></p>
//                 <p className="mt-1">1-2: Best effort, no guarantees</p>
//                 <p>3-4: Standard quality of service</p>
//                 <p>5-6: Premium with bandwidth reservation</p>
//                 <p>7-8: Highest priority with guarantees</p>
//               </div>
//             </div>
//           </div>
          
//           <div className="mb-4">
//             <label className={`block text-sm font-medium mb-3 ${themeClasses.text.primary}`}>
//               Select Priority Level:
//             </label>
//             <EnhancedSelect
//               value={form.priority_level || 4}
//               onChange={handlePriorityChange}
//               options={priorityOptions.map(opt => ({ 
//                 value: opt.value,
//                 label: `${opt.label} (Level ${opt.value})`,
//                 description: opt.description,
//                 disabled: isFreeTrial && opt.value > 4
//               }))}
//               placeholder="Select Priority Level"
//               theme={theme}
//               isSearchable={true}
//             />
//           </div>
          
//           {isFreeTrial && (
//             <motion.div
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className={`p-4 rounded-lg mb-4 ${theme === 'dark' ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}
//             >
//               <div className="flex items-start">
//                 <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
//                 <div>
//                   <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
//                     Free Trial Restrictions
//                   </h4>
//                   <p className="text-sm text-yellow-700 dark:text-yellow-400">
//                     Free Trial plans cannot have premium priority levels (5-8). 
//                     This ensures fair usage for all customers during trial periods.
//                   </p>
//                 </div>
//               </div>
//             </motion.div>
//           )}
          
//           <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-800/30 border border-blue-700' : 'bg-blue-100 border border-blue-200'}`}>
//             <div className="flex items-center mb-2">
//               <Settings className="w-4 h-4 text-blue-600 mr-2" />
//               <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">
//                 Current Configuration
//               </h4>
//             </div>
//             <p className="text-sm text-blue-700 dark:text-blue-400">
//               <strong>Level {form.priority_level || 4}:</strong> {getPriorityDescription(form.priority_level || 4)}
//             </p>
//             <p className="text-xs text-blue-600 dark:text-blue-500 mt-2">
//               Higher priority plans receive better network performance during congestion
//             </p>
//           </div>
          
//           {shouldShowError('priority_level') && (
//             <p className="text-red-500 text-sm mt-3 flex items-center">
//               <AlertTriangle className="w-4 h-4 mr-2" />
//               {errors.priority_level}
//             </p>
//           )}
//         </div>
        
//         {/* Router Restrictions */}
//         <div className={`p-4 lg:p-6 rounded-xl border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-purple-900/10' : 'bg-purple-50'}`}>
//           <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
//             <div className="flex-1">
//               <div className="flex items-center mb-2">
//                 <Router className="w-5 h-5 text-purple-600 mr-2" />
//                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                   Router Restrictions
//                 </h3>
//               </div>
//               <p className="text-sm text-gray-600 dark:text-gray-400">
//                 Limit this plan to specific routers only. Useful for location-based plans or testing.
//               </p>
//             </div>
            
//             <div className="flex items-center space-x-4">
//               <div className="flex flex-col">
//                 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                   {form.router_specific ? 'Restricted' : 'All Routers'}
//                 </span>
//                 <span className="text-xs text-gray-500">
//                   {form.router_specific ? `${selectedRouters.length} selected` : 'No restrictions'}
//                 </span>
//               </div>
              
//               <button
//                 type="button"
//                 onClick={isFreeTrial ? undefined : handleRouterSpecificToggle}
//                 onKeyDown={handleRouterToggleKeyDown}
//                 disabled={isFreeTrial}
//                 className={`relative inline-flex items-center h-7 w-14 rounded-full cursor-pointer transition-colors duration-200 ease-in-out flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
//                   isFreeTrial 
//                     ? 'bg-gray-400 cursor-not-allowed'
//                     : form.router_specific 
//                       ? 'bg-purple-600'
//                       : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//                 }`}
//                 title={isFreeTrial ? "Free Trial plans cannot be router-specific" : ""}
//                 aria-label={`Toggle router restrictions. Currently ${form.router_specific ? 'restricted' : 'all routers'}`}
//                 aria-disabled={isFreeTrial}
//               >
//                 <span className={`inline-block h-5 w-5 transform bg-white rounded-full shadow-lg transition-transform duration-200 ease-in-out ${
//                   form.router_specific ? "translate-x-8" : "translate-x-1"
//                 }`} />
//               </button>
//             </div>
//           </div>
          
//           {isFreeTrial && (
//             <motion.div
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className={`p-4 rounded-lg mb-6 ${theme === 'dark' ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}
//             >
//               <div className="flex items-start">
//                 <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
//                 <div>
//                   <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
//                     Free Trial Restriction
//                   </h4>
//                   <p className="text-sm text-yellow-700 dark:text-yellow-400">
//                     Free Trial plans cannot be router-specific. They must be available on all routers to ensure easy access for trial users.
//                   </p>
//                 </div>
//               </div>
//             </motion.div>
//           )}
          
//           {form.router_specific && !isFreeTrial && (
//             <motion.div
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: 'auto' }}
//               transition={{ duration: 0.3 }}
//               className="space-y-4"
//             >
//               <div>
//                 <label className={`block text-sm font-medium mb-3 ${themeClasses.text.primary}`}>
//                   Select Allowed Routers
//                   <span className="text-xs text-gray-500 ml-2">
//                     - Plan will only be available on selected routers
//                   </span>
//                 </label>
                
//                 {routers.length === 0 ? (
//                   <div className={`p-6 text-center rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
//                     <Router className="w-10 h-10 text-gray-400 mx-auto mb-3" />
//                     <p className={`text-sm font-medium ${themeClasses.text.secondary}`}>No routers available</p>
//                     <p className="text-xs text-gray-500 mt-1">
//                       Your network doesn't have any routers configured yet.
//                     </p>
//                   </div>
//                 ) : (
//                   <div className={`border rounded-lg overflow-hidden ${themeClasses.border.light} ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
//                     <div className="max-h-64 overflow-y-auto p-2">
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//                         {routers.map((router) => (
//                           <button
//                             key={router.id}
//                             type="button"
//                             className={`flex items-center p-3 rounded-lg transition-all duration-200 border text-left w-full focus:outline-none focus:ring-2 focus:ring-purple-500 ${
//                               selectedRouters.includes(router.id)
//                                 ? theme === 'dark' 
//                                   ? 'bg-purple-900/50 border-purple-500 ring-1 ring-purple-500' 
//                                   : 'bg-purple-50 border-purple-300 ring-1 ring-purple-300'
//                                 : `${themeClasses.border.light} ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`
//                             }`}
//                             onClick={() => toggleRouterSelection(router.id)}
//                             onKeyDown={(e) => handleRouterCardKeyDown(e, router.id)}
//                             aria-label={`Select router: ${router.name || `Router ${router.id}`}. Currently ${selectedRouters.includes(router.id) ? 'selected' : 'not selected'}`}
//                           >
//                             <input 
//                               type="checkbox" 
//                               checked={selectedRouters.includes(router.id)} 
//                               readOnly
//                               className={`h-4 w-4 focus:ring-purple-500 border rounded ${
//                                 theme === 'dark' 
//                                   ? 'bg-gray-600 border-gray-500 text-purple-600' 
//                                   : 'text-purple-600 border-gray-300'
//                               }`}
//                               aria-hidden="true"
//                             />
//                             <div className="ml-3 flex-1">
//                               <div className="flex items-center justify-between">
//                                 <span className={`text-sm font-medium ${themeClasses.text.primary} truncate`}>
//                                   {router.name || `Router ${router.id}`}
//                                 </span>
//                                 {router.status === 'online' && (
//                                   <span className="h-2 w-2 rounded-full bg-green-500" aria-label="Online" />
//                                 )}
//                               </div>
//                               {router.location && (
//                                 <div className="text-xs text-gray-500 mt-1 truncate">
//                                   📍 {router.location}
//                                 </div>
//                               )}
//                               {router.model && (
//                                 <div className="text-xs text-gray-500 mt-0.5">
//                                   {router.model}
//                                 </div>
//                               )}
//                             </div>
//                             {selectedRouters.includes(router.id) && (
//                               <Check className="w-4 h-4 text-purple-600 ml-2 flex-shrink-0" aria-hidden="true" />
//                             )}
//                           </button>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 )}
                
//                 {selectedRouters.length > 0 && (
//                   <div className="mt-3 flex items-center justify-between">
//                     <span className="text-sm text-green-600 font-medium">
//                       ✓ {selectedRouters.length} router{selectedRouters.length !== 1 ? 's' : ''} selected
//                     </span>
//                     <button
//                       type="button"
//                       onClick={handleClearRouters}
//                       className="text-xs text-red-600 hover:text-red-800 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500"
//                     >
//                       Clear selection
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </motion.div>
//           )}
          
//           {shouldShowError('router_specific') && (
//             <p className="text-red-500 text-sm mt-3 flex items-center">
//               <AlertTriangle className="w-4 h-4 mr-2" />
//               {errors.router_specific}
//             </p>
//           )}
          
//           {shouldShowError('allowed_routers_ids') && (
//             <p className="text-red-500 text-sm mt-3 flex items-center">
//               <AlertTriangle className="w-4 h-4 mr-2" />
//               {errors.allowed_routers_ids}
//             </p>
//           )}
//         </div>
        
//         {/* Fair Usage Policy */}
//         <div className={`p-4 lg:p-6 rounded-xl border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-orange-900/10' : 'bg-orange-50'}`}>
//           <div className="flex items-center mb-4">
//             <Shield className="w-5 h-5 text-orange-600 mr-2" />
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//               Fair Usage Policy (FUP) Configuration
//             </h3>
//           </div>
          
//           <div className="space-y-6">
//             <div>
//               <label className={`block text-sm font-medium mb-3 ${themeClasses.text.primary}`}>
//                 FUP Threshold
//                 <span className="text-xs text-gray-500 ml-2">- When to apply usage limits</span>
//               </label>
              
//               <div className="space-y-4">
//                 <div className="flex items-center space-x-4">
//                   <input 
//                     type="range" 
//                     name="FUP_threshold"
//                     value={form.FUP_threshold || 80} 
//                     onChange={handleFUPThresholdChange}
//                     onBlur={(e) => {
//                       if (onBlur) onBlur('FUP_threshold');
//                       setLocalTouched(prev => ({ ...prev, FUP_threshold: true }));
//                     }}
//                     className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500"
//                     min="1" 
//                     max="100" 
//                     step="1" 
//                   />
//                   <div className={`w-16 text-center font-semibold ${
//                     form.FUP_threshold >= 90 ? 'text-red-600' :
//                     form.FUP_threshold >= 70 ? 'text-orange-600' : 'text-green-600'
//                   }`}>
//                     {form.FUP_threshold || 80}%
//                   </div>
//                 </div>
                
//                 <div className="flex justify-between text-xs text-gray-500">
//                   <div className="text-center">
//                     <div className="font-medium">Strict</div>
//                     <div>1-30%</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="font-medium">Moderate</div>
//                     <div>31-70%</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="font-medium">Liberal</div>
//                     <div>71-100%</div>
//                   </div>
//                 </div>
//               </div>
              
//               <p className="text-xs text-gray-500 mt-3">
//                 Policy activates after {form.FUP_threshold || 80}% of usage limit is reached.
//                 Recommended: 70-90% for balanced usage.
//               </p>
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium mb-3 ${themeClasses.text.primary}`}>
//                 Policy Description
//                 <span className="text-xs text-gray-500 ml-2">- What happens after threshold</span>
//               </label>
              
//               <textarea 
//                 value={form.FUP_policy || ""} 
//                 onChange={handleFUPPolicyChange}
//                 onBlur={(e) => {
//                   if (onBlur) onBlur('FUP_policy');
//                   setLocalTouched(prev => ({ ...prev, FUP_policy: true }));
//                 }}
//                 name="FUP_policy"
//                 rows={4}
//                 className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-orange-500`}
//                 placeholder="Describe what changes when the fair usage threshold is reached. For example:
// • Speed reduced to 1 Mbps for downloads
// • Upload speed limited to 0.5 Mbps
// • High-priority traffic unaffected
// • Reset at midnight each day"
//               />
              
//               <div className="mt-2 space-y-2">
//                 <p className="text-xs text-gray-500">
//                   <strong>Tips:</strong>
//                 </p>
//                 <ul className="text-xs text-gray-500 space-y-1">
//                   <li>• Be specific about speed limits after threshold</li>
//                   <li>• Mention when limits reset (daily/monthly)</li>
//                   <li>• Explain if certain services remain unaffected</li>
//                   <li>• State if customers can purchase additional data</li>
//                 </ul>
//               </div>

//               {shouldShowError('FUP_policy') && (
//                 <p className="text-red-500 text-xs mt-2">{errors.FUP_policy}</p>
//               )}
//             </div>
//           </div>
//         </div>
        
//         {/* Summary Card */}
//         <AnimatePresence>
//           {(form.router_specific || form.FUP_policy || (form.FUP_threshold && form.FUP_threshold !== 80)) && (
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               className={`p-4 lg:p-6 rounded-xl border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-green-900/10' : 'bg-green-50'}`}
//             >
//               <h4 className="text-md font-semibold mb-4 text-green-700 dark:text-green-300 flex items-center">
//                 <Settings className="w-4 h-4 mr-2" />
//                 Advanced Settings Summary
//               </h4>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-3">
//                   <div className="flex items-center">
//                     <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center mr-3">
//                       <span className="text-xs font-semibold text-green-600 dark:text-green-400">
//                         {form.priority_level || 4}
//                       </span>
//                     </div>
//                     <div>
//                       <div className="text-sm font-medium">Priority Level</div>
//                       <div className="text-xs text-gray-500">{getPriorityDescription(form.priority_level || 4)}</div>
//                     </div>
//                   </div>
                  
//                   {form.router_specific && (
//                     <div className="flex items-center">
//                       <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center mr-3">
//                         <Router className="w-3 h-3 text-purple-600 dark:text-purple-400" />
//                       </div>
//                       <div>
//                         <div className="text-sm font-medium">Router Restricted</div>
//                         <div className="text-xs text-gray-500">
//                           {selectedRouters.length} router{selectedRouters.length !== 1 ? 's' : ''} selected
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
                
//                 <div className="space-y-3">
//                   {form.FUP_threshold && form.FUP_threshold !== 80 && (
//                     <div className="flex items-center">
//                       <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-800 flex items-center justify-center mr-3">
//                         <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
//                           {form.FUP_threshold}%
//                         </span>
//                       </div>
//                       <div>
//                         <div className="text-sm font-medium">FUP Threshold</div>
//                         <div className="text-xs text-gray-500">
//                           Activates at {form.FUP_threshold}% of usage
//                         </div>
//                       </div>
//                     </div>
//                   )}
                  
//                   {form.FUP_policy && (
//                     <div className="flex items-center">
//                       <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center mr-3">
//                         <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
//                       </div>
//                       <div>
//                         <div className="text-sm font-medium">FUP Policy</div>
//                         <div className="text-xs text-gray-500 truncate">
//                           {form.FUP_policy.substring(0, 40)}...
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// };

// export default PlanAdvancedSettings;













import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EnhancedSelect, getThemeClasses } from "../Shared/components";
import { priorityOptions } from "../Shared/constant";
import { Settings, Router, Shield, TrendingDown, Info, AlertTriangle, Check } from "lucide-react";

const PlanAdvancedSettings = ({ form, errors, touched, onChange, onBlur, routers = [], theme }) => {
  const themeClasses = getThemeClasses(theme);
  const [selectedRouters, setSelectedRouters] = useState(form.allowed_routers_ids || []);
  const [localTouched, setLocalTouched] = useState({});

  // Sync selected routers with form data
  useEffect(() => {
    setSelectedRouters(form.allowed_routers_ids || []);
  }, [form.allowed_routers_ids]);

  // FIXED: Enforce business rules with useEffect
  useEffect(() => {
    // Rule 1: Free trial plans cannot be router-specific
    if (form.plan_type === 'free_trial' && form.router_specific) {
      onChange('router_specific', false);
      onChange('allowed_routers_ids', []);
      setSelectedRouters([]);
    }
    
    // Rule 2: Free trial plans cannot have priority > 4
    if (form.plan_type === 'free_trial' && form.priority_level > 4) {
      onChange('priority_level', 4);
    }
  }, [form.plan_type, form.router_specific, form.priority_level, onChange]);

  // Toggle router selection
  const toggleRouterSelection = useCallback((routerId) => {
    const newSelection = selectedRouters.includes(routerId)
      ? selectedRouters.filter(id => id !== routerId)
      : [...selectedRouters, routerId];
    
    setSelectedRouters(newSelection);
    onChange('allowed_routers_ids', newSelection);
    
    // Mark as touched for validation
    setLocalTouched(prev => ({ ...prev, allowed_routers_ids: true }));
  }, [selectedRouters]);

  // Priority level descriptions for better UX
  const getPriorityDescription = useCallback((level) => {
    const descriptions = {
      1: "Background tasks - Email, file downloads",
      2: "Standard browsing - Web surfing, social media",
      3: "Normal usage - Video calls, online shopping",
      4: "Streaming - HD video streaming, music",
      5: "Gaming - Online gaming, low latency",
      6: "Critical - VoIP, business applications",
      7: "Premium - Reserved for VIP customers",
      8: "Administrative - System operations only"
    };
    return descriptions[level] || "Standard priority";
  }, []);

  // Handle router specific toggle
  const handleRouterSpecificToggle = useCallback(() => {
    const newValue = !form.router_specific;
    onChange('router_specific', newValue);
    
    // If disabling router specific, clear allowed routers
    if (!newValue) {
      setSelectedRouters([]);
      onChange('allowed_routers_ids', []);
    }
    
    // Mark as touched for validation
    setLocalTouched(prev => ({ ...prev, router_specific: true }));
    if (onBlur) onBlur('router_specific');
  }, [form.router_specific, onBlur]);

  // Handle FUP threshold change
  const handleFUPThresholdChange = useCallback((e) => {
    let value = parseInt(e.target.value, 10) || 80;
    // Clamp between 1 and 100
    value = Math.max(1, Math.min(100, value));
    onChange('FUP_threshold', value);
  }, []);

  // Handle FUP policy change
  const handleFUPPolicyChange = useCallback((e) => {
    onChange('FUP_policy', e.target.value);
  }, []);

  // Handle priority level change
  const handlePriorityChange = useCallback((value) => {
    onChange('priority_level', parseInt(value, 10));
    
    // Mark as touched for validation
    setLocalTouched(prev => ({ ...prev, priority_level: true }));
    if (onBlur) onBlur('priority_level');
  }, [onBlur]);

  // Clear all selected routers
  const handleClearRouters = useCallback(() => {
    setSelectedRouters([]);
    onChange('allowed_routers_ids', []);
    
    // Mark as touched for validation
    setLocalTouched(prev => ({ ...prev, allowed_routers_ids: true }));
  }, []);

  // Check if free trial restrictions apply
  const isFreeTrial = form.plan_type === 'free_trial';

  // Determine if field should show error
  const shouldShowError = useCallback((fieldName) => {
    return errors[fieldName] && (touched[fieldName] || localTouched[fieldName]);
  }, [errors, touched, localTouched]);

  // FIXED: Make router toggle button accessible
  const handleRouterToggleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isFreeTrial) {
        handleRouterSpecificToggle();
      }
    }
  }, [isFreeTrial, handleRouterSpecificToggle]);

  // FIXED: Make router selection cards accessible
  const handleRouterCardKeyDown = useCallback((e, routerId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleRouterSelection(routerId);
    }
  }, [toggleRouterSelection]);

  return (
    <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <h3 className="text-lg lg:text-xl font-semibold mb-6 flex items-center">
        <Settings className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
        Advanced Settings
        <span className="ml-2 text-xs text-gray-500">(Optional configurations)</span>
      </h3>
      
      <div className="space-y-8">
        {/* Priority Level with Enhanced UX */}
        <div className={`p-4 lg:p-6 rounded-xl border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-blue-900/10' : 'bg-blue-50'}`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <label className={`block text-lg font-semibold mb-2 ${themeClasses.text.primary} flex items-center`}>
                <TrendingDown className="w-5 h-5 mr-2 text-blue-600" />
                Network Priority Configuration
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Control how this plan's traffic is prioritized on the network
              </p>
            </div>
            <div className="group relative">
              <Info className="w-5 h-5 text-gray-400 cursor-help" />
              <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50">
                <p><strong>Priority Levels:</strong></p>
                <p className="mt-1">1-2: Best effort, no guarantees</p>
                <p>3-4: Standard quality of service</p>
                <p>5-6: Premium with bandwidth reservation</p>
                <p>7-8: Highest priority with guarantees</p>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-3 ${themeClasses.text.primary}`}>
              Select Priority Level:
            </label>
            <EnhancedSelect
              value={form.priority_level || 4}
              onChange={handlePriorityChange}
              options={priorityOptions.map(opt => ({ 
                value: opt.value,
                label: `${opt.label} (Level ${opt.value})`,
                description: opt.description,
                disabled: isFreeTrial && opt.value > 4
              }))}
              placeholder="Select Priority Level"
              theme={theme}
              isSearchable={true}
            />
          </div>
          
          {isFreeTrial && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg mb-4 ${theme === 'dark' ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}
            >
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                    Free Trial Restrictions
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Free Trial plans cannot have premium priority levels (5-8). 
                    This ensures fair usage for all customers during trial periods.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-800/30 border border-blue-700' : 'bg-blue-100 border border-blue-200'}`}>
            <div className="flex items-center mb-2">
              <Settings className="w-4 h-4 text-blue-600 mr-2" />
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                Current Configuration
              </h4>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <strong>Level {form.priority_level || 4}:</strong> {getPriorityDescription(form.priority_level || 4)}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-500 mt-2">
              Higher priority plans receive better network performance during congestion
            </p>
          </div>
          
          {shouldShowError('priority_level') && (
            <p className="text-red-500 text-sm mt-3 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {errors.priority_level}
            </p>
          )}
        </div>
        
        {/* Router Restrictions */}
        <div className={`p-4 lg:p-6 rounded-xl border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-purple-900/10' : 'bg-purple-50'}`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <Router className="w-5 h-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Router Restrictions
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Limit this plan to specific routers only. Useful for location-based plans or testing.
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {form.router_specific ? 'Restricted' : 'All Routers'}
                </span>
                <span className="text-xs text-gray-500">
                  {form.router_specific ? `${selectedRouters.length} selected` : 'No restrictions'}
                </span>
              </div>
              
              <button
                type="button"
                onClick={isFreeTrial ? undefined : handleRouterSpecificToggle}
                onKeyDown={handleRouterToggleKeyDown}
                disabled={isFreeTrial}
                className={`relative inline-flex items-center h-7 w-14 rounded-full cursor-pointer transition-colors duration-200 ease-in-out flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isFreeTrial 
                    ? 'bg-gray-400 cursor-not-allowed'
                    : form.router_specific 
                      ? 'bg-purple-600'
                      : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                }`}
                title={isFreeTrial ? "Free Trial plans cannot be router-specific" : ""}
                aria-label={`Toggle router restrictions. Currently ${form.router_specific ? 'restricted' : 'all routers'}`}
                aria-disabled={isFreeTrial}
              >
                <span className={`inline-block h-5 w-5 transform bg-white rounded-full shadow-lg transition-transform duration-200 ease-in-out ${
                  form.router_specific ? "translate-x-8" : "translate-x-1"
                }`} />
              </button>
            </div>
          </div>
          
          {isFreeTrial && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg mb-6 ${theme === 'dark' ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}
            >
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                    Free Trial Restriction
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Free Trial plans cannot be router-specific. They must be available on all routers to ensure easy access for trial users.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          {form.router_specific && !isFreeTrial && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div>
                <label className={`block text-sm font-medium mb-3 ${themeClasses.text.primary}`}>
                  Select Allowed Routers
                  <span className="text-xs text-gray-500 ml-2">
                    - Plan will only be available on selected routers
                  </span>
                </label>
                
                {routers.length === 0 ? (
                  <div className={`p-6 text-center rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <Router className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className={`text-sm font-medium ${themeClasses.text.secondary}`}>No routers available</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Your network doesn't have any routers configured yet.
                    </p>
                  </div>
                ) : (
                  <div className={`border rounded-lg overflow-hidden ${themeClasses.border.light} ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="max-h-64 overflow-y-auto p-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {routers.map((router) => (
                          <button
                            key={router.id}
                            type="button"
                            className={`flex items-center p-3 rounded-lg transition-all duration-200 border text-left w-full focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              selectedRouters.includes(router.id)
                                ? theme === 'dark' 
                                  ? 'bg-purple-900/50 border-purple-500 ring-1 ring-purple-500' 
                                  : 'bg-purple-50 border-purple-300 ring-1 ring-purple-300'
                                : `${themeClasses.border.light} ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`
                            }`}
                            onClick={() => toggleRouterSelection(router.id)}
                            onKeyDown={(e) => handleRouterCardKeyDown(e, router.id)}
                            aria-label={`Select router: ${router.name || `Router ${router.id}`}. Currently ${selectedRouters.includes(router.id) ? 'selected' : 'not selected'}`}
                          >
                            <input 
                              type="checkbox" 
                              checked={selectedRouters.includes(router.id)} 
                              readOnly
                              className={`h-4 w-4 focus:ring-purple-500 border rounded ${
                                theme === 'dark' 
                                  ? 'bg-gray-600 border-gray-500 text-purple-600' 
                                  : 'text-purple-600 border-gray-300'
                              }`}
                              aria-hidden="true"
                            />
                            <div className="ml-3 flex-1">
                              <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium ${themeClasses.text.primary} truncate`}>
                                  {router.name || `Router ${router.id}`}
                                </span>
                                {router.status === 'online' && (
                                  <span className="h-2 w-2 rounded-full bg-green-500" aria-label="Online" />
                                )}
                              </div>
                              {router.location && (
                                <div className="text-xs text-gray-500 mt-1 truncate">
                                  📍 {router.location}
                                </div>
                              )}
                              {router.model && (
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {router.model}
                                </div>
                              )}
                            </div>
                            {selectedRouters.includes(router.id) && (
                              <Check className="w-4 h-4 text-purple-600 ml-2 flex-shrink-0" aria-hidden="true" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedRouters.length > 0 && (
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-green-600 font-medium">
                      ✓ {selectedRouters.length} router{selectedRouters.length !== 1 ? 's' : ''} selected
                    </span>
                    <button
                      type="button"
                      onClick={handleClearRouters}
                      className="text-xs text-red-600 hover:text-red-800 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Clear selection
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
          {shouldShowError('router_specific') && (
            <p className="text-red-500 text-sm mt-3 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {errors.router_specific}
            </p>
          )}
          
          {shouldShowError('allowed_routers_ids') && (
            <p className="text-red-500 text-sm mt-3 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {errors.allowed_routers_ids}
            </p>
          )}
        </div>
        
        {/* Fair Usage Policy */}
        <div className={`p-4 lg:p-6 rounded-xl border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-orange-900/10' : 'bg-orange-50'}`}>
          <div className="flex items-center mb-4">
            <Shield className="w-5 h-5 text-orange-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Fair Usage Policy (FUP) Configuration
            </h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-3 ${themeClasses.text.primary}`}>
                FUP Threshold
                <span className="text-xs text-gray-500 ml-2">- When to apply usage limits</span>
              </label>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <input 
                    type="range" 
                    name="FUP_threshold"
                    value={form.FUP_threshold || 80} 
                    onChange={handleFUPThresholdChange}
                    onBlur={(e) => {
                      if (onBlur) onBlur('FUP_threshold');
                      setLocalTouched(prev => ({ ...prev, FUP_threshold: true }));
                    }}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500"
                    min="1" 
                    max="100" 
                    step="1" 
                  />
                  <div className={`w-16 text-center font-semibold ${
                    form.FUP_threshold >= 90 ? 'text-red-600' :
                    form.FUP_threshold >= 70 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {form.FUP_threshold || 80}%
                  </div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <div className="text-center">
                    <div className="font-medium">Strict</div>
                    <div>1-30%</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">Moderate</div>
                    <div>31-70%</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">Liberal</div>
                    <div>71-100%</div>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-3">
                Policy activates after {form.FUP_threshold || 80}% of usage limit is reached.
                Recommended: 70-90% for balanced usage.
              </p>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-3 ${themeClasses.text.primary}`}>
                Policy Description
                <span className="text-xs text-gray-500 ml-2">- What happens after threshold</span>
              </label>
              
              <textarea 
                name="FUP_policy"
                value={form.FUP_policy || ""} 
                onChange={handleFUPPolicyChange}
                onBlur={(e) => {
                  if (onBlur) onBlur('FUP_policy');
                  setLocalTouched(prev => ({ ...prev, FUP_policy: true }));
                }}
                rows={4}
                className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-orange-500`}
                placeholder="Describe what changes when the fair usage threshold is reached. For example:
• Speed reduced to 1 Mbps for downloads
• Upload speed limited to 0.5 Mbps
• High-priority traffic unaffected
• Reset at midnight each day"
              />
              
              <div className="mt-2 space-y-2">
                <p className="text-xs text-gray-500">
                  <strong>Tips:</strong>
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Be specific about speed limits after threshold</li>
                  <li>• Mention when limits reset (daily/monthly)</li>
                  <li>• Explain if certain services remain unaffected</li>
                  <li>• State if customers can purchase additional data</li>
                </ul>
              </div>

              {shouldShowError('FUP_policy') && (
                <p className="text-red-500 text-xs mt-2">{errors.FUP_policy}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Summary Card */}
        <AnimatePresence>
          {(form.router_specific || form.FUP_policy || (form.FUP_threshold && form.FUP_threshold !== 80)) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 lg:p-6 rounded-xl border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-green-900/10' : 'bg-green-50'}`}
            >
              <h4 className="text-md font-semibold mb-4 text-green-700 dark:text-green-300 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Advanced Settings Summary
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center mr-3">
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                        {form.priority_level || 4}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Priority Level</div>
                      <div className="text-xs text-gray-500">{getPriorityDescription(form.priority_level || 4)}</div>
                    </div>
                  </div>
                  
                  {form.router_specific && (
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center mr-3">
                        <Router className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Router Restricted</div>
                        <div className="text-xs text-gray-500">
                          {selectedRouters.length} router{selectedRouters.length !== 1 ? 's' : ''} selected
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  {form.FUP_threshold && form.FUP_threshold !== 80 && (
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-800 flex items-center justify-center mr-3">
                        <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                          {form.FUP_threshold}%
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">FUP Threshold</div>
                        <div className="text-xs text-gray-500">
                          Activates at {form.FUP_threshold}% of usage
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {form.FUP_policy && (
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center mr-3">
                        <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">FUP Policy</div>
                        <div className="text-xs text-gray-500 truncate">
                          {form.FUP_policy.substring(0, 40)}...
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PlanAdvancedSettings;