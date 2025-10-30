// import React from "react";
// import { EnhancedSelect, getThemeClasses } from "../Shared/components";
// import { planTypes, categories } from "../Shared/constant"

// const PlanBasicDetails = ({ form, errors, touched, onChange, onBlur, theme }) => {
//   const themeClasses = getThemeClasses(theme);

//   return (
//     <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4">Basic Details</h3>
//       <div className="space-y-4 lg:space-y-6">
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
    { value: "pppoe", label: "PPPoE", icon: Cable, description: "Wired connection with authentication" }
  ];

  return (
    <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4">Basic Details</h3>
      <div className="space-y-4 lg:space-y-6">
        {/* Access Type Selection - NEW: Clear separation */}
        <div>
          <label className={`block text-sm font-medium mb-3 ${themeClasses.text.primary}`}>
            Access Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accessTypeOptions.map((option) => {
              const IconComponent = option.icon;
              const isSelected = form.accessType === option.value;
              
              return (
                <motion.div
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onAccessTypeChange(option.value)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? option.value === 'hotspot'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : `${themeClasses.border.light} ${themeClasses.bg.card} hover:bg-gray-50 dark:hover:bg-gray-700/50`
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      isSelected
                        ? option.value === 'hotspot'
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300'
                          : 'bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-300'
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
                          : 'bg-green-500 text-white'
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
              Price (Ksh) {form.planType === "Paid" && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number" 
              name="price" 
              value={form.price || ""} 
              onChange={onChange}
              onBlur={() => onBlur('price')}
              disabled={form.planType !== "Paid"}
              className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${
                form.planType !== "Paid" 
                  ? "bg-gray-100 cursor-not-allowed border-gray-300" 
                  : themeClasses.input
              }`}
              placeholder="e.g., 29.99" 
              step="0.01" 
              min="0" 
              required={form.planType === "Paid"}
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
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
        </div>
        <div className="flex items-center">
          <label className={`block text-sm font-medium mr-4 ${themeClasses.text.primary}`}>
            Active
          </label>
          <div 
            onClick={() => onChange({ target: { name: 'active', type: 'checkbox', checked: !form.active } })} 
            className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
              form.active 
                ? 'bg-indigo-600'
                : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
              form.active ? "translate-x-6" : "translate-x-1"
            }`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanBasicDetails;