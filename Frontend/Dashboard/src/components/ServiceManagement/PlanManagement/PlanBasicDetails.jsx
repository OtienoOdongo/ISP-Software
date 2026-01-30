

// import React from "react";
// import { motion } from "framer-motion";
// import { EnhancedSelect, getThemeClasses } from "../Shared/components";
// import { planTypes, categories } from "../Shared/constant"
// import { Wifi, Cable } from "lucide-react";

// const PlanBasicDetails = ({ form, errors, touched, onChange, onAccessTypeChange, onBlur, theme }) => {
//   const themeClasses = getThemeClasses(theme);

//   // Access type options with icons
//   const accessTypeOptions = [
//     { value: "hotspot", label: "Hotspot", icon: Wifi, description: "Wireless access for multiple users" },
//     { value: "pppoe", label: "PPPoE", icon: Cable, description: "Wired connection with authentication" }
//   ];

//   return (
//     <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4">Basic Details</h3>
//       <div className="space-y-4 lg:space-y-6">
//         {/* Access Type Selection - NEW: Clear separation */}
//         <div>
//           <label className={`block text-sm font-medium mb-3 ${themeClasses.text.primary}`}>
//             Access Type <span className="text-red-500">*</span>
//           </label>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {accessTypeOptions.map((option) => {
//               const IconComponent = option.icon;
//               const isSelected = form.accessType === option.value;
              
//               return (
//                 <motion.div
//                   key={option.value}
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={() => onAccessTypeChange(option.value)}
//                   className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
//                     isSelected
//                       ? option.value === 'hotspot'
//                         ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
//                         : 'border-green-500 bg-green-50 dark:bg-green-900/20'
//                       : `${themeClasses.border.light} ${themeClasses.bg.card} hover:bg-gray-50 dark:hover:bg-gray-700/50`
//                   }`}
//                 >
//                   <div className="flex items-center space-x-3">
//                     <div className={`p-2 rounded-full ${
//                       isSelected
//                         ? option.value === 'hotspot'
//                           ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300'
//                           : 'bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-300'
//                         : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
//                     }`}>
//                       <IconComponent className="w-5 h-5" />
//                     </div>
//                     <div className="flex-1">
//                       <h4 className={`font-semibold ${
//                         isSelected ? themeClasses.text.primary : themeClasses.text.secondary
//                       }`}>
//                         {option.label}
//                       </h4>
//                       <p className={`text-xs mt-1 ${
//                         isSelected ? themeClasses.text.secondary : themeClasses.text.tertiary
//                       }`}>
//                         {option.description}
//                       </p>
//                     </div>
//                     {isSelected && (
//                       <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
//                         option.value === 'hotspot'
//                           ? 'bg-blue-500 text-white'
//                           : 'bg-green-500 text-white'
//                       }`}>
//                         ✓
//                       </div>
//                     )}
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </div>
//         </div>

//         <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
//           <div>
//             <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//               Plan Type <span className="text-red-500">*</span>
//             </label>
//             <EnhancedSelect
//               value={form.planType}
//               onChange={(value) => onChange({ target: { name: 'planType', value } })}
//               options={planTypes.map(type => ({ value: type, label: type }))}
//               placeholder="Select Plan Type"
//               theme={theme}
//             />
//             {errors.planType && <p className="text-red-500 text-xs mt-1">{errors.planType}</p>}
//           </div>
//           <div>
//             <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//               Name <span className="text-red-500">*</span>
//             </label>
//             <input 
//               name="name" 
//               value={form.name || ""} 
//               onChange={onChange}
//               onBlur={() => onBlur('name')}
//               className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//               placeholder="e.g., Rural Wi-Fi Pro" 
//               required 
//             />
//             {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
//           </div>
//         </div>
//         <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
//           <div>
//             <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//               Category <span className="text-red-500">*</span>
//             </label>
//             <EnhancedSelect
//               value={form.category}
//               onChange={(value) => onChange({ target: { name: 'category', value } })}
//               options={categories.map(cat => ({ value: cat, label: cat }))}
//               placeholder="Select Category"
//               theme={theme}
//             />
//             {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
//           </div>
//           <div>
//             <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//               Price (Ksh) {form.planType === "Paid" && <span className="text-red-500">*</span>}
//             </label>
//             <input
//               type="number" 
//               name="price" 
//               value={form.price || ""} 
//               onChange={onChange}
//               onBlur={() => onBlur('price')}
//               disabled={form.planType !== "Paid"}
//               className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${
//                 form.planType !== "Paid" 
//                   ? "bg-gray-100 cursor-not-allowed border-gray-300" 
//                   : themeClasses.input
//               }`}
//               placeholder="e.g., 29.99" 
//               step="0.01" 
//               min="0" 
//               required={form.planType === "Paid"}
//             />
//             {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
//           </div>
//         </div>
//         <div>
//           <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//             Description
//           </label>
//           <textarea 
//             name="description" 
//             value={form.description || ""} 
//             onChange={onChange}
//             rows={3}
//             className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//             placeholder="Describe the plan features and benefits..."
//           />
//         </div>
//         <div className="flex items-center">
//           <label className={`block text-sm font-medium mr-4 ${themeClasses.text.primary}`}>
//             Active
//           </label>
//           <div 
//             onClick={() => onChange({ target: { name: 'active', type: 'checkbox', checked: !form.active } })} 
//             className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
//               form.active 
//                 ? 'bg-indigo-600'
//                 : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//             }`}
//           >
//             <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//               form.active ? "translate-x-6" : "translate-x-1"
//             }`} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PlanBasicDetails;









