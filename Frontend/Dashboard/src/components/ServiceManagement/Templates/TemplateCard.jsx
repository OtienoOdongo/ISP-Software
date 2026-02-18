



// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import { Plus, Edit, Trash2, Box, Wifi, Cable, Globe, Lock, Crown, Shield, TrendingDown, Check, X, Infinity as InfinityIcon, Clock } from "lucide-react";
// import { getThemeClasses } from "../Shared/components";
// import { formatNumber } from "../Shared/utils";

// // Quick Create Modal Component
// const QuickCreateModal = ({ isOpen, onClose, onSubmit, template, theme }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [planName, setPlanName] = useState(`${template.name} - ${new Date().toLocaleDateString()}`);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!planName.trim()) {
//       setError("Plan name cannot be empty");
//       return;
//     }
    
//     setIsLoading(true);
//     setError("");
    
//     try {
//       await onSubmit(planName.trim());
//       onClose();
//     } catch (error) {
//       setError(error.message || "Failed to create plan");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-60 backdrop-blur-sm">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9, y: 20 }}
//         animate={{ opacity: 1, scale: 1, y: 0 }}
//         exit={{ opacity: 0, scale: 0.9, y: 20 }}
//         transition={{ type: "spring", damping: 30, stiffness: 300 }}
//         className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mx-2 sm:mx-0"
//       >
//         <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 sm:p-6 text-white">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-lg sm:text-xl font-bold flex items-center">
//                 <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
//                 Quick Create Plan
//               </h2>
//               <p className="text-indigo-100 mt-1 text-xs sm:text-sm">
//                 Create a new plan from template
//               </p>
//             </div>
//             <button
//               onClick={onClose}
//               className="p-1 sm:p-2 rounded-xl hover:bg-white/20 transition-all duration-200"
//               aria-label="Close modal"
//             >
//               <X className="w-4 h-4 sm:w-5 sm:h-5" />
//             </button>
//           </div>
//         </div>

//         <div className="p-4 sm:p-6">
//           {error && (
//             <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
//               <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
//             </div>
//           )}

//           <div className="mb-4">
//             <div className="flex items-center space-x-3 mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
//               <Box className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 flex-shrink-0" />
//               <div className="min-w-0">
//                 <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
//                   {template.name}
//                 </h3>
//                 <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
//                   {template.category} • {template.access_methods?.hotspot?.enabled ? 'Hotspot' : 'PPPoE'}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <form onSubmit={handleSubmit}>
//             <div className="mb-4 sm:mb-6">
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Plan Name *
//               </label>
//               <input
//                 type="text"
//                 value={planName}
//                 onChange={(e) => {
//                   setPlanName(e.target.value);
//                   setError("");
//                 }}
//                 className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
//                 placeholder="Enter plan name..."
//                 required
//                 autoFocus
//               />
//               <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
//                 This will be the name of your new plan
//               </p>
//             </div>

//             <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
//               <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-xs sm:text-sm">
//                 Template Preview
//               </h4>
//               <div className="space-y-1 sm:space-y-2 text-xs">
//                 <div className="flex justify-between">
//                   <span className="text-blue-700 dark:text-blue-300">Base Price:</span>
//                   <span className="font-semibold text-blue-900 dark:text-blue-100">
//                     KES {formatNumber(template.base_price || 0)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-blue-700 dark:text-blue-300">Used:</span>
//                   <span className="font-semibold text-blue-900 dark:text-blue-100">
//                     {template.usage_count || 0} times
//                   </span>
//                 </div>
//                 {template.has_time_variant && (
//                   <div className="flex justify-between">
//                     <span className="text-blue-700 dark:text-blue-300">Time Variant:</span>
//                     <span className="font-semibold text-blue-900 dark:text-blue-100 flex items-center">
//                       <Clock className="w-3 h-3 mr-1" />
//                       Enabled
//                     </span>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={!planName.trim() || isLoading}
//                 className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
//               >
//                 {isLoading ? (
//                   <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
//                 ) : (
//                   <>
//                     <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
//                     Create Plan
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// const TemplateCard = ({ 
//   template, 
//   onSelect, 
//   onApplyTemplate, 
//   onCreateFromTemplate, 
//   onEditTemplate, 
//   onDeleteTemplate, 
//   theme 
// }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [showQuickCreateModal, setShowQuickCreateModal] = useState(false);

//   const accessMethods = template.access_methods || {};

//   const getPriorityInfo = (level) => {
//     const priority = {
//       1: { label: "Lowest", color: "text-gray-500" },
//       2: { label: "Low", color: "text-blue-500" },
//       3: { label: "Medium", color: "text-green-500" },
//       4: { label: "High", color: "text-yellow-500" },
//       5: { label: "Highest", color: "text-orange-500" },
//       6: { label: "Critical", color: "text-red-500" },
//       7: { label: "Premium", color: "text-purple-500" },
//       8: { label: "VIP", color: "text-pink-500" },
//     };
//     return priority[level] || priority[4];
//   };

//   const priorityInfo = getPriorityInfo(template.priority_level || 4);

//   const handleQuickCreate = async (planName) => {
//     try {
//       const planData = await onCreateFromTemplate(template, planName);
//       setShowQuickCreateModal(false);
//       return planData;
//     } catch (error) {
//       throw error;
//     }
//   };

//   const getAccessTypeDisplay = () => {
//     if (accessMethods.hotspot?.enabled && accessMethods.pppoe?.enabled) {
//       return "Both";
//     } else if (accessMethods.hotspot?.enabled) {
//       return "Hotspot";
//     } else if (accessMethods.pppoe?.enabled) {
//       return "PPPoE";
//     }
//     return "None";
//   };

//   return (
//     <>
//       <motion.div
//         whileHover={{ scale: 1.02 }}
//         whileTap={{ scale: 0.98 }}
//         className={`p-4 sm:p-6 rounded-xl shadow-lg border cursor-pointer transition-all ${
//           themeClasses.bg.card
//         } ${themeClasses.border.light} hover:border-indigo-500`}
//         onClick={() => onSelect(template)}
//         aria-label={`View template: ${template.name}`}
//       >
//         <div className="flex items-start justify-between mb-4">
//           <div className="flex-1 min-w-0">
//             <div className="flex items-center mb-2 flex-wrap gap-2">
//               <h3 className="text-base sm:text-lg font-semibold text-indigo-600 truncate mr-2">
//                 {template.name}
//               </h3>
//               <div className="flex items-center space-x-2 flex-wrap gap-1">
//                 {template.is_public ? (
//                   <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center whitespace-nowrap">
//                     <Globe className="w-3 h-3 mr-1 flex-shrink-0" />
//                     <span className="truncate">Public</span>
//                   </span>
//                 ) : (
//                   <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center whitespace-nowrap">
//                     <Lock className="w-3 h-3 mr-1 flex-shrink-0" />
//                     <span className="truncate">Private</span>
//                   </span>
//                 )}
//                 {!template.is_active && (
//                   <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center whitespace-nowrap">
//                     <Shield className="w-3 h-3 mr-1 flex-shrink-0" />
//                     <span className="truncate">Inactive</span>
//                   </span>
//                 )}
//                 {template.usage_count > 10 && (
//                   <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full flex items-center whitespace-nowrap">
//                     <Crown className="w-3 h-3 mr-1 flex-shrink-0" />
//                     <span className="truncate">Popular</span>
//                   </span>
//                 )}
//                 {template.has_time_variant && (
//                   <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center whitespace-nowrap">
//                     <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
//                     <span className="truncate">Time Variant</span>
//                   </span>
//                 )}
//               </div>
//             </div>
//             <p className={`text-xs sm:text-sm ${themeClasses.text.secondary} mb-3 line-clamp-2`}>
//               {template.description || "No description available"}
//             </p>
//           </div>
//           <div className={`px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${
//             template.category === "Business" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
//             template.category === "Residential" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
//             template.category === "Enterprise" ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" :
//             "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
//           }`}>
//             <span className="truncate max-w-16 sm:max-w-full">{template.category}</span>
//           </div>
//         </div>

//         <div className="space-y-2 sm:space-y-3">
//           <div className="flex items-center justify-between text-sm">
//             <span className={themeClasses.text.secondary}>Base Price:</span>
//             <span className="font-semibold text-indigo-600">
//               KES {formatNumber(template.base_price || 0)}
//             </span>
//           </div>

//           <div className="flex items-center justify-between text-xs sm:text-sm">
//             <span className={themeClasses.text.secondary}>Used:</span>
//             <span className={`font-medium ${
//               template.usage_count === 0 ? "text-gray-500" :
//               template.usage_count < 5 ? "text-green-600" :
//               template.usage_count < 20 ? "text-blue-600" : "text-orange-600"
//             }`}>
//               {template.usage_count || 0} time{template.usage_count !== 1 ? 's' : ''}
//             </span>
//           </div>

