






// import { useState, useCallback } from "react";
// import { 
//   deepClone, 
//   validateRequired, 
//   validatePrice,
//   validateTimeVariant as validateTimeVariantUtil
// } from "../../Shared/utils.js";

// // Initial form state with NO default values
// export const getInitialFormState = () => ({
//   // Basic details - all empty strings or null, no defaults
//   plan_type: "",
//   name: "",
//   price: "", // NO DEFAULT VALUE
//   active: true,
//   category: "",
//   description: "",
  
//   // Access methods configuration
//   access_methods: {
//     hotspot: {
//       enabled: true,
//       download_speed: { value: "", unit: "Mbps" },
//       upload_speed: { value: "", unit: "Mbps" },
//       data_limit: { value: "", unit: "GB" },
//       usage_limit: { value: "", unit: "Hours" },
//       bandwidth_limit: "",
//       max_devices: "", // Optional
//       session_timeout: "", // Optional
//       idle_timeout: "", // Optional
//       validity_period: { value: "", unit: "Days" },
//       mac_binding: false, // Optional
//     },
//     pppoe: {
//       enabled: false,
//       download_speed: { value: "", unit: "Mbps" },
//       upload_speed: { value: "", unit: "Mbps" },
//       data_limit: { value: "", unit: "GB" },
//       usage_limit: { value: "", unit: "Hours" },
//       bandwidth_limit: "",
//       max_devices: "", // Optional
//       session_timeout: "", // Optional
//       idle_timeout: "", // Optional
//       validity_period: { value: "", unit: "Days" },
//       mac_binding: false, // Optional
//       ip_pool: "", // Optional
//       service_name: "", // Optional
//       mtu: "", // Optional
//     }
//   },
  
//   // Access type selection (frontend only)
//   accessType: "hotspot",
  
//   // Time variant configuration
//   time_variant_id: null,
  
//   // Advanced settings
//   priority_level: "",
//   router_specific: false,
//   allowed_routers_ids: [],
//   fup_policy: "",
//   fup_threshold: 80,
  
//   // Template reference
//   template_id: null,
  
//   // Read-only fields
//   purchases: 0,
//   created_at: null,
//   updated_at: null,
//   client_sessions: {},
// });

// const usePlanForm = (initialState = getInitialFormState()) => {
//   const [form, setForm] = useState(deepClone(initialState));
//   const [errors, setErrors] = useState({});
//   const [touched, setTouched] = useState({});
//   const [isLoading, setIsLoading] = useState(false);

//   // Initialize from backend data
//   const initializeFromBackend = useCallback((backendData) => {
//     if (!backendData) {
//       resetForm();
//       return;
//     }

//     const planData = backendData.data || backendData;

//     const normalizedForm = {
//       // Basic fields
//       plan_type: planData.plan_type || "",
//       name: planData.name || "",
//       price: planData.price?.toString() || "",
//       active: planData.active !== false,
//       category: planData.category || "",
//       description: planData.description || "",
      
//       // Access type from enabled methods
//       accessType: (() => {
//         const hotspotEnabled = planData.access_methods?.hotspot?.enabled || false;
//         const pppoeEnabled = planData.access_methods?.pppoe?.enabled || false;
        
//         if (hotspotEnabled && pppoeEnabled) return "both";
//         if (pppoeEnabled) return "pppoe";
//         return "hotspot";
//       })(),
      
//       // Access methods
//       access_methods: {
//         hotspot: {
//           enabled: planData.access_methods?.hotspot?.enabled || false,
//           download_speed: planData.access_methods?.hotspot?.download_speed || { value: "", unit: "Mbps" },
//           upload_speed: planData.access_methods?.hotspot?.upload_speed || { value: "", unit: "Mbps" },
//           data_limit: planData.access_methods?.hotspot?.data_limit || { value: "", unit: "GB" },
//           usage_limit: planData.access_methods?.hotspot?.usage_limit || { value: "", unit: "Hours" },
//           bandwidth_limit: planData.access_methods?.hotspot?.bandwidth_limit || "",
//           max_devices: planData.access_methods?.hotspot?.max_devices || "",
//           session_timeout: planData.access_methods?.hotspot?.session_timeout || "",
//           idle_timeout: planData.access_methods?.hotspot?.idle_timeout || "",
//           validity_period: planData.access_methods?.hotspot?.validity_period || { value: "", unit: "Days" },
//           mac_binding: planData.access_methods?.hotspot?.mac_binding || false,
//         },
//         pppoe: {
//           enabled: planData.access_methods?.pppoe?.enabled || false,
//           download_speed: planData.access_methods?.pppoe?.download_speed || { value: "", unit: "Mbps" },
//           upload_speed: planData.access_methods?.pppoe?.upload_speed || { value: "", unit: "Mbps" },
//           data_limit: planData.access_methods?.pppoe?.data_limit || { value: "", unit: "GB" },
//           usage_limit: planData.access_methods?.pppoe?.usage_limit || { value: "", unit: "Hours" },
//           bandwidth_limit: planData.access_methods?.pppoe?.bandwidth_limit || "",
//           max_devices: planData.access_methods?.pppoe?.max_devices || "",
//           session_timeout: planData.access_methods?.pppoe?.session_timeout || "",
//           idle_timeout: planData.access_methods?.pppoe?.idle_timeout || "",
//           validity_period: planData.access_methods?.pppoe?.validity_period || { value: "", unit: "Days" },
//           mac_binding: planData.access_methods?.pppoe?.mac_binding || false,
//           ip_pool: planData.access_methods?.pppoe?.ip_pool || "",
//           service_name: planData.access_methods?.pppoe?.service_name || "",
//           mtu: planData.access_methods?.pppoe?.mtu || "",
//         }
//       },
      
//       // Time variant
//       time_variant_id: planData.time_variant_id || planData.time_variant?.id || null,
      
//       // Advanced settings
//       priority_level: planData.priority_level || "",
//       router_specific: planData.router_specific || false,
//       allowed_routers_ids: planData.allowed_routers_ids || [],
//       fup_policy: planData.fup_policy || "",
//       fup_threshold: planData.fup_threshold || 80,
      
//       // Template
//       template_id: planData.template_id || planData.template?.id || null,
      
//       // Read-only fields
//       purchases: planData.purchases || 0,
//       created_at: planData.created_at || null,
//       updated_at: planData.updated_at || null,
//       client_sessions: planData.client_sessions || {},
//     };

//     setForm(normalizedForm);
//     setErrors({});
//     setTouched({});
//   }, []);

//   // Handle field changes
//   const handleChange = useCallback((field, value) => {
//     setForm(prev => {
//       const newForm = { ...prev, [field]: value };
      
//       // Special handling for plan_type changes
//       if (field === 'plan_type') {
//         // User selected Free_trial
//         if (value === 'Free_trial') {
//           console.log('🔧 Free trial selected - auto-setting required fields');
//           newForm.price = "0.00";
//           newForm.category = "Promotional";
          
//           // Ensure hotspot is enabled for free trial
//           if (newForm.access_methods) {
//             newForm.access_methods.hotspot.enabled = true;
//             newForm.access_methods.pppoe.enabled = false;
//             newForm.accessType = "hotspot";
//           }
//         } 
//         // User selected Promotional
//         else if (value === 'Promotional') {
//           console.log('🔧 Promotional selected - auto-setting category');
//           newForm.category = "Promotional";
//         }
//         // User selected Paid
//         else if (value === 'Paid') {
//           console.log('🔧 Paid selected - no auto-settings');
//         }
//       }
      
//       return newForm;
//     });
    
//     // Clear error for this field
//     if (errors[field]) {
//       setErrors(prev => ({ ...prev, [field]: '' }));
//     }
//   }, [errors]);

//   // Handle access type change
//   const handleAccessTypeChange = useCallback((accessType) => {
//     setForm(prev => {
//       const hotspotEnabled = accessType === 'hotspot' || accessType === 'both';
//       const pppoeEnabled = accessType === 'pppoe' || accessType === 'both';
      
//       // For free trial, enforce hotspot only
//       const finalHotspotEnabled = prev.plan_type === 'Free_trial' ? true : hotspotEnabled;
//       const finalPppoeEnabled = prev.plan_type === 'Free_trial' ? false : pppoeEnabled;
      
//       return {
//         ...prev,
//         accessType: prev.plan_type === 'Free_trial' ? 'hotspot' : accessType,
//         access_methods: {
//           ...prev.access_methods,
//           hotspot: {
//             ...prev.access_methods.hotspot,
//             enabled: finalHotspotEnabled
//           },
//           pppoe: {
//             ...prev.access_methods.pppoe,
//             enabled: finalPppoeEnabled
//           }
//         }
//       };
//     });
//   }, []);

//   // Handle access method changes
//   const handleAccessMethodChange = useCallback((method, field, value) => {
//     setForm(prev => {
//       // For free trial, prevent enabling PPPoE
//       if (prev.plan_type === 'Free_trial' && method === 'pppoe' && field === 'enabled' && value === true) {
//         console.log('⚠️ Cannot enable PPPoE for free trial plans');
//         return prev;
//       }
      
//       return {
//         ...prev,
//         access_methods: {
//           ...prev.access_methods,
//           [method]: {
//             ...prev.access_methods[method],
//             [field]: value
//           }
//         }
//       };
//     });
//   }, []);

//   // Handle nested access method changes
//   const handleAccessMethodNestedChange = useCallback((method, parentField, key, value) => {
//     setForm(prev => ({
//       ...prev,
//       access_methods: {
//         ...prev.access_methods,
//         [method]: {
//           ...prev.access_methods[method],
//           [parentField]: {
//             ...prev.access_methods[method][parentField],
//             [key]: value
//           }
//         }
//       }
//     }));
//   }, []);

//   // Set time variant ID
//   const setTimeVariantId = useCallback((timeVariantId) => {
//     setForm(prev => ({
//       ...prev,
//       time_variant_id: timeVariantId
//     }));
//   }, []);

//   // Set template ID
//   const setTemplateId = useCallback((templateId) => {
//     setForm(prev => ({
//       ...prev,
//       template_id: templateId
//     }));
//   }, []);

//   // Handle field blur
//   const handleFieldBlur = useCallback((field) => {
//     if (!touched[field]) {
//       setTouched(prev => ({ ...prev, [field]: true }));
//     }
//     validateField(field, form[field]);
//   }, [touched, form]);

//   // Validate field
//   const validateField = useCallback((name, value) => {
//     const newErrors = { ...errors };
    
//     switch (name) {
//       case 'name':
//         newErrors[name] = validateRequired(value, 'Plan name');
//         break;
//       case 'price':
//         newErrors[name] = validatePrice(value, form.plan_type);
//         break;
//       case 'category':
//         newErrors[name] = validateRequired(value, 'Category');
//         break;
//       case 'plan_type':
//         newErrors[name] = validateRequired(value, 'Plan type');
//         break;
//       case 'priority_level':
//         newErrors[name] = validateRequired(value, 'Priority level');
//         break;
//       default:
//         break;
//     }
    
//     // Remove empty errors
//     Object.keys(newErrors).forEach(key => {
//       if (!newErrors[key]) delete newErrors[key];
//     });
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   }, [errors, form.plan_type]);

//   // FIXED: Validate entire form - only mandatory fields are required
//   // Security & device management fields are now optional
//   const validateForm = useCallback(() => {
//     const newErrors = {};
    
//     // ================================================================
//     // MANDATORY FIELDS - These are always required
//     // ================================================================
    
//     // Basic required fields
//     newErrors.name = validateRequired(form.name, 'Plan name');
//     newErrors.category = validateRequired(form.category, 'Category');
//     newErrors.plan_type = validateRequired(form.plan_type, 'Plan type');
//     newErrors.price = validatePrice(form.price, form.plan_type);
//     newErrors.priority_level = validateRequired(form.priority_level, 'Priority level');
    
