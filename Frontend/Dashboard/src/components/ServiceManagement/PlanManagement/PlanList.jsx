



// import React, { useState, useMemo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { 
//   Plus, Pencil, Trash2, Eye, Users, Search, 
//   Wifi, Cable, BarChart3, Package, Box, Filter,
//   ChevronDown, ChevronUp
// } from "lucide-react";
// import { FaSpinner } from "react-icons/fa";
// import { EnhancedSelect, getThemeClasses } from "../Shared/components"
// import { formatNumber, formatBandwidth, calculateRating } from "../Shared/utils"
// import { categories } from "../Shared/constant"

// // Star component
// const Star = ({ className }) => (
//   <svg className={className} fill="currentColor" viewBox="0 0 20 20">
//     <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//   </svg>
// );

// const PlanList = ({ 
//   plans, 
//   isLoading, 
//   onEditPlan, 
//   onViewDetails, 
//   onDeletePlan, 
//   onNewPlan,
//   onViewAnalytics,
//   onViewTemplates,
//   theme 
// }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [filterCategory, setFilterCategory] = useState("All");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [viewMode, setViewMode] = useState("all"); // "all", "hotspot", "pppoe"
//   const [expandedSections, setExpandedSections] = useState({
//     hotspot: true,
//     pppoe: true
//   });

//   // Separate plans by type
//   const { hotspotPlans, pppoePlans } = useMemo(() => {
//     const hotspot = plans.filter(plan => plan.accessType === 'hotspot');
//     const pppoe = plans.filter(plan => plan.accessType === 'pppoe');
//     return { hotspotPlans: hotspot, pppoePlans: pppoe };
//   }, [plans]);

//   // Filter plans based on view mode and search
//   const filteredHotspotPlans = useMemo(() => {
//     return hotspotPlans.filter(plan => 
//       (filterCategory === "All" || plan.category === filterCategory) &&
//       (plan.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//        plan.description?.toLowerCase().includes(searchTerm.toLowerCase()))
//     );
//   }, [hotspotPlans, filterCategory, searchTerm]);

//   const filteredPppoePlans = useMemo(() => {
//     return pppoePlans.filter(plan => 
//       (filterCategory === "All" || plan.category === filterCategory) &&
//       (plan.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//        plan.description?.toLowerCase().includes(searchTerm.toLowerCase()))
//     );
//   }, [pppoePlans, filterCategory, searchTerm]);

//   const getCategoryIcon = (category) => {
//     const icons = {
//       Residential: <Wifi className="w-4 h-4 text-teal-600" />,
//       Business: <Cable className="w-4 h-4 text-emerald-600" />,
//       Promotional: <Package className="w-4 h-4 text-purple-600" />,
//       Enterprise: <BarChart3 className="w-4 h-4 text-indigo-600" />,
//     };
//     return icons[category] || null;
//   };

//   const renderStars = (purchases) => {
//     const rating = calculateRating(purchases);
//     return (
//       <div className="flex items-center">
//         {[...Array(5)].map((_, i) => (
//           <Star 
//             key={i} 
//             className={`w-3 h-3 lg:w-4 lg:h-4 ${i < Math.round(rating) 
//               ? "text-amber-400 fill-current" 
//               : theme === 'dark' ? "text-gray-600" : "text-gray-300"}`} 
//           />
//         ))}
//         <span className={`ml-1 text-xs ${themeClasses.text.secondary}`}>
//           {rating.toFixed(1)}
//         </span>
//       </div>
//     );
//   };

//   // Get active access method for a plan
//   const getActiveAccessMethod = (plan) => {
//     const accessMethods = plan.accessMethods || {};
//     if (accessMethods.hotspot?.enabled) return { type: 'hotspot', config: accessMethods.hotspot };
//     if (accessMethods.pppoe?.enabled) return { type: 'pppoe', config: accessMethods.pppoe };
//     return { type: 'none', config: null };
//   };

//   const toggleSection = (section) => {
//     setExpandedSections(prev => ({
//       ...prev,
//       [section]: !prev[section]
//     }));
//   };

//   const renderPlanSection = (type, plans, title, icon, color) => {
//     if (viewMode !== "all" && viewMode !== type) return null;
//     if (plans.length === 0 && viewMode === "all") return null;

//     const isExpanded = expandedSections[type];
//     const IconComponent = icon;

//     return (
//       <div className={`mb-6 rounded-2xl overflow-hidden border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
//         {/* Section Header */}
//         <div 
//           className={`p-6 cursor-pointer transition-colors duration-200 ${
//             color === 'blue' 
//               ? 'bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800' 
//               : 'bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800'
//           }`}
//           onClick={() => toggleSection(type)}
//         >
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <div className={`p-3 rounded-xl ${
//                 color === 'blue' 
//                   ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400' 
//                   : 'bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-400'
//               }`}>
//                 <IconComponent className="w-6 h-6" />
//               </div>
//               <div>
//                 <h3 className={`text-xl font-bold ${
//                   color === 'blue' ? 'text-blue-900 dark:text-blue-100' : 'text-emerald-900 dark:text-emerald-100'
//                 }`}>
//                   {title} Plans
//                 </h3>
//                 <p className={`text-sm ${
//                   color === 'blue' ? 'text-blue-700 dark:text-blue-300' : 'text-emerald-700 dark:text-emerald-300'
//                 }`}>
//                   {plans.length} plan{plans.length !== 1 ? 's' : ''} • {
//                     plans.reduce((sum, plan) => sum + (plan.purchases || 0), 0)
//                   } total subscribers
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-4">
//               <span className={`px-3 py-1 rounded-full text-sm font-medium ${
//                 color === 'blue' 
//                   ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200' 
//                   : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200'
//               }`}>
//                 {type.toUpperCase()}
//               </span>
//               {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//             </div>
//           </div>
//         </div>

//         {/* Plans Table */}
//         <AnimatePresence>
//           {isExpanded && (
//             <motion.div
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: "auto" }}
//               exit={{ opacity: 0, height: 0 }}
//               transition={{ duration: 0.3 }}
//             >
//               {plans.length === 0 ? (
//                 <div className="p-8 text-center">
//                   <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//                   <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
//                     No {title} Plans Found
//                   </h4>
//                   <p className="text-gray-500 dark:text-gray-500 mb-4">
//                     {searchTerm || filterCategory !== "All" 
//                       ? "Try adjusting your search or filters" 
//                       : `Get started by creating your first ${title} plan`
//                     }
//                   </p>
//                   {!searchTerm && filterCategory === "All" && (
//                     <motion.button
//                       onClick={() => onNewPlan(type)}
//                       className={`px-4 py-2 rounded-lg text-sm ${
//                         color === 'blue' 
//                           ? 'bg-blue-600 hover:bg-blue-700 text-white' 
//                           : 'bg-emerald-600 hover:bg-emerald-700 text-white'
//                       }`}
//                       whileHover={{ scale: 1.05 }}
//                       whileTap={{ scale: 0.95 }}
//                     >
//                       <Plus className="w-4 h-4 mr-2 inline" />
//                       Create {title} Plan
//                     </motion.button>
//                   )}
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y text-sm">
//                     <thead className={theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}>
//                       <tr>
//                         {["Plan Name", "Category", "Price", "Configuration", "Subscribers", "Status", "Actions"].map((header) => (
//                           <th key={header} className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClasses.text.secondary}`}>
//                             {header}
//                           </th>
//                         ))}
//                       </tr>
//                     </thead>
//                     <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
//                       {plans.map((plan) => {
//                         const activeMethod = getActiveAccessMethod(plan);
                        
//                         return (
//                           <tr key={plan.id} className={`hover:${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
//                             <td className="px-4 py-4 whitespace-nowrap">
//                               <div className="flex items-center">
//                                 {getCategoryIcon(plan.category)}
//                                 <div className="ml-3">
//                                   <div className="flex items-center">
//                                     <span className={`text-sm font-medium truncate max-w-[120px] lg:max-w-none ${themeClasses.text.primary}`}>
//                                       {plan.name || 'Unnamed Plan'}
//                                     </span>
//                                     {plan.template && (
//                                       <Box className="w-3 h-3 text-blue-600 ml-2" title="Created from template" />
//                                     )}
//                                   </div>
//                                   {plan.template && (
//                                     <span className="text-xs text-blue-600 dark:text-blue-400">
//                                       From: {plan.template.name}
//                                     </span>
//                                   )}
//                                 </div>
//                               </div>
//                             </td>
//                             <td className={`px-4 py-4 whitespace-nowrap text-sm ${themeClasses.text.secondary}`}>
//                               {plan.category || 'N/A'}
//                             </td>
//                             <td className={`px-4 py-4 whitespace-nowrap text-sm ${themeClasses.text.secondary}`}>
//                               {plan.planType === "Paid" ? `Ksh ${formatNumber(plan.price || 0)}` : "Free"}
//                             </td>
//                             <td className={`px-4 py-4 whitespace-nowrap text-sm ${themeClasses.text.secondary}`}>
//                               {activeMethod.config && (
//                                 <div className="space-y-1">
//                                   <div className="text-xs">
//                                     {activeMethod.config.downloadSpeed?.value} {activeMethod.config.downloadSpeed?.unit} ↓ / {activeMethod.config.uploadSpeed?.value} {activeMethod.config.uploadSpeed?.unit} ↑
//                                   </div>
//                                   <div className="text-xs text-gray-500">
//                                     {activeMethod.config.dataLimit?.value} {activeMethod.config.dataLimit?.unit} • {activeMethod.config.maxDevices === 0 ? 'Unlimited' : activeMethod.config.maxDevices} devices
//                                   </div>
//                                 </div>
//                               )}
//                             </td>
//                             <td className="px-4 py-4 whitespace-nowrap">
//                               <div className="flex items-center">
//                                 <Users className={`w-3 h-3 lg:w-4 lg:h-4 mr-2 ${themeClasses.text.tertiary}`} />
//                                 <span className={`text-sm mr-3 ${themeClasses.text.secondary}`}>
//                                   {plan.purchases || 0}
//                                 </span>
//                                 {renderStars(plan.purchases || 0)}
//                               </div>
//                             </td>
//                             <td className="px-4 py-4 whitespace-nowrap">
//                               <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
//                                 plan.active 
//                                   ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
//                                   : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
//                               }`}>
//                                 {plan.active ? 'Active' : 'Inactive'}
//                               </span>
//                             </td>
//                             <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
//                               <div className="flex space-x-2">
//                                 <motion.button 
//                                   onClick={() => onViewDetails(plan)} 
//                                   className="focus:outline-none p-1" 
//                                   whileHover={{ scale: 1.2 }} 
//                                   transition={{ type: "spring", stiffness: 300 }}
//                                   title="View Details"
//                                 >
//                                   <Eye className="w-4 h-4 text-indigo-600 hover:text-indigo-800" />
//                                 </motion.button>
//                                 <motion.button 
//                                   onClick={() => onEditPlan(plan)} 
//                                   className="focus:outline-none p-1" 
//                                   whileHover={{ rotate: 90 }} 
//                                   transition={{ type: "spring", stiffness: 300 }}
//                                   title="Edit Plan"
//                                 >
//                                   <Pencil className="w-4 h-4 text-emerald-600 hover:text-emerald-800" />
//                                 </motion.button>
//                                 <motion.button 
//                                   onClick={() => onDeletePlan(plan)} 
//                                   className="focus:outline-none p-1" 
//                                   whileHover={{ x: [0, -2, 2, -2, 0] }} 
//                                   transition={{ duration: 0.3 }}
//                                   title="Delete Plan"
//                                 >
//                                   <Trash2 className="w-4 h-4 text-red-600 hover:text-red-800" />
//                                 </motion.button>
//                               </div>
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     );
//   };

//   return (
//     <div className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${themeClasses.bg.primary}`}>
//       <main className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
//         {/* Header Section */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 lg:gap-6">
//           <div className="flex-1 min-w-0">
//             <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 truncate">
//               Internet Plans Management
//             </h1>
//             <p className={`mt-1 lg:mt-2 text-sm lg:text-lg ${themeClasses.text.secondary}`}>
//               Create and manage your internet service plans
//             </p>
//           </div>
          
//           {/* Action Buttons */}
//           <div className="flex flex-wrap gap-2 lg:gap-3 w-full md:w-auto justify-start md:justify-end">
//             <motion.button
//               onClick={onViewAnalytics}
//               className={`px-3 py-2 lg:px-4 lg:py-2 rounded-lg shadow-md flex items-center justify-center text-xs lg:text-sm ${themeClasses.button.primary}`}
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               <BarChart3 className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
//               <span>Analytics</span>
//             </motion.button>
            
//             <motion.button
//               onClick={onViewTemplates}
//               className={`px-3 py-2 lg:px-4 lg:py-2 rounded-lg shadow-md flex items-center justify-center text-xs lg:text-sm ${themeClasses.button.primary}`}
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               <Box className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
//               <span>Templates</span>
//             </motion.button>
            
//             {/* Unified Create New Plan Button */}
//             <motion.button
//               onClick={onNewPlan}
//               className={`px-4 py-2 lg:px-6 lg:py-3 rounded-lg shadow-md flex items-center justify-center text-sm lg:text-base ${themeClasses.button.success}`}
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
//               <span>Create New Plan</span>
//             </motion.button>
//           </div>
//         </div>

//         {/* View Mode Toggle */}
//         <div className={`p-4 lg:p-6 rounded-xl shadow-lg ${themeClasses.bg.card}`}>
//           <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
//             <div className="flex flex-wrap gap-2">
//               <button
//                 onClick={() => setViewMode("all")}
//                 className={`px-4 py-2 rounded-lg font-medium transition-colors ${
//                   viewMode === "all" 
//                     ? "bg-indigo-600 text-white" 
//                     : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
//                 }`}
//               >
//                 All Plans ({plans.length})
//               </button>
//               <button
//                 onClick={() => setViewMode("hotspot")}
//                 className={`px-4 py-2 rounded-lg font-medium transition-colors ${
//                   viewMode === "hotspot" 
//                     ? "bg-blue-600 text-white" 
//                     : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/40"
//                 }`}
//               >
//                 <Wifi className="w-4 h-4 inline mr-2" />
//                 Hotspot ({hotspotPlans.length})
//               </button>
//               <button
//                 onClick={() => setViewMode("pppoe")}
//                 className={`px-4 py-2 rounded-lg font-medium transition-colors ${
//                   viewMode === "pppoe" 
//                     ? "bg-emerald-600 text-white" 
//                     : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800/40"
//                 }`}
//               >
//                 <Cable className="w-4 h-4 inline mr-2" />
//                 PPPoE ({pppoePlans.length})
//               </button>
//             </div>

//             {/* Filters - FIXED CATEGORY FILTER */}
//             <div className="flex flex-col sm:flex-row gap-3 flex-1 sm:justify-end">
//               <div className="w-full sm:w-40 lg:w-48">
//                 <EnhancedSelect
//                   value={filterCategory}
//                   onChange={setFilterCategory}
//                   options={[
//                     { value: "All", label: "All Categories" },
//                     ...categories.map(cat => ({ value: cat, label: cat }))
//                   ]}
//                   className="w-full"
//                   theme={theme} // FIX: Added theme prop
//                 />
//               </div>
              
//               <div className="relative w-full sm:w-64">
//                 <div className="relative">
//                   <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.text.tertiary}`} />
//                   <input
//                     type="text" 
//                     placeholder="Search plans..." 
//                     value={searchTerm} 
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className={`w-full pl-10 pr-4 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Loading State */}
//         {isLoading ? (
//           <div className={`flex justify-center items-center py-12 rounded-xl ${themeClasses.bg.card}`}>
//             <FaSpinner className="w-8 h-8 text-indigo-600 animate-spin" />
//           </div>
//         ) : plans.length === 0 ? (
//           <div className={`rounded-xl shadow-lg p-6 lg:p-8 text-center ${themeClasses.bg.card}`}>
//             <Package className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-3 lg:mb-4" />
//             <h3 className="text-lg lg:text-xl font-semibold mb-2">No Plans Available</h3>
//             <p className={`mb-4 lg:mb-6 text-sm lg:text-base ${themeClasses.text.secondary}`}>
//               Create your first internet plan to get started!
//             </p>
//             <div className="flex flex-col sm:flex-row gap-3 justify-center">
//               <motion.button
//                 onClick={onNewPlan}
//                 className={`px-4 py-2 lg:px-6 lg:py-3 rounded-lg shadow-md text-sm lg:text-base ${themeClasses.button.primary}`}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2" />
//                 Create Your First Plan
//               </motion.button>
//               <motion.button
//                 onClick={onViewTemplates}
//                 className={`px-4 py-2 lg:px-6 lg:py-3 rounded-lg shadow-md text-sm lg:text-base ${themeClasses.button.secondary}`}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 <Box className="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2" />
//                 Browse Templates
//               </motion.button>
//             </div>
//           </div>
//         ) : (
//           <div className="space-y-6">
//             {/* Hotspot Plans Section */}
//             {renderPlanSection("hotspot", filteredHotspotPlans, "Hotspot", Wifi, "blue")}
            
//             {/* PPPoE Plans Section */}
//             {renderPlanSection("pppoe", filteredPppoePlans, "PPPoE", Cable, "emerald")}

//             {/* Empty State for Filtered Results */}
//             {viewMode === "all" && filteredHotspotPlans.length === 0 && filteredPppoePlans.length === 0 && (
//               <div className={`rounded-xl shadow-lg p-8 text-center ${themeClasses.bg.card}`}>
//                 <Filter className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//                 <h3 className="text-lg font-semibold mb-2">No Plans Match Your Criteria</h3>
//                 <p className="text-gray-500 dark:text-gray-400 mb-4">
//                   Try adjusting your search terms or filters
//                 </p>
//                 <button
//                   onClick={() => {
//                     setSearchTerm("");
//                     setFilterCategory("All");
//                   }}
//                   className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
//                 >
//                   Clear Filters
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };

// export default PlanList;








// import React, { useState, useMemo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { 
//   Plus, Pencil, Trash2, Eye, Users, Search, 
//   Wifi, Cable, BarChart3, Package, Box, Filter,
//   ChevronDown, ChevronUp, Clock, DollarSign, Calendar,
//   CheckCircle, XCircle, AlertTriangle
// } from "lucide-react";
// import { FaSpinner } from "react-icons/fa";
// import { EnhancedSelect, getThemeClasses, AvailabilityBadge, PriceBadge, PlanTypeBadge } from "../Shared/components"
// import {  calculateRating, isPlanAvailableNow, formatNumber } from "../Shared/utils"
// import {  formatBytes, formatDuration } from "../Shared/formatters"
// import { categories, planTypes } from "../Shared/constant"

// // Star component
// const Star = ({ className }) => (
//   <svg className={className} fill="currentColor" viewBox="0 0 20 20">
//     <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//   </svg>
// );

// const PlanList = ({ 
//   plans, 
//   isLoading, 
//   onEditPlan, 
//   onViewDetails, 
//   onDeletePlan, 
//   onDuplicatePlan,
//   onToggleStatus,
//   onNewPlan,
//   onViewAnalytics,
//   onViewTemplates,
//   theme,
//   isMobile,
//   isTablet,
//   isDesktop,
//   searchQuery,
//   onSearchChange,
//   activeFilters,
//   onApplyFilter,
//   onClearFilters,
//   sortConfig,
//   onSort
// }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [expandedSections, setExpandedSections] = useState({
//     hotspot: true,
//     pppoe: true,
//     dual: true
//   });

//   // Filter and sort plans
//   const filteredPlans = useMemo(() => {
//     let filtered = [...plans];
    
//     // Apply category filter
//     if (activeFilters.category) {
//       filtered = filtered.filter(plan => plan.category === activeFilters.category);
//     }
    
//     // Apply plan type filter
//     if (activeFilters.planType) {
//       filtered = filtered.filter(plan => plan.planType === activeFilters.planType);
//     }
    
//     // Apply access type filter
//     if (activeFilters.accessType) {
//       filtered = filtered.filter(plan => {
//         const enabledMethods = plan.enabled_access_methods || plan.get_enabled_access_methods?.() || [];
//         if (activeFilters.accessType === 'both') {
//           return enabledMethods.includes('hotspot') && enabledMethods.includes('pppoe');
//         }
//         return enabledMethods.includes(activeFilters.accessType);
//       });
//     }
    
//     // Apply availability filter
//     if (activeFilters.availability !== null) {
//       filtered = filtered.filter(plan => {
//         const isAvailable = plan.isAvailableNow !== undefined 
//           ? plan.isAvailableNow 
//           : isPlanAvailableNow(plan);
//         return isAvailable === activeFilters.availability;
//       });
//     }
    
//     // Apply price range filter
//     if (activeFilters.priceRange) {
//       filtered = filtered.filter(plan => {
//         const price = parseFloat(plan.price) || 0;
//         return price >= activeFilters.priceRange.min && price <= activeFilters.priceRange.max;
//       });
//     }
    
//     // Apply time variant filter
//     if (activeFilters.hasTimeVariant !== null) {
//       filtered = filtered.filter(plan => {
//         const hasVariant = plan.time_variant?.is_active || plan.has_time_variant;
//         return hasVariant === activeFilters.hasTimeVariant;
//       });
//     }
    
//     // Apply search
//     if (searchQuery) {
//       const query = searchQuery.toLowerCase();
//       filtered = filtered.filter(plan => 
//         plan.name?.toLowerCase().includes(query) ||
//         plan.description?.toLowerCase().includes(query) ||
//         plan.category?.toLowerCase().includes(query)
//       );
//     }
    
//     // Apply sorting
//     filtered.sort((a, b) => {
//       let aValue = a[sortConfig.field];
//       let bValue = b[sortConfig.field];
      
//       switch (sortConfig.field) {
//         case 'price':
//           aValue = parseFloat(aValue) || 0;
//           bValue = parseFloat(bValue) || 0;
//           break;
//         case 'created_at':
//         case 'updated_at':
//           aValue = new Date(aValue).getTime();
//           bValue = new Date(bValue).getTime();
//           break;
//         case 'name':
//         case 'description':
//           aValue = (aValue || '').toLowerCase();
//           bValue = (bValue || '').toLowerCase();
//           break;
//         case 'purchases':
//           aValue = aValue || 0;
//           bValue = bValue || 0;
//           break;
//       }
      
//       if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
//       if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
//       return 0;
//     });
    
//     return filtered;
//   }, [plans, activeFilters, searchQuery, sortConfig]);

//   // Separate plans by access type
//   const { hotspotPlans, pppoePlans, dualPlans } = useMemo(() => {
//     const hotspot = filteredPlans.filter(plan => {
//       const methods = plan.enabled_access_methods || plan.get_enabled_access_methods?.() || [];
//       return methods.includes('hotspot') && !methods.includes('pppoe');
//     });
//     const pppoe = filteredPlans.filter(plan => {
//       const methods = plan.enabled_access_methods || plan.get_enabled_access_methods?.() || [];
//       return methods.includes('pppoe') && !methods.includes('hotspot');
//     });
//     const dual = filteredPlans.filter(plan => {
//       const methods = plan.enabled_access_methods || plan.get_enabled_access_methods?.() || [];
//       return methods.includes('hotspot') && methods.includes('pppoe');
//     });
    
//     return { hotspotPlans: hotspot, pppoePlans: pppoe, dualPlans: dual };
//   }, [filteredPlans]);

//   const getCategoryIcon = (category) => {
//     const icons = {
//       Residential: <Wifi className="w-4 h-4 text-teal-600" />,
//       Business: <Cable className="w-4 h-4 text-emerald-600" />,
//       Promotional: <Package className="w-4 h-4 text-purple-600" />,
//       Enterprise: <BarChart3 className="w-4 h-4 text-indigo-600" />,
//       Hotspot: <Wifi className="w-4 h-4 text-blue-600" />,
//       PPPoE: <Cable className="w-4 h-4 text-green-600" />,
//       Dual: <><Wifi className="w-3 h-3 text-blue-600 mr-1" /><Cable className="w-3 h-3 text-green-600" /></>
//     };
//     return icons[category] || null;
//   };

//   const renderStars = (purchases) => {
//     const rating = calculateRating(purchases);
//     return (
//       <div className="flex items-center">
//         {[...Array(5)].map((_, i) => (
//           <Star 
//             key={i} 
//             className={`w-3 h-3 ${i < Math.round(rating) 
//               ? "text-amber-400 fill-current" 
//               : theme === 'dark' ? "text-gray-600" : "text-gray-300"}`} 
//           />
//         ))}
//         <span className={`ml-1 text-xs ${themeClasses.text.secondary}`}>
//           {rating.toFixed(1)}
//         </span>
//       </div>
//     );
//   };

//   // Get active access method for a plan
//   const getActiveAccessMethod = (plan) => {
//     const enabledMethods = plan.enabled_access_methods || plan.get_enabled_access_methods?.() || [];
//     const accessMethods = plan.accessMethods || plan.access_methods || {};
    
//     if (enabledMethods.includes('hotspot') && enabledMethods.includes('pppoe')) {
//       return { type: 'dual', config: accessMethods };
//     }
//     if (enabledMethods.includes('hotspot')) {
//       return { type: 'hotspot', config: accessMethods.hotspot };
//     }
//     if (enabledMethods.includes('pppoe')) {
//       return { type: 'pppoe', config: accessMethods.pppoe };
//     }
//     return { type: 'none', config: null };
//   };

//   const toggleSection = (section) => {
//     setExpandedSections(prev => ({
//       ...prev,
//       [section]: !prev[section]
//     }));
//   };

//   const renderPlanSection = (type, plans, title, icon, color) => {
//     if (plans.length === 0) return null;

//     const isExpanded = expandedSections[type];
//     const IconComponent = icon;

//     return (
//       <div className={`mb-6 rounded-2xl overflow-hidden border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
//         {/* Section Header */}
//         <div 
//           className={`p-4 sm:p-6 cursor-pointer transition-colors duration-200 ${
//             color === 'blue' 
//               ? 'bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800' 
//               : color === 'green'
//               ? 'bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800'
//               : 'bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-800'
//           }`}
//           onClick={() => toggleSection(type)}
//         >
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
//             <div className="flex items-center space-x-3 sm:space-x-4">
//               <div className={`p-2 sm:p-3 rounded-xl ${
//                 color === 'blue' 
//                   ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400' 
//                   : color === 'green'
//                   ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-400'
//                   : 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400'
//               }`}>
//                 <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
//               </div>
//               <div>
//                 <h3 className={`text-lg sm:text-xl font-bold ${
//                   color === 'blue' ? 'text-blue-900 dark:text-blue-100' 
//                   : color === 'green' ? 'text-emerald-900 dark:text-emerald-100'
//                   : 'text-purple-900 dark:text-purple-100'
//                 }`}>
//                   {title} Plans
//                 </h3>
//                 <p className={`text-sm ${
//                   color === 'blue' ? 'text-blue-700 dark:text-blue-300' 
//                   : color === 'green' ? 'text-emerald-700 dark:text-emerald-300'
//                   : 'text-purple-700 dark:text-purple-300'
//                 }`}>
//                   {plans.length} plan{plans.length !== 1 ? 's' : ''} • {
//                     plans.reduce((sum, plan) => sum + (plan.purchases || 0), 0)
//                   } total purchases
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-2 sm:space-x-4 self-end sm:self-auto">
//               <span className={`px-2 py-1 text-xs sm:text-sm font-medium ${
//                 color === 'blue' 
//                   ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200' 
//                   : color === 'green'
//                   ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200'
//                   : 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200'
//               }`}>
//                 {type.toUpperCase()}
//               </span>
//               {isExpanded ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
//             </div>
//           </div>
//         </div>

//         {/* Plans Table */}
//         <AnimatePresence>
//           {isExpanded && (
//             <motion.div
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: "auto" }}
//               exit={{ opacity: 0, height: 0 }}
//               transition={{ duration: 0.3 }}
//             >
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y text-xs sm:text-sm">
//                   <thead className={theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}>
//                     <tr>
//                       {["Plan Name", "Category", "Price", "Configuration", "Status", "Actions"].map((header) => (
//                         <th key={header} className={`px-3 py-2 sm:px-4 sm:py-3 text-left font-medium uppercase tracking-wider ${themeClasses.text.secondary}`}>
//                           {header}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
//                     {plans.map((plan) => {
//                       const activeMethod = getActiveAccessMethod(plan);
//                       const isAvailable = plan.isAvailableNow !== undefined 
//                         ? plan.isAvailableNow 
//                         : isPlanAvailableNow(plan);
                      
