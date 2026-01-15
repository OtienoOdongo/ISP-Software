

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
// import { deepClone, formatNumber, formatBandwidth, calculateRating, validateRequired, validatePrice } from "../../components/ServiceManagement/Shared/utils"
// import { planTypes, categories } from "../../components/ServiceManagement/Shared/constant"

// // Components
// import PlanList from "../../components/ServiceManagement/PlanManagement/PlanList"
// import PlanBasicDetails from "../../components/ServiceManagement/PlanManagement/PlanBasicDetails"
// import HotspotConfiguration from "../../components/ServiceManagement/PlanManagement/HotspotConfiguration"
// import PPPoEConfiguration from "../../components/ServiceManagement/PlanManagement/PPPoEConfiguration"
// import PlanAdvancedSettings from "../../components/ServiceManagement/PlanManagement/PlanAdvancedSettings"
// import PlanAnalytics from "../../components/ServiceManagement/PlanManagement/PlanAnalytics"
// import PlanTemplates from "../../components/ServiceManagement/Templates/PlanTemplates"
// import PlanTypeSelectionModal from "../../components/ServiceManagement/PlanManagement/PlanTypeSelectionModal"
// import AnalyticsTypeSelectionModal from "../../components/ServiceManagement/PlanManagement/AnalyticsTypeSelectionModal"

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
//     maxDevices: 1,
//     sessionTimeout: 86400,
//     idleTimeout: 300,
//     validityPeriod: { value: "", unit: "Hours" },
//     macBinding: false,
//   },
//   pppoe: {
//     enabled: false,
//     downloadSpeed: { value: "", unit: "Mbps" },
//     uploadSpeed: { value: "", unit: "Mbps" },
//     dataLimit: { value: "", unit: "GB" },
//     usageLimit: { value: "", unit: "Hours" },
//     bandwidthLimit: 0,
//     maxDevices: 1,
//     sessionTimeout: 86400,
//     idleTimeout: 300,
//     validityPeriod: { value: "", unit: "Hours" },
//     macBinding: false,
//     ipPool: "pppoe-pool-1",
//     serviceName: "",
//     mtu: 1492,
//     dnsServers: ["8.8.8.8", "1.1.1.1"],
//   }
// });

// const normalizePlanData = (plan) => {
//   const defaultState = getInitialFormState();
  
//   // Determine access type from enabled methods
//   let accessType = "hotspot";
//   if (plan.accessMethods || plan.access_methods) {
//     const sourceMethods = plan.accessMethods || plan.access_methods;
//     if (sourceMethods.pppoe?.enabled) {
//       accessType = "pppoe";
//     } else if (sourceMethods.hotspot?.enabled) {
//       accessType = "hotspot";
//     }
//   }

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
//         // Ensure new fields have defaults
//         maxDevices: sourceMethods.hotspot.maxDevices || 1,
//         sessionTimeout: sourceMethods.hotspot.sessionTimeout || 86400,
//         idleTimeout: sourceMethods.hotspot.idleTimeout || 300,
//         validityPeriod: sourceMethods.hotspot.validityPeriod || { value: "", unit: "Hours" },
//         macBinding: sourceMethods.hotspot.macBinding || false,
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
//         // Ensure new fields have defaults
//         maxDevices: sourceMethods.pppoe.maxDevices || 1,
//         sessionTimeout: sourceMethods.pppoe.sessionTimeout || 86400,
//         idleTimeout: sourceMethods.pppoe.idleTimeout || 300,
//         validityPeriod: sourceMethods.pppoe.validityPeriod || { value: "", unit: "Hours" },
//         macBinding: sourceMethods.pppoe.macBinding || false,
//         ipPool: sourceMethods.pppoe.ipPool || "pppoe-pool-1",
//       };
//     }
//   }

//   return {
//     ...defaultState,
//     id: plan.id,
//     accessType, // Set access type
//     planType: plan.planType || plan.plan_type || "Paid",
//     name: plan.name || "",
//     price: plan.price?.toString() || "0",
//     active: plan.active !== undefined ? plan.active : true,
//     category: plan.category || "Residential",
//     description: plan.description || "",
//     purchases: plan.purchases || 0,
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
//     setErrors,
//     touched,
//     handleChange,
//     handleAccessTypeChange,
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
//   const [showPlanTypeModal, setShowPlanTypeModal] = useState(false);

//   // Add these state variables to your main PlanManagement component
//   const [showAnalyticsTypeModal, setShowAnalyticsTypeModal] = useState(false);
//   const [selectedAnalyticsType, setSelectedAnalyticsType] = useState(null);

//   // Mobile success alert
//   const showMobileSuccess = useCallback((message) => {
//     setMobileSuccessAlert({ visible: true, message });
//     setTimeout(() => {
//       setMobileSuccessAlert({ visible: false, message: "" });
//     }, 3000);
//   }, []);

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

//   // Enhanced apply template function
//   const applyTemplate = useCallback((template) => {
//     const newForm = deepClone(getInitialFormState());
    
//     // Apply template settings
//     newForm.name = template.name || "";
//     newForm.category = template.category || "Residential";
//     newForm.price = template.basePrice?.toString() || template.base_price?.toString() || "0";
//     newForm.description = template.description || "";
//     newForm.accessType = template.accessType || "hotspot";
    
//     // Safely apply access methods based on template access type
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

//   // FIXED: Enhanced create plan from template function
//   const createPlanFromTemplate = useCallback(async (templateId, additionalData = {}) => {
//     setIsLoading(true);
//     try {
//       const response = await api.post(`/api/internet_plans/templates/${templateId}/create-plan/`, additionalData);
      
//       // Refresh plans list to include the newly created plan
//       await fetchPlans();
      
//       const message = `Plan created from template successfully`;
//       if (window.innerWidth <= 768) {
//         showMobileSuccess(message);
//       } else {
//         toast.success(message);
//       }
      
//       // Return to list view to see the new plan
//       setViewMode("list");
      
//       return response.data;
//     } catch (error) {
//       console.error("Error creating plan from template:", error);
//       const message = "Failed to create plan from template";
//       if (window.innerWidth <= 768) {
//         showMobileSuccess(message);
//       } else {
//         toast.error(`${message}: ${error.response?.data?.detail || error.message}`);
//       }
//       throw error;
//     } finally {
//       setIsLoading(false);
//     }
//   }, [fetchPlans, showMobileSuccess]);

//   // FIXED: Enhanced quick create from template
//   const quickCreateFromTemplate = useCallback(async (template) => {
//     try {
//       const createdPlan = await createPlanFromTemplate(template.id, { name: `${template.name} - ${new Date().toLocaleDateString()}` });
//       return createdPlan;
//     } catch (error) {
//       console.error("Quick create failed:", error);
//       throw error;
//     }
//   }, [createPlanFromTemplate]);

//   // Add this function to handle analytics type selection
//   const handleAnalyticsTypeSelect = (analyticsType) => {
//     setSelectedAnalyticsType(analyticsType);
//     setShowAnalyticsTypeModal(false);
//     setViewMode("analytics");
//   };

//   // Get active access method configuration
//   const getActiveAccessMethod = useCallback(() => {
//     return form.accessMethods[form.accessType];
//   }, [form]);

//   // Enhanced form validation
//   const validateFormEnhanced = useCallback(() => {
//     const newErrors = {};
    
//     // Basic validations
//     newErrors.name = validateRequired(form.name, 'Plan name');
//     newErrors.category = validateRequired(form.category, 'Category');
//     newErrors.price = validatePrice(form.price, form.planType);
    
//     // Access method validations - only validate the enabled method
//     const activeMethod = form.accessMethods[form.accessType];
    
//     if (activeMethod.enabled) {
//       // Speed validations
//       newErrors[`${form.accessType}_downloadSpeed`] = validateRequired(
//         activeMethod.downloadSpeed.value, 
//         `${form.accessType.toUpperCase()} Download Speed`
//       );
//       newErrors[`${form.accessType}_uploadSpeed`] = validateRequired(
//         activeMethod.uploadSpeed.value, 
//         `${form.accessType.toUpperCase()} Upload Speed`
//       );
      
//       // Data limit validation - only if not unlimited
//       if (activeMethod.dataLimit.unit !== 'Unlimited') {
//         newErrors[`${form.accessType}_dataLimit`] = validateRequired(
//           activeMethod.dataLimit.value, 
//           `${form.accessType.toUpperCase()} Data Limit`
//         );
//       }
      
//       // Usage limit validation - only if not unlimited
//       if (activeMethod.usageLimit.unit !== 'Unlimited') {
//         newErrors[`${form.accessType}_usageLimit`] = validateRequired(
//           activeMethod.usageLimit.value, 
//           `${form.accessType.toUpperCase()} Usage Limit`
//         );
//       }
      
//       // Validity period validation - only if not unlimited and not no expiry
//       const validityValue = activeMethod.validityPeriod.value;
//       const isNoExpiry = validityValue === '0' || validityValue === 0;
//       if (activeMethod.validityPeriod.unit !== 'Unlimited' && !isNoExpiry) {
//         newErrors[`${form.accessType}_validityPeriod`] = validateRequired(
//           activeMethod.validityPeriod.value, 
//           `${form.accessType.toUpperCase()} Validity Period`
//         );
//       }
//     }

//     // Remove empty errors
//     Object.keys(newErrors).forEach(key => {
//       if (!newErrors[key]) delete newErrors[key];
//     });

//     return newErrors;
//   }, [form]);

//   // Check form validity - FIXED VERSION
//   const isFormValid = useMemo(() => {
//     // Check basic details
//     const hasBasicDetails = form.name?.trim() && 
//       form.category && 
//       (form.planType !== "Paid" || (form.price && parseFloat(form.price) >= 0));

//     // Get active access method
//     const activeMethod = form.accessMethods[form.accessType];
//     const hasEnabledAccessMethods = activeMethod.enabled;

//     // If basic details or access method not enabled, form is invalid
//     if (!hasBasicDetails || !hasEnabledAccessMethods) {
//       return false;
//     }

//     // Check enabled access method has required fields
//     if (activeMethod.enabled) {
//       // Check speeds - these are always required
//       if (!activeMethod.downloadSpeed?.value || !activeMethod.uploadSpeed?.value) {
//         return false;
//       }
      
//       // Check data limit only if not unlimited
//       if (activeMethod.dataLimit.unit !== 'Unlimited' && !activeMethod.dataLimit.value) {
//         return false;
//       }
      
//       // Check usage limit only if not unlimited
//       if (activeMethod.usageLimit.unit !== 'Unlimited' && !activeMethod.usageLimit.value) {
//         return false;
//       }
      
//       // Check validity period only if not unlimited and not no expiry
//       const validityValue = activeMethod.validityPeriod.value;
//       const isNoExpiry = validityValue === '0' || validityValue === 0;
//       if (activeMethod.validityPeriod.unit !== 'Unlimited' && 
//           !isNoExpiry && 
//           !validityValue) {
//         return false;
//       }
//     }

//     // Check if there are any validation errors
//     const currentErrors = validateFormEnhanced();
//     const hasValidationErrors = Object.keys(currentErrors).length > 0;
    
//     return !hasValidationErrors;
//   }, [form, validateFormEnhanced]);

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

//   // Start plan creation with specific access type
//   const startNewPlan = useCallback((accessType = "hotspot") => {
//     resetForm();
//     // Enable the selected access method and disable the other
//     setForm(prev => ({
//       ...prev,
//       accessType,
//       accessMethods: {
//         hotspot: {
//           ...prev.accessMethods.hotspot,
//           enabled: accessType === 'hotspot'
//         },
//         pppoe: {
//           ...prev.accessMethods.pppoe,
//           enabled: accessType === 'pppoe'
//         }
//       }
//     }));
//     setEditingPlan(null);
//     setActiveTab("basic");
//     setViewMode("form");
//     setShowPlanTypeModal(false);
//   }, [resetForm, setForm]);

//   // Enhanced save plan function
//   const savePlan = async () => {
//     const validationErrors = validateFormEnhanced();
    
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       const message = "Please fix validation errors before saving";
//       if (window.innerWidth <= 768) {
//         showMobileSuccess(message);
//       } else {
//         toast.error(message);
//       }
//       return;
//     }

