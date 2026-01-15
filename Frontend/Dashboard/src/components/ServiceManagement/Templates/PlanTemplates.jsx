


// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { ArrowLeft, Plus, Search, Box, Check, X, Save, Trash2, AlertTriangle, RefreshCw } from "lucide-react";
// import { getThemeClasses } from "../Shared/components";
// import { deepClone } from "../Shared/utils";
// import { EnhancedSelect, ConfirmationModal } from "../Shared/components";
// import { categories } from "../Shared/constant";
// import api from "../../../api";

// // Components
// import TemplateTypeSelection from "../Templates/TemplateTypeSelection";
// import TemplateCard from "../Templates/TemplateCard";
// import TemplateForm from "../Templates/TemplateForm";
// import TemplatePreview from "../Templates/TemplatePreview";

// const PlanTemplates = ({ templates: initialTemplates, onApplyTemplate, onCreateFromTemplate, onBack, theme }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [selectedTemplate, setSelectedTemplate] = useState(null);
//   const [templates, setTemplates] = useState(initialTemplates || []);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [viewMode, setViewMode] = useState("browse");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterCategory, setFilterCategory] = useState("All");
//   const [filterVisibility, setFilterVisibility] = useState("All");
//   const [filterAccessType, setFilterAccessType] = useState("All");
//   const [templateType, setTemplateType] = useState("hotspot");
  
//   // Enhanced state management
//   const [toast, setToast] = useState({
//     visible: false,
//     message: "",
//     type: "success"
//   });

//   const [deleteModal, setDeleteModal] = useState({
//     isOpen: false,
//     template: null
//   });

//   // Template form state
//   const [templateForm, setTemplateForm] = useState({
//     name: "",
//     description: "",
//     category: "Residential",
//     basePrice: "0",
//     isPublic: true,
//     isActive: true,
//     priority_level: 4,
//     router_specific: false,
//     allowed_routers_ids: [],
//     FUP_policy: "",
//     FUP_threshold: 80,
//     accessMethods: {
//       hotspot: {
//         enabled: true,
//         downloadSpeed: { value: "10", unit: "Mbps" },
//         uploadSpeed: { value: "5", unit: "Mbps" },
//         dataLimit: { value: "10", unit: "GB" },
//         usageLimit: { value: "24", unit: "Hours" },
//         bandwidthLimit: 0,
//         maxDevices: 1,
//         sessionTimeout: 86400,
//         idleTimeout: 300,
//         validityPeriod: { value: "30", unit: "Days" },
//         macBinding: false,
//       },
//       pppoe: {
//         enabled: false,
//         downloadSpeed: { value: "10", unit: "Mbps" },
//         uploadSpeed: { value: "5", unit: "Mbps" },
//         dataLimit: { value: "10", unit: "GB" },
//         usageLimit: { value: "24", unit: "Hours" },
//         bandwidthLimit: 0,
//         maxDevices: 1,
//         sessionTimeout: 86400,
//         idleTimeout: 300,
//         validityPeriod: { value: "30", unit: "Days" },
//         macBinding: false,
//         ipPool: "pppoe-pool-1",
//         serviceName: "",
//         mtu: 1492,
//         dnsServers: ["8.8.8.8", "1.1.1.1"],
//       }
//     }
//   });

//   // Show toast notification
//   const showToast = (message, type = "success") => {
//     setToast({
//       visible: true,
//       message,
//       type
//     });
//     setTimeout(() => {
//       setToast({ visible: false, message: "", type: "success" });
//     }, 4000);
//   };

//   // Enhanced template fetching with error handling
//   const fetchTemplates = async () => {
//     setIsRefreshing(true);
//     try {
//       const response = await api.get("/api/internet_plans/templates/");
//       const templatesData = response.data.results || response.data;
//       if (Array.isArray(templatesData)) {
//         setTemplates(templatesData);
//         showToast("Templates refreshed successfully");
//       } else {
//         throw new Error("Invalid templates data format");
//       }
//     } catch (error) {
//       console.error("Error fetching templates:", error);
//       showToast("Failed to load templates", "error");
//     } finally {
//       setIsRefreshing(false);
//     }
//   };

//   // Load templates on component mount
//   useEffect(() => {
//     if (!initialTemplates || initialTemplates.length === 0) {
//       fetchTemplates();
//     }
//   }, [initialTemplates]);

//   // Enhanced template application with proper usage tracking
//   const handleApplyTemplate = async (template) => {
//     try {
//       setIsLoading(true);
      
//       // Apply template to form immediately for user feedback
//       if (onApplyTemplate) {
//         onApplyTemplate(template);
//       }
      
//       // Increment usage count via API
//       await api.patch(`/api/internet_plans/templates/${template.id}/increment-usage/`);
      
//       // Update local state to reflect usage count
//       setTemplates(prev => prev.map(t => 
//         t.id === template.id 
//           ? { 
//               ...t, 
//               usageCount: (t.usageCount || 0) + 1,
//               usage_count: (t.usage_count || 0) + 1
//             }
//           : t
//       ));
      
//       showToast(`Template "${template.name}" applied successfully!`);
//     } catch (error) {
//       console.error("Error applying template:", error);
//       showToast("Failed to apply template", "error");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Enhanced template creation with proper plan creation and usage tracking
//   const handleCreateFromTemplate = async (template, planName = null) => {
//     try {
//       let finalPlanName = planName;
      
//       // If no plan name provided, use the modern modal (handled in TemplateCard)
//       if (!finalPlanName) {
//         finalPlanName = prompt("Enter plan name:", `${template.name} - ${new Date().toLocaleDateString()}`);
//       }
      
//       if (!finalPlanName || !finalPlanName.trim()) {
//         if (!planName) { // Only show toast if it's from prompt (not modal)
//           showToast("Plan name cannot be empty", "error");
//         }
//         return;
//       }

//       setIsLoading(true);
      
//       // Create plan from template via API
//       const response = await api.post(`/api/internet_plans/templates/${template.id}/create-plan/`, {
//         name: finalPlanName.trim()
//       });

//       // Update local usage count
//       setTemplates(prev => prev.map(t => 
//         t.id === template.id 
//           ? { 
//               ...t, 
//               usageCount: (t.usageCount || 0) + 1,
//               usage_count: (t.usage_count || 0) + 1
//             }
//           : t
//       ));

//       // Call the parent handler with the created plan data
//       if (onCreateFromTemplate) {
//         await onCreateFromTemplate(response.data);
//       }
      
//       if (!planName) { // Only show toast if it's from prompt (not modal)
//         showToast(`Plan "${finalPlanName}" created successfully!`);
//       }
      
//       return response.data; // Return the created plan data
//     } catch (error) {
//       console.error("Error creating plan from template:", error);
//       const errorMessage = error.response?.data?.error || 
//                           error.response?.data?.details?.[0] || 
//                           error.response?.data?.detail || 
//                           "Failed to create plan from template";
      
//       if (!planName) { // Only show toast if it's from prompt (not modal)
//         showToast(errorMessage, "error");
//       } else {
//         // Re-throw error for modal to handle
//         throw error;
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Enhanced delete template with confirmation
//   const handleDeleteTemplate = (template) => {
//     setDeleteModal({
//       isOpen: true,
//       template
//     });
//   };

//   const confirmDeleteTemplate = async () => {
//     const { template } = deleteModal;
    
//     setIsLoading(true);
//     try {
//       await api.delete(`/api/internet_plans/templates/${template.id}/`);
      
//       // Remove template from local state
//       setTemplates(prev => prev.filter(t => t.id !== template.id));
      
//       // Clear selected template if it was deleted
//       if (selectedTemplate?.id === template.id) {
//         setSelectedTemplate(null);
//       }
      
//       showToast(`Template "${template.name}" deleted successfully!`);
//     } catch (error) {
//       console.error("Error deleting template:", error);
//       const errorMessage = error.response?.data?.detail || 
//                           error.response?.data?.error || 
//                           "Failed to delete template";
//       showToast(errorMessage, "error");
//     } finally {
//       setIsLoading(false);
//       setDeleteModal({ isOpen: false, template: null });
//     }
//   };

//   // Enhanced template filtering with access type support
//   const filteredTemplates = templates.filter(template => {
//     const matchesSearch = template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          template.description?.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesCategory = filterCategory === "All" || template.category === filterCategory;
//     const matchesVisibility = filterVisibility === "All" || 
//                              (filterVisibility === "Public" && template.isPublic) ||
//                              (filterVisibility === "Private" && !template.isPublic);
    
//     // Enhanced access type filtering
//     const matchesAccessType = filterAccessType === "All" || 
//       (filterAccessType === "hotspot" && template.accessMethods?.hotspot?.enabled) ||
//       (filterAccessType === "pppoe" && template.accessMethods?.pppoe?.enabled) ||
//       (filterAccessType === "both" && template.accessMethods?.hotspot?.enabled && template.accessMethods?.pppoe?.enabled);
    
//     return matchesSearch && matchesCategory && matchesVisibility && matchesAccessType;
//   });

//   // Get template statistics for display
//   const templateStats = {
//     total: templates.length,
//     hotspot: templates.filter(t => t.accessMethods?.hotspot?.enabled).length,
//     pppoe: templates.filter(t => t.accessMethods?.pppoe?.enabled).length,
//     public: templates.filter(t => t.isPublic).length,
//     private: templates.filter(t => !t.isPublic).length
//   };

//   // Toast Notification Component
//   const ToastNotification = () => {
//     if (!toast.visible) return null;

//     return (
//       <motion.div
//         initial={{ opacity: 0, y: -50, scale: 0.8 }}
//         animate={{ opacity: 1, y: 0, scale: 1 }}
//         exit={{ opacity: 0, y: -50, scale: 0.8 }}
//         className={`fixed top-4 right-4 z-50 max-w-sm w-full ${
//           toast.type === "success" 
//             ? "bg-green-500 border-green-600" 
//             : "bg-red-500 border-red-600"
//         } text-white p-4 rounded-lg shadow-lg border`}
//       >
//         <div className="flex items-center justify-between">
//           <div className="flex items-center">
//             {toast.type === "success" ? (
//               <Check className="w-5 h-5 mr-2" />
//             ) : (
//               <X className="w-5 h-5 mr-2" />
//             )}
//             <span className="font-medium">{toast.message}</span>
//           </div>
//           <button
//             onClick={() => setToast({ visible: false, message: "", type: "success" })}
//             className="ml-4 text-white hover:text-gray-200 transition-colors"
//           >
//             <X className="w-4 h-4" />
//           </button>
//         </div>
//       </motion.div>
//     );
//   };

