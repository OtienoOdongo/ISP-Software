


// // ============================================================================
// // PlanAdvancedSettings.js - COMPLETELY REWRITTEN
// // ============================================================================

// import React, { useState, useCallback, useEffect, useMemo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { EnhancedSelect, getThemeClasses } from "../Shared/components";
// import { priorityOptions } from "../Shared/constant";
// import { 
//   Settings, Router, Shield, TrendingDown, Info, AlertTriangle, 
//   Check, X, AlertCircle, ChevronDown, ChevronUp, Globe, Zap,
//   Activity, Clock, Lock, Unlock
// } from "lucide-react";

// // ============================================================================
// // CONSTANTS
// // ============================================================================
// const FUP_THRESHOLD_PRESETS = [
//   { value: 70, label: "70% - Conservative" },
//   { value: 80, label: "80% - Standard" },
//   { value: 85, label: "85% - Balanced" },
//   { value: 90, label: "90% - Liberal" },
//   { value: 95, label: "95% - Very Liberal" }
// ];

// // ============================================================================
// // VALIDATION FUNCTIONS
// // ============================================================================

// const validateAdvancedSettings = (form, isFreeTrial) => {
//   const errors = {};
  
//   // Priority validation
//   const priority = parseInt(form.priority_level);
//   if (isNaN(priority) || priority < 1 || priority > 8) {
//     errors.priority_level = 'Priority level must be between 1 and 8';
//   } else if (isFreeTrial && priority > 4) {
//     errors.priority_level = 'Free trial plans cannot have priority > 4';
//   }
  
//   // Router-specific validation
//   if (form.router_specific && isFreeTrial) {
//     errors.router_specific = 'Free trial plans cannot be router-specific';
//   }
  
//   if (form.router_specific && (!form.allowed_routers_ids || form.allowed_routers_ids.length === 0)) {
//     errors.allowed_routers_ids = 'At least one router must be selected for router-specific plans';
//   }
  
//   // FUP validation
//   if (form.fup_threshold) {
//     const threshold = parseInt(form.fup_threshold);
//     if (isNaN(threshold) || threshold < 1 || threshold > 100) {
//       errors.fup_threshold = 'FUP threshold must be between 1 and 100';
//     }
//   }
  
//   return errors;
// };

// // ============================================================================
// // MAIN COMPONENT
// // ============================================================================

// const PlanAdvancedSettings = ({ 
//   form, 
//   errors: externalErrors, 
//   touched, 
//   onChange, 
//   onBlur, 
//   routers = [], 
//   theme,
//   onValidationChange 
// }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [localErrors, setLocalErrors] = useState({});
//   const [localTouched, setLocalTouched] = useState({});
//   const [showFUPDescription, setShowFUPDescription] = useState(false);
//   const [expandedSections, setExpandedSections] = useState({
//     priority: true,
//     routers: true,
//     fup: true
//   });

//   // Combine errors
//   const errors = { ...localErrors, ...externalErrors };

//   // Check if free trial
//   const isFreeTrial = form.plan_type === 'free_trial';

//   // ==========================================================================
//   // FIELD HANDLERS
//   // ==========================================================================

//   const handleFieldChange = useCallback((field, value) => {
//     onChange(field, value);
    
//     // Clear error for this field
//     setLocalErrors(prev => {
//       const newErrors = { ...prev };
//       delete newErrors[field];
//       return newErrors;
//     });
//   }, [onChange]);

//   const handleBlur = useCallback((field) => {
//     setLocalTouched(prev => ({ ...prev, [field]: true }));
//     if (onBlur) onBlur(field);
//   }, [onBlur]);

//   // ==========================================================================
//   // ROUTER HANDLING
//   // ==========================================================================

//   const handleRouterToggle = useCallback((routerId) => {
//     const current = form.allowed_routers_ids || [];
//     const updated = current.includes(routerId)
//       ? current.filter(id => id !== routerId)
//       : [...current, routerId];
    
//     handleFieldChange('allowed_routers_ids', updated);
//     handleBlur('allowed_routers_ids');
//   }, [form.allowed_routers_ids, handleFieldChange, handleBlur]);

//   const handleSelectAllRouters = useCallback(() => {
//     const allRouterIds = routers.map(r => r.id);
//     handleFieldChange('allowed_routers_ids', allRouterIds);
//   }, [routers, handleFieldChange]);

//   const handleClearRouters = useCallback(() => {
//     handleFieldChange('allowed_routers_ids', []);
//   }, [handleFieldChange]);