//     if (!isFormValid) {
//       const message = "Please fill all required fields before saving";
//       if (window.innerWidth <= 768) {
//         showMobileSuccess(message);
//       } else {
//         toast.error(message);
//       }
//       return;
//     }

//     setIsLoading(true);
//     try {
//       // Prepare the plan data with all new features
//       const planData = {
//         planType: form.planType,
//         name: form.name.trim(),
//         price: parseFloat(form.price) || 0,
//         active: form.active,
//         category: form.category,
//         description: form.description.trim(),
//         purchases: editingPlan ? editingPlan.purchases : 0,
//         accessMethods: {
//           hotspot: {
//             ...form.accessMethods.hotspot,
//             // Ensure numeric values are properly formatted
//             bandwidthLimit: parseInt(form.accessMethods.hotspot.bandwidthLimit) || 0,
//             maxDevices: parseInt(form.accessMethods.hotspot.maxDevices) || 1,
//             sessionTimeout: parseInt(form.accessMethods.hotspot.sessionTimeout) || 86400,
//             idleTimeout: parseInt(form.accessMethods.hotspot.idleTimeout) || 300,
//           },
//           pppoe: {
//             ...form.accessMethods.pppoe,
//             bandwidthLimit: parseInt(form.accessMethods.pppoe.bandwidthLimit) || 0,
//             maxDevices: parseInt(form.accessMethods.pppoe.maxDevices) || 1,
//             sessionTimeout: parseInt(form.accessMethods.pppoe.sessionTimeout) || 86400,
//             idleTimeout: parseInt(form.accessMethods.pppoe.idleTimeout) || 300,
//           }
//         },
//         priority_level: form.priority_level,
//         router_specific: form.router_specific,
//         allowed_routers_ids: form.router_specific ? form.allowed_routers_ids : [],
//         FUP_policy: form.FUP_policy,
//         FUP_threshold: form.FUP_threshold,
//         template_id: form.template_id || null,
//         created_at: editingPlan ? editingPlan.createdAt : new Date().toISOString(),
//       };

//       let response;
//       if (editingPlan) {
//         // UPDATE operation
//         response = await api.put(`/api/internet_plans/${editingPlan.id}/`, planData);
//         setPlans(prev => prev.map(p => p.id === editingPlan.id ? normalizePlanData(response.data) : p));
        
//         const message = `Successfully updated plan: ${planData.name}`;
//         if (window.innerWidth <= 768) {
//           showMobileSuccess(message);
//         } else {
//           toast.success(message);
//         }
//       } else {
//         // CREATE operation
//         response = await api.post("/api/internet_plans/", planData);
//         const newPlan = normalizePlanData(response.data);
//         setPlans(prev => [...prev, newPlan]);
        
//         const message = `Successfully created plan: ${planData.name}`;
//         if (window.innerWidth <= 768) {
//           showMobileSuccess(message);
//         } else {
//           toast.success(message);
//         }
//       }

//       // Reset form and return to list view
//       resetForm();
//       setEditingPlan(null);
//       setViewMode("list");
      
//     } catch (error) {
//       console.error("Error saving plan:", error);
//       const message = `Failed to ${editingPlan ? "update" : "create"} plan`;
//       const errorDetail = error.response?.data?.detail || error.response?.data?.message || error.message;
      
//       if (window.innerWidth <= 768) {
//         showMobileSuccess(`${message}: ${errorDetail}`);
//       } else {
//         toast.error(`${message}: ${errorDetail}`);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Enhanced delete with confirmation
//   const confirmDelete = useCallback((plan) => {
//     setPlanToDelete(plan);
//     setDeleteModalOpen(true);
//   }, []);

//   const deletePlan = async () => {
//     if (!planToDelete) return;
    
//     setIsLoading(true);
//     try {
//       await api.delete(`/api/internet_plans/${planToDelete.id}/`);
//       setPlans(prev => prev.filter(p => p.id !== planToDelete.id));
      
//       if (selectedPlan && selectedPlan.id === planToDelete.id) {
//         setSelectedPlan(null);
//         setViewMode("list");
//       }

//       const message = `Successfully deleted plan: ${planToDelete.name}`;
//       if (window.innerWidth <= 768) {
//         showMobileSuccess(message);
//       } else {
//         toast.success(message);
//       }
//     } catch (error) {
//       console.error("Error deleting plan:", error);
//       const message = `Failed to delete plan: ${planToDelete.name}`;
//       const errorDetail = error.response?.data?.detail || error.message;
      
//       if (window.innerWidth <= 768) {
//         showMobileSuccess(`${message}: ${errorDetail}`);
//       } else {
//         toast.error(`${message}: ${errorDetail}`);
//       }
//     } finally {
//       setIsLoading(false);
//       setDeleteModalOpen(false);
//       setPlanToDelete(null);
//     }
//   };

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

//   // Dynamic tabs based on access type
//   const getTabs = useCallback(() => {
//     const baseTabs = [
//       { id: "basic", label: "Basic Details", icon: Settings },
//       { id: "advanced", label: "Advanced", icon: Server },
//     ];

//     // Add access-specific tab
//     if (form.accessType === "hotspot") {
//       baseTabs.splice(1, 0, { id: "hotspot", label: "Hotspot Configuration", icon: Wifi });
//     } else {
//       baseTabs.splice(1, 0, { id: "pppoe", label: "PPPoE Configuration", icon: Cable });
//     }

//     return baseTabs;
//   }, [form.accessType]);

//   // Render tabs
//   const renderTabs = () => {
//     const tabs = getTabs();
    
//     return (
//       <div className={`p-2 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//         <div className="flex flex-wrap gap-1 lg:gap-2">
//           {tabs.map((tab) => {
//             const IconComponent = tab.icon;
//             return (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`px-3 py-1 lg:px-4 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center gap-2 ${
//                   activeTab === tab.id 
//                     ? "bg-indigo-600 text-white" 
//                     : `${themeClasses.text.secondary} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`
//                 }`}
//               >
//                 <IconComponent className="w-3 h-3 lg:w-4 lg:h-4" />
//                 <span className="hidden sm:inline">{tab.label}</span>
//               </button>
//             );
//           })}
//         </div>
//       </div>
//     );
//   };

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
//             onAccessTypeChange={handleAccessTypeChange}
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
//       default:
//         return null;
//     }
//   };

//   // Render plan details safely
//   const renderPlanDetails = () => {
//     if (!selectedPlan) return null;

//     const activeMethod = selectedPlan.accessMethods[selectedPlan.accessType];

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

//           {/* Access Type Badge */}
//           <div className={`p-4 rounded-lg border ${
//             selectedPlan.accessType === 'hotspot' 
//               ? (theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200')
//               : (theme === 'dark' ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200')
//           }`}>
//             <div className="flex items-center">
//               {selectedPlan.accessType === 'hotspot' ? (
//                 <Wifi className="w-5 h-5 text-blue-600 mr-3" />
//               ) : (
//                 <Cable className="w-5 h-5 text-green-600 mr-3" />
//               )}
//               <div>
//                 <span className="text-sm font-medium">
//                   {selectedPlan.accessType === 'hotspot' ? 'Hotspot Plan' : 'PPPoE Plan'}
//                 </span>
//                 {selectedPlan.template && (
//                   <span className="text-sm ml-2">
//                     • Created from template: {selectedPlan.template.name}
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>

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
//                   <span className={themeClasses.text.secondary}>Access Type:</span>
//                   <span className={themeClasses.text.primary}>
//                     {selectedPlan.accessType === 'hotspot' ? 'Hotspot' : 'PPPoE'}
//                   </span>
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
//               </div>
//             </div>

//             {/* Configuration Details */}
//             <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//               <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center">
//                 <Zap className="w-5 h-5 mr-3 text-indigo-600" />
//                 {selectedPlan.accessType === 'hotspot' ? 'Hotspot' : 'PPPoE'} Configuration
//               </h3>
//               <div className="space-y-3">
//                 <div className="flex justify-between">
//                   <span className={themeClasses.text.secondary}>Download:</span>
//                   <span className={themeClasses.text.primary}>
//                     {activeMethod.downloadSpeed?.value || 'N/A'} {activeMethod.downloadSpeed?.unit || 'Mbps'}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className={themeClasses.text.secondary}>Upload:</span>
//                   <span className={themeClasses.text.primary}>
//                     {activeMethod.uploadSpeed?.value || 'N/A'} {activeMethod.uploadSpeed?.unit || 'Mbps'}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className={themeClasses.text.secondary}>Data Limit:</span>
//                   <span className={themeClasses.text.primary}>
//                     {activeMethod.dataLimit?.value || 'N/A'} {activeMethod.dataLimit?.unit || 'GB'}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className={themeClasses.text.secondary}>Max Devices:</span>
//                   <span className={themeClasses.text.primary}>
//                     {activeMethod.maxDevices === 0 ? 'Unlimited' : activeMethod.maxDevices}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className={themeClasses.text.secondary}>Session Timeout:</span>
//                   <span className={themeClasses.text.primary}>
//                     {activeMethod.sessionTimeout === 0 ? 'No Limit' : `${activeMethod.sessionTimeout / 3600} Hours`}
//                   </span>
//                 </div>
//                 {selectedPlan.accessType === 'pppoe' && (
//                   <div className="flex justify-between">
//                     <span className={themeClasses.text.secondary}>IP Pool:</span>
//                     <span className={themeClasses.text.primary}>
//                       {activeMethod.ipPool || 'N/A'}
//                     </span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     );
//   };

//   // Main render
//   return (
//     <>
//       {/* Update the analytics view to show filtered data */}
//       {viewMode === "analytics" && (
//         <PlanAnalytics
//           plans={plans.filter(plan => 
//             selectedAnalyticsType ? plan.accessType === selectedAnalyticsType : true
//           )}
//           subscriptions={subscriptions}
//           templates={templates}
//           onBack={() => {
//             setViewMode("list");
//             setSelectedAnalyticsType(null);
//           }}
//           analyticsType={selectedAnalyticsType}
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
//           onNewPlan={() => setShowPlanTypeModal(true)}
//           // Update the analytics button in PlanList to open the modal
//           onViewAnalytics={() => setShowAnalyticsTypeModal(true)}
//           onViewTemplates={() => setViewMode("templates")}
//           theme={theme}
//         />
//       )}

//       {/* Plan Type Selection Modal */}
//       <PlanTypeSelectionModal
//         isOpen={showPlanTypeModal}
//         onClose={() => setShowPlanTypeModal(false)}
//         onSelect={startNewPlan}
//         theme={theme}
//       />

//       {/* Add the AnalyticsTypeSelectionModal to your main render */}
//       <AnalyticsTypeSelectionModal
//         isOpen={showAnalyticsTypeModal}
//         onClose={() => setShowAnalyticsTypeModal(false)}
//         onSelect={handleAnalyticsTypeSelect}
//         plans={plans}
//         theme={theme}
//       />

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

//             {/* Access Type Badge */}
//             <div className={`p-4 rounded-lg border ${
//               form.accessType === 'hotspot' 
//                 ? (theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200')
//                 : (theme === 'dark' ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200')
//             }`}>
//               <div className="flex items-center">
//                 {form.accessType === 'hotspot' ? (
//                   <Wifi className="w-5 h-5 text-blue-600 mr-3" />
//                 ) : (
//                   <Cable className="w-5 h-5 text-green-600 mr-3" />
//                 )}
//                 <span className="text-sm font-medium">
//                   {form.accessType === 'hotspot' ? 'Hotspot Plan' : 'PPPoE Plan'}
//                 </span>
//               </div>
//             </div>

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
//         onConfirm={deletePlan}
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













import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Copy, Eye, ChevronDown, ChevronUp, X, Save,
  Users, Download, Upload, BarChart3, Wifi, Cable, Server, Check,
  ArrowLeft, Settings, Zap, Clock, Shield, DollarSign, Package,
  TrendingUp, PieChart, Box, Calendar, Filter, Search, Star,
  Tag, Percent, Layers, Activity, Award, Target, FileText,
  Globe, Smartphone, Gauge, Database, Network, RefreshCw,
  Bell, AlertCircle, Timer, CalendarDays,
  CalendarClock, AlertTriangle,
  CreditCard, TrendingDown, BadgePercent, ArrowRight,
  CalendarOff, Sun, Moon, CheckCircle, XCircle,
  EyeOff, Radio, Router,
  HardDrive, Cpu, ShieldCheck, Cloud, Lock, Unlock,
  Battery, BatteryCharging, WifiOff, Infinity as InfinityIcon
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastToastify.css";

// Context and API
import { useTheme } from "../../context/ThemeContext"
import api from "../../api"

// Shared components and utilities
import { 
  getThemeClasses, 
  EnhancedSelect, 
  ConfirmationModal, 
  MobileSuccessAlert,
  LoadingOverlay,
  EmptyState,
  AvailabilityBadge,
  PriceBadge,
  PlanTypeBadge,
  StatisticsCard
} from "../../components/ServiceManagement/Shared/components"
import { 
  deepClone, 
  formatNumber, 
  formatCurrency,
  formatTime,
  formatDate,
  debounce,
  validateTimeVariant,
  isPlanAvailableNow,
  calculateNextAvailableTime,
  getAvailabilitySummary,
  calculateRating,
  getAccessTypeColor
} from "../../components/ServiceManagement/Shared/utils"
import { 
  planTypes, 
  categories, 
  priorityOptions,
  timeUnits,
  daysOfWeek,
  timeZoneOptions,
  deviceLimitOptions,
  sessionTimeoutOptions,
  idleTimeoutOptions
} from "../../components/ServiceManagement/Shared/constant"

// Components
import PlanList from "../../components/ServiceManagement/PlanManagement/PlanList"
import PlanBasicDetails from "../../components/ServiceManagement/PlanManagement/PlanBasicDetails"
import HotspotConfiguration from "../../components/ServiceManagement/PlanManagement/HotspotConfiguration"
import PPPoEConfiguration from "../../components/ServiceManagement/PlanManagement/PPPoEConfiguration"
import PlanAdvancedSettings from "../../components/ServiceManagement/PlanManagement/PlanAdvancedSettings"
import PlanAnalytics from "../../components/ServiceManagement/PlanManagement/PlanAnalytics"
import PlanTemplates from "../../components/ServiceManagement/Templates/PlanTemplates"
import PlanTypeSelectionModal from "../../components/ServiceManagement/PlanManagement/PlanTypeSelectionModal"
import AnalyticsTypeSelectionModal from "../../components/ServiceManagement/PlanManagement/AnalyticsTypeSelectionModal"
import TimeVariantConfig from "../../components/ServiceManagement/PlanManagement/TimeVariantConfig"
import PricingConfiguration from "../../components/ServiceManagement/PlanManagement/PricingConfiguration"

// Hooks
import usePlanForm, { getInitialFormState } from "../../components/ServiceManagement/PlanManagement/hooks/usePlanForm"
import useTimeVariant, { getInitialTimeVariantState } from "../../components/ServiceManagement/PlanManagement/hooks/useTimeVariant"
import usePricing, { getInitialPricingState } from "../../components/ServiceManagement/PlanManagement/hooks/usePricing"

// Responsive utilities
import { useMediaQuery } from "../../hooks/useMediaQuery"

