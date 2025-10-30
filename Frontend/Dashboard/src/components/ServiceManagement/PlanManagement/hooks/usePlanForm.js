// import { useState, useCallback } from "react";
// import { deepClone, validateRequired, validateNumber, validatePrice } from "../../Shared/utils"

// // Initial form state with dual-access structure
// export const getInitialFormState = () => ({
//   // Basic details
//   planType: "Paid",
//   name: "",
//   price: "",
//   active: true,
//   category: "Residential",
//   description: "",
  
//   // Access methods configuration
//   accessMethods: {
//     hotspot: {
//       enabled: true,
//       downloadSpeed: { value: "", unit: "Mbps" },
//       uploadSpeed: { value: "", unit: "Mbps" },
//       dataLimit: { value: "", unit: "GB" },
//       usageLimit: { value: "", unit: "Hours" },
//       bandwidthLimit: 0,
//       concurrentConnections: 1,
//       sessionTimeout: 86400, // 24 hours in seconds
//       idleTimeout: 300, // 5 minutes
//     },
//     pppoe: {
//       enabled: true,
//       downloadSpeed: { value: "", unit: "Mbps" },
//       uploadSpeed: { value: "", unit: "Mbps" },
//       dataLimit: { value: "", unit: "GB" },
//       usageLimit: { value: "", unit: "Hours" },
//       bandwidthLimit: 0,
//       concurrentConnections: 1,
//       ipPool: "pppoe-pool-1",
//       serviceName: "",
//       mtu: 1492,
//       dnsServers: ["8.8.8.8", "1.1.1.1"],
//       idleTimeout: 300,
//     }
//   },
  
//   // Shared settings
//   purchases: 0,
//   features: [],
//   restrictions: [],
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
    
//     // Access method validations
//     Object.entries(form.accessMethods).forEach(([method, config]) => {
//       if (config.enabled) {
//         newErrors[`${method}_downloadSpeed`] = validateRequired(
//           config.downloadSpeed.value, 
//           `${method.toUpperCase()} Download Speed`
//         );
//         newErrors[`${method}_uploadSpeed`] = validateRequired(
//           config.uploadSpeed.value, 
//           `${method.toUpperCase()} Upload Speed`
//         );
//         newErrors[`${method}_dataLimit`] = validateRequired(
//           config.dataLimit.value, 
//           `${method.toUpperCase()} Data Limit`
//         );
//         newErrors[`${method}_usageLimit`] = validateRequired(
//           config.usageLimit.value, 
//           `${method.toUpperCase()} Usage Limit`
//         );
//       }
//     });

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




import { useState, useCallback } from "react";
import { deepClone, validateRequired, validateNumber, validatePrice } from "../../Shared/utils"

// Initial form state with clear separation
export const getInitialFormState = () => ({
  // Basic details
  planType: "Paid",
  name: "",
  price: "",
  active: true,
  category: "Residential",
  description: "",
  
  // Access type selection (NEW: Clear separation)
  accessType: "hotspot", // "hotspot" or "pppoe"
  
  // Access methods configuration - now only one is active at a time
  accessMethods: {
    hotspot: {
      enabled: true,
      downloadSpeed: { value: "", unit: "Mbps" },
      uploadSpeed: { value: "", unit: "Mbps" },
      dataLimit: { value: "", unit: "GB" },
      usageLimit: { value: "", unit: "Hours" },
      bandwidthLimit: 0,
      
      // NEW FEATURES
      maxDevices: 1, // Maximum devices per user
      sessionTimeout: 86400, // Maximum continuous connection time
      idleTimeout: 300, // Disconnect after inactivity
      validityPeriod: { value: 720, unit: "Hours" }, // Plan expiry
      macBinding: false, // MAC address binding
    },
    pppoe: {
      enabled: false,
      downloadSpeed: { value: "", unit: "Mbps" },
      uploadSpeed: { value: "", unit: "Mbps" },
      dataLimit: { value: "", unit: "GB" },
      usageLimit: { value: "", unit: "Hours" },
      bandwidthLimit: 0,
      
      // NEW FEATURES
      maxDevices: 1,
      sessionTimeout: 86400,
      idleTimeout: 300,
      validityPeriod: { value: 720, unit: "Hours" },
      macBinding: false,
      ipPool: "pppoe-pool-1", // IP pool assignment
      serviceName: "",
      mtu: 1492,
      dnsServers: ["8.8.8.8", "1.1.1.1"],
    }
  },
  
  // Shared settings
  purchases: 0,
  createdAt: new Date().toISOString().split("T")[0],
  client_sessions: {},
  priority_level: 4,
  router_specific: false,
  allowed_routers_ids: [],
  FUP_policy: "",
  FUP_threshold: 80,
});

const usePlanForm = (initialState = getInitialFormState()) => {
  const [form, setForm] = useState(deepClone(initialState));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  // NEW: Handle access type change with proper separation
  const handleAccessTypeChange = useCallback((accessType) => {
    setForm(prev => {
      const newForm = { ...prev, accessType };
      
      // Enable the selected access method and disable the other
      newForm.accessMethods = {
        hotspot: {
          ...prev.accessMethods.hotspot,
          enabled: accessType === 'hotspot'
        },
        pppoe: {
          ...prev.accessMethods.pppoe,
          enabled: accessType === 'pppoe'
        }
      };
      
      return newForm;
    });
  }, []);

  const handleNestedChange = useCallback((field, key, value) => {
    setForm(prev => ({ 
      ...prev, 
      [field]: { ...prev[field], [key]: value } 
    }));
  }, []);

  const handleAccessMethodChange = useCallback((method, field, value) => {
    setForm(prev => ({
      ...prev,
      accessMethods: {
        ...prev.accessMethods,
        [method]: {
          ...prev.accessMethods[method],
          [field]: value
        }
      }
    }));
  }, []);

  const handleAccessMethodNestedChange = useCallback((method, parent, key, value) => {
    setForm(prev => ({
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
  }, []);

  const handleFieldBlur = useCallback((field) => {
    if (!touched[field]) {
      setTouched(prev => ({ ...prev, [field]: true }));
    }
  }, [touched]);

  const validateField = useCallback((name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'name':
        newErrors[name] = validateRequired(value, 'Plan name');
        break;
      case 'price':
        newErrors[name] = validatePrice(value, form.planType);
        break;
      case 'category':
        newErrors[name] = validateRequired(value, 'Category');
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return !newErrors[name];
  }, [errors, form.planType]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Basic validations
    newErrors.name = validateRequired(form.name, 'Plan name');
    newErrors.category = validateRequired(form.category, 'Category');
    newErrors.price = validatePrice(form.price, form.planType);
    
    // Access method validations - only validate the enabled method
    const enabledMethod = form.accessType;
    const config = form.accessMethods[enabledMethod];
    
    if (config.enabled) {
      newErrors[`${enabledMethod}_downloadSpeed`] = validateRequired(
        config.downloadSpeed.value, 
        `${enabledMethod.toUpperCase()} Download Speed`
      );
      newErrors[`${enabledMethod}_uploadSpeed`] = validateRequired(
        config.uploadSpeed.value, 
        `${enabledMethod.toUpperCase()} Upload Speed`
      );
      newErrors[`${enabledMethod}_dataLimit`] = validateRequired(
        config.dataLimit.value, 
        `${enabledMethod.toUpperCase()} Data Limit`
      );
      newErrors[`${enabledMethod}_usageLimit`] = validateRequired(
        config.usageLimit.value, 
        `${enabledMethod.toUpperCase()} Usage Limit`
      );
    }

    // Remove empty errors
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const resetForm = useCallback(() => {
    setForm(deepClone(initialState));
    setErrors({});
    setTouched({});
  }, [initialState]);

  const setFormData = useCallback((data) => {
    setForm(deepClone(data));
  }, []);

  return {
    form,
    setForm: setFormData,
    errors,
    touched,
    setTouched,
    handleChange,
    handleAccessTypeChange, // NEW: Export access type handler
    handleNestedChange,
    handleAccessMethodChange,
    handleAccessMethodNestedChange,
    handleFieldBlur,
    validateField,
    validateForm,
    resetForm,
  };
};

export default usePlanForm;