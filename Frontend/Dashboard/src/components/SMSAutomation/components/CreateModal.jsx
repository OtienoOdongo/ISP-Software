// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   X, Send, FileText, Server, Zap, AlertCircle, CheckCircle,
//   Eye, EyeOff, HelpCircle, Phone, Mail, User, CreditCard, Key, Shield,
//   Globe, Wifi, Clock, Tag, Users, Bell, Calendar, TrendingUp, DollarSign,
//   RefreshCw, BarChart3, MessageSquare, Copy, Sparkles, Save, Type,
//   Hash, ToggleLeft, ToggleRight, Info, ChevronRight, ChevronLeft
// } from 'lucide-react';
// import { getThemeClasses, EnhancedSelect } from '../../../components/ServiceManagement/Shared/components';

// /**
//  * Enhanced Create Modal Component with improved UX/UI
//  */
// const CreateModal = ({
//   isOpen,
//   onClose,
//   type,
//   onSubmit,
//   gateways = [],
//   templates = [],
//   theme = 'light',
//   initialData = {}
// }) => {
//   const themeClasses = getThemeClasses(theme);
  
//   // State
//   const [formData, setFormData] = useState({});
//   const [errors, setErrors] = useState({});
//   const [touched, setTouched] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState({});
//   const [success, setSuccess] = useState(false);
//   const [activeTab, setActiveTab] = useState('basic');
//   const [charCount, setCharCount] = useState(0);
//   const [variablePreview, setVariablePreview] = useState([]);

//   // Reset form when modal opens/closes or type changes
//   useEffect(() => {
//     if (isOpen) {
//       const defaults = getDefaultValues(type);
//       setFormData({ ...defaults, ...initialData });
//       setErrors({});
//       setTouched({});
//       setSuccess(false);
//       setActiveTab('basic');
      
//       // Calculate initial char count for template
//       if (type === 'template' && initialData.message_template) {
//         setCharCount(initialData.message_template.length);
//         extractVariables(initialData.message_template);
//       }
      
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'unset';
//     }
    
//     return () => {
//       document.body.style.overflow = 'unset';
//     };
//   }, [isOpen, type, initialData]);

//   // Get default values based on type
//   const getDefaultValues = (modalType) => {
//     switch (modalType) {
//       case 'message':
//         return {
//           priority: 'normal',
//           scheduled_for: '',
//           gateway_id: '',
//           template_id: ''
//         };
//       case 'template':
//         return {
//           template_type: 'welcome',
//           is_active: true,
//           allow_unicode: false,
//           language: 'en',
//           category: 'transactional'
//         };
//       case 'gateway':
//         return {
//           gateway_type: 'africas_talking',
//           is_active: true,
//           is_default: false,
//           max_messages_per_minute: 60,
//           max_messages_per_hour: 1000,
//           max_messages_per_day: 10000,
//           priority: 10
//         };
//       case 'rule':
//         return {
//           rule_type: 'welcome',
//           is_active: true,
//           is_recurring: false,
//           delay_minutes: 0,
//           priority: 'normal',
//           condition_field: '',
//           condition_operator: '',
//           condition_value: ''
//         };
//       default:
//         return {};
//     }
//   };

//   // Extract variables from template message
//   const extractVariables = (message) => {
//     if (!message) return;
//     const matches = message.match(/\{\{([^}]+)\}\}/g) || [];
//     const variables = matches.map(v => v.replace(/[{}]/g, ''));
//     setVariablePreview(variables);
//   };

//   // Handle message template change
//   const handleMessageChange = (value) => {
//     setCharCount(value.length);
//     extractVariables(value);
//     handleChange('message_template', value);
//   };

//   // Validation rules
//   const validateField = useCallback((name, value, allData) => {
//     switch (name) {
//       case 'name':
//         if (!value?.trim()) return 'Name is required';
//         if (value.length < 3) return 'Name must be at least 3 characters';
//         if (value.length > 100) return 'Name must be less than 100 characters';
//         break;

//       case 'phone_number':
//         if (!value?.trim()) return 'Phone number is required';
//         const phoneRegex = /^(\+?254|0)[17]\d{8}$/;
//         if (!phoneRegex.test(value.replace(/\s/g, ''))) {
//           return 'Invalid phone number (e.g., 0712345678 or +254712345678)';
//         }
//         break;

//       case 'message':
//       case 'message_template':
//         if (!value?.trim()) return 'Message content is required';
//         if (value.length < 5) return 'Message is too short';
//         if (value.length > 1000) return 'Message exceeds 1000 characters';
//         break;

//       case 'gateway_type':
//         if (!value) return 'Gateway type is required';
//         break;

//       case 'api_key':
//         if (allData?.gateway_type && allData.gateway_type !== 'custom' && !value?.trim()) {
//           return 'API key is required for this gateway type';
//         }
//         break;

//       case 'rule_type':
//         if (!value) return 'Rule type is required';
//         break;

//       case 'template_id':
//         if (type === 'rule' && !value) return 'Template selection is required';
//         break;

//       case 'delay_minutes':
//         if (value < 0) return 'Delay cannot be negative';
//         if (value > 1440) return 'Delay cannot exceed 24 hours';
//         break;

//       default:
//         break;
//     }
//     return '';
//   }, [type]);

//   // Validate entire form
//   const validateForm = useCallback(() => {
//     const newErrors = {};
//     const requiredFields = {
//       message: ['phone_number', 'message'],
//       template: ['name', 'template_type', 'message_template'],
//       gateway: ['name', 'gateway_type'],
//       rule: ['name', 'rule_type', 'template_id']
//     }[type] || [];

//     requiredFields.forEach(field => {
//       const error = validateField(field, formData[field], formData);
//       if (error) newErrors[field] = error;
//     });

//     // Additional validation for gateway API key
//     if (type === 'gateway' && formData.gateway_type && formData.gateway_type !== 'custom') {
//       const apiKeyError = validateField('api_key', formData.api_key, formData);
//       if (apiKeyError) newErrors.api_key = apiKeyError;
//     }

//     return newErrors;
//   }, [type, formData, validateField]);

//   // Handle input change
//   const handleChange = useCallback((name, value) => {
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   }, [errors]);

//   // Handle field blur
//   const handleBlur = useCallback((name) => {
//     setTouched(prev => ({ ...prev, [name]: true }));
//     const error = validateField(name, formData[name], formData);
//     if (error) {
//       setErrors(prev => ({ ...prev, [name]: error }));
//     }
//   }, [formData, validateField]);

//   // Handle form submission
//   const handleSubmit = useCallback(async (e) => {
//     e.preventDefault();
    
//     const allTouched = {};
//     Object.keys(formData).forEach(key => allTouched[key] = true);
//     setTouched(allTouched);

//     const validationErrors = validateForm();
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
      
//       // Scroll to first error
//       const firstErrorField = Object.keys(validationErrors)[0];
//       const element = document.getElementById(`field-${firstErrorField}`);
//       if (element) {
//         element.scrollIntoView({ behavior: 'smooth', block: 'center' });
//       }
//       return;
//     }

//     setLoading(true);
//     setErrors({});

//     try {
//       await onSubmit(formData);
//       setSuccess(true);
      
//       setTimeout(() => {
//         onClose(true);
//       }, 1500);
//     } catch (error) {
//       console.error('Submission failed:', error);
//       setErrors({
//         general: error.response?.data?.message || 
//                 error.message || 
//                 'Failed to create. Please try again.'
//       });
//     } finally {
//       setLoading(false);
//     }
//   }, [formData, validateForm, onSubmit, onClose]);

//   // Get icon based on type
//   const getIcon = useCallback(() => {
//     switch (type) {
//       case 'message': return Send;
//       case 'template': return FileText;
//       case 'gateway': return Server;
//       case 'rule': return Zap;
//       default: return FileText;
//     }
//   }, [type]);

//   // Get title based on type
//   const getTitle = useCallback(() => {
//     switch (type) {
//       case 'message': return 'Send New Message';
//       case 'template': return 'Create Message Template';
//       case 'gateway': return 'Add SMS Gateway';
//       case 'rule': return 'Create Automation Rule';
//       default: return 'Create New';
//     }
//   }, [type]);

//   const Icon = getIcon();

//   // Get color scheme based on type
//   const getColorScheme = useCallback(() => {
//     switch (type) {
//       case 'message': return {
//         light: 'from-blue-500 to-blue-600',
//         dark: 'from-blue-600 to-blue-700',
//         bg: 'bg-blue-50 dark:bg-blue-900/20',
//         border: 'border-blue-200 dark:border-blue-800',
//         text: 'text-blue-600 dark:text-blue-400',
//         icon: 'text-blue-600'
//       };
//       case 'template': return {
//         light: 'from-purple-500 to-purple-600',
//         dark: 'from-purple-600 to-purple-700',
//         bg: 'bg-purple-50 dark:bg-purple-900/20',
//         border: 'border-purple-200 dark:border-purple-800',
//         text: 'text-purple-600 dark:text-purple-400',
//         icon: 'text-purple-600'
//       };
//       case 'gateway': return {
//         light: 'from-green-500 to-green-600',
//         dark: 'from-green-600 to-green-700',
//         bg: 'bg-green-50 dark:bg-green-900/20',
//         border: 'border-green-200 dark:border-green-800',
//         text: 'text-green-600 dark:text-green-400',
//         icon: 'text-green-600'
//       };
//       case 'rule': return {
//         light: 'from-orange-500 to-orange-600',
//         dark: 'from-orange-600 to-orange-700',
//         bg: 'bg-orange-50 dark:bg-orange-900/20',
//         border: 'border-orange-200 dark:border-orange-800',
//         text: 'text-orange-600 dark:text-orange-400',
//         icon: 'text-orange-600'
//       };
//       default: return {
//         light: 'from-gray-500 to-gray-600',
//         dark: 'from-gray-600 to-gray-700',
//         bg: 'bg-gray-50 dark:bg-gray-900/20',
//         border: 'border-gray-200 dark:border-gray-800',
//         text: 'text-gray-600 dark:text-gray-400',
//         icon: 'text-gray-600'
//       };
//     }
//   }, [type]);

//   const colors = getColorScheme();

//   // Memoized options
//   const gatewayOptions = useMemo(() => [
//     { value: '', label: 'Auto-select best gateway' },
//     ...gateways
//       .filter(g => g.is_active && g.is_online)
//       .map(g => ({ 
//         value: g.id, 
//         label: `${g.name} - ${g.balance ? `${g.currency} ${g.balance}` : 'Balance N/A'}` 
//       }))
//   ], [gateways]);

