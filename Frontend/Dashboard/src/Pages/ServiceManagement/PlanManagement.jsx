

// import React, { useState, useEffect, useMemo, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Plus, Pencil, Trash2, Copy, Eye, ChevronDown, ChevronUp, X, Save,
//   Users, Download, Upload, BarChart3, Wifi, Cable, Server, Check,
//   ArrowLeft, Settings, Zap, Clock, Shield, DollarSign, Package,
//   TrendingUp, PieChart, Box
// } from "lucide-react";
// import { FaSpinner } from "react-icons/fa";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// // Context and API
// import { useTheme } from "../../context/ThemeContext"
// import api from "../../api"

// // Shared components and utilities
// import { getThemeClasses, EnhancedSelect, ConfirmationModal, MobileSuccessAlert } from "../../components/ServiceManagement/Shared/components"
// import { deepClone, formatNumber, formatBandwidth, calculateRating } from "../../components/ServiceManagement/Shared/utils"
// import { planTypes, categories } from "../../components/ServiceManagement/Shared/constant"

// // Components
// import PlanList from "../../components/ServiceManagement/PlanManagement/PlanList"
// import PlanBasicDetails from "../../components/ServiceManagement/PlanManagement/PlanBasicDetails"
// import HotspotConfiguration from "../../components/ServiceManagement/PlanManagement/HotspotConfiguration"
// import PPPoEConfiguration from "../../components/ServiceManagement/PlanManagement/PPPoEConfiguration"
// import PlanAdvancedSettings from "../../components/ServiceManagement/PlanManagement/PlanAdvancedSettings"
// import PlanFeaturesRestrictions from "../../components/ServiceManagement/PlanManagement/PlanFeaturesRestrictions"
// import PlanAnalytics from "../../components/ServiceManagement/PlanManagement/PlanAnalytics"
// import PlanTemplates from "./PlanTemplates"

// // Hooks
// import usePlanForm, { getInitialFormState } from "../../components/ServiceManagement/PlanManagement/hooks/usePlanForm"

// // Data structure utilities
// const createDefaultAccessMethods = () => ({
//   hotspot: {
//     enabled: false,
//     downloadSpeed: { value: "", unit: "Mbps" },
//     uploadSpeed: { value: "", unit: "Mbps" },
//     dataLimit: { value: "", unit: "GB" },
//     usageLimit: { value: "", unit: "Hours" },
//     bandwidthLimit: 0,
//     concurrentConnections: 1,
//     sessionTimeout: 86400,
//     idleTimeout: 300,
//   },
//   pppoe: {
//     enabled: false,
//     downloadSpeed: { value: "", unit: "Mbps" },
//     uploadSpeed: { value: "", unit: "Mbps" },
//     dataLimit: { value: "", unit: "GB" },
//     usageLimit: { value: "", unit: "Hours" },
//     bandwidthLimit: 0,
//     concurrentConnections: 1,
//     ipPool: "pppoe-pool-1",
//     serviceName: "",
//     mtu: 1492,
//     dnsServers: ["8.8.8.8", "1.1.1.1"],
//     idleTimeout: 300,
//   }
// });

// const normalizePlanData = (plan) => {
//   const defaultState = getInitialFormState();
  
//   // Safely normalize access methods
//   let accessMethods = createDefaultAccessMethods();
//   if (plan.accessMethods || plan.access_methods) {
//     const sourceMethods = plan.accessMethods || plan.access_methods;
    
//     // Merge hotspot configuration
//     if (sourceMethods.hotspot) {
//       accessMethods.hotspot = {
//         ...accessMethods.hotspot,
//         ...sourceMethods.hotspot,
//         downloadSpeed: sourceMethods.hotspot.downloadSpeed || accessMethods.hotspot.downloadSpeed,
//         uploadSpeed: sourceMethods.hotspot.uploadSpeed || accessMethods.hotspot.uploadSpeed,
//         dataLimit: sourceMethods.hotspot.dataLimit || accessMethods.hotspot.dataLimit,
//         usageLimit: sourceMethods.hotspot.usageLimit || accessMethods.hotspot.usageLimit,
//       };
//     }
    
//     // Merge PPPoE configuration
//     if (sourceMethods.pppoe) {
//       accessMethods.pppoe = {
//         ...accessMethods.pppoe,
//         ...sourceMethods.pppoe,
//         downloadSpeed: sourceMethods.pppoe.downloadSpeed || accessMethods.pppoe.downloadSpeed,
//         uploadSpeed: sourceMethods.pppoe.uploadSpeed || accessMethods.pppoe.uploadSpeed,
//         dataLimit: sourceMethods.pppoe.dataLimit || accessMethods.pppoe.dataLimit,
//         usageLimit: sourceMethods.pppoe.usageLimit || accessMethods.pppoe.usageLimit,
//       };
//     }
//   }

//   return {
//     ...defaultState,
//     id: plan.id,
//     planType: plan.planType || plan.plan_type || "Paid",
//     name: plan.name || "",
//     price: plan.price?.toString() || "0",
//     active: plan.active !== undefined ? plan.active : true,
//     category: plan.category || "Residential",
//     description: plan.description || "",
//     purchases: plan.purchases || 0,
//     features: Array.isArray(plan.features) ? plan.features : [],
//     restrictions: Array.isArray(plan.restrictions) ? plan.restrictions : [],
//     accessMethods,
//     priority_level: plan.priority_level || 4,
//     router_specific: plan.router_specific || false,
//     allowed_routers_ids: plan.allowed_routers_ids || [],
//     FUP_policy: plan.FUP_policy || "",
//     FUP_threshold: plan.FUP_threshold || 80,
//     createdAt: plan.created_at || plan.createdAt || new Date().toISOString().split("T")[0],
//     client_sessions: plan.client_sessions || {},
//     template: plan.template || null,
//     has_enabled_access_methods: plan.has_enabled_access_methods || false,
//     enabled_access_methods: plan.enabled_access_methods || [],
//   };
// };

// const PlanManagement = () => {
//   const { theme } = useTheme();
//   const themeClasses = getThemeClasses(theme);
  
//   // Form management
//   const {
//     form,
//     setForm,
//     errors,
//     touched,
//     handleChange,
//     handleAccessMethodChange,
//     handleAccessMethodNestedChange,
//     handleFieldBlur,
//     validateForm,
//     resetForm,
//   } = usePlanForm();

//   // State management
//   const [plans, setPlans] = useState([]);
//   const [templates, setTemplates] = useState([]);
//   const [routers, setRouters] = useState([]);
//   const [subscriptions, setSubscriptions] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [viewMode, setViewMode] = useState("list");
//   const [editingPlan, setEditingPlan] = useState(null);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [activeTab, setActiveTab] = useState("basic");
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [planToDelete, setPlanToDelete] = useState(null);
//   const [mobileSuccessAlert, setMobileSuccessAlert] = useState({ visible: false, message: "" });

//   // Mobile success alert
//   const showMobileSuccess = useCallback((message) => {
//     setMobileSuccessAlert({ visible: true, message });
//     setTimeout(() => {
//       setMobileSuccessAlert({ visible: false, message: "" });
//     }, 3000);
//   }, []);

//   // Safe access to plan data
//   const getSafePlanAccessMethods = (plan) => {
//     if (!plan || !plan.accessMethods) return createDefaultAccessMethods();
//     return {
//       hotspot: plan.accessMethods.hotspot || createDefaultAccessMethods().hotspot,
//       pppoe: plan.accessMethods.pppoe || createDefaultAccessMethods().pppoe
//     };
//   };

//   // Check form validity
//   const isFormValid = useMemo(() => {
//     const hasBasicDetails = form.name?.trim() && form.category && 
//       (form.planType !== "Paid" || (form.price && parseFloat(form.price) > 0));
    
//     const accessMethods = getSafePlanAccessMethods(form);
//     const hasEnabledAccessMethods = Object.values(accessMethods).some(method => method.enabled);
    
//     if (!hasBasicDetails || !hasEnabledAccessMethods) return false;

//     // Check enabled access methods have required fields
//     for (const [method, config] of Object.entries(accessMethods)) {
//       if (config.enabled) {
//         if (!config.downloadSpeed?.value || !config.uploadSpeed?.value || 
//             !config.dataLimit?.value || !config.usageLimit?.value) {
//           return false;
//         }
//       }
//     }

//     return Object.keys(errors).length === 0;
//   }, [form, errors]);

//   // Fetch plans
//   const fetchPlans = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const response = await api.get("/api/internet_plans/");
//       const plansData = response.data.results || response.data;
      
//       if (!Array.isArray(plansData)) throw new Error("Expected an array of plans");
      
//       const normalizedPlans = plansData.map(normalizePlanData);
//       setPlans(normalizedPlans);
//     } catch (error) {
//       console.error("Error fetching plans:", error);
//       const message = "Failed to load plans from server";
//       if (window.innerWidth <= 768) {
//         showMobileSuccess(message);
//       } else {
//         toast.error(message);
//       }
//       setPlans([]);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [showMobileSuccess]);

//   // Fetch templates
//   const fetchTemplates = useCallback(async () => {
//     try {
//       const response = await api.get("/api/internet_plans/templates/");
//       const templatesData = response.data.results || response.data;
      
//       if (Array.isArray(templatesData)) {
//         setTemplates(templatesData);
//       }
//     } catch (error) {
//       console.error("Error fetching templates:", error);
//     }
//   }, []);

//   // Fetch routers
//   const fetchRouters = useCallback(async () => {
//     try {
//       const response = await api.get("/api/network_management/routers/");
//       setRouters(response.data);
//     } catch (error) {
//       console.error("Error fetching routers:", error);
//       const message = "Failed to load routers";
//       if (window.innerWidth <= 768) {
//         showMobileSuccess(message);
//       } else {
//         toast.error(message);
//       }
//       setRouters([]);
//     }
//   }, [showMobileSuccess]);

//   // Fetch subscriptions
//   const fetchSubscriptions = useCallback(async () => {
//     try {
//       const response = await api.get("/api/internet_plans/subscriptions/");
//       const subsData = response.data;
//       if (!Array.isArray(subsData)) throw new Error("Expected an array of subscriptions");
//       setSubscriptions(subsData);
//     } catch (error) {
//       console.error("Error fetching subscriptions:", error);
//       const message = "Failed to load subscriptions";
//       if (window.innerWidth <= 768) {
//         showMobileSuccess(message);
//       } else {
//         toast.error(message);
//       }
//       setSubscriptions([]);
//     }
//   }, [showMobileSuccess]);

//   // Load data on component mount
//   useEffect(() => {
//     fetchPlans();
//     fetchTemplates();
//   }, [fetchPlans, fetchTemplates]);

//   useEffect(() => {
//     if (viewMode === "form" || viewMode === "details") {
//       fetchRouters();
//     }
//     if (viewMode === "analytics") {
//       fetchSubscriptions();
//     }
//   }, [viewMode, fetchRouters, fetchSubscriptions]);

//   // Apply template from template list
//   const applyTemplate = useCallback((template) => {
//     const newForm = deepClone(getInitialFormState());
    
//     // Apply template settings
//     newForm.name = template.name || "";
//     newForm.category = template.category || "Residential";
//     newForm.price = template.basePrice?.toString() || template.base_price?.toString() || "0";
//     newForm.description = template.description || "";
    
//     // Safely apply access methods
//     if (template.accessMethods || template.access_methods) {
//       const templateMethods = template.accessMethods || template.access_methods;
//       newForm.accessMethods = {
//         hotspot: templateMethods.hotspot || createDefaultAccessMethods().hotspot,
//         pppoe: templateMethods.pppoe || createDefaultAccessMethods().pppoe
//       };
//     }
    
//     setForm(newForm);
//     setEditingPlan(null);
//     setActiveTab("basic");
//     setViewMode("form");
    
//     const message = `Template "${template.name}" applied`;
//     if (window.innerWidth <= 768) {
//       showMobileSuccess(message);
//     } else {
//       toast.success(message);
//     }
//   }, [setForm, showMobileSuccess]);

//   // Create plan from template (API call)
//   const createPlanFromTemplate = useCallback(async (templateId, additionalData = {}) => {
//     setIsLoading(true);
//     try {
//       const response = await api.post(`/api/internet_plans/templates/${templateId}/create-plan/`, additionalData);
      
//       const message = `Plan created from template successfully`;
//       if (window.innerWidth <= 768) {
//         showMobileSuccess(message);
//       } else {
//         toast.success(message);
//       }
      
//       fetchPlans();
//       setViewMode("list");
//     } catch (error) {
//       console.error("Error creating plan from template:", error);
//       const message = "Failed to create plan from template";
//       if (window.innerWidth <= 768) {
//         showMobileSuccess(message);
//       } else {
//         toast.error(`${message}: ${error.response?.data?.detail || error.message}`);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   }, [fetchPlans, showMobileSuccess]);

//   // Save plan
//   const savePlan = async () => {
//     if (!validateForm()) {
//       const message = "Please fix validation errors before saving";
//       if (window.innerWidth <= 768) {
//         showMobileSuccess(message);
//       } else {
//         toast.error(message);
//       }
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const planData = {
//         planType: form.planType,
//         name: form.name.trim(),
//         price: parseFloat(form.price) || 0,
//         active: form.active,
//         category: form.category,
//         description: form.description.trim(),
//         purchases: editingPlan ? editingPlan.purchases : 0,
//         features: form.features,
//         restrictions: form.restrictions,
//         accessMethods: form.accessMethods,
//         priority_level: form.priority_level,
//         router_specific: form.router_specific,
//         allowed_routers_ids: form.router_specific ? form.allowed_routers_ids : [],
//         FUP_policy: form.FUP_policy,
//         FUP_threshold: form.FUP_threshold,
//         template_id: form.template_id || null,
//       };

//       let response;
//       if (editingPlan) {
//         response = await api.put(`/api/internet_plans/${editingPlan.id}/`, planData);
//         setPlans(prev => prev.map(p => p.id === editingPlan.id ? normalizePlanData(response.data) : p));
//       } else {
//         response = await api.post("/api/internet_plans/", planData);
//         setPlans(prev => [...prev, normalizePlanData(response.data)]);
//       }

//       const message = `${editingPlan ? "Updated" : "Created"} plan: ${planData.name}`;
//       if (window.innerWidth <= 768) {
//         showMobileSuccess(message);
//       } else {
//         toast.success(message);
//       }

//       resetForm();
//       setEditingPlan(null);
//       setViewMode("list");
//     } catch (error) {
//       console.error("Error saving plan:", error);
//       const message = `Failed to ${editingPlan ? "update" : "create"} plan`;
//       if (window.innerWidth <= 768) {
//         showMobileSuccess(message);
//       } else {
//         toast.error(`${message}: ${error.response?.data?.detail || error.message}`);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Delete plan
//   const deletePlan = async (plan) => {
//     setIsLoading(true);
//     try {
//       await api.delete(`/api/internet_plans/${plan.id}/`);
//       setPlans(prev => prev.filter(p => p.id !== plan.id));
      
//       if (selectedPlan && selectedPlan.id === plan.id) {
//         setSelectedPlan(null);
//         setViewMode("list");
//       }

//       const message = `Deleted plan: ${plan.name}`;
//       if (window.innerWidth <= 768) {
//         showMobileSuccess(message);
//       } else {
//         toast.success(message);
//       }
//     } catch (error) {
//       console.error("Error deleting plan:", error);
//       const message = `Failed to delete plan: ${plan.name}`;
//       if (window.innerWidth <= 768) {
//         showMobileSuccess(message);
//       } else {
//         toast.error(message);
//       }
//     } finally {
//       setIsLoading(false);
//       setDeleteModalOpen(false);
//       setPlanToDelete(null);
//     }
//   };

//   // Confirm delete
//   const confirmDelete = useCallback((plan) => {
//     setPlanToDelete(plan);
//     setDeleteModalOpen(true);
//   }, []);

//   // Edit plan
//   const editPlan = useCallback((plan) => {
//     const normalizedPlan = normalizePlanData(plan);
//     setForm(deepClone(normalizedPlan));
//     setEditingPlan(deepClone(normalizedPlan));
//     setActiveTab("basic");
//     setViewMode("form");
//   }, [setForm]);

//   // View plan details
//   const viewPlanDetails = useCallback((plan) => {
//     const normalizedPlan = normalizePlanData(plan);
//     setSelectedPlan(normalizedPlan);
//     setViewMode("details");
//   }, []);

//   // Quick create from template
//   const quickCreateFromTemplate = useCallback(async (template) => {
//     const planName = prompt("Enter plan name:", template.name);
//     if (planName) {
//       await createPlanFromTemplate(template.id, { name: planName });
//     }
//   }, [createPlanFromTemplate]);

//   // Tabs configuration
//   const tabs = [
//     { id: "basic", label: "Basic Details", icon: Settings },
//     { id: "hotspot", label: "Hotspot Config", icon: Wifi },
//     { id: "pppoe", label: "PPPoE Config", icon: Cable },
//     { id: "advanced", label: "Advanced", icon: Server },
//     { id: "features", label: "Features", icon: Shield },
//   ];

//   // Render tabs
//   const renderTabs = () => (
//     <div className={`p-2 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <div className="flex flex-wrap gap-1 lg:gap-2">
//         {tabs.map((tab) => {
//           const IconComponent = tab.icon;
//           return (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`px-3 py-1 lg:px-4 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center gap-2 ${
//                 activeTab === tab.id 
//                   ? "bg-indigo-600 text-white" 
//                   : `${themeClasses.text.secondary} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`
//               }`}
//             >
//               <IconComponent className="w-3 h-3 lg:w-4 lg:h-4" />
//               <span className="hidden sm:inline">{tab.label}</span>
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );

//   // Render form content based on active tab
//   const renderFormContent = () => {
//     switch (activeTab) {
//       case "basic":
//         return (
//           <PlanBasicDetails
//             form={form}
//             errors={errors}
//             touched={touched}
//             onChange={handleChange}
//             onBlur={handleFieldBlur}
//             theme={theme}
//           />
//         );
//       case "hotspot":
//         return (
//           <HotspotConfiguration
//             form={form}
//             errors={errors}
//             onChange={handleAccessMethodChange}
//             onNestedChange={handleAccessMethodNestedChange}
//             theme={theme}
//           />
//         );
//       case "pppoe":
//         return (
//           <PPPoEConfiguration
//             form={form}
//             errors={errors}
//             onChange={handleAccessMethodChange}
//             onNestedChange={handleAccessMethodNestedChange}
//             theme={theme}
//           />
//         );
//       case "advanced":
//         return (
//           <PlanAdvancedSettings
//             form={form}
//             errors={errors}
//             onChange={handleChange}
//             routers={routers}
//             theme={theme}
//           />
//         );
//       case "features":
//         return (
//           <PlanFeaturesRestrictions
//             form={form}
//             onChange={handleChange}
//             theme={theme}
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   // Render plan details safely
//   const renderPlanDetails = () => {
//     if (!selectedPlan) return null;

//     const accessMethods = getSafePlanAccessMethods(selectedPlan);

//     return (
//       <div className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${themeClasses.bg.primary}`}>
//         <main className="max-w-6xl mx-auto space-y-6 lg:space-y-8">
//           {/* Header */}
//           <div className="flex items-center justify-between">
//             <div className="flex-1 min-w-0">
//               <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 truncate">
//                 {selectedPlan.name || 'Unnamed Plan'} Details
//               </h1>
//               <p className={`mt-1 lg:mt-2 text-sm lg:text-lg ${themeClasses.text.secondary}`}>
//                 Complete plan information and specifications
//               </p>
//             </div>
//             <div className="flex items-center space-x-2">
//               <motion.button 
//                 onClick={() => editPlan(selectedPlan)}
//                 className={`px-3 py-2 rounded-lg text-sm flex items-center ${themeClasses.button.primary}`}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 <Pencil className="w-4 h-4 mr-2" />
//                 <span className="hidden sm:inline">Edit</span>
//               </motion.button>
//               <motion.button 
//                 onClick={() => setViewMode("list")}
//                 className="p-2 hover:bg-opacity-20 hover:bg-gray-500 rounded-lg"
//                 whileHover={{ rotate: 90 }}
//               >
//                 <X className="w-5 h-5" />
//               </motion.button>
//             </div>
//           </div>

//           {/* Template Info */}
//           {selectedPlan.template && (
//             <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center">
//                   <Box className="w-5 h-5 text-blue-600 mr-3" />
//                   <div>
//                     <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
//                       Created from template:
//                     </span>
//                     <span className="text-sm text-blue-600 dark:text-blue-400 ml-2">
//                       {selectedPlan.template.name}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Plan Details Content */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
//             {/* Basic Information */}
//             <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//               <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center">
//                 <Settings className="w-5 h-5 mr-3 text-indigo-600" />
//                 Basic Information
//               </h3>
//               <div className="space-y-3">
//                 <div className="flex justify-between">
//                   <span className={themeClasses.text.secondary}>Type:</span>
//                   <span className={themeClasses.text.primary}>{selectedPlan.planType || 'N/A'}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className={themeClasses.text.secondary}>Category:</span>
//                   <span className={themeClasses.text.primary}>{selectedPlan.category || 'N/A'}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className={themeClasses.text.secondary}>Price:</span>
//                   <span className={themeClasses.text.primary}>
//                     {selectedPlan.planType === "Paid" ? `Ksh ${formatNumber(selectedPlan.price || 0)}` : "Free"}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className={themeClasses.text.secondary}>Status:</span>
//                   <span className={selectedPlan.active ? "text-green-600" : "text-red-600"}>
//                     {selectedPlan.active ? "Active" : "Inactive"}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className={themeClasses.text.secondary}>Subscribers:</span>
//                   <span className={themeClasses.text.primary}>{selectedPlan.purchases || 0}</span>
//                 </div>
//                 {selectedPlan.template && (
//                   <div className="flex justify-between">
//                     <span className={themeClasses.text.secondary}>Template:</span>
//                     <span className={themeClasses.text.primary}>{selectedPlan.template.name}</span>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Access Methods */}
//             <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//               <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center">
//                 <Zap className="w-5 h-5 mr-3 text-indigo-600" />
//                 Access Methods
//               </h3>
//               <div className="space-y-3">
//                 {Object.entries(accessMethods).map(([method, config]) => (
//                   <div key={method} className="flex justify-between items-center">
//                     <span className={themeClasses.text.secondary}>
//                       {method.toUpperCase()}:
//                     </span>
//                     <span className={config.enabled ? "text-green-600" : "text-red-600"}>
//                       {config.enabled ? "Enabled" : "Disabled"}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Hotspot Configuration */}
//             {accessMethods.hotspot.enabled && (
//               <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//                 <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center">
//                   <Wifi className="w-5 h-5 mr-3 text-indigo-600" />
//                   Hotspot Configuration
//                 </h3>
//                 <div className="space-y-3">
//                   <div className="flex justify-between">
//                     <span className={themeClasses.text.secondary}>Download:</span>
//                     <span className={themeClasses.text.primary}>
//                       {accessMethods.hotspot.downloadSpeed?.value || 'N/A'} {accessMethods.hotspot.downloadSpeed?.unit || 'Mbps'}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className={themeClasses.text.secondary}>Upload:</span>
//                     <span className={themeClasses.text.primary}>
//                       {accessMethods.hotspot.uploadSpeed?.value || 'N/A'} {accessMethods.hotspot.uploadSpeed?.unit || 'Mbps'}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className={themeClasses.text.secondary}>Data Limit:</span>
//                     <span className={themeClasses.text.primary}>
//                       {accessMethods.hotspot.dataLimit?.value || 'N/A'} {accessMethods.hotspot.dataLimit?.unit || 'GB'}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className={themeClasses.text.secondary}>Bandwidth:</span>
//                     <span className={themeClasses.text.primary}>
//                       {formatBandwidth(accessMethods.hotspot.bandwidthLimit || 0)}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* PPPoE Configuration */}
//             {accessMethods.pppoe.enabled && (
//               <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//                 <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center">
//                   <Cable className="w-5 h-5 mr-3 text-indigo-600" />
//                   PPPoE Configuration
//                 </h3>
//                 <div className="space-y-3">
//                   <div className="flex justify-between">
//                     <span className={themeClasses.text.secondary}>Download:</span>
//                     <span className={themeClasses.text.primary}>
//                       {accessMethods.pppoe.downloadSpeed?.value || 'N/A'} {accessMethods.pppoe.downloadSpeed?.unit || 'Mbps'}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className={themeClasses.text.secondary}>Upload:</span>
//                     <span className={themeClasses.text.primary}>
//                       {accessMethods.pppoe.uploadSpeed?.value || 'N/A'} {accessMethods.pppoe.uploadSpeed?.unit || 'Mbps'}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className={themeClasses.text.secondary}>Data Limit:</span>
//                     <span className={themeClasses.text.primary}>
//                       {accessMethods.pppoe.dataLimit?.value || 'N/A'} {accessMethods.pppoe.dataLimit?.unit || 'GB'}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className={themeClasses.text.secondary}>Bandwidth:</span>
//                     <span className={themeClasses.text.primary}>
//                       {formatBandwidth(accessMethods.pppoe.bandwidthLimit || 0)}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </main>
//       </div>
//     );
//   };

//   // Main render
//   return (
//     <>
//       {/* Analytics View */}
//       {viewMode === "analytics" && (
//         <PlanAnalytics
//           plans={plans}
//           subscriptions={subscriptions}
//           templates={templates}
//           onBack={() => setViewMode("list")}
//           theme={theme}
//         />
//       )}

//       {/* Templates View */}
//       {viewMode === "templates" && (
//         <PlanTemplates
//           templates={templates}
//           onApplyTemplate={applyTemplate}
//           onCreateFromTemplate={quickCreateFromTemplate}
//           onBack={() => setViewMode("list")}
//           theme={theme}
//         />
//       )}

//       {/* List View */}
//       {viewMode === "list" && (
//         <PlanList
//           plans={plans}
//           isLoading={isLoading}
//           onEditPlan={editPlan}
//           onViewDetails={viewPlanDetails}
//           onDeletePlan={confirmDelete}
//           onNewPlan={() => {
//             resetForm();
//             setEditingPlan(null);
//             setActiveTab("basic");
//             setViewMode("form");
//           }}
//           onViewAnalytics={() => setViewMode("analytics")}
//           onViewTemplates={() => setViewMode("templates")}
//           theme={theme}
//         />
//       )}

//       {/* Form View */}
//       {viewMode === "form" && (
//         <div className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${themeClasses.bg.primary}`}>
//           <main className="max-w-6xl mx-auto space-y-6 lg:space-y-8">
//             {/* Header */}
//             <div className="flex items-center justify-between">
//               <div className="flex-1 min-w-0">
//                 <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 truncate">
//                   {editingPlan ? "Edit Plan" : "Create New Plan"}
//                 </h1>
//                 <p className={`mt-1 lg:mt-2 text-sm lg:text-lg ${themeClasses.text.secondary}`}>
//                   {editingPlan ? "Update your internet plan details" : "Configure your new internet service plan"}
//                 </p>
//               </div>
//               <motion.button 
//                 onClick={() => {
//                   setViewMode("list");
//                   resetForm();
//                   setEditingPlan(null);
//                 }} 
//                 className="p-2 hover:bg-opacity-20 hover:bg-gray-500 rounded-lg flex-shrink-0"
//                 whileHover={{ rotate: 90 }}
//               >
//                 <X className="w-5 h-5 lg:w-6 lg:h-6" />
//               </motion.button>
//             </div>

//             {/* Template Info */}
//             {form.template_id && (
//               <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
//                 <div className="flex items-center">
//                   <Box className="w-5 h-5 text-blue-600 mr-3" />
//                   <span className="text-sm text-blue-700 dark:text-blue-300">
//                     This plan is based on a template. Modifications won't affect the original template.
//                   </span>
//                 </div>
//               </div>
//             )}

//             {/* Tabs */}
//             {renderTabs()}

//             {/* Form Content */}
//             <div className="space-y-4 lg:space-y-6">
//               {renderFormContent()}
//             </div>

//             {/* Form Actions */}
//             <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
//               <motion.button 
//                 onClick={() => {
//                   setViewMode("list");
//                   resetForm();
//                   setEditingPlan(null);
//                 }} 
//                 className={`px-4 py-2 lg:px-6 lg:py-2 rounded-lg shadow-md text-sm lg:text-base ${themeClasses.button.secondary}`}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 Cancel
//               </motion.button>
//               <motion.button 
//                 onClick={savePlan}
//                 disabled={!isFormValid || isLoading}
//                 className={`px-4 py-2 lg:px-6 lg:py-2 rounded-lg shadow-md flex items-center justify-center text-sm lg:text-base ${
//                   isFormValid && !isLoading ? themeClasses.button.success : 'bg-gray-400 cursor-not-allowed'
//                 }`}
//                 whileHover={isFormValid && !isLoading ? { scale: 1.05 } : {}}
//                 whileTap={isFormValid && !isLoading ? { scale: 0.95 } : {}}
//               >
//                 {isLoading ? (
//                   <FaSpinner className="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2 animate-spin" />
//                 ) : (
//                   <Save className="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2" />
//                 )}
//                 {isLoading ? "Saving..." : editingPlan ? "Update Plan" : "Create Plan"}
//               </motion.button>
//             </div>
//           </main>
//         </div>
//       )}

//       {/* Details View */}
//       {viewMode === "details" && renderPlanDetails()}

//       {/* Mobile Success Alert */}
//       <MobileSuccessAlert 
//         message={mobileSuccessAlert.message}
//         isVisible={mobileSuccessAlert.visible}
//         onClose={() => setMobileSuccessAlert({ visible: false, message: "" })}
//       />

//       {/* Delete Confirmation Modal */}
//       <ConfirmationModal
//         isOpen={deleteModalOpen}
//         onClose={() => {
//           setDeleteModalOpen(false);
//           setPlanToDelete(null);
//         }}
//         onConfirm={() => planToDelete && deletePlan(planToDelete)}
//         title="Delete Plan"
//         message={`Are you sure you want to delete "${planToDelete?.name}"? This action cannot be undone.`}
//         confirmText="Delete"
//         cancelText="Cancel"
//         type="danger"
//         theme={theme}
//       />

//       {/* Toast Container */}
//       <ToastContainer 
//         position="top-right" 
//         autoClose={3000} 
//         hideProgressBar={false} 
//         newestOnTop 
//         closeOnClick 
//         rtl={false} 
//         pauseOnFocusLoss 
//         draggable 
//         pauseOnHover 
//         theme={theme}
//       />
//     </>
//   );
// };

// export default PlanManagement;












import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Copy, Eye, ChevronDown, ChevronUp, X, Save,
  Users, Download, Upload, BarChart3, Wifi, Cable, Server, Check,
  ArrowLeft, Settings, Zap, Clock, Shield, DollarSign, Package,
  TrendingUp, PieChart, Box
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Context and API
import { useTheme } from "../../context/ThemeContext"
import api from "../../api"

// Shared components and utilities
import { getThemeClasses, EnhancedSelect, ConfirmationModal, MobileSuccessAlert } from "../../components/ServiceManagement/Shared/components"
import { deepClone, formatNumber, formatBandwidth, calculateRating, validateRequired, validatePrice } from "../../components/ServiceManagement/Shared/utils"
import { planTypes, categories } from "../../components/ServiceManagement/Shared/constant"

// Components
import PlanList from "../../components/ServiceManagement/PlanManagement/PlanList"
import PlanBasicDetails from "../../components/ServiceManagement/PlanManagement/PlanBasicDetails"
import HotspotConfiguration from "../../components/ServiceManagement/PlanManagement/HotspotConfiguration"
import PPPoEConfiguration from "../../components/ServiceManagement/PlanManagement/PPPoEConfiguration"
import PlanAdvancedSettings from "../../components/ServiceManagement/PlanManagement/PlanAdvancedSettings"
import PlanAnalytics from "../../components/ServiceManagement/PlanManagement/PlanAnalytics"
import PlanTemplates from "./PlanTemplates"
import PlanTypeSelectionModal from "../../components/ServiceManagement/PlanManagement/PlanTypeSelectionModal"
import AnalyticsTypeSelectionModal from "../../components/ServiceManagement/PlanManagement/AnalyticsTypeSelectionModal"

// Hooks
import usePlanForm, { getInitialFormState } from "../../components/ServiceManagement/PlanManagement/hooks/usePlanForm"

// Data structure utilities
const createDefaultAccessMethods = () => ({
  hotspot: {
    enabled: false,
    downloadSpeed: { value: "", unit: "Mbps" },
    uploadSpeed: { value: "", unit: "Mbps" },
    dataLimit: { value: "", unit: "GB" },
    usageLimit: { value: "", unit: "Hours" },
    bandwidthLimit: 0,
    maxDevices: 1,
    sessionTimeout: 86400,
    idleTimeout: 300,
    validityPeriod: { value: 720, unit: "Hours" },
    macBinding: false,
  },
  pppoe: {
    enabled: false,
    downloadSpeed: { value: "", unit: "Mbps" },
    uploadSpeed: { value: "", unit: "Mbps" },
    dataLimit: { value: "", unit: "GB" },
    usageLimit: { value: "", unit: "Hours" },
    bandwidthLimit: 0,
    maxDevices: 1,
    sessionTimeout: 86400,
    idleTimeout: 300,
    validityPeriod: { value: 720, unit: "Hours" },
    macBinding: false,
    ipPool: "pppoe-pool-1",
    serviceName: "",
    mtu: 1492,
    dnsServers: ["8.8.8.8", "1.1.1.1"],
  }
});

const normalizePlanData = (plan) => {
  const defaultState = getInitialFormState();
  
  // Determine access type from enabled methods
  let accessType = "hotspot";
  if (plan.accessMethods || plan.access_methods) {
    const sourceMethods = plan.accessMethods || plan.access_methods;
    if (sourceMethods.pppoe?.enabled) {
      accessType = "pppoe";
    } else if (sourceMethods.hotspot?.enabled) {
      accessType = "hotspot";
    }
  }

  // Safely normalize access methods
  let accessMethods = createDefaultAccessMethods();
  if (plan.accessMethods || plan.access_methods) {
    const sourceMethods = plan.accessMethods || plan.access_methods;
    
    // Merge hotspot configuration
    if (sourceMethods.hotspot) {
      accessMethods.hotspot = {
        ...accessMethods.hotspot,
        ...sourceMethods.hotspot,
        downloadSpeed: sourceMethods.hotspot.downloadSpeed || accessMethods.hotspot.downloadSpeed,
        uploadSpeed: sourceMethods.hotspot.uploadSpeed || accessMethods.hotspot.uploadSpeed,
        dataLimit: sourceMethods.hotspot.dataLimit || accessMethods.hotspot.dataLimit,
        usageLimit: sourceMethods.hotspot.usageLimit || accessMethods.hotspot.usageLimit,
        // Ensure new fields have defaults
        maxDevices: sourceMethods.hotspot.maxDevices || 1,
        sessionTimeout: sourceMethods.hotspot.sessionTimeout || 86400,
        idleTimeout: sourceMethods.hotspot.idleTimeout || 300,
        validityPeriod: sourceMethods.hotspot.validityPeriod || { value: 720, unit: "Hours" },
        macBinding: sourceMethods.hotspot.macBinding || false,
      };
    }
    
    // Merge PPPoE configuration
    if (sourceMethods.pppoe) {
      accessMethods.pppoe = {
        ...accessMethods.pppoe,
        ...sourceMethods.pppoe,
        downloadSpeed: sourceMethods.pppoe.downloadSpeed || accessMethods.pppoe.downloadSpeed,
        uploadSpeed: sourceMethods.pppoe.uploadSpeed || accessMethods.pppoe.uploadSpeed,
        dataLimit: sourceMethods.pppoe.dataLimit || accessMethods.pppoe.dataLimit,
        usageLimit: sourceMethods.pppoe.usageLimit || accessMethods.pppoe.usageLimit,
        // Ensure new fields have defaults
        maxDevices: sourceMethods.pppoe.maxDevices || 1,
        sessionTimeout: sourceMethods.pppoe.sessionTimeout || 86400,
        idleTimeout: sourceMethods.pppoe.idleTimeout || 300,
        validityPeriod: sourceMethods.pppoe.validityPeriod || { value: 720, unit: "Hours" },
        macBinding: sourceMethods.pppoe.macBinding || false,
        ipPool: sourceMethods.pppoe.ipPool || "pppoe-pool-1",
      };
    }
  }

  return {
    ...defaultState,
    id: plan.id,
    accessType, // Set access type
    planType: plan.planType || plan.plan_type || "Paid",
    name: plan.name || "",
    price: plan.price?.toString() || "0",
    active: plan.active !== undefined ? plan.active : true,
    category: plan.category || "Residential",
    description: plan.description || "",
    purchases: plan.purchases || 0,
    accessMethods,
    priority_level: plan.priority_level || 4,
    router_specific: plan.router_specific || false,
    allowed_routers_ids: plan.allowed_routers_ids || [],
    FUP_policy: plan.FUP_policy || "",
    FUP_threshold: plan.FUP_threshold || 80,
    createdAt: plan.created_at || plan.createdAt || new Date().toISOString().split("T")[0],
    client_sessions: plan.client_sessions || {},
    template: plan.template || null,
    has_enabled_access_methods: plan.has_enabled_access_methods || false,
    enabled_access_methods: plan.enabled_access_methods || [],
  };
};

