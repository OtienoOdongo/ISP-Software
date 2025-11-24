


// // src/Pages/NetworkManagement/components/Common/InputField.jsx
// import React, { useState } from "react";
// import { Eye, EyeOff } from "lucide-react";
// import { EnhancedSelect, getThemeClasses } from "../../../../components/ServiceManagement/Shared/components"

// const InputField = ({ 
//   label, 
//   value, 
//   onChange, 
//   type = "text", 
//   placeholder, 
//   required, 
//   icon, 
//   error, 
//   className = "",
//   onBlur,
//   touched,
//   disabled = false,
//   options = [],
//   isTextArea = false,
//   rows = 3,
//   theme = "light"
// }) => {
//   const [showPassword, setShowPassword] = useState(false);
//   const themeClasses = getThemeClasses(theme);
  
//   const inputClass = `w-full pl-10 pr-4 py-2 rounded-lg border transition-colors duration-300 text-sm ${
//     disabled 
//       ? "cursor-not-allowed opacity-50" 
//       : touched && error 
//         ? "border-red-500 ring-red-500/20" 
//         : themeClasses.input
//   }`;

//   const renderInput = () => {
//     if (type === "select") {
//       return (
//         <EnhancedSelect
//           value={value}
//           onChange={onChange}
//           options={options}
//           placeholder={`Select ${label}`}
//           disabled={disabled}
//           theme={theme}
//           className="w-full"
//         />
//       );
//     }
    
//     if (isTextArea) {
//       return (
//         <textarea
//           value={value}
//           onChange={onChange}
//           onBlur={onBlur}
//           placeholder={placeholder}
//           required={required}
//           disabled={disabled}
//           rows={rows}
//           className={inputClass}
//         />
//       );
//     }
    
//     if (type === "password") {
//       return (
//         <div className="relative">
//           <input
//             type={showPassword ? "text" : "password"}
//             value={value}
//             onChange={onChange}
//             onBlur={onBlur}
//             placeholder={placeholder}
//             required={required}
//             disabled={disabled}
//             className={inputClass}
//           />
//           <button
//             type="button"
//             onClick={() => setShowPassword(!showPassword)}
//             className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
//               themeClasses.text.tertiary
//             } hover:${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
//           >
//             {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//           </button>
//         </div>
//       );
//     }
    
//     return (
//       <input
//         type={type}
//         value={value}
//         onChange={onChange}
//         onBlur={onBlur}
//         placeholder={placeholder}
//         required={required}
//         disabled={disabled}
//         className={inputClass}
//       />
//     );
//   };

//   return (
//     <div className={className}>
//       {label && (
//         <label className={`block text-sm mb-2 font-medium ${themeClasses.text.primary}`}>
//           {label} {required && <span className="text-red-600">*</span>}
//         </label>
//       )}
//       <div className="relative">
//         {icon && (
//           <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
//             touched && error ? "text-red-500" : themeClasses.text.tertiary
//           }`}>
//             {React.cloneElement(icon, { className: "w-4 h-4" })}
//           </div>
//         )}
//         {renderInput()}
//       </div>
//       {touched && error && (
//         <p className="text-xs text-red-600 mt-1">{error}</p>
//       )}
//     </div>
//   );
// };

// export default InputField;









// src/Pages/NetworkManagement/components/Common/InputField.jsx
import React, { useState } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle, HelpCircle } from "lucide-react";
import { EnhancedSelect, getThemeClasses } from "../../../../components/ServiceManagement/Shared/components"