//   if (isLoading && viewMode === "browse") {
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
//         {/* Toast Notification */}
//         <ToastNotification />

//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={onBack}
//               className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
//             >
//               <ArrowLeft className="w-5 h-5" />
//             </button>
//             <div>
//               <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
//                 Plan Templates
//               </h1>
//               <p className={`mt-1 lg:mt-2 text-sm lg:text-lg ${themeClasses.text.secondary}`}>
//                 {viewMode === "browse" ? "Quick start with pre-configured plan templates" : 
//                  viewMode === "create" ? "Create a new template" : 
//                  viewMode === "type-select" ? "Select template type" : "Edit template"}
//               </p>
//             </div>
//           </div>
          
//           {viewMode === "browse" && (
//             <div className="flex items-center space-x-3">
//               {/* Template Statistics */}
//               <div className="hidden md:flex items-center space-x-4 text-sm text-gray-500">
//                 <span>Total: {templateStats.total}</span>
//                 <span>Hotspot: {templateStats.hotspot}</span>
//                 <span>PPPoE: {templateStats.pppoe}</span>
//               </div>
              
//               {/* Refresh Button */}
//               <motion.button
//                 onClick={fetchTemplates}
//                 disabled={isRefreshing}
//                 className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 title="Refresh Templates"
//               >
//                 <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
//               </motion.button>
              
//               {/* New Template Button */}
//               <motion.button
//                 onClick={() => setViewMode("type-select")}
//                 className={`px-4 py-2 rounded-lg flex items-center ${themeClasses.button.success}`}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 <Plus className="w-4 h-4 mr-2" />
//                 New Template
//               </motion.button>
//             </div>
//           )}
//         </div>

//         {/* Browse View */}
//         {viewMode === "browse" && (
//           <>
//             {/* Enhanced Filters */}
//             <div className={`p-4 lg:p-6 rounded-xl shadow-lg ${themeClasses.bg.card}`}>
//               <div className="flex flex-col lg:flex-row gap-4 items-end">
//                 {/* Search */}
//                 <div className="flex-1">
//                   <div className="relative">
//                     <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.text.tertiary}`} />
//                     <input
//                       type="text"
//                       placeholder="Search templates by name or description..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       className={`w-full pl-10 pr-4 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                     />
//                   </div>
//                 </div>
                
//                 {/* Filter Group */}
//                 <div className="flex flex-wrap gap-4">
//                   <div className="w-40">
//                     <EnhancedSelect
//                       value={filterCategory}
//                       onChange={setFilterCategory}
//                       options={[
//                         { value: "All", label: "All Categories" },
//                         ...categories.map(cat => ({ value: cat, label: cat }))
//                       ]}
//                       theme={theme}
//                     />
//                   </div>
                  
//                   <div className="w-32">
//                     <EnhancedSelect
//                       value={filterVisibility}
//                       onChange={setFilterVisibility}
//                       options={[
//                         { value: "All", label: "All" },
//                         { value: "Public", label: "Public" },
//                         { value: "Private", label: "Private" }
//                       ]}
//                       theme={theme}
//                     />
//                   </div>

//                   <div className="w-36">
//                     <EnhancedSelect
//                       value={filterAccessType}
//                       onChange={setFilterAccessType}
//                       options={[
//                         { value: "All", label: "All Types" },
//                         { value: "hotspot", label: "Hotspot Only" },
//                         { value: "pppoe", label: "PPPoE Only" },
//                         { value: "both", label: "Both Enabled" }
//                       ]}
//                       theme={theme}
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Results Summary */}
//               <div className="mt-4 flex justify-between items-center">
//                 <p className={`text-sm ${themeClasses.text.secondary}`}>
//                   Showing {filteredTemplates.length} of {templates.length} templates
//                 </p>
//                 {(searchTerm || filterCategory !== "All" || filterVisibility !== "All" || filterAccessType !== "All") && (
//                   <button
//                     onClick={() => {
//                       setSearchTerm("");
//                       setFilterCategory("All");
//                       setFilterVisibility("All");
//                       setFilterAccessType("All");
//                     }}
//                     className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
//                   >
//                     Clear all filters
//                   </button>
//                 )}
//               </div>
//             </div>

//             {/* Templates Grid */}
//             {filteredTemplates.length === 0 ? (
//               <div className={`rounded-xl shadow-lg p-12 text-center ${themeClasses.bg.card}`}>
//                 <Box className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//                 <h3 className="text-xl font-semibold mb-2">
//                   {templates.length === 0 ? "No Templates Available" : "No Templates Found"}
//                 </h3>
//                 <p className={`mb-6 ${themeClasses.text.secondary}`}>
//                   {templates.length === 0 
//                     ? "Create your first template to get started!" 
//                     : "Try adjusting your search or filters"}
//                 </p>
//                 <div className="flex flex-col sm:flex-row gap-3 justify-center">
//                   <button
//                     onClick={() => setViewMode("type-select")}
//                     className={`px-6 py-3 rounded-lg ${themeClasses.button.primary}`}
//                   >
//                     <Plus className="w-4 h-4 mr-2 inline" />
//                     Create First Template
//                   </button>
//                   <button
//                     onClick={onBack}
//                     className={`px-6 py-3 rounded-lg ${themeClasses.button.secondary}`}
//                   >
//                     Back to Plans
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
//                 {filteredTemplates.map((template) => (
//                   <TemplateCard 
//                     key={template.id} 
//                     template={template}
//                     onSelect={setSelectedTemplate}
//                     onApplyTemplate={handleApplyTemplate}
//                     onCreateFromTemplate={handleCreateFromTemplate}
//                     onEditTemplate={(template) => {
//                       const formData = deepClone({
//                         name: template.name,
//                         description: template.description,
//                         category: template.category,
//                         basePrice: template.basePrice?.toString() || template.base_price?.toString() || "0",
//                         isPublic: template.isPublic !== false,
//                         isActive: template.isActive !== false,
//                         priority_level: template.priority_level || 4,
//                         router_specific: template.router_specific || false,
//                         allowed_routers_ids: template.allowed_routers_ids || [],
//                         FUP_policy: template.FUP_policy || "",
//                         FUP_threshold: template.FUP_threshold || 80,
//                         accessMethods: template.accessMethods || template.access_methods
//                       });
                      
//                       setTemplateForm(formData);
//                       setTemplateType(formData.accessMethods?.hotspot?.enabled ? "hotspot" : "pppoe");
//                       setSelectedTemplate(template);
//                       setViewMode("edit");
//                     }}
//                     onDeleteTemplate={handleDeleteTemplate}
//                     theme={theme}
//                   />
//                 ))}
//               </div>
//             )}
//           </>
//         )}

//         {/* Other view modes */}
//         {viewMode === "type-select" && (
//           <TemplateTypeSelection
//             templateType={templateType}
//             onTemplateTypeSelect={setTemplateType}
//             onContinue={() => setViewMode("create")}
//             theme={theme}
//           />
//         )}

//         {(viewMode === "create" || viewMode === "edit") && (
//           <TemplateForm
//             templateForm={templateForm}
//             templateType={templateType}
//             viewMode={viewMode}
//             isLoading={isLoading}
//             onFormChange={(field, value) => setTemplateForm(prev => ({ ...prev, [field]: value }))}
//             onAccessMethodChange={(method, field, value) => {
//               setTemplateForm(prev => ({
//                 ...prev,
//                 accessMethods: {
//                   ...prev.accessMethods,
//                   [method]: {
//                     ...prev.accessMethods[method],
//                     [field]: value
//                   }
//                 }
//               }));
//             }}
//             onAccessMethodNestedChange={(method, parent, key, value) => {
//               setTemplateForm(prev => ({
//                 ...prev,
//                 accessMethods: {
//                   ...prev.accessMethods,
//                   [method]: {
//                     ...prev.accessMethods[method],
//                     [parent]: {
//                       ...prev.accessMethods[method][parent],
//                       [key]: value
//                     }
//                   }
//                 }
//               }));
//             }}
//             onCancel={() => {
//               setViewMode("browse");
//               setTemplateForm({
//                 name: "",
//                 description: "",
//                 category: "Residential",
//                 basePrice: "0",
//                 isPublic: true,
//                 isActive: true,
//                 priority_level: 4,
//                 router_specific: false,
//                 allowed_routers_ids: [],
//                 FUP_policy: "",
//                 FUP_threshold: 80,
//                 accessMethods: {
//                   hotspot: {
//                     enabled: true,
//                     downloadSpeed: { value: "10", unit: "Mbps" },
//                     uploadSpeed: { value: "5", unit: "Mbps" },
//                     dataLimit: { value: "10", unit: "GB" },
//                     usageLimit: { value: "24", unit: "Hours" },
//                     bandwidthLimit: 0,
//                     maxDevices: 1,
//                     sessionTimeout: 86400,
//                     idleTimeout: 300,
//                     validityPeriod: { value: "30", unit: "Days" },
//                     macBinding: false,
//                   },
//                   pppoe: {
//                     enabled: false,
//                     downloadSpeed: { value: "10", unit: "Mbps" },
//                     uploadSpeed: { value: "5", unit: "Mbps" },
//                     dataLimit: { value: "10", unit: "GB" },
//                     usageLimit: { value: "24", unit: "Hours" },
//                     bandwidthLimit: 0,
//                     maxDevices: 1,
//                     sessionTimeout: 86400,
//                     idleTimeout: 300,
//                     validityPeriod: { value: "30", unit: "Days" },
//                     macBinding: false,
//                     ipPool: "pppoe-pool-1",
//                     serviceName: "",
//                     mtu: 1492,
//                     dnsServers: ["8.8.8.8", "1.1.1.1"],
//                   }
//                 }
//               });
//               setSelectedTemplate(null);
//             }}
//             onSubmit={async () => {
//               setIsLoading(true);
//               try {
//                 const templateData = {
//                   name: templateForm.name.trim(),
//                   description: templateForm.description.trim(),
//                   category: templateForm.category,
//                   basePrice: parseFloat(templateForm.basePrice) || 0,
//                   isPublic: templateForm.isPublic,
//                   isActive: templateForm.isActive,
//                   priority_level: templateForm.priority_level,
//                   router_specific: templateForm.router_specific,
//                   allowed_routers_ids: templateForm.allowed_routers_ids,
//                   FUP_policy: templateForm.FUP_policy,
//                   FUP_threshold: templateForm.FUP_threshold,
//                   accessMethods: templateForm.accessMethods
//                 };

