

// import React, { useReducer, useEffect, useCallback, useState, useMemo, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Wifi, Server, Upload, Settings, X, Users, RefreshCw, Plus,
//   CheckCircle, Globe, Download, LogOut, LogIn, ChevronDown,
//   ChevronUp, Trash2, Edit, Clock, MapPin, Activity, Zap,
//   Shield, AlertCircle, History, RotateCcw, Battery, BatteryCharging,
//   Router, Lock, User, Hash, Key, ShieldCheck
// } from "lucide-react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { ThreeDots } from "react-loader-spinner";
// import api from "../../api";
// import { useTheme } from "../../context/ThemeContext";

// // Enhanced Button Component with better theme support
// const Button = ({ onClick, label, icon, color = "indigo", disabled, compact, fullWidth, theme, className = "" }) => {
//   const colorClasses = {
//     indigo: theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700',
//     green: 'bg-green-600 hover:bg-green-700',
//     red: 'bg-red-600 hover:bg-red-700',
//     blue: 'bg-blue-600 hover:bg-blue-700',
//     teal: 'bg-teal-600 hover:bg-teal-700',
//     purple: 'bg-purple-600 hover:bg-purple-700',
//     yellow: 'bg-yellow-600 hover:bg-yellow-700',
//     gray: theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
//   };

//   return (
//     <motion.button
//       whileHover={{ scale: disabled ? 1 : 1.05 }}
//       whileTap={{ scale: disabled ? 1 : 0.95 }}
//       onClick={onClick}
//       disabled={disabled}
//       className={`
//         ${colorClasses[color]} 
//         ${compact ? "px-3 py-2 text-sm" : "px-4 py-3"} 
//         ${fullWidth ? "w-full" : ""} 
//         ${className} 
//         text-white rounded-xl flex items-center justify-center font-medium 
//         disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 
//         shadow-md hover:shadow-lg
//         min-h-[44px]
//       `}
//       aria-disabled={disabled}
//     >
//       {icon && React.cloneElement(icon, { className: `w-4 h-4 ${label ? "mr-2" : ""}` })}
//       {label && <span>{label}</span>}
//     </motion.button>
//   );
// };

// // Enhanced Modal Component
// const Modal = ({ isOpen, title, onClose, children, size = "md", theme }) => (
//   <AnimatePresence>
//     {isOpen && (
//       <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//         <motion.div
//           initial={{ scale: 0.9, opacity: 0, y: 20 }}
//           animate={{ scale: 1, opacity: 1, y: 0 }}
//           exit={{ scale: 0.9, opacity: 0, y: 20 }}
//           className={`
//             rounded-2xl 
//             ${size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-4xl" : "max-w-xl"} 
//             w-full max-h-[90vh] overflow-y-auto backdrop-blur-md transition-all duration-300 shadow-2xl
//             ${theme === 'dark' 
//               ? 'bg-gray-800/90 border border-gray-700' 
//               : 'bg-white/95 border border-gray-200'
//             }
//           `}
//         >
//           <div className={`
//             flex justify-between items-center p-6 border-b rounded-t-2xl
//             ${theme === 'dark' 
//               ? 'border-gray-700 bg-gray-800' 
//               : 'border-gray-200 bg-gray-50'
//             }
//           `}>
//             <h3 className="text-xl font-semibold text-indigo-600">{title}</h3>
//             <button 
//               onClick={onClose} 
//               className={`
//                 p-2 rounded-xl transition-colors duration-300 hover:scale-110
//                 ${theme === 'dark' 
//                   ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
//                   : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
//                 }
//               `}
//               aria-label="Close modal"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>
//           <div className="p-6">
//             {children}
//           </div>
//         </motion.div>
//       </div>
//     )}
//   </AnimatePresence>
// );

// // Confirmation Modal Component
// const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, theme }) => (
//   <AnimatePresence>
//     {isOpen && (
//       <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//         <motion.div
//           initial={{ scale: 0.9, opacity: 0, y: 20 }}
//           animate={{ scale: 1, opacity: 1, y: 0 }}
//           exit={{ scale: 0.9, opacity: 0, y: 20 }}
//           className={`
//             rounded-2xl max-w-md w-full backdrop-blur-md transition-all duration-300 shadow-2xl
//             ${theme === 'dark' 
//               ? 'bg-gray-800/90 border border-gray-700' 
//               : 'bg-white/95 border border-gray-200'
//             }
//           `}
//         >
//           <div className={`
//             p-6 border-b rounded-t-2xl
//             ${theme === 'dark' 
//               ? 'border-gray-700 bg-gray-800' 
//               : 'border-gray-200 bg-gray-50'
//             }
//           `}>
//             <h3 className="text-xl font-semibold text-red-600">{title}</h3>
//           </div>
//           <div className="p-6">
//             <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//               {message}
//             </p>
//           </div>
//           <div className="flex justify-end gap-3 p-6 border-t">
//             <button 
//               onClick={onCancel} 
//               className={`
//                 px-4 py-2 rounded-xl transition-colors duration-300
//                 ${theme === 'dark' 
//                   ? 'bg-gray-700 text-white hover:bg-gray-600' 
//                   : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                 }
//               `}
//             >
//               Cancel
//             </button>
//             <Button
//               onClick={onConfirm}
//               label="Confirm"
//               color="red"
//               theme={theme}
//             />
//           </div>
//         </motion.div>
//       </div>
//     )}
//   </AnimatePresence>
// );

// // Enhanced InputField with better theme support and validation states
// const InputField = ({ 
//   label, 
//   value, 
//   onChange, 
//   type = "text", 
//   placeholder, 
//   required, 
//   theme, 
//   icon, 
//   error, 
//   className = "",
//   onBlur,
//   touched
// }) => {
//   const showError = touched && error;
  
//   return (
//     <div className={className}>
//       <label className={`
//         block text-sm mb-2 font-medium 
//         ${theme === 'dark' ? 'text-white' : 'text-gray-700'}
//       `}>
//         {label} {required && <span className="text-red-600">*</span>}
//       </label>
//       <div className="relative">
//         <input
//           type={type}
//           value={value}
//           onChange={onChange}
//           onBlur={onBlur}
//           placeholder={placeholder}
//           required={required}
//           className={`
//             w-full pl-10 pr-4 py-3 rounded-xl border-2 backdrop-blur-md transition-all duration-300
//             ${theme === 'dark' 
//               ? 'bg-gray-800 text-white placeholder-gray-400 border-gray-700' 
//               : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300'
//             }
//             focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
//             ${showError 
//               ? 'border-red-500 ring-red-500/20 bg-red-50/20 dark:bg-red-900/10' 
//               : ''
//             }
//           `}
//           aria-invalid={!!showError}
//           aria-describedby={showError ? `${label}-error` : undefined}
//         />
//         {icon && (
//           <div className={`
//             absolute left-3 top-1/2 transform -translate-y-1/2
//             ${showError ? 'text-red-500' : 'text-gray-500'}
//           `}>
//             {React.cloneElement(icon)}
//           </div>
//         )}
//       </div>
//       {showError && (
//         <p 
//           id={`${label}-error`}
//           className={`text-xs mt-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}
//         >
//           {error}
//         </p>
//       )}
//     </div>
//   );
// };

// // Enhanced CheckboxField
// const CheckboxField = ({ label, checked, onChange, theme }) => (
//   <div className="flex items-center space-x-3">
//     <input
//       type="checkbox"
//       checked={checked}
//       onChange={onChange}
//       className={`
//         w-5 h-5 border-2 rounded focus:ring-indigo-500 transition-all duration-300
//         ${theme === 'dark' 
//           ? 'bg-gray-800 border-gray-600 text-indigo-500 focus:ring-indigo-400' 
//           : 'border-gray-300 text-indigo-600 focus:ring-indigo-500'
//         }
//         ${checked ? 'bg-indigo-600 border-indigo-600' : ''}
//       `}
//       id={label.toLowerCase().replace(/\s+/g, '-')}
//     />
//     <label 
//       htmlFor={label.toLowerCase().replace(/\s+/g, '-')} 
//       className={`
//         text-sm font-medium cursor-pointer select-none
//         ${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-gray-700 hover:text-gray-900'}
//       `}
//     >
//       {label}
//     </label>
//   </div>
// );

// // Compact Add Router Button for header
// const CompactAddRouterButton = ({ onClick, theme, isLoading }) => (
//   <Button
//     onClick={onClick}
//     label={isLoading ? "Adding..." : "Add New Router"}
//     icon={isLoading ? <ThreeDots color="#fff" height={20} width={40} /> : <Plus />}
//     theme={theme}
//     disabled={isLoading}
//     className="min-h-[44px] w-full sm:w-auto"
//   />
// );

// // Enhanced Stats Card
// const StatsCard = ({ title, value, icon, unit = "", color = "bg-blue-500", theme }) => (
//   <motion.div 
//     whileHover={{ y: -2 }}
//     className={`
//       p-6 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300
//       ${theme === 'dark' 
//         ? 'bg-gray-800/80 hover:bg-gray-800' 
//         : 'bg-white hover:bg-white'
//       }
//     `}
//   >
//     <div className="flex items-center justify-between">
//       <div>
//         <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
//         <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
//           {value}{unit}
//         </p>
//       </div>
//       <div className={`p-3 rounded-full ${color} text-white shadow-lg`}>{icon}</div>
//     </div>
//   </motion.div>
// );

// // Mobile Action Button Component
// const MobileActionButton = ({ onClick, icon, label, theme }) => (
//   <button
//     onClick={onClick}
//     className={`
//       w-full p-3 rounded-lg flex items-center space-x-3 text-sm transition-all duration-300 hover:scale-[1.02]
//       ${theme === 'dark' 
//         ? 'bg-gray-800/60 text-white hover:bg-gray-700/60' 
//         : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
//       }
//     `}
//   >
//     {icon}
//     <span>{label}</span>
//   </button>
// );

// const initialState = {
//   routers: [],
//   activeRouter: null,
//   isLoading: false,
//   modals: {
//     addRouter: false,
//     editRouter: false,
//     hotspotConfig: false,
//     users: false,
//     sessionHistory: false,
//     healthStats: false,
//     callbackConfig: false,
//   },
//   confirmModal: {
//     show: false,
//     title: "",
//     message: "",
//     action: null,
//   },
//   routerForm: {
//     name: "",
//     ip: "",
//     type: "mikrotik",
//     port: "8728",
//     username: "admin",
//     password: "",
//     location: "",
//     is_default: false,
//     captive_portal_enabled: true,
//   },
//   // Track touched fields for form validation
//   touchedFields: {
//     name: false,
//     ip: false,
//     type: false,
//     port: false,
//   },
//   hotspotForm: {
//     ssid: "SurfZone-WiFi",
//     landingPage: null,
//     redirectUrl: "http://captive.surfzone.local",
//     bandwidthLimit: "10M",
//     sessionTimeout: "60",
//     authMethod: "universal",
//   },
//   callbackForm: {
//     event: "",
//     callback_url: "",
//     security_level: "medium",
//     security_profile: "",
//     is_active: true,
//     retry_enabled: true,
//     max_retries: 3,
//     timeout_seconds: 30,
//   },
//   hotspotUsers: [],
//   sessionHistory: [],
//   healthStats: [],
//   expandedRouter: null,
//   selectedUser: null,
//   statsData: {
//     latest: {},
//     history: {},
//   },
//   events: [],
//   securityProfiles: [],
//   callbackConfigs: [],
//   showTestModal: false,
//   testConfig: { configuration_id: "", test_payload: "{}" },
//   editingCallbackId: null,
// };

// const reducer = (state, action) => {
//   switch (action.type) {
//     case "SET_ROUTERS":
//       return { ...state, routers: action.payload };
//     case "SET_ACTIVE_ROUTER":
//       return { ...state, activeRouter: action.payload };
//     case "SET_LOADING":
//       return { ...state, isLoading: action.payload };
//     case "TOGGLE_MODAL":
//       return { 
//         ...state, 
//         modals: { ...state.modals, [action.modal]: !state.modals[action.modal] },
//         // Reset touched fields when modal closes
//         ...(action.modal === "addRouter" && !state.modals[action.modal] && {
//           touchedFields: initialState.touchedFields
//         })
//       };
//     case "SET_CONFIRM_MODAL":
//       return { 
//         ...state, 
//         confirmModal: { ...state.confirmModal, ...action.payload } 
//       };
//     case "UPDATE_ROUTER_FORM":
//       return { ...state, routerForm: { ...state.routerForm, ...action.payload } };
//     case "UPDATE_HOTSPOT_FORM":
//       return { ...state, hotspotForm: { ...state.hotspotForm, ...action.payload } };
//     case "UPDATE_CALLBACK_FORM":
//       return { ...state, callbackForm: { ...state.callbackForm, ...action.payload } };
//     case "SET_TOUCHED_FIELD":
//       return { 
//         ...state, 
//         touchedFields: { ...state.touchedFields, [action.field]: true } 
//       };
//     case "RESET_TOUCHED_FIELDS":
//       return { ...state, touchedFields: initialState.touchedFields };
//     case "SET_HOTSPOT_USERS":
//       return { ...state, hotspotUsers: action.payload };
//     case "SET_SESSION_HISTORY":
//       return { ...state, sessionHistory: action.payload };
//     case "SET_HEALTH_STATS":
//       return { ...state, healthStats: action.payload };
//     case "RESET_ROUTER_FORM":
//       return { 
//         ...state, 
//         routerForm: initialState.routerForm,
//         touchedFields: initialState.touchedFields
//       };
//     case "RESET_CALLBACK_FORM":
//       return { ...state, callbackForm: initialState.callbackForm, editingCallbackId: null };
//     case "TOGGLE_ROUTER_EXPANDED":
//       return { ...state, expandedRouter: state.expandedRouter === action.id ? null : action.id };
//     case "UPDATE_ROUTER":
//       return {
//         ...state,
//         routers: state.routers.map((r) => (r.id === action.payload.id ? { ...r, ...action.payload.data } : r)),
//         activeRouter: state.activeRouter?.id === action.payload.id ? { ...state.activeRouter, ...action.payload.data } : state.activeRouter,
//       };
//     case "DELETE_ROUTER":
//       return {
//         ...state,
//         routers: state.routers.filter((r) => r.id !== action.id),
//         activeRouter: state.activeRouter?.id === action.id ? null : state.activeRouter,
//       };
//     case "SET_STATS_DATA":
//       return { ...state, statsData: action.payload };
//     case "SET_SELECTED_USER":
//       return { ...state, selectedUser: action.payload };
//     case "SET_EVENTS":
//       return { ...state, events: action.payload };
//     case "SET_SECURITY_PROFILES":
//       return { ...state, securityProfiles: action.payload };
//     case "SET_CALLBACK_CONFIGS":
//       return { ...state, callbackConfigs: action.payload };
//     case "SET_EDITING_CALLBACK_ID":
//       return { ...state, editingCallbackId: action.payload };
//     case "SET_SHOW_TEST_MODAL":
//       return { ...state, showTestModal: action.payload };
//     case "UPDATE_TEST_CONFIG":
//       return { ...state, testConfig: { ...state.testConfig, ...action.payload } };
//     default:
//       return state;
//   }
// };

// // Helper functions
// const getRouterStatusColor = (status, theme) => {
//   const colors = theme === 'dark' ? {
//     connected: "bg-green-900 text-green-300",
//     disconnected: "bg-red-900 text-red-300",
//     updating: "bg-yellow-900 text-yellow-300",
//     error: "bg-purple-900 text-purple-300",
//   } : {
//     connected: "bg-green-100 text-green-600",
//     disconnected: "bg-red-100 text-red-600",
//     updating: "bg-yellow-100 text-yellow-600",
//     error: "bg-purple-100 text-purple-600",
//   };
//   return colors[status] || (theme === 'dark' ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-500");
// };

// const getRouterStatusIcon = (status) => {
//   switch (status) {
//     case "connected":
//       return <Wifi className="w-4 h-4" />;
//     case "disconnected":
//       return <Wifi className="w-4 h-4 opacity-50" />;
//     case "updating":
//       return <RefreshCw className="w-4 h-4 animate-spin" />;
//     case "error":
//       return <AlertCircle className="w-4 h-4" />;
//     default:
//       return <Wifi className="w-4 h-4" />;
//   }
// };

// const formatBytes = (bytes, decimals = 2) => {
//   if (bytes === 0) return "0 Bytes";
//   const k = 1024;
//   const dm = decimals < 0 ? 0 : decimals;
//   const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
// };

// const formatTime = (seconds) => {
//   if (seconds <= 0) return "Expired";
//   const hours = Math.floor(seconds / 3600);
//   const minutes = Math.floor((seconds % 3600) / 60);
//   const secs = seconds % 60;
//   if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
//   if (minutes > 0) return `${minutes}m ${secs}s`;
//   return `${secs}s`;
// };

// const timeSince = (dateString) => {
//   const date = new Date(dateString);
//   const seconds = Math.floor((new Date() - date) / 1000);
//   let interval = Math.floor(seconds / 31536000);
//   if (interval >= 1) return interval + " year" + (interval === 1 ? "" : "s") + " ago";
//   interval = Math.floor(seconds / 2592000);
//   if (interval >= 1) return interval + " month" + (interval === 1 ? "" : "s") + " ago";
//   interval = Math.floor(seconds / 86400);
//   if (interval >= 1) return interval + " day" + (interval === 1 ? "" : "s") + " ago";
//   interval = Math.floor(seconds / 3600);
//   if (interval >= 1) return interval + " hour" + (interval === 1 ? "" : "s") + " ago";
//   interval = Math.floor(seconds / 60);
//   if (interval >= 1) return interval + " minute" + (interval === 1 ? "" : "s") + " ago";
//   return Math.floor(seconds) + " second" + (seconds === 1 ? "" : "s") + " ago";
// };

// const getSecurityLevelBadge = (level, theme) => {
//   const colors = theme === 'dark' ? {
//     low: "bg-gray-800 text-gray-300",
//     medium: "bg-blue-800 text-blue-300",
//     high: "bg-yellow-800 text-yellow-300",
//     critical: "bg-red-800 text-red-300",
//   } : {
//     low: "bg-gray-100 text-gray-800",
//     medium: "bg-blue-100 text-blue-800",
//     high: "bg-yellow-100 text-yellow-800",
//     critical: "bg-red-100 text-red-800",
//   };
//   return (
//     <span className={`px-2 py-1 rounded-full text-xs ${colors[level] || colors.medium}`}>
//       {level.charAt(0).toUpperCase() + level.slice(1)}
//     </span>
//   );
// };

// const HealthIndicator = ({ status, responseTime, theme }) => (
//   <div className="flex items-center space-x-2">
//     <div className={`w-3 h-3 rounded-full ${status === "online" ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
//     <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{status}</span>
//     {responseTime && <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>({responseTime}s)</span>}
//   </div>
// );

// const RouterManagement = () => {
//   const [state, dispatch] = useReducer(reducer, initialState);
//   const {
//     routers,
//     activeRouter,
//     isLoading,
//     modals,
//     confirmModal,
//     routerForm,
//     touchedFields,
//     hotspotForm,
//     callbackForm,
//     hotspotUsers,
//     sessionHistory,
//     healthStats,
//     expandedRouter,
//     selectedUser,
//     statsData,
//     events,
//     securityProfiles,
//     callbackConfigs,
//     showTestModal,
//     testConfig,
//     editingCallbackId,
//   } = state;
//   const [statsLoading, setStatsLoading] = useState(false);
//   const { theme } = useTheme();
//   const [mobileDropdowns, setMobileDropdowns] = useState({});
//   const activeRouterRef = useRef(activeRouter);

//   useEffect(() => {
//     activeRouterRef.current = activeRouter;
//   }, [activeRouter]);

//   const routerTypes = useMemo(() => [
//     { value: "mikrotik", label: "MikroTik" },
//     { value: "ubiquiti", label: "Ubiquiti" },
//     { value: "cisco", label: "Cisco" },
//     { value: "other", label: "Other" },
//   ], []);

//   // Enhanced validation that only shows errors for touched fields
//   const getFormErrors = useMemo(() => {
//     const errors = {};
//     if (touchedFields.name && !routerForm.name.trim()) errors.name = "Name is required";
//     if (touchedFields.ip && !routerForm.ip.trim()) errors.ip = "IP is required";
//     if (touchedFields.type && !routerForm.type) errors.type = "Type is required";
//     if (touchedFields.port && !routerForm.port) errors.port = "Port is required";
//     return errors;
//   }, [routerForm, touchedFields]);

//   const isFormValid = useMemo(() => 
//     routerForm.name.trim() && 
//     routerForm.ip.trim() && 
//     routerForm.type && 
//     routerForm.port, 
//     [routerForm]
//   );

//   const toggleMobileDropdown = (dropdown) => {
//     setMobileDropdowns(prev => ({
//       ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
//       [dropdown]: !prev[dropdown]
//     }));
//   };

//   // Handler for field blur events
//   const handleFieldBlur = (field) => {
//     if (!touchedFields[field]) {
//       dispatch({ type: "SET_TOUCHED_FIELD", field });
//     }
//   };

//   const showConfirm = (title, message, action) => {
//     dispatch({ 
//       type: "SET_CONFIRM_MODAL", 
//       payload: { show: true, title, message, action } 
//     });
//   };

//   const hideConfirm = () => {
//     dispatch({ type: "SET_CONFIRM_MODAL", payload: { show: false } });
//   };

//   const handleConfirm = () => {
//     if (confirmModal.action) {
//       confirmModal.action();
//     }
//     hideConfirm();
//   };

//   const fetchRouters = useCallback(async () => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.get("/api/network_management/routers/");
//       dispatch({ type: "SET_ROUTERS", payload: response.data });
//       if (!activeRouter && response.data.length > 0) {
//         dispatch({ type: "SET_ACTIVE_ROUTER", payload: response.data[0] });
//       }
//     } catch (error) {
//       toast.error("Failed to fetch routers");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [activeRouter]);

//   const fetchHotspotUsers = useCallback(async (routerId) => {
//     if (!routerId) return;
//     try {
//       const response = await api.get(`/api/network_management/routers/${routerId}/hotspot-users/`);
//       dispatch({ type: "SET_HOTSPOT_USERS", payload: response.data });
//     } catch (error) {
//       toast.error("Failed to fetch hotspot users");
//     }
//   }, []);

//   const fetchSessionHistory = useCallback(async (userId) => {
//     if (!userId) return;
//     try {
//       const response = await api.get(`/api/network_management/hotspot-users/${userId}/session-history/`);
//       dispatch({ type: "SET_SESSION_HISTORY", payload: response.data });
//     } catch (error) {
//       toast.error("Failed to fetch session history");
//     }
//   }, []);

//   const fetchHealthStats = useCallback(async () => {
//     try {
//       const response = await api.get("/api/network_management/health-check/");
//       dispatch({ type: "SET_HEALTH_STATS", payload: response.data });
//     } catch (error) {
//       toast.error("Failed to fetch health stats");
//     }
//   }, []);

//   const fetchRouterStats = useCallback(async (routerId) => {
//     if (!routerId) return;
//     setStatsLoading(true);
//     try {
//       const response = await api.get(`/api/network_management/routers/${routerId}/stats/`);
//       dispatch({ type: "SET_STATS_DATA", payload: response.data });
//     } catch (error) {
//       toast.error("Failed to fetch router stats");
//     } finally {
//       setStatsLoading(false);
//     }
//   }, []);

//   const fetchEvents = useCallback(async () => {
//     try {
//       const response = await api.get("/api/payments/mpesa-callbacks/events/");
//       dispatch({ type: "SET_EVENTS", payload: response.data });
//     } catch (error) {
//       toast.error("Failed to fetch events");
//     }
//   }, []);

//   const fetchSecurityProfiles = useCallback(async () => {
//     try {
//       const response = await api.get("/api/payments/mpesa-callbacks/security-profiles/");
//       dispatch({ type: "SET_SECURITY_PROFILES", payload: response.data });
//     } catch (error) {
//       toast.error("Failed to fetch security profiles");
//     }
//   }, []);

//   const fetchCallbackConfigs = useCallback(async (routerId) => {
//     try {
//       const response = await api.get(`/api/network_management/routers/${routerId}/callback-configs/`);
//       dispatch({ type: "SET_CALLBACK_CONFIGS", payload: response.data });
//     } catch (error) {
//       toast.error("Failed to fetch callback configs");
//     }
//   }, []);

//   useEffect(() => {
//     fetchRouters();
//     fetchHealthStats();
//     fetchEvents();
//     fetchSecurityProfiles();
//     const interval = setInterval(() => {
//       fetchRouters();
//       fetchHealthStats();
//     }, 30000);
//     return () => clearInterval(interval);
//   }, [fetchRouters, fetchHealthStats, fetchEvents, fetchSecurityProfiles]);

//   useEffect(() => {
//     if (activeRouter) {
//       fetchHotspotUsers(activeRouter.id);
//       fetchRouterStats(activeRouter.id);
//       fetchCallbackConfigs(activeRouter.id);
//       const interval = setInterval(() => {
//         const currentId = activeRouterRef.current?.id;
//         if (currentId) {
//           fetchHotspotUsers(currentId);
//           fetchRouterStats(currentId);
//           fetchCallbackConfigs(currentId);
//         }
//       }, 10000);
//       return () => clearInterval(interval);
//     }
//   }, [activeRouter, fetchHotspotUsers, fetchRouterStats, fetchCallbackConfigs]);

//   const addRouter = async () => {
//     // Mark all required fields as touched to show errors
//     Object.keys(touchedFields).forEach(field => {
//       if (!touchedFields[field]) {
//         dispatch({ type: "SET_TOUCHED_FIELD", field });
//       }
//     });

//     if (!isFormValid) {
//       toast.warn("Please fix the errors below");
//       return;
//     }

//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.post("/api/network_management/routers/", routerForm);
//       dispatch({ type: "SET_ROUTERS", payload: [...routers, response.data] });
//       dispatch({ type: "SET_ACTIVE_ROUTER", payload: response.data });
//       dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" });
//       dispatch({ type: "RESET_ROUTER_FORM" });
//       toast.success("Router added successfully");
//     } catch (error) {
//       toast.error("Failed to add router");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const updateRouter = async (id) => {
//     if (!isFormValid) {
//       toast.warn("Please fix the errors below");
//       return;
//     }
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.put(`/api/network_management/routers/${id}/`, routerForm);
//       dispatch({ type: "UPDATE_ROUTER", payload: { id, data: response.data } });
//       dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" });
//       toast.success("Router updated successfully");
//     } catch (error) {
//       toast.error("Failed to update router");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const deleteRouter = async (id) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.delete(`/api/network_management/routers/${id}/`);
//       dispatch({ type: "DELETE_ROUTER", id });
//       toast.success("Router deleted successfully");
//     } catch (error) {
//       toast.error("Failed to delete router");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const connectToRouter = async (routerId) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.post("/api/network_management/routers/bulk-action/", { router_ids: [routerId], action: "connect" });
//       const updatedRouter = { ...routers.find((r) => r.id === routerId), status: "connected" };
//       dispatch({ type: "UPDATE_ROUTER", payload: { id: routerId, data: updatedRouter } });
//       if (activeRouter?.id === routerId) dispatch({ type: "SET_ACTIVE_ROUTER", payload: updatedRouter });
//       toast.success("Router connected");
//     } catch (error) {
//       toast.error("Failed to connect");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const disconnectRouter = async (routerId) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.post("/api/network_management/routers/bulk-action/", { router_ids: [routerId], action: "disconnect" });
//       const updatedRouter = { ...routers.find((r) => r.id === routerId), status: "disconnected" };
//       dispatch({ type: "UPDATE_ROUTER", payload: { id: routerId, data: updatedRouter } });
//       if (activeRouter?.id === routerId) dispatch({ type: "SET_ACTIVE_ROUTER", payload: updatedRouter });
//       toast.success("Router disconnected");
//     } catch (error) {
//       toast.error("Failed to disconnect");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const rebootRouter = async (routerId) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.post(`/api/network_management/routers/${routerId}/reboot/`);
//       const updatedRouter = { ...routers.find((r) => r.id === routerId), status: "updating" };
//       dispatch({ type: "UPDATE_ROUTER", payload: { id: routerId, data: updatedRouter } });
//       if (activeRouter?.id === routerId) dispatch({ type: "SET_ACTIVE_ROUTER", payload: updatedRouter });
//       toast.success("Router reboot initiated");
//     } catch (error) {
//       toast.error("Failed to reboot router");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const restoreSessions = async (routerId) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.post(`/api/network_management/routers/${routerId}/restore-sessions/`);
//       toast.success(response.data.message);
//       fetchHotspotUsers(routerId);
//     } catch (error) {
//       toast.error("Failed to restore sessions");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const configureHotspot = async () => {
//     if (!hotspotForm.landingPage) {
//       toast.warn("Please upload the landing page");
//       return;
//     }
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const formData = new FormData();
//       Object.entries(hotspotForm).forEach(([key, value]) => {
//         if (key === "landingPage" && value) formData.append("landingPage", value);
//         else if (value) formData.append(key, value);
//       });
//       await api.post(`/api/network_management/routers/${activeRouter.id}/hotspot-config/`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       dispatch({ type: "TOGGLE_MODAL", modal: "hotspotConfig" });
//       toast.success("Hotspot configured successfully");
//     } catch (error) {
//       toast.error("Failed to configure hotspot");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const disconnectHotspotUser = async (userId) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.delete(`/api/network_management/hotspot-users/${userId}/`);
//       dispatch({ type: "SET_HOTSPOT_USERS", payload: hotspotUsers.filter((u) => u.id !== userId) });
//       toast.success("User disconnected");
//     } catch (error) {
//       toast.error("Failed to disconnect user");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const activateUserOnRouter = async (routerId, mac, planId, clientId) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.post(`/api/network_management/routers/${routerId}/activate-user/`, {
//         mac,
//         plan_id: planId,
//         client_id: clientId,
//       });
//       toast.success("User activated on router");
//       fetchHotspotUsers(routerId);
//     } catch (error) {
//       toast.error("Failed to activate user");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const viewUserSessionHistory = async (user) => {
//     dispatch({ type: "SET_SELECTED_USER", payload: user });
//     await fetchSessionHistory(user.id);
//     dispatch({ type: "TOGGLE_MODAL", modal: "sessionHistory" });
//   };

//   const addCallbackConfig = async () => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.post(`/api/network_management/routers/${activeRouter.id}/callback-configs/`, callbackForm);
//       dispatch({ type: "SET_CALLBACK_CONFIGS", payload: [...callbackConfigs, response.data] });
//       dispatch({ type: "TOGGLE_MODAL", modal: "callbackConfig" });
//       dispatch({ type: "RESET_CALLBACK_FORM" });
//       toast.success("Callback config added");
//     } catch (error) {
//       toast.error("Failed to add callback config");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const updateCallbackConfig = async () => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.put(`/api/network_management/routers/${activeRouter.id}/callback-configs/${editingCallbackId}/`, callbackForm);
//       dispatch({ type: "SET_CALLBACK_CONFIGS", payload: callbackConfigs.map((cb) => (cb.id === editingCallbackId ? response.data : cb)) });
//       dispatch({ type: "TOGGLE_MODAL", modal: "callbackConfig" });
//       dispatch({ type: "RESET_CALLBACK_FORM" });
//       toast.success("Callback config updated");
//     } catch (error) {
//       toast.error("Failed to update callback config");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const deleteCallbackConfig = async (id) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.delete(`/api/network_management/routers/${activeRouter.id}/callback-configs/${id}/`);
//       dispatch({ type: "SET_CALLBACK_CONFIGS", payload: callbackConfigs.filter((cb) => cb.id !== id) });
//       toast.success("Callback config deleted");
//     } catch (error) {
//       toast.error("Failed to delete callback config");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const toggleCallbackStatus = async (callback) => {
//     try {
//       const updatedCallback = { ...callback, is_active: !callback.is_active };
//       const response = await api.put(`/api/network_management/routers/${activeRouter.id}/callback-configs/${callback.id}/`, updatedCallback);
//       dispatch({ type: "SET_CALLBACK_CONFIGS", payload: callbackConfigs.map((cb) => (cb.id === callback.id ? response.data : cb)) });
//       toast.success(`Callback ${updatedCallback.is_active ? "enabled" : "disabled"} successfully!`);
//     } catch (error) {
//       console.error("Error toggling callback status:", error);
//       toast.error("Failed to update callback status");
//     }
//   };

//   const editCallbackConfig = (callback) => {
//     dispatch({ type: "UPDATE_CALLBACK_FORM", payload: callback });
//     dispatch({ type: "SET_EDITING_CALLBACK_ID", payload: callback.id });
//     dispatch({ type: "TOGGLE_MODAL", modal: "callbackConfig" });
//   };

//   const testCallback = (callback) => {
//     dispatch({ type: "UPDATE_TEST_CONFIG", payload: { configuration_id: callback.id, test_payload: "{}" } });
//     dispatch({ type: "SET_SHOW_TEST_MODAL", payload: true });
//   };

//   const runTest = async () => {
//     try {
//       dispatch({ type: "SET_LOADING", payload: true });
//       const payload = {
//         configuration_id: testConfig.configuration_id,
//         test_payload: JSON.parse(testConfig.test_payload),
//         validate_security: true,
//       };
//       const response = await api.post("/api/payments/mpesa-callbacks/test/", payload);
//       if (response.data.success) {
//         toast.success("Test completed successfully!");
//       } else {
//         toast.error(`Test failed: ${response.data.message}`);
//       }
//       dispatch({ type: "SET_SHOW_TEST_MODAL", payload: false });
//     } catch (error) {
//       console.error("Error testing callback:", error);
//       toast.error("Failed to run test");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   return (
//     <div className={`
//       min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-300
//       ${theme === 'dark' 
//         ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900' 
//         : 'bg-gradient-to-br from-white to-indigo-50'
//       }
//     `}>
//       <ToastContainer 
//         position="top-right" 
//         autoClose={3000} 
//         theme={theme} 
//         pauseOnHover 
//         newestOnTop 
//       />

//       {/* COMPACT HEADER - Buttons horizontal on sm+ */}
//       <header className={`
//         max-w-6xl mx-auto mb-8 p-4 rounded-2xl shadow-xl backdrop-blur-md
//         ${theme === 'dark' 
//           ? 'bg-gray-800/80 border border-gray-700/50' 
//           : 'bg-white/90 border border-gray-200/50'
//         }
//       `}>
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//           <div className="flex items-center space-x-4 flex-1 min-w-0">
//             <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg flex-shrink-0">
//               <Server className="w-6 h-6" />
//             </div>
//             <div className="min-w-0 flex-1">
//               <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 truncate">
//                 Router Management
//               </h1>
//               <p className={`mt-1 text-sm sm:text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} truncate`}>
//                 {routers.length} routers • {routers.filter((r) => r.status === "connected").length} online
//               </p>
//             </div>
//           </div>
          
//           {/* Buttons horizontal on sm+ */}
//           <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
//             <CompactAddRouterButton
//               onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" })}
//               theme={theme}
//               isLoading={isLoading}
//             />
//             <Button
//               onClick={fetchHealthStats}
//               label="Health Check"
//               icon={<Activity />}
//               theme={theme}
//               color="green"
//               className="min-h-[44px] w-full sm:w-auto"
//             />
//           </div>
//         </div>
//       </header>

//       <div className="max-w-6xl mx-auto">
//         {/* Stats Section */}
//         <section className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           <StatsCard
//             title="Total Routers"
//             value={routers.length}
//             icon={<Server className="w-5 h-5" />}
//             color="bg-indigo-500"
//             theme={theme}
//           />
//           <StatsCard
//             title="Online Routers"
//             value={routers.filter((r) => r.status === "connected").length}
//             icon={<Wifi className="w-5 h-5" />}
//             color="bg-green-500"
//             theme={theme}
//           />
//           <StatsCard
//             title="Active Users"
//             value={hotspotUsers.filter((u) => u.active).length}
//             icon={<Users className="w-5 h-5" />}
//             color="bg-blue-500"
//             theme={theme}
//           />
//           <StatsCard
//             title="Data Used"
//             value={formatBytes(hotspotUsers.reduce((sum, user) => sum + user.data_used, 0)).split(" ")[0]}
//             unit={` ${formatBytes(hotspotUsers.reduce((sum, user) => sum + user.data_used, 0)).split(" ")[1]}`}
//             icon={<Download className="w-5 h-5" />}
//             color="bg-purple-500"
//             theme={theme}
//           />
//         </section>

//         {/* Routers List Section */}
//         <section className={`mb-8 p-6 rounded-2xl shadow-xl backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 ${
//           theme === 'dark' ? 'bg-gray-800/70' : 'bg-white/90'
//         }`}>
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
//             <h2 className="text-xl font-semibold flex items-center text-indigo-600">
//               <Wifi className="w-6 h-6 mr-3" /> Routers
//             </h2>
//             <Button
//               onClick={fetchRouters}
//               icon={<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />}
//               theme={theme}
//               compact
//             />
//           </div>
//           {isLoading ? (
//             <div className="flex justify-center py-8">
//               <ThreeDots color="#6366F1" height={50} width={50} />
//             </div>
//           ) : routers.length === 0 ? (
//             <div className="text-center py-12">
//               <Server className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//               <p className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
//                 No Routers Found
//               </p>
//               <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
//                 Get started by adding your first router to manage your network.
//               </p>
//               <div className="flex justify-center">
//                 <Button
//                   onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" })}
//                   label="Add Your First Router"
//                   icon={<Plus />}
//                   theme={theme}
//                   fullWidth
//                   className="max-w-xs"
//                 />
//               </div>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//               {routers.map((router) => (
//                 <motion.div
//                   key={router.id}
//                   onClick={() => dispatch({ type: "SET_ACTIVE_ROUTER", payload: router })}
//                   whileHover={{ scale: 1.03 }}
//                   className={`p-6 rounded-xl cursor-pointer border-2 transition-all duration-300 backdrop-blur-md shadow-md hover:shadow-xl ${
//                     activeRouter?.id === router.id 
//                       ? "border-indigo-500 ring-2 ring-indigo-500/20"
//                       : theme === 'dark' 
//                         ? "border-gray-700 hover:border-gray-600" 
//                         : "border-gray-200 hover:border-gray-300"
//                   } ${theme === 'dark' ? 'bg-gray-800/50 hover:bg-gray-800/70' : 'bg-white/70 hover:bg-white/90'}`}
//                 >
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center space-x-3">
//                       {getRouterStatusIcon(router.status)}
//                       <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRouterStatusColor(router.status, theme)}`}>
//                         {router.status.charAt(0).toUpperCase() + router.status.slice(1)}
//                       </span>
//                       {router.is_default && (
//                         <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-600 font-medium">Default</span>
//                       )}
//                     </div>
//                     {router.captive_portal_enabled && <Globe className="w-5 h-5 text-green-500" />}
//                   </div>
//                   <div className="mb-4">
//                     <p className={`font-semibold text-lg truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                       {router.name}
//                     </p>
//                     <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
//                       {router.type} • {router.ip}:{router.port}
//                     </p>
//                     {router.location && (
//                       <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
//                         <MapPin className="w-4 h-4 mr-2" />
//                         {router.location}
//                       </p>
//                     )}
//                   </div>

//                   <div className="lg:hidden">
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         toggleMobileDropdown(`router-${router.id}`);
//                       }}
//                       className={`w-full p-3 rounded-lg flex justify-between items-center transition-colors ${
//                         theme === 'dark' ? 'bg-gray-700/60 hover:bg-gray-700/80' : 'bg-gray-100 hover:bg-gray-200'
//                       }`}
//                       aria-label="Router actions"
//                     >
//                       <span className={theme === 'dark' ? 'text-white' : 'text-gray-700'}>Actions</span>
//                       <ChevronDown className={`w-4 h-4 transition-transform ${
//                         mobileDropdowns[`router-${router.id}`] ? 'rotate-180' : ''
//                       } ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
//                     </button>
                    
//                     <AnimatePresence>
//                       {mobileDropdowns[`router-${router.id}`] && (
//                         <motion.div 
//                           initial={{ opacity: 0, height: 0 }}
//                           animate={{ opacity: 1, height: "auto" }}
//                           exit={{ opacity: 0, height: 0 }}
//                           className={`mt-3 space-y-2 p-3 rounded-lg ${
//                             theme === 'dark' ? 'bg-gray-700/70' : 'bg-gray-100'
//                           }`}
//                         >
//                           <MobileActionButton
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" });
//                               dispatch({ type: "UPDATE_ROUTER_FORM", payload: router });
//                             }}
//                             icon={<Edit className="w-4 h-4" />}
//                             label="Edit"
//                             theme={theme}
//                           />
//                           <MobileActionButton
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               showConfirm("Delete Router", `Are you sure you want to delete "${router.name}"? This action cannot be undone.`, () => deleteRouter(router.id));
//                             }}
//                             icon={<Trash2 className="w-4 h-4" />}
//                             label="Delete"
//                             theme={theme}
//                           />
//                           <MobileActionButton
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               router.status === "connected" ? disconnectRouter(router.id) : connectToRouter(router.id);
//                             }}
//                             icon={router.status === "connected" ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
//                             label={router.status === "connected" ? "Disconnect" : "Connect"}
//                             theme={theme}
//                           />
//                         </motion.div>
//                       )}
//                     </AnimatePresence>
//                   </div>

//                   <div className="hidden lg:block">
//                     <AnimatePresence>
//                       {expandedRouter === router.id && (
//                         <motion.div 
//                           initial={{ opacity: 0, height: 0 }} 
//                           animate={{ opacity: 1, height: "auto" }} 
//                           exit={{ opacity: 0, height: 0 }}
//                           className="mt-4 space-y-2"
//                         >
//                           <div className="flex gap-2 flex-wrap">
//                             <Button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" });
//                                 dispatch({ type: "UPDATE_ROUTER_FORM", payload: router });
//                               }}
//                               label="Edit"
//                               icon={<Edit className="w-3 h-3" />}
//                               theme={theme}
//                               compact
//                             />
//                             <Button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 showConfirm("Delete Router", `Are you sure you want to delete "${router.name}"? This action cannot be undone.`, () => deleteRouter(router.id));
//                               }}
//                               label="Delete"
//                               icon={<Trash2 className="w-3 h-3" />}
//                               theme={theme}
//                               compact
//                               color="red"
//                             />
//                             <Button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 router.status === "connected" ? disconnectRouter(router.id) : connectToRouter(router.id);
//                               }}
//                               label={router.status === "connected" ? "Disconnect" : "Connect"}
//                               icon={router.status === "connected" ? <LogOut className="w-3 h-3" /> : <LogIn className="w-3 h-3" />}
//                               theme={theme}
//                               compact
//                               color={router.status === "connected" ? "red" : "green"}
//                             />
//                             <Button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 showConfirm("Reboot Router", `Rebooting "${router.name}" will temporarily disconnect all users. Proceed?`, () => rebootRouter(router.id));
//                               }}
//                               label="Reboot"
//                               icon={<RotateCcw className="w-3 h-3" />}
//                               theme={theme}
//                               compact
//                               color="yellow"
//                             />
//                           </div>
//                         </motion.div>
//                       )}
//                     </AnimatePresence>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         dispatch({ type: "TOGGLE_ROUTER_EXPANDED", id: router.id });
//                       }}
//                       className={`w-full mt-3 text-sm flex justify-center items-center gap-1 ${
//                         theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                       } hover:scale-105 transition-all`}
//                       aria-label={expandedRouter === router.id ? "Hide actions" : "Show actions"}
//                     >
//                       {expandedRouter === router.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//                       <span className="text-xs">{expandedRouter === router.id ? "Hide" : "Actions"}</span>
//                     </button>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//           )}
//         </section>

//         {activeRouter && (
//           <>
//             {/* Active Router Details Section */}
//             <section className={`mb-8 p-6 rounded-2xl shadow-xl backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 ${
//               theme === 'dark' ? 'bg-gray-800/70' : 'bg-white/90'
//             }`}>
//               <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-6">
//                 <div className="flex-1">
//                   <h2 className="text-xl font-semibold flex items-center mb-3 text-indigo-600">
//                     <Server className="w-6 h-6 mr-3" />
//                     {activeRouter.name} ({activeRouter.type})
//                   </h2>
//                   <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
//                     {activeRouter.ip}:{activeRouter.port} • {activeRouter.location || "No location set"}
//                   </p>
//                 </div>
//                 <div className="flex flex-wrap gap-3 min-w-0">
//                   <Button
//                     onClick={() => (activeRouter.status === "connected" ? disconnectRouter(activeRouter.id) : connectToRouter(activeRouter.id))}
//                     label={activeRouter.status === "connected" ? "Disconnect" : "Connect"}
//                     icon={activeRouter.status === "connected" ? <LogOut /> : <LogIn />}
//                     theme={theme}
//                     color={activeRouter.status === "connected" ? "red" : "green"}
//                   />
//                   <Button
//                     onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "hotspotConfig" })}
//                     label="Configure Hotspot"
//                     icon={<Globe />}
//                     theme={theme}
//                     disabled={activeRouter.status !== "connected"}
//                   />
//                   <Button
//                     onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "users" })}
//                     label="Hotspot Users"
//                     icon={<Users />}
//                     theme={theme}
//                     disabled={activeRouter.status !== "connected"}
//                     color="teal"
//                   />
//                   <Button
//                     onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "callbackConfig" })}
//                     label="Callback Settings"
//                     icon={<Lock />}
//                     theme={theme}
//                     disabled={activeRouter.status !== "connected"}
//                     color="purple"
//                   />
//                   {activeRouter.status === "connected" && (
//                     <Button
//                       onClick={() => restoreSessions(activeRouter.id)}
//                       label="Restore Sessions"
//                       icon={<RotateCcw />}
//                       theme={theme}
//                       color="blue"
//                     />
//                   )}
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
//                 {statsLoading ? (
//                   <div className="col-span-full flex justify-center py-8">
//                     <ThreeDots color="#6366F1" height={40} width={40} />
//                   </div>
//                 ) : statsData.latest && Object.keys(statsData.latest).length > 0 ? (
//                   <>
//                     <StatsCard title="CPU Usage" value={statsData.latest.cpu} unit="%" icon={<Activity className="w-6 h-6" />} color="bg-red-500" theme={theme} />
//                     <StatsCard title="Memory Usage" value={statsData.latest.memory.toFixed(1)} unit="MB" icon={<Server className="w-6 h-6" />} color="bg-blue-500" theme={theme} />
//                     <StatsCard title="Connected Clients" value={statsData.latest.clients} icon={<Users className="w-6 h-6" />} color="bg-green-500" theme={theme} />
//                     <StatsCard
//                       title="Data Throughput"
//                       value={statsData.latest.throughput.toFixed(1)}
//                       unit="MB/s"
//                       icon={<Download className="w-6 h-6" />}
//                       color="bg-purple-500"
//                       theme={theme}
//                     />
//                   </>
//                 ) : (
//                   <div className={`col-span-full text-center py-8 rounded-xl p-8 ${
//                     theme === 'dark' ? 'bg-gray-800/40 text-gray-400' : 'bg-gray-50/80 text-gray-500'
//                   }`}>
//                     No stats available. Connect the router to fetch data.
//                   </div>
//                 )}
//               </div>

//               <div className={`p-6 rounded-xl backdrop-blur-md border border-gray-200/30 dark:border-gray-700/30 ${
//                 theme === 'dark' ? 'bg-gray-800/40' : 'bg-gray-50/80'
//               }`}>
//                 <h3 className="text-lg font-semibold mb-4 flex items-center text-indigo-600">
//                   <Globe className="w-5 h-5 mr-3" /> Hotspot Status
//                 </h3>
//                 {activeRouter.status === "connected" ? (
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
//                     <div className="text-center md:text-left">
//                       <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Active Users</p>
//                       <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                         {hotspotUsers.filter((u) => u.active).length}
//                       </p>
//                     </div>
//                     <div className="text-center md:text-left">
//                       <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Total Users</p>
//                       <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                         {hotspotUsers.length}
//                       </p>
//                     </div>
//                     <div className="text-center md:text-left">
//                       <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Data Used</p>
//                       <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                         {formatBytes(hotspotUsers.reduce((sum, user) => sum + user.data_used, 0))}
//                       </p>
//                     </div>
//                     <div className="text-center md:text-left">
//                       <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Last Updated</p>
//                       <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                         {timeSince(activeRouter.last_seen)}
//                       </p>
//                     </div>
//                   </div>
//                 ) : (
//                   <p className={`text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
//                     Router must be connected to manage Hotspot
//                   </p>
//                 )}
//               </div>
//             </section>

//             {/* Health Status Section */}
//             <section className={`mb-8 p-6 rounded-2xl shadow-xl backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 ${
//               theme === 'dark' ? 'bg-gray-800/70' : 'bg-white/90'
//             }`}>
//               <h3 className="text-lg font-semibold mb-6 flex items-center text-indigo-600">
//                 <Activity className="w-5 h-5 mr-3" /> Router Health Status
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {healthStats
//                   .filter((stat) => stat.router === activeRouter.id)
//                   .map((stat, index) => (
//                     <motion.div 
//                       key={index} 
//                       whileHover={{ scale: 1.02 }}
//                       className={`p-4 rounded-xl backdrop-blur-md transition-all ${
//                         theme === 'dark' ? 'bg-gray-800/40 hover:bg-gray-800/60' : 'bg-gray-50/80 hover:bg-gray-100'
//                       }`}
//                     >
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Last Check</p>
//                           <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
//                             {timeSince(stat.timestamp)}
//                           </p>
//                         </div>
//                         <HealthIndicator status={stat.status} responseTime={stat.response_time} theme={theme} />
//                       </div>
//                       {stat.error && <p className="text-sm text-red-500 mt-2">{stat.error}</p>}
//                     </motion.div>
//                   )) || <div className={`col-span-full text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No health data</div>}
//               </div>
//             </section>

//             {/* Callback Configurations Section */}
//             <section className={`mb-8 p-6 rounded-2xl shadow-xl backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 ${
//               theme === 'dark' ? 'bg-gray-800/70' : 'bg-white/90'
//             }`}>
//               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
//                 <h2 className="text-xl font-semibold flex items-center text-indigo-600">
//                   <Lock className="w-5 h-5 mr-3" /> M-Pesa Callback Configurations
//                 </h2>
//                 <Button
//                   onClick={() => {
//                     dispatch({ type: "RESET_CALLBACK_FORM" });
//                     dispatch({ type: "TOGGLE_MODAL", modal: "callbackConfig" });
//                   }}
//                   label="Add Callback"
//                   icon={<Plus />}
//                   theme={theme}
//                 />
//               </div>
//               {callbackConfigs.length === 0 ? (
//                 <div className="text-center py-8">
//                   <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                   <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
//                     No callback configurations found
//                   </p>
//                   <Button
//                     onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "callbackConfig" })}
//                     label="Create First Config"
//                     icon={<Plus />}
//                     theme={theme}
//                     className="mt-4"
//                   />
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto rounded-xl border border-gray-200/30 dark:border-gray-700/30">
//                   <table className={`w-full table-auto ${
//                     theme === 'dark' ? 'text-white' : 'text-gray-900'
//                   }`}>
//                     <thead>
//                       <tr className={`${theme === 'dark' ? 'bg-gray-800/80' : 'bg-gray-100'} sticky top-0 z-10`}>
//                         <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Event</th>
//                         <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">URL</th>
//                         <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Security</th>
//                         <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Status</th>
//                         <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody className={`divide-y ${
//                       theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
//                     }`}>
//                       {callbackConfigs.map((callback) => (
//                         <motion.tr 
//                           key={callback.id} 
//                           whileHover={{ backgroundColor: theme === 'dark' ? 'rgb(55 65 81 / 0.4)' : 'rgb(248 250 252 / 0.8)' }}
//                           className="transition-colors"
//                         >
//                           <td className="px-6 py-4">{callback.event_details?.name || callback.event}</td>
//                           <td className="px-6 py-4">
//                             <a href={callback.callback_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 break-all underline">
//                               {callback.callback_url}
//                             </a>
//                           </td>
//                           <td className="px-6 py-4">{getSecurityLevelBadge(callback.security_level, theme)}</td>
//                           <td className="px-6 py-4">
//                             <button
//                               onClick={() => toggleCallbackStatus(callback)}
//                               className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
//                                 callback.is_active 
//                                   ? theme === 'dark' 
//                                     ? "bg-green-900 text-green-300 hover:bg-green-800" 
//                                     : "bg-green-100 text-green-800 hover:bg-green-200"
//                                   : theme === 'dark'
//                                     ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
//                                     : "bg-gray-100 text-gray-800 hover:bg-gray-200"
//                               }`}
//                             >
//                               {callback.is_active ? "Active" : "Inactive"}
//                             </button>
//                           </td>
//                           <td className="px-6 py-4">
//                             <div className="flex space-x-3">
//                               <button
//                                 onClick={() => testCallback(callback)}
//                                 className={`p-2 rounded-lg transition-colors ${
//                                   theme === 'dark' 
//                                     ? "text-blue-400 hover:text-blue-300 hover:bg-blue-900/30" 
//                                     : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
//                                 }`}
//                                 title="Test Callback"
//                                 aria-label="Test callback"
//                               >
//                                 <Activity className="w-4 h-4" />
//                               </button>
//                               <button
//                                 onClick={() => editCallbackConfig(callback)}
//                                 className={`p-2 rounded-lg transition-colors ${
//                                   theme === 'dark' 
//                                     ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700/30" 
//                                     : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
//                                 }`}
//                                 title="Edit"
//                                 aria-label="Edit config"
//                               >
//                                 <Edit className="w-4 h-4" />
//                               </button>
//                               <button
//                                 onClick={() => showConfirm("Delete Callback", "Are you sure you want to delete this callback configuration? This action cannot be undone.", () => deleteCallbackConfig(callback.id))}
//                                 className={`p-2 rounded-lg transition-colors ${
//                                   theme === 'dark' 
//                                     ? "text-red-400 hover:text-red-300 hover:bg-red-900/30" 
//                                     : "text-red-600 hover:text-red-800 hover:bg-red-50"
//                                 }`}
//                                 title="Delete"
//                                 aria-label="Delete config"
//                               >
//                                 <Trash2 className="w-4 h-4" />
//                               </button>
//                             </div>
//                           </td>
//                         </motion.tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </section>
//           </>
//         )}

//         {/* Confirmation Modal */}
//         <ConfirmationModal
//           isOpen={confirmModal.show}
//           title={confirmModal.title}
//           message={confirmModal.message}
//           onConfirm={handleConfirm}
//           onCancel={hideConfirm}
//           theme={theme}
//         />

//         {/* All Modals */}
//         <Modal 
//           isOpen={modals.healthStats} 
//           title="System Health Status" 
//           onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "healthStats" })} 
//           size="lg" 
//           theme={theme}
//         >
//           <div className="space-y-4">
//             {healthStats.length === 0 ? (
//               <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No health data available</p>
//             ) : (
//               <div className={`overflow-y-auto max-h-96 rounded-lg ${
//                 theme === 'dark' ? 'text-white' : 'text-gray-900'
//               }`}>
//                 {healthStats.map((stat, index) => (
//                   <div key={index} className={`border-b p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stat.router_name}</p>
//                         <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{stat.router_ip}</p>
//                       </div>
//                       <HealthIndicator status={stat.status} responseTime={stat.response_time} theme={theme} />
//                     </div>
//                     {stat.error && <p className="text-sm text-red-500 mt-2">{stat.error}</p>}
//                     <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
//                       Last checked: {new Date(stat.timestamp).toLocaleString()}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </Modal>

//         {/* Enhanced Add Router Modal */}
//         <Modal 
//           isOpen={modals.addRouter} 
//           title="Add Router" 
//           onClose={() => {
//             dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" });
//             dispatch({ type: "RESET_ROUTER_FORM" });
//           }} 
//           theme={theme}
//         >
//           <div className="space-y-6">
//             {Object.keys(getFormErrors).length > 0 && (
//               <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
//                 <p className={`text-sm font-medium ${theme === 'dark' ? 'text-red-300' : 'text-red-700'} mb-2`}>
//                   Please fix the following errors:
//                 </p>
//                 <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
//                   {Object.values(getFormErrors).map((error, i) => (
//                     <li key={i}>• {error}</li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <InputField
//                 label="Name"
//                 value={routerForm.name}
//                 onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { name: e.target.value } })}
//                 onBlur={() => handleFieldBlur('name')}
//                 placeholder="Office Router"
//                 icon={<User className="w-4 h-4" />}
//                 required
//                 theme={theme}
//                 error={getFormErrors.name}
//                 touched={touchedFields.name}
//               />
//               <InputField
//                 label="IP Address"
//                 value={routerForm.ip}
//                 onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { ip: e.target.value } })}
//                 onBlur={() => handleFieldBlur('ip')}
//                 placeholder="192.168.88.1"
//                 icon={<Globe className="w-4 h-4" />}
//                 required
//                 theme={theme}
//                 error={getFormErrors.ip}
//                 touched={touchedFields.ip}
//               />
              
//               <div>
//                 <label className={`
//                   block text-sm mb-2 font-medium 
//                   ${theme === 'dark' ? 'text-white' : 'text-gray-700'}
//                 `}>
//                   Type <span className="text-red-600">*</span>
//                 </label>
//                 <div className="relative">
//                   <select
//                     value={routerForm.type}
//                     onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { type: e.target.value } })}
//                     onBlur={() => handleFieldBlur('type')}
//                     className={`
//                       w-full pl-10 pr-4 py-3 rounded-xl border-2 backdrop-blur-md transition-colors duration-300
//                       ${theme === 'dark' 
//                         ? 'bg-gray-800 text-white border-gray-700' 
//                         : 'bg-white text-gray-900 border-gray-300'
//                       }
//                       focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
//                       ${touchedFields.type && getFormErrors.type 
//                         ? 'border-red-500 ring-red-500/20 bg-red-50/20 dark:bg-red-900/10' 
//                         : ''
//                       }
//                     `}
//                     aria-invalid={!!getFormErrors.type}
//                   >
//                     {routerTypes.map((type) => (
//                       <option key={type.value} value={type.value}>
//                         {type.label}
//                       </option>
//                     ))}
//                   </select>
//                   <Router className={`
//                     absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4
//                     ${touchedFields.type && getFormErrors.type ? 'text-red-500' : 'text-gray-500'}
//                   `} />
//                 </div>
//                 {touchedFields.type && getFormErrors.type && (
//                   <p className="text-xs text-red-600 dark:text-red-400 mt-1">{getFormErrors.type}</p>
//                 )}
//               </div>

//               <InputField
//                 label="Port"
//                 type="number"
//                 value={routerForm.port}
//                 onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { port: e.target.value } })}
//                 onBlur={() => handleFieldBlur('port')}
//                 placeholder="8728"
//                 icon={<Hash className="w-4 h-4" />}
//                 required
//                 theme={theme}
//                 error={getFormErrors.port}
//                 touched={touchedFields.port}
//               />

//               <InputField
//                 label="Username"
//                 value={routerForm.username}
//                 onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { username: e.target.value } })}
//                 placeholder="admin"
//                 icon={<User className="w-4 h-4" />}
//                 theme={theme}
//               />
//               <InputField
//                 label="Password"
//                 type="password"
//                 value={routerForm.password}
//                 onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { password: e.target.value } })}
//                 placeholder="••••••••"
//                 icon={<Key className="w-4 h-4" />}
//                 theme={theme}
//               />
//             </div>

//             <InputField
//               label="Location"
//               value={routerForm.location}
//               onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { location: e.target.value } })}
//               placeholder="Main Office"
//               icon={<MapPin className="w-4 h-4" />}
//               theme={theme}
//               className="md:col-span-2"
//             />

//             <div className="space-y-4 md:col-span-2">
//               <CheckboxField
//                 label="Set as default router"
//                 checked={routerForm.is_default}
//                 onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { is_default: e.target.checked } })}
//                 theme={theme}
//               />
//               <CheckboxField
//                 label="Enable captive portal"
//                 checked={routerForm.captive_portal_enabled}
//                 onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { captive_portal_enabled: e.target.checked } })}
//                 theme={theme}
//               />
//             </div>

//             <Button
//               onClick={addRouter}
//               label={isLoading ? "Adding..." : "Add Router"}
//               icon={isLoading ? <ThreeDots color="#fff" height={20} width={40} /> : <Plus />}
//               theme={theme}
//               disabled={isLoading || !isFormValid}
//               fullWidth
//               className="md:col-span-2"
//             />
//           </div>
//         </Modal>

//         {/* Edit Router Modal */}
//         <Modal 
//           isOpen={modals.editRouter} 
//           title="Edit Router" 
//           onClose={() => {
//             dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" });
//             dispatch({ type: "RESET_ROUTER_FORM" });
//           }} 
//           theme={theme}
//         >
//           <div className="space-y-6">
//             {Object.keys(getFormErrors).length > 0 && (
//               <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
//                 <p className={`text-sm font-medium ${theme === 'dark' ? 'text-red-300' : 'text-red-700'} mb-2`}>
//                   Please fix the following errors:
//                 </p>
//                 <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
//                   {Object.values(getFormErrors).map((error, i) => (
//                     <li key={i}>• {error}</li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <InputField
//                 label="Name"
//                 value={routerForm.name}
//                 onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { name: e.target.value } })}
//                 onBlur={() => handleFieldBlur('name')}
//                 placeholder="Office Router"
//                 icon={<User className="w-4 h-4" />}
//                 required
//                 theme={theme}
//                 error={getFormErrors.name}
//                 touched={touchedFields.name}
//               />
//               <InputField
//                 label="IP Address"
//                 value={routerForm.ip}
//                 onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { ip: e.target.value } })}
//                 onBlur={() => handleFieldBlur('ip')}
//                 placeholder="192.168.88.1"
//                 icon={<Globe className="w-4 h-4" />}
//                 required
//                 theme={theme}
//                 error={getFormErrors.ip}
//                 touched={touchedFields.ip}
//               />
              
//               <div>
//                 <label className={`
//                   block text-sm mb-2 font-medium 
//                   ${theme === 'dark' ? 'text-white' : 'text-gray-700'}
//                 `}>
//                   Type <span className="text-red-600">*</span>
//                 </label>
//                 <div className="relative">
//                   <select
//                     value={routerForm.type}
//                     onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { type: e.target.value } })}
//                     onBlur={() => handleFieldBlur('type')}
//                     className={`
//                       w-full pl-10 pr-4 py-3 rounded-xl border-2 backdrop-blur-md transition-colors duration-300
//                       ${theme === 'dark' 
//                         ? 'bg-gray-800 text-white border-gray-700' 
//                         : 'bg-white text-gray-900 border-gray-300'
//                       }
//                       focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
//                       ${touchedFields.type && getFormErrors.type 
//                         ? 'border-red-500 ring-red-500/20 bg-red-50/20 dark:bg-red-900/10' 
//                         : ''
//                       }
//                     `}
//                     aria-invalid={!!getFormErrors.type}
//                   >
//                     {routerTypes.map((type) => (
//                       <option key={type.value} value={type.value}>
//                         {type.label}
//                       </option>
//                     ))}
//                   </select>
//                   <Router className={`
//                     absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4
//                     ${touchedFields.type && getFormErrors.type ? 'text-red-500' : 'text-gray-500'}
//                   `} />
//                 </div>
//                 {touchedFields.type && getFormErrors.type && (
//                   <p className="text-xs text-red-600 dark:text-red-400 mt-1">{getFormErrors.type}</p>
//                 )}
//               </div>

//               <InputField
//                 label="Port"
//                 type="number"
//                 value={routerForm.port}
//                 onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { port: e.target.value } })}
//                 onBlur={() => handleFieldBlur('port')}
//                 placeholder="8728"
//                 icon={<Hash className="w-4 h-4" />}
//                 required
//                 theme={theme}
//                 error={getFormErrors.port}
//                 touched={touchedFields.port}
//               />

//               <InputField
//                 label="Username"
//                 value={routerForm.username}
//                 onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { username: e.target.value } })}
//                 placeholder="admin"
//                 icon={<User className="w-4 h-4" />}
//                 theme={theme}
//               />
//               <InputField
//                 label="Password"
//                 type="password"
//                 value={routerForm.password}
//                 onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { password: e.target.value } })}
//                 placeholder="••••••••"
//                 icon={<Key className="w-4 h-4" />}
//                 theme={theme}
//               />
//             </div>

//             <InputField
//               label="Location"
//               value={routerForm.location}
//               onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { location: e.target.value } })}
//               placeholder="Main Office"
//               icon={<MapPin className="w-4 h-4" />}
//               theme={theme}
//               className="md:col-span-2"
//             />

//             <div className="space-y-4 md:col-span-2">
//               <CheckboxField
//                 label="Set as default router"
//                 checked={routerForm.is_default}
//                 onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { is_default: e.target.checked } })}
//                 theme={theme}
//               />
//               <CheckboxField
//                 label="Enable captive portal"
//                 checked={routerForm.captive_portal_enabled}
//                 onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { captive_portal_enabled: e.target.checked } })}
//                 theme={theme}
//               />
//             </div>

//             <div className="flex gap-3 md:col-span-2">
//               <Button
//                 onClick={() => updateRouter(activeRouter.id)}
//                 label={isLoading ? "Saving..." : "Save Changes"}
//                 icon={isLoading ? <ThreeDots color="#fff" height={20} width={40} /> : <CheckCircle />}
//                 theme={theme}
//                 disabled={isLoading || !isFormValid}
//                 fullWidth
//               />
//               <Button
//                 onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" })}
//                 label="Cancel"
//                 icon={<X />}
//                 theme={theme}
//                 color="gray"
//                 fullWidth
//               />
//             </div>
//           </div>
//         </Modal>

//         {/* Hotspot Config Modal */}
//         <Modal 
//           isOpen={modals.hotspotConfig} 
//           title="Configure Hotspot" 
//           onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "hotspotConfig" })} 
//           theme={theme}
//         >
//           <div className="space-y-6">
//             <InputField
//               label="SSID"
//               value={hotspotForm.ssid}
//               onChange={(e) => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: { ssid: e.target.value } })}
//               placeholder="SurfZone-WiFi"
//               icon={<Wifi className="w-4 h-4" />}
//               required
//               theme={theme}
//             />
//             <InputField
//               label="Redirect URL"
//               value={hotspotForm.redirectUrl}
//               onChange={(e) => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: { redirectUrl: e.target.value } })}
//               placeholder="http://captive.surfzone.local"
//               icon={<Globe className="w-4 h-4" />}
//               required
//               theme={theme}
//             />
//             <InputField
//               label="Bandwidth Limit"
//               value={hotspotForm.bandwidthLimit}
//               onChange={(e) => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: { bandwidthLimit: e.target.value } })}
//               placeholder="10M"
//               icon={<Zap className="w-4 h-4" />}
//               theme={theme}
//             />
//             <InputField
//               label="Session Timeout (min)"
//               type="number"
//               value={hotspotForm.sessionTimeout}
//               onChange={(e) => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: { sessionTimeout: e.target.value } })}
//               placeholder="60"
//               icon={<Clock className="w-4 h-4" />}
//               theme={theme}
//             />
//             <div>
//               <label className={`block text-sm mb-2 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Landing Page (App.js)</label>
//               <input
//                 type="file"
//                 accept=".js"
//                 onChange={(e) => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: { landingPage: e.target.files[0] } })}
//                 className={`w-full p-3 rounded-xl border-2 backdrop-blur-md transition-colors duration-300 ${
//                   theme === 'dark' 
//                     ? 'bg-gray-800/60 border-gray-700 text-white' 
//                     : 'bg-white/80 border-gray-300 text-gray-900'
//                 }`}
//               />
//             </div>
//             <Button
//               onClick={configureHotspot}
//               label={isLoading ? "Configuring..." : "Setup Hotspot"}
//               icon={isLoading ? <ThreeDots color="#fff" height={20} width={40} /> : <Upload />}
//               theme={theme}
//               disabled={isLoading || !hotspotForm.landingPage}
//               fullWidth
//             />
//           </div>
//         </Modal>

//         {/* Hotspot Users Modal */}
//         <Modal 
//           isOpen={modals.users} 
//           title="Hotspot Users" 
//           onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "users" })} 
//           size="lg" 
//           theme={theme}
//         >
//           <div className="space-y-6">
//             {hotspotUsers.length === 0 ? (
//               <div className="text-center py-8">
//                 <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                 <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No active users</p>
//               </div>
//             ) : (
//               <div className="overflow-x-auto rounded-xl border border-gray-200/30 dark:border-gray-700/30">
//                 <table className={`min-w-full divide-y ${
//                   theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
//                 }`}>
//                   <thead className={theme === 'dark' ? 'bg-gray-800/80' : 'bg-gray-100'}>
//                     <tr>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Client</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Plan</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">MAC</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Remaining Time</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Data Used</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Status</th>
//                       <th className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className={`divide-y ${
//                     theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
//                   }`}>
//                     {hotspotUsers.map((user) => (
//                       <tr key={user.id} className={theme === 'dark' ? 'hover:bg-gray-800/40' : 'hover:bg-gray-50'}>
//                         <td className="px-6 py-4">
//                           <div className="flex items-center space-x-3">
//                             <Users className="w-4 h-4 text-gray-400" />
//                             <div>
//                               <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                                 {user.client?.user?.username || "Unknown"}
//                               </p>
//                               <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
//                                 {user.client?.user?.phone_number || "N/A"}
//                               </p>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">{user.plan?.name || "N/A"}</td>
//                         <td className="px-6 py-4 font-mono text-sm">{user.mac}</td>
//                         <td className="px-6 py-4">
//                           <div className="flex items-center">
//                             <Clock className="w-4 h-4 mr-2 text-blue-500" />
//                             {formatTime(user.remaining_time)}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">{formatBytes(user.data_used)}</td>
//                         <td className="px-6 py-4">
//                           <span className={`px-3 py-1 rounded-full text-sm font-medium ${
//                             user.active 
//                               ? theme === 'dark' ? "bg-green-900 text-green-300" : "bg-green-100 text-green-600"
//                               : theme === 'dark' ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"
//                           }`}>
//                             {user.active ? "Active" : "Inactive"}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 text-right space-x-2">
//                           <Button
//                             onClick={() => viewUserSessionHistory(user)}
//                             label="History"
//                             icon={<History className="w-3 h-3" />}
//                             theme={theme}
//                             compact
//                             color="blue"
//                           />
//                           {user.active && (
//                             <Button
//                               onClick={() => showConfirm("Disconnect User", `Are you sure you want to disconnect this user?`, () => disconnectHotspotUser(user.id))}
//                               label="Disconnect"
//                               icon={<LogOut className="w-3 h-3" />}
//                               theme={theme}
//                               compact
//                               color="red"
//                             />
//                           )}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </Modal>

//         {/* Session History Modal */}
//         <Modal
//           isOpen={modals.sessionHistory}
//           title={`Session History - ${selectedUser?.client?.user?.username || "User"}`}
//           onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "sessionHistory" })}
//           size="lg"
//           theme={theme}
//         >
//           <div className="space-y-6">
//             {sessionHistory.length === 0 ? (
//               <div className="text-center py-8">
//                 <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                 <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No session history found</p>
//               </div>
//             ) : (
//               <div className="overflow-x-auto rounded-xl border border-gray-200/30 dark:border-gray-700/30">
//                 <table className={`min-w-full divide-y ${
//                   theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
//                 }`}>
//                   <thead className={theme === 'dark' ? 'bg-gray-800/80' : 'bg-gray-100'}>
//                     <tr>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Router</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Start Time</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">End Time</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Duration</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Data Used</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Reason</th>
//                     </tr>
//                   </thead>
//                   <tbody className={`divide-y ${
//                     theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
//                   }`}>
//                     {sessionHistory.map((session) => (
//                       <tr key={session.id} className={theme === 'dark' ? 'hover:bg-gray-800/40' : 'hover:bg-gray-50'}>
//                         <td className="px-6 py-4">{session.router?.name || "N/A"}</td>
//                         <td className="px-6 py-4">{new Date(session.start_time).toLocaleString()}</td>
//                         <td className="px-6 py-4">{session.end_time ? new Date(session.end_time).toLocaleString() : "Active"}</td>
//                         <td className="px-6 py-4">{formatTime(session.duration)}</td>
//                         <td className="px-6 py-4">{formatBytes(session.data_used)}</td>
//                         <td className="px-6 py-4 capitalize">{session.disconnected_reason?.replace(/_/g, " ") || "Unknown"}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </Modal>

//         {/* Callback Config Modal */}
//         <Modal
//           isOpen={modals.callbackConfig}
//           title={editingCallbackId ? "Edit Callback Config" : "Add Callback Config"}
//           onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "callbackConfig" })}
//           theme={theme}
//         >
//           <div className="space-y-6">
//             <div>
//               <label className={`block text-sm mb-2 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Event</label>
//               <div className={`relative ${theme === 'dark' ? 'bg-gray-800/60 border-gray-700' : 'bg-white/80 border-gray-300'}`}>
//                 <select
//                   value={callbackForm.event}
//                   onChange={(e) => dispatch({ type: "UPDATE_CALLBACK_FORM", payload: { event: e.target.value } })}
//                   className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 backdrop-blur-md transition-colors duration-300 ${
//                     theme === 'dark' 
//                       ? 'text-white' 
//                       : 'text-gray-900'
//                   } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
//                 >
//                   <option value="">Select Event</option>
//                   {events.map((event) => (
//                     <option key={event.id} value={event.name}>
//                       {event.name_display}
//                     </option>
//                   ))}
//                 </select>
//                 <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
//               </div>
//             </div>
//             <InputField
//               label="Callback URL"
//               value={callbackForm.callback_url}
//               onChange={(e) => dispatch({ type: "UPDATE_CALLBACK_FORM", payload: { callback_url: e.target.value } })}
//               placeholder="https://example.com/callback"
//               icon={<Globe className="w-4 h-4" />}
//               required
//               theme={theme}
//             />
//             <div>
//               <label className={`block text-sm mb-2 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Security Level</label>
//               <div className={`relative ${theme === 'dark' ? 'bg-gray-800/60 border-gray-700' : 'bg-white/80 border-gray-300'}`}>
//                 <select
//                   value={callbackForm.security_level}
//                   onChange={(e) => dispatch({ type: "UPDATE_CALLBACK_FORM", payload: { security_level: e.target.value } })}
//                   className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 backdrop-blur-md transition-colors duration-300 ${
//                     theme === 'dark' 
//                       ? 'text-white' 
//                       : 'text-gray-900'
//                   } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
//                 >
//                   <option value="low">Low</option>
//                   <option value="medium">Medium</option>
//                   <option value="high">High</option>
//                   <option value="critical">Critical</option>
//                 </select>
//                 <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
//               </div>
//             </div>
//             <div>
//               <label className={`block text-sm mb-2 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Security Profile</label>
//               <div className={`relative ${theme === 'dark' ? 'bg-gray-800/60 border-gray-700' : 'bg-white/80 border-gray-300'}`}>
//                 <select
//                   value={callbackForm.security_profile}
//                   onChange={(e) => dispatch({ type: "UPDATE_CALLBACK_FORM", payload: { security_profile: e.target.value } })}
//                   className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 backdrop-blur-md transition-colors duration-300 ${
//                     theme === 'dark' 
//                       ? 'text-white' 
//                       : 'text-gray-900'
//                   } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
//                 >
//                   <option value="">Select Profile</option>
//                   {securityProfiles.map((profile) => (
//                     <option key={profile.id} value={profile.id}>
//                       {profile.name}
//                     </option>
//                   ))}
//                 </select>
//                 <ShieldCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
//               </div>
//             </div>
//             <CheckboxField
//               label="Active"
//               checked={callbackForm.is_active}
//               onChange={(e) => dispatch({ type: "UPDATE_CALLBACK_FORM", payload: { is_active: e.target.checked } })}
//               theme={theme}
//             />
//             <CheckboxField
//               label="Enable Retries"
//               checked={callbackForm.retry_enabled}
//               onChange={(e) => dispatch({ type: "UPDATE_CALLBACK_FORM", payload: { retry_enabled: e.target.checked } })}
//               theme={theme}
//             />
//             <InputField
//               label="Max Retries"
//               type="number"
//               value={callbackForm.max_retries}
//               onChange={(e) => dispatch({ type: "UPDATE_CALLBACK_FORM", payload: { max_retries: e.target.value } })}
//               placeholder="3"
//               icon={<RefreshCw className="w-4 h-4" />}
//               theme={theme}
//             />
//             <InputField
//               label="Timeout (seconds)"
//               type="number"
//               value={callbackForm.timeout_seconds}
//               onChange={(e) => dispatch({ type: "UPDATE_CALLBACK_FORM", payload: { timeout_seconds: e.target.value } })}
//               placeholder="30"
//               icon={<Clock className="w-4 h-4" />}
//               theme={theme}
//             />
//             <Button
//               onClick={editingCallbackId ? updateCallbackConfig : addCallbackConfig}
//               label={isLoading ? "Saving..." : "Save Configuration"}
//               icon={isLoading ? <ThreeDots color="#fff" height={20} width={40} /> : <CheckCircle />}
//               theme={theme}
//               disabled={isLoading || !callbackForm.event || !callbackForm.callback_url}
//               fullWidth
//             />
//           </div>
//         </Modal>

//         {/* Test Callback Modal */}
//         {showTestModal && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               className={`rounded-2xl p-6 w-full max-w-2xl mx-4 backdrop-blur-md border border-gray-200/30 dark:border-gray-700/30 ${
//                 theme === 'dark' ? 'bg-gray-800/80' : 'bg-white/90'
//               }`}
//             >
//               <h3 className="text-lg font-semibold mb-4 text-indigo-600">Test Callback Configuration</h3>
//               <div className="mb-6">
//                 <label className={`block text-sm font-medium mb-3 ${
//                   theme === 'dark' ? 'text-white' : 'text-gray-700'
//                 }`}>Test Payload</label>
//                 <textarea
//                   value={testConfig.test_payload}
//                   onChange={(e) => dispatch({ type: "UPDATE_TEST_CONFIG", payload: { test_payload: e.target.value } })}
//                   rows={10}
//                   className={`w-full px-4 py-3 border-2 rounded-xl font-mono text-sm backdrop-blur-md transition-colors duration-300 resize-vertical ${
//                     theme === 'dark' 
//                       ? 'bg-gray-800/60 border-gray-700 text-white placeholder-gray-400' 
//                       : 'border-gray-300 bg-white/80 text-gray-900 placeholder-gray-500'
//                   } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
//                   placeholder="Enter test payload in JSON format"
//                 />
//               </div>
//               <div className="flex flex-col sm:flex-row gap-3 justify-end">
//                 <button
//                   onClick={() => dispatch({ type: "SET_SHOW_TEST_MODAL", payload: false })}
//                   className={`px-6 py-3 border-2 rounded-xl font-medium transition-colors duration-300 ${
//                     theme === 'dark' 
//                       ? 'border-gray-700 text-white hover:bg-gray-700/30' 
//                       : 'border-gray-300 text-gray-700 hover:bg-gray-50'
//                   }`}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={runTest}
//                   disabled={isLoading}
//                   className={`px-6 py-3 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'} bg-blue-600 text-white rounded-xl font-medium transition-colors duration-300 flex items-center justify-center disabled:opacity-50`}
//                 >
//                   <Activity className="w-4 h-4 mr-2" />
//                   {isLoading ? "Running..." : "Run Test"}
//                 </button>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default RouterManagement;





















// import React, { useReducer, useEffect, useCallback, useState, useMemo, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Wifi, Server, Upload, Settings, X, Users, RefreshCw, Plus,
//   CheckCircle, Globe, Download, LogOut, LogIn, ChevronDown,
//   ChevronUp, Trash2, Edit, Clock, MapPin, Activity, Zap,
//   Shield, AlertCircle, History, RotateCcw, Battery, BatteryCharging,
//   Router, Lock, User, Hash, Key, ShieldCheck, Cable
// } from "lucide-react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { ThreeDots } from "react-loader-spinner";
// import api from "../../api";
// import { useTheme } from "../../context/ThemeContext";

// // Enhanced Button Component with better theme support
// const Button = ({ onClick, label, icon, color = "indigo", disabled, compact, fullWidth, theme, className = "" }) => {
//   const colorClasses = {
//     indigo: theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700',
//     green: 'bg-green-600 hover:bg-green-700',
//     red: 'bg-red-600 hover:bg-red-700',
//     blue: 'bg-blue-600 hover:bg-blue-700',
//     teal: 'bg-teal-600 hover:bg-teal-700',
//     purple: 'bg-purple-600 hover:bg-purple-700',
//     yellow: 'bg-yellow-600 hover:bg-yellow-700',
//     gray: theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
//   };

//   return (
//     <motion.button
//       whileHover={{ scale: disabled ? 1 : 1.05 }}
//       whileTap={{ scale: disabled ? 1 : 0.95 }}
//       onClick={onClick}
//       disabled={disabled}
//       className={`
//         ${colorClasses[color]} 
//         ${compact ? "px-3 py-2 text-sm" : "px-4 py-3"} 
//         ${fullWidth ? "w-full" : ""} 
//         ${className} 
//         text-white rounded-xl flex items-center justify-center font-medium 
//         disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 
//         shadow-md hover:shadow-lg
//         min-h-[44px]
//       `}
//       aria-disabled={disabled}
//     >
//       {icon && React.cloneElement(icon, { className: `w-4 h-4 ${label ? "mr-2" : ""}` })}
//       {label && <span>{label}</span>}
//     </motion.button>
//   );
// };

// // Enhanced Modal Component
// const Modal = ({ isOpen, title, onClose, children, size = "md", theme }) => (
//   <AnimatePresence>
//     {isOpen && (
//       <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//         <motion.div
//           initial={{ scale: 0.9, opacity: 0, y: 20 }}
//           animate={{ scale: 1, opacity: 1, y: 0 }}
//           exit={{ scale: 0.9, opacity: 0, y: 20 }}
//           className={`
//             rounded-2xl 
//             ${size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-4xl" : "max-w-xl"} 
//             w-full max-h-[90vh] overflow-y-auto backdrop-blur-md transition-all duration-300 shadow-2xl
//             ${theme === 'dark' 
//               ? 'bg-gray-800/90 border border-gray-700/50' 
//               : 'bg-white/95 border border-gray-200/50'
//             }
//           `}
//         >
//           <div className={`
//             flex justify-between items-center p-6 border-b rounded-t-2xl
//             ${theme === 'dark' 
//               ? 'border-gray-700 bg-gray-800' 
//               : 'border-gray-200 bg-gray-50'
//             }
//           `}>
//             <h3 className="text-xl font-semibold text-indigo-600">{title}</h3>
//             <button 
//               onClick={onClose} 
//               className={`
//                 p-2 rounded-xl transition-colors duration-300 hover:scale-110
//                 ${theme === 'dark' 
//                   ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
//                   : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
//                 }
//               `}
//               aria-label="Close modal"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>
//           <div className="p-6">
//             {children}
//           </div>
//         </motion.div>
//       </div>
//     )}
//   </AnimatePresence>
// );

// // Confirmation Modal Component
// const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, theme }) => (
//   <AnimatePresence>
//     {isOpen && (
//       <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//         <motion.div
//           initial={{ scale: 0.9, opacity: 0, y: 20 }}
//           animate={{ scale: 1, opacity: 1, y: 0 }}
//           exit={{ scale: 0.9, opacity: 0, y: 20 }}
//           className={`
//             rounded-2xl max-w-md w-full backdrop-blur-md transition-all duration-300 shadow-2xl
//             ${theme === 'dark' 
//               ? 'bg-gray-800/90 border border-gray-700' 
//               : 'bg-white/95 border border-gray-200'
//             }
//           `}
//         >
//           <div className={`
//             p-6 border-b rounded-t-2xl
//             ${theme === 'dark' 
//               ? 'border-gray-700 bg-gray-800' 
//               : 'border-gray-200 bg-gray-50'
//             }
//           `}>
//             <h3 className="text-xl font-semibold text-red-600">{title}</h3>
//           </div>
//           <div className="p-6">
//             <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//               {message}
//             </p>
//           </div>
//           <div className="flex justify-end gap-3 p-6 border-t">
//             <button 
//               onClick={onCancel} 
//               className={`
//                 px-4 py-2 rounded-xl text-sm font-medium ${theme === 'dark' 
//                   ? 'bg-gray-700 hover:bg-gray-600 text-white' 
//                   : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
//                 } transition-colors duration-300
//               `}
//             >
//               Cancel
//             </button>
//             <Button
//               onClick={onConfirm}
//               label="Confirm"
//               color="red"
//               theme={theme}
//             />
//           </div>
//         </motion.div>
//       </div>
//     )}
//   </AnimatePresence>
// );

// // Enhanced InputField with better theme support and validation states
// const InputField = ({ 
//   label, 
//   value, 
//   onChange, 
//   type = "text", 
//   placeholder, 
//   required, 
//   theme, 
//   icon, 
//   error, 
//   className = "",
//   onBlur,
//   touched
// }) => {
//   const showError = touched && error;
  
//   return (
//     <div className={className}>
//       <label className={`
//         block text-sm mb-2 font-medium 
//         ${theme === 'dark' ? 'text-white' : 'text-gray-700'}
//       `}>
//         {label} {required && <span className="text-red-600">*</span>}
//       </label>
//       <div className="relative">
//         <input
//           type={type}
//           value={value}
//           onChange={onChange}
//           onBlur={onBlur}
//           placeholder={placeholder}
//           required={required}
//           className={`
//             w-full pl-10 pr-4 py-3 rounded-xl border-2 backdrop-blur-md transition-all duration-300
//             ${theme === 'dark' 
//               ? 'bg-gray-800 text-white placeholder-gray-400 border-gray-700' 
//               : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300'
//             }
//             focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
//             ${showError 
//               ? 'border-red-500 ring-red-500/20 bg-red-50/20 dark:bg-red-900/10' 
//               : ''
//             }
//           `}
//           aria-invalid={!!showError}
//           aria-describedby={showError ? `${label}-error` : undefined}
//         />
//         {icon && (
//           <div className={`
//             absolute left-3 top-1/2 transform -translate-y-1/2
//             ${showError ? 'text-red-500' : 'text-gray-500'}
//           `}>
//             {React.cloneElement(icon)}
//           </div>
//         )}
//       </div>
//       {showError && (
//         <p 
//           id={`${label}-error`}
//           className={`text-xs mt-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}
//         >
//           {error}
//         </p>
//       )}
//     </div>
//   );
// };

// // Enhanced CheckboxField
// const CheckboxField = ({ label, checked, onChange, theme }) => (
//   <div className="flex items-center space-x-3">
//     <input
//       type="checkbox"
//       checked={checked}
//       onChange={onChange}
//       className={`
//         w-5 h-5 border-2 rounded focus:ring-indigo-500 transition-all duration-300
//         ${theme === 'dark' 
//           ? 'bg-gray-800 border-gray-600 text-indigo-500 focus:ring-indigo-400' 
//           : 'border-gray-300 text-indigo-600 focus:ring-indigo-500'
//         }
//         ${checked ? 'bg-indigo-600 border-indigo-600' : ''}
//       `}
//       id={label.toLowerCase().replace(/\s+/g, '-')}
//     />
//     <label 
//       htmlFor={label.toLowerCase().replace(/\s+/g, '-')} 
//       className={`
//         text-sm font-medium cursor-pointer select-none
//         ${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-gray-700 hover:text-gray-900'}
//       `}
//     >
//       {label}
//     </label>
//   </div>
// );

// // Compact Add Router Button for header
// const CompactAddRouterButton = ({ onClick, theme, isLoading }) => (
//   <Button
//     onClick={onClick}
//     label={isLoading ? "Adding..." : "Add New Router"}
//     icon={isLoading ? <ThreeDots color="#fff" height={20} width={40} /> : <Plus />}
//     theme={theme}
//     disabled={isLoading}
//     className="min-h-[44px] w-full sm:w-auto"
//   />
// );

// // Enhanced Stats Card
// const StatsCard = ({ title, value, icon, unit = "", color = "bg-blue-500", theme }) => (
//   <motion.div 
//     whileHover={{ y: -2 }}
//     className={`
//       p-6 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300
//       ${theme === 'dark' 
//         ? 'bg-gray-800/80 hover:bg-gray-800' 
//         : 'bg-white hover:bg-white'
//       }
//     `}
//   >
//     <div className="flex items-center justify-between">
//       <div>
//         <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
//         <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
//           {value}{unit}
//         </p>
//       </div>
//       <div className={`p-3 rounded-full ${color} text-white shadow-lg`}>{icon}</div>
//     </div>
//   </motion.div>
// );

// // Mobile Action Button Component
// const MobileActionButton = ({ onClick, icon, label, theme }) => (
//   <button
//     onClick={onClick}
//     className={`w-full p-3 rounded-lg flex items-center space-x-3 text-sm transition-colors duration-300 ${
//       theme === 'dark' 
//         ? 'bg-gray-800/60 text-white hover:bg-gray-700/60' 
//         : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
//     }`}
//   >
//     {icon}
//     <span>{label}</span>
//   </button>
// );

// const initialState = {
//   routers: [],
//   activeRouter: null,
//   isLoading: false,
//   modals: {
//     addRouter: false,
//     editRouter: false,
//     hotspotConfig: false,
//     pppoeConfig: false,
//     users: false,
//     sessionHistory: false,
//     healthStats: false,
//     callbackConfig: false,
//   },
//   confirmModal: {
//     show: false,
//     title: "",
//     message: "",
//     action: null,
//   },
//   routerForm: {
//     name: "",
//     ip: "",
//     type: "mikrotik",
//     port: "8728",
//     username: "admin",
//     password: "",
//     location: "",
//     is_default: false,
//     captive_portal_enabled: true,
//   },
//   // Track touched fields for form validation
//   touchedFields: {
//     name: false,
//     ip: false,
//     type: false,
//     port: false,
//   },
//   hotspotForm: {
//     ssid: "SurfZone-WiFi",
//     landingPage: null,
//     redirectUrl: "http://captive.surfzone.local",
//     bandwidthLimit: "10M",
//     sessionTimeout: "60",
//     authMethod: "universal",
//   },
//   pppoeForm: {
//     ipPool: "pppoe-pool-1",
//     serviceName: "",
//     mtu: 1492,
//     dnsServers: "8.8.8.8,1.1.1.1",
//     bandwidthLimit: "10M",
//   },
//   callbackForm: {
//     event: "",
//     callback_url: "",
//     security_level: "medium",
//     security_profile: "",
//     is_active: true,
//     retry_enabled: true,
//     max_retries: 3,
//     timeout_seconds: 30,
//   },
//   hotspotUsers: [],
//   pppoeUsers: [],
//   sessionHistory: [],
//   healthStats: [],
//   expandedRouter: null,
//   selectedUser: null,
//   statsData: {
//     latest: {},
//     history: {},
//   },
//   events: [],
//   securityProfiles: [],
//   callbackConfigs: [],
//   showTestModal: false,
//   testConfig: { configuration_id: "", test_payload: "{}" },
//   editingCallbackId: null,
// };

// const reducer = (state, action) => {
//   switch (action.type) {
//     case "SET_ROUTERS":
//       return { ...state, routers: action.payload };
//     case "SET_ACTIVE_ROUTER":
//       return { ...state, activeRouter: action.payload };
//     case "SET_LOADING":
//       return { ...state, isLoading: action.payload };
//     case "TOGGLE_MODAL":
//       return { 
//         ...state, 
//         modals: { ...state.modals, [action.modal]: !state.modals[action.modal] },
//         // Reset touched fields when modal closes
//         ...(action.modal === "addRouter" && !state.modals[action.modal] && {
//           touchedFields: initialState.touchedFields
//         })
//       };
//     case "SET_CONFIRM_MODAL":
//       return { 
//         ...state, 
//         confirmModal: { ...state.confirmModal, ...action.payload } 
//       };
//     case "UPDATE_ROUTER_FORM":
//       return { ...state, routerForm: { ...state.routerForm, ...action.payload } };
//     case "UPDATE_HOTSPOT_FORM":
//       return { ...state, hotspotForm: { ...state.hotspotForm, ...action.payload } };
//     case "UPDATE_PPPOE_FORM":
//       return { ...state, pppoeForm: { ...state.pppoeForm, ...action.payload } };
//     case "UPDATE_CALLBACK_FORM":
//       return { ...state, callbackForm: { ...state.callbackForm, ...action.payload } };
//     case "SET_TOUCHED_FIELD":
//       return { 
//         ...state, 
//         touchedFields: { ...state.touchedFields, [action.field]: true } 
//       };
//     case "RESET_TOUCHED_FIELDS":
//       return { ...state, touchedFields: initialState.touchedFields };
//     case "SET_HOTSPOT_USERS":
//       return { ...state, hotspotUsers: action.payload };
//     case "SET_PPPOE_USERS":
//       return { ...state, pppoeUsers: action.payload };
//     case "SET_SESSION_HISTORY":
//       return { ...state, sessionHistory: action.payload };
//     case "SET_HEALTH_STATS":
//       return { ...state, healthStats: action.payload };
//     case "RESET_ROUTER_FORM":
//       return { 
//         ...state, 
//         routerForm: initialState.routerForm,
//         touchedFields: initialState.touchedFields
//       };
//     case "RESET_CALLBACK_FORM":
//       return { ...state, callbackForm: initialState.callbackForm, editingCallbackId: null };
//     case "TOGGLE_ROUTER_EXPANDED":
//       return { ...state, expandedRouter: state.expandedRouter === action.id ? null : action.id };
//     case "UPDATE_ROUTER":
//       return {
//         ...state,
//         routers: state.routers.map((r) => (r.id === action.payload.id ? { ...r, ...action.payload.data } : r)),
//         activeRouter: state.activeRouter?.id === action.payload.id ? { ...state.activeRouter, ...action.payload.data } : state.activeRouter,
//       };
//     case "DELETE_ROUTER":
//       return {
//         ...state,
//         routers: state.routers.filter((r) => r.id !== action.id),
//         activeRouter: state.activeRouter?.id === action.id ? null : state.activeRouter,
//       };
//     case "SET_STATS_DATA":
//       return { ...state, statsData: action.payload };
//     case "SET_SELECTED_USER":
//       return { ...state, selectedUser: action.payload };
//     case "SET_EVENTS":
//       return { ...state, events: action.payload };
//     case "SET_SECURITY_PROFILES":
//       return { ...state, securityProfiles: action.payload };
//     case "SET_CALLBACK_CONFIGS":
//       return { ...state, callbackConfigs: action.payload };
//     case "SET_EDITING_CALLBACK_ID":
//       return { ...state, editingCallbackId: action.payload };
//     case "SET_SHOW_TEST_MODAL":
//       return { ...state, showTestModal: action.payload };
//     case "UPDATE_TEST_CONFIG":
//       return { ...state, testConfig: { ...state.testConfig, ...action.payload } };
//     default:
//       return state;
//   }
// };

// // Helper functions
// const getRouterStatusColor = (status, theme) => {
//   const colors = theme === 'dark' ? {
//     connected: "bg-green-900 text-green-300",
//     disconnected: "bg-red-900 text-red-300",
//     updating: "bg-yellow-900 text-yellow-300",
//     error: "bg-purple-900 text-purple-300",
//   } : {
//     connected: "bg-green-100 text-green-600",
//     disconnected: "bg-red-100 text-red-600",
//     updating: "bg-yellow-100 text-yellow-600",
//     error: "bg-purple-100 text-purple-600",
//   };
//   return colors[status] || (theme === 'dark' ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-500");
// };

// const getRouterStatusIcon = (status) => {
//   switch (status) {
//     case "connected":
//       return <Wifi className="w-4 h-4" />;
//     case "disconnected":
//       return <Wifi className="w-4 h-4 opacity-50" />;
//     case "updating":
//       return <RefreshCw className="w-4 h-4 animate-spin" />;
//     case "error":
//       return <AlertCircle className="w-4 h-4" />;
//     default:
//       return <Wifi className="w-4 h-4" />;
//   }
// };

// const formatBytes = (bytes, decimals = 2) => {
//   if (bytes === 0) return "0 Bytes";
//   const k = 1024;
//   const dm = decimals < 0 ? 0 : decimals;
//   const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
// };

// const formatTime = (seconds) => {
//   if (seconds <= 0) return "Expired";
//   const hours = Math.floor(seconds / 3600);
//   const minutes = Math.floor((seconds % 3600) / 60);
//   const secs = seconds % 60;
//   if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
//   if (minutes > 0) return `${minutes}m ${secs}s`;
//   return `${secs}s`;
// };

// const timeSince = (dateString) => {
//   const date = new Date(dateString);
//   const seconds = Math.floor((new Date() - date) / 1000);
//   let interval = Math.floor(seconds / 31536000);
//   if (interval >= 1) return interval + " year" + (interval === 1 ? "" : "s") + " ago";
//   interval = Math.floor(seconds / 2592000);
//   if (interval >= 1) return interval + " month" + (interval === 1 ? "" : "s") + " ago";
//   interval = Math.floor(seconds / 86400);
//   if (interval >= 1) return interval + " day" + (interval === 1 ? "" : "s") + " ago";
//   interval = Math.floor(seconds / 3600);
//   if (interval >= 1) return interval + " hour" + (interval === 1 ? "" : "s") + " ago";
//   interval = Math.floor(seconds / 60);
//   if (interval >= 1) return interval + " minute" + (interval === 1 ? "" : "s") + " ago";
//   return Math.floor(seconds) + " second" + (seconds === 1 ? "" : "s") + " ago";
// };

// const getSecurityLevelBadge = (level, theme) => {
//   const colors = theme === 'dark' ? {
//     low: "bg-gray-800 text-gray-300",
//     medium: "bg-blue-800 text-blue-300",
//     high: "bg-yellow-800 text-yellow-300",
//     critical: "bg-red-800 text-red-300",
//   } : {
//     low: "bg-gray-100 text-gray-800",
//     medium: "bg-blue-100 text-blue-800",
//     high: "bg-yellow-100 text-yellow-800",
//     critical: "bg-red-100 text-red-800",
//   };
//   return (
//     <span className={`px-2 py-1 rounded-full text-xs ${colors[level] || colors.medium}`}>
//       {level.charAt(0).toUpperCase() + level.slice(1)}
//     </span>
//   );
// };

// const HealthIndicator = ({ status, responseTime, theme }) => (
//   <div className="flex items-center space-x-2">
//     <div className={`w-3 h-3 rounded-full ${status === "online" ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
//     <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{status}</span>
//     {responseTime && <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>({responseTime}s)</span>}
//   </div>
// );

// const RouterManagement = () => {
//   const [state, dispatch] = useReducer(reducer, initialState);
//   const {
//     routers,
//     activeRouter,
//     isLoading,
//     modals,
//     confirmModal,
//     routerForm,
//     touchedFields,
//     hotspotForm,
//     pppoeForm,
//     callbackForm,
//     hotspotUsers,
//     pppoeUsers,
//     sessionHistory,
//     healthStats,
//     expandedRouter,
//     selectedUser,
//     statsData,
//     events,
//     securityProfiles,
//     callbackConfigs,
//     showTestModal,
//     testConfig,
//     editingCallbackId,
//   } = state;
//   const [statsLoading, setStatsLoading] = useState(false);
//   const { theme } = useTheme();
//   const [mobileDropdowns, setMobileDropdowns] = useState({});
//   const activeRouterRef = useRef(activeRouter);

//   useEffect(() => {
//     activeRouterRef.current = activeRouter;
//   }, [activeRouter]);

//   const routerTypes = useMemo(() => [
//     { value: "mikrotik", label: "MikroTik" },
//     { value: "ubiquiti", label: "Ubiquiti" },
//     { value: "cisco", label: "Cisco" },
//     { value: "other", label: "Other" },
//   ], []);

//   // Enhanced validation that only shows errors for touched fields
//   const getFormErrors = useMemo(() => {
//     const errors = {};
//     if (touchedFields.name && !routerForm.name.trim()) errors.name = "Name is required";
//     if (touchedFields.ip && !routerForm.ip.trim()) errors.ip = "IP is required";
//     if (touchedFields.type && !routerForm.type) errors.type = "Type is required";
//     if (touchedFields.port && !routerForm.port) errors.port = "Port is required";
//     return errors;
//   }, [routerForm, touchedFields]);

//   const isFormValid = useMemo(() => 
//     routerForm.name.trim() && 
//     routerForm.ip.trim() && 
//     routerForm.type && 
//     routerForm.port, 
//     [routerForm]
//   );

//   const toggleMobileDropdown = (dropdown) => {
//     setMobileDropdowns(prev => ({
//       ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
//       [dropdown]: !prev[dropdown]
//     }));
//   };

//   // Handler for field blur events
//   const handleFieldBlur = (field) => {
//     if (!touchedFields[field]) {
//       dispatch({ type: "SET_TOUCHED_FIELD", field });
//     }
//   };

//   const showConfirm = (title, message, action) => {
//     dispatch({ 
//       type: "SET_CONFIRM_MODAL", 
//       payload: { show: true, title, message, action } 
//     });
//   };

//   const hideConfirm = () => {
//     dispatch({ type: "SET_CONFIRM_MODAL", payload: { show: false } });
//   };

//   const handleConfirm = () => {
//     if (confirmModal.action) {
//       confirmModal.action();
//     }
//     hideConfirm();
//   };

//   const fetchRouters = useCallback(async () => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.get("/api/network_management/routers/");
//       dispatch({ type: "SET_ROUTERS", payload: response.data });
//       if (!activeRouter && response.data.length > 0) {
//         dispatch({ type: "SET_ACTIVE_ROUTER", payload: response.data[0] });
//       }
//     } catch (error) {
//       toast.error("Failed to fetch routers");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [activeRouter]);

//   const fetchHotspotUsers = useCallback(async (routerId) => {
//     if (!routerId) return;
//     try {
//       const response = await api.get(`/api/network_management/routers/${routerId}/hotspot-users/`);
//       dispatch({ type: "SET_HOTSPOT_USERS", payload: response.data });
//     } catch (error) {
//       toast.error("Failed to fetch hotspot users");
//     }
//   }, []);

//   const fetchPPPoEUsers = useCallback(async (routerId) => {
//     if (!routerId) return;
//     try {
//       const response = await api.get(`/api/network_management/routers/${routerId}/pppoe-users/`);
//       dispatch({ type: "SET_PPPOE_USERS", payload: response.data });
//     } catch (error) {
//       toast.error("Failed to fetch PPPoE users");
//     }
//   }, []);

//   const fetchSessionHistory = useCallback(async (userId) => {
//     if (!userId) return;
//     try {
//       const response = await api.get(`/api/network_management/hotspot-users/${userId}/session-history/`);
//       dispatch({ type: "SET_SESSION_HISTORY", payload: response.data });
//     } catch (error) {
//       toast.error("Failed to fetch session history");
//     }
//   }, []);

//   const fetchHealthStats = useCallback(async () => {
//     try {
//       const response = await api.get("/api/network_management/health-check/");
//       dispatch({ type: "SET_HEALTH_STATS", payload: response.data });
//     } catch (error) {
//       toast.error("Failed to fetch health stats");
//     }
//   }, []);

//   const fetchRouterStats = useCallback(async (routerId) => {
//     if (!routerId) return;
//     setStatsLoading(true);
//     try {
//       const response = await api.get(`/api/network_management/routers/${routerId}/stats/`);
//       dispatch({ type: "SET_STATS_DATA", payload: response.data });
//     } catch (error) {
//       toast.error("Failed to fetch router stats");
//     } finally {
//       setStatsLoading(false);
//     }
//   }, []);

//   const fetchEvents = useCallback(async () => {
//     try {
//       const response = await api.get("/api/payments/mpesa-callbacks/events/");
//       dispatch({ type: "SET_EVENTS", payload: response.data });
//     } catch (error) {
//       toast.error("Failed to fetch events");
//     }
//   }, []);

//   const fetchSecurityProfiles = useCallback(async () => {
//     try {
//       const response = await api.get("/api/payments/mpesa-callbacks/security-profiles/");
//       dispatch({ type: "SET_SECURITY_PROFILES", payload: response.data });
//     } catch (error) {
//       toast.error("Failed to fetch security profiles");
//     }
//   }, []);

//   const fetchCallbackConfigs = useCallback(async (routerId) => {
//     try {
//       const response = await api.get(`/api/network_management/routers/${routerId}/callback-configs/`);
//       dispatch({ type: "SET_CALLBACK_CONFIGS", payload: response.data });
//     } catch (error) {
//       toast.error("Failed to fetch callback configs");
//     }
//   }, []);

//   useEffect(() => {
//     fetchRouters();
//     fetchHealthStats();
//     fetchEvents();
//     fetchSecurityProfiles();
//     const interval = setInterval(() => {
//       fetchRouters();
//       fetchHealthStats();
//     }, 30000);
//     return () => clearInterval(interval);
//   }, [fetchRouters, fetchHealthStats, fetchEvents, fetchSecurityProfiles]);

//   useEffect(() => {
//     if (activeRouter) {
//       fetchHotspotUsers(activeRouter.id);
//       fetchPPPoEUsers(activeRouter.id);
//       fetchRouterStats(activeRouter.id);
//       fetchCallbackConfigs(activeRouter.id);
//       const interval = setInterval(() => {
//         const currentId = activeRouterRef.current?.id;
//         if (currentId) {
//           fetchHotspotUsers(currentId);
//           fetchPPPoEUsers(currentId);
//           fetchRouterStats(currentId);
//           fetchCallbackConfigs(currentId);
//         }
//       }, 10000);
//       return () => clearInterval(interval);
//     }
//   }, [activeRouter, fetchHotspotUsers, fetchPPPoEUsers, fetchRouterStats, fetchCallbackConfigs]);

//   const addRouter = async () => {
//     // Mark all required fields as touched to show errors
//     Object.keys(touchedFields).forEach(field => {
//       if (!touchedFields[field]) {
//         dispatch({ type: "SET_TOUCHED_FIELD", field });
//       }
//     });

//     if (!isFormValid) {
//       toast.warn("Please fix the errors below");
//       return;
//     }

//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.post("/api/network_management/routers/", routerForm);
//       dispatch({ type: "SET_ROUTERS", payload: [...routers, response.data] });
//       dispatch({ type: "SET_ACTIVE_ROUTER", payload: response.data });
//       dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" });
//       dispatch({ type: "RESET_ROUTER_FORM" });
//       toast.success("Router added successfully");
//     } catch (error) {
//       toast.error("Failed to add router");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const updateRouter = async (id) => {
//     if (!isFormValid) {
//       toast.warn("Please fix the errors below");
//       return;
//     }
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.put(`/api/network_management/routers/${id}/`, routerForm);
//       dispatch({ type: "UPDATE_ROUTER", payload: { id, data: response.data } });
//       dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" });
//       toast.success("Router updated successfully");
//     } catch (error) {
//       toast.error("Failed to update router");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const deleteRouter = async (id) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.delete(`/api/network_management/routers/${id}/`);
//       dispatch({ type: "DELETE_ROUTER", id });
//       toast.success("Router deleted successfully");
//     } catch (error) {
//       toast.error("Failed to delete router");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const connectToRouter = async (routerId) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.post("/api/network_management/routers/bulk-action/", { router_ids: [routerId], action: "connect" });
//       const updatedRouter = { ...routers.find((r) => r.id === routerId), status: "connected" };
//       dispatch({ type: "UPDATE_ROUTER", payload: { id: routerId, data: updatedRouter } });
//       if (activeRouter?.id === routerId) dispatch({ type: "SET_ACTIVE_ROUTER", payload: updatedRouter });
//       toast.success("Router connected");
//     } catch (error) {
//       toast.error("Failed to connect");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const disconnectRouter = async (routerId) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.post("/api/network_management/routers/bulk-action/", { router_ids: [routerId], action: "disconnect" });
//       const updatedRouter = { ...routers.find((r) => r.id === routerId), status: "disconnected" };
//       dispatch({ type: "UPDATE_ROUTER", payload: { id: routerId, data: updatedRouter } });
//       if (activeRouter?.id === routerId) dispatch({ type: "SET_ACTIVE_ROUTER", payload: updatedRouter });
//       toast.success("Router disconnected");
//     } catch (error) {
//       toast.error("Failed to disconnect");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const rebootRouter = async (routerId) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.post(`/api/network_management/routers/${routerId}/reboot/`);
//       const updatedRouter = { ...routers.find((r) => r.id === routerId), status: "updating" };
//       dispatch({ type: "UPDATE_ROUTER", payload: { id: routerId, data: updatedRouter } });
//       if (activeRouter?.id === routerId) dispatch({ type: "SET_ACTIVE_ROUTER", payload: updatedRouter });
//       toast.success("Router reboot initiated");
//     } catch (error) {
//       toast.error("Failed to reboot router");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const restoreSessions = async (routerId) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.post(`/api/network_management/routers/${routerId}/restore-sessions/`);
//       toast.success(response.data.message);
//       fetchHotspotUsers(routerId);
//       fetchPPPoEUsers(routerId);
//     } catch (error) {
//       toast.error("Failed to restore sessions");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const configureHotspot = async () => {
//     if (!hotspotForm.landingPage) {
//       toast.warn("Please upload the landing page");
//       return;
//     }
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const formData = new FormData();
//       Object.entries(hotspotForm).forEach(([key, value]) => {
//         if (key === "landingPage" && value) formData.append("landingPage", value);
//         else if (value) formData.append(key, value);
//       });
//       await api.post(`/api/network_management/routers/${activeRouter.id}/hotspot-config/`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       dispatch({ type: "TOGGLE_MODAL", modal: "hotspotConfig" });
//       toast.success("Hotspot configured successfully");
//     } catch (error) {
//       toast.error("Failed to configure hotspot");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const configurePPPoE = async () => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const formData = new FormData();
//       Object.entries(pppoeForm).forEach(([key, value]) => {
//         if (value) formData.append(key, value);
//       });
//       await api.post(`/api/network_management/routers/${activeRouter.id}/pppoe-config/`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       dispatch({ type: "TOGGLE_MODAL", modal: "pppoeConfig" });
//       toast.success("PPPoE configured successfully");
//     } catch (error) {
//       toast.error("Failed to configure PPPoE");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const disconnectHotspotUser = async (userId) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.delete(`/api/network_management/hotspot-users/${userId}/`);
//       dispatch({ type: "SET_HOTSPOT_USERS", payload: hotspotUsers.filter((u) => u.id !== userId) });
//       toast.success("Hotspot user disconnected");
//     } catch (error) {
//       toast.error("Failed to disconnect hotspot user");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const disconnectPPPoEUser = async (userId) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.delete(`/api/network_management/pppoe-users/${userId}/`);
//       dispatch({ type: "SET_PPPOE_USERS", payload: pppoeUsers.filter((u) => u.id !== userId) });
//       toast.success("PPPoE user disconnected");
//     } catch (error) {
//       toast.error("Failed to disconnect PPPoE user");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const activateUserOnRouter = async (routerId, mac, planId, clientId) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.post(`/api/network_management/routers/${routerId}/activate-user/`, {
//         mac,
//         plan_id: planId,
//         client_id: clientId,
//       });
//       toast.success("User activated on router");
//       fetchHotspotUsers(routerId);
//       fetchPPPoEUsers(routerId);
//     } catch (error) {
//       toast.error("Failed to activate user");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const viewUserSessionHistory = async (user) => {
//     dispatch({ type: "SET_SELECTED_USER", payload: user });
//     await fetchSessionHistory(user.id);
//     dispatch({ type: "TOGGLE_MODAL", modal: "sessionHistory" });
//   };

//   const addCallbackConfig = async () => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.post(`/api/network_management/routers/${activeRouter.id}/callback-configs/`, callbackForm);
//       dispatch({ type: "SET_CALLBACK_CONFIGS", payload: [...callbackConfigs, response.data] });
//       dispatch({ type: "TOGGLE_MODAL", modal: "callbackConfig" });
//       dispatch({ type: "RESET_CALLBACK_FORM" });
//       toast.success("Callback config added");
//     } catch (error) {
//       toast.error("Failed to add callback config");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const updateCallbackConfig = async () => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.put(`/api/network_management/routers/${activeRouter.id}/callback-configs/${editingCallbackId}/`, callbackForm);
//       dispatch({ type: "SET_CALLBACK_CONFIGS", payload: callbackConfigs.map((cb) => (cb.id === editingCallbackId ? response.data : cb)) });
//       dispatch({ type: "TOGGLE_MODAL", modal: "callbackConfig" });
//       dispatch({ type: "RESET_CALLBACK_FORM" });
//       toast.success("Callback config updated");
//     } catch (error) {
//       toast.error("Failed to update callback config");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const deleteCallbackConfig = async (id) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.delete(`/api/network_management/routers/${activeRouter.id}/callback-configs/${id}/`);
//       dispatch({ type: "SET_CALLBACK_CONFIGS", payload: callbackConfigs.filter((cb) => cb.id !== id) });
//       toast.success("Callback config deleted");
//     } catch (error) {
//       toast.error("Failed to delete callback config");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const toggleCallbackStatus = async (callback) => {
//     try {
//       const updatedCallback = { ...callback, is_active: !callback.is_active };
//       const response = await api.put(`/api/network_management/routers/${activeRouter.id}/callback-configs/${callback.id}/`, updatedCallback);
//       dispatch({ type: "SET_CALLBACK_CONFIGS", payload: callbackConfigs.map((cb) => (cb.id === callback.id ? response.data : cb)) });
//       toast.success(`Callback ${updatedCallback.is_active ? "enabled" : "disabled"} successfully!`);
//     } catch (error) {
//       console.error("Error toggling callback status:", error);
//       toast.error("Failed to update callback status");
//     }
//   };

//   const editCallbackConfig = (callback) => {
//     dispatch({ type: "UPDATE_CALLBACK_FORM", payload: callback });
//     dispatch({ type: "SET_EDITING_CALLBACK_ID", payload: callback.id });
//     dispatch({ type: "TOGGLE_MODAL", modal: "callbackConfig" });
//   };

//   const testCallback = (callback) => {
//     dispatch({ type: "UPDATE_TEST_CONFIG", payload: { configuration_id: callback.id, test_payload: "{}" } });
//     dispatch({ type: "SET_SHOW_TEST_MODAL", payload: true });
//   };

//   const runTest = async () => {
//     try {
//       dispatch({ type: "SET_LOADING", payload: true });
//       const payload = {
//         configuration_id: testConfig.configuration_id,
//         test_payload: JSON.parse(testConfig.test_payload),
//         validate_security: true,
//       };
//       const response = await api.post("/api/payments/mpesa-callbacks/test/", payload);
//       if (response.data.success) {
//         toast.success("Test completed successfully!");
//       } else {
//         toast.error(`Test failed: ${response.data.message}`);
//       }
//       dispatch({ type: "SET_SHOW_TEST_MODAL", payload: false });
//     } catch (error) {
//       console.error("Error testing callback:", error);
//       toast.error("Failed to run test");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   return (
//     <div className={`
//       min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-300
//       ${theme === 'dark' 
//         ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900' 
//         : 'bg-gradient-to-br from-white to-indigo-50'
//       }
//     `}>
//       <ToastContainer 
//         position="top-right" 
//         autoClose={3000} 
//         theme={theme} 
//         pauseOnHover 
//         newestOnTop 
//       />

//       {/* COMPACT HEADER - Buttons horizontal on sm+ */}
//       <header className={`
//         max-w-6xl mx-auto mb-8 p-4 rounded-2xl shadow-xl backdrop-blur-md
//         ${theme === 'dark' 
//           ? 'bg-gray-800/80 border border-gray-700/50' 
//           : 'bg-white/90 border border-gray-200/50'
//         }
//       `}>
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//           <div className="flex items-center space-x-4 flex-1 min-w-0">
//             <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg flex-shrink-0">
//               <Server className="w-6 h-6" />
//             </div>
//             <div className="min-w-0 flex-1">
//               <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 truncate">
//                 Router Management
//               </h1>
//               <p className={`mt-1 text-sm sm:text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} truncate`}>
//                 {routers.length} routers • {routers.filter((r) => r.status === "connected").length} online
//               </p>
//             </div>
//           </div>
          
//           {/* Buttons horizontal on sm+ */}
//           <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
//             <CompactAddRouterButton
//               onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" })}
//               theme={theme}
//               isLoading={isLoading}
//             />
//             <Button
//               onClick={fetchHealthStats}
//               label="Health Check"
//               icon={<Activity />}
//               theme={theme}
//               color="green"
//               className="min-h-[44px] w-full sm:w-auto"
//             />
//           </div>
//         </div>
//       </header>

//       <div className="max-w-6xl mx-auto">
//         {/* Stats Section */}
//         <section className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           <StatsCard title="Total Routers" value={routers.length} icon={<Server className="w-5 h-5" />} color="bg-indigo-500" theme={theme} />
//           <StatsCard title="Online Routers" value={routers.filter((r) => r.status === "connected").length} icon={<Wifi className="w-5 h-5" />} color="bg-green-500" theme={theme} />
//           <StatsCard title="Active Users" value={hotspotUsers.filter((u) => u.active).length + pppoeUsers.filter((u) => u.active).length} icon={<Users className="w-5 h-5" />} color="bg-blue-500" theme={theme} />
//           <StatsCard title="Data Used" value={formatBytes(hotspotUsers.reduce((sum, user) => sum + user.data_used, 0) + pppoeUsers.reduce((sum, user) => sum + user.data_used, 0)).split(" ")[0]} unit={` ${formatBytes(hotspotUsers.reduce((sum, user) => sum + user.data_used, 0) + pppoeUsers.reduce((sum, user) => sum + user.data_used, 0)).split(" ")[1]}`} icon={<Download className="w-5 h-5" />} color="bg-purple-500" theme={theme} />
//         </section>

//         {/* Routers List Section */}
//         <section className={`mb-8 p-6 rounded-2xl shadow-xl backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 ${
//           theme === 'dark' ? 'bg-gray-800/70' : 'bg-white/90'
//         }`}>
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
//             <h2 className="text-xl font-semibold flex items-center text-indigo-600">
//               <Wifi className="w-6 h-6 mr-3" /> Routers
//             </h2>
//             <Button
//               onClick={fetchRouters}
//               icon={<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />}
//               theme={theme}
//               compact
//             />
//           </div>
//           {isLoading ? (
//             <div className="flex justify-center py-8">
//               <ThreeDots color="#6366F1" height={50} width={50} />
//             </div>
//           ) : routers.length === 0 ? (
//             <div className="text-center py-12">
//               <Server className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//               <p className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
//                 No Routers Found
//               </p>
//               <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
//                 Get started by adding your first router to manage your network.
//               </p>
//               <div className="flex justify-center">
//                 <Button
//                   onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" })}
//                   label="Add Your First Router"
//                   icon={<Plus />}
//                   theme={theme}
//                   fullWidth
//                   className="max-w-xs"
//                 />
//               </div>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//               {routers.map((router) => (
//                 <motion.div
//                   key={router.id}
//                   onClick={() => dispatch({ type: "SET_ACTIVE_ROUTER", payload: router })}
//                   whileHover={{ scale: 1.03 }}
//                   className={`p-6 rounded-xl cursor-pointer border-2 transition-all duration-300 backdrop-blur-md shadow-md hover:shadow-xl ${
//                     activeRouter?.id === router.id 
//                       ? "border-indigo-500 ring-2 ring-indigo-500/20"
//                       : theme === 'dark' 
//                         ? "border-gray-700 hover:border-gray-600" 
//                         : "border-gray-200 hover:border-gray-300"
//                   } ${theme === 'dark' ? 'bg-gray-800/50 hover:bg-gray-800/70' : 'bg-white/70 hover:bg-white/90'}`}
//                 >
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center space-x-3">
//                       {getRouterStatusIcon(router.status)}
//                       <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRouterStatusColor(router.status, theme)}`}>
//                         {router.status.charAt(0).toUpperCase() + router.status.slice(1)}
//                       </span>
//                       {router.is_default && (
//                         <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-600 font-medium">Default</span>
//                       )}
//                     </div>
//                     {router.captive_portal_enabled && <Globe className="w-5 h-5 text-green-500" />}
//                   </div>
//                   <div className="mb-4">
//                     <p className={`font-semibold text-lg truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                       {router.name}
//                     </p>
//                     <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
//                       {router.type} • {router.ip}:{router.port}
//                     </p>
//                     {router.location && (
//                       <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
//                         <MapPin className="w-4 h-4 mr-2" />
//                         {router.location}
//                       </p>
//                     )}
//                   </div>

//                   <div className="lg:hidden">
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         toggleMobileDropdown(`router-${router.id}`);
//                       }}
//                       className={`w-full p-3 rounded-lg flex justify-between items-center transition-colors ${
//                         theme === 'dark' ? 'bg-gray-700/60 hover:bg-gray-700/80' : 'bg-gray-100 hover:bg-gray-200'
//                       }`}
//                       aria-label="Router actions"
//                     >
//                       <span className={theme === 'dark' ? 'text-white' : 'text-gray-700'}>Actions</span>
//                       <ChevronDown className={`w-4 h-4 transition-transform ${
//                         mobileDropdowns[`router-${router.id}`] ? 'rotate-180' : ''
//                       } ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
//                     </button>
                    
//                     <AnimatePresence>
//                       {mobileDropdowns[`router-${router.id}`] && (
//                         <motion.div 
//                           initial={{ opacity: 0, height: 0 }}
//                           animate={{ opacity: 1, height: "auto" }}
//                           exit={{ opacity: 0, height: 0 }}
//                           className={`mt-3 space-y-2 p-3 rounded-lg ${
//                             theme === 'dark' ? 'bg-gray-700/70' : 'bg-gray-100'
//                           }`}
//                         >
//                           <MobileActionButton
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" });
//                               dispatch({ type: "UPDATE_ROUTER_FORM", payload: router });
//                             }}
//                             icon={<Edit className="w-4 h-4" />}
//                             label="Edit"
//                             theme={theme}
//                           />
//                           <MobileActionButton
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               showConfirm("Delete Router", `Are you sure you want to delete "${router.name}"? This action cannot be undone.`, () => deleteRouter(router.id));
//                             }}
//                             icon={<Trash2 className="w-4 h-4" />}
//                             label="Delete"
//                             theme={theme}
//                           />
//                           <MobileActionButton
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               router.status === "connected" ? disconnectRouter(router.id) : connectToRouter(router.id);
//                             }}
//                             icon={router.status === "connected" ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
//                             label={router.status === "connected" ? "Disconnect" : "Connect"}
//                             theme={theme}
//                           />
//                         </motion.div>
//                       )}
//                     </AnimatePresence>
//                   </div>

//                   <div className="hidden lg:block">
//                     <AnimatePresence>
//                       {expandedRouter === router.id && (
//                         <motion.div 
//                           initial={{ opacity: 0, height: 0 }} 
//                           animate={{ opacity: 1, height: "auto" }} 
//                           exit={{ opacity: 0, height: 0 }}
//                           className="mt-4 space-y-2"
//                         >
//                           <div className="flex gap-2 flex-wrap">
//                             <Button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" });
//                                 dispatch({ type: "UPDATE_ROUTER_FORM", payload: router });
//                               }}
//                               label="Edit"
//                               icon={<Edit className="w-3 h-3" />}
//                               theme={theme}
//                               compact
//                             />
//                             <Button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 showConfirm("Delete Router", `Are you sure you want to delete "${router.name}"? This action cannot be undone.`, () => deleteRouter(router.id));
//                               }}
//                               label="Delete"
//                               icon={<Trash2 className="w-3 h-3" />}
//                               theme={theme}
//                               compact
//                               color="red"
//                             />
//                             <Button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 router.status === "connected" ? disconnectRouter(router.id) : connectToRouter(router.id);
//                               }}
//                               label={router.status === "connected" ? "Disconnect" : "Connect"}
//                               icon={router.status === "connected" ? <LogOut className="w-3 h-3" /> : <LogIn className="w-3 h-3" />}
//                               theme={theme}
//                               compact
//                               color={router.status === "connected" ? "red" : "green"}
//                             />
//                             <Button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 showConfirm("Reboot Router", `Rebooting "${router.name}" will temporarily disconnect all users. Proceed?`, () => rebootRouter(router.id));
//                               }}
//                               label="Reboot"
//                               icon={<RotateCcw className="w-3 h-3" />}
//                               theme={theme}
//                               compact
//                               color="yellow"
//                             />
//                           </div>
//                         </motion.div>
//                       )}
//                     </AnimatePresence>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         dispatch({ type: "TOGGLE_ROUTER_EXPANDED", id: router.id });
//                       }}
//                       className={`w-full mt-3 text-sm flex justify-center items-center gap-1 ${
//                         theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                       } hover:scale-105 transition-all`}
//                       aria-label={expandedRouter === router.id ? "Hide actions" : "Show actions"}
//                     >
//                       {expandedRouter === router.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//                       <span className="text-xs">{expandedRouter === router.id ? "Hide" : "Actions"}</span>
//                     </button>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//           )}
//         </section>

//         {activeRouter && (
//           <>
//             {/* Active Router Details Section */}
//             <section className={`mb-8 p-6 rounded-2xl shadow-xl backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 ${
//               theme === 'dark' ? 'bg-gray-800/70' : 'bg-white/90'
//             }`}>
//               <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-6">
//                 <div className="flex-1">
//                   <h2 className="text-xl font-semibold flex items-center mb-3 text-indigo-600">
//                     <Server className="w-6 h-6 mr-3" />
//                     {activeRouter.name} ({activeRouter.type})
//                   </h2>
//                   <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
//                     {activeRouter.ip}:{activeRouter.port} • {activeRouter.location || "No location set"}
//                   </p>
//                 </div>
//                 <div className="flex flex-wrap gap-3 min-w-0">
//                   <Button
//                     onClick={() => (activeRouter.status === "connected" ? disconnectRouter(activeRouter.id) : connectToRouter(activeRouter.id))}
//                     label={activeRouter.status === "connected" ? "Disconnect" : "Connect"}
//                     icon={activeRouter.status === "connected" ? <LogOut /> : <LogIn />}
//                     theme={theme}
//                     color={activeRouter.status === "connected" ? "red" : "green"}
//                   />
//                   <Button
//                     onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "hotspotConfig" })}
//                     label="Configure Hotspot"
//                     icon={<Wifi />}
//                     theme={theme}
//                     disabled={activeRouter.status !== "connected"}
//                   />
//                   <Button
//                     onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "pppoeConfig" })}
//                     label="Configure PPPoE"
//                     icon={<Cable />}
//                     theme={theme}
//                     disabled={activeRouter.status !== "connected"}
//                   />
//                   <Button
//                     onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "users" })}
//                     label="Users"
//                     icon={<Users />}
//                     theme={theme}
//                     disabled={activeRouter.status !== "connected"}
//                     color="teal"
//                   />
//                   <Button
//                     onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "callbackConfig" })}
//                     label="Callback Settings"
//                     icon={<Lock />}
//                     theme={theme}
//                     disabled={activeRouter.status !== "connected"}
//                     color="purple"
//                   />
//                   {activeRouter.status === "connected" && (
//                     <Button
//                       onClick={() => restoreSessions(activeRouter.id)}
//                       label="Restore Sessions"
//                       icon={<RotateCcw />}
//                       theme={theme}
//                       color="blue"
//                     />
//                   )}
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
//                 {statsLoading ? (
//                   <div className="col-span-full flex justify-center py-8">
//                     <ThreeDots color="#6366F1" height={40} width={40} />
//                   </div>
//                 ) : statsData.latest && Object.keys(statsData.latest).length > 0 ? (
//                   <>
//                     <StatsCard title="CPU Usage" value={statsData.latest.cpu} unit="%" icon={<Activity className="w-6 h-6" />} color="bg-red-500" theme={theme} />
//                     <StatsCard title="Memory Usage" value={statsData.latest.memory.toFixed(1)} unit="MB" icon={<Server className="w-6 h-6" />} color="bg-blue-500" theme={theme} />
//                     <StatsCard title="Connected Clients" value={statsData.latest.clients} icon={<Users className="w-6 h-6" />} color="bg-green-500" theme={theme} />
//                     <StatsCard
//                       title="Data Throughput"
//                       value={statsData.latest.throughput.toFixed(1)}
//                       unit="MB/s"
//                       icon={<Download className="w-6 h-6" />}
//                       color="bg-purple-500"
//                       theme={theme}
//                     />
//                   </>
//                 ) : (
//                   <div className={`col-span-full text-center py-8 rounded-xl p-8 ${
//                     theme === 'dark' ? 'bg-gray-800/40 text-gray-400' : 'bg-gray-50/80 text-gray-500'
//                   }`}>
//                     No stats available. Connect the router to fetch data.
//                   </div>
//                 )}
//               </div>

//               <div className={`p-6 rounded-xl backdrop-blur-md border border-gray-200/30 dark:border-gray-700/30 ${
//                 theme === 'dark' ? 'bg-gray-800/40' : 'bg-gray-50/80'
//               }`}>
//                 <h3 className="text-lg font-semibold mb-4 flex items-center text-indigo-600">
//                   <Globe className="w-5 h-5 mr-3" /> Connection Status
//                 </h3>
//                 {activeRouter.status === "connected" ? (
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
//                     <div className="text-center md:text-left">
//                       <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Active Users</p>
//                       <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                         {hotspotUsers.filter((u) => u.active).length + pppoeUsers.filter((u) => u.active).length}
//                       </p>
//                     </div>
//                     <div className="text-center md:text-left">
//                       <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Total Users</p>
//                       <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                         {hotspotUsers.length + pppoeUsers.length}
//                       </p>
//                     </div>
//                     <div className="text-center md:text-left">
//                       <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Data Used</p>
//                       <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                         {formatBytes(hotspotUsers.reduce((sum, user) => sum + user.data_used, 0) + pppoeUsers.reduce((sum, user) => sum + user.data_used, 0))}
//                       </p>
//                     </div>
//                     <div className="text-center md:text-left">
//                       <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Last Updated</p>
//                       <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                         {timeSince(activeRouter.last_seen)}
//                       </p>
//                     </div>
//                   </div>
//                 ) : (
//                   <p className={`text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
//                     Router must be connected to manage connections
//                   </p>
//                 )}
//               </div>
//             </section>

//             {/* Health Status Section */}
//             <section className={`mb-8 p-6 rounded-2xl shadow-xl backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 ${
//               theme === 'dark' ? 'bg-gray-800/70' : 'bg-white/90'
//             }`}>
//               <h3 className="text-lg font-semibold mb-6 flex items-center text-indigo-600">
//                 <Activity className="w-5 h-5 mr-3" /> Router Health Status
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {healthStats
//                   .filter((stat) => stat.router === activeRouter.id)
//                   .map((stat, index) => (
//                     <motion.div 
//                       key={index} 
//                       whileHover={{ scale: 1.02 }}
//                       className={`p-4 rounded-xl backdrop-blur-md transition-all ${
//                         theme === 'dark' ? 'bg-gray-800/40 hover:bg-gray-800/60' : 'bg-gray-50/80 hover:bg-gray-100'
//                       }`}
//                     >
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Last Check</p>
//                           <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
//                             {timeSince(stat.timestamp)}
//                           </p>
//                         </div>
//                         <HealthIndicator status={stat.status} responseTime={stat.response_time} theme={theme} />
//                       </div>
//                       {stat.error && <p className="text-sm text-red-500 mt-2">{stat.error}</p>}
//                     </motion.div>
//                   )) || <div className={`col-span-full text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No health data</div>}
//               </div>
//             </section>

//             {/* Callback Configurations Section */}
//             <section className={`mb-8 p-6 rounded-2xl shadow-xl backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 ${
//               theme === 'dark' ? 'bg-gray-800/70' : 'bg-white/90'
//             }`}>
//               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
//                 <h2 className="text-xl font-semibold flex items-center text-indigo-600">
//                   <Lock className="w-5 h-5 mr-3" /> M-Pesa Callback Configurations
//                 </h2>
//                 <Button
//                   onClick={() => {
//                     dispatch({ type: "RESET_CALLBACK_FORM" });
//                     dispatch({ type: "TOGGLE_MODAL", modal: "callbackConfig" });
//                   }}
//                   label="Add Callback"
//                   icon={<Plus />}
//                   theme={theme}
//                 />
//               </div>
//               {callbackConfigs.length === 0 ? (
//                 <div className="text-center py-8">
//                   <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                   <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
//                     No callback configurations found
//                   </p>
//                   <Button
//                     onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "callbackConfig" })}
//                     label="Create First Config"
//                     icon={<Plus />}
//                     theme={theme}
//                     className="mt-4"
//                   />
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto rounded-xl border border-gray-200/30 dark:border-gray-700/30">
//                   <table className={`w-full table-auto ${
//                     theme === 'dark' ? 'text-white' : 'text-gray-900'
//                   }`}>
//                     <thead>
//                       <tr className={`${theme === 'dark' ? 'bg-gray-800/80' : 'bg-gray-100'} sticky top-0 z-10`}>
//                         <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Event</th>
//                         <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">URL</th>
//                         <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Security</th>
//                         <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Status</th>
//                         <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody className={`divide-y ${
//                       theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
//                     }`}>
//                       {callbackConfigs.map((callback) => (
//                         <motion.tr 
//                           key={callback.id} 
//                           whileHover={{ backgroundColor: theme === 'dark' ? 'rgb(55 65 81 / 0.4)' : 'rgb(248 250 252 / 0.8)' }}
//                           className="transition-colors"
//                         >
//                           <td className="px-6 py-4">{callback.event_details?.name || callback.event}</td>
//                           <td className="px-6 py-4">
//                             <a href={callback.callback_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 break-all underline">
//                               {callback.callback_url}
//                             </a>
//                           </td>
//                           <td className="px-6 py-4">{getSecurityLevelBadge(callback.security_level, theme)}</td>
//                           <td className="px-6 py-4">
//                             <button
//                               onClick={() => toggleCallbackStatus(callback)}
//                               className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
//                                 callback.is_active 
//                                   ? theme === 'dark' 
//                                     ? "bg-green-900 text-green-300 hover:bg-green-800" 
//                                     : "bg-green-100 text-green-800 hover:bg-green-200"
//                                   : theme === 'dark'
//                                     ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
//                                     : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//                               }`}
//                             >
//                               {callback.is_active ? "Active" : "Inactive"}
//                             </button>
//                           </td>
//                           <td className="px-6 py-4">
//                             <div className="flex space-x-3">
//                               <button
//                                 onClick={() => testCallback(callback)}
//                                 className={`p-2 rounded-lg transition-colors ${
//                                   theme === 'dark' 
//                                     ? "text-blue-400 hover:text-blue-300 hover:bg-gray-700" 
//                                     : "text-blue-600 hover:text-blue-800 hover:bg-gray-100"
//                                 }`}
//                                 title="Test Callback"
//                                 aria-label="Test callback"
//                               >
//                                 <Activity className="w-4 h-4" />
//                               </button>
//                               <button
//                                 onClick={() => editCallbackConfig(callback)}
//                                 className={`p-2 rounded-lg transition-colors ${
//                                   theme === 'dark' 
//                                     ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700" 
//                                     : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
//                                 }`}
//                                 title="Edit"
//                                 aria-label="Edit config"
//                               >
//                                 <Edit className="w-4 h-4" />
//                               </button>
//                               <button
//                                 onClick={() => showConfirm("Delete Callback", "Are you sure you want to delete this callback configuration? This action cannot be undone.", () => deleteCallbackConfig(callback.id))}
//                                 className={`p-2 rounded-lg transition-colors ${
//                                   theme === 'dark' 
//                                     ? "text-red-400 hover:text-red-300 hover:bg-gray-700" 
//                                     : "text-red-600 hover:text-red-800 hover:bg-gray-100"
//                                 }`}
//                                 title="Delete"
//                                 aria-label="Delete config"
//                               >
//                                 <Trash2 className="w-4 h-4" />
//                               </button>
//                             </div>
//                           </td>
//                         </motion.tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </section>
//           </>
//         )}

//         {/* Confirmation Modal */}
//         <ConfirmationModal
//           isOpen={confirmModal.show}
//           title={confirmModal.title}
//           message={confirmModal.message}
//           onConfirm={handleConfirm}
//           onCancel={hideConfirm}
//           theme={theme}
//         />

//         {/* All Modals */}
//         <Modal 
//           isOpen={modals.healthStats} 
//           title="System Health Status" 
//           onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "healthStats" })} 
//           size="lg" 
//           theme={theme}
//         >
//           <div className="space-y-4">
//             {healthStats.length === 0 ? (
//               <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No health data available</p>
//             ) : (
//               <div className={`overflow-y-auto max-h-96 rounded-lg ${
//                 theme === 'dark' ? 'text-white' : 'text-gray-900'
//               }`}>
//                 {healthStats.map((stat, index) => (
//                   <div key={index} className={`border-b p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stat.router_name}</p>
//                         <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{stat.router_ip}</p>
//                       </div>
//                       <HealthIndicator status={stat.status} responseTime={stat.response_time} theme={theme} />
//                     </div>
//                     {stat.error && <p className="text-sm text-red-500 mt-2">{stat.error}</p>}
//                     <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
//                       Last checked: {new Date(stat.timestamp).toLocaleString()}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </Modal>

//         {/* Enhanced Add Router Modal */}
//         <Modal 
//           isOpen={modals.addRouter} 
//           title="Add Router" 
//           onClose={() => {
//             dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" });
//             dispatch({ type: "RESET_ROUTER_FORM" });
//           }} 
//           theme={theme}
//         >
//           <div className="space-y-6">
//             {Object.keys(getFormErrors).length > 0 && (
//               <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
//                 <p className={`text-sm font-medium ${theme === 'dark' ? 'text-red-300' : 'text-red-700'} mb-2`}>
//                   Please fix the following errors:
//                 </p>
//                 <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
//                   {Object.values(getFormErrors).map((error, i) => (
//                     <li key={i}>• {error}</li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <InputField
//                 label="Name"
//                 value={routerForm.name}
//                 onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { name: e.target.value } })}
//                 onBlur={() => handleFieldBlur('name')}
//                 placeholder="Office Router"
//                 icon={<User className="w-4 h-4" />}
//                 required
//                 theme={theme}
//                 error={getFormErrors.name}
//                 touched={touchedFields.name}
//               />
//               <InputField
//                 label="IP Address"
//                 value={routerForm.ip}
//                 onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { ip: e.target.value } })}
//                 onBlur={() => handleFieldBlur('ip')}
//                 placeholder="192.168.88.1"
//                 icon={<Globe className="w-4 h-4" />}
//                 required
//                 theme={theme}
//                 error={getFormErrors.ip}
//                 touched={touchedFields.ip}
//               />
              
//               <div>
//                 <label className={`
//                   block text-sm mb-2 font-medium 
//                   ${theme === 'dark' ? 'text-white' : 'text-gray-700'}
//                 `}>
//                   Type <span className="text-red-600">*</span>
//                 </label>
//                 <div className="relative">
//                   <select
//                     value={routerForm.type}
//                     onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { type: e.target.value } })}
//                     onBlur={() => handleFieldBlur('type')}
//                     className={`
//                       w-full pl-10 pr-4 py-3 rounded-xl border-2 backdrop-blur-md transition-colors duration-300
//                       ${theme === 'dark' 
//                         ? 'bg-gray-800 text-white border-gray-700' 
//                         : 'bg-white text-gray-900 border-gray-300'
//                       }
//                       focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
//                       ${touchedFields.type && getFormErrors.type 
//                         ? 'border-red-500 ring-red-500/20 bg-red-50/20 dark:bg-red-900/10' 
//                         : ''
//                       }
//                     `}
//                     aria-invalid={!!getFormErrors.type}
//                   >
//                     {routerTypes.map((type) => (
//                       <option key={type.value} value={type.value}>
//                         {type.label}
//                       </option>
//                     ))}
//                   </select>
//                   <Router className={`
//                     absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4
//                     ${touchedFields.type && getFormErrors.type ? 'text-red-500' : 'text-gray-500'}
//                   `} />
//                 </div>
//                 {touchedFields.type && getFormErrors.type && (
//                   <p className="text-xs text-red-600 dark:text-red-400 mt-1">{getFormErrors.type}</p>
//                 )}
//               </div>

//               <InputField
//                 label="Port"
//                 type="number"
//                 value={routerForm.port}
//                 onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { port: e.target.value } })}
//                 onBlur={() => handleFieldBlur('port')}
//                 placeholder="8728"
//                 icon={<Hash className="w-4 h-4" />}
//                 required
//                 theme={theme}
//                 error={getFormErrors.port}
//                 touched={touchedFields.port}
//               />

//               <InputField
//                 label="Username"
//                 value={routerForm.username}
//                 onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { username: e.target.value } })}
//                 placeholder="admin"
//                 icon={<User className="w-4 h-4" />}
//                 theme={theme}
//               />
//               <InputField
//                 label="Password"
//                 type="password"
//                 value={routerForm.password}
//                 onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { password: e.target.value } })}
//                 placeholder="••••••••"
//                 icon={<Key className="w-4 h-4" />}
//                 theme={theme}
//               />
//             </div>

//             <InputField
//               label="Location"
//               value={routerForm.location}
//               onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { location: e.target.value } })}
//               placeholder="Main Office"
//               icon={<MapPin className="w-4 h-4" />}
//               theme={theme}
//               className="md:col-span-2"
//             />

//             <div className="space-y-4 md:col-span-2">
//               <CheckboxField
//                 label="Set as default router"
//                 checked={routerForm.is_default}
//                 onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { is_default: e.target.checked } })}
//                 theme={theme}
//               />
//               <CheckboxField
//                 label="Enable captive portal"
//                 checked={routerForm.captive_portal_enabled}
//                 onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { captive_portal_enabled: e.target.checked } })}
//                 theme={theme}
//               />
//             </div>

//             <Button
//               onClick={addRouter}
//               label={isLoading ? "Adding..." : "Add Router"}
//               icon={isLoading ? <ThreeDots color="#fff" height={20} width={40} /> : <Plus />}
//               theme={theme}
//               disabled={isLoading || !isFormValid}
//               fullWidth
//               className="md:col-span-2"
//             />
//           </div>
//         </Modal>

//         {/* Edit Router Modal */}
//         <Modal 
//           isOpen={modals.editRouter} 
//           title="Edit Router" 
//           onClose={() => {
//             dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" });
//             dispatch({ type: "RESET_ROUTER_FORM" });
//           }} 
//           theme={theme}
//         >
//           <div className="space-y-6">
//             {Object.keys(getFormErrors).length > 0 && (
//               <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
//                 <p className={`text-sm font-medium ${theme === 'dark' ? 'text-red-300' : 'text-red-700'} mb-2`}>
//                   Please fix the following errors:
//                 </p>
//                 <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
//                   {Object.values(getFormErrors).map((error, i) => (
//                     <li key={i}>• {error}</li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <InputField
//                 label="Name"
//                 value={routerForm.name}
//                 onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { name: e.target.value } })}
//                 onBlur={() => handleFieldBlur('name')}
//                 placeholder="Office Router"
//                 icon={<User className="w-4 h-4" />}
//                 required
//                 theme={theme}
//                 error={getFormErrors.name}
//                 touched={touchedFields.name}
//               />
//               <InputField
//                 label="IP Address"
//                 value={routerForm.ip}
//                 onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { ip: e.target.value } })}
//                 onBlur={() => handleFieldBlur('ip')}
//                 placeholder="192.168.88.1"
//                 icon={<Globe className="w-4 h-4" />}
//                 required
//                 theme={theme}
//                 error={getFormErrors.ip}
//                 touched={touchedFields.ip}
//               />
              
//               <div>
//                 <label className={`
//                   block text-sm mb-2 font-medium 
//                   ${theme === 'dark' ? 'text-white' : 'text-gray-700'}
//                 `}>
//                   Type <span className="text-red-600">*</span>
//                 </label>
//                 <div className="relative">
//                   <select
//                     value={routerForm.type}
//                     onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { type: e.target.value } })}
//                     onBlur={() => handleFieldBlur('type')}
//                     className={`
//                       w-full pl-10 pr-4 py-3 rounded-xl border-2 backdrop-blur-md transition-colors duration-300
//                       ${theme === 'dark' 
//                         ? 'bg-gray-800 text-white border-gray-700' 
//                         : 'bg-white text-gray-900 border-gray-300'
//                       }
//                       focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
//                       ${touchedFields.type && getFormErrors.type 
//                         ? 'border-red-500 ring-red-500/20 bg-red-50/20 dark:bg-red-900/10' 
//                         : ''
//                       }
//                     `}
//                     aria-invalid={!!getFormErrors.type}
//                   >
//                     {routerTypes.map((type) => (
//                       <option key={type.value} value={type.value}>
//                         {type.label}
//                       </option>
//                     ))}
//                   </select>
//                   <Router className={`
//                     absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4
//                     ${touchedFields.type && getFormErrors.type ? 'text-red-500' : 'text-gray-500'}
//                   `} />
//                 </div>
//                 {touchedFields.type && getFormErrors.type && (
//                   <p className="text-xs text-red-600 dark:text-red-400 mt-1">{getFormErrors.type}</p>
//                 )}
//               </div>

//               <InputField
//                 label="Port"
//                 type="number"
//                 value={routerForm.port}
//                 onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { port: e.target.value } })}
//                 onBlur={() => handleFieldBlur('port')}
//                 placeholder="8728"
//                 icon={<Hash className="w-4 h-4" />}
//                 required
//                 theme={theme}
//                 error={getFormErrors.port}
//                 touched={touchedFields.port}
//               />

//               <InputField
//                 label="Username"
//                 value={routerForm.username}
//                 onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { username: e.target.value } })}
//                 placeholder="admin"
//                 icon={<User className="w-4 h-4" />}
//                 theme={theme}
//               />
//               <InputField
//                 label="Password"
//                 type="password"
//                 value={routerForm.password}
//                 onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { password: e.target.value } })}
//                 placeholder="••••••••"
//                 icon={<Key className="w-4 h-4" />}
//                 theme={theme}
//               />
//             </div>

//             <InputField
//               label="Location"
//               value={routerForm.location}
//               onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { location: e.target.value } })}
//               placeholder="Main Office"
//               icon={<MapPin className="w-4 h-4" />}
//               theme={theme}
//               className="md:col-span-2"
//             />

//             <div className="space-y-4 md:col-span-2">
//               <CheckboxField
//                 label="Set as default router"
//                 checked={routerForm.is_default}
//                 onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { is_default: e.target.checked } })}
//                 theme={theme}
//               />
//               <CheckboxField
//                 label="Enable captive portal"
//                 checked={routerForm.captive_portal_enabled}
//                 onChange={(e) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { captive_portal_enabled: e.target.checked } })}
//                 theme={theme}
//               />
//             </div>

//             <div className="flex gap-3 md:col-span-2">
//               <Button
//                 onClick={() => updateRouter(activeRouter.id)}
//                 label={isLoading ? "Saving..." : "Save Changes"}
//                 icon={isLoading ? <ThreeDots color="#fff" height={20} width={40} /> : <CheckCircle />}
//                 theme={theme}
//                 disabled={isLoading || !isFormValid}
//                 fullWidth
//               />
//               <Button
//                 onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" })}
//                 label="Cancel"
//                 icon={<X />}
//                 theme={theme}
//                 color="gray"
//                 fullWidth
//               />
//             </div>
//           </div>
//         </Modal>

//         {/* Hotspot Config Modal */}
//         <Modal 
//           isOpen={modals.hotspotConfig} 
//           title="Configure Hotspot" 
//           onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "hotspotConfig" })} 
//           theme={theme}
//         >
//           <div className="space-y-6">
//             <InputField
//               label="SSID"
//               value={hotspotForm.ssid}
//               onChange={(e) => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: { ssid: e.target.value } })}
//               placeholder="SurfZone-WiFi"
//               icon={<Wifi className="w-4 h-4" />}
//               required
//               theme={theme}
//             />
//             <InputField
//               label="Redirect URL"
//               value={hotspotForm.redirectUrl}
//               onChange={(e) => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: { redirectUrl: e.target.value } })}
//               placeholder="http://captive.surfzone.local"
//               icon={<Globe className="w-4 h-4" />}
//               required
//               theme={theme}
//             />
//             <InputField
//               label="Bandwidth Limit"
//               value={hotspotForm.bandwidthLimit}
//               onChange={(e) => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: { bandwidthLimit: e.target.value } })}
//               placeholder="10M"
//               icon={<Zap className="w-4 h-4" />}
//               theme={theme}
//             />
//             <InputField
//               label="Session Timeout (min)"
//               type="number"
//               value={hotspotForm.sessionTimeout}
//               onChange={(e) => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: { sessionTimeout: e.target.value } })}
//               placeholder="60"
//               icon={<Clock className="w-4 h-4" />}
//               theme={theme}
//             />
//             <div>
//               <label className={`block text-sm mb-2 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Landing Page (App.js)</label>
//               <input
//                 type="file"
//                 accept=".js"
//                 onChange={(e) => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: { landingPage: e.target.files[0] } })}
//                 className={`w-full p-3 rounded-xl border-2 backdrop-blur-md transition-colors duration-300 ${
//                   theme === 'dark' 
//                     ? 'bg-gray-800/60 border-gray-700 text-white' 
//                     : 'bg-white/80 border-gray-300 text-gray-900'
//                 }`}
//               />
//             </div>
//             <Button
//               onClick={configureHotspot}
//               label={isLoading ? "Configuring..." : "Setup Hotspot"}
//               icon={isLoading ? <ThreeDots color="#fff" height={20} width={40} /> : <Upload />}
//               theme={theme}
//               disabled={isLoading || !hotspotForm.landingPage}
//               fullWidth
//             />
//           </div>
//         </Modal>

//         {/* PPPoE Config Modal */}
//         <Modal 
//           isOpen={modals.pppoeConfig} 
//           title="Configure PPPoE" 
//           onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "pppoeConfig" })} 
//           theme={theme}
//         >
//           <div className="space-y-6">
//             <InputField
//               label="IP Pool"
//               value={pppoeForm.ipPool}
//               onChange={(e) => dispatch({ type: "UPDATE_PPPOE_FORM", payload: { ipPool: e.target.value } })}
//               placeholder="pppoe-pool-1"
//               icon={<Network className="w-4 h-4" />}
//               required
//               theme={theme}
//             />
//             <InputField
//               label="Service Name"
//               value={pppoeForm.serviceName}
//               onChange={(e) => dispatch({ type: "UPDATE_PPPOE_FORM", payload: { serviceName: e.target.value } })}
//               placeholder=""
//               icon={<Globe className="w-4 h-4" />}
//               theme={theme}
//             />
//             <InputField
//               label="MTU"
//               type="number"
//               value={pppoeForm.mtu}
//               onChange={(e) => dispatch({ type: "UPDATE_PPPOE_FORM", payload: { mtu: e.target.value } })}
//               placeholder="1492"
//               icon={<Gauge className="w-4 h-4" />}
//               required
//               theme={theme}
//             />
//             <InputField
//               label="DNS Servers"
//               value={pppoeForm.dnsServers}
//               onChange={(e) => dispatch({ type: "UPDATE_PPPOE_FORM", payload: { dnsServers: e.target.value } })}
//               placeholder="8.8.8.8,1.1.1.1"
//               icon={<Globe className="w-4 h-4" />}
//               required
//               theme={theme}
//             />
//             <InputField
//               label="Bandwidth Limit"
//               value={pppoeForm.bandwidthLimit}
//               onChange={(e) => dispatch({ type: "UPDATE_PPPOE_FORM", payload: { bandwidthLimit: e.target.value } })}
//               placeholder="10M"
//               icon={<Zap className="w-4 h-4" />}
//               theme={theme}
//             />
//             <Button
//               onClick={configurePPPoE}
//               label={isLoading ? "Configuring..." : "Setup PPPoE"}
//               icon={isLoading ? <ThreeDots color="#fff" height={20} width={40} /> : <Upload />}
//               theme={theme}
//               disabled={isLoading}
//               fullWidth
//             />
//           </div>
//         </Modal>

//         {/* Users Modal */}
//         <Modal 
//           isOpen={modals.users} 
//           title="Users" 
//           onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "users" })} 
//           size="lg" 
//           theme={theme}
//         >
//           <div className="space-y-6">
//             <h3 className="text-lg font-semibold">Hotspot Users</h3>
//             {hotspotUsers.length === 0 ? (
//               <div className="text-center py-8">
//                 <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                 <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No active hotspot users</p>
//               </div>
//             ) : (
//               <div className="overflow-x-auto rounded-xl border border-gray-200/30 dark:border-gray-700/30">
//                 <table className={`min-w-full divide-y ${
//                   theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
//                 }`}>
//                   <thead className={theme === 'dark' ? 'bg-gray-800/80' : 'bg-gray-100'}>
//                     <tr>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Client</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Plan</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">MAC</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Remaining Time</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Data Used</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Status</th>
//                       <th className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className={`divide-y ${
//                     theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
//                   }`}>
//                     {hotspotUsers.map((user) => (
//                       <tr key={user.id} className={theme === 'dark' ? 'hover:bg-gray-800/40' : 'hover:bg-gray-50'}>
//                         <td className="px-6 py-4">
//                           <div className="flex items-center space-x-3">
//                             <Users className="w-4 h-4 text-gray-400" />
//                             <div>
//                               <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                                 {user.client?.user?.username || "Unknown"}
//                               </p>
//                               <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
//                                 {user.client?.user?.phone_number || "N/A"}
//                               </p>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">{user.plan?.name || "N/A"}</td>
//                         <td className="px-6 py-4 font-mono text-sm">{user.mac}</td>
//                         <td className="px-6 py-4">
//                           <div className="flex items-center">
//                             <Clock className="w-4 h-4 mr-2 text-blue-500" />
//                             {formatTime(user.remaining_time)}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">{formatBytes(user.data_used)}</td>
//                         <td className="px-6 py-4">
//                           <span className={`px-3 py-1 rounded-full text-sm font-medium ${
//                             user.active 
//                               ? theme === 'dark' ? "bg-green-900 text-green-300" : "bg-green-100 text-green-600"
//                               : theme === 'dark' ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"
//                           }`}>
//                             {user.active ? "Active" : "Inactive"}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 text-right space-x-2">
//                           <Button
//                             onClick={() => viewUserSessionHistory(user)}
//                             label="History"
//                             icon={<History className="w-3 h-3" />}
//                             theme={theme}
//                             compact
//                             color="blue"
//                           />
//                           {user.active && (
//                             <Button
//                               onClick={() => showConfirm("Disconnect User", `Are you sure you want to disconnect this user?`, () => disconnectHotspotUser(user.id))}
//                               label="Disconnect"
//                               icon={<LogOut className="w-3 h-3" />}
//                               theme={theme}
//                               compact
//                               color="red"
//                             />
//                           )}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//             <h3 className="text-lg font-semibold mt-6">PPPoE Users</h3>
//             {pppoeUsers.length === 0 ? (
//               <div className="text-center py-8">
//                 <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                 <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No active PPPoE users</p>
//               </div>
//             ) : (
//               <div className="overflow-x-auto rounded-xl border border-gray-200/30 dark:border-gray-700/30">
//                 <table className={`min-w-full divide-y ${
//                   theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
//                 }`}>
//                   <thead className={theme === 'dark' ? 'bg-gray-800/80' : 'bg-gray-100'}>
//                     <tr>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Client</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Plan</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">MAC</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Remaining Time</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Data Used</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Status</th>
//                       <th className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className={`divide-y ${
//                     theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
//                   }`}>
//                     {pppoeUsers.map((user) => (
//                       <tr key={user.id} className={theme === 'dark' ? 'hover:bg-gray-800/40' : 'hover:bg-gray-50'}>
//                         <td className="px-6 py-4">
//                           <div className="flex items-center space-x-3">
//                             <Users className="w-4 h-4 text-gray-400" />
//                             <div>
//                               <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                                 {user.client?.user?.username || "Unknown"}
//                               </p>
//                               <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
//                                 {user.client?.user?.phone_number || "N/A"}
//                               </p>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">{user.plan?.name || "N/A"}</td>
//                         <td className="px-6 py-4 font-mono text-sm">{user.mac}</td>
//                         <td className="px-6 py-4">
//                           <div className="flex items-center">
//                             <Clock className="w-4 h-4 mr-2 text-blue-500" />
//                             {formatTime(user.remaining_time)}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">{formatBytes(user.data_used)}</td>
//                         <td className="px-6 py-4">
//                           <span className={`px-3 py-1 rounded-full text-sm font-medium ${
//                             user.active 
//                               ? theme === 'dark' ? "bg-green-900 text-green-300" : "bg-green-100 text-green-600"
//                               : theme === 'dark' ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"
//                           }`}>
//                             {user.active ? "Active" : "Inactive"}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 text-right space-x-2">
//                           <Button
//                             onClick={() => viewUserSessionHistory(user)}
//                             label="History"
//                             icon={<History className="w-3 h-3" />}
//                             theme={theme}
//                             compact
//                             color="blue"
//                           />
//                           {user.active && (
//                             <Button
//                               onClick={() => showConfirm("Disconnect User", `Are you sure you want to disconnect this user?`, () => disconnectPPPoEUser(user.id))}
//                               label="Disconnect"
//                               icon={<LogOut className="w-3 h-3" />}
//                               theme={theme}
//                               compact
//                               color="red"
//                             />
//                           )}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </Modal>

//         {/* Session History Modal */}
//         <Modal
//           isOpen={modals.sessionHistory}
//           title={`Session History - ${selectedUser?.client?.user?.username || "User"}`}
//           onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "sessionHistory" })}
//           size="lg"
//           theme={theme}
//         >
//           <div className="space-y-6">
//             {sessionHistory.length === 0 ? (
//               <div className="text-center py-8">
//                 <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                 <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No session history found</p>
//               </div>
//             ) : (
//               <div className="overflow-x-auto rounded-xl border border-gray-200/30 dark:border-gray-700/30">
//                 <table className={`min-w-full divide-y ${
//                   theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
//                 }`}>
//                   <thead className={theme === 'dark' ? 'bg-gray-800/80' : 'bg-gray-100'}>
//                     <tr>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Router</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Start Time</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">End Time</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Duration</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Data Used</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Reason</th>
//                     </tr>
//                   </thead>
//                   <tbody className={`divide-y ${
//                     theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
//                   }`}>
//                     {sessionHistory.map((session) => (
//                       <tr key={session.id} className={theme === 'dark' ? 'hover:bg-gray-800/40' : 'hover:bg-gray-50'}>
//                         <td className="px-6 py-4">{session.router?.name || "N/A"}</td>
//                         <td className="px-6 py-4">{new Date(session.start_time).toLocaleString()}</td>
//                         <td className="px-6 py-4">{session.end_time ? new Date(session.end_time).toLocaleString() : "Active"}</td>
//                         <td className="px-6 py-4">{formatTime(session.duration)}</td>
//                         <td className="px-6 py-4">{formatBytes(session.data_used)}</td>
//                         <td className="px-6 py-4 capitalize">{session.disconnected_reason?.replace(/_/g, " ") || "Unknown"}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </Modal>

//         {/* Callback Config Modal */}
//         <Modal
//           isOpen={modals.callbackConfig}
//           title={editingCallbackId ? "Edit Callback Config" : "Add Callback Config"}
//           onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "callbackConfig" })}
//           theme={theme}
//         >
//           <div className="space-y-6">
//             <div>
//               <label className={`block text-sm mb-2 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Event</label>
//               <div className={`relative ${theme === 'dark' ? 'bg-gray-800/60 border-gray-700' : 'bg-white/80 border-gray-300'}`}>
//                 <select
//                   value={callbackForm.event}
//                   onChange={(e) => dispatch({ type: "UPDATE_CALLBACK_FORM", payload: { event: e.target.value } })}
//                   className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 backdrop-blur-md transition-colors duration-300 ${
//                     theme === 'dark' 
//                       ? 'text-white' 
//                       : 'text-gray-900'
//                   } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
//                 >
//                   <option value="">Select Event</option>
//                   {events.map((event) => (
//                     <option key={event.id} value={event.name}>
//                       {event.name_display}
//                     </option>
//                   ))}
//                 </select>
//                 <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
//               </div>
//             </div>
//             <InputField
//               label="Callback URL"
//               value={callbackForm.callback_url}
//               onChange={(e) => dispatch({ type: "UPDATE_CALLBACK_FORM", payload: { callback_url: e.target.value } })}
//               placeholder="https://example.com/callback"
//               icon={<Globe className="w-4 h-4" />}
//               required
//               theme={theme}
//             />
//             <div>
//               <label className={`block text-sm mb-2 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Security Level</label>
//               <div className={`relative ${theme === 'dark' ? 'bg-gray-800/60 border-gray-700' : 'bg-white/80 border-gray-300'}`}>
//                 <select
//                   value={callbackForm.security_level}
//                   onChange={(e) => dispatch({ type: "UPDATE_CALLBACK_FORM", payload: { security_level: e.target.value } })}
//                   className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 backdrop-blur-md transition-colors duration-300 ${
//                     theme === 'dark' 
//                       ? 'text-white' 
//                       : 'text-gray-900'
//                   } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
//                 >
//                   <option value="low">Low</option>
//                   <option value="medium">Medium</option>
//                   <option value="high">High</option>
//                   <option value="critical">Critical</option>
//                 </select>
//                 <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
//               </div>
//             </div>
//             <div>
//               <label className={`block text-sm mb-2 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Security Profile</label>
//               <div className={`relative ${theme === 'dark' ? 'bg-gray-800/60 border-gray-700' : 'bg-white/80 border-gray-300'}`}>
//                 <select
//                   value={callbackForm.security_profile}
//                   onChange={(e) => dispatch({ type: "UPDATE_CALLBACK_FORM", payload: { security_profile: e.target.value } })}
//                   className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 backdrop-blur-md transition-colors duration-300 ${
//                     theme === 'dark' 
//                       ? 'text-white' 
//                       : 'text-gray-900'
//                   } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
//                 >
//                   <option value="">Select Profile</option>
//                   {securityProfiles.map((profile) => (
//                     <option key={profile.id} value={profile.id}>
//                       {profile.name}
//                     </option>
//                   ))}
//                 </select>
//                 <ShieldCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
//               </div>
//             </div>
//             <CheckboxField
//               label="Active"
//               checked={callbackForm.is_active}
//               onChange={(e) => dispatch({ type: "UPDATE_CALLBACK_FORM", payload: { is_active: e.target.checked } })}
//               theme={theme}
//             />
//             <CheckboxField
//               label="Enable Retries"
//               checked={callbackForm.retry_enabled}
//               onChange={(e) => dispatch({ type: "UPDATE_CALLBACK_FORM", payload: { retry_enabled: e.target.checked } })}
//               theme={theme}
//             />
//             <InputField
//               label="Max Retries"
//               type="number"
//               value={callbackForm.max_retries}
//               onChange={(e) => dispatch({ type: "UPDATE_CALLBACK_FORM", payload: { max_retries: e.target.value } })}
//               placeholder="3"
//               icon={<RefreshCw className="w-4 h-4" />}
//               theme={theme}
//             />
//             <InputField
//               label="Timeout (seconds)"
//               type="number"
//               value={callbackForm.timeout_seconds}
//               onChange={(e) => dispatch({ type: "UPDATE_CALLBACK_FORM", payload: { timeout_seconds: e.target.value } })}
//               placeholder="30"
//               icon={<Clock className="w-4 h-4" />}
//               theme={theme}
//             />
//             <Button
//               onClick={editingCallbackId ? updateCallbackConfig : addCallbackConfig}
//               label={isLoading ? "Saving..." : "Save Configuration"}
//               icon={isLoading ? <ThreeDots color="#fff" height={20} width={40} /> : <CheckCircle />}
//               theme={theme}
//               disabled={isLoading || !callbackForm.event || !callbackForm.callback_url}
//               fullWidth
//             />
//           </div>
//         </Modal>

//         {/* Test Callback Modal */}
//         {showTestModal && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               className={`rounded-2xl p-6 w-full max-w-2xl mx-4 backdrop-blur-md border border-gray-200/30 dark:border-gray-700/30 ${
//                 theme === 'dark' ? 'bg-gray-800/80' : 'bg-white/90'
//               }`}
//             >
//               <h3 className="text-lg font-semibold mb-4 text-indigo-600">Test Callback Configuration</h3>
//               <div className="mb-6">
//                 <label className={`block text-sm font-medium mb-3 ${
//                   theme === 'dark' ? 'text-white' : 'text-gray-700'
//                 }`}>Test Payload</label>
//                 <textarea
//                   value={testConfig.test_payload}
//                   onChange={(e) => dispatch({ type: "UPDATE_TEST_CONFIG", payload: { test_payload: e.target.value } })}
//                   rows={10}
//                   className={`w-full px-4 py-3 border-2 rounded-xl font-mono text-sm backdrop-blur-md transition-colors duration-300 resize-vertical ${
//                     theme === 'dark' 
//                       ? 'bg-gray-800/60 border-gray-700 text-white placeholder-gray-400' 
//                       : 'border-gray-300 bg-white/80 text-gray-900 placeholder-gray-500'
//                   } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
//                   placeholder="Enter test payload in JSON format"
//                 />
//               </div>
//               <div className="flex flex-col sm:flex-row gap-3 justify-end">
//                 <button
//                   onClick={() => dispatch({ type: "SET_SHOW_TEST_MODAL", payload: false })}
//                   className={`px-6 py-3 border-2 rounded-xl font-medium transition-colors duration-300 ${
//                     theme === 'dark' 
//                       ? 'border-gray-700 text-white hover:bg-gray-700/30' 
//                       : 'border-gray-300 text-gray-700 hover:bg-gray-50'
//                   }`}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={runTest}
//                   disabled={isLoading}
//                   className={`px-6 py-3 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'} bg-blue-600 text-white rounded-xl font-medium transition-colors duration-300 flex items-center justify-center disabled:opacity-50`}
//                 >
//                   <Activity className="w-4 h-4 mr-2" />
//                   {isLoading ? "Running..." : "Run Test"}
//                 </button>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default RouterManagement;











// src/Pages/NetworkManagement/RouterManagement.jsx
import React, { useReducer, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Router, Users, RefreshCw, Plus, Search, Filter,
  BarChart3, Activity, Wifi, Server, Network
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Custom Hooks
import { useRouterManagement } from "./hooks/useRouterManagement";
import { useUserManagement } from "./hooks/useUserManagement";
import { useSessionRecovery } from "./hooks/useSessionRecovery";
import { useHealthMonitoring } from "./hooks/useHealthMonitoring";

// Components
import CustomButton from "./components/Common/CustomButton";
import CustomModal from "./components/Common/CustomModal";
import StatsCard from "./components/Common/StatsCard";
import ConfirmationModal from "./components/Common/ConfirmationModal";
import RouterList from "./components/Layout/RouterList";
import ActiveRouterPanel from "./components/Layout/ActiveRouterPanel";
import AddRouterForm from "./components/RouterForms/AddRouterForm";
import EditRouterForm from "./components/RouterForms/EditRouterForm";
import UserActivationForm from "./components/UserManagement/UserActivationForm";
import SessionRecovery from "./components/UserManagement/SessionRecovery";
import HotspotConfig from "./components/Configuration/HotspotConfig";
import PPPoEConfig from "./components/Configuration/PPPoEConfig";
import CallbackConfig from "./components/Configuration/CallbackConfig";
import RouterStats from "./components/Monitoring/RouterStats";
import HealthDashboard from "./components/Monitoring/HealthDashboard";

// Context and Theme
import { useTheme } from "../../context/ThemeContext";

const RouterManagement = () => {
  const { theme } = useTheme();
  
  // Custom Hooks for state management
  const {
    state,
    dispatch,
    fetchRouters,
    addRouter,
    updateRouter,
    deleteRouter,
    updateRouterStatus,
    restartRouter,
    fetchRouterStats,
    configureHotspot,
    configurePPPoE,
    fetchHotspotUsers,
    fetchPPPoEUsers,
    disconnectHotspotUser,
    disconnectPPPoEUser,
    fetchSessionHistory,
    fetchCallbackConfigs,
    addCallbackConfig,
    deleteCallbackConfig,
    restoreSessions,
    showConfirm,
    hideConfirm,
    handleConfirm
  } = useRouterManagement();

  const {
    activateUser,
    bulkActivateUsers,
    fetchAvailableClients,
    fetchAvailablePlans
  } = useUserManagement();

  const {
    recoverUserSession,
    bulkRecoverSessions,
    fetchRecoverableSessions
  } = useSessionRecovery();

  const {
    fetchHealthStats,
    performBulkHealthCheck,
    fetchSystemMetrics
  } = useHealthMonitoring();

  const {
    routers,
    activeRouter,
    isLoading,
    modals,
    confirmModal,
    routerForm,
    touchedFields,
    hotspotForm,
    pppoeForm,
    callbackForm,
    hotspotUsers,
    pppoeUsers,
    sessionHistory,
    healthStats,
    expandedRouter,
    selectedUser,
    statsData,
    searchTerm,
    filter,
    statsLoading,
    routerStats,
    availableClients,
    availablePlans,
    recoverableSessions,
    systemMetrics
  } = state;

  // Theme-based styling
  const containerClass = theme === "dark" 
    ? "bg-gradient-to-br from-gray-900 to-blue-900 text-white min-h-screen" 
    : "bg-gray-50 text-gray-800 min-h-screen";

  const cardClass = theme === "dark"
    ? "bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-xl shadow-md"
    : "bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl shadow-md";

  const textSecondaryClass = theme === "dark" ? "text-gray-400" : "text-gray-500";

  // Initial data loading
  useEffect(() => {
    fetchRouters();
    fetchHealthStats();
    fetchAvailableClients();
    fetchAvailablePlans();
    
    const interval = setInterval(() => {
      fetchRouters();
      fetchHealthStats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchRouters, fetchHealthStats, fetchAvailableClients, fetchAvailablePlans]);

  // Active router data refresh
  useEffect(() => {
    if (activeRouter) {
      fetchHotspotUsers(activeRouter.id);
      fetchPPPoEUsers(activeRouter.id);
      fetchCallbackConfigs(activeRouter.id);
      fetchSystemMetrics(activeRouter.id);
      
      const interval = setInterval(() => {
        if (activeRouter) {
          fetchHotspotUsers(activeRouter.id);
          fetchPPPoEUsers(activeRouter.id);
          fetchCallbackConfigs(activeRouter.id);
          fetchSystemMetrics(activeRouter.id);
        }
      }, 15000);
      
      return () => clearInterval(interval);
    }
  }, [activeRouter, fetchHotspotUsers, fetchPPPoEUsers, fetchCallbackConfigs, fetchSystemMetrics]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalRouters = routers.length;
    const activeRouters = routers.filter(r => r.status === "connected").length;
    const totalClients = routers.reduce((acc, router) => 
      acc + (router.connected_clients_count || 0), 0
    );
    const avgUsage = totalRouters > 0 
      ? Math.round(routers.reduce((acc, router) => {
          const stats = routerStats[router.id];
          return acc + (stats?.cpu || 0);
        }, 0) / totalRouters)
      : 0;

    return { totalRouters, activeRouters, totalClients, avgUsage };
  }, [routers, routerStats]);

  return (
    <div className={`${containerClass} p-4 md:p-8 transition-colors duration-300`}>
      <ToastContainer 
        position="top-right" 
        autoClose={5000} 
        theme={theme} 
        pauseOnHover 
        newestOnTop 
      />

      {/* Header Section */}
      <motion.header 
        className={`${cardClass} p-6 mb-6 transition-colors duration-300`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${
              theme === "dark" ? "bg-blue-600/20" : "bg-blue-100"
            }`}>
              <Router className={`w-8 h-8 ${
                theme === "dark" ? "text-blue-400" : "text-blue-600"
              }`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Router Management</h1>
              <p className={`text-sm ${textSecondaryClass}`}>
                {statistics.totalRouters} routers • {statistics.activeRouters} active •{" "}
                {statistics.totalClients} total clients
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <CustomButton
              onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "userActivation" })}
              icon={<Users className="w-4 h-4" />}
              label="Activate User"
              variant="primary"
              size="sm"
            />
            <CustomButton
              onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "sessionRecovery" })}
              icon={<RefreshCw className="w-4 h-4" />}
              label="Recover Sessions"
              variant="success"
              size="sm"
            />
            <CustomButton
              onClick={() => {
                dispatch({ type: "RESET_ROUTER_FORM" });
                dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" });
              }}
              icon={<Plus className="w-4 h-4" />}
              label="Add Router"
              variant="primary"
              size="sm"
            />
            <CustomButton
              onClick={fetchRouters}
              icon={<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />}
              label="Refresh"
              variant="secondary"
              size="sm"
              disabled={isLoading}
            />
          </div>
        </div>
      </motion.header>

      {/* Search and Filter Section */}
      <motion.section 
        className="mb-6 transition-colors duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className={`p-4 ${cardClass}`}>
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className={`h-5 w-5 ${textSecondaryClass}`} />
                </div>
                <input
                  type="text"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors duration-300 ${
                    theme === "dark"
                      ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                  placeholder="Search routers by name, IP, location, or SSID..."
                  value={searchTerm}
                  onChange={(e) => dispatch({ type: "SET_SEARCH_TERM", payload: e.target.value })}
                />
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex gap-3 w-full lg:w-auto">
              <select
                value={filter}
                onChange={(e) => dispatch({ type: "SET_FILTER", payload: e.target.value })}
                className={`px-4 py-3 rounded-lg border text-sm flex-1 ${
                  theme === "dark"
                    ? "bg-gray-700/50 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                    : "bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                }`}
              >
                <option value="all">All Routers</option>
                <option value="connected">Connected</option>
                <option value="disconnected">Disconnected</option>
                <option value="updating">Updating</option>
                <option value="error">Error</option>
              </select>
              
              <CustomButton
                onClick={() => performBulkHealthCheck(routers.map(r => r.id))}
                icon={<Activity className="w-4 h-4" />}
                label="Health Check"
                variant="secondary"
                size="sm"
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Statistics Overview */}
      <motion.section
        className="mb-6 transition-colors duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            title="Total Routers" 
            value={statistics.totalRouters} 
            icon={<Router className="w-5 h-5" />} 
            theme={theme} 
            color="blue" 
          />
          <StatsCard 
            title="Active Routers" 
            value={statistics.activeRouters} 
            icon={<Network className="w-5 h-5" />} 
            theme={theme} 
            color="green" 
          />
          <StatsCard 
            title="Total Clients" 
            value={statistics.totalClients}
            icon={<Users className="w-5 h-5" />} 
            theme={theme} 
            color="purple" 
          />
          <StatsCard 
            title="Avg. CPU Usage" 
            value={statistics.avgUsage}
            unit="%"
            icon={<Activity className="w-5 h-5" />} 
            theme={theme} 
            color="orange" 
          />
        </div>
      </motion.section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Routers List - 3 columns on xl screens */}
        <div className="xl:col-span-3">
          <RouterList
            routers={routers}
            isLoading={isLoading}
            expandedRouter={expandedRouter}
            routerStats={routerStats}
            theme={theme}
            onToggleExpand={(routerId) => dispatch({ type: "TOGGLE_ROUTER_EXPANDED", id: routerId })}
            onViewStats={fetchRouterStats}
            onRestart={restartRouter}
            onStatusChange={updateRouterStatus}
            onEdit={(router) => {
              dispatch({ type: "UPDATE_ROUTER_FORM", payload: router });
              dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" });
            }}
            onDelete={(router) => showConfirm(
              "Delete Router",
              `Are you sure you want to delete router "${router.name}"? This action cannot be undone.`,
              () => deleteRouter(router.id)
            )}
            searchTerm={searchTerm}
            filter={filter}
          />
        </div>

        {/* Sidebar - 1 column on xl screens */}
        <div className="xl:col-span-1 space-y-6">
          {/* Active Router Panel */}
          {activeRouter && (
            <ActiveRouterPanel
              activeRouter={activeRouter}
              hotspotUsers={hotspotUsers}
              pppoeUsers={pppoeUsers}
              theme={theme}
              onConfigureHotspot={() => dispatch({ type: "TOGGLE_MODAL", modal: "hotspotConfig" })}
              onConfigurePPPoE={() => dispatch({ type: "TOGGLE_MODAL", modal: "pppoeConfig" })}
              onManageUsers={() => dispatch({ type: "TOGGLE_MODAL", modal: "users" })}
              onCallbackSettings={() => dispatch({ type: "TOGGLE_MODAL", modal: "callbackConfig" })}
              onRestoreSessions={() => restoreSessions(activeRouter.id)}
            />
          )}

          {/* Health Dashboard */}
          <HealthDashboard
            healthStats={healthStats}
            systemMetrics={systemMetrics}
            activeRouter={activeRouter}
            theme={theme}
          />
        </div>
      </div>

      {/* All Modals */}
      <ConfirmationModal
        isOpen={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={handleConfirm}
        onCancel={hideConfirm}
        theme={theme}
      />

      {/* Router Management Modals */}
      <AddRouterForm
        isOpen={modals.addRouter}
        onClose={() => {
          dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" });
          dispatch({ type: "RESET_ROUTER_FORM" });
        }}
        routerForm={routerForm}
        touchedFields={touchedFields}
        isLoading={isLoading}
        theme={theme}
        onFormUpdate={(updates) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: updates })}
        onFieldBlur={(field) => dispatch({ type: "SET_TOUCHED_FIELD", field })}
        onSubmit={addRouter}
        dispatch={dispatch}
      />

      <EditRouterForm
        isOpen={modals.editRouter}
        onClose={() => {
          dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" });
          dispatch({ type: "RESET_ROUTER_FORM" });
        }}
        routerForm={routerForm}
        touchedFields={touchedFields}
        isLoading={isLoading}
        theme={theme}
        onFormUpdate={(updates) => dispatch({ type: "UPDATE_ROUTER_FORM", payload: updates })}
        onFieldBlur={(field) => dispatch({ type: "SET_TOUCHED_FIELD", field })}
        onSubmit={() => updateRouter(activeRouter.id)}
        activeRouter={activeRouter}
      />

      {/* User Management Modals */}
      <UserActivationForm
        isOpen={modals.userActivation}
        onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "userActivation" })}
        availableClients={availableClients}
        availablePlans={availablePlans}
        activeRouter={activeRouter}
        theme={theme}
        onActivateUser={activateUser}
        isLoading={isLoading}
      />

      <SessionRecovery
        isOpen={modals.sessionRecovery}
        onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "sessionRecovery" })}
        recoverableSessions={recoverableSessions}
        theme={theme}
        onRecoverSession={recoverUserSession}
        onBulkRecover={bulkRecoverSessions}
        isLoading={isLoading}
      />

      {/* Configuration Modals */}
      <HotspotConfig
        isOpen={modals.hotspotConfig}
        onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "hotspotConfig" })}
        hotspotForm={hotspotForm}
        activeRouter={activeRouter}
        theme={theme}
        onFormUpdate={(updates) => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: updates })}
        onSubmit={configureHotspot}
        isLoading={isLoading}
      />

      <PPPoEConfig
        isOpen={modals.pppoeConfig}
        onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "pppoeConfig" })}
        pppoeForm={pppoeForm}
        activeRouter={activeRouter}
        theme={theme}
        onFormUpdate={(updates) => dispatch({ type: "UPDATE_PPPOE_FORM", payload: updates })}
        onSubmit={configurePPPoE}
        isLoading={isLoading}
      />

      <CallbackConfig
        isOpen={modals.callbackConfig}
        onClose={() => {
          dispatch({ type: "TOGGLE_MODAL", modal: "callbackConfig" });
          dispatch({ type: "RESET_CALLBACK_FORM" });
        }}
        callbackForm={callbackForm}
        callbackConfigs={state.callbackConfigs}
        theme={theme}
        onFormUpdate={(updates) => dispatch({ type: "UPDATE_CALLBACK_FORM", payload: updates })}
        onAddCallback={addCallbackConfig}
        onDeleteCallback={deleteCallbackConfig}
        isLoading={isLoading}
      />

      {/* Monitoring Modals */}
      <RouterStats
        isOpen={modals.routerStats}
        onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "routerStats" })}
        routerStats={routerStats}
        statsLoading={statsLoading}
        theme={theme}
      />
    </div>
  );
};

export default RouterManagement;