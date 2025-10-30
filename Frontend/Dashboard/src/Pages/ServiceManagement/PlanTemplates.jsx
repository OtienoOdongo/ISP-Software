// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import { X, Zap, Check, ArrowLeft, Wifi, Cable, Users, Clock } from "lucide-react";
// import { templateTypes } from "../../components/ServiceManagement/Shared/constant"
// import { getThemeClasses } from "../../components/ServiceManagement/Shared/components"

// const PlanTemplates = ({ onApplyTemplate, onBack, theme }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [selectedTemplate, setSelectedTemplate] = useState(null);

//   const TemplateCard = ({ template }) => (
//     <motion.div
//       whileHover={{ scale: 1.02 }}
//       whileTap={{ scale: 0.98 }}
//       className={`p-6 rounded-xl shadow-lg border cursor-pointer transition-all ${
//         themeClasses.bg.card
//       } ${themeClasses.border.light} hover:border-indigo-500`}
//       onClick={() => setSelectedTemplate(template)}
//     >
//       <div className="flex items-start justify-between mb-4">
//         <div>
//           <h3 className="text-lg font-semibold text-indigo-600 mb-1">
//             {template.name}
//           </h3>
//           <p className={`text-sm ${themeClasses.text.secondary} mb-3`}>
//             {template.description}
//           </p>
//         </div>
//         <div className={`px-3 py-1 rounded-full text-xs font-medium ${
//           template.category === "Business" ? "bg-blue-100 text-blue-800" :
//           template.category === "Residential" ? "bg-green-100 text-green-800" :
//           "bg-purple-100 text-purple-800"
//         }`}>
//           {template.category}
//         </div>
//       </div>

//       <div className="space-y-3">
//         <div className="flex items-center justify-between">
//           <span className={themeClasses.text.secondary}>Base Price:</span>
//           <span className="font-semibold text-indigo-600">
//             Ksh {template.basePrice.toLocaleString()}
//           </span>
//         </div>

//         <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
//           {/* Hotspot */}
//           <div>
//             <div className="flex items-center mb-2">
//               <Wifi className="w-4 h-4 text-blue-600 mr-2" />
//               <span className="text-sm font-medium">Hotspot</span>
//             </div>
//             <div className="space-y-1 text-xs">
//               <div className="flex justify-between">
//                 <span>Download:</span>
//                 <span>{template.accessMethods.hotspot.downloadSpeed.value} {template.accessMethods.hotspot.downloadSpeed.unit}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Data:</span>
//                 <span>{template.accessMethods.hotspot.dataLimit.value} {template.accessMethods.hotspot.dataLimit.unit}</span>
//               </div>
//             </div>
//           </div>

//           {/* PPPoE */}
//           <div>
//             <div className="flex items-center mb-2">
//               <Cable className="w-4 h-4 text-green-600 mr-2" />
//               <span className="text-sm font-medium">PPPoE</span>
//             </div>
//             <div className="space-y-1 text-xs">
//               <div className="flex justify-between">
//                 <span>Download:</span>
//                 <span>{template.accessMethods.pppoe.downloadSpeed.value} {template.accessMethods.pppoe.downloadSpeed.unit}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Data:</span>
//                 <span>{template.accessMethods.pppoe.dataLimit.value} {template.accessMethods.pppoe.dataLimit.unit}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <motion.button
//         whileHover={{ scale: 1.05 }}
//         whileTap={{ scale: 0.95 }}
//         onClick={(e) => {
//           e.stopPropagation();
//           onApplyTemplate(template);
//         }}
//         className={`w-full mt-4 py-2 rounded-lg font-medium flex items-center justify-center ${themeClasses.button.primary}`}
//       >
//         <Zap className="w-4 h-4 mr-2" />
//         Use Template
//       </motion.button>
//     </motion.div>
//   );

//   const TemplatePreview = ({ template }) => (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.9 }}
//         className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-lg ${themeClasses.bg.card} ${themeClasses.border.light} border p-6`}
//       >
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-2xl font-bold text-indigo-600">{template.name}</h2>
//           <button
//             onClick={() => setSelectedTemplate(null)}
//             className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
//           >
//             <X className="w-6 h-6" />
//           </button>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Hotspot Configuration */}
//           <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
//             <div className="flex items-center mb-4">
//               <Wifi className="w-6 h-6 text-blue-600 mr-3" />
//               <h3 className="text-lg font-semibold">Hotspot Configuration</h3>
//             </div>
//             <div className="space-y-3">
//               <div className="flex justify-between">
//                 <span>Download Speed:</span>
//                 <span className="font-medium">
//                   {template.accessMethods.hotspot.downloadSpeed.value} {template.accessMethods.hotspot.downloadSpeed.unit}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Upload Speed:</span>
//                 <span className="font-medium">
//                   {template.accessMethods.hotspot.uploadSpeed.value} {template.accessMethods.hotspot.uploadSpeed.unit}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Data Limit:</span>
//                 <span className="font-medium">
//                   {template.accessMethods.hotspot.dataLimit.value} {template.accessMethods.hotspot.dataLimit.unit}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Usage Limit:</span>
//                 <span className="font-medium">
//                   {template.accessMethods.hotspot.usageLimit.value} {template.accessMethods.hotspot.usageLimit.unit}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Bandwidth:</span>
//                 <span className="font-medium">
//                   {template.accessMethods.hotspot.bandwidthLimit === 0 ? 'Unlimited' : `${template.accessMethods.hotspot.bandwidthLimit} Kbps`}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Connections:</span>
//                 <span className="font-medium">
//                   {template.accessMethods.hotspot.concurrentConnections}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* PPPoE Configuration */}
//           <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
//             <div className="flex items-center mb-4">
//               <Cable className="w-6 h-6 text-green-600 mr-3" />
//               <h3 className="text-lg font-semibold">PPPoE Configuration</h3>
//             </div>
//             <div className="space-y-3">
//               <div className="flex justify-between">
//                 <span>Download Speed:</span>
//                 <span className="font-medium">
//                   {template.accessMethods.pppoe.downloadSpeed.value} {template.accessMethods.pppoe.downloadSpeed.unit}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Upload Speed:</span>
//                 <span className="font-medium">
//                   {template.accessMethods.pppoe.uploadSpeed.value} {template.accessMethods.pppoe.uploadSpeed.unit}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Data Limit:</span>
//                 <span className="font-medium">
//                   {template.accessMethods.pppoe.dataLimit.value} {template.accessMethods.pppoe.dataLimit.unit}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Usage Limit:</span>
//                 <span className="font-medium">
//                   {template.accessMethods.pppoe.usageLimit.value} {template.accessMethods.pppoe.usageLimit.unit}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Bandwidth:</span>
//                 <span className="font-medium">
//                   {template.accessMethods.pppoe.bandwidthLimit === 0 ? 'Unlimited' : `${template.accessMethods.pppoe.bandwidthLimit} Kbps`}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Connections:</span>
//                 <span className="font-medium">
//                   {template.accessMethods.pppoe.concurrentConnections}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-end space-x-4 mt-8">
//           <button
//             onClick={() => setSelectedTemplate(null)}
//             className={`px-6 py-2 rounded-lg ${themeClasses.button.secondary}`}
//           >
//             Cancel
//           </button>
//           <button
//             onClick={() => {
//               onApplyTemplate(template);
//               setSelectedTemplate(null);
//             }}
//             className={`px-6 py-2 rounded-lg flex items-center ${themeClasses.button.success}`}
//           >
//             <Check className="w-4 h-4 mr-2" />
//             Use This Template
//           </button>
//         </div>
//       </motion.div>
//     </div>
//   );

