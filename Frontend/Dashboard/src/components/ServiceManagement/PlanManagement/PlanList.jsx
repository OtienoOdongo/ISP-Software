



// import React, { useState, useMemo } from "react";
// import { motion } from "framer-motion";
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

//             {/* Filters */}
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
//                   theme={theme}
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





import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Pencil, Trash2, Eye, Users, Search, 
  Wifi, Cable, BarChart3, Package, Box, Filter,
  ChevronDown, ChevronUp
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { EnhancedSelect, getThemeClasses } from "../Shared/components"
import { formatNumber, formatBandwidth, calculateRating } from "../Shared/utils"
import { categories } from "../Shared/constant"

// Star component
const Star = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const PlanList = ({ 
  plans, 
  isLoading, 
  onEditPlan, 
  onViewDetails, 
  onDeletePlan, 
  onNewPlan,
  onViewAnalytics,
  onViewTemplates,
  theme 
}) => {
  const themeClasses = getThemeClasses(theme);
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("all"); // "all", "hotspot", "pppoe"
  const [expandedSections, setExpandedSections] = useState({
    hotspot: true,
    pppoe: true
  });

  // Separate plans by type
  const { hotspotPlans, pppoePlans } = useMemo(() => {
    const hotspot = plans.filter(plan => plan.accessType === 'hotspot');
    const pppoe = plans.filter(plan => plan.accessType === 'pppoe');
    return { hotspotPlans: hotspot, pppoePlans: pppoe };
  }, [plans]);

  // Filter plans based on view mode and search
  const filteredHotspotPlans = useMemo(() => {
    return hotspotPlans.filter(plan => 
      (filterCategory === "All" || plan.category === filterCategory) &&
      (plan.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       plan.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [hotspotPlans, filterCategory, searchTerm]);

  const filteredPppoePlans = useMemo(() => {
    return pppoePlans.filter(plan => 
      (filterCategory === "All" || plan.category === filterCategory) &&
      (plan.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       plan.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [pppoePlans, filterCategory, searchTerm]);

  const getCategoryIcon = (category) => {
    const icons = {
      Residential: <Wifi className="w-4 h-4 text-teal-600" />,
      Business: <Cable className="w-4 h-4 text-emerald-600" />,
      Promotional: <Package className="w-4 h-4 text-purple-600" />,
      Enterprise: <BarChart3 className="w-4 h-4 text-indigo-600" />,
    };
    return icons[category] || null;
  };

  const renderStars = (purchases) => {
    const rating = calculateRating(purchases);
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-3 h-3 lg:w-4 lg:h-4 ${i < Math.round(rating) 
              ? "text-amber-400 fill-current" 
              : theme === 'dark' ? "text-gray-600" : "text-gray-300"}`} 
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
    const accessMethods = plan.accessMethods || {};
    if (accessMethods.hotspot?.enabled) return { type: 'hotspot', config: accessMethods.hotspot };
    if (accessMethods.pppoe?.enabled) return { type: 'pppoe', config: accessMethods.pppoe };
    return { type: 'none', config: null };
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderPlanSection = (type, plans, title, icon, color) => {
    if (viewMode !== "all" && viewMode !== type) return null;
    if (plans.length === 0 && viewMode === "all") return null;

    const isExpanded = expandedSections[type];
    const IconComponent = icon;

    return (
      <div className={`mb-6 rounded-2xl overflow-hidden border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
        {/* Section Header */}
        <div 
          className={`p-6 cursor-pointer transition-colors duration-200 ${
            color === 'blue' 
              ? 'bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800' 
              : 'bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800'
          }`}
          onClick={() => toggleSection(type)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${
                color === 'blue' 
                  ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400' 
                  : 'bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-400'
              }`}>
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${
                  color === 'blue' ? 'text-blue-900 dark:text-blue-100' : 'text-emerald-900 dark:text-emerald-100'
                }`}>
                  {title} Plans
                </h3>
                <p className={`text-sm ${
                  color === 'blue' ? 'text-blue-700 dark:text-blue-300' : 'text-emerald-700 dark:text-emerald-300'
                }`}>
                  {plans.length} plan{plans.length !== 1 ? 's' : ''} • {
                    plans.reduce((sum, plan) => sum + (plan.purchases || 0), 0)
                  } total subscribers
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                color === 'blue' 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200' 
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200'
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
              {plans.length === 0 ? (
                <div className="p-8 text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    No {title} Plans Found
                  </h4>
                  <p className="text-gray-500 dark:text-gray-500 mb-4">
                    {searchTerm || filterCategory !== "All" 
                      ? "Try adjusting your search or filters" 
                      : `Get started by creating your first ${title} plan`
                    }
                  </p>
                  {!searchTerm && filterCategory === "All" && (
                    <motion.button
                      onClick={() => onNewPlan(type)}
                      className={`px-4 py-2 rounded-lg text-sm ${
                        color === 'blue' 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-4 h-4 mr-2 inline" />
                      Create {title} Plan
                    </motion.button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y text-sm">
                    <thead className={theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}>
                      <tr>
                        {["Plan Name", "Category", "Price", "Configuration", "Subscribers", "Status", "Actions"].map((header) => (
                          <th key={header} className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClasses.text.secondary}`}>
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {plans.map((plan) => {
                        const activeMethod = getActiveAccessMethod(plan);
                        
                        return (
                          <tr key={plan.id} className={`hover:${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getCategoryIcon(plan.category)}
                                <div className="ml-3">
                                  <div className="flex items-center">
                                    <span className={`text-sm font-medium truncate max-w-[120px] lg:max-w-none ${themeClasses.text.primary}`}>
                                      {plan.name || 'Unnamed Plan'}
                                    </span>
                                    {plan.template && (
                                      <Box className="w-3 h-3 text-blue-600 ml-2" title="Created from template" />
                                    )}
                                  </div>
                                  {plan.template && (
                                    <span className="text-xs text-blue-600 dark:text-blue-400">
                                      From: {plan.template.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className={`px-4 py-4 whitespace-nowrap text-sm ${themeClasses.text.secondary}`}>
                              {plan.category || 'N/A'}
                            </td>
                            <td className={`px-4 py-4 whitespace-nowrap text-sm ${themeClasses.text.secondary}`}>
                              {plan.planType === "Paid" ? `Ksh ${formatNumber(plan.price || 0)}` : "Free"}
                            </td>
                            <td className={`px-4 py-4 whitespace-nowrap text-sm ${themeClasses.text.secondary}`}>
                              {activeMethod.config && (
                                <div className="space-y-1">
                                  <div className="text-xs">
                                    {activeMethod.config.downloadSpeed?.value} {activeMethod.config.downloadSpeed?.unit} ↓ / {activeMethod.config.uploadSpeed?.value} {activeMethod.config.uploadSpeed?.unit} ↑
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {activeMethod.config.dataLimit?.value} {activeMethod.config.dataLimit?.unit} • {activeMethod.config.maxDevices === 0 ? 'Unlimited' : activeMethod.config.maxDevices} devices
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Users className={`w-3 h-3 lg:w-4 lg:h-4 mr-2 ${themeClasses.text.tertiary}`} />
                                <span className={`text-sm mr-3 ${themeClasses.text.secondary}`}>
                                  {plan.purchases || 0}
                                </span>
                                {renderStars(plan.purchases || 0)}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                plan.active 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                  : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                              }`}>
                                {plan.active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <motion.button 
                                  onClick={() => onViewDetails(plan)} 
                                  className="focus:outline-none p-1" 
                                  whileHover={{ scale: 1.2 }} 
                                  transition={{ type: "spring", stiffness: 300 }}
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4 text-indigo-600 hover:text-indigo-800" />
                                </motion.button>
                                <motion.button 
                                  onClick={() => onEditPlan(plan)} 
                                  className="focus:outline-none p-1" 
                                  whileHover={{ rotate: 90 }} 
                                  transition={{ type: "spring", stiffness: 300 }}
                                  title="Edit Plan"
                                >
                                  <Pencil className="w-4 h-4 text-emerald-600 hover:text-emerald-800" />
                                </motion.button>
                                <motion.button 
                                  onClick={() => onDeletePlan(plan)} 
                                  className="focus:outline-none p-1" 
                                  whileHover={{ x: [0, -2, 2, -2, 0] }} 
                                  transition={{ duration: 0.3 }}
                                  title="Delete Plan"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600 hover:text-red-800" />
                                </motion.button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${themeClasses.bg.primary}`}>
      <main className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 lg:gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 truncate">
              Internet Plans Management
            </h1>
            <p className={`mt-1 lg:mt-2 text-sm lg:text-lg ${themeClasses.text.secondary}`}>
              Create and manage your internet service plans
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 lg:gap-3 w-full md:w-auto justify-start md:justify-end">
            <motion.button
              onClick={onViewAnalytics}
              className={`px-3 py-2 lg:px-4 lg:py-2 rounded-lg shadow-md flex items-center justify-center text-xs lg:text-sm ${themeClasses.button.primary}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BarChart3 className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              <span>Analytics</span>
            </motion.button>
            
            <motion.button
              onClick={onViewTemplates}
              className={`px-3 py-2 lg:px-4 lg:py-2 rounded-lg shadow-md flex items-center justify-center text-xs lg:text-sm ${themeClasses.button.primary}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Box className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              <span>Templates</span>
            </motion.button>
            
            {/* Unified Create New Plan Button */}
            <motion.button
              onClick={onNewPlan}
              className={`px-4 py-2 lg:px-6 lg:py-3 rounded-lg shadow-md flex items-center justify-center text-sm lg:text-base ${themeClasses.button.success}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
              <span>Create New Plan</span>
            </motion.button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className={`p-4 lg:p-6 rounded-xl shadow-lg ${themeClasses.bg.card}`}>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setViewMode("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === "all" 
                    ? "bg-indigo-600 text-white" 
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                All Plans ({plans.length})
              </button>
              <button
                onClick={() => setViewMode("hotspot")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === "hotspot" 
                    ? "bg-blue-600 text-white" 
                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/40"
                }`}
              >
                <Wifi className="w-4 h-4 inline mr-2" />
                Hotspot ({hotspotPlans.length})
              </button>
              <button
                onClick={() => setViewMode("pppoe")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === "pppoe" 
                    ? "bg-emerald-600 text-white" 
                    : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800/40"
                }`}
              >
                <Cable className="w-4 h-4 inline mr-2" />
                PPPoE ({pppoePlans.length})
              </button>
            </div>

            {/* Filters - FIXED CATEGORY FILTER */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1 sm:justify-end">
              <div className="w-full sm:w-40 lg:w-48">
                <EnhancedSelect
                  value={filterCategory}
                  onChange={setFilterCategory}
                  options={[
                    { value: "All", label: "All Categories" },
                    ...categories.map(cat => ({ value: cat, label: cat }))
                  ]}
                  className="w-full"
                  theme={theme} // FIX: Added theme prop
                />
              </div>
              
              <div className="relative w-full sm:w-64">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.text.tertiary}`} />
                  <input
                    type="text" 
                    placeholder="Search plans..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className={`flex justify-center items-center py-12 rounded-xl ${themeClasses.bg.card}`}>
            <FaSpinner className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : plans.length === 0 ? (
          <div className={`rounded-xl shadow-lg p-6 lg:p-8 text-center ${themeClasses.bg.card}`}>
            <Package className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-3 lg:mb-4" />
            <h3 className="text-lg lg:text-xl font-semibold mb-2">No Plans Available</h3>
            <p className={`mb-4 lg:mb-6 text-sm lg:text-base ${themeClasses.text.secondary}`}>
              Create your first internet plan to get started!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button
                onClick={onNewPlan}
                className={`px-4 py-2 lg:px-6 lg:py-3 rounded-lg shadow-md text-sm lg:text-base ${themeClasses.button.primary}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2" />
                Create Your First Plan
              </motion.button>
              <motion.button
                onClick={onViewTemplates}
                className={`px-4 py-2 lg:px-6 lg:py-3 rounded-lg shadow-md text-sm lg:text-base ${themeClasses.button.secondary}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Box className="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2" />
                Browse Templates
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Hotspot Plans Section */}
            {renderPlanSection("hotspot", filteredHotspotPlans, "Hotspot", Wifi, "blue")}
            
            {/* PPPoE Plans Section */}
            {renderPlanSection("pppoe", filteredPppoePlans, "PPPoE", Cable, "emerald")}

            {/* Empty State for Filtered Results */}
            {viewMode === "all" && filteredHotspotPlans.length === 0 && filteredPppoePlans.length === 0 && (
              <div className={`rounded-xl shadow-lg p-8 text-center ${themeClasses.bg.card}`}>
                <Filter className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">No Plans Match Your Criteria</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Try adjusting your search terms or filters
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterCategory("All");
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default PlanList;