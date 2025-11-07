



// src/Pages/NetworkManagement/components/Common/CustomButton.jsx
import React from "react";
import { motion } from "framer-motion";
import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components"


const CustomButton = ({ 
  onClick, 
  label, 
  icon, 
  variant = "primary", 
  size = "md", 
  disabled = false, 
  fullWidth = false,
  ariaLabel,
  className = "",
  loading = false,
  theme = "light"
}) => {
  const themeClasses = getThemeClasses(theme);
  
  const baseStyles = "flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: themeClasses.button.primary + " focus:ring-indigo-500",
    secondary: themeClasses.button.secondary + " focus:ring-gray-500",
    danger: themeClasses.button.danger + " focus:ring-red-500",
    success: themeClasses.button.success + " focus:ring-green-500",
    warning: "bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      aria-label={ariaLabel}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
      ) : icon ? (
        React.cloneElement(icon, { className: `w-4 h-4 ${label ? "mr-2" : ""}` })
      ) : null}
      {label}
    </motion.button>
  );
};

export default CustomButton;