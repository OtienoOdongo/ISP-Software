








// import React, { useState, useMemo, useEffect } from "react";
// import { motion } from "framer-motion";
// import { Save, Box, Wifi, Cable, Infinity as InfinityIcon, Settings, Router, Shield, TrendingDown } from "lucide-react";
// import { getThemeClasses, EnhancedSelect } from "../Shared/components";
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
//   onFormChange,
//   onAccessMethodChange,
//   onAccessMethodNestedChange,
//   onCancel,
//   onSubmit,
//   theme
// }) => {
//   const themeClasses = getThemeClasses(theme);
//   const isHotspot = templateType === "hotspot";
//   const isPPPoE = templateType === "pppoe";

//   // State for preset selections
//   const [dataLimitPreset, setDataLimitPreset] = useState('custom');
//   const [usageLimitPreset, setUsageLimitPreset] = useState('custom');
//   const [validityPreset, setValidityPreset] = useState('custom');
//   const [bandwidthPreset, setBandwidthPreset] = useState('custom');
//   const [bandwidthUnit, setBandwidthUnit] = useState('Mbps');
//   const [activeTab, setActiveTab] = useState("basic");

//   // Enable PPPoE by default on component mount or when templateType changes
//   useEffect(() => {
//     if (isPPPoE && viewMode === "create") {
//       const activeMethod = templateForm.accessMethods[templateType];
//       if (!activeMethod.enabled) {
//         onAccessMethodChange(templateType, "enabled", true);
//       }
//     }
//   }, [templateType, viewMode, isPPPoE, onAccessMethodChange, templateForm.accessMethods]);

//   const renderUnitDropdown = (method, field, value, units) => (
//     <EnhancedSelect
//       value={value}
//       onChange={(newValue) => onAccessMethodNestedChange(method, field, 'unit', newValue)}
//       options={units.map(unit => ({ value: unit, label: unit }))}
//       className="w-24"
//       theme={theme}
//     />
//   );

//   // Handle data limit changes - if unit is "Unlimited", clear the value
//   const handleDataLimitChange = (method, value, unit) => {
//     if (unit === "Unlimited") {
//       onAccessMethodNestedChange(method, "dataLimit", "value", "");
//     }
//     onAccessMethodNestedChange(method, "dataLimit", "unit", unit);
//   };

//   // Handle usage limit changes - if unit is "Unlimited", clear the value
//   const handleUsageLimitChange = (method, value, unit) => {
//     if (unit === "Unlimited") {
//       onAccessMethodNestedChange(method, "usageLimit", "value", "");
//     }
//     onAccessMethodNestedChange(method, "usageLimit", "unit", unit);
//   };

//   // Handle validity period changes
//   const handleValidityChange = (method, value, unit) => {
//     if (unit === "Unlimited") {
//       onAccessMethodNestedChange(method, "validityPeriod", "value", "");
//     }
//     onAccessMethodNestedChange(method, "validityPeriod", "unit", unit);
//   };

//   // Handle preset selections for data limit
//   const handleDataLimitPreset = (presetKey, method) => {
//     setDataLimitPreset(presetKey);
//     if (presetKey !== 'custom') {
//       const preset = dataLimitPresets.find(p => p.value === presetKey);
//       if (preset) {
//         onAccessMethodNestedChange(method, "dataLimit", "value", preset.value);
//         onAccessMethodNestedChange(method, "dataLimit", "unit", preset.unit);
//       }
//     } else {
//       // Reset to empty when switching to custom
//       onAccessMethodNestedChange(method, "dataLimit", "value", "");
//     }
//   };

//   // Handle preset selections for usage limit
//   const handleUsageLimitPreset = (presetKey, method) => {
//     setUsageLimitPreset(presetKey);
//     if (presetKey !== 'custom') {
//       const preset = usageLimitPresets.find(p => p.value === presetKey);
//       if (preset) {
//         onAccessMethodNestedChange(method, "usageLimit", "value", preset.value);
//         onAccessMethodNestedChange(method, "usageLimit", "unit", preset.unit);
//       }
//     } else {
//       // Reset to empty when switching to custom
//       onAccessMethodNestedChange(method, "usageLimit", "value", "");
//     }
//   };

//   // Handle validity period presets
//   const handleValidityPreset = (presetKey, method) => {
//     setValidityPreset(presetKey);
//     if (presetKey !== 'custom') {
//       const preset = validityPeriodPresets.find(p => p.value === presetKey);
//       if (preset) {
//         onAccessMethodNestedChange(method, "validityPeriod", "value", preset.value);
//         onAccessMethodNestedChange(method, "validityPeriod", "unit", preset.unit);
//       }
//     } else {
//       // Reset to empty when switching to custom
//       onAccessMethodNestedChange(method, "validityPeriod", "value", "");
//     }
//   };

//   // Handle bandwidth presets
//   const handleBandwidthPreset = (presetKey, method) => {
//     setBandwidthPreset(presetKey);
//     if (presetKey !== 'custom') {
//       const preset = bandwidthPresets.find(p => p.value === parseInt(presetKey));
//       if (preset) {
//         onAccessMethodChange(method, "bandwidthLimit", preset.value);
//       }
//     }
//   };

//   // Function to convert Mbps to Kbps
//   const convertToKbps = (value, unit) => {
//     if (unit === 'Mbps') {
//       return parseFloat(value) * 1000 || 0;
//     }
//     return parseFloat(value) || 0;
//   };

//   // Get display value for bandwidth input based on unit
//   const getBandwidthDisplayValue = (method) => {
//     if (bandwidthUnit === 'Mbps') {
//       return (templateForm.accessMethods[method].bandwidthLimit / 1000) || '';
//     }
//     return templateForm.accessMethods[method].bandwidthLimit || '';
//   };

//   // Get active access method configuration
//   const getActiveAccessMethod = () => {
//     return templateForm.accessMethods[templateType];
//   };

//   // Helper to format time for display
//   const formatTimeDisplay = (seconds) => {
//     if (seconds === 0) return "No Limit";
//     const hours = seconds / 3600;
//     if (hours >= 24) {
//       const days = hours / 24;
//       return days === 1 ? "1 Day" : `${days} Days`;
//     }
//     return hours === 1 ? "1 Hour" : `${hours} Hours`;
//   };

//   // Plan summary with proper unlimited handling
//   const planSummary = useMemo(() => {
//     const activeMethod = getActiveAccessMethod();
    
//     const dataLimitDisplay = activeMethod.dataLimit.unit === 'Unlimited' 
//       ? 'Unlimited - No data Caps' 
//       : `${activeMethod.dataLimit.value || '0'} ${activeMethod.dataLimit.unit}`;
    
//     const usageLimitDisplay = activeMethod.usageLimit.unit === 'Unlimited' 
//       ? 'Unlimited - No restrictions' 
//       : `${activeMethod.usageLimit.value || '0'} ${activeMethod.usageLimit.unit}`;

//     const validityDisplay = activeMethod.validityPeriod.value === '0' || activeMethod.validityPeriod.value === 0
//       ? 'No Expiry'
//       : `${activeMethod.validityPeriod.value || ''} ${activeMethod.validityPeriod.unit}`;

//     return {
//       dataLimit: dataLimitDisplay,
//       usageLimit: usageLimitDisplay,
//       validity: validityDisplay,
//       downloadSpeed: `${activeMethod.downloadSpeed.value || '0'} ${activeMethod.downloadSpeed.unit}`,
//       uploadSpeed: `${activeMethod.uploadSpeed.value || '0'} ${activeMethod.uploadSpeed.unit}`,
//       maxDevices: activeMethod.maxDevices === 0 ? 'Unlimited' : activeMethod.maxDevices,
//       sessionTimeout: formatTimeDisplay(activeMethod.sessionTimeout),
//       idleTimeout: activeMethod.idleTimeout === 0 ? 'No Timeout' : `${activeMethod.idleTimeout / 60} minutes`,
//       bandwidth: formatBandwidthDisplay(activeMethod.bandwidthLimit),
//       macBinding: activeMethod.macBinding ? 'Enabled' : 'Disabled'
//     };
//   }, [templateForm, templateType]);

//   // Priority level descriptions
//   const getPriorityDescription = (level) => {
//     const descriptions = {
//       1: "Background tasks, lowest priority",
//       2: "Standard browsing, low priority",
//       3: "Normal usage, medium priority",
//       4: "Streaming, high priority",
//       5: "Gaming, very high priority",
//       6: "Critical applications",
//       7: "Premium users",
//       8: "VIP/Administrative"
//     };
//     return descriptions[level] || "Standard priority";
//   };

//   // Tabs configuration
//   const tabs = [
//     { id: "basic", label: "Basic Details", icon: Settings },
//     { id: "configuration", label: `${isHotspot ? "Hotspot" : "PPPoE"} Configuration`, icon: isHotspot ? Wifi : Cable },
//     { id: "advanced", label: "Advanced Settings", icon: Shield },
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
//           <div className="space-y-6">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div>
//                 <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                   Template Name *
//                 </label>
//                 <input
//                   type="text"
//                   value={templateForm.name}
//                   onChange={(e) => onFormChange("name", e.target.value)}
//                   className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                   placeholder="Enter template name"
//                 />
//               </div>
              
//               <div>
//                 <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                   Category
//                 </label>
//                 <EnhancedSelect
//                   value={templateForm.category}
//                   onChange={(value) => onFormChange("category", value)}
//                   options={categories.map(cat => ({ value: cat, label: cat }))}
//                   theme={theme}
//                 />
//               </div>
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 Description
//               </label>
//               <textarea
//                 value={templateForm.description}
//                 onChange={(e) => onFormChange("description", e.target.value)}
//                 rows={3}
//                 className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                 placeholder="Describe this template..."
//               />
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div>
//                 <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                   Base Price (Ksh)
//                 </label>
//                 <input
//                   type="number"
//                   value={templateForm.basePrice}
//                   onChange={(e) => onFormChange("basePrice", e.target.value)}
//                   className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                   placeholder="0.00"
//                   step="0.01"
//                   min="0"
//                 />
//               </div>
              
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                     Public Template
//                   </label>
//                   <div 
//                     onClick={() => onFormChange("isPublic", !templateForm.isPublic)}
//                     className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
//                       templateForm.isPublic 
//                         ? 'bg-indigo-600'
//                         : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//                     }`}
//                   >
//                     <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//                       templateForm.isPublic ? "translate-x-6" : "translate-x-1"
//                     }`} />
//                   </div>
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                     Active Template
//                   </label>
//                   <div 
//                     onClick={() => onFormChange("isActive", !templateForm.isActive)}
//                     className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
//                       templateForm.isActive 
//                         ? 'bg-green-600'
//                         : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//                     }`}
//                   >
//                     <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//                       templateForm.isActive ? "translate-x-6" : "translate-x-1"
//                     }`} />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       case "configuration":
//         const activeMethod = getActiveAccessMethod();
//         return (
//           <div className="space-y-6">
//             {/* Template Type Indicator */}
//             <div className={`p-4 rounded-lg ${
//               isHotspot 
//                 ? (theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200')
//                 : (theme === 'dark' ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200')
//             } border`}>
//               <div className="flex items-center">
//                 {isHotspot ? (
//                   <Wifi className="w-5 h-5 text-blue-600 mr-3" />
//                 ) : (
//                   <Cable className="w-5 h-5 text-green-600 mr-3" />
//                 )}
//                 <div>
//                   <h5 className="font-semibold">
//                     {isHotspot ? "Hotspot Template" : "PPPoE Template"}
//                   </h5>
//                   <p className="text-sm text-gray-600 dark:text-gray-400">
//                     {isHotspot 
//                       ? "Configure wireless hotspot settings" 
//                       : "Configure wired PPPoE connection settings"
//                     }
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Access Method Toggle */}
//             <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
//               <div>
//                 <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                   Enable {isHotspot ? "Hotspot" : "PPPoE"}
//                 </label>
//                 <p className="text-xs text-gray-500 mt-1">
//                   {isHotspot 
//                     ? "Allow wireless access for multiple users" 
//                     : "Enable wired PPPoE connections"
//                   }
//                 </p>
//               </div>
//               <div 
//                 onClick={() => onAccessMethodChange(templateType, "enabled", !activeMethod.enabled)}
//                 className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
//                   activeMethod.enabled 
//                     ? (isHotspot ? 'bg-blue-600' : 'bg-green-600')
//                     : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//                 }`}
//               >
//                 <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//                   activeMethod.enabled ? "translate-x-6" : "translate-x-1"
//                 }`} />
//               </div>
//             </div>

//             {activeMethod.enabled && (
//               <div className="space-y-6">
//                 {/* Speed Configuration */}
//                 <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-blue-900/10' : 'bg-blue-50'}`}>
//                   <h4 className="text-md font-semibold mb-4 text-blue-700 dark:text-blue-300 flex items-center">
//                     <TrendingDown className="w-4 h-4 mr-2" />
//                     Speed & Bandwidth Settings
//                   </h4>
                  
//                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//                     <div>
//                       <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                         Download Speed *
//                       </label>
//                       <div className="flex gap-2">
//                         <input
//                           type="number"
//                           value={activeMethod.downloadSpeed.value}
//                           onChange={(e) => onAccessMethodNestedChange(templateType, "downloadSpeed", "value", e.target.value)}
//                           className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                           placeholder="10"
//                           min="0.01"
//                           step="0.01"
//                         />
//                         {renderUnitDropdown(templateType, "downloadSpeed", activeMethod.downloadSpeed.unit, ["Kbps", "Mbps", "Gbps"])}
//                       </div>
//                     </div>
                    
//                     <div>
//                       <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                         Upload Speed *
//                       </label>
//                       <div className="flex gap-2">
//                         <input
//                           type="number"
//                           value={activeMethod.uploadSpeed.value}
//                           onChange={(e) => onAccessMethodNestedChange(templateType, "uploadSpeed", "value", e.target.value)}
//                           className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                           placeholder="2"
//                           min="0.01"
//                           step="0.01"
//                         />
//                         {renderUnitDropdown(templateType, "uploadSpeed", activeMethod.uploadSpeed.unit, ["Kbps", "Mbps", "Gbps"])}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Bandwidth Limit */}
//                   <div className="mt-4">
//                     <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                       Total Bandwidth Limit
//                     </label>
                    
//                     <div className="mb-3">
//                       <EnhancedSelect
//                         value={bandwidthPreset}
//                         onChange={(value) => handleBandwidthPreset(value, templateType)}
//                         options={bandwidthPresets.map(preset => ({
//                           value: preset.value.toString(),
//                           label: preset.value === 0 ? 'Unlimited - No restrictions' : `${preset.label} - ${preset.description}`
//                         })).concat([
//                           { value: 'custom', label: 'Set custom bandwidth' }
//                         ])}
//                         theme={theme}
//                       />
//                     </div>
                    
//                     {bandwidthPreset === 'custom' && (
//                       <motion.div
//                         initial={{ opacity: 0, height: 0 }}
//                         animate={{ opacity: 1, height: 'auto' }}
//                         className="space-y-3"
//                       >
//                         <div className="flex gap-2 items-center">
//                           <input 
//                             type="number" 
//                             value={getBandwidthDisplayValue(templateType)} 
//                             onChange={(e) => onAccessMethodChange(templateType, "bandwidthLimit", convertToKbps(e.target.value, bandwidthUnit))} 
//                             className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                             min="0" 
//                             step="any" 
//                             placeholder="Enter value (e.g., 5)" 
//                           />
//                           <EnhancedSelect
//                             value={bandwidthUnit}
//                             onChange={setBandwidthUnit}
//                             options={[
//                               { value: 'Mbps', label: 'Mbps' },
//                               { value: 'Kbps', label: 'Kbps' }
//                             ]}
//                             className="text-xs min-w-20"
//                             theme={theme}
//                           />
//                           <span className="text-sm text-gray-500 whitespace-nowrap">
//                             ({formatBandwidthDisplay(activeMethod.bandwidthLimit)})
//                           </span>
//                         </div>
//                       </motion.div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Data & Usage Limits */}
//                 <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-purple-900/10' : 'bg-purple-50'}`}>
//                   <h4 className="text-md font-semibold mb-4 text-purple-700 dark:text-purple-300 flex items-center">
//                     <Box className="w-4 h-4 mr-2" />
//                     Plan Limits & Duration
//                   </h4>
                  
//                   {/* Validity Period */}
//                   <div className="mb-6">
//                     <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                       Plan Duration *
//                     </label>
//                     <div className="mb-2">
//                       <EnhancedSelect
//                         value={validityPreset}
//                         onChange={(value) => handleValidityPreset(value, templateType)}
//                         options={validityPeriodPresets.map(preset => ({ 
//                           value: preset.value, 
//                           label: `${preset.label} - ${preset.description}`
//                         })).concat([
//                           { value: 'custom', label: 'Set custom duration' }
//                         ])}
//                         theme={theme}
//                       />
//                     </div>
//                     {validityPreset === 'custom' && (
//                       <motion.div
//                         initial={{ opacity: 0, height: 0 }}
//                         animate={{ opacity: 1, height: 'auto' }}
//                         className="space-y-2"
//                       >
//                         <div className="flex gap-2">
//                           <input 
//                             value={activeMethod.validityPeriod.value || ""} 
//                             onChange={(e) => onAccessMethodNestedChange(templateType, "validityPeriod", "value", e.target.value)} 
//                             className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                             placeholder="Enter duration value (e.g., 30)" 
//                           />
//                           {renderUnitDropdown(templateType, "validityPeriod", activeMethod.validityPeriod.unit, ['Hours', 'Days', 'Weeks', 'Months'])}
//                         </div>
//                       </motion.div>
//                     )}
//                   </div>

//                   {/* Data Limit */}
//                   <div className="mb-6">
//                     <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                       Total Data Allowance *
//                     </label>
//                     <div className="mb-2">
//                       <EnhancedSelect
//                         value={dataLimitPreset}
//                         onChange={(value) => handleDataLimitPreset(value, templateType)}
//                         options={dataLimitPresets.map(preset => ({ 
//                           value: preset.value, 
//                           label: `${preset.label} - ${preset.description}`
//                         })).concat([
//                           { value: 'custom', label: 'Set custom data amount' }
//                         ])}
//                         theme={theme}
//                       />
//                     </div>
//                     {dataLimitPreset === 'custom' && (
//                       <motion.div
//                         initial={{ opacity: 0, height: 0 }}
//                         animate={{ opacity: 1, height: 'auto' }}
//                         className="space-y-2"
//                       >
//                         <div className="flex gap-2">
//                           <input 
//                             value={activeMethod.dataLimit.value || ""} 
//                             onChange={(e) => onAccessMethodNestedChange(templateType, "dataLimit", "value", e.target.value)} 
//                             disabled={activeMethod.dataLimit.unit === "Unlimited"}
//                             className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input} ${
//                               activeMethod.dataLimit.unit === "Unlimited" ? "opacity-50 cursor-not-allowed" : ""
//                             }`}
//                             placeholder="Enter data amount (e.g., 100)" 
//                           />
//                           <EnhancedSelect
//                             value={activeMethod.dataLimit.unit}
//                             onChange={(newValue) => handleDataLimitChange(templateType, activeMethod.dataLimit.value, newValue)}
//                             options={["MB", "GB", "TB", "Unlimited"].map(unit => ({ value: unit, label: unit }))}
//                             className="w-24"
//                             theme={theme}
//                           />
//                         </div>
//                         {activeMethod.dataLimit.unit === "Unlimited" && (
//                           <motion.div
//                             initial={{ opacity: 0, scale: 0.95 }}
//                             animate={{ opacity: 1, scale: 1 }}
//                             transition={{ duration: 0.2 }}
//                             className={`p-3 rounded-lg flex items-center gap-2 ${theme === 'dark' ? 'bg-blue-800/20' : 'bg-blue-100'}`}
//                           >
//                             <InfinityIcon className="w-4 h-4 text-blue-600 dark:text-blue-300" />
//                             <p className="text-sm text-blue-700 dark:text-blue-300">
//                               Data usage will be unlimited for this plan
//                             </p>
//                           </motion.div>
//                         )}
//                       </motion.div>
//                     )}
//                   </div>

//                   {/* Usage Limit */}
//                   <div>
//                     <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                       Daily Time Limit *
//                     </label>
//                     <div className="mb-2">
//                       <EnhancedSelect
//                         value={usageLimitPreset}
//                         onChange={(value) => handleUsageLimitPreset(value, templateType)}
//                         options={usageLimitPresets.map(preset => ({ 
//                           value: preset.value, 
//                           label: `${preset.label} - ${preset.description}`
//                         })).concat([
//                           { value: 'custom', label: 'Set custom hours' }
//                         ])}
//                         theme={theme}
//                       />
//                     </div>
//                     {usageLimitPreset === 'custom' && (
//                       <motion.div
//                         initial={{ opacity: 0, height: 0 }}
//                         animate={{ opacity: 1, height: 'auto' }}
//                         className="space-y-2"
//                       >
//                         <div className="flex gap-2">
//                           <input 
//                             value={activeMethod.usageLimit.value || ""} 
//                             onChange={(e) => onAccessMethodNestedChange(templateType, "usageLimit", "value", e.target.value)} 
//                             disabled={activeMethod.usageLimit.unit === "Unlimited"}
//                             className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input} ${
//                               activeMethod.usageLimit.unit === "Unlimited" ? "opacity-50 cursor-not-allowed" : ""
//                             }`}
//                             placeholder="Enter hours per day (e.g., 8)" 
//                           />
//                           <EnhancedSelect
//                             value={activeMethod.usageLimit.unit}
//                             onChange={(newValue) => handleUsageLimitChange(templateType, activeMethod.usageLimit.value, newValue)}
//                             options={["Hours", "Unlimited"].map(unit => ({ value: unit, label: unit }))}
//                             className="w-24"
//                             theme={theme}
//                           />
//                         </div>
//                         {activeMethod.usageLimit.unit === "Unlimited" && (
//                           <motion.div
//                             initial={{ opacity: 0, scale: 0.95 }}
//                             animate={{ opacity: 1, scale: 1 }}
//                             transition={{ duration: 0.2 }}
//                             className={`p-3 rounded-lg flex items-center gap-2 ${theme === 'dark' ? 'bg-green-800/20' : 'bg-green-100'}`}
//                           >
//                             <InfinityIcon className="w-4 h-4 text-green-600 dark:text-green-300" />
//                             <p className="text-sm text-green-700 dark:text-green-300">
//                               Usage time will be unlimited for this plan
//                             </p>
//                           </motion.div>
//                         )}
//                       </motion.div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Security & Management Features */}
//                 <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-orange-900/10' : 'bg-orange-50'}`}>
//                   <h4 className="text-md font-semibold mb-4 text-orange-700 dark:text-orange-300 flex items-center">
//                     <Shield className="w-4 h-4 mr-2" />
//                     Security & Device Management
//                   </h4>
                  