//     // Free trial specific validations
//     if (form.plan_type === 'Free_trial') {
//       if (parseFloat(form.price || 0) > 0) {
//         newErrors.price = 'Free Trial plans must have price set to 0';
//       }
//       if (form.router_specific) {
//         newErrors.router_specific = 'Free Trial plans cannot be router-specific';
//       }
//       if (form.priority_level > 4) {
//         newErrors.priority_level = 'Free Trial plans cannot have premium priority levels';
//       }
//       if (form.access_methods?.pppoe?.enabled) {
//         newErrors.access_methods = 'Free Trial plans cannot use PPPoE access method';
//       }
//     }
    
//     // Promotional validation
//     if (form.plan_type === 'Promotional' && form.category !== 'Promotional') {
//       newErrors.category = 'Promotional plans should have Promotional category';
//     }
    
//     // ================================================================
//     // ACCESS METHODS - At least one must be enabled
//     // ================================================================
    
//     const enabledMethods = [];
//     if (form.access_methods.hotspot.enabled) enabledMethods.push('hotspot');
//     if (form.access_methods.pppoe.enabled) enabledMethods.push('pppoe');
    
//     if (enabledMethods.length === 0) {
//       newErrors.access_methods = 'At least one access method must be enabled';
//     }
    
//     // ================================================================
//     // REQUIRED FIELDS FOR ENABLED ACCESS METHODS
//     // These are the core plan features that MUST be specified
//     // ================================================================
    
//     enabledMethods.forEach(method => {
//       const config = form.access_methods[method];
      
//       // Speed settings are required
//       if (!config.download_speed?.value && config.download_speed?.value !== 0) {
//         newErrors[`${method}_download_speed`] = `${method.toUpperCase()} download speed is required`;
//       }
      
//       if (!config.upload_speed?.value && config.upload_speed?.value !== 0) {
//         newErrors[`${method}_upload_speed`] = `${method.toUpperCase()} upload speed is required`;
//       }
      
//       // Data limit is required
//       if (!config.data_limit?.value && config.data_limit?.value !== 0) {
//         newErrors[`${method}_data_limit`] = `${method.toUpperCase()} data limit is required`;
//       }
      
//       // Usage limit (daily time limit) is required
//       if (!config.usage_limit?.value && config.usage_limit?.value !== 0) {
//         newErrors[`${method}_usage_limit`] = `${method.toUpperCase()} daily time limit is required`;
//       }
      
//       // Validity period is required
//       if (!config.validity_period?.value && config.validity_period?.value !== 0) {
//         newErrors[`${method}_validity_period`] = `${method.toUpperCase()} validity period is required`;
//       }
      
//       // ================================================================
//       // OPTIONAL FIELDS - No validation errors for these
//       // ================================================================
      
//       // max_devices - OPTIONAL (no validation)
//       // session_timeout - OPTIONAL (no validation)
//       // idle_timeout - OPTIONAL (no validation)
//       // mac_binding - OPTIONAL (no validation)
//       // bandwidth_limit - OPTIONAL (no validation)
      
//       // Numeric validations only if values are provided
//       if (config.max_devices && (config.max_devices < 1 || config.max_devices > 10)) {
//         newErrors[`${method}_max_devices`] = 'Max devices must be between 1 and 10';
//       }
//     });
    
//     // ================================================================
//     // PPPoE SPECIFIC FIELDS - Only required if PPPoE is enabled
//     // ================================================================
    
//     if (form.access_methods.pppoe.enabled) {
//       // IP Pool is optional now (no validation error)
//       // Service name is optional (no validation error)
//       // MTU is optional now (no validation error)
      
//       // Only validate if values are provided
//       if (form.access_methods.pppoe.mtu && 
//           (form.access_methods.pppoe.mtu < 576 || form.access_methods.pppoe.mtu > 1500)) {
//         newErrors.pppoe_mtu = 'MTU must be between 576 and 1500';
//       }
//     }
    
//     // ================================================================
//     // FUP THRESHOLD VALIDATION
//     // ================================================================
    
//     if (form.fup_threshold && (form.fup_threshold < 1 || form.fup_threshold > 100)) {
//       newErrors.fup_threshold = 'FUP threshold must be between 1% and 100%';
//     }
    
//     // Remove empty errors
//     Object.keys(newErrors).forEach(key => {
//       if (!newErrors[key]) delete newErrors[key];
//     });

//     setErrors(newErrors);
    
//     // Log validation errors for debugging
//     if (Object.keys(newErrors).length > 0) {
//       console.log('❌ Validation errors:', newErrors);
//     } else {
//       console.log('✅ Form validation passed');
//     }
    
//     return Object.keys(newErrors).length === 0;
//   }, [form]);

//   // Prepare data for backend
//   const prepareForBackend = useCallback(() => {
//     const backendData = {
//       // Basic fields
//       plan_type: form.plan_type,
//       name: form.name.trim(),
//       price: form.price || "0.00",
//       active: form.active !== false,
//       category: form.category,
//       description: form.description.trim(),
      
