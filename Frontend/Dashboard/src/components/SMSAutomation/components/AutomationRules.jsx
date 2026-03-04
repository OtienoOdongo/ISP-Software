



// import React, { useState, useMemo } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Zap, Play, Pause, Calendar, Clock, Edit, Trash2,
//   Copy, TestTube, AlertCircle, CheckCircle, XCircle,
//   Loader, Plus, BarChart3, Users, Bell, Tag,
//   TrendingUp, TrendingDown, DollarSign, Wifi, Globe,
//   ChevronDown, ChevronUp, Eye, EyeOff, Filter, Search,
//   RefreshCw
// } from 'lucide-react';
// import { EnhancedSelect, ConfirmationModal, EmptyState, getThemeClasses } from '../../../components/ServiceManagement/Shared/components';
// import { formatNumber, formatPercentage, formatTimeAgo } from '../utils/formatters';

// const AutomationRules = ({
//   rules = [],
//   templates = [],
//   loading,
//   theme,
//   themeClasses,
//   onRefresh,
//   onToggleActive,
//   onTestTrigger,
//   onExecute,
//   onDuplicate,
//   onDelete,
//   viewMode = 'grid',
//   searchTerm = '',
//   statusFilter = 'all'
// }) => {
//   const [expandedRule, setExpandedRule] = useState(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [ruleToDelete, setRuleToDelete] = useState(null);
//   const [testResults, setTestResults] = useState(null);
//   const [isTesting, setIsTesting] = useState(false);
//   const [executing, setExecuting] = useState(new Set());
//   const [testFormData, setTestFormData] = useState({});
//   const [showTestModal, setShowTestModal] = useState(false);
//   const [ruleToTest, setRuleToTest] = useState(null);

//   // Filter rules
//   const filteredRules = useMemo(() => {
//     let filtered = rules;

//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(rule =>
//         rule.name?.toLowerCase().includes(term) ||
//         rule.description?.toLowerCase().includes(term) ||
//         rule.rule_type?.toLowerCase().includes(term)
//       );
//     }

//     if (statusFilter !== 'all') {
//       filtered = filtered.filter(rule =>
//         statusFilter === 'active' ? rule.is_active : !rule.is_active
//       );
//     }

//     return filtered;
//   }, [rules, searchTerm, statusFilter]);

//   // Calculate statistics
//   const stats = useMemo(() => {
//     const total = rules.length;
//     const active = rules.filter(r => r.is_active).length;
//     const totalExecutions = rules.reduce((sum, r) => sum + (r.execution_count || 0), 0);
//     const successCount = rules.reduce((sum, r) => sum + (r.success_count || 0), 0);
//     const successRate = totalExecutions > 0 ? (successCount / totalExecutions) * 100 : 0;

//     return { total, active, totalExecutions, successRate };
//   }, [rules]);

//   // Rule type configuration
//   const getRuleConfig = (type) => {
//     const configs = {
//       welcome: { icon: Users, color: 'green', label: 'Welcome', bgColor: 'bg-green-100', textColor: 'text-green-600' },
//       pppoe_creation: { icon: Wifi, color: 'blue', label: 'PPPoE', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
//       hotspot_creation: { icon: Globe, color: 'indigo', label: 'Hotspot', bgColor: 'bg-indigo-100', textColor: 'text-indigo-600' },
//       payment_success: { icon: CheckCircle, color: 'green', label: 'Payment Success', bgColor: 'bg-green-100', textColor: 'text-green-600' },
//       payment_failed: { icon: XCircle, color: 'red', label: 'Payment Failed', bgColor: 'bg-red-100', textColor: 'text-red-600' },
//       payment_reminder: { icon: Bell, color: 'yellow', label: 'Payment Reminder', bgColor: 'bg-yellow-100', textColor: 'text-yellow-600' },
//       plan_expiry: { icon: Clock, color: 'orange', label: 'Plan Expiry', bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
//       promotion: { icon: Tag, color: 'purple', label: 'Promotion', bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
//       tier_upgrade: { icon: TrendingUp, color: 'teal', label: 'Tier Upgrade', bgColor: 'bg-teal-100', textColor: 'text-teal-600' },
//       tier_downgrade: { icon: TrendingDown, color: 'gray', label: 'Tier Downgrade', bgColor: 'bg-gray-100', textColor: 'text-gray-600' },
//       commission_earned: { icon: DollarSign, color: 'emerald', label: 'Commission', bgColor: 'bg-emerald-100', textColor: 'text-emerald-600' }
//     };
//     return configs[type] || { icon: Zap, color: 'gray', label: type, bgColor: 'bg-gray-100', textColor: 'text-gray-600' };
//   };

//   const handleTestClick = (rule) => {
//     setRuleToTest(rule);
//     setTestFormData({
//       client_name: 'Test Client',
//       username: 'testuser123',
//       phone_number: '+254712345678',
//       plan_name: 'Business 10GB',
//       amount: '1500',
//       email: 'test@example.com'
//     });
//     setShowTestModal(true);
//   };