const InputField = ({ 
  label, 
  value, 
  onChange, 
  type = "text", 
  placeholder, 
  required, 
  icon, 
  error, 
  className = "",
  onBlur,
  touched,
  disabled = false,
  options = [],
  isTextArea = false,
  rows = 3,
  theme = "light",
  helperText,
  success,
  warning,
  maxLength,
  min,
  max,
  step,
  pattern,
  autoComplete,
  id,
  name,
  prefix,
  suffix
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const themeClasses = getThemeClasses(theme);
  
  const getInputState = () => {
    if (disabled) return "disabled";
    if (touched && error) return "error";
    if (success) return "success";
    if (warning) return "warning";
    if (isFocused) return "focused";
    return "default";
  };

  const inputState = getInputState();
  
  const inputBaseClass = "w-full pl-10 pr-4 py-2 rounded-lg border transition-all duration-300 text-sm focus:ring-2 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-900";
  
  const inputStates = {
    default: themeClasses.input,
    focused: "border-blue-500 ring-2 ring-blue-500/20 bg-white dark:bg-gray-700",
    error: "border-red-500 ring-2 ring-red-500/20 bg-white dark:bg-gray-700 text-red-900 dark:text-red-200",
    success: "border-green-500 ring-2 ring-green-500/20 bg-white dark:bg-gray-700 text-green-900 dark:text-green-200",
    warning: "border-yellow-500 ring-2 ring-yellow-500/20 bg-white dark:bg-gray-700 text-yellow-900 dark:text-yellow-200",
    disabled: "cursor-not-allowed opacity-50 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
  };

  const getStatusIcon = () => {
    if (touched && error) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    if (success) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (warning) {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
    if (helperText) {
      return <HelpCircle className="w-4 h-4 text-gray-400" />;
    }
    return null;
  };

  const renderInput = () => {
    const commonProps = {
      value: value || '',
      onChange,
      onBlur: (e) => {
        setIsFocused(false);
        onBlur?.(e);
      },
      onFocus: () => setIsFocused(true),
      placeholder,
      required,
      disabled,
      className: `${inputBaseClass} ${inputStates[inputState]} ${prefix ? 'pl-16' : ''} ${suffix ? 'pr-16' : ''}`,
      maxLength,
      min,
      max,
      step,
      pattern,
      autoComplete,
      id,
      name
    };

    if (type === "select") {
      return (
        <EnhancedSelect
          value={value}
          onChange={onChange}
          options={options}
          placeholder={placeholder || `Select ${label}`}
          disabled={disabled}
          theme={theme}
          className="w-full"
        />
      );
    }
    
    if (isTextArea) {
      return (
        <textarea
          {...commonProps}
          rows={rows}
        />
      );
    }
    
    if (type === "password") {
      return (
        <div className="relative">
          {prefix && (
            <div className="absolute left-10 top-1/2 transform -translate-y-1/2 text-gray-500">
              {prefix}
            </div>
          )}
          <input
            {...commonProps}
            type={showPassword ? "text" : "password"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
              themeClasses.text.tertiary
            } hover:${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      );
    }
    
    if (type === "number") {
      return (
        <div className="relative">
          {prefix && (
            <div className="absolute left-10 top-1/2 transform -translate-y-1/2 text-gray-500">
              {prefix}
            </div>
          )}
          <input
            {...commonProps}
            type="number"
          />
          {suffix && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {suffix}
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="relative">
        {prefix && (
          <div className="absolute left-10 top-1/2 transform -translate-y-1/2 text-gray-500">
            {prefix}
          </div>
        )}
        <input
          {...commonProps}
          type={type}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            {suffix}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={className}>
      {label && (
        <label 
          htmlFor={id}
          className={`block text-sm mb-2 font-medium ${themeClasses.text.primary}`}
        >
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Main Icon */}
        {icon && (
          <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
            inputState === "error" ? "text-red-500" :
            inputState === "success" ? "text-green-500" :
            inputState === "warning" ? "text-yellow-500" :
            themeClasses.text.tertiary
          }`}>
            {React.cloneElement(icon, { className: "w-4 h-4" })}
          </div>
        )}
        
        {/* Input */}
        {renderInput()}
        
        {/* Status Icon */}
        {getStatusIcon() && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {getStatusIcon()}
          </div>
        )}
      </div>
      
      {/* Helper Text & Error Message */}
      <div className="mt-1 min-h-[20px]">
        {touched && error && (
          <p className="text-xs text-red-600 dark:text-red-400 flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className={`text-xs ${
            inputState === "warning" ? "text-yellow-600 dark:text-yellow-400" :
            themeClasses.text.tertiary
          }`}>
            {helperText}
          </p>
        )}
        {maxLength && (
          <p className={`text-xs text-right ${themeClasses.text.tertiary}`}>
            {value?.length || 0}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
};

export default InputField;