//                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//                     {/* Maximum Devices */}
//                     <div>
//                       <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                         Maximum Connected Devices
//                       </label>
//                       <EnhancedSelect
//                         value={activeMethod.maxDevices ?? 1}
//                         onChange={(value) => onAccessMethodChange(templateType, "maxDevices", parseInt(value, 10))}
//                         options={deviceLimitOptions}
//                         placeholder="Select device limit"
//                         theme={theme}
//                       />
//                     </div>

//                     {/* Session Timeout */}
//                     <div>
//                       <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                         Session Timeout
//                       </label>
//                       <EnhancedSelect
//                         value={activeMethod.sessionTimeout}
//                         onChange={(value) => onAccessMethodChange(templateType, "sessionTimeout", parseInt(value, 10))}
//                         options={sessionTimeoutOptions}
//                         theme={theme}
//                       />
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
//                     {/* Idle Timeout */}
//                     <div>
//                       <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                         Idle Timeout
//                       </label>
//                       <EnhancedSelect
//                         value={activeMethod.idleTimeout}
//                         onChange={(value) => onAccessMethodChange(templateType, "idleTimeout", parseInt(value, 10))}
//                         options={idleTimeoutOptions}
//                         theme={theme}
//                       />
//                     </div>

//                     {/* MAC Binding */}
//                     <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
//                       <div>
//                         <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                           Device Lock (MAC Binding)
//                         </label>
//                         <p className="text-xs text-gray-500 mt-1">
//                           Restrict access to specific devices only
//                         </p>
//                       </div>
//                       <div 
//                         onClick={() => onAccessMethodChange(templateType, "macBinding", !activeMethod.macBinding)} 
//                         className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
//                           activeMethod.macBinding 
//                             ? 'bg-green-600'
//                             : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//                         }`}
//                       >
//                         <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//                           activeMethod.macBinding ? "translate-x-6" : "translate-x-1"
//                         }`} />
//                       </div>
//                     </div>
//                   </div>

//                   {/* PPPoE Specific Settings */}
//                   {isPPPoE && (
//                     <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
//                       <div>
//                         <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>IP Pool</label>
//                         <input
//                           type="text"
//                           value={activeMethod.ipPool}
//                           onChange={(e) => onAccessMethodChange(templateType, "ipPool", e.target.value)}
//                           className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                           placeholder="pppoe-pool-1"
//                         />
//                       </div>

//                       <div>
//                         <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>Service Name</label>
//                         <input
//                           type="text"
//                           value={activeMethod.serviceName}
//                           onChange={(e) => onAccessMethodChange(templateType, "serviceName", e.target.value)}
//                           className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                           placeholder="MyPPPoEService"
//                         />
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         );

//       case "advanced":
//         return (
//           <div className="space-y-6">
//             {/* Priority Level */}
//             <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-blue-900/10' : 'bg-blue-50'}`}>
//               <label className={`block text-sm font-medium mb-3 ${themeClasses.text.primary} flex items-center`}>
//                 <TrendingDown className="w-4 h-4 mr-2" />
//                 Network Priority
//               </label>
              
//               <div className="mb-3">
//                 <EnhancedSelect
//                   value={templateForm.priority_level}
//                   onChange={(value) => onFormChange("priority_level", parseInt(value, 10))}
//                   options={priorityOptions.map(opt => ({ 
//                     value: opt.value, 
//                     label: `${opt.label} - Level ${opt.value}`
//                   }))}
//                   theme={theme}
//                 />
//               </div>
              
//               <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-800/20' : 'bg-blue-100'}`}>
//                 <p className="text-sm text-blue-700 dark:text-blue-300">
//                   <strong>Current:</strong> {getPriorityDescription(templateForm.priority_level)}
//                 </p>
//                 <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
//                   Higher priority templates get better network performance during congestion
//                 </p>
//               </div>
//             </div>
            
//             {/* Router Restrictions */}
//             <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-purple-900/10' : 'bg-purple-50'}`}>
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex-1">
//                   <label className={`block text-sm font-medium ${themeClasses.text.primary} flex items-center`}>
//                     <Router className="w-4 h-4 mr-2" />
//                     Router Restrictions
//                   </label>
//                   <p className="text-xs text-gray-500 mt-1">
//                     Limit plans created from this template to specific routers only
//                   </p>
//                 </div>
//                 <div 
//                   onClick={() => onFormChange("router_specific", !templateForm.router_specific)} 
//                   className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
//                     templateForm.router_specific 
//                       ? 'bg-indigo-600'
//                       : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//                   }`}
//                 >
//                   <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//                     templateForm.router_specific ? "translate-x-6" : "translate-x-1"
//                   }`} />
//                 </div>
//               </div>
              
//               {templateForm.router_specific && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: "auto" }}
//                   transition={{ duration: 0.3 }}
//                 >
//                   <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
//                     Note: Router restrictions will apply to all plans created from this template.
//                     You can override this when creating individual plans.
//                   </p>
//                 </motion.div>
//               )}
//             </div>
            
//             {/* Fair Usage Policy */}
//             <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-orange-900/10' : 'bg-orange-50'}`}>
//               <label className={`block text-sm font-medium mb-3 ${themeClasses.text.primary} flex items-center`}>
//                 <Shield className="w-4 h-4 mr-2" />
//                 Fair Usage Policy (FUP)
//               </label>
              
//               <div className="space-y-4">
//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                     FUP Threshold
//                   </label>
//                   <div className="flex items-center space-x-4">
//                     <input 
//                       type="range" 
//                       value={templateForm.FUP_threshold || 80} 
//                       onChange={(e) => onFormChange("FUP_threshold", parseInt(e.target.value, 10) || 80)} 
//                       className="flex-1"
//                       min="0" 
//                       max="100" 
//                       step="1" 
//                     />
//                     <span className="text-sm font-medium min-w-12">
//                       {templateForm.FUP_threshold || 80}%
//                     </span>
//                   </div>
//                   <p className="text-xs text-gray-500 mt-1">
//                     Policy activates after {templateForm.FUP_threshold || 80}% of usage limit is reached
//                   </p>
//                 </div>
                
