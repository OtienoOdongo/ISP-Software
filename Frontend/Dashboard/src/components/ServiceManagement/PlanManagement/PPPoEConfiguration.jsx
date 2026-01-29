



// import React, { useState, useMemo, useEffect } from "react";
// import { motion } from "framer-motion";
// import { EnhancedSelect, getThemeClasses } from "../Shared/components"
// import { 
//   speedUnits, 
//   dataLimitPresets,
//   usageLimitPresets,
//   validityPeriodPresets,
//   deviceLimitOptions,
//   sessionTimeoutOptions,
//   idleTimeoutOptions,
//   bandwidthPresets
// } from "../Shared/constant"
// import { Users, Clock, Shield, Calendar, Cable, Network, Database, Zap, Gauge, Smartphone, Globe, Infinity as InfinityIcon } from "lucide-react";

// const PPPoEConfiguration = ({ form, errors, onChange, onNestedChange, theme }) => {
//   const themeClasses = getThemeClasses(theme);
//   const pppoe = form.accessMethods.pppoe;

//   // State for preset selections
//   const [dataLimitPreset, setDataLimitPreset] = useState('custom');
//   const [usageLimitPreset, setUsageLimitPreset] = useState('custom');
//   const [validityPreset, setValidityPreset] = useState('custom');
//   const [bandwidthPreset, setBandwidthPreset] = useState('custom');
//   const [bandwidthUnit, setBandwidthUnit] = useState('Mbps');

//   // Reset validity period when component mounts to remove 720 hours default
//   useEffect(() => {
//     if (pppoe.validityPeriod.value === 720 && pppoe.validityPeriod.unit === 'Hours') {
//       onNestedChange('pppoe', 'validityPeriod', 'value', '');
//     }
//   }, []);

//   const handleToggle = () => {
//     onChange('pppoe', 'enabled', !pppoe.enabled);
//   };

//   const renderUnitDropdown = (field, value, onChange, units) => (
//     <EnhancedSelect
//       value={value}
//       onChange={(newValue) => onChange('pppoe', field, 'unit', newValue)}
//       options={units.map(unit => ({ value: unit, label: unit }))}
//       className="text-xs min-w-20"
//       theme={theme}
//     />
//   );

//   // Handle preset selections
//   const handleDataLimitPreset = (presetKey) => {
//     setDataLimitPreset(presetKey);
//     if (presetKey !== 'custom') {
//       const preset = dataLimitPresets.find(p => p.value === presetKey);
//       if (preset) {
//         onNestedChange('pppoe', 'dataLimit', 'value', preset.value);
//         onNestedChange('pppoe', 'dataLimit', 'unit', preset.unit);
//       }
//     } else {
//       // Reset to empty when switching to custom
//       onNestedChange('pppoe', 'dataLimit', 'value', '');
//     }
//   };

//   const handleUsageLimitPreset = (presetKey) => {
//     setUsageLimitPreset(presetKey);
//     if (presetKey !== 'custom') {
//       const preset = usageLimitPresets.find(p => p.value === presetKey);
//       if (preset) {
//         onNestedChange('pppoe', 'usageLimit', 'value', preset.value);
//         onNestedChange('pppoe', 'usageLimit', 'unit', preset.unit);
//       }
//     } else {
//       // Reset to empty when switching to custom
//       onNestedChange('pppoe', 'usageLimit', 'value', '');
//     }
//   };

//   const handleValidityPreset = (presetKey) => {
//     setValidityPreset(presetKey);
//     if (presetKey !== 'custom') {
//       const preset = validityPeriodPresets.find(p => p.value === presetKey);
//       if (preset) {
//         onNestedChange('pppoe', 'validityPeriod', 'value', preset.value);
//         onNestedChange('pppoe', 'validityPeriod', 'unit', preset.unit);
//       }
//     } else {
//       // Reset to empty when switching to custom
//       onNestedChange('pppoe', 'validityPeriod', 'value', '');
//     }
//   };

//   const handleBandwidthPreset = (presetKey) => {
//     setBandwidthPreset(presetKey);
//     if (presetKey !== 'custom') {
//       const preset = bandwidthPresets.find(p => p.value === parseInt(presetKey));
//       if (preset) {
//         onChange('pppoe', 'bandwidthLimit', preset.value);
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

//   // Format bandwidth for display
//   const formatBandwidthDisplay = (kbps) => {
//     if (kbps === 0) return "Unlimited";
//     if (kbps >= 1000) {
//       const mbps = kbps / 1000;
//       return `${mbps} Mbps`;
//     }
//     return `${kbps} Kbps`;
//   };

//   // Get display value for bandwidth input based on unit
//   const getBandwidthDisplayValue = () => {
//     if (bandwidthUnit === 'Mbps') {
//       return (pppoe.bandwidthLimit / 1000) || '';
//     }
//     return pppoe.bandwidthLimit || '';
//   };

//   // Auto-suggest MTU based on common scenarios
//   const getSuggestedMTU = (downloadSpeed) => {
//     const speed = parseFloat(downloadSpeed) || 0;
//     if (speed >= 100) return 1500; // High-speed connections
//     if (speed >= 50) return 1492; // Standard PPPoE
//     return 1480; // Lower speed connections
//   };

//   // Auto-suggest DNS servers based on user type
//   const getSuggestedDNS = () => {
//     return ["8.8.8.8", "1.1.1.1"]; // Google + Cloudflare
//   };

//   // Fixed plan summary with proper unlimited handling
//   const planSummary = useMemo(() => {
//     const maxDevicesValue = Number.isNaN(pppoe.maxDevices) || pppoe.maxDevices === undefined ? 0 : pppoe.maxDevices;
    
//     // Fixed: Proper handling for unlimited data and time
//     const dataLimitDisplay = pppoe.dataLimit.value === 'Unlimited' 
//       ? 'Unlimited - No data Caps' 
//       : `${pppoe.dataLimit.value || '0'} ${pppoe.dataLimit.unit}`;
    
//     const usageLimitDisplay = pppoe.usageLimit.value === 'Unlimited' 
//       ? 'Unlimited - No restrictions' 
//       : `${pppoe.usageLimit.value || '0'} ${pppoe.usageLimit.unit}`;

//     const validityDisplay = pppoe.validityPeriod.value === '0' || pppoe.validityPeriod.value === 0
//       ? 'No Expiry'
//       : `${pppoe.validityPeriod.value || ''} ${pppoe.validityPeriod.unit}`;

//     return {
//       dataLimit: dataLimitDisplay,
//       usageLimit: usageLimitDisplay,
//       validity: validityDisplay,
//       maxDevices: maxDevicesValue === 0 ? 'Unlimited' : `${maxDevicesValue} device${maxDevicesValue > 1 ? 's' : ''}`,
//       sessionTimeout: formatTimeDisplay(pppoe.sessionTimeout),
//       idleTimeout: pppoe.idleTimeout === 0 ? 'No Timeout' : `${pppoe.idleTimeout / 60} minutes`,
//       bandwidth: formatBandwidthDisplay(pppoe.bandwidthLimit),
//       ipPool: pppoe.ipPool || 'Default Pool',
//       mtu: pppoe.mtu || 1492
//     };
//   }, [pppoe]);

//   return (
//     <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-lg lg:text-xl font-semibold flex items-center">
//           <Cable className="w-5 h-5 mr-2 text-green-600" />
//           PPPoE Configuration
//         </h3>
//         <div className="flex items-center">
//           <label className={`block text-sm font-medium mr-4 ${themeClasses.text.primary}`}>
//             Enable PPPoE
//           </label>
//           <div 
//             onClick={handleToggle}
//             className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
//               pppoe.enabled 
//                 ? 'bg-green-600'
//                 : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//             }`}
//           >
//             <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//               pppoe.enabled ? "translate-x-6" : "translate-x-1"
//             }`} />
//           </div>
//         </div>
//       </div>

//       {pppoe.enabled && (
//         <div className="space-y-6 lg:space-y-8">
//           {/* Speed Configuration */}
//           <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-green-900/10' : 'bg-green-50'}`}>
//             <h4 className="text-md font-semibold mb-4 text-green-700 dark:text-green-300 flex items-center">
//               <Zap className="w-4 h-4 mr-2" />
//               Speed & Bandwidth Settings
//             </h4>
            
//             <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
//               {/* Download Speed */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   Download Speed <span className="text-red-500">*</span>
//                 </label>
//                 <div className="flex gap-2">
//                   <input 
//                     type="number" 
//                     value={pppoe.downloadSpeed.value || ""} 
//                     onChange={(e) => {
//                       onNestedChange('pppoe', 'downloadSpeed', 'value', e.target.value);
//                       // Auto-suggest MTU when download speed changes
//                       if (!pppoe.mtu) {
//                         onChange('pppoe', 'mtu', getSuggestedMTU(e.target.value));
//                       }
//                     }} 
//                     className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                     min="0.01" 
//                     step="0.01" 
//                     placeholder="e.g., 15" 
//                     required 
//                   />
//                   {renderUnitDropdown('downloadSpeed', pppoe.downloadSpeed.unit, onNestedChange, speedUnits)}
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">Maximum download speed for connection</p>
//                 {errors.pppoe_downloadSpeed && <p className="text-red-500 text-xs mt-1">{errors.pppoe_downloadSpeed}</p>}
//               </div>
              
//               {/* Upload Speed */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   Upload Speed <span className="text-red-500">*</span>
//                 </label>
//                 <div className="flex gap-2">
//                   <input 
//                     type="number" 
//                     value={pppoe.uploadSpeed.value || ""} 
//                     onChange={(e) => onNestedChange('pppoe', 'uploadSpeed', 'value', e.target.value)} 
//                     className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                     min="0.01" 
//                     step="0.01" 
//                     placeholder="e.g., 3" 
//                     required 
//                   />
//                   {renderUnitDropdown('uploadSpeed', pppoe.uploadSpeed.unit, onNestedChange, speedUnits)}
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">Maximum upload speed for connection</p>
//                 {errors.pppoe_uploadSpeed && <p className="text-red-500 text-xs mt-1">{errors.pppoe_uploadSpeed}</p>}
//               </div>
//             </div>

//             {/* Bandwidth Limit */}
//             <div className="mt-6">
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 <Gauge className="w-4 h-4 inline mr-1" />
//                 Total Bandwidth Limit
//                 <span className="text-xs text-gray-500 ml-2">- Shared bandwidth for this connection</span>
//               </label>
              
//               <div className="mb-3">
//                 <EnhancedSelect
//                   value={bandwidthPreset}
//                   onChange={handleBandwidthPreset}
//                   options={bandwidthPresets.map(preset => ({
//                     value: preset.value.toString(),
//                     label: preset.value === 0 ? 'Unlimited - No restrictions' : `${preset.label} - ${preset.description}`
//                   })).concat([
//                     { value: 'custom', label: 'Set custom bandwidth' }
//                   ])}
//                   theme={theme}
//                 />
//               </div>
              
//               {bandwidthPreset === 'custom' && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   className="space-y-3"
//                 >
//                   <div className="flex gap-2 items-center">
//                     <input 
//                       type="number" 
//                       value={getBandwidthDisplayValue()} 
//                       onChange={(e) => onChange('pppoe', 'bandwidthLimit', convertToKbps(e.target.value, bandwidthUnit))} 
//                       className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                       min="0" 
//                       step="any" 
//                       placeholder="Enter value (e.g., 5)" 
//                     />
//                     <EnhancedSelect
//                       value={bandwidthUnit}
//                       onChange={setBandwidthUnit}
//                       options={[
//                         { value: 'Mbps', label: 'Mbps' },
//                         { value: 'Kbps', label: 'Kbps' }
//                       ]}
//                       className="text-xs min-w-20"
//                       theme={theme}
//                     />
//                     <span className="text-sm text-gray-500 whitespace-nowrap">
//                       ({formatBandwidthDisplay(pppoe.bandwidthLimit)})
//                     </span>
//                   </div>
//                   <p className="text-xs text-gray-500">
//                     Enter bandwidth and select unit. Automatically converts to Kbps internally.
//                   </p>
//                 </motion.div>
//               )}
              
//               {bandwidthPreset !== 'custom' && (
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.95 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ duration: 0.2 }}
//                   className={`p-3 rounded-lg flex items-center gap-2 ${theme === 'dark' ? 'bg-green-800/20' : 'bg-green-100'}`}
//                 >
//                   {pppoe.bandwidthLimit === 0 && <InfinityIcon className="w-4 h-4 text-green-600 dark:text-green-300" />}
//                   <p className="text-sm text-green-700 dark:text-green-300">
//                     <strong>Selected:</strong> {formatBandwidthDisplay(pppoe.bandwidthLimit)}
//                   </p>
//                 </motion.div>
//               )}
//             </div>
//           </div>

//           {/* Data & Usage Limits */}
//           <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-purple-900/10' : 'bg-purple-50'}`}>
//             <h4 className="text-md font-semibold mb-4 text-purple-700 dark:text-purple-300 flex items-center">
//               <Database className="w-4 h-4 mr-2" />
//               Plan Limits & Duration
//             </h4>
            