//       // Access methods
//       access_methods: {
//         hotspot: {
//           enabled: form.access_methods.hotspot.enabled || false,
//           download_speed: {
//             value: String(form.access_methods.hotspot.download_speed?.value || ""),
//             unit: form.access_methods.hotspot.download_speed?.unit || "Mbps"
//           },
//           upload_speed: {
//             value: String(form.access_methods.hotspot.upload_speed?.value || ""),
//             unit: form.access_methods.hotspot.upload_speed?.unit || "Mbps"
//           },
//           data_limit: {
//             value: String(form.access_methods.hotspot.data_limit?.value || ""),
//             unit: form.access_methods.hotspot.data_limit?.unit || "GB"
//           },
//           usage_limit: {
//             value: String(form.access_methods.hotspot.usage_limit?.value || ""),
//             unit: form.access_methods.hotspot.usage_limit?.unit || "Hours"
//           },
//           bandwidth_limit: parseInt(form.access_methods.hotspot.bandwidth_limit) || "",
//           max_devices: parseInt(form.access_methods.hotspot.max_devices) || "",
//           session_timeout: parseInt(form.access_methods.hotspot.session_timeout) || "",
//           idle_timeout: parseInt(form.access_methods.hotspot.idle_timeout) || "",
//           validity_period: {
//             value: String(form.access_methods.hotspot.validity_period?.value || ""),
//             unit: form.access_methods.hotspot.validity_period?.unit || "Days"
//           },
//           mac_binding: form.access_methods.hotspot.mac_binding || false,
//         },
//         pppoe: {
//           enabled: form.access_methods.pppoe.enabled || false,
//           download_speed: {
//             value: String(form.access_methods.pppoe.download_speed?.value || ""),
//             unit: form.access_methods.pppoe.download_speed?.unit || "Mbps"
//           },
//           upload_speed: {
//             value: String(form.access_methods.pppoe.upload_speed?.value || ""),
//             unit: form.access_methods.pppoe.upload_speed?.unit || "Mbps"
//           },
//           data_limit: {
//             value: String(form.access_methods.pppoe.data_limit?.value || ""),
//             unit: form.access_methods.pppoe.data_limit?.unit || "GB"
//           },
//           usage_limit: {
//             value: String(form.access_methods.pppoe.usage_limit?.value || ""),
//             unit: form.access_methods.pppoe.usage_limit?.unit || "Hours"
//           },
//           bandwidth_limit: parseInt(form.access_methods.pppoe.bandwidth_limit) || "",
//           max_devices: parseInt(form.access_methods.pppoe.max_devices) || "",
//           session_timeout: parseInt(form.access_methods.pppoe.session_timeout) || "",
//           idle_timeout: parseInt(form.access_methods.pppoe.idle_timeout) || "",
//           validity_period: {
//             value: String(form.access_methods.pppoe.validity_period?.value || ""),
//             unit: form.access_methods.pppoe.validity_period?.unit || "Days"
//           },
//           mac_binding: form.access_methods.pppoe.mac_binding || false,
//           ip_pool: form.access_methods.pppoe.ip_pool || "",
//           service_name: form.access_methods.pppoe.service_name || "",
//           mtu: parseInt(form.access_methods.pppoe.mtu) || "",
//         }
//       },
      
//       // Advanced settings
//       priority_level: form.priority_level || "",
//       router_specific: form.router_specific || false,
//       fup_policy: form.fup_policy || "",
//       fup_threshold: form.fup_threshold || 80,
      
//       // Relationship IDs
//       time_variant_id: form.time_variant_id || null,
//       template_id: form.template_id || null,
//     };
    
//     // Add allowed routers only if router specific
//     if (form.router_specific) {
//       backendData.allowed_routers_ids = form.allowed_routers_ids || [];
//     }
    
//     return backendData;
//   }, [form]);

//   // Reset form
//   const resetForm = useCallback(() => {
//     setForm(deepClone(getInitialFormState()));
//     setErrors({});
//     setTouched({});
//     setIsLoading(false);
//   }, []);

//   // Get enabled access methods
//   const getEnabledAccessMethods = useCallback(() => {
//     const methods = [];
//     if (form.access_methods.hotspot.enabled) methods.push('hotspot');
//     if (form.access_methods.pppoe.enabled) methods.push('pppoe');
//     return methods;
//   }, [form.access_methods]);

//   // Get access type
//   const getAccessType = useCallback((plan) => {
//     let enabledMethods = [];
//     if (plan) {
//       if (plan.access_methods?.hotspot?.enabled) enabledMethods.push('hotspot');
//       if (plan.access_methods?.pppoe?.enabled) enabledMethods.push('pppoe');
//     } else {
//       enabledMethods = getEnabledAccessMethods();
//     }
    
//     if (enabledMethods.includes('hotspot') && enabledMethods.includes('pppoe')) {
//       return 'dual';
//     } else if (enabledMethods.includes('hotspot')) {
//       return 'hotspot';
//     } else if (enabledMethods.includes('pppoe')) {
//       return 'pppoe';
//     }
//     return 'none';
//   }, [getEnabledAccessMethods]);

//   // Get display info for a plan
//   const getPlanDisplayInfo = useCallback((planData) => {
//     const info = {
//       name: planData.name || '',
//       type: planData.plan_type || '',
//       category: planData.category || '',
//       price: planData.price || '',
//       accessType: '',
//       typeDisplay: '',
//     };
    
//     // Determine display text based on plan type
//     if (planData.plan_type === 'Free_trial') {
//       info.typeDisplay = 'Free Trial';
//       info.priceDisplay = 'Free Trial';
//     } else if (planData.plan_type === 'Promotional') {
//       info.typeDisplay = 'Promotional';
//       info.priceDisplay = planData.price ? `KES ${planData.price}` : 'Free';
//     } else {
//       info.typeDisplay = 'Paid';
//       info.priceDisplay = planData.price ? `KES ${planData.price}` : 'Free';
//     }
    
//     // Get access type
//     if (planData.access_methods) {
//       const methods = [];
//       if (planData.access_methods.hotspot?.enabled) methods.push('Hotspot');
//       if (planData.access_methods.pppoe?.enabled) methods.push('PPPoE');
//       info.accessType = methods.join(' + ') || 'None';
//     }
    
//     return info;
//   }, []);

//   return {
//     // Form state
//     form,
//     errors,
//     touched,
//     isLoading,
    
//     // Setters
//     setForm: initializeFromBackend,
//     setErrors,
//     setTouched,
//     setIsLoading,
    
//     // Handlers
//     handleChange,
//     handleAccessTypeChange,
//     handleAccessMethodChange,
//     handleAccessMethodNestedChange,
//     setTimeVariantId,
//     setTemplateId,
//     handleFieldBlur,
    
//     // Validations
//     validateField,
//     validateForm,
    
//     // Utilities
//     prepareForBackend,
//     resetForm,
//     getEnabledAccessMethods,
//     getAccessType,
//     getPlanDisplayInfo,
//   };
// };

// export default usePlanForm;





import { useState, useCallback } from "react";
import { 
  deepClone, 
  validateRequired, 
  validatePrice,
  validateTimeVariant as validateTimeVariantUtil
} from "../../Shared/utils.js";

// Initial form state - MATCHES BACKEND EXPECTATIONS
export const getInitialFormState = () => ({
  // Basic details - snake_case to match backend
  plan_type: "",           // matches backend
  name: "",                 // matches backend
  price: "",                // will be converted to Decimal
  active: true,             // matches backend
  category: "",             // matches backend
  description: "",          // matches backend
  
  // Access methods configuration - EXACT structure backend expects
  access_methods: {
    hotspot: {
      enabled: true,
      download_speed: { value: "", unit: "Mbps" },
      upload_speed: { value: "", unit: "Mbps" },
      data_limit: { value: "", unit: "GB" },
      usage_limit: { value: "", unit: "hours" }, // FIXED: lowercase to match backend
      bandwidth_limit: "",
      max_devices: "",
      session_timeout: "",
      idle_timeout: "",
      validity_period: { value: "", unit: "days" }, // FIXED: lowercase
      mac_binding: false,
    },
    pppoe: {
      enabled: false,
      download_speed: { value: "", unit: "Mbps" },
      upload_speed: { value: "", unit: "Mbps" },
      data_limit: { value: "", unit: "GB" },
      usage_limit: { value: "", unit: "hours" }, // FIXED: lowercase
      bandwidth_limit: "",
      max_devices: "",
      session_timeout: "",
      idle_timeout: "",
      validity_period: { value: "", unit: "days" }, // FIXED: lowercase
      mac_binding: false,
      ip_pool: "",
      service_name: "",
      mtu: "",
    }
  },
  
  // Access type selection (frontend only - not sent to backend)
  accessType: "hotspot",
  
  // Time variant - matches backend field names
  time_variant_id: null,    // snake_case
  
  // Advanced settings - snake_case
  priority_level: "",       // will be converted to integer
  router_specific: false,
  allowed_routers_ids: [],  // snake_case - array of integers
  
  // FUP settings
  fup_policy: "",           // snake_case
  fup_threshold: 80,        // integer
  
  // Template reference
  template_id: null,        // snake_case
  
  // Read-only fields (preserved from backend)
  purchases: 0,
  created_at: null,
  updated_at: null,
  client_sessions: {},      // matches backend
});

const usePlanForm = (initialState = getInitialFormState()) => {
  const [form, setForm] = useState(deepClone(initialState));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Define resetForm first so it's available for other callbacks
  const resetForm = useCallback(() => {
    setForm(deepClone(getInitialFormState()));
    setErrors({});
    setTouched({});
    setIsLoading(false);
  }, []);

  // FIXED: Initialize from backend data - handles nested response structures
  const initializeFromBackend = useCallback((backendData) => {
    if (!backendData) {
      resetForm(); // Now this works because resetForm is defined above
      return;
    }

    // Handle both direct data and nested response
    const planData = backendData.data || backendData;

    console.log('🔄 Initializing form from backend:', planData);

    const normalizedForm = {
      // Basic fields - directly from backend (snake_case)
      plan_type: planData.plan_type || "",
      name: planData.name || "",
      price: planData.price?.toString() || "",
      active: planData.active !== false,
      category: planData.category || "",
      description: planData.description || "",
      
      // Access type derived from enabled methods
      accessType: (() => {
        const hotspotEnabled = planData.access_methods?.hotspot?.enabled || false;
        const pppoeEnabled = planData.access_methods?.pppoe?.enabled || false;
        
        if (hotspotEnabled && pppoeEnabled) return "both";
        if (pppoeEnabled) return "pppoe";
        return "hotspot";
      })(),
      
      // Access methods - preserve exact backend structure
      access_methods: {
        hotspot: {
          enabled: planData.access_methods?.hotspot?.enabled || false,
          download_speed: planData.access_methods?.hotspot?.download_speed || { value: "", unit: "Mbps" },
          upload_speed: planData.access_methods?.hotspot?.upload_speed || { value: "", unit: "Mbps" },
          data_limit: planData.access_methods?.hotspot?.data_limit || { value: "", unit: "GB" },
          usage_limit: planData.access_methods?.hotspot?.usage_limit || { value: "", unit: "hours" },
          bandwidth_limit: planData.access_methods?.hotspot?.bandwidth_limit || "",
          max_devices: planData.access_methods?.hotspot?.max_devices || "",
          session_timeout: planData.access_methods?.hotspot?.session_timeout || "",
          idle_timeout: planData.access_methods?.hotspot?.idle_timeout || "",
          validity_period: planData.access_methods?.hotspot?.validity_period || { value: "", unit: "days" },
          mac_binding: planData.access_methods?.hotspot?.mac_binding || false,
        },
        pppoe: {
          enabled: planData.access_methods?.pppoe?.enabled || false,
          download_speed: planData.access_methods?.pppoe?.download_speed || { value: "", unit: "Mbps" },
          upload_speed: planData.access_methods?.pppoe?.upload_speed || { value: "", unit: "Mbps" },
          data_limit: planData.access_methods?.pppoe?.data_limit || { value: "", unit: "GB" },
          usage_limit: planData.access_methods?.pppoe?.usage_limit || { value: "", unit: "hours" },
          bandwidth_limit: planData.access_methods?.pppoe?.bandwidth_limit || "",
          max_devices: planData.access_methods?.pppoe?.max_devices || "",
          session_timeout: planData.access_methods?.pppoe?.session_timeout || "",
          idle_timeout: planData.access_methods?.pppoe?.idle_timeout || "",
          validity_period: planData.access_methods?.pppoe?.validity_period || { value: "", unit: "days" },
          mac_binding: planData.access_methods?.pppoe?.mac_binding || false,
          ip_pool: planData.access_methods?.pppoe?.ip_pool || "",
          service_name: planData.access_methods?.pppoe?.service_name || "",
          mtu: planData.access_methods?.pppoe?.mtu || "",
        }
      },
      
      // Time variant - handle both direct ID and nested object
      time_variant_id: planData.time_variant_id || planData.time_variant?.id || null,
      
      // Advanced settings
      priority_level: planData.priority_level || "",
      router_specific: planData.router_specific || false,
      allowed_routers_ids: planData.allowed_routers_ids || [],
      
      // FUP settings
      fup_policy: planData.fup_policy || "",
      fup_threshold: planData.fup_threshold || 80,
      
      // Template reference
      template_id: planData.template_id || planData.template?.id || null,
      
      // Read-only fields (preserved)
      purchases: planData.purchases || 0,
      created_at: planData.created_at || null,
      updated_at: planData.updated_at || null,
      client_sessions: planData.client_sessions || {},
    };

    console.log('✅ Form initialized:', normalizedForm);
    setForm(normalizedForm);
    setErrors({});
    setTouched({});
  }, [resetForm]); // Add resetForm to dependencies

  // Handle field changes - FIXED: Better handling of plan_type changes
  const handleChange = useCallback((field, value) => {
    setForm(prev => {
      const newForm = { ...prev, [field]: value };
      
      // Special handling for plan_type changes to match backend expectations
      if (field === 'plan_type') {
        // Free trial - must match backend validation
        if (value === 'free_trial') {
          console.log('🔧 Free trial selected - applying backend rules');
          newForm.price = "0";
          newForm.category = "promotional";
          
          // Free trial must use hotspot only (backend validation)
          if (newForm.access_methods) {
            newForm.access_methods.hotspot.enabled = true;
            newForm.access_methods.pppoe.enabled = false;
            newForm.accessType = "hotspot";
          }
          
          // Free trial cannot have high priority (backend validation)
          newForm.priority_level = "3";
          newForm.router_specific = false;
        } 
        // Promotional
        else if (value === 'promotional') {
          console.log('🔧 Promotional selected');
          if (!newForm.category) {
            newForm.category = "promotional";
          }
        }
        // Paid
        else if (value === 'paid') {
          console.log('🔧 Paid selected');
        }
      }
      
      return newForm;
    });
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Handle access type change - FIXED: Respects backend validations
  const handleAccessTypeChange = useCallback((accessType) => {
    setForm(prev => {
      const hotspotEnabled = accessType === 'hotspot' || accessType === 'both';
      const pppoeEnabled = accessType === 'pppoe' || accessType === 'both';
      
      // For free trial, enforce hotspot only (backend requirement)
      const finalHotspotEnabled = prev.plan_type === 'free_trial' ? true : hotspotEnabled;
      const finalPppoeEnabled = prev.plan_type === 'free_trial' ? false : pppoeEnabled;
      
      return {
        ...prev,
        accessType: prev.plan_type === 'free_trial' ? 'hotspot' : accessType,
        access_methods: {
          ...prev.access_methods,
          hotspot: {
            ...prev.access_methods.hotspot,
            enabled: finalHotspotEnabled
          },
          pppoe: {
            ...prev.access_methods.pppoe,
            enabled: finalPppoeEnabled
          }
        }
      };
    });
  }, []);

  // Handle access method changes - FIXED: Preserves nested structure
  const handleAccessMethodChange = useCallback((method, field, value) => {
    setForm(prev => {
      // For free trial, prevent enabling PPPoE (backend validation)
      if (prev.plan_type === 'free_trial' && method === 'pppoe' && field === 'enabled' && value === true) {
        console.log('⚠️ Cannot enable PPPoE for free trial plans');
        return prev;
      }
      
      return {
        ...prev,
        access_methods: {
          ...prev.access_methods,
          [method]: {
            ...prev.access_methods[method],
            [field]: value
          }
        }
      };
    });
  }, []);

  // Handle nested access method changes (for objects like download_speed)
  const handleAccessMethodNestedChange = useCallback((method, parentField, key, value) => {
    setForm(prev => ({
      ...prev,
      access_methods: {
        ...prev.access_methods,
        [method]: {
          ...prev.access_methods[method],
          [parentField]: {
            ...prev.access_methods[method][parentField],
            [key]: value
          }
        }
      }
    }));
  }, []);

  // Set time variant ID
  const setTimeVariantId = useCallback((timeVariantId) => {
    setForm(prev => ({
      ...prev,
      time_variant_id: timeVariantId
    }));
  }, []);

  // Set template ID
  const setTemplateId = useCallback((templateId) => {
    setForm(prev => ({
      ...prev,
      template_id: templateId
    }));
  }, []);

  // Handle field blur
  const handleFieldBlur = useCallback((field) => {
    if (!touched[field]) {
      setTouched(prev => ({ ...prev, [field]: true }));
    }
    validateField(field, form[field]);
  }, [touched, form]);

  // FIXED: Validate field with backend rules
  const validateField = useCallback((name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'name':
        if (!value || !value.trim()) {
          newErrors[name] = 'Plan name is required';
        } else {
          delete newErrors[name];
        }
        break;
      case 'price':
        const priceError = validatePrice(value, form.plan_type);
        if (priceError) {
          newErrors[name] = priceError;
        } else {
          delete newErrors[name];
        }
        break;
      case 'category':
        if (!value) {
          newErrors[name] = 'Category is required';
        } else {
          delete newErrors[name];
        }
        break;
      case 'plan_type':
        if (!value) {
          newErrors[name] = 'Plan type is required';
        } else {
          delete newErrors[name];
        }
        break;
      case 'priority_level':
        if (!value) {
          newErrors[name] = 'Priority level is required';
        } else if (parseInt(value) < 1 || parseInt(value) > 8) {
          newErrors[name] = 'Priority level must be between 1 and 8';
        } else {
          delete newErrors[name];
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return !newErrors[name];
  }, [errors, form.plan_type]);

  // FIXED: Validate entire form matching backend validation rules
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // ================================================================
    // MANDATORY FIELDS - Match backend validators
    // ================================================================
    
    // Basic required fields
    if (!form.name?.trim()) {
      newErrors.name = 'Plan name is required';
    }
    
    if (!form.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!form.plan_type) {
      newErrors.plan_type = 'Plan type is required';
    }
    
    // Price validation - matches backend DecimalField validation
    const priceValue = parseFloat(form.price);
    if (isNaN(priceValue) || priceValue < 0) {
      newErrors.price = 'Valid price is required';
    }
    
    // Priority level - matches backend IntegerField validation
    const priorityValue = parseInt(form.priority_level);
    if (isNaN(priorityValue) || priorityValue < 1 || priorityValue > 8) {
      newErrors.priority_level = 'Priority level must be between 1 and 8';
    }
    
    // Free trial specific validations (match backend Plan.clean() method)
    if (form.plan_type === 'free_trial') {
      if (parseFloat(form.price || 0) !== 0) {
        newErrors.price = 'Free Trial plans must have price set to 0';
      }
      if (form.router_specific) {
        newErrors.router_specific = 'Free Trial plans cannot be router-specific';
      }
      if (priorityValue > 4) {
        newErrors.priority_level = 'Free Trial plans cannot have premium priority levels';
      }
      if (form.access_methods?.pppoe?.enabled) {
        newErrors.access_methods = 'Free Trial plans cannot use PPPoE access method';
      }
    }
    
    // Promotional validation
    if (form.plan_type === 'promotional' && form.category !== 'promotional') {
      newErrors.category = 'Promotional plans should have Promotional category';
    }
    
    // ================================================================
    // ACCESS METHODS - At least one must be enabled (backend requirement)
    // ================================================================
    
    const enabledMethods = [];
    if (form.access_methods?.hotspot?.enabled) enabledMethods.push('hotspot');
    if (form.access_methods?.pppoe?.enabled) enabledMethods.push('pppoe');
    
    if (enabledMethods.length === 0) {
      newErrors.access_methods = 'At least one access method must be enabled';
    }
    
    // ================================================================
    // REQUIRED FIELDS FOR ENABLED ACCESS METHODS
    // These match backend validation in clean() method
    // ================================================================
    
    enabledMethods.forEach(method => {
      const config = form.access_methods[method];
      
      // Speed settings are required (backend validates)
      if (!config?.download_speed?.value) {
        newErrors[`${method}_download_speed`] = `${method.toUpperCase()} download speed is required`;
      }
      
      if (!config?.upload_speed?.value) {
        newErrors[`${method}_upload_speed`] = `${method.toUpperCase()} upload speed is required`;
      }
      
      // Data limit is required
      if (!config?.data_limit?.value) {
        newErrors[`${method}_data_limit`] = `${method.toUpperCase()} data limit is required`;
      }
      
      // Usage limit is required
      if (!config?.usage_limit?.value) {
        newErrors[`${method}_usage_limit`] = `${method.toUpperCase()} usage limit is required`;
      }
      
      // Validity period is required
      if (!config?.validity_period?.value) {
        newErrors[`${method}_validity_period`] = `${method.toUpperCase()} validity period is required`;
      }
      
      // Numeric validations only if values are provided
      if (config?.max_devices) {
        const maxDevices = parseInt(config.max_devices);
        if (isNaN(maxDevices) || maxDevices < 1 || maxDevices > 10) {
          newErrors[`${method}_max_devices`] = 'Max devices must be between 1 and 10';
        }
      }
    });
    
    // ================================================================
    // PPPoE SPECIFIC FIELDS
    // ================================================================
    
    if (form.access_methods?.pppoe?.enabled) {
      // MTU validation if provided
      if (form.access_methods.pppoe.mtu) {
        const mtu = parseInt(form.access_methods.pppoe.mtu);
        if (isNaN(mtu) || mtu < 576 || mtu > 1500) {
          newErrors.pppoe_mtu = 'MTU must be between 576 and 1500';
        }
      }
    }
    
    // ================================================================
    // FUP THRESHOLD VALIDATION
    // ================================================================
    
    if (form.fup_threshold) {
      const threshold = parseInt(form.fup_threshold);
      if (isNaN(threshold) || threshold < 1 || threshold > 100) {
        newErrors.fup_threshold = 'FUP threshold must be between 1% and 100%';
      }
    }
    
    setErrors(newErrors);
    
    // Log validation results
    if (Object.keys(newErrors).length > 0) {
      console.log('❌ Validation errors:', newErrors);
    } else {
      console.log('✅ Form validation passed');
    }
    
    return Object.keys(newErrors).length === 0;
  }, [form]);

  // FIXED: Prepare data for backend - MATCHES DJANGO SERIALIZER EXPECTATIONS
  const prepareForBackend = useCallback(() => {
    const backendData = {
      // Basic fields - snake_case as expected by backend
      plan_type: form.plan_type,
      name: form.name?.trim(),
      price: parseFloat(form.price) || 0, // Convert to number for DecimalField
      active: form.active !== false,
      category: form.category,
      description: form.description?.trim() || '',
      
      // Access methods - exact structure backend expects
      access_methods: {
        hotspot: {
          enabled: Boolean(form.access_methods?.hotspot?.enabled),
          download_speed: {
            value: form.access_methods?.hotspot?.download_speed?.value?.toString() || '',
            unit: form.access_methods?.hotspot?.download_speed?.unit || 'Mbps'
          },
          upload_speed: {
            value: form.access_methods?.hotspot?.upload_speed?.value?.toString() || '',
            unit: form.access_methods?.hotspot?.upload_speed?.unit || 'Mbps'
          },
          data_limit: {
            value: form.access_methods?.hotspot?.data_limit?.value?.toString() || '',
            unit: form.access_methods?.hotspot?.data_limit?.unit || 'GB'
          },
          usage_limit: {
            value: form.access_methods?.hotspot?.usage_limit?.value?.toString() || '',
            unit: form.access_methods?.hotspot?.usage_limit?.unit || 'hours'
          },
          bandwidth_limit: form.access_methods?.hotspot?.bandwidth_limit 
            ? parseInt(form.access_methods.hotspot.bandwidth_limit) 
            : null,
          max_devices: form.access_methods?.hotspot?.max_devices
            ? parseInt(form.access_methods.hotspot.max_devices)
            : null,
          session_timeout: form.access_methods?.hotspot?.session_timeout
            ? parseInt(form.access_methods.hotspot.session_timeout)
            : null,
          idle_timeout: form.access_methods?.hotspot?.idle_timeout
            ? parseInt(form.access_methods.hotspot.idle_timeout)
            : null,
          validity_period: {
            value: form.access_methods?.hotspot?.validity_period?.value?.toString() || '',
            unit: form.access_methods?.hotspot?.validity_period?.unit || 'days'
          },
          mac_binding: Boolean(form.access_methods?.hotspot?.mac_binding)
        },
        pppoe: {
          enabled: Boolean(form.access_methods?.pppoe?.enabled),
          download_speed: {
            value: form.access_methods?.pppoe?.download_speed?.value?.toString() || '',
            unit: form.access_methods?.pppoe?.download_speed?.unit || 'Mbps'
          },
          upload_speed: {
            value: form.access_methods?.pppoe?.upload_speed?.value?.toString() || '',
            unit: form.access_methods?.pppoe?.upload_speed?.unit || 'Mbps'
          },
          data_limit: {
            value: form.access_methods?.pppoe?.data_limit?.value?.toString() || '',
            unit: form.access_methods?.pppoe?.data_limit?.unit || 'GB'
          },
          usage_limit: {
            value: form.access_methods?.pppoe?.usage_limit?.value?.toString() || '',
            unit: form.access_methods?.pppoe?.usage_limit?.unit || 'hours'
          },
          bandwidth_limit: form.access_methods?.pppoe?.bandwidth_limit
            ? parseInt(form.access_methods.pppoe.bandwidth_limit)
            : null,
          max_devices: form.access_methods?.pppoe?.max_devices
            ? parseInt(form.access_methods.pppoe.max_devices)
            : null,
          session_timeout: form.access_methods?.pppoe?.session_timeout
            ? parseInt(form.access_methods.pppoe.session_timeout)
            : null,
          idle_timeout: form.access_methods?.pppoe?.idle_timeout
            ? parseInt(form.access_methods.pppoe.idle_timeout)
            : null,
          validity_period: {
            value: form.access_methods?.pppoe?.validity_period?.value?.toString() || '',
            unit: form.access_methods?.pppoe?.validity_period?.unit || 'days'
          },
          mac_binding: Boolean(form.access_methods?.pppoe?.mac_binding),
          ip_pool: form.access_methods?.pppoe?.ip_pool || '',
          service_name: form.access_methods?.pppoe?.service_name || '',
          mtu: form.access_methods?.pppoe?.mtu ? parseInt(form.access_methods.pppoe.mtu) : null
        }
      },
      
      // Advanced settings
      priority_level: parseInt(form.priority_level) || 4,
      router_specific: Boolean(form.router_specific),
      fup_policy: form.fup_policy || '',
      fup_threshold: parseInt(form.fup_threshold) || 80,
      
      // Relationship IDs
      time_variant_id: form.time_variant_id || null,
      template_id: form.template_id || null,
    };
    
    // Add allowed routers only if router specific - as array of integers
    if (form.router_specific && Array.isArray(form.allowed_routers_ids)) {
      backendData.allowed_routers_ids = form.allowed_routers_ids
        .map(id => parseInt(id))
        .filter(id => !isNaN(id));
    }
    
    // Remove null values to let backend use defaults
    Object.keys(backendData).forEach(key => {
      if (backendData[key] === null) {
        delete backendData[key];
      }
    });
    
    console.log('📤 Prepared data for backend:', backendData);
    return backendData;
  }, [form]);

  // Get enabled access methods
  const getEnabledAccessMethods = useCallback(() => {
    const methods = [];
    if (form.access_methods?.hotspot?.enabled) methods.push('hotspot');
    if (form.access_methods?.pppoe?.enabled) methods.push('pppoe');
    return methods;
  }, [form.access_methods]);

  // Get access type
  const getAccessType = useCallback((plan) => {
    let enabledMethods = [];
    if (plan) {
      if (plan.access_methods?.hotspot?.enabled) enabledMethods.push('hotspot');
      if (plan.access_methods?.pppoe?.enabled) enabledMethods.push('pppoe');
    } else {
      enabledMethods = getEnabledAccessMethods();
    }
    
    if (enabledMethods.includes('hotspot') && enabledMethods.includes('pppoe')) {
      return 'both';
    } else if (enabledMethods.includes('hotspot')) {
      return 'hotspot';
    } else if (enabledMethods.includes('pppoe')) {
      return 'pppoe';
    }
    return 'none';
  }, [getEnabledAccessMethods]);

  // Get display info for a plan
  const getPlanDisplayInfo = useCallback((planData) => {
    const info = {
      name: planData.name || '',
      type: planData.plan_type || '',
      category: planData.category || '',
      price: planData.price || '',
      accessType: '',
      typeDisplay: '',
      priceDisplay: '',
    };
    
    // Determine display text based on plan type
    if (planData.plan_type === 'free_trial') {
      info.typeDisplay = 'Free Trial';
      info.priceDisplay = 'Free Trial';
    } else if (planData.plan_type === 'promotional') {
      info.typeDisplay = 'Promotional';
      info.priceDisplay = planData.price ? `KES ${parseFloat(planData.price).toFixed(2)}` : 'Free';
    } else {
      info.typeDisplay = 'Paid';
      info.priceDisplay = planData.price ? `KES ${parseFloat(planData.price).toFixed(2)}` : 'Free';
    }
    
    // Get access type
    if (planData.access_methods) {
      const methods = [];
      if (planData.access_methods.hotspot?.enabled) methods.push('Hotspot');
      if (planData.access_methods.pppoe?.enabled) methods.push('PPPoE');
      info.accessType = methods.join(' + ') || 'None';
    }
    
    return info;
  }, []);

  return {
    // Form state
    form,
    errors,
    touched,
    isLoading,
    
    // Setters
    setForm: initializeFromBackend,
    setErrors,
    setTouched,
    setIsLoading,
    
    // Handlers
    handleChange,
    handleAccessTypeChange,
    handleAccessMethodChange,
    handleAccessMethodNestedChange,
    setTimeVariantId,
    setTemplateId,
    handleFieldBlur,
    
    // Validations
    validateField,
    validateForm,
    
    // Utilities
    prepareForBackend,
    resetForm,
    getEnabledAccessMethods,
    getAccessType,
    getPlanDisplayInfo,
  };
};

export default usePlanForm;