//   const templateOptions = useMemo(() => [
//     { value: '', label: 'Select a template...' },
//     ...templates
//       .filter(t => t.is_active)
//       .map(t => ({ value: t.id, label: t.name }))
//   ], [templates]);

//   const priorityOptions = useMemo(() => [
//     { value: 'urgent', label: 'Urgent', icon: Zap },
//     { value: 'high', label: 'High', icon: TrendingUp },
//     { value: 'normal', label: 'Normal', icon: Clock },
//     { value: 'low', label: 'Low', icon: ChevronRight }
//   ], []);

//   const templateTypeOptions = useMemo(() => [
//     { value: 'welcome', label: 'Welcome', icon: Users, description: 'New client welcome message' },
//     { value: 'pppoe_credentials', label: 'PPPoE Credentials', icon: Wifi, description: 'PPPoE account credentials' },
//     { value: 'hotspot_credentials', label: 'Hotspot Credentials', icon: Globe, description: 'Hotspot login details' },
//     { value: 'payment_success', label: 'Payment Success', icon: CheckCircle, description: 'Successful payment notification' },
//     { value: 'payment_reminder', label: 'Payment Reminder', icon: Bell, description: 'Payment due reminder' },
//     { value: 'plan_expiry', label: 'Plan Expiry', icon: Calendar, description: 'Plan expiration notice' },
//     { value: 'promotional', label: 'Promotional', icon: Tag, description: 'Marketing messages' },
//     { value: 'tier_upgrade', label: 'Tier Upgrade', icon: TrendingUp, description: 'Client tier upgrade' },
//     { value: 'commission_payout', label: 'Commission Payout', icon: DollarSign, description: 'Commission notification' },
//     { value: 'credentials_resend', label: 'Resend Credentials', icon: RefreshCw, description: 'Resend account details' },
//     { value: 'custom', label: 'Custom', icon: FileText, description: 'Custom template' }
//   ], []);

//   const gatewayTypeOptions = useMemo(() => [
//     { value: 'africas_talking', label: "Africa's Talking", icon: Globe, description: 'Popular African SMS gateway' },
//     { value: 'twilio', label: 'Twilio', icon: MessageSquare, description: 'Global SMS provider' },
//     { value: 'smpp', label: 'SMPP', icon: Server, description: 'Direct SMPP connection' },
//     { value: 'custom', label: 'Custom API', icon: Zap, description: 'Custom HTTP API integration' }
//   ], []);

//   const ruleTypeOptions = useMemo(() => [
//     { value: 'welcome', label: 'Welcome Message', icon: Users, description: 'Send on client creation' },
//     { value: 'pppoe_creation', label: 'PPPoE Creation', icon: Wifi, description: 'Send PPPoE credentials' },
//     { value: 'hotspot_creation', label: 'Hotspot Creation', icon: Globe, description: 'Send hotspot credentials' },
//     { value: 'payment_success', label: 'Payment Success', icon: CheckCircle, description: 'Send on successful payment' },
//     { value: 'payment_failed', label: 'Payment Failed', icon: AlertCircle, description: 'Send on failed payment' },
//     { value: 'payment_reminder', label: 'Payment Reminder', icon: Bell, description: 'Send before due date' },
//     { value: 'plan_expiry', label: 'Plan Expiry', icon: Calendar, description: 'Send before plan expires' },
//     { value: 'tier_upgrade', label: 'Tier Upgrade', icon: TrendingUp, description: 'Send on tier change' }
//   ], []);

//   const languageOptions = useMemo(() => [
//     { value: 'en', label: 'English', icon: Globe },
//     { value: 'sw', label: 'Swahili', icon: Globe },
//     { value: 'fr', label: 'French', icon: Globe }
//   ], []);

//   const categoryOptions = useMemo(() => [
//     { value: 'transactional', label: 'Transactional', icon: MessageSquare },
//     { value: 'promotional', label: 'Promotional', icon: Tag },
//     { value: 'otp', label: 'OTP/Verification', icon: Shield }
//   ], []);

//   // Scrollbar class
//   const scrollbarClass = "overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-500";

//   if (!isOpen) return null;

//   return (
//     <>
//       {/* Backdrop */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 z-[99998] bg-black/50 backdrop-blur-sm"
//         onClick={() => !loading && onClose()}
//       />

//       {/* Modal */}
//       <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.95, y: 20 }}
//           animate={{ opacity: 1, scale: 1, y: 0 }}
//           exit={{ opacity: 0, scale: 0.95, y: 20 }}
//           transition={{ type: "spring", duration: 0.3 }}
//           className={`relative w-full max-w-3xl rounded-2xl ${
//             themeClasses.bg.card
//           } shadow-2xl overflow-hidden`}
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Header with gradient */}
//           <div className={`relative px-8 py-6 bg-gradient-to-r ${colors.light} dark:${colors.dark}`}>
//             <div className="flex items-start justify-between">
//               <div className="flex items-center gap-4">
//                 <div className="p-3 bg-white/20 backdrop-blur rounded-2xl">
//                   <Icon className="w-8 h-8 text-white" />
//                 </div>
//                 <div>
//                   <h2 className="text-2xl font-bold text-white">
//                     {getTitle()}
//                   </h2>
//                   <p className="text-white/80 text-sm mt-1">
//                     Fill in the details below to continue
//                   </p>
//                 </div>
//               </div>

//               <button
//                 onClick={() => !loading && onClose()}
//                 className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white/80 hover:text-white"
//                 disabled={loading}
//               >
//                 <X size={20} />
//               </button>
//             </div>
//           </div>

//           {/* Success Banner */}
//           <AnimatePresence>
//             {success && (
//               <motion.div
//                 initial={{ height: 0, opacity: 0 }}
//                 animate={{ height: 'auto', opacity: 1 }}
//                 exit={{ height: 0, opacity: 0 }}
//                 className="overflow-hidden"
//               >
//                 <div className="mx-8 mt-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
//                   <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
//                     <CheckCircle className="text-green-600 dark:text-green-300" size={24} />
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-green-800 dark:text-green-300">
//                       Successfully Created!
//                     </h4>
//                     <p className="text-sm text-green-600 dark:text-green-400">
//                       Your {type} has been created. Redirecting...
//                     </p>
//                   </div>
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>

//           {/* Tabs for complex forms */}
//           {(type === 'template' || type === 'gateway') && (
//             <div className="px-8 pt-6 border-b border-gray-200 dark:border-gray-700">
//               <div className="flex gap-4">
//                 <button
//                   onClick={() => setActiveTab('basic')}
//                   className={`pb-3 px-1 text-sm font-medium border-b-2 transition-all ${
//                     activeTab === 'basic'
//                       ? `${colors.text} border-current`
//                       : 'text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
//                   }`}
//                 >
//                   Basic Information
//                 </button>
//                 <button
//                   onClick={() => setActiveTab('advanced')}
//                   className={`pb-3 px-1 text-sm font-medium border-b-2 transition-all ${
//                     activeTab === 'advanced'
//                       ? `${colors.text} border-current`
//                       : 'text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
//                   }`}
//                 >
//                   Advanced Settings
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Form */}
//           <form onSubmit={handleSubmit}>
//             <div className={`px-8 py-6 max-h-[60vh] ${scrollbarClass}`}>
//               {/* General Error */}
//               {errors.general && (
//                 <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
//                   <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
//                   <div>
//                     <h4 className="font-medium text-red-800 dark:text-red-300">Error</h4>
//                     <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
//                   </div>
//                 </div>
//               )}

//               {/* Template Form */}
//               {type === 'template' && (
//                 <div className="space-y-6">
//                   {/* Basic Tab */}
//                   {activeTab === 'basic' && (
//                     <>
//                       {/* Template Name & Type Row */}
//                       <div className="grid grid-cols-2 gap-4">
//                         <div className="space-y-2">
//                           <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                             Template Name <span className="text-red-500">*</span>
//                           </label>
//                           <div className="relative" id="field-name">
//                             <Type className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//                             <input
//                               type="text"
//                               value={formData.name || ''}
//                               onChange={(e) => handleChange('name', e.target.value)}
//                               onBlur={() => handleBlur('name')}
//                               className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
//                                 errors.name && touched.name
//                                   ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10' 
//                                   : themeClasses.input
//                               } transition-all focus:ring-2`}
//                               placeholder="e.g., Welcome Message"
//                               disabled={loading || success}
//                             />
//                           </div>
//                           {errors.name && touched.name && (
//                             <p className="text-sm text-red-500 flex items-center gap-1">
//                               <AlertCircle size={14} />
//                               {errors.name}
//                             </p>
//                           )}
//                         </div>

//                         <div className="space-y-2">
//                           <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                             Template Type <span className="text-red-500">*</span>
//                           </label>
//                           <EnhancedSelect
//                             value={formData.template_type || 'welcome'}
//                             onChange={(value) => handleChange('template_type', value)}
//                             onBlur={() => handleBlur('template_type')}
//                             options={templateTypeOptions}
//                             theme={theme}
//                             disabled={loading || success}
//                             placeholder="Select type..."
//                             showDescription={true}
//                           />
//                           {errors.template_type && touched.template_type && (
//                             <p className="text-sm text-red-500">{errors.template_type}</p>
//                           )}
//                         </div>
//                       </div>

//                       {/* Message Template */}
//                       <div className="space-y-2">
//                         <div className="flex items-center justify-between">
//                           <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                             Message Template <span className="text-red-500">*</span>
//                           </label>
//                           <span className={`text-xs px-2 py-1 rounded-full ${
//                             charCount > 900 ? 'bg-red-100 text-red-600' : 
//                             charCount > 700 ? 'bg-yellow-100 text-yellow-600' : 
//                             'bg-green-100 text-green-600'
//                           }`}>
//                             {charCount}/1000 chars
//                           </span>
//                         </div>
//                         <div className="relative" id="field-message_template">
//                           <textarea
//                             value={formData.message_template || ''}
//                             onChange={(e) => handleMessageChange(e.target.value)}
//                             onBlur={() => handleBlur('message_template')}
//                             rows={6}
//                             className={`w-full px-4 py-3 rounded-xl border font-mono text-sm ${
//                               errors.message_template && touched.message_template
//                                 ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10' 
//                                 : themeClasses.input
//                             } transition-all focus:ring-2 resize-none`}
//                             placeholder="Hello {{client_name}}, your username is {{username}}"
//                             disabled={loading || success}
//                           />
//                         </div>
                        
//                         {/* Variable Preview */}
//                         {variablePreview.length > 0 && (
//                           <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
//                             <div className="flex items-center gap-2 mb-2">
//                               <Hash size={14} className="text-gray-500" />
//                               <span className={`text-xs font-medium ${themeClasses.text.secondary}`}>
//                                 Detected Variables:
//                               </span>
//                             </div>
//                             <div className="flex flex-wrap gap-2">
//                               {variablePreview.map((variable) => (
//                                 <span
//                                   key={variable}
//                                   className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-mono"
//                                 >
//                                   {'{{' + variable + '}}'}
//                                 </span>
//                               ))}
//                             </div>
//                           </div>
//                         )}
                        
//                         {errors.message_template && touched.message_template && (
//                           <p className="text-sm text-red-500">{errors.message_template}</p>
//                         )}
//                       </div>

//                       {/* Description */}
//                       <div className="space-y-2">
//                         <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                           Description
//                         </label>
//                         <textarea
//                           value={formData.description || ''}
//                           onChange={(e) => handleChange('description', e.target.value)}
//                           rows={2}
//                           className={`w-full px-4 py-3 rounded-xl border ${themeClasses.input} transition-all focus:ring-2 resize-none`}
//                           placeholder="Brief description of this template..."
//                           disabled={loading || success}
//                         />
//                       </div>
//                     </>
//                   )}

//                   {/* Advanced Tab */}
//                   {activeTab === 'advanced' && (
//                     <div className="space-y-6">
//                       {/* Language & Category */}
//                       <div className="grid grid-cols-2 gap-4">
//                         <div className="space-y-2">
//                           <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                             Language
//                           </label>
//                           <EnhancedSelect
//                             value={formData.language || 'en'}
//                             onChange={(value) => handleChange('language', value)}
//                             options={languageOptions}
//                             theme={theme}
//                             disabled={loading || success}
//                           />
//                         </div>

//                         <div className="space-y-2">
//                           <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                             Category
//                           </label>
//                           <EnhancedSelect
//                             value={formData.category || 'transactional'}
//                             onChange={(value) => handleChange('category', value)}
//                             options={categoryOptions}
//                             theme={theme}
//                             disabled={loading || success}
//                           />
//                         </div>
//                       </div>

//                       {/* Toggle Switches */}
//                       <div className="grid grid-cols-2 gap-4">
//                         <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
//                           <div className="flex items-center gap-3">
//                             <ToggleRight className={`w-5 h-5 ${formData.is_active ? 'text-green-500' : 'text-gray-400'}`} />
//                             <div>
//                               <span className={`text-sm font-medium block ${themeClasses.text.primary}`}>
//                                 Active
//                               </span>
//                               <span className={`text-xs ${themeClasses.text.tertiary}`}>
//                                 Template can be used
//                               </span>
//                             </div>
//                           </div>
//                           <input
//                             type="checkbox"
//                             checked={formData.is_active ?? true}
//                             onChange={(e) => handleChange('is_active', e.target.checked)}
//                             className="sr-only"
//                           />
//                           <div className={`w-11 h-6 rounded-full transition-colors ${
//                             (formData.is_active ?? true) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
//                           }`}>
//                             <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
//                               (formData.is_active ?? true) ? 'translate-x-6' : 'translate-x-1'
//                             }`} />
//                           </div>
//                         </label>

//                         <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
//                           <div className="flex items-center gap-3">
//                             <Globe className={`w-5 h-5 ${formData.allow_unicode ? 'text-blue-500' : 'text-gray-400'}`} />
//                             <div>
//                               <span className={`text-sm font-medium block ${themeClasses.text.primary}`}>
//                                 Allow Unicode
//                               </span>
//                               <span className={`text-xs ${themeClasses.text.tertiary}`}>
//                                 Support special characters
//                               </span>
//                             </div>
//                           </div>
//                           <input
//                             type="checkbox"
//                             checked={formData.allow_unicode || false}
//                             onChange={(e) => handleChange('allow_unicode', e.target.checked)}
//                             className="sr-only"
//                           />
//                           <div className={`w-11 h-6 rounded-full transition-colors ${
//                             formData.allow_unicode ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
//                           }`}>
//                             <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
//                               formData.allow_unicode ? 'translate-x-6' : 'translate-x-1'
//                             }`} />
//                           </div>
//                         </label>
//                       </div>

//                       {/* Variables Info */}
//                       <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
//                         <div className="flex items-start gap-3">
//                           <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
//                           <div>
//                             <h4 className={`text-sm font-medium ${themeClasses.text.primary} mb-1`}>
//                               Available Variables
//                             </h4>
//                             <p className={`text-xs ${themeClasses.text.tertiary}`}>
//                               Use {'{{variable_name}}'} to insert dynamic content. Common variables: client_name, username, phone_number, plan_name, amount, expiry_date.
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Message Form */}
//               {type === 'message' && (
//                 <div className="space-y-5">
//                   {/* Phone Number */}
//                   <div className="space-y-2">
//                     <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                       Phone Number <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative" id="field-phone_number">
//                       <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//                       <input
//                         type="tel"
//                         value={formData.phone_number || ''}
//                         onChange={(e) => handleChange('phone_number', e.target.value)}
//                         onBlur={() => handleBlur('phone_number')}
//                         className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
//                           errors.phone_number && touched.phone_number
//                             ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10' 
//                             : themeClasses.input
//                         } transition-all focus:ring-2`}
//                         placeholder="0712345678 or +254712345678"
//                         disabled={loading || success}
//                       />
//                     </div>
//                     {errors.phone_number && touched.phone_number && (
//                       <p className="text-sm text-red-500 flex items-center gap-1">
//                         <AlertCircle size={14} />
//                         {errors.phone_number}
//                       </p>
//                     )}
//                   </div>

//                   {/* Message */}
//                   <div className="space-y-2">
//                     <div className="flex items-center justify-between">
//                       <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                         Message <span className="text-red-500">*</span>
//                       </label>
//                       <span className="text-xs text-gray-500">
//                         {formData.message?.length || 0}/1000
//                       </span>
//                     </div>
//                     <div id="field-message">
//                       <textarea
//                         value={formData.message || ''}
//                         onChange={(e) => handleChange('message', e.target.value)}
//                         onBlur={() => handleBlur('message')}
//                         rows={4}
//                         className={`w-full px-4 py-3 rounded-xl border ${
//                           errors.message && touched.message
//                             ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10' 
//                             : themeClasses.input
//                         } transition-all focus:ring-2 resize-none`}
//                         placeholder="Type your message here..."
//                         disabled={loading || success}
//                       />
//                     </div>
//                     {errors.message && touched.message && (
//                       <p className="text-sm text-red-500">{errors.message}</p>
//                     )}
//                   </div>

//                   {/* Template Selection */}
//                   {templates.length > 0 && (
//                     <div className="space-y-2">
//                       <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                         Use Template
//                       </label>
//                       <EnhancedSelect
//                         value={formData.template_id || ''}
//                         onChange={(value) => {
//                           handleChange('template_id', value);
//                           const template = templates.find(t => t.id === value);
//                           if (template) {
//                             handleChange('message', template.message_template);
//                           }
//                         }}
//                         options={templateOptions}
//                         theme={theme}
//                         placeholder="Select a template..."
//                         disabled={loading || success}
//                       />
//                     </div>
//                   )}

//                   {/* Priority & Gateway */}
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                         Priority
//                       </label>
//                       <EnhancedSelect
//                         value={formData.priority || 'normal'}
//                         onChange={(value) => handleChange('priority', value)}
//                         options={priorityOptions}
//                         theme={theme}
//                         disabled={loading || success}
//                       />
//                     </div>

//                     <div className="space-y-2">
//                       <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                         Gateway
//                       </label>
//                       <EnhancedSelect
//                         value={formData.gateway_id || ''}
//                         onChange={(value) => handleChange('gateway_id', value)}
//                         options={gatewayOptions}
//                         theme={theme}
//                         placeholder="Auto-select"
//                         disabled={loading || success}
//                       />
//                     </div>
//                   </div>

//                   {/* Schedule */}
//                   <div className="space-y-2">
//                     <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                       Schedule (Optional)
//                     </label>
//                     <input
//                       type="datetime-local"
//                       value={formData.scheduled_for || ''}
//                       onChange={(e) => handleChange('scheduled_for', e.target.value)}
//                       min={new Date().toISOString().slice(0, 16)}
//                       className={`w-full px-4 py-3 rounded-xl border ${themeClasses.input} focus:ring-2`}
//                       disabled={loading || success}
//                     />
//                   </div>
//                 </div>
//               )}

//               {/* Gateway Form */}
//               {type === 'gateway' && (
//                 <div className="space-y-5">
//                   {/* Basic Tab */}
//                   {activeTab === 'basic' && (
//                     <>
//                       {/* Gateway Name & Type */}
//                       <div className="grid grid-cols-2 gap-4">
//                         <div className="space-y-2">
//                           <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                             Gateway Name <span className="text-red-500">*</span>
//                           </label>
//                           <input
//                             type="text"
//                             value={formData.name || ''}
//                             onChange={(e) => handleChange('name', e.target.value)}
//                             onBlur={() => handleBlur('name')}
//                             className={`w-full px-4 py-3 rounded-xl border ${
//                               errors.name && touched.name
//                                 ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10' 
//                                 : themeClasses.input
//                             } transition-all focus:ring-2`}
//                             placeholder="e.g., Africa's Talking"
//                             disabled={loading || success}
//                           />
//                           {errors.name && touched.name && (
//                             <p className="text-sm text-red-500">{errors.name}</p>
//                           )}
//                         </div>

//                         <div className="space-y-2">
//                           <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                             Gateway Type <span className="text-red-500">*</span>
//                           </label>
//                           <EnhancedSelect
//                             value={formData.gateway_type || 'africas_talking'}
//                             onChange={(value) => handleChange('gateway_type', value)}
//                             onBlur={() => handleBlur('gateway_type')}
//                             options={gatewayTypeOptions}
//                             theme={theme}
//                             disabled={loading || success}
//                             showDescription={true}
//                           />
//                           {errors.gateway_type && touched.gateway_type && (
//                             <p className="text-sm text-red-500">{errors.gateway_type}</p>
//                           )}
//                         </div>
//                       </div>

//                       {/* API Credentials */}
//                       <div className="space-y-4">
//                         <h4 className={`text-sm font-medium ${themeClasses.text.primary} flex items-center gap-2`}>
//                           <Key size={16} />
//                           API Credentials
//                         </h4>

//                         <div className="space-y-2">
//                           <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                             API Key {formData.gateway_type && formData.gateway_type !== 'custom' && <span className="text-red-500">*</span>}
//                           </label>
//                           <div className="relative" id="field-api_key">
//                             <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//                             <input
//                               type={showPassword.apiKey ? 'text' : 'password'}
//                               value={formData.api_key || ''}
//                               onChange={(e) => handleChange('api_key', e.target.value)}
//                               onBlur={() => handleBlur('api_key')}
//                               className={`w-full pl-10 pr-10 py-3 rounded-xl border ${
//                                 errors.api_key && touched.api_key
//                                   ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10' 
//                                   : themeClasses.input
//                               } transition-all focus:ring-2`}
//                               placeholder="Enter API key"
//                               disabled={loading || success}
//                             />
//                             <button
//                               type="button"
//                               onClick={() => setShowPassword(prev => ({ ...prev, apiKey: !prev.apiKey }))}
//                               className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                             >
//                               {showPassword.apiKey ? <EyeOff size={18} /> : <Eye size={18} />}
//                             </button>
//                           </div>
//                           {errors.api_key && touched.api_key && (
//                             <p className="text-sm text-red-500">{errors.api_key}</p>
//                           )}
//                         </div>

//                         <div className="space-y-2">
//                           <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                             API Secret
//                           </label>
//                           <div className="relative">
//                             <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//                             <input
//                               type={showPassword.apiSecret ? 'text' : 'password'}
//                               value={formData.api_secret || ''}
//                               onChange={(e) => handleChange('api_secret', e.target.value)}
//                               className={`w-full pl-10 pr-10 py-3 rounded-xl border ${themeClasses.input} focus:ring-2`}
//                               placeholder="Enter API secret (if required)"
//                               disabled={loading || success}
//                             />
//                             <button
//                               type="button"
//                               onClick={() => setShowPassword(prev => ({ ...prev, apiSecret: !prev.apiSecret }))}
//                               className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                             >
//                               {showPassword.apiSecret ? <EyeOff size={18} /> : <Eye size={18} />}
//                             </button>
//                           </div>
//                         </div>

//                         <div className="space-y-2">
//                           <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                             Sender ID
//                           </label>
//                           <input
//                             type="text"
//                             value={formData.sender_id || ''}
//                             onChange={(e) => handleChange('sender_id', e.target.value)}
//                             className={`w-full px-4 py-3 rounded-xl border ${themeClasses.input} focus:ring-2`}
//                             placeholder="e.g., MyCompany"
//                             disabled={loading || success}
//                           />
//                         </div>
//                       </div>
//                     </>
//                   )}

//                   {/* Advanced Tab */}
//                   {activeTab === 'advanced' && (
//                     <div className="space-y-6">
//                       {/* Rate Limits */}
//                       <div className="space-y-4">
//                         <h4 className={`text-sm font-medium ${themeClasses.text.primary} flex items-center gap-2`}>
//                           <Zap size={16} />
//                           Rate Limits
//                         </h4>

//                         <div className="grid grid-cols-3 gap-4">
//                           <div className="space-y-2">
//                             <label className={`block text-xs font-medium ${themeClasses.text.secondary}`}>
//                               Max/Minute
//                             </label>
//                             <input
//                               type="number"
//                               value={formData.max_messages_per_minute || 60}
//                               onChange={(e) => handleChange('max_messages_per_minute', parseInt(e.target.value) || 60)}
//                               min="1"
//                               className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input} focus:ring-2`}
//                               disabled={loading || success}
//                             />
//                           </div>

//                           <div className="space-y-2">
//                             <label className={`block text-xs font-medium ${themeClasses.text.secondary}`}>
//                               Max/Hour
//                             </label>
//                             <input
//                               type="number"
//                               value={formData.max_messages_per_hour || 1000}
//                               onChange={(e) => handleChange('max_messages_per_hour', parseInt(e.target.value) || 1000)}
//                               min="1"
//                               className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input} focus:ring-2`}
//                               disabled={loading || success}
//                             />
//                           </div>

//                           <div className="space-y-2">
//                             <label className={`block text-xs font-medium ${themeClasses.text.secondary}`}>
//                               Max/Day
//                             </label>
//                             <input
//                               type="number"
//                               value={formData.max_messages_per_day || 10000}
//                               onChange={(e) => handleChange('max_messages_per_day', parseInt(e.target.value) || 10000)}
//                               min="1"
//                               className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input} focus:ring-2`}
//                               disabled={loading || success}
//                             />
//                           </div>
//                         </div>
//                       </div>

//                       {/* Gateway Settings */}
//                       <div className="grid grid-cols-2 gap-4">
//                         <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
//                           <div className="flex items-center gap-3">
//                             <ToggleRight className={`w-5 h-5 ${formData.is_active ? 'text-green-500' : 'text-gray-400'}`} />
//                             <div>
//                               <span className={`text-sm font-medium block ${themeClasses.text.primary}`}>
//                                 Active
//                               </span>
//                               <span className={`text-xs ${themeClasses.text.tertiary}`}>
//                                 Gateway can send messages
//                               </span>
//                             </div>
//                           </div>
//                           <input
//                             type="checkbox"
//                             checked={formData.is_active ?? true}
//                             onChange={(e) => handleChange('is_active', e.target.checked)}
//                             className="sr-only"
//                           />
//                           <div className={`w-11 h-6 rounded-full transition-colors ${
//                             (formData.is_active ?? true) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
//                           }`}>
//                             <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
//                               (formData.is_active ?? true) ? 'translate-x-6' : 'translate-x-1'
//                             }`} />
//                           </div>
//                         </label>

//                         <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
//                           <div className="flex items-center gap-3">
//                             <Star className={`w-5 h-5 ${formData.is_default ? 'text-yellow-500' : 'text-gray-400'}`} />
//                             <div>
//                               <span className={`text-sm font-medium block ${themeClasses.text.primary}`}>
//                                 Default Gateway
//                               </span>
//                               <span className={`text-xs ${themeClasses.text.tertiary}`}>
//                                 Use as primary
//                               </span>
//                             </div>
//                           </div>
//                           <input
//                             type="checkbox"
//                             checked={formData.is_default || false}
//                             onChange={(e) => handleChange('is_default', e.target.checked)}
//                             className="sr-only"
//                           />
//                           <div className={`w-11 h-6 rounded-full transition-colors ${
//                             formData.is_default ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-gray-600'
//                           }`}>
//                             <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
//                               formData.is_default ? 'translate-x-6' : 'translate-x-1'
//                             }`} />
//                           </div>
//                         </label>
//                       </div>

//                       {/* Priority */}
//                       <div className="space-y-2">
//                         <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                           Priority
//                         </label>
//                         <input
//                           type="number"
//                           value={formData.priority || 10}
//                           onChange={(e) => handleChange('priority', parseInt(e.target.value) || 10)}
//                           min="1"
//                           max="100"
//                           className={`w-full px-4 py-3 rounded-xl border ${themeClasses.input} focus:ring-2`}
//                           disabled={loading || success}
//                         />
//                         <p className={`text-xs ${themeClasses.text.tertiary}`}>
//                           Lower numbers = higher priority (1-100)
//                         </p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Rule Form */}
//               {type === 'rule' && (
//                 <div className="space-y-5">
//                   {/* Rule Name */}
//                   <div className="space-y-2">
//                     <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                       Rule Name <span className="text-red-500">*</span>
//                     </label>
//                     <div id="field-name">
//                       <input
//                         type="text"
//                         value={formData.name || ''}
//                         onChange={(e) => handleChange('name', e.target.value)}
//                         onBlur={() => handleBlur('name')}
//                         className={`w-full px-4 py-3 rounded-xl border ${
//                           errors.name && touched.name
//                             ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10' 
//                             : themeClasses.input
//                         } transition-all focus:ring-2`}
//                         placeholder="e.g., Welcome SMS for New Clients"
//                         disabled={loading || success}
//                       />
//                     </div>
//                     {errors.name && touched.name && (
//                       <p className="text-sm text-red-500">{errors.name}</p>
//                     )}
//                   </div>

//                   {/* Rule Type & Template */}
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                         Rule Type <span className="text-red-500">*</span>
//                       </label>
//                       <EnhancedSelect
//                         value={formData.rule_type || 'welcome'}
//                         onChange={(value) => handleChange('rule_type', value)}
//                         onBlur={() => handleBlur('rule_type')}
//                         options={ruleTypeOptions}
//                         theme={theme}
//                         disabled={loading || success}
//                         showDescription={true}
//                       />
//                       {errors.rule_type && touched.rule_type && (
//                         <p className="text-sm text-red-500">{errors.rule_type}</p>
//                       )}
//                     </div>

//                     <div className="space-y-2">
//                       <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                         Template <span className="text-red-500">*</span>
//                       </label>
//                       <EnhancedSelect
//                         value={formData.template_id || ''}
//                         onChange={(value) => handleChange('template_id', value)}
//                         onBlur={() => handleBlur('template_id')}
//                         options={templateOptions}
//                         theme={theme}
//                         placeholder="Select template..."
//                         disabled={loading || success}
//                       />
//                       {errors.template_id && touched.template_id && (
//                         <p className="text-sm text-red-500">{errors.template_id}</p>
//                       )}
//                     </div>
//                   </div>

//                   {/* Description */}
//                   <div className="space-y-2">
//                     <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                       Description
//                     </label>
//                     <textarea
//                       value={formData.description || ''}
//                       onChange={(e) => handleChange('description', e.target.value)}
//                       rows={2}
//                       className={`w-full px-4 py-3 rounded-xl border ${themeClasses.input} focus:ring-2 resize-none`}
//                       placeholder="When should this rule trigger?"
//                       disabled={loading || success}
//                     />
//                   </div>

//                   {/* Conditions */}
//                   <div className="space-y-3">
//                     <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                       Trigger Conditions
//                     </label>
                    
//                     <div className="grid grid-cols-2 gap-3">
//                       <EnhancedSelect
//                         value={formData.condition_field || ''}
//                         onChange={(value) => handleChange('condition_field', value)}
//                         options={[
//                           { value: '', label: 'Select field...' },
//                           { value: 'plan_type', label: 'Plan Type' },
//                           { value: 'amount', label: 'Amount' },
//                           { value: 'client_type', label: 'Client Type' },
//                           { value: 'referrer', label: 'Referrer' }
//                         ]}
//                         theme={theme}
//                         disabled={loading || success}
//                       />

//                       <EnhancedSelect
//                         value={formData.condition_operator || ''}
//                         onChange={(value) => handleChange('condition_operator', value)}
//                         options={[
//                           { value: '', label: 'Operator...' },
//                           { value: 'equals', label: 'Equals' },
//                           { value: 'not_equals', label: 'Not Equals' },
//                           { value: 'greater_than', label: 'Greater Than' },
//                           { value: 'less_than', label: 'Less Than' },
//                           { value: 'contains', label: 'Contains' }
//                         ]}
//                         theme={theme}
//                         disabled={loading || success}
//                       />
//                     </div>

//                     <input
//                       type="text"
//                       value={formData.condition_value || ''}
//                       onChange={(e) => handleChange('condition_value', e.target.value)}
//                       className={`w-full px-4 py-3 rounded-xl border ${themeClasses.input} focus:ring-2`}
//                       placeholder="Condition value..."
//                       disabled={loading || success}
//                     />
//                   </div>

//                   {/* Delay & Priority */}
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                         Delay (minutes)
//                       </label>
//                       <input
//                         type="number"
//                         value={formData.delay_minutes || 0}
//                         onChange={(e) => handleChange('delay_minutes', parseInt(e.target.value) || 0)}
//                         onBlur={() => handleBlur('delay_minutes')}
//                         min="0"
//                         max="1440"
//                         className={`w-full px-4 py-3 rounded-xl border ${
//                           errors.delay_minutes && touched.delay_minutes
//                             ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10' 
//                             : themeClasses.input
//                         } focus:ring-2`}
//                         disabled={loading || success}
//                       />
//                       {errors.delay_minutes && touched.delay_minutes && (
//                         <p className="text-sm text-red-500">{errors.delay_minutes}</p>
//                       )}
//                     </div>

//                     <div className="space-y-2">
//                       <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                         Priority
//                       </label>
//                       <EnhancedSelect
//                         value={formData.priority || 'normal'}
//                         onChange={(value) => handleChange('priority', value)}
//                         options={priorityOptions}
//                         theme={theme}
//                         disabled={loading || success}
//                       />
//                     </div>
//                   </div>

//                   {/* Settings */}
//                   <div className="grid grid-cols-2 gap-4">
//                     <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
//                       <div className="flex items-center gap-3">
//                         <ToggleRight className={`w-5 h-5 ${formData.is_active ? 'text-green-500' : 'text-gray-400'}`} />
//                         <div>
//                           <span className={`text-sm font-medium block ${themeClasses.text.primary}`}>
//                             Active
//                           </span>
//                           <span className={`text-xs ${themeClasses.text.tertiary}`}>
//                             Rule can trigger
//                           </span>
//                         </div>
//                       </div>
//                       <input
//                         type="checkbox"
//                         checked={formData.is_active ?? true}
//                         onChange={(e) => handleChange('is_active', e.target.checked)}
//                         className="sr-only"
//                       />
//                       <div className={`w-11 h-6 rounded-full transition-colors ${
//                         (formData.is_active ?? true) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
//                       }`}>
//                         <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
//                           (formData.is_active ?? true) ? 'translate-x-6' : 'translate-x-1'
//                         }`} />
//                       </div>
//                     </label>

//                     <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
//                       <div className="flex items-center gap-3">
//                         <RefreshCw className={`w-5 h-5 ${formData.is_recurring ? 'text-blue-500' : 'text-gray-400'}`} />
//                         <div>
//                           <span className={`text-sm font-medium block ${themeClasses.text.primary}`}>
//                             Recurring
//                           </span>
//                           <span className={`text-xs ${themeClasses.text.tertiary}`}>
//                             Trigger multiple times
//                           </span>
//                         </div>
//                       </div>
//                       <input
//                         type="checkbox"
//                         checked={formData.is_recurring || false}
//                         onChange={(e) => handleChange('is_recurring', e.target.checked)}
//                         className="sr-only"
//                       />
//                       <div className={`w-11 h-6 rounded-full transition-colors ${
//                         formData.is_recurring ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
//                       }`}>
//                         <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
//                           formData.is_recurring ? 'translate-x-6' : 'translate-x-1'
//                         }`} />
//                       </div>
//                     </label>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Footer */}
//             <div className={`px-8 py-6 border-t ${themeClasses.border.light} bg-gray-50 dark:bg-gray-800/50 flex items-center justify-end gap-3`}>
//               <button
//                 type="button"
//                 onClick={() => onClose()}
//                 className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
//                   themeClasses.button.secondary
//                 } ${loading || success ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
//                 disabled={loading || success}
//               >
//                 Cancel
//               </button>

//               <button
//                 type="submit"
//                 disabled={loading || success}
//                 className={`px-8 py-2.5 rounded-xl font-medium transition-all bg-gradient-to-r ${colors.light} dark:${colors.dark} text-white hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2`}
//               >
//                 {loading ? (
//                   <>
//                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                     <span>Creating...</span>
//                   </>
//                 ) : success ? (
//                   <>
//                     <CheckCircle size={18} />
//                     <span>Created!</span>
//                   </>
//                 ) : (
//                   <>
//                     <Save size={18} />
//                     <span>Create {type.charAt(0).toUpperCase() + type.slice(1)}</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         </motion.div>
//       </div>
//     </>
//   );
// };

// export default CreateModal;





import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Send, FileText, Server, Zap, AlertCircle, CheckCircle,
  Eye, EyeOff, HelpCircle, Phone, Mail, User, CreditCard, Key, Shield,
  Globe, Wifi, Clock, Tag, Users, Bell, Calendar, TrendingUp, DollarSign,
  RefreshCw, BarChart3, MessageSquare, Copy, Sparkles, Save, Type,
  Hash, ToggleLeft, ToggleRight, Info, ChevronRight, ChevronLeft,
  Star, Activity, XCircle
} from 'lucide-react';
import { getThemeClasses, EnhancedSelect } from '../../../components/ServiceManagement/Shared/components';

/**
 * Enhanced Create Modal Component with improved UX/UI
 */
const CreateModal = ({
  isOpen,
  onClose,
  type,
  onSubmit,
  gateways = [],
  templates = [],
  theme = 'light',
  initialData = {}
}) => {
  const themeClasses = getThemeClasses(theme);
  
  // Use refs to track mounted state and prevent updates after unmount
  const isMounted = useRef(true);
  
  // State
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({});
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [charCount, setCharCount] = useState(0);
  const [variablePreview, setVariablePreview] = useState([]);

  // Use refs to store previous values for comparison
  const prevInitialDataRef = useRef(initialData);
  const prevTypeRef = useRef(type);
  const initialDataSetRef = useRef(false);

  // Extract variables from template message
  const extractVariables = useCallback((message) => {
    if (!message) {
      setVariablePreview([]);
      return;
    }
    const matches = message.match(/\{\{([^}]+)\}\}/g) || [];
    const variables = matches.map(v => v.replace(/[{}]/g, ''));
    setVariablePreview(variables);
  }, []);

  // Memoize default values based ONLY on type
  const getDefaultValues = useCallback((modalType) => {
    switch (modalType) {
      case 'message':
        return {
          priority: 'normal',
          scheduled_for: '',
          gateway_id: '',
          template_id: ''
        };
      case 'template':
        return {
          template_type: 'welcome',
          is_active: true,
          allow_unicode: false,
          language: 'en',
          category: 'transactional'
        };
      case 'gateway':
        return {
          gateway_type: 'africas_talking',
          is_active: true,
          is_default: false,
          max_messages_per_minute: 60,
          max_messages_per_hour: 1000,
          max_messages_per_day: 10000,
          priority: 10
        };
      case 'rule':
        return {
          rule_type: 'welcome',
          is_active: true,
          is_recurring: false,
          delay_minutes: 0,
          priority: 'normal',
          condition_field: '',
          condition_operator: '',
          condition_value: ''
        };
      default:
        return {};
    }
  }, []);

  // Memoize the merged default values - this will be used in effects
  const mergedInitialData = useMemo(() => {
    const defaults = getDefaultValues(type);
    return { ...defaults, ...initialData };
  }, [type, JSON.stringify(initialData)]); // Stringify for deep comparison

  // Handle body scroll and form reset when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Only reset form when modal opens, not on every render
      if (!initialDataSetRef.current) {
        setFormData(mergedInitialData);
        setErrors({});
        setTouched({});
        setSuccess(false);
        setActiveTab('basic');
        initialDataSetRef.current = true;
        
        // Calculate initial char count for template
        if (type === 'template' && mergedInitialData.message_template) {
          setCharCount(mergedInitialData.message_template.length);
          extractVariables(mergedInitialData.message_template);
        }
      }
      
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scrolling when modal closes
      document.body.style.overflow = 'unset';
      // Reset the ref when modal closes
      initialDataSetRef.current = false;
    }
    
    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]); // Only depend on isOpen

  // Update form data if type changes while modal is open
  useEffect(() => {
    if (isOpen && prevTypeRef.current !== type) {
      setFormData(mergedInitialData);
      setErrors({});
      setTouched({});
      setSuccess(false);
      setActiveTab('basic');
      
      if (type === 'template' && mergedInitialData.message_template) {
        setCharCount(mergedInitialData.message_template.length);
        extractVariables(mergedInitialData.message_template);
      }
      
      prevTypeRef.current = type;
    }
  }, [isOpen, type, mergedInitialData, extractVariables]);

  // Update form data if initialData changes while modal is open (deep comparison)
  useEffect(() => {
    if (isOpen) {
      const initialDataChanged = 
        JSON.stringify(prevInitialDataRef.current) !== JSON.stringify(initialData);
      
      if (initialDataChanged) {
        setFormData(mergedInitialData);
        
        if (type === 'template' && mergedInitialData.message_template) {
          setCharCount(mergedInitialData.message_template.length);
          extractVariables(mergedInitialData.message_template);
        }
        
        prevInitialDataRef.current = initialData;
      }
    }
  }, [isOpen, initialData, type, mergedInitialData, extractVariables]);

  // Set mounted ref
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Handle message template change
  const handleMessageChange = useCallback((value) => {
    setCharCount(value.length);
    extractVariables(value);
    handleChange('message_template', value);
  }, [extractVariables]);

  // Validation rules
  const validateField = useCallback((name, value, allData) => {
    switch (name) {
      case 'name':
        if (!value?.trim()) return 'Name is required';
        if (value.length < 3) return 'Name must be at least 3 characters';
        if (value.length > 100) return 'Name must be less than 100 characters';
        break;

      case 'phone_number':
        if (!value?.trim()) return 'Phone number is required';
        const phoneRegex = /^(\+?254|0)[17]\d{8}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          return 'Invalid phone number (e.g., 0712345678 or +254712345678)';
        }
        break;

      case 'message':
      case 'message_template':
        if (!value?.trim()) return 'Message content is required';
        if (value.length < 5) return 'Message is too short';
        if (value.length > 1000) return 'Message exceeds 1000 characters';
        break;

      case 'gateway_type':
        if (!value) return 'Gateway type is required';
        break;

      case 'api_key':
        if (allData?.gateway_type && allData.gateway_type !== 'custom' && !value?.trim()) {
          return 'API key is required for this gateway type';
        }
        break;

      case 'rule_type':
        if (!value) return 'Rule type is required';
        break;

      case 'template_id':
        if (type === 'rule' && !value) return 'Template selection is required';
        break;

      case 'delay_minutes':
        if (value < 0) return 'Delay cannot be negative';
        if (value > 1440) return 'Delay cannot exceed 24 hours';
        break;

      default:
        break;
    }
    return '';
  }, [type]);

  // Validate entire form
  const validateForm = useCallback(() => {
    const newErrors = {};
    const requiredFields = {
      message: ['phone_number', 'message'],
      template: ['name', 'template_type', 'message_template'],
      gateway: ['name', 'gateway_type'],
      rule: ['name', 'rule_type', 'template_id']
    }[type] || [];

    requiredFields.forEach(field => {
      const error = validateField(field, formData[field], formData);
      if (error) newErrors[field] = error;
    });

    // Additional validation for gateway API key
    if (type === 'gateway' && formData.gateway_type && formData.gateway_type !== 'custom') {
      const apiKeyError = validateField('api_key', formData.api_key, formData);
      if (apiKeyError) newErrors.api_key = apiKeyError;
    }

    return newErrors;
  }, [type, formData, validateField]);

  // Handle input change
  const handleChange = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  // Handle field blur
  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name], formData);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [formData, validateField]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    const allTouched = {};
    Object.keys(formData).forEach(key => allTouched[key] = true);
    setTouched(allTouched);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      
      // Scroll to first error
      const firstErrorField = Object.keys(validationErrors)[0];
      const element = document.getElementById(`field-${firstErrorField}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await onSubmit(formData);
      if (isMounted.current) {
        setSuccess(true);
        setTimeout(() => {
          if (isMounted.current) {
            onClose(true);
          }
        }, 1500);
      }
    } catch (error) {
      console.error('Submission failed:', error);
      if (isMounted.current) {
        setErrors({
          general: error.response?.data?.message || 
                  error.message || 
                  'Failed to create. Please try again.'
        });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [formData, validateForm, onSubmit, onClose]);

  // Get icon based on type
  const getIcon = useCallback(() => {
    switch (type) {
      case 'message': return Send;
      case 'template': return FileText;
      case 'gateway': return Server;
      case 'rule': return Zap;
      default: return FileText;
    }
  }, [type]);

  // Get title based on type
  const getTitle = useCallback(() => {
    switch (type) {
      case 'message': return 'Send New Message';
      case 'template': return 'Create Message Template';
      case 'gateway': return 'Add SMS Gateway';
      case 'rule': return 'Create Automation Rule';
      default: return 'Create New';
    }
  }, [type]);

  const Icon = getIcon();

  // Get color scheme based on type
  const getColorScheme = useCallback(() => {
    switch (type) {
      case 'message': return {
        light: 'from-blue-500 to-blue-600',
        dark: 'from-blue-600 to-blue-700',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-600 dark:text-blue-400',
        icon: 'text-blue-600'
      };
      case 'template': return {
        light: 'from-purple-500 to-purple-600',
        dark: 'from-purple-600 to-purple-700',
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-200 dark:border-purple-800',
        text: 'text-purple-600 dark:text-purple-400',
        icon: 'text-purple-600'
      };
      case 'gateway': return {
        light: 'from-green-500 to-green-600',
        dark: 'from-green-600 to-green-700',
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-600 dark:text-green-400',
        icon: 'text-green-600'
      };
      case 'rule': return {
        light: 'from-orange-500 to-orange-600',
        dark: 'from-orange-600 to-orange-700',
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-200 dark:border-orange-800',
        text: 'text-orange-600 dark:text-orange-400',
        icon: 'text-orange-600'
      };
      default: return {
        light: 'from-gray-500 to-gray-600',
        dark: 'from-gray-600 to-gray-700',
        bg: 'bg-gray-50 dark:bg-gray-900/20',
        border: 'border-gray-200 dark:border-gray-800',
        text: 'text-gray-600 dark:text-gray-400',
        icon: 'text-gray-600'
      };
    }
  }, [type]);

  const colors = getColorScheme();

  // Memoized options
  const gatewayOptions = useMemo(() => [
    { value: '', label: 'Auto-select best gateway' },
    ...gateways
      .filter(g => g.is_active && g.is_online)
      .map(g => ({ 
        value: g.id, 
        label: `${g.name} - ${g.balance ? `${g.currency} ${g.balance}` : 'Balance N/A'}` 
      }))
  ], [gateways]);

  const templateOptions = useMemo(() => [
    { value: '', label: 'Select a template...' },
    ...templates
      .filter(t => t.is_active)
      .map(t => ({ value: t.id, label: t.name }))
  ], [templates]);

  const priorityOptions = useMemo(() => [
    { value: 'urgent', label: 'Urgent', icon: Zap },
    { value: 'high', label: 'High', icon: TrendingUp },
    { value: 'normal', label: 'Normal', icon: Clock },
    { value: 'low', label: 'Low', icon: ChevronRight }
  ], []);

  const templateTypeOptions = useMemo(() => [
    { value: 'welcome', label: 'Welcome', icon: Users, description: 'New client welcome message' },
    { value: 'pppoe_credentials', label: 'PPPoE Credentials', icon: Wifi, description: 'PPPoE account credentials' },
    { value: 'hotspot_credentials', label: 'Hotspot Credentials', icon: Globe, description: 'Hotspot login details' },
    { value: 'payment_success', label: 'Payment Success', icon: CheckCircle, description: 'Successful payment notification' },
    { value: 'payment_reminder', label: 'Payment Reminder', icon: Bell, description: 'Payment due reminder' },
    { value: 'plan_expiry', label: 'Plan Expiry', icon: Calendar, description: 'Plan expiration notice' },
    { value: 'promotional', label: 'Promotional', icon: Tag, description: 'Marketing messages' },
    { value: 'tier_upgrade', label: 'Tier Upgrade', icon: TrendingUp, description: 'Client tier upgrade' },
    { value: 'commission_payout', label: 'Commission Payout', icon: DollarSign, description: 'Commission notification' },
    { value: 'credentials_resend', label: 'Resend Credentials', icon: RefreshCw, description: 'Resend account details' },
    { value: 'custom', label: 'Custom', icon: FileText, description: 'Custom template' }
  ], []);

  const gatewayTypeOptions = useMemo(() => [
    { value: 'africas_talking', label: "Africa's Talking", icon: Globe, description: 'Popular African SMS gateway' },
    { value: 'twilio', label: 'Twilio', icon: MessageSquare, description: 'Global SMS provider' },
    { value: 'smpp', label: 'SMPP', icon: Server, description: 'Direct SMPP connection' },
    { value: 'custom', label: 'Custom API', icon: Zap, description: 'Custom HTTP API integration' }
  ], []);

  const ruleTypeOptions = useMemo(() => [
    { value: 'welcome', label: 'Welcome Message', icon: Users, description: 'Send on client creation' },
    { value: 'pppoe_creation', label: 'PPPoE Creation', icon: Wifi, description: 'Send PPPoE credentials' },
    { value: 'hotspot_creation', label: 'Hotspot Creation', icon: Globe, description: 'Send hotspot credentials' },
    { value: 'payment_success', label: 'Payment Success', icon: CheckCircle, description: 'Send on successful payment' },
    { value: 'payment_failed', label: 'Payment Failed', icon: XCircle, description: 'Send on failed payment' },
    { value: 'payment_reminder', label: 'Payment Reminder', icon: Bell, description: 'Send before due date' },
    { value: 'plan_expiry', label: 'Plan Expiry', icon: Calendar, description: 'Send before plan expires' },
    { value: 'tier_upgrade', label: 'Tier Upgrade', icon: TrendingUp, description: 'Send on tier change' }
  ], []);

  const languageOptions = useMemo(() => [
    { value: 'en', label: 'English', icon: Globe },
    { value: 'sw', label: 'Swahili', icon: Globe },
    { value: 'fr', label: 'French', icon: Globe }
  ], []);

  const categoryOptions = useMemo(() => [
    { value: 'transactional', label: 'Transactional', icon: MessageSquare },
    { value: 'promotional', label: 'Promotional', icon: Tag },
    { value: 'otp', label: 'OTP/Verification', icon: Shield }
  ], []);

  // Scrollbar class
  const scrollbarClass = "overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-500";

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99998] bg-black/50 backdrop-blur-sm"
        onClick={() => !loading && onClose()}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className={`relative w-full max-w-3xl rounded-2xl ${
            themeClasses.bg.card
          } shadow-2xl overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient */}
          <div className={`relative px-8 py-6 bg-gradient-to-r ${colors.light} dark:${colors.dark}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur rounded-2xl">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {getTitle()}
                  </h2>
                  <p className="text-white/80 text-sm mt-1">
                    Fill in the details below to continue
                  </p>
                </div>
              </div>

              <button
                onClick={() => !loading && onClose()}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white/80 hover:text-white"
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Success Banner */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mx-8 mt-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                    <CheckCircle className="text-green-600 dark:text-green-300" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-300">
                      Successfully Created!
                    </h4>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Your {type} has been created. Redirecting...
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs for complex forms */}
          {(type === 'template' || type === 'gateway') && (
            <div className="px-8 pt-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('basic')}
                  className={`pb-3 px-1 text-sm font-medium border-b-2 transition-all ${
                    activeTab === 'basic'
                      ? `${colors.text} border-current`
                      : 'text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Basic Information
                </button>
                <button
                  onClick={() => setActiveTab('advanced')}
                  className={`pb-3 px-1 text-sm font-medium border-b-2 transition-all ${
                    activeTab === 'advanced'
                      ? `${colors.text} border-current`
                      : 'text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Advanced Settings
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className={`px-8 py-6 max-h-[60vh] ${scrollbarClass}`}>
              {/* General Error */}
              {errors.general && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                  <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-medium text-red-800 dark:text-red-300">Error</h4>
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
                  </div>
                </div>
              )}

              {/* Template Form */}
              {type === 'template' && (
                <div className="space-y-6">
                  {/* Basic Tab */}
                  {activeTab === 'basic' && (
                    <>
                      {/* Template Name & Type Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                            Template Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative" id="field-name">
                            <Type className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="text"
                              value={formData.name || ''}
                              onChange={(e) => handleChange('name', e.target.value)}
                              onBlur={() => handleBlur('name')}
                              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                                errors.name && touched.name
                                  ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10' 
                                  : themeClasses.input
                              } transition-all focus:ring-2`}
                              placeholder="e.g., Welcome Message"
                              disabled={loading || success}
                            />
                          </div>
                          {errors.name && touched.name && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle size={14} />
                              {errors.name}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                            Template Type <span className="text-red-500">*</span>
                          </label>
                          <EnhancedSelect
                            value={formData.template_type || 'welcome'}
                            onChange={(value) => handleChange('template_type', value)}
                            onBlur={() => handleBlur('template_type')}
                            options={templateTypeOptions}
                            theme={theme}
                            disabled={loading || success}
                            placeholder="Select type..."
                            showDescription={true}
                          />
                          {errors.template_type && touched.template_type && (
                            <p className="text-sm text-red-500">{errors.template_type}</p>
                          )}
                        </div>
                      </div>

                      {/* Message Template */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                            Message Template <span className="text-red-500">*</span>
                          </label>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            charCount > 900 ? 'bg-red-100 text-red-600' : 
                            charCount > 700 ? 'bg-yellow-100 text-yellow-600' : 
                            'bg-green-100 text-green-600'
                          }`}>
                            {charCount}/1000 chars
                          </span>
                        </div>
                        <div className="relative" id="field-message_template">
                          <textarea
                            value={formData.message_template || ''}
                            onChange={(e) => handleMessageChange(e.target.value)}
                            onBlur={() => handleBlur('message_template')}
                            rows={6}
                            className={`w-full px-4 py-3 rounded-xl border font-mono text-sm ${
                              errors.message_template && touched.message_template
                                ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10' 
                                : themeClasses.input
                            } transition-all focus:ring-2 resize-none`}
                            placeholder="Hello {{client_name}}, your username is {{username}}"
                            disabled={loading || success}
                          />
                        </div>
                        
                        {/* Variable Preview */}
                        {variablePreview.length > 0 && (
                          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <Hash size={14} className="text-gray-500" />
                              <span className={`text-xs font-medium ${themeClasses.text.secondary}`}>
                                Detected Variables:
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {variablePreview.map((variable) => (
                                <span
                                  key={variable}
                                  className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-mono"
                                >
                                  {'{{' + variable + '}}'}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {errors.message_template && touched.message_template && (
                          <p className="text-sm text-red-500">{errors.message_template}</p>
                        )}
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                          Description
                        </label>
                        <textarea
                          value={formData.description || ''}
                          onChange={(e) => handleChange('description', e.target.value)}
                          rows={2}
                          className={`w-full px-4 py-3 rounded-xl border ${themeClasses.input} transition-all focus:ring-2 resize-none`}
                          placeholder="Brief description of this template..."
                          disabled={loading || success}
                        />
                      </div>
                    </>
                  )}

                  {/* Advanced Tab */}
                  {activeTab === 'advanced' && (
                    <div className="space-y-6">
                      {/* Language & Category */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                            Language
                          </label>
                          <EnhancedSelect
                            value={formData.language || 'en'}
                            onChange={(value) => handleChange('language', value)}
                            options={languageOptions}
                            theme={theme}
                            disabled={loading || success}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                            Category
                          </label>
                          <EnhancedSelect
                            value={formData.category || 'transactional'}
                            onChange={(value) => handleChange('category', value)}
                            options={categoryOptions}
                            theme={theme}
                            disabled={loading || success}
                          />
                        </div>
                      </div>

                      {/* Toggle Switches */}
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-center gap-3">
                            <ToggleRight className={`w-5 h-5 ${formData.is_active ? 'text-green-500' : 'text-gray-400'}`} />
                            <div>
                              <span className={`text-sm font-medium block ${themeClasses.text.primary}`}>
                                Active
                              </span>
                              <span className={`text-xs ${themeClasses.text.tertiary}`}>
                                Template can be used
                              </span>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={formData.is_active ?? true}
                            onChange={(e) => handleChange('is_active', e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`w-11 h-6 rounded-full transition-colors ${
                            (formData.is_active ?? true) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}>
                            <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                              (formData.is_active ?? true) ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </div>
                        </label>

                        <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-center gap-3">
                            <Globe className={`w-5 h-5 ${formData.allow_unicode ? 'text-blue-500' : 'text-gray-400'}`} />
                            <div>
                              <span className={`text-sm font-medium block ${themeClasses.text.primary}`}>
                                Allow Unicode
                              </span>
                              <span className={`text-xs ${themeClasses.text.tertiary}`}>
                                Support special characters
                              </span>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={formData.allow_unicode || false}
                            onChange={(e) => handleChange('allow_unicode', e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`w-11 h-6 rounded-full transition-colors ${
                            formData.allow_unicode ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}>
                            <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                              formData.allow_unicode ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </div>
                        </label>
                      </div>

                      {/* Variables Info */}
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <div className="flex items-start gap-3">
                          <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
                          <div>
                            <h4 className={`text-sm font-medium ${themeClasses.text.primary} mb-1`}>
                              Available Variables
                            </h4>
                            <p className={`text-xs ${themeClasses.text.tertiary}`}>
                              Use {'{{variable_name}}'} to insert dynamic content. Common variables: client_name, username, phone_number, plan_name, amount, expiry_date.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Message Form */}
              {type === 'message' && (
                <div className="space-y-5">
                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative" id="field-phone_number">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="tel"
                        value={formData.phone_number || ''}
                        onChange={(e) => handleChange('phone_number', e.target.value)}
                        onBlur={() => handleBlur('phone_number')}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                          errors.phone_number && touched.phone_number
                            ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10' 
                            : themeClasses.input
                        } transition-all focus:ring-2`}
                        placeholder="0712345678 or +254712345678"
                        disabled={loading || success}
                      />
                    </div>
                    {errors.phone_number && touched.phone_number && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.phone_number}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                        Message <span className="text-red-500">*</span>
                      </label>
                      <span className="text-xs text-gray-500">
                        {formData.message?.length || 0}/1000
                      </span>
                    </div>
                    <div id="field-message">
                      <textarea
                        value={formData.message || ''}
                        onChange={(e) => handleChange('message', e.target.value)}
                        onBlur={() => handleBlur('message')}
                        rows={4}
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.message && touched.message
                            ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10' 
                            : themeClasses.input
                        } transition-all focus:ring-2 resize-none`}
                        placeholder="Type your message here..."
                        disabled={loading || success}
                      />
                    </div>
                    {errors.message && touched.message && (
                      <p className="text-sm text-red-500">{errors.message}</p>
                    )}
                  </div>

                  {/* Template Selection */}
                  {templates.length > 0 && (
                    <div className="space-y-2">
                      <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                        Use Template
                      </label>
                      <EnhancedSelect
                        value={formData.template_id || ''}
                        onChange={(value) => {
                          handleChange('template_id', value);
                          const template = templates.find(t => t.id === value);
                          if (template) {
                            handleChange('message', template.message_template);
                          }
                        }}
                        options={templateOptions}
                        theme={theme}
                        placeholder="Select a template..."
                        disabled={loading || success}
                      />
                    </div>
                  )}

                  {/* Priority & Gateway */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                        Priority
                      </label>
                      <EnhancedSelect
                        value={formData.priority || 'normal'}
                        onChange={(value) => handleChange('priority', value)}
                        options={priorityOptions}
                        theme={theme}
                        disabled={loading || success}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                        Gateway
                      </label>
                      <EnhancedSelect
                        value={formData.gateway_id || ''}
                        onChange={(value) => handleChange('gateway_id', value)}
                        options={gatewayOptions}
                        theme={theme}
                        placeholder="Auto-select"
                        disabled={loading || success}
                      />
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                      Schedule (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduled_for || ''}
                      onChange={(e) => handleChange('scheduled_for', e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className={`w-full px-4 py-3 rounded-xl border ${themeClasses.input} focus:ring-2`}
                      disabled={loading || success}
                    />
                  </div>
                </div>
              )}

              {/* Gateway Form */}
              {type === 'gateway' && (
                <div className="space-y-5">
                  {/* Basic Tab */}
                  {activeTab === 'basic' && (
                    <>
                      {/* Gateway Name & Type */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                            Gateway Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                            onBlur={() => handleBlur('name')}
                            className={`w-full px-4 py-3 rounded-xl border ${
                              errors.name && touched.name
                                ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10' 
                                : themeClasses.input
                            } transition-all focus:ring-2`}
                            placeholder="e.g., Africa's Talking"
                            disabled={loading || success}
                          />
                          {errors.name && touched.name && (
                            <p className="text-sm text-red-500">{errors.name}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                            Gateway Type <span className="text-red-500">*</span>
                          </label>
                          <EnhancedSelect
                            value={formData.gateway_type || 'africas_talking'}
                            onChange={(value) => handleChange('gateway_type', value)}
                            onBlur={() => handleBlur('gateway_type')}
                            options={gatewayTypeOptions}
                            theme={theme}
                            disabled={loading || success}
                            showDescription={true}
                          />
                          {errors.gateway_type && touched.gateway_type && (
                            <p className="text-sm text-red-500">{errors.gateway_type}</p>
                          )}
                        </div>
                      </div>

                      {/* API Credentials */}
                      <div className="space-y-4">
                        <h4 className={`text-sm font-medium ${themeClasses.text.primary} flex items-center gap-2`}>
                          <Key size={16} />
                          API Credentials
                        </h4>

                        <div className="space-y-2">
                          <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                            API Key {formData.gateway_type && formData.gateway_type !== 'custom' && <span className="text-red-500">*</span>}
                          </label>
                          <div className="relative" id="field-api_key">
                            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type={showPassword.apiKey ? 'text' : 'password'}
                              value={formData.api_key || ''}
                              onChange={(e) => handleChange('api_key', e.target.value)}
                              onBlur={() => handleBlur('api_key')}
                              className={`w-full pl-10 pr-10 py-3 rounded-xl border ${
                                errors.api_key && touched.api_key
                                  ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10' 
                                  : themeClasses.input
                              } transition-all focus:ring-2`}
                              placeholder="Enter API key"
                              disabled={loading || success}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(prev => ({ ...prev, apiKey: !prev.apiKey }))}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword.apiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                          {errors.api_key && touched.api_key && (
                            <p className="text-sm text-red-500">{errors.api_key}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                            API Secret
                          </label>
                          <div className="relative">
                            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type={showPassword.apiSecret ? 'text' : 'password'}
                              value={formData.api_secret || ''}
                              onChange={(e) => handleChange('api_secret', e.target.value)}
                              className={`w-full pl-10 pr-10 py-3 rounded-xl border ${themeClasses.input} focus:ring-2`}
                              placeholder="Enter API secret (if required)"
                              disabled={loading || success}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(prev => ({ ...prev, apiSecret: !prev.apiSecret }))}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword.apiSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                            Sender ID
                          </label>
                          <input
                            type="text"
                            value={formData.sender_id || ''}
                            onChange={(e) => handleChange('sender_id', e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border ${themeClasses.input} focus:ring-2`}
                            placeholder="e.g., MyCompany"
                            disabled={loading || success}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Advanced Tab */}
                  {activeTab === 'advanced' && (
                    <div className="space-y-6">
                      {/* Rate Limits */}
                      <div className="space-y-4">
                        <h4 className={`text-sm font-medium ${themeClasses.text.primary} flex items-center gap-2`}>
                          <Zap size={16} />
                          Rate Limits
                        </h4>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className={`block text-xs font-medium ${themeClasses.text.secondary}`}>
                              Max/Minute
                            </label>
                            <input
                              type="number"
                              value={formData.max_messages_per_minute || 60}
                              onChange={(e) => handleChange('max_messages_per_minute', parseInt(e.target.value) || 60)}
                              min="1"
                              className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input} focus:ring-2`}
                              disabled={loading || success}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className={`block text-xs font-medium ${themeClasses.text.secondary}`}>
                              Max/Hour
                            </label>
                            <input
                              type="number"
                              value={formData.max_messages_per_hour || 1000}
                              onChange={(e) => handleChange('max_messages_per_hour', parseInt(e.target.value) || 1000)}
                              min="1"
                              className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input} focus:ring-2`}
                              disabled={loading || success}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className={`block text-xs font-medium ${themeClasses.text.secondary}`}>
                              Max/Day
                            </label>
                            <input
                              type="number"
                              value={formData.max_messages_per_day || 10000}
                              onChange={(e) => handleChange('max_messages_per_day', parseInt(e.target.value) || 10000)}
                              min="1"
                              className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input} focus:ring-2`}
                              disabled={loading || success}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Gateway Settings */}
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-center gap-3">
                            <ToggleRight className={`w-5 h-5 ${formData.is_active ? 'text-green-500' : 'text-gray-400'}`} />
                            <div>
                              <span className={`text-sm font-medium block ${themeClasses.text.primary}`}>
                                Active
                              </span>
                              <span className={`text-xs ${themeClasses.text.tertiary}`}>
                                Gateway can send messages
                              </span>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={formData.is_active ?? true}
                            onChange={(e) => handleChange('is_active', e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`w-11 h-6 rounded-full transition-colors ${
                            (formData.is_active ?? true) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}>
                            <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                              (formData.is_active ?? true) ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </div>
                        </label>

                        <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-center gap-3">
                            <Star className={`w-5 h-5 ${formData.is_default ? 'text-yellow-500' : 'text-gray-400'}`} />
                            <div>
                              <span className={`text-sm font-medium block ${themeClasses.text.primary}`}>
                                Default Gateway
                              </span>
                              <span className={`text-xs ${themeClasses.text.tertiary}`}>
                                Use as primary
                              </span>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={formData.is_default || false}
                            onChange={(e) => handleChange('is_default', e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`w-11 h-6 rounded-full transition-colors ${
                            formData.is_default ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}>
                            <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                              formData.is_default ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </div>
                        </label>
                      </div>

                      {/* Priority */}
                      <div className="space-y-2">
                        <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                          Priority
                        </label>
                        <input
                          type="number"
                          value={formData.priority || 10}
                          onChange={(e) => handleChange('priority', parseInt(e.target.value) || 10)}
                          min="1"
                          max="100"
                          className={`w-full px-4 py-3 rounded-xl border ${themeClasses.input} focus:ring-2`}
                          disabled={loading || success}
                        />
                        <p className={`text-xs ${themeClasses.text.tertiary}`}>
                          Lower numbers = higher priority (1-100)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Rule Form */}
              {type === 'rule' && (
                <div className="space-y-5">
                  {/* Rule Name */}
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                      Rule Name <span className="text-red-500">*</span>
                    </label>
                    <div id="field-name">
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                        onBlur={() => handleBlur('name')}
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.name && touched.name
                            ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10' 
                            : themeClasses.input
                        } transition-all focus:ring-2`}
                        placeholder="e.g., Welcome SMS for New Clients"
                        disabled={loading || success}
                      />
                    </div>
                    {errors.name && touched.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  {/* Rule Type & Template */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                        Rule Type <span className="text-red-500">*</span>
                      </label>
                      <EnhancedSelect
                        value={formData.rule_type || 'welcome'}
                        onChange={(value) => handleChange('rule_type', value)}
                        onBlur={() => handleBlur('rule_type')}
                        options={ruleTypeOptions}
                        theme={theme}
                        disabled={loading || success}
                        showDescription={true}
                      />
                      {errors.rule_type && touched.rule_type && (
                        <p className="text-sm text-red-500">{errors.rule_type}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                        Template <span className="text-red-500">*</span>
                      </label>
                      <EnhancedSelect
                        value={formData.template_id || ''}
                        onChange={(value) => handleChange('template_id', value)}
                        onBlur={() => handleBlur('template_id')}
                        options={templateOptions}
                        theme={theme}
                        placeholder="Select template..."
                        disabled={loading || success}
                      />
                      {errors.template_id && touched.template_id && (
                        <p className="text-sm text-red-500">{errors.template_id}</p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                      Description
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => handleChange('description', e.target.value)}
                      rows={2}
                      className={`w-full px-4 py-3 rounded-xl border ${themeClasses.input} focus:ring-2 resize-none`}
                      placeholder="When should this rule trigger?"
                      disabled={loading || success}
                    />
                  </div>

                  {/* Conditions */}
                  <div className="space-y-3">
                    <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                      Trigger Conditions
                    </label>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <EnhancedSelect
                        value={formData.condition_field || ''}
                        onChange={(value) => handleChange('condition_field', value)}
                        options={[
                          { value: '', label: 'Select field...' },
                          { value: 'plan_type', label: 'Plan Type' },
                          { value: 'amount', label: 'Amount' },
                          { value: 'client_type', label: 'Client Type' },
                          { value: 'referrer', label: 'Referrer' }
                        ]}
                        theme={theme}
                        disabled={loading || success}
                      />

                      <EnhancedSelect
                        value={formData.condition_operator || ''}
                        onChange={(value) => handleChange('condition_operator', value)}
                        options={[
                          { value: '', label: 'Operator...' },
                          { value: 'equals', label: 'Equals' },
                          { value: 'not_equals', label: 'Not Equals' },
                          { value: 'greater_than', label: 'Greater Than' },
                          { value: 'less_than', label: 'Less Than' },
                          { value: 'contains', label: 'Contains' }
                        ]}
                        theme={theme}
                        disabled={loading || success}
                      />
                    </div>

                    <input
                      type="text"
                      value={formData.condition_value || ''}
                      onChange={(e) => handleChange('condition_value', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${themeClasses.input} focus:ring-2`}
                      placeholder="Condition value..."
                      disabled={loading || success}
                    />
                  </div>

                  {/* Delay & Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                        Delay (minutes)
                      </label>
                      <input
                        type="number"
                        value={formData.delay_minutes || 0}
                        onChange={(e) => handleChange('delay_minutes', parseInt(e.target.value) || 0)}
                        onBlur={() => handleBlur('delay_minutes')}
                        min="0"
                        max="1440"
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.delay_minutes && touched.delay_minutes
                            ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10' 
                            : themeClasses.input
                        } focus:ring-2`}
                        disabled={loading || success}
                      />
                      {errors.delay_minutes && touched.delay_minutes && (
                        <p className="text-sm text-red-500">{errors.delay_minutes}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                        Priority
                      </label>
                      <EnhancedSelect
                        value={formData.priority || 'normal'}
                        onChange={(value) => handleChange('priority', value)}
                        options={priorityOptions}
                        theme={theme}
                        disabled={loading || success}
                      />
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <ToggleRight className={`w-5 h-5 ${formData.is_active ? 'text-green-500' : 'text-gray-400'}`} />
                        <div>
                          <span className={`text-sm font-medium block ${themeClasses.text.primary}`}>
                            Active
                          </span>
                          <span className={`text-xs ${themeClasses.text.tertiary}`}>
                            Rule can trigger
                          </span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.is_active ?? true}
                        onChange={(e) => handleChange('is_active', e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-11 h-6 rounded-full transition-colors ${
                        (formData.is_active ?? true) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}>
                        <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                          (formData.is_active ?? true) ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </div>
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <RefreshCw className={`w-5 h-5 ${formData.is_recurring ? 'text-blue-500' : 'text-gray-400'}`} />
                        <div>
                          <span className={`text-sm font-medium block ${themeClasses.text.primary}`}>
                            Recurring
                          </span>
                          <span className={`text-xs ${themeClasses.text.tertiary}`}>
                            Trigger multiple times
                          </span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.is_recurring || false}
                        onChange={(e) => handleChange('is_recurring', e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-11 h-6 rounded-full transition-colors ${
                        formData.is_recurring ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}>
                        <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                          formData.is_recurring ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`px-8 py-6 border-t ${themeClasses.border.light} bg-gray-50 dark:bg-gray-800/50 flex items-center justify-end gap-3`}>
              <button
                type="button"
                onClick={() => onClose()}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                  themeClasses.button.secondary
                } ${loading || success ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                disabled={loading || success}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || success}
                className={`px-8 py-2.5 rounded-xl font-medium transition-all bg-gradient-to-r ${colors.light} dark:${colors.dark} text-white hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : success ? (
                  <>
                    <CheckCircle size={18} />
                    <span>Created!</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Create {type.charAt(0).toUpperCase() + type.slice(1)}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default CreateModal;