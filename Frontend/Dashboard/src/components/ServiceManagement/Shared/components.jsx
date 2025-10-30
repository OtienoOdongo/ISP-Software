








// import React from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { ChevronDown, X, AlertTriangle, Check } from "lucide-react";

// // Theme-aware styling functions
// export const getThemeClasses = (theme) => ({
//   // Background classes
//   bg: {
//     primary: theme === 'dark' 
//       ? 'bg-gradient-to-br from-gray-900 to-indigo-900' 
//       : 'bg-gradient-to-br from-white to-indigo-50',
//     card: theme === 'dark' 
//       ? 'bg-gray-800/60 backdrop-blur-md' 
//       : 'bg-white/80 backdrop-blur-md',
//     secondary: theme === 'dark' 
//       ? 'bg-gray-800/80 backdrop-blur-md' 
//       : 'bg-white/80 backdrop-blur-md',
//     dropdown: theme === 'dark' 
//       ? 'bg-gray-800' 
//       : 'bg-white',
//   },
//   // Text classes
//   text: {
//     primary: theme === 'dark' ? 'text-white' : 'text-gray-800',
//     secondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
//     tertiary: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
//   },
//   // Border classes
//   border: {
//     light: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
//     medium: theme === 'dark' ? 'border-gray-600' : 'border-gray-300',
//   },
//   // Input classes
//   input: theme === 'dark' 
//     ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500'
//     : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500',
//   // Button classes
//   button: {
//     primary: theme === 'dark' 
//       ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
//       : 'bg-indigo-600 hover:bg-indigo-700 text-white',
//     secondary: theme === 'dark'
//       ? 'bg-gray-700 hover:bg-gray-600 text-white'
//       : 'bg-gray-200 hover:bg-gray-300 text-gray-800',
//     success: theme === 'dark'
//       ? 'bg-green-600 hover:bg-green-700 text-white'
//       : 'bg-green-600 hover:bg-green-700 text-white',
//     danger: theme === 'dark'
//       ? 'bg-red-600 hover:bg-red-700 text-white'
//       : 'bg-red-600 hover:bg-red-700 text-white',
//   }
// });

// // Enhanced Select Component - Fixed for responsiveness
// export const EnhancedSelect = ({ 
//   value, 
//   onChange, 
//   options, 
//   placeholder = "Select an option",
//   className = "",
//   disabled = false,
//   theme = "light"
// }) => {
//   const [isOpen, setIsOpen] = React.useState(false);
//   const dropdownRef = React.useRef(null);
//   const themeClasses = getThemeClasses(theme);

//   // Close dropdown when clicking outside
//   React.useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const selectedOption = options.find(opt => opt.value === value) || 
//                        options.find(opt => opt === value);

//   return (
//     <div className={`relative ${className}`} ref={dropdownRef}>
//       {/* Trigger */}
//       <button
//         type="button"
//         onClick={() => !disabled && setIsOpen(!isOpen)}
//         disabled={disabled}
//         className={`
//           flex items-center justify-between w-full px-3 py-2 rounded-lg border text-sm
//           transition-all duration-200 ease-in-out
//           ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
//           ${themeClasses.input} 
//           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
//         `}
//       >
//         <span className="truncate text-left text-sm">
//           {selectedOption ? (selectedOption.label || selectedOption) : placeholder}
//         </span>
//         <ChevronDown 
//           className={`w-4 h-4 transition-transform flex-shrink-0 ml-2 ${
//             isOpen ? 'rotate-180' : ''
//           } ${themeClasses.text.tertiary}`} 
//         />
//       </button>

//       {/* Dropdown Panel */}
//       <AnimatePresence>
//         {isOpen && (
//           <>
//             {/* Backdrop for mobile */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
//               onClick={() => setIsOpen(false)}
//             />
            
//             {/* Dropdown Content */}
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95, y: -10 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.95, y: -10 }}
//               transition={{ duration: 0.2 }}
//               className={`
//                 absolute z-50 mt-1 w-full rounded-lg shadow-lg border
//                 ${themeClasses.bg.dropdown} ${themeClasses.border.light}
//                 max-h-60 overflow-y-auto
//                 focus:outline-none
//               `}
//               style={{
//                 // Ensure dropdown doesn't overflow viewport
//                 maxHeight: '16rem',
//                 minWidth: '100%'
//               }}
//             >
//               <div className="py-1">
//                 {options.map((option, index) => {
//                   const optionValue = option.value || option;
//                   const optionLabel = option.label || option;
//                   const isSelected = value === optionValue;
                  