//   // ==========================================================================
//   // PRIORITY HANDLING
//   // ==========================================================================

//   const handlePriorityChange = useCallback((value) => {
//     handleFieldChange('priority_level', parseInt(value, 10));
//     handleBlur('priority_level');
//   }, [handleFieldChange, handleBlur]);

//   // ==========================================================================
//   // FUP HANDLING
//   // ==========================================================================

//   const handleFUPThresholdChange = useCallback((value) => {
//     handleFieldChange('fup_threshold', parseInt(value, 10));
//   }, [handleFieldChange]);

//   const handleFUPPolicyChange = useCallback((value) => {
//     handleFieldChange('fup_policy', value);
//   }, [handleFieldChange]);

//   // ==========================================================================
//   // VALIDATION
//   // ==========================================================================

//   useEffect(() => {
//     const validationErrors = validateAdvancedSettings(form, isFreeTrial);
//     setLocalErrors(validationErrors);
    
//     if (onValidationChange) {
//       onValidationChange(Object.keys(validationErrors).length === 0);
//     }
//   }, [form, isFreeTrial, onValidationChange]);

//   // ==========================================================================
//   // HELPER FUNCTIONS
//   // ==========================================================================

//   const shouldShowError = useCallback((fieldName) => {
//     return errors[fieldName] && (touched[fieldName] || localTouched[fieldName]);
//   }, [errors, touched, localTouched]);

//   const getPriorityDescription = useCallback((level) => {
//     const descriptions = {
//       1: "Best effort, no guarantees - Email, file downloads",
//       2: "Low priority - Basic browsing, social media",
//       3: "Medium priority - Video calls, online shopping",
//       4: "Standard - HD streaming, music",
//       5: "High priority - Online gaming",
//       6: "Critical - VoIP, business applications",
//       7: "Premium - VIP customers",
//       8: "Highest - System operations"
//     };
//     return descriptions[level] || "Standard priority";
//   }, []);

//   // ==========================================================================
//   // TOGGLE SECTION
//   // ==========================================================================

//   const toggleSection = useCallback((section) => {
//     setExpandedSections(prev => ({
//       ...prev,
//       [section]: !prev[section]
//     }));
//   }, []);

//   // ==========================================================================
//   // RENDER ROUTER LIST
//   // ==========================================================================

//   const renderRouterList = useCallback(() => {
//     if (routers.length === 0) {
//       return (
//         <div className={`p-6 text-center rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
//           <Router className="w-10 h-10 text-gray-400 mx-auto mb-3" />
//           <p className={`text-sm font-medium ${themeClasses.text.secondary}`}>No routers available</p>
//           <p className="text-xs text-gray-500 mt-1">
//             Configure routers in Network Management first
//           </p>
//         </div>
//       );
//     }

//     const selectedRouters = form.allowed_routers_ids || [];

//     return (
//       <div>
//         <div className="flex items-center justify-between mb-3">
//           <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
//             {selectedRouters.length} of {routers.length} selected
//           </span>
//           <div className="space-x-2">
//             <button
//               type="button"
//               onClick={handleSelectAllRouters}
//               className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
//             >
//               Select All
//             </button>
//             <button
//               type="button"
//               onClick={handleClearRouters}
//               className="text-xs text-red-600 hover:text-red-800 dark:text-red-400"
//             >
//               Clear
//             </button>
//           </div>
//         </div>

//         <div className={`border rounded-lg overflow-hidden ${themeClasses.border.light}`}>
//           <div className="max-h-64 overflow-y-auto p-2">
//             <div className="grid grid-cols-1 gap-2">
//               {routers.map((router) => {
//                 const isSelected = selectedRouters.includes(router.id);
                
//                 return (
//                   <button
//                     key={router.id}
//                     type="button"
//                     onClick={() => handleRouterToggle(router.id)}
//                     className={`flex items-center p-3 rounded-lg transition-all duration-200 border text-left w-full focus:outline-none focus:ring-2 focus:ring-purple-500 ${
//                       isSelected
//                         ? theme === 'dark' 
//                           ? 'bg-purple-900/50 border-purple-500 ring-1 ring-purple-500' 
//                           : 'bg-purple-50 border-purple-300 ring-1 ring-purple-300'
//                         : `${themeClasses.border.light} ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`
//                     }`}
//                   >
//                     <input 
//                       type="checkbox" 
//                       checked={isSelected} 
//                       readOnly
//                       className={`h-4 w-4 focus:ring-purple-500 border rounded ${
//                         theme === 'dark' 
//                           ? 'bg-gray-600 border-gray-500 text-purple-600' 
//                           : 'text-purple-600 border-gray-300'
//                       }`}
//                     />
//                     <div className="ml-3 flex-1">
//                       <div className="flex items-center justify-between">
//                         <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
//                           {router.name || `Router ${router.id}`}
//                         </span>
//                         {router.status === 'online' && (
//                           <span className="h-2 w-2 rounded-full bg-green-500" title="Online" />
//                         )}
//                       </div>
//                       {router.location && (
//                         <div className="text-xs text-gray-500 mt-1">
//                           📍 {router.location}
//                         </div>
//                       )}
//                     </div>
//                     {isSelected && (
//                       <Check className="w-4 h-4 text-purple-600 ml-2 flex-shrink-0" />
//                     )}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }, [routers, form.allowed_routers_ids, theme, themeClasses, handleRouterToggle, handleSelectAllRouters, handleClearRouters]);

//   // ==========================================================================
//   // RENDER
//   // ==========================================================================

//   return (
//     <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <h3 className="text-lg lg:text-xl font-semibold mb-6 flex items-center">
//         <Settings className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
//         Advanced Settings
//       </h3>
      
//       <div className="space-y-6">
//         {/* Priority Section */}
//         <div className={`border rounded-lg overflow-hidden ${themeClasses.border.light}`}>
//           <button
//             type="button"
//             onClick={() => toggleSection('priority')}
//             className={`w-full flex items-center justify-between p-4 text-left ${
//               theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
//             }`}
//           >
//             <div className="flex items-center">
//               <Zap className="w-5 h-5 mr-3 text-blue-600" />
//               <div>
//                 <h4 className="font-semibold">Network Priority</h4>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Current: Level {form.priority_level || 4}
//                 </p>
//               </div>
//             </div>
//             {expandedSections.priority ? (
//               <ChevronUp className="w-5 h-5 text-gray-400" />
//             ) : (
//               <ChevronDown className="w-5 h-5 text-gray-400" />
//             )}
//           </button>
          
//           <AnimatePresence>
//             {expandedSections.priority && (
//               <motion.div
//                 initial={{ height: 0, opacity: 0 }}
//                 animate={{ height: 'auto', opacity: 1 }}
//                 exit={{ height: 0, opacity: 0 }}
//                 className="p-4 border-t"
//               >
//                 <div className="space-y-4">
//                   <EnhancedSelect
//                     value={form.priority_level || ""}
//                     onChange={handlePriorityChange}
//                     options={priorityOptions.map(opt => ({ 
//                       value: opt.value,
//                       label: `${opt.label} (${opt.value})`,
//                       description: opt.description,
//                       disabled: isFreeTrial && opt.value > 4
//                     }))}
//                     placeholder="Select Priority Level"
//                     theme={theme}
//                   />
                  
//                   <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
//                     <p className="text-sm">
//                       <span className="font-medium">Level {form.priority_level || 4}:</span>{' '}
//                       {getPriorityDescription(form.priority_level || 4)}
//                     </p>
//                   </div>
                  
//                   {isFreeTrial && (
//                     <div className={`p-3 rounded-lg flex items-start ${theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
//                       <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
//                       <p className="text-xs text-yellow-700 dark:text-yellow-400">
//                         Free trial plans are limited to priority levels 1-4
//                       </p>
//                     </div>
//                   )}
                  
//                   {shouldShowError('priority_level') && (
//                     <p className="text-red-500 text-xs flex items-center">
//                       <AlertCircle className="w-3 h-3 mr-1" />
//                       {errors.priority_level}
//                     </p>
//                   )}
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>

//         {/* Router Restrictions Section */}
//         <div className={`border rounded-lg overflow-hidden ${themeClasses.border.light}`}>
//           <button
//             type="button"
//             onClick={() => !isFreeTrial && toggleSection('routers')}
//             className={`w-full flex items-center justify-between p-4 text-left ${
//               isFreeTrial ? 'opacity-50 cursor-not-allowed' : ''
//             } ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}
//             disabled={isFreeTrial}
//           >
//             <div className="flex items-center">
//               <Router className="w-5 h-5 mr-3 text-purple-600" />
//               <div>
//                 <h4 className="font-semibold">Router Restrictions</h4>
//                 <p className="text-xs text-gray-500 mt-1">
//                   {form.router_specific 
//                     ? `Limited to ${form.allowed_routers_ids?.length || 0} routers`
//                     : 'Available on all routers'}
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-3">
//               <button
//                 type="button"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   if (!isFreeTrial) {
//                     handleFieldChange('router_specific', !form.router_specific);
//                   }
//                 }}
//                 disabled={isFreeTrial}
//                 className={`relative inline-flex items-center h-5 w-9 rounded-full transition-colors ${
//                   isFreeTrial
//                     ? 'bg-gray-400 cursor-not-allowed'
//                     : form.router_specific 
//                       ? 'bg-purple-600' 
//                       : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//                 }`}
//               >
//                 <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
//                   form.router_specific ? 'translate-x-5' : 'translate-x-1'
//                 }`} />
//               </button>
//               {expandedSections.routers ? (
//                 <ChevronUp className="w-5 h-5 text-gray-400" />
//               ) : (
//                 <ChevronDown className="w-5 h-5 text-gray-400" />
//               )}
//             </div>
//           </button>
          
//           <AnimatePresence>
//             {expandedSections.routers && form.router_specific && !isFreeTrial && (
//               <motion.div
//                 initial={{ height: 0, opacity: 0 }}
//                 animate={{ height: 'auto', opacity: 1 }}
//                 exit={{ height: 0, opacity: 0 }}
//                 className="p-4 border-t"
//               >
//                 {renderRouterList()}
                
//                 {shouldShowError('allowed_routers_ids') && (
//                   <p className="text-red-500 text-xs mt-3 flex items-center">
//                     <AlertCircle className="w-3 h-3 mr-1" />
//                     {errors.allowed_routers_ids}
//                   </p>
//                 )}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>

//         {/* FUP Section */}
//         <div className={`border rounded-lg overflow-hidden ${themeClasses.border.light}`}>
//           <button
//             type="button"
//             onClick={() => toggleSection('fup')}
//             className={`w-full flex items-center justify-between p-4 text-left ${
//               theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
//             }`}
//           >
//             <div className="flex items-center">
//               <Shield className="w-5 h-5 mr-3 text-orange-600" />
//               <div>
//                 <h4 className="font-semibold">Fair Usage Policy</h4>
//                 <p className="text-xs text-gray-500 mt-1">
//                   {form.fup_policy ? 'Configured' : 'Not configured'}
//                 </p>
//               </div>
//             </div>
//             {expandedSections.fup ? (
//               <ChevronUp className="w-5 h-5 text-gray-400" />
//             ) : (
//               <ChevronDown className="w-5 h-5 text-gray-400" />
//             )}
//           </button>
          
//           <AnimatePresence>
//             {expandedSections.fup && (
//               <motion.div
//                 initial={{ height: 0, opacity: 0 }}
//                 animate={{ height: 'auto', opacity: 1 }}
//                 exit={{ height: 0, opacity: 0 }}
//                 className="p-4 border-t space-y-4"
//               >
//                 {/* FUP Threshold */}
//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                     FUP Threshold (%)
//                   </label>
                  
//                   <div className="flex items-center space-x-4">
//                     <input 
//                       type="range" 
//                       value={form.fup_threshold || 80} 
//                       onChange={(e) => handleFUPThresholdChange(e.target.value)}
//                       className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                       min="1" 
//                       max="100" 
//                       step="1" 
//                     />
//                     <div className={`w-16 text-center font-semibold ${
//                       form.fup_threshold >= 90 ? 'text-red-600' :
//                       form.fup_threshold >= 70 ? 'text-orange-600' : 'text-green-600'
//                     }`}>
//                       {form.fup_threshold || 80}%
//                     </div>
//                   </div>
                  
//                   <div className="mt-3 flex justify-between">
//                     {FUP_THRESHOLD_PRESETS.map(preset => (
//                       <button
//                         key={preset.value}
//                         type="button"
//                         onClick={() => handleFUPThresholdChange(preset.value)}
//                         className={`text-xs px-2 py-1 rounded ${
//                           form.fup_threshold === preset.value
//                             ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
//                             : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
//                         }`}
//                       >
//                         {preset.value}%
//                       </button>
//                     ))}
//                   </div>
                  
//                   {shouldShowError('fup_threshold') && (
//                     <p className="text-red-500 text-xs mt-2">{errors.fup_threshold}</p>
//                   )}
//                 </div>
                
//                 {/* FUP Policy Description */}
//                 <div>
//                   <div className="flex items-center justify-between mb-2">
//                     <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                       Policy Description
//                     </label>
//                     <button
//                       type="button"
//                       onClick={() => setShowFUPDescription(!showFUPDescription)}
//                       className="text-xs text-blue-600 hover:text-blue-800"
//                     >
//                       {showFUPDescription ? 'Hide Tips' : 'Show Tips'}
//                     </button>
//                   </div>
                  
//                   <textarea 
//                     value={form.fup_policy || ""} 
//                     onChange={(e) => handleFUPPolicyChange(e.target.value)}
//                     rows={4}
//                     className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                     placeholder="Describe what happens when the fair usage threshold is reached..."
//                   />
                  
//                   <AnimatePresence>
//                     {showFUPDescription && (
//                       <motion.div
//                         initial={{ opacity: 0, height: 0 }}
//                         animate={{ opacity: 1, height: 'auto' }}
//                         exit={{ opacity: 0, height: 0 }}
//                         className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs space-y-2"
//                       >
//                         <p className="font-medium">Tips for good FUP policy:</p>
//                         <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
//                           <li>Be specific about speed limits after threshold</li>
//                           <li>Mention when limits reset (daily/monthly)</li>
//                           <li>Explain if certain services remain unaffected</li>
//                           <li>State if customers can purchase additional data</li>
//                         </ul>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
                  
//                   {shouldShowError('fup_policy') && (
//                     <p className="text-red-500 text-xs mt-2">{errors.fup_policy}</p>
//                   )}
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PlanAdvancedSettings;









// ============================================================================
// PlanAdvancedSettings.js - FIXED VERSION
// ============================================================================

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EnhancedSelect, getThemeClasses } from "../Shared/components";
import { priorityOptions } from "../Shared/constant";
import { 
  Settings, Router, Shield, TrendingDown, Info, AlertTriangle, 
  Check, X, AlertCircle, ChevronDown, ChevronUp, Globe, Zap,
  Activity, Clock, Lock, Unlock
} from "lucide-react";

// ============================================================================
// CONSTANTS
// ============================================================================
const FUP_THRESHOLD_PRESETS = [
  { value: 70, label: "70% - Conservative" },
  { value: 80, label: "80% - Standard" },
  { value: 85, label: "85% - Balanced" },
  { value: 90, label: "90% - Liberal" },
  { value: 95, label: "95% - Very Liberal" }
];

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

const validateAdvancedSettings = (form, isFreeTrial) => {
  const errors = {};
  
  // Safety check
  if (!form) return errors;
  
  // Priority validation
  const priority = parseInt(form.priority_level);
  if (isNaN(priority) || priority < 1 || priority > 8) {
    errors.priority_level = 'Priority level must be between 1 and 8';
  } else if (isFreeTrial && priority > 4) {
    errors.priority_level = 'Free trial plans cannot have priority > 4';
  }
  
  // Router-specific validation
  if (form.router_specific && isFreeTrial) {
    errors.router_specific = 'Free trial plans cannot be router-specific';
  }
  
  if (form.router_specific && (!form.allowed_routers_ids || form.allowed_routers_ids.length === 0)) {
    errors.allowed_routers_ids = 'At least one router must be selected for router-specific plans';
  }
  
  // FUP validation
  if (form.fup_threshold) {
    const threshold = parseInt(form.fup_threshold);
    if (isNaN(threshold) || threshold < 1 || threshold > 100) {
      errors.fup_threshold = 'FUP threshold must be between 1 and 100';
    }
  }
  
  return errors;
};

// ============================================================================
// SECTION COMPONENTS (to avoid button nesting)
// ============================================================================

const PrioritySection = ({ 
  form, 
  theme, 
  themeClasses, 
  expanded, 
  onToggle,
  onChange,
  onBlur,
  errors,
  touched,
  localTouched,
  isFreeTrial,
  getPriorityDescription,
  shouldShowError
}) => {
  const handlePriorityChange = (value) => {
    onChange('priority_level', parseInt(value, 10));
    onBlur('priority_level');
  };

  return (
    <div className={`border rounded-lg overflow-hidden ${themeClasses.border.light}`}>
      {/* This is a div with onClick, not a button - fixes nesting issue */}
      <div
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-4 cursor-pointer ${
          theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
        } transition-colors duration-200`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle()}
      >
        <div className="flex items-center">
          <Zap className="w-5 h-5 mr-3 text-blue-600" />
          <div>
            <h4 className="font-semibold">Network Priority</h4>
            <p className="text-xs text-gray-500 mt-1">
              Current: Level {form?.priority_level || 4}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-4 border-t"
          >
            <div className="space-y-4">
              <EnhancedSelect
                value={form?.priority_level || ""}
                onChange={handlePriorityChange}
                options={priorityOptions.map(opt => ({ 
                  value: opt.value,
                  label: `${opt.label} (${opt.value})`,
                  description: opt.description,
                  disabled: isFreeTrial && opt.value > 4
                }))}
                placeholder="Select Priority Level"
                theme={theme}
              />
              
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                <p className="text-sm">
                  <span className="font-medium">Level {form?.priority_level || 4}:</span>{' '}
                  {getPriorityDescription(form?.priority_level || 4)}
                </p>
              </div>
              
              {isFreeTrial && (
                <div className={`p-3 rounded-lg flex items-start ${theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">
                    Free trial plans are limited to priority levels 1-4
                  </p>
                </div>
              )}
              
              {shouldShowError('priority_level') && (
                <p className="text-red-500 text-xs flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.priority_level}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RouterSection = ({ 
  form, 
  theme, 
  themeClasses, 
  expanded, 
  onToggle,
  onChange,
  onBlur,
  errors,
  touched,
  localTouched,
  isFreeTrial,
  routers = [],
  handleRouterToggle,
  handleSelectAllRouters,
  handleClearRouters,
  shouldShowError
}) => {
  const handleRouterSpecificToggle = (e) => {
    e.stopPropagation();
    if (!isFreeTrial) {
      onChange('router_specific', !form?.router_specific);
    }
  };

  const renderRouterList = () => {
    if (routers.length === 0) {
      return (
        <div className={`p-6 text-center rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <Router className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className={`text-sm font-medium ${themeClasses.text.secondary}`}>No routers available</p>
          <p className="text-xs text-gray-500 mt-1">
            Configure routers in Network Management first
          </p>
        </div>
      );
    }

    const selectedRouters = form?.allowed_routers_ids || [];

    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
            {selectedRouters.length} of {routers.length} selected
          </span>
          <div className="space-x-2">
            <button
              type="button"
              onClick={handleSelectAllRouters}
              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={handleClearRouters}
              className="text-xs text-red-600 hover:text-red-800 dark:text-red-400"
            >
              Clear
            </button>
          </div>
        </div>

        <div className={`border rounded-lg overflow-hidden ${themeClasses.border.light}`}>
          <div className="max-h-64 overflow-y-auto p-2">
            <div className="grid grid-cols-1 gap-2">
              {routers.map((router) => {
                const isSelected = selectedRouters.includes(router.id);
                
                return (
                  <button
                    key={router.id}
                    type="button"
                    onClick={() => handleRouterToggle(router.id)}
                    className={`flex items-center p-3 rounded-lg transition-all duration-200 border text-left w-full focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isSelected
                        ? theme === 'dark' 
                          ? 'bg-purple-900/50 border-purple-500 ring-1 ring-purple-500' 
                          : 'bg-purple-50 border-purple-300 ring-1 ring-purple-300'
                        : `${themeClasses.border.light} ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`
                    }`}
                  >
                    <div className="flex items-center flex-1">
                      <input 
                        type="checkbox" 
                        checked={isSelected} 
                        readOnly
                        className={`h-4 w-4 focus:ring-purple-500 border rounded ${
                          theme === 'dark' 
                            ? 'bg-gray-600 border-gray-500 text-purple-600' 
                            : 'text-purple-600 border-gray-300'
                        }`}
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
                            {router.name || `Router ${router.id}`}
                          </span>
                          {router.status === 'online' && (
                            <span className="h-2 w-2 rounded-full bg-green-500" title="Online" />
                          )}
                        </div>
                        {router.location && (
                          <div className="text-xs text-gray-500 mt-1">
                            📍 {router.location}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-purple-600 ml-2 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`border rounded-lg overflow-hidden ${themeClasses.border.light}`}>
      <div
        onClick={!isFreeTrial ? onToggle : undefined}
        className={`w-full flex items-center justify-between p-4 ${
          isFreeTrial ? 'opacity-50' : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
        } ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} transition-colors duration-200`}
        role={!isFreeTrial ? "button" : undefined}
        tabIndex={!isFreeTrial ? 0 : undefined}
        onKeyDown={(e) => !isFreeTrial && (e.key === 'Enter' || e.key === ' ') && onToggle()}
      >
        <div className="flex items-center">
          <Router className="w-5 h-5 mr-3 text-purple-600" />
          <div>
            <h4 className="font-semibold">Router Restrictions</h4>
            <p className="text-xs text-gray-500 mt-1">
              {form?.router_specific 
                ? `Limited to ${form?.allowed_routers_ids?.length || 0} routers`
                : 'Available on all routers'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div
            onClick={handleRouterSpecificToggle}
            className={`relative inline-flex items-center h-5 w-9 rounded-full transition-colors ${
              isFreeTrial
                ? 'bg-gray-400 cursor-not-allowed'
                : form?.router_specific 
                  ? 'bg-purple-600 cursor-pointer' 
                  : theme === 'dark' ? 'bg-gray-600 cursor-pointer' : 'bg-gray-300 cursor-pointer'
            }`}
            role="checkbox"
            aria-checked={form?.router_specific || false}
            tabIndex={isFreeTrial ? -1 : 0}
            onKeyDown={(e) => !isFreeTrial && (e.key === 'Enter' || e.key === ' ') && handleRouterSpecificToggle(e)}
          >
            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
              form?.router_specific ? 'translate-x-5' : 'translate-x-1'
            }`} />
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && form?.router_specific && !isFreeTrial && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-4 border-t"
          >
            {renderRouterList()}
            
            {shouldShowError('allowed_routers_ids') && (
              <p className="text-red-500 text-xs mt-3 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.allowed_routers_ids}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FUPSection = ({ 
  form, 
  theme, 
  themeClasses, 
  expanded, 
  onToggle,
  onChange,
  onBlur,
  errors,
  touched,
  localTouched,
  shouldShowError
}) => {
  const [showFUPDescription, setShowFUPDescription] = useState(false);

  const handleFUPThresholdChange = (value) => {
    onChange('fup_threshold', parseInt(value, 10));
  };

  const handleFUPPolicyChange = (value) => {
    onChange('fup_policy', value);
  };

  return (
    <div className={`border rounded-lg overflow-hidden ${themeClasses.border.light}`}>
      <div
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-4 cursor-pointer ${
          theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
        } transition-colors duration-200`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle()}
      >
        <div className="flex items-center">
          <Shield className="w-5 h-5 mr-3 text-orange-600" />
          <div>
            <h4 className="font-semibold">Fair Usage Policy</h4>
            <p className="text-xs text-gray-500 mt-1">
              {form?.fup_policy ? 'Configured' : 'Not configured'}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-4 border-t space-y-4"
          >
            {/* FUP Threshold */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                FUP Threshold (%)
              </label>
              
              <div className="flex items-center space-x-4">
                <input 
                  type="range" 
                  value={form?.fup_threshold || 80} 
                  onChange={(e) => handleFUPThresholdChange(e.target.value)}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  min="1" 
                  max="100" 
                  step="1" 
                />
                <div className={`w-16 text-center font-semibold ${
                  (form?.fup_threshold || 80) >= 90 ? 'text-red-600' :
                  (form?.fup_threshold || 80) >= 70 ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {form?.fup_threshold || 80}%
                </div>
              </div>
              
              <div className="mt-3 flex justify-between">
                {FUP_THRESHOLD_PRESETS.map(preset => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handleFUPThresholdChange(preset.value)}
                    className={`text-xs px-2 py-1 rounded ${
                      (form?.fup_threshold || 80) === preset.value
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {preset.value}%
                  </button>
                ))}
              </div>
              
              {shouldShowError('fup_threshold') && (
                <p className="text-red-500 text-xs mt-2">{errors.fup_threshold}</p>
              )}
            </div>
            
            {/* FUP Policy Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                  Policy Description
                </label>
                <button
                  type="button"
                  onClick={() => setShowFUPDescription(!showFUPDescription)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {showFUPDescription ? 'Hide Tips' : 'Show Tips'}
                </button>
              </div>
              
              <textarea 
                value={form?.fup_policy || ""} 
                onChange={(e) => handleFUPPolicyChange(e.target.value)}
                onBlur={() => onBlur('fup_policy')}
                rows={4}
                className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                placeholder="Describe what happens when the fair usage threshold is reached..."
              />
              
              <AnimatePresence>
                {showFUPDescription && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs space-y-2"
                  >
                    <p className="font-medium">Tips for good FUP policy:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                      <li>Be specific about speed limits after threshold</li>
                      <li>Mention when limits reset (daily/monthly)</li>
                      <li>Explain if certain services remain unaffected</li>
                      <li>State if customers can purchase additional data</li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {shouldShowError('fup_policy') && (
                <p className="text-red-500 text-xs mt-2">{errors.fup_policy}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PlanAdvancedSettings = ({ 
  form = {}, // Default to empty object to prevent undefined error
  errors: externalErrors = {}, 
  touched = {}, 
  onChange, 
  onBlur, 
  routers = [], 
  theme,
  onValidationChange 
}) => {
  const themeClasses = getThemeClasses(theme);
  const [localErrors, setLocalErrors] = useState({});
  const [localTouched, setLocalTouched] = useState({});
  const [expandedSections, setExpandedSections] = useState({
    priority: true,
    routers: true,
    fup: true
  });

  // Combine errors
  const errors = { ...localErrors, ...externalErrors };

  // Check if free trial
  const isFreeTrial = form?.plan_type === 'free_trial';

  // ==========================================================================
  // FIELD HANDLERS
  // ==========================================================================

  const handleFieldChange = useCallback((field, value) => {
    if (onChange) {
      onChange(field, value);
    }
    
    // Clear error for this field
    setLocalErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, [onChange]);

  const handleBlur = useCallback((field) => {
    setLocalTouched(prev => ({ ...prev, [field]: true }));
    if (onBlur) onBlur(field);
  }, [onBlur]);

  // ==========================================================================
  // ROUTER HANDLING
  // ==========================================================================

  const handleRouterToggle = useCallback((routerId) => {
    const current = form?.allowed_routers_ids || [];
    const updated = current.includes(routerId)
      ? current.filter(id => id !== routerId)
      : [...current, routerId];
    
    handleFieldChange('allowed_routers_ids', updated);
    handleBlur('allowed_routers_ids');
  }, [form?.allowed_routers_ids, handleFieldChange, handleBlur]);

  const handleSelectAllRouters = useCallback(() => {
    const allRouterIds = routers.map(r => r.id);
    handleFieldChange('allowed_routers_ids', allRouterIds);
  }, [routers, handleFieldChange]);

  const handleClearRouters = useCallback(() => {
    handleFieldChange('allowed_routers_ids', []);
  }, [handleFieldChange]);

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  useEffect(() => {
    const validationErrors = validateAdvancedSettings(form, isFreeTrial);
    setLocalErrors(validationErrors);
    
    if (onValidationChange) {
      onValidationChange(Object.keys(validationErrors).length === 0);
    }
  }, [form, isFreeTrial, onValidationChange]);

  // ==========================================================================
  // HELPER FUNCTIONS
  // ==========================================================================

  const shouldShowError = useCallback((fieldName) => {
    return errors[fieldName] && (touched[fieldName] || localTouched[fieldName]);
  }, [errors, touched, localTouched]);

  const getPriorityDescription = useCallback((level) => {
    const descriptions = {
      1: "Best effort, no guarantees - Email, file downloads",
      2: "Low priority - Basic browsing, social media",
      3: "Medium priority - Video calls, online shopping",
      4: "Standard - HD streaming, music",
      5: "High priority - Online gaming",
      6: "Critical - VoIP, business applications",
      7: "Premium - VIP customers",
      8: "Highest - System operations"
    };
    return descriptions[level] || "Standard priority";
  }, []);

  // ==========================================================================
  // TOGGLE SECTION
  // ==========================================================================

  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <h3 className="text-lg lg:text-xl font-semibold mb-6 flex items-center">
        <Settings className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
        Advanced Settings
      </h3>
      
      <div className="space-y-4">
        {/* Priority Section */}
        <PrioritySection
          form={form}
          theme={theme}
          themeClasses={themeClasses}
          expanded={expandedSections.priority}
          onToggle={() => toggleSection('priority')}
          onChange={handleFieldChange}
          onBlur={handleBlur}
          errors={errors}
          touched={touched}
          localTouched={localTouched}
          isFreeTrial={isFreeTrial}
          getPriorityDescription={getPriorityDescription}
          shouldShowError={shouldShowError}
        />

        {/* Router Restrictions Section */}
        <RouterSection
          form={form}
          theme={theme}
          themeClasses={themeClasses}
          expanded={expandedSections.routers}
          onToggle={() => toggleSection('routers')}
          onChange={handleFieldChange}
          onBlur={handleBlur}
          errors={errors}
          touched={touched}
          localTouched={localTouched}
          isFreeTrial={isFreeTrial}
          routers={routers}
          handleRouterToggle={handleRouterToggle}
          handleSelectAllRouters={handleSelectAllRouters}
          handleClearRouters={handleClearRouters}
          shouldShowError={shouldShowError}
        />

        {/* FUP Section */}
        <FUPSection
          form={form}
          theme={theme}
          themeClasses={themeClasses}
          expanded={expandedSections.fup}
          onToggle={() => toggleSection('fup')}
          onChange={handleFieldChange}
          onBlur={handleBlur}
          errors={errors}
          touched={touched}
          localTouched={localTouched}
          shouldShowError={shouldShowError}
        />
      </div>
    </div>
  );
};

export default PlanAdvancedSettings;