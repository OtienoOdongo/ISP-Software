
// import React, { useState, useRef, useEffect, useMemo } from "react";
// import { FaCalendarAlt, FaChartBar, FaNetworkWired, FaWifi } from 'react-icons/fa';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import ReactDOM from "react-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import { ChevronDown, X, AlertTriangle, Check, TrendingUp, Users, DollarSign } from "lucide-react";

// /* -------------------------------------------------------------------------- */
// /*                         THEME-AWARE STYLING SYSTEM                         */
// /* -------------------------------------------------------------------------- */
// export const getThemeClasses = (theme) => ({
//   bg: {
//     primary:
//       theme === "dark"
//         ? "bg-gradient-to-br from-gray-900 to-indigo-900"
//         : "bg-gradient-to-br from-white to-indigo-50",
//     card:
//       theme === "dark"
//         ? "bg-gray-800/60 backdrop-blur-md"
//         : "bg-white/80 backdrop-blur-md",
//     secondary:
//       theme === "dark"
//         ? "bg-gray-800/80 backdrop-blur-md"
//         : "bg-white/80 backdrop-blur-md",
//     dropdown: theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900",
//   },
//   text: {
//     primary: theme === "dark" ? "text-white" : "text-gray-800",
//     secondary: theme === "dark" ? "text-gray-300" : "text-gray-600",
//     tertiary: theme === "dark" ? "text-gray-400" : "text-gray-500",
//   },
//   border: {
//     light: theme === "dark" ? "border-gray-700" : "border-gray-200",
//     medium: theme === "dark" ? "border-gray-600" : "border-gray-300",
//   },
//   input:
//     theme === "dark"
//       ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
//       : "bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500",
//   button: {
//     primary:
//       "bg-indigo-600 hover:bg-indigo-700 text-white",
//     secondary:
//       theme === "dark"
//         ? "bg-gray-700 hover:bg-gray-600 text-white"
//         : "bg-gray-200 hover:bg-gray-300 text-gray-800",
//     success: "bg-green-600 hover:bg-green-700 text-white",
//     danger: "bg-red-600 hover:bg-red-700 text-white",
//   },
// });

// /* -------------------------------------------------------------------------- */
// /*                      ENHANCED SELECT (STACKING FIXED)                      */
// /* -------------------------------------------------------------------------- */
// export const EnhancedSelect = ({
//   value,
//   onChange,
//   options,
//   placeholder = "Select an option",
//   className = "",
//   disabled = false,
//   theme = "light",
// }) => {
//   const [isOpen, setIsOpen] = React.useState(false);
//   const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 });
//   const buttonRef = React.useRef(null);
//   const dropdownRef = React.useRef(null);
//   const themeClasses = getThemeClasses(theme);

//   // Update dropdown position when opened
//   React.useEffect(() => {
//     if (isOpen && buttonRef.current) {
//       const rect = buttonRef.current.getBoundingClientRect();
//       setPosition({
//         top: rect.bottom + window.scrollY + 4,
//         left: rect.left + window.scrollX,
//         width: rect.width,
//       });
//     }
//   }, [isOpen]);

//   // Close dropdown when clicking outside
//   React.useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(e.target) &&
//         !buttonRef.current.contains(e.target)
//       ) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const selectedOption =
//     options.find((opt) => opt.value === value) ||
//     options.find((opt) => opt === value);

//   return (
//     <div className={`relative ${className}`}>
//       {/* Trigger Button */}
//       <button
//         ref={buttonRef}
//         type="button"
//         onClick={() => !disabled && setIsOpen(!isOpen)}
//         disabled={disabled}
//         className={`
//           flex items-center justify-between w-full px-3 py-2 rounded-lg border text-sm
//           transition-all duration-200 ease-in-out
//           ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
//           ${themeClasses.input}
//           focus:outline-none focus:ring-2 focus:ring-indigo-500
//         `}
//       >
//         <span className="truncate text-left text-sm">
//           {selectedOption ? selectedOption.label || selectedOption : placeholder}
//         </span>
//         <ChevronDown
//           className={`w-4 h-4 ml-2 transition-transform ${
//             isOpen ? "rotate-180" : ""
//           } ${themeClasses.text.tertiary}`}
//         />
//       </button>

//       {/* Dropdown rendered via Portal for proper stacking */}
//       {typeof window !== "undefined" &&
//         ReactDOM.createPortal(
//           <AnimatePresence>
//             {isOpen && (
//               <>
//                 {/* Backdrop */}
//                 <motion.div
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   exit={{ opacity: 0 }}
//                   className="fixed inset-0 bg-black/10 z-[9998]"
//                   onClick={() => setIsOpen(false)}
//                 />

//                 {/* Dropdown List */}
//                 <motion.div
//                   ref={dropdownRef}
//                   initial={{ opacity: 0, scale: 0.95, y: -10 }}
//                   animate={{ opacity: 1, scale: 1, y: 0 }}
//                   exit={{ opacity: 0, scale: 0.95, y: -10 }}
//                   transition={{ duration: 0.2 }}
//                   className={`fixed z-[9999] shadow-xl border rounded-lg overflow-hidden
//                     ${themeClasses.bg.dropdown} ${themeClasses.border.light}`}
//                   style={{
//                     top: position.top,
//                     left: position.left,
//                     width: position.width,
//                   }}
//                 >
//                   <div className="py-1 max-h-60 overflow-y-auto">
//                     {options.map((option, index) => {
//                       const optionValue = option.value || option;
//                       const optionLabel = option.label || option;
//                       const isSelected = value === optionValue;
//                       const isDisabled = option.disabled;

//                       return (
//                         <button
//                           key={index}
//                           type="button"
//                           onClick={() => {
//                             if (!isDisabled) {
//                               onChange(optionValue);
//                               setIsOpen(false);
//                             }
//                           }}
//                           disabled={isDisabled}
//                           className={`w-full text-left px-3 py-2 text-sm transition-colors
//                             ${
//                               isDisabled
//                                 ? "cursor-not-allowed opacity-50 text-gray-500"
//                                 : "cursor-pointer"
//                             }
//                             ${
//                               !isDisabled && isSelected
//                                 ? "bg-indigo-600 text-white hover:bg-indigo-700"
//                                 : !isDisabled
//                                 ? `${themeClasses.text.primary} hover:bg-indigo-50 hover:text-indigo-900 dark:hover:bg-indigo-900 dark:hover:text-indigo-50`
//                                 : ""
//                             }
//                             focus:outline-none focus:bg-indigo-100 focus:text-indigo-900
//                             dark:focus:bg-indigo-900 dark:focus:text-indigo-50`}
//                         >
//                           {optionLabel}
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </motion.div>
//               </>
//             )}
//           </AnimatePresence>,
//           document.body
//         )}
//     </div>
//   );
// };

// /* -------------------------------------------------------------------------- */
// /*                            CONFIRMATION MODAL                              */
// /* -------------------------------------------------------------------------- */
// export const ConfirmationModal = ({
//   isOpen,
//   onClose,
//   onConfirm,
//   title,
//   message,
//   confirmText = "Delete",
//   cancelText = "Cancel",
//   type = "danger",
//   theme = "light",
// }) => {
//   const themeClasses = getThemeClasses(theme);
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.9 }}
//         className={`w-full max-w-md rounded-xl shadow-lg border p-6 ${themeClasses.bg.card} ${themeClasses.border.light}`}
//       >
//         <div className="flex items-center mb-4">
//           <div
//             className={`p-2 rounded-full ${
//               type === "danger"
//                 ? "bg-red-100 text-red-600"
//                 : "bg-green-100 text-green-600"
//             }`}
//           >
//             <AlertTriangle className="w-6 h-6" />
//           </div>
//           <h3
//             className={`ml-3 text-lg font-semibold ${themeClasses.text.primary}`}
//           >
//             {title}
//           </h3>
//         </div>

//         <p className={`mb-6 ${themeClasses.text.secondary}`}>{message}</p>

//         <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
//           <button
//             onClick={onClose}
//             className={`px-4 py-2 rounded-lg text-sm font-medium ${themeClasses.button.secondary}`}
//           >
//             {cancelText}
//           </button>
//           <button
//             onClick={onConfirm}
//             className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
//               type === "danger"
//                 ? themeClasses.button.danger
//                 : themeClasses.button.success
//             }`}
//           >
//             {confirmText}
//           </button>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// /* -------------------------------------------------------------------------- */
// /*                           MOBILE SUCCESS ALERT                             */
// /* -------------------------------------------------------------------------- */
// export const MobileSuccessAlert = ({ message, isVisible, onClose }) => {
//   if (!isVisible) return null;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: -50 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -50 }}
//       className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-sm px-4"
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


// // Enhanced DatePicker Component using Portal (same logic as EnhancedSelect)
// export const EnhancedDatePicker = ({
//   selected,
//   onChange,
//   selectsStart,
//   selectsEnd,
//   startDate,
//   endDate,
//   minDate,
//   placeholderText = "Select date",
//   className = "",
//   theme = "light",
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
//   const buttonRef = useRef(null);
//   const calendarRef = useRef(null);

//   // Update calendar position when opened
//   useEffect(() => {
//     if (isOpen && buttonRef.current) {
//       const rect = buttonRef.current.getBoundingClientRect();
//       setPosition({
//         top: rect.bottom + window.scrollY + 4,
//         left: rect.left + window.scrollX,
//         width: rect.width,
//       });
//     }
//   }, [isOpen]);

//   // Close calendar when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (
//         calendarRef.current &&
//         !calendarRef.current.contains(e.target) &&
//         !buttonRef.current.contains(e.target)
//       ) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const themeClasses = {
//     input: theme === "dark"
//       ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
//       : "bg-white border-gray-300 text-gray-800 placeholder-gray-500",
//     calendar: theme === "dark" 
//       ? "bg-gray-800 border-gray-700 text-white" 
//       : "bg-white border-gray-200 text-gray-800"
//   };

//   return (
//     <div className={`relative ${className}`}>
//       {/* Trigger Button */}
//       <button
//         ref={buttonRef}
//         type="button"
//         onClick={() => setIsOpen(!isOpen)}
//         className={`
//           flex items-center justify-between w-full px-3 py-2 rounded-lg border text-sm
//           transition-all duration-200 ease-in-out cursor-pointer
//           ${themeClasses.input}
//           focus:outline-none focus:ring-2 focus:ring-indigo-500
//         `}
//       >
//         <span className="truncate text-left text-sm">
//           {selected ? selected.toLocaleDateString() : placeholderText}
//         </span>
//         <FaCalendarAlt className={`w-4 h-4 ml-2 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
//       </button>

//       {/* Calendar rendered via Portal for proper stacking */}
//       {typeof window !== 'undefined' && ReactDOM.createPortal(
//         <AnimatePresence>
//           {isOpen && (
//             <>
//               {/* Backdrop */}
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 className="fixed inset-0 bg-black/10 z-[9998]"
//                 onClick={() => setIsOpen(false)}
//               />

//               {/* Calendar */}
//               <motion.div
//                 ref={calendarRef}
//                 initial={{ opacity: 0, scale: 0.95, y: -10 }}
//                 animate={{ opacity: 1, scale: 1, y: 0 }}
//                 exit={{ opacity: 0, scale: 0.95, y: -10 }}
//                 transition={{ duration: 0.2 }}
//                 className={`fixed z-[9999] shadow-xl border rounded-lg overflow-hidden ${themeClasses.calendar}`}
//                 style={{
//                   top: position.top,
//                   left: position.left,
//                 }}
//               >
//                 <DatePicker
//                   selected={selected}
//                   onChange={(date) => {
//                     onChange(date);
//                     setIsOpen(false);
//                   }}
//                   selectsStart={selectsStart}
//                   selectsEnd={selectsEnd}
//                   startDate={startDate}
//                   endDate={endDate}
//                   minDate={minDate}
//                   inline
//                   className="border-0"
//                   calendarClassName={`border-0 ${themeClasses.calendar}`}
//                   dayClassName={(date) => 
//                     theme === 'dark' 
//                       ? 'text-white hover:bg-indigo-600' 
//                       : 'text-gray-800 hover:bg-indigo-100'
//                   }
//                 />
//               </motion.div>
//             </>
//           )}
//         </AnimatePresence>,
//         document.body
//       )}
//     </div>
//   );
// };





// /* -------------------------------------------------------------------------- */
// /*                         ACCESS TYPE BADGE COMPONENT                        */
// /* -------------------------------------------------------------------------- */
// export const AccessTypeBadge = ({ accessType, theme = "light", size = "md" }) => {
//   const sizeClasses = {
//     sm: "px-2 py-1 text-xs",
//     md: "px-3 py-1 text-sm",
//     lg: "px-4 py-2 text-base"
//   };

//   const accessTypeConfig = {
//     hotspot: {
//       icon: FaWifi,
//       color: theme === "dark" ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-800",
//       border: theme === "dark" ? "border-blue-700" : "border-blue-300"
//     },
//     pppoe: {
//       icon: FaNetworkWired,
//       color: theme === "dark" ? "bg-green-900 text-green-300" : "bg-green-100 text-green-800",
//       border: theme === "dark" ? "border-green-700" : "border-green-300"
//     },
//     both: {
//       icon: Users,
//       color: theme === "dark" ? "bg-purple-900 text-purple-300" : "bg-purple-100 text-purple-800",
//       border: theme === "dark" ? "border-purple-700" : "border-purple-300"
//     },
//     general: {
//       icon: DollarSign,
//       color: theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-800",
//       border: theme === "dark" ? "border-gray-600" : "border-gray-300"
//     }
//   };

//   const config = accessTypeConfig[accessType] || accessTypeConfig.general;
//   const IconComponent = config.icon;

//   return (
//     <span className={`
//       inline-flex items-center rounded-full border font-medium ${sizeClasses[size]}
//       ${config.color} ${config.border}
//     `}>
//       <IconComponent className="w-3 h-3 mr-1" />
//       {accessType.charAt(0).toUpperCase() + accessType.slice(1)}
//     </span>
//   );
// };

// /* -------------------------------------------------------------------------- */
// /*                         REVENUE DISTRIBUTION CHART                         */
// /* -------------------------------------------------------------------------- */
// export const RevenueDistributionChart = ({ distribution, theme = "light" }) => {
//   if (!distribution || Object.keys(distribution).length === 0) {
//     return (
//       <div className={`text-center py-8 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
//         No revenue distribution data available
//       </div>
//     );
//   }

//   const total = Object.values(distribution).reduce((sum, value) => sum + value, 0);
  
//   const segments = [
//     { type: 'hotspot', percentage: distribution.hotspot || 0, color: theme === "dark" ? "#3b82f6" : "#60a5fa" },
//     { type: 'pppoe', percentage: distribution.pppoe || 0, color: theme === "dark" ? "#10b981" : "#34d399" },
//     { type: 'both', percentage: distribution.both || 0, color: theme === "dark" ? "#8b5cf6" : "#a78bfa" }
//   ].filter(segment => segment.percentage > 0);

//   return (
//     <div className="w-full">
//       {/* Chart */}
//       <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
//         {segments.map((segment, index) => (
//           <div
//             key={segment.type}
//             className="absolute h-full transition-all duration-500 ease-out"
//             style={{
//               left: `${segments.slice(0, index).reduce((sum, s) => sum + s.percentage, 0)}%`,
//               width: `${segment.percentage}%`,
//               backgroundColor: segment.color
//             }}
//           />
//         ))}
//       </div>
      
//       {/* Legend */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
//         {segments.map(segment => (
//           <div key={segment.type} className="flex items-center justify-between text-sm">
//             <div className="flex items-center">
//               <div
//                 className="w-3 h-3 rounded-full mr-2"
//                 style={{ backgroundColor: segment.color }}
//               />
//               <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
//                 {segment.type.charAt(0).toUpperCase() + segment.type.slice(1)}
//               </span>
//             </div>
//             <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
//               {segment.percentage.toFixed(1)}%
//             </span>
//           </div>
//         ))}
//       </div>
      
//       {total === 0 && (
//         <div className={`text-center text-sm mt-2 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
//           No revenue recorded in selected period
//         </div>
//       )}
//     </div>
//   );
// };









import React, { useState, useRef, useEffect, useMemo } from "react";
import { FaCalendarAlt, FaChartBar, FaNetworkWired, FaWifi, FaClock, FaCalendarDays, FaGlobe, FaCalendarTimes, FaExclamationTriangle } from 'react-icons/fa';
import { 
  Calendar, Clock, AlertTriangle, Check, TrendingUp, Users, DollarSign, 
  Zap, Battery, Cloud, Server, Shield, Wifi, Cable, Lock, Unlock,
  Activity, Target, PieChart, BarChart3, TrendingDown, Star,
  AlertCircle, Timer, CheckCircle, XCircle, Info, Eye, EyeOff,
  Radio, HardDrive, Cpu, ShieldCheck, BatteryCharging, WifiOff,
  CalendarClock, CalendarOff, Globe, Smartphone, Router
} from "lucide-react";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

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
    success: theme === "dark" ? "bg-green-900/20" : "bg-green-50",
    warning: theme === "dark" ? "bg-yellow-900/20" : "bg-yellow-50",
    danger: theme === "dark" ? "bg-red-900/20" : "bg-red-50",
    info: theme === "dark" ? "bg-blue-900/20" : "bg-blue-50",
  },
  text: {
    primary: theme === "dark" ? "text-white" : "text-gray-800",
    secondary: theme === "dark" ? "text-gray-300" : "text-gray-600",
    tertiary: theme === "dark" ? "text-gray-400" : "text-gray-500",
    success: theme === "dark" ? "text-green-400" : "text-green-700",
    warning: theme === "dark" ? "text-yellow-400" : "text-yellow-700",
    danger: theme === "dark" ? "text-red-400" : "text-red-700",
    info: theme === "dark" ? "text-blue-400" : "text-blue-600",
  },
  border: {
    light: theme === "dark" ? "border-gray-700" : "border-gray-200",
    medium: theme === "dark" ? "border-gray-600" : "border-gray-300",
    success: theme === "dark" ? "border-green-700" : "border-green-300",
    warning: theme === "dark" ? "border-yellow-700" : "border-yellow-300",
    danger: theme === "dark" ? "border-red-700" : "border-red-300",
    info: theme === "dark" ? "border-blue-700" : "border-blue-300",
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
    warning: "bg-yellow-600 hover:bg-yellow-700 text-white",
    info: "bg-blue-600 hover:bg-blue-700 text-white",
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
  isSearchable = false,
  isLoading = false,
  isMulti = false,
  closeOnSelect = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const themeClasses = getThemeClasses(theme);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(option => {
      const label = option.label || option.toString();
      return label.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [options, searchTerm]);

  // Update dropdown position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 200),
      });
      
      // Focus search input if searchable
      if (isSearchable && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    }
  }, [isOpen, isSearchable]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const selectedOption = useMemo(() => {
    if (isMulti && Array.isArray(value)) {
      return options.filter(opt => value.includes(opt.value));
    }
    return options.find((opt) => opt.value === value) ||
           options.find((opt) => opt === value);
  }, [options, value, isMulti]);

  const handleSelect = (optionValue) => {
    if (isMulti) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      onChange(newValues);
    } else {
      onChange(optionValue);
      if (closeOnSelect) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }
  };

  const isOptionSelected = (optionValue) => {
    if (isMulti && Array.isArray(value)) {
      return value.includes(optionValue);
    }
    return value === optionValue;
  };

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
        <div className="flex items-center flex-wrap gap-1 min-w-0">
          {isMulti && Array.isArray(selectedOption) ? (
            selectedOption.length > 0 ? (
              <span className="flex items-center gap-1">
                <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs px-2 py-0.5 rounded">
                  {selectedOption.length} selected
                </span>
              </span>
            ) : (
              <span className="truncate text-left text-sm opacity-70">
                {placeholder}
              </span>
            )
          ) : (
            <span className="truncate text-left text-sm">
              {selectedOption ? selectedOption.label || selectedOption : placeholder}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isLoading && (
            <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-indigo-600 rounded-full animate-spin" />
          )}
          <ChevronDown
            className={`w-4 h-4 ml-2 transition-transform ${
              isOpen ? "rotate-180" : ""
            } ${themeClasses.text.tertiary}`}
          />
        </div>
      </button>

      {/* Dropdown rendered via Portal */}
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
                  onClick={() => {
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                />

                {/* Dropdown List */}
                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`fixed z-[9999] shadow-xl border rounded-lg overflow-hidden min-w-[200px]
                    ${themeClasses.bg.dropdown} ${themeClasses.border.light}`}
                  style={{
                    top: position.top,
                    left: position.left,
                    width: position.width,
                    maxHeight: '300px',
                  }}
                >
                  {/* Search Input */}
                  {isSearchable && (
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search..."
                        className={`w-full px-3 py-2 text-sm rounded-lg border ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-800'
                        } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      />
                    </div>
                  )}

                  {/* Loading State */}
                  {isLoading && (
                    <div className="py-8 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 border-t-indigo-600 rounded-full animate-spin" />
                    </div>
                  )}

                  {/* Options List */}
                  {!isLoading && (
                    <div className="py-1 max-h-60 overflow-y-auto">
                      {filteredOptions.length === 0 ? (
                        <div className={`px-3 py-2 text-sm text-center ${themeClasses.text.tertiary}`}>
                          No options found
                        </div>
                      ) : (
                        filteredOptions.map((option, index) => {
                          const optionValue = option.value || option;
                          const optionLabel = option.label || option;
                          const isDisabled = option.disabled;
                          const isSelected = isOptionSelected(optionValue);
                          const hasIcon = option.icon;

                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                if (!isDisabled) {
                                  handleSelect(optionValue);
                                }
                              }}
                              disabled={isDisabled}
                              className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2
                                ${
                                  isDisabled
                                    ? "cursor-not-allowed opacity-50 text-gray-500"
                                    : "cursor-pointer"
                                }
                                ${
                                  !isDisabled && isSelected
                                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                    : !isDisabled
                                    ? `${themeClasses.text.primary} hover:bg-gray-100 dark:hover:bg-gray-700`
                                    : ""
                                }
                                focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700`}
                            >
                              {hasIcon && (
                                <span className="w-4 h-4 flex items-center justify-center">
                                  {option.icon}
                                </span>
                              )}
                              {isMulti && (
                                <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                                  isSelected 
                                    ? 'bg-indigo-600 border-indigo-600' 
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                  {isSelected && <Check className="w-3 h-3 text-white" />}
                                </div>
                              )}
                              <span className="flex-1 text-left">{optionLabel}</span>
                              {option.badge && (
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  option.badgeColor || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                                }`}>
                                  {option.badge}
                                </span>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
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
/*                         TIME RANGE INPUT COMPONENT                         */
/* -------------------------------------------------------------------------- */
export const TimeRangeInput = ({ 
  startTime, 
  endTime, 
  onChange, 
  theme = "light",
  disabled = false,
  label = "Time Range",
  showLabels = true 
}) => {
  const themeClasses = getThemeClasses(theme);

  const formatTimeForInput = (timeStr) => {
    if (!timeStr) return '';
    if (timeStr.includes(':')) return timeStr;
    
    // Convert seconds to HH:MM
    const totalSeconds = parseInt(timeStr);
    if (isNaN(totalSeconds)) return '';
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const parseTimeToSeconds = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours * 3600) + (minutes * 60);
  };

  const handleStartTimeChange = (e) => {
    onChange({
      startTime: parseTimeToSeconds(e.target.value),
      endTime: endTime
    });
  };

  const handleEndTimeChange = (e) => {
    onChange({
      startTime: startTime,
      endTime: parseTimeToSeconds(e.target.value)
    });
  };

  return (
    <div className="space-y-2">
      {showLabels && (
        <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
          {label}
        </label>
      )}
      <div className="flex items-center space-x-2">
        <input
          type="time"
          value={formatTimeForInput(startTime)}
          onChange={handleStartTimeChange}
          disabled={disabled}
          className={`flex-1 px-3 py-2 rounded-lg border text-sm ${themeClasses.input} ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        />
        <span className={themeClasses.text.secondary}>to</span>
        <input
          type="time"
          value={formatTimeForInput(endTime)}
          onChange={handleEndTimeChange}
          disabled={disabled}
          className={`flex-1 px-3 py-2 rounded-lg border text-sm ${themeClasses.input} ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                          DATE RANGE PICKER COMPONENT                       */
/* -------------------------------------------------------------------------- */
export const DateRangePicker = ({
  startDate,
  endDate,
  onChange,
  theme = "light",
  disabled = false,
  minDate = null,
  maxDate = null,
  placeholder = "Select date range",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalStartDate, setInternalStartDate] = useState(startDate);
  const [internalEndDate, setInternalEndDate] = useState(endDate);
  const buttonRef = useRef(null);
  const calendarRef = useRef(null);
  const themeClasses = getThemeClasses(theme);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateDisplay = () => {
    if (!startDate && !endDate) return placeholder;
    const start = startDate ? new Date(startDate).toLocaleDateString() : '';
    const end = endDate ? new Date(endDate).toLocaleDateString() : '';
    return `${start} - ${end}`;
  };

  const handleApply = () => {
    onChange({
      startDate: internalStartDate,
      endDate: internalEndDate
    });
    setIsOpen(false);
  };

  const handleClear = () => {
    setInternalStartDate(null);
    setInternalEndDate(null);
    onChange({
      startDate: null,
      endDate: null
    });
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 rounded-lg border text-sm flex items-center justify-between ${
          themeClasses.input
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="truncate">{formatDateDisplay()}</span>
        <FaCalendarAlt className="w-4 h-4 ml-2" />
      </button>

      {isOpen && (
        <div
          ref={calendarRef}
          className={`absolute z-50 mt-1 p-4 rounded-lg shadow-lg border ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700 text-white' 
              : 'bg-white border-gray-200 text-gray-800'
          }`}
          style={{ minWidth: '300px' }}
        >
          <div className="mb-4">
            <h4 className="font-medium mb-2">Select Date Range</h4>
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-xs mb-1">Start Date</label>
                <DatePicker
                  selected={internalStartDate}
                  onChange={setInternalStartDate}
                  selectsStart
                  startDate={internalStartDate}
                  endDate={internalEndDate}
                  minDate={minDate}
                  maxDate={maxDate || internalEndDate}
                  className={`w-full px-2 py-1 border rounded text-sm ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs mb-1">End Date</label>
                <DatePicker
                  selected={internalEndDate}
                  onChange={setInternalEndDate}
                  selectsEnd
                  startDate={internalStartDate}
                  endDate={internalEndDate}
                  minDate={internalStartDate || minDate}
                  maxDate={maxDate}
                  className={`w-full px-2 py-1 border rounded text-sm ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
            >
              Clear
            </button>
            <div className="space-x-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
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
  isMobile = false,
  isLoading = false,
  destructive = true
}) => {
  const themeClasses = getThemeClasses(theme);
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: AlertTriangle,
      iconBg: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
      button: themeClasses.button.danger
    },
    warning: {
      icon: AlertCircle,
      iconBg: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
      button: "bg-yellow-600 hover:bg-yellow-700 text-white"
    },
    success: {
      icon: CheckCircle,
      iconBg: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
      button: themeClasses.button.success
    },
    info: {
      icon: Info,
      iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      button: themeClasses.button.info
    }
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`w-full max-w-md rounded-xl shadow-lg border p-6 ${themeClasses.bg.card} ${themeClasses.border.light}`}
      >
        <div className="flex items-start mb-4">
          <div className={`p-2 rounded-full ${config.iconBg}`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
              {title}
            </h3>
            <p className={`mt-1 text-sm ${themeClasses.text.secondary}`}>
              {message}
            </p>
          </div>
        </div>

        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-3 ${isMobile ? '' : 'justify-end'}`}>
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${themeClasses.button.secondary} ${isMobile ? 'order-2' : ''}`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            } ${destructive ? config.button : themeClasses.button.primary} ${isMobile ? 'order-1' : ''}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Processing...
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                           MOBILE SUCCESS ALERT                             */
/* -------------------------------------------------------------------------- */
export const MobileSuccessAlert = ({ message, isVisible, onClose, theme = "light" }) => {
  const themeClasses = getThemeClasses(theme);
  
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-sm px-4"
    >
      <div className={`p-4 rounded-lg shadow-lg flex items-center justify-between ${
        theme === 'dark' ? 'bg-green-800 text-green-100' : 'bg-green-500 text-white'
      }`}>
        <div className="flex items-center">
          <Check className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">{message}</span>
        </div>
        <button
          onClick={onClose}
          className={`${theme === 'dark' ? 'text-green-300 hover:text-green-100' : 'text-white hover:text-green-200'} transition-colors`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              LOADING OVERLAY                               */
/* -------------------------------------------------------------------------- */
export const LoadingOverlay = ({ 
  isVisible, 
  message = "Loading...", 
  theme = "light",
  fullScreen = false 
}) => {
  if (!isVisible) return null;

  const themeClasses = getThemeClasses(theme);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[9999] flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900/80' : 'bg-white/80'
      } ${fullScreen ? 'backdrop-blur-sm' : ''}`}
    >
      <div className={`p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-indigo-600 rounded-full animate-spin" />
          <p className={`text-sm font-medium ${themeClasses.text.primary}`}>
            {message}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

/* -------------------------------------------------------------------------- */
/*                               EMPTY STATE                                  */
/* -------------------------------------------------------------------------- */
export const EmptyState = ({
  icon: Icon = Server,
  title = "No data available",
  description = "There's nothing to display here yet.",
  actionLabel,
  onAction,
  theme = "light"
}) => {
  const themeClasses = getThemeClasses(theme);

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${themeClasses.text.secondary}`}>
      <div className={`p-4 rounded-full mb-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <Icon className="w-8 h-8" />
      </div>
      <h3 className={`text-lg font-medium mb-2 ${themeClasses.text.primary}`}>
        {title}
      </h3>
      <p className="max-w-sm text-sm mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${themeClasses.button.primary}`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                         AVAILABILITY BADGE COMPONENT                       */
/* -------------------------------------------------------------------------- */
export const AvailabilityBadge = ({ 
  status, 
  message, 
  theme = "light",
  size = "md",
  showIcon = true,
  showTime = false,
  nextAvailableTime = null
}) => {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base"
  };

  const statusConfig = {
    available: {
      icon: CheckCircle,
      color: theme === "dark" ? "bg-green-900 text-green-300" : "bg-green-100 text-green-800",
      border: theme === "dark" ? "border-green-700" : "border-green-300",
      label: "Available"
    },
    unavailable: {
      icon: XCircle,
      color: theme === "dark" ? "bg-red-900 text-red-300" : "bg-red-100 text-red-800",
      border: theme === "dark" ? "border-red-700" : "border-red-300",
      label: "Unavailable"
    },
    restricted: {
      icon: Clock,
      color: theme === "dark" ? "bg-yellow-900 text-yellow-300" : "bg-yellow-100 text-yellow-800",
      border: theme === "dark" ? "border-yellow-700" : "border-yellow-300",
      label: "Time Restricted"
    },
    scheduled: {
      icon: CalendarClock,
      color: theme === "dark" ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-800",
      border: theme === "dark" ? "border-blue-700" : "border-blue-300",
      label: "Scheduled"
    },
    maintenance: {
      icon: AlertTriangle,
      color: theme === "dark" ? "bg-orange-900 text-orange-300" : "bg-orange-100 text-orange-800",
      border: theme === "dark" ? "border-orange-700" : "border-orange-300",
      label: "Maintenance"
    }
  };

  const config = statusConfig[status] || statusConfig.unavailable;
  const IconComponent = config.icon;

  return (
    <div className={`inline-flex flex-col items-start ${sizeClasses[size]}`}>
      <div className={`
        inline-flex items-center rounded-full border font-medium
        ${config.color} ${config.border}
      `}>
        {showIcon && <IconComponent className="w-3 h-3 mr-1" />}
        <span>{config.label}</span>
      </div>
      {message && (
        <div className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {message}
        </div>
      )}
      {showTime && nextAvailableTime && (
        <div className={`mt-1 text-xs flex items-center ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
          <Clock className="w-3 h-3 mr-1" />
          Next: {nextAvailableTime}
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                           PRICE BADGE COMPONENT                            */
/* -------------------------------------------------------------------------- */
export const PriceBadge = ({ 
  price, 
  originalPrice, 
  currency = "KES", 
  theme = "light",
  size = "md",
  showDiscount = true 
}) => {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  const hasDiscount = originalPrice && originalPrice > price;

  return (
    <div className="flex items-center gap-2">
      <span className={`font-bold ${sizeClasses[size]} ${
        theme === 'dark' ? 'text-white' : 'text-gray-800'
      }`}>
        {currency} {price.toLocaleString()}
      </span>
      {hasDiscount && showDiscount && (
        <>
          <span className={`text-sm line-through ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {currency} {originalPrice.toLocaleString()}
          </span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
            theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
          }`}>
            {Math.round((1 - price / originalPrice) * 100)}% off
          </span>
        </>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                           PLAN TYPE BADGE COMPONENT                        */
/* -------------------------------------------------------------------------- */
export const PlanTypeBadge = ({ 
  type, 
  theme = "light", 
  size = "md",
  showIcon = true 
}) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base"
  };

  const typeConfig = {
    paid: {
      icon: DollarSign,
      color: theme === "dark" ? "bg-indigo-900 text-indigo-300" : "bg-indigo-100 text-indigo-800",
      border: theme === "dark" ? "border-indigo-700" : "border-indigo-300",
      label: "Paid"
    },
    free_trial: {
      icon: Clock,
      color: theme === "dark" ? "bg-green-900 text-green-300" : "bg-green-100 text-green-800",
      border: theme === "dark" ? "border-green-700" : "border-green-300",
      label: "Free Trial"
    },
    promotional: {
      icon: Star,
      color: theme === "dark" ? "bg-yellow-900 text-yellow-300" : "bg-yellow-100 text-yellow-800",
      border: theme === "dark" ? "border-yellow-700" : "border-yellow-300",
      label: "Promotional"
    },
    enterprise: {
      icon: Shield,
      color: theme === "dark" ? "bg-purple-900 text-purple-300" : "bg-purple-100 text-purple-800",
      border: theme === "dark" ? "border-purple-700" : "border-purple-300",
      label: "Enterprise"
    }
  };

  const config = typeConfig[type] || typeConfig.paid;
  const IconComponent = config.icon;

  return (
    <span className={`
      inline-flex items-center rounded-full border font-medium ${sizeClasses[size]}
      ${config.color} ${config.border}
    `}>
      {showIcon && <IconComponent className="w-3 h-3 mr-1" />}
      {config.label}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/*                         STATISTICS CARD COMPONENT                          */
/* -------------------------------------------------------------------------- */
export const StatisticsCard = ({
  title,
  value,
  change,
  icon: Icon,
  theme = "light",
  format = "number",
  trend = "neutral",
  loading = false
}) => {
  const themeClasses = getThemeClasses(theme);
  
  const formatValue = (val) => {
    if (format === "currency") {
      return `KES ${val.toLocaleString()}`;
    } else if (format === "percentage") {
      return `${val}%`;
    } else if (format === "time") {
      return `${val}h`;
    }
    return val.toLocaleString();
  };

  const trendConfig = {
    up: {
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/30"
    },
    down: {
      icon: TrendingDown,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/30"
    },
    neutral: {
      icon: TrendingUp,
      color: "text-gray-600 dark:text-gray-400",
      bg: "bg-gray-100 dark:bg-gray-800"
    }
  };

  const trendInfo = trendConfig[trend];
  const TrendIcon = trendInfo.icon;

  return (
    <div className={`p-4 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className={`text-sm font-medium ${themeClasses.text.secondary}`}>
          {title}
        </h4>
        {Icon && (
          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      ) : (
        <div className="text-2xl font-bold mb-2">
          {formatValue(value)}
        </div>
      )}
      
      {change !== undefined && !loading && (
        <div className="flex items-center gap-1">
          <div className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${trendInfo.bg} ${trendInfo.color}`}>
            <TrendIcon className="w-3 h-3" />
            <span>{Math.abs(change)}%</span>
          </div>
          <span className={`text-xs ${themeClasses.text.tertiary}`}>
            {trend === 'up' ? 'increase' : trend === 'down' ? 'decrease' : 'from last period'}
          </span>
        </div>
      )}
    </div>
  );
};