//                   return (
//                     <button
//                       key={index}
//                       type="button"
//                       onClick={() => {
//                         onChange(optionValue);
//                         setIsOpen(false);
//                       }}
//                       className={`
//                         w-full text-left px-3 py-2 cursor-pointer transition-colors text-sm
//                         hover:bg-indigo-50 hover:text-indigo-900
//                         dark:hover:bg-indigo-900 dark:hover:text-indigo-50
//                         ${isSelected 
//                           ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white' 
//                           : themeClasses.text.primary
//                         }
//                         focus:outline-none focus:bg-indigo-100 focus:text-indigo-900
//                         dark:focus:bg-indigo-900 dark:focus:text-indigo-50
//                       `}
//                     >
//                       {optionLabel}
//                     </button>
//                   );
//                 })}
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// // Confirmation Modal Component
// export const ConfirmationModal = ({ 
//   isOpen, 
//   onClose, 
//   onConfirm, 
//   title, 
//   message,
//   confirmText = "Delete",
//   cancelText = "Cancel",
//   type = "danger",
//   theme = "light"
// }) => {
//   const themeClasses = getThemeClasses(theme);

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.9 }}
//         className={`w-full max-w-md rounded-xl shadow-lg ${themeClasses.bg.card} ${themeClasses.border.light} border p-6`}
//       >
//         <div className="flex items-center mb-4">
//           <div className={`p-2 rounded-full ${
//             type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
//           }`}>
//             <AlertTriangle className="w-6 h-6" />
//           </div>
//           <h3 className={`ml-3 text-lg font-semibold ${themeClasses.text.primary}`}>
//             {title}
//           </h3>
//         </div>
        
//         <p className={`mb-6 ${themeClasses.text.secondary}`}>
//           {message}
//         </p>
        
//         <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
//           <button
//             onClick={onClose}
//             className={`px-4 py-2 rounded-lg text-sm font-medium ${
//               theme === 'dark' 
//                 ? 'bg-gray-700 hover:bg-gray-600 text-white' 
//                 : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
//             }`}
//           >
//             {cancelText}
//           </button>
//           <button
//             onClick={onConfirm}
//             className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
//               type === 'danger' 
//                 ? 'bg-red-600 hover:bg-red-700' 
//                 : 'bg-green-600 hover:bg-green-700'
//             }`}
//           >
//             {confirmText}
//           </button>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// // Mobile Success Alert Component
// export const MobileSuccessAlert = ({ message, isVisible, onClose }) => {
//   if (!isVisible) return null;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: -50 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -50 }}
//       className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-4"
//     >
//       <div className="bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center justify-between">
//         <div className="flex items-center">
//           <Check className="w-5 h-5 mr-2" />
//           <span className="text-sm font-medium">{message}</span>
//         </div>
//         <button
//           onClick={onClose}
//           className="text-white hover:text-green-200 transition-colors"
//         >
//           <X className="w-4 h-4" />
//         </button>
//       </div>
//     </motion.div>
//   );
// };