//   const handleTestSubmit = async () => {
//     if (!ruleToTest) return;
    
//     setIsTesting(true);
//     try {
//       const response = await onTestTrigger(ruleToTest.id, testFormData);
//       setTestResults(response);
//       setShowTestModal(false);
//     } catch (error) {
//       console.error('Test failed:', error);
//       setTestResults({ 
//         success: false, 
//         message: error.response?.data?.message || 'Test failed. Please check your template variables.' 
//       });
//     } finally {
//       setIsTesting(false);
//     }
//   };

//   const handleExecute = async (rule) => {
//     setExecuting(prev => new Set([...prev, rule.id]));
//     try {
//       await onExecute(rule.id, {
//         context: {
//           client_name: 'Manual Trigger',
//           phone_number: '+254712345678',
//           amount: '1500',
//           trigger_reason: 'Manual execution'
//         },
//         trigger_event: 'manual_test'
//       });
//       onRefresh();
//     } catch (error) {
//       console.error('Execute failed:', error);
//     } finally {
//       setExecuting(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(rule.id);
//         return newSet;
//       });
//     }
//   };

//   const handleToggleActive = async (ruleId) => {
//     try {
//       await onToggleActive(ruleId);
//       onRefresh();
//     } catch (error) {
//       console.error('Toggle failed:', error);
//     }
//   };

//   const handleDuplicate = async (ruleId) => {
//     try {
//       await onDuplicate(ruleId);
//       onRefresh();
//     } catch (error) {
//       console.error('Duplicate failed:', error);
//     }
//   };

//   const handleDelete = async () => {
//     if (!ruleToDelete) return;
//     try {
//       await onDelete(ruleToDelete.id);
//       onRefresh();
//       setShowDeleteModal(false);
//       setRuleToDelete(null);
//     } catch (error) {
//       console.error('Delete failed:', error);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
//         <span className={`ml-3 ${themeClasses.text.secondary}`}>Loading automation rules...</span>
//       </div>
//     );
//   }

//   if (filteredRules.length === 0) {
//     return (
//       <EmptyState
//         icon={Zap}
//         title="No automation rules found"
//         description={searchTerm || statusFilter !== 'all'
//           ? "No rules match your search criteria"
//           : "Create your first automation rule to get started"
//         }
//         actionLabel="Create Rule"
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
//           <p className={`text-xs ${themeClasses.text.secondary}`}>Total Rules</p>
//           <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>{stats.total}</p>
//         </div>
//         <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>Active</p>
//           <p className={`text-2xl font-bold text-green-500`}>{stats.active}</p>
//         </div>
//         <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>Executions</p>
//           <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>{formatNumber(stats.totalExecutions)}</p>
//         </div>
//         <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>Success Rate</p>
//           <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>{formatPercentage(stats.successRate)}</p>
//         </div>
//       </div>

//       {/* Rules Grid/List - Responsive */}
//       {viewMode === 'grid' ? (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {filteredRules.map((rule) => {
//             const config = getRuleConfig(rule.rule_type);
//             const Icon = config.icon;
//             const successRate = rule.execution_count > 0
//               ? (rule.success_count / rule.execution_count) * 100
//               : 0;

//             return (
//               <motion.div
//                 key={rule.id}
//                 layout
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 className={`p-5 rounded-lg border transition-all hover:shadow-lg ${
//                   themeClasses.bg.card
//                 } ${themeClasses.border.light} ${
//                   expandedRule === rule.id ? 'ring-2 ring-indigo-500' : ''
//                 }`}
//               >
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="flex items-center gap-3">
//                     <div className={`p-2.5 rounded-xl ${config.bgColor} ${config.textColor}`}>
//                       <Icon className="w-5 h-5" />
//                     </div>
//                     <div>
//                       <h3 className={`font-medium flex items-center gap-2 ${themeClasses.text.primary}`}>
//                         {rule.name}
//                       </h3>
//                       <p className={`text-xs ${themeClasses.text.secondary}`}>
//                         {config.label}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-1">
//                     <button
//                       onClick={() => handleTestClick(rule)}
//                       disabled={isTesting}
//                       className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//                       title="Test trigger"
//                     >
//                       {isTesting && ruleToTest?.id === rule.id ? (
//                         <Loader className="w-4 h-4 animate-spin" />
//                       ) : (
//                         <TestTube className="w-4 h-4" />
//                       )}
//                     </button>

//                     <button
//                       onClick={() => handleExecute(rule)}
//                       disabled={executing.has(rule.id)}
//                       className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//                       title="Execute now"
//                     >
//                       {executing.has(rule.id) ? (
//                         <Loader className="w-4 h-4 animate-spin" />
//                       ) : (
//                         <Play className="w-4 h-4" />
//                       )}
//                     </button>

