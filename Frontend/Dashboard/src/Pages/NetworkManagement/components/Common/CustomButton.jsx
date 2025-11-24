



// // src/Pages/NetworkManagement/components/Common/CustomButton.jsx
// import React from "react";
// import { motion } from "framer-motion";
// import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components"


// const CustomButton = ({ 
//   onClick, 
//   label, 
//   icon, 
//   variant = "primary", 
//   size = "md", 
//   disabled = false, 
//   fullWidth = false,
//   ariaLabel,
//   className = "",
//   loading = false,
//   theme = "light"
// }) => {
//   const themeClasses = getThemeClasses(theme);
  
//   const baseStyles = "flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2";
  
//   const variants = {
//     primary: themeClasses.button.primary + " focus:ring-indigo-500",
//     secondary: themeClasses.button.secondary + " focus:ring-gray-500",
//     danger: themeClasses.button.danger + " focus:ring-red-500",
//     success: themeClasses.button.success + " focus:ring-green-500",
//     warning: "bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500",
//     outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500"
//   };
  
//   const sizes = {
//     sm: "px-3 py-1.5 text-sm",
//     md: "px-4 py-2 text-sm",
//     lg: "px-6 py-3 text-base"
//   };
  
//   return (
//     <motion.button
//       whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
//       whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
//       onClick={onClick}
//       disabled={disabled || loading}
//       className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
//       aria-label={ariaLabel}
//     >
//       {loading ? (
//         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
//       ) : icon ? (
//         React.cloneElement(icon, { className: `w-4 h-4 ${label ? "mr-2" : ""}` })
//       ) : null}
//       {label}
//     </motion.button>
//   );
// };

// export default CustomButton;






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
  theme = "light",
  type = "button",
  title,
  tabIndex
}) => {
  const themeClasses = getThemeClasses(theme);
  
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900";
  
  const variants = {
    primary: themeClasses.button.primary + " focus:ring-blue-500",
    secondary: themeClasses.button.secondary + " focus:ring-gray-500",
    danger: themeClasses.button.danger + " focus:ring-red-500",
    success: themeClasses.button.success + " focus:ring-green-500",
    warning: "bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500 dark:bg-yellow-700 dark:hover:bg-yellow-600",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-700",
    link: "text-blue-600 hover:text-blue-700 underline focus:ring-blue-500 dark:text-blue-400 dark:hover:text-blue-300 bg-transparent hover:bg-transparent"
  };
  
  const sizes = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg"
  };
  
  const getLoadingSpinner = () => (
    <div className="flex items-center justify-center">
      <div className={`w-4 h-4 border-2 ${
        variant === "outline" || variant === "ghost" || variant === "link" 
          ? "border-blue-600 border-t-transparent dark:border-blue-400" 
          : "border-white border-t-transparent"
      } rounded-full animate-spin mr-2`} />
    </div>
  );

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      title={title}
      tabIndex={tabIndex}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      aria-label={ariaLabel || label}
      aria-busy={loading}
    >
      {loading ? (
        getLoadingSpinner()
      ) : icon ? (
        React.cloneElement(icon, { 
          className: `w-4 h-4 flex-shrink-0 ${label ? "mr-2" : ""}`,
          "aria-hidden": "true"
        })
      ) : null}
      
      {label && (
        <span className={loading && !icon ? "ml-2" : ""}>
          {label}
        </span>
      )}
      
      {!label && !icon && loading && getLoadingSpinner()}
    </motion.button>
  );
};

export default CustomButton;