//                       return (
//                         <tr key={plan.id} className={`hover:${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
//                           <td className="px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap">
//                             <div className="flex items-center">
//                               {getCategoryIcon(plan.category)}
//                               <div className="ml-2 sm:ml-3">
//                                 <div className="flex items-center">
//                                   <span className={`font-medium truncate max-w-[100px] sm:max-w-[150px] lg:max-w-none ${themeClasses.text.primary}`}>
//                                     {plan.name || 'Unnamed Plan'}
//                                   </span>
//                                   {plan.template && (
//                                     <Box className="w-3 h-3 text-blue-600 ml-1 sm:ml-2" title="Created from template" />
//                                   )}
//                                 </div>
//                                 {plan.template && (
//                                   <span className="text-xs text-blue-600 dark:text-blue-400">
//                                     From: {plan.template.name}
//                                   </span>
//                                 )}
//                               </div>
//                             </div>
//                           </td>
//                           <td className={`px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap ${themeClasses.text.secondary}`}>
//                             {plan.category || 'N/A'}
//                           </td>
//                           <td className={`px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap ${themeClasses.text.secondary}`}>
//                             <PriceBadge 
//                               price={plan.price} 
//                               currency="KES"
//                               theme={theme}
//                               size="sm"
//                             />
//                           </td>
//                           <td className={`px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap ${themeClasses.text.secondary}`}>
//                             {activeMethod.config && (
//                               <div className="space-y-1">
//                                 <div className="text-xs">
//                                   {activeMethod.type === 'dual' ? (
//                                     <span className="flex items-center gap-1">
//                                       <Wifi className="w-3 h-3 text-blue-500" />
//                                       <Cable className="w-3 h-3 text-green-500" />
//                                     </span>
//                                   ) : activeMethod.type === 'hotspot' ? (
//                                     <span className="flex items-center gap-1">
//                                       <Wifi className="w-3 h-3 text-blue-500" />
//                                       <span>Hotspot</span>
//                                     </span>
//                                   ) : (
//                                     <span className="flex items-center gap-1">
//                                       <Cable className="w-3 h-3 text-green-500" />
//                                       <span>PPPoE</span>
//                                     </span>
//                                   )}
//                                 </div>
//                                 {activeMethod.config.hotspot && (
//                                   <div className="text-xs text-gray-500">
//                                     {activeMethod.config.hotspot.downloadSpeed?.value || '10'} Mbps
//                                   </div>
//                                 )}
//                                 {activeMethod.config.pppoe && (
//                                   <div className="text-xs text-gray-500">
//                                     {activeMethod.config.pppoe.downloadSpeed?.value || '10'} Mbps
//                                   </div>
//                                 )}
//                               </div>
//                             )}
//                           </td>
//                           <td className="px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap">
//                             <div className="flex flex-col gap-1">
//                               <AvailabilityBadge
//                                 status={isAvailable ? "available" : "unavailable"}
//                                 theme={theme}
//                                 size="xs"
//                               />
//                               <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
//                                 plan.active 
//                                   ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
//                                   : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
//                               }`}>
//                                 {plan.active ? 'Active' : 'Inactive'}
//                               </span>
//                             </div>
//                           </td>
//                           <td className="px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap text-sm font-medium">
//                             <div className="flex flex-wrap gap-1 sm:gap-2">
//                               <motion.button 
//                                 onClick={() => onViewDetails(plan)} 
//                                 className="focus:outline-none p-1" 
//                                 whileHover={{ scale: 1.2 }} 
//                                 transition={{ type: "spring", stiffness: 300 }}
//                                 title="View Details"
//                               >
//                                 <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600 hover:text-indigo-800" />
//                               </motion.button>
//                               <motion.button 
//                                 onClick={() => onEditPlan(plan)} 
//                                 className="focus:outline-none p-1" 
//                                 whileHover={{ rotate: 90 }} 
//                                 transition={{ type: "spring", stiffness: 300 }}
//                                 title="Edit Plan"
//                               >
//                                 <Pencil className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 hover:text-emerald-800" />
//                               </motion.button>
//                               <motion.button 
//                                 onClick={() => onDeletePlan(plan)} 
//                                 className="focus:outline-none p-1" 
//                                 whileHover={{ x: [0, -2, 2, -2, 0] }} 
//                                 transition={{ duration: 0.3 }}
//                                 title="Delete Plan"
//                               >
//                                 <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 hover:text-red-800" />
//                               </motion.button>
//                             </div>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     );
//   };

//   // Filter UI Component
//   const FilterSection = () => (
//     <div className={`p-4 sm:p-6 rounded-xl shadow-lg ${themeClasses.bg.card}`}>
//       <div className="flex flex-col gap-4">
//         <div className="flex flex-col sm:flex-row gap-3 justify-between">
//           <div className="flex flex-wrap gap-2">
//             {/* Category Filter */}
//             <div className="w-full sm:w-40">
//               <EnhancedSelect
//                 value={activeFilters.category || ''}
//                 onChange={(value) => onApplyFilter('category', value || null)}
//                 options={[
//                   { value: '', label: "All Categories" },
//                   ...categories.map(cat => ({ value: cat, label: cat }))
//                 ]}
//                 theme={theme}
//               />
//             </div>
            
//             {/* Plan Type Filter */}
//             <div className="w-full sm:w-40">
//               <EnhancedSelect
//                 value={activeFilters.planType || ''}
//                 onChange={(value) => onApplyFilter('planType', value || null)}
//                 options={[
//                   { value: '', label: "All Plan Types" },
//                   ...planTypes.map(type => ({ value: type, label: type }))
//                 ]}
//                 theme={theme}
//               />
//             </div>
            
//             {/* Access Type Filter */}
//             <div className="w-full sm:w-40">
//               <EnhancedSelect
//                 value={activeFilters.accessType || ''}
//                 onChange={(value) => onApplyFilter('accessType', value || null)}
//                 options={[
//                   { value: '', label: "All Access Types" },
//                   { value: 'hotspot', label: "Hotspot Only" },
//                   { value: 'pppoe', label: "PPPoE Only" },
//                   { value: 'both', label: "Dual Access" }
//                 ]}
//                 theme={theme}
//               />
//             </div>
//           </div>

//           {/* Search */}
//           <div className="relative w-full sm:w-64">
//             <div className="relative">
//               <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.text.tertiary}`} />
//               <input
//                 type="text" 
//                 placeholder="Search plans..." 
//                 value={searchQuery} 
//                 onChange={(e) => onSearchChange(e.target.value)}
//                 className={`w-full pl-10 pr-4 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//               />
//             </div>
//           </div>
//         </div>
        
//         {/* Advanced Filters Row */}
//         <div className="flex flex-wrap gap-2 items-center">
//           <span className="text-sm text-gray-500 dark:text-gray-400">Filters:</span>
          
//           {/* Availability Filter */}
//           <div className="flex gap-1">
//             <button
//               onClick={() => onApplyFilter('availability', true)}
//               className={`px-3 py-1 rounded text-xs ${
//                 activeFilters.availability === true
//                   ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
//                   : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
//               }`}
//             >
//               <CheckCircle className="w-3 h-3 inline mr-1" />
//               Available
//             </button>
//             <button
//               onClick={() => onApplyFilter('availability', false)}
//               className={`px-3 py-1 rounded text-xs ${
//                 activeFilters.availability === false
//                   ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
//                   : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
//               }`}
//             >
//               <XCircle className="w-3 h-3 inline mr-1" />
//               Unavailable
//             </button>
//           </div>
          
//           {/* Time Variant Filter */}
//           <div className="flex gap-1">
//             <button
//               onClick={() => onApplyFilter('hasTimeVariant', true)}
//               className={`px-3 py-1 rounded text-xs ${
//                 activeFilters.hasTimeVariant === true
//                   ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
//                   : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
//               }`}
//             >
//               <Clock className="w-3 h-3 inline mr-1" />
//               Time Restricted
//             </button>
//             <button
//               onClick={() => onApplyFilter('hasTimeVariant', false)}
//               className={`px-3 py-1 rounded text-xs ${
//                 activeFilters.hasTimeVariant === false
//                   ? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
//                   : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
//               }`}
//             >
//               Always Available
//             </button>
//           </div>
          
//           {/* Clear Filters */}
//           {(activeFilters.category || activeFilters.planType || activeFilters.accessType || 
//             activeFilters.availability !== null || activeFilters.hasTimeVariant !== null) && (
//             <button
//               onClick={onClearFilters}
//               className="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700 rounded"
//             >
//               Clear Filters
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${themeClasses.bg.primary}`}>
//       <main className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
//         {/* Header Section */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
//           <div className="flex-1 min-w-0">
//             <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
//               Internet Plans Management
//             </h1>
//             <p className={`mt-1 text-sm sm:text-base ${themeClasses.text.secondary}`}>
//               Create and manage your internet service plans
//             </p>
//           </div>
          
//           {/* Action Buttons */}
//           <div className="flex flex-wrap gap-2 sm:gap-3 w-full md:w-auto justify-start md:justify-end">
//             <motion.button
//               onClick={onViewAnalytics}
//               className={`px-3 py-2 rounded-lg shadow-md flex items-center justify-center text-xs sm:text-sm ${themeClasses.button.primary}`}
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
//               <span>Analytics</span>
//             </motion.button>
            
//             <motion.button
//               onClick={onViewTemplates}
//               className={`px-3 py-2 rounded-lg shadow-md flex items-center justify-center text-xs sm:text-sm ${themeClasses.button.primary}`}
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               <Box className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
//               <span>Templates</span>
//             </motion.button>
            
//             <motion.button
//               onClick={onNewPlan}
//               className={`px-4 py-2 rounded-lg shadow-md flex items-center justify-center text-sm ${themeClasses.button.success}`}
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               <Plus className="w-4 h-4 mr-2" />
//               <span>Create New Plan</span>
//             </motion.button>
//           </div>
//         </div>

//         {/* Filters Section */}
//         <FilterSection />

//         {/* Loading State */}
//         {isLoading ? (
//           <div className={`flex justify-center items-center py-12 rounded-xl ${themeClasses.bg.card}`}>
//             <FaSpinner className="w-8 h-8 text-indigo-600 animate-spin" />
//           </div>
//         ) : filteredPlans.length === 0 ? (
//           <div className={`rounded-xl shadow-lg p-6 text-center ${themeClasses.bg.card}`}>
//             <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//             <h3 className="text-lg font-semibold mb-2">No Plans Found</h3>
//             <p className={`mb-4 ${themeClasses.text.secondary}`}>
//               {searchQuery || Object.values(activeFilters).some(v => v !== null && v !== '') 
//                 ? "Try adjusting your search or filters" 
//                 : "Create your first internet plan to get started!"
//               }
//             </p>
//             <div className="flex flex-col sm:flex-row gap-3 justify-center">
//               <motion.button
//                 onClick={onNewPlan}
//                 className={`px-4 py-2 rounded-lg shadow-md ${themeClasses.button.primary}`}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 <Plus className="w-4 h-4 mr-1" />
//                 Create Your First Plan
//               </motion.button>
//               {(searchQuery || Object.values(activeFilters).some(v => v !== null && v !== '')) && (
//                 <motion.button
//                   onClick={onClearFilters}
//                   className={`px-4 py-2 rounded-lg shadow-md ${themeClasses.button.secondary}`}
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                 >
//                   Clear All Filters
//                 </motion.button>
//               )}
//             </div>
//           </div>
//         ) : (
//           <div className="space-y-4 sm:space-y-6">
//             {/* Hotspot Plans Section */}
//             {renderPlanSection("hotspot", hotspotPlans, "Hotspot", Wifi, "blue")}
            
//             {/* PPPoE Plans Section */}
//             {renderPlanSection("pppoe", pppoePlans, "PPPoE", Cable, "green")}
            
//             {/* Dual Access Plans Section */}
//             {renderPlanSection("dual", dualPlans, "Dual Access", (props) => (
//               <div className="flex">
//                 <Wifi className="w-3 h-3" {...props} />
//                 <Cable className="w-3 h-3" {...props} />
//               </div>
//             ), "purple")}

//             {/* Summary Stats */}
//             <div className={`p-4 sm:p-6 rounded-xl ${themeClasses.bg.card}`}>
//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
//                 <div className="text-center">
//                   <div className="text-xl sm:text-2xl font-bold text-blue-600">{filteredPlans.length}</div>
//                   <div className="text-xs sm:text-sm text-gray-500">Total Plans</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-xl sm:text-2xl font-bold text-green-600">
//                     {filteredPlans.filter(p => p.active).length}
//                   </div>
//                   <div className="text-xs sm:text-sm text-gray-500">Active</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-xl sm:text-2xl font-bold text-purple-600">
//                     {filteredPlans.filter(p => p.time_variant?.is_active).length}
//                   </div>
//                   <div className="text-xs sm:text-sm text-gray-500">Time Restricted</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-xl sm:text-2xl font-bold text-orange-600">
//                     {filteredPlans.reduce((sum, p) => sum + (p.purchases || 0), 0)}
//                   </div>
//                   <div className="text-xs sm:text-sm text-gray-500">Total Purchases</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };

// export default PlanList;









import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Pencil, Trash2, Eye, Users, Search, 
  Wifi, Cable, BarChart3, Package, Box, Filter,
  ChevronDown, ChevronUp, Clock, DollarSign, Calendar,
  CheckCircle, XCircle, AlertTriangle, Settings,
  Star, Target, TrendingUp, Zap, Shield, Download
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { EnhancedSelect, getThemeClasses, AvailabilityBadge, PriceBadge, PlanTypeBadge } from "../Shared/components"
import { calculateRating, isPlanAvailableNow } from "../Shared/utils"
import { formatNumber } from "../Shared/formatters"
import { categories, planTypes } from "../Shared/constant"

// Star component for ratings
const StarIcon = ({ filled, className = "" }) => (
  <svg className={`w-3 h-3 ${className} ${filled ? "text-amber-400 fill-current" : "text-gray-300"}`} 
       fill={filled ? "currentColor" : "none"} viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

// Plan Card Component for mobile view
const PlanCard = ({ plan, theme, onViewDetails, onEditPlan, onDeletePlan, onDuplicatePlan, onToggleStatus }) => {
  const themeClasses = getThemeClasses(theme);
  const isAvailable = isPlanAvailableNow(plan);
  const rating = calculateRating(plan.purchases || 0);
  
  const accessType = plan.enabled_access_methods?.includes('hotspot') && plan.enabled_access_methods?.includes('pppoe') 
    ? 'dual' 
    : plan.enabled_access_methods?.includes('hotspot') 
    ? 'hotspot' 
    : 'pppoe';
  
  const accessTypeColors = {
    hotspot: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
    pppoe: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
    dual: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100'
  };

  return (
    <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate mr-2">
              {plan.name || 'Unnamed Plan'}
            </h3>
            {plan.template && (
              <Box className="w-3 h-3 text-blue-600" title="Created from template" />
            )}
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            <span className={`text-xs px-2 py-1 rounded-full ${accessTypeColors[accessType]}`}>
              {accessType.toUpperCase()}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              plan.active 
                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
            }`}>
              {plan.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <PriceBadge 
            price={plan.price} 
            currency="KES"
            theme={theme}
            size="sm"
          />
          <AvailabilityBadge
            status={isAvailable ? "available" : "unavailable"}
            theme={theme}
            size="xs"
            className="mt-1"
          />
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Category:</span>
          <span className="font-medium">{plan.category || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Type:</span>
          <PlanTypeBadge type={plan.plan_type} theme={theme} size="xs" />
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Purchases:</span>
          <span className="font-medium">{plan.purchases || 0}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 dark:text-gray-400">Rating:</span>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon 
                key={i} 
                filled={i < Math.floor(rating)}
                className="w-3 h-3"
              />
            ))}
            <span className="ml-1 text-xs text-gray-500">
              {rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <motion.button 
            onClick={() => onViewDetails(plan)} 
            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="View Details"
          >
            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </motion.button>
          <motion.button 
            onClick={() => onEditPlan(plan)} 
            className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Edit Plan"
          >
            <Pencil className="w-4 h-4 text-blue-600 dark:text-blue-300" />
          </motion.button>
        </div>
        <div className="flex gap-2">
          <motion.button 
            onClick={() => onDuplicatePlan(plan)} 
            className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Duplicate Plan"
          >
            <Plus className="w-4 h-4 text-green-600 dark:text-green-300" />
          </motion.button>
          <motion.button 
            onClick={() => onDeletePlan(plan)} 
            className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Delete Plan"
          >
            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-300" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// Plan Table Row Component for desktop view
const PlanTableRow = ({ plan, theme, onViewDetails, onEditPlan, onDeletePlan, onDuplicatePlan, onToggleStatus }) => {
  const themeClasses = getThemeClasses(theme);
  const isAvailable = isPlanAvailableNow(plan);
  const rating = calculateRating(plan.purchases || 0);
  
  const accessType = plan.enabled_access_methods?.includes('hotspot') && plan.enabled_access_methods?.includes('pppoe') 
    ? 'dual' 
    : plan.enabled_access_methods?.includes('hotspot') 
    ? 'hotspot' 
    : 'pppoe';
  
  const accessTypeColors = {
    hotspot: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
    pppoe: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
    dual: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100'
  };

  return (
    <tr className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors`}>
      {/* Plan Name */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {accessType === 'hotspot' ? (
              <Wifi className="w-4 h-4 text-blue-600" />
            ) : accessType === 'pppoe' ? (
              <Cable className="w-4 h-4 text-green-600" />
            ) : (
              <div className="flex">
                <Wifi className="w-3 h-3 text-blue-600" />
                <Cable className="w-3 h-3 text-green-600" />
              </div>
            )}
          </div>
          <div className="ml-3">
            <div className="font-medium text-gray-900 dark:text-white truncate max-w-[150px] lg:max-w-[200px]">
              {plan.name || 'Unnamed Plan'}
            </div>
            {plan.template && (
              <div className="text-xs text-blue-600 dark:text-blue-400 truncate">
                Template: {plan.template.name || plan.template}
              </div>
            )}
          </div>
        </div>
      </td>
      
      {/* Category */}
      <td className="px-4 py-3 whitespace-nowrap">
        <span className={`text-sm ${themeClasses.text.primary}`}>
          {plan.category || 'N/A'}
        </span>
      </td>
      
      {/* Price */}
      <td className="px-4 py-3 whitespace-nowrap">
        <PriceBadge 
          price={plan.price} 
          currency="KES"
          theme={theme}
          size="sm"
        />
      </td>
      
      {/* Access Type */}
      <td className="px-4 py-3 whitespace-nowrap">
        <span className={`text-xs px-2 py-1 rounded-full ${accessTypeColors[accessType]}`}>
          {accessType.toUpperCase()}
        </span>
      </td>
      
      {/* Status */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex flex-col gap-1">
          <AvailabilityBadge
            status={isAvailable ? "available" : "unavailable"}
            theme={theme}
            size="xs"
          />
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            plan.active 
              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
              : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
          }`}>
            {plan.active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </td>
      
      {/* Purchases & Rating */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="font-medium">{plan.purchases || 0}</span>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon 
                key={i} 
                filled={i < Math.floor(rating)}
                className="w-3 h-3"
              />
            ))}
            <span className="ml-1 text-xs text-gray-500">
              {rating.toFixed(1)}
            </span>
          </div>
        </div>
      </td>
      
      {/* Actions */}
      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
        <div className="flex gap-1">
          <motion.button 
            onClick={() => onViewDetails(plan)} 
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="View Details"
          >
            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </motion.button>
          <motion.button 
            onClick={() => onEditPlan(plan)} 
            className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Edit Plan"
          >
            <Pencil className="w-4 h-4 text-blue-600 dark:text-blue-300" />
          </motion.button>
          <motion.button 
            onClick={() => onDuplicatePlan(plan)} 
            className="p-1.5 rounded hover:bg-green-100 dark:hover:bg-green-900"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Duplicate Plan"
          >
            <Plus className="w-4 h-4 text-green-600 dark:text-green-300" />
          </motion.button>
          <motion.button 
            onClick={() => onDeletePlan(plan)} 
            className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Delete Plan"
          >
            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-300" />
          </motion.button>
        </div>
      </td>
    </tr>
  );
};