//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                     Policy Description
//                   </label>
//                   <textarea 
//                     value={templateForm.FUP_policy || ""} 
//                     onChange={(e) => onFormChange("FUP_policy", e.target.value)} 
//                     rows={3}
//                     className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                     placeholder="e.g., Speed will be reduced to 1Mbps after reaching the usage threshold to ensure fair usage for all customers..."
//                   />
//                   <p className="text-xs text-gray-500 mt-1">
//                     Describe what changes when the fair usage threshold is reached
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <div className={`p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center">
//         <Box className="w-5 h-5 mr-3 text-indigo-600" />
//         {viewMode === "create" 
//           ? `Create ${isHotspot ? "Hotspot" : "PPPoE"} Template` 
//           : "Edit Template"
//         }
//       </h3>

//       {/* Tabs */}
//       {renderTabs()}

//       {/* Form Content */}
//       <div className="mt-6 space-y-6">
//         {renderFormContent()}
//       </div>

//       {/* Plan Summary */}
//       {activeTab !== "advanced" && getActiveAccessMethod().enabled && (
//         <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-indigo-900/10' : 'bg-indigo-50'} mt-6`}>
//           <h4 className="text-md font-semibold mb-4 text-indigo-700 dark:text-indigo-300 flex items-center">
//             <Box className="w-4 h-4 mr-2" />
//             Template Summary
//           </h4>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//             <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//               <Box className="w-5 h-5 text-blue-600 mx-auto mb-1" />
//               <div className="text-sm font-semibold">{planSummary.downloadSpeed}</div>
//               <div className="text-xs text-gray-500">Download</div>
//             </div>
//             <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//               <Box className="w-5 h-5 text-green-600 mx-auto mb-1" />
//               <div className="text-sm font-semibold">{planSummary.uploadSpeed}</div>
//               <div className="text-xs text-gray-500">Upload</div>
//             </div>
//             <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//               <Box className="w-5 h-5 text-purple-600 mx-auto mb-1" />
//               <div className="text-sm font-semibold">{planSummary.dataLimit}</div>
//               <div className="text-xs text-gray-500">Data Limit</div>
//             </div>
//             <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//               <Box className="w-5 h-5 text-orange-600 mx-auto mb-1" />
//               <div className="text-sm font-semibold">{planSummary.usageLimit}</div>
//               <div className="text-xs text-gray-500">Usage Limit</div>
//             </div>
//             <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//               <Box className="w-5 h-5 text-teal-600 mx-auto mb-1" />
//               <div className="text-sm font-semibold">{planSummary.maxDevices}</div>
//               <div className="text-xs text-gray-500">Max Devices</div>
//             </div>
//             <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//               <Shield className="w-5 h-5 text-red-600 mx-auto mb-1" />
//               <div className="text-sm font-semibold">{planSummary.macBinding}</div>
//               <div className="text-xs text-gray-500">Device Lock</div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Form Actions */}
//       <div className="flex justify-end space-x-4 pt-6 border-t">
//         <button
//           onClick={onCancel}
//           className={`px-6 py-2 rounded-lg ${themeClasses.button.secondary}`}
//         >
//           Cancel
//         </button>
//         <button
//           onClick={onSubmit}
//           disabled={!templateForm.name.trim() || isLoading}
//           className={`px-6 py-2 rounded-lg flex items-center ${
//             !templateForm.name.trim() || isLoading ? 'bg-gray-400 cursor-not-allowed' : themeClasses.button.success
//           }`}
//         >
//           {isLoading ? (
//             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//           ) : (
//             <Save className="w-4 h-4 mr-2" />
//           )}
//           {viewMode === "create" 
//             ? `Create ${isHotspot ? "Hotspot" : "PPPoE"} Template` 
//             : "Update Template"
//           }
//         </button>
//       </div>
//     </div>
//   );
// };

// export default TemplateForm;






import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Box, Wifi, Cable, Infinity as InfinityIcon, Settings, Router, Shield, TrendingDown } from "lucide-react";
import { getThemeClasses, EnhancedSelect } from "../Shared/components";
import { 
  categories, 
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

const TemplateForm = ({
  templateForm,
  templateType,
  viewMode,
  isLoading,
  onFormChange,
  onAccessMethodChange,
  onAccessMethodNestedChange,
  onCancel,
  onSubmit,
  theme
}) => {
  const themeClasses = getThemeClasses(theme);
  const isHotspot = templateType === "hotspot";
  const isPPPoE = templateType === "pppoe";

  // State for preset selections
  const [dataLimitPreset, setDataLimitPreset] = useState('custom');
  const [usageLimitPreset, setUsageLimitPreset] = useState('custom');
  const [validityPreset, setValidityPreset] = useState('custom');
  const [bandwidthPreset, setBandwidthPreset] = useState('custom');
  const [bandwidthUnit, setBandwidthUnit] = useState('Mbps');
  const [activeTab, setActiveTab] = useState("basic");

  // Enable PPPoE by default on component mount or when templateType changes
  useEffect(() => {
    if (isPPPoE && viewMode === "create") {
      const activeMethod = templateForm.accessMethods[templateType];
      if (!activeMethod.enabled) {
        onAccessMethodChange(templateType, "enabled", true);
      }
    }
  }, [templateType, viewMode, isPPPoE, onAccessMethodChange, templateForm.accessMethods]);

  const renderUnitDropdown = (method, field, value, units) => (
    <EnhancedSelect
      value={value}
      onChange={(newValue) => onAccessMethodNestedChange(method, field, 'unit', newValue)}
      options={units.map(unit => ({ value: unit, label: unit }))}
      className="w-24"
      theme={theme}
    />
  );

  // Handle data limit changes - if unit is "Unlimited", clear the value
  const handleDataLimitChange = (method, value, unit) => {
    if (unit === "Unlimited") {
      onAccessMethodNestedChange(method, "dataLimit", "value", "");
    }
    onAccessMethodNestedChange(method, "dataLimit", "unit", unit);
  };

  // Handle usage limit changes - if unit is "Unlimited", clear the value
  const handleUsageLimitChange = (method, value, unit) => {
    if (unit === "Unlimited") {
      onAccessMethodNestedChange(method, "usageLimit", "value", "");
    }
    onAccessMethodNestedChange(method, "usageLimit", "unit", unit);
  };

  // Handle validity period changes
  const handleValidityChange = (method, value, unit) => {
    if (unit === "Unlimited") {
      onAccessMethodNestedChange(method, "validityPeriod", "value", "");
    }
    onAccessMethodNestedChange(method, "validityPeriod", "unit", unit);
  };

  // Handle preset selections for data limit
  const handleDataLimitPreset = (presetKey, method) => {
    setDataLimitPreset(presetKey);
    if (presetKey !== 'custom') {
      const preset = dataLimitPresets.find(p => p.value === presetKey);
      if (preset) {
        onAccessMethodNestedChange(method, "dataLimit", "value", preset.value);
        onAccessMethodNestedChange(method, "dataLimit", "unit", preset.unit);
      }
    } else {
      // Reset to empty when switching to custom
      onAccessMethodNestedChange(method, "dataLimit", "value", "");
    }
  };

  // Handle preset selections for usage limit
  const handleUsageLimitPreset = (presetKey, method) => {
    setUsageLimitPreset(presetKey);
    if (presetKey !== 'custom') {
      const preset = usageLimitPresets.find(p => p.value === presetKey);
      if (preset) {
        onAccessMethodNestedChange(method, "usageLimit", "value", preset.value);
        onAccessMethodNestedChange(method, "usageLimit", "unit", preset.unit);
      }
    } else {
      // Reset to empty when switching to custom
      onAccessMethodNestedChange(method, "usageLimit", "value", "");
    }
  };

  // Handle validity period presets
  const handleValidityPreset = (presetKey, method) => {
    setValidityPreset(presetKey);
    if (presetKey !== 'custom') {
      const preset = validityPeriodPresets.find(p => p.value === presetKey);
      if (preset) {
        onAccessMethodNestedChange(method, "validityPeriod", "value", preset.value);
        onAccessMethodNestedChange(method, "validityPeriod", "unit", preset.unit);
      }
    } else {
      // Reset to empty when switching to custom
      onAccessMethodNestedChange(method, "validityPeriod", "value", "");
    }
  };

  // Handle bandwidth presets
  const handleBandwidthPreset = (presetKey, method) => {
    setBandwidthPreset(presetKey);
    if (presetKey !== 'custom') {
      const preset = bandwidthPresets.find(p => p.value === parseInt(presetKey));
      if (preset) {
        onAccessMethodChange(method, "bandwidthLimit", preset.value);
      }
    }
  };

  // Function to convert Mbps to Kbps
  const convertToKbps = (value, unit) => {
    if (unit === 'Mbps') {
      return parseFloat(value) * 1000 || 0;
    }
    return parseFloat(value) || 0;
  };

  // Get display value for bandwidth input based on unit
  const getBandwidthDisplayValue = (method) => {
    if (bandwidthUnit === 'Mbps') {
      return (templateForm.accessMethods[method].bandwidthLimit / 1000) || '';
    }
    return templateForm.accessMethods[method].bandwidthLimit || '';
  };

  // Get active access method configuration
  const getActiveAccessMethod = () => {
    return templateForm.accessMethods[templateType];
  };

  // Helper to format time for display
  const formatTimeDisplay = (seconds) => {
    if (seconds === 0) return "No Limit";
    const hours = seconds / 3600;
    if (hours >= 24) {
      const days = hours / 24;
      return days === 1 ? "1 Day" : `${days} Days`;
    }
    return hours === 1 ? "1 Hour" : `${hours} Hours`;
  };

  // Fixed plan summary with proper unlimited handling - REPLACED THIS SECTION
  const planSummary = useMemo(() => {
    const activeMethod = getActiveAccessMethod();
    
    // Fixed: Proper handling for unlimited data and time - same as in PPPoEConfiguration
    const dataLimitDisplay = activeMethod.dataLimit.value === 'Unlimited' 
      ? 'Unlimited - No data Caps' 
      : `${activeMethod.dataLimit.value || '0'} ${activeMethod.dataLimit.unit}`;
    
    const usageLimitDisplay = activeMethod.usageLimit.value === 'Unlimited' 
      ? 'Unlimited - No restrictions' 
      : `${activeMethod.usageLimit.value || '0'} ${activeMethod.usageLimit.unit}`;

    const validityDisplay = activeMethod.validityPeriod.value === '0' || activeMethod.validityPeriod.value === 0
      ? 'No Expiry'
      : `${activeMethod.validityPeriod.value || ''} ${activeMethod.validityPeriod.unit}`;

    // Fixed: Proper handling for unlimited devices - same as in PPPoEConfiguration
    const maxDevicesValue = Number.isNaN(activeMethod.maxDevices) || activeMethod.maxDevices === undefined ? 0 : activeMethod.maxDevices;

    return {
      dataLimit: dataLimitDisplay,
      usageLimit: usageLimitDisplay,
      validity: validityDisplay,
      downloadSpeed: `${activeMethod.downloadSpeed.value || '0'} ${activeMethod.downloadSpeed.unit}`,
      uploadSpeed: `${activeMethod.uploadSpeed.value || '0'} ${activeMethod.uploadSpeed.unit}`,
      // Fixed: Use the properly calculated maxDevices value
      maxDevices: maxDevicesValue === 0 ? 'Unlimited' : maxDevicesValue,
      sessionTimeout: formatTimeDisplay(activeMethod.sessionTimeout),
      idleTimeout: activeMethod.idleTimeout === 0 ? 'No Timeout' : `${activeMethod.idleTimeout / 60} minutes`,
      bandwidth: formatBandwidthDisplay(activeMethod.bandwidthLimit),
      macBinding: activeMethod.macBinding ? 'Enabled' : 'Disabled'
    };
  }, [templateForm, templateType]);

  // Priority level descriptions
  const getPriorityDescription = (level) => {
    const descriptions = {
      1: "Background tasks, lowest priority",
      2: "Standard browsing, low priority",
      3: "Normal usage, medium priority",
      4: "Streaming, high priority",
      5: "Gaming, very high priority",
      6: "Critical applications",
      7: "Premium users",
      8: "VIP/Administrative"
    };
    return descriptions[level] || "Standard priority";
  };

  // Tabs configuration
  const tabs = [
    { id: "basic", label: "Basic Details", icon: Settings },
    { id: "configuration", label: `${isHotspot ? "Hotspot" : "PPPoE"} Configuration`, icon: isHotspot ? Wifi : Cable },
    { id: "advanced", label: "Advanced Settings", icon: Shield },
  ];

  // Render tabs
  const renderTabs = () => (
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

  // Render form content based on active tab
  const renderFormContent = () => {
    switch (activeTab) {
      case "basic":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  Template Name *
                </label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => onFormChange("name", e.target.value)}
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
                  onChange={(value) => onFormChange("category", value)}
                  options={categories.map(cat => ({ value: cat, label: cat }))}
                  theme={theme}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                Description
              </label>
              <textarea
                value={templateForm.description}
                onChange={(e) => onFormChange("description", e.target.value)}
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
                  onChange={(e) => onFormChange("basePrice", e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                    Public Template
                  </label>
                  <div 
                    onClick={() => onFormChange("isPublic", !templateForm.isPublic)}
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

                <div className="flex items-center justify-between">
                  <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                    Active Template
                  </label>
                  <div 
                    onClick={() => onFormChange("isActive", !templateForm.isActive)}
                    className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                      templateForm.isActive 
                        ? 'bg-green-600'
                        : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                      templateForm.isActive ? "translate-x-6" : "translate-x-1"
                    }`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "configuration":
        const activeMethod = getActiveAccessMethod();
        return (
          <div className="space-y-6">
            {/* Template Type Indicator */}
            <div className={`p-4 rounded-lg ${
              isHotspot 
                ? (theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200')
                : (theme === 'dark' ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200')
            } border`}>
              <div className="flex items-center">
                {isHotspot ? (
                  <Wifi className="w-5 h-5 text-blue-600 mr-3" />
                ) : (
                  <Cable className="w-5 h-5 text-green-600 mr-3" />
                )}
                <div>
                  <h5 className="font-semibold">
                    {isHotspot ? "Hotspot Template" : "PPPoE Template"}
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isHotspot 
                      ? "Configure wireless hotspot settings" 
                      : "Configure wired PPPoE connection settings"
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Access Method Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                  Enable {isHotspot ? "Hotspot" : "PPPoE"}
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  {isHotspot 
                    ? "Allow wireless access for multiple users" 
                    : "Enable wired PPPoE connections"
                  }
                </p>
              </div>
              <div 
                onClick={() => onAccessMethodChange(templateType, "enabled", !activeMethod.enabled)}
                className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                  activeMethod.enabled 
                    ? (isHotspot ? 'bg-blue-600' : 'bg-green-600')
                    : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                  activeMethod.enabled ? "translate-x-6" : "translate-x-1"
                }`} />
              </div>
            </div>

            {activeMethod.enabled && (
              <div className="space-y-6">
                {/* Speed Configuration */}
                <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-blue-900/10' : 'bg-blue-50'}`}>
                  <h4 className="text-md font-semibold mb-4 text-blue-700 dark:text-blue-300 flex items-center">
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Speed & Bandwidth Settings
                  </h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                        Download Speed *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={activeMethod.downloadSpeed.value}
                          onChange={(e) => onAccessMethodNestedChange(templateType, "downloadSpeed", "value", e.target.value)}
                          className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                          placeholder="10"
                          min="0.01"
                          step="0.01"
                        />
                        {renderUnitDropdown(templateType, "downloadSpeed", activeMethod.downloadSpeed.unit, ["Kbps", "Mbps", "Gbps"])}
                      </div>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                        Upload Speed *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={activeMethod.uploadSpeed.value}
                          onChange={(e) => onAccessMethodNestedChange(templateType, "uploadSpeed", "value", e.target.value)}
                          className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                          placeholder="2"
                          min="0.01"
                          step="0.01"
                        />
                        {renderUnitDropdown(templateType, "uploadSpeed", activeMethod.uploadSpeed.unit, ["Kbps", "Mbps", "Gbps"])}
                      </div>
                    </div>
                  </div>

                  {/* Bandwidth Limit */}
                  <div className="mt-4">
                    <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                      Total Bandwidth Limit
                    </label>
                    
                    <div className="mb-3">
                      <EnhancedSelect
                        value={bandwidthPreset}
                        onChange={(value) => handleBandwidthPreset(value, templateType)}
                        options={bandwidthPresets.map(preset => ({
                          value: preset.value.toString(),
                          label: preset.value === 0 ? 'Unlimited - No restrictions' : `${preset.label} - ${preset.description}`
                        })).concat([
                          { value: 'custom', label: 'Set custom bandwidth' }
                        ])}
                        theme={theme}
                      />
                    </div>
                    
                    {bandwidthPreset === 'custom' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-3"
                      >
                        <div className="flex gap-2 items-center">
                          <input 
                            type="number" 
                            value={getBandwidthDisplayValue(templateType)} 
                            onChange={(e) => onAccessMethodChange(templateType, "bandwidthLimit", convertToKbps(e.target.value, bandwidthUnit))} 
                            className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                            min="0" 
                            step="any" 
                            placeholder="Enter value (e.g., 5)" 
                          />
                          <EnhancedSelect
                            value={bandwidthUnit}
                            onChange={setBandwidthUnit}
                            options={[
                              { value: 'Mbps', label: 'Mbps' },
                              { value: 'Kbps', label: 'Kbps' }
                            ]}
                            className="text-xs min-w-20"
                            theme={theme}
                          />
                          <span className="text-sm text-gray-500 whitespace-nowrap">
                            ({formatBandwidthDisplay(activeMethod.bandwidthLimit)})
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Data & Usage Limits */}
                <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-purple-900/10' : 'bg-purple-50'}`}>
                  <h4 className="text-md font-semibold mb-4 text-purple-700 dark:text-purple-300 flex items-center">
                    <Box className="w-4 h-4 mr-2" />
                    Plan Limits & Duration
                  </h4>
                  
                  {/* Validity Period */}
                  <div className="mb-6">
                    <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                      Plan Duration *
                    </label>
                    <div className="mb-2">
                      <EnhancedSelect
                        value={validityPreset}
                        onChange={(value) => handleValidityPreset(value, templateType)}
                        options={validityPeriodPresets.map(preset => ({ 
                          value: preset.value, 
                          label: `${preset.label} - ${preset.description}`
                        })).concat([
                          { value: 'custom', label: 'Set custom duration' }
                        ])}
                        theme={theme}
                      />
                    </div>
                    {validityPreset === 'custom' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                      >
                        <div className="flex gap-2">
                          <input 
                            value={activeMethod.validityPeriod.value || ""} 
                            onChange={(e) => onAccessMethodNestedChange(templateType, "validityPeriod", "value", e.target.value)} 
                            className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                            placeholder="Enter duration value (e.g., 30)" 
                          />
                          {renderUnitDropdown(templateType, "validityPeriod", activeMethod.validityPeriod.unit, ['Hours', 'Days', 'Weeks', 'Months'])}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Data Limit */}
                  <div className="mb-6">
                    <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                      Total Data Allowance *
                    </label>
                    <div className="mb-2">
                      <EnhancedSelect
                        value={dataLimitPreset}
                        onChange={(value) => handleDataLimitPreset(value, templateType)}
                        options={dataLimitPresets.map(preset => ({ 
                          value: preset.value, 
                          label: `${preset.label} - ${preset.description}`
                        })).concat([
                          { value: 'custom', label: 'Set custom data amount' }
                        ])}
                        theme={theme}
                      />
                    </div>
                    {dataLimitPreset === 'custom' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                      >
                        <div className="flex gap-2">
                          <input 
                            value={activeMethod.dataLimit.value || ""} 
                            onChange={(e) => onAccessMethodNestedChange(templateType, "dataLimit", "value", e.target.value)} 
                            disabled={activeMethod.dataLimit.unit === "Unlimited"}
                            className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input} ${
                              activeMethod.dataLimit.unit === "Unlimited" ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            placeholder="Enter data amount (e.g., 100)" 
                          />
                          <EnhancedSelect
                            value={activeMethod.dataLimit.unit}
                            onChange={(newValue) => handleDataLimitChange(templateType, activeMethod.dataLimit.value, newValue)}
                            options={["MB", "GB", "TB", "Unlimited"].map(unit => ({ value: unit, label: unit }))}
                            className="w-24"
                            theme={theme}
                          />
                        </div>
                        {activeMethod.dataLimit.unit === "Unlimited" && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className={`p-3 rounded-lg flex items-center gap-2 ${theme === 'dark' ? 'bg-blue-800/20' : 'bg-blue-100'}`}
                          >
                            <InfinityIcon className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              Data usage will be unlimited for this plan
                            </p>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* Usage Limit */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                      Daily Time Limit *
                    </label>
                    <div className="mb-2">
                      <EnhancedSelect
                        value={usageLimitPreset}
                        onChange={(value) => handleUsageLimitPreset(value, templateType)}
                        options={usageLimitPresets.map(preset => ({ 
                          value: preset.value, 
                          label: `${preset.label} - ${preset.description}`
                        })).concat([
                          { value: 'custom', label: 'Set custom hours' }
                        ])}
                        theme={theme}
                      />
                    </div>
                    {usageLimitPreset === 'custom' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                      >
                        <div className="flex gap-2">
                          <input 
                            value={activeMethod.usageLimit.value || ""} 
                            onChange={(e) => onAccessMethodNestedChange(templateType, "usageLimit", "value", e.target.value)} 
                            disabled={activeMethod.usageLimit.unit === "Unlimited"}
                            className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input} ${
                              activeMethod.usageLimit.unit === "Unlimited" ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            placeholder="Enter hours per day (e.g., 8)" 
                          />
                          <EnhancedSelect
                            value={activeMethod.usageLimit.unit}
                            onChange={(newValue) => handleUsageLimitChange(templateType, activeMethod.usageLimit.value, newValue)}
                            options={["Hours", "Unlimited"].map(unit => ({ value: unit, label: unit }))}
                            className="w-24"
                            theme={theme}
                          />
                        </div>
                        {activeMethod.usageLimit.unit === "Unlimited" && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className={`p-3 rounded-lg flex items-center gap-2 ${theme === 'dark' ? 'bg-green-800/20' : 'bg-green-100'}`}
                          >
                            <InfinityIcon className="w-4 h-4 text-green-600 dark:text-green-300" />
                            <p className="text-sm text-green-700 dark:text-green-300">
                              Usage time will be unlimited for this plan
                            </p>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Security & Management Features */}
                <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-orange-900/10' : 'bg-orange-50'}`}>
                  <h4 className="text-md font-semibold mb-4 text-orange-700 dark:text-orange-300 flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Security & Device Management
                  </h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Maximum Devices - FIXED: Added proper NaN handling */}
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                        Maximum Connected Devices
                      </label>
                      <EnhancedSelect
                        value={activeMethod.maxDevices ?? 0}
                        onChange={(value) => onAccessMethodChange(templateType, "maxDevices", Number.isNaN(parseInt(value, 10)) ? 0 : parseInt(value, 10))}
                        options={deviceLimitOptions}
                        placeholder="Select device limit"
                        theme={theme}
                      />
                    </div>

                    {/* Session Timeout */}
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                        Session Timeout
                      </label>
                      <EnhancedSelect
                        value={activeMethod.sessionTimeout}
                        onChange={(value) => onAccessMethodChange(templateType, "sessionTimeout", parseInt(value, 10))}
                        options={sessionTimeoutOptions}
                        theme={theme}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                    {/* Idle Timeout */}
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                        Idle Timeout
                      </label>
                      <EnhancedSelect
                        value={activeMethod.idleTimeout}
                        onChange={(value) => onAccessMethodChange(templateType, "idleTimeout", parseInt(value, 10))}
                        options={idleTimeoutOptions}
                        theme={theme}
                      />
                    </div>

                    {/* MAC Binding */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                          Device Lock (MAC Binding)
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Restrict access to specific devices only
                        </p>
                      </div>
                      <div 
                        onClick={() => onAccessMethodChange(templateType, "macBinding", !activeMethod.macBinding)} 
                        className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                          activeMethod.macBinding 
                            ? 'bg-green-600'
                            : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                          activeMethod.macBinding ? "translate-x-6" : "translate-x-1"
                        }`} />
                      </div>
                    </div>
                  </div>

                  {/* PPPoE Specific Settings */}
                  {isPPPoE && (
                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>IP Pool</label>
                        <input
                          type="text"
                          value={activeMethod.ipPool}
                          onChange={(e) => onAccessMethodChange(templateType, "ipPool", e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                          placeholder="pppoe-pool-1"
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>Service Name</label>
                        <input
                          type="text"
                          value={activeMethod.serviceName}
                          onChange={(e) => onAccessMethodChange(templateType, "serviceName", e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                          placeholder="MyPPPoEService"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case "advanced":
        return (
          <div className="space-y-6">
            {/* Priority Level */}
            <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-blue-900/10' : 'bg-blue-50'}`}>
              <label className={`block text-sm font-medium mb-3 ${themeClasses.text.primary} flex items-center`}>
                <TrendingDown className="w-4 h-4 mr-2" />
                Network Priority
              </label>
              
              <div className="mb-3">
                <EnhancedSelect
                  value={templateForm.priority_level}
                  onChange={(value) => onFormChange("priority_level", parseInt(value, 10))}
                  options={priorityOptions.map(opt => ({ 
                    value: opt.value, 
                    label: `${opt.label} - Level ${opt.value}`
                  }))}
                  theme={theme}
                />
              </div>
              
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-800/20' : 'bg-blue-100'}`}>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Current:</strong> {getPriorityDescription(templateForm.priority_level)}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Higher priority templates get better network performance during congestion
                </p>
              </div>
            </div>
            
            {/* Router Restrictions */}
            <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-purple-900/10' : 'bg-purple-50'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <label className={`block text-sm font-medium ${themeClasses.text.primary} flex items-center`}>
                    <Router className="w-4 h-4 mr-2" />
                    Router Restrictions
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Limit plans created from this template to specific routers only
                  </p>
                </div>
                <div 
                  onClick={() => onFormChange("router_specific", !templateForm.router_specific)} 
                  className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                    templateForm.router_specific 
                      ? 'bg-indigo-600'
                      : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                  }`}
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
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Note: Router restrictions will apply to all plans created from this template.
                    You can override this when creating individual plans.
                  </p>
                </motion.div>
              )}
            </div>
            
            {/* Fair Usage Policy */}
            <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-orange-900/10' : 'bg-orange-50'}`}>
              <label className={`block text-sm font-medium mb-3 ${themeClasses.text.primary} flex items-center`}>
                <Shield className="w-4 h-4 mr-2" />
                Fair Usage Policy (FUP)
              </label>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                    FUP Threshold
                  </label>
                  <div className="flex items-center space-x-4">
                    <input 
                      type="range" 
                      value={templateForm.FUP_threshold || 80} 
                      onChange={(e) => onFormChange("FUP_threshold", parseInt(e.target.value, 10) || 80)} 
                      className="flex-1"
                      min="0" 
                      max="100" 
                      step="1" 
                    />
                    <span className="text-sm font-medium min-w-12">
                      {templateForm.FUP_threshold || 80}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Policy activates after {templateForm.FUP_threshold || 80}% of usage limit is reached
                  </p>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                    Policy Description
                  </label>
                  <textarea 
                    value={templateForm.FUP_policy || ""} 
                    onChange={(e) => onFormChange("FUP_policy", e.target.value)} 
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
        );

      default:
        return null;
    }
  };

  return (
    <div className={`p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center">
        <Box className="w-5 h-5 mr-3 text-indigo-600" />
        {viewMode === "create" 
          ? `Create ${isHotspot ? "Hotspot" : "PPPoE"} Template` 
          : "Edit Template"
        }
      </h3>

      {/* Tabs */}
      {renderTabs()}

      {/* Form Content */}
      <div className="mt-6 space-y-6">
        {renderFormContent()}
      </div>

      {/* Plan Summary - UPDATED: Fixed unlimited devices display */}
      {activeTab !== "advanced" && getActiveAccessMethod().enabled && (
        <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-indigo-900/10' : 'bg-indigo-50'} mt-6`}>
          <h4 className="text-md font-semibold mb-4 text-indigo-700 dark:text-indigo-300 flex items-center">
            <Box className="w-4 h-4 mr-2" />
            Template Summary
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <Box className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="text-sm font-semibold">{planSummary.downloadSpeed}</div>
              <div className="text-xs text-gray-500">Download</div>
            </div>
            <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <Box className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <div className="text-sm font-semibold">{planSummary.uploadSpeed}</div>
              <div className="text-xs text-gray-500">Upload</div>
            </div>
            <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <Box className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <div className="text-sm font-semibold">{planSummary.dataLimit}</div>
              <div className="text-xs text-gray-500">Data Limit</div>
            </div>
            <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <Box className="w-5 h-5 text-orange-600 mx-auto mb-1" />
              <div className="text-sm font-semibold">{planSummary.usageLimit}</div>
              <div className="text-xs text-gray-500">Usage Limit</div>
            </div>
            {/* Fixed: Proper unlimited devices display with Infinity icon */}
            <div className={`text-center p-3 rounded-lg flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <Box className="w-5 h-5 text-teal-600 mx-auto mb-1" />
              <div className="text-sm font-semibold flex items-center gap-1">
                {planSummary.maxDevices === 'Unlimited' && <InfinityIcon className="w-4 h-4" />}
                {planSummary.maxDevices}
              </div>
              <div className="text-xs text-gray-500">Max Devices</div>
            </div>
            <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <Shield className="w-5 h-5 text-red-600 mx-auto mb-1" />
              <div className="text-sm font-semibold">{planSummary.macBinding}</div>
              <div className="text-xs text-gray-500">Device Lock</div>
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          onClick={onCancel}
          className={`px-6 py-2 rounded-lg ${themeClasses.button.secondary}`}
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
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
          {viewMode === "create" 
            ? `Create ${isHotspot ? "Hotspot" : "PPPoE"} Template` 
            : "Update Template"
          }
        </button>
      </div>
    </div>
  );
};

export default TemplateForm;