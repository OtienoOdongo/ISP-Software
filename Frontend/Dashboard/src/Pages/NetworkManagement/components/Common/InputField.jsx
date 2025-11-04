// src/Pages/NetworkManagement/components/Common/InputField.jsx
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

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
  rows = 3
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const inputClass = `w-full pl-10 pr-4 py-2 rounded-lg border transition-colors duration-300 ${
    disabled 
      ? "bg-gray-100 cursor-not-allowed opacity-50" 
      : touched && error 
        ? "border-red-500 ring-red-500/20" 
        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
  }`;

  const renderInput = () => {
    if (type === "select") {
      return (
        <select
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={inputClass}
        >
          <option value="">Select {label}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
        <label className="block text-sm mb-2 font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
            touched && error ? "text-red-500" : "text-gray-500"
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