//                     <button
//                       onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
//                       className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//                     >
//                       {expandedRule === rule.id ? (
//                         <ChevronUp className="w-4 h-4" />
//                       ) : (
//                         <ChevronDown className="w-4 h-4" />
//                       )}
//                     </button>
//                   </div>
//                 </div>

//                 <div className="flex items-center justify-between mb-4">
//                   <span className={`px-3 py-1 text-xs rounded-full flex items-center gap-1 ${
//                     rule.is_active
//                       ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
//                       : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
//                   }`}>
//                     {rule.is_active ? (
//                       <>
//                         <CheckCircle className="w-3 h-3" />
//                         Active
//                       </>
//                     ) : (
//                       <>
//                         <XCircle className="w-3 h-3" />
//                         Inactive
//                       </>
//                     )}
//                   </span>
                  
//                   <span className={`text-sm font-medium ${
//                     successRate >= 80 ? 'text-green-500' :
//                     successRate >= 60 ? 'text-yellow-500' : 'text-red-500'
//                   }`}>
//                     {formatPercentage(successRate)} success
//                   </span>
//                 </div>

//                 <p className={`text-sm mb-4 line-clamp-2 ${themeClasses.text.secondary}`}>
//                   {rule.description || 'No description provided'}
//                 </p>

//                 <div className="flex items-center justify-between text-xs mb-4">
//                   <span className={themeClasses.text.secondary}>
//                     Executed: {formatNumber(rule.execution_count || 0)} times
//                   </span>
//                   <span className={themeClasses.text.secondary}>
//                     Last: {rule.last_executed ? formatTimeAgo(rule.last_executed) : 'Never'}
//                   </span>
//                 </div>

//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => handleToggleActive(rule.id)}
//                     className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm ${
//                       rule.is_active
//                         ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400'
//                         : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
//                     } transition-colors`}
//                   >
//                     {rule.is_active ? (
//                       <>
//                         <Pause className="w-4 h-4" />
//                         <span className="hidden sm:inline">Pause</span>
//                       </>
//                     ) : (
//                       <>
//                         <Play className="w-4 h-4" />
//                         <span className="hidden sm:inline">Activate</span>
//                       </>
//                     )}
//                   </button>

//                   <button
//                     onClick={() => handleDuplicate(rule.id)}
//                     className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm ${
//                       themeClasses.button.secondary
//                     }`}
//                   >
//                     <Copy className="w-4 h-4" />
//                     <span className="hidden sm:inline">Copy</span>
//                   </button>

//                   <button
//                     onClick={() => {
//                       setRuleToDelete(rule);
//                       setShowDeleteModal(true);
//                     }}
//                     className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm ${
//                       themeClasses.button.danger
//                     }`}
//                   >
//                     <Trash2 className="w-4 h-4" />
//                     <span className="hidden sm:inline">Delete</span>
//                   </button>
//                 </div>

//                 {expandedRule === rule.id && (
//                   <motion.div
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: 'auto' }}
//                     exit={{ opacity: 0, height: 0 }}
//                     className={`mt-4 pt-4 border-t ${themeClasses.border.light}`}
//                   >
//                     <div className="space-y-3 text-sm">
//                       <div className="flex justify-between">
//                         <span className={themeClasses.text.secondary}>Template:</span>
//                         <span className={`font-medium ${themeClasses.text.primary}`}>
//                           {rule.template_name || 'Not set'}
//                         </span>
//                       </div>

//                       <div className="flex justify-between">
//                         <span className={themeClasses.text.secondary}>Priority:</span>
//                         <span className={`px-2 py-0.5 rounded-full text-xs ${
//                           rule.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
//                           rule.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
//                           rule.priority === 'normal' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
//                           'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
//                         }`}>
//                           {rule.priority}
//                         </span>
//                       </div>

//                       {rule.delay_minutes > 0 && (
//                         <div className="flex justify-between">
//                           <span className={themeClasses.text.secondary}>Delay:</span>
//                           <span className={themeClasses.text.primary}>
//                             {rule.delay_minutes} minutes
//                           </span>
//                         </div>
//                       )}

//                       {rule.schedule_cron && (
//                         <div className="flex justify-between">
//                           <span className={themeClasses.text.secondary}>Schedule:</span>
//                           <span className={`font-mono text-xs ${themeClasses.text.primary}`}>
//                             {rule.schedule_cron}
//                           </span>
//                         </div>
//                       )}

//                       {rule.condition && (
//                         <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//                           <p className={`text-xs font-medium mb-1 ${themeClasses.text.secondary}`}>Condition:</p>
//                           <p className={`text-sm ${themeClasses.text.primary}`}>
//                             {rule.condition.field} {rule.condition.operator} {rule.condition.value}
//                           </p>
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
//                 <th className="p-4 text-left text-xs font-medium">Rule</th>
//                 <th className="p-4 text-left text-xs font-medium">Status</th>
//                 <th className="p-4 text-left text-xs font-medium">Type</th>
//                 <th className="p-4 text-right text-xs font-medium">Executions</th>
//                 <th className="p-4 text-right text-xs font-medium">Success Rate</th>
//                 <th className="p-4 text-left text-xs font-medium">Last Run</th>
//                 <th className="p-4 text-center text-xs font-medium">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//               {filteredRules.map((rule) => {
//                 const config = getRuleConfig(rule.rule_type);
//                 const Icon = config.icon;
//                 const successRate = rule.execution_count > 0
//                   ? (rule.success_count / rule.execution_count) * 100
//                   : 0;

//                 return (
//                   <tr key={rule.id} className={`hover:${themeClasses.bg.secondary} transition-colors`}>
//                     <td className="p-4">
//                       <div className="flex items-center gap-3">
//                         <div className={`p-2 rounded-lg ${config.bgColor} ${config.textColor}`}>
//                           <Icon className="w-4 h-4" />
//                         </div>
//                         <div>
//                           <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
//                             {rule.name}
//                           </span>
//                           {rule.description && (
//                             <p className={`text-xs ${themeClasses.text.secondary}`}>
//                               {rule.description}
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                     </td>
//                     <td className="p-4">
//                       <span className={`px-2 py-1 text-xs rounded-full ${
//                         rule.is_active
//                           ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
//                           : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
//                       }`}>
//                         {rule.is_active ? 'Active' : 'Inactive'}
//                       </span>
//                     </td>
//                     <td className="p-4">
//                       <span className={`text-sm ${themeClasses.text.secondary}`}>
//                         {config.label}
//                       </span>
//                     </td>
//                     <td className="p-4 text-right text-sm">
//                       {formatNumber(rule.execution_count || 0)}
//                     </td>
//                     <td className="p-4 text-right">
//                       <span className={`text-sm font-medium ${
//                         successRate >= 80 ? 'text-green-500' :
//                         successRate >= 60 ? 'text-yellow-500' : 'text-red-500'
//                       }`}>
//                         {formatPercentage(successRate)}
//                       </span>
//                     </td>
//                     <td className="p-4 text-sm">
//                       {rule.last_executed ? formatTimeAgo(rule.last_executed) : 'Never'}
//                     </td>
//                     <td className="p-4">
//                       <div className="flex items-center justify-center gap-2">
//                         <button
//                           onClick={() => handleTestClick(rule)}
//                           className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
//                           title="Test trigger"
//                         >
//                           <TestTube className="w-4 h-4" />
//                         </button>
//                         <button
//                           onClick={() => handleExecute(rule)}
//                           className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
//                           title="Execute now"
//                         >
//                           {executing.has(rule.id) ? (
//                             <Loader className="w-4 h-4 animate-spin" />
//                           ) : (
//                             <Play className="w-4 h-4" />
//                           )}
//                         </button>
//                         <button
//                           onClick={() => handleToggleActive(rule.id)}
//                           className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
//                           title={rule.is_active ? 'Deactivate' : 'Activate'}
//                         >
//                           {rule.is_active ? (
//                             <Pause className="w-4 h-4 text-yellow-500" />
//                           ) : (
//                             <Play className="w-4 h-4 text-green-500" />
//                           )}
//                         </button>
//                         <button
//                           onClick={() => handleDuplicate(rule.id)}
//                           className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
//                           title="Duplicate"
//                         >
//                           <Copy className="w-4 h-4" />
//                         </button>
//                         <button
//                           onClick={() => {
//                             setRuleToDelete(rule);
//                             setShowDeleteModal(true);
//                           }}
//                           className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
//                           title="Delete"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Test Modal */}
//       <AnimatePresence>
//         {showTestModal && ruleToTest && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.95 }}
//               className={`w-full max-w-md rounded-xl shadow-lg ${themeClasses.bg.card}`}
//             >
//               <div className={`p-6 border-b ${themeClasses.border.light}`}>
//                 <h3 className={`text-lg font-bold ${themeClasses.text.primary}`}>
//                   Test Rule: {ruleToTest.name}
//                 </h3>
//               </div>

//               <div className="p-6 space-y-4">
//                 <p className={`text-sm ${themeClasses.text.secondary}`}>
//                   Enter test data to simulate rule execution
//                 </p>

//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                     Client Name
//                   </label>
//                   <input
//                     type="text"
//                     value={testFormData.client_name}
//                     onChange={(e) => setTestFormData(prev => ({ ...prev, client_name: e.target.value }))}
//                     className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
//                   />
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                     Phone Number
//                   </label>
//                   <input
//                     type="tel"
//                     value={testFormData.phone_number}
//                     onChange={(e) => setTestFormData(prev => ({ ...prev, phone_number: e.target.value }))}
//                     className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
//                   />
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                     Username
//                   </label>
//                   <input
//                     type="text"
//                     value={testFormData.username}
//                     onChange={(e) => setTestFormData(prev => ({ ...prev, username: e.target.value }))}
//                     className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
//                   />
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                     Plan Name
//                   </label>
//                   <input
//                     type="text"
//                     value={testFormData.plan_name}
//                     onChange={(e) => setTestFormData(prev => ({ ...prev, plan_name: e.target.value }))}
//                     className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
//                   />
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//                     Amount
//                   </label>
//                   <input
//                     type="text"
//                     value={testFormData.amount}
//                     onChange={(e) => setTestFormData(prev => ({ ...prev, amount: e.target.value }))}
//                     className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
//                   />
//                 </div>
//               </div>

//               <div className={`p-6 border-t flex justify-end gap-3 ${themeClasses.border.light}`}>
//                 <button
//                   onClick={() => setShowTestModal(false)}
//                   className={`px-4 py-2 rounded-lg ${themeClasses.button.secondary}`}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleTestSubmit}
//                   disabled={isTesting}
//                   className={`px-4 py-2 rounded-lg ${themeClasses.button.primary} flex items-center gap-2`}
//                 >
//                   {isTesting ? (
//                     <>
//                       <Loader className="w-4 h-4 animate-spin" />
//                       Testing...
//                     </>
//                   ) : (
//                     <>
//                       <TestTube className="w-4 h-4" />
//                       Run Test
//                     </>
//                   )}
//                 </button>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//       {/* Test Results Modal */}
//       <AnimatePresence>
//         {testResults && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.95 }}
//               className={`w-full max-w-md rounded-xl shadow-lg ${themeClasses.bg.card}`}
//             >
//               <div className={`p-6 border-b ${themeClasses.border.light}`}>
//                 <div className="flex items-center gap-3">
//                   {testResults.success ? (
//                     <CheckCircle className="w-6 h-6 text-green-500" />
//                   ) : (
//                     <AlertCircle className="w-6 h-6 text-red-500" />
//                   )}
//                   <h3 className={`text-lg font-bold ${themeClasses.text.primary}`}>
//                     {testResults.success ? 'Test Successful' : 'Test Failed'}
//                   </h3>
//                 </div>
//               </div>

//               <div className="p-6">
//                 <p className={`text-sm ${testResults.success ? themeClasses.text.primary : 'text-red-500'}`}>
//                   {testResults.message || (testResults.success 
//                     ? 'Template rendered successfully.' 
//                     : 'Test failed. Please check your template variables.')}
//                 </p>

//                 {testResults.rendered_message && (
//                   <div className={`mt-4 p-3 rounded-lg ${themeClasses.bg.secondary}`}>
//                     <p className={`text-xs font-medium mb-2 ${themeClasses.text.secondary}`}>Rendered Message:</p>
//                     <p className="text-sm">{testResults.rendered_message}</p>
//                   </div>
//                 )}
//               </div>

//               <div className={`p-6 border-t flex justify-end ${themeClasses.border.light}`}>
//                 <button
//                   onClick={() => setTestResults(null)}
//                   className={`px-4 py-2 rounded-lg ${themeClasses.button.primary}`}
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
//               setRuleToDelete(null);
//             }}
//             onConfirm={handleDelete}
//             title="Delete Automation Rule"
//             message={`Are you sure you want to delete "${ruleToDelete?.name}"? This action cannot be undone.`}
//             type="danger"
//             theme={theme}
//           />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default AutomationRules;








import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Play, Pause, Calendar, Clock, Edit, Trash2,
  Copy, TestTube, AlertCircle, CheckCircle, XCircle,
  Loader, Plus, BarChart3, Users, Bell, Tag,
  TrendingUp, TrendingDown, DollarSign, Wifi, Globe,
  ChevronDown, ChevronUp, Eye, EyeOff, Filter, Search,
  RefreshCw
} from 'lucide-react';
import { EnhancedSelect, ConfirmationModal, EmptyState, getThemeClasses } from '../../../components/ServiceManagement/Shared/components';
import { formatNumber, formatPercentage, formatTimeAgo } from '../utils/formatters';

const AutomationRules = ({
  rules = [],
  templates = [],
  loading,
  theme,
  themeClasses,
  onRefresh,
  onCreateClick,
  onToggleActive,
  onTestTrigger,
  onExecute,
  onDuplicate,
  onDelete,
  viewMode = 'grid',
  searchTerm = '',
  statusFilter = 'all'
}) => {
  const [expandedRule, setExpandedRule] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [executing, setExecuting] = useState(new Set());
  const [testFormData, setTestFormData] = useState({});
  const [showTestModal, setShowTestModal] = useState(false);
  const [ruleToTest, setRuleToTest] = useState(null);

  // Filter rules
  const filteredRules = useMemo(() => {
    let filtered = rules;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(rule =>
        rule.name?.toLowerCase().includes(term) ||
        rule.description?.toLowerCase().includes(term) ||
        rule.rule_type?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(rule =>
        statusFilter === 'active' ? rule.is_active : !rule.is_active
      );
    }

    return filtered;
  }, [rules, searchTerm, statusFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = rules.length;
    const active = rules.filter(r => r.is_active).length;
    const totalExecutions = rules.reduce((sum, r) => sum + (r.execution_count || 0), 0);
    const successCount = rules.reduce((sum, r) => sum + (r.success_count || 0), 0);
    const successRate = totalExecutions > 0 ? (successCount / totalExecutions) * 100 : 0;

    return { total, active, totalExecutions, successRate };
  }, [rules]);

  // Rule type configuration
  const getRuleConfig = (type) => {
    const configs = {
      welcome: { icon: Users, color: 'green', label: 'Welcome', bgColor: 'bg-green-100', textColor: 'text-green-600' },
      pppoe_creation: { icon: Wifi, color: 'blue', label: 'PPPoE', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
      hotspot_creation: { icon: Globe, color: 'indigo', label: 'Hotspot', bgColor: 'bg-indigo-100', textColor: 'text-indigo-600' },
      payment_success: { icon: CheckCircle, color: 'green', label: 'Payment Success', bgColor: 'bg-green-100', textColor: 'text-green-600' },
      payment_failed: { icon: XCircle, color: 'red', label: 'Payment Failed', bgColor: 'bg-red-100', textColor: 'text-red-600' },
      payment_reminder: { icon: Bell, color: 'yellow', label: 'Payment Reminder', bgColor: 'bg-yellow-100', textColor: 'text-yellow-600' },
      plan_expiry: { icon: Clock, color: 'orange', label: 'Plan Expiry', bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
      promotion: { icon: Tag, color: 'purple', label: 'Promotion', bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
      tier_upgrade: { icon: TrendingUp, color: 'teal', label: 'Tier Upgrade', bgColor: 'bg-teal-100', textColor: 'text-teal-600' },
      tier_downgrade: { icon: TrendingDown, color: 'gray', label: 'Tier Downgrade', bgColor: 'bg-gray-100', textColor: 'text-gray-600' },
      commission_earned: { icon: DollarSign, color: 'emerald', label: 'Commission', bgColor: 'bg-emerald-100', textColor: 'text-emerald-600' }
    };
    return configs[type] || { icon: Zap, color: 'gray', label: type, bgColor: 'bg-gray-100', textColor: 'text-gray-600' };
  };

  const handleTestClick = (rule) => {
    setRuleToTest(rule);
    setTestFormData({
      client_name: 'Test Client',
      username: 'testuser123',
      phone_number: '+254712345678',
      plan_name: 'Business 10GB',
      amount: '1500',
      email: 'test@example.com'
    });
    setShowTestModal(true);
  };

  const handleTestSubmit = async () => {
    if (!ruleToTest) return;
    
    setIsTesting(true);
    try {
      const response = await onTestTrigger(ruleToTest.id, testFormData);
      setTestResults(response);
      setShowTestModal(false);
    } catch (error) {
      setTestResults({ 
        success: false, 
        message: error.response?.data?.message || 'Test failed. Please check your template variables.' 
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleExecute = async (rule) => {
    setExecuting(prev => new Set([...prev, rule.id]));
    try {
      await onExecute(rule.id, {
        context: {
          client_name: 'Manual Trigger',
          phone_number: '+254712345678',
          amount: '1500',
          trigger_reason: 'Manual execution'
        },
        trigger_event: 'manual_test'
      });
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Execute failed:', error);
    } finally {
      setExecuting(prev => {
        const newSet = new Set(prev);
        newSet.delete(rule.id);
        return newSet;
      });
    }
  };

  const handleToggleActive = async (ruleId) => {
    try {
      await onToggleActive(ruleId);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Toggle failed:', error);
    }
  };

  const handleDuplicate = async (ruleId) => {
    try {
      await onDuplicate(ruleId);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Duplicate failed:', error);
    }
  };

  const handleDelete = async () => {
    if (!ruleToDelete) return;
    try {
      await onDelete(ruleToDelete.id);
      if (onRefresh) onRefresh();
      setShowDeleteModal(false);
      setRuleToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className={`ml-3 ${themeClasses.text.secondary}`}>Loading automation rules...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-xl font-bold ${themeClasses.text.primary}`}>
            Automation Rules
          </h2>
          <p className={`text-sm ${themeClasses.text.secondary}`}>
            {filteredRules.length} rule{filteredRules.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button
          onClick={onCreateClick}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium flex items-center gap-2 hover:shadow-lg hover:scale-105 transition-all"
        >
          <Plus size={18} />
          Create Rule
        </button>
      </div>

      {/* Statistics - Responsive grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
          <p className={`text-xs ${themeClasses.text.secondary}`}>Total Rules</p>
          <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>{stats.total}</p>
        </div>
        <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
          <p className={`text-xs ${themeClasses.text.secondary}`}>Active</p>
          <p className={`text-2xl font-bold text-green-500`}>{stats.active}</p>
        </div>
        <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
          <p className={`text-xs ${themeClasses.text.secondary}`}>Executions</p>
          <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>{formatNumber(stats.totalExecutions)}</p>
        </div>
        <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
          <p className={`text-xs ${themeClasses.text.secondary}`}>Success Rate</p>
          <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>{formatPercentage(stats.successRate)}</p>
        </div>
      </div>

      {/* Rules Grid/List */}
      {filteredRules.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No automation rules found"
          description={searchTerm || statusFilter !== 'all'
            ? "No rules match your search criteria"
            : "Create your first automation rule to get started"
          }
          actionLabel="Create Rule"
          onAction={onCreateClick}
          theme={theme}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRules.map((rule) => {
            const config = getRuleConfig(rule.rule_type);
            const Icon = config.icon;
            const successRate = rule.execution_count > 0
              ? (rule.success_count / rule.execution_count) * 100
              : 0;

            return (
              <motion.div
                key={rule.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`p-5 rounded-lg border transition-all hover:shadow-lg ${
                  themeClasses.bg.card
                } ${themeClasses.border.light} ${
                  expandedRule === rule.id ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                {/* Rule card content - keep existing */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${config.bgColor} ${config.textColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`font-medium flex items-center gap-2 ${themeClasses.text.primary}`}>
                        {rule.name}
                      </h3>
                      <p className={`text-xs ${themeClasses.text.secondary}`}>
                        {config.label}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTestClick(rule)}
                      disabled={isTesting}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Test trigger"
                    >
                      {isTesting && ruleToTest?.id === rule.id ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <TestTube className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => handleExecute(rule)}
                      disabled={executing.has(rule.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Execute now"
                    >
                      {executing.has(rule.id) ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {expandedRule === rule.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 text-xs rounded-full flex items-center gap-1 ${
                    rule.is_active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {rule.is_active ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        Inactive
                      </>
                    )}
                  </span>
                  
                  <span className={`text-sm font-medium ${
                    successRate >= 80 ? 'text-green-500' :
                    successRate >= 60 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {formatPercentage(successRate)} success
                  </span>
                </div>

                <p className={`text-sm mb-4 line-clamp-2 ${themeClasses.text.secondary}`}>
                  {rule.description || 'No description provided'}
                </p>

                <div className="flex items-center justify-between text-xs mb-4">
                  <span className={themeClasses.text.secondary}>
                    Executed: {formatNumber(rule.execution_count || 0)} times
                  </span>
                  <span className={themeClasses.text.secondary}>
                    Last: {rule.last_executed ? formatTimeAgo(rule.last_executed) : 'Never'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(rule.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      rule.is_active
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                    } transition-colors`}
                  >
                    {rule.is_active ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span className="hidden sm:inline">Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span className="hidden sm:inline">Activate</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDuplicate(rule.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      themeClasses.button.secondary
                    }`}
                  >
                    <Copy className="w-4 h-4" />
                    <span className="hidden sm:inline">Copy</span>
                  </button>

                  <button
                    onClick={() => {
                      setRuleToDelete(rule);
                      setShowDeleteModal(true);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      themeClasses.button.danger
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>

                {expandedRule === rule.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`mt-4 pt-4 border-t ${themeClasses.border.light}`}
                  >
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className={themeClasses.text.secondary}>Template:</span>
                        <span className={`font-medium ${themeClasses.text.primary}`}>
                          {rule.template_name || 'Not set'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className={themeClasses.text.secondary}>Priority:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          rule.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          rule.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                          rule.priority === 'normal' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {rule.priority}
                        </span>
                      </div>

                      {rule.delay_minutes > 0 && (
                        <div className="flex justify-between">
                          <span className={themeClasses.text.secondary}>Delay:</span>
                          <span className={themeClasses.text.primary}>
                            {rule.delay_minutes} minutes
                          </span>
                        </div>
                      )}

                      {rule.condition && (
                        <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
                          <p className={`text-xs font-medium mb-1 ${themeClasses.text.secondary}`}>Condition:</p>
                          <p className={`text-sm ${themeClasses.text.primary}`}>
                            {rule.condition.field} {rule.condition.operator} {rule.condition.value}
                          </p>
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
          <table className="w-full min-w-[800px]">
            <thead className={themeClasses.bg.secondary}>
              <tr>
                <th className="p-4 text-left text-xs font-medium">Rule</th>
                <th className="p-4 text-left text-xs font-medium">Status</th>
                <th className="p-4 text-left text-xs font-medium">Type</th>
                <th className="p-4 text-right text-xs font-medium">Executions</th>
                <th className="p-4 text-right text-xs font-medium">Success Rate</th>
                <th className="p-4 text-left text-xs font-medium">Last Run</th>
                <th className="p-4 text-center text-xs font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRules.map((rule) => {
                const config = getRuleConfig(rule.rule_type);
                const Icon = config.icon;
                const successRate = rule.execution_count > 0
                  ? (rule.success_count / rule.execution_count) * 100
                  : 0;

                return (
                  <tr key={rule.id} className={`hover:${themeClasses.bg.secondary} transition-colors`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${config.bgColor} ${config.textColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
                            {rule.name}
                          </span>
                          {rule.description && (
                            <p className={`text-xs ${themeClasses.text.secondary}`}>
                              {rule.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        rule.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm ${themeClasses.text.secondary}`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="p-4 text-right text-sm">
                      {formatNumber(rule.execution_count || 0)}
                    </td>
                    <td className="p-4 text-right">
                      <span className={`text-sm font-medium ${
                        successRate >= 80 ? 'text-green-500' :
                        successRate >= 60 ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {formatPercentage(successRate)}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {rule.last_executed ? formatTimeAgo(rule.last_executed) : 'Never'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleTestClick(rule)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Test trigger"
                        >
                          <TestTube className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExecute(rule)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Execute now"
                        >
                          {executing.has(rule.id) ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleToggleActive(rule.id)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          title={rule.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {rule.is_active ? (
                            <Pause className="w-4 h-4 text-yellow-500" />
                          ) : (
                            <Play className="w-4 h-4 text-green-500" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDuplicate(rule.id)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setRuleToDelete(rule);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Test Modal */}
      <AnimatePresence>
        {showTestModal && ruleToTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md rounded-xl shadow-lg ${themeClasses.bg.card}`}
            >
              <div className={`p-6 border-b ${themeClasses.border.light}`}>
                <h3 className={`text-lg font-bold ${themeClasses.text.primary}`}>
                  Test Rule: {ruleToTest.name}
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <p className={`text-sm ${themeClasses.text.secondary}`}>
                  Enter test data to simulate rule execution
                </p>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={testFormData.client_name}
                    onChange={(e) => setTestFormData(prev => ({ ...prev, client_name: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={testFormData.phone_number}
                    onChange={(e) => setTestFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={testFormData.username}
                    onChange={(e) => setTestFormData(prev => ({ ...prev, username: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                    Plan Name
                  </label>
                  <input
                    type="text"
                    value={testFormData.plan_name}
                    onChange={(e) => setTestFormData(prev => ({ ...prev, plan_name: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                    Amount
                  </label>
                  <input
                    type="text"
                    value={testFormData.amount}
                    onChange={(e) => setTestFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
                  />
                </div>
              </div>

              <div className={`p-6 border-t flex justify-end gap-3 ${themeClasses.border.light}`}>
                <button
                  onClick={() => setShowTestModal(false)}
                  className={`px-4 py-2 rounded-lg ${themeClasses.button.secondary}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleTestSubmit}
                  disabled={isTesting}
                  className={`px-4 py-2 rounded-lg ${themeClasses.button.primary} flex items-center gap-2`}
                >
                  {isTesting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4" />
                      Run Test
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Test Results Modal */}
      <AnimatePresence>
        {testResults && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md rounded-xl shadow-lg ${themeClasses.bg.card}`}
            >
              <div className={`p-6 border-b ${themeClasses.border.light}`}>
                <div className="flex items-center gap-3">
                  {testResults.success ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  )}
                  <h3 className={`text-lg font-bold ${themeClasses.text.primary}`}>
                    {testResults.success ? 'Test Successful' : 'Test Failed'}
                  </h3>
                </div>
              </div>

              <div className="p-6">
                <p className={`text-sm ${testResults.success ? themeClasses.text.primary : 'text-red-500'}`}>
                  {testResults.message || (testResults.success 
                    ? 'Template rendered successfully.' 
                    : 'Test failed. Please check your template variables.')}
                </p>

                {testResults.rendered_message && (
                  <div className={`mt-4 p-3 rounded-lg ${themeClasses.bg.secondary}`}>
                    <p className={`text-xs font-medium mb-2 ${themeClasses.text.secondary}`}>Rendered Message:</p>
                    <p className="text-sm">{testResults.rendered_message}</p>
                  </div>
                )}
              </div>

              <div className={`p-6 border-t flex justify-end ${themeClasses.border.light}`}>
                <button
                  onClick={() => setTestResults(null)}
                  className={`px-4 py-2 rounded-lg ${themeClasses.button.primary}`}
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
              setRuleToDelete(null);
            }}
            onConfirm={handleDelete}
            title="Delete Automation Rule"
            message={`Are you sure you want to delete "${ruleToDelete?.name}"? This action cannot be undone.`}
            type="danger"
            theme={theme}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AutomationRules;