//   return (
//     <div className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${themeClasses.bg.primary}`}>
//       <main className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={onBack}
//               className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
//             >
//               <ArrowLeft className="w-5 h-5" />
//             </button>
//             <div>
//               <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
//                 Plan Templates
//               </h1>
//               <p className={`mt-1 lg:mt-2 text-sm lg:text-lg ${themeClasses.text.secondary}`}>
//                 Quick start with pre-configured plan templates
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Templates Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
//           {templateTypes.map((template) => (
//             <TemplateCard key={template.id} template={template} />
//           ))}
//         </div>

//         {/* Selected Template Preview */}
//         {selectedTemplate && <TemplatePreview template={selectedTemplate} />}
//       </main>
//     </div>
//   );
// };

// export default PlanTemplates;








// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { X, Zap, Check, ArrowLeft, Wifi, Cable, Users, Clock, Plus, Template } from "lucide-react";
// import { getThemeClasses } from "../../components/ServiceManagement/Shared/components"
// import { formatNumber, formatBandwidth } from "../../components/ServiceManagement/Shared/utils"
// import api from "../../api"

// const PlanTemplates = ({ templates: initialTemplates, onApplyTemplate, onCreateFromTemplate, onBack, theme }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [selectedTemplate, setSelectedTemplate] = useState(null);
//   const [templates, setTemplates] = useState(initialTemplates || []);
//   const [isLoading, setIsLoading] = useState(false);

//   // Fetch templates if not provided
//   useEffect(() => {
//     if (!initialTemplates || initialTemplates.length === 0) {
//       fetchTemplates();
//     }
//   }, [initialTemplates]);

//   const fetchTemplates = async () => {
//     setIsLoading(true);
//     try {
//       const response = await api.get("/api/internet_plans/templates/public/");
//       const templatesData = response.data.results || response.data;
//       if (Array.isArray(templatesData)) {
//         setTemplates(templatesData);
//       }
//     } catch (error) {
//       console.error("Error fetching templates:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const TemplateCard = ({ template }) => (
//     <motion.div
//       whileHover={{ scale: 1.02 }}
//       whileTap={{ scale: 0.98 }}
//       className={`p-6 rounded-xl shadow-lg border cursor-pointer transition-all ${
//         themeClasses.bg.card
//       } ${themeClasses.border.light} hover:border-indigo-500`}
//       onClick={() => setSelectedTemplate(template)}
//     >
//       <div className="flex items-start justify-between mb-4">
//         <div className="flex-1">
//           <div className="flex items-center mb-2">
//             <h3 className="text-lg font-semibold text-indigo-600 mr-3">
//               {template.name}
//             </h3>
//             {template.isPublic && (
//               <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
//                 Public
//               </span>
//             )}
//           </div>
//           <p className={`text-sm ${themeClasses.text.secondary} mb-3`}>
//             {template.description || "No description available"}
//           </p>
//         </div>
//         <div className={`px-3 py-1 rounded-full text-xs font-medium ${
//           template.category === "Business" ? "bg-blue-100 text-blue-800" :
//           template.category === "Residential" ? "bg-green-100 text-green-800" :
//           template.category === "Enterprise" ? "bg-purple-100 text-purple-800" :
//           "bg-orange-100 text-orange-800"
//         }`}>
//           {template.category}
//         </div>
//       </div>

//       <div className="space-y-3">
//         <div className="flex items-center justify-between">
//           <span className={themeClasses.text.secondary}>Base Price:</span>
//           <span className="font-semibold text-indigo-600">
//             Ksh {formatNumber(template.basePrice || template.base_price)}
//           </span>
//         </div>

//         <div className="flex items-center justify-between text-sm">
//           <span className={themeClasses.text.secondary}>Used:</span>
//           <span className={themeClasses.text.primary}>
//             {template.usageCount || template.usage_count || 0} times
//           </span>
//         </div>