//             {/* Validity Period */}
//             <div className="mb-6">
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 <Calendar className="w-4 h-4 inline mr-1" />
//                 Plan Duration <span className="text-red-500">*</span>
//               </label>
//               <div className="mb-2">
//                 <EnhancedSelect
//                   value={validityPreset}
//                   onChange={handleValidityPreset}
//                   options={validityPeriodPresets.map(preset => ({ 
//                     value: preset.value, 
//                     label: `${preset.label} - ${preset.description}`
//                   })).concat([
//                     { value: 'custom', label: 'Set custom duration' }
//                   ])}
//                   theme={theme}
//                 />
//               </div>
//               {validityPreset === 'custom' && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   className="space-y-2"
//                 >
//                   <div className="flex gap-2">
//                     <input 
//                       value={pppoe.validityPeriod.value || ""} 
//                       onChange={(e) => onNestedChange('pppoe', 'validityPeriod', 'value', e.target.value)} 
//                       className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                       placeholder="Enter duration value (e.g., 30)" 
//                       required 
//                     />
//                     {renderUnitDropdown('validityPeriod', pppoe.validityPeriod.unit, onNestedChange, ['Hours', 'Days', 'Weeks', 'Months'])}
//                   </div>
//                   <p className="text-xs text-gray-500">
//                     Set the custom duration for this plan
//                   </p>
//                 </motion.div>
//               )}
//               <p className="text-xs text-gray-500 mt-1">How long the plan remains active after activation</p>
//             </div>

//             {/* Data Limit */}
//             <div className="mb-6">
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 Total Data Allowance <span className="text-red-500">*</span>
//               </label>
//               <div className="mb-2">
//                 <EnhancedSelect
//                   value={dataLimitPreset}
//                   onChange={handleDataLimitPreset}
//                   options={dataLimitPresets.map(preset => ({ 
//                     value: preset.value, 
//                     label: `${preset.label} - ${preset.description}`
//                   })).concat([
//                     { value: 'custom', label: 'Set custom data amount' }
//                   ])}
//                   theme={theme}
//                 />
//               </div>
//               {dataLimitPreset === 'custom' && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   className="space-y-2"
//                 >
//                   <div className="flex gap-2">
//                     <input 
//                       value={pppoe.dataLimit.value || ""} 
//                       onChange={(e) => onNestedChange('pppoe', 'dataLimit', 'value', e.target.value)} 
//                       className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                       placeholder="Enter data amount (e.g., 100)" 
//                       required 
//                     />
//                     {renderUnitDropdown('dataLimit', pppoe.dataLimit.unit, onNestedChange, ['MB', 'GB', 'TB', 'Unlimited'])}
//                   </div>
//                   <p className="text-xs text-gray-500">
//                     Set the custom data limit for this plan
//                   </p>
//                 </motion.div>
//               )}
//               <p className="text-xs text-gray-500 mt-1">Total data available for the entire plan duration</p>
//               {errors.pppoe_dataLimit && <p className="text-red-500 text-xs mt-1">{errors.pppoe_dataLimit}</p>}
//             </div>

//             {/* Usage Limit */}
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 <Clock className="w-4 h-4 inline mr-1" />
//                 Daily Time Limit <span className="text-red-500">*</span>
//               </label>
//               <div className="mb-2">
//                 <EnhancedSelect
//                   value={usageLimitPreset}
//                   onChange={handleUsageLimitPreset}
//                   options={usageLimitPresets.map(preset => ({ 
//                     value: preset.value, 
//                     label: `${preset.label} - ${preset.description}`
//                   })).concat([
//                     { value: 'custom', label: 'Set custom hours' }
//                   ])}
//                   theme={theme}
//                 />
//               </div>
//               {usageLimitPreset === 'custom' && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   className="space-y-2"
//                 >
//                   <div className="flex gap-2">
//                     <input 
//                       value={pppoe.usageLimit.value || ""} 
//                       onChange={(e) => onNestedChange('pppoe', 'usageLimit', 'value', e.target.value)} 
//                       className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                       placeholder="Enter hours per day (e.g., 8)" 
//                       required 
//                     />
//                     {renderUnitDropdown('usageLimit', pppoe.usageLimit.unit, onNestedChange, ['Hours', 'Unlimited'])}
//                   </div>
//                   <p className="text-xs text-gray-500">
//                     Set the custom daily usage limit in hours
//                   </p>
//                 </motion.div>
//               )}
//               <p className="text-xs text-gray-500 mt-1">Maximum connection time allowed per day</p>
//               {errors.pppoe_usageLimit && <p className="text-red-500 text-xs mt-1">{errors.pppoe_usageLimit}</p>}
//             </div>
//           </div>

//           {/* PPPoE Network Settings - UPDATED: Removed service name duplication */}
//           <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-blue-900/10' : 'bg-blue-50'}`}>
//             <h4 className="text-md font-semibold mb-4 text-blue-700 dark:text-blue-300 flex items-center">
//               <Network className="w-4 h-4 mr-2" />
//               PPPoE Network Settings
//             </h4>
            
//             <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
//               {/* IP Pool */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   IP Address Range
//                   <span className="text-xs text-gray-500 ml-2">- Network range for connected devices</span>
//                 </label>
//                 <EnhancedSelect
//                   value={pppoe.ipPool}
//                   onChange={(value) => onChange('pppoe', 'ipPool', value)}
//                   options={[
//                     { value: "pppoe-pool-1", label: "Default Range - For general use" },
//                     { value: "pppoe-pool-2", label: "Extended Range - More IP addresses" },
//                     { value: "dynamic-pool", label: "Dynamic Pool - Automatic assignment" },
//                     { value: "static-pool", label: "Static Pool - Fixed IP addresses" }
//                   ]}
//                   theme={theme}
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Choose how IP addresses are assigned to users</p>
//               </div>

//               {/* DNS Servers with auto-suggestion */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   <Globe className="w-4 h-4 inline mr-1" />
//                   DNS Servers
//                   <span className="text-xs text-gray-500 ml-2">- Domain name resolution for users</span>
//                 </label>
//                 <div className="flex gap-2">
//                   <input 
//                     value={Array.isArray(pppoe.dnsServers) ? pppoe.dnsServers.join(", ") : ""} 
//                     onChange={(e) => onChange('pppoe', 'dnsServers', e.target.value.split(",").map(s => s.trim()))} 
//                     className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                     placeholder="8.8.8.8, 1.1.1.1" 
//                   />
//                   <button
//                     type="button"
//                     onClick={() => onChange('pppoe', 'dnsServers', getSuggestedDNS())}
//                     className="px-3 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                   >
//                     Auto
//                   </button>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Domain name servers for users. Auto sets reliable public DNS servers.
//                 </p>
//               </div>
//             </div>

//             {/* MTU with auto-suggestion - PPPoE Specific */}
//             <div className="mt-4">
//               <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                 Packet Size (MTU)
//                 <span className="text-xs text-gray-500 ml-2">- Optimal: {getSuggestedMTU(pppoe.downloadSpeed.value)}</span>
//               </label>
//               <div className="flex gap-2">
//                 <input 
//                   type="number" 
//                   value={pppoe.mtu || 1492} 
//                   onChange={(e) => onChange('pppoe', 'mtu', parseInt(e.target.value, 10) || 1492)} 
//                   className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                   min="576" 
//                   max="1500" 
//                   step="1" 
//                   placeholder="1492" 
//                 />
//                 <button
//                   type="button"
//                   onClick={() => onChange('pppoe', 'mtu', getSuggestedMTU(pppoe.downloadSpeed.value))}
//                   className="px-3 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   Auto
//                 </button>
//               </div>
//               <p className="text-xs text-gray-500 mt-1">
//                 Maximum data packet size. Auto sets the optimal value for your speed.
//               </p>
//             </div>
//           </div>

//           {/* Security & Management Features */}
//           <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-orange-900/10' : 'bg-orange-50'}`}>
//             <h4 className="text-md font-semibold mb-4 text-orange-700 dark:text-orange-300 flex items-center">
//               <Shield className="w-4 h-4 mr-2" />
//               Security & Device Management
//             </h4>
            
//             <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
//               {/* Maximum Devices */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   <Users className="w-4 h-4 inline mr-1" />
//                   Maximum Connected Devices
//                 </label>
//                 <EnhancedSelect
//                   value={pppoe.maxDevices ?? 0}
//                   onChange={(value) => onChange('pppoe', 'maxDevices', Number.isNaN(parseInt(value, 10)) ? 0 : parseInt(value, 10))}
//                   options={deviceLimitOptions}
//                   placeholder="Select device limit"
//                   theme={theme}
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Limit simultaneous connections</p>
//               </div>

//               {/* Session Timeout */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   <Clock className="w-4 h-4 inline mr-1" />
//                   Session Timeout
//                 </label>
//                 <EnhancedSelect
//                   value={pppoe.sessionTimeout}
//                   onChange={(value) => onChange('pppoe', 'sessionTimeout', parseInt(value, 10))}
//                   options={sessionTimeoutOptions}
//                   theme={theme}
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Forces reconnection for security</p>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6 mt-4">
//               {/* Idle Timeout */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   Idle Timeout
//                 </label>
//                 <EnhancedSelect
//                   value={pppoe.idleTimeout}
//                   onChange={(value) => onChange('pppoe', 'idleTimeout', parseInt(value, 10))}
//                   options={idleTimeoutOptions}
//                   theme={theme}
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Disconnects after inactivity</p>
//               </div>

//               {/* MAC Binding */}
//               <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
//                 <div>
//                   <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                     <Smartphone className="w-4 h-4 inline mr-1" />
//                     Device Lock (MAC Binding)
//                   </label>
//                   <p className="text-xs text-gray-500 mt-1">
//                     Restrict access to specific devices only
//                   </p>
//                 </div>
//                 <div 
//                   onClick={() => onChange('pppoe', 'macBinding', !pppoe.macBinding)} 
//                   className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
//                     pppoe.macBinding 
//                       ? 'bg-green-600'
//                       : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//                   }`}
//                 >
//                   <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//                     pppoe.macBinding ? "translate-x-6" : "translate-x-1"
//                   }`} />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Plan Summary - UPDATED: Removed service name */}
//           <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-indigo-900/10' : 'bg-indigo-50'}`}>
//             <h4 className="text-md font-semibold mb-4 text-indigo-700 dark:text-indigo-300 flex items-center">
//               <Calendar className="w-4 h-4 mr-2" />
//               Plan Summary
//             </h4>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//               <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//                 <Calendar className="w-5 h-5 text-blue-600 mx-auto mb-1" />
//                 <div className="text-sm font-semibold">{planSummary.validity}</div>
//                 <div className="text-xs text-gray-500">Plan Duration</div>
//               </div>
//               <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//                 <Database className="w-5 h-5 text-green-600 mx-auto mb-1" />
//                 <div className="text-sm font-semibold">{planSummary.dataLimit}</div>
//                 <div className="text-xs text-gray-500">Total Data</div>
//               </div>
//               <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//                 <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
//                 <div className="text-sm font-semibold">{planSummary.usageLimit}</div>
//                 <div className="text-xs text-gray-500">Daily Time</div>
//               </div>
//               <div className={`text-center p-3 rounded-lg flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//                 <Users className="w-5 h-5 text-orange-600 mx-auto mb-1" />
//                 <div className="text-sm font-semibold flex items-center gap-1">
//                   {planSummary.maxDevices === 'Unlimited' && <InfinityIcon className="w-4 h-4" />}
//                   {planSummary.maxDevices}
//                 </div>
//                 <div className="text-xs text-gray-500">Max Devices</div>
//               </div>
//               <div className={`text-center p-3 rounded-lg flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//                 <Gauge className="w-5 h-5 text-teal-600 mx-auto mb-1" />
//                 <div className="text-sm font-semibold flex items-center gap-1">
//                   {planSummary.bandwidth === 'Unlimited' && <InfinityIcon className="w-4 h-4" />}
//                   {planSummary.bandwidth}
//                 </div>
//                 <div className="text-xs text-gray-500">Bandwidth</div>
//               </div>
//               <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//                 <Network className="w-5 h-5 text-red-600 mx-auto mb-1" />
//                 <div className="text-sm font-semibold">{planSummary.ipPool}</div>
//                 <div className="text-xs text-gray-500">IP Range</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PPPoEConfiguration;










// import React, { useState, useMemo, useEffect } from "react";
// import { motion } from "framer-motion";
// import { EnhancedSelect, getThemeClasses } from "../Shared/components"
// import { 
//   speedUnits, 
//   dataLimitPresets,
//   usageLimitPresets,
//   validityPeriodPresets,
//   deviceLimitOptions,
//   sessionTimeoutOptions,
//   idleTimeoutOptions,
//   bandwidthPresets
// } from "../Shared/constant"
// import { Users, Clock, Shield, Calendar, Cable, Database, Zap, Gauge, Smartphone, Infinity as InfinityIcon } from "lucide-react";