// import React from "react";
// import { motion } from "framer-motion";
// import { EnhancedSelect, getThemeClasses } from "../Shared/components";
// import { planTypes, categories } from "../Shared/constant"
// import { Wifi, Cable } from "lucide-react";

// const PlanBasicDetails = ({ form, errors, touched, onChange, onAccessTypeChange, onBlur, theme }) => {
//   const themeClasses = getThemeClasses(theme);

//   // Access type options with icons
//   const accessTypeOptions = [
//     { value: "hotspot", label: "Hotspot", icon: Wifi, description: "Wireless access for multiple users" },
//     { value: "pppoe", label: "PPPoE", icon: Cable, description: "Wired connection with authentication" },
//     { value: "dual", label: "Dual Access", icon: (props) => (
//       <div className="flex">
//         <Wifi className="w-3 h-3 mr-1" {...props} />
//         <Cable className="w-3 h-3" {...props} />
//       </div>
//     ), description: "Both wireless and wired access" }
//   ];

//   // Priority level options
//   const priorityOptions = [
//     { value: 1, label: "Lowest (1)", description: "Lowest priority" },
//     { value: 2, label: "Low (2)", description: "Low priority" },
//     { value: 3, label: "Medium (3)", description: "Standard priority" },
//     { value: 4, label: "High (4)", description: "High priority" },
//     { value: 5, label: "Highest (5)", description: "Highest priority" },
//     { value: 6, label: "Critical (6)", description: "Critical priority" },
//     { value: 7, label: "Premium (7)", description: "Premium priority" },
//     { value: 8, label: "VIP (8)", description: "VIP priority" }
//   ];

//   return (
//     <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4">Basic Details</h3>
//       <div className="space-y-4 lg:space-y-6">
//         {/* Access Type Selection */}
//         <div>
//           <label className={`block text-sm font-medium mb-3 ${themeClasses.text.primary}`}>
//             Access Type <span className="text-red-500">*</span>
//           </label>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//             {accessTypeOptions.map((option) => {
//               const IconComponent = option.icon;
//               const isSelected = form.accessType === option.value;
//               const isDisabled = false; // Add any logic for disabled states
              
//               return (
//                 <motion.div
//                   key={option.value}
//                   whileHover={{ scale: isDisabled ? 1 : 1.02 }}
//                   whileTap={{ scale: isDisabled ? 1 : 0.98 }}
//                   onClick={() => !isDisabled && onAccessTypeChange(option.value)}
//                   className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
//                     isSelected
//                       ? option.value === 'hotspot'
//                         ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
//                         : option.value === 'pppoe'
//                         ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
//                         : 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
//                       : `${themeClasses.border.light} ${themeClasses.bg.card} hover:bg-gray-50 dark:hover:bg-gray-700/50`
//                   } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
//                 >
//                   <div className="flex items-center space-x-3">
//                     <div className={`p-2 rounded-full ${
//                       isSelected
//                         ? option.value === 'hotspot'
//                           ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300'
//                           : option.value === 'pppoe'
//                           ? 'bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-300'
//                           : 'bg-purple-100 text-purple-600 dark:bg-purple-800 dark:text-purple-300'
//                         : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
//                     }`}>
//                       <IconComponent className="w-5 h-5" />
//                     </div>
//                     <div className="flex-1">
//                       <h4 className={`font-semibold ${
//                         isSelected ? themeClasses.text.primary : themeClasses.text.secondary
//                       }`}>
//                         {option.label}
//                       </h4>
//                       <p className={`text-xs mt-1 ${
//                         isSelected ? themeClasses.text.secondary : themeClasses.text.tertiary
//                       }`}>
//                         {option.description}
//                       </p>
//                     </div>
//                     {isSelected && (
//                       <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
//                         option.value === 'hotspot'
//                           ? 'bg-blue-500 text-white'
//                           : option.value === 'pppoe'
//                           ? 'bg-green-500 text-white'
//                           : 'bg-purple-500 text-white'
//                       }`}>
//                         ✓
//                       </div>
//                     )}
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </div>
//         </div>