//         <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
//           {/* Hotspot */}
//           <div>
//             <div className="flex items-center mb-2">
//               <Wifi className="w-4 h-4 text-blue-600 mr-2" />
//               <span className="text-sm font-medium">Hotspot</span>
//               <span className={`ml-2 text-xs ${
//                 template.accessMethods?.hotspot?.enabled ? "text-green-600" : "text-red-600"
//               }`}>
//                 {template.accessMethods?.hotspot?.enabled ? "✓" : "✗"}
//               </span>
//             </div>
//             {template.accessMethods?.hotspot?.enabled && (
//               <div className="space-y-1 text-xs">
//                 <div className="flex justify-between">
//                   <span>Download:</span>
//                   <span>{template.accessMethods.hotspot.downloadSpeed.value} {template.accessMethods.hotspot.downloadSpeed.unit}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Data:</span>
//                   <span>{template.accessMethods.hotspot.dataLimit.value} {template.accessMethods.hotspot.dataLimit.unit}</span>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* PPPoE */}
//           <div>
//             <div className="flex items-center mb-2">
//               <Cable className="w-4 h-4 text-green-600 mr-2" />
//               <span className="text-sm font-medium">PPPoE</span>
//               <span className={`ml-2 text-xs ${
//                 template.accessMethods?.pppoe?.enabled ? "text-green-600" : "text-red-600"
//               }`}>
//                 {template.accessMethods?.pppoe?.enabled ? "✓" : "✗"}
//               </span>
//             </div>
//             {template.accessMethods?.pppoe?.enabled && (
//               <div className="space-y-1 text-xs">
//                 <div className="flex justify-between">
//                   <span>Download:</span>
//                   <span>{template.accessMethods.pppoe.downloadSpeed.value} {template.accessMethods.pppoe.downloadSpeed.unit}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Data:</span>
//                   <span>{template.accessMethods.pppoe.dataLimit.value} {template.accessMethods.pppoe.dataLimit.unit}</span>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="flex space-x-2 mt-4">
//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={(e) => {
//             e.stopPropagation();
//             onApplyTemplate(template);
//           }}
//           className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center ${themeClasses.button.primary}`}
//         >
//           <Template className="w-4 h-4 mr-2" />
//           Use Template
//         </motion.button>
        
//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={(e) => {
//             e.stopPropagation();
//             onCreateFromTemplate(template);
//           }}
//           className={`px-3 py-2 rounded-lg font-medium flex items-center justify-center ${themeClasses.button.success}`}
//           title="Quick Create Plan"
//         >
//           <Plus className="w-4 h-4" />
//         </motion.button>
//       </div>
//     </motion.div>
//   );

//   const TemplatePreview = ({ template }) => (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.9 }}
//         className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-lg ${themeClasses.bg.card} ${themeClasses.border.light} border p-6`}
//       >
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h2 className="text-2xl font-bold text-indigo-600">{template.name}</h2>
//             <p className={`mt-1 ${themeClasses.text.secondary}`}>
//               {template.description}
//             </p>
//           </div>
//           <button
//             onClick={() => setSelectedTemplate(null)}
//             className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
//           >
//             <X className="w-6 h-6" />
//           </button>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//           <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
//             <h4 className="font-semibold mb-2">Template Information</h4>
//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span>Category:</span>
//                 <span className="font-medium">{template.category}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Base Price:</span>
//                 <span className="font-medium">Ksh {formatNumber(template.basePrice || template.base_price)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Usage Count:</span>
//                 <span className="font-medium">{template.usageCount || template.usage_count || 0}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Status:</span>
//                 <span className={`font-medium ${
//                   template.isActive !== false ? 'text-green-600' : 'text-red-600'
//                 }`}>
//                   {template.isActive !== false ? 'Active' : 'Inactive'}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
//             <h4 className="font-semibold mb-2">Access Methods</h4>
//             <div className="space-y-2 text-sm">
//               {template.enabledAccessMethods?.map(method => (
//                 <div key={method} className="flex items-center">
//                   <Check className="w-4 h-4 text-green-600 mr-2" />
//                   <span className="capitalize">{method}</span>
//                 </div>
//               ))}
//               {(!template.enabledAccessMethods || template.enabledAccessMethods.length === 0) && (
//                 <p className={themeClasses.text.secondary}>No access methods enabled</p>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Hotspot Configuration */}
//           {template.accessMethods?.hotspot?.enabled && (
//             <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
//               <div className="flex items-center mb-4">
//                 <Wifi className="w-6 h-6 text-blue-600 mr-3" />
//                 <h3 className="text-lg font-semibold">Hotspot Configuration</h3>
//               </div>
//               <div className="space-y-3">
//                 <div className="flex justify-between">
//                   <span>Download Speed:</span>
//                   <span className="font-medium">
//                     {template.accessMethods.hotspot.downloadSpeed.value} {template.accessMethods.hotspot.downloadSpeed.unit}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Upload Speed:</span>
//                   <span className="font-medium">
//                     {template.accessMethods.hotspot.uploadSpeed.value} {template.accessMethods.hotspot.uploadSpeed.unit}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Data Limit:</span>
//                   <span className="font-medium">
//                     {template.accessMethods.hotspot.dataLimit.value} {template.accessMethods.hotspot.dataLimit.unit}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Usage Limit:</span>
//                   <span className="font-medium">
//                     {template.accessMethods.hotspot.usageLimit.value} {template.accessMethods.hotspot.usageLimit.unit}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Bandwidth:</span>
//                   <span className="font-medium">
//                     {formatBandwidth(template.accessMethods.hotspot.bandwidthLimit)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Connections:</span>
//                   <span className="font-medium">
//                     {template.accessMethods.hotspot.concurrentConnections}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* PPPoE Configuration */}
//           {template.accessMethods?.pppoe?.enabled && (
//             <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
//               <div className="flex items-center mb-4">
//                 <Cable className="w-6 h-6 text-green-600 mr-3" />
//                 <h3 className="text-lg font-semibold">PPPoE Configuration</h3>
//               </div>
//               <div className="space-y-3">
//                 <div className="flex justify-between">
//                   <span>Download Speed:</span>
//                   <span className="font-medium">
//                     {template.accessMethods.pppoe.downloadSpeed.value} {template.accessMethods.pppoe.downloadSpeed.unit}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Upload Speed:</span>
//                   <span className="font-medium">
//                     {template.accessMethods.pppoe.uploadSpeed.value} {template.accessMethods.pppoe.uploadSpeed.unit}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Data Limit:</span>
//                   <span className="font-medium">
//                     {template.accessMethods.pppoe.dataLimit.value} {template.accessMethods.pppoe.dataLimit.unit}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Usage Limit:</span>
//                   <span className="font-medium">
//                     {template.accessMethods.pppoe.usageLimit.value} {template.accessMethods.pppoe.usageLimit.unit}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Bandwidth:</span>
//                   <span className="font-medium">
//                     {formatBandwidth(template.accessMethods.pppoe.bandwidthLimit)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Connections:</span>
//                   <span className="font-medium">
//                     {template.accessMethods.pppoe.concurrentConnections}
//                   </span>
//                 </div>
//                 {template.accessMethods.pppoe.serviceName && (
//                   <div className="flex justify-between">
//                     <span>Service Name:</span>
//                     <span className="font-medium">
//                       {template.accessMethods.pppoe.serviceName}
//                     </span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="flex justify-end space-x-4 mt-8">
//           <button
//             onClick={() => setSelectedTemplate(null)}
//             className={`px-6 py-2 rounded-lg ${themeClasses.button.secondary}`}
//           >
//             Cancel
//           </button>
//           <button
//             onClick={() => {
//               onApplyTemplate(template);
//               setSelectedTemplate(null);
//             }}
//             className={`px-6 py-2 rounded-lg flex items-center ${themeClasses.button.primary}`}
//           >
//             <Template className="w-4 h-4 mr-2" />
//             Use This Template
//           </button>
//           <button
//             onClick={() => {
//               onCreateFromTemplate(template);
//               setSelectedTemplate(null);
//             }}
//             className={`px-6 py-2 rounded-lg flex items-center ${themeClasses.button.success}`}
//           >
//             <Plus className="w-4 h-4 mr-2" />
//             Quick Create
//           </button>
//         </div>
//       </motion.div>
//     </div>
//   );

//   if (isLoading) {
//     return (
//       <div className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${themeClasses.bg.primary}`}>
//         <main className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={onBack}
//               className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
//             >
//               <ArrowLeft className="w-5 h-5" />
//             </button>
//             <div>
//               <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
//                 Plan Templates
//               </h1>
//               <p className={`mt-1 lg:mt-2 text-sm lg:text-lg ${themeClasses.text.secondary}`}>
//                 Loading templates...
//               </p>
//             </div>
//           </div>
//           <div className="flex justify-center items-center py-12">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   return (
//     <div className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${themeClasses.bg.primary}`}>
//       <main className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={onBack}
//               className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
//             >
//               <ArrowLeft className="w-5 h-5" />
//             </button>
//             <div>
//               <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
//                 Plan Templates
//               </h1>
//               <p className={`mt-1 lg:mt-2 text-sm lg:text-lg ${themeClasses.text.secondary}`}>
//                 Quick start with pre-configured plan templates
//               </p>
//             </div>
//           </div>
//           <div className="text-sm text-gray-500">
//             {templates.length} templates available
//           </div>
//         </div>

//         {/* Templates Grid */}
//         {templates.length === 0 ? (
//           <div className={`rounded-xl shadow-lg p-12 text-center ${themeClasses.bg.card}`}>
//             <Template className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold mb-2">No Templates Available</h3>
//             <p className={`mb-6 ${themeClasses.text.secondary}`}>
//               There are no plan templates available at the moment.
//             </p>
//             <button
//               onClick={onBack}
//               className={`px-6 py-3 rounded-lg ${themeClasses.button.primary}`}
//             >
//               Back to Plans
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
//             {templates.map((template) => (
//               <TemplateCard key={template.id} template={template} />
//             ))}
//           </div>
//         )}

//         {/* Selected Template Preview */}
//         {selectedTemplate && <TemplatePreview template={selectedTemplate} />}
//       </main>
//     </div>
//   );
// };

// export default PlanTemplates;





import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  X, Zap, Check, ArrowLeft, Wifi, Cable, Users, Clock, Plus, 
  Edit, Trash2, Save, Download, Upload, Filter, Search, Crown, Lock, Globe, Box
} from "lucide-react";
import { getThemeClasses } from "../../components/ServiceManagement/Shared/components";
import { formatNumber, formatBandwidth, deepClone } from "../../components/ServiceManagement/Shared/utils";
import { EnhancedSelect } from "../../components/ServiceManagement/Shared/components";
import { categories, planTypes } from "../../components/ServiceManagement/Shared/constant";
import api from "../../api";

const PlanTemplates = ({ templates: initialTemplates, onApplyTemplate, onCreateFromTemplate, onBack, theme }) => {
  const themeClasses = getThemeClasses(theme);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState(initialTemplates || []);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("browse"); // "browse", "create", "edit"
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterVisibility, setFilterVisibility] = useState("All");
  
  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    category: "Residential",
    basePrice: "0",
    isPublic: true,
    accessMethods: {
      hotspot: {
        enabled: true,
        downloadSpeed: { value: "", unit: "Mbps" },
        uploadSpeed: { value: "", unit: "Mbps" },
        dataLimit: { value: "", unit: "GB" },
        usageLimit: { value: "", unit: "Hours" },
        bandwidthLimit: 0,
        concurrentConnections: 1,
        sessionTimeout: 86400,
        idleTimeout: 300,
      },
      pppoe: {
        enabled: true,
        downloadSpeed: { value: "", unit: "Mbps" },
        uploadSpeed: { value: "", unit: "Mbps" },
        dataLimit: { value: "", unit: "GB" },
        usageLimit: { value: "", unit: "Hours" },
        bandwidthLimit: 0,
        concurrentConnections: 1,
        ipPool: "pppoe-pool-1",
        serviceName: "",
        mtu: 1492,
        dnsServers: ["8.8.8.8", "1.1.1.1"],
        idleTimeout: 300,
      }
    }
  });

  // Fetch templates if not provided
  useEffect(() => {
    if (!initialTemplates || initialTemplates.length === 0) {
      fetchTemplates();
    }
  }, [initialTemplates]);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/internet_plans/templates/");
      const templatesData = response.data.results || response.data;
      if (Array.isArray(templatesData)) {
        setTemplates(templatesData);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || template.category === filterCategory;
    const matchesVisibility = filterVisibility === "All" || 
                             (filterVisibility === "Public" && template.isPublic) ||
                             (filterVisibility === "Private" && !template.isPublic);
    
    return matchesSearch && matchesCategory && matchesVisibility;
  });

  // Create new template
  const createTemplate = async () => {
    if (!templateForm.name.trim()) {
      alert("Template name is required");
      return;
    }

    setIsLoading(true);
    try {
      const templateData = {
        name: templateForm.name.trim(),
        description: templateForm.description.trim(),
        category: templateForm.category,
        basePrice: parseFloat(templateForm.basePrice) || 0,
        isPublic: templateForm.isPublic,
        accessMethods: templateForm.accessMethods
      };

      const response = await api.post("/api/internet_plans/templates/", templateData);
      setTemplates(prev => [...prev, response.data]);
      setViewMode("browse");
      resetTemplateForm();
    } catch (error) {
      console.error("Error creating template:", error);
      alert(`Failed to create template: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Update template
  const updateTemplate = async () => {
    if (!selectedTemplate?.id) return;

    setIsLoading(true);
    try {
      const templateData = {
        name: templateForm.name.trim(),
        description: templateForm.description.trim(),
        category: templateForm.category,
        basePrice: parseFloat(templateForm.basePrice) || 0,
        isPublic: templateForm.isPublic,
        accessMethods: templateForm.accessMethods
      };

      const response = await api.put(`/api/internet_plans/templates/${selectedTemplate.id}/`, templateData);
      setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? response.data : t));
      setViewMode("browse");
      setSelectedTemplate(null);
    } catch (error) {
      console.error("Error updating template:", error);
      alert(`Failed to update template: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete template
  const deleteTemplate = async (template) => {
    if (!confirm(`Are you sure you want to delete template "${template.name}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await api.delete(`/api/internet_plans/templates/${template.id}/`);
      setTemplates(prev => prev.filter(t => t.id !== template.id));
      
      if (selectedTemplate?.id === template.id) {
        setSelectedTemplate(null);
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      alert(`Failed to delete template: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset template form
  const resetTemplateForm = () => {
    setTemplateForm({
      name: "",
      description: "",
      category: "Residential",
      basePrice: "0",
      isPublic: true,
      accessMethods: {
        hotspot: {
          enabled: true,
          downloadSpeed: { value: "", unit: "Mbps" },
          uploadSpeed: { value: "", unit: "Mbps" },
          dataLimit: { value: "", unit: "GB" },
          usageLimit: { value: "", unit: "Hours" },
          bandwidthLimit: 0,
          concurrentConnections: 1,
          sessionTimeout: 86400,
          idleTimeout: 300,
        },
        pppoe: {
          enabled: true,
          downloadSpeed: { value: "", unit: "Mbps" },
          uploadSpeed: { value: "", unit: "Mbps" },
          dataLimit: { value: "", unit: "GB" },
          usageLimit: { value: "", unit: "Hours" },
          bandwidthLimit: 0,
          concurrentConnections: 1,
          ipPool: "pppoe-pool-1",
          serviceName: "",
          mtu: 1492,
          dnsServers: ["8.8.8.8", "1.1.1.1"],
          idleTimeout: 300,
        }
      }
    });
  };

  // Start editing template
  const startEditTemplate = (template) => {
    setTemplateForm(deepClone({
      name: template.name,
      description: template.description,
      category: template.category,
      basePrice: template.basePrice?.toString() || template.base_price?.toString() || "0",
      isPublic: template.isPublic !== false,
      accessMethods: template.accessMethods || template.access_methods
    }));
    setSelectedTemplate(template);
    setViewMode("edit");
  };

  // Start creating template from existing
  const startCreateFromTemplate = (template) => {
    setTemplateForm(deepClone({
      name: `${template.name} Copy`,
      description: template.description,
      category: template.category,
      basePrice: template.basePrice?.toString() || template.base_price?.toString() || "0",
      isPublic: template.isPublic !== false,
      accessMethods: template.accessMethods || template.access_methods
    }));
    setViewMode("create");
  };

  // Handle form changes
  const handleFormChange = (field, value) => {
    setTemplateForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAccessMethodChange = (method, field, value) => {
    setTemplateForm(prev => ({
      ...prev,
      accessMethods: {
        ...prev.accessMethods,
        [method]: {
          ...prev.accessMethods[method],
          [field]: value
        }
      }
    }));
  };

  const handleAccessMethodNestedChange = (method, parent, key, value) => {
    setTemplateForm(prev => ({
      ...prev,
      accessMethods: {
        ...prev.accessMethods,
        [method]: {
          ...prev.accessMethods[method],
          [parent]: {
            ...prev.accessMethods[method][parent],
            [key]: value
          }
        }
      }
    }));
  };

  const TemplateCard = ({ template }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-6 rounded-xl shadow-lg border cursor-pointer transition-all ${
        themeClasses.bg.card
      } ${themeClasses.border.light} hover:border-indigo-500`}
      onClick={() => setSelectedTemplate(template)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-semibold text-indigo-600 mr-3">
              {template.name}
            </h3>
            <div className="flex items-center space-x-2">
              {template.isPublic ? (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                  <Globe className="w-3 h-3 mr-1" />
                  Public
                </span>
              ) : (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center">
                  <Lock className="w-3 h-3 mr-1" />
                  Private
                </span>
              )}
              {(template.usageCount > 10 || template.usage_count > 10) && (
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full flex items-center">
                  <Crown className="w-3 h-3 mr-1" />
                  Popular
                </span>
              )}
            </div>
          </div>
          <p className={`text-sm ${themeClasses.text.secondary} mb-3 line-clamp-2`}>
            {template.description || "No description available"}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          template.category === "Business" ? "bg-blue-100 text-blue-800" :
          template.category === "Residential" ? "bg-green-100 text-green-800" :
          template.category === "Enterprise" ? "bg-purple-100 text-purple-800" :
          "bg-orange-100 text-orange-800"
        }`}>
          {template.category}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={themeClasses.text.secondary}>Base Price:</span>
          <span className="font-semibold text-indigo-600">
            Ksh {formatNumber(template.basePrice || template.base_price)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className={themeClasses.text.secondary}>Used:</span>
          <span className={themeClasses.text.primary}>
            {(template.usageCount || template.usage_count || 0)} times
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          {/* Hotspot */}
          <div>
            <div className="flex items-center mb-2">
              <Wifi className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium">Hotspot</span>
              <span className={`ml-2 text-xs ${
                template.accessMethods?.hotspot?.enabled ? "text-green-600" : "text-red-600"
              }`}>
                {template.accessMethods?.hotspot?.enabled ? "✓" : "✗"}
              </span>
            </div>
            {template.accessMethods?.hotspot?.enabled && (
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Download:</span>
                  <span>{template.accessMethods.hotspot.downloadSpeed?.value} {template.accessMethods.hotspot.downloadSpeed?.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Data:</span>
                  <span>{template.accessMethods.hotspot.dataLimit?.value} {template.accessMethods.hotspot.dataLimit?.unit}</span>
                </div>
              </div>
            )}
          </div>

          {/* PPPoE */}
          <div>
            <div className="flex items-center mb-2">
              <Cable className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm font-medium">PPPoE</span>
              <span className={`ml-2 text-xs ${
                template.accessMethods?.pppoe?.enabled ? "text-green-600" : "text-red-600"
              }`}>
                {template.accessMethods?.pppoe?.enabled ? "✓" : "✗"}
              </span>
            </div>
            {template.accessMethods?.pppoe?.enabled && (
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Download:</span>
                  <span>{template.accessMethods.pppoe.downloadSpeed?.value} {template.accessMethods.pppoe.downloadSpeed?.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Data:</span>
                  <span>{template.accessMethods.pppoe.dataLimit?.value} {template.accessMethods.pppoe.dataLimit?.unit}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex space-x-2 mt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onApplyTemplate(template);
          }}
          className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center ${themeClasses.button.primary}`}
        >
          <Box className="w-4 h-4 mr-2" />
          Use Template
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            startCreateFromTemplate(template);
          }}
          className={`px-3 py-2 rounded-lg font-medium flex items-center justify-center ${themeClasses.button.success}`}
          title="Quick Create Plan"
        >
          <Plus className="w-4 h-4" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            startEditTemplate(template);
          }}
          className={`px-3 py-2 rounded-lg font-medium flex items-center justify-center ${themeClasses.button.secondary}`}
          title="Edit Template"
        >
          <Edit className="w-4 h-4" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            deleteTemplate(template);
          }}
          className={`px-3 py-2 rounded-lg font-medium flex items-center justify-center ${themeClasses.button.danger}`}
          title="Delete Template"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );

  // Template Form Component
  const TemplateForm = () => (
    <div className={`p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center">
        <Box className="w-5 h-5 mr-3 text-indigo-600" />
        {viewMode === "create" ? "Create New Template" : "Edit Template"}
      </h3>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
              Template Name *
            </label>
            <input
              type="text"
              value={templateForm.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
              className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
              placeholder="Enter template name"
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
              Category
            </label>
            <EnhancedSelect
              value={templateForm.category}
              onChange={(value) => handleFormChange("category", value)}
              options={categories.map(cat => ({ value: cat, label: cat }))}
            />
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
            Description
          </label>
          <textarea
            value={templateForm.description}
            onChange={(e) => handleFormChange("description", e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
            placeholder="Describe this template..."
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
              Base Price (Ksh)
            </label>
            <input
              type="number"
              value={templateForm.basePrice}
              onChange={(e) => handleFormChange("basePrice", e.target.value)}
              className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
              Public Template
            </label>
            <div 
              onClick={() => handleFormChange("isPublic", !templateForm.isPublic)}
              className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                templateForm.isPublic 
                  ? 'bg-indigo-600'
                  : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                templateForm.isPublic ? "translate-x-6" : "translate-x-1"
              }`} />
            </div>
          </div>
        </div>

        {/* Access Methods Configuration */}
        <div className="border-t pt-6">
          <h4 className="text-md font-semibold mb-4">Access Methods Configuration</h4>
          
          {/* Hotspot Configuration */}
          <div className={`p-4 rounded-lg mb-4 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Wifi className="w-5 h-5 text-blue-600 mr-3" />
                <h5 className="font-semibold">Hotspot Configuration</h5>
              </div>
              <div className="flex items-center">
                <label className={`text-sm font-medium mr-4 ${themeClasses.text.primary}`}>
                  Enable Hotspot
                </label>
                <div 
                  onClick={() => handleAccessMethodChange("hotspot", "enabled", !templateForm.accessMethods.hotspot.enabled)}
                  className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                    templateForm.accessMethods.hotspot.enabled 
                      ? 'bg-blue-600'
                      : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                    templateForm.accessMethods.hotspot.enabled ? "translate-x-6" : "translate-x-1"
                  }`} />
                </div>
              </div>
            </div>

            {templateForm.accessMethods.hotspot.enabled && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>Download Speed</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={templateForm.accessMethods.hotspot.downloadSpeed.value}
                      onChange={(e) => handleAccessMethodNestedChange("hotspot", "downloadSpeed", "value", e.target.value)}
                      className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                      placeholder="10"
                    />
                    <EnhancedSelect
                      value={templateForm.accessMethods.hotspot.downloadSpeed.unit}
                      onChange={(value) => handleAccessMethodNestedChange("hotspot", "downloadSpeed", "unit", value)}
                      options={["Kbps", "Mbps", "Gbps"].map(unit => ({ value: unit, label: unit }))}
                      className="w-24"
                    />
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>Upload Speed</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={templateForm.accessMethods.hotspot.uploadSpeed.value}
                      onChange={(e) => handleAccessMethodNestedChange("hotspot", "uploadSpeed", "value", e.target.value)}
                      className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                      placeholder="2"
                    />
                    <EnhancedSelect
                      value={templateForm.accessMethods.hotspot.uploadSpeed.unit}
                      onChange={(value) => handleAccessMethodNestedChange("hotspot", "uploadSpeed", "unit", value)}
                      options={["Kbps", "Mbps", "Gbps"].map(unit => ({ value: unit, label: unit }))}
                      className="w-24"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PPPoE Configuration */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Cable className="w-5 h-5 text-green-600 mr-3" />
                <h5 className="font-semibold">PPPoE Configuration</h5>
              </div>
              <div className="flex items-center">
                <label className={`text-sm font-medium mr-4 ${themeClasses.text.primary}`}>
                  Enable PPPoE
                </label>
                <div 
                  onClick={() => handleAccessMethodChange("pppoe", "enabled", !templateForm.accessMethods.pppoe.enabled)}
                  className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                    templateForm.accessMethods.pppoe.enabled 
                      ? 'bg-green-600'
                      : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                    templateForm.accessMethods.pppoe.enabled ? "translate-x-6" : "translate-x-1"
                  }`} />
                </div>
              </div>
            </div>

            {templateForm.accessMethods.pppoe.enabled && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>Download Speed</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={templateForm.accessMethods.pppoe.downloadSpeed.value}
                      onChange={(e) => handleAccessMethodNestedChange("pppoe", "downloadSpeed", "value", e.target.value)}
                      className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                      placeholder="15"
                    />
                    <EnhancedSelect
                      value={templateForm.accessMethods.pppoe.downloadSpeed.unit}
                      onChange={(value) => handleAccessMethodNestedChange("pppoe", "downloadSpeed", "unit", value)}
                      options={["Kbps", "Mbps", "Gbps"].map(unit => ({ value: unit, label: unit }))}
                      className="w-24"
                    />
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>Upload Speed</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={templateForm.accessMethods.pppoe.uploadSpeed.value}
                      onChange={(e) => handleAccessMethodNestedChange("pppoe", "uploadSpeed", "value", e.target.value)}
                      className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                      placeholder="3"
                    />
                    <EnhancedSelect
                      value={templateForm.accessMethods.pppoe.uploadSpeed.unit}
                      onChange={(value) => handleAccessMethodNestedChange("pppoe", "uploadSpeed", "unit", value)}
                      options={["Kbps", "Mbps", "Gbps"].map(unit => ({ value: unit, label: unit }))}
                      className="w-24"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            onClick={() => {
              setViewMode("browse");
              resetTemplateForm();
              setSelectedTemplate(null);
            }}
            className={`px-6 py-2 rounded-lg ${themeClasses.button.secondary}`}
          >
            Cancel
          </button>
          <button
            onClick={viewMode === "create" ? createTemplate : updateTemplate}
            disabled={!templateForm.name.trim() || isLoading}
            className={`px-6 py-2 rounded-lg flex items-center ${
              !templateForm.name.trim() || isLoading ? 'bg-gray-400 cursor-not-allowed' : themeClasses.button.success
            }`}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {viewMode === "create" ? "Create Template" : "Update Template"}
          </button>
        </div>
      </div>
    </div>
  );

  // Template Preview Component (from original code)
  const TemplatePreview = ({ template }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-lg ${themeClasses.bg.card} ${themeClasses.border.light} border p-6`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-indigo-600">{template.name}</h2>
            <p className={`mt-1 ${themeClasses.text.secondary}`}>
              {template.description}
            </p>
          </div>
          <button
            onClick={() => setSelectedTemplate(null)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <h4 className="font-semibold mb-2">Template Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="font-medium">{template.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Base Price:</span>
                <span className="font-medium">Ksh {formatNumber(template.basePrice || template.base_price)}</span>
              </div>
              <div className="flex justify-between">
                <span>Usage Count:</span>
                <span className="font-medium">{template.usageCount || template.usage_count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`font-medium ${
                  template.isActive !== false ? 'text-green-600' : 'text-red-600'
                }`}>
                  {template.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <h4 className="font-semibold mb-2">Access Methods</h4>
            <div className="space-y-2 text-sm">
              {template.enabledAccessMethods?.map(method => (
                <div key={method} className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  <span className="capitalize">{method}</span>
                </div>
              ))}
              {(!template.enabledAccessMethods || template.enabledAccessMethods.length === 0) && (
                <p className={themeClasses.text.secondary}>No access methods enabled</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hotspot Configuration */}
          {template.accessMethods?.hotspot?.enabled && (
            <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center mb-4">
                <Wifi className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold">Hotspot Configuration</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Download Speed:</span>
                  <span className="font-medium">
                    {template.accessMethods.hotspot.downloadSpeed?.value} {template.accessMethods.hotspot.downloadSpeed?.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Upload Speed:</span>
                  <span className="font-medium">
                    {template.accessMethods.hotspot.uploadSpeed?.value} {template.accessMethods.hotspot.uploadSpeed?.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Data Limit:</span>
                  <span className="font-medium">
                    {template.accessMethods.hotspot.dataLimit?.value} {template.accessMethods.hotspot.dataLimit?.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Usage Limit:</span>
                  <span className="font-medium">
                    {template.accessMethods.hotspot.usageLimit?.value} {template.accessMethods.hotspot.usageLimit?.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Bandwidth:</span>
                  <span className="font-medium">
                    {formatBandwidth(template.accessMethods.hotspot.bandwidthLimit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Connections:</span>
                  <span className="font-medium">
                    {template.accessMethods.hotspot.concurrentConnections}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PPPoE Configuration */}
          {template.accessMethods?.pppoe?.enabled && (
            <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center mb-4">
                <Cable className="w-6 h-6 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold">PPPoE Configuration</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Download Speed:</span>
                  <span className="font-medium">
                    {template.accessMethods.pppoe.downloadSpeed?.value} {template.accessMethods.pppoe.downloadSpeed?.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Upload Speed:</span>
                  <span className="font-medium">
                    {template.accessMethods.pppoe.uploadSpeed?.value} {template.accessMethods.pppoe.uploadSpeed?.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Data Limit:</span>
                  <span className="font-medium">
                    {template.accessMethods.pppoe.dataLimit?.value} {template.accessMethods.pppoe.dataLimit?.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Usage Limit:</span>
                  <span className="font-medium">
                    {template.accessMethods.pppoe.usageLimit?.value} {template.accessMethods.pppoe.usageLimit?.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Bandwidth:</span>
                  <span className="font-medium">
                    {formatBandwidth(template.accessMethods.pppoe.bandwidthLimit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Connections:</span>
                  <span className="font-medium">
                    {template.accessMethods.pppoe.concurrentConnections}
                  </span>
                </div>
                {template.accessMethods.pppoe.serviceName && (
                  <div className="flex justify-between">
                    <span>Service Name:</span>
                    <span className="font-medium">
                      {template.accessMethods.pppoe.serviceName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={() => setSelectedTemplate(null)}
            className={`px-6 py-2 rounded-lg ${themeClasses.button.secondary}`}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onApplyTemplate(template);
              setSelectedTemplate(null);
            }}
            className={`px-6 py-2 rounded-lg flex items-center ${themeClasses.button.primary}`}
          >
            <Box className="w-4 h-4 mr-2" />
            Use This Template
          </button>
          <button
            onClick={() => {
              onCreateFromTemplate(template);
              setSelectedTemplate(null);
            }}
            className={`px-6 py-2 rounded-lg flex items-center ${themeClasses.button.success}`}
          >
            <Plus className="w-4 h-4 mr-2" />
            Quick Create
          </button>
        </div>
      </motion.div>
    </div>
  );

  if (isLoading && viewMode === "browse") {
    return (
      <div className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${themeClasses.bg.primary}`}>
        <main className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                Plan Templates
              </h1>
              <p className={`mt-1 lg:mt-2 text-sm lg:text-lg ${themeClasses.text.secondary}`}>
                Loading templates...
              </p>
            </div>
          </div>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${themeClasses.bg.primary}`}>
      <main className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                Plan Templates
              </h1>
              <p className={`mt-1 lg:mt-2 text-sm lg:text-lg ${themeClasses.text.secondary}`}>
                {viewMode === "browse" ? "Quick start with pre-configured plan templates" : 
                 viewMode === "create" ? "Create a new template" : "Edit template"}
              </p>
            </div>
          </div>
          
          {viewMode === "browse" && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                {filteredTemplates.length} of {templates.length} templates
              </span>
              <motion.button
                onClick={() => setViewMode("create")}
                className={`px-4 py-2 rounded-lg flex items-center ${themeClasses.button.success}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </motion.button>
            </div>
          )}
        </div>

        {/* Browse View */}
        {viewMode === "browse" && (
          <>
            {/* Filters */}
            <div className={`p-4 lg:p-6 rounded-xl shadow-lg ${themeClasses.bg.card}`}>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.text.tertiary}`} />
                    <input
                      type="text"
                      placeholder="Search templates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                    />
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-40">
                    <EnhancedSelect
                      value={filterCategory}
                      onChange={setFilterCategory}
                      options={[
                        { value: "All", label: "All Categories" },
                        ...categories.map(cat => ({ value: cat, label: cat }))
                      ]}
                    />
                  </div>
                  
                  <div className="w-32">
                    <EnhancedSelect
                      value={filterVisibility}
                      onChange={setFilterVisibility}
                      options={[
                        { value: "All", label: "All" },
                        { value: "Public", label: "Public" },
                        { value: "Private", label: "Private" }
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Templates Grid */}
            {filteredTemplates.length === 0 ? (
              <div className={`rounded-xl shadow-lg p-12 text-center ${themeClasses.bg.card}`}>
                <Box className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {templates.length === 0 ? "No Templates Available" : "No Templates Found"}
                </h3>
                <p className={`mb-6 ${themeClasses.text.secondary}`}>
                  {templates.length === 0 
                    ? "Create your first template to get started!" 
                    : "Try adjusting your search or filters"}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setViewMode("create")}
                    className={`px-6 py-3 rounded-lg ${themeClasses.button.primary}`}
                  >
                    <Plus className="w-4 h-4 mr-2 inline" />
                    Create First Template
                  </button>
                  <button
                    onClick={onBack}
                    className={`px-6 py-3 rounded-lg ${themeClasses.button.secondary}`}
                  >
                    Back to Plans
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {filteredTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Create/Edit View */}
        {(viewMode === "create" || viewMode === "edit") && (
          <TemplateForm />
        )}

        {/* Selected Template Preview */}
        {selectedTemplate && viewMode === "browse" && (
          <TemplatePreview template={selectedTemplate} />
        )}
      </main>
    </div>
  );
};

export default PlanTemplates;