// API Service with all endpoints
const PlanApiService = {
  // Plans
  async getPlans(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const response = await api.get(`/api/internet_plans/plans/?${queryParams}`);
    return response.data;
  },

  async getPlan(id) {
    const response = await api.get(`/api/internet_plans/plans/${id}/`);
    return response.data;
  },

  async createPlan(planData) {
    const response = await api.post('/api/internet_plans/plans/', planData);
    return response.data;
  },

  async updatePlan(id, planData) {
    const response = await api.put(`/api/internet_plans/plans/${id}/`, planData);
    return response.data;
  },

  async deletePlan(id) {
    const response = await api.delete(`/api/internet_plans/plans/${id}/`);
    return response.data;
  },

  // Templates
  async getTemplates() {
    const response = await api.get('/api/internet_plans/templates/');
    return response.data;
  },

  async getTemplate(id) {
    const response = await api.get(`/api/internet_plans/templates/${id}/`);
    return response.data;
  },

  async createTemplate(templateData) {
    const response = await api.post('/api/internet_plans/templates/', templateData);
    return response.data;
  },

  async updateTemplate(id, templateData) {
    const response = await api.put(`/api/internet_plans/templates/${id}/`, templateData);
    return response.data;
  },

  async deleteTemplate(id) {
    const response = await api.delete(`/api/internet_plans/templates/${id}/`);
    return response.data;
  },

  async createPlanFromTemplate(templateId, planData) {
    const response = await api.post(`/api/internet_plans/templates/${templateId}/create-plan/`, planData);
    return response.data;
  },

  // Time Variant
  async getTimeVariant(id) {
    const response = await api.get(`/api/internet_plans/time-variant/${id}/`);
    return response.data;
  },

  async getTimeVariants(params = {}) {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/api/internet_plans/time-variant/?${queryParams}`);
    return response.data;
  },

  async createTimeVariant(timeVariantData) {
    const response = await api.post('/api/internet_plans/time-variant/', timeVariantData);
    return response.data;
  },

  async updateTimeVariant(id, timeVariantData) {
    const response = await api.put(`/api/internet_plans/time-variant/${id}/`, timeVariantData);
    return response.data;
  },

  async deleteTimeVariant(id) {
    const response = await api.delete(`/api/internet_plans/time-variant/${id}/`);
    return response.data;
  },

  async testTimeVariant(testData) {
    const response = await api.post('/api/internet_plans/time-variant/test/', testData);
    return response.data;
  },

  // Pricing
  async getPriceMatrices(params = {}) {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/api/internet_plans/pricing/matrices/?${queryParams}`);
    return response.data;
  },

  async getPriceMatrix(id) {
    const response = await api.get(`/api/internet_plans/pricing/matrices/${id}/`);
    return response.data;
  },

  async createPriceMatrix(priceMatrixData) {
    const response = await api.post('/api/internet_plans/pricing/matrices/', priceMatrixData);
    return response.data;
  },

  async updatePriceMatrix(id, priceMatrixData) {
    const response = await api.put(`/api/internet_plans/pricing/matrices/${id}/`, priceMatrixData);
    return response.data;
  },

  async deletePriceMatrix(id) {
    const response = await api.delete(`/api/internet_plans/pricing/matrices/${id}/`);
    return response.data;
  },

  // Discount Rules
  async getDiscountRules(params = {}) {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/api/internet_plans/pricing/rules/?${queryParams}`);
    return response.data;
  },

  async getDiscountRule(id) {
    const response = await api.get(`/api/internet_plans/pricing/rules/${id}/`);
    return response.data;
  },

  async createDiscountRule(discountRuleData) {
    const response = await api.post('/api/internet_plans/pricing/rules/', discountRuleData);
    return response.data;
  },

  async updateDiscountRule(id, discountRuleData) {
    const response = await api.put(`/api/internet_plans/pricing/rules/${id}/`, discountRuleData);
    return response.data;
  },

  async deleteDiscountRule(id) {
    const response = await api.delete(`/api/internet_plans/pricing/rules/${id}/`);
    return response.data;
  },

  // Calculations and Checks
  async calculatePrice(planId, quantity = 1, discountCode = null, clientData = {}) {
    const response = await api.post('/api/internet_plans/pricing/calculate/', {
      plan_id: planId,
      quantity,
      discount_code: discountCode,
      client_data: clientData
    });
    return response.data;
  },

  async calculateBulkPrices(calculations) {
    const response = await api.post('/api/internet_plans/pricing/calculate/bulk/', {
      calculations
    });
    return response.data;
  },

  async checkAvailability(planId, timestamp = null) {
    const response = await api.post('/api/internet_plans/plans/availability/check/', {
      plan_id: planId,
      timestamp
    });
    return response.data;
  },

  // Statistics and Analytics
  async getPlanStatistics() {
    const response = await api.get('/api/internet_plans/plans/statistics/');
    return response.data;
  },

  async getPricingStatistics() {
    const response = await api.get('/api/internet_plans/pricing/statistics/');
    return response.data;
  },

  async getAnalyticsData(analyticsType = 'general', timeRange = '30d') {
    const response = await api.get(`/api/internet_plans/analytics/?type=${analyticsType}&range=${timeRange}`);
    return response.data;
  },

  async exportAnalyticsData(analyticsType, timeRange, format = 'json') {
    const response = await api.get(`/api/internet_plans/analytics/export/?type=${analyticsType}&range=${timeRange}&format=${format}`);
    return response.data;
  }
};

// Cache management for better performance
const PlanCache = {
  plans: new Map(),
  templates: new Map(),
  timeVariants: new Map(),
  priceMatrices: new Map(),
  discountRules: new Map(),
  
  get(key, cacheType) {
    const cache = this[cacheType];
    return cache.get(key);
  },
  
  set(key, value, cacheType) {
    const cache = this[cacheType];
    cache.set(key, value);
  },
  
  delete(key, cacheType) {
    const cache = this[cacheType];
    cache.delete(key);
  },
  
  clear(cacheType = null) {
    if (cacheType) {
      this[cacheType].clear();
    } else {
      this.plans.clear();
      this.templates.clear();
      this.timeVariants.clear();
      this.priceMatrices.clear();
      this.discountRules.clear();
    }
  }
};

// Enhanced PlanDataStructure class
class PlanDataStructure {
  constructor() {
    this.plans = [];
    this.indexes = {
      byId: new Map(),
      byCategory: new Map(),
      byPlanType: new Map(),
      byAccessType: new Map(),
      byAvailability: new Map(),
      byPriceRange: new Map()
    };
  }

  addPlan(plan) {
    this.plans.push(plan);
    this.updateIndexes(plan);
  }

  updatePlan(plan) {
    const index = this.plans.findIndex(p => p.id === plan.id);
    if (index !== -1) {
      // Remove old indexes
      const oldPlan = this.plans[index];
      this.removeFromIndexes(oldPlan);
      
      // Update plan
      this.plans[index] = plan;
      this.updateIndexes(plan);
    }
  }

  removePlan(planId) {
    const index = this.plans.findIndex(p => p.id === planId);
    if (index !== -1) {
      const plan = this.plans[index];
      this.removeFromIndexes(plan);
      this.plans.splice(index, 1);
    }
  }

  updateIndexes(plan) {
    // By ID
    this.indexes.byId.set(plan.id, plan);
    
    // By Category
    if (!this.indexes.byCategory.has(plan.category)) {
      this.indexes.byCategory.set(plan.category, []);
    }
    this.indexes.byCategory.get(plan.category).push(plan);
    
    // By Plan Type
    if (!this.indexes.byPlanType.has(plan.planType)) {
      this.indexes.byPlanType.set(plan.planType, []);
    }
    this.indexes.byPlanType.get(plan.planType).push(plan);
    
    // By Access Type
    const enabledMethods = this.getEnabledAccessMethods(plan);
    enabledMethods.forEach(method => {
      if (!this.indexes.byAccessType.has(method)) {
        this.indexes.byAccessType.set(method, []);
      }
      this.indexes.byAccessType.get(method).push(plan);
    });
    
    // By Availability
    const isAvailable = isPlanAvailableNow(plan);
    const availabilityKey = isAvailable ? 'available' : 'unavailable';
    if (!this.indexes.byAvailability.has(availabilityKey)) {
      this.indexes.byAvailability.set(availabilityKey, []);
    }
    this.indexes.byAvailability.get(availabilityKey).push(plan);
    
    // By Price Range
    const price = parseFloat(plan.price) || 0;
    const priceRangeKey = this.getPriceRangeKey(price);
    if (!this.indexes.byPriceRange.has(priceRangeKey)) {
      this.indexes.byPriceRange.set(priceRangeKey, []);
    }
    this.indexes.byPriceRange.get(priceRangeKey).push(plan);
  }

  removeFromIndexes(plan) {
    // Remove from all indexes
    this.indexes.byId.delete(plan.id);
    
    // Remove from category index
    const categoryPlans = this.indexes.byCategory.get(plan.category);
    if (categoryPlans) {
      const index = categoryPlans.findIndex(p => p.id === plan.id);
      if (index !== -1) categoryPlans.splice(index, 1);
    }
    
    // Remove from plan type index
    const planTypePlans = this.indexes.byPlanType.get(plan.planType);
    if (planTypePlans) {
      const index = planTypePlans.findIndex(p => p.id === plan.id);
      if (index !== -1) planTypePlans.splice(index, 1);
    }
    
    // Remove from access type index
    const enabledMethods = this.getEnabledAccessMethods(plan);
    enabledMethods.forEach(method => {
      const accessTypePlans = this.indexes.byAccessType.get(method);
      if (accessTypePlans) {
        const index = accessTypePlans.findIndex(p => p.id === plan.id);
        if (index !== -1) accessTypePlans.splice(index, 1);
      }
    });
    
    // Remove from availability index
    const isAvailable = isPlanAvailableNow(plan);
    const availabilityKey = isAvailable ? 'available' : 'unavailable';
    const availabilityPlans = this.indexes.byAvailability.get(availabilityKey);
    if (availabilityPlans) {
      const index = availabilityPlans.findIndex(p => p.id === plan.id);
      if (index !== -1) availabilityPlans.splice(index, 1);
    }
    
    // Remove from price range index
    const price = parseFloat(plan.price) || 0;
    const priceRangeKey = this.getPriceRangeKey(price);
    const priceRangePlans = this.indexes.byPriceRange.get(priceRangeKey);
    if (priceRangePlans) {
      const index = priceRangePlans.findIndex(p => p.id === plan.id);
      if (index !== -1) priceRangePlans.splice(index, 1);
    }
  }

  getPriceRangeKey(price) {
    if (price === 0) return 'free';
    if (price < 500) return '0-500';
    if (price < 1000) return '500-1000';
    if (price < 5000) return '1000-5000';
    return '5000+';
  }

  getEnabledAccessMethods(plan) {
    if (plan.get_enabled_access_methods) {
      return plan.get_enabled_access_methods();
    }
    if (plan.enabled_access_methods) {
      return plan.enabled_access_methods;
    }
    if (plan.accessMethods) {
      const methods = [];
      if (plan.accessMethods.hotspot?.enabled) methods.push('hotspot');
      if (plan.accessMethods.pppoe?.enabled) methods.push('pppoe');
      return methods;
    }
    if (plan.access_methods) {
      const methods = [];
      if (plan.access_methods.hotspot?.enabled) methods.push('hotspot');
      if (plan.access_methods.pppoe?.enabled) methods.push('pppoe');
      return methods;
    }
    return [];
  }

  search(query) {
    const results = [];
    const queryLower = query.toLowerCase();
    
    // Binary search implementation for sorted arrays
    const performBinarySearch = (array, property) => {
      let left = 0;
      let right = array.length - 1;
      
      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const value = (array[mid][property] || '').toString().toLowerCase();
        
        if (value.includes(queryLower)) {
          // Found a match, now expand to find all matches
          let start = mid;
          let end = mid;
          
          // Expand left
          while (start > 0 && (array[start - 1][property] || '').toString().toLowerCase().includes(queryLower)) {
            start--;
          }
          
          // Expand right
          while (end < array.length - 1 && (array[end + 1][property] || '').toString().toLowerCase().includes(queryLower)) {
            end++;
          }
          
          return array.slice(start, end + 1);
        }
        
        if (value < queryLower) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }
      
      return [];
    };
    
    // Search by name (sorted)
    const sortedByName = [...this.plans].sort((a, b) => 
      (a.name || '').toString().localeCompare(b.name || '')
    );
    const nameResults = performBinarySearch(sortedByName, 'name');
    
    // Search by description (sorted)
    const sortedByDesc = [...this.plans].sort((a, b) => 
      (a.description || '').toString().localeCompare(b.description || '')
    );
    const descResults = performBinarySearch(sortedByDesc, 'description');
    
    // Merge results, removing duplicates
    const allResults = new Map();
    [...nameResults, ...descResults].forEach(plan => {
      if (!allResults.has(plan.id)) {
        allResults.set(plan.id, plan);
      }
    });
    
    return Array.from(allResults.values());
  }

  filter(filters) {
    let results = [...this.plans];
    
    // Apply category filter using index if available
    if (filters.category && this.indexes.byCategory.has(filters.category)) {
      results = results.filter(plan => 
        this.indexes.byCategory.get(filters.category)?.some(p => p.id === plan.id)
      );
    }
    
    // Apply plan type filter
    if (filters.planType) {
      results = results.filter(plan => plan.planType === filters.planType);
    }
    
    // Apply access type filter using index
    if (filters.accessType) {
      results = results.filter(plan => {
        const enabledMethods = this.getEnabledAccessMethods(plan);
        if (filters.accessType === 'both') {
          return enabledMethods.includes('hotspot') && enabledMethods.includes('pppoe');
        }
        return enabledMethods.includes(filters.accessType);
      });
    }
    
    // Apply availability filter using index
    if (filters.availability !== null) {
      const availabilityKey = filters.availability ? 'available' : 'unavailable';
      results = results.filter(plan => 
        this.indexes.byAvailability.get(availabilityKey)?.some(p => p.id === plan.id)
      );
    }
    
    // Apply price range filter using index
    if (filters.priceRange) {
      results = results.filter(plan => {
        const planPrice = parseFloat(plan.price) || 0;
        return planPrice >= filters.priceRange.min && planPrice <= filters.priceRange.max;
      });
    }
    
    // Apply time variant filter
    if (filters.hasTimeVariant !== null) {
      results = results.filter(plan => 
        filters.hasTimeVariant ? plan.time_variant?.is_active : !plan.time_variant?.is_active
      );
    }
    
    return results;
  }

  sort(field, direction = 'asc') {
    return [...this.plans].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];
      
      // Handle special sorting cases
      switch (field) {
        case 'price':
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
          break;
        case 'created_at':
        case 'updated_at':
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
          break;
        case 'name':
        case 'description':
          aValue = (aValue || '').toString().toLowerCase();
          bValue = (bValue || '').toString().toLowerCase();
          break;
      }
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getStatistics() {
    const stats = {
      total: this.plans.length,
      byCategory: {},
      byPlanType: {},
      byAccessType: {},
      byAvailability: {},
      priceStats: {
        totalRevenue: 0,
        averagePrice: 0,
        minPrice: Infinity,
        maxPrice: 0
      }
    };
    
    this.plans.forEach(plan => {
      // Category stats
      stats.byCategory[plan.category] = (stats.byCategory[plan.category] || 0) + 1;
      
      // Plan type stats
      stats.byPlanType[plan.planType] = (stats.byPlanType[plan.planType] || 0) + 1;
      
      // Access type stats
      const enabledMethods = this.getEnabledAccessMethods(plan);
      enabledMethods.forEach(method => {
        stats.byAccessType[method] = (stats.byAccessType[method] || 0) + 1;
      });
      
      // Availability stats
      const isAvailable = isPlanAvailableNow(plan);
      const availabilityKey = isAvailable ? 'available' : 'unavailable';
      stats.byAvailability[availabilityKey] = (stats.byAvailability[availabilityKey] || 0) + 1;
      
      // Price stats
      const price = parseFloat(plan.price) || 0;
      const purchases = plan.purchases || 0;
      stats.priceStats.totalRevenue += price * purchases;
      stats.priceStats.minPrice = Math.min(stats.priceStats.minPrice, price);
      stats.priceStats.maxPrice = Math.max(stats.priceStats.maxPrice, price);
    });
    
    // Calculate average price
    const totalPrice = this.plans.reduce((sum, plan) => sum + (parseFloat(plan.price) || 0), 0);
    stats.priceStats.averagePrice = this.plans.length > 0 ? totalPrice / this.plans.length : 0;
    
    return stats;
  }
}

const normalizeBackendPlan = (backendPlan) => {
  if (!backendPlan) return null;

  const normalized = {
    id: backendPlan.id,
    planType: backendPlan.planType || backendPlan.plan_type || "paid",
    name: backendPlan.name || "",
    price: backendPlan.price ? parseFloat(backendPlan.price) : 0,
    active: backendPlan.active !== undefined ? backendPlan.active : true,
    category: backendPlan.category || "Residential",
    description: backendPlan.description || "",
    purchases: backendPlan.purchases || 0,
    priority_level: backendPlan.priority_level || 4,
    router_specific: backendPlan.router_specific || false,
    allowed_routers_ids: backendPlan.allowed_routers_ids || [],
    FUP_policy: backendPlan.FUP_policy || "",
    FUP_threshold: backendPlan.FUP_threshold || 80,
    template: backendPlan.template || null,
    created_at: backendPlan.created_at || backendPlan.createdAt || new Date().toISOString(),
    updated_at: backendPlan.updated_at || backendPlan.updatedAt || new Date().toISOString(),
    
    // Access methods with backend structure
    access_methods: {
      hotspot: {
        enabled: backendPlan.access_methods?.hotspot?.enabled || false,
        downloadSpeed: backendPlan.access_methods?.hotspot?.downloadSpeed || { value: "", unit: "Mbps" },
        uploadSpeed: backendPlan.access_methods?.hotspot?.uploadSpeed || { value: "", unit: "Mbps" },
        dataLimit: backendPlan.access_methods?.hotspot?.dataLimit || { value: "", unit: "GB" },
        usageLimit: backendPlan.access_methods?.hotspot?.usageLimit || { value: "", unit: "Hours" },
        bandwidthLimit: backendPlan.access_methods?.hotspot?.bandwidthLimit || 0,
        maxDevices: backendPlan.access_methods?.hotspot?.maxDevices || 1,
        sessionTimeout: backendPlan.access_methods?.hotspot?.sessionTimeout || 86400,
        idleTimeout: backendPlan.access_methods?.hotspot?.idleTimeout || 300,
        validityPeriod: backendPlan.access_methods?.hotspot?.validityPeriod || { value: "", unit: "Days" },
        macBinding: backendPlan.access_methods?.hotspot?.macBinding || false
      },
      pppoe: {
        enabled: backendPlan.access_methods?.pppoe?.enabled || false,
        downloadSpeed: backendPlan.access_methods?.pppoe?.downloadSpeed || { value: "", unit: "Mbps" },
        uploadSpeed: backendPlan.access_methods?.pppoe?.uploadSpeed || { value: "", unit: "Mbps" },
        dataLimit: backendPlan.access_methods?.pppoe?.dataLimit || { value: "", unit: "GB" },
        usageLimit: backendPlan.access_methods?.pppoe?.usageLimit || { value: "", unit: "Hours" },
        bandwidthLimit: backendPlan.access_methods?.pppoe?.bandwidthLimit || 0,
        maxDevices: backendPlan.access_methods?.pppoe?.maxDevices || 1,
        sessionTimeout: backendPlan.access_methods?.pppoe?.sessionTimeout || 86400,
        idleTimeout: backendPlan.access_methods?.pppoe?.idleTimeout || 300,
        validityPeriod: backendPlan.access_methods?.pppoe?.validityPeriod || { value: "", unit: "Days" },
        macBinding: backendPlan.access_methods?.pppoe?.macBinding || false,
        ipPool: backendPlan.access_methods?.pppoe?.ipPool || "pppoe-pool-1",
        serviceName: backendPlan.access_methods?.pppoe?.serviceName || "",
        mtu: backendPlan.access_methods?.pppoe?.mtu || 1492
      }
    },

    // Time variant data
    time_variant: backendPlan.time_variant ? {
      ...getInitialTimeVariantState(),
      ...backendPlan.time_variant
    } : null,

    // Pricing data
    pricing_info: backendPlan.pricing_info || null,
    time_variant_id: backendPlan.time_variant_id || null,
    pricing_matrix_id: backendPlan.pricing_matrix_id || null,
    discount_rule_ids: backendPlan.discount_rule_ids || []
  };

  // Determine access type based on enabled methods
  const enabledMethods = [];
  if (normalized.access_methods.hotspot.enabled) enabledMethods.push('hotspot');
  if (normalized.access_methods.pppoe.enabled) enabledMethods.push('pppoe');
  
  normalized.accessType = enabledMethods.length === 2 ? 'both' : 
                         enabledMethods.length === 1 ? enabledMethods[0] : 'hotspot';
  
  normalized.enabled_access_methods = enabledMethods;

  return normalized;
};

const preparePlanForBackend = (frontendPlan) => {
  const planData = {
    plan_type: frontendPlan.plan_type || frontendPlan.planType,
    name: frontendPlan.name?.trim() || "",
    price: parseFloat(frontendPlan.price) || 0,
    active: frontendPlan.active !== false,
    category: frontendPlan.category,
    description: frontendPlan.description?.trim() || "",
    
    // Access methods - match backend structure exactly
    access_methods: {
      hotspot: {
        enabled: frontendPlan.access_methods.hotspot.enabled || false,
        downloadSpeed: {
          value: frontendPlan.access_methods.hotspot.downloadSpeed.value || "10",
          unit: frontendPlan.access_methods.hotspot.downloadSpeed.unit || "Mbps"
        },
        uploadSpeed: {
          value: frontendPlan.access_methods.hotspot.uploadSpeed.value || "5",
          unit: frontendPlan.access_methods.hotspot.uploadSpeed.unit || "Mbps"
        },
        dataLimit: {
          value: frontendPlan.access_methods.hotspot.dataLimit.value || "10",
          unit: frontendPlan.access_methods.hotspot.dataLimit.unit || "GB"
        },
        usageLimit: {
          value: frontendPlan.access_methods.hotspot.usageLimit.value || "24",
          unit: frontendPlan.access_methods.hotspot.usageLimit.unit || "Hours"
        },
        bandwidthLimit: parseInt(frontendPlan.access_methods.hotspot.bandwidthLimit) || 0,
        maxDevices: parseInt(frontendPlan.access_methods.hotspot.maxDevices) || 1,
        sessionTimeout: parseInt(frontendPlan.access_methods.hotspot.sessionTimeout) || 86400,
        idleTimeout: parseInt(frontendPlan.access_methods.hotspot.idleTimeout) || 300,
        validityPeriod: {
          value: frontendPlan.access_methods.hotspot.validityPeriod.value || "30",
          unit: frontendPlan.access_methods.hotspot.validityPeriod.unit || "Days"
        },
        macBinding: frontendPlan.access_methods.hotspot.macBinding || false
      },
      pppoe: {
        enabled: frontendPlan.access_methods.pppoe.enabled || false,
        downloadSpeed: {
          value: frontendPlan.access_methods.pppoe.downloadSpeed.value || "10",
          unit: frontendPlan.access_methods.pppoe.downloadSpeed.unit || "Mbps"
        },
        uploadSpeed: {
          value: frontendPlan.access_methods.pppoe.uploadSpeed.value || "5",
          unit: frontendPlan.access_methods.pppoe.uploadSpeed.unit || "Mbps"
        },
        dataLimit: {
          value: frontendPlan.access_methods.pppoe.dataLimit.value || "10",
          unit: frontendPlan.access_methods.pppoe.dataLimit.unit || "GB"
        },
        usageLimit: {
          value: frontendPlan.access_methods.pppoe.usageLimit.value || "24",
          unit: frontendPlan.access_methods.pppoe.usageLimit.unit || "Hours"
        },
        bandwidthLimit: parseInt(frontendPlan.access_methods.pppoe.bandwidthLimit) || 0,
        maxDevices: parseInt(frontendPlan.access_methods.pppoe.maxDevices) || 1,
        sessionTimeout: parseInt(frontendPlan.access_methods.pppoe.sessionTimeout) || 86400,
        idleTimeout: parseInt(frontendPlan.access_methods.pppoe.idleTimeout) || 300,
        validityPeriod: {
          value: frontendPlan.access_methods.pppoe.validityPeriod.value || "30",
          unit: frontendPlan.access_methods.pppoe.validityPeriod.unit || "Days"
        },
        macBinding: frontendPlan.access_methods.pppoe.macBinding || false,
        ipPool: frontendPlan.access_methods.pppoe.ipPool || "pppoe-pool-1",
        serviceName: frontendPlan.access_methods.pppoe.serviceName || "",
        mtu: parseInt(frontendPlan.access_methods.pppoe.mtu) || 1492
      }
    },

    priority_level: frontendPlan.priority_level || 4,
    router_specific: frontendPlan.router_specific || false,
    allowed_routers_ids: frontendPlan.router_specific ? frontendPlan.allowed_routers_ids : [],
    FUP_policy: frontendPlan.FUP_policy || "",
    FUP_threshold: frontendPlan.FUP_threshold || 80,
    
    // Template reference
    template: frontendPlan.template || null,
    
    // Time variant reference
    time_variant_id: frontendPlan.time_variant_id || null,
    
    // Pricing references
    pricing_matrix_id: frontendPlan.pricing_matrix_id || null,
    discount_rule_ids: frontendPlan.discount_rule_ids || []
  };

  return planData;
};

const PlanManagement = () => {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  
  // Responsive hooks
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  
  // Form management - using usePlanForm hook
  const {
    form,
    setForm,
    errors,
    setErrors,
    touched,
    handleChange,
    handleAccessTypeChange,
    handleAccessMethodChange,
    handleAccessMethodNestedChange,
    handleFieldBlur,
    validateForm,
    resetForm,
    updateFormFields,
    getEnabledAccessMethods,
    getAccessType
  } = usePlanForm();

  // Time variant hook
  const {
    timeVariant: timeVariantState,
    setTimeVariant: setTimeVariantState,
    errors: timeVariantErrors,
    validateTimeVariant: validateTimeVariantHook,
    canActivate: canActivateTimeVariant,
    isAvailableNow: isTimeVariantAvailableNow,
    getNextAvailableTime: getTimeVariantNextAvailable,
    getAvailabilitySummary: getTimeVariantAvailabilitySummary
  } = useTimeVariant();

  // Pricing hook
  const {
    pricing: pricingState,
    setPricing: setPricingState,
    errors: pricingErrors,
    validatePricing: validatePricingHook,
    calculatePriceForQuantity,
    calculateBulkPrices,
    calculatePriceBreakdown,
    resetPricing: resetPricingHook
  } = usePricing();

  // State management with optimized data structures
  const [plansData, setPlansData] = useState(() => new PlanDataStructure());
  const [templates, setTemplates] = useState([]);
  const [routers, setRouters] = useState([]);
  const [priceMatrices, setPriceMatrices] = useState([]);
  const [discountRules, setDiscountRules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [editingPlan, setEditingPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [mobileSuccessAlert, setMobileSuccessAlert] = useState({ visible: false, message: "" });
  const [showPlanTypeModal, setShowPlanTypeModal] = useState(false);
  const [showAnalyticsTypeModal, setShowAnalyticsTypeModal] = useState(false);
  const [selectedAnalyticsType, setSelectedAnalyticsType] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState("30d");
  
  // Enhanced state
  const [showTimeVariantConfig, setShowTimeVariantConfig] = useState(false);
  const [showPricingConfig, setShowPricingConfig] = useState(false);
  const [priceCalculationResult, setPriceCalculationResult] = useState(null);
  const [availabilityCheckResult, setAvailabilityCheckResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    category: null,
    planType: null,
    accessType: null,
    availability: null,
    priceRange: null,
    hasTimeVariant: null
  });
  const [sortConfig, setSortConfig] = useState({
    field: "name",
    direction: "asc"
  });

  // Ref for debounced search
  const searchDebounceRef = useRef(null);

  // Mobile success alert
  const showMobileSuccess = useCallback((message) => {
    setMobileSuccessAlert({ visible: true, message });
    setTimeout(() => {
      setMobileSuccessAlert({ visible: false, message: "" });
    }, 3000);
  }, []);

  // Fetch all data with caching
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check cache first for faster loading
      const cachedPlans = PlanCache.get('all', 'plans');
      const cachedTemplates = PlanCache.get('all', 'templates');
      const cachedPriceMatrices = PlanCache.get('all', 'priceMatrices');
      const cachedDiscountRules = PlanCache.get('all', 'discountRules');

      let plansData, templatesData, priceMatricesData, discountRulesData;

      // Fetch plans with caching
      if (cachedPlans) {
        plansData = cachedPlans;
      } else {
        const response = await PlanApiService.getPlans();
        plansData = response;
        PlanCache.set('all', response, 'plans');
      }

      // Fetch templates with caching
      if (cachedTemplates) {
        templatesData = cachedTemplates;
      } else {
        const response = await PlanApiService.getTemplates();
        templatesData = response.results || response;
        PlanCache.set('all', templatesData, 'templates');
      }

      // Fetch price matrices with caching
      if (cachedPriceMatrices) {
        priceMatricesData = cachedPriceMatrices;
      } else {
        const response = await PlanApiService.getPriceMatrices();
        priceMatricesData = response.results || response;
        PlanCache.set('all', priceMatricesData, 'priceMatrices');
      }

      // Fetch discount rules with caching
      if (cachedDiscountRules) {
        discountRulesData = cachedDiscountRules;
      } else {
        const response = await PlanApiService.getDiscountRules();
        discountRulesData = response.results || response;
        PlanCache.set('all', discountRulesData, 'discountRules');
      }

      // Process plans into data structure
      const newPlansData = new PlanDataStructure();
      const normalizedPlans = (plansData.results || plansData).map(normalizeBackendPlan);
      normalizedPlans.forEach(plan => newPlansData.addPlan(plan));
      
      setPlansData(newPlansData);
      setFilteredPlans(normalizedPlans);
      setTemplates(templatesData);
      setPriceMatrices(priceMatricesData);
      setDiscountRules(discountRulesData);

      // Fetch routers if available
      try {
        const routersResponse = await api.get('/api/network_management/routers/');
        setRouters(routersResponse.data.results || routersResponse.data);
      } catch (error) {
        console.warn('Could not fetch routers:', error);
        setRouters([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      const message = "Failed to load data from server";
      if (isMobile) {
        showMobileSuccess(message);
      } else {
        toast.error(`${message}: ${error.response?.data?.detail || error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isMobile, showMobileSuccess]);

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async (type = 'general', timeRange = '30d') => {
    setIsLoading(true);
    try {
      const response = await PlanApiService.getAnalyticsData(type, timeRange);
      setAnalyticsData(response);
      return response;
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Export analytics data
  const exportAnalyticsData = useCallback(async (analyticsType, timeRange) => {
    try {
      const response = await PlanApiService.exportAnalyticsData(analyticsType, timeRange, 'json');
      
      // Create download link
      const dataStr = JSON.stringify(response, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-${analyticsType}-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Analytics data exported successfully');
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      toast.error('Failed to export analytics data');
    }
  }, []);

  // Refresh analytics data
  const refreshAnalyticsData = useCallback(() => {
    if (selectedAnalyticsType) {
      return fetchAnalyticsData(selectedAnalyticsType, analyticsTimeRange);
    }
    return Promise.resolve();
  }, [selectedAnalyticsType, analyticsTimeRange, fetchAnalyticsData]);

  // Filter and search plans with debouncing
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      let results;
      
      // If there's a search query, use the optimized search
      if (searchQuery.trim()) {
        results = plansData.search(searchQuery.trim());
      } else {
        // Otherwise use filter with indexes
        results = plansData.filter(activeFilters);
      }
      
      // Apply sorting
      results = results.sort((a, b) => {
        let aValue = a[sortConfig.field];
        let bValue = b[sortConfig.field];
        
        switch (sortConfig.field) {
          case 'price':
            aValue = parseFloat(aValue) || 0;
            bValue = parseFloat(bValue) || 0;
            break;
          case 'created_at':
          case 'updated_at':
            aValue = new Date(aValue).getTime();
            bValue = new Date(bValue).getTime();
            break;
          case 'name':
          case 'description':
            aValue = (aValue || '').toString().toLowerCase();
            bValue = (bValue || '').toString().toLowerCase();
            break;
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
      
      setFilteredPlans(results);
    }, 300); // 300ms debounce delay

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [plansData, searchQuery, activeFilters, sortConfig]);

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Apply filter
  const applyFilter = useCallback((filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setActiveFilters({
      category: null,
      planType: null,
      accessType: null,
      availability: null,
      priceRange: null,
      hasTimeVariant: null
    });
    setSearchQuery("");
  }, []);

  // Handle sort
  const handleSort = useCallback((field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Start new plan creation
  const startNewPlan = useCallback((planType = "hotspot", creationMethod = "create", templateId = null) => {
    resetForm();
    resetPricingHook();
    setTimeVariantState(getInitialTimeVariantState());
    
    const initialForm = getInitialFormState();
    
    initialForm.accessType = planType === 'dual' ? 'both' : planType;
    initialForm.access_methods.hotspot.enabled = planType === 'hotspot' || planType === 'dual';
    initialForm.access_methods.pppoe.enabled = planType === 'pppoe' || planType === 'dual';
    initialForm.plan_type = "paid";
    initialForm.active = true;
    initialForm.priority_level = 4;
    
    // If using template, apply template settings
    if (creationMethod === 'template' && templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        initialForm.name = `${template.name} - Copy`;
        initialForm.category = template.category || "Residential";
        initialForm.price = template.base_price?.toString() || "0";
        initialForm.description = template.description || "";
        
        if (template.access_methods) {
          initialForm.access_methods = deepClone(template.access_methods);
        }
        
        if (template.time_variant) {
          setTimeVariantState(template.time_variant);
        }
      }
    }
    
    setForm(initialForm);
    setEditingPlan(null);
    setActiveTab("basic");
    setViewMode("form");
    setShowPlanTypeModal(false);
  }, [resetForm, resetPricingHook, setTimeVariantState, templates, setForm]);

  // Edit plan
  const editPlan = useCallback((plan) => {
    const normalizedPlan = normalizeBackendPlan(plan);
    setForm(deepClone(normalizedPlan));
    
    // Load time variant if exists
    if (normalizedPlan.time_variant) {
      setTimeVariantState(normalizedPlan.time_variant);
    }
    
    // Load pricing if exists
    if (normalizedPlan.pricing_info) {
      setPricingState(normalizedPlan.pricing_info);
    }
    
    setEditingPlan(deepClone(normalizedPlan));
    setActiveTab("basic");
    setViewMode("form");
  }, [setForm, setTimeVariantState, setPricingState]);

  // View plan details
  const viewPlanDetails = useCallback((plan) => {
    setSelectedPlan(normalizeBackendPlan(plan));
    setViewMode("details");
  }, []);

  // Check plan availability
  const checkAvailability = useCallback(async (planId) => {
    try {
      const result = await PlanApiService.checkAvailability(planId);
      setAvailabilityCheckResult(result);
      return result;
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Failed to check availability');
      return null;
    }
  }, []);

  // Calculate price
  const calculatePrice = useCallback(async (planId, quantity = 1) => {
    try {
      const result = await PlanApiService.calculatePrice(planId, quantity);
      setPriceCalculationResult(result);
      return result;
    } catch (error) {
      console.error('Error calculating price:', error);
      toast.error('Failed to calculate price');
      return null;
    }
  }, []);

  // Save plan with optimistic updates
  const savePlan = async () => {
    // Validate form
    const isFormValid = validateForm();
    if (!isFormValid) {
      const message = "Please fix validation errors before saving";
      isMobile ? showMobileSuccess(message) : toast.error(message);
      return;
    }

    // Validate time variant if active
    if (timeVariantState.is_active) {
      const timeVariantValid = validateTimeVariantHook();
      if (!timeVariantValid) {
        const message = "Please fix time variant validation errors";
        isMobile ? showMobileSuccess(message) : toast.error(message);
        return;
      }
    }

    // Validate pricing if configured
    if (pricingState.price) {
      const pricingValid = validatePricingHook();
      if (!pricingValid) {
        const message = "Please fix pricing validation errors";
        isMobile ? showMobileSuccess(message) : toast.error(message);
        return;
      }
    }

    setIsLoading(true);
    
    // Prepare plan data
    const planData = preparePlanForBackend(form);
    
    // Add time variant if active
    if (timeVariantState.is_active) {
      planData.time_variant = timeVariantState;
    }
    
    // Add pricing if configured
    if (pricingState.price) {
      planData.pricing_info = pricingState;
    }

    // Optimistic update
    const optimisticPlan = normalizeBackendPlan({
      ...planData,
      id: editingPlan?.id || `temp_${Date.now()}`,
      created_at: editingPlan ? editingPlan.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
      purchases: editingPlan?.purchases || 0,
      time_variant: timeVariantState.is_active ? timeVariantState : null,
      pricing_info: pricingState.price ? pricingState : null
    });

    if (editingPlan) {
      // Optimistic update for editing
      const updatedPlansData = new PlanDataStructure();
      plansData.plans.forEach(plan => {
        if (plan.id === editingPlan.id) {
          updatedPlansData.addPlan(optimisticPlan);
        } else {
          updatedPlansData.addPlan(plan);
        }
      });
      setPlansData(updatedPlansData);
    } else {
      // Optimistic add for new plan
      const updatedPlansData = new PlanDataStructure();
      plansData.plans.forEach(plan => updatedPlansData.addPlan(plan));
      updatedPlansData.addPlan(optimisticPlan);
      setPlansData(updatedPlansData);
    }

    try {
      let response;
      let message;

      if (editingPlan) {
        // Update existing plan
        response = await PlanApiService.updatePlan(editingPlan.id, planData);
        const updatedPlan = normalizeBackendPlan(response.data);
        
        // Update cache
        PlanCache.set(updatedPlan.id, updatedPlan, 'plans');
        PlanCache.delete('all', 'plans'); // Invalidate cache
        
        // Update data structure
        const finalPlansData = new PlanDataStructure();
        plansData.plans.forEach(plan => {
          if (plan.id === updatedPlan.id) {
            finalPlansData.addPlan(updatedPlan);
          } else {
            finalPlansData.addPlan(plan);
          }
        });
        setPlansData(finalPlansData);
        
        message = `Plan "${planData.name}" updated successfully`;
      } else {
        // Create new plan
        response = await PlanApiService.createPlan(planData);
        const newPlan = normalizeBackendPlan(response.data);
        
        // Update cache
        PlanCache.set(newPlan.id, newPlan, 'plans');
        PlanCache.delete('all', 'plans'); // Invalidate cache
        
        // Update data structure
        const finalPlansData = new PlanDataStructure();
        plansData.plans.forEach(plan => finalPlansData.addPlan(plan));
        finalPlansData.addPlan(newPlan);
        setPlansData(finalPlansData);
        
        message = `Plan "${planData.name}" created successfully`;
      }

      // Show success message
      isMobile ? showMobileSuccess(message) : toast.success(message);

      // Reset and return to list
      resetForm();
      resetPricingHook();
      setTimeVariantState(getInitialTimeVariantState());
      setEditingPlan(null);
      setViewMode("list");

    } catch (error) {
      console.error('Error saving plan:', error);
      
      // Revert optimistic update on error
      fetchData();
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to save plan';
      isMobile ? showMobileSuccess(errorMessage) : toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete plan with optimistic update
  const confirmDelete = useCallback((plan) => {
    setPlanToDelete(plan);
    setDeleteModalOpen(true);
  }, []);

  const deletePlan = async () => {
    if (!planToDelete) return;
    
    setIsLoading(true);
    
    // Optimistic update
    const optimisticPlansData = new PlanDataStructure();
    plansData.plans.forEach(plan => {
      if (plan.id !== planToDelete.id) {
        optimisticPlansData.addPlan(plan);
      }
    });
    setPlansData(optimisticPlansData);
    
    if (selectedPlan?.id === planToDelete.id) {
      setSelectedPlan(null);
      setViewMode("list");
    }
    
    try {
      await PlanApiService.deletePlan(planToDelete.id);
      
      // Update cache
      PlanCache.delete(planToDelete.id, 'plans');
      PlanCache.delete('all', 'plans'); // Invalidate cache
      
      const message = `Plan "${planToDelete.name}" deleted successfully`;
      isMobile ? showMobileSuccess(message) : toast.success(message);
    } catch (error) {
      console.error('Error deleting plan:', error);
      
      // Revert optimistic update on error
      fetchData();
      
      const errorMessage = error.response?.data?.detail || 'Failed to delete plan';
      isMobile ? showMobileSuccess(errorMessage) : toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setDeleteModalOpen(false);
      setPlanToDelete(null);
    }
  };

  // Duplicate plan
  const duplicatePlan = useCallback(async (plan) => {
    setIsLoading(true);
    
    // Optimistic update
    const planCopy = {
      ...plan,
      id: `temp_${Date.now()}`,
      name: `${plan.name} (Copy)`,
      purchases: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const optimisticPlansData = new PlanDataStructure();
    plansData.plans.forEach(p => optimisticPlansData.addPlan(p));
    optimisticPlansData.addPlan(planCopy);
    setPlansData(optimisticPlansData);
    
    try {
      const planData = preparePlanForBackend(planCopy);
      const response = await PlanApiService.createPlan(planData);
      const newPlan = normalizeBackendPlan(response.data);
      
      // Update data structure with real data
      const finalPlansData = new PlanDataStructure();
      plansData.plans.forEach(p => {
        if (p.id !== planCopy.id) {
          finalPlansData.addPlan(p);
        }
      });
      finalPlansData.addPlan(newPlan);
      setPlansData(finalPlansData);
      
      // Update cache
      PlanCache.set(newPlan.id, newPlan, 'plans');
      PlanCache.delete('all', 'plans'); // Invalidate cache
      
      const message = `Plan "${newPlan.name}" duplicated successfully`;
      isMobile ? showMobileSuccess(message) : toast.success(message);
    } catch (error) {
      console.error('Error duplicating plan:', error);
      
      // Revert optimistic update on error
      fetchData();
      
      const errorMessage = error.response?.data?.detail || 'Failed to duplicate plan';
      isMobile ? showMobileSuccess(errorMessage) : toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [plansData, isMobile, showMobileSuccess, fetchData]);

  // Toggle plan status with optimistic update
  const togglePlanStatus = useCallback(async (plan) => {
    setIsLoading(true);
    
    // Optimistic update
    const updatedPlan = {
      ...plan,
      active: !plan.active,
      updated_at: new Date().toISOString()
    };
    
    const optimisticPlansData = new PlanDataStructure();
    plansData.plans.forEach(p => {
      if (p.id === plan.id) {
        optimisticPlansData.addPlan(updatedPlan);
      } else {
        optimisticPlansData.addPlan(p);
      }
    });
    setPlansData(optimisticPlansData);
    
    try {
      const planData = preparePlanForBackend(plan);
      planData.active = !plan.active;
      
      const response = await PlanApiService.updatePlan(plan.id, planData);
      const finalPlan = normalizeBackendPlan(response.data);
      
      // Update data structure with real data
      const finalPlansData = new PlanDataStructure();
      plansData.plans.forEach(p => {
        if (p.id === plan.id) {
          finalPlansData.addPlan(finalPlan);
        } else {
          finalPlansData.addPlan(p);
        }
      });
      setPlansData(finalPlansData);
      
      // Update cache
      PlanCache.set(finalPlan.id, finalPlan, 'plans');
      PlanCache.delete('all', 'plans'); // Invalidate cache
      
      const message = `Plan "${plan.name}" ${finalPlan.active ? 'activated' : 'deactivated'} successfully`;
      isMobile ? showMobileSuccess(message) : toast.success(message);
    } catch (error) {
      console.error('Error toggling plan status:', error);
      
      // Revert optimistic update on error
      fetchData();
      
      const errorMessage = error.response?.data?.detail || 'Failed to update plan status';
      isMobile ? showMobileSuccess(errorMessage) : toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [plansData, isMobile, showMobileSuccess, fetchData]);

  // Apply template
  const applyTemplate = useCallback((template) => {
    const newForm = getInitialFormState();
    
    // Apply template settings
    newForm.name = template.name || "";
    newForm.category = template.category || "Residential";
    newForm.price = template.base_price?.toString() || template.basePrice?.toString() || "0";
    newForm.description = template.description || "";
    newForm.access_methods = template.access_methods || template.accessMethods || getInitialFormState().access_methods;
    
    // Determine access type
    const enabledMethods = [];
    if (newForm.access_methods.hotspot?.enabled) enabledMethods.push('hotspot');
    if (newForm.access_methods.pppoe?.enabled) enabledMethods.push('pppoe');
    newForm.accessType = enabledMethods.length === 2 ? 'both' : 
                         enabledMethods.length === 1 ? enabledMethods[0] : 'hotspot';
    
    // Apply time variant if exists
    if (template.time_variant || template.timeVariant) {
      setTimeVariantState(template.time_variant || template.timeVariant);
    }
    
    // Apply pricing if exists
    if (template.pricing_info) {
      setPricingState(template.pricing_info);
    }
    
    newForm.plan_type = parseFloat(newForm.price) > 0 ? "paid" : "free_trial";
    newForm.priority_level = 4;
    newForm.active = true;
    
    setForm(newForm);
    setEditingPlan(null);
    setActiveTab("basic");
    setViewMode("form");
    
    const message = `Template "${template.name}" applied`;
    isMobile ? showMobileSuccess(message) : toast.success(message);
  }, [setForm, setTimeVariantState, setPricingState, isMobile, showMobileSuccess]);

  // Create plan from template
  const createPlanFromTemplate = useCallback(async (templateId, planData) => {
    setIsLoading(true);
    
    try {
      const response = await PlanApiService.createPlanFromTemplate(templateId, planData);
      const newPlan = normalizeBackendPlan(response.data);
      
      // Update data structure
      const finalPlansData = new PlanDataStructure();
      plansData.plans.forEach(p => finalPlansData.addPlan(p));
      finalPlansData.addPlan(newPlan);
      setPlansData(finalPlansData);
      
      // Update cache
      PlanCache.set(newPlan.id, newPlan, 'plans');
      PlanCache.delete('all', 'plans'); // Invalidate cache
      
      const message = `Plan created from template successfully`;
      isMobile ? showMobileSuccess(message) : toast.success(message);
      
      setViewMode("list");
      return response.data;
    } catch (error) {
      console.error('Error creating plan from template:', error);
      
      const errorMessage = error.response?.data?.detail || 'Failed to create plan from template';
      isMobile ? showMobileSuccess(errorMessage) : toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [plansData, isMobile, showMobileSuccess]);

  // Handle analytics selection
  const handleAnalyticsSelect = useCallback(async (analyticsType) => {
    setSelectedAnalyticsType(analyticsType);
    setShowAnalyticsTypeModal(false);
    setViewMode("analytics");
    
    // Fetch analytics data
    await fetchAnalyticsData(analyticsType, analyticsTimeRange);
  }, [analyticsTimeRange, fetchAnalyticsData]);

  // Handle analytics time range change
  const handleAnalyticsTimeRangeChange = useCallback((timeRange) => {
    setAnalyticsTimeRange(timeRange);
    if (selectedAnalyticsType) {
      fetchAnalyticsData(selectedAnalyticsType, timeRange);
    }
  }, [selectedAnalyticsType, fetchAnalyticsData]);

  // Dynamic tabs responsive design
  const getTabs = useCallback(() => {
    const baseTabs = [
      { id: "basic", label: "Basic Details", icon: Settings },
      { id: "advanced", label: "Advanced", icon: Server },
    ];

    // Add access-specific tab
    const enabledMethods = getEnabledAccessMethods();
    if (enabledMethods.includes('hotspot')) {
      baseTabs.splice(1, 0, { id: "hotspot", label: "Hotspot", icon: Wifi });
    }
    if (enabledMethods.includes('pppoe')) {
      baseTabs.splice(enabledMethods.includes('hotspot') ? 2 : 1, 0, 
        { id: "pppoe", label: "PPPoE", icon: Cable });
    }

    // Add time variant tab if enabled
    if (timeVariantState.is_active) {
      baseTabs.push({ id: "time_variant", label: "Time Settings", icon: Clock });
    }

    // Add pricing tab
    baseTabs.push({ id: "pricing", label: "Pricing", icon: DollarSign });

    return baseTabs;
  }, [getEnabledAccessMethods, timeVariantState.is_active]);

  // Render tabs with responsive design
  const renderTabs = () => {
    const tabs = getTabs();
    
    return (
      <div className={`p-2 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light} mb-4 overflow-x-auto`}>
        <div className="flex space-x-1 min-w-max">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            const buttonSize = isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm';
            const iconSize = isMobile ? 'w-3 h-3' : 'w-4 h-4';
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  ${buttonSize} rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap
                  ${isActive 
                    ? "bg-indigo-600 text-white shadow-md" 
                    : `${themeClasses.text.secondary} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`
                  }
                `}
              >
                <IconComponent className={`${iconSize}`} />
                <span className={isMobile ? 'hidden sm:inline' : 'inline'}>
                  {isMobile && !isDesktop ? tab.label.split(' ')[0] : tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Render form content based on active tab
  const renderFormContent = () => {
    const commonProps = {
      form,
      errors,
      theme,
      isMobile
    };

    switch (activeTab) {
      case "basic":
        return (
          <PlanBasicDetails
            {...commonProps}
            touched={touched}
            onChange={handleChange}
            onAccessTypeChange={handleAccessTypeChange}
            onBlur={handleFieldBlur}
          />
        );
      case "hotspot":
        return (
          <HotspotConfiguration
            {...commonProps}
            onChange={handleAccessMethodChange}
            onNestedChange={handleAccessMethodNestedChange}
          />
        );
      case "pppoe":
        return (
          <PPPoEConfiguration
            {...commonProps}
            onChange={handleAccessMethodChange}
            onNestedChange={handleAccessMethodNestedChange}
          />
        );
      case "advanced":
        return (
          <PlanAdvancedSettings
            {...commonProps}
            onChange={handleChange}
            routers={routers}
          />
        );
      case "time_variant":
        return (
          <TimeVariantConfig
            timeVariant={timeVariantState}
            onChange={(field, value) => {
              // Update time variant state
              const newTimeVariant = { ...timeVariantState, [field]: value };
              setTimeVariantState(newTimeVariant);
              
              // Update form if needed
              if (field === 'is_active' && !value) {
                handleChange('time_variant_id', null);
              }
            }}
            errors={timeVariantErrors}
            theme={theme}
            isMobile={isMobile}
          />
        );
      case "pricing":
        return (
          <PricingConfiguration
            {...commonProps}
            priceMatrices={priceMatrices}
            discountRules={discountRules}
            onChange={handleChange}
            onCalculatePrice={() => editingPlan && calculatePrice(editingPlan.id)}
            priceCalculationResult={priceCalculationResult}
            pricingState={pricingState}
            pricingErrors={pricingErrors}
            onPricingChange={(field, value) => {
              const newPricing = { ...pricingState, [field]: value };
              setPricingState(newPricing);
            }}
            onCalculatePricing={(quantity) => {
              if (pricingState.price) {
                const breakdown = calculatePriceBreakdown(quantity);
                setPriceCalculationResult({
                  success: true,
                  data: breakdown
                });
                return breakdown;
              }
              return null;
            }}
          />
        );
      default:
        return null;
    }
  };

  // Helper component for plan details view
  const DetailRow = ({ label, children, theme }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
      <span className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        {label}:
      </span>
      <div className="sm:text-right text-sm">
        {children}
      </div>
    </div>
  );

  const DetailCard = ({ icon, title, value, theme }) => (
    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
      <div className="flex items-center mb-2">
        {icon}
        <span className="ml-2 text-sm font-medium">{title}</span>
      </div>
      <div className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
        {value}
      </div>
    </div>
  );

  // Render plan details view with responsive design
  const renderPlanDetails = () => {
    if (!selectedPlan) return null;

    const isAvailable = isPlanAvailableNow(selectedPlan);
    const nextAvailable = calculateNextAvailableTime(selectedPlan.time_variant);
    const availabilitySummary = getAvailabilitySummary(selectedPlan.time_variant);

    return (
      <div className={`min-h-screen p-3 sm:p-4 md:p-6 transition-colors duration-300 ${themeClasses.bg.primary}`}>
        <main className="max-w-6xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
          {/* Header - Responsive */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <button
                onClick={() => setViewMode("list")}
                className={`mb-3 flex items-center text-sm ${themeClasses.text.secondary} hover:${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Plans
              </button>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 truncate">
                {selectedPlan.name || 'Unnamed Plan'} Details
              </h1>
              <p className={`mt-1 text-sm sm:text-base ${themeClasses.text.secondary}`}>
                Complete plan information and specifications
              </p>
            </div>
            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <motion.button 
                onClick={() => editPlan(selectedPlan)}
                className={`px-3 py-2 rounded-lg text-sm flex items-center ${themeClasses.button.primary}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Pencil className="w-4 h-4 mr-2" />
                <span className={isMobile ? 'hidden sm:inline' : 'inline'}>Edit</span>
              </motion.button>
              <motion.button 
                onClick={() => duplicatePlan(selectedPlan)}
                className={`px-3 py-2 rounded-lg text-sm flex items-center ${themeClasses.button.secondary}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Copy className="w-4 h-4 mr-2" />
                <span className={isMobile ? 'hidden sm:inline' : 'inline'}>Duplicate</span>
              </motion.button>
            </div>
          </div>

          {/* Availability Badge - Responsive */}
          <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className={`text-lg font-semibold mb-2 ${themeClasses.text.primary}`}>
                  Availability Status
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <AvailabilityBadge
                    status={isAvailable ? "available" : "unavailable"}
                    message={availabilitySummary.message}
                    theme={theme}
                    size={isMobile ? "sm" : "md"}
                    showIcon
                  />
                  {nextAvailable && (
                    <div className={`text-sm flex items-center ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                      <Clock className="w-3 h-3 mr-1" />
                      Next: {nextAvailable}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => checkAvailability(selectedPlan.id)}
                className={`px-4 py-2 rounded-lg ${themeClasses.button.info} whitespace-nowrap text-sm sm:text-base`}
              >
                Check Availability
              </button>
            </div>
          </div>

          {/* Plan Details Grid - Responsive */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Basic Information Card */}
            <div className={`p-4 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-3 text-indigo-600" />
                Basic Information
              </h3>
              <div className="space-y-3">
                <DetailRow label="Type" theme={theme}>
                  <PlanTypeBadge type={selectedPlan.planType} theme={theme} size="sm" />
                </DetailRow>
                <DetailRow label="Category" theme={theme}>
                  <span className={themeClasses.text.primary}>{selectedPlan.category}</span>
                </DetailRow>
                <DetailRow label="Price" theme={theme}>
                  <PriceBadge 
                    price={selectedPlan.price} 
                    originalPrice={selectedPlan.pricing_info?.original_price}
                    currency="KES"
                    theme={theme}
                    size="md"
                  />
                </DetailRow>
                <DetailRow label="Status" theme={theme}>
                  <span className={`font-medium ${selectedPlan.active ? "text-green-600" : "text-red-600"}`}>
                    {selectedPlan.active ? "Active" : "Inactive"}
                  </span>
                </DetailRow>
                <DetailRow label="Subscribers" theme={theme}>
                  <span className="font-bold text-indigo-600">{selectedPlan.purchases || 0}</span>
                </DetailRow>
              </div>
            </div>

            {/* Configuration Card */}
            <div className={`p-4 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-3 text-indigo-600" />
                Configuration
              </h3>
              <div className="space-y-3">
                <DetailRow label="Access Type" theme={theme}>
                  <span className="flex items-center gap-2">
                    {selectedPlan.enabled_access_methods.map(method => {
                      const accessTypeColor = getAccessTypeColor(method);
                      return (
                        <span key={method} className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                          theme === 'dark' 
                            ? `${accessTypeColor.dark.bg} ${accessTypeColor.dark.text}`
                            : `${accessTypeColor.light.bg} ${accessTypeColor.light.text}`
                        }`}>
                          {method === 'hotspot' ? <Wifi className="w-3 h-3 mr-1" /> : <Cable className="w-3 h-3 mr-1" />}
                          {method.toUpperCase()}
                        </span>
                      );
                    })}
                  </span>
                </DetailRow>
                {selectedPlan.enabled_access_methods.includes('hotspot') && (
                  <>
                    <DetailRow label="Download Speed" theme={theme}>
                      <span className={themeClasses.text.primary}>
                        {selectedPlan.access_methods.hotspot.downloadSpeed.value} {selectedPlan.access_methods.hotspot.downloadSpeed.unit}
                      </span>
                    </DetailRow>
                    <DetailRow label="Data Limit" theme={theme}>
                      <span className={themeClasses.text.primary}>
                        {selectedPlan.access_methods.hotspot.dataLimit.value} {selectedPlan.access_methods.hotspot.dataLimit.unit}
                      </span>
                    </DetailRow>
                  </>
                )}
                {selectedPlan.enabled_access_methods.includes('pppoe') && (
                  <>
                    <DetailRow label="Upload Speed" theme={theme}>
                      <span className={themeClasses.text.primary}>
                        {selectedPlan.access_methods.pppoe.uploadSpeed.value} {selectedPlan.access_methods.pppoe.uploadSpeed.unit}
                      </span>
                    </DetailRow>
                    <DetailRow label="IP Pool" theme={theme}>
                      <span className={themeClasses.text.primary}>
                        {selectedPlan.access_methods.pppoe.ipPool}
                      </span>
                    </DetailRow>
                  </>
                )}
              </div>
            </div>

            {/* Time Variant Card - Full width on mobile, spans columns on desktop */}
            {selectedPlan.time_variant?.is_active && (
              <div className={`p-4 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light} md:col-span-2 lg:col-span-1`}>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-3 text-indigo-600" />
                  Time Restrictions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedPlan.time_variant.start_time && selectedPlan.time_variant.end_time && (
                    <DetailCard 
                      icon={<Clock className="w-4 h-4 text-blue-500" />}
                      title="Time Range"
                      value={`${formatTime(selectedPlan.time_variant.start_time)} - ${formatTime(selectedPlan.time_variant.end_time)}`}
                      theme={theme}
                    />
                  )}
                  
                  {selectedPlan.time_variant.available_days?.length > 0 && (
                    <DetailCard 
                      icon={<CalendarDays className="w-4 h-4 text-green-500" />}
                      title="Available Days"
                      value={selectedPlan.time_variant.available_days.map(day => 
                        daysOfWeek.find(d => d.value === day)?.label || day
                      ).join(', ')}
                      theme={theme}
                    />
                  )}
                  
                  {selectedPlan.time_variant.schedule_active && (
                    <DetailCard 
                      icon={<CalendarClock className="w-4 h-4 text-purple-500" />}
                      title="Schedule"
                      value={`${formatDate(selectedPlan.time_variant.schedule_start_date)} to ${formatDate(selectedPlan.time_variant.schedule_end_date)}`}
                      theme={theme}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons - Responsive */}
            <div className="md:col-span-2 lg:col-span-3 flex flex-col sm:flex-row gap-3 pt-4">
              <motion.button
                onClick={() => togglePlanStatus(selectedPlan)}
                className={`px-4 py-3 rounded-lg flex-1 text-center text-sm sm:text-base ${
                  selectedPlan.active 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {selectedPlan.active ? 'Deactivate Plan' : 'Activate Plan'}
              </motion.button>
              
              <motion.button
                onClick={() => duplicatePlan(selectedPlan)}
                className="px-4 py-3 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 flex-1 text-center text-sm sm:text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Duplicate Plan
              </motion.button>
            </div>
          </div>
        </main>
      </div>
    );
  };

  // Check form validity
  const isFormValid = useMemo(() => {
    // Basic validations
    if (!form.name?.trim() || !form.category || !form.plan_type) {
      return false;
    }

    // Price validation for paid plans
    if (form.plan_type === "paid") {
      const price = parseFloat(form.price);
      if (isNaN(price) || price < 0) {
        return false;
      }
    }

    // Check at least one access method is enabled
    const hasEnabledMethods = form.access_methods.hotspot.enabled || form.access_methods.pppoe.enabled;
    if (!hasEnabledMethods) {
      return false;
    }

    // Check enabled methods have required fields
    if (form.access_methods.hotspot.enabled) {
      if (!form.access_methods.hotspot.downloadSpeed.value || 
          !form.access_methods.hotspot.uploadSpeed.value) {
        return false;
      }
    }

    if (form.access_methods.pppoe.enabled) {
      if (!form.access_methods.pppoe.downloadSpeed.value || 
          !form.access_methods.pppoe.uploadSpeed.value) {
        return false;
      }
    }

    // Validate time variant if active
    if (timeVariantState.is_active) {
      const timeVariantErrors = validateTimeVariant(timeVariantState);
      if (Object.keys(timeVariantErrors).length > 0) {
        return false;
      }
    }

    return true;
  }, [form, timeVariantState]);

  // Main render with responsive container
  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* Analytics View */}
      <AnimatePresence>
        {viewMode === "analytics" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`${themeClasses.bg.primary}`}
          >
            <PlanAnalytics
              plans={filteredPlans}
              templates={templates}
              onBack={() => {
                setViewMode("list");
                setSelectedAnalyticsType(null);
                setAnalyticsData(null);
              }}
              analyticsType={selectedAnalyticsType}
              analyticsData={analyticsData}
              timeRange={analyticsTimeRange}
              onTimeRangeChange={handleAnalyticsTimeRangeChange}
              onExportData={() => exportAnalyticsData(selectedAnalyticsType, analyticsTimeRange)}
              onRefreshAnalytics={refreshAnalyticsData}
              theme={theme}
              isMobile={isMobile}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Templates View */}
      <AnimatePresence>
        {viewMode === "templates" && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`${themeClasses.bg.primary}`}
          >
            <PlanTemplates
              templates={templates}
              onApplyTemplate={applyTemplate}
              onCreateFromTemplate={createPlanFromTemplate}
              onBack={() => setViewMode("list")}
              theme={theme}
              isMobile={isMobile}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* List View */}
      <AnimatePresence>
        {viewMode === "list" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`${themeClasses.bg.primary}`}
          >
            <PlanList
              plans={filteredPlans}
              isLoading={isLoading}
              onEditPlan={editPlan}
              onViewDetails={viewPlanDetails}
              onDeletePlan={confirmDelete}
              onDuplicatePlan={duplicatePlan}
              onToggleStatus={togglePlanStatus}
              onNewPlan={() => setShowPlanTypeModal(true)}
              onViewAnalytics={() => setShowAnalyticsTypeModal(true)}
              onViewTemplates={() => setViewMode("templates")}
              theme={theme}
              isMobile={isMobile}
              isTablet={isTablet}
              isDesktop={isDesktop}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeFilters={activeFilters}
              onApplyFilter={applyFilter}
              onClearFilters={clearFilters}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form View */}
      <AnimatePresence>
        {viewMode === "form" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`min-h-screen p-3 sm:p-4 md:p-6 transition-colors duration-300 ${themeClasses.bg.primary}`}
          >
            <main className="max-w-6xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
              {/* Header - Responsive */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => {
                      setViewMode("list");
                      resetForm();
                      resetPricingHook();
                      setTimeVariantState(getInitialTimeVariantState());
                      setEditingPlan(null);
                    }}
                    className={`mb-3 flex items-center text-sm ${themeClasses.text.secondary} hover:${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Plans
                  </button>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 truncate">
                    {editingPlan ? "Edit Plan" : "Create New Plan"}
                  </h1>
                  <p className={`mt-1 text-sm sm:text-base ${themeClasses.text.secondary}`}>
                    {editingPlan ? "Update your internet plan details" : "Configure your new internet service plan"}
                  </p>
                </div>
                <div className="flex items-center space-x-2 self-end sm:self-auto">
                  {timeVariantState.is_active && (
                    <motion.button
                      onClick={() => {
                        const newTimeVariant = { 
                          ...timeVariantState, 
                          force_available: !timeVariantState.force_available 
                        };
                        setTimeVariantState(newTimeVariant);
                      }}
                      className={`px-3 py-1 text-xs rounded-full flex items-center ${
                        timeVariantState.force_available
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {timeVariantState.force_available ? 'Forced Available' : 'Time Restricted'}
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Status Bar - Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div>
                      <span className="text-sm font-medium">
                        {form.accessType === 'hotspot' ? 'Hotspot Plan' : 'PPPoE Plan'}
                      </span>
                      <div className="text-xs mt-1 opacity-75">
                        {form.access_methods.hotspot.enabled && form.access_methods.pppoe.enabled 
                          ? 'Both access methods enabled' 
                          : form.access_methods.hotspot.enabled 
                            ? 'Hotspot only' 
                            : 'PPPoE only'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">Availability</span>
                      <div className="text-xs mt-1 opacity-75">
                        {timeVariantState.is_active 
                          ? 'Time restricted' 
                          : 'Available at all times'}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        // Toggle time variant
                        const newTimeVariant = { 
                          ...timeVariantState, 
                          is_active: !timeVariantState.is_active 
                        };
                        setTimeVariantState(newTimeVariant);
                        if (newTimeVariant.is_active) {
                          setActiveTab("time_variant");
                        }
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                    >
                      {timeVariantState.is_active ? 'Disable' : 'Configure'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              {renderTabs()}

              {/* Form Content */}
              <div className="space-y-4 lg:space-y-6">
                {renderFormContent()}
              </div>

              {/* Form Actions - Responsive */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                <motion.button 
                  onClick={() => {
                    setViewMode("list");
                    resetForm();
                    resetPricingHook();
                    setTimeVariantState(getInitialTimeVariantState());
                    setEditingPlan(null);
                  }} 
                  className={`px-4 py-3 rounded-lg shadow-md ${themeClasses.button.secondary} flex-1 sm:flex-none text-sm sm:text-base`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                
                <motion.button 
                  onClick={() => editingPlan && calculatePrice(editingPlan.id)}
                  disabled={!editingPlan || isLoading}
                  className={`px-4 py-3 rounded-lg shadow-md ${
                    theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                  } text-white flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base`}
                  whileHover={{ scale: editingPlan ? 1.05 : 1 }}
                  whileTap={{ scale: editingPlan ? 0.95 : 1 }}
                >
                  <DollarSign className="w-4 h-4 mr-2 inline" />
                  Calculate Price
                </motion.button>
                
                <motion.button 
                  onClick={savePlan}
                  disabled={!isFormValid || isLoading}
                  className={`px-4 py-3 rounded-lg shadow-md flex items-center justify-center ${
                    isFormValid && !isLoading 
                      ? themeClasses.button.success 
                      : 'bg-gray-400 cursor-not-allowed dark:bg-gray-700'
                  } flex-1 sm:flex-none text-sm sm:text-base`}
                  whileHover={isFormValid && !isLoading ? { scale: 1.05 } : {}}
                  whileTap={isFormValid && !isLoading ? { scale: 0.95 } : {}}
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingPlan ? "Update Plan" : "Create Plan"}
                    </>
                  )}
                </motion.button>
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details View */}
      <AnimatePresence>
        {viewMode === "details" && renderPlanDetails()}
      </AnimatePresence>

      {/* Modals */}
      <PlanTypeSelectionModal
        isOpen={showPlanTypeModal}
        onClose={() => setShowPlanTypeModal(false)}
        onSelect={({ planType, creationMethod, templateId }) => 
          startNewPlan(planType, creationMethod, templateId)
        }
        templates={templates}
        theme={theme}
        isMobile={isMobile}
      />

      <AnalyticsTypeSelectionModal
        isOpen={showAnalyticsTypeModal}
        onClose={() => setShowAnalyticsTypeModal(false)}
        onSelect={handleAnalyticsSelect}
        plans={plansData.plans}
        theme={theme}
        isMobile={isMobile}
      />

      {/* Mobile Success Alert */}
      <MobileSuccessAlert 
        message={mobileSuccessAlert.message}
        isVisible={mobileSuccessAlert.visible}
        onClose={() => setMobileSuccessAlert({ visible: false, message: "" })}
        theme={theme}
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
        isMobile={isMobile}
        isLoading={isLoading}
      />

      {/* Loading Overlay */}
      <LoadingOverlay 
        isVisible={isLoading && viewMode === 'list'}
        message="Loading plans..."
        theme={theme}
      />

      {/* Toast Container */}
      <ToastContainer 
        position={isMobile ? "top-center" : "top-right"}
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme}
        style={{
          fontSize: isMobile ? '12px' : '14px',
          width: isMobile ? '90%' : 'auto'
        }}
      />
    </div>
  );
};

export default PlanManagement;