//         <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
//           <div>
//             <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//               Plan Type <span className="text-red-500">*</span>
//             </label>
//             <EnhancedSelect
//               value={form.planType}
//               onChange={(value) => onChange({ target: { name: 'planType', value } })}
//               options={planTypes.map(type => ({ value: type, label: type }))}
//               placeholder="Select Plan Type"
//               theme={theme}
//             />
//             <p className="text-xs text-gray-500 mt-1">
//               {form.planType === 'free_trial' ? 'Free Trial plans cannot have premium priority levels' : ''}
//             </p>
//             {errors.planType && <p className="text-red-500 text-xs mt-1">{errors.planType}</p>}
//           </div>
//           <div>
//             <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//               Name <span className="text-red-500">*</span>
//             </label>
//             <input 
//               name="name" 
//               value={form.name || ""} 
//               onChange={onChange}
//               onBlur={() => onBlur('name')}
//               className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//               placeholder="e.g., Rural Wi-Fi Pro" 
//               required 
//             />
//             {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
//           </div>
//         </div>
        
//         <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
//           <div>
//             <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//               Category <span className="text-red-500">*</span>
//             </label>
//             <EnhancedSelect
//               value={form.category}
//               onChange={(value) => onChange({ target: { name: 'category', value } })}
//               options={categories.map(cat => ({ value: cat, label: cat }))}
//               placeholder="Select Category"
//               theme={theme}
//             />
//             {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
//           </div>
//           <div>
//             <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//               Price (KES) {form.planType === "paid" && <span className="text-red-500">*</span>}
//             </label>
//             <div className="flex items-center">
//               <span className="mr-2 text-gray-500">KES</span>
//               <input
//                 type="number" 
//                 name="price" 
//                 value={form.price || ""} 
//                 onChange={onChange}
//                 onBlur={() => onBlur('price')}
//                 disabled={form.planType === "free_trial"}
//                 className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${
//                   form.planType === "free_trial" 
//                     ? "bg-gray-100 cursor-not-allowed border-gray-300" 
//                     : themeClasses.input
//                 }`}
//                 placeholder="e.g., 2999" 
//                 step="1" 
//                 min="0" 
//                 required={form.planType === "paid"}
//               />
//             </div>
//             {form.planType === "free_trial" && (
//               <p className="text-xs text-gray-500 mt-1">Free Trial plans must have price set to 0</p>
//             )}
//             {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
//           </div>
//         </div>
        
//         <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
//           <div>
//             <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//               Priority Level <span className="text-red-500">*</span>
//             </label>
//             <EnhancedSelect
//               value={form.priority_level || 4}
//               onChange={(value) => onChange({ target: { name: 'priority_level', value: parseInt(value) } })}
//               options={priorityOptions}
//               placeholder="Select Priority Level"
//               theme={theme}
//               disabled={form.planType === "free_trial"}
//             />
//             <p className="text-xs text-gray-500 mt-1">
//               {form.planType === "free_trial" 
//                 ? "Free Trial plans cannot have premium priority levels" 
//                 : "Higher priority plans appear first"}
//             </p>
//           </div>
//           <div>
//             <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//               Template
//             </label>
//             <EnhancedSelect
//               value={form.template || ""}
//               onChange={(value) => onChange({ target: { name: 'template', value } })}
//               options={[
//                 { value: "", label: "No Template (Custom Plan)" },
//                 // Template options would be populated from API
//                 { value: "template_1", label: "Basic Residential" },
//                 { value: "template_2", label: "Business Premium" },
//                 { value: "template_3", label: "Promotional Offer" }
//               ]}
//               placeholder="Select Template (Optional)"
//               theme={theme}
//             />
//             <p className="text-xs text-gray-500 mt-1">Use a template for faster plan creation</p>
//           </div>
//         </div>
        
//         <div>
//           <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//             Description
//           </label>
//           <textarea 
//             name="description" 
//             value={form.description || ""} 
//             onChange={onChange}
//             rows={3}
//             className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//             placeholder="Describe the plan features and benefits..."
//           />
//           <p className="text-xs text-gray-500 mt-1">Markdown is supported in the description</p>
//         </div>
        
//         <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
//           <div className="flex items-center">
//             <div className="flex items-center mr-6">
//               <label className={`block text-sm font-medium mr-4 ${themeClasses.text.primary}`}>
//                 Active
//               </label>
//               <div 
//                 onClick={() => onChange({ target: { name: 'active', type: 'checkbox', checked: !form.active } })} 
//                 className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
//                   form.active 
//                     ? 'bg-green-600'
//                     : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//                 }`}
//               >
//                 <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//                   form.active ? "translate-x-6" : "translate-x-1"
//                 }`} />
//               </div>
//             </div>
//             <div className="flex items-center">
//               <label className={`block text-sm font-medium mr-4 ${themeClasses.text.primary}`}>
//                 Router Specific
//               </label>
//               <div 
//                 onClick={() => onChange({ target: { name: 'router_specific', type: 'checkbox', checked: !form.router_specific } })} 
//                 className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
//                   form.router_specific 
//                     ? 'bg-blue-600'
//                     : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//                 }`}
//               >
//                 <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//                   form.router_specific ? "translate-x-6" : "translate-x-1"
//                 }`} />
//               </div>
//             </div>
//           </div>
          
//           {form.planType === "paid" && (
//             <div className="flex items-center">
//               <label className={`block text-sm font-medium mr-4 ${themeClasses.text.primary}`}>
//                 Apply Discounts
//               </label>
//               <div 
//                 onClick={() => onChange({ target: { name: 'allow_discounts', type: 'checkbox', checked: !form.allow_discounts } })} 
//                 className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
//                   form.allow_discounts 
//                     ? 'bg-purple-600'
//                     : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//                 }`}
//               >
//                 <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//                   form.allow_discounts ? "translate-x-6" : "translate-x-1"
//                 }`} />
//               </div>
//             </div>
//           )}
//         </div>
        
//         {/* FUP Settings */}
//         <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-yellow-900/10' : 'bg-yellow-50'}`}>
//           <h4 className="text-md font-semibold mb-3 text-yellow-700 dark:text-yellow-300">
//             Fair Usage Policy (FUP)
//           </h4>
//           <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                 FUP Threshold (%)
//               </label>
//               <input
//                 type="number"
//                 name="FUP_threshold"
//                 value={form.FUP_threshold || 80}
//                 onChange={onChange}
//                 min="1"
//                 max="100"
//                 className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//               />
//               <p className="text-xs text-gray-500 mt-1">
//                 Usage threshold percentage for FUP (1-100%)
//               </p>
//             </div>
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                 FUP Policy Description
//               </label>
//               <textarea
//                 name="FUP_policy"
//                 value={form.FUP_policy || ""}
//                 onChange={onChange}
//                 rows={2}
//                 className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                 placeholder="Describe the fair usage policy..."
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PlanBasicDetails;










import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { EnhancedSelect, getThemeClasses } from "../Shared/components";
import { planTypes, categories, priorityOptions } from "../Shared/constant";
import { Wifi, Cable, Info, HelpCircle, X, Check } from "lucide-react";

const PlanBasicDetails = ({ form, errors, touched, onChange, onAccessTypeChange, onBlur, theme }) => {
  const themeClasses = getThemeClasses(theme);
  const [priceValue, setPriceValue] = useState(form.price || "");
  const [localTouched, setLocalTouched] = useState({});
  
  // Use refs to prevent infinite loops with unstable dependencies
  const onChangeRef = useRef(onChange);
  const onAccessTypeChangeRef = useRef(onAccessTypeChange);
  
  // Update refs when props change
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  
  useEffect(() => {
    onAccessTypeChangeRef.current = onAccessTypeChange;
  }, [onAccessTypeChange]);

  // Access type options with icons
  const accessTypeOptions = [
    { 
      value: "hotspot", 
      label: "Hotspot", 
      icon: Wifi, 
      description: "Wireless access for multiple users",
      help: "Users connect via Wi-Fi to a shared access point"
    },
    { 
      value: "pppoe", 
      label: "PPPoE", 
      icon: Cable, 
      description: "Wired connection with authentication",
      help: "Users connect directly with username/password authentication"
    },
    { 
      value: "both", 
      label: "Dual Access", 
      icon: (props) => (
        <div className="flex">
          <Wifi className="w-3 h-3 mr-1" {...props} />
          <Cable className="w-3 h-3" {...props} />
        </div>
      ), 
      description: "Both wireless and wired access",
      help: "Users can choose either Hotspot or PPPoE connection"
    }
  ];

  // Access method enforcement
  useEffect(() => {
    if (form.plan_type === 'free_trial' && form.access_method === 'pppoe') {
      onChange('access_method', 'hotspot');
      onAccessTypeChangeRef.current?.('hotspot');
    }
  }, [form.plan_type, form.access_method]);

  // Price enforcement for free_trial, and clear for paid
  useEffect(() => {
    if (form.plan_type === 'free_trial') {
      if (parseFloat(form.price) !== 0 && form.price !== '') {
        onChange('price', '0');
        setPriceValue("0");
      }
    } else if (form.plan_type === 'paid') {
      if (form.price === '0' || form.price === '0.00') {
        onChange('price', '');
        setPriceValue("");
      }
    }
  }, [form.plan_type, form.price]);

  // Priority enforcement
  useEffect(() => {
    if (form.plan_type === 'free_trial' && form.priority_level > 4) {
      onChange('priority_level', 4);
    }
  }, [form.plan_type, form.priority_level]);

  // Handle price change - lenient for editing
  const handlePriceChange = useCallback((e) => {
    let value = e.target.value;
    
    // Allow numbers, one dot, and temporary states (e.g., leading dot)
    // Trim leading zeros except for '0.' 
    value = value.replace(/^0+(?=\d)/, '');
    if (value === "" || /^(\d+)?(\.\d*)?$/.test(value)) {
      setPriceValue(value);
      onChange('price', value);
    }
  }, []);

  // Handle plan type change - clear price if switching to paid
  const handlePlanTypeChange = useCallback((value) => {
    onChange('plan_type', value);
    if (value === 'paid' && (form.price === '0' || form.price === '0.00' || form.price === '')) {
      onChange('price', '');
      setPriceValue('');
    }
  }, [form.price]);

  // Handle access type change
  const handleAccessChange = useCallback((value) => {
    onChange('access_method', value);
    if (onAccessTypeChange) onAccessTypeChange(value);
    
    // Mark as touched for validation
    if (onBlur) onBlur('access_method');
    setLocalTouched(prev => ({ ...prev, access_method: true }));
  }, [onAccessTypeChange, onBlur]);

  // Handle keyboard navigation for access type cards
  const handleAccessKeyDown = useCallback((e, value) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleAccessChange(value);
    }
  }, [handleAccessChange]);

  // Handle name change
  const handleNameChange = useCallback((e) => {
    onChange('name', e.target.value);
  }, []);

  // Handle category change
  const handleCategoryChange = useCallback((value) => {
    onChange('category', value);
  }, []);

  // Handle priority change
  const handlePriorityChange = useCallback((value) => {
    onChange('priority_level', parseInt(value, 10));
  }, []);

  // Handle template change
  const handleTemplateChange = useCallback((value) => {
    onChange('template', value);
  }, []);

  // Handle description change
  const handleDescriptionChange = useCallback((e) => {
    onChange('description', e.target.value);
  }, []);

  // Handle active toggle
  const handleActiveToggle = useCallback(() => {
    onChange('active', !form.active);
  }, [form.active]);

  // Handle router specific toggle
  const handleRouterSpecificToggle = useCallback(() => {
    onChange('router_specific', !form.router_specific);
  }, [form.router_specific]);

  // Handle FUP threshold change
  const handleFUPThresholdChange = useCallback((e) => {
    let value = e.target.value;
    if (value === "") value = "80";
    let numValue = parseInt(value, 10);
    if (isNaN(numValue)) numValue = 80;
    if (numValue > 100) numValue = 100;
    if (numValue < 1) numValue = 1;
    
    onChange('FUP_threshold', numValue);
  }, []);

  // Handle FUP policy change
  const handleFUPPolicyChange = useCallback((e) => {
    onChange('FUP_policy', e.target.value);
  }, []);

  // Price formatting - industry standard: format to 2 decimals on blur if valid, allow empty
  const formatPrice = useCallback((value) => {
    if (value === "" || value == null) return "";
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      return numValue.toFixed(2);
    }
    return value;
  }, []);

  // Effect to sync price value with form
  useEffect(() => {
    setPriceValue(form.price || "");
  }, [form.price]);

  // Better default handling for access type
  const currentAccessType = form.access_method ?? 
    (form.plan_type === 'free_trial' && !form.id ? 'hotspot' : form.access_method);

  // Check if option should be disabled for free trial
  const isOptionDisabled = useCallback((optionValue) => {
    if (form.plan_type === 'free_trial' && optionValue === 'pppoe') {
      return true;
    }
    return false;
  }, [form.plan_type]);

  // Convert planTypes from constants to options
  const planTypeOptions = React.useMemo(() => 
    planTypes.map(type => ({ 
      value: type.value || type, 
      label: (type.value || type) === 'free_trial' ? 'Free Trial (0 KES)' : 
             (type.value || type) === 'paid' ? 'Paid Plan' : 
             type.label || type,
      description: (type.value || type) === 'free_trial' ? 'Free plan for trial period' : 'Standard paid plan'
    })), []
  );

  // Convert categories from constants to options
  const categoryOptions = React.useMemo(() => 
    categories.map(cat => ({ 
      value: cat.value || cat, 
      label: cat.label || cat,
      description: (cat.value || cat) === 'Residential' ? 'Home internet plans' : 
                 (cat.value || cat) === 'Business' ? 'Business and enterprise plans' :
                 (cat.value || cat) === 'Promotional' ? 'Limited time offers' :
                 'General purpose plans'
    })), []
  );

  // Determine if field should show error
  const shouldShowError = useCallback((fieldName) => {
    return errors[fieldName] && (touched[fieldName] || localTouched[fieldName]);
  }, [errors, touched, localTouched]);

  // Scroll to field when error is clicked
  const scrollToField = useCallback((fieldName) => {
    const element = document.querySelector(`[name="${fieldName}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus();
    }
  }, []);

  return (
    <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <h3 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6 flex items-center">
        <Info className="w-5 h-5 mr-2 text-indigo-600" />
        Basic Details
        <span className="ml-2 text-xs text-gray-500">(Fields with * are required)</span>
      </h3>
      
      <div className="space-y-6 lg:space-y-8">
        {/* Access Type Selection */}
        <div>
          <div className="flex items-center mb-3">
            <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
              Access Type <span className="text-red-500">*</span>
            </label>
            <div className="ml-2 group relative">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50">
                <p>Select how users will connect to this plan:</p>
                <ul className="mt-1 space-y-1">
                  <li>• <strong>Hotspot</strong>: Wireless Wi-Fi connection</li>
                  <li>• <strong>PPPoE</strong>: Wired username/password connection</li>
                  <li>• <strong>Dual</strong>: Both methods available</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3" role="radiogroup" aria-label="Access Type Selection">
            {accessTypeOptions.map((option) => {
              const IconComponent = option.icon;
              const isSelected = currentAccessType === option.value;
              const isDisabled = isOptionDisabled(option.value);
              
              return (
                <motion.button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`${option.label}: ${option.description}`}
                  disabled={isDisabled}
                  whileHover={!isDisabled ? { scale: 1.02 } : {}}
                  whileTap={!isDisabled ? { scale: 0.98 } : {}}
                  onClick={() => !isDisabled && handleAccessChange(option.value)}
                  onKeyDown={(e) => !isDisabled && handleAccessKeyDown(e, option.value)}
                  tabIndex={isDisabled ? -1 : 0}
                  className={`p-4 border-2 rounded-lg transition-all duration-200 relative text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  } ${
                    isSelected
                      ? option.value === 'hotspot'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800'
                        : option.value === 'pppoe'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-200 dark:ring-green-800'
                        : 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-2 ring-purple-200 dark:ring-purple-800'
                      : `${themeClasses.border.light} ${themeClasses.bg.card} hover:bg-gray-50 dark:hover:bg-gray-700/50`
                  }`}
                >
                  {isDisabled && (
                    <div className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                      Restricted
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      isSelected
                        ? option.value === 'hotspot'
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300'
                          : option.value === 'pppoe'
                          ? 'bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-300'
                          : 'bg-purple-100 text-purple-600 dark:bg-purple-800 dark:text-purple-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${
                        isSelected ? themeClasses.text.primary : themeClasses.text.secondary
                      }`}>
                        {option.label}
                      </h4>
                      <p className={`text-xs mt-1 ${
                        isSelected ? themeClasses.text.secondary : themeClasses.text.tertiary
                      }`}>
                        {option.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        option.value === 'hotspot'
                          ? 'bg-blue-500 text-white'
                          : option.value === 'pppoe'
                          ? 'bg-green-500 text-white'
                          : 'bg-purple-500 text-white'
                      }`}>
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  
                  {isDisabled && (
                    <p className="text-xs text-red-500 mt-2">
                      Not available for Free Trial plans
                    </p>
                  )}
                </motion.button>
              );
            })}
          </div>
          
          {shouldShowError('access_method') && (
            <p className="text-red-500 text-xs mt-2 flex items-center">
              <Info className="w-3 h-3 mr-1" />
              {errors.access_method}
            </p>
          )}
        </div>

        {/* Plan Type and Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
              Plan Type <span className="text-red-500">*</span>
            </label>
            <EnhancedSelect
              value={form.plan_type || "paid"}
              onChange={handlePlanTypeChange}
              options={planTypeOptions}
              placeholder="Select Plan Type"
              theme={theme}
              isSearchable={true}
            />
            <p className="text-xs text-gray-500 mt-2">
              {form.plan_type === 'free_trial' 
                ? 'Free Trial plans cannot have premium priority levels' 
                : 'Paid plans can be priced according to your needs'}
            </p>
            {shouldShowError('plan_type') && (
              <p className="text-red-500 text-xs mt-1">{errors.plan_type}</p>
            )}
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
              Plan Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input 
                type="text"
                name="name"
                value={form.name || ""}
                onChange={handleNameChange}
                onBlur={(e) => {
                  if (onBlur) onBlur('name');
                  setLocalTouched(prev => ({ ...prev, name: true }));
                }}
                className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input} ${
                  shouldShowError('name') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                placeholder="e.g., Rural Wi-Fi Pro, Business Broadband Premium"
                required 
                maxLength={100}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                {form.name?.length || 0}/100
              </div>
            </div>
            {shouldShowError('name') ? (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Use a descriptive name that customers will recognize
              </p>
            )}
          </div>
        </div>
        
        {/* Category and Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
              Category <span className="text-red-500">*</span>
            </label>
            <EnhancedSelect
              value={form.category || "Residential"}
              onChange={handleCategoryChange}
              options={categoryOptions}
              placeholder="Select Category"
              theme={theme}
              isSearchable={true}
            />
            {shouldShowError('category') && (
              <p className="text-red-500 text-xs mt-1">{errors.category}</p>
            )}
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
              Price (KES) {form.plan_type === "paid" && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                KES
              </div>
              <input
                type="text"  // Changed to text for better control; number has spinners
                name="price"
                value={priceValue}
                onChange={handlePriceChange}
                onBlur={(e) => {
                  const rawValue = e.target.value.trim();
                  let formatted = rawValue;
                  if (rawValue !== "" && form.plan_type !== 'free_trial') {
                    const numValue = parseFloat(rawValue);
                    if (!isNaN(numValue)) {
                      formatted = numValue.toFixed(2);
                    } else {
                      formatted = ""; // Invalid -> clear
                    }
                  }
                  setPriceValue(formatted);
                  onChange('price', formatted);
                  
                  if (onBlur) onBlur('price');
                  setLocalTouched(prev => ({ ...prev, price: true }));
                }}
                disabled={form.plan_type === "free_trial"}
                className={`w-full pl-12 pr-3 py-2 rounded-lg shadow-sm text-sm ${
                  form.plan_type === "free_trial" 
                    ? "bg-gray-100 cursor-not-allowed border-gray-300 text-gray-500" 
                    : themeClasses.input
                } ${shouldShowError('price') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter price"
                required={form.plan_type === "paid"}
                pattern="^\d*(\.\d{0,2})?$"  // HTML5 validation for 2 decimals
              />
              {form.plan_type === "paid" && priceValue && parseFloat(priceValue) > 0 && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                  ≈ ${(parseFloat(priceValue) * 0.0067).toFixed(2)} USD
                </div>
              )}
            </div>
            {form.plan_type === "free_trial" ? (
              <p className="text-xs text-blue-500 mt-1 flex items-center">
                <Info className="w-3 h-3 mr-1" />
                Free Trial plans must have price set to 0
              </p>
            ) : shouldShowError('price') ? (
              <p className="text-red-500 text-xs mt-1">{errors.price}</p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Enter price in Kenyan Shillings (KES)
              </p>
            )}
          </div>
        </div>
        
        {/* Priority and Template */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
              Priority Level <span className="text-red-500">*</span>
            </label>
            <EnhancedSelect
              value={form.priority_level || 4}
              onChange={handlePriorityChange}
              options={priorityOptions.map(opt => ({ 
                value: opt.value,
                label: `${opt.label} (${opt.value})`,
                description: opt.description,
                disabled: form.plan_type === "free_trial" && opt.value > 4
              }))}
              placeholder="Select Priority Level"
              theme={theme}
              isSearchable={true}
            />
            <p className="text-xs text-gray-500 mt-2">
              {form.plan_type === "free_trial" 
                ? "Free Trial plans cannot have premium priority levels (5-8)" 
                : "Higher priority plans get better network performance"}
            </p>
            {shouldShowError('priority_level') && (
              <p className="text-red-500 text-xs mt-1">{errors.priority_level}</p>
            )}
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
              Template (Optional)
            </label>
            <EnhancedSelect
              value={form.template || ""}
              onChange={handleTemplateChange}
              options={[
                { value: "", label: "No Template (Start from scratch)" },
                { value: "template_1", label: "📱 Basic Residential", description: "10 Mbps, 30 days, 100GB" },
                { value: "template_2", label: "💼 Business Premium", description: "50 Mbps, 30 days, Unlimited" },
                { value: "template_3", label: "🎯 Promotional Offer", description: "5 Mbps, 7 days, 10GB" },
                { value: "template_4", label: "🏠 Family Bundle", description: "20 Mbps, 30 days, 200GB" }
              ]}
              placeholder="Select Template (Optional)"
              theme={theme}
              isSearchable={true}
            />
            <p className="text-xs text-gray-500 mt-2">
              Use a template for faster plan creation
            </p>
          </div>
        </div>
        
        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
              Description
            </label>
            <span className={`text-xs ${form.description?.length > 500 ? 'text-red-500' : 'text-gray-500'}`}>
              {form.description?.length || 0}/500
            </span>
          </div>
          <textarea 
            name="description" 
            value={form.description || ""} 
            onChange={handleDescriptionChange}
            onBlur={(e) => {
              if (onBlur) onBlur('description');
              setLocalTouched(prev => ({ ...prev, description: true }));
            }}
            rows={3}
            className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input} ${
              form.description?.length > 500 ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
            }`}
            placeholder="Describe the plan features and benefits... (e.g., Perfect for streaming, gaming, and remote work. Includes 24/7 support and unlimited bandwidth during off-peak hours.)"
            maxLength={500}
          />
          {form.description?.length > 500 ? (
            <p className="text-red-500 text-xs mt-1">
              Description is too long (max 500 characters)
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-2">
              Markdown is supported in the description. Be descriptive to help customers understand your plan.
            </p>
          )}
        </div>
        
        {/* Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center">
              <label className={`block text-sm font-medium mr-4 ${themeClasses.text.primary}`}>
                Active Status
              </label>
              <button
                type="button"
                onClick={handleActiveToggle}
                className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  form.active 
                    ? 'bg-green-600'
                    : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                }`}
                aria-label={`Toggle active status. Currently ${form.active ? 'active' : 'inactive'}`}
              >
                <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                  form.active ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            </div>
            <div className="text-sm text-gray-500">
              {form.active ? 'Plan is active and visible' : 'Plan is inactive and hidden'}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center">
              <label className={`block text-sm font-medium mr-4 ${themeClasses.text.primary}`}>
                Router Specific
              </label>
              <button
                type="button"
                onClick={handleRouterSpecificToggle}
                className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  form.router_specific 
                    ? 'bg-blue-600'
                    : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                }`}
                aria-label={`Toggle router specific. Currently ${form.router_specific ? 'router specific' : 'all routers'}`}
              >
                <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                  form.router_specific ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            </div>
            <div className="text-sm text-gray-500">
              {form.router_specific ? 'Limited to specific routers' : 'Available on all routers'}
            </div>
          </div>
        </div>
        
        {/* FUP Settings */}
        <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-yellow-900/10' : 'bg-yellow-50'}`}>
          <h4 className="text-md font-semibold mb-4 text-yellow-700 dark:text-yellow-300 flex items-center">
            <Info className="w-4 h-4 mr-2" />
            Fair Usage Policy (FUP) Settings
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                FUP Threshold (%)
              </label>
              <div className="relative">
                <input
                  type="range"
                  name="FUP_threshold"
                  value={form.FUP_threshold || 80}
                  onChange={handleFUPThresholdChange}
                  onBlur={(e) => {
                    if (onBlur) onBlur('FUP_threshold');
                    setLocalTouched(prev => ({ ...prev, FUP_threshold: true }));
                  }}
                  min="1"
                  max="100"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1%</span>
                  <span className="font-medium">{form.FUP_threshold || 80}%</span>
                  <span>100%</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Speed reduction starts at {form.FUP_threshold || 80}% of data limit
              </p>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                FUP Policy Description
              </label>
              <textarea
                name="FUP_policy"
                value={form.FUP_policy || ""}
                onChange={handleFUPPolicyChange}
                onBlur={(e) => {
                  if (onBlur) onBlur('FUP_policy');
                  setLocalTouched(prev => ({ ...prev, FUP_policy: true }));
                }}
                rows={2}
                className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                placeholder="Describe what happens when FUP threshold is reached... (e.g., Speed reduced to 1 Mbps after exceeding data limit to ensure fair usage for all customers.)"
              />
              <p className="text-xs text-gray-500 mt-2">
                This will be shown to customers when they reach the limit
              </p>
            </div>
          </div>
        </div>
        
        {/* Validation Summary - FIXED ISSUE 4: Clickable errors */}
        {Object.keys(errors).length > 0 && (
          <div className={`p-4 rounded-lg border border-red-300 ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`}>
            <h4 className="text-md font-semibold mb-2 text-red-700 dark:text-red-300 flex items-center">
              <Info className="w-4 h-4 mr-2" />
              Please fix the following errors:
            </h4>
            <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
              {Object.entries(errors)
                .filter(([field]) => shouldShowError(field))
                .map(([field, error]) => (
                  <li 
                    key={field} 
                    onClick={() => scrollToField(field)}
                    className="flex items-start cursor-pointer hover:underline"
                    title={`Click to focus on ${field.replace(/_/g, ' ')} field`}
                  >
                    <span className="mr-2">•</span>
                    <span>
                      <strong className="capitalize">{field.replace(/_/g, ' ')}:</strong> {error}
                    </span>
                  </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanBasicDetails;