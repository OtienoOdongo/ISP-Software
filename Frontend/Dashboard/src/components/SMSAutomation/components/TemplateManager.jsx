






// import React, { useState, useMemo } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   FileText, Edit, Trash2, Copy, Search, Filter,
//   Eye, EyeOff, CheckCircle, XCircle, Plus, Loader,
//   BarChart3, Users, Calendar, Bell, Tag, Globe,
//   MessageSquare, AlertCircle, ChevronDown, ChevronUp,
//   Grid, List, Wifi, RefreshCw, TrendingUp, DollarSign,
//   Zap, Clock
// } from 'lucide-react';
// import { EnhancedSelect, ConfirmationModal, EmptyState, getThemeClasses } from '../../../components/ServiceManagement/Shared/components';
// import { formatNumber, formatTimeAgo } from '../utils/formatters';

// const TemplateManager = ({
//   templates = [],
//   loading,
//   theme,
//   themeClasses,
//   onRefresh,
//   onDuplicate,
//   onTestRender,
//   onEdit,
//   onDelete,
//   viewMode = 'grid',
//   searchTerm = '',
//   statusFilter = 'all'
// }) => {
//   const [expandedTemplate, setExpandedTemplate] = useState(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [templateToDelete, setTemplateToDelete] = useState(null);
//   const [showPreview, setShowPreview] = useState(false);
//   const [previewData, setPreviewData] = useState(null);
//   const [isTesting, setIsTesting] = useState(false);
//   const [previewFormData, setPreviewFormData] = useState({});
//   const [showPreviewModal, setShowPreviewModal] = useState(false);
//   const [templateToPreview, setTemplateToPreview] = useState(null);

//   // Template type configuration
//   const templateTypes = useMemo(() => ({
//     welcome: { 
//       icon: Users, 
//       color: 'green', 
//       bgColor: 'bg-green-100',
//       textColor: 'text-green-600',
//       label: 'Welcome',
//       description: 'Welcome message for new clients'
//     },
//     pppoe_credentials: { 
//       icon: Wifi, 
//       color: 'blue', 
//       bgColor: 'bg-blue-100',
//       textColor: 'text-blue-600',
//       label: 'PPPoE Credentials',
//       description: 'PPPoE account credentials'
//     },
//     payment_reminder: { 
//       icon: Bell, 
//       color: 'yellow', 
//       bgColor: 'bg-yellow-100',
//       textColor: 'text-yellow-600',
//       label: 'Payment Reminder',
//       description: 'Payment due reminders'
//     },
//     plan_expiry: { 
//       icon: Calendar, 
//       color: 'orange', 
//       bgColor: 'bg-orange-100',
//       textColor: 'text-orange-600',
//       label: 'Plan Expiry',
//       description: 'Plan expiration notifications'
//     },
//     promotional: { 
//       icon: Tag, 
//       color: 'purple', 
//       bgColor: 'bg-purple-100',
//       textColor: 'text-purple-600',
//       label: 'Promotional',
//       description: 'Marketing and promotions'
//     },
//     system: { 
//       icon: BarChart3, 
//       color: 'red', 
//       bgColor: 'bg-red-100',
//       textColor: 'text-red-600',
//       label: 'System',
//       description: 'System notifications'
//     },
//     hotspot_welcome: { 
//       icon: Globe, 
//       color: 'indigo', 
//       bgColor: 'bg-indigo-100',
//       textColor: 'text-indigo-600',
//       label: 'Hotspot Welcome',
//       description: 'Hotspot welcome messages'
//     },
//     credentials_resend: { 
//       icon: RefreshCw, 
//       color: 'pink', 
//       bgColor: 'bg-pink-100',
//       textColor: 'text-pink-600',
//       label: 'Credentials Resend',
//       description: 'Resend credentials'
//     },
//     tier_upgrade: { 
//       icon: TrendingUp, 
//       color: 'teal', 
//       bgColor: 'bg-teal-100',
//       textColor: 'text-teal-600',
//       label: 'Tier Upgrade',
//       description: 'Tier upgrade notifications'
//     },
//     commission_payout: { 
//       icon: DollarSign, 
//       color: 'emerald', 
//       bgColor: 'bg-emerald-100',
//       textColor: 'text-emerald-600',
//       label: 'Commission Payout',
//       description: 'Commission notifications'
//     },
//     custom: { 
//       icon: FileText, 
//       color: 'gray', 
//       bgColor: 'bg-gray-100',
//       textColor: 'text-gray-600',
//       label: 'Custom',
//       description: 'Custom template'
//     }
//   }), []);

//   // Filter templates
//   const filteredTemplates = useMemo(() => {
//     let filtered = templates;

//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(t =>
//         t.name?.toLowerCase().includes(term) ||
//         t.description?.toLowerCase().includes(term) ||
//         t.message_template?.toLowerCase().includes(term) ||
//         t.template_type?.toLowerCase().includes(term)
//       );
//     }

//     if (statusFilter !== 'all') {
//       filtered = filtered.filter(t =>
//         statusFilter === 'active' ? t.is_active : !t.is_active
//       );
//     }

//     return filtered;
//   }, [templates, searchTerm, statusFilter]);

//   // Statistics
//   const stats = useMemo(() => {
//     const total = templates.length;
//     const active = templates.filter(t => t.is_active).length;
//     const system = templates.filter(t => t.is_system).length;
//     const totalUsage = templates.reduce((sum, t) => sum + (t.usage_count || 0), 0);
//     const types = Object.keys(templateTypes).reduce((acc, type) => {
//       acc[type] = templates.filter(t => t.template_type === type).length;
//       return acc;
//     }, {});

//     return { total, active, system, totalUsage, types };
//   }, [templates, templateTypes]);

//   const handlePreviewClick = (template) => {
//     setTemplateToPreview(template);
//     setPreviewFormData({
//       client_name: 'John Doe',
//       username: 'johndoe123',
//       phone_number: '+254712345678',
//       plan_name: 'Business 10GB',
//       amount: '1500',
//       expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//       remaining_days: '7',
//       data_used: '8.5',
//       data_limit: '10'
//     });
//     setShowPreviewModal(true);
//   };

//   const handleTestRender = async () => {
//     if (!templateToPreview) return;
    
//     setIsTesting(true);
//     try {
//       const response = await onTestRender(templateToPreview.id, {
//         test_data: previewFormData
//       });
//       setPreviewData(response);
//       setShowPreviewModal(false);
//       setShowPreview(true);
//     } catch (error) {
//       console.error('Test render failed:', error);
//       setPreviewData({ 
//         success: false, 
//         message: error.response?.data?.message || 'Failed to render template' 
//       });
//       setShowPreview(true);
//     } finally {
//       setIsTesting(false);
//     }
//   };

//   const handleDuplicate = async (templateId) => {
//     try {
//       await onDuplicate(templateId);
//       onRefresh();
//     } catch (error) {
//       console.error('Duplicate failed:', error);
//     }
//   };

//   const handleDelete = async () => {
//     if (!templateToDelete) return;
//     try {
//       await onDelete(templateToDelete.id);
//       onRefresh();
//       setShowDeleteModal(false);
//       setTemplateToDelete(null);
//     } catch (error) {
//       console.error('Delete failed:', error);
//     }
//   };

//   const extractVariables = (template) => {
//     const matches = template.message_template?.match(/\{\{([^}]+)\}\}/g) || [];
//     return matches.map(v => v.replace(/[{}]/g, ''));
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
//         <span className={`ml-3 ${themeClasses.text.secondary}`}>Loading templates...</span>
//       </div>
//     );
//   }

//   if (filteredTemplates.length === 0) {
//     return (
//       <EmptyState
//         icon={FileText}
//         title="No templates found"
//         description={searchTerm || statusFilter !== 'all'
//           ? "No templates match your search criteria"
//           : "Create your first SMS template to get started"
//         }
//         actionLabel="Create Template"
//         onAction={() => { }}
//         theme={theme}
//       />
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {/* Statistics - Responsive grid */}
//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//         <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>Total</p>
//           <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>{stats.total}</p>
//         </div>
//         <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>Active</p>
//           <p className={`text-2xl font-bold text-green-500`}>{stats.active}</p>
//         </div>
//         <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>System</p>
//           <p className={`text-2xl font-bold text-blue-500`}>{stats.system}</p>
//         </div>
//         <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>Total Uses</p>
//           <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>{formatNumber(stats.totalUsage)}</p>
//         </div>
//       </div>

//       {/* Templates Grid/List - Responsive */}
//       {viewMode === 'grid' ? (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {filteredTemplates.map((template) => {
//             const config = templateTypes[template.template_type] || templateTypes.custom;
//             const Icon = config.icon;
//             const variables = extractVariables(template);
//             const requiredVars = template.required_variables || [];

//             return (
//               <motion.div
//                 key={template.id}
//                 layout
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 className={`p-5 rounded-lg border transition-all hover:shadow-lg ${
//                   themeClasses.bg.card
//                 } ${themeClasses.border.light} ${
//                   expandedTemplate === template.id ? 'ring-2 ring-indigo-500' : ''
//                 }`}
//               >
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="flex items-center gap-3">
//                     <div className={`p-2.5 rounded-xl ${config.bgColor} ${config.textColor}`}>
//                       <Icon className="w-5 h-5" />
//                     </div>
//                     <div>
//                       <h3 className={`font-medium flex items-center gap-2 ${themeClasses.text.primary}`}>
//                         {template.name}
//                         {template.is_system && (
//                           <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
//                             System
//                           </span>
//                         )}
//                       </h3>
//                       <p className={`text-xs ${themeClasses.text.secondary}`}>
//                         {config.label}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-1">
//                     <span className={`p-1.5 rounded-full ${
//                       template.is_active 
//                         ? 'bg-green-100 text-green-600' 
//                         : 'bg-gray-100 text-gray-400'
//                     }`}>
//                       {template.is_active ? (
//                         <CheckCircle className="w-4 h-4" />
//                       ) : (
//                         <XCircle className="w-4 h-4" />
//                       )}
//                     </span>
//                     <button
//                       onClick={() => setExpandedTemplate(expandedTemplate === template.id ? null : template.id)}
//                       className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//                     >
//                       {expandedTemplate === template.id ? (
//                         <ChevronUp className="w-4 h-4" />
//                       ) : (
//                         <ChevronDown className="w-4 h-4" />
//                       )}
//                     </button>
//                   </div>
//                 </div>

//                 <div className={`mb-4 p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//                   <p className="text-sm line-clamp-3 font-mono">
//                     {template.message_template}
//                   </p>
//                 </div>

//                 <div className="flex items-center justify-between text-xs mb-4">
//                   <span className={themeClasses.text.secondary}>
//                     {template.language?.toUpperCase() || 'EN'}
//                   </span>
//                   <span className={themeClasses.text.secondary}>
//                     {template.character_count || 0} chars
//                   </span>
//                   <span className={themeClasses.text.secondary}>
//                     {formatNumber(template.usage_count || 0)} uses
//                   </span>
//                 </div>

//                 {variables.length > 0 && (
//                   <div className="mb-4">
//                     <p className={`text-xs mb-2 ${themeClasses.text.secondary}`}>Variables:</p>
//                     <div className="flex flex-wrap gap-1">
//                       {variables.slice(0, 4).map((variable) => (
//                         <span
//                           key={variable}
//                           className={`px-2 py-1 text-xs rounded ${
//                             requiredVars.includes(variable)
//                               ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
//                               : themeClasses.bg.secondary
//                           }`}
//                         >
//                           {variable}
//                           {requiredVars.includes(variable) && '*'}
//                         </span>
//                       ))}
//                       {variables.length > 4 && (
//                         <span className={`px-2 py-1 text-xs rounded ${themeClasses.bg.secondary}`}>
//                           +{variables.length - 4}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => handlePreviewClick(template)}
//                     className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm ${
//                       themeClasses.button.secondary
//                     }`}
//                   >
//                     <Eye className="w-4 h-4" />
//                     <span className="hidden sm:inline">Preview</span>
//                   </button>

//                   <button
//                     onClick={() => handleDuplicate(template.id)}
//                     className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm ${
//                       themeClasses.button.secondary
//                     }`}
//                   >
//                     <Copy className="w-4 h-4" />
//                     <span className="hidden sm:inline">Copy</span>
//                   </button>

//                   {!template.is_system && (
//                     <button
//                       onClick={() => {
//                         setTemplateToDelete(template);
//                         setShowDeleteModal(true);
//                       }}
//                       className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm ${
//                         themeClasses.button.danger
//                       }`}
//                     >
//                       <Trash2 className="w-4 h-4" />
//                       <span className="hidden sm:inline">Delete</span>
//                     </button>
//                   )}
//                 </div>

//                 {/* Expanded Details */}
//                 {expandedTemplate === template.id && (
//                   <motion.div
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: 'auto' }}
//                     exit={{ opacity: 0, height: 0 }}
//                     className={`mt-4 pt-4 border-t ${themeClasses.border.light}`}
//                   >
//                     <div className="space-y-3 text-sm">
//                       {template.description && (
//                         <div>
//                           <p className={`text-xs ${themeClasses.text.secondary}`}>Description:</p>
//                           <p className="mt-1">{template.description}</p>
//                         </div>
//                       )}

//                       <div className="flex justify-between">
//                         <span className={themeClasses.text.secondary}>Created:</span>
//                         <span className={themeClasses.text.primary}>
//                           {new Date(template.created_at).toLocaleDateString()}
//                         </span>
//                       </div>

//                       {template.last_used && (
//                         <div className="flex justify-between">
//                           <span className={themeClasses.text.secondary}>Last Used:</span>
//                           <span className={themeClasses.text.primary}>
//                             {formatTimeAgo(template.last_used)}
//                           </span>
//                         </div>
//                       )}

//                       <div className="flex justify-between">
//                         <span className={themeClasses.text.secondary}>Max Length:</span>
//                         <span className={themeClasses.text.primary}>
//                           {template.max_length || 160} chars
//                         </span>
//                       </div>

//                       <div className="flex justify-between">
//                         <span className={themeClasses.text.secondary}>Unicode:</span>
//                         <span className={themeClasses.text.primary}>
//                           {template.allow_unicode ? 'Yes' : 'No'}
//                         </span>
//                       </div>

//                       {variables.length > 0 && (
//                         <div>
//                           <p className={`text-xs mb-1 ${themeClasses.text.secondary}`}>All Variables:</p>
//                           <div className="flex flex-wrap gap-1">
//                             {variables.map((variable) => (
//                               <span
//                                 key={variable}
//                                 className={`px-2 py-1 text-xs rounded ${
//                                   requiredVars.includes(variable)
//                                     ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
//                                     : themeClasses.bg.secondary
//                                 }`}
//                               >
//                                 {variable}
//                               </span>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </motion.div>
//                 )}
//               </motion.div>
//             );
//           })}
//         </div>
//       ) : (
//         <div className={`rounded-lg border overflow-x-auto ${themeClasses.border.light}`}>
//           <table className="w-full min-w-[800px]">
//             <thead className={themeClasses.bg.secondary}>
//               <tr>
//                 <th className="p-4 text-left text-xs font-medium">Template</th>
//                 <th className="p-4 text-left text-xs font-medium">Type</th>
//                 <th className="p-4 text-left text-xs font-medium">Status</th>
//                 <th className="p-4 text-right text-xs font-medium">Usage</th>
//                 <th className="p-4 text-right text-xs font-medium">Chars</th>
//                 <th className="p-4 text-left text-xs font-medium">Last Used</th>
//                 <th className="p-4 text-center text-xs font-medium">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//               {filteredTemplates.map((template) => {
//                 const config = templateTypes[template.template_type] || templateTypes.custom;
//                 const Icon = config.icon;

//                 return (
//                   <tr key={template.id} className={`hover:${themeClasses.bg.secondary} transition-colors`}>
//                     <td className="p-4">
//                       <div className="flex items-center gap-3">
//                         <div className={`p-2 rounded-lg ${config.bgColor} ${config.textColor}`}>
//                           <Icon className="w-4 h-4" />
//                         </div>
//                         <div>
//                           <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
//                             {template.name}
//                           </span>
//                           {template.is_system && (
//                             <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded">
//                               System
//                             </span>
//                           )}
//                           <p className={`text-xs ${themeClasses.text.secondary}`}>
//                             {template.message_template?.substring(0, 50)}...
//                           </p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="p-4">
//                       <span className={`text-sm ${themeClasses.text.secondary}`}>
//                         {config.label}
//                       </span>
//                     </td>
//                     <td className="p-4">
//                       {template.is_active ? (
//                         <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
//                           Active
//                         </span>
//                       ) : (
//                         <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-full">
//                           Inactive
//                         </span>
//                       )}
//                     </td>
//                     <td className="p-4 text-right text-sm">
//                       {formatNumber(template.usage_count || 0)}
//                     </td>
//                     <td className="p-4 text-right text-sm">
//                       {template.character_count || 0}
//                     </td>
//                     <td className="p-4 text-sm">
//                       {template.last_used ? formatTimeAgo(template.last_used) : 'Never'}
//                     </td>
//                     <td className="p-4">
//                       <div className="flex items-center justify-center gap-2">
//                         <button
//                           onClick={() => handlePreviewClick(template)}
//                           className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
//                           title="Preview"
//                         >
//                           <Eye className="w-4 h-4" />
//                         </button>
//                         <button
//                           onClick={() => handleDuplicate(template.id)}
//                           className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
//                           title="Duplicate"
//                         >
//                           <Copy className="w-4 h-4" />
//                         </button>
//                         {!template.is_system && (
//                           <button
//                             onClick={() => {
//                               setTemplateToDelete(template);
//                               setShowDeleteModal(true);
//                             }}
//                             className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
//                             title="Delete"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Preview Input Modal */}
//       <AnimatePresence>
//         {showPreviewModal && templateToPreview && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.95 }}
//               className={`w-full max-w-md rounded-xl shadow-lg ${themeClasses.bg.card}`}
//             >
//               <div className={`p-6 border-b ${themeClasses.border.light}`}>
//                 <h3 className={`text-lg font-bold ${themeClasses.text.primary}`}>
//                   Preview: {templateToPreview.name}
//                 </h3>
//                 <p className={`text-sm ${themeClasses.text.secondary}`}>
//                   Enter test data to preview the template
//                 </p>
//               </div>

//               <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                     Client Name
//                   </label>
//                   <input
//                     type="text"
//                     value={previewFormData.client_name}
//                     onChange={(e) => setPreviewFormData(prev => ({ ...prev, client_name: e.target.value }))}
//                     className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
//                   />
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                     Username
//                   </label>
//                   <input
//                     type="text"
//                     value={previewFormData.username}
//                     onChange={(e) => setPreviewFormData(prev => ({ ...prev, username: e.target.value }))}
//                     className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
//                   />
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                     Phone Number
//                   </label>
//                   <input
//                     type="tel"
//                     value={previewFormData.phone_number}
//                     onChange={(e) => setPreviewFormData(prev => ({ ...prev, phone_number: e.target.value }))}
//                     className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
//                   />
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                     Plan Name
//                   </label>
//                   <input
//                     type="text"
//                     value={previewFormData.plan_name}
//                     onChange={(e) => setPreviewFormData(prev => ({ ...prev, plan_name: e.target.value }))}
//                     className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
//                   />
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                     Amount
//                   </label>
//                   <input
//                     type="text"
//                     value={previewFormData.amount}
//                     onChange={(e) => setPreviewFormData(prev => ({ ...prev, amount: e.target.value }))}
//                     className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
//                   />
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                     Expiry Date
//                   </label>
//                   <input
//                     type="date"
//                     value={previewFormData.expiry_date}
//                     onChange={(e) => setPreviewFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
//                     className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
//                   />
//                 </div>
//               </div>

//               <div className={`p-6 border-t flex justify-end gap-3 ${themeClasses.border.light}`}>
//                 <button
//                   onClick={() => setShowPreviewModal(false)}
//                   className={`px-4 py-2 rounded-lg ${themeClasses.button.secondary}`}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleTestRender}
//                   disabled={isTesting}
//                   className={`px-4 py-2 rounded-lg ${themeClasses.button.primary} flex items-center gap-2`}
//                 >
//                   {isTesting ? (
//                     <>
//                       <Loader className="w-4 h-4 animate-spin" />
//                       Rendering...
//                     </>
//                   ) : (
//                     <>
//                       <Eye className="w-4 h-4" />
//                       Preview
//                     </>
//                   )}
//                 </button>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//       {/* Preview Result Modal */}
//       <AnimatePresence>
//         {showPreview && previewData && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.95 }}
//               className={`w-full max-w-2xl rounded-xl shadow-lg ${themeClasses.bg.card}`}
//             >
//               <div className={`p-6 border-b ${themeClasses.border.light}`}>
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     {previewData.success ? (
//                       <CheckCircle className="w-6 h-6 text-green-500" />
//                     ) : (
//                       <AlertCircle className="w-6 h-6 text-red-500" />
//                     )}
//                     <h3 className={`text-lg font-bold ${themeClasses.text.primary}`}>
//                       {previewData.success ? 'Preview Generated' : 'Preview Failed'}
//                     </h3>
//                   </div>
//                   <button
//                     onClick={() => {
//                       setShowPreview(false);
//                       setPreviewData(null);
//                     }}
//                     className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
//                   >
//                     <XCircle className="w-5 h-5" />
//                   </button>
//                 </div>
//               </div>

//               <div className="p-6 max-h-[60vh] overflow-y-auto">
//                 {previewData.success ? (
//                   <div className="space-y-4">
//                     <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
//                       <p className="whitespace-pre-wrap font-mono text-sm">
//                         {previewData.rendered_message}
//                       </p>
//                     </div>

//                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
//                       <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//                         <p className={`text-xs ${themeClasses.text.secondary}`}>Length</p>
//                         <p className={`text-lg font-bold ${themeClasses.text.primary}`}>
//                           {previewData.analysis?.message_length || 0}
//                         </p>
//                       </div>
//                       <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//                         <p className={`text-xs ${themeClasses.text.secondary}`}>SMS Parts</p>
//                         <p className={`text-lg font-bold ${themeClasses.text.primary}`}>
//                           {previewData.analysis?.estimated_parts || 1}
//                         </p>
//                       </div>
//                       <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//                         <p className={`text-xs ${themeClasses.text.secondary}`}>Unicode</p>
//                         <p className={`text-lg font-bold ${themeClasses.text.primary}`}>
//                           {previewData.analysis?.has_unicode ? 'Yes' : 'No'}
//                         </p>
//                       </div>
//                     </div>

//                     {previewData.analysis?.variables_used?.length > 0 && (
//                       <div>
//                         <p className={`text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                           Variables Used:
//                         </p>
//                         <div className="flex flex-wrap gap-2">
//                           {previewData.analysis.variables_used.map((v) => (
//                             <span
//                               key={v}
//                               className={`px-3 py-1 text-sm rounded-full ${themeClasses.bg.secondary}`}
//                             >
//                               {v}
//                             </span>
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                     {previewData.analysis?.missing_variables?.length > 0 && (
//                       <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg dark:bg-yellow-900/30 dark:text-yellow-300">
//                         <p className="font-medium mb-1">Missing Variables:</p>
//                         <p className="text-sm">{previewData.analysis.missing_variables.join(', ')}</p>
//                       </div>
//                     )}
//                   </div>
//                 ) : (
//                   <div className="text-center py-8">
//                     <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
//                     <p className={`font-medium mb-2 ${themeClasses.text.primary}`}>
//                       Failed to render preview
//                     </p>
//                     <p className={themeClasses.text.secondary}>
//                       {previewData.message || 'Unknown error occurred'}
//                     </p>
//                   </div>
//                 )}
//               </div>

//               <div className={`p-6 border-t flex justify-end ${themeClasses.border.light}`}>
//                 <button
//                   onClick={() => {
//                     setShowPreview(false);
//                     setPreviewData(null);
//                   }}
//                   className={`px-6 py-2 rounded-lg ${themeClasses.button.primary}`}
//                 >
//                   Close
//                 </button>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//       {/* Delete Confirmation Modal */}
//       <AnimatePresence>
//         {showDeleteModal && (
//           <ConfirmationModal
//             isOpen={showDeleteModal}
//             onClose={() => {
//               setShowDeleteModal(false);
//               setTemplateToDelete(null);
//             }}
//             onConfirm={handleDelete}
//             title="Delete Template"
//             message={`Are you sure you want to delete "${templateToDelete?.name}"? This action cannot be undone.`}
//             type="danger"
//             theme={theme}
//           />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default TemplateManager;













// import React, { useState, useMemo } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   FileText, Edit, Trash2, Copy, Search, Filter,
//   Eye, EyeOff, CheckCircle, XCircle, Plus, Loader,
//   BarChart3, Users, Calendar, Bell, Tag, Globe,
//   MessageSquare, AlertCircle, ChevronDown, ChevronUp,
//   Grid, List, Wifi, RefreshCw, TrendingUp, DollarSign,
//   Zap, Clock, Type, Hash, Star
// } from 'lucide-react';
// import { EnhancedSelect, ConfirmationModal, EmptyState, getThemeClasses } from '../../../components/ServiceManagement/Shared/components';
// import { formatNumber, formatTimeAgo } from '../utils/formatters';

// const TemplateManager = ({
//   templates = [],
//   loading,
//   theme,
//   themeClasses,
//   onRefresh,
//   onCreateClick,
//   onDuplicate,
//   onTestRender,
//   onEdit,
//   onDelete,
//   viewMode = 'grid',
//   searchTerm = '',
//   statusFilter = 'all'
// }) => {
//   const [expandedTemplate, setExpandedTemplate] = useState(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [templateToDelete, setTemplateToDelete] = useState(null);
//   const [showPreview, setShowPreview] = useState(false);
//   const [previewData, setPreviewData] = useState(null);
//   const [isTesting, setIsTesting] = useState(false);
//   const [previewFormData, setPreviewFormData] = useState({});
//   const [showPreviewModal, setShowPreviewModal] = useState(false);
//   const [templateToPreview, setTemplateToPreview] = useState(null);

//   // Template type configuration
//   const templateTypes = useMemo(() => ({
//     welcome: { 
//       icon: Users, 
//       color: 'green', 
//       bgColor: 'bg-green-100',
//       textColor: 'text-green-600',
//       label: 'Welcome',
//       description: 'Welcome message for new clients'
//     },
//     pppoe_credentials: { 
//       icon: Wifi, 
//       color: 'blue', 
//       bgColor: 'bg-blue-100',
//       textColor: 'text-blue-600',
//       label: 'PPPoE Credentials',
//       description: 'PPPoE account credentials'
//     },
//     hotspot_credentials: { 
//       icon: Globe, 
//       color: 'indigo', 
//       bgColor: 'bg-indigo-100',
//       textColor: 'text-indigo-600',
//       label: 'Hotspot Credentials',
//       description: 'Hotspot login details'
//     },
//     payment_success: { 
//       icon: CheckCircle, 
//       color: 'green', 
//       bgColor: 'bg-green-100',
//       textColor: 'text-green-600',
//       label: 'Payment Success',
//       description: 'Successful payment notification'
//     },
//     payment_reminder: { 
//       icon: Bell, 
//       color: 'yellow', 
//       bgColor: 'bg-yellow-100',
//       textColor: 'text-yellow-600',
//       label: 'Payment Reminder',
//       description: 'Payment due reminders'
//     },
//     plan_expiry: { 
//       icon: Calendar, 
//       color: 'orange', 
//       bgColor: 'bg-orange-100',
//       textColor: 'text-orange-600',
//       label: 'Plan Expiry',
//       description: 'Plan expiration notifications'
//     },
//     promotional: { 
//       icon: Tag, 
//       color: 'purple', 
//       bgColor: 'bg-purple-100',
//       textColor: 'text-purple-600',
//       label: 'Promotional',
//       description: 'Marketing and promotions'
//     },
//     system: { 
//       icon: BarChart3, 
//       color: 'red', 
//       bgColor: 'bg-red-100',
//       textColor: 'text-red-600',
//       label: 'System',
//       description: 'System notifications'
//     },
//     credentials_resend: { 
//       icon: RefreshCw, 
//       color: 'pink', 
//       bgColor: 'bg-pink-100',
//       textColor: 'text-pink-600',
//       label: 'Credentials Resend',
//       description: 'Resend credentials'
//     },
//     tier_upgrade: { 
//       icon: TrendingUp, 
//       color: 'teal', 
//       bgColor: 'bg-teal-100',
//       textColor: 'text-teal-600',
//       label: 'Tier Upgrade',
//       description: 'Tier upgrade notifications'
//     },
//     commission_payout: { 
//       icon: DollarSign, 
//       color: 'emerald', 
//       bgColor: 'bg-emerald-100',
//       textColor: 'text-emerald-600',
//       label: 'Commission Payout',
//       description: 'Commission notifications'
//     },
//     custom: { 
//       icon: FileText, 
//       color: 'gray', 
//       bgColor: 'bg-gray-100',
//       textColor: 'text-gray-600',
//       label: 'Custom',
//       description: 'Custom template'
//     }
//   }), []);

//   // Filter templates
//   const filteredTemplates = useMemo(() => {
//     let filtered = templates;

//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(t =>
//         t.name?.toLowerCase().includes(term) ||
//         t.description?.toLowerCase().includes(term) ||
//         t.message_template?.toLowerCase().includes(term) ||
//         t.template_type?.toLowerCase().includes(term)
//       );
//     }

//     if (statusFilter !== 'all') {
//       filtered = filtered.filter(t =>
//         statusFilter === 'active' ? t.is_active : !t.is_active
//       );
//     }

//     return filtered;
//   }, [templates, searchTerm, statusFilter]);

//   // Statistics
//   const stats = useMemo(() => {
//     const total = templates.length;
//     const active = templates.filter(t => t.is_active).length;
//     const system = templates.filter(t => t.is_system).length;
//     const totalUsage = templates.reduce((sum, t) => sum + (t.usage_count || 0), 0);
//     return { total, active, system, totalUsage };
//   }, [templates]);

//   const handlePreviewClick = (template) => {
//     setTemplateToPreview(template);
//     setPreviewFormData({
//       client_name: 'John Doe',
//       username: 'johndoe123',
//       phone_number: '+254712345678',
//       plan_name: 'Business 10GB',
//       amount: '1500',
//       expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//       remaining_days: '7',
//       data_used: '8.5',
//       data_limit: '10'
//     });
//     setShowPreviewModal(true);
//   };

//   const handleTestRender = async () => {
//     if (!templateToPreview) return;
    
//     setIsTesting(true);
//     try {
//       const response = await onTestRender(templateToPreview.id, {
//         test_data: previewFormData
//       });
//       setPreviewData(response);
//       setShowPreviewModal(false);
//       setShowPreview(true);
//     } catch (error) {
//       setPreviewData({ 
//         success: false, 
//         message: error.response?.data?.message || 'Failed to render template' 
//       });
//       setShowPreview(true);
//     } finally {
//       setIsTesting(false);
//     }
//   };

//   const handleDuplicate = async (templateId) => {
//     try {
//       await onDuplicate(templateId);
//       if (onRefresh) onRefresh();
//     } catch (error) {
//       console.error('Duplicate failed:', error);
//     }
//   };

//   const handleDelete = async () => {
//     if (!templateToDelete) return;
//     try {
//       await onDelete(templateToDelete.id);
//       if (onRefresh) onRefresh();
//       setShowDeleteModal(false);
//       setTemplateToDelete(null);
//     } catch (error) {
//       console.error('Delete failed:', error);
//     }
//   };

//   const extractVariables = (template) => {
//     const matches = template.message_template?.match(/\{\{([^}]+)\}\}/g) || [];
//     return matches.map(v => v.replace(/[{}]/g, ''));
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
//         <span className={`ml-3 ${themeClasses.text.secondary}`}>Loading templates...</span>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {/* Header with Create Button */}
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h2 className={`text-xl font-bold ${themeClasses.text.primary}`}>
//             Templates
//           </h2>
//           <p className={`text-sm ${themeClasses.text.secondary}`}>
//             {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
//           </p>
//         </div>
//         <button
//           onClick={onCreateClick}
//           className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium flex items-center gap-2 hover:shadow-lg hover:scale-105 transition-all"
//         >
//           <Plus size={18} />
//           Create Template
//         </button>
//       </div>

//       {/* Statistics - Responsive grid */}
//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//         <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>Total</p>
//           <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>{stats.total}</p>
//         </div>
//         <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>Active</p>
//           <p className={`text-2xl font-bold text-green-500`}>{stats.active}</p>
//         </div>
//         <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>System</p>
//           <p className={`text-2xl font-bold text-blue-500`}>{stats.system}</p>
//         </div>
//         <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>Total Uses</p>
//           <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>{formatNumber(stats.totalUsage)}</p>
//         </div>
//       </div>

//       {/* Templates Grid/List */}
//       {filteredTemplates.length === 0 ? (
//         <EmptyState
//           icon={FileText}
//           title="No templates found"
//           description={searchTerm || statusFilter !== 'all'
//             ? "No templates match your search criteria"
//             : "Create your first SMS template to get started"
//           }
//           actionLabel="Create Template"
//           onAction={onCreateClick}
//           theme={theme}
//         />
//       ) : viewMode === 'grid' ? (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {filteredTemplates.map((template) => {
//             const config = templateTypes[template.template_type] || templateTypes.custom;
//             const Icon = config.icon;
//             const variables = extractVariables(template);
//             const requiredVars = template.required_variables || [];

//             return (
//               <motion.div
//                 key={template.id}
//                 layout
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 className={`p-5 rounded-lg border transition-all hover:shadow-lg ${
//                   themeClasses.bg.card
//                 } ${themeClasses.border.light} ${
//                   expandedTemplate === template.id ? 'ring-2 ring-indigo-500' : ''
//                 }`}
//               >
//                 {/* Template card content - keep existing */}
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="flex items-center gap-3">
//                     <div className={`p-2.5 rounded-xl ${config.bgColor} ${config.textColor}`}>
//                       <Icon className="w-5 h-5" />
//                     </div>
//                     <div>
//                       <h3 className={`font-medium flex items-center gap-2 ${themeClasses.text.primary}`}>
//                         {template.name}
//                         {template.is_system && (
//                           <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
//                             System
//                           </span>
//                         )}
//                       </h3>
//                       <p className={`text-xs ${themeClasses.text.secondary}`}>
//                         {config.label}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-1">
//                     <span className={`p-1.5 rounded-full ${
//                       template.is_active 
//                         ? 'bg-green-100 text-green-600' 
//                         : 'bg-gray-100 text-gray-400'
//                     }`}>
//                       {template.is_active ? (
//                         <CheckCircle className="w-4 h-4" />
//                       ) : (
//                         <XCircle className="w-4 h-4" />
//                       )}
//                     </span>
//                     <button
//                       onClick={() => setExpandedTemplate(expandedTemplate === template.id ? null : template.id)}
//                       className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//                     >
//                       {expandedTemplate === template.id ? (
//                         <ChevronUp className="w-4 h-4" />
//                       ) : (
//                         <ChevronDown className="w-4 h-4" />
//                       )}
//                     </button>
//                   </div>
//                 </div>

//                 <div className={`mb-4 p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//                   <p className="text-sm line-clamp-3 font-mono">
//                     {template.message_template}
//                   </p>
//                 </div>

//                 <div className="flex items-center justify-between text-xs mb-4">
//                   <span className={themeClasses.text.secondary}>
//                     {template.language?.toUpperCase() || 'EN'}
//                   </span>
//                   <span className={themeClasses.text.secondary}>
//                     {template.character_count || 0} chars
//                   </span>
//                   <span className={themeClasses.text.secondary}>
//                     {formatNumber(template.usage_count || 0)} uses
//                   </span>
//                 </div>

//                 {variables.length > 0 && (
//                   <div className="mb-4">
//                     <p className={`text-xs mb-2 ${themeClasses.text.secondary}`}>Variables:</p>
//                     <div className="flex flex-wrap gap-1">
//                       {variables.slice(0, 4).map((variable) => (
//                         <span
//                           key={variable}
//                           className={`px-2 py-1 text-xs rounded ${
//                             requiredVars.includes(variable)
//                               ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
//                               : themeClasses.bg.secondary
//                           }`}
//                         >
//                           {variable}
//                           {requiredVars.includes(variable) && '*'}
//                         </span>
//                       ))}
//                       {variables.length > 4 && (
//                         <span className={`px-2 py-1 text-xs rounded ${themeClasses.bg.secondary}`}>
//                           +{variables.length - 4}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => handlePreviewClick(template)}
//                     className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm ${
//                       themeClasses.button.secondary
//                     }`}
//                   >
//                     <Eye className="w-4 h-4" />
//                     <span className="hidden sm:inline">Preview</span>
//                   </button>

//                   <button
//                     onClick={() => handleDuplicate(template.id)}
//                     className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm ${
//                       themeClasses.button.secondary
//                     }`}
//                   >
//                     <Copy className="w-4 h-4" />
//                     <span className="hidden sm:inline">Copy</span>
//                   </button>

//                   {!template.is_system && (
//                     <button
//                       onClick={() => {
//                         setTemplateToDelete(template);
//                         setShowDeleteModal(true);
//                       }}
//                       className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm ${
//                         themeClasses.button.danger
//                       }`}
//                     >
//                       <Trash2 className="w-4 h-4" />
//                       <span className="hidden sm:inline">Delete</span>
//                     </button>
//                   )}
//                 </div>

//                 {/* Expanded Details */}
//                 {expandedTemplate === template.id && (
//                   <motion.div
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: 'auto' }}
//                     exit={{ opacity: 0, height: 0 }}
//                     className={`mt-4 pt-4 border-t ${themeClasses.border.light}`}
//                   >
//                     <div className="space-y-3 text-sm">
//                       {template.description && (
//                         <div>
//                           <p className={`text-xs ${themeClasses.text.secondary}`}>Description:</p>
//                           <p className="mt-1">{template.description}</p>
//                         </div>
//                       )}

//                       <div className="flex justify-between">
//                         <span className={themeClasses.text.secondary}>Created:</span>
//                         <span className={themeClasses.text.primary}>
//                           {new Date(template.created_at).toLocaleDateString()}
//                         </span>
//                       </div>

//                       {template.last_used && (
//                         <div className="flex justify-between">
//                           <span className={themeClasses.text.secondary}>Last Used:</span>
//                           <span className={themeClasses.text.primary}>
//                             {formatTimeAgo(template.last_used)}
//                           </span>
//                         </div>
//                       )}

//                       <div className="flex justify-between">
//                         <span className={themeClasses.text.secondary}>Max Length:</span>
//                         <span className={themeClasses.text.primary}>
//                           {template.max_length || 160} chars
//                         </span>
//                       </div>

//                       <div className="flex justify-between">
//                         <span className={themeClasses.text.secondary}>Unicode:</span>
//                         <span className={themeClasses.text.primary}>
//                           {template.allow_unicode ? 'Yes' : 'No'}
//                         </span>
//                       </div>

//                       {variables.length > 0 && (
//                         <div>
//                           <p className={`text-xs mb-1 ${themeClasses.text.secondary}`}>All Variables:</p>
//                           <div className="flex flex-wrap gap-1">
//                             {variables.map((variable) => (
//                               <span
//                                 key={variable}
//                                 className={`px-2 py-1 text-xs rounded ${
//                                   requiredVars.includes(variable)
//                                     ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
//                                     : themeClasses.bg.secondary
//                                 }`}
//                               >
//                                 {variable}
//                               </span>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </motion.div>
//                 )}
//               </motion.div>
//             );
//           })}
//         </div>
//       ) : (
//         <div className={`rounded-lg border overflow-x-auto ${themeClasses.border.light}`}>
//           <table className="w-full min-w-[800px]">
//             <thead className={themeClasses.bg.secondary}>
//               <tr>
//                 <th className="p-4 text-left text-xs font-medium">Template</th>
//                 <th className="p-4 text-left text-xs font-medium">Type</th>
//                 <th className="p-4 text-left text-xs font-medium">Status</th>
//                 <th className="p-4 text-right text-xs font-medium">Usage</th>
//                 <th className="p-4 text-right text-xs font-medium">Chars</th>
//                 <th className="p-4 text-left text-xs font-medium">Last Used</th>
//                 <th className="p-4 text-center text-xs font-medium">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//               {filteredTemplates.map((template) => {
//                 const config = templateTypes[template.template_type] || templateTypes.custom;
//                 const Icon = config.icon;

//                 return (
//                   <tr key={template.id} className={`hover:${themeClasses.bg.secondary} transition-colors`}>
//                     <td className="p-4">
//                       <div className="flex items-center gap-3">
//                         <div className={`p-2 rounded-lg ${config.bgColor} ${config.textColor}`}>
//                           <Icon className="w-4 h-4" />
//                         </div>
//                         <div>
//                           <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
//                             {template.name}
//                           </span>
//                           {template.is_system && (
//                             <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded">
//                               System
//                             </span>
//                           )}
//                           <p className={`text-xs ${themeClasses.text.secondary}`}>
//                             {template.message_template?.substring(0, 50)}...
//                           </p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="p-4">
//                       <span className={`text-sm ${themeClasses.text.secondary}`}>
//                         {config.label}
//                       </span>
//                     </td>
//                     <td className="p-4">
//                       {template.is_active ? (
//                         <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
//                           Active
//                         </span>
//                       ) : (
//                         <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-full">
//                           Inactive
//                         </span>
//                       )}
//                     </td>
//                     <td className="p-4 text-right text-sm">
//                       {formatNumber(template.usage_count || 0)}
//                     </td>
//                     <td className="p-4 text-right text-sm">
//                       {template.character_count || 0}
//                     </td>
//                     <td className="p-4 text-sm">
//                       {template.last_used ? formatTimeAgo(template.last_used) : 'Never'}
//                     </td>
//                     <td className="p-4">
//                       <div className="flex items-center justify-center gap-2">
//                         <button
//                           onClick={() => handlePreviewClick(template)}
//                           className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
//                           title="Preview"
//                         >
//                           <Eye className="w-4 h-4" />
//                         </button>
//                         <button
//                           onClick={() => handleDuplicate(template.id)}
//                           className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
//                           title="Duplicate"
//                         >
//                           <Copy className="w-4 h-4" />
//                         </button>
//                         {!template.is_system && (
//                           <button
//                             onClick={() => {
//                               setTemplateToDelete(template);
//                               setShowDeleteModal(true);
//                             }}
//                             className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
//                             title="Delete"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Preview Input Modal */}
//       <AnimatePresence>
//         {showPreviewModal && templateToPreview && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.95 }}
//               className={`w-full max-w-md rounded-xl shadow-lg ${themeClasses.bg.card}`}
//             >
//               <div className={`p-6 border-b ${themeClasses.border.light}`}>
//                 <h3 className={`text-lg font-bold ${themeClasses.text.primary}`}>
//                   Preview: {templateToPreview.name}
//                 </h3>
//                 <p className={`text-sm ${themeClasses.text.secondary}`}>
//                   Enter test data to preview the template
//                 </p>
//               </div>

//               <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                     Client Name
//                   </label>
//                   <input
//                     type="text"
//                     value={previewFormData.client_name}
//                     onChange={(e) => setPreviewFormData(prev => ({ ...prev, client_name: e.target.value }))}
//                     className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
//                   />
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                     Username
//                   </label>
//                   <input
//                     type="text"
//                     value={previewFormData.username}
//                     onChange={(e) => setPreviewFormData(prev => ({ ...prev, username: e.target.value }))}
//                     className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
//                   />
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                     Phone Number
//                   </label>
//                   <input
//                     type="tel"
//                     value={previewFormData.phone_number}
//                     onChange={(e) => setPreviewFormData(prev => ({ ...prev, phone_number: e.target.value }))}
//                     className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
//                   />
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                     Plan Name
//                   </label>
//                   <input
//                     type="text"
//                     value={previewFormData.plan_name}
//                     onChange={(e) => setPreviewFormData(prev => ({ ...prev, plan_name: e.target.value }))}
//                     className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
//                   />
//                 </div>
//               </div>

//               <div className={`p-6 border-t flex justify-end gap-3 ${themeClasses.border.light}`}>
//                 <button
//                   onClick={() => setShowPreviewModal(false)}
//                   className={`px-4 py-2 rounded-lg ${themeClasses.button.secondary}`}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleTestRender}
//                   disabled={isTesting}
//                   className={`px-4 py-2 rounded-lg ${themeClasses.button.primary} flex items-center gap-2`}
//                 >
//                   {isTesting ? (
//                     <>
//                       <Loader className="w-4 h-4 animate-spin" />
//                       Rendering...
//                     </>
//                   ) : (
//                     <>
//                       <Eye className="w-4 h-4" />
//                       Preview
//                     </>
//                   )}
//                 </button>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//       {/* Preview Result Modal */}
//       <AnimatePresence>
//         {showPreview && previewData && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.95 }}
//               className={`w-full max-w-2xl rounded-xl shadow-lg ${themeClasses.bg.card}`}
//             >
//               <div className={`p-6 border-b ${themeClasses.border.light}`}>
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     {previewData.success ? (
//                       <CheckCircle className="w-6 h-6 text-green-500" />
//                     ) : (
//                       <AlertCircle className="w-6 h-6 text-red-500" />
//                     )}
//                     <h3 className={`text-lg font-bold ${themeClasses.text.primary}`}>
//                       {previewData.success ? 'Preview Generated' : 'Preview Failed'}
//                     </h3>
//                   </div>
//                   <button
//                     onClick={() => {
//                       setShowPreview(false);
//                       setPreviewData(null);
//                     }}
//                     className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
//                   >
//                     <XCircle className="w-5 h-5" />
//                   </button>
//                 </div>
//               </div>

//               <div className="p-6 max-h-[60vh] overflow-y-auto">
//                 {previewData.success ? (
//                   <div className="space-y-4">
//                     <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
//                       <p className="whitespace-pre-wrap font-mono text-sm">
//                         {previewData.rendered_message}
//                       </p>
//                     </div>

//                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
//                       <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//                         <p className={`text-xs ${themeClasses.text.secondary}`}>Length</p>
//                         <p className={`text-lg font-bold ${themeClasses.text.primary}`}>
//                           {previewData.analysis?.message_length || 0}
//                         </p>
//                       </div>
//                       <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//                         <p className={`text-xs ${themeClasses.text.secondary}`}>SMS Parts</p>
//                         <p className={`text-lg font-bold ${themeClasses.text.primary}`}>
//                           {previewData.analysis?.estimated_parts || 1}
//                         </p>
//                       </div>
//                       <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//                         <p className={`text-xs ${themeClasses.text.secondary}`}>Unicode</p>
//                         <p className={`text-lg font-bold ${themeClasses.text.primary}`}>
//                           {previewData.analysis?.has_unicode ? 'Yes' : 'No'}
//                         </p>
//                       </div>
//                     </div>

//                     {previewData.analysis?.variables_used?.length > 0 && (
//                       <div>
//                         <p className={`text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                           Variables Used:
//                         </p>
//                         <div className="flex flex-wrap gap-2">
//                           {previewData.analysis.variables_used.map((v) => (
//                             <span
//                               key={v}
//                               className={`px-3 py-1 text-sm rounded-full ${themeClasses.bg.secondary}`}
//                             >
//                               {v}
//                             </span>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ) : (
//                   <div className="text-center py-8">
//                     <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
//                     <p className={`font-medium mb-2 ${themeClasses.text.primary}`}>
//                       Failed to render preview
//                     </p>
//                     <p className={themeClasses.text.secondary}>
//                       {previewData.message || 'Unknown error occurred'}
//                     </p>
//                   </div>
//                 )}
//               </div>

//               <div className={`p-6 border-t flex justify-end ${themeClasses.border.light}`}>
//                 <button
//                   onClick={() => {
//                     setShowPreview(false);
//                     setPreviewData(null);
//                   }}
//                   className={`px-6 py-2 rounded-lg ${themeClasses.button.primary}`}
//                 >
//                   Close
//                 </button>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//       {/* Delete Confirmation Modal */}
//       <AnimatePresence>
//         {showDeleteModal && (
//           <ConfirmationModal
//             isOpen={showDeleteModal}
//             onClose={() => {
//               setShowDeleteModal(false);
//               setTemplateToDelete(null);
//             }}
//             onConfirm={handleDelete}
//             title="Delete Template"
//             message={`Are you sure you want to delete "${templateToDelete?.name}"? This action cannot be undone.`}
//             type="danger"
//             theme={theme}
//           />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default TemplateManager;







import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Edit, Trash2, Copy, Search, Filter,
  Eye, EyeOff, CheckCircle, XCircle, Plus, Loader,
  BarChart3, Users, Calendar, Bell, Tag, Globe,
  MessageSquare, AlertCircle, ChevronDown, ChevronUp,
  Grid, List, Wifi, RefreshCw, TrendingUp, DollarSign,
  Zap, Clock, Type, Hash, Star
} from 'lucide-react';
import { EnhancedSelect, ConfirmationModal, EmptyState, getThemeClasses } from '../../../components/ServiceManagement/Shared/components';
import { formatNumber, formatTimeAgo } from '../utils/formatters';

const TemplateManager = ({
  templates = [],
  loading,
  theme,
  themeClasses,
  onRefresh,
  onCreateClick,
  onDuplicate,
  onTestRender,
  onEdit,
  onDelete,
  viewMode = 'grid',
  searchTerm = '',
  statusFilter = 'all'
}) => {
  const [expandedTemplate, setExpandedTemplate] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [previewFormData, setPreviewFormData] = useState({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [templateToPreview, setTemplateToPreview] = useState(null);

  // Template type configuration
  const templateTypes = useMemo(() => ({
    pppoe_credentials: { 
      icon: Wifi, 
      color: 'blue', 
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      label: 'PPPoE Credentials',
      description: 'PPPoE account credentials'
    },
    welcome: { 
      icon: Users, 
      color: 'green', 
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      label: 'Welcome',
      description: 'Welcome message for new clients'
    },
    payment_reminder: { 
      icon: Bell, 
      color: 'yellow', 
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      label: 'Payment Reminder',
      description: 'Payment due reminders'
    },
    plan_expiry: { 
      icon: Calendar, 
      color: 'orange', 
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      label: 'Plan Expiry',
      description: 'Plan expiration notifications'
    },
    promotional: { 
      icon: Tag, 
      color: 'purple', 
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      label: 'Promotional',
      description: 'Marketing and promotions'
    },
    system: { 
      icon: BarChart3, 
      color: 'red', 
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      label: 'System',
      description: 'System notifications'
    },
    custom: { 
      icon: FileText, 
      color: 'gray', 
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-600',
      label: 'Custom',
      description: 'Custom template'
    },
    hotspot_welcome: { 
      icon: Globe, 
      color: 'indigo', 
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600',
      label: 'Hotspot Welcome',
      description: 'Hotspot welcome message'
    },
    credentials_resend: { 
      icon: RefreshCw, 
      color: 'pink', 
      bgColor: 'bg-pink-100',
      textColor: 'text-pink-600',
      label: 'Credentials Resend',
      description: 'Resend credentials'
    },
    tier_upgrade: { 
      icon: TrendingUp, 
      color: 'teal', 
      bgColor: 'bg-teal-100',
      textColor: 'text-teal-600',
      label: 'Tier Upgrade',
      description: 'Tier upgrade notifications'
    },
    commission_payout: { 
      icon: DollarSign, 
      color: 'emerald', 
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-600',
      label: 'Commission Payout',
      description: 'Commission notifications'
    },
    account_suspended: { 
      icon: AlertCircle, 
      color: 'red', 
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      label: 'Account Suspended',
      description: 'Account suspension notification'
    },
    account_reactivated: { 
      icon: CheckCircle, 
      color: 'green', 
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      label: 'Account Reactivated',
      description: 'Account reactivation notification'
    },
    data_limit_warning: { 
      icon: Zap, 
      color: 'orange', 
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      label: 'Data Limit Warning',
      description: 'Data usage limit warning'
    },
    auto_renewal_reminder: { 
      icon: RefreshCw, 
      color: 'blue', 
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      label: 'Auto-renewal Reminder',
      description: 'Automatic renewal reminder'
    },
    referral_invite: { 
      icon: Users, 
      color: 'purple', 
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      label: 'Referral Invite',
      description: 'Referral invitation'
    },
    birthday_greeting: { 
      icon: Star, 
      color: 'pink', 
      bgColor: 'bg-pink-100',
      textColor: 'text-pink-600',
      label: 'Birthday Greeting',
      description: 'Birthday greeting message'
    }
  }), []);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.name?.toLowerCase().includes(term) ||
        t.description?.toLowerCase().includes(term) ||
        t.message_template?.toLowerCase().includes(term) ||
        t.template_type?.toLowerCase().includes(term) ||
        t.category?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t =>
        statusFilter === 'active' ? t.is_active : !t.is_active
      );
    }

    return filtered;
  }, [templates, searchTerm, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = templates.length;
    const active = templates.filter(t => t.is_active).length;
    const system = templates.filter(t => t.is_system).length;
    const totalUsage = templates.reduce((sum, t) => sum + (t.usage_count || 0), 0);
    return { total, active, system, totalUsage };
  }, [templates]);

  const handlePreviewClick = (template) => {
    setTemplateToPreview(template);
    
    // Extract required variables from template
    const variables = extractVariables(template);
    const initialFormData = {};
    
    // Set default values for common variables
    variables.forEach(variable => {
      switch(variable) {
        case 'client_name':
          initialFormData[variable] = 'John Doe';
          break;
        case 'username':
          initialFormData[variable] = 'johndoe123';
          break;
        case 'phone_number':
          initialFormData[variable] = '+254712345678';
          break;
        case 'plan_name':
          initialFormData[variable] = 'Business 10GB';
          break;
        case 'amount':
          initialFormData[variable] = '1500';
          break;
        case 'expiry_date':
          initialFormData[variable] = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case 'remaining_days':
          initialFormData[variable] = '7';
          break;
        case 'data_used':
          initialFormData[variable] = '8.5';
          break;
        case 'data_limit':
          initialFormData[variable] = '10';
          break;
        case 'password':
          initialFormData[variable] = 'SecurePass123';
          break;
        case 'commission_amount':
          initialFormData[variable] = '150';
          break;
        case 'referral_code':
          initialFormData[variable] = 'REF12345';
          break;
        case 'support_contact':
          initialFormData[variable] = '0700123456';
          break;
        default:
          initialFormData[variable] = `[${variable}]`;
      }
    });
    
    setPreviewFormData(initialFormData);
    setShowPreviewModal(true);
  };

  const handleTestRender = async () => {
    if (!templateToPreview) return;
    
    setIsTesting(true);
    try {
      const response = await onTestRender(templateToPreview.id, {
        test_data: previewFormData
      });
      setPreviewData(response);
      setShowPreviewModal(false);
      setShowPreview(true);
    } catch (error) {
      setPreviewData({ 
        success: false, 
        message: error.response?.data?.message || 'Failed to render template' 
      });
      setShowPreview(true);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDuplicate = async (templateId) => {
    try {
      await onDuplicate(templateId);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Duplicate failed:', error);
    }
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;
    try {
      await onDelete(templateToDelete.id);
      if (onRefresh) onRefresh();
      setShowDeleteModal(false);
      setTemplateToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const extractVariables = (template) => {
    const matches = template.message_template?.match(/\{\{([^}]+)\}\}/g) || [];
    return matches.map(v => v.replace(/[{}]/g, ''));
  };

  const getCharacterCountInfo = (template) => {
    const count = template.character_count || 0;
    const maxLength = template.max_length || 160;
    let parts = 1;
    
    if (count > 160) {
      if (count <= 306) {
        parts = 2;
      } else {
        parts = 2 + Math.ceil((count - 306) / 153);
      }
    }
    
    return { count, parts, maxLength };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className={`ml-3 ${themeClasses.text.secondary}`}>Loading templates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-xl font-bold ${themeClasses.text.primary}`}>
            SMS Templates
          </h2>
          <p className={`text-sm ${themeClasses.text.secondary}`}>
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button
          onClick={onCreateClick}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium flex items-center gap-2 hover:shadow-lg hover:scale-105 transition-all"
        >
          <Plus size={18} />
          Create Template
        </button>
      </div>

      {/* Statistics - Responsive grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
          <p className={`text-xs ${themeClasses.text.secondary}`}>Total Templates</p>
          <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>{stats.total}</p>
        </div>
        <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
          <p className={`text-xs ${themeClasses.text.secondary}`}>Active</p>
          <p className={`text-2xl font-bold text-green-500`}>{stats.active}</p>
        </div>
        <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
          <p className={`text-xs ${themeClasses.text.secondary}`}>System</p>
          <p className={`text-2xl font-bold text-blue-500`}>{stats.system}</p>
        </div>
        <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
          <p className={`text-xs ${themeClasses.text.secondary}`}>Total Uses</p>
          <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>{formatNumber(stats.totalUsage)}</p>
        </div>
      </div>

      {/* Templates Grid/List */}
      {filteredTemplates.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No templates found"
          description={searchTerm || statusFilter !== 'all'
            ? "No templates match your search criteria"
            : "Create your first SMS template to get started"
          }
          actionLabel="Create Template"
          onAction={onCreateClick}
          theme={theme}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => {
            const config = templateTypes[template.template_type] || templateTypes.custom;
            const Icon = config.icon;
            const variables = extractVariables(template);
            const requiredVars = template.required_variables || [];
            const charInfo = getCharacterCountInfo(template);

            return (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`p-5 rounded-lg border transition-all hover:shadow-lg ${
                  themeClasses.bg.card
                } ${themeClasses.border.light} ${
                  expandedTemplate === template.id ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                {/* Template card header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${config.bgColor} ${config.textColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`font-medium flex items-center gap-2 ${themeClasses.text.primary}`}>
                        {template.name}
                        {template.is_system && (
                          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                            System
                          </span>
                        )}
                      </h3>
                      <p className={`text-xs ${themeClasses.text.secondary}`}>
                        {config.label}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className={`p-1.5 rounded-full ${
                      template.is_active 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {template.is_active ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                    </span>
                    <button
                      onClick={() => setExpandedTemplate(expandedTemplate === template.id ? null : template.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {expandedTemplate === template.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Template preview */}
                <div className={`mb-4 p-3 rounded-lg ${themeClasses.bg.secondary}`}>
                  <p className="text-sm line-clamp-3 font-mono">
                    {template.message_template}
                  </p>
                </div>

                {/* Stats row */}
                <div className="flex items-center justify-between text-xs mb-4">
                  <span className={themeClasses.text.secondary}>
                    {template.language?.toUpperCase() || 'EN'}
                  </span>
                  <span className={themeClasses.text.secondary}>
                    {charInfo.count} chars / {charInfo.parts} {charInfo.parts === 1 ? 'part' : 'parts'}
                  </span>
                  <span className={themeClasses.text.secondary}>
                    {formatNumber(template.usage_count || 0)} uses
                  </span>
                </div>

                {/* Variables */}
                {variables.length > 0 && (
                  <div className="mb-4">
                    <p className={`text-xs mb-2 ${themeClasses.text.secondary}`}>Variables:</p>
                    <div className="flex flex-wrap gap-1">
                      {variables.slice(0, 4).map((variable) => (
                        <span
                          key={variable}
                          className={`px-2 py-1 text-xs rounded ${
                            requiredVars.includes(variable)
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : themeClasses.bg.secondary
                          }`}
                        >
                          {variable}
                          {requiredVars.includes(variable) && ' *'}
                        </span>
                      ))}
                      {variables.length > 4 && (
                        <span className={`px-2 py-1 text-xs rounded ${themeClasses.bg.secondary}`}>
                          +{variables.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePreviewClick(template)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      themeClasses.button.secondary
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Preview</span>
                  </button>

                  <button
                    onClick={() => handleDuplicate(template.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      themeClasses.button.secondary
                    }`}
                  >
                    <Copy className="w-4 h-4" />
                    <span className="hidden sm:inline">Copy</span>
                  </button>

                  {!template.is_system && (
                    <button
                      onClick={() => {
                        setTemplateToDelete(template);
                        setShowDeleteModal(true);
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm ${
                        themeClasses.button.danger
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  )}
                </div>

                {/* Expanded Details */}
                {expandedTemplate === template.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`mt-4 pt-4 border-t ${themeClasses.border.light}`}
                  >
                    <div className="space-y-3 text-sm">
                      {template.description && (
                        <div>
                          <p className={`text-xs ${themeClasses.text.secondary}`}>Description:</p>
                          <p className="mt-1">{template.description}</p>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className={themeClasses.text.secondary}>Template Type:</span>
                        <span className={themeClasses.text.primary}>
                          {template.template_type_display || config.label}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className={themeClasses.text.secondary}>Language:</span>
                        <span className={themeClasses.text.primary}>
                          {template.language?.toUpperCase() || 'EN'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className={themeClasses.text.secondary}>Created:</span>
                        <span className={themeClasses.text.primary}>
                          {new Date(template.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {template.last_used && (
                        <div className="flex justify-between">
                          <span className={themeClasses.text.secondary}>Last Used:</span>
                          <span className={themeClasses.text.primary}>
                            {formatTimeAgo(template.last_used)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className={themeClasses.text.secondary}>Max Length:</span>
                        <span className={themeClasses.text.primary}>
                          {template.max_length || 160} chars
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className={themeClasses.text.secondary}>Unicode Allowed:</span>
                        <span className={themeClasses.text.primary}>
                          {template.allow_unicode ? 'Yes' : 'No'}
                        </span>
                      </div>

                      {template.category && (
                        <div className="flex justify-between">
                          <span className={themeClasses.text.secondary}>Category:</span>
                          <span className={themeClasses.text.primary}>
                            {template.category}
                          </span>
                        </div>
                      )}

                      {variables.length > 0 && (
                        <div>
                          <p className={`text-xs mb-1 ${themeClasses.text.secondary}`}>All Variables:</p>
                          <div className="flex flex-wrap gap-1">
                            {variables.map((variable) => (
                              <span
                                key={variable}
                                className={`px-2 py-1 text-xs rounded ${
                                  requiredVars.includes(variable)
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 font-medium'
                                    : themeClasses.bg.secondary
                                }`}
                              >
                                {variable}
                                {requiredVars.includes(variable) && ' *'}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-red-500 mt-1">* Required variables</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className={`rounded-lg border overflow-x-auto ${themeClasses.border.light}`}>
          <table className="w-full min-w-[900px]">
            <thead className={themeClasses.bg.secondary}>
              <tr>
                <th className="p-4 text-left text-xs font-medium">Template</th>
                <th className="p-4 text-left text-xs font-medium">Type</th>
                <th className="p-4 text-left text-xs font-medium">Language</th>
                <th className="p-4 text-left text-xs font-medium">Status</th>
                <th className="p-4 text-right text-xs font-medium">Usage</th>
                <th className="p-4 text-right text-xs font-medium">Chars</th>
                <th className="p-4 text-left text-xs font-medium">Last Used</th>
                <th className="p-4 text-center text-xs font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTemplates.map((template) => {
                const config = templateTypes[template.template_type] || templateTypes.custom;
                const Icon = config.icon;
                const charInfo = getCharacterCountInfo(template);

                return (
                  <tr key={template.id} className={`hover:${themeClasses.bg.secondary} transition-colors`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${config.bgColor} ${config.textColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
                            {template.name}
                          </span>
                          {template.is_system && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                              System
                            </span>
                          )}
                          <p className={`text-xs ${themeClasses.text.secondary}`}>
                            {template.message_template?.substring(0, 60)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm ${themeClasses.text.secondary}`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm ${themeClasses.text.secondary}`}>
                        {template.language?.toUpperCase() || 'EN'}
                      </span>
                    </td>
                    <td className="p-4">
                      {template.is_active ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right text-sm">
                      {formatNumber(template.usage_count || 0)}
                    </td>
                    <td className="p-4 text-right text-sm">
                      {charInfo.count} / {charInfo.parts}
                    </td>
                    <td className="p-4 text-sm">
                      {template.last_used ? formatTimeAgo(template.last_used) : 'Never'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handlePreviewClick(template)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(template.id)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {!template.is_system && (
                          <button
                            onClick={() => {
                              setTemplateToDelete(template);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Input Modal */}
      <AnimatePresence>
        {showPreviewModal && templateToPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md rounded-xl shadow-lg ${themeClasses.bg.card}`}
            >
              <div className={`p-6 border-b ${themeClasses.border.light}`}>
                <h3 className={`text-lg font-bold ${themeClasses.text.primary}`}>
                  Preview: {templateToPreview.name}
                </h3>
                <p className={`text-sm ${themeClasses.text.secondary}`}>
                  Enter test data to preview the template
                </p>
              </div>

              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {Object.entries(previewFormData).map(([key, value]) => (
                  <div key={key}>
                    <label className={`block text-sm font-medium mb-2 capitalize ${themeClasses.text.secondary}`}>
                      {key.replace(/_/g, ' ')}
                      {templateToPreview.required_variables?.includes(key) && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setPreviewFormData(prev => ({ ...prev, [key]: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
                      placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                    />
                  </div>
                ))}
              </div>

              <div className={`p-6 border-t flex justify-end gap-3 ${themeClasses.border.light}`}>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className={`px-4 py-2 rounded-lg ${themeClasses.button.secondary}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleTestRender}
                  disabled={isTesting}
                  className={`px-4 py-2 rounded-lg ${themeClasses.button.primary} flex items-center gap-2`}
                >
                  {isTesting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Rendering...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Preview
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Result Modal */}
      <AnimatePresence>
        {showPreview && previewData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-2xl rounded-xl shadow-lg ${themeClasses.bg.card}`}
            >
              <div className={`p-6 border-b ${themeClasses.border.light}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {previewData.success ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    )}
                    <h3 className={`text-lg font-bold ${themeClasses.text.primary}`}>
                      {previewData.success ? 'Preview Generated' : 'Preview Failed'}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowPreview(false);
                      setPreviewData(null);
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {previewData.success ? (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
                      <p className="whitespace-pre-wrap font-mono text-sm">
                        {previewData.rendered_message}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
                        <p className={`text-xs ${themeClasses.text.secondary}`}>Length</p>
                        <p className={`text-lg font-bold ${themeClasses.text.primary}`}>
                          {previewData.analysis?.message_length || 0}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
                        <p className={`text-xs ${themeClasses.text.secondary}`}>SMS Parts</p>
                        <p className={`text-lg font-bold ${themeClasses.text.primary}`}>
                          {previewData.analysis?.estimated_parts || 1}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
                        <p className={`text-xs ${themeClasses.text.secondary}`}>Variables Used</p>
                        <p className={`text-lg font-bold ${themeClasses.text.primary}`}>
                          {previewData.analysis?.variables_used?.length || 0}
                        </p>
                      </div>
                    </div>

                    {previewData.analysis?.missing_variables?.length > 0 && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className={`text-sm font-medium mb-2 text-yellow-800 dark:text-yellow-400`}>
                          Missing Variables:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {previewData.analysis.missing_variables.map((v) => (
                            <span
                              key={v}
                              className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded"
                            >
                              {v}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {previewData.analysis?.variables_used?.length > 0 && (
                      <div>
                        <p className={`text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                          Variables Used:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {previewData.analysis.variables_used.map((v) => (
                            <span
                              key={v}
                              className={`px-3 py-1 text-sm rounded-full ${themeClasses.bg.secondary}`}
                            >
                              {v}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <p className={`font-medium mb-2 ${themeClasses.text.primary}`}>
                      Failed to render preview
                    </p>
                    <p className={themeClasses.text.secondary}>
                      {previewData.message || 'Unknown error occurred'}
                    </p>
                  </div>
                )}
              </div>

              <div className={`p-6 border-t flex justify-end ${themeClasses.border.light}`}>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    setPreviewData(null);
                  }}
                  className={`px-6 py-2 rounded-lg ${themeClasses.button.primary}`}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <ConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setTemplateToDelete(null);
            }}
            onConfirm={handleDelete}
            title="Delete Template"
            message={`Are you sure you want to delete "${templateToDelete?.name}"? This action cannot be undone.`}
            type="danger"
            theme={theme}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TemplateManager;