// const PPPoEConfiguration = ({ form, errors, onChange, onNestedChange, theme }) => {
//   const themeClasses = getThemeClasses(theme);
//   const pppoe = form.accessMethods.pppoe;

//   // State for preset selections
//   const [dataLimitPreset, setDataLimitPreset] = useState('custom');
//   const [usageLimitPreset, setUsageLimitPreset] = useState('custom');
//   const [validityPreset, setValidityPreset] = useState('custom');
//   const [bandwidthPreset, setBandwidthPreset] = useState('custom');
//   const [bandwidthUnit, setBandwidthUnit] = useState('Mbps');

//   // Reset validity period when component mounts
//   useEffect(() => {
//     if (pppoe.validityPeriod.value === 720 && pppoe.validityPeriod.unit === 'Hours') {
//       onNestedChange('pppoe', 'validityPeriod', 'value', '');
//     }
//   }, [pppoe.validityPeriod.value, pppoe.validityPeriod.unit, onNestedChange]);

//   const handleToggle = () => {
//     onChange('pppoe', 'enabled', !pppoe.enabled);
//   };

//   const renderUnitDropdown = (field, value, onChange, units) => (
//     <EnhancedSelect
//       value={value}
//       onChange={(newValue) => onChange('pppoe', field, 'unit', newValue)}
//       options={units.map(unit => ({ value: unit, label: unit }))}
//       className="text-xs min-w-[5rem]"
//       theme={theme}
//     />
//   );

//   // Handle preset selections
//   const handleDataLimitPreset = (presetKey) => {
//     setDataLimitPreset(presetKey);
//     if (presetKey !== 'custom') {
//       const preset = dataLimitPresets.find(p => p.value === presetKey);
//       if (preset) {
//         onNestedChange('pppoe', 'dataLimit', 'value', preset.value);
//         onNestedChange('pppoe', 'dataLimit', 'unit', preset.unit);
//       }
//     } else {
//       onNestedChange('pppoe', 'dataLimit', 'value', '');
//     }
//   };

//   const handleUsageLimitPreset = (presetKey) => {
//     setUsageLimitPreset(presetKey);
//     if (presetKey !== 'custom') {
//       const preset = usageLimitPresets.find(p => p.value === presetKey);
//       if (preset) {
//         onNestedChange('pppoe', 'usageLimit', 'value', preset.value);
//         onNestedChange('pppoe', 'usageLimit', 'unit', preset.unit);
//       }
//     } else {
//       onNestedChange('pppoe', 'usageLimit', 'value', '');
//     }
//   };

//   const handleValidityPreset = (presetKey) => {
//     setValidityPreset(presetKey);
//     if (presetKey !== 'custom') {
//       const preset = validityPeriodPresets.find(p => p.value === presetKey);
//       if (preset) {
//         onNestedChange('pppoe', 'validityPeriod', 'value', preset.value);
//         onNestedChange('pppoe', 'validityPeriod', 'unit', preset.unit);
//       }
//     } else {
//       onNestedChange('pppoe', 'validityPeriod', 'value', '');
//     }
//   };

//   const handleBandwidthPreset = (presetKey) => {
//     setBandwidthPreset(presetKey);
//     if (presetKey !== 'custom') {
//       const preset = bandwidthPresets.find(p => p.value === parseInt(presetKey));
//       if (preset) {
//         onChange('pppoe', 'bandwidthLimit', preset.value);
//       }
//     }
//   };

//   // Convert Mbps to Kbps and vice versa
//   const convertBandwidth = (value, fromUnit, toUnit) => {
//     const numValue = parseFloat(value) || 0;
//     if (fromUnit === 'Mbps' && toUnit === 'Kbps') {
//       return Math.round(numValue * 1000);
//     } else if (fromUnit === 'Kbps' && toUnit === 'Mbps') {
//       return numValue / 1000;
//     }
//     return numValue;
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

//   // Format bandwidth for display
//   const formatBandwidthDisplay = (kbps) => {
//     if (kbps === 0) return "Unlimited";
//     if (kbps >= 1000) {
//       const mbps = kbps / 1000;
//       return `${mbps.toFixed(1)} Mbps`;
//     }
//     return `${kbps} Kbps`;
//   };

//   // Get display value for bandwidth input based on unit
//   const getBandwidthDisplayValue = () => {
//     if (bandwidthUnit === 'Mbps') {
//       return (pppoe.bandwidthLimit / 1000) || '';
//     }
//     return pppoe.bandwidthLimit || '';
//   };

//   // Handle bandwidth input change
//   const handleBandwidthChange = (value) => {
//     const numValue = parseFloat(value) || 0;
//     if (bandwidthUnit === 'Mbps') {
//       onChange('pppoe', 'bandwidthLimit', numValue * 1000);
//     } else {
//       onChange('pppoe', 'bandwidthLimit', numValue);
//     }
//   };

//   // Auto-suggest MTU based on speed
//   const getSuggestedMTU = (downloadSpeed) => {
//     const speed = parseFloat(downloadSpeed) || 0;
//     if (speed >= 100) return 1500;
//     if (speed >= 50) return 1492;
//     return 1480;
//   };

//   // Fixed plan summary
//   const planSummary = useMemo(() => {
//     const maxDevicesValue = Number.isNaN(pppoe.maxDevices) || pppoe.maxDevices === undefined ? 0 : pppoe.maxDevices;
    
//     const dataLimitDisplay = pppoe.dataLimit.value === 'Unlimited' 
//       ? 'Unlimited' 
//       : `${pppoe.dataLimit.value || '0'} ${pppoe.dataLimit.unit}`;
    
//     const usageLimitDisplay = pppoe.usageLimit.value === 'Unlimited' 
//       ? 'Unlimited' 
//       : `${pppoe.usageLimit.value || '0'} ${pppoe.usageLimit.unit}`;

//     const validityDisplay = pppoe.validityPeriod.value === '0' || pppoe.validityPeriod.value === 0
//       ? 'No Expiry'
//       : `${pppoe.validityPeriod.value || ''} ${pppoe.validityPeriod.unit}`;

//     return {
//       dataLimit: dataLimitDisplay,
//       usageLimit: usageLimitDisplay,
//       validity: validityDisplay,
//       maxDevices: maxDevicesValue === 0 ? 'Unlimited' : `${maxDevicesValue} device${maxDevicesValue > 1 ? 's' : ''}`,
//       sessionTimeout: formatTimeDisplay(pppoe.sessionTimeout),
//       idleTimeout: pppoe.idleTimeout === 0 ? 'No Timeout' : `${pppoe.idleTimeout / 60} minutes`,
//       bandwidth: formatBandwidthDisplay(pppoe.bandwidthLimit),
//       mtu: pppoe.mtu || 1492
//     };
//   }, [pppoe]);

//   return (
//     <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-lg lg:text-xl font-semibold flex items-center">
//           <Cable className="w-5 h-5 mr-2 text-green-600" />
//           PPPoE Configuration
//         </h3>
//         <div className="flex items-center">
//           <label className={`block text-sm font-medium mr-4 ${themeClasses.text.primary}`}>
//             Enable PPPoE
//           </label>
//           <div 
//             onClick={handleToggle}
//             className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
//               pppoe.enabled 
//                 ? 'bg-green-600'
//                 : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//             }`}
//           >
//             <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//               pppoe.enabled ? "translate-x-6" : "translate-x-1"
//             }`} />
//           </div>
//         </div>
//       </div>

//       {pppoe.enabled && (
//         <div className="space-y-6 lg:space-y-8">
//           {/* Speed Configuration */}
//           <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-green-900/10' : 'bg-green-50'}`}>
//             <h4 className="text-md font-semibold mb-4 text-green-700 dark:text-green-300 flex items-center">
//               <Zap className="w-4 h-4 mr-2" />
//               Speed & Bandwidth Settings
//             </h4>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
//               {/* Download Speed */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   Download Speed <span className="text-red-500">*</span>
//                 </label>
//                 <div className="flex flex-col sm:flex-row gap-2">
//                   <input 
//                     type="number" 
//                     value={pppoe.downloadSpeed.value || ""} 
//                     onChange={(e) => {
//                       onNestedChange('pppoe', 'downloadSpeed', 'value', e.target.value);
//                       // Auto-suggest MTU
//                       if (!pppoe.mtu) {
//                         onChange('pppoe', 'mtu', getSuggestedMTU(e.target.value));
//                       }
//                     }} 
//                     className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                     min="0.01" 
//                     step="0.01" 
//                     placeholder="e.g., 15" 
//                     required 
//                   />
//                   <div className="w-full sm:w-auto">
//                     {renderUnitDropdown('downloadSpeed', pppoe.downloadSpeed.unit, onNestedChange, speedUnits)}
//                   </div>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">Maximum download speed for connection</p>
//                 {errors.pppoe_downloadSpeed && <p className="text-red-500 text-xs mt-1">{errors.pppoe_downloadSpeed}</p>}
//               </div>
              
//               {/* Upload Speed */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   Upload Speed <span className="text-red-500">*</span>
//                 </label>
//                 <div className="flex flex-col sm:flex-row gap-2">
//                   <input 
//                     type="number" 
//                     value={pppoe.uploadSpeed.value || ""} 
//                     onChange={(e) => onNestedChange('pppoe', 'uploadSpeed', 'value', e.target.value)} 
//                     className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                     min="0.01" 
//                     step="0.01" 
//                     placeholder="e.g., 3" 
//                     required 
//                   />
//                   <div className="w-full sm:w-auto">
//                     {renderUnitDropdown('uploadSpeed', pppoe.uploadSpeed.unit, onNestedChange, speedUnits)}
//                   </div>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">Maximum upload speed for connection</p>
//                 {errors.pppoe_uploadSpeed && <p className="text-red-500 text-xs mt-1">{errors.pppoe_uploadSpeed}</p>}
//               </div>
//             </div>

//             {/* Bandwidth Limit */}
//             <div className="mt-6">
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 <Gauge className="w-4 h-4 inline mr-1" />
//                 Total Bandwidth Limit
//                 <span className="text-xs text-gray-500 ml-2">Shared bandwidth for this connection</span>
//               </label>
              
//               <div className="mb-3">
//                 <EnhancedSelect
//                   value={bandwidthPreset}
//                   onChange={handleBandwidthPreset}
//                   options={bandwidthPresets.map(preset => ({
//                     value: preset.value.toString(),
//                     label: preset.value === 0 ? 'Unlimited - No restrictions' : `${preset.label} - ${preset.description}`
//                   })).concat([
//                     { value: 'custom', label: 'Set custom bandwidth' }
//                   ])}
//                   theme={theme}
//                 />
//               </div>
              
//               {bandwidthPreset === 'custom' && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   className="space-y-3"
//                 >
//                   <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
//                     <input 
//                       type="number" 
//                       value={getBandwidthDisplayValue()} 
//                       onChange={(e) => handleBandwidthChange(e.target.value)} 
//                       className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                       min="0" 
//                       step="any" 
//                       placeholder="Enter value" 
//                     />
//                     <EnhancedSelect
//                       value={bandwidthUnit}
//                       onChange={setBandwidthUnit}
//                       options={[
//                         { value: 'Mbps', label: 'Mbps' },
//                         { value: 'Kbps', label: 'Kbps' }
//                       ]}
//                       className="text-xs min-w-[5rem]"
//                       theme={theme}
//                     />
//                     <span className="text-sm text-gray-500 whitespace-nowrap">
//                       ({formatBandwidthDisplay(pppoe.bandwidthLimit)})
//                     </span>
//                   </div>
//                   <p className="text-xs text-gray-500">
//                     Enter bandwidth and select unit. Internally stored as Kbps.
//                   </p>
//                 </motion.div>
//               )}
              
//               {bandwidthPreset !== 'custom' && (
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.95 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ duration: 0.2 }}
//                   className={`p-3 rounded-lg flex items-center gap-2 ${theme === 'dark' ? 'bg-green-800/20' : 'bg-green-100'}`}
//                 >
//                   {pppoe.bandwidthLimit === 0 && <InfinityIcon className="w-4 h-4 text-green-600 dark:text-green-300" />}
//                   <p className="text-sm text-green-700 dark:text-green-300">
//                     <strong>Selected:</strong> {formatBandwidthDisplay(pppoe.bandwidthLimit)}
//                   </p>
//                 </motion.div>
//               )}
//             </div>
//           </div>

//           {/* Data & Usage Limits */}
//           <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-purple-900/10' : 'bg-purple-50'}`}>
//             <h4 className="text-md font-semibold mb-4 text-purple-700 dark:text-purple-300 flex items-center">
//               <Database className="w-4 h-4 mr-2" />
//               Plan Limits & Duration
//             </h4>
            