const PlanManagement = () => {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  
  // Form management
  const {
    form,
    setForm,
    errors,
    touched,
    handleChange,
    handleAccessTypeChange,
    handleAccessMethodChange,
    handleAccessMethodNestedChange,
    handleFieldBlur,
    validateForm,
    resetForm,
  } = usePlanForm();

  // State management
  const [plans, setPlans] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [routers, setRouters] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [editingPlan, setEditingPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [mobileSuccessAlert, setMobileSuccessAlert] = useState({ visible: false, message: "" });
  const [showPlanTypeModal, setShowPlanTypeModal] = useState(false);

  // Add these state variables to your main PlanManagement component
  const [showAnalyticsTypeModal, setShowAnalyticsTypeModal] = useState(false);
  const [selectedAnalyticsType, setSelectedAnalyticsType] = useState(null);

  // Mobile success alert
  const showMobileSuccess = useCallback((message) => {
    setMobileSuccessAlert({ visible: true, message });
    setTimeout(() => {
      setMobileSuccessAlert({ visible: false, message: "" });
    }, 3000);
  }, []);

  // Add this function to handle analytics type selection
  const handleAnalyticsTypeSelect = (analyticsType) => {
    setSelectedAnalyticsType(analyticsType);
    setShowAnalyticsTypeModal(false);
    setViewMode("analytics");
  };

  // Get active access method configuration
  const getActiveAccessMethod = useCallback(() => {
    return form.accessMethods[form.accessType];
  }, [form]);

  // Enhanced form validation
  const validateFormEnhanced = useCallback(() => {
    const newErrors = {};
    
    // Basic validations
    newErrors.name = validateRequired(form.name, 'Plan name');
    newErrors.category = validateRequired(form.category, 'Category');
    newErrors.price = validatePrice(form.price, form.planType);
    
    // Access method validations - only validate the enabled method
    const activeMethod = form.accessMethods[form.accessType];
    
    if (activeMethod.enabled) {
      // Speed validations
      newErrors[`${form.accessType}_downloadSpeed`] = validateRequired(
        activeMethod.downloadSpeed.value, 
        `${form.accessType.toUpperCase()} Download Speed`
      );
      newErrors[`${form.accessType}_uploadSpeed`] = validateRequired(
        activeMethod.uploadSpeed.value, 
        `${form.accessType.toUpperCase()} Upload Speed`
      );
      
      // Data limit validation
      if (activeMethod.dataLimit.unit !== 'Unlimited') {
        newErrors[`${form.accessType}_dataLimit`] = validateRequired(
          activeMethod.dataLimit.value, 
          `${form.accessType.toUpperCase()} Data Limit`
        );
      }
      
      // Usage limit validation
      if (activeMethod.usageLimit.unit !== 'Unlimited') {
        newErrors[`${form.accessType}_usageLimit`] = validateRequired(
          activeMethod.usageLimit.value, 
          `${form.accessType.toUpperCase()} Usage Limit`
        );
      }
      
      // Validity period validation
      if (activeMethod.validityPeriod.unit !== 'Unlimited' && activeMethod.validityPeriod.value !== '0') {
        newErrors[`${form.accessType}_validityPeriod`] = validateRequired(
          activeMethod.validityPeriod.value, 
          `${form.accessType.toUpperCase()} Validity Period`
        );
      }
    }

    // Remove empty errors
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    return Object.keys(newErrors).length === 0;
  }, [form]);

  // Check form validity
  const isFormValid = useMemo(() => {
    // Check basic details
    const hasBasicDetails = form.name?.trim() && form.category && 
      (form.planType !== "Paid" || (form.price && parseFloat(form.price) > 0));
    
    const activeMethod = form.accessMethods[form.accessType];
    const hasEnabledAccessMethods = activeMethod.enabled;

    if (!hasBasicDetails || !hasEnabledAccessMethods) return false;

    // Check enabled access method has required fields
    if (activeMethod.enabled) {
      // Check speeds
      if (!activeMethod.downloadSpeed?.value || !activeMethod.uploadSpeed?.value) {
        return false;
      }
      
      // Check data limit if not unlimited
      if (activeMethod.dataLimit.unit !== 'Unlimited' && !activeMethod.dataLimit.value) {
        return false;
      }
      
      // Check usage limit if not unlimited
      if (activeMethod.usageLimit.unit !== 'Unlimited' && !activeMethod.usageLimit.value) {
        return false;
      }
      
      // Check validity period if not unlimited/no expiry
      if (activeMethod.validityPeriod.unit !== 'Unlimited' && 
          activeMethod.validityPeriod.value !== '0' && 
          !activeMethod.validityPeriod.value) {
        return false;
      }
    }

    return Object.keys(errors).length === 0;
  }, [form, errors]);

  // Fetch plans
  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/internet_plans/");
      const plansData = response.data.results || response.data;
      
      if (!Array.isArray(plansData)) throw new Error("Expected an array of plans");
      
      const normalizedPlans = plansData.map(normalizePlanData);
      setPlans(normalizedPlans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      const message = "Failed to load plans from server";
      if (window.innerWidth <= 768) {
        showMobileSuccess(message);
      } else {
        toast.error(message);
      }
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  }, [showMobileSuccess]);

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    try {
      const response = await api.get("/api/internet_plans/templates/");
      const templatesData = response.data.results || response.data;
      
      if (Array.isArray(templatesData)) {
        setTemplates(templatesData);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  }, []);

  // Fetch routers
  const fetchRouters = useCallback(async () => {
    try {
      const response = await api.get("/api/network_management/routers/");
      setRouters(response.data);
    } catch (error) {
      console.error("Error fetching routers:", error);
      const message = "Failed to load routers";
      if (window.innerWidth <= 768) {
        showMobileSuccess(message);
      } else {
        toast.error(message);
      }
      setRouters([]);
    }
  }, [showMobileSuccess]);

  // Fetch subscriptions
  const fetchSubscriptions = useCallback(async () => {
    try {
      const response = await api.get("/api/internet_plans/subscriptions/");
      const subsData = response.data;
      if (!Array.isArray(subsData)) throw new Error("Expected an array of subscriptions");
      setSubscriptions(subsData);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      const message = "Failed to load subscriptions";
      if (window.innerWidth <= 768) {
        showMobileSuccess(message);
      } else {
        toast.error(message);
      }
      setSubscriptions([]);
    }
  }, [showMobileSuccess]);

  // Load data on component mount
  useEffect(() => {
    fetchPlans();
    fetchTemplates();
  }, [fetchPlans, fetchTemplates]);

  useEffect(() => {
    if (viewMode === "form" || viewMode === "details") {
      fetchRouters();
    }
    if (viewMode === "analytics") {
      fetchSubscriptions();
    }
  }, [viewMode, fetchRouters, fetchSubscriptions]);

  // Start plan creation with specific access type
  const startNewPlan = useCallback((accessType = "hotspot") => {
    resetForm();
    handleAccessTypeChange(accessType);
    setEditingPlan(null);
    setActiveTab("basic");
    setViewMode("form");
    setShowPlanTypeModal(false);
  }, [resetForm, handleAccessTypeChange]);

  // Apply template from template list
  const applyTemplate = useCallback((template) => {
    const newForm = deepClone(getInitialFormState());
    
    // Apply template settings
    newForm.name = template.name || "";
    newForm.category = template.category || "Residential";
    newForm.price = template.basePrice?.toString() || template.base_price?.toString() || "0";
    newForm.description = template.description || "";
    newForm.accessType = template.accessType || "hotspot";
    
    // Safely apply access methods based on template access type
    if (template.accessMethods || template.access_methods) {
      const templateMethods = template.accessMethods || template.access_methods;
      newForm.accessMethods = {
        hotspot: templateMethods.hotspot || createDefaultAccessMethods().hotspot,
        pppoe: templateMethods.pppoe || createDefaultAccessMethods().pppoe
      };
    }
    
    setForm(newForm);
    setEditingPlan(null);
    setActiveTab("basic");
    setViewMode("form");
    
    const message = `Template "${template.name}" applied`;
    if (window.innerWidth <= 768) {
      showMobileSuccess(message);
    } else {
      toast.success(message);
    }
  }, [setForm, showMobileSuccess]);

  // Create plan from template (API call)
  const createPlanFromTemplate = useCallback(async (templateId, additionalData = {}) => {
    setIsLoading(true);
    try {
      const response = await api.post(`/api/internet_plans/templates/${templateId}/create-plan/`, additionalData);
      
      const message = `Plan created from template successfully`;
      if (window.innerWidth <= 768) {
        showMobileSuccess(message);
      } else {
        toast.success(message);
      }
      
      fetchPlans();
      setViewMode("list");
    } catch (error) {
      console.error("Error creating plan from template:", error);
      const message = "Failed to create plan from template";
      if (window.innerWidth <= 768) {
        showMobileSuccess(message);
      } else {
        toast.error(`${message}: ${error.response?.data?.detail || error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchPlans, showMobileSuccess]);

  // Enhanced save plan function
  const savePlan = async () => {
    if (!validateFormEnhanced()) {
      const message = "Please fix validation errors before saving";
      if (window.innerWidth <= 768) {
        showMobileSuccess(message);
      } else {
        toast.error(message);
      }
      return;
    }

    setIsLoading(true);
    try {
      // Prepare the plan data with all new features
      const planData = {
        planType: form.planType,
        name: form.name.trim(),
        price: parseFloat(form.price) || 0,
        active: form.active,
        category: form.category,
        description: form.description.trim(),
        purchases: editingPlan ? editingPlan.purchases : 0,
        accessMethods: {
          hotspot: {
            ...form.accessMethods.hotspot,
            // Ensure numeric values are properly formatted
            bandwidthLimit: parseInt(form.accessMethods.hotspot.bandwidthLimit) || 0,
            maxDevices: parseInt(form.accessMethods.hotspot.maxDevices) || 1,
            sessionTimeout: parseInt(form.accessMethods.hotspot.sessionTimeout) || 86400,
            idleTimeout: parseInt(form.accessMethods.hotspot.idleTimeout) || 300,
          },
          pppoe: {
            ...form.accessMethods.pppoe,
            bandwidthLimit: parseInt(form.accessMethods.pppoe.bandwidthLimit) || 0,
            maxDevices: parseInt(form.accessMethods.pppoe.maxDevices) || 1,
            sessionTimeout: parseInt(form.accessMethods.pppoe.sessionTimeout) || 86400,
            idleTimeout: parseInt(form.accessMethods.pppoe.idleTimeout) || 300,
          }
        },
        priority_level: form.priority_level,
        router_specific: form.router_specific,
        allowed_routers_ids: form.router_specific ? form.allowed_routers_ids : [],
        FUP_policy: form.FUP_policy,
        FUP_threshold: form.FUP_threshold,
        template_id: form.template_id || null,
        created_at: editingPlan ? editingPlan.createdAt : new Date().toISOString(),
      };

      let response;
      if (editingPlan) {
        // UPDATE operation
        response = await api.put(`/api/internet_plans/${editingPlan.id}/`, planData);
        setPlans(prev => prev.map(p => p.id === editingPlan.id ? normalizePlanData(response.data) : p));
        
        const message = `Successfully updated plan: ${planData.name}`;
        if (window.innerWidth <= 768) {
          showMobileSuccess(message);
        } else {
          toast.success(message);
        }
      } else {
        // CREATE operation
        response = await api.post("/api/internet_plans/", planData);
        const newPlan = normalizePlanData(response.data);
        setPlans(prev => [...prev, newPlan]);
        
        const message = `Successfully created plan: ${planData.name}`;
        if (window.innerWidth <= 768) {
          showMobileSuccess(message);
        } else {
          toast.success(message);
        }
      }

      // Reset form and return to list view
      resetForm();
      setEditingPlan(null);
      setViewMode("list");
      
    } catch (error) {
      console.error("Error saving plan:", error);
      const message = `Failed to ${editingPlan ? "update" : "create"} plan`;
      const errorDetail = error.response?.data?.detail || error.response?.data?.message || error.message;
      
      if (window.innerWidth <= 768) {
        showMobileSuccess(`${message}: ${errorDetail}`);
      } else {
        toast.error(`${message}: ${errorDetail}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced delete with confirmation
  const confirmDelete = useCallback((plan) => {
    setPlanToDelete(plan);
    setDeleteModalOpen(true);
  }, []);

  const deletePlan = async () => {
    if (!planToDelete) return;
    
    setIsLoading(true);
    try {
      await api.delete(`/api/internet_plans/${planToDelete.id}/`);
      setPlans(prev => prev.filter(p => p.id !== planToDelete.id));
      
      if (selectedPlan && selectedPlan.id === planToDelete.id) {
        setSelectedPlan(null);
        setViewMode("list");
      }

      const message = `Successfully deleted plan: ${planToDelete.name}`;
      if (window.innerWidth <= 768) {
        showMobileSuccess(message);
      } else {
        toast.success(message);
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
      const message = `Failed to delete plan: ${planToDelete.name}`;
      const errorDetail = error.response?.data?.detail || error.message;
      
      if (window.innerWidth <= 768) {
        showMobileSuccess(`${message}: ${errorDetail}`);
      } else {
        toast.error(`${message}: ${errorDetail}`);
      }
    } finally {
      setIsLoading(false);
      setDeleteModalOpen(false);
      setPlanToDelete(null);
    }
  };

  // Edit plan
  const editPlan = useCallback((plan) => {
    const normalizedPlan = normalizePlanData(plan);
    setForm(deepClone(normalizedPlan));
    setEditingPlan(deepClone(normalizedPlan));
    setActiveTab("basic");
    setViewMode("form");
  }, [setForm]);

  // View plan details
  const viewPlanDetails = useCallback((plan) => {
    const normalizedPlan = normalizePlanData(plan);
    setSelectedPlan(normalizedPlan);
    setViewMode("details");
  }, []);

  // Quick create from template
  const quickCreateFromTemplate = useCallback(async (template) => {
    const planName = prompt("Enter plan name:", template.name);
    if (planName) {
      await createPlanFromTemplate(template.id, { name: planName });
    }
  }, [createPlanFromTemplate]);

  // Dynamic tabs based on access type
  const getTabs = useCallback(() => {
    const baseTabs = [
      { id: "basic", label: "Basic Details", icon: Settings },
      { id: "advanced", label: "Advanced", icon: Server },
    ];

    // Add access-specific tab
    if (form.accessType === "hotspot") {
      baseTabs.splice(1, 0, { id: "hotspot", label: "Hotspot Configuration", icon: Wifi });
    } else {
      baseTabs.splice(1, 0, { id: "pppoe", label: "PPPoE Configuration", icon: Cable });
    }

    return baseTabs;
  }, [form.accessType]);

  // Render tabs
  const renderTabs = () => {
    const tabs = getTabs();
    
    return (
      <div className={`p-2 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
        <div className="flex flex-wrap gap-1 lg:gap-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1 lg:px-4 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === tab.id 
                    ? "bg-indigo-600 text-white" 
                    : `${themeClasses.text.secondary} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`
                }`}
              >
                <IconComponent className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Render form content based on active tab
  const renderFormContent = () => {
    switch (activeTab) {
      case "basic":
        return (
          <PlanBasicDetails
            form={form}
            errors={errors}
            touched={touched}
            onChange={handleChange}
            onAccessTypeChange={handleAccessTypeChange}
            onBlur={handleFieldBlur}
            theme={theme}
          />
        );
      case "hotspot":
        return (
          <HotspotConfiguration
            form={form}
            errors={errors}
            onChange={handleAccessMethodChange}
            onNestedChange={handleAccessMethodNestedChange}
            theme={theme}
          />
        );
      case "pppoe":
        return (
          <PPPoEConfiguration
            form={form}
            errors={errors}
            onChange={handleAccessMethodChange}
            onNestedChange={handleAccessMethodNestedChange}
            theme={theme}
          />
        );
      case "advanced":
        return (
          <PlanAdvancedSettings
            form={form}
            errors={errors}
            onChange={handleChange}
            routers={routers}
            theme={theme}
          />
        );
      default:
        return null;
    }
  };

  // Render plan details safely
  const renderPlanDetails = () => {
    if (!selectedPlan) return null;

    const activeMethod = selectedPlan.accessMethods[selectedPlan.accessType];

    return (
      <div className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${themeClasses.bg.primary}`}>
        <main className="max-w-6xl mx-auto space-y-6 lg:space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 truncate">
                {selectedPlan.name || 'Unnamed Plan'} Details
              </h1>
              <p className={`mt-1 lg:mt-2 text-sm lg:text-lg ${themeClasses.text.secondary}`}>
                Complete plan information and specifications
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button 
                onClick={() => editPlan(selectedPlan)}
                className={`px-3 py-2 rounded-lg text-sm flex items-center ${themeClasses.button.primary}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Pencil className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Edit</span>
              </motion.button>
              <motion.button 
                onClick={() => setViewMode("list")}
                className="p-2 hover:bg-opacity-20 hover:bg-gray-500 rounded-lg"
                whileHover={{ rotate: 90 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Access Type Badge */}
          <div className={`p-4 rounded-lg border ${
            selectedPlan.accessType === 'hotspot' 
              ? (theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200')
              : (theme === 'dark' ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200')
          }`}>
            <div className="flex items-center">
              {selectedPlan.accessType === 'hotspot' ? (
                <Wifi className="w-5 h-5 text-blue-600 mr-3" />
              ) : (
                <Cable className="w-5 h-5 text-green-600 mr-3" />
              )}
              <div>
                <span className="text-sm font-medium">
                  {selectedPlan.accessType === 'hotspot' ? 'Hotspot Plan' : 'PPPoE Plan'}
                </span>
                {selectedPlan.template && (
                  <span className="text-sm ml-2">
                    • Created from template: {selectedPlan.template.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Plan Details Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Basic Information */}
            <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
              <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-3 text-indigo-600" />
                Basic Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={themeClasses.text.secondary}>Type:</span>
                  <span className={themeClasses.text.primary}>{selectedPlan.planType || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={themeClasses.text.secondary}>Access Type:</span>
                  <span className={themeClasses.text.primary}>
                    {selectedPlan.accessType === 'hotspot' ? 'Hotspot' : 'PPPoE'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={themeClasses.text.secondary}>Category:</span>
                  <span className={themeClasses.text.primary}>{selectedPlan.category || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={themeClasses.text.secondary}>Price:</span>
                  <span className={themeClasses.text.primary}>
                    {selectedPlan.planType === "Paid" ? `Ksh ${formatNumber(selectedPlan.price || 0)}` : "Free"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={themeClasses.text.secondary}>Status:</span>
                  <span className={selectedPlan.active ? "text-green-600" : "text-red-600"}>
                    {selectedPlan.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={themeClasses.text.secondary}>Subscribers:</span>
                  <span className={themeClasses.text.primary}>{selectedPlan.purchases || 0}</span>
                </div>
              </div>
            </div>

            {/* Configuration Details */}
            <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
              <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-3 text-indigo-600" />
                {selectedPlan.accessType === 'hotspot' ? 'Hotspot' : 'PPPoE'} Configuration
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={themeClasses.text.secondary}>Download:</span>
                  <span className={themeClasses.text.primary}>
                    {activeMethod.downloadSpeed?.value || 'N/A'} {activeMethod.downloadSpeed?.unit || 'Mbps'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={themeClasses.text.secondary}>Upload:</span>
                  <span className={themeClasses.text.primary}>
                    {activeMethod.uploadSpeed?.value || 'N/A'} {activeMethod.uploadSpeed?.unit || 'Mbps'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={themeClasses.text.secondary}>Data Limit:</span>
                  <span className={themeClasses.text.primary}>
                    {activeMethod.dataLimit?.value || 'N/A'} {activeMethod.dataLimit?.unit || 'GB'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={themeClasses.text.secondary}>Max Devices:</span>
                  <span className={themeClasses.text.primary}>
                    {activeMethod.maxDevices === 0 ? 'Unlimited' : activeMethod.maxDevices}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={themeClasses.text.secondary}>Session Timeout:</span>
                  <span className={themeClasses.text.primary}>
                    {activeMethod.sessionTimeout === 0 ? 'No Limit' : `${activeMethod.sessionTimeout / 3600} Hours`}
                  </span>
                </div>
                {selectedPlan.accessType === 'pppoe' && (
                  <div className="flex justify-between">
                    <span className={themeClasses.text.secondary}>IP Pool:</span>
                    <span className={themeClasses.text.primary}>
                      {activeMethod.ipPool || 'N/A'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  };

  // Main render
  return (
    <>
      {/* Update the analytics view to show filtered data */}
      {viewMode === "analytics" && (
        <PlanAnalytics
          plans={plans.filter(plan => 
            selectedAnalyticsType ? plan.accessType === selectedAnalyticsType : true
          )}
          subscriptions={subscriptions}
          templates={templates}
          onBack={() => {
            setViewMode("list");
            setSelectedAnalyticsType(null);
          }}
          analyticsType={selectedAnalyticsType}
          theme={theme}
        />
      )}

      {/* Templates View */}
      {viewMode === "templates" && (
        <PlanTemplates
          templates={templates}
          onApplyTemplate={applyTemplate}
          onCreateFromTemplate={quickCreateFromTemplate}
          onBack={() => setViewMode("list")}
          theme={theme}
        />
      )}

      {/* List View */}
      {viewMode === "list" && (
        <PlanList
          plans={plans}
          isLoading={isLoading}
          onEditPlan={editPlan}
          onViewDetails={viewPlanDetails}
          onDeletePlan={confirmDelete}
          onNewPlan={() => setShowPlanTypeModal(true)}
          // Update the analytics button in PlanList to open the modal
          onViewAnalytics={() => setShowAnalyticsTypeModal(true)}
          onViewTemplates={() => setViewMode("templates")}
          theme={theme}
        />
      )}

      {/* Plan Type Selection Modal */}
      <PlanTypeSelectionModal
        isOpen={showPlanTypeModal}
        onClose={() => setShowPlanTypeModal(false)}
        onSelect={startNewPlan}
        theme={theme}
      />

      {/* Add the AnalyticsTypeSelectionModal to your main render */}
      <AnalyticsTypeSelectionModal
        isOpen={showAnalyticsTypeModal}
        onClose={() => setShowAnalyticsTypeModal(false)}
        onSelect={handleAnalyticsTypeSelect}
        plans={plans}
        theme={theme}
      />

      {/* Form View */}
      {viewMode === "form" && (
        <div className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${themeClasses.bg.primary}`}>
          <main className="max-w-6xl mx-auto space-y-6 lg:space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 truncate">
                  {editingPlan ? "Edit Plan" : "Create New Plan"}
                </h1>
                <p className={`mt-1 lg:mt-2 text-sm lg:text-lg ${themeClasses.text.secondary}`}>
                  {editingPlan ? "Update your internet plan details" : "Configure your new internet service plan"}
                </p>
              </div>
              <motion.button 
                onClick={() => {
                  setViewMode("list");
                  resetForm();
                  setEditingPlan(null);
                }} 
                className="p-2 hover:bg-opacity-20 hover:bg-gray-500 rounded-lg flex-shrink-0"
                whileHover={{ rotate: 90 }}
              >
                <X className="w-5 h-5 lg:w-6 lg:h-6" />
              </motion.button>
            </div>

            {/* Access Type Badge */}
            <div className={`p-4 rounded-lg border ${
              form.accessType === 'hotspot' 
                ? (theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200')
                : (theme === 'dark' ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200')
            }`}>
              <div className="flex items-center">
                {form.accessType === 'hotspot' ? (
                  <Wifi className="w-5 h-5 text-blue-600 mr-3" />
                ) : (
                  <Cable className="w-5 h-5 text-green-600 mr-3" />
                )}
                <span className="text-sm font-medium">
                  {form.accessType === 'hotspot' ? 'Hotspot Plan' : 'PPPoE Plan'}
                </span>
              </div>
            </div>

            {/* Tabs */}
            {renderTabs()}

            {/* Form Content */}
            <div className="space-y-4 lg:space-y-6">
              {renderFormContent()}
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
              <motion.button 
                onClick={() => {
                  setViewMode("list");
                  resetForm();
                  setEditingPlan(null);
                }} 
                className={`px-4 py-2 lg:px-6 lg:py-2 rounded-lg shadow-md text-sm lg:text-base ${themeClasses.button.secondary}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button 
                onClick={savePlan}
                disabled={!isFormValid || isLoading}
                className={`px-4 py-2 lg:px-6 lg:py-2 rounded-lg shadow-md flex items-center justify-center text-sm lg:text-base ${
                  isFormValid && !isLoading ? themeClasses.button.success : 'bg-gray-400 cursor-not-allowed'
                }`}
                whileHover={isFormValid && !isLoading ? { scale: 1.05 } : {}}
                whileTap={isFormValid && !isLoading ? { scale: 0.95 } : {}}
              >
                {isLoading ? (
                  <FaSpinner className="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2" />
                )}
                {isLoading ? "Saving..." : editingPlan ? "Update Plan" : "Create Plan"}
              </motion.button>
            </div>
          </main>
        </div>
      )}

      {/* Details View */}
      {viewMode === "details" && renderPlanDetails()}

      {/* Mobile Success Alert */}
      <MobileSuccessAlert 
        message={mobileSuccessAlert.message}
        isVisible={mobileSuccessAlert.visible}
        onClose={() => setMobileSuccessAlert({ visible: false, message: "" })}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setPlanToDelete(null);
        }}
        onConfirm={deletePlan}
        title="Delete Plan"
        message={`Are you sure you want to delete "${planToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        theme={theme}
      />

      {/* Toast Container */}
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme={theme}
      />
    </>
  );
};

export default PlanManagement;