const PlanList = ({ 
  plans, 
  isLoading, 
  onEditPlan, 
  onViewDetails, 
  onDeletePlan, 
  onDuplicatePlan,
  onToggleStatus,
  onNewPlan,
  onViewAnalytics,
  onViewTemplates,
  theme,
  isMobile,
  isTablet,
  isDesktop,
  searchQuery,
  onSearchChange,
  activeFilters,
  onApplyFilter,
  onClearFilters,
  sortConfig,
  onSort
}) => {
  const themeClasses = getThemeClasses(theme);
  const [expandedSections, setExpandedSections] = useState({
    hotspot: true,
    pppoe: true,
    dual: true
  });
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(activeFilters.category || '');
  const [selectedPlanType, setSelectedPlanType] = useState(activeFilters.planType || '');
  const [selectedAccessType, setSelectedAccessType] = useState(activeFilters.accessType || '');

  // Filter and sort plans
  const filteredPlans = useMemo(() => {
    let filtered = [...plans];
    
    // Apply category filter
    if (activeFilters.category && activeFilters.category !== 'all') {
      filtered = filtered.filter(plan => plan.category === activeFilters.category);
    }
    
    // Apply plan type filter
    if (activeFilters.planType && activeFilters.planType !== 'all') {
      filtered = filtered.filter(plan => plan.plan_type === activeFilters.planType);
    }
    
    // Apply access type filter
    if (activeFilters.accessType && activeFilters.accessType !== 'all') {
      filtered = filtered.filter(plan => {
        const enabledMethods = plan.enabled_access_methods || plan.get_enabled_access_methods?.() || [];
        if (activeFilters.accessType === 'both') {
          return enabledMethods.includes('hotspot') && enabledMethods.includes('pppoe');
        }
        return enabledMethods.includes(activeFilters.accessType);
      });
    }
    
    // Apply availability filter
    if (activeFilters.availability && activeFilters.availability !== 'all') {
      filtered = filtered.filter(plan => {
        const isAvailable = isPlanAvailableNow(plan);
        return isAvailable === (activeFilters.availability === 'available');
      });
    }
    
    // Apply price range filter
    if (activeFilters.priceRange) {
      filtered = filtered.filter(plan => {
        const price = parseFloat(plan.price) || 0;
        return price >= activeFilters.priceRange.min && price <= activeFilters.priceRange.max;
      });
    }
    
    // Apply time variant filter
    if (activeFilters.hasTimeVariant && activeFilters.hasTimeVariant !== 'all') {
      filtered = filtered.filter(plan => {
        const hasVariant = plan.time_variant?.is_active;
        return hasVariant === (activeFilters.hasTimeVariant === 'yes');
      });
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(plan => 
        plan.name?.toLowerCase().includes(query) ||
        plan.description?.toLowerCase().includes(query) ||
        plan.category?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.field];
      let bValue = b[sortConfig.field];
      
      switch (sortConfig.field) {
        case 'price':
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
          break;
        case 'created_at':
        case 'updated_at':
          aValue = new Date(aValue || 0).getTime();
          bValue = new Date(bValue || 0).getTime();
          break;
        case 'name':
        case 'description':
          aValue = (aValue || '').toLowerCase();
          bValue = (bValue || '').toLowerCase();
          break;
        case 'purchases':
          aValue = parseInt(aValue) || 0;
          bValue = parseInt(bValue) || 0;
          break;
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [plans, activeFilters, searchQuery, sortConfig]);

  // Separate plans by access type
  const { hotspotPlans, pppoePlans, dualPlans } = useMemo(() => {
    const hotspot = filteredPlans.filter(plan => {
      const methods = plan.enabled_access_methods || plan.get_enabled_access_methods?.() || [];
      return methods.includes('hotspot') && !methods.includes('pppoe');
    });
    const pppoe = filteredPlans.filter(plan => {
      const methods = plan.enabled_access_methods || plan.get_enabled_access_methods?.() || [];
      return methods.includes('pppoe') && !methods.includes('hotspot');
    });
    const dual = filteredPlans.filter(plan => {
      const methods = plan.enabled_access_methods || plan.get_enabled_access_methods?.() || [];
      return methods.includes('hotspot') && methods.includes('pppoe');
    });
    
    return { hotspotPlans: hotspot, pppoePlans: pppoe, dualPlans: dual };
  }, [filteredPlans]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: filteredPlans.length,
      active: filteredPlans.filter(p => p.active).length,
      available: filteredPlans.filter(p => isPlanAvailableNow(p)).length,
    };
  }, [filteredPlans]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'category':
        setSelectedCategory(value);
        break;
      case 'planType':
        setSelectedPlanType(value);
        break;
      case 'accessType':
        setSelectedAccessType(value);
        break;
    }
    
    if (onApplyFilter) {
      onApplyFilter(filterType, value || null);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedPlanType('');
    setSelectedAccessType('');
    setShowFilters(false);
    if (onClearFilters) {
      onClearFilters();
    }
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Toggle plan selection
  const togglePlanSelection = (planId) => {
    setSelectedPlans(prev => 
      prev.includes(planId) 
        ? prev.filter(id => id !== planId)
        : [...prev, planId]
    );
  };

  // Toggle all plans selection
  const toggleAllPlans = () => {
    if (selectedPlans.length === filteredPlans.length) {
      setSelectedPlans([]);
    } else {
      setSelectedPlans(filteredPlans.map(plan => plan.id));
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action) => {
    switch (action) {
      case 'activate':
        selectedPlans.forEach(id => {
          const plan = filteredPlans.find(p => p.id === id);
          if (plan && !plan.active) {
            onToggleStatus(plan);
          }
        });
        break;
      case 'deactivate':
        selectedPlans.forEach(id => {
          const plan = filteredPlans.find(p => p.id === id);
          if (plan && plan.active) {
            onToggleStatus(plan);
          }
        });
        break;
      case 'export':
        // Export selected plans logic here
        console.log('Exporting plans:', selectedPlans);
        break;
      case 'delete':
        selectedPlans.forEach(id => {
          const plan = filteredPlans.find(p => p.id === id);
          if (plan) {
            onDeletePlan(plan);
          }
        });
        setSelectedPlans([]);
        break;
    }
  };

  // Sort handler
  const handleSort = (field) => {
    if (onSort) {
      onSort(field);
    }
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      Residential: <Wifi className="w-4 h-4 text-blue-600" />,
      Business: <Shield className="w-4 h-4 text-green-600" />,
      Promotional: <Package className="w-4 h-4 text-purple-600" />,
      Enterprise: <Target className="w-4 h-4 text-indigo-600" />,
      Educational: <Users className="w-4 h-4 text-orange-600" />,
      Gaming: <Zap className="w-4 h-4 text-red-600" />
    };
    return icons[category] || <Box className="w-4 h-4 text-gray-600" />;
  };

  // Render star rating
  const renderStars = (purchases) => {
    const rating = calculateRating(purchases);
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <StarIcon 
            key={i} 
            filled={i < fullStars || (i === fullStars && hasHalfStar)}
          />
        ))}
        <span className={`ml-1 text-xs ${themeClasses.text.secondary}`}>
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  // Get active access method for a plan
  const getActiveAccessMethod = (plan) => {
    const enabledMethods = plan.enabled_access_methods || plan.get_enabled_access_methods?.() || [];
    const accessMethods = plan.accessMethods || plan.access_methods || {};
    
    if (enabledMethods.includes('hotspot') && enabledMethods.includes('pppoe')) {
      return { type: 'dual', config: accessMethods };
    }
    if (enabledMethods.includes('hotspot')) {
      return { type: 'hotspot', config: accessMethods.hotspot };
    }
    if (enabledMethods.includes('pppoe')) {
      return { type: 'pppoe', config: accessMethods.pppoe };
    }
    return { type: 'none', config: null };
  };

  // Render plan section
  const renderPlanSection = (type, plans, title, icon, color) => {
    if (plans.length === 0) return null;

    const isExpanded = expandedSections[type];
    const IconComponent = icon;

    return (
      <div className={`mb-6 rounded-2xl overflow-hidden border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
        {/* Section Header */}
        <div 
          className={`p-4 sm:p-5 cursor-pointer transition-colors duration-200 ${
            color === 'blue' 
              ? 'bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800' 
              : color === 'green'
              ? 'bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-800'
              : 'bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-800'
          }`}
          onClick={() => toggleSection(type)}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className={`p-2 sm:p-3 rounded-xl ${
                color === 'blue' 
                  ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400' 
                  : color === 'green'
                  ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400'
                  : 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400'
              }`}>
                <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className={`text-lg sm:text-xl font-bold ${
                  color === 'blue' ? 'text-blue-900 dark:text-blue-100' 
                  : color === 'green' ? 'text-green-900 dark:text-green-100'
                  : 'text-purple-900 dark:text-purple-100'
                }`}>
                  {title} Plans
                </h3>
                <p className={`text-sm ${
                  color === 'blue' ? 'text-blue-700 dark:text-blue-300' 
                  : color === 'green' ? 'text-green-700 dark:text-green-300'
                  : 'text-purple-700 dark:text-purple-300'
                }`}>
                  {plans.length} plan{plans.length !== 1 ? 's' : ''} • {
                    plans.reduce((sum, plan) => sum + (plan.purchases || 0), 0)
                  } total purchases
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 self-end sm:self-auto">
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                color === 'blue' 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200' 
                  : color === 'green'
                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                  : 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200'
              }`}>
                {type.toUpperCase()}
              </span>
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {/* Plans Table */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y text-sm">
                  <thead className={theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}>
                    <tr>
                      <th className="px-3 py-3 sm:px-4 sm:py-3 text-left">
                        <input
                          type="checkbox"
                          checked={plans.every(p => selectedPlans.includes(p.id))}
                          onChange={() => {
                            const allSelected = plans.every(p => selectedPlans.includes(p.id));
                            if (allSelected) {
                              setSelectedPlans(prev => prev.filter(id => !plans.some(p => p.id === id)));
                            } else {
                              setSelectedPlans(prev => [...prev, ...plans.map(p => p.id)]);
                            }
                          }}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </th>
                      <th className={`px-3 py-3 sm:px-4 sm:py-3 text-left font-medium ${themeClasses.text.secondary} cursor-pointer`}
                          onClick={() => onSort('name')}>
                        Plan Name {sortConfig.field === 'name' && (
                          <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th className={`px-3 py-3 sm:px-4 sm:py-3 text-left font-medium ${themeClasses.text.secondary}`}>
                        Category
                      </th>
                      <th className={`px-3 py-3 sm:px-4 sm:py-3 text-left font-medium ${themeClasses.text.secondary} cursor-pointer`}
                          onClick={() => onSort('price')}>
                        Price {sortConfig.field === 'price' && (
                          <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th className={`px-3 py-3 sm:px-4 sm:py-3 text-left font-medium ${themeClasses.text.secondary}`}>
                        Configuration
                      </th>
                      <th className={`px-3 py-3 sm:px-4 sm:py-3 text-left font-medium ${themeClasses.text.secondary}`}>
                        Status
                      </th>
                      <th className={`px-3 py-3 sm:px-4 sm:py-3 text-left font-medium ${themeClasses.text.secondary}`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {plans.map((plan) => {
                      const activeMethod = getActiveAccessMethod(plan);
                      const isAvailable = isPlanAvailableNow(plan);
                      
                      return (
                        <tr key={plan.id} className={`hover:${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <td className="px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedPlans.includes(plan.id)}
                              onChange={() => togglePlanSelection(plan.id)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getCategoryIcon(plan.category)}
                              <div className="ml-2 sm:ml-3">
                                <div className="flex items-center">
                                  <span className={`font-medium truncate max-w-[120px] sm:max-w-[180px] ${themeClasses.text.primary}`}>
                                    {plan.name || 'Unnamed Plan'}
                                  </span>
                                  {plan.template && (
                                    <Box className="w-3 h-3 text-blue-600 ml-1 sm:ml-2" title="Created from template" />
                                  )}
                                </div>
                                <div className="flex items-center mt-1">
                                  {renderStars(plan.purchases || 0)}
                                  <span className="text-xs text-gray-500 ml-2">
                                    {plan.purchases || 0} purchases
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className={`px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap ${themeClasses.text.secondary}`}>
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700">
                              {plan.category || 'N/A'}
                            </span>
                          </td>
                          <td className={`px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap ${themeClasses.text.secondary}`}>
                            <div className="flex flex-col gap-1">
                              <PriceBadge 
                                price={plan.price} 
                                currency="KES"
                                theme={theme}
                                size="sm"
                              />
                              <PlanTypeBadge 
                                type={plan.plan_type || 'paid'} 
                                theme={theme}
                                size="xs"
                              />
                            </div>
                          </td>
                          <td className={`px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap ${themeClasses.text.secondary}`}>
                            {activeMethod.config && (
                              <div className="space-y-1">
                                <div className="text-xs flex items-center">
                                  {activeMethod.type === 'dual' ? (
                                    <span className="flex items-center gap-1">
                                      <Wifi className="w-3 h-3 text-blue-500" />
                                      <Cable className="w-3 h-3 text-green-500" />
                                    </span>
                                  ) : activeMethod.type === 'hotspot' ? (
                                    <span className="flex items-center gap-1">
                                      <Wifi className="w-3 h-3 text-blue-500" />
                                      <span>Hotspot</span>
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1">
                                      <Cable className="w-3 h-3 text-green-500" />
                                      <span>PPPoE</span>
                                    </span>
                                  )}
                                </div>
                                {activeMethod.type === 'hotspot' && activeMethod.config.downloadSpeed && (
                                  <div className="text-xs text-gray-500">
                                    {activeMethod.config.downloadSpeed.value || '10'} Mbps
                                  </div>
                                )}
                                {activeMethod.type === 'pppoe' && activeMethod.config.downloadSpeed && (
                                  <div className="text-xs text-gray-500">
                                    {activeMethod.config.downloadSpeed.value || '10'} Mbps
                                  </div>
                                )}
                                {activeMethod.type === 'dual' && (
                                  <div className="text-xs text-gray-500">
                                    Both access methods
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <AvailabilityBadge
                                status={isAvailable ? "available" : "unavailable"}
                                theme={theme}
                                size="xs"
                              />
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                plan.active 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                  : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                              }`}>
                                {plan.active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                              <motion.button 
                                onClick={() => onViewDetails(plan)} 
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                whileHover={{ scale: 1.1 }} 
                                whileTap={{ scale: 0.9 }}
                                title="View Details"
                              >
                                <Eye className="w-4 h-4 text-indigo-600" />
                              </motion.button>
                              <motion.button 
                                onClick={() => onEditPlan(plan)} 
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                whileHover={{ scale: 1.1 }} 
                                whileTap={{ scale: 0.9 }}
                                title="Edit Plan"
                              >
                                <Pencil className="w-4 h-4 text-green-600" />
                              </motion.button>
                              <motion.button 
                                onClick={() => onDuplicatePlan(plan)} 
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                whileHover={{ scale: 1.1 }} 
                                whileTap={{ scale: 0.9 }}
                                title="Duplicate Plan"
                              >
                                <Plus className="w-4 h-4 text-blue-600" />
                              </motion.button>
                              <motion.button 
                                onClick={() => onToggleStatus(plan)} 
                                className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                  plan.active ? 'text-red-600' : 'text-green-600'
                                }`}
                                whileHover={{ scale: 1.1 }} 
                                whileTap={{ scale: 0.9 }}
                                title={plan.active ? "Deactivate Plan" : "Activate Plan"}
                              >
                                {plan.active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                              </motion.button>
                              <motion.button 
                                onClick={() => onDeletePlan(plan)} 
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                whileHover={{ scale: 1.1 }} 
                                whileTap={{ scale: 0.9 }}
                                title="Delete Plan"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </motion.button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Filter UI Component
  const FilterSectionComponent = () => (
    <div className={`p-4 sm:p-6 rounded-xl shadow-lg ${themeClasses.bg.card}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Filter className="w-5 h-5 mr-2 text-indigo-600" />
          Filters
        </h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {showFilters ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  Category
                </label>
                <EnhancedSelect
                  value={selectedCategory}
                  onChange={(value) => handleFilterChange('category', value)}
                  options={[
                    { value: '', label: "All Categories" },
                    ...categories.map(cat => ({ value: cat, label: cat }))
                  ]}
                  theme={theme}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  Plan Type
                </label>
                <EnhancedSelect
                  value={selectedPlanType}
                  onChange={(value) => handleFilterChange('planType', value)}
                  options={[
                    { value: '', label: "All Plan Types" },
                    ...planTypes.map(type => ({ value: type, label: type }))
                  ]}
                  theme={theme}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  Access Type
                </label>
                <EnhancedSelect
                  value={selectedAccessType}
                  onChange={(value) => handleFilterChange('accessType', value)}
                  options={[
                    { value: '', label: "All Access Types" },
                    { value: 'hotspot', label: "Hotspot Only" },
                    { value: 'pppoe', label: "PPPoE Only" },
                    { value: 'both', label: "Dual Access" }
                  ]}
                  theme={theme}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  Availability
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => onApplyFilter('availability', true)}
                    className={`px-3 py-2 rounded text-sm flex-1 ${
                      activeFilters.availability === true
                        ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Available
                  </button>
                  <button
                    onClick={() => onApplyFilter('availability', false)}
                    className={`px-3 py-2 rounded text-sm flex-1 ${
                      activeFilters.availability === false
                        ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <XCircle className="w-4 h-4 inline mr-1" />
                    Unavailable
                  </button>
                </div>
              </div>
            </div>

            {(selectedCategory || selectedPlanType || selectedAccessType || activeFilters.availability !== null) && (
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-500">
                  {filteredPlans.length} of {plans.length} plans match filters
                </span>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 text-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700 rounded-lg"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Main render
  if (isMobile || isTablet) {
    return (
      <div className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${themeClasses.bg.primary}`}>
        <main className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                Internet Plans Management
              </h1>
              <p className={`mt-1 text-sm sm:text-base ${themeClasses.text.secondary}`}>
                Create, manage, and analyze your internet service plans
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 sm:gap-3 w-full md:w-auto">
              <motion.button
                onClick={onViewAnalytics}
                className={`px-3 py-2 rounded-lg shadow-md flex items-center justify-center text-sm ${themeClasses.button.primary}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </motion.button>
              
              <motion.button
                onClick={onViewTemplates}
                className={`px-3 py-2 rounded-lg shadow-md flex items-center justify-center text-sm ${themeClasses.button.primary}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Box className="w-4 h-4 mr-2" />
                Templates
              </motion.button>
              
              <motion.button
                onClick={onNewPlan}
                className={`px-4 py-2 rounded-lg shadow-md flex items-center justify-center text-sm ${themeClasses.button.success}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Plan
              </motion.button>
            </div>
          </div>

          {/* Search */}
          <div className={`p-4 sm:p-6 rounded-xl shadow-lg ${themeClasses.bg.card}`}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${themeClasses.text.tertiary}`} />
                  <input
                    type="text"
                    placeholder="Search plans by name, category, or description..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2.5 rounded-lg text-sm flex items-center ${
                    showFilters 
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-200'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                  }`}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </button>
                <button
                  onClick={() => handleSort('purchases')}
                  className={`px-4 py-2.5 rounded-lg text-sm flex items-center ${
                    sortConfig.field === 'purchases'
                      ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Top Plans
                </button>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <FilterSectionComponent />

          {/* Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className={`p-4 rounded-xl text-center ${themeClasses.bg.card}`}>
              <div className="text-2xl sm:text-3xl font-bold text-indigo-600">{stats.total}</div>
              <div className="text-sm text-gray-500 mt-1">Total Plans</div>
            </div>
            <div className={`p-4 rounded-xl text-center ${themeClasses.bg.card}`}>
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-500 mt-1">Active</div>
            </div>
            <div className={`p-4 rounded-xl text-center ${themeClasses.bg.card}`}>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.available}</div>
              <div className="text-sm text-gray-500 mt-1">Available Now</div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className={`flex justify-center items-center py-12 rounded-xl ${themeClasses.bg.card}`}>
              <FaSpinner className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className={`rounded-xl shadow-lg p-6 text-center ${themeClasses.bg.card}`}>
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">No Plans Found</h3>
              <p className={`mb-4 ${themeClasses.text.secondary}`}>
                {searchQuery || Object.values(activeFilters).some(v => v !== null && v !== '') 
                  ? "Try adjusting your search or filters" 
                  : "Create your first internet plan to get started!"
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <motion.button
                  onClick={onNewPlan}
                  className={`px-4 py-2 rounded-lg shadow-md ${themeClasses.button.primary}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Plan
                </motion.button>
                {(searchQuery || Object.values(activeFilters).some(v => v !== null && v !== '')) && (
                  <motion.button
                    onClick={handleClearFilters}
                    className={`px-4 py-2 rounded-lg shadow-md ${themeClasses.button.secondary}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Clear All Filters
                  </motion.button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Mobile View - Card Layout */}
              <div className="space-y-3">
                {filteredPlans.map(plan => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    theme={theme}
                    onViewDetails={onViewDetails}
                    onEditPlan={onEditPlan}
                    onDeletePlan={onDeletePlan}
                    onDuplicatePlan={onDuplicatePlan}
                    onToggleStatus={onToggleStatus}
                  />
                ))}
              </div>

              {/* Pagination/Info */}
              <div className={`p-4 rounded-xl ${themeClasses.bg.card} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                <div className="text-sm text-gray-500">
                  Showing {filteredPlans.length} of {plans.length} plans
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Sorted by:</span>
                  <span className="font-medium capitalize">
                    {sortConfig.field === 'name' ? 'Name' : 
                     sortConfig.field === 'price' ? 'Price' : 
                     sortConfig.field === 'purchases' ? 'Purchases' : 'Name'}
                  </span>
                  <button
                    onClick={() => handleSort(sortConfig.field)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <ChevronUp className={`w-4 h-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    );
  }

  // Desktop view with sections
  return (
    <div className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${themeClasses.bg.primary}`}>
      <main className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
              Internet Plans Management
            </h1>
            <p className={`mt-1 text-sm sm:text-base ${themeClasses.text.secondary}`}>
              Create, manage, and analyze your internet service plans
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 sm:gap-3 w-full md:w-auto">
            <motion.button
              onClick={onViewAnalytics}
              className={`px-3 py-2 rounded-lg shadow-md flex items-center justify-center text-sm ${themeClasses.button.primary}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </motion.button>
            
            <motion.button
              onClick={onViewTemplates}
              className={`px-3 py-2 rounded-lg shadow-md flex items-center justify-center text-sm ${themeClasses.button.primary}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Box className="w-4 h-4 mr-2" />
              Templates
            </motion.button>
            
            <motion.button
              onClick={onNewPlan}
              className={`px-4 py-2 rounded-lg shadow-md flex items-center justify-center text-sm ${themeClasses.button.success}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Plan
            </motion.button>
          </div>
        </div>

        {/* Search and Quick Filters */}
        <div className={`p-4 sm:p-5 rounded-xl shadow-lg ${themeClasses.bg.card} ${themeClasses.border.light}`}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Search */}
              <div className="w-full lg:w-96">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${themeClasses.text.tertiary}`} />
                  <input
                    type="text" 
                    placeholder="Search plans by name, category, or description..." 
                    value={searchQuery} 
                    onChange={(e) => onSearchChange(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => onSearchChange("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              
              {/* Filters Row */}
              <div className="flex flex-wrap gap-3">
                {/* Category Filter */}
                <div className="w-full sm:w-48">
                  <EnhancedSelect
                    value={activeFilters.category || 'all'}
                    onChange={(value) => onApplyFilter('category', value === 'all' ? null : value)}
                    options={[
                      { value: 'all', label: "All Categories" },
                      ...categories.map(cat => ({ value: cat, label: cat }))
                    ]}
                    theme={theme}
                    isSearchable={true}
                  />
                </div>
                
                {/* Plan Type Filter */}
                <div className="w-full sm:w-48">
                  <EnhancedSelect
                    value={activeFilters.planType || 'all'}
                    onChange={(value) => onApplyFilter('planType', value === 'all' ? null : value)}
                    options={[
                      { value: 'all', label: "All Plan Types" },
                      ...planTypes.map(type => ({ value: type, label: type }))
                    ]}
                    theme={theme}
                    isSearchable={true}
                  />
                </div>
                
                {/* Access Type Filter */}
                <div className="w-full sm:w-48">
                  <EnhancedSelect
                    value={activeFilters.accessType || 'all'}
                    onChange={(value) => onApplyFilter('accessType', value === 'all' ? null : value)}
                    options={[
                      { value: 'all', label: "All Access Types" },
                      { value: 'hotspot', label: "Hotspot Only" },
                      { value: 'pppoe', label: "PPPoE Only" },
                      { value: 'both', label: "Dual Access" }
                    ]}
                    theme={theme}
                    isSearchable={true}
                  />
                </div>
              </div>
            </div>
            
            {/* Quick Filter Buttons */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Quick Filters:</span>
              
              <div className="flex flex-wrap gap-2">
                {/* Availability Filter */}
                <button
                  onClick={() => onApplyFilter('availability', activeFilters.availability === 'available' ? null : 'available')}
                  className={`px-3 py-2 rounded-lg text-xs flex items-center gap-1 ${
                    activeFilters.availability === 'available'
                      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 border border-green-300 dark:border-green-700"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  Available
                </button>
                
                <button
                  onClick={() => onApplyFilter('availability', activeFilters.availability === 'unavailable' ? null : 'unavailable')}
                  className={`px-3 py-2 rounded-lg text-xs flex items-center gap-1 ${
                    activeFilters.availability === 'unavailable'
                      ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100 border border-red-300 dark:border-red-700"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <XCircle className="w-3 h-3" />
                  Unavailable
                </button>
                
                {/* Time Variant Filter */}
                <button
                  onClick={() => onApplyFilter('hasTimeVariant', activeFilters.hasTimeVariant === 'yes' ? null : 'yes')}
                  className={`px-3 py-2 rounded-lg text-xs flex items-center gap-1 ${
                    activeFilters.hasTimeVariant === 'yes'
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 border border-blue-300 dark:border-blue-700"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  Time Restricted
                </button>
                
                {/* Active Plans Filter */}
                <button
                  onClick={() => onApplyFilter('active', activeFilters.active === true ? null : true)}
                  className={`px-3 py-2 rounded-lg text-xs flex items-center gap-1 ${
                    activeFilters.active === true
                      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 border border-green-300 dark:border-green-700"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  Active Only
                </button>
                
                {/* Free Trial Filter */}
                <button
                  onClick={() => onApplyFilter('planType', activeFilters.planType === 'free_trial' ? null : 'free_trial')}
                  className={`px-3 py-2 rounded-lg text-xs flex items-center gap-1 ${
                    activeFilters.planType === 'free_trial'
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100 border border-purple-300 dark:border-purple-700"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <Package className="w-3 h-3" />
                  Free Trials
                </button>
              </div>
              
              {/* Clear Filters Button */}
              {(searchQuery || activeFilters.category || activeFilters.planType || 
                activeFilters.accessType || activeFilters.availability || 
                activeFilters.hasTimeVariant || activeFilters.active) && (
                <button
                  onClick={onClearFilters}
                  className="ml-auto px-3 py-2 text-xs bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700 rounded-lg flex items-center gap-1"
                >
                  <Filter className="w-3 h-3" />
                  Clear Filters
                </button>
              )}
            </div>
            
            {/* Selected Plans Actions */}
            {selectedPlans.length > 0 && (
              <div className={`p-3 rounded-lg border ${themeClasses.border.light} ${
                theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      {selectedPlans.length} plan{selectedPlans.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleBulkAction('activate')}
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-800 dark:text-green-200 dark:hover:bg-green-700 rounded"
                    >
                      Activate
                    </button>
                    <button
                      onClick={() => handleBulkAction('deactivate')}
                      className="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700 rounded"
                    >
                      Deactivate
                    </button>
                    <button
                      onClick={() => handleBulkAction('export')}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 rounded flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Export
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700 rounded flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                    <button
                      onClick={() => setSelectedPlans([])}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className={`p-4 rounded-xl text-center ${themeClasses.bg.card}`}>
            <div className="text-2xl sm:text-3xl font-bold text-indigo-600">{stats.total}</div>
            <div className="text-sm text-gray-500 mt-1">Total Plans</div>
          </div>
          <div className={`p-4 rounded-xl text-center ${themeClasses.bg.card}`}>
            <div className="text-2xl sm:text-3xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-500 mt-1">Active</div>
          </div>
          <div className={`p-4 rounded-xl text-center ${themeClasses.bg.card}`}>
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.available}</div>
            <div className="text-sm text-gray-500 mt-1">Available Now</div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className={`flex justify-center items-center py-12 rounded-xl ${themeClasses.bg.card}`}>
            <FaSpinner className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className={`rounded-xl shadow-lg p-6 text-center ${themeClasses.bg.card}`}>
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">No Plans Found</h3>
            <p className={`mb-4 ${themeClasses.text.secondary}`}>
              {searchQuery || Object.values(activeFilters).some(v => v !== null && v !== '') 
                ? "Try adjusting your search or filters" 
                : "Create your first internet plan to get started!"
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button
                onClick={onNewPlan}
                className={`px-4 py-2 rounded-lg shadow-md ${themeClasses.button.primary}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Plan
              </motion.button>
              {(searchQuery || Object.values(activeFilters).some(v => v !== null && v !== '')) && (
                <motion.button
                  onClick={onClearFilters}
                  className={`px-4 py-2 rounded-lg shadow-md ${themeClasses.button.secondary}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear All Filters
                </motion.button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Desktop View - Section Layout */}
            {renderPlanSection('hotspot', hotspotPlans, 'Hotspot', Wifi, 'blue')}
            {renderPlanSection('pppoe', pppoePlans, 'PPPoE', Cable, 'green')}
            {renderPlanSection('dual', dualPlans, 'Dual Access', Shield, 'purple')}

            {/* Pagination/Info */}
            <div className={`p-4 rounded-xl ${themeClasses.bg.card} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
              <div className="text-sm text-gray-500">
                Showing {filteredPlans.length} of {plans.length} plans
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Sorted by:</span>
                <span className="font-medium capitalize">
                  {sortConfig.field === 'name' ? 'Name' : 
                   sortConfig.field === 'price' ? 'Price' : 
                   sortConfig.field === 'purchases' ? 'Purchases' : 'Name'}
                </span>
                <button
                  onClick={() => handleSort(sortConfig.field)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <ChevronUp className={`w-4 h-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default PlanList;