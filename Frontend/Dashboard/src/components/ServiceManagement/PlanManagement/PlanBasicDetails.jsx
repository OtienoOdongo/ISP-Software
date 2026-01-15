

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









import React from "react";
import { motion } from "framer-motion";
import { EnhancedSelect, getThemeClasses } from "../Shared/components";
import { planTypes, categories } from "../Shared/constant"
import { Wifi, Cable } from "lucide-react";

const PlanBasicDetails = ({ form, errors, touched, onChange, onAccessTypeChange, onBlur, theme }) => {
  const themeClasses = getThemeClasses(theme);

  // Access type options with icons
  const accessTypeOptions = [
    { value: "hotspot", label: "Hotspot", icon: Wifi, description: "Wireless access for multiple users" },
    { value: "pppoe", label: "PPPoE", icon: Cable, description: "Wired connection with authentication" },
    { value: "dual", label: "Dual Access", icon: (props) => (
      <div className="flex">
        <Wifi className="w-3 h-3 mr-1" {...props} />
        <Cable className="w-3 h-3" {...props} />
      </div>
    ), description: "Both wireless and wired access" }
  ];

  // Priority level options
  const priorityOptions = [
    { value: 1, label: "Lowest (1)", description: "Lowest priority" },
    { value: 2, label: "Low (2)", description: "Low priority" },
    { value: 3, label: "Medium (3)", description: "Standard priority" },
    { value: 4, label: "High (4)", description: "High priority" },
    { value: 5, label: "Highest (5)", description: "Highest priority" },
    { value: 6, label: "Critical (6)", description: "Critical priority" },
    { value: 7, label: "Premium (7)", description: "Premium priority" },
    { value: 8, label: "VIP (8)", description: "VIP priority" }
  ];

  return (
    <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4">Basic Details</h3>
      <div className="space-y-4 lg:space-y-6">
        {/* Access Type Selection */}
        <div>
          <label className={`block text-sm font-medium mb-3 ${themeClasses.text.primary}`}>
            Access Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {accessTypeOptions.map((option) => {
              const IconComponent = option.icon;
              const isSelected = form.accessType === option.value;
              const isDisabled = false; // Add any logic for disabled states
              
              return (
                <motion.div
                  key={option.value}
                  whileHover={{ scale: isDisabled ? 1 : 1.02 }}
                  whileTap={{ scale: isDisabled ? 1 : 0.98 }}
                  onClick={() => !isDisabled && onAccessTypeChange(option.value)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? option.value === 'hotspot'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : option.value === 'pppoe'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : `${themeClasses.border.light} ${themeClasses.bg.card} hover:bg-gray-50 dark:hover:bg-gray-700/50`
                  } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
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
                        ✓
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          <div>
            <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
              Plan Type <span className="text-red-500">*</span>
            </label>
            <EnhancedSelect
              value={form.planType}
              onChange={(value) => onChange({ target: { name: 'planType', value } })}
              options={planTypes.map(type => ({ value: type, label: type }))}
              placeholder="Select Plan Type"
              theme={theme}
            />
            <p className="text-xs text-gray-500 mt-1">
              {form.planType === 'free_trial' ? 'Free Trial plans cannot have premium priority levels' : ''}
            </p>
            {errors.planType && <p className="text-red-500 text-xs mt-1">{errors.planType}</p>}
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
              Name <span className="text-red-500">*</span>
            </label>
            <input 
              name="name" 
              value={form.name || ""} 
              onChange={onChange}
              onBlur={() => onBlur('name')}
              className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
              placeholder="e.g., Rural Wi-Fi Pro" 
              required 
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          <div>
            <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
              Category <span className="text-red-500">*</span>
            </label>
            <EnhancedSelect
              value={form.category}
              onChange={(value) => onChange({ target: { name: 'category', value } })}
              options={categories.map(cat => ({ value: cat, label: cat }))}
              placeholder="Select Category"
              theme={theme}
            />
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
              Price (KES) {form.planType === "paid" && <span className="text-red-500">*</span>}
            </label>
            <div className="flex items-center">
              <span className="mr-2 text-gray-500">KES</span>
              <input
                type="number" 
                name="price" 
                value={form.price || ""} 
                onChange={onChange}
                onBlur={() => onBlur('price')}
                disabled={form.planType === "free_trial"}
                className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${
                  form.planType === "free_trial" 
                    ? "bg-gray-100 cursor-not-allowed border-gray-300" 
                    : themeClasses.input
                }`}
                placeholder="e.g., 2999" 
                step="1" 
                min="0" 
                required={form.planType === "paid"}
              />
            </div>
            {form.planType === "free_trial" && (
              <p className="text-xs text-gray-500 mt-1">Free Trial plans must have price set to 0</p>
            )}
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          <div>
            <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
              Priority Level <span className="text-red-500">*</span>
            </label>
            <EnhancedSelect
              value={form.priority_level || 4}
              onChange={(value) => onChange({ target: { name: 'priority_level', value: parseInt(value) } })}
              options={priorityOptions}
              placeholder="Select Priority Level"
              theme={theme}
              disabled={form.planType === "free_trial"}
            />
            <p className="text-xs text-gray-500 mt-1">
              {form.planType === "free_trial" 
                ? "Free Trial plans cannot have premium priority levels" 
                : "Higher priority plans appear first"}
            </p>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
              Template
            </label>
            <EnhancedSelect
              value={form.template || ""}
              onChange={(value) => onChange({ target: { name: 'template', value } })}
              options={[
                { value: "", label: "No Template (Custom Plan)" },
                // Template options would be populated from API
                { value: "template_1", label: "Basic Residential" },
                { value: "template_2", label: "Business Premium" },
                { value: "template_3", label: "Promotional Offer" }
              ]}
              placeholder="Select Template (Optional)"
              theme={theme}
            />
            <p className="text-xs text-gray-500 mt-1">Use a template for faster plan creation</p>
          </div>
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
            Description
          </label>
          <textarea 
            name="description" 
            value={form.description || ""} 
            onChange={onChange}
            rows={3}
            className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
            placeholder="Describe the plan features and benefits..."
          />
          <p className="text-xs text-gray-500 mt-1">Markdown is supported in the description</p>
        </div>
        
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          <div className="flex items-center">
            <div className="flex items-center mr-6">
              <label className={`block text-sm font-medium mr-4 ${themeClasses.text.primary}`}>
                Active
              </label>
              <div 
                onClick={() => onChange({ target: { name: 'active', type: 'checkbox', checked: !form.active } })} 
                className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                  form.active 
                    ? 'bg-green-600'
                    : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                  form.active ? "translate-x-6" : "translate-x-1"
                }`} />
              </div>
            </div>
            <div className="flex items-center">
              <label className={`block text-sm font-medium mr-4 ${themeClasses.text.primary}`}>
                Router Specific
              </label>
              <div 
                onClick={() => onChange({ target: { name: 'router_specific', type: 'checkbox', checked: !form.router_specific } })} 
                className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                  form.router_specific 
                    ? 'bg-blue-600'
                    : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                  form.router_specific ? "translate-x-6" : "translate-x-1"
                }`} />
              </div>
            </div>
          </div>
          
          {form.planType === "paid" && (
            <div className="flex items-center">
              <label className={`block text-sm font-medium mr-4 ${themeClasses.text.primary}`}>
                Apply Discounts
              </label>
              <div 
                onClick={() => onChange({ target: { name: 'allow_discounts', type: 'checkbox', checked: !form.allow_discounts } })} 
                className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                  form.allow_discounts 
                    ? 'bg-purple-600'
                    : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                  form.allow_discounts ? "translate-x-6" : "translate-x-1"
                }`} />
              </div>
            </div>
          )}
        </div>
        
        {/* FUP Settings */}
        <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-yellow-900/10' : 'bg-yellow-50'}`}>
          <h4 className="text-md font-semibold mb-3 text-yellow-700 dark:text-yellow-300">
            Fair Usage Policy (FUP)
          </h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
            <div>
              <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                FUP Threshold (%)
              </label>
              <input
                type="number"
                name="FUP_threshold"
                value={form.FUP_threshold || 80}
                onChange={onChange}
                min="1"
                max="100"
                className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
              />
              <p className="text-xs text-gray-500 mt-1">
                Usage threshold percentage for FUP (1-100%)
              </p>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                FUP Policy Description
              </label>
              <textarea
                name="FUP_policy"
                value={form.FUP_policy || ""}
                onChange={onChange}
                rows={2}
                className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                placeholder="Describe the fair usage policy..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanBasicDetails;