





// import React, { useState, useMemo, useEffect, useCallback } from "react";
// import { motion } from "framer-motion";
// import { Save, Box, Wifi, Cable, Infinity as InfinityIcon, Settings, Router, Shield, TrendingDown, Clock } from "lucide-react";
// import { getThemeClasses, EnhancedSelect } from "../Shared/components";
// import HotspotConfiguration from "../PlanManagement/HotspotConfiguration"
// import PPPoEConfiguration from "../PlanManagement/PPPoEConfiguration"
// import { 
//   categories, 
//   dataLimitPresets, 
//   usageLimitPresets, 
//   validityPeriodPresets,
//   deviceLimitOptions,
//   sessionTimeoutOptions,
//   idleTimeoutOptions,
//   bandwidthPresets,
//   priorityOptions
// } from "../Shared/constant";
// import { formatBandwidthDisplay } from "../Shared/utils";

// const TemplateForm = ({
//   templateForm,
//   templateType,
//   viewMode,
//   isLoading,
//   showTimeVariant,
//   timeVariantConfig,
//   onFormChange,
//   onAccessMethodChange,
//   onAccessMethodNestedChange,
//   onTimeVariantChange,
//   onTimeVariantToggle,
//   onCancel,
//   onSubmit,
//   theme
// }) => {
//   const themeClasses = getThemeClasses(theme);
//   const isHotspot = templateType === "hotspot";
//   const isPPPoE = templateType === "pppoe";

//   const [activeTab, setActiveTab] = useState("basic");
//   const [errors, setErrors] = useState({});

//   // Days of week options
//   const daysOfWeek = [
//     { value: "mon", label: "Monday" },
//     { value: "tue", label: "Tuesday" },
//     { value: "wed", label: "Wednesday" },
//     { value: "thu", label: "Thursday" },
//     { value: "fri", label: "Friday" },
//     { value: "sat", label: "Saturday" },
//     { value: "sun", label: "Sunday" }
//   ];

//   // Time units for duration
//   const durationUnits = [
//     { value: "hours", label: "Hours" },
//     { value: "days", label: "Days" },
//     { value: "weeks", label: "Weeks" },
//     { value: "months", label: "Months" }
//   ];

//   // Enable selected method by default on component mount
//   useEffect(() => {
//     if (viewMode === "create") {
//       const activeMethod = templateForm.access_methods[templateType];
//       if (!activeMethod?.enabled) {
//         onAccessMethodChange(templateType, "enabled", true);
//       }
//     }
//   }, [templateType, viewMode, onAccessMethodChange, templateForm.access_methods]);

//   // ==========================================================================
//   // HELPER FUNCTIONS - Type conversion utilities
//   // ==========================================================================

//   /**
//    * Safely converts any value to a number or returns 0
//    */
//   const toSafeNumber = useCallback((value) => {
//     if (value === "" || value === null || value === undefined) return 0;
//     const num = Number(value);
//     return isNaN(num) ? 0 : num;
//   }, []);

//   /**
//    * Checks if a value is effectively empty
//    */
//   const isEmpty = useCallback((value) => {
//     return value === "" || value === null || value === undefined;
//   }, []);

//   // ==========================================================================
//   // VALIDATION
//   // ==========================================================================

//   const validateForm = useCallback(() => {
//     const newErrors = {};
    
//     if (!templateForm.name?.trim()) {
//       newErrors.name = "Template name is required";
//     }
    
//     // Base price validation - allow empty or zero
//     const basePrice = toSafeNumber(templateForm.base_price);
//     if (basePrice < 0) {
//       newErrors.base_price = "Base price cannot be negative";
//     }
    
//     const activeMethod = getActiveAccessMethod();
//     if (activeMethod?.enabled) {
//       const downloadSpeed = toSafeNumber(activeMethod.download_speed?.value);
//       const uploadSpeed = toSafeNumber(activeMethod.upload_speed?.value);
      
//       if (downloadSpeed <= 0) {
//         newErrors.download_speed = "Download speed must be greater than 0";
//       }
      
//       if (uploadSpeed <= 0) {
//         newErrors.upload_speed = "Upload speed must be greater than 0";
//       }
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   }, [templateForm, toSafeNumber]);

//   // ==========================================================================
//   // GETTERS
//   // ==========================================================================

//   const getActiveAccessMethod = useCallback(() => {
//     return templateForm.access_methods?.[templateType] || {};
//   }, [templateForm.access_methods, templateType]);

//   // ==========================================================================
//   // FORMATTING FUNCTIONS
//   // ==========================================================================

//   const formatTimeDisplay = useCallback((seconds) => {
//     const numSeconds = toSafeNumber(seconds);
//     if (numSeconds === 0) return "No Limit";
    
//     if (numSeconds >= 86400) {
//       const days = numSeconds / 86400;
//       return days === 1 ? "1 Day" : `${days} Days`;
//     } else if (numSeconds >= 3600) {
//       const hours = numSeconds / 3600;
//       return hours === 1 ? "1 Hour" : `${hours} Hours`;
//     } else if (numSeconds >= 60) {
//       const minutes = numSeconds / 60;
//       return minutes === 1 ? "1 Minute" : `${minutes} Minutes`;
//     }
//     return `${numSeconds} Seconds`;
//   }, [toSafeNumber]);

//   // ==========================================================================
//   // PLAN SUMMARY
//   // ==========================================================================

//   const planSummary = useMemo(() => {
//     const activeMethod = getActiveAccessMethod();
    
//     if (!activeMethod.enabled) {
//       return {};
//     }

//     const dataLimitDisplay = activeMethod.data_limit?.unit === 'Unlimited' 
//       ? 'Unlimited' 
//       : `${activeMethod.data_limit?.value || '0'} ${activeMethod.data_limit?.unit || 'GB'}`;
    
//     const usageLimitDisplay = activeMethod.usage_limit?.unit === 'Unlimited' 
//       ? 'Unlimited' 
//       : `${activeMethod.usage_limit?.value || '0'} ${activeMethod.usage_limit?.unit || 'Hours'}`;

//     const validityDisplay = isEmpty(activeMethod.validity_period?.value) || activeMethod.validity_period?.value === '0'
//       ? 'No Expiry'
//       : `${activeMethod.validity_period?.value || ''} ${activeMethod.validity_period?.unit || 'Days'}`;

//     const maxDevicesValue = toSafeNumber(activeMethod.max_devices);

//     return {
//       dataLimit: dataLimitDisplay,
//       usageLimit: usageLimitDisplay,
//       validity: validityDisplay,
//       downloadSpeed: `${activeMethod.download_speed?.value || '0'} ${activeMethod.download_speed?.unit || 'Mbps'}`,
//       uploadSpeed: `${activeMethod.upload_speed?.value || '0'} ${activeMethod.upload_speed?.unit || 'Mbps'}`,
//       maxDevices: maxDevicesValue === 0 ? 'Unlimited' : maxDevicesValue,
//       sessionTimeout: formatTimeDisplay(activeMethod.session_timeout),
//       idleTimeout: formatTimeDisplay(activeMethod.idle_timeout),
//       bandwidth: formatBandwidthDisplay(toSafeNumber(activeMethod.bandwidth_limit)),
//       macBinding: activeMethod.mac_binding ? 'Enabled' : 'Disabled'
//     };
//   }, [templateForm, templateType, getActiveAccessMethod, formatTimeDisplay, toSafeNumber, isEmpty]);

//   // ==========================================================================
//   // TABS CONFIGURATION
//   // ==========================================================================

//   const tabs = useMemo(() => [
//     { id: "basic", label: "Basic Details", icon: Settings },
//     { 
//       id: "configuration", 
//       label: `${isHotspot ? "Hotspot" : "PPPoE"} Configuration`, 
//       icon: isHotspot ? Wifi : Cable 
//     },
//     { id: "timeVariant", label: "Time Variant", icon: Clock },
//     { id: "advanced", label: "Advanced", icon: Shield },
//   ], [isHotspot]);

//   // ==========================================================================
//   // EVENT HANDLERS
//   // ==========================================================================

//   const handleSubmit = useCallback(() => {
//     if (validateForm()) {
//       onSubmit();
//     }
//   }, [validateForm, onSubmit]);

//   const handleFormChange = useCallback((field, value) => {
//     onFormChange(field, value);
//     if (errors[field]) {
//       setErrors(prev => ({ ...prev, [field]: null }));
//     }
//   }, [onFormChange, errors]);

//   // ==========================================================================
//   // RENDER FUNCTIONS
//   // ==========================================================================

//   const renderTabs = useCallback(() => (
//     <div className={`p-2 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <div className="flex flex-wrap gap-1 lg:gap-2">
//         {tabs.map((tab) => {
//           const IconComponent = tab.icon;
//           return (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`px-2 sm:px-3 lg:px-4 py-1 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 ${
//                 activeTab === tab.id 
//                   ? "bg-indigo-600 text-white" 
//                   : `${themeClasses.text.secondary} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`
//               }`}
//               aria-label={`${tab.label} tab`}
//               type="button"
//             >
//               <IconComponent className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
//               <span className="truncate">{tab.label}</span>
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   ), [tabs, activeTab, themeClasses, theme]);

//   // ==========================================================================
//   // RENDER TIME VARIANT CONFIGURATION
//   // ==========================================================================

//   const renderTimeVariantConfig = useCallback(() => {
//     if (!showTimeVariant) {
//       return (
//         <div className={`p-4 sm:p-6 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
//           <div className="flex items-center justify-between">
//             <div>
//               <h4 className="text-sm sm:text-md font-semibold flex items-center">
//                 <Clock className="w-4 h-4 mr-2 text-indigo-600" />
//                 Time-Based Availability
//               </h4>
//               <p className="text-xs text-gray-500 mt-1">
//                 Restrict when plans can be purchased (time of day, days of week, etc.)
//               </p>
//             </div>
//             <button
//               onClick={onTimeVariantToggle}
//               className={`px-3 py-1.5 rounded-lg text-sm font-medium ${themeClasses.button.primary}`}
//               type="button"
//             >
//               Configure Time Variant
//             </button>
//           </div>
//         </div>
//       );
//     }

//     return (
//       <div className={`p-4 sm:p-6 rounded-lg border ${themeClasses.border.light} space-y-6`}>
//         <div className="flex items-center justify-between">
//           <h4 className="text-sm sm:text-md font-semibold flex items-center">
//             <Clock className="w-4 h-4 mr-2 text-indigo-600" />
//             Time Variant Configuration
//           </h4>
//           <button
//             onClick={onTimeVariantToggle}
//             className={`px-3 py-1.5 rounded-lg text-sm font-medium ${themeClasses.button.secondary}`}
//             type="button"
//           >
//             Remove Time Variant
//           </button>
//         </div>

//         {/* Enable Time Variant Toggle */}
//         <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
//           <div>
//             <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//               Enable Time Variant Controls
//             </label>
//             <p className="text-xs text-gray-500 mt-1">
//               Turn on time-based availability restrictions
//             </p>
//           </div>
//           <div 
//             onClick={() => onTimeVariantChange("is_active", !timeVariantConfig?.is_active)}
//             className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
//               timeVariantConfig?.is_active 
//                 ? 'bg-indigo-600'
//                 : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//             }`}
//             role="switch"
//             aria-checked={timeVariantConfig?.is_active || false}
//             tabIndex={0}
//             onKeyPress={(e) => e.key === 'Enter' && onTimeVariantChange("is_active", !timeVariantConfig?.is_active)}
//           >
//             <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//               timeVariantConfig?.is_active ? "translate-x-6" : "translate-x-1"
//             }`} />
//           </div>
//         </div>

//         {timeVariantConfig?.is_active && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="space-y-6"
//           >
//             {/* Force Available Override */}
//             <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
//               <div>
//                 <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                   Force Available
//                 </label>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Override all restrictions and make plans always available
//                 </p>
//               </div>
//               <div 
//                 onClick={() => onTimeVariantChange("force_available", !timeVariantConfig.force_available)}
//                 className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
//                   timeVariantConfig.force_available 
//                     ? 'bg-green-600'
//                     : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//                 }`}
//                 role="switch"
//                 aria-checked={timeVariantConfig.force_available || false}
//                 tabIndex={0}
//                 onKeyPress={(e) => e.key === 'Enter' && onTimeVariantChange("force_available", !timeVariantConfig.force_available)}
//               >
//                 <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//                   timeVariantConfig.force_available ? "translate-x-6" : "translate-x-1"
//                 }`} />
//               </div>
//             </div>

//             {/* Time of Day */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div>
//                 <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                   Start Time (24h)
//                 </label>
//                 <input
//                   type="time"
//                   value={timeVariantConfig.start_time || ""}
//                   onChange={(e) => onTimeVariantChange("start_time", e.target.value)}
//                   className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                 />
//               </div>
//               <div>
//                 <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                   End Time (24h)
//                 </label>
//                 <input
//                   type="time"
//                   value={timeVariantConfig.end_time || ""}
//                   onChange={(e) => onTimeVariantChange("end_time", e.target.value)}
//                   className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                 />
//               </div>
//             </div>

//             {/* Days of Week */}
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 Available Days
//               </label>
//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
//                 {daysOfWeek.map(day => (
//                   <label key={day.value} className="flex items-center space-x-2">
//                     <input
//                       type="checkbox"
//                       checked={timeVariantConfig.available_days?.includes(day.value) || false}
//                       onChange={(e) => {
//                         const newDays = e.target.checked
//                           ? [...(timeVariantConfig.available_days || []), day.value]
//                           : (timeVariantConfig.available_days || []).filter(d => d !== day.value);
//                         onTimeVariantChange("available_days", newDays);
//                       }}
//                       className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
//                     />
//                     <span className="text-sm">{day.label}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             {/* Schedule Active Toggle */}
//             <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
//               <div>
//                 <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                   Scheduled Availability
//                 </label>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Set specific date range for availability
//                 </p>
//               </div>
//               <div 
//                 onClick={() => onTimeVariantChange("schedule_active", !timeVariantConfig.schedule_active)}
//                 className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
//                   timeVariantConfig.schedule_active 
//                     ? 'bg-indigo-600'
//                     : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//                 }`}
//                 role="switch"
//                 aria-checked={timeVariantConfig.schedule_active || false}
//                 tabIndex={0}
//                 onKeyPress={(e) => e.key === 'Enter' && onTimeVariantChange("schedule_active", !timeVariantConfig.schedule_active)}
//               >
//                 <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//                   timeVariantConfig.schedule_active ? "translate-x-6" : "translate-x-1"
//                 }`} />
//               </div>
//             </div>

//             {timeVariantConfig.schedule_active && (
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="grid grid-cols-1 sm:grid-cols-2 gap-4"
//               >
//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                     Start Date
//                   </label>
//                   <input
//                     type="datetime-local"
//                     value={timeVariantConfig.schedule_start_date || ""}
//                     onChange={(e) => onTimeVariantChange("schedule_start_date", e.target.value)}
//                     className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                   />
//                 </div>
//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                     End Date
//                   </label>
//                   <input
//                     type="datetime-local"
//                     value={timeVariantConfig.schedule_end_date || ""}
//                     onChange={(e) => onTimeVariantChange("schedule_end_date", e.target.value)}
//                     className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                   />
//                 </div>
//               </motion.div>
//             )}

//             {/* Duration Active Toggle */}
//             <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
//               <div>
//                 <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                   Duration-Based Availability
//                 </label>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Available for a limited duration from a start date
//                 </p>
//               </div>
//               <div 
//                 onClick={() => onTimeVariantChange("duration_active", !timeVariantConfig.duration_active)}
//                 className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
//                   timeVariantConfig.duration_active 
//                     ? 'bg-indigo-600'
//                     : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//                 }`}
//                 role="switch"
//                 aria-checked={timeVariantConfig.duration_active || false}
//                 tabIndex={0}
//                 onKeyPress={(e) => e.key === 'Enter' && onTimeVariantChange("duration_active", !timeVariantConfig.duration_active)}
//               >
//                 <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//                   timeVariantConfig.duration_active ? "translate-x-6" : "translate-x-1"
//                 }`} />
//               </div>
//             </div>

//             {timeVariantConfig.duration_active && (
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="space-y-4"
//               >
//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                     Start Date
//                   </label>
//                   <input
//                     type="datetime-local"
//                     value={timeVariantConfig.duration_start_date || ""}
//                     onChange={(e) => onTimeVariantChange("duration_start_date", e.target.value)}
//                     className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                       Duration Value
//                     </label>
//                     <input
//                       type="number"
//                       value={timeVariantConfig.duration_value || ""}
//                       onChange={(e) => onTimeVariantChange("duration_value", parseInt(e.target.value) || 0)}
//                       className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                       min="1"
//                     />
//                   </div>
//                   <div>
//                     <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                       Duration Unit
//                     </label>
//                     <EnhancedSelect
//                       value={timeVariantConfig.duration_unit || "days"}
//                       onChange={(value) => onTimeVariantChange("duration_unit", value)}
//                       options={durationUnits}
//                       theme={theme}
//                       className="w-full"
//                     />
//                   </div>
//                 </div>
//               </motion.div>
//             )}

//             {/* Timezone */}
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 Timezone
//               </label>
//               <EnhancedSelect
//                 value={timeVariantConfig.timezone || "Africa/Nairobi"}
//                 onChange={(value) => onTimeVariantChange("timezone", value)}
//                 options={[
//                   { value: "Africa/Nairobi", label: "Nairobi (EAT)" },
//                   { value: "UTC", label: "UTC" },
//                   { value: "America/New_York", label: "New York (EST)" },
//                   { value: "Europe/London", label: "London (GMT)" },
//                   { value: "Asia/Dubai", label: "Dubai (GST)" }
//                 ]}
//                 theme={theme}
//                 className="w-full"
//               />
//             </div>
//           </motion.div>
//         )}
//       </div>
//     );
//   }, [showTimeVariant, timeVariantConfig, themeClasses, theme, onTimeVariantToggle, onTimeVariantChange, daysOfWeek, durationUnits]);

//   // ==========================================================================
//   // RENDER BASIC DETAILS TAB
//   // ==========================================================================

//   const renderBasicDetails = useCallback(() => (
//     <div className="space-y-4 sm:space-y-6">
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
//         <div>
//           <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//             Template Name *
//           </label>
//           <input
//             type="text"
//             value={templateForm.name || ""}
//             onChange={(e) => handleFormChange("name", e.target.value)}
//             className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input} ${
//               errors.name ? 'border-red-500 focus:ring-red-500' : ''
//             }`}
//             placeholder="Enter template name"
//           />
//           {errors.name && (
//             <p className="mt-1 text-xs text-red-600">{errors.name}</p>
//           )}
//         </div>
        
//         <div>
//           <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//             Category
//           </label>
//           <EnhancedSelect
//             value={templateForm.category || ""}
//             onChange={(value) => handleFormChange("category", value)}
//             options={categories.map(cat => ({ value: cat, label: cat }))}
//             theme={theme}
//             className="w-full"
//           />
//         </div>
//       </div>

//       <div>
//         <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//           Description
//         </label>
//         <textarea
//           value={templateForm.description || ""}
//           onChange={(e) => handleFormChange("description", e.target.value)}
//           rows={3}
//           className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//           placeholder="Describe this template..."
//         />
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
//         <div>
//           <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//             Base Price (Ksh)
//           </label>
//           <input
//             type="number"
//             value={templateForm.base_price || ""}
//             onChange={(e) => {
//               handleFormChange("base_price", e.target.value);
//               if (errors.base_price) setErrors(prev => ({ ...prev, base_price: null }));
//             }}
//             className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input} ${
//               errors.base_price ? 'border-red-500 focus:ring-red-500' : ''
//             }`}
//             placeholder="Enter base price (optional)"
//             step="0.01"
//             min="0"
//           />
//           {errors.base_price && (
//             <p className="mt-1 text-xs text-red-600">{errors.base_price}</p>
//           )}
//         </div>
        
//         <div className="space-y-4">
//           <div className="flex items-center justify-between">
//             <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//               Public Template
//             </label>
//             <div 
//               onClick={() => handleFormChange("is_public", !templateForm.is_public)}
//               className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
//                 templateForm.is_public 
//                   ? 'bg-indigo-600'
//                   : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//               }`}
//               role="switch"
//               aria-checked={templateForm.is_public || false}
//               tabIndex={0}
//               onKeyPress={(e) => e.key === 'Enter' && handleFormChange("is_public", !templateForm.is_public)}
//             >
//               <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//                 templateForm.is_public ? "translate-x-6" : "translate-x-1"
//               }`} />
//             </div>
//           </div>

//           <div className="flex items-center justify-between">
//             <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//               Active Template
//             </label>
//             <div 
//               onClick={() => handleFormChange("is_active", !templateForm.is_active)}
//               className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
//                 templateForm.is_active 
//                   ? 'bg-green-600'
//                   : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//               }`}
//               role="switch"
//               aria-checked={templateForm.is_active || false}
//               tabIndex={0}
//               onKeyPress={(e) => e.key === 'Enter' && handleFormChange("is_active", !templateForm.is_active)}
//             >
//               <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//                 templateForm.is_active ? "translate-x-6" : "translate-x-1"
//               }`} />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   ), [templateForm, errors, themeClasses, theme, handleFormChange]);

//   // ==========================================================================
//   // RENDER ADVANCED TAB
//   // ==========================================================================

//   const renderAdvanced = useCallback(() => (
//     <div className="space-y-4 sm:space-y-6">
//       {/* Priority Level */}
//       <div className={`p-3 sm:p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-blue-900/10' : 'bg-blue-50'}`}>
//         <label className={`block text-sm font-medium mb-3 ${themeClasses.text.primary} flex items-center`}>
//           <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
//           Network Priority
//         </label>
        
//         <div className="mb-3">
//           <EnhancedSelect
//             value={templateForm.priority_level || 3}
//             onChange={(value) => handleFormChange("priority_level", parseInt(value, 10))}
//             options={priorityOptions.map(opt => ({ 
//               value: opt.value, 
//               label: `${opt.label} - Level ${opt.value}`
//             }))}
//             theme={theme}
//             className="w-full"
//           />
//         </div>
        
//         <div className={`p-2 sm:p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-800/20' : 'bg-blue-100'}`}>
//           <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
//             <strong>Current:</strong> {priorityOptions.find(opt => opt.value === (templateForm.priority_level || 3))?.label || "Standard priority"}
//           </p>
//           <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
//             Higher priority templates get better network performance during congestion
//           </p>
//         </div>
//       </div>
      
//       {/* Router Restrictions */}
//       <div className={`p-3 sm:p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-purple-900/10' : 'bg-purple-50'}`}>
//         <div className="flex items-center justify-between mb-4">
//           <div className="flex-1 min-w-0">
//             <label className={`block text-sm font-medium ${themeClasses.text.primary} flex items-center`}>
//               <Router className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
//               Router Restrictions
//             </label>
//             <p className="text-xs text-gray-500 mt-1">
//               Limit plans created from this template to specific routers only
//             </p>
//           </div>
//           <div 
//             onClick={() => handleFormChange("router_specific", !templateForm.router_specific)} 
//             className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
//               templateForm.router_specific 
//                 ? 'bg-indigo-600'
//                 : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//             }`}
//             role="switch"
//             aria-checked={templateForm.router_specific || false}
//             tabIndex={0}
//             onKeyPress={(e) => e.key === 'Enter' && handleFormChange("router_specific", !templateForm.router_specific)}
//           >
//             <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//               templateForm.router_specific ? "translate-x-6" : "translate-x-1"
//             }`} />
//           </div>
//         </div>
        
//         {templateForm.router_specific && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: "auto" }}
//             transition={{ duration: 0.3 }}
//           >
//             <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
//               Note: Router restrictions will apply to all plans created from this template.
//               You can override this when creating individual plans.
//             </p>
//           </motion.div>
//         )}
//       </div>
      
//       {/* Fair Usage Policy */}
//       <div className={`p-3 sm:p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-orange-900/10' : 'bg-orange-50'}`}>
//         <label className={`block text-sm font-medium mb-3 ${themeClasses.text.primary} flex items-center`}>
//           <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
//           Fair Usage Policy (FUP)
//         </label>
        
//         <div className="space-y-3 sm:space-y-4">
//           <div>
//             <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//               FUP Threshold
//             </label>
//             <div className="flex items-center space-x-3 sm:space-x-4">
//               <input 
//                 type="range" 
//                 value={templateForm.FUP_threshold || 80} 
//                 onChange={(e) => handleFormChange("FUP_threshold", parseInt(e.target.value, 10) || 80)} 
//                 className="flex-1"
//                 min="0" 
//                 max="100" 
//                 step="1" 
//               />
//               <span className="text-sm font-medium min-w-8 sm:min-w-12 text-right">
//                 {templateForm.FUP_threshold || 80}%
//               </span>
//             </div>
//             <p className="text-xs text-gray-500 mt-1">
//               Policy activates after {templateForm.FUP_threshold || 80}% of usage limit is reached
//             </p>
//           </div>
          
//           <div>
//             <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//               Policy Description
//             </label>
//             <textarea 
//               value={templateForm.FUP_policy || ""} 
//               onChange={(e) => handleFormChange("FUP_policy", e.target.value)} 
//               rows={3}
//               className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//               placeholder="e.g., Speed will be reduced to 1Mbps after reaching the usage threshold to ensure fair usage for all customers..."
//             />
//             <p className="text-xs text-gray-500 mt-1">
//               Describe what changes when the fair usage threshold is reached
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   ), [templateForm, themeClasses, theme, handleFormChange]);

//   // ==========================================================================
//   // RENDER PLAN SUMMARY
//   // ==========================================================================

//   const renderPlanSummary = useCallback(() => (
//     <div className={`p-3 sm:p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-indigo-900/10' : 'bg-indigo-50'} mt-4 sm:mt-6`}>
//       <h4 className="text-sm sm:text-md font-semibold mb-3 sm:mb-4 text-indigo-700 dark:text-indigo-300 flex items-center">
//         <Box className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
//         Template Summary
//       </h4>
//       <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
//         <div className={`text-center p-2 sm:p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//           <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mx-auto mb-1 flex-shrink-0" />
//           <div className="text-xs sm:text-sm font-semibold truncate">{planSummary.downloadSpeed}</div>
//           <div className="text-xs text-gray-500 truncate">Download</div>
//         </div>
//         <div className={`text-center p-2 sm:p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//           <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mx-auto mb-1 flex-shrink-0" />
//           <div className="text-xs sm:text-sm font-semibold truncate">{planSummary.uploadSpeed}</div>
//           <div className="text-xs text-gray-500 truncate">Upload</div>
//         </div>
//         <div className={`text-center p-2 sm:p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//           <Box className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mx-auto mb-1 flex-shrink-0" />
//           <div className="text-xs sm:text-sm font-semibold truncate">{planSummary.dataLimit}</div>
//           <div className="text-xs text-gray-500 truncate">Data Limit</div>
//         </div>
//         <div className={`text-center p-2 sm:p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//           <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mx-auto mb-1 flex-shrink-0" />
//           <div className="text-xs sm:text-sm font-semibold truncate">{planSummary.usageLimit}</div>
//           <div className="text-xs text-gray-500 truncate">Daily Limit</div>
//         </div>
//         <div className={`text-center p-2 sm:p-3 rounded-lg flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//           <Box className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 mx-auto mb-1 flex-shrink-0" />
//           <div className="text-xs sm:text-sm font-semibold flex items-center gap-1">
//             {planSummary.maxDevices === 'Unlimited' && <InfinityIcon className="w-3 h-3 sm:w-4 sm:h-4" />}
//             <span className="truncate">{planSummary.maxDevices}</span>
//           </div>
//           <div className="text-xs text-gray-500 truncate">Max Devices</div>
//         </div>
//         <div className={`text-center p-2 sm:p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//           <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mx-auto mb-1 flex-shrink-0" />
//           <div className="text-xs sm:text-sm font-semibold truncate">{planSummary.macBinding}</div>
//           <div className="text-xs text-gray-500 truncate">Device Lock</div>
//         </div>
//       </div>
//     </div>
//   ), [planSummary, themeClasses, theme]);

//   // ==========================================================================
//   // RENDER FORM CONTENT BASED ON ACTIVE TAB
//   // ==========================================================================

//   const renderFormContent = useCallback(() => {
//     const activeMethod = getActiveAccessMethod();
    
//     switch (activeTab) {
//       case "basic":
//         return renderBasicDetails();

//       case "configuration":
//         return isHotspot ? (
//           <HotspotConfiguration
//             form={templateForm}
//             errors={errors}
//             onChange={onAccessMethodChange}
//             onNestedChange={onAccessMethodNestedChange}
//             theme={theme}
//           />
//         ) : (
//           <PPPoEConfiguration
//             form={templateForm}
//             errors={errors}
//             onChange={onAccessMethodChange}
//             onNestedChange={onAccessMethodNestedChange}
//             theme={theme}
//           />
//         );

//       case "timeVariant":
//         return renderTimeVariantConfig();

//       case "advanced":
//         return renderAdvanced();

//       default:
//         return null;
//     }
//   }, [
//     activeTab, 
//     isHotspot, 
//     templateForm, 
//     errors, 
//     onAccessMethodChange, 
//     onAccessMethodNestedChange, 
//     theme,
//     renderBasicDetails,
//     renderTimeVariantConfig,
//     renderAdvanced,
//     getActiveAccessMethod
//   ]);

//   return (
//     <div className={`p-4 sm:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center">
//         <Box className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-indigo-600 flex-shrink-0" />
//         {viewMode === "create" 
//           ? `Create ${isHotspot ? "Hotspot" : "PPPoE"} Template` 
//           : "Edit Template"
//         }
//       </h3>

//       {/* Tabs */}
//       {renderTabs()}

//       {/* Form Content */}
//       <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
//         {renderFormContent()}
//       </div>

//       {/* Plan Summary - Only show for configuration tab when method is enabled */}
//       {activeTab === "configuration" && getActiveAccessMethod().enabled && renderPlanSummary()}

//       {/* Form Actions */}
//       <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t mt-4 sm:mt-6">
//         <button
//           onClick={onCancel}
//           className={`px-4 sm:px-6 py-2 rounded-lg ${themeClasses.button.secondary} text-sm sm:text-base`}
//           type="button"
//         >
//           Cancel
//         </button>
//         <button
//           onClick={handleSubmit}
//           disabled={!templateForm.name?.trim() || isLoading}
//           className={`px-4 sm:px-6 py-2 rounded-lg flex items-center justify-center text-sm sm:text-base ${
//             !templateForm.name?.trim() || isLoading 
//               ? 'bg-gray-400 cursor-not-allowed' 
//               : themeClasses.button.success
//           }`}
//           type="button"
//         >
//           {isLoading ? (
//             <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
//           ) : (
//             <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
//           )}
//           <span className="truncate">
//             {viewMode === "create" 
//               ? `Create ${isHotspot ? "Hotspot" : "PPPoE"} Template` 
//               : "Update Template"
//             }
//           </span>
//         </button>
//       </div>
//     </div>
//   );
// };

// export default React.memo(TemplateForm);










import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Save, Box, Wifi, Cable, Infinity as InfinityIcon, Settings, Router, Shield, TrendingDown, Clock } from "lucide-react";
import { getThemeClasses, EnhancedSelect } from "../Shared/components";
import HotspotConfiguration from "../PlanManagement/HotspotConfiguration";
import PPPoEConfiguration from "../PlanManagement/PPPoEConfiguration";
import { 
  dataLimitPresets, 
  usageLimitPresets, 
  validityPeriodPresets,
  deviceLimitOptions,
  sessionTimeoutOptions,
  idleTimeoutOptions,
  bandwidthPresets,
  priorityOptions
} from "../Shared/constant";
import { formatBandwidthDisplay } from "../Shared/utils";

// Backend expects EXACT categories as defined in models.py
const BACKEND_CATEGORIES = [
  { value: "Residential", label: "Residential" },
  { value: "Business", label: "Business" },
  { value: "Promotional", label: "Promotional" },
  { value: "Enterprise", label: "Enterprise" }
];

const TemplateForm = ({
  templateForm,
  templateType,
  viewMode,
  isLoading,
  showTimeVariant,
  timeVariantConfig,
  onFormChange,
  onAccessMethodChange,
  onAccessMethodNestedChange,
  onTimeVariantChange,
  onTimeVariantToggle,
  onCancel,
  onSubmit,
  theme
}) => {
  const themeClasses = getThemeClasses(theme);
  const isHotspot = templateType === "hotspot";
  const isPPPoE = templateType === "pppoe";

  const [activeTab, setActiveTab] = useState("basic");
  const [errors, setErrors] = useState({});

  // Days of week options
  const daysOfWeek = [
    { value: "mon", label: "Monday" },
    { value: "tue", label: "Tuesday" },
    { value: "wed", label: "Wednesday" },
    { value: "thu", label: "Thursday" },
    { value: "fri", label: "Friday" },
    { value: "sat", label: "Saturday" },
    { value: "sun", label: "Sunday" }
  ];

  // Time units for duration
  const durationUnits = [
    { value: "hours", label: "Hours" },
    { value: "days", label: "Days" },
    { value: "weeks", label: "Weeks" },
    { value: "months", label: "Months" }
  ];

  // Enable selected method by default on component mount
  useEffect(() => {
    if (viewMode === "create") {
      const activeMethod = templateForm.access_methods?.[templateType];
      if (!activeMethod?.enabled) {
        onAccessMethodChange(templateType, "enabled", true);
      }
    }
  }, [templateType, viewMode, onAccessMethodChange, templateForm.access_methods]);

  // ==========================================================================
  // HELPER FUNCTIONS - Type conversion utilities
  // ==========================================================================

  /**
   * Safely converts any value to a number or returns 0
   */
  const toSafeNumber = useCallback((value) => {
    if (value === "" || value === null || value === undefined) return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }, []);

  /**
   * Checks if a value is effectively empty
   */
  const isEmpty = useCallback((value) => {
    return value === "" || value === null || value === undefined;
  }, []);

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!templateForm.name?.trim()) {
      newErrors.name = "Template name is required";
    }
    
    // Base price validation - allow empty or zero
    const basePrice = toSafeNumber(templateForm.base_price);
    if (basePrice < 0) {
      newErrors.base_price = "Base price cannot be negative";
    }
    
    const activeMethod = getActiveAccessMethod();
    if (activeMethod?.enabled) {
      const downloadSpeed = toSafeNumber(activeMethod.download_speed?.value);
      const uploadSpeed = toSafeNumber(activeMethod.upload_speed?.value);
      
      if (downloadSpeed <= 0) {
        newErrors.download_speed = "Download speed must be greater than 0";
      }
      
      if (uploadSpeed <= 0) {
        newErrors.upload_speed = "Upload speed must be greater than 0";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [templateForm, toSafeNumber]);

  // ==========================================================================
  // GETTERS
  // ==========================================================================

  const getActiveAccessMethod = useCallback(() => {
    return templateForm.access_methods?.[templateType] || {};
  }, [templateForm.access_methods, templateType]);

  // ==========================================================================
  // FORMATTING FUNCTIONS
  // ==========================================================================

  const formatTimeDisplay = useCallback((seconds) => {
    const numSeconds = toSafeNumber(seconds);
    if (numSeconds === 0) return "No Limit";
    
    if (numSeconds >= 86400) {
      const days = numSeconds / 86400;
      return days === 1 ? "1 Day" : `${days} Days`;
    } else if (numSeconds >= 3600) {
      const hours = numSeconds / 3600;
      return hours === 1 ? "1 Hour" : `${hours} Hours`;
    } else if (numSeconds >= 60) {
      const minutes = numSeconds / 60;
      return minutes === 1 ? "1 Minute" : `${minutes} Minutes`;
    }
    return `${numSeconds} Seconds`;
  }, [toSafeNumber]);

  // ==========================================================================
  // PLAN SUMMARY
  // ==========================================================================

  const planSummary = useMemo(() => {
    const activeMethod = getActiveAccessMethod();
    
    if (!activeMethod.enabled) {
      return {};
    }

    const dataLimitDisplay = activeMethod.data_limit?.unit === 'Unlimited' 
      ? 'Unlimited' 
      : `${activeMethod.data_limit?.value || '0'} ${activeMethod.data_limit?.unit || 'GB'}`;
    
    const usageLimitDisplay = activeMethod.usage_limit?.unit === 'Unlimited' 
      ? 'Unlimited' 
      : `${activeMethod.usage_limit?.value || '0'} ${activeMethod.usage_limit?.unit || 'Hours'}`;

    const validityDisplay = isEmpty(activeMethod.validity_period?.value) || activeMethod.validity_period?.value === '0'
      ? 'No Expiry'
      : `${activeMethod.validity_period?.value || ''} ${activeMethod.validity_period?.unit || 'Days'}`;

    const maxDevicesValue = toSafeNumber(activeMethod.max_devices);

    return {
      dataLimit: dataLimitDisplay,
      usageLimit: usageLimitDisplay,
      validity: validityDisplay,
      downloadSpeed: `${activeMethod.download_speed?.value || '0'} ${activeMethod.download_speed?.unit || 'Mbps'}`,
      uploadSpeed: `${activeMethod.upload_speed?.value || '0'} ${activeMethod.upload_speed?.unit || 'Mbps'}`,
      maxDevices: maxDevicesValue === 0 ? 'Unlimited' : maxDevicesValue,
      sessionTimeout: formatTimeDisplay(activeMethod.session_timeout),
      idleTimeout: formatTimeDisplay(activeMethod.idle_timeout),
      bandwidth: formatBandwidthDisplay(toSafeNumber(activeMethod.bandwidth_limit)),
      macBinding: activeMethod.mac_binding ? 'Enabled' : 'Disabled'
    };
  }, [templateForm, templateType, getActiveAccessMethod, formatTimeDisplay, toSafeNumber, isEmpty]);

  // ==========================================================================
  // TABS CONFIGURATION
  // ==========================================================================

  const tabs = useMemo(() => [
    { id: "basic", label: "Basic Details", icon: Settings },
    { 
      id: "configuration", 
      label: `${isHotspot ? "Hotspot" : "PPPoE"} Configuration`, 
      icon: isHotspot ? Wifi : Cable 
    },
    { id: "timeVariant", label: "Time Variant", icon: Clock },
    { id: "advanced", label: "Advanced", icon: Shield },
  ], [isHotspot]);

  // ==========================================================================
  // EVENT HANDLERS
  // ==========================================================================

  const handleSubmit = useCallback(() => {
    if (validateForm()) {
      onSubmit();
    }
  }, [validateForm, onSubmit]);

  const handleFormChange = useCallback((field, value) => {
    onFormChange(field, value);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [onFormChange, errors]);

  // ==========================================================================
  // RENDER FUNCTIONS
  // ==========================================================================

  const renderTabs = useCallback(() => (
    <div className={`p-2 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <div className="flex flex-wrap gap-1 lg:gap-2">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2 sm:px-3 lg:px-4 py-1 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 ${
                activeTab === tab.id 
                  ? "bg-indigo-600 text-white" 
                  : `${themeClasses.text.secondary} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`
              }`}
              aria-label={`${tab.label} tab`}
              type="button"
            >
              <IconComponent className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  ), [tabs, activeTab, themeClasses, theme]);

  // ==========================================================================
  // RENDER TIME VARIANT CONFIGURATION
  // ==========================================================================

  const renderTimeVariantConfig = useCallback(() => {
    if (!showTimeVariant) {
      return (
        <div className={`p-4 sm:p-6 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm sm:text-md font-semibold flex items-center">
                <Clock className="w-4 h-4 mr-2 text-indigo-600" />
                Time-Based Availability
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Restrict when plans can be purchased (time of day, days of week, etc.)
              </p>
            </div>
            <button
              onClick={onTimeVariantToggle}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${themeClasses.button.primary}`}
              type="button"
            >
              Configure Time Variant
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={`p-4 sm:p-6 rounded-lg border ${themeClasses.border.light} space-y-6`}>
        <div className="flex items-center justify-between">
          <h4 className="text-sm sm:text-md font-semibold flex items-center">
            <Clock className="w-4 h-4 mr-2 text-indigo-600" />
            Time Variant Configuration
          </h4>
          <button
            onClick={onTimeVariantToggle}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${themeClasses.button.secondary}`}
            type="button"
          >
            Remove Time Variant
          </button>
        </div>

        {/* Enable Time Variant Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div>
            <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
              Enable Time Variant Controls
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Turn on time-based availability restrictions
            </p>
          </div>
          <div 
            onClick={() => onTimeVariantChange("is_active", !timeVariantConfig?.is_active)}
            className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
              timeVariantConfig?.is_active 
                ? 'bg-indigo-600'
                : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
            }`}
            role="switch"
            aria-checked={timeVariantConfig?.is_active || false}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onTimeVariantChange("is_active", !timeVariantConfig?.is_active)}
          >
            <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
              timeVariantConfig?.is_active ? "translate-x-6" : "translate-x-1"
            }`} />
          </div>
        </div>

        {timeVariantConfig?.is_active && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Force Available Override */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                  Force Available
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Override all restrictions and make plans always available
                </p>
              </div>
              <div 
                onClick={() => onTimeVariantChange("force_available", !timeVariantConfig.force_available)}
                className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                  timeVariantConfig.force_available 
                    ? 'bg-green-600'
                    : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={timeVariantConfig.force_available || false}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onTimeVariantChange("force_available", !timeVariantConfig.force_available)}
              >
                <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                  timeVariantConfig.force_available ? "translate-x-6" : "translate-x-1"
                }`} />
              </div>
            </div>

            {/* Time of Day */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  Start Time (24h)
                </label>
                <input
                  type="time"
                  value={timeVariantConfig.start_time || ""}
                  onChange={(e) => onTimeVariantChange("start_time", e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  End Time (24h)
                </label>
                <input
                  type="time"
                  value={timeVariantConfig.end_time || ""}
                  onChange={(e) => onTimeVariantChange("end_time", e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                />
              </div>
            </div>

            {/* Days of Week */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                Available Days
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {daysOfWeek.map(day => (
                  <label key={day.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={timeVariantConfig.available_days?.includes(day.value) || false}
                      onChange={(e) => {
                        const newDays = e.target.checked
                          ? [...(timeVariantConfig.available_days || []), day.value]
                          : (timeVariantConfig.available_days || []).filter(d => d !== day.value);
                        onTimeVariantChange("available_days", newDays);
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Schedule Active Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                  Scheduled Availability
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Set specific date range for availability
                </p>
              </div>
              <div 
                onClick={() => onTimeVariantChange("schedule_active", !timeVariantConfig.schedule_active)}
                className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                  timeVariantConfig.schedule_active 
                    ? 'bg-indigo-600'
                    : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={timeVariantConfig.schedule_active || false}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onTimeVariantChange("schedule_active", !timeVariantConfig.schedule_active)}
              >
                <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                  timeVariantConfig.schedule_active ? "translate-x-6" : "translate-x-1"
                }`} />
              </div>
            </div>

            {timeVariantConfig.schedule_active && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={timeVariantConfig.schedule_start_date || ""}
                    onChange={(e) => onTimeVariantChange("schedule_start_date", e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    value={timeVariantConfig.schedule_end_date || ""}
                    onChange={(e) => onTimeVariantChange("schedule_end_date", e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                  />
                </div>
              </motion.div>
            )}

            {/* Duration Active Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                  Duration-Based Availability
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Available for a limited duration from a start date
                </p>
              </div>
              <div 
                onClick={() => onTimeVariantChange("duration_active", !timeVariantConfig.duration_active)}
                className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                  timeVariantConfig.duration_active 
                    ? 'bg-indigo-600'
                    : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={timeVariantConfig.duration_active || false}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onTimeVariantChange("duration_active", !timeVariantConfig.duration_active)}
              >
                <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                  timeVariantConfig.duration_active ? "translate-x-6" : "translate-x-1"
                }`} />
              </div>
            </div>

            {timeVariantConfig.duration_active && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={timeVariantConfig.duration_start_date || ""}
                    onChange={(e) => onTimeVariantChange("duration_start_date", e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                      Duration Value
                    </label>
                    <input
                      type="number"
                      value={timeVariantConfig.duration_value || ""}
                      onChange={(e) => onTimeVariantChange("duration_value", parseInt(e.target.value) || 0)}
                      className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                      min="1"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                      Duration Unit
                    </label>
                    <EnhancedSelect
                      value={timeVariantConfig.duration_unit || "days"}
                      onChange={(value) => onTimeVariantChange("duration_unit", value)}
                      options={durationUnits}
                      theme={theme}
                      className="w-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Timezone */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                Timezone
              </label>
              <EnhancedSelect
                value={timeVariantConfig.timezone || "Africa/Nairobi"}
                onChange={(value) => onTimeVariantChange("timezone", value)}
                options={[
                  { value: "Africa/Nairobi", label: "Nairobi (EAT)" },
                  { value: "UTC", label: "UTC" },
                  { value: "America/New_York", label: "New York (EST)" },
                  { value: "Europe/London", label: "London (GMT)" },
                  { value: "Asia/Dubai", label: "Dubai (GST)" }
                ]}
                theme={theme}
                className="w-full"
              />
            </div>
          </motion.div>
        )}
      </div>
    );
  }, [showTimeVariant, timeVariantConfig, themeClasses, theme, onTimeVariantToggle, onTimeVariantChange, daysOfWeek, durationUnits]);

  // ==========================================================================
  // RENDER BASIC DETAILS TAB - FIXED: Using BACKEND_CATEGORIES
  // ==========================================================================

  const renderBasicDetails = useCallback(() => (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
            Template Name *
          </label>
          <input
            type="text"
            value={templateForm.name || ""}
            onChange={(e) => handleFormChange("name", e.target.value)}
            className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input} ${
              errors.name ? 'border-red-500 focus:ring-red-500' : ''
            }`}
            placeholder="Enter template name"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
          )}
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
            Category
          </label>
          <EnhancedSelect
            value={templateForm.category || "Residential"}
            onChange={(value) => handleFormChange("category", value)}
            options={BACKEND_CATEGORIES}
            theme={theme}
            className="w-full"
          />
        </div>
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
          Description
        </label>
        <textarea
          value={templateForm.description || ""}
          onChange={(e) => handleFormChange("description", e.target.value)}
          rows={3}
          className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
          placeholder="Describe this template..."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
            Base Price (Ksh)
          </label>
          <input
            type="number"
            value={templateForm.base_price || ""}
            onChange={(e) => {
              handleFormChange("base_price", e.target.value);
              if (errors.base_price) setErrors(prev => ({ ...prev, base_price: null }));
            }}
            className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input} ${
              errors.base_price ? 'border-red-500 focus:ring-red-500' : ''
            }`}
            placeholder="Enter base price (optional)"
            step="0.01"
            min="0"
          />
          {errors.base_price && (
            <p className="mt-1 text-xs text-red-600">{errors.base_price}</p>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
              Public Template
            </label>
            <div 
              onClick={() => handleFormChange("is_public", !templateForm.is_public)}
              className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                templateForm.is_public 
                  ? 'bg-indigo-600'
                  : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={templateForm.is_public || false}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleFormChange("is_public", !templateForm.is_public)}
            >
              <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                templateForm.is_public ? "translate-x-6" : "translate-x-1"
              }`} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
              Active Template
            </label>
            <div 
              onClick={() => handleFormChange("is_active", !templateForm.is_active)}
              className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                templateForm.is_active 
                  ? 'bg-green-600'
                  : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={templateForm.is_active || false}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleFormChange("is_active", !templateForm.is_active)}
            >
              <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                templateForm.is_active ? "translate-x-6" : "translate-x-1"
              }`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  ), [templateForm, errors, themeClasses, theme, handleFormChange]);

  // ==========================================================================
  // RENDER ADVANCED TAB
  // ==========================================================================

  const renderAdvanced = useCallback(() => (
    <div className="space-y-4 sm:space-y-6">
      {/* Priority Level */}
      <div className={`p-3 sm:p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-blue-900/10' : 'bg-blue-50'}`}>
        <label className={`block text-sm font-medium mb-3 ${themeClasses.text.primary} flex items-center`}>
          <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
          Network Priority
        </label>
        
        <div className="mb-3">
          <EnhancedSelect
            value={templateForm.priority_level || 3}
            onChange={(value) => handleFormChange("priority_level", parseInt(value, 10))}
            options={priorityOptions.map(opt => ({ 
              value: opt.value, 
              label: `${opt.label} - Level ${opt.value}`
            }))}
            theme={theme}
            className="w-full"
          />
        </div>
        
        <div className={`p-2 sm:p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-800/20' : 'bg-blue-100'}`}>
          <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
            <strong>Current:</strong> {priorityOptions.find(opt => opt.value === (templateForm.priority_level || 3))?.label || "Standard priority"}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Higher priority templates get better network performance during congestion
          </p>
        </div>
      </div>
      
      {/* Router Restrictions */}
      <div className={`p-3 sm:p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-purple-900/10' : 'bg-purple-50'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 min-w-0">
            <label className={`block text-sm font-medium ${themeClasses.text.primary} flex items-center`}>
              <Router className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
              Router Restrictions
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Limit plans created from this template to specific routers only
            </p>
          </div>
          <div 
            onClick={() => handleFormChange("router_specific", !templateForm.router_specific)} 
            className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
              templateForm.router_specific 
                ? 'bg-indigo-600'
                : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
            }`}
            role="switch"
            aria-checked={templateForm.router_specific || false}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleFormChange("router_specific", !templateForm.router_specific)}
          >
            <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
              templateForm.router_specific ? "translate-x-6" : "translate-x-1"
            }`} />
          </div>
        </div>
        
        {templateForm.router_specific && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
              Note: Router restrictions will apply to all plans created from this template.
              You can override this when creating individual plans.
            </p>
          </motion.div>
        )}
      </div>
      
      {/* Fair Usage Policy */}
      <div className={`p-3 sm:p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-orange-900/10' : 'bg-orange-50'}`}>
        <label className={`block text-sm font-medium mb-3 ${themeClasses.text.primary} flex items-center`}>
          <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
          Fair Usage Policy (FUP)
        </label>
        
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
              FUP Threshold
            </label>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <input 
                type="range" 
                value={templateForm.fup_threshold || 80} 
                onChange={(e) => handleFormChange("fup_threshold", parseInt(e.target.value, 10) || 80)} 
                className="flex-1"
                min="0" 
                max="100" 
                step="1" 
              />
              <span className="text-sm font-medium min-w-8 sm:min-w-12 text-right">
                {templateForm.fup_threshold || 80}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Policy activates after {templateForm.fup_threshold || 80}% of usage limit is reached
            </p>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
              Policy Description
            </label>
            <textarea 
              value={templateForm.fup_policy || ""} 
              onChange={(e) => handleFormChange("fup_policy", e.target.value)} 
              rows={3}
              className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
              placeholder="e.g., Speed will be reduced to 1Mbps after reaching the usage threshold to ensure fair usage for all customers..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Describe what changes when the fair usage threshold is reached
            </p>
          </div>
        </div>
      </div>
    </div>
  ), [templateForm, themeClasses, theme, handleFormChange]);

  // ==========================================================================
  // RENDER PLAN SUMMARY
  // ==========================================================================

  const renderPlanSummary = useCallback(() => (
    <div className={`p-3 sm:p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-indigo-900/10' : 'bg-indigo-50'} mt-4 sm:mt-6`}>
      <h4 className="text-sm sm:text-md font-semibold mb-3 sm:mb-4 text-indigo-700 dark:text-indigo-300 flex items-center">
        <Box className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
        Template Summary
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        <div className={`text-center p-2 sm:p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mx-auto mb-1 flex-shrink-0" />
          <div className="text-xs sm:text-sm font-semibold truncate">{planSummary.downloadSpeed}</div>
          <div className="text-xs text-gray-500 truncate">Download</div>
        </div>
        <div className={`text-center p-2 sm:p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mx-auto mb-1 flex-shrink-0" />
          <div className="text-xs sm:text-sm font-semibold truncate">{planSummary.uploadSpeed}</div>
          <div className="text-xs text-gray-500 truncate">Upload</div>
        </div>
        <div className={`text-center p-2 sm:p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <Box className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mx-auto mb-1 flex-shrink-0" />
          <div className="text-xs sm:text-sm font-semibold truncate">{planSummary.dataLimit}</div>
          <div className="text-xs text-gray-500 truncate">Data Limit</div>
        </div>
        <div className={`text-center p-2 sm:p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mx-auto mb-1 flex-shrink-0" />
          <div className="text-xs sm:text-sm font-semibold truncate">{planSummary.usageLimit}</div>
          <div className="text-xs text-gray-500 truncate">Daily Limit</div>
        </div>
        <div className={`text-center p-2 sm:p-3 rounded-lg flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <Box className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 mx-auto mb-1 flex-shrink-0" />
          <div className="text-xs sm:text-sm font-semibold flex items-center gap-1">
            {planSummary.maxDevices === 'Unlimited' && <InfinityIcon className="w-3 h-3 sm:w-4 sm:h-4" />}
            <span className="truncate">{planSummary.maxDevices}</span>
          </div>
          <div className="text-xs text-gray-500 truncate">Max Devices</div>
        </div>
        <div className={`text-center p-2 sm:p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mx-auto mb-1 flex-shrink-0" />
          <div className="text-xs sm:text-sm font-semibold truncate">{planSummary.macBinding}</div>
          <div className="text-xs text-gray-500 truncate">Device Lock</div>
        </div>
      </div>
    </div>
  ), [planSummary, themeClasses, theme]);

  // ==========================================================================
  // RENDER FORM CONTENT BASED ON ACTIVE TAB
  // ==========================================================================

  const renderFormContent = useCallback(() => {
    const activeMethod = getActiveAccessMethod();
    
    switch (activeTab) {
      case "basic":
        return renderBasicDetails();

      case "configuration":
        return isHotspot ? (
          <HotspotConfiguration
            form={templateForm}
            errors={errors}
            onChange={onAccessMethodChange}
            onNestedChange={onAccessMethodNestedChange}
            theme={theme}
          />
        ) : (
          <PPPoEConfiguration
            form={templateForm}
            errors={errors}
            onChange={onAccessMethodChange}
            onNestedChange={onAccessMethodNestedChange}
            theme={theme}
          />
        );

      case "timeVariant":
        return renderTimeVariantConfig();

      case "advanced":
        return renderAdvanced();

      default:
        return null;
    }
  }, [
    activeTab, 
    isHotspot, 
    templateForm, 
    errors, 
    onAccessMethodChange, 
    onAccessMethodNestedChange, 
    theme,
    renderBasicDetails,
    renderTimeVariantConfig,
    renderAdvanced,
    getActiveAccessMethod
  ]);

  return (
    <div className={`p-4 sm:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center">
        <Box className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-indigo-600 flex-shrink-0" />
        {viewMode === "create" 
          ? `Create ${isHotspot ? "Hotspot" : "PPPoE"} Template` 
          : "Edit Template"
        }
      </h3>

      {/* Tabs */}
      {renderTabs()}

      {/* Form Content */}
      <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
        {renderFormContent()}
      </div>

      {/* Plan Summary - Only show for configuration tab when method is enabled */}
      {activeTab === "configuration" && getActiveAccessMethod().enabled && renderPlanSummary()}

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t mt-4 sm:mt-6">
        <button
          onClick={onCancel}
          className={`px-4 sm:px-6 py-2 rounded-lg ${themeClasses.button.secondary} text-sm sm:text-base`}
          type="button"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!templateForm.name?.trim() || isLoading}
          className={`px-4 sm:px-6 py-2 rounded-lg flex items-center justify-center text-sm sm:text-base ${
            !templateForm.name?.trim() || isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : themeClasses.button.success
          }`}
          type="button"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
          )}
          <span className="truncate">
            {viewMode === "create" 
              ? `Create ${isHotspot ? "Hotspot" : "PPPoE"} Template` 
              : "Update Template"
            }
          </span>
        </button>
      </div>
    </div>
  );
};

export default React.memo(TemplateForm);