import React from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, AlertTriangle, Check } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                         THEME-AWARE STYLING SYSTEM                         */
/* -------------------------------------------------------------------------- */
export const getThemeClasses = (theme) => ({
  bg: {
    primary:
      theme === "dark"
        ? "bg-gradient-to-br from-gray-900 to-indigo-900"
        : "bg-gradient-to-br from-white to-indigo-50",
    card:
      theme === "dark"
        ? "bg-gray-800/60 backdrop-blur-md"
        : "bg-white/80 backdrop-blur-md",
    secondary:
      theme === "dark"
        ? "bg-gray-800/80 backdrop-blur-md"
        : "bg-white/80 backdrop-blur-md",
    dropdown: theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900",
  },
  text: {
    primary: theme === "dark" ? "text-white" : "text-gray-800",
    secondary: theme === "dark" ? "text-gray-300" : "text-gray-600",
    tertiary: theme === "dark" ? "text-gray-400" : "text-gray-500",
  },
  border: {
    light: theme === "dark" ? "border-gray-700" : "border-gray-200",
    medium: theme === "dark" ? "border-gray-600" : "border-gray-300",
  },
  input:
    theme === "dark"
      ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
      : "bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500",
  button: {
    primary:
      "bg-indigo-600 hover:bg-indigo-700 text-white",
    secondary:
      theme === "dark"
        ? "bg-gray-700 hover:bg-gray-600 text-white"
        : "bg-gray-200 hover:bg-gray-300 text-gray-800",
    success: "bg-green-600 hover:bg-green-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  },
});

/* -------------------------------------------------------------------------- */
/*                      ENHANCED SELECT (STACKING FIXED)                      */
/* -------------------------------------------------------------------------- */
export const EnhancedSelect = ({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
  disabled = false,
  theme = "light",
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 });
  const buttonRef = React.useRef(null);
  const dropdownRef = React.useRef(null);
  const themeClasses = getThemeClasses(theme);

  // Update dropdown position when opened
  React.useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption =
    options.find((opt) => opt.value === value) ||
    options.find((opt) => opt === value);

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center justify-between w-full px-3 py-2 rounded-lg border text-sm
          transition-all duration-200 ease-in-out
          ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
          ${themeClasses.input}
          focus:outline-none focus:ring-2 focus:ring-indigo-500
        `}
      >
        <span className="truncate text-left text-sm">
          {selectedOption ? selectedOption.label || selectedOption : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 ml-2 transition-transform ${
            isOpen ? "rotate-180" : ""
          } ${themeClasses.text.tertiary}`}
        />
      </button>

      {/* Dropdown rendered via Portal for proper stacking */}
      {typeof window !== "undefined" &&
        ReactDOM.createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/10 z-[9998]"
                  onClick={() => setIsOpen(false)}
                />

                {/* Dropdown List */}
                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`fixed z-[9999] shadow-xl border rounded-lg overflow-hidden
                    ${themeClasses.bg.dropdown} ${themeClasses.border.light}`}
                  style={{
                    top: position.top,
                    left: position.left,
                    width: position.width,
                  }}
                >
                  <div className="py-1 max-h-60 overflow-y-auto">
                    {options.map((option, index) => {
                      const optionValue = option.value || option;
                      const optionLabel = option.label || option;
                      const isSelected = value === optionValue;
                      const isDisabled = option.disabled;

                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            if (!isDisabled) {
                              onChange(optionValue);
                              setIsOpen(false);
                            }
                          }}
                          disabled={isDisabled}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors
                            ${
                              isDisabled
                                ? "cursor-not-allowed opacity-50 text-gray-500"
                                : "cursor-pointer"
                            }
                            ${
                              !isDisabled && isSelected
                                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                : !isDisabled
                                ? `${themeClasses.text.primary} hover:bg-indigo-50 hover:text-indigo-900 dark:hover:bg-indigo-900 dark:hover:text-indigo-50`
                                : ""
                            }
                            focus:outline-none focus:bg-indigo-100 focus:text-indigo-900
                            dark:focus:bg-indigo-900 dark:focus:text-indigo-50`}
                        >
                          {optionLabel}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                            CONFIRMATION MODAL                              */
/* -------------------------------------------------------------------------- */
export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  type = "danger",
  theme = "light",
}) => {
  const themeClasses = getThemeClasses(theme);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`w-full max-w-md rounded-xl shadow-lg border p-6 ${themeClasses.bg.card} ${themeClasses.border.light}`}
      >
        <div className="flex items-center mb-4">
          <div
            className={`p-2 rounded-full ${
              type === "danger"
                ? "bg-red-100 text-red-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3
            className={`ml-3 text-lg font-semibold ${themeClasses.text.primary}`}
          >
            {title}
          </h3>
        </div>

        <p className={`mb-6 ${themeClasses.text.secondary}`}>{message}</p>

        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${themeClasses.button.secondary}`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
              type === "danger"
                ? themeClasses.button.danger
                : themeClasses.button.success
            }`}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                           MOBILE SUCCESS ALERT                             */
/* -------------------------------------------------------------------------- */
export const MobileSuccessAlert = ({ message, isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-sm px-4"
    >
      <div className="bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center justify-between">
        <div className="flex items-center">
          <Check className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">{message}</span>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-green-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
