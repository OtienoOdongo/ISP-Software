



// import { useState, useCallback } from "react";
// import { deepClone, validateRequired, validateNumber, validatePrice } from "../../Shared/utils"

// // Initial form state with clear separation
// export const getInitialFormState = () => ({
//   // Basic details
//   planType: "Paid",
//   name: "",
//   price: "",
//   active: true,
//   category: "Residential",
//   description: "",
  
//   // Access type selection (NEW: Clear separation)
//   accessType: "hotspot", // "hotspot" or "pppoe"
  
//   // Access methods configuration - now only one is active at a time
//   accessMethods: {
//     hotspot: {
//       enabled: true,
//       downloadSpeed: { value: "", unit: "Mbps" },
//       uploadSpeed: { value: "", unit: "Mbps" },
//       dataLimit: { value: "", unit: "GB" },
//       usageLimit: { value: "", unit: "Hours" },
//       bandwidthLimit: 0,
      
//       // NEW FEATURES
//       maxDevices: 1, // Maximum devices per user
//       sessionTimeout: 86400, // Maximum continuous connection time
//       idleTimeout: 300, // Disconnect after inactivity
//       validityPeriod: { value: 720, unit: "Hours" }, // Plan expiry
//       macBinding: false, // MAC address binding
//     },
//     pppoe: {
//       enabled: false,
//       downloadSpeed: { value: "", unit: "Mbps" },
//       uploadSpeed: { value: "", unit: "Mbps" },
//       dataLimit: { value: "", unit: "GB" },
//       usageLimit: { value: "", unit: "Hours" },
//       bandwidthLimit: 0,
      
//       // NEW FEATURES
//       maxDevices: 1,
//       sessionTimeout: 86400,
//       idleTimeout: 300,
//       validityPeriod: { value: 720, unit: "Hours" },
//       macBinding: false,
//       ipPool: "pppoe-pool-1", // IP pool assignment
//       serviceName: "",
//       mtu: 1492,
//       dnsServers: ["8.8.8.8", "1.1.1.1"],
//     }
//   },
  
//   // Shared settings
//   purchases: 0,
//   createdAt: new Date().toISOString().split("T")[0],
//   client_sessions: {},
//   priority_level: 4,
//   router_specific: false,
//   allowed_routers_ids: [],
//   FUP_policy: "",
//   FUP_threshold: 80,
// });

// const usePlanForm = (initialState = getInitialFormState()) => {
//   const [form, setForm] = useState(deepClone(initialState));
//   const [errors, setErrors] = useState({});
//   const [touched, setTouched] = useState({});

//   const handleChange = useCallback((e) => {
//     const { name, value, type, checked } = e.target;
//     setForm(prev => ({ 
//       ...prev, 
//       [name]: type === 'checkbox' ? checked : value 
//     }));
    
//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   }, [errors]);

//   // NEW: Handle access type change with proper separation
//   const handleAccessTypeChange = useCallback((accessType) => {
//     setForm(prev => {
//       const newForm = { ...prev, accessType };
      
//       // Enable the selected access method and disable the other
//       newForm.accessMethods = {
//         hotspot: {
//           ...prev.accessMethods.hotspot,
//           enabled: accessType === 'hotspot'
//         },
//         pppoe: {
//           ...prev.accessMethods.pppoe,
//           enabled: accessType === 'pppoe'
//         }
//       };
      
//       return newForm;
//     });
//   }, []);

//   const handleNestedChange = useCallback((field, key, value) => {
//     setForm(prev => ({ 
//       ...prev, 
//       [field]: { ...prev[field], [key]: value } 
//     }));
//   }, []);

//   const handleAccessMethodChange = useCallback((method, field, value) => {
//     setForm(prev => ({
//       ...prev,
//       accessMethods: {
//         ...prev.accessMethods,
//         [method]: {
//           ...prev.accessMethods[method],
//           [field]: value
//         }
//       }
//     }));
//   }, []);

//   const handleAccessMethodNestedChange = useCallback((method, parent, key, value) => {
//     setForm(prev => ({
//       ...prev,
//       accessMethods: {
//         ...prev.accessMethods,
//         [method]: {
//           ...prev.accessMethods[method],
//           [parent]: {
//             ...prev.accessMethods[method][parent],
//             [key]: value
//           }
//         }
//       }
//     }));
//   }, []);

//   const handleFieldBlur = useCallback((field) => {
//     if (!touched[field]) {
//       setTouched(prev => ({ ...prev, [field]: true }));
//     }
//   }, [touched]);

//   const validateField = useCallback((name, value) => {
//     const newErrors = { ...errors };
    
//     switch (name) {
//       case 'name':
//         newErrors[name] = validateRequired(value, 'Plan name');
//         break;
//       case 'price':
//         newErrors[name] = validatePrice(value, form.planType);
//         break;
//       case 'category':
//         newErrors[name] = validateRequired(value, 'Category');
//         break;
//       default:
//         break;
//     }
    
//     setErrors(newErrors);
//     return !newErrors[name];
//   }, [errors, form.planType]);

//   const validateForm = useCallback(() => {
//     const newErrors = {};
    
//     // Basic validations
//     newErrors.name = validateRequired(form.name, 'Plan name');
//     newErrors.category = validateRequired(form.category, 'Category');
//     newErrors.price = validatePrice(form.price, form.planType);
    
//     // Access method validations - only validate the enabled method
//     const enabledMethod = form.accessType;
//     const config = form.accessMethods[enabledMethod];
    
//     if (config.enabled) {
//       newErrors[`${enabledMethod}_downloadSpeed`] = validateRequired(
//         config.downloadSpeed.value, 
//         `${enabledMethod.toUpperCase()} Download Speed`
//       );
//       newErrors[`${enabledMethod}_uploadSpeed`] = validateRequired(
//         config.uploadSpeed.value, 
//         `${enabledMethod.toUpperCase()} Upload Speed`
//       );
//       newErrors[`${enabledMethod}_dataLimit`] = validateRequired(
//         config.dataLimit.value, 
//         `${enabledMethod.toUpperCase()} Data Limit`
//       );
//       newErrors[`${enabledMethod}_usageLimit`] = validateRequired(
//         config.usageLimit.value, 
//         `${enabledMethod.toUpperCase()} Usage Limit`
//       );
//     }

//     // Remove empty errors
//     Object.keys(newErrors).forEach(key => {
//       if (!newErrors[key]) delete newErrors[key];
//     });

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   }, [form]);

//   const resetForm = useCallback(() => {
//     setForm(deepClone(initialState));
//     setErrors({});
//     setTouched({});
//   }, [initialState]);

//   const setFormData = useCallback((data) => {
//     setForm(deepClone(data));
//   }, []);

//   return {
//     form,
//     setForm: setFormData,
//     errors,
//     touched,
//     setTouched,
//     handleChange,
//     handleAccessTypeChange, // NEW: Export access type handler
//     handleNestedChange,
//     handleAccessMethodChange,
//     handleAccessMethodNestedChange,
//     handleFieldBlur,
//     validateField,
//     validateForm,
//     resetForm,
//   };
// };

// export default usePlanForm;











import { useState, useCallback, useEffect } from "react";
import { 
  deepClone, 
  validateRequired, 
  validateNumber, 
  validatePrice,
  validateTimeVariant as validateTimeVariantUtil
} from "../../Shared/utils";
import { 
  planTypes, 
  categories, 
  priorityOptions,
  clientTypeRestrictions
} from "../../Shared/constant";

// Initial form state that matches backend structure
export const getInitialFormState = () => ({
  // Basic details - matches backend field names
  plan_type: "paid",
  name: "",
  price: "0",
  active: true,
  category: "Residential",
  description: "",
  
  // Access type selection
  accessType: "hotspot", // "hotspot", "pppoe", or "both"
  
  // Access methods configuration 
  access_methods: {
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
  },
  
  // Time variant configuration
  time_variant: null,
  time_variant_id: null,
  
  // Advanced settings
  priority_level: 4,
  router_specific: false,
  allowed_routers_ids: [],
  FUP_policy: "",
  FUP_threshold: 80,
  
  // Template reference
  template: null,
  
  // Pricing references
  pricing_matrix_id: null,
  discount_rule_ids: [],
  
  // Read-only fields (for display only)
  purchases: 0,
  created_at: null,
  updated_at: null,
  
  // Client sessions
  client_sessions: {},
});

const usePlanForm = (initialState = getInitialFormState()) => {
  const [form, setForm] = useState(deepClone(initialState));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form from backend data
  const initializeFromBackend = useCallback((backendData) => {
    if (!backendData) {
      resetForm();
      return;
    }

    const normalizedForm = {
      // Map backend fields to form fields
      plan_type: backendData.planType || backendData.plan_type || "paid",
      name: backendData.name || "",
      price: backendData.price?.toString() || "0",
      active: backendData.active !== false,
      category: backendData.category || "Residential",
      description: backendData.description || "",
      
      // Determine access type from enabled methods
      accessType: (() => {
        const hotspotEnabled = backendData.accessMethods?.hotspot?.enabled || 
                              backendData.access_methods?.hotspot?.enabled;
        const pppoeEnabled = backendData.accessMethods?.pppoe?.enabled || 
                            backendData.access_methods?.pppoe?.enabled;
        
        if (hotspotEnabled && pppoeEnabled) return "both";
        if (pppoeEnabled) return "pppoe";
        return "hotspot";
      })(),
      
      // Access methods - prioritize backend structure
      access_methods: {
        hotspot: {
          enabled: backendData.accessMethods?.hotspot?.enabled || 
                  backendData.access_methods?.hotspot?.enabled || 
                  false,
          downloadSpeed: backendData.accessMethods?.hotspot?.downloadSpeed || 
                        backendData.access_methods?.hotspot?.downloadSpeed || 
                        { value: "10", unit: "Mbps" },
          uploadSpeed: backendData.accessMethods?.hotspot?.uploadSpeed || 
                      backendData.access_methods?.hotspot?.uploadSpeed || 
                      { value: "5", unit: "Mbps" },
          dataLimit: backendData.accessMethods?.hotspot?.dataLimit || 
                    backendData.access_methods?.hotspot?.dataLimit || 
                    { value: "10", unit: "GB" },
          usageLimit: backendData.accessMethods?.hotspot?.usageLimit || 
                     backendData.access_methods?.hotspot?.usageLimit || 
                     { value: "24", unit: "Hours" },
          bandwidthLimit: backendData.accessMethods?.hotspot?.bandwidthLimit || 
                        backendData.access_methods?.hotspot?.bandwidthLimit || 
                        0,
          maxDevices: backendData.accessMethods?.hotspot?.maxDevices || 
                     backendData.access_methods?.hotspot?.maxDevices || 
                     1,
          sessionTimeout: backendData.accessMethods?.hotspot?.sessionTimeout || 
                         backendData.access_methods?.hotspot?.sessionTimeout || 
                         86400,
          idleTimeout: backendData.accessMethods?.hotspot?.idleTimeout || 
                      backendData.access_methods?.hotspot?.idleTimeout || 
                      300,
          validityPeriod: backendData.accessMethods?.hotspot?.validityPeriod || 
                         backendData.access_methods?.hotspot?.validityPeriod || 
                         { value: "30", unit: "Days" },
          macBinding: backendData.accessMethods?.hotspot?.macBinding || 
                     backendData.access_methods?.hotspot?.macBinding || 
                     false,
        },
        pppoe: {
          enabled: backendData.accessMethods?.pppoe?.enabled || 
                  backendData.access_methods?.pppoe?.enabled || 
                  false,
          downloadSpeed: backendData.accessMethods?.pppoe?.downloadSpeed || 
                        backendData.access_methods?.pppoe?.downloadSpeed || 
                        { value: "10", unit: "Mbps" },
          uploadSpeed: backendData.accessMethods?.pppoe?.uploadSpeed || 
                      backendData.access_methods?.pppoe?.uploadSpeed || 
                      { value: "5", unit: "Mbps" },
          dataLimit: backendData.accessMethods?.pppoe?.dataLimit || 
                    backendData.access_methods?.pppoe?.dataLimit || 
                    { value: "10", unit: "GB" },
          usageLimit: backendData.accessMethods?.pppoe?.usageLimit || 
                     backendData.access_methods?.pppoe?.usageLimit || 
                     { value: "24", unit: "Hours" },
          bandwidthLimit: backendData.accessMethods?.pppoe?.bandwidthLimit || 
                        backendData.access_methods?.pppoe?.bandwidthLimit || 
                        0,
          maxDevices: backendData.accessMethods?.pppoe?.maxDevices || 
                     backendData.access_methods?.pppoe?.maxDevices || 
                     1,
          sessionTimeout: backendData.accessMethods?.pppoe?.sessionTimeout || 
                         backendData.access_methods?.pppoe?.sessionTimeout || 
                         86400,
          idleTimeout: backendData.accessMethods?.pppoe?.idleTimeout || 
                      backendData.access_methods?.pppoe?.idleTimeout || 
                      300,
          validityPeriod: backendData.accessMethods?.pppoe?.validityPeriod || 
                         backendData.access_methods?.pppoe?.validityPeriod || 
                         { value: "30", unit: "Days" },
          macBinding: backendData.accessMethods?.pppoe?.macBinding || 
                     backendData.access_methods?.pppoe?.macBinding || 
                     false,
          ipPool: backendData.accessMethods?.pppoe?.ipPool || 
                 backendData.access_methods?.pppoe?.ipPool || 
                 "pppoe-pool-1",
          serviceName: backendData.accessMethods?.pppoe?.serviceName || 
                      backendData.access_methods?.pppoe?.serviceName || 
                      "",
          mtu: backendData.accessMethods?.pppoe?.mtu || 
               backendData.access_methods?.pppoe?.mtu || 
               1492,
        }
      },
      
      // Time variant
      time_variant: backendData.time_variant || null,
      time_variant_id: backendData.time_variant_id || null,
      
      // Advanced settings
      priority_level: backendData.priority_level || 4,
      router_specific: backendData.router_specific || false,
      allowed_routers_ids: backendData.allowed_routers_ids || 
                          backendData.allowed_routers?.map(r => r.id) || 
                          [],
      FUP_policy: backendData.FUP_policy || "",
      FUP_threshold: backendData.FUP_threshold || 80,
      
      // Template
      template: backendData.template || null,
      
      // Pricing
      pricing_matrix_id: backendData.pricing_matrix_id || null,
      discount_rule_ids: backendData.discount_rule_ids || [],
      
      // Read-only fields
      purchases: backendData.purchases || 0,
      created_at: backendData.created_at || null,
      updated_at: backendData.updated_at || null,
      client_sessions: backendData.client_sessions || {},
    };

    setForm(normalizedForm);
    setErrors({});
    setTouched({});
  }, []);

  // Handle basic field changes
  const handleChange = useCallback((field, value) => {
    setForm(prev => ({ 
      ...prev, 
      [field]: value 
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Handle input field changes (for form inputs)
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    handleChange(name, fieldValue);
  }, [handleChange]);

  // Handle access type change - SIMPLIFIED for backend compatibility
  const handleAccessTypeChange = useCallback((accessType) => {
    setForm(prev => {
      const newForm = { ...prev, accessType };
      
      // Update enabled status based on access type
      newForm.access_methods = {
        ...prev.access_methods,
        hotspot: {
          ...prev.access_methods.hotspot,
          enabled: accessType === 'hotspot' || accessType === 'both'
        },
        pppoe: {
          ...prev.access_methods.pppoe,
          enabled: accessType === 'pppoe' || accessType === 'both'
        }
      };
      
      return newForm;
    });
  }, []);

  // Handle access method configuration changes
  const handleAccessMethodChange = useCallback((method, field, value) => {
    setForm(prev => ({
      ...prev,
      access_methods: {
        ...prev.access_methods,
        [method]: {
          ...prev.access_methods[method],
          [field]: value
        }
      }
    }));
  }, []);

  // Handle nested access method changes (like downloadSpeed.value)
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

  // Handle time variant changes
  const handleTimeVariantChange = useCallback((timeVariantData) => {
    setForm(prev => ({
      ...prev,
      time_variant: timeVariantData
    }));
  }, []);

  // Set time variant ID
  const setTimeVariantId = useCallback((timeVariantId) => {
    setForm(prev => ({
      ...prev,
      time_variant_id: timeVariantId
    }));
  }, []);

  // Handle field blur
  const handleFieldBlur = useCallback((field) => {
    if (!touched[field]) {
      setTouched(prev => ({ ...prev, [field]: true }));
    }
  }, [touched]);

  // Validate a specific field
  const validateField = useCallback((name, value) => {
    const newErrors = { ...errors };
    let isValid = true;
    
    switch (name) {
      case 'name':
        newErrors[name] = validateRequired(value, 'Plan name');
        isValid = !newErrors[name];
        break;
      case 'price':
        newErrors[name] = validatePrice(value, form.plan_type);
        isValid = !newErrors[name];
        break;
      case 'category':
        newErrors[name] = validateRequired(value, 'Category');
        isValid = !newErrors[name];
        break;
      case 'plan_type':
        if (value === 'free_trial' && parseFloat(form.price) > 0) {
          newErrors[name] = 'Free trial plans must have price set to 0';
          isValid = false;
        }
        break;
      default:
        break;
    }
    
    if (isValid && newErrors[name]) {
      delete newErrors[name];
    }
    
    setErrors(newErrors);
    return isValid;
  }, [errors, form.plan_type, form.price]);

  // Validate entire form
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Basic validations
    newErrors.name = validateRequired(form.name, 'Plan name');
    newErrors.category = validateRequired(form.category, 'Category');
    newErrors.price = validatePrice(form.price, form.plan_type);
    
    // Free Trial validation
    if (form.plan_type === 'free_trial') {
      if (parseFloat(form.price) > 0) {
        newErrors.price = 'Free Trial plans must have price set to 0';
      }
      if (form.router_specific) {
        newErrors.router_specific = 'Free Trial plans cannot be router-specific';
      }
      if (form.priority_level > 4) {
        newErrors.priority_level = 'Free Trial plans cannot have premium priority levels';
      }
    }
    
    // Access methods validation
    const enabledMethods = [];
    if (form.access_methods.hotspot.enabled) enabledMethods.push('hotspot');
    if (form.access_methods.pppoe.enabled) enabledMethods.push('pppoe');
    
    if (enabledMethods.length === 0) {
      newErrors.access_methods = 'At least one access method must be enabled';
    }
    
    // Validate each enabled access method
    enabledMethods.forEach(method => {
      const config = form.access_methods[method];
      
      // Required technical fields
      const requiredFields = ['downloadSpeed', 'uploadSpeed', 'dataLimit', 'usageLimit'];
      requiredFields.forEach(field => {
        if (!config[field]?.value) {
          newErrors[`${method}_${field}`] = `${method.toUpperCase()} ${field} is required`;
        }
      });
      
      // Numeric validations
      if (config.maxDevices && (config.maxDevices < 1 || config.maxDevices > 10)) {
        newErrors[`${method}_maxDevices`] = 'Max devices must be between 1 and 10';
      }
      
      if (config.sessionTimeout && config.sessionTimeout < 300) {
        newErrors[`${method}_sessionTimeout`] = 'Session timeout must be at least 300 seconds (5 minutes)';
      }
      
      if (config.idleTimeout && config.idleTimeout < 60) {
        newErrors[`${method}_idleTimeout`] = 'Idle timeout must be at least 60 seconds (1 minute)';
      }
      
      // PPPoE specific validations
      if (method === 'pppoe' && config.ipPool && config.ipPool.length < 3) {
        newErrors[`${method}_ipPool`] = 'IP Pool name is required';
      }
      
      if (method === 'pppoe' && config.mtu && (config.mtu < 576 || config.mtu > 1500)) {
        newErrors[`${method}_mtu`] = 'MTU must be between 576 and 1500';
      }
    });
    
    // Time variant validation if active
    if (form.time_variant?.is_active) {
      const timeVariantErrors = validateTimeVariantUtil(form.time_variant);
      Object.keys(timeVariantErrors).forEach(key => {
        newErrors[`time_variant_${key}`] = timeVariantErrors[key];
      });
    }
    
    // FUP threshold validation
    if (form.FUP_threshold && (form.FUP_threshold < 1 || form.FUP_threshold > 100)) {
      newErrors.FUP_threshold = 'FUP threshold must be between 1% and 100%';
    }
    
    // Remove empty errors
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  // Prepare form data for backend API
  const prepareForBackend = useCallback(() => {
    const backendData = {
      plan_type: form.plan_type,
      name: form.name.trim(),
      price: parseFloat(form.price) || 0,
      active: form.active !== false,
      category: form.category,
      description: form.description.trim(),
      
      // Access methods - ensure proper structure
      access_methods: {
        hotspot: {
          enabled: form.access_methods.hotspot.enabled || false,
          downloadSpeed: {
            value: form.access_methods.hotspot.downloadSpeed.value || "10",
            unit: form.access_methods.hotspot.downloadSpeed.unit || "Mbps"
          },
          uploadSpeed: {
            value: form.access_methods.hotspot.uploadSpeed.value || "5",
            unit: form.access_methods.hotspot.uploadSpeed.unit || "Mbps"
          },
          dataLimit: {
            value: form.access_methods.hotspot.dataLimit.value || "10",
            unit: form.access_methods.hotspot.dataLimit.unit || "GB"
          },
          usageLimit: {
            value: form.access_methods.hotspot.usageLimit.value || "24",
            unit: form.access_methods.hotspot.usageLimit.unit || "Hours"
          },
          bandwidthLimit: parseInt(form.access_methods.hotspot.bandwidthLimit) || 0,
          maxDevices: parseInt(form.access_methods.hotspot.maxDevices) || 1,
          sessionTimeout: parseInt(form.access_methods.hotspot.sessionTimeout) || 86400,
          idleTimeout: parseInt(form.access_methods.hotspot.idleTimeout) || 300,
          validityPeriod: {
            value: form.access_methods.hotspot.validityPeriod.value || "30",
            unit: form.access_methods.hotspot.validityPeriod.unit || "Days"
          },
          macBinding: form.access_methods.hotspot.macBinding || false,
        },
        pppoe: {
          enabled: form.access_methods.pppoe.enabled || false,
          downloadSpeed: {
            value: form.access_methods.pppoe.downloadSpeed.value || "10",
            unit: form.access_methods.pppoe.downloadSpeed.unit || "Mbps"
          },
          uploadSpeed: {
            value: form.access_methods.pppoe.uploadSpeed.value || "5",
            unit: form.access_methods.pppoe.uploadSpeed.unit || "Mbps"
          },
          dataLimit: {
            value: form.access_methods.pppoe.dataLimit.value || "10",
            unit: form.access_methods.pppoe.dataLimit.unit || "GB"
          },
          usageLimit: {
            value: form.access_methods.pppoe.usageLimit.value || "24",
            unit: form.access_methods.pppoe.usageLimit.unit || "Hours"
          },
          bandwidthLimit: parseInt(form.access_methods.pppoe.bandwidthLimit) || 0,
          maxDevices: parseInt(form.access_methods.pppoe.maxDevices) || 1,
          sessionTimeout: parseInt(form.access_methods.pppoe.sessionTimeout) || 86400,
          idleTimeout: parseInt(form.access_methods.pppoe.idleTimeout) || 300,
          validityPeriod: {
            value: form.access_methods.pppoe.validityPeriod.value || "30",
            unit: form.access_methods.pppoe.validityPeriod.unit || "Days"
          },
          macBinding: form.access_methods.pppoe.macBinding || false,
          ipPool: form.access_methods.pppoe.ipPool || "pppoe-pool-1",
          serviceName: form.access_methods.pppoe.serviceName || "",
          mtu: parseInt(form.access_methods.pppoe.mtu) || 1492,
        }
      },
      
      priority_level: form.priority_level || 4,
      router_specific: form.router_specific || false,
      allowed_routers_ids: form.router_specific ? form.allowed_routers_ids : [],
      FUP_policy: form.FUP_policy || "",
      FUP_threshold: form.FUP_threshold || 80,
      
      // References
      template: form.template || null,
      time_variant_id: form.time_variant_id || null,
      pricing_matrix_id: form.pricing_matrix_id || null,
      discount_rule_ids: form.discount_rule_ids || []
    };
    
    return backendData;
  }, [form]);

  // Reset form
  const resetForm = useCallback(() => {
    setForm(deepClone(initialState));
    setErrors({});
    setTouched({});
    setIsLoading(false);
  }, [initialState]);

  // Set specific field value
  const setFormField = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // Bulk update form fields
  const updateFormFields = useCallback((updates) => {
    setForm(prev => ({ ...prev, ...updates }));
  }, []);

  // Check if form has changes compared to original
  const hasChanges = useCallback((originalForm) => {
    if (!originalForm) return true;
    
    const currentData = prepareForBackend();
    const originalData = deepClone(originalForm);
    
    // Compare key fields
    const fieldsToCompare = [
      'plan_type', 'name', 'price', 'category', 'description',
      'priority_level', 'router_specific', 'FUP_policy', 'FUP_threshold'
    ];
    
    for (const field of fieldsToCompare) {
      if (currentData[field] !== originalData[field]) {
        return true;
      }
    }
    
    // Compare access methods
    const compareAccessMethod = (method) => {
      const curr = currentData.access_methods[method];
      const orig = originalData.access_methods[method];
      
      if (curr.enabled !== orig.enabled) return true;
      if (JSON.stringify(curr.downloadSpeed) !== JSON.stringify(orig.downloadSpeed)) return true;
      if (JSON.stringify(curr.uploadSpeed) !== JSON.stringify(orig.uploadSpeed)) return true;
      if (JSON.stringify(curr.dataLimit) !== JSON.stringify(orig.dataLimit)) return true;
      if (JSON.stringify(curr.usageLimit) !== JSON.stringify(orig.usageLimit)) return true;
      if (curr.maxDevices !== orig.maxDevices) return true;
      
      return false;
    };
    
    if (compareAccessMethod('hotspot') || compareAccessMethod('pppoe')) {
      return true;
    }
    
    return false;
  }, [prepareForBackend]);

  // Get enabled access methods
  const getEnabledAccessMethods = useCallback(() => {
    const methods = [];
    if (form.access_methods.hotspot.enabled) methods.push('hotspot');
    if (form.access_methods.pppoe.enabled) methods.push('pppoe');
    return methods;
  }, [form.access_methods]);

  // Get access type category
  const getAccessType = useCallback(() => {
    const enabledMethods = getEnabledAccessMethods();
    if (enabledMethods.includes('hotspot') && enabledMethods.includes('pppoe')) {
      return 'dual';
    } else if (enabledMethods.includes('hotspot')) {
      return 'hotspot';
    } else if (enabledMethods.includes('pppoe')) {
      return 'pppoe';
    }
    return 'none';
  }, [getEnabledAccessMethods]);

  // Check if plan has enabled access methods
  const hasEnabledAccessMethods = useCallback(() => {
    return getEnabledAccessMethods().length > 0;
  }, [getEnabledAccessMethods]);

  // Check if time variant is active
  const hasTimeVariant = useCallback(() => {
    return form.time_variant?.is_active || false;
  }, [form.time_variant]);

  // Get configuration for specific access method
  const getConfigForMethod = useCallback((method) => {
    return form.access_methods[method] || {};
  }, [form.access_methods]);

  // Load form from backend data
  const loadFromBackend = useCallback(async (planId, apiService) => {
    if (!planId || !apiService) return;
    
    setIsLoading(true);
    try {
      const response = await apiService.getPlan(planId);
      if (response.success && response.data) {
        initializeFromBackend(response.data);
      }
    } catch (error) {
      console.error('Error loading plan data:', error);
      setErrors({ fetch: 'Failed to load plan data' });
    } finally {
      setIsLoading(false);
    }
  }, [initializeFromBackend]);

  // Auto-save form (optional)
  const autoSave = useCallback(async (apiService, planId) => {
    if (!validateForm()) {
      return { success: false, errors };
    }
    
    setIsLoading(true);
    try {
      const formData = prepareForBackend();
      let response;
      
      if (planId) {
        // Update existing plan
        response = await apiService.updatePlan(planId, formData);
      } else {
        // Create new plan
        response = await apiService.createPlan(formData);
      }
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, errors: response.errors };
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      return { 
        success: false, 
        errors: { 
          save: error.response?.data?.detail || 'Failed to save plan' 
        } 
      };
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, prepareForBackend, errors]);

  return {
    // Form state
    form,
    errors,
    touched,
    isLoading,
    
    // Setters
    setForm: initializeFromBackend,
    setFormField,
    updateFormFields,
    setErrors,
    setTouched,
    setIsLoading,
    
    // Handlers
    handleChange,
    handleInputChange,
    handleAccessTypeChange,
    handleAccessMethodChange,
    handleAccessMethodNestedChange,
    handleTimeVariantChange,
    setTimeVariantId,
    handleFieldBlur,
    
    // Validations
    validateField,
    validateForm,
    
    // Utilities
    prepareForBackend,
    resetForm,
    hasChanges,
    hasEnabledAccessMethods,
    hasTimeVariant,
    getEnabledAccessMethods,
    getAccessType,
    getConfigForMethod,
    loadFromBackend,
    autoSave,
    
    // Constants for forms
    planTypes,
    categories,
    priorityOptions,
    clientTypeRestrictions,
  };
};

export default usePlanForm;