//             {/* Validity Period */}
//             <div className="mb-6">
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 <Calendar className="w-4 h-4 inline mr-1" />
//                 Plan Duration <span className="text-red-500">*</span>
//               </label>
//               <div className="mb-2">
//                 <EnhancedSelect
//                   value={validityPreset}
//                   onChange={handleValidityPreset}
//                   options={validityPeriodPresets.map(preset => ({ 
//                     value: preset.value, 
//                     label: `${preset.label} - ${preset.description}`
//                   })).concat([
//                     { value: 'custom', label: 'Set custom duration' }
//                   ])}
//                   theme={theme}
//                 />
//               </div>
//               {validityPreset === 'custom' && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   className="space-y-2"
//                 >
//                   <div className="flex flex-col sm:flex-row gap-2">
//                     <input 
//                       value={pppoe.validityPeriod.value || ""} 
//                       onChange={(e) => onNestedChange('pppoe', 'validityPeriod', 'value', e.target.value)} 
//                       className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                       placeholder="Enter duration value" 
//                       required 
//                     />
//                     <div className="w-full sm:w-auto">
//                       {renderUnitDropdown('validityPeriod', pppoe.validityPeriod.unit, onNestedChange, ['Hours', 'Days', 'Weeks', 'Months'])}
//                     </div>
//                   </div>
//                   <p className="text-xs text-gray-500">
//                     Set the custom duration for this plan
//                   </p>
//                 </motion.div>
//               )}
//               <p className="text-xs text-gray-500 mt-1">How long the plan remains active after activation</p>
//             </div>

//             {/* Data Limit */}
//             <div className="mb-6">
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 Total Data Allowance <span className="text-red-500">*</span>
//               </label>
//               <div className="mb-2">
//                 <EnhancedSelect
//                   value={dataLimitPreset}
//                   onChange={handleDataLimitPreset}
//                   options={dataLimitPresets.map(preset => ({ 
//                     value: preset.value, 
//                     label: `${preset.label} - ${preset.description}`
//                   })).concat([
//                     { value: 'custom', label: 'Set custom data amount' }
//                   ])}
//                   theme={theme}
//                 />
//               </div>
//               {dataLimitPreset === 'custom' && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   className="space-y-2"
//                 >
//                   <div className="flex flex-col sm:flex-row gap-2">
//                     <input 
//                       value={pppoe.dataLimit.value || ""} 
//                       onChange={(e) => onNestedChange('pppoe', 'dataLimit', 'value', e.target.value)} 
//                       className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                       placeholder="Enter data amount" 
//                       required 
//                     />
//                     <div className="w-full sm:w-auto">
//                       {renderUnitDropdown('dataLimit', pppoe.dataLimit.unit, onNestedChange, ['MB', 'GB', 'TB', 'Unlimited'])}
//                     </div>
//                   </div>
//                   <p className="text-xs text-gray-500">
//                     Set the custom data limit for this plan
//                   </p>
//                 </motion.div>
//               )}
//               <p className="text-xs text-gray-500 mt-1">Total data available for the entire plan duration</p>
//               {errors.pppoe_dataLimit && <p className="text-red-500 text-xs mt-1">{errors.pppoe_dataLimit}</p>}
//             </div>

//             {/* Usage Limit */}
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 <Clock className="w-4 h-4 inline mr-1" />
//                 Daily Time Limit <span className="text-red-500">*</span>
//               </label>
//               <div className="mb-2">
//                 <EnhancedSelect
//                   value={usageLimitPreset}
//                   onChange={handleUsageLimitPreset}
//                   options={usageLimitPresets.map(preset => ({ 
//                     value: preset.value, 
//                     label: `${preset.label} - ${preset.description}`
//                   })).concat([
//                     { value: 'custom', label: 'Set custom hours' }
//                   ])}
//                   theme={theme}
//                 />
//               </div>
//               {usageLimitPreset === 'custom' && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   className="space-y-2"
//                 >
//                   <div className="flex flex-col sm:flex-row gap-2">
//                     <input 
//                       value={pppoe.usageLimit.value || ""} 
//                       onChange={(e) => onNestedChange('pppoe', 'usageLimit', 'value', e.target.value)} 
//                       className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                       placeholder="Enter hours per day" 
//                       required 
//                     />
//                     <div className="w-full sm:w-auto">
//                       {renderUnitDropdown('usageLimit', pppoe.usageLimit.unit, onNestedChange, ['Hours', 'Unlimited'])}
//                     </div>
//                   </div>
//                   <p className="text-xs text-gray-500">
//                     Set the custom daily usage limit in hours
//                   </p>
//                 </motion.div>
//               )}
//               <p className="text-xs text-gray-500 mt-1">Maximum connection time allowed per day</p>
//               {errors.pppoe_usageLimit && <p className="text-red-500 text-xs mt-1">{errors.pppoe_usageLimit}</p>}
//             </div>
//           </div>

//           {/* PPPoE Network Settings - UPDATED: Removed DNS */}
//           <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-blue-900/10' : 'bg-blue-50'}`}>
//             <h4 className="text-md font-semibold mb-4 text-blue-700 dark:text-blue-300 flex items-center">
//               <Cable className="w-4 h-4 mr-2" />
//               PPPoE Network Settings
//             </h4>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
//               {/* IP Pool - Only if supported by backend */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   IP Pool
//                 </label>
//                 <input 
//                   value={pppoe.ipPool || ""} 
//                   onChange={(e) => onChange('pppoe', 'ipPool', e.target.value)} 
//                   className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                   placeholder="pppoe-pool-1" 
//                 />
//                 <p className="text-xs text-gray-500 mt-1">IP pool name for PPPoE users</p>
//               </div>

//               {/* Service Name - Only if supported by backend */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   Service Name
//                 </label>
//                 <input 
//                   value={pppoe.serviceName || ""} 
//                   onChange={(e) => onChange('pppoe', 'serviceName', e.target.value)} 
//                   className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                   placeholder="PPPoE Service" 
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Service identifier for PPPoE</p>
//               </div>
//             </div>

//             {/* MTU */}
//             <div className="mt-4">
//               <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                 MTU (Maximum Transmission Unit)
//               </label>
//               <div className="flex flex-col sm:flex-row gap-2">
//                 <input 
//                   type="number" 
//                   value={pppoe.mtu || 1492} 
//                   onChange={(e) => onChange('pppoe', 'mtu', parseInt(e.target.value, 10) || 1492)} 
//                   className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                   min="576" 
//                   max="1500" 
//                   step="1" 
//                   placeholder="1492" 
//                 />
//                 <button
//                   type="button"
//                   onClick={() => onChange('pppoe', 'mtu', getSuggestedMTU(pppoe.downloadSpeed.value))}
//                   className="px-3 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
//                 >
//                   Auto Suggest
//                 </button>
//               </div>
//               <p className="text-xs text-gray-500 mt-1">
//                 Maximum data packet size. Auto suggests optimal value for your speed.
//               </p>
//             </div>
//           </div>

//           {/* Security & Management Features */}
//           <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-orange-900/10' : 'bg-orange-50'}`}>
//             <h4 className="text-md font-semibold mb-4 text-orange-700 dark:text-orange-300 flex items-center">
//               <Shield className="w-4 h-4 mr-2" />
//               Security & Device Management
//             </h4>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
//               {/* Maximum Devices */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   <Users className="w-4 h-4 inline mr-1" />
//                   Maximum Connected Devices
//                 </label>
//                 <EnhancedSelect
//                   value={pppoe.maxDevices ?? 0}
//                   onChange={(value) => onChange('pppoe', 'maxDevices', parseInt(value, 10) || 0)}
//                   options={deviceLimitOptions}
//                   placeholder="Select device limit"
//                   theme={theme}
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Limit simultaneous connections</p>
//               </div>

//               {/* Session Timeout */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   <Clock className="w-4 h-4 inline mr-1" />
//                   Session Timeout
//                 </label>
//                 <EnhancedSelect
//                   value={pppoe.sessionTimeout}
//                   onChange={(value) => onChange('pppoe', 'sessionTimeout', parseInt(value, 10))}
//                   options={sessionTimeoutOptions}
//                   theme={theme}
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Forces reconnection for security</p>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mt-4">
//               {/* Idle Timeout */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   Idle Timeout
//                 </label>
//                 <EnhancedSelect
//                   value={pppoe.idleTimeout}
//                   onChange={(value) => onChange('pppoe', 'idleTimeout', parseInt(value, 10))}
//                   options={idleTimeoutOptions}
//                   theme={theme}
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Disconnects after inactivity</p>
//               </div>

//               {/* MAC Binding */}
//               <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg gap-2">
//                 <div className="flex-1">
//                   <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                     <Smartphone className="w-4 h-4 inline mr-1" />
//                     Device Lock (MAC Binding)
//                   </label>
//                   <p className="text-xs text-gray-500 mt-1">
//                     Restrict access to specific devices only
//                   </p>
//                 </div>
//                 <div 
//                   onClick={() => onChange('pppoe', 'macBinding', !pppoe.macBinding)} 
//                   className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out flex-shrink-0 ${
//                     pppoe.macBinding 
//                       ? 'bg-green-600'
//                       : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//                   }`}
//                 >
//                   <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//                     pppoe.macBinding ? "translate-x-6" : "translate-x-1"
//                   }`} />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Plan Summary */}
//           <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-indigo-900/10' : 'bg-indigo-50'}`}>
//             <h4 className="text-md font-semibold mb-4 text-indigo-700 dark:text-indigo-300 flex items-center">
//               <Calendar className="w-4 h-4 mr-2" />
//               Plan Summary
//             </h4>
//             <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3">
//               <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//                 <Calendar className="w-5 h-5 text-blue-600 mx-auto mb-1" />
//                 <div className="text-sm font-semibold truncate">{planSummary.validity}</div>
//                 <div className="text-xs text-gray-500">Duration</div>
//               </div>
//               <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//                 <Database className="w-5 h-5 text-green-600 mx-auto mb-1" />
//                 <div className="text-sm font-semibold truncate">{planSummary.dataLimit}</div>
//                 <div className="text-xs text-gray-500">Total Data</div>
//               </div>
//               <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//                 <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
//                 <div className="text-sm font-semibold truncate">{planSummary.usageLimit}</div>
//                 <div className="text-xs text-gray-500">Daily Time</div>
//               </div>
//               <div className={`text-center p-3 rounded-lg flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//                 <Users className="w-5 h-5 text-orange-600 mx-auto mb-1" />
//                 <div className="text-sm font-semibold flex items-center justify-center gap-1">
//                   {planSummary.maxDevices === 'Unlimited' && <InfinityIcon className="w-4 h-4" />}
//                   <span className="truncate">{planSummary.maxDevices}</span>
//                 </div>
//                 <div className="text-xs text-gray-500">Max Devices</div>
//               </div>
//               <div className={`text-center p-3 rounded-lg flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//                 <Gauge className="w-5 h-5 text-teal-600 mx-auto mb-1" />
//                 <div className="text-sm font-semibold flex items-center justify-center gap-1">
//                   {planSummary.bandwidth === 'Unlimited' && <InfinityIcon className="w-4 h-4" />}
//                   <span className="truncate">{planSummary.bandwidth}</span>
//                 </div>
//                 <div className="text-xs text-gray-500">Bandwidth</div>
//               </div>
//               <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//                 <Shield className="w-5 h-5 text-red-600 mx-auto mb-1" />
//                 <div className="text-sm font-semibold truncate">{pppoe.macBinding ? 'Enabled' : 'Disabled'}</div>
//                 <div className="text-xs text-gray-500">Device Lock</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PPPoEConfiguration;








// import React, { useState, useMemo, useEffect } from "react";
// import { motion } from "framer-motion";
// import { EnhancedSelect, getThemeClasses } from "../Shared/components"
// import { 
//   speedUnits, 
//   dataLimitPresets,
//   usageLimitPresets,
//   validityPeriodPresets,
//   deviceLimitOptions,
//   sessionTimeoutOptions,
//   idleTimeoutOptions,
//   bandwidthPresets
// } from "../Shared/constant"
// import { Users, Clock, Shield, Calendar, Cable, Database, Zap, Gauge, Smartphone, Infinity as InfinityIcon } from "lucide-react";

// const PPPoEConfiguration = ({ form, errors, onChange, onNestedChange, theme }) => {
//   const themeClasses = getThemeClasses(theme);
//   const pppoe = form.accessMethods.pppoe;

//   // State for preset selections
//   const [dataLimitPreset, setDataLimitPreset] = useState('custom');
//   const [usageLimitPreset, setUsageLimitPreset] = useState('custom');
//   const [validityPreset, setValidityPreset] = useState('custom');
//   const [bandwidthPreset, setBandwidthPreset] = useState('custom');
//   const [bandwidthUnit, setBandwidthUnit] = useState('Mbps');

//   // Reset validity period when component mounts
//   useEffect(() => {
//     if (pppoe.validityPeriod.value === 720 && pppoe.validityPeriod.unit === 'Hours') {
//       onNestedChange('pppoe', 'validityPeriod', 'value', '');
//     }
//   }, [pppoe.validityPeriod.value, pppoe.validityPeriod.unit, onNestedChange]);

//   const handleToggle = () => {
//     onChange('pppoe', 'enabled', !pppoe.enabled);
//   };

//   // Safe unit renderer
//   const renderUnitDropdown = (field, value, onChange, units) => (
//     <EnhancedSelect
//       value={value}
//       onChange={(newValue) => onChange('pppoe', field, 'unit', newValue)}
//       options={units.map(unit => ({ value: unit, label: unit }))}
//       className="text-xs min-w-[5rem]"
//       theme={theme}
//     />
//   );

//   // Create preset options for EnhancedSelect
//   const createPresetOptions = (presets, customLabel = 'Set custom') => {
//     const safePresets = presets.map(preset => ({
//       value: String(preset.value),
//       label: `${preset.label} - ${preset.description}`
//     }));
    
//     return [
//       ...safePresets,
//       { value: 'custom', label: customLabel }
//     ];
//   };

//   // Handle preset selections
//   const handleDataLimitPreset = (presetKey) => {
//     setDataLimitPreset(presetKey);
//     if (presetKey !== 'custom') {
//       const preset = dataLimitPresets.find(p => p.value === presetKey);
//       if (preset) {
//         onNestedChange('pppoe', 'dataLimit', 'value', preset.value);
//         onNestedChange('pppoe', 'dataLimit', 'unit', preset.unit);
//       }
//     } else {
//       onNestedChange('pppoe', 'dataLimit', 'value', '');
//     }
//   };

//   const handleUsageLimitPreset = (presetKey) => {
//     setUsageLimitPreset(presetKey);
//     if (presetKey !== 'custom') {
//       const preset = usageLimitPresets.find(p => p.value === presetKey);
//       if (preset) {
//         onNestedChange('pppoe', 'usageLimit', 'value', preset.value);
//         onNestedChange('pppoe', 'usageLimit', 'unit', preset.unit);
//       }
//     } else {
//       onNestedChange('pppoe', 'usageLimit', 'value', '');
//     }
//   };

//   const handleValidityPreset = (presetKey) => {
//     setValidityPreset(presetKey);
//     if (presetKey !== 'custom') {
//       const preset = validityPeriodPresets.find(p => p.value === presetKey);
//       if (preset) {
//         onNestedChange('pppoe', 'validityPeriod', 'value', preset.value);
//         onNestedChange('pppoe', 'validityPeriod', 'unit', preset.unit);
//       }
//     } else {
//       onNestedChange('pppoe', 'validityPeriod', 'value', '');
//     }
//   };

//   // Create bandwidth options
//   const getBandwidthOptions = () => {
//     const safeBandwidthPresets = bandwidthPresets.map(preset => ({
//       value: String(preset.value),
//       label: preset.value === 0 
//         ? 'Unlimited - No restrictions' 
//         : `${preset.label} - ${preset.description}`
//     }));
    
//     return [
//       ...safeBandwidthPresets,
//       { value: 'custom', label: 'Set custom bandwidth' }
//     ];
//   };

//   const handleBandwidthPreset = (presetKey) => {
//     setBandwidthPreset(presetKey);
//     if (presetKey !== 'custom') {
//       const preset = bandwidthPresets.find(p => p.value === parseInt(presetKey));
//       if (preset) {
//         onChange('pppoe', 'bandwidthLimit', preset.value);
//       }
//     }
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

//   // Format bandwidth for display
//   const formatBandwidthDisplay = (kbps) => {
//     if (kbps === 0) return "Unlimited";
//     if (kbps >= 1000) {
//       const mbps = kbps / 1000;
//       return `${mbps.toFixed(1)} Mbps`;
//     }
//     return `${kbps} Kbps`;
//   };

//   // Get display value for bandwidth input based on unit
//   const getBandwidthDisplayValue = () => {
//     if (bandwidthUnit === 'Mbps') {
//       return (pppoe.bandwidthLimit / 1000) || '';
//     }
//     return pppoe.bandwidthLimit || '';
//   };

//   // Handle bandwidth input change
//   const handleBandwidthChange = (value) => {
//     const numValue = parseFloat(value) || 0;
//     if (bandwidthUnit === 'Mbps') {
//       onChange('pppoe', 'bandwidthLimit', numValue * 1000);
//     } else {
//       onChange('pppoe', 'bandwidthLimit', numValue);
//     }
//   };

//   // Auto-suggest MTU based on speed
//   const getSuggestedMTU = (downloadSpeed) => {
//     const speed = parseFloat(downloadSpeed) || 0;
//     if (speed >= 100) return 1500;
//     if (speed >= 50) return 1492;
//     return 1480;
//   };

//   // Fixed plan summary
//   const planSummary = useMemo(() => {
//     const maxDevicesValue = Number.isNaN(pppoe.maxDevices) || pppoe.maxDevices === undefined ? 0 : pppoe.maxDevices;
    
//     const dataLimitDisplay = pppoe.dataLimit.value === 'Unlimited' 
//       ? 'Unlimited' 
//       : `${pppoe.dataLimit.value || '0'} ${pppoe.dataLimit.unit}`;
    
//     const usageLimitDisplay = pppoe.usageLimit.value === 'Unlimited' 
//       ? 'Unlimited' 
//       : `${pppoe.usageLimit.value || '0'} ${pppoe.usageLimit.unit}`;

//     const validityDisplay = pppoe.validityPeriod.value === '0' || pppoe.validityPeriod.value === 0
//       ? 'No Expiry'
//       : `${pppoe.validityPeriod.value || ''} ${pppoe.validityPeriod.unit}`;

//     return {
//       dataLimit: dataLimitDisplay,
//       usageLimit: usageLimitDisplay,
//       validity: validityDisplay,
//       maxDevices: maxDevicesValue === 0 ? 'Unlimited' : `${maxDevicesValue} device${maxDevicesValue > 1 ? 's' : ''}`,
//       sessionTimeout: formatTimeDisplay(pppoe.sessionTimeout),
//       idleTimeout: pppoe.idleTimeout === 0 ? 'No Timeout' : `${pppoe.idleTimeout / 60} minutes`,
//       bandwidth: formatBandwidthDisplay(pppoe.bandwidthLimit),
//       mtu: pppoe.mtu || 1492
//     };
//   }, [pppoe]);

//   return (
//     <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-lg lg:text-xl font-semibold flex items-center">
//           <Cable className="w-5 h-5 mr-2 text-green-600" />
//           PPPoE Configuration
//         </h3>
//         <div className="flex items-center">
//           <label className={`block text-sm font-medium mr-4 ${themeClasses.text.primary}`}>
//             Enable PPPoE
//           </label>
//           <div 
//             onClick={handleToggle}
//             className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
//               pppoe.enabled 
//                 ? 'bg-green-600'
//                 : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//             }`}
//           >
//             <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//               pppoe.enabled ? "translate-x-6" : "translate-x-1"
//             }`} />
//           </div>
//         </div>
//       </div>

//       {pppoe.enabled && (
//         <div className="space-y-6 lg:space-y-8">
//           {/* Speed Configuration */}
//           <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-green-900/10' : 'bg-green-50'}`}>
//             <h4 className="text-md font-semibold mb-4 text-green-700 dark:text-green-300 flex items-center">
//               <Zap className="w-4 h-4 mr-2" />
//               Speed & Bandwidth Settings
//             </h4>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
//               {/* Download Speed */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   Download Speed <span className="text-red-500">*</span>
//                 </label>
//                 <div className="flex flex-col sm:flex-row gap-2">
//                   <input 
//                     type="number" 
//                     value={pppoe.downloadSpeed.value || ""} 
//                     onChange={(e) => {
//                       onNestedChange('pppoe', 'downloadSpeed', 'value', e.target.value);
//                       // Auto-suggest MTU
//                       if (!pppoe.mtu) {
//                         onChange('pppoe', 'mtu', getSuggestedMTU(e.target.value));
//                       }
//                     }} 
//                     className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                     min="0.01" 
//                     step="0.01" 
//                     placeholder="e.g., 15" 
//                     required 
//                   />
//                   <div className="w-full sm:w-auto">
//                     {renderUnitDropdown('downloadSpeed', pppoe.downloadSpeed.unit, onNestedChange, speedUnits)}
//                   </div>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">Maximum download speed for connection</p>
//                 {errors.pppoe_downloadSpeed && <p className="text-red-500 text-xs mt-1">{errors.pppoe_downloadSpeed}</p>}
//               </div>
              
//               {/* Upload Speed */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   Upload Speed <span className="text-red-500">*</span>
//                 </label>
//                 <div className="flex flex-col sm:flex-row gap-2">
//                   <input 
//                     type="number" 
//                     value={pppoe.uploadSpeed.value || ""} 
//                     onChange={(e) => onNestedChange('pppoe', 'uploadSpeed', 'value', e.target.value)} 
//                     className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                     min="0.01" 
//                     step="0.01" 
//                     placeholder="e.g., 3" 
//                     required 
//                   />
//                   <div className="w-full sm:w-auto">
//                     {renderUnitDropdown('uploadSpeed', pppoe.uploadSpeed.unit, onNestedChange, speedUnits)}
//                   </div>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">Maximum upload speed for connection</p>
//                 {errors.pppoe_uploadSpeed && <p className="text-red-500 text-xs mt-1">{errors.pppoe_uploadSpeed}</p>}
//               </div>
//             </div>

//             {/* Bandwidth Limit */}
//             <div className="mt-6">
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 <Gauge className="w-4 h-4 inline mr-1" />
//                 Total Bandwidth Limit
//                 <span className="text-xs text-gray-500 ml-2">Shared bandwidth for this connection</span>
//               </label>
              
//               <div className="mb-3">
//                 <EnhancedSelect
//                   value={bandwidthPreset}
//                   onChange={handleBandwidthPreset}
//                   options={getBandwidthOptions()}
//                   theme={theme}
//                 />
//               </div>
              
//               {bandwidthPreset === 'custom' && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   className="space-y-3"
//                 >
//                   <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
//                     <input 
//                       type="number" 
//                       value={getBandwidthDisplayValue()} 
//                       onChange={(e) => handleBandwidthChange(e.target.value)} 
//                       className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                       min="0" 
//                       step="any" 
//                       placeholder="Enter value" 
//                     />
//                     <EnhancedSelect
//                       value={bandwidthUnit}
//                       onChange={setBandwidthUnit}
//                       options={[
//                         { value: 'Mbps', label: 'Mbps' },
//                         { value: 'Kbps', label: 'Kbps' }
//                       ]}
//                       className="text-xs min-w-[5rem]"
//                       theme={theme}
//                     />
//                     <span className="text-sm text-gray-500 whitespace-nowrap">
//                       ({formatBandwidthDisplay(pppoe.bandwidthLimit)})
//                     </span>
//                   </div>
//                   <p className="text-xs text-gray-500">
//                     Enter bandwidth and select unit. Internally stored as Kbps.
//                   </p>
//                 </motion.div>
//               )}
              
//               {bandwidthPreset !== 'custom' && (
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.95 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ duration: 0.2 }}
//                   className={`p-3 rounded-lg flex items-center gap-2 ${theme === 'dark' ? 'bg-green-800/20' : 'bg-green-100'}`}
//                 >
//                   {pppoe.bandwidthLimit === 0 && <InfinityIcon className="w-4 h-4 text-green-600 dark:text-green-300" />}
//                   <p className="text-sm text-green-700 dark:text-green-300">
//                     <strong>Selected:</strong> {formatBandwidthDisplay(pppoe.bandwidthLimit)}
//                   </p>
//                 </motion.div>
//               )}
//             </div>
//           </div>

//           {/* Data & Usage Limits */}
//           <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-purple-900/10' : 'bg-purple-50'}`}>
//             <h4 className="text-md font-semibold mb-4 text-purple-700 dark:text-purple-300 flex items-center">
//               <Database className="w-4 h-4 mr-2" />
//               Plan Limits & Duration
//             </h4>
            
//             {/* Validity Period */}
//             <div className="mb-6">
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 <Calendar className="w-4 h-4 inline mr-1" />
//                 Plan Duration <span className="text-red-500">*</span>
//               </label>
//               <div className="mb-2">
//                 <EnhancedSelect
//                   value={validityPreset}
//                   onChange={handleValidityPreset}
//                   options={createPresetOptions(validityPeriodPresets, 'Set custom duration')}
//                   theme={theme}
//                 />
//               </div>
//               {validityPreset === 'custom' && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   className="space-y-2"
//                 >
//                   <div className="flex flex-col sm:flex-row gap-2">
//                     <input 
//                       value={pppoe.validityPeriod.value || ""} 
//                       onChange={(e) => onNestedChange('pppoe', 'validityPeriod', 'value', e.target.value)} 
//                       className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                       placeholder="Enter duration value" 
//                       required 
//                     />
//                     <div className="w-full sm:w-auto">
//                       {renderUnitDropdown('validityPeriod', pppoe.validityPeriod.unit, onNestedChange, ['Hours', 'Days', 'Weeks', 'Months'])}
//                     </div>
//                   </div>
//                   <p className="text-xs text-gray-500">
//                     Set the custom duration for this plan
//                   </p>
//                 </motion.div>
//               )}
//               <p className="text-xs text-gray-500 mt-1">How long the plan remains active after activation</p>
//             </div>

//             {/* Data Limit */}
//             <div className="mb-6">
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 Total Data Allowance <span className="text-red-500">*</span>
//               </label>
//               <div className="mb-2">
//                 <EnhancedSelect
//                   value={dataLimitPreset}
//                   onChange={handleDataLimitPreset}
//                   options={createPresetOptions(dataLimitPresets, 'Set custom data amount')}
//                   theme={theme}
//                 />
//               </div>
//               {dataLimitPreset === 'custom' && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   className="space-y-2"
//                 >
//                   <div className="flex flex-col sm:flex-row gap-2">
//                     <input 
//                       value={pppoe.dataLimit.value || ""} 
//                       onChange={(e) => onNestedChange('pppoe', 'dataLimit', 'value', e.target.value)} 
//                       className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                       placeholder="Enter data amount" 
//                       required 
//                     />
//                     <div className="w-full sm:w-auto">
//                       {renderUnitDropdown('dataLimit', pppoe.dataLimit.unit, onNestedChange, ['MB', 'GB', 'TB', 'Unlimited'])}
//                     </div>
//                   </div>
//                   <p className="text-xs text-gray-500">
//                     Set the custom data limit for this plan
//                   </p>
//                 </motion.div>
//               )}
//               <p className="text-xs text-gray-500 mt-1">Total data available for the entire plan duration</p>
//               {errors.pppoe_dataLimit && <p className="text-red-500 text-xs mt-1">{errors.pppoe_dataLimit}</p>}
//             </div>

//             {/* Usage Limit */}
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 <Clock className="w-4 h-4 inline mr-1" />
//                 Daily Time Limit <span className="text-red-500">*</span>
//               </label>
//               <div className="mb-2">
//                 <EnhancedSelect
//                   value={usageLimitPreset}
//                   onChange={handleUsageLimitPreset}
//                   options={createPresetOptions(usageLimitPresets, 'Set custom hours')}
//                   theme={theme}
//                 />
//               </div>
//               {usageLimitPreset === 'custom' && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   className="space-y-2"
//                 >
//                   <div className="flex flex-col sm:flex-row gap-2">
//                     <input 
//                       value={pppoe.usageLimit.value || ""} 
//                       onChange={(e) => onNestedChange('pppoe', 'usageLimit', 'value', e.target.value)} 
//                       className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                       placeholder="Enter hours per day" 
//                       required 
//                     />
//                     <div className="w-full sm:w-auto">
//                       {renderUnitDropdown('usageLimit', pppoe.usageLimit.unit, onNestedChange, ['Hours', 'Unlimited'])}
//                     </div>
//                   </div>
//                   <p className="text-xs text-gray-500">
//                     Set the custom daily usage limit in hours
//                   </p>
//                 </motion.div>
//               )}
//               <p className="text-xs text-gray-500 mt-1">Maximum connection time allowed per day</p>
//               {errors.pppoe_usageLimit && <p className="text-red-500 text-xs mt-1">{errors.pppoe_usageLimit}</p>}
//             </div>
//           </div>

//           {/* PPPoE Network Settings */}
//           <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-blue-900/10' : 'bg-blue-50'}`}>
//             <h4 className="text-md font-semibold mb-4 text-blue-700 dark:text-blue-300 flex items-center">
//               <Cable className="w-4 h-4 mr-2" />
//               PPPoE Network Settings
//             </h4>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
//               {/* IP Pool */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   IP Pool
//                 </label>
//                 <input 
//                   value={pppoe.ipPool || ""} 
//                   onChange={(e) => onChange('pppoe', 'ipPool', e.target.value)} 
//                   className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                   placeholder="pppoe-pool-1" 
//                 />
//                 <p className="text-xs text-gray-500 mt-1">IP pool name for PPPoE users</p>
//               </div>

//               {/* Service Name */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   Service Name
//                 </label>
//                 <input 
//                   value={pppoe.serviceName || ""} 
//                   onChange={(e) => onChange('pppoe', 'serviceName', e.target.value)} 
//                   className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                   placeholder="PPPoE Service" 
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Service identifier for PPPoE</p>
//               </div>
//             </div>

//             {/* MTU */}
//             <div className="mt-4">
//               <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                 MTU (Maximum Transmission Unit)
//               </label>
//               <div className="flex flex-col sm:flex-row gap-2">
//                 <input 
//                   type="number" 
//                   value={pppoe.mtu || 1492} 
//                   onChange={(e) => onChange('pppoe', 'mtu', parseInt(e.target.value, 10) || 1492)} 
//                   className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                   min="576" 
//                   max="1500" 
//                   step="1" 
//                   placeholder="1492" 
//                 />
//                 <button
//                   type="button"
//                   onClick={() => onChange('pppoe', 'mtu', getSuggestedMTU(pppoe.downloadSpeed.value))}
//                   className="px-3 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
//                 >
//                   Auto Suggest
//                 </button>
//               </div>
//               <p className="text-xs text-gray-500 mt-1">
//                 Maximum data packet size. Auto suggests optimal value for your speed.
//               </p>
//             </div>
//           </div>

//           {/* Security & Management Features */}
//           <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-orange-900/10' : 'bg-orange-50'}`}>
//             <h4 className="text-md font-semibold mb-4 text-orange-700 dark:text-orange-300 flex items-center">
//               <Shield className="w-4 h-4 mr-2" />
//               Security & Device Management
//             </h4>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
//               {/* Maximum Devices */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   <Users className="w-4 h-4 inline mr-1" />
//                   Maximum Connected Devices
//                 </label>
//                 <EnhancedSelect
//                   value={pppoe.maxDevices ?? 0}
//                   onChange={(value) => onChange('pppoe', 'maxDevices', parseInt(value, 10) || 0)}
//                   options={deviceLimitOptions}
//                   placeholder="Select device limit"
//                   theme={theme}
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Limit simultaneous connections</p>
//               </div>

//               {/* Session Timeout */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   <Clock className="w-4 h-4 inline mr-1" />
//                   Session Timeout
//                 </label>
//                 <EnhancedSelect
//                   value={pppoe.sessionTimeout}
//                   onChange={(value) => onChange('pppoe', 'sessionTimeout', parseInt(value, 10))}
//                   options={sessionTimeoutOptions}
//                   theme={theme}
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Forces reconnection for security</p>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mt-4">
//               {/* Idle Timeout */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   Idle Timeout
//                 </label>
//                 <EnhancedSelect
//                   value={pppoe.idleTimeout}
//                   onChange={(value) => onChange('pppoe', 'idleTimeout', parseInt(value, 10))}
//                   options={idleTimeoutOptions}
//                   theme={theme}
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Disconnects after inactivity</p>
//               </div>

//               {/* MAC Binding */}
//               <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg gap-2">
//                 <div className="flex-1">
//                   <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                     <Smartphone className="w-4 h-4 inline mr-1" />
//                     Device Lock (MAC Binding)
//                   </label>
//                   <p className="text-xs text-gray-500 mt-1">
//                     Restrict access to specific devices only
//                   </p>
//                 </div>
//                 <div 
//                   onClick={() => onChange('pppoe', 'macBinding', !pppoe.macBinding)} 
//                   className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out flex-shrink-0 ${
//                     pppoe.macBinding 
//                       ? 'bg-green-600'
//                       : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//                   }`}
//                 >
//                   <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//                     pppoe.macBinding ? "translate-x-6" : "translate-x-1"
//                   }`} />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Plan Summary */}
//           <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-indigo-900/10' : 'bg-indigo-50'}`}>
//             <h4 className="text-md font-semibold mb-4 text-indigo-700 dark:text-indigo-300 flex items-center">
//               <Calendar className="w-4 h-4 mr-2" />
//               Plan Summary
//             </h4>
//             <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3">
//               <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//                 <Calendar className="w-5 h-5 text-blue-600 mx-auto mb-1" />
//                 <div className="text-sm font-semibold truncate">{planSummary.validity}</div>
//                 <div className="text-xs text-gray-500">Duration</div>
//               </div>
//               <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//                 <Database className="w-5 h-5 text-green-600 mx-auto mb-1" />
//                 <div className="text-sm font-semibold truncate">{planSummary.dataLimit}</div>
//                 <div className="text-xs text-gray-500">Total Data</div>
//               </div>
//               <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//                 <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
//                 <div className="text-sm font-semibold truncate">{planSummary.usageLimit}</div>
//                 <div className="text-xs text-gray-500">Daily Time</div>
//               </div>
//               <div className={`text-center p-3 rounded-lg flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//                 <Users className="w-5 h-5 text-orange-600 mx-auto mb-1" />
//                 <div className="text-sm font-semibold flex items-center justify-center gap-1">
//                   {planSummary.maxDevices === 'Unlimited' && <InfinityIcon className="w-4 h-4" />}
//                   <span className="truncate">{planSummary.maxDevices}</span>
//                 </div>
//                 <div className="text-xs text-gray-500">Max Devices</div>
//               </div>
//               <div className={`text-center p-3 rounded-lg flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//                 <Gauge className="w-5 h-5 text-teal-600 mx-auto mb-1" />
//                 <div className="text-sm font-semibold flex items-center justify-center gap-1">
//                   {planSummary.bandwidth === 'Unlimited' && <InfinityIcon className="w-4 h-4" />}
//                   <span className="truncate">{planSummary.bandwidth}</span>
//                 </div>
//                 <div className="text-xs text-gray-500">Bandwidth</div>
//               </div>
//               <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//                 <Shield className="w-5 h-5 text-red-600 mx-auto mb-1" />
//                 <div className="text-sm font-semibold truncate">{pppoe.macBinding ? 'Enabled' : 'Disabled'}</div>
//                 <div className="text-xs text-gray-500">Device Lock</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PPPoEConfiguration;













import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { EnhancedSelect, getThemeClasses } from "../Shared/components"
import { 
  speedUnits, 
  dataLimitPresets,
  usageLimitPresets,
  validityPeriodPresets,
  deviceLimitOptions,
  sessionTimeoutOptions,
  idleTimeoutOptions,
  bandwidthPresets
} from "../Shared/constant"
import { 
  Users, Clock, Shield, Calendar, Cable, Database, Zap, Gauge, 
  Smartphone, Infinity as InfinityIcon, AlertCircle 
} from "lucide-react";

const PPPoEConfiguration = ({ form, errors, onChange, onNestedChange, theme }) => {
  const themeClasses = getThemeClasses(theme);
  
  // Safely extract PPPoE configuration with fallbacks
  const access_methods = form.access_methods || form.accessMethods || {};
  const pppoe = access_methods.pppoe || {
    enabled: false,
    downloadSpeed: { value: "", unit: "Mbps" },
    uploadSpeed: { value: "", unit: "Mbps" },
    dataLimit: { value: "", unit: "GB" },
    usageLimit: { value: "", unit: "Hours" },
    bandwidthLimit: 0,
    maxDevices: 1,
    sessionTimeout: 86400,
    idleTimeout: 300,
    validityPeriod: { value: "", unit: "Days" },
    macBinding: false,
    ipPool: "pppoe-pool-1",
    serviceName: "",
    mtu: 1492
  };

  // State for preset selections with localStorage persistence
  const [dataLimitPreset, setDataLimitPreset] = useState(() => {
    const saved = localStorage.getItem('pppoe_dataLimitPreset');
    return saved || 'custom';
  });
  
  const [usageLimitPreset, setUsageLimitPreset] = useState(() => {
    const saved = localStorage.getItem('pppoe_usageLimitPreset');
    return saved || 'custom';
  });
  
  const [validityPreset, setValidityPreset] = useState(() => {
    const saved = localStorage.getItem('pppoe_validityPreset');
    return saved || 'custom';
  });
  
  const [bandwidthPreset, setBandwidthPreset] = useState(() => {
    const saved = localStorage.getItem('pppoe_bandwidthPreset');
    return saved || 'custom';
  });
  
  const [bandwidthUnit, setBandwidthUnit] = useState(() => {
    const saved = localStorage.getItem('pppoe_bandwidthUnit');
    return saved || 'Mbps';
  });

  // Save presets to localStorage
  useEffect(() => {
    localStorage.setItem('pppoe_dataLimitPreset', dataLimitPreset);
  }, [dataLimitPreset]);

  useEffect(() => {
    localStorage.setItem('pppoe_usageLimitPreset', usageLimitPreset);
  }, [usageLimitPreset]);

  useEffect(() => {
    localStorage.setItem('pppoe_validityPreset', validityPreset);
  }, [validityPreset]);

  useEffect(() => {
    localStorage.setItem('pppoe_bandwidthPreset', bandwidthPreset);
  }, [bandwidthPreset]);

  useEffect(() => {
    localStorage.setItem('pppoe_bandwidthUnit', bandwidthUnit);
  }, [bandwidthUnit]);

  // Reset validity period when component mounts if it's the default value
  useEffect(() => {
    if (pppoe.validityPeriod?.value === "720" && pppoe.validityPeriod?.unit === "Hours") {
      onNestedChange('pppoe', 'validityPeriod', 'value', '');
    }
  }, [pppoe.validityPeriod?.value, pppoe.validityPeriod?.unit, onNestedChange]);

  const handleToggle = useCallback(() => {
    onChange('pppoe', 'enabled', !pppoe.enabled);
  }, [onChange, pppoe.enabled]);

  // Safe unit renderer with error boundary
  const renderUnitDropdown = useCallback((field, value, onChangeFunc, units) => {
    const safeValue = value || (units[0] || 'Mbps');
    const safeOptions = units.map(unit => ({
      value: unit,
      label: unit
    }));

    return (
      <EnhancedSelect
        value={safeValue}
        onChange={(newValue) => {
          if (typeof onChangeFunc === 'function') {
            onNestedChange('pppoe', field, 'unit', newValue);
          }
        }}
        options={safeOptions}
        className="text-xs min-w-[5rem]"
        theme={theme}
      />
    );
  }, [theme, onNestedChange]);

  // Create preset options with validation
  const createPresetOptions = useCallback((presets, customLabel = 'Set custom') => {
    if (!Array.isArray(presets) || presets.length === 0) {
      return [{ value: 'custom', label: customLabel }];
    }

    const safePresets = presets.map(preset => {
      const label = preset?.label || '';
      const description = preset?.description || '';
      
      return {
        value: preset?.value?.toString() || '',
        label: `${label} - ${description}`
      };
    }).filter(preset => preset.value && preset.label);

    return [
      ...safePresets,
      { value: 'custom', label: customLabel }
    ];
  }, []);

  // Handle preset selections with validation
  const handleDataLimitPreset = useCallback((presetKey) => {
    setDataLimitPreset(presetKey);
    if (presetKey !== 'custom') {
      const preset = dataLimitPresets.find(p => String(p.value) === presetKey);
      if (preset) {
        onNestedChange('pppoe', 'dataLimit', 'value', preset.value);
        onNestedChange('pppoe', 'dataLimit', 'unit', preset.unit);
      }
    } else {
      onNestedChange('pppoe', 'dataLimit', 'value', '');
    }
  }, [dataLimitPresets, onNestedChange]);

  const handleUsageLimitPreset = useCallback((presetKey) => {
    setUsageLimitPreset(presetKey);
    if (presetKey !== 'custom') {
      const preset = usageLimitPresets.find(p => String(p.value) === presetKey);
      if (preset) {
        onNestedChange('pppoe', 'usageLimit', 'value', preset.value);
        onNestedChange('pppoe', 'usageLimit', 'unit', preset.unit);
      }
    } else {
      onNestedChange('pppoe', 'usageLimit', 'value', '');
    }
  }, [usageLimitPresets, onNestedChange]);

  const handleValidityPreset = useCallback((presetKey) => {
    setValidityPreset(presetKey);
    if (presetKey !== 'custom') {
      const preset = validityPeriodPresets.find(p => String(p.value) === presetKey);
      if (preset) {
        onNestedChange('pppoe', 'validityPeriod', 'value', preset.value);
        onNestedChange('pppoe', 'validityPeriod', 'unit', preset.unit);
      }
    } else {
      onNestedChange('pppoe', 'validityPeriod', 'value', '');
    }
  }, [validityPeriodPresets, onNestedChange]);

  // Create bandwidth options with validation
  const getBandwidthOptions = useCallback(() => {
    if (!Array.isArray(bandwidthPresets) || bandwidthPresets.length === 0) {
      return [{ value: 'custom', label: 'Set custom bandwidth' }];
    }

    const safeBandwidthPresets = bandwidthPresets.map(preset => {
      const label = preset?.label || '';
      const description = preset?.description || '';
      
      return {
        value: preset?.value?.toString() || '',
        label: preset.value === 0 
          ? 'Unlimited - No restrictions' 
          : `${label} - ${description}`
      };
    }).filter(preset => preset.value !== undefined);

    return [
      ...safeBandwidthPresets,
      { value: 'custom', label: 'Set custom bandwidth' }
    ];
  }, []);

  const handleBandwidthPreset = useCallback((presetKey) => {
    setBandwidthPreset(presetKey);
    if (presetKey !== 'custom') {
      const presetValue = parseInt(presetKey, 10);
      const preset = bandwidthPresets.find(p => p.value === presetValue);
      if (preset) {
        onChange('pppoe', 'bandwidthLimit', preset.value);
      }
    }
  }, [bandwidthPresets, onChange]);

  // Helper to format time for display
  const formatTimeDisplay = useCallback((seconds) => {
    if (!seconds || seconds === 0) return "No Limit";
    const hours = seconds / 3600;
    if (hours >= 24) {
      const days = hours / 24;
      return days === 1 ? "1 Day" : `${days} Days`;
    }
    return hours === 1 ? "1 Hour" : `${hours} Hours`;
  }, []);

  // Format bandwidth for display
  const formatBandwidthDisplay = useCallback((kbps) => {
    if (!kbps || kbps === 0) return "Unlimited";
    const numKbps = Number(kbps);
    if (numKbps >= 1000) {
      const mbps = numKbps / 1000;
      return `${mbps.toFixed(mbps % 1 === 0 ? 0 : 1)} Mbps`;
    }
    return `${numKbps} Kbps`;
  }, []);

  // Get display value for bandwidth input based on unit
  const getBandwidthDisplayValue = useCallback(() => {
    const bandwidth = Number(pppoe.bandwidthLimit) || 0;
    if (bandwidthUnit === 'Mbps') {
      return (bandwidth / 1000) || '';
    }
    return bandwidth || '';
  }, [pppoe.bandwidthLimit, bandwidthUnit]);

  // Handle bandwidth input change
  const handleBandwidthChange = useCallback((value) => {
    const numValue = parseFloat(value) || 0;
    if (bandwidthUnit === 'Mbps') {
      onChange('pppoe', 'bandwidthLimit', numValue * 1000);
    } else {
      onChange('pppoe', 'bandwidthLimit', numValue);
    }
  }, [bandwidthUnit, onChange]);

  // Auto-suggest MTU based on speed
  const getSuggestedMTU = useCallback((downloadSpeed) => {
    const speed = parseFloat(downloadSpeed) || 0;
    if (speed >= 100) return 1500;
    if (speed >= 50) return 1492;
    return 1480;
  }, []);

  // Get device limit options safely
  const getSafeDeviceLimitOptions = useCallback(() => {
    if (!Array.isArray(deviceLimitOptions) || deviceLimitOptions.length === 0) {
      return [{ value: 1, label: '1 Device' }];
    }
    
    return deviceLimitOptions.map(option => {
      if (typeof option === 'object' && option !== null) {
        return {
          value: option.value,
          label: option.label || String(option.value)
        };
      }
      return {
        value: option,
        label: String(option)
      };
    });
  }, []);

  // Get timeout options safely
  const getSafeTimeoutOptions = useCallback((optionsArray) => {
    if (!Array.isArray(optionsArray) || optionsArray.length === 0) {
      return [{ value: 3600, label: '1 Hour' }];
    }
    
    return optionsArray.map(option => {
      if (typeof option === 'object' && option !== null) {
        return {
          value: option.value,
          label: option.label || String(option.value)
        };
      }
      return {
        value: option,
        label: String(option)
      };
    });
  }, []);

  // Fixed plan summary with memoization
  const planSummary = useMemo(() => {
    const maxDevicesValue = Number.isNaN(pppoe.maxDevices) || pppoe.maxDevices === undefined 
      ? 0 
      : Number(pppoe.maxDevices);
    
    const dataLimitValue = pppoe.dataLimit?.value || '0';
    const dataLimitUnit = pppoe.dataLimit?.unit || 'GB';
    const dataLimitDisplay = dataLimitValue === 'Unlimited' 
      ? 'Unlimited' 
      : `${dataLimitValue} ${dataLimitUnit}`;
    
    const usageLimitValue = pppoe.usageLimit?.value || '0';
    const usageLimitUnit = pppoe.usageLimit?.unit || 'Hours';
    const usageLimitDisplay = usageLimitValue === 'Unlimited' 
      ? 'Unlimited' 
      : `${usageLimitValue} ${usageLimitUnit}`;

    const validityValue = pppoe.validityPeriod?.value || '0';
    const validityUnit = pppoe.validityPeriod?.unit || 'Days';
    const validityDisplay = validityValue === '0' || validityValue === 0
      ? 'No Expiry'
      : `${validityValue} ${validityUnit}`;

    return {
      dataLimit: dataLimitDisplay,
      usageLimit: usageLimitDisplay,
      validity: validityDisplay,
      maxDevices: maxDevicesValue === 0 ? 'Unlimited' : `${maxDevicesValue} device${maxDevicesValue > 1 ? 's' : ''}`,
      sessionTimeout: formatTimeDisplay(pppoe.sessionTimeout),
      idleTimeout: pppoe.idleTimeout === 0 ? 'No Timeout' : `${(pppoe.idleTimeout / 60)} minutes`,
      bandwidth: formatBandwidthDisplay(pppoe.bandwidthLimit),
      mtu: pppoe.mtu || 1492,
      ipPool: pppoe.ipPool || 'pppoe-pool-1',
      serviceName: pppoe.serviceName || 'Not set'
    };
  }, [pppoe, formatTimeDisplay, formatBandwidthDisplay]);

  // Handle input change with validation
  const handleInputChange = useCallback((field, subfield, value) => {
    onNestedChange('pppoe', field, subfield, value);
  }, [onNestedChange]);

  // Handle MTU auto-suggestion
  const handleDownloadSpeedChange = useCallback((value) => {
    handleInputChange('downloadSpeed', 'value', value);
    
    // Auto-suggest MTU if not already set
    if (!pppoe.mtu || pppoe.mtu === 1492) {
      const suggestedMTU = getSuggestedMTU(value);
      onChange('pppoe', 'mtu', suggestedMTU);
    }
  }, [handleInputChange, pppoe.mtu, getSuggestedMTU, onChange]);

  // Render speed configuration section
  const renderSpeedConfiguration = () => (
    <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-green-900/10' : 'bg-green-50'}`}>
      <h4 className="text-md font-semibold mb-4 text-green-700 dark:text-green-300 flex items-center">
        <Zap className="w-4 h-4 mr-2" />
        Speed & Bandwidth Settings
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {/* Download Speed */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
            Download Speed <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input 
              type="number" 
              value={pppoe.downloadSpeed?.value || ""} 
              onChange={(e) => handleDownloadSpeedChange(e.target.value)} 
              className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
              min="0.01" 
              step="0.01" 
              placeholder="e.g., 15" 
              required 
            />
            <div className="w-full sm:w-auto">
              {renderUnitDropdown('downloadSpeed', pppoe.downloadSpeed?.unit, onNestedChange, speedUnits)}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Maximum download speed for connection</p>
          {errors.pppoe_downloadSpeed && (
            <p className="text-red-500 text-xs mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.pppoe_downloadSpeed}
            </p>
          )}
        </div>
        
        {/* Upload Speed */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
            Upload Speed <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input 
              type="number" 
              value={pppoe.uploadSpeed?.value || ""} 
              onChange={(e) => handleInputChange('uploadSpeed', 'value', e.target.value)} 
              className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
              min="0.01" 
              step="0.01" 
              placeholder="e.g., 3" 
              required 
            />
            <div className="w-full sm:w-auto">
              {renderUnitDropdown('uploadSpeed', pppoe.uploadSpeed?.unit, onNestedChange, speedUnits)}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Maximum upload speed for connection</p>
          {errors.pppoe_uploadSpeed && (
            <p className="text-red-500 text-xs mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.pppoe_uploadSpeed}
            </p>
          )}
        </div>
      </div>

      {/* Bandwidth Limit */}
      <div className="mt-6">
        <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
          <Gauge className="w-4 h-4 inline mr-1" />
          Total Bandwidth Limit
          <span className="text-xs text-gray-500 ml-2">Shared bandwidth for this connection</span>
        </label>
        
        <div className="mb-3">
          <EnhancedSelect
            value={bandwidthPreset}
            onChange={handleBandwidthPreset}
            options={getBandwidthOptions()}
            theme={theme}
            disabled={!pppoe.enabled}
          />
        </div>
        
        {bandwidthPreset === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <input 
                type="number" 
                value={getBandwidthDisplayValue()} 
                onChange={(e) => handleBandwidthChange(e.target.value)} 
                className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                min="0" 
                step="any" 
                placeholder="Enter value" 
                disabled={!pppoe.enabled}
              />
              <EnhancedSelect
                value={bandwidthUnit}
                onChange={setBandwidthUnit}
                options={[
                  { value: 'Mbps', label: 'Mbps' },
                  { value: 'Kbps', label: 'Kbps' }
                ]}
                className="text-xs min-w-[5rem]"
                theme={theme}
                disabled={!pppoe.enabled}
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">
                ({formatBandwidthDisplay(pppoe.bandwidthLimit)})
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Enter bandwidth and select unit. Internally stored as Kbps.
            </p>
          </motion.div>
        )}
        
        {bandwidthPreset !== 'custom' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`p-3 rounded-lg flex items-center gap-2 ${theme === 'dark' ? 'bg-green-800/20' : 'bg-green-100'}`}
          >
            {pppoe.bandwidthLimit === 0 && <InfinityIcon className="w-4 h-4 text-green-600 dark:text-green-300" />}
            <p className="text-sm text-green-700 dark:text-green-300">
              <strong>Selected:</strong> {formatBandwidthDisplay(pppoe.bandwidthLimit)}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );

  // Render data & usage limits section
  const renderDataUsageLimits = () => (
    <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-purple-900/10' : 'bg-purple-50'}`}>
      <h4 className="text-md font-semibold mb-4 text-purple-700 dark:text-purple-300 flex items-center">
        <Database className="w-4 h-4 mr-2" />
        Plan Limits & Duration
      </h4>
      
      {/* Validity Period */}
      <div className="mb-6">
        <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
          <Calendar className="w-4 h-4 inline mr-1" />
          Plan Duration <span className="text-red-500">*</span>
        </label>
        <div className="mb-2">
          <EnhancedSelect
            value={validityPreset}
            onChange={handleValidityPreset}
            options={createPresetOptions(validityPeriodPresets, 'Set custom duration')}
            theme={theme}
            disabled={!pppoe.enabled}
          />
        </div>
        {validityPreset === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                value={pppoe.validityPeriod?.value || ""} 
                onChange={(e) => handleInputChange('validityPeriod', 'value', e.target.value)} 
                className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                placeholder="Enter duration value" 
                required 
                disabled={!pppoe.enabled}
              />
              <div className="w-full sm:w-auto">
                {renderUnitDropdown('validityPeriod', pppoe.validityPeriod?.unit, onNestedChange, ['Hours', 'Days', 'Weeks', 'Months'])}
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Set the custom duration for this plan
            </p>
          </motion.div>
        )}
        <p className="text-xs text-gray-500 mt-1">How long the plan remains active after activation</p>
      </div>

      {/* Data Limit */}
      <div className="mb-6">
        <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
          Total Data Allowance <span className="text-red-500">*</span>
        </label>
        <div className="mb-2">
          <EnhancedSelect
            value={dataLimitPreset}
            onChange={handleDataLimitPreset}
            options={createPresetOptions(dataLimitPresets, 'Set custom data amount')}
            theme={theme}
            disabled={!pppoe.enabled}
          />
        </div>
        {dataLimitPreset === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                value={pppoe.dataLimit?.value || ""} 
                onChange={(e) => handleInputChange('dataLimit', 'value', e.target.value)} 
                className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                placeholder="Enter data amount" 
                required 
                disabled={!pppoe.enabled}
              />
              <div className="w-full sm:w-auto">
                {renderUnitDropdown('dataLimit', pppoe.dataLimit?.unit, onNestedChange, ['MB', 'GB', 'TB', 'Unlimited'])}
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Set the custom data limit for this plan
            </p>
          </motion.div>
        )}
        <p className="text-xs text-gray-500 mt-1">Total data available for the entire plan duration</p>
        {errors.pppoe_dataLimit && (
          <p className="text-red-500 text-xs mt-1 flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            {errors.pppoe_dataLimit}
          </p>
        )}
      </div>

      {/* Usage Limit */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
          <Clock className="w-4 h-4 inline mr-1" />
          Daily Time Limit <span className="text-red-500">*</span>
        </label>
        <div className="mb-2">
          <EnhancedSelect
            value={usageLimitPreset}
            onChange={handleUsageLimitPreset}
            options={createPresetOptions(usageLimitPresets, 'Set custom hours')}
            theme={theme}
            disabled={!pppoe.enabled}
          />
        </div>
        {usageLimitPreset === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                value={pppoe.usageLimit?.value || ""} 
                onChange={(e) => handleInputChange('usageLimit', 'value', e.target.value)} 
                className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                placeholder="Enter hours per day" 
                required 
                disabled={!pppoe.enabled}
              />
              <div className="w-full sm:w-auto">
                {renderUnitDropdown('usageLimit', pppoe.usageLimit?.unit, onNestedChange, ['Hours', 'Unlimited'])}
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Set the custom daily usage limit in hours
            </p>
          </motion.div>
        )}
        <p className="text-xs text-gray-500 mt-1">Maximum connection time allowed per day</p>
        {errors.pppoe_usageLimit && (
          <p className="text-red-500 text-xs mt-1 flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            {errors.pppoe_usageLimit}
          </p>
        )}
      </div>
    </div>
  );

  // Render PPPoE Network Settings section
  const renderNetworkSettings = () => (
    <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-blue-900/10' : 'bg-blue-50'}`}>
      <h4 className="text-md font-semibold mb-4 text-blue-700 dark:text-blue-300 flex items-center">
        <Cable className="w-4 h-4 mr-2" />
        PPPoE Network Settings
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {/* IP Pool */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
            IP Pool
          </label>
          <input 
            value={pppoe.ipPool || ""} 
            onChange={(e) => onChange('pppoe', 'ipPool', e.target.value)} 
            className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
            placeholder="pppoe-pool-1" 
            disabled={!pppoe.enabled}
          />
          <p className="text-xs text-gray-500 mt-1">IP pool name for PPPoE users</p>
        </div>

        {/* Service Name */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
            Service Name
          </label>
          <input 
            value={pppoe.serviceName || ""} 
            onChange={(e) => onChange('pppoe', 'serviceName', e.target.value)} 
            className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
            placeholder="PPPoE Service" 
            disabled={!pppoe.enabled}
          />
          <p className="text-xs text-gray-500 mt-1">Service identifier for PPPoE</p>
        </div>
      </div>

      {/* MTU */}
      <div className="mt-6">
        <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
          MTU (Maximum Transmission Unit)
          <span className="text-xs text-gray-500 ml-2">Recommended: 1492 for most ISPs</span>
        </label>
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <div className="flex-1 flex flex-col sm:flex-row gap-2">
            <input 
              type="number" 
              value={pppoe.mtu || 1492} 
              onChange={(e) => onChange('pppoe', 'mtu', parseInt(e.target.value, 10) || 1492)} 
              className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
              min="576" 
              max="1500" 
              step="1" 
              placeholder="1492" 
              disabled={!pppoe.enabled}
            />
            <button
              type="button"
              onClick={() => {
                const suggestedMTU = getSuggestedMTU(pppoe.downloadSpeed?.value);
                onChange('pppoe', 'mtu', suggestedMTU);
              }}
              disabled={!pppoe.enabled}
              className={`px-3 py-2 text-xs rounded-lg transition-colors whitespace-nowrap ${
                !pppoe.enabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Auto Suggest
            </button>
          </div>
          <div className={`text-sm px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
            <span className="font-medium">Current: </span>
            {pppoe.mtu || 1492} bytes
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Maximum data packet size. Auto suggests optimal value based on download speed.
        </p>
        <div className="mt-2 text-xs text-gray-500">
          <span className="font-medium">Common values: </span>
          1492 (PPPoE over Ethernet), 1500 (Ethernet standard)
        </div>
      </div>
    </div>
  );

  // Render security & management features
  const renderSecurityFeatures = () => (
    <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-orange-900/10' : 'bg-orange-50'}`}>
      <h4 className="text-md font-semibold mb-4 text-orange-700 dark:text-orange-300 flex items-center">
        <Shield className="w-4 h-4 mr-2" />
        Security & Device Management
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {/* Maximum Devices */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
            <Users className="w-4 h-4 inline mr-1" />
            Maximum Connected Devices
          </label>
          <EnhancedSelect
            value={pppoe.maxDevices ?? 0}
            onChange={(value) => onChange('pppoe', 'maxDevices', parseInt(value, 10) || 0)}
            options={getSafeDeviceLimitOptions()}
            placeholder="Select device limit"
            theme={theme}
            disabled={!pppoe.enabled}
          />
          <p className="text-xs text-gray-500 mt-1">Limit simultaneous connections</p>
        </div>

        {/* Session Timeout */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
            <Clock className="w-4 h-4 inline mr-1" />
            Session Timeout
          </label>
          <EnhancedSelect
            value={pppoe.sessionTimeout}
            onChange={(value) => onChange('pppoe', 'sessionTimeout', parseInt(value, 10))}
            options={getSafeTimeoutOptions(sessionTimeoutOptions)}
            theme={theme}
            disabled={!pppoe.enabled}
          />
          <p className="text-xs text-gray-500 mt-1">Forces reconnection for security</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mt-4">
        {/* Idle Timeout */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
            Idle Timeout
          </label>
          <EnhancedSelect
            value={pppoe.idleTimeout}
            onChange={(value) => onChange('pppoe', 'idleTimeout', parseInt(value, 10))}
            options={getSafeTimeoutOptions(idleTimeoutOptions)}
            theme={theme}
            disabled={!pppoe.enabled}
          />
          <p className="text-xs text-gray-500 mt-1">Disconnects after inactivity</p>
        </div>

        {/* MAC Binding */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg gap-2">
          <div className="flex-1">
            <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
              <Smartphone className="w-4 h-4 inline mr-1" />
              Device Lock (MAC Binding)
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Restrict access to specific devices only
            </p>
          </div>
          <div 
            onClick={() => pppoe.enabled && onChange('pppoe', 'macBinding', !pppoe.macBinding)} 
            className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out flex-shrink-0 ${
              !pppoe.enabled 
                ? 'cursor-not-allowed opacity-50 bg-gray-400' 
                : pppoe.macBinding 
                  ? 'bg-green-600'
                  : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
              pppoe.macBinding ? "translate-x-6" : "translate-x-1"
            }`} />
          </div>
        </div>
      </div>
    </div>
  );

  // Render plan summary
  const renderPlanSummary = () => (
    <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-indigo-900/10' : 'bg-indigo-50'}`}>
      <h4 className="text-md font-semibold mb-4 text-indigo-700 dark:text-indigo-300 flex items-center">
        <Calendar className="w-4 h-4 mr-2" />
        PPPoE Plan Summary
      </h4>
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3">
        <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <Calendar className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <div className="text-sm font-semibold truncate">{planSummary.validity}</div>
          <div className="text-xs text-gray-500">Duration</div>
        </div>
        <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <Database className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <div className="text-sm font-semibold truncate">{planSummary.dataLimit}</div>
          <div className="text-xs text-gray-500">Total Data</div>
        </div>
        <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
          <div className="text-sm font-semibold truncate">{planSummary.usageLimit}</div>
          <div className="text-xs text-gray-500">Daily Time</div>
        </div>
        <div className={`text-center p-3 rounded-lg flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <Users className="w-5 h-5 text-orange-600 mx-auto mb-1" />
          <div className="text-sm font-semibold flex items-center justify-center gap-1">
            {planSummary.maxDevices === 'Unlimited' && <InfinityIcon className="w-4 h-4" />}
            <span className="truncate">{planSummary.maxDevices}</span>
          </div>
          <div className="text-xs text-gray-500">Max Devices</div>
        </div>
        <div className={`text-center p-3 rounded-lg flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <Gauge className="w-5 h-5 text-teal-600 mx-auto mb-1" />
          <div className="text-sm font-semibold flex items-center justify-center gap-1">
            {planSummary.bandwidth === 'Unlimited' && <InfinityIcon className="w-4 h-4" />}
            <span className="truncate">{planSummary.bandwidth}</span>
          </div>
          <div className="text-xs text-gray-500">Bandwidth</div>
        </div>
        <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <Shield className="w-5 h-5 text-red-600 mx-auto mb-1" />
          <div className="text-sm font-semibold truncate">{pppoe.macBinding ? 'Enabled' : 'Disabled'}</div>
          <div className="text-xs text-gray-500">Device Lock</div>
        </div>
      </div>
      
      {/* Network Specific Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h5 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Network Configuration</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
            <span className="text-xs text-gray-600 dark:text-gray-400">IP Pool:</span>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{planSummary.ipPool}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
            <span className="text-xs text-gray-600 dark:text-gray-400">MTU:</span>
            <span className="text-xs font-medium text-green-600 dark:text-green-400">{planSummary.mtu} bytes</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg lg:text-xl font-semibold flex items-center">
          <Cable className="w-5 h-5 mr-2 text-green-600" />
          PPPoE Configuration
        </h3>
        <div className="flex items-center">
          <label className={`block text-sm font-medium mr-4 ${themeClasses.text.primary}`}>
            Enable PPPoE
          </label>
          <div 
            onClick={handleToggle}
            className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
              pppoe.enabled 
                ? 'bg-green-600'
                : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
              pppoe.enabled ? "translate-x-6" : "translate-x-1"
            }`} />
          </div>
        </div>
      </div>

      {pppoe.enabled ? (
        <div className="space-y-6 lg:space-y-8">
          {renderSpeedConfiguration()}
          {renderDataUsageLimits()}
          {renderNetworkSettings()}
          {renderSecurityFeatures()}
          {renderPlanSummary()}
        </div>
      ) : (
        <div className={`p-8 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <Cable className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h4 className="text-lg font-medium mb-2 text-gray-600">PPPoE Disabled</h4>
          <p className="text-sm text-gray-500 mb-4">
            Enable PPPoE to configure wired network access settings for this plan.
          </p>
          <button
            onClick={handleToggle}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Enable PPPoE
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(PPPoEConfiguration);