//           <div className="flex items-center justify-between text-xs sm:text-sm">
//             <span className={themeClasses.text.secondary}>Access Type:</span>
//             <span className="font-medium text-indigo-600">
//               {getAccessTypeDisplay()}
//             </span>
//           </div>

//           <div className="flex items-center justify-between text-xs sm:text-sm">
//             <span className={themeClasses.text.secondary}>Priority:</span>
//             <span className={`flex items-center ${priorityInfo.color}`}>
//               <TrendingDown className="w-3 h-3 mr-1 flex-shrink-0" />
//               <span className="truncate">{priorityInfo.label}</span>
//             </span>
//           </div>

//           {template.router_specific && (
//             <div className="flex items-center justify-between text-xs sm:text-sm">
//               <span className={themeClasses.text.secondary}>Router Specific:</span>
//               <span className="text-orange-600 font-medium truncate">Yes</span>
//             </div>
//           )}

//           <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700">
//             <div>
//               <div className="flex items-center mb-1 sm:mb-2">
//                 <Wifi className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 mr-2 flex-shrink-0" />
//                 <span className="text-xs sm:text-sm font-medium truncate">Hotspot</span>
//                 <span className={`ml-1 sm:ml-2 text-xs ${
//                   accessMethods.hotspot?.enabled ? "text-green-600" : "text-red-600"
//                 }`}>
//                   {accessMethods.hotspot?.enabled ? "✓" : "✗"}
//                 </span>
//               </div>
//               {accessMethods.hotspot?.enabled && (
//                 <div className="space-y-1 text-xs">
//                   <div className="flex justify-between">
//                     <span className="truncate">Speed:</span>
//                     <span className="truncate ml-1">
//                       {accessMethods.hotspot.download_speed?.value || '0'}/{accessMethods.hotspot.upload_speed?.value || '0'} 
//                       {accessMethods.hotspot.download_speed?.unit || 'Mbps'}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="truncate">Data:</span>
//                     <span className="truncate ml-1">
//                       {accessMethods.hotspot.data_limit?.unit === 'Unlimited' 
//                         ? 'Unlimited' 
//                         : `${accessMethods.hotspot.data_limit?.value || '0'} ${accessMethods.hotspot.data_limit?.unit || 'GB'}`
//                       }
//                     </span>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div>
//               <div className="flex items-center mb-1 sm:mb-2">
//                 <Cable className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mr-2 flex-shrink-0" />
//                 <span className="text-xs sm:text-sm font-medium truncate">PPPoE</span>
//                 <span className={`ml-1 sm:ml-2 text-xs ${
//                   accessMethods.pppoe?.enabled ? "text-green-600" : "text-red-600"
//                 }`}>
//                   {accessMethods.pppoe?.enabled ? "✓" : "✗"}
//                 </span>
//               </div>
//               {accessMethods.pppoe?.enabled && (
//                 <div className="space-y-1 text-xs">
//                   <div className="flex justify-between">
//                     <span className="truncate">Speed:</span>
//                     <span className="truncate ml-1">
//                       {accessMethods.pppoe.download_speed?.value || '0'}/{accessMethods.pppoe.upload_speed?.value || '0'} 
//                       {accessMethods.pppoe.download_speed?.unit || 'Mbps'}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="truncate">Data:</span>
//                     <span className="truncate ml-1">
//                       {accessMethods.pppoe.data_limit?.unit === 'Unlimited' 
//                         ? 'Unlimited' 
//                         : `${accessMethods.pppoe.data_limit?.value || '0'} ${accessMethods.pppoe.data_limit?.unit || 'GB'}`
//                       }
//                     </span>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="flex flex-wrap gap-1 sm:gap-2 mt-3 sm:mt-4">
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={(e) => {
//               e.stopPropagation();
//               onApplyTemplate(template);
//             }}
//             className={`flex-1 min-w-[120px] py-1.5 sm:py-2 rounded-lg font-medium flex items-center justify-center text-xs sm:text-sm ${themeClasses.button.primary}`}
//             aria-label={`Use ${template.name} template`}
//           >
//             <Box className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
//             <span className="truncate">Use Template</span>
//           </motion.button>
          
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={(e) => {
//               e.stopPropagation();
//               setShowQuickCreateModal(true);
//             }}
//             className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium flex items-center justify-center text-xs sm:text-sm ${themeClasses.button.success}`}
//             aria-label={`Quick create plan from ${template.name}`}
//           >
//             <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
//             <span className="hidden sm:inline">Quick Create</span>
//             <span className="sm:hidden">Create</span>
//           </motion.button>

//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={(e) => {
//               e.stopPropagation();
//               onEditTemplate(template);
//             }}
//             className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium flex items-center justify-center text-xs sm:text-sm ${themeClasses.button.secondary}`}
//             aria-label={`Edit ${template.name} template`}
//           >
//             <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
//           </motion.button>

//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={(e) => {
//               e.stopPropagation();
//               onDeleteTemplate(template);
//             }}
//             className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium flex items-center justify-center text-xs sm:text-sm ${themeClasses.button.danger}`}
//             aria-label={`Delete ${template.name} template`}
//           >
//             <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
//           </motion.button>
//         </div>
//       </motion.div>

//       <QuickCreateModal
//         isOpen={showQuickCreateModal}
//         onClose={() => setShowQuickCreateModal(false)}
//         onSubmit={handleQuickCreate}
//         template={template}
//         theme={theme}
//       />
//     </>
//   );
// };

// export default TemplateCard;




import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, Edit, Trash2, Box, Wifi, Cable, Globe, Lock, Crown, 
  Shield, TrendingDown, Check, X, Infinity as InfinityIcon, 
  Clock, Copy, AlertCircle 
} from "lucide-react";
import { getThemeClasses } from "../Shared/components";
import { formatNumber } from "../Shared/utils";

// Quick Create Modal Component
const QuickCreateModal = ({ isOpen, onClose, onSubmit, template, theme }) => {
  const themeClasses = getThemeClasses(theme);
  const [planName, setPlanName] = useState(`${template.name} - ${new Date().toLocaleDateString()}`);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!planName.trim()) {
      setError("Plan name cannot be empty");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      await onSubmit(planName.trim());
      onClose();
    } catch (error) {
      setError(error.message || "Failed to create plan");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mx-2 sm:mx-0"
      >
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold flex items-center">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Quick Create Plan
              </h2>
              <p className="text-indigo-100 mt-1 text-xs sm:text-sm">
                Create a new plan from template
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 sm:p-2 rounded-xl hover:bg-white/20 transition-all duration-200"
              aria-label="Close modal"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="mb-4">
            <div className="flex items-center space-x-3 mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Box className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                  {template.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                  {template.category} • {template.access_methods?.hotspot?.enabled ? 'Hotspot' : 'PPPoE'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Plan Name *
              </label>
              <input
                type="text"
                value={planName}
                onChange={(e) => {
                  setPlanName(e.target.value);
                  setError("");
                }}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="Enter plan name..."
                required
                autoFocus
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                This will be the name of your new plan
              </p>
            </div>

            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-xs sm:text-sm">
                Template Preview
              </h4>
              <div className="space-y-1 sm:space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Base Price:</span>
                  <span className="font-semibold text-blue-900 dark:text-blue-100">
                    KES {formatNumber(template.base_price || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Used:</span>
                  <span className="font-semibold text-blue-900 dark:text-blue-100">
                    {template.usage_count || 0} times
                  </span>
                </div>
                {template.has_time_variant && (
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Time Variant:</span>
                    <span className="font-semibold text-blue-900 dark:text-blue-100 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Enabled
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!planName.trim() || isLoading}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Create Plan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const TemplateCard = ({ 
  template, 
  onSelect, 
  onApplyTemplate, 
  onCreateFromTemplate, 
  onEditTemplate, 
  onDeleteTemplate,
  onDuplicateTemplate,
  theme,
  viewType = "grid",
  isAuthenticated = true
}) => {
  const themeClasses = getThemeClasses(theme);
  const [showQuickCreateModal, setShowQuickCreateModal] = useState(false);

  // Ensure access_methods exists with defaults
  const accessMethods = template.access_methods || {
    hotspot: { enabled: false },
    pppoe: { enabled: false }
  };

  const getPriorityInfo = (level) => {
    const priority = {
      1: { label: "Lowest", color: "text-gray-500" },
      2: { label: "Low", color: "text-blue-500" },
      3: { label: "Medium", color: "text-green-500" },
      4: { label: "High", color: "text-yellow-500" },
      5: { label: "Highest", color: "text-orange-500" },
      6: { label: "Critical", color: "text-red-500" },
      7: { label: "Premium", color: "text-purple-500" },
      8: { label: "VIP", color: "text-pink-500" },
    };
    return priority[level] || priority[4];
  };

  const priorityInfo = getPriorityInfo(template.priority_level || 4);

  const handleQuickCreate = async (planName) => {
    try {
      const planData = await onCreateFromTemplate(template, planName);
      setShowQuickCreateModal(false);
      return planData;
    } catch (error) {
      throw error;
    }
  };

  const getAccessTypeDisplay = () => {
    if (accessMethods.hotspot?.enabled && accessMethods.pppoe?.enabled) {
      return "Both";
    } else if (accessMethods.hotspot?.enabled) {
      return "Hotspot";
    } else if (accessMethods.pppoe?.enabled) {
      return "PPPoE";
    }
    return "None";
  };

  const formatSpeed = (speedObj) => {
    if (!speedObj || !speedObj.value) return "N/A";
    return `${speedObj.value} ${speedObj.unit || 'Mbps'}`;
  };

  const formatDataLimit = (limitObj) => {
    if (!limitObj) return "N/A";
    if (limitObj.unit?.toLowerCase() === 'unlimited') return "Unlimited";
    return `${limitObj.value || 0} ${limitObj.unit || 'GB'}`;
  };

  // If not authenticated, show disabled card
  if (!isAuthenticated) {
    return (
      <div className={`p-4 sm:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light} opacity-75`}>
        <div className="text-center py-8">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className={`text-sm ${themeClasses.text.secondary}`}>Login required to view templates</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`p-4 sm:p-6 rounded-xl shadow-lg border cursor-pointer transition-all ${
          themeClasses.bg.card
        } ${themeClasses.border.light} hover:border-indigo-500 ${
          viewType === "list" ? "flex flex-col sm:flex-row gap-4" : ""
        }`}
        onClick={() => onSelect(template)}
        aria-label={`View template: ${template.name}`}
      >
        <div className={`flex-1 ${viewType === "list" ? "sm:flex sm:items-start sm:justify-between" : ""}`}>
          <div className={`${viewType === "list" ? "sm:w-2/3" : ""}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center mb-2 flex-wrap gap-2">
                  <h3 className="text-base sm:text-lg font-semibold text-indigo-600 truncate mr-2">
                    {template.name}
                  </h3>
                  <div className="flex items-center space-x-2 flex-wrap gap-1">
                    {template.is_public ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center whitespace-nowrap">
                        <Globe className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">Public</span>
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center whitespace-nowrap">
                        <Lock className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">Private</span>
                      </span>
                    )}
                    {!template.is_active && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center whitespace-nowrap">
                        <Shield className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">Inactive</span>
                      </span>
                    )}
                    {template.usage_count > 10 && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full flex items-center whitespace-nowrap">
                        <Crown className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">Popular</span>
                      </span>
                    )}
                    {template.has_time_variant && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center whitespace-nowrap">
                        <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">Time Variant</span>
                      </span>
                    )}
                  </div>
                </div>
                <p className={`text-xs sm:text-sm ${themeClasses.text.secondary} mb-3 line-clamp-2`}>
                  {template.description || "No description available"}
                </p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${
                template.category === "Business" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                template.category === "Residential" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                template.category === "Enterprise" ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" :
                "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
              }`}>
                <span className="truncate max-w-16 sm:max-w-full">{template.category}</span>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className={themeClasses.text.secondary}>Base Price:</span>
                <span className="font-semibold text-indigo-600">
                  KES {formatNumber(template.base_price || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className={themeClasses.text.secondary}>Used:</span>
                <span className={`font-medium ${
                  template.usage_count === 0 ? "text-gray-500" :
                  template.usage_count < 5 ? "text-green-600" :
                  template.usage_count < 20 ? "text-blue-600" : "text-orange-600"
                }`}>
                  {template.usage_count || 0} time{template.usage_count !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className={themeClasses.text.secondary}>Access Type:</span>
                <span className="font-medium text-indigo-600">
                  {getAccessTypeDisplay()}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className={themeClasses.text.secondary}>Priority:</span>
                <span className={`flex items-center ${priorityInfo.color}`}>
                  <TrendingDown className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{priorityInfo.label}</span>
                </span>
              </div>

              {template.router_specific && (
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className={themeClasses.text.secondary}>Router Specific:</span>
                  <span className="text-orange-600 font-medium truncate">Yes</span>
                </div>
              )}
            </div>
          </div>

          {viewType === "list" && (
            <div className="sm:w-1/3 mt-4 sm:mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center mb-2">
                    <Wifi className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">Hotspot</span>
                  </div>
                  {accessMethods.hotspot?.enabled ? (
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="truncate">Speed:</span>
                        <span className="truncate ml-1">
                          {formatSpeed(accessMethods.hotspot.download_speed)}/
                          {formatSpeed(accessMethods.hotspot.upload_speed)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="truncate">Data:</span>
                        <span className="truncate ml-1">
                          {formatDataLimit(accessMethods.hotspot.data_limit)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-red-600 flex items-center">
                      <X className="w-3 h-3 mr-1" /> Not enabled
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Cable className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">PPPoE</span>
                  </div>
                  {accessMethods.pppoe?.enabled ? (
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="truncate">Speed:</span>
                        <span className="truncate ml-1">
                          {formatSpeed(accessMethods.pppoe.download_speed)}/
                          {formatSpeed(accessMethods.pppoe.upload_speed)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="truncate">Data:</span>
                        <span className="truncate ml-1">
                          {formatDataLimit(accessMethods.pppoe.data_limit)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-red-600 flex items-center">
                      <X className="w-3 h-3 mr-1" /> Not enabled
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {viewType === "grid" && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700 mt-3">
            <div>
              <div className="flex items-center mb-1 sm:mb-2">
                <Wifi className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 mr-2 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium truncate">Hotspot</span>
                <span className={`ml-1 sm:ml-2 text-xs ${
                  accessMethods.hotspot?.enabled ? "text-green-600" : "text-red-600"
                }`}>
                  {accessMethods.hotspot?.enabled ? "✓" : "✗"}
                </span>
              </div>
              {accessMethods.hotspot?.enabled && (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="truncate">Speed:</span>
                    <span className="truncate ml-1">
                      {formatSpeed(accessMethods.hotspot.download_speed)}/
                      {formatSpeed(accessMethods.hotspot.upload_speed)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="truncate">Data:</span>
                    <span className="truncate ml-1">
                      {formatDataLimit(accessMethods.hotspot.data_limit)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center mb-1 sm:mb-2">
                <Cable className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mr-2 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium truncate">PPPoE</span>
                <span className={`ml-1 sm:ml-2 text-xs ${
                  accessMethods.pppoe?.enabled ? "text-green-600" : "text-red-600"
                }`}>
                  {accessMethods.pppoe?.enabled ? "✓" : "✗"}
                </span>
              </div>
              {accessMethods.pppoe?.enabled && (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="truncate">Speed:</span>
                    <span className="truncate ml-1">
                      {formatSpeed(accessMethods.pppoe.download_speed)}/
                      {formatSpeed(accessMethods.pppoe.upload_speed)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="truncate">Data:</span>
                    <span className="truncate ml-1">
                      {formatDataLimit(accessMethods.pppoe.data_limit)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-1 sm:gap-2 mt-3 sm:mt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onApplyTemplate(template);
            }}
            className={`flex-1 min-w-[100px] py-1.5 sm:py-2 rounded-lg font-medium flex items-center justify-center text-xs sm:text-sm ${themeClasses.button.primary}`}
            aria-label={`Use ${template.name} template`}
          >
            <Box className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate">Use</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              setShowQuickCreateModal(true);
            }}
            className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium flex items-center justify-center text-xs sm:text-sm ${themeClasses.button.success}`}
            aria-label={`Quick create plan from ${template.name}`}
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
            <span className="hidden sm:inline">Create</span>
            <span className="sm:hidden">+</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              if (onDuplicateTemplate) {
                onDuplicateTemplate(template);
              }
            }}
            className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium flex items-center justify-center text-xs sm:text-sm ${themeClasses.button.secondary}`}
            aria-label={`Duplicate ${template.name} template`}
          >
            <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onEditTemplate(template);
            }}
            className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium flex items-center justify-center text-xs sm:text-sm ${themeClasses.button.secondary}`}
            aria-label={`Edit ${template.name} template`}
          >
            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTemplate(template);
            }}
            className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium flex items-center justify-center text-xs sm:text-sm ${themeClasses.button.danger}`}
            aria-label={`Delete ${template.name} template`}
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
          </motion.button>
        </div>
      </motion.div>

      <QuickCreateModal
        isOpen={showQuickCreateModal}
        onClose={() => setShowQuickCreateModal(false)}
        onSubmit={handleQuickCreate}
        template={template}
        theme={theme}
      />
    </>
  );
};

export default TemplateCard;