//                 let response;
//                 if (viewMode === "create") {
//                   response = await api.post("/api/internet_plans/templates/", templateData);
//                   setTemplates(prev => [...prev, response.data]);
//                   showToast(`Template "${templateForm.name}" created successfully!`);
//                 } else {
//                   response = await api.put(`/api/internet_plans/templates/${selectedTemplate.id}/`, templateData);
//                   setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? response.data : t));
//                   showToast(`Template "${templateForm.name}" updated successfully!`);
//                 }

//                 setViewMode("browse");
//                 setSelectedTemplate(null);
//               } catch (error) {
//                 console.error(`Error ${viewMode === "create" ? "creating" : "updating"} template:`, error);
//                 const errorMessage = error.response?.data?.detail || 
//                                     error.response?.data?.error || 
//                                     error.response?.data?.details?.[0] ||
//                                     `Failed to ${viewMode === "create" ? "create" : "update"} template`;
//                 showToast(errorMessage, "error");
//               } finally {
//                 setIsLoading(false);
//               }
//             }}
//             theme={theme}
//           />
//         )}

//         {/* Selected Template Preview */}
//         {selectedTemplate && viewMode === "browse" && (
//           <TemplatePreview
//             template={selectedTemplate}
//             onClose={() => setSelectedTemplate(null)}
//             onApplyTemplate={handleApplyTemplate}
//             onCreateFromTemplate={handleCreateFromTemplate}
//             theme={theme}
//           />
//         )}

//         {/* Delete Confirmation Modal */}
//         <ConfirmationModal
//           isOpen={deleteModal.isOpen}
//           onClose={() => setDeleteModal({ isOpen: false, template: null })}
//           onConfirm={confirmDeleteTemplate}
//           title="Delete Template"
//           message={`Are you sure you want to delete template "${deleteModal.template?.name}"? This action cannot be undone and will affect any plans using this template.`}
//           confirmText="Delete Template"
//           cancelText="Cancel"
//           type="danger"
//           theme={theme}
//         />
//       </main>
//     </div>
//   );
// };

// export default PlanTemplates;







import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Search, Box, Check, X, Save, Trash2, AlertTriangle, RefreshCw } from "lucide-react";
import { getThemeClasses } from "../Shared/components";
import { deepClone } from "../Shared/utils";
import { EnhancedSelect, ConfirmationModal } from "../Shared/components";
import { categories } from "../Shared/constant";
import api from "../../../api";

// Components
import TemplateTypeSelection from "../Templates/TemplateTypeSelection";
import TemplateCard from "../Templates/TemplateCard";
import TemplateForm from "../Templates/TemplateForm";
import TemplatePreview from "../Templates/TemplatePreview";

const PlanTemplates = ({ templates: initialTemplates, onApplyTemplate, onCreateFromTemplate, onBack, theme }) => {
  const themeClasses = getThemeClasses(theme);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState(initialTemplates || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState("browse");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterVisibility, setFilterVisibility] = useState("All");
  const [filterAccessType, setFilterAccessType] = useState("All");
  const [templateType, setTemplateType] = useState("hotspot");
  
  // Enhanced state management
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success"
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    template: null
  });

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    category: "Residential",
    basePrice: "0",
    isPublic: true,
    isActive: true,
    priority_level: 4,
    router_specific: false,
    allowed_routers_ids: [],
    FUP_policy: "",
    FUP_threshold: 80,
    accessMethods: {
      hotspot: {
        enabled: true,
        downloadSpeed: { value: "10", unit: "Mbps" },
        uploadSpeed: { value: "5", unit: "Mbps" },
        dataLimit: { value: "10", unit: "GB" },
        usageLimit: { value: "24", unit: "Hours" },
        bandwidthLimit: 0,
        maxDevices: 1,
        sessionTimeout: 86400,
        idleTimeout: 300,
        validityPeriod: { value: "30", unit: "Days" },
        macBinding: false,
      },
      pppoe: {
        enabled: false,
        downloadSpeed: { value: "10", unit: "Mbps" },
        uploadSpeed: { value: "5", unit: "Mbps" },
        dataLimit: { value: "10", unit: "GB" },
        usageLimit: { value: "24", unit: "Hours" },
        bandwidthLimit: 0,
        maxDevices: 1,
        sessionTimeout: 86400,
        idleTimeout: 300,
        validityPeriod: { value: "30", unit: "Days" },
        macBinding: false,
        ipPool: "pppoe-pool-1",
        serviceName: "",
        mtu: 1492,
      }
    }
  });

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({
      visible: true,
      message,
      type
    });
    setTimeout(() => {
      setToast({ visible: false, message: "", type: "success" });
    }, 4000);
  };

  // Enhanced template fetching with error handling
  const fetchTemplates = async () => {
    setIsRefreshing(true);
    try {
      const response = await api.get("/api/internet_plans/templates/");
      let templatesData;
      
      // Handle different response formats
      if (response.data.results) {
        templatesData = response.data.results;
      } else if (Array.isArray(response.data)) {
        templatesData = response.data;
      } else {
        templatesData = [];
      }
      
      if (Array.isArray(templatesData)) {
        setTemplates(templatesData);
        showToast("Templates refreshed successfully");
      } else {
        throw new Error("Invalid templates data format");
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail || 
                          "Failed to load templates";
      showToast(errorMessage, "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Load templates on component mount
  useEffect(() => {
    if (!initialTemplates || initialTemplates.length === 0) {
      fetchTemplates();
    }
  }, [initialTemplates]);

  // Enhanced template application with proper usage tracking
  const handleApplyTemplate = async (template) => {
    try {
      setIsLoading(true);
      
      // Apply template to form immediately for user feedback
      if (onApplyTemplate) {
        onApplyTemplate(template);
      }
      
      // Update local state to reflect usage count
      setTemplates(prev => prev.map(t => 
        t.id === template.id 
          ? { 
              ...t, 
              usageCount: (t.usageCount || 0) + 1,
              usage_count: (t.usage_count || 0) + 1
            }
          : t
      ));
      
      showToast(`Template "${template.name}" applied successfully!`);
    } catch (error) {
      console.error("Error applying template:", error);
      showToast("Failed to apply template", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced template creation with proper plan creation and usage tracking
  const handleCreateFromTemplate = async (template, planName = null) => {
    try {
      let finalPlanName = planName;
      
      // If no plan name provided, return promise for modal to handle
      if (!finalPlanName) {
        // Return a promise that will be resolved by the modal
        return new Promise((resolve, reject) => {
          // This will be handled by the modal
          reject(new Error("Plan name required"));
        });
      }

      setIsLoading(true);
      
      // Create plan from template via API
      const response = await api.post(`/api/internet_plans/templates/${template.id}/create-plan/`, {
        plan_name: finalPlanName.trim()
      });

      // Update local usage count
      setTemplates(prev => prev.map(t => 
        t.id === template.id 
          ? { 
              ...t, 
              usageCount: (t.usageCount || 0) + 1,
              usage_count: (t.usage_count || 0) + 1
            }
          : t
      ));

      // Call the parent handler with the created plan data
      if (onCreateFromTemplate) {
        await onCreateFromTemplate(response.data);
      }
      
      if (!planName) {
        showToast(`Plan "${finalPlanName}" created successfully!`);
      }
      
      return response.data;
    } catch (error) {
      console.error("Error creating plan from template:", error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.details?.[0] || 
                          error.response?.data?.detail || 
                          "Failed to create plan from template";
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced delete template with confirmation
  const handleDeleteTemplate = (template) => {
    setDeleteModal({
      isOpen: true,
      template
    });
  };

  const confirmDeleteTemplate = async () => {
    const { template } = deleteModal;
    
    setIsLoading(true);
    try {
      await api.delete(`/api/internet_plans/templates/${template.id}/`);
      
      // Remove template from local state
      setTemplates(prev => prev.filter(t => t.id !== template.id));
      
      // Clear selected template if it was deleted
      if (selectedTemplate?.id === template.id) {
        setSelectedTemplate(null);
      }
      
      showToast(`Template "${template.name}" deleted successfully!`);
    } catch (error) {
      console.error("Error deleting template:", error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.error || 
                          "Failed to delete template";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
      setDeleteModal({ isOpen: false, template: null });
    }
  };

  // Enhanced template filtering with access type support
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || template.category === filterCategory;
    const matchesVisibility = filterVisibility === "All" || 
                             (filterVisibility === "Public" && template.isPublic) ||
                             (filterVisibility === "Private" && !template.isPublic);
    
    // Enhanced access type filtering
    const accessMethods = template.accessMethods || template.access_methods || {};
    const matchesAccessType = filterAccessType === "All" || 
      (filterAccessType === "hotspot" && accessMethods.hotspot?.enabled) ||
      (filterAccessType === "pppoe" && accessMethods.pppoe?.enabled) ||
      (filterAccessType === "both" && accessMethods.hotspot?.enabled && accessMethods.pppoe?.enabled);
    
    return matchesSearch && matchesCategory && matchesVisibility && matchesAccessType;
  });

  // Get template statistics for display
  const templateStats = {
    total: templates.length,
    hotspot: templates.filter(t => (t.accessMethods || t.access_methods || {}).hotspot?.enabled).length,
    pppoe: templates.filter(t => (t.accessMethods || t.access_methods || {}).pppoe?.enabled).length,
    public: templates.filter(t => t.isPublic).length,
    private: templates.filter(t => !t.isPublic).length
  };

  // Toast Notification Component
  const ToastNotification = () => {
    if (!toast.visible) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.8 }}
        className={`fixed top-4 right-4 z-50 max-w-sm w-full ${
          toast.type === "success" 
            ? "bg-green-500 border-green-600" 
            : "bg-red-500 border-red-600"
        } text-white p-4 rounded-lg shadow-lg border`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {toast.type === "success" ? (
              <Check className="w-5 h-5 mr-2 flex-shrink-0" />
            ) : (
              <X className="w-5 h-5 mr-2 flex-shrink-0" />
            )}
            <span className="font-medium truncate">{toast.message}</span>
          </div>
          <button
            onClick={() => setToast({ visible: false, message: "", type: "success" })}
            className="ml-4 text-white hover:text-gray-200 transition-colors flex-shrink-0"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  };

  if (isLoading && viewMode === "browse") {
    return (
      <div className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${themeClasses.bg.primary}`}>
        <main className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
              aria-label="Go back"
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
        {/* Toast Notification */}
        <ToastNotification />

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 truncate">
                Plan Templates
              </h1>
              <p className={`mt-1 lg:mt-2 text-sm lg:text-lg ${themeClasses.text.secondary}`}>
                {viewMode === "browse" ? "Quick start with pre-configured plan templates" : 
                 viewMode === "create" ? "Create a new template" : 
                 viewMode === "type-select" ? "Select template type" : "Edit template"}
              </p>
            </div>
          </div>
          
          {viewMode === "browse" && (
            <div className="flex items-center space-x-3 flex-wrap gap-2">
              {/* Template Statistics */}
              <div className="hidden md:flex items-center space-x-4 text-sm text-gray-500 flex-wrap gap-2">
                <span>Total: {templateStats.total}</span>
                <span>Hotspot: {templateStats.hotspot}</span>
                <span>PPPoE: {templateStats.pppoe}</span>
              </div>
              
              {/* Refresh Button */}
              <motion.button
                onClick={fetchTemplates}
                disabled={isRefreshing}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Refresh Templates"
                aria-label="Refresh templates"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </motion.button>
              
              {/* New Template Button */}
              <motion.button
                onClick={() => setViewMode("type-select")}
                className={`px-4 py-2 rounded-lg flex items-center ${themeClasses.button.success} flex-shrink-0`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Create new template"
              >
                <Plus className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">New Template</span>
              </motion.button>
            </div>
          )}
        </div>

        {/* Browse View */}
        {viewMode === "browse" && (
          <>
            {/* Enhanced Filters */}
            <div className={`p-4 lg:p-6 rounded-xl shadow-lg ${themeClasses.bg.card}`}>
              <div className="flex flex-col lg:flex-row gap-4 items-end">
                {/* Search */}
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.text.tertiary}`} />
                    <input
                      type="text"
                      placeholder="Search templates by name or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                      aria-label="Search templates"
                    />
                  </div>
                </div>
                
                {/* Filter Group */}
                <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                  <div className="flex-1 min-w-[140px] lg:w-40">
                    <EnhancedSelect
                      value={filterCategory}
                      onChange={setFilterCategory}
                      options={[
                        { value: "All", label: "All Categories" },
                        ...categories.map(cat => ({ value: cat, label: cat }))
                      ]}
                      theme={theme}
                      aria-label="Filter by category"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-[120px] lg:w-32">
                    <EnhancedSelect
                      value={filterVisibility}
                      onChange={setFilterVisibility}
                      options={[
                        { value: "All", label: "All" },
                        { value: "Public", label: "Public" },
                        { value: "Private", label: "Private" }
                      ]}
                      theme={theme}
                      aria-label="Filter by visibility"
                    />
                  </div>

                  <div className="flex-1 min-w-[140px] lg:w-36">
                    <EnhancedSelect
                      value={filterAccessType}
                      onChange={setFilterAccessType}
                      options={[
                        { value: "All", label: "All Types" },
                        { value: "hotspot", label: "Hotspot Only" },
                        { value: "pppoe", label: "PPPoE Only" },
                        { value: "both", label: "Both Enabled" }
                      ]}
                      theme={theme}
                      aria-label="Filter by access type"
                    />
                  </div>
                </div>
              </div>

              {/* Results Summary */}
              <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <p className={`text-sm ${themeClasses.text.secondary}`}>
                  Showing {filteredTemplates.length} of {templates.length} templates
                </p>
                {(searchTerm || filterCategory !== "All" || filterVisibility !== "All" || filterAccessType !== "All") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterCategory("All");
                      setFilterVisibility("All");
                      setFilterAccessType("All");
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 whitespace-nowrap"
                    aria-label="Clear all filters"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>

            {/* Templates Grid */}
            {filteredTemplates.length === 0 ? (
              <div className={`rounded-xl shadow-lg p-8 sm:p-12 text-center ${themeClasses.bg.card}`}>
                <Box className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  {templates.length === 0 ? "No Templates Available" : "No Templates Found"}
                </h3>
                <p className={`mb-4 sm:mb-6 text-sm sm:text-base ${themeClasses.text.secondary}`}>
                  {templates.length === 0 
                    ? "Create your first template to get started!" 
                    : "Try adjusting your search or filters"}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setViewMode("type-select")}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg ${themeClasses.button.primary} text-sm sm:text-base`}
                    aria-label="Create first template"
                  >
                    <Plus className="w-4 h-4 mr-2 inline" />
                    Create First Template
                  </button>
                  <button
                    onClick={onBack}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg ${themeClasses.button.secondary} text-sm sm:text-base`}
                    aria-label="Back to plans"
                  >
                    Back to Plans
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                <AnimatePresence>
                  {filteredTemplates.map((template) => (
                    <TemplateCard 
                      key={template.id} 
                      template={template}
                      onSelect={setSelectedTemplate}
                      onApplyTemplate={handleApplyTemplate}
                      onCreateFromTemplate={handleCreateFromTemplate}
                      onEditTemplate={(template) => {
                        const formData = deepClone({
                          name: template.name,
                          description: template.description,
                          category: template.category,
                          basePrice: template.basePrice?.toString() || template.base_price?.toString() || "0",
                          isPublic: template.isPublic !== false,
                          isActive: template.isActive !== false,
                          priority_level: template.priority_level || 4,
                          router_specific: template.router_specific || false,
                          allowed_routers_ids: template.allowed_routers_ids || [],
                          FUP_policy: template.FUP_policy || "",
                          FUP_threshold: template.FUP_threshold || 80,
                          accessMethods: template.accessMethods || template.access_methods
                        });
                        
                        setTemplateForm(formData);
                        setTemplateType(formData.accessMethods?.hotspot?.enabled ? "hotspot" : "pppoe");
                        setSelectedTemplate(template);
                        setViewMode("edit");
                      }}
                      onDeleteTemplate={handleDeleteTemplate}
                      theme={theme}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        {/* Other view modes */}
        {viewMode === "type-select" && (
          <TemplateTypeSelection
            templateType={templateType}
            onTemplateTypeSelect={setTemplateType}
            onContinue={() => setViewMode("create")}
            theme={theme}
          />
        )}

        {(viewMode === "create" || viewMode === "edit") && (
          <TemplateForm
            templateForm={templateForm}
            templateType={templateType}
            viewMode={viewMode}
            isLoading={isLoading}
            onFormChange={(field, value) => setTemplateForm(prev => ({ ...prev, [field]: value }))}
            onAccessMethodChange={(method, field, value) => {
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
            }}
            onAccessMethodNestedChange={(method, parent, key, value) => {
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
            }}
            onCancel={() => {
              setViewMode("browse");
              setTemplateForm({
                name: "",
                description: "",
                category: "Residential",
                basePrice: "0",
                isPublic: true,
                isActive: true,
                priority_level: 4,
                router_specific: false,
                allowed_routers_ids: [],
                FUP_policy: "",
                FUP_threshold: 80,
                accessMethods: {
                  hotspot: {
                    enabled: true,
                    downloadSpeed: { value: "10", unit: "Mbps" },
                    uploadSpeed: { value: "5", unit: "Mbps" },
                    dataLimit: { value: "10", unit: "GB" },
                    usageLimit: { value: "24", unit: "Hours" },
                    bandwidthLimit: 0,
                    maxDevices: 1,
                    sessionTimeout: 86400,
                    idleTimeout: 300,
                    validityPeriod: { value: "30", unit: "Days" },
                    macBinding: false,
                  },
                  pppoe: {
                    enabled: false,
                    downloadSpeed: { value: "10", unit: "Mbps" },
                    uploadSpeed: { value: "5", unit: "Mbps" },
                    dataLimit: { value: "10", unit: "GB" },
                    usageLimit: { value: "24", unit: "Hours" },
                    bandwidthLimit: 0,
                    maxDevices: 1,
                    sessionTimeout: 86400,
                    idleTimeout: 300,
                    validityPeriod: { value: "30", unit: "Days" },
                    macBinding: false,
                    ipPool: "pppoe-pool-1",
                    serviceName: "",
                    mtu: 1492,
                  }
                }
              });
              setSelectedTemplate(null);
            }}
            onSubmit={async () => {
              setIsLoading(true);
              try {
                const templateData = {
                  name: templateForm.name.trim(),
                  description: templateForm.description.trim(),
                  category: templateForm.category,
                  basePrice: parseFloat(templateForm.basePrice) || 0,
                  isPublic: templateForm.isPublic,
                  isActive: templateForm.isActive,
                  priority_level: templateForm.priority_level,
                  router_specific: templateForm.router_specific,
                  allowed_routers_ids: templateForm.allowed_routers_ids,
                  FUP_policy: templateForm.FUP_policy,
                  FUP_threshold: templateForm.FUP_threshold,
                  accessMethods: templateForm.accessMethods
                };

                let response;
                if (viewMode === "create") {
                  response = await api.post("/api/internet_plans/templates/", templateData);
                  setTemplates(prev => [...prev, response.data]);
                  showToast(`Template "${templateForm.name}" created successfully!`);
                } else {
                  response = await api.put(`/api/internet_plans/templates/${selectedTemplate.id}/`, templateData);
                  setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? response.data : t));
                  showToast(`Template "${templateForm.name}" updated successfully!`);
                }

                setViewMode("browse");
                setSelectedTemplate(null);
              } catch (error) {
                console.error(`Error ${viewMode === "create" ? "creating" : "updating"} template:`, error);
                const errorMessage = error.response?.data?.detail || 
                                    error.response?.data?.error || 
                                    error.response?.data?.details?.[0] ||
                                    `Failed to ${viewMode === "create" ? "create" : "update"} template`;
                showToast(errorMessage, "error");
              } finally {
                setIsLoading(false);
              }
            }}
            theme={theme}
          />
        )}

        {/* Selected Template Preview */}
        {selectedTemplate && viewMode === "browse" && (
          <TemplatePreview
            template={selectedTemplate}
            onClose={() => setSelectedTemplate(null)}
            onApplyTemplate={handleApplyTemplate}
            onCreateFromTemplate={handleCreateFromTemplate}
            theme={theme}
          />
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, template: null })}
          onConfirm={confirmDeleteTemplate}
          title="Delete Template"
          message={`Are you sure you want to delete template "${deleteModal.template?.name}"? This action cannot be undone and will affect any plans using this template.`}
          confirmText="Delete Template"
          cancelText="Cancel"
          type="danger"
          theme={theme}
        />
      </main>
    </div>
  );
};

export default PlanTemplates;