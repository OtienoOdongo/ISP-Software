






// src/Pages/NetworkManagement/components/Common/InputField.jsx
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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
  theme = "light"
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const themeClasses = getThemeClasses(theme);
  
  const inputClass = `w-full pl-10 pr-4 py-2 rounded-lg border transition-colors duration-300 text-sm ${
    disabled 
      ? "cursor-not-allowed opacity-50" 
      : touched && error 
        ? "border-red-500 ring-red-500/20" 
        : themeClasses.input
  }`;

  const renderInput = () => {
    if (type === "select") {
      return (
        <EnhancedSelect
          value={value}
          onChange={onChange}
          options={options}
          placeholder={`Select ${label}`}
          disabled={disabled}
          theme={theme}
          className="w-full"
        />
      );
    }
    
    if (isTextArea) {
      return (
        <textarea
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          className={inputClass}
        />
      );
    }
    
    if (type === "password") {
      return (
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
              themeClasses.text.tertiary
            } hover:${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      );
    }
    
    return (
      <input
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={inputClass}
      />
    );
  };

  return (
    <div className={className}>
      {label && (
        <label className={`block text-sm mb-2 font-medium ${themeClasses.text.primary}`}>
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
            touched && error ? "text-red-500" : themeClasses.text.tertiary
          }`}>
            {React.cloneElement(icon, { className: "w-4 h-4" })}
          </div>
        )}
        {renderInput()}
      </div>
      {touched && error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

export default InputField;