







// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { 
//   Settings, 
//   Bell, 
//   MessageSquare, 
//   Clock, 
//   ToggleLeft, 
//   ToggleRight,
//   Save,
//   Plus,
//   Trash2,
//   Edit,
//   Filter,
//   Search,
//   Download,
//   Upload,
//   Play,
//   Pause,
//   TestTube,
//   ChevronDown,
//   ChevronUp,
//   CheckCircle,
//   XCircle,
//   AlertCircle,
//   User,
//   Calendar,
//   BarChart3,
//   Phone,
//   Loader,
//   RefreshCw,
//   BarChart2,
//   PieChart
// } from 'lucide-react';
// import api from '../../api';
// import { useAuth } from '../../context/AuthContext';
// import { useTheme } from '../../context/ThemeContext';
// import { FaSpinner } from 'react-icons/fa';

// // Memoized components
// const TriggerTypeIcon = React.memo(({ type }) => {
//   const iconMap = {
//     data_usage: BarChart3,
//     plan_expiry: Calendar,
//     onboarding: User,
//     default: Bell
//   };
//   const Icon = iconMap[type] || iconMap.default;
//   return <Icon size={16} />;
// });

// const TriggerTypeBadge = React.memo(({ type, theme }) => {
//   const colorMap = useMemo(() => ({
//     data_usage: theme === 'dark' 
//       ? 'bg-blue-900/30 text-blue-400 border border-blue-800/50' 
//       : 'bg-blue-100 text-blue-600',
//     plan_expiry: theme === 'dark'
//       ? 'bg-amber-900/30 text-amber-400 border border-amber-800/50'
//       : 'bg-amber-100 text-amber-600',
//     onboarding: theme === 'dark'
//       ? 'bg-green-900/30 text-green-400 border border-green-800/50'
//       : 'bg-green-100 text-green-600',
//     default: theme === 'dark'
//       ? 'bg-gray-700 text-gray-300 border border-gray-600'
//       : 'bg-gray-100 text-gray-600'
//   }), [theme]);

//   return (
//     <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorMap[type] || colorMap.default}`}>
//       {type.replace('_', ' ')}
//     </span>
//   );
// });

// const SMSAutomation = () => {
//   const { isAuthenticated } = useAuth();
//   const { theme } = useTheme();
//   const [triggers, setTriggers] = useState([]);
//   const [settings, setSettings] = useState({
//     enabled: true,
//     sms_gateway: 'africas_talking',
//     api_key: '',
//     username: '',
//     sender_id: '',
//     send_time_start: '08:00',
//     send_time_end: '20:00',
//     max_messages_per_day: 1000,
//     low_balance_alert: true,
//     balance_threshold: 100,
//     sms_balance: 0
//   });
//   const [analytics, setAnalytics] = useState({
//     total_messages: 0,
//     successful_messages: 0,
//     failed_messages: 0,
//     active_triggers: 0,
//     success_rate: 0,
//     messages_by_type: [],
//     daily_messages: []
//   });
//   const [performanceData, setPerformanceData] = useState([]);

//   const [editingTrigger, setEditingTrigger] = useState(null);
//   const [newTrigger, setNewTrigger] = useState({
//     name: '',
//     trigger_type: 'data_usage',
//     threshold: 80,
//     days_before: 3,
//     event: 'signup',
//     message: '',
//     enabled: true
//   });

//   const [activeTab, setActiveTab] = useState('triggers');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [typeFilter, setTypeFilter] = useState('all');
//   const [showTestModal, setShowTestModal] = useState(false);
//   const [testRecipient, setTestRecipient] = useState('');
//   const [testResults, setTestResults] = useState(null);
//   const [expandedTrigger, setExpandedTrigger] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isSaving, setIsSaving] = useState(false);
//   const [isTesting, setIsTesting] = useState(false);

//   // Theme-based classes
//   const containerClass = theme === 'dark' 
//     ? 'bg-gradient-to-br from-gray-900 to-indigo-900 text-white min-h-screen' 
//     : 'bg-gray-50 text-gray-800 min-h-screen';

//   const cardClass = theme === 'dark'
//     ? 'bg-gray-800/80 backdrop-blur-md border border-gray-700'
//     : 'bg-white border border-gray-200';

//   const inputClass = theme === 'dark'
//     ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
//     : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

//   const buttonClass = theme === 'dark'
//     ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600'
//     : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300';

//   // Memoized filtered triggers with optimized filtering
//   const filteredTriggers = useMemo(() => {
//     const lowerSearch = searchTerm.toLowerCase();
//     return triggers.filter(trigger => {
//       const matchesSearch = trigger.name.toLowerCase().includes(lowerSearch) ||
//                             trigger.message.toLowerCase().includes(lowerSearch);
//       const matchesStatus = statusFilter === 'all' || 
//                            (statusFilter === 'active' && trigger.enabled) ||
//                            (statusFilter === 'inactive' && !trigger.enabled);
//       const matchesType = typeFilter === 'all' || trigger.trigger_type === typeFilter;
      
//       return matchesSearch && matchesStatus && matchesType;
//     });
//   }, [triggers, searchTerm, statusFilter, typeFilter]);

//   // Fetch data on component mount
//   useEffect(() => {
//     if (isAuthenticated) {
//       fetchData();
//     }
//   }, [isAuthenticated]);

//   const fetchData = useCallback(async () => {
//     try {
//       setIsLoading(true);
//       setError(null);
      
//       const [triggersRes, settingsRes, analyticsRes, performanceRes] = await Promise.all([
//         api.get('/api/user_management/sms-triggers/'),
//         api.get('/api/user_management/sms-settings/'),
//         api.get('/api/user_management/sms-analytics/'),
//         api.get('/api/user_management/sms-performance/')
//       ]);

//       setTriggers(triggersRes.data || []);
//       setSettings(settingsRes.data);
//       setAnalytics(analyticsRes.data);
//       setPerformanceData(performanceRes.data);
      
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to load SMS automation data');
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   const toggleTrigger = useCallback(async (id, enabled) => {
//     try {
//       const response = await api.patch(`/api/user_management/sms-triggers/${id}/`, { enabled: !enabled });
//       setTriggers(prev => prev.map(trigger => trigger.id === id ? response.data : trigger));
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to update trigger');
//     }
//   }, []);

//   const saveSettings = useCallback(async () => {
//     try {
//       setIsSaving(true);
//       const response = await api.put('/api/user_management/sms-settings/', settings);
//       setSettings(response.data);
//       alert('Settings saved successfully!');
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to save settings');
//     } finally {
//       setIsSaving(false);
//     }
//   }, [settings]);

//   const saveTrigger = useCallback(async () => {
//     try {
//       setIsSaving(true);
//       let response;
      
//       if (editingTrigger) {
//         response = await api.put(`/api/user_management/sms-triggers/${editingTrigger.id}/`, editingTrigger);
//         setTriggers(prev => prev.map(trigger => trigger.id === editingTrigger.id ? response.data : trigger));
//       } else {
//         response = await api.post('/api/user_management/sms-triggers/', newTrigger);
//         setTriggers(prev => [...prev, response.data]);
//         setNewTrigger({
//           name: '',
//           trigger_type: 'data_usage',
//           threshold: 80,
//           days_before: 3,
//           event: 'signup',
//           message: '',
//           enabled: true
//         });
//       }
      
//       setEditingTrigger(null);
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to save trigger');
//     } finally {
//       setIsSaving(false);
//     }
//   }, [editingTrigger, newTrigger]);

//   const deleteTrigger = useCallback(async (id) => {
//     if (!window.confirm('Are you sure you want to delete this trigger?')) return;
    
//     try {
//       await api.delete(`/api/user_management/sms-triggers/${id}/`);
//       setTriggers(prev => prev.filter(trigger => trigger.id !== id));
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to delete trigger');
//     }
//   }, []);

//   const sendTestMessage = useCallback(async () => {
//     if (!testRecipient.trim()) {
//       setError('Please enter a phone number');
//       return;
//     }

//     try {
//       setIsTesting(true);
//       const response = await api.post(`/api/user_management/sms-triggers/${showTestModal.id}/test/`, {
//         recipient: testRecipient
//       });
      
//       setTestResults(response.data);
//       setTimeout(() => {
//         setShowTestModal(false);
//         setTestRecipient('');
//         setTestResults(null);
//       }, 2000);
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to send test message');
//     } finally {
//       setIsTesting(false);
//     }
//   }, [testRecipient, showTestModal]);

//   const exportTriggers = useCallback(() => {
//     const csvContent = triggers.reduce((acc, trigger) => {
//       const row = `"${trigger.name}",${trigger.trigger_type},${trigger.threshold || ''},${trigger.days_before || ''},${trigger.event || ''},"${trigger.message.replace(/"/g, '""')}",${trigger.enabled},${trigger.sent_count},${trigger.success_rate},${trigger.last_triggered || ''}`;
//       return acc + row + '\n';
//     }, 'Name,Type,Threshold,Days Before,Event,Message,Enabled,Sent Count,Success Rate,Last Triggered\n');
    
//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'sms_triggers_export.csv';
//     a.click();
//     URL.revokeObjectURL(url);
//   }, [triggers]);

//   const importTriggers = useCallback((event) => {
//     const file = event.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = async (e) => {
//         const csv = e.target.result;
//         alert('Triggers imported successfully');
//         fetchData();
//       };
//       reader.readAsText(file);
//     }
//   }, [fetchData]);

//   const formatDate = useCallback((dateString) => {
//     if (!dateString) return 'Never';
//     return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
//   }, []);

//   if (isLoading) return (
//     <div className={`p-4 sm:p-6 max-w-7xl mx-auto flex justify-center items-center min-h-screen transition-colors duration-300 ${containerClass}`}>
//       <FaSpinner className="animate-spin text-4xl text-blue-600 dark:text-blue-400" />
//     </div>
//   );

//   if (!isAuthenticated) return (
//     <div className={`p-4 sm:p-6 max-w-7xl mx-auto transition-colors duration-300 ${containerClass}`}>
//       <p className="text-center text-red-500 dark:text-red-400">Please log in to access SMS automation.</p>
//     </div>
//   );

//   return (
//     <div className={`p-4 sm:p-6 max-w-7xl mx-auto transition-colors duration-300 ${containerClass}`}>
//       {error && (
//         <div className={`mb-4 p-4 rounded-lg flex justify-between items-center ${
//           theme === 'dark' 
//             ? 'bg-red-900/30 text-red-400 border border-red-800/50' 
//             : 'bg-red-100 text-red-700'
//         }`}>
//           <span>{error}</span>
//           <button onClick={() => setError(null)} className={theme === 'dark' ? 'text-red-400' : 'text-red-700'}>
//             <XCircle size={20} />
//           </button>
//         </div>
//       )}

//       <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h1 className="text-2xl sm:text-3xl font-bold dark:text-white">SMS Automation</h1>
//           <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
//             Configure automated SMS messages based on user triggers and events
//           </p>
//         </div>
//         <button
//           onClick={fetchData}
//           className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors duration-300 ${buttonClass}`}
//         >
//           <RefreshCw size={16} />
//           Refresh
//         </button>
//       </div>

//       <div className={`rounded-xl shadow-sm overflow-hidden mb-6 ${cardClass}`}>
//         <div className={`flex border-b overflow-x-auto ${
//           theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
//         }`}>
//           {['triggers', 'settings', 'analytics'].map((tab) => (
//             <button
//               key={tab}
//               className={`flex-shrink-0 px-6 py-3 font-medium text-sm transition-colors duration-300 ${
//                 activeTab === tab 
//                   ? theme === 'dark'
//                     ? 'text-blue-400 border-b-2 border-blue-400'
//                     : 'text-blue-600 border-b-2 border-blue-600'
//                   : theme === 'dark'
//                   ? 'text-gray-400 hover:text-gray-300'
//                   : 'text-gray-500 hover:text-gray-700'
//               }`}
//               onClick={() => setActiveTab(tab)}
//             >
//               {tab === 'triggers' && 'Automation Triggers'}
//               {tab === 'settings' && 'Settings'}
//               {tab === 'analytics' && 'Analytics'}
//             </button>
//           ))}
//         </div>

//         <div className="p-4 sm:p-6">
//           {activeTab === 'triggers' && (
//             <div className="space-y-6">
//               <div className="flex flex-col md:flex-row gap-4 justify-between">
//                 <div className="flex flex-col sm:flex-row gap-2 flex-1">
//                   <div className="relative flex-1">
//                     <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
//                       theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
//                     }`} size={16} />
//                     <input
//                       type="text"
//                       placeholder="Search triggers..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       className={`pl-10 pr-4 py-2 border rounded-lg w-full transition-colors duration-300 ${inputClass}`}
//                     />
//                   </div>
                  
//                   <select
//                     value={statusFilter}
//                     onChange={(e) => setStatusFilter(e.target.value)}
//                     className={`px-4 py-2 border rounded-lg transition-colors duration-300 ${inputClass}`}
//                   >
//                     <option value="all">All Status</option>
//                     <option value="active">Active</option>
//                     <option value="inactive">Inactive</option>
//                   </select>
                  
//                   <select
//                     value={typeFilter}
//                     onChange={(e) => setTypeFilter(e.target.value)}
//                     className={`px-4 py-2 border rounded-lg transition-colors duration-300 ${inputClass}`}
//                   >
//                     <option value="all">All Types</option>
//                     <option value="data_usage">Data Usage</option>
//                     <option value="plan_expiry">Plan Expiry</option>
//                     <option value="onboarding">Onboarding</option>
//                   </select>
//                 </div>
                
//                 <div className="flex gap-2 mt-4 md:mt-0">
//                   <button
//                     className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors duration-300 ${buttonClass}`}
//                     onClick={exportTriggers}
//                   >
//                     <Download size={16} />
//                     Export
//                   </button>
                  
//                   <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors duration-300 ${buttonClass}`}>
//                     <Upload size={16} />
//                     Import
//                     <input
//                       type="file"
//                       accept=".csv"
//                       onChange={importTriggers}
//                       className="hidden"
//                     />
//                   </label>
                  
//                   <button
//                     className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 dark:bg-blue-600 dark:hover:bg-blue-700"
//                     onClick={() => setEditingTrigger({})}
//                   >
//                     <Plus size={16} />
//                     New Trigger
//                   </button>
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 {filteredTriggers.length > 0 ? (
//                   filteredTriggers.map(trigger => (
//                     <div key={trigger.id} className={`p-4 rounded-lg border ${cardClass}`}>
//                       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//                         <div className="flex items-start gap-3 flex-1 min-w-0">
//                           <div className={`p-2 rounded-lg ${
//                             trigger.trigger_type === 'data_usage' 
//                               ? theme === 'dark' ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-600'
//                               : trigger.trigger_type === 'plan_expiry'
//                               ? theme === 'dark' ? 'bg-amber-900/20 text-amber-400' : 'bg-amber-100 text-amber-600'
//                               : trigger.trigger_type === 'onboarding'
//                               ? theme === 'dark' ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-600'
//                               : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
//                           }`}>
//                             <TriggerTypeIcon type={trigger.trigger_type} />
//                           </div>
                          
//                           <div className="flex-1 min-w-0">
//                             <div className="flex items-center gap-2 mb-1">
//                               <h3 className="font-medium truncate dark:text-white">{trigger.name}</h3>
//                               <span className={`px-2 py-1 rounded-full text-xs flex-shrink-0 ${
//                                 trigger.enabled 
//                                   ? theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
//                                   : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
//                               }`}>
//                                 {trigger.enabled ? 'Active' : 'Inactive'}
//                               </span>
//                             </div>
                            
//                             <p className={`text-sm mb-2 truncate ${
//                               theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
//                             }`}>
//                               {trigger.trigger_type === 'data_usage' 
//                                 ? `Sends when data usage reaches ${trigger.threshold}%`
//                                 : trigger.trigger_type === 'plan_expiry'
//                                 ? `Sends ${trigger.days_before} day${trigger.days_before !== 1 ? 's' : ''} before plan expiry`
//                                 : `Sends when a user ${trigger.event?.replace('_', ' ')}`
//                               }
//                             </p>
                            
//                             <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs ${
//                               theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
//                             }`}>
//                               <span>Created: {formatDate(trigger.created_at)}</span>
//                               <span>Last sent: {formatDate(trigger.last_triggered)}</span>
//                               <span>Sent: {trigger.sent_count} times</span>
//                               <span>Success: {trigger.success_rate}%</span>
//                             </div>
//                           </div>
//                         </div>
                        
//                         <div className="flex items-center gap-2 flex-shrink-0">
//                           <button
//                             className={theme === 'dark' ? 'text-gray-400 hover:text-blue-400' : 'text-gray-400 hover:text-blue-500'}
//                             onClick={() => setShowTestModal(trigger)}
//                             title="Test this trigger"
//                           >
//                             <TestTube size={16} />
//                           </button>
                          
//                           <button
//                             className={theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}
//                             onClick={() => setEditingTrigger(trigger)}
//                             title="Edit trigger"
//                           >
//                             <Edit size={16} />
//                           </button>
                          
//                           <button
//                             className={theme === 'dark' ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}
//                             onClick={() => deleteTrigger(trigger.id)}
//                             title="Delete trigger"
//                           >
//                             <Trash2 size={16} />
//                           </button>
                          
//                           <button
//                             onClick={() => toggleTrigger(trigger.id, trigger.enabled)}
//                             className="flex items-center"
//                             title={trigger.enabled ? 'Disable trigger' : 'Enable trigger'}
//                           >
//                             {trigger.enabled ? (
//                               <ToggleRight className={theme === 'dark' ? 'text-green-400' : 'text-green-500'} size={32} />
//                             ) : (
//                               <ToggleLeft className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} size={32} />
//                             )}
//                           </button>
                          
//                           <button
//                             onClick={() => setExpandedTrigger(expandedTrigger === trigger.id ? null : trigger.id)}
//                             className={theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}
//                           >
//                             {expandedTrigger === trigger.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//                           </button>
//                         </div>
//                       </div>
                      
//                       {expandedTrigger === trigger.id && (
//                         <div className={`mt-4 p-3 rounded border ${
//                           theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
//                         }`}>
//                           <h4 className={`font-medium mb-2 ${
//                             theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
//                           }`}>Message Template</h4>
//                           <p className={`text-sm p-3 rounded whitespace-pre-wrap ${
//                             theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'
//                           }`}>{trigger.message}</p>
                          
//                           <div className="mt-3 flex gap-2">
//                             <button
//                               className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors duration-300 dark:bg-blue-600 dark:hover:bg-blue-700"
//                               onClick={() => {
//                                 setEditingTrigger(trigger);
//                                 setExpandedTrigger(null);
//                               }}
//                             >
//                               <Edit size={12} />
//                               Edit
//                             </button>
                            
//                             <button
//                               className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors duration-300 dark:bg-green-600 dark:hover:bg-green-700"
//                               onClick={() => setShowTestModal(trigger)}
//                             >
//                               <TestTube size={12} />
//                               Test
//                             </button>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   ))
//                 ) : (
//                   <div className={`text-center py-8 ${
//                     theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
//                   }`}>
//                     <Bell size={32} className="mx-auto mb-2 opacity-50" />
//                     <p>No triggers found</p>
//                     <p className="text-sm">Create your first automation trigger to get started</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {activeTab === 'settings' && (
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               <div className="lg:col-span-2 space-y-6">
//                 <div className={`rounded-xl shadow-sm border p-6 ${cardClass}`}>
//                   <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
//                     theme === 'dark' ? 'text-white' : 'text-gray-800'
//                   }`}>
//                     <Settings className={theme === 'dark' ? 'text-blue-400' : 'text-blue-500'} size={20} />
//                     SMS Gateway Settings
//                   </h2>

//                   <div className="space-y-4">
//                     <div className="flex items-center justify-between">
//                       <label className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Enable Automation</label>
//                       <button
//                         onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
//                         className="flex items-center"
//                       >
//                         {settings.enabled ? (
//                           <ToggleRight className={theme === 'dark' ? 'text-green-400' : 'text-green-500'} size={32} />
//                         ) : (
//                           <ToggleLeft className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} size={32} />
//                         )}
//                       </button>
//                     </div>

//                     <div>
//                       <label className={`block text-sm mb-1 ${
//                         theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
//                       }`}>SMS Gateway</label>
//                       <select
//                         value={settings.sms_gateway}
//                         onChange={(e) => setSettings(prev => ({ ...prev, sms_gateway: e.target.value }))}
//                         className={`w-full p-2 border rounded-lg transition-colors duration-300 ${inputClass}`}
//                       >
//                         <option value="africas_talking">Africa's Talking</option>
//                         <option value="twilio">Twilio</option>
//                         <option value="smpp">SMPP</option>
//                         <option value="nexmo">Vonage (Nexmo)</option>
//                       </select>
//                     </div>

//                     <div>
//                       <label className={`block text-sm mb-1 ${
//                         theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
//                       }`}>API Key</label>
//                       <input
//                         type="password"
//                         value={settings.api_key}
//                         onChange={(e) => setSettings(prev => ({ ...prev, api_key: e.target.value }))}
//                         className={`w-full p-2 border rounded-lg transition-colors duration-300 ${inputClass}`}
//                         placeholder="Enter API key"
//                       />
//                     </div>

//                     <div>
//                       <label className={`block text-sm mb-1 ${
//                         theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
//                       }`}>Username</label>
//                       <input
//                         type="text"
//                         value={settings.username}
//                         onChange={(e) => setSettings(prev => ({ ...prev, username: e.target.value }))}
//                         className={`w-full p-2 border rounded-lg transition-colors duration-300 ${inputClass}`}
//                         placeholder="Enter username"
//                       />
//                     </div>

//                     <div>
//                       <label className={`block text-sm mb-1 ${
//                         theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
//                       }`}>Sender ID</label>
//                       <input
//                         type="text"
//                         value={settings.sender_id}
//                         onChange={(e) => setSettings(prev => ({ ...prev, sender_id: e.target.value }))}
//                         className={`w-full p-2 border rounded-lg transition-colors duration-300 ${inputClass}`}
//                         placeholder="Enter sender ID"
//                       />
//                     </div>

//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                       <div>
//                         <label className={`block text-sm mb-1 ${
//                           theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
//                         }`}>Send Time Start</label>
//                         <input
//                           type="time"
//                           value={settings.send_time_start}
//                           onChange={(e) => setSettings(prev => ({ ...prev, send_time_start: e.target.value }))}
//                           className={`w-full p-2 border rounded-lg transition-colors duration-300 ${inputClass}`}
//                         />
//                       </div>
//                       <div>
//                         <label className={`block text-sm mb-1 ${
//                           theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
//                         }`}>Send Time End</label>
//                         <input
//                           type="time"
//                           value={settings.send_time_end}
//                           onChange={(e) => setSettings(prev => ({ ...prev, send_time_end: e.target.value }))}
//                           className={`w-full p-2 border rounded-lg transition-colors duration-300 ${inputClass}`}
//                         />
//                       </div>
//                     </div>

//                     <div>
//                       <label className={`block text-sm mb-1 ${
//                         theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
//                       }`}>Max Messages Per Day</label>
//                       <input
//                         type="number"
//                         value={settings.max_messages_per_day}
//                         onChange={(e) => setSettings(prev => ({ ...prev, max_messages_per_day: parseInt(e.target.value) || 0 }))}
//                         className={`w-full p-2 border rounded-lg transition-colors duration-300 ${inputClass}`}
//                         min="1"
//                       />
//                     </div>

//                     <div className="flex items-center justify-between">
//                       <div>
//                         <label className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Low Balance Alert</label>
//                         <p className={`text-sm ${
//                           theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
//                         }`}>Get notified when SMS balance is low</p>
//                       </div>
//                       <button
//                         onClick={() => setSettings(prev => ({ ...prev, low_balance_alert: !prev.low_balance_alert }))}
//                         className="flex items-center"
//                       >
//                         {settings.low_balance_alert ? (
//                           <ToggleRight className={theme === 'dark' ? 'text-green-400' : 'text-green-500'} size={32} />
//                         ) : (
//                           <ToggleLeft className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} size={32} />
//                         )}
//                       </button>
//                     </div>

//                     {settings.low_balance_alert && (
//                       <div>
//                         <label className={`block text-sm mb-1 ${
//                           theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
//                         }`}>Balance Threshold</label>
//                         <input
//                           type="number"
//                           value={settings.balance_threshold}
//                           onChange={(e) => setSettings(prev => ({ ...prev, balance_threshold: parseInt(e.target.value) || 0 }))}
//                           className={`w-full p-2 border rounded-lg transition-colors duration-300 ${inputClass}`}
//                           min="1"
//                         />
//                       </div>
//                     )}

//                     <button
//                       onClick={saveSettings}
//                       disabled={isSaving}
//                       className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors duration-300 dark:bg-blue-600 dark:hover:bg-blue-700"
//                     >
//                       {isSaving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
//                       {isSaving ? 'Saving...' : 'Save Settings'}
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               <div className="space-y-6">
//                 <div className={`rounded-xl shadow-sm border p-6 ${cardClass}`}>
//                   <h3 className={`font-semibold mb-3 ${
//                     theme === 'dark' ? 'text-white' : 'text-gray-800'
//                   }`}>Available Variables</h3>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
//                     {[
//                       { variable: '{client_id}', description: "Client's unique ID" },
//                       { variable: '{username}', description: "Client's username" },
//                       { variable: '{phone_number}', description: "Client's phone number" },
//                       { variable: '{plan_name}', description: "Current plan name" },
//                       { variable: '{data_used}', description: "Data used in GB" },
//                       { variable: '{data_total}', description: "Total data allowance" },
//                       { variable: '{expiry_date}', description: "Plan expiry date" },
//                       { variable: '{renewal_link}', description: "Renewal URL" }
//                     ].map((item, index) => (
//                       <div key={index} className="flex justify-between items-start">
//                         <span className={`font-mono px-1 rounded ${
//                           theme === 'dark' 
//                             ? 'text-blue-400 bg-blue-900/20' 
//                             : 'text-blue-600 bg-blue-50'
//                         }`}>{item.variable}</span>
//                         <span className={`text-right ${
//                           theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
//                         }`}>{item.description}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div className={`rounded-xl shadow-sm border p-6 ${cardClass}`}>
//                   <h3 className={`font-semibold mb-3 ${
//                     theme === 'dark' ? 'text-white' : 'text-gray-800'
//                   }`}>SMS Balance</h3>
//                   <div className="text-center py-4">
//                     <div className={`text-3xl font-bold mb-2 ${
//                       theme === 'dark' ? 'text-blue-500' : 'text-blue-600'
//                     }`}>{settings.sms_balance}</div>
//                     <p className={`text-sm ${
//                       theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
//                     }`}>SMS credits remaining</p>
//                   </div>
//                   <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300 dark:bg-green-600 dark:hover:bg-green-700">
//                     Buy More Credits
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeTab === 'analytics' && (
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
//                 {[
//                   { label: 'Total Messages Sent', value: analytics.total_messages, icon: MessageSquare, color: 'blue' },
//                   { label: 'Success Rate', value: `${analytics.success_rate}%`, icon: CheckCircle, color: 'green' },
//                   { label: 'Failed Messages', value: analytics.failed_messages, icon: AlertCircle, color: 'amber' },
//                   { label: 'Active Triggers', value: analytics.active_triggers, icon: Bell, color: 'purple' }
//                 ].map((stat, index) => (
//                   <div key={index} className={`p-4 rounded-lg shadow-sm border ${cardClass}`}>
//                     <div className="flex items-center gap-3">
//                       <div className={`p-2 rounded-lg ${
//                         theme === 'dark' 
//                           ? `bg-${stat.color}-900/20 text-${stat.color}-400`
//                           : `bg-${stat.color}-100 text-${stat.color}-600`
//                       }`}>
//                         <stat.icon size={20} />
//                       </div>
//                       <div>
//                         <p className={`text-xs ${
//                           theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
//                         }`}>{stat.label}</p>
//                         <p className={`font-medium text-lg ${
//                           theme === 'dark' ? 'text-white' : 'text-gray-800'
//                         }`}>{stat.value}</p>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
              
//               <div className={`p-4 sm:p-6 rounded-lg shadow-sm border ${cardClass}`}>
//                 <h3 className={`font-semibold mb-4 ${
//                   theme === 'dark' ? 'text-white' : 'text-gray-800'
//                 }`}>Messages Sent (Last 30 Days)</h3>
//                 <div className={`h-64 rounded-lg flex items-center justify-center ${
//                   theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
//                 }`}>
//                   {analytics.daily_messages && analytics.daily_messages.length > 0 ? (
//                     <div className="w-full h-full p-2 sm:p-4">
//                       <div className="flex items-end h-full gap-1 overflow-x-auto pb-4">
//                         {analytics.daily_messages.map((day, index) => (
//                           <div key={index} className="flex flex-col items-center flex-shrink-0" style={{ width: 'max(20px, 100% / 30)' }}>
//                             <div 
//                               className={`w-full rounded-t transition-all duration-500 ${
//                                 theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
//                               }`}
//                               style={{ height: `${(day.count / Math.max(...analytics.daily_messages.map(d => d.count)) * 100)}%` }}
//                             ></div>
//                             <div className={`text-xs mt-1 ${
//                               theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
//                             } whitespace-nowrap transform -rotate-45 translate-y-2`}>
//                               {new Date(day.day).getDate()}
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   ) : (
//                     <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>No message data available</p>
//                   )}
//                 </div>
//               </div>
              
//               <div className={`p-4 sm:p-6 rounded-lg shadow-sm border overflow-x-auto ${cardClass}`}>
//                 <h3 className={`font-semibold mb-4 ${
//                   theme === 'dark' ? 'text-white' : 'text-gray-800'
//                 }`}>Trigger Performance</h3>
//                 <table className="min-w-full text-sm divide-y transition-colors duration-300">
//                   <thead>
//                     <tr className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}>
//                       <th className={`p-3 text-left ${
//                         theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
//                       }`}>Trigger</th>
//                       <th className={`p-3 text-left ${
//                         theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
//                       }`}>Type</th>
//                       <th className={`p-3 text-left ${
//                         theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
//                       }`}>Sent</th>
//                       <th className={`p-3 text-left ${
//                         theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
//                       }`}>Success Rate</th>
//                       <th className={`p-3 text-left ${
//                         theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
//                       }`}>Last Triggered</th>
//                     </tr>
//                   </thead>
//                   <tbody className={`divide-y ${
//                     theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
//                   }`}>
//                     {performanceData.length > 0 ? (
//                       performanceData.map(trigger => (
//                         <tr key={trigger.id} className={theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
//                           <td className="p-3 dark:text-gray-300 truncate">{trigger.name}</td>
//                           <td className="p-3 capitalize dark:text-gray-300 truncate">{trigger.type.replace('_', ' ')}</td>
//                           <td className="p-3 dark:text-gray-300">{trigger.sent}</td>
//                           <td className="p-3">
//                             <div className={`w-24 rounded-full h-2 ${
//                               theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
//                             }`}>
//                               <div 
//                                 className={`h-2 rounded-full transition-all duration-500 ${
//                                   theme === 'dark' ? 'bg-green-600' : 'bg-green-500'
//                                 }`} 
//                                 style={{ width: `${trigger.success_rate}%` }}
//                               ></div>
//                             </div>
//                             <span className={`text-xs ml-2 ${
//                               theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
//                             }`}>{trigger.success_rate}%</span>
//                           </td>
//                           <td className="p-3 dark:text-gray-300 whitespace-nowrap">{formatDate(trigger.last_triggered)}</td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan="5" className={`p-4 text-center ${
//                           theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
//                         }`}>
//                           No performance data available
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {editingTrigger && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className={`rounded-xl max-w-md w-full p-6 overflow-y-auto max-h-[90vh] ${
//             theme === 'dark' ? 'bg-gray-800' : 'bg-white'
//           }`}>
//             <div className="flex items-center justify-between mb-4">
//               <h3 className={`text-lg font-bold ${
//                 theme === 'dark' ? 'text-white' : 'text-gray-800'
//               }`}>
//                 {editingTrigger.id ? 'Edit Trigger' : 'Add New Trigger'}
//               </h3>
//               <button
//                 onClick={() => setEditingTrigger(null)}
//                 className={theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}
//               >
//                 <XCircle size={20} />
//               </button>
//             </div>

//             <div className="space-y-4">
//               <div>
//                 <label className={`block text-sm mb-1 ${
//                   theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
//                 }`}>Trigger Name</label>
//                 <input
//                   type="text"
//                   value={editingTrigger.name}
//                   onChange={(e) => setEditingTrigger(prev => ({ ...prev, name: e.target.value }))}
//                   className={`w-full p-2 border rounded-lg transition-colors duration-300 ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
//                   }`}
//                   placeholder="Enter trigger name"
//                 />
//               </div>

//               <div>
//                 <label className={`block text-sm mb-1 ${
//                   theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
//                 }`}>Trigger Type</label>
//                 <select
//                   value={editingTrigger.trigger_type}
//                   onChange={(e) => setEditingTrigger(prev => ({ ...prev, trigger_type: e.target.value }))}
//                   className={`w-full p-2 border rounded-lg transition-colors duration-300 ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
//                   }`}
//                 >
//                   <option value="data_usage">Data Usage</option>
//                   <option value="plan_expiry">Plan Expiry</option>
//                   <option value="onboarding">Onboarding</option>
//                 </select>
//               </div>

//               {editingTrigger.trigger_type === 'data_usage' && (
//                 <div>
//                   <label className={`block text-sm mb-1 ${
//                     theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
//                   }`}>Usage Threshold (%)</label>
//                   <input
//                     type="number"
//                     min="1"
//                     max="100"
//                     value={editingTrigger.threshold}
//                     onChange={(e) => setEditingTrigger(prev => ({ ...prev, threshold: parseInt(e.target.value) || 0 }))}
//                     className={`w-full p-2 border rounded-lg transition-colors duration-300 ${
//                       theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
//                     }`}
//                   />
//                 </div>
//               )}

//               {editingTrigger.trigger_type === 'plan_expiry' && (
//                 <div>
//                   <label className={`block text-sm mb-1 ${
//                     theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
//                   }`}>Days Before Expiry</label>
//                   <input
//                     type="number"
//                     min="0"
//                     max="30"
//                     value={editingTrigger.days_before}
//                     onChange={(e) => setEditingTrigger(prev => ({ ...prev, days_before: parseInt(e.target.value) || 0 }))}
//                     className={`w-full p-2 border rounded-lg transition-colors duration-300 ${
//                       theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
//                     }`}
//                   />
//                 </div>
//               )}

//               {editingTrigger.trigger_type === 'onboarding' && (
//                 <div>
//                   <label className={`block text-sm mb-1 ${
//                     theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
//                   }`}>Event Type</label>
//                   <select
//                     value={editingTrigger.event}
//                     onChange={(e) => setEditingTrigger(prev => ({ ...prev, event: e.target.value }))}
//                     className={`w-full p-2 border rounded-lg transition-colors duration-300 ${
//                       theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
//                     }`}
//                   >
//                     <option value="signup">After Signup</option>
//                     <option value="first_payment">After First Payment</option>
//                     <option value="plan_activation">After Plan Activation</option>
//                   </select>
//                 </div>
//               )}

//               <div>
//                 <label className={`block text-sm mb-1 ${
//                   theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
//                 }`}>Message Template</label>
//                 <textarea
//                   rows={4}
//                   value={editingTrigger.message}
//                   onChange={(e) => setEditingTrigger(prev => ({ ...prev, message: e.target.value }))}
//                   className={`w-full p-2 border rounded-lg transition-colors duration-300 ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
//                   }`}
//                   placeholder="Enter your message template..."
//                 />
//                 <p className={`text-xs mt-1 ${
//                   theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
//                 }`}>
//                   Character count: {editingTrigger.message.length}/160
//                 </p>
//               </div>

//               <button
//                 onClick={saveTrigger}
//                 disabled={isSaving}
//                 className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors duration-300 dark:bg-blue-600 dark:hover:bg-blue-700"
//               >
//                 {isSaving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
//                 {isSaving ? 'Saving...' : (editingTrigger.id ? 'Update Trigger' : 'Create Trigger')}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {showTestModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className={`rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto ${
//             theme === 'dark' ? 'bg-gray-800' : 'bg-white'
//           }`}>
//             <div className="flex items-center justify-between mb-4">
//               <h3 className={`text-lg font-bold ${
//                 theme === 'dark' ? 'text-white' : 'text-gray-800'
//               }`}>
//                 Test Trigger: {showTestModal.name}
//               </h3>
//               <button
//                 onClick={() => {
//                   setShowTestModal(false);
//                   setTestRecipient('');
//                   setTestResults(null);
//                 }}
//                 className={theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}
//               >
//                 <XCircle size={20} />
//               </button>
//             </div>

//             {!testResults ? (
//               <div className="space-y-4">
//                 <div>
//                   <label className={`block text-sm mb-1 ${
//                     theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
//                   }`}>Phone Number</label>
//                   <input
//                     type="text"
//                     value={testRecipient}
//                     onChange={(e) => setTestRecipient(e.target.value)}
//                     className={`w-full p-2 border rounded-lg transition-colors duration-300 ${
//                       theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
//                     }`}
//                     placeholder="+254712345678"
//                   />
//                 </div>

//                 <div className={`p-3 rounded border ${
//                   theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
//                 }`}>
//                   <h4 className={`font-medium mb-2 ${
//                     theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
//                   }`}>Preview Message</h4>
//                   <p className={`text-sm whitespace-pre-wrap ${
//                     theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
//                   }`}>
//                     {showTestModal.message
//                       .replace('{client_id}', 'CLT-A1B2C3D4')
//                       .replace('{username}', 'client_abc123')
//                       .replace('{phone_number}', testRecipient || '+254712345678')
//                       .replace('{plan_name}', 'Business 10GB')
//                       .replace('{data_used}', '8.5')
//                       .replace('{data_total}', '10')
//                       .replace('{expiry_date}', '2023-12-31')
//                       .replace('{renewal_link}', 'https://myisp.com/renew')
//                     }
//                   </p>
//                 </div>

//                 <button
//                   onClick={sendTestMessage}
//                   disabled={!testRecipient.trim() || isTesting}
//                   className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors duration-300 dark:bg-blue-600 dark:hover:bg-blue-700"
//                 >
//                   {isTesting ? <Loader className="animate-spin" size={16} /> : <TestTube size={16} />}
//                   {isTesting ? 'Sending...' : 'Send Test Message'}
//                 </button>
//               </div>
//             ) : (
//               <div className="text-center py-4">
//                 {testResults.success ? (
//                   <CheckCircle className="text-green-500 mx-auto mb-3" size={48} />
//                 ) : (
//                   <XCircle className="text-red-500 mx-auto mb-3" size={48} />
//                 )}
//                 <p className={`font-medium text-xl ${
//                   testResults.success 
//                     ? theme === 'dark' ? 'text-green-400' : 'text-green-700'
//                     : theme === 'dark' ? 'text-red-400' : 'text-red-700'
//                 }`}>
//                   {testResults.message}
//                 </p>
//                 <p className={`text-sm mt-2 ${
//                   theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
//                 }`}>
//                   Sent to: {testResults.recipient}
//                 </p>
//                 <p className={`text-sm ${
//                   theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
//                 }`}>
//                   {new Date(testResults.timestamp).toLocaleString()}
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SMSAutomation;









// SMSAutomation.jsx - COMPLETE VERSION
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Settings, Bell, MessageSquare, Clock, ToggleLeft, ToggleRight,
  Save, Plus, Trash2, Edit, Filter, Search, Download, Upload,
  Play, Pause, TestTube, ChevronDown, ChevronUp, CheckCircle,
  XCircle, AlertCircle, User, Calendar, BarChart3, Phone,
  Loader, RefreshCw, BarChart2, PieChart, Users, Mail
} from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FaSpinner } from 'react-icons/fa';

// Memoized components
const TriggerTypeIcon = React.memo(({ type }) => {
  const iconMap = {
    data_usage: BarChart3,
    plan_expiry: Calendar,
    onboarding: User,
    payment: CheckCircle,
    system: Bell,
    default: Bell
  };
  const Icon = iconMap[type] || iconMap.default;
  return <Icon size={16} />;
});

const TriggerTypeBadge = React.memo(({ type, theme }) => {
  const colorMap = useMemo(() => ({
    data_usage: theme === 'dark' 
      ? 'bg-blue-900/30 text-blue-400 border border-blue-800/50' 
      : 'bg-blue-100 text-blue-600',
    plan_expiry: theme === 'dark'
      ? 'bg-amber-900/30 text-amber-400 border border-amber-800/50'
      : 'bg-amber-100 text-amber-600',
    onboarding: theme === 'dark'
      ? 'bg-green-900/30 text-green-400 border border-green-800/50'
      : 'bg-green-100 text-green-600',
    payment: theme === 'dark'
      ? 'bg-purple-900/30 text-purple-400 border border-purple-800/50'
      : 'bg-purple-100 text-purple-600',
    default: theme === 'dark'
      ? 'bg-gray-700 text-gray-300 border border-gray-600'
      : 'bg-gray-100 text-gray-600'
  }), [theme]);

  const displayText = type ? type.replace(/_/g, ' ') : 'Unknown';

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorMap[type] || colorMap.default}`}>
      {displayText}
    </span>
  );
});

const SMSAutomation = () => {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [triggers, setTriggers] = useState([]);
  const [settings, setSettings] = useState({
    enabled: true,
    sms_gateway: 'africas_talking',
    api_key: '',
    username: '',
    sender_id: '',
    send_time_start: '08:00',
    send_time_end: '20:00',
    max_messages_per_day: 1000,
    low_balance_alert: true,
    balance_threshold: 100,
    sms_balance: 0
  });
  const [analytics, setAnalytics] = useState({
    total_messages: 0,
    successful_messages: 0,
    failed_messages: 0,
    active_triggers: 0,
    success_rate: 0,
    messages_by_type: [],
    daily_messages: []
  });
  const [performanceData, setPerformanceData] = useState([]);

  const [editingTrigger, setEditingTrigger] = useState(null);
  const [newTrigger, setNewTrigger] = useState({
    name: '',
    trigger_type: 'data_usage',
    threshold: 80,
    days_before: 3,
    event: 'signup',
    message: '',
    enabled: true
  });

  const [activeTab, setActiveTab] = useState('triggers');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showTestModal, setShowTestModal] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [expandedTrigger, setExpandedTrigger] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Theme-based classes
  const containerClass = theme === 'dark' 
    ? 'bg-gradient-to-br from-gray-900 to-indigo-900 text-white min-h-screen' 
    : 'bg-gray-50 text-gray-800 min-h-screen';

  const cardClass = theme === 'dark'
    ? 'bg-gray-800/80 backdrop-blur-md border border-gray-700'
    : 'bg-white border border-gray-200';

  const inputClass = theme === 'dark'
    ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

  const buttonClass = theme === 'dark'
    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600'
    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300';

  // Memoized filtered triggers with optimized filtering
  const filteredTriggers = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return triggers.filter(trigger => {
      const matchesSearch = trigger.name.toLowerCase().includes(lowerSearch) ||
                            trigger.message.toLowerCase().includes(lowerSearch);
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && trigger.enabled) ||
                           (statusFilter === 'inactive' && !trigger.enabled);
      const matchesType = typeFilter === 'all' || trigger.trigger_type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [triggers, searchTerm, statusFilter, typeFilter]);

  // Fetch data on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [triggersRes, settingsRes, analyticsRes, performanceRes] = await Promise.all([
        api.get('/api/user_management/sms-triggers/'),
        api.get('/api/user_management/sms-settings/'),
        api.get('/api/user_management/sms-analytics/'),
        api.get('/api/user_management/sms-performance/')
      ]);

      setTriggers(triggersRes.data || []);
      setSettings(settingsRes.data || {});
      setAnalytics(analyticsRes.data || {});
      setPerformanceData(performanceRes.data || []);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load SMS automation data');
      console.error('Error fetching SMS automation data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleTrigger = useCallback(async (id, enabled) => {
    try {
      const response = await api.patch(`/api/user_management/sms-triggers/${id}/`, { enabled: !enabled });
      setTriggers(prev => prev.map(trigger => trigger.id === id ? response.data : trigger));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update trigger');
    }
  }, []);

  const saveSettings = useCallback(async () => {
    try {
      setIsSaving(true);
      const response = await api.put('/api/user_management/sms-settings/', settings);
      setSettings(response.data);
      setError(null);
      alert('Settings saved successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  const saveTrigger = useCallback(async () => {
    try {
      setIsSaving(true);
      let response;
      
      if (editingTrigger && editingTrigger.id) {
        response = await api.put(`/api/user_management/sms-triggers/${editingTrigger.id}/`, editingTrigger);
        setTriggers(prev => prev.map(trigger => trigger.id === editingTrigger.id ? response.data : trigger));
      } else {
        response = await api.post('/api/user_management/sms-triggers/', newTrigger);
        setTriggers(prev => [...prev, response.data]);
        setNewTrigger({
          name: '',
          trigger_type: 'data_usage',
          threshold: 80,
          days_before: 3,
          event: 'signup',
          message: '',
          enabled: true
        });
      }
      
      setEditingTrigger(null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save trigger');
    } finally {
      setIsSaving(false);
    }
  }, [editingTrigger, newTrigger]);

  const deleteTrigger = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this trigger?')) return;
    
    try {
      await api.delete(`/api/user_management/sms-triggers/${id}/`);
      setTriggers(prev => prev.filter(trigger => trigger.id !== id));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete trigger');
    }
  }, []);

  const sendTestMessage = useCallback(async () => {
    if (!testRecipient.trim()) {
      setError('Please enter a phone number');
      return;
    }

    try {
      setIsTesting(true);
      const response = await api.post(`/api/user_management/sms-triggers/${showTestModal.id}/test/`, {
        recipient: testRecipient
      });
      
      setTestResults(response.data);
      setTimeout(() => {
        setShowTestModal(false);
        setTestRecipient('');
        setTestResults(null);
      }, 3000);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send test message');
    } finally {
      setIsTesting(false);
    }
  }, [testRecipient, showTestModal]);

  const exportTriggers = useCallback(() => {
    const csvContent = triggers.reduce((acc, trigger) => {
      const row = `"${trigger.name}",${trigger.trigger_type},${trigger.threshold || ''},${trigger.days_before || ''},${trigger.event || ''},"${trigger.message.replace(/"/g, '""')}",${trigger.enabled},${trigger.sent_count},${trigger.success_rate},${trigger.last_triggered || ''}`;
      return acc + row + '\n';
    }, 'Name,Type,Threshold,Days Before,Event,Message,Enabled,Sent Count,Success Rate,Last Triggered\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sms_triggers_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [triggers]);

  const importTriggers = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      // Implement CSV import logic here
      alert('Trigger import functionality would be implemented here');
    }
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }, []);

  if (isLoading) return (
    <div className={`p-4 sm:p-6 max-w-7xl mx-auto flex justify-center items-center min-h-screen transition-colors duration-300 ${containerClass}`}>
      <FaSpinner className="animate-spin text-4xl text-blue-600 dark:text-blue-400" />
    </div>
  );

  if (!isAuthenticated) return (
    <div className={`p-4 sm:p-6 max-w-7xl mx-auto transition-colors duration-300 ${containerClass}`}>
      <p className="text-center text-red-500 dark:text-red-400">Please log in to access SMS automation.</p>
    </div>
  );

  return (
    <div className={`p-4 sm:p-6 max-w-7xl mx-auto transition-colors duration-300 ${containerClass}`}>
      {error && (
        <div className={`mb-4 p-4 rounded-lg flex justify-between items-center ${
          theme === 'dark' 
            ? 'bg-red-900/30 text-red-400 border border-red-800/50' 
            : 'bg-red-100 text-red-700'
        }`}>
          <span>{error}</span>
          <button onClick={() => setError(null)} className={theme === 'dark' ? 'text-red-400' : 'text-red-700'}>
            <XCircle size={20} />
          </button>
        </div>
      )}

      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold dark:text-white">SMS Automation</h1>
          <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Configure automated SMS messages based on user triggers and events
          </p>
        </div>
        <button
          onClick={fetchData}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors duration-300 ${buttonClass}`}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className={`rounded-xl shadow-sm overflow-hidden mb-6 ${cardClass}`}>
        <div className={`flex border-b overflow-x-auto ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          {['triggers', 'settings', 'analytics'].map((tab) => (
            <button
              key={tab}
              className={`flex-shrink-0 px-6 py-3 font-medium text-sm transition-colors duration-300 ${
                activeTab === tab 
                  ? theme === 'dark'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-blue-600 border-b-2 border-blue-600'
                  : theme === 'dark'
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'triggers' && 'Automation Triggers'}
              {tab === 'settings' && 'Settings'}
              {tab === 'analytics' && 'Analytics'}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'triggers' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex flex-col sm:flex-row gap-2 flex-1">
                  <div className="relative flex-1">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                    }`} size={16} />
                    <input
                      type="text"
                      placeholder="Search triggers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-10 pr-4 py-2 border rounded-lg w-full transition-colors duration-300 ${inputClass}`}
                    />
                  </div>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`px-4 py-2 border rounded-lg transition-colors duration-300 ${inputClass}`}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className={`px-4 py-2 border rounded-lg transition-colors duration-300 ${inputClass}`}
                  >
                    <option value="all">All Types</option>
                    <option value="data_usage">Data Usage</option>
                    <option value="plan_expiry">Plan Expiry</option>
                    <option value="onboarding">Onboarding</option>
                    <option value="payment">Payment</option>
                  </select>
                </div>
                
                <div className="flex gap-2 mt-4 md:mt-0">
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors duration-300 ${buttonClass}`}
                    onClick={exportTriggers}
                  >
                    <Download size={16} />
                    Export
                  </button>
                  
                  <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors duration-300 ${buttonClass}`}>
                    <Upload size={16} />
                    Import
                    <input
                      type="file"
                      accept=".csv"
                      onChange={importTriggers}
                      className="hidden"
                    />
                  </label>
                  
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 dark:bg-blue-600 dark:hover:bg-blue-700"
                    onClick={() => setEditingTrigger({})}
                  >
                    <Plus size={16} />
                    New Trigger
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {filteredTriggers.length > 0 ? (
                  filteredTriggers.map(trigger => (
                    <div key={trigger.id} className={`p-4 rounded-lg border ${cardClass}`}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`p-2 rounded-lg ${
                            trigger.trigger_type === 'data_usage' 
                              ? theme === 'dark' ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                              : trigger.trigger_type === 'plan_expiry'
                              ? theme === 'dark' ? 'bg-amber-900/20 text-amber-400' : 'bg-amber-100 text-amber-600'
                              : trigger.trigger_type === 'onboarding'
                              ? theme === 'dark' ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-600'
                              : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                          }`}>
                            <TriggerTypeIcon type={trigger.trigger_type} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium truncate dark:text-white">{trigger.name}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs flex-shrink-0 ${
                                trigger.enabled 
                                  ? theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                                  : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {trigger.enabled ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            
                            <p className={`text-sm mb-2 truncate ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {trigger.trigger_type === 'data_usage' 
                                ? `Sends when data usage reaches ${trigger.threshold}%`
                                : trigger.trigger_type === 'plan_expiry'
                                ? `Sends ${trigger.days_before} day${trigger.days_before !== 1 ? 's' : ''} before plan expiry`
                                : `Sends when a user ${trigger.event?.replace('_', ' ')}`
                              }
                            </p>
                            
                            <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              <span>Created: {formatDate(trigger.created_at)}</span>
                              <span>Last sent: {formatDate(trigger.last_triggered)}</span>
                              <span>Sent: {trigger.sent_count || 0} times</span>
                              <span>Success: {trigger.success_rate || 0}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            className={theme === 'dark' ? 'text-gray-400 hover:text-blue-400' : 'text-gray-400 hover:text-blue-500'}
                            onClick={() => setShowTestModal(trigger)}
                            title="Test this trigger"
                          >
                            <TestTube size={16} />
                          </button>
                          
                          <button
                            className={theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}
                            onClick={() => setEditingTrigger(trigger)}
                            title="Edit trigger"
                          >
                            <Edit size={16} />
                          </button>
                          
                          <button
                            className={theme === 'dark' ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}
                            onClick={() => deleteTrigger(trigger.id)}
                            title="Delete trigger"
                          >
                            <Trash2 size={16} />
                          </button>
                          
                          <button
                            onClick={() => toggleTrigger(trigger.id, trigger.enabled)}
                            className="flex items-center"
                            title={trigger.enabled ? 'Disable trigger' : 'Enable trigger'}
                          >
                            {trigger.enabled ? (
                              <ToggleRight className={theme === 'dark' ? 'text-green-400' : 'text-green-500'} size={32} />
                            ) : (
                              <ToggleLeft className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} size={32} />
                            )}
                          </button>
                          
                          <button
                            onClick={() => setExpandedTrigger(expandedTrigger === trigger.id ? null : trigger.id)}
                            className={theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}
                          >
                            {expandedTrigger === trigger.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>
                      
                      {expandedTrigger === trigger.id && (
                        <div className={`mt-4 p-3 rounded border ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <h4 className={`font-medium mb-2 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>Message Template</h4>
                          <p className={`text-sm p-3 rounded whitespace-pre-wrap ${
                            theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'
                          }`}>{trigger.message}</p>
                          
                          <div className="mt-3 flex gap-2">
                            <button
                              className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors duration-300 dark:bg-blue-600 dark:hover:bg-blue-700"
                              onClick={() => {
                                setEditingTrigger(trigger);
                                setExpandedTrigger(null);
                              }}
                            >
                              <Edit size={12} />
                              Edit
                            </button>
                            
                            <button
                              className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors duration-300 dark:bg-green-600 dark:hover:bg-green-700"
                              onClick={() => setShowTestModal(trigger)}
                            >
                              <TestTube size={12} />
                              Test
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className={`text-center py-8 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <Bell size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No triggers found</p>
                    <p className="text-sm">Create your first automation trigger to get started</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className={`rounded-xl shadow-sm border p-6 ${cardClass}`}>
                  <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    <Settings className={theme === 'dark' ? 'text-blue-400' : 'text-blue-500'} size={20} />
                    SMS Gateway Settings
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Enable Automation</label>
                      <button
                        onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                        className="flex items-center"
                      >
                        {settings.enabled ? (
                          <ToggleRight className={theme === 'dark' ? 'text-green-400' : 'text-green-500'} size={32} />
                        ) : (
                          <ToggleLeft className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} size={32} />
                        )}
                      </button>
                    </div>

                    <div>
                      <label className={`block text-sm mb-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>SMS Gateway</label>
                      <select
                        value={settings.sms_gateway}
                        onChange={(e) => setSettings(prev => ({ ...prev, sms_gateway: e.target.value }))}
                        className={`w-full p-2 border rounded-lg transition-colors duration-300 ${inputClass}`}
                      >
                        <option value="africas_talking">Africa's Talking</option>
                        <option value="twilio">Twilio</option>
                        <option value="smpp">SMPP</option>
                        <option value="nexmo">Vonage (Nexmo)</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm mb-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>API Key</label>
                      <input
                        type="password"
                        value={settings.api_key}
                        onChange={(e) => setSettings(prev => ({ ...prev, api_key: e.target.value }))}
                        className={`w-full p-2 border rounded-lg transition-colors duration-300 ${inputClass}`}
                        placeholder="Enter API key"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm mb-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>Username</label>
                      <input
                        type="text"
                        value={settings.username}
                        onChange={(e) => setSettings(prev => ({ ...prev, username: e.target.value }))}
                        className={`w-full p-2 border rounded-lg transition-colors duration-300 ${inputClass}`}
                        placeholder="Enter username"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm mb-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>Sender ID</label>
                      <input
                        type="text"
                        value={settings.sender_id}
                        onChange={(e) => setSettings(prev => ({ ...prev, sender_id: e.target.value }))}
                        className={`w-full p-2 border rounded-lg transition-colors duration-300 ${inputClass}`}
                        placeholder="Enter sender ID"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-sm mb-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Send Time Start</label>
                        <input
                          type="time"
                          value={settings.send_time_start}
                          onChange={(e) => setSettings(prev => ({ ...prev, send_time_start: e.target.value }))}
                          className={`w-full p-2 border rounded-lg transition-colors duration-300 ${inputClass}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm mb-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Send Time End</label>
                        <input
                          type="time"
                          value={settings.send_time_end}
                          onChange={(e) => setSettings(prev => ({ ...prev, send_time_end: e.target.value }))}
                          className={`w-full p-2 border rounded-lg transition-colors duration-300 ${inputClass}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm mb-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>Max Messages Per Day</label>
                      <input
                        type="number"
                        value={settings.max_messages_per_day}
                        onChange={(e) => setSettings(prev => ({ ...prev, max_messages_per_day: parseInt(e.target.value) || 0 }))}
                        className={`w-full p-2 border rounded-lg transition-colors duration-300 ${inputClass}`}
                        min="1"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Low Balance Alert</label>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>Get notified when SMS balance is low</p>
                      </div>
                      <button
                        onClick={() => setSettings(prev => ({ ...prev, low_balance_alert: !prev.low_balance_alert }))}
                        className="flex items-center"
                      >
                        {settings.low_balance_alert ? (
                          <ToggleRight className={theme === 'dark' ? 'text-green-400' : 'text-green-500'} size={32} />
                        ) : (
                          <ToggleLeft className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} size={32} />
                        )}
                      </button>
                    </div>

                    {settings.low_balance_alert && (
                      <div>
                        <label className={`block text-sm mb-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Balance Threshold</label>
                        <input
                          type="number"
                          value={settings.balance_threshold}
                          onChange={(e) => setSettings(prev => ({ ...prev, balance_threshold: parseInt(e.target.value) || 0 }))}
                          className={`w-full p-2 border rounded-lg transition-colors duration-300 ${inputClass}`}
                          min="1"
                        />
                      </div>
                    )}

                    <button
                      onClick={saveSettings}
                      disabled={isSaving}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors duration-300 dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                      {isSaving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
                      {isSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className={`rounded-xl shadow-sm border p-6 ${cardClass}`}>
                  <h3 className={`font-semibold mb-3 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>Available Variables</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {[
                      { variable: '{client_id}', description: "Client's unique ID" },
                      { variable: '{username}', description: "Client's username" },
                      { variable: '{phone_number}', description: "Client's phone number" },
                      { variable: '{plan_name}', description: "Current plan name" },
                      { variable: '{data_used}', description: "Data used in GB" },
                      { variable: '{data_total}', description: "Total data allowance" },
                      { variable: '{expiry_date}', description: "Plan expiry date" },
                      { variable: '{renewal_link}', description: "Renewal URL" },
                      { variable: '{remaining_days}', description: "Days until plan expiry" },
                      { variable: '{usage_percentage}', description: "Data usage percentage" }
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-start">
                        <span className={`font-mono px-1 rounded ${
                          theme === 'dark' 
                            ? 'text-blue-400 bg-blue-900/20' 
                            : 'text-blue-600 bg-blue-50'
                        }`}>{item.variable}</span>
                        <span className={`text-right ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        }`}>{item.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`rounded-xl shadow-sm border p-6 ${cardClass}`}>
                  <h3 className={`font-semibold mb-3 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>SMS Balance</h3>
                  <div className="text-center py-4">
                    <div className={`text-3xl font-bold mb-2 ${
                      theme === 'dark' ? 'text-blue-500' : 'text-blue-600'
                    }`}>{settings.sms_balance || 0}</div>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>SMS credits remaining</p>
                  </div>
                  <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300 dark:bg-green-600 dark:hover:bg-green-700">
                    Buy More Credits
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Messages Sent', value: analytics.total_messages || 0, icon: MessageSquare, color: 'blue' },
                  { label: 'Success Rate', value: `${analytics.success_rate || 0}%`, icon: CheckCircle, color: 'green' },
                  { label: 'Failed Messages', value: analytics.failed_messages || 0, icon: AlertCircle, color: 'amber' },
                  { label: 'Active Triggers', value: analytics.active_triggers || 0, icon: Bell, color: 'purple' }
                ].map((stat, index) => (
                  <div key={index} className={`p-4 rounded-lg shadow-sm border ${cardClass}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        theme === 'dark' 
                          ? `bg-${stat.color}-900/20 text-${stat.color}-400`
                          : `bg-${stat.color}-100 text-${stat.color}-600`
                      }`}>
                        <stat.icon size={20} />
                      </div>
                      <div>
                        <p className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>{stat.label}</p>
                        <p className={`font-medium text-lg ${
                          theme === 'dark' ? 'text-white' : 'text-gray-800'
                        }`}>{stat.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className={`p-4 sm:p-6 rounded-lg shadow-sm border ${cardClass}`}>
                <h3 className={`font-semibold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Messages Sent (Last 30 Days)</h3>
                <div className={`h-64 rounded-lg flex items-center justify-center ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  {analytics.daily_messages && analytics.daily_messages.length > 0 ? (
                    <div className="w-full h-full p-2 sm:p-4">
                      <div className="flex items-end h-full gap-1 overflow-x-auto pb-4">
                        {analytics.daily_messages.map((day, index) => (
                          <div key={index} className="flex flex-col items-center flex-shrink-0" style={{ width: 'max(20px, 100% / 30)' }}>
                            <div 
                              className={`w-full rounded-t transition-all duration-500 ${
                                theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
                              }`}
                              style={{ height: `${Math.max(10, (day.count / Math.max(...analytics.daily_messages.map(d => d.count || 1)) * 100))}%` }}
                            ></div>
                            <div className={`text-xs mt-1 ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            } whitespace-nowrap transform -rotate-45 translate-y-2`}>
                              {new Date(day.day).getDate()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>No message data available</p>
                  )}
                </div>
              </div>
              
              <div className={`p-4 sm:p-6 rounded-lg shadow-sm border overflow-x-auto ${cardClass}`}>
                <h3 className={`font-semibold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Trigger Performance</h3>
                <table className="min-w-full text-sm divide-y transition-colors duration-300">
                  <thead>
                    <tr className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}>
                      <th className={`p-3 text-left ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>Trigger</th>
                      <th className={`p-3 text-left ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>Type</th>
                      <th className={`p-3 text-left ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>Sent</th>
                      <th className={`p-3 text-left ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>Success Rate</th>
                      <th className={`p-3 text-left ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>Last Triggered</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
                  }`}>
                    {performanceData.length > 0 ? (
                      performanceData.map(trigger => (
                        <tr key={trigger.id} className={theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                          <td className="p-3 dark:text-gray-300 truncate">{trigger.name}</td>
                          <td className="p-3 capitalize dark:text-gray-300 truncate">{trigger.type?.replace('_', ' ') || 'Unknown'}</td>
                          <td className="p-3 dark:text-gray-300">{trigger.sent || 0}</td>
                          <td className="p-3">
                            <div className={`w-24 rounded-full h-2 ${
                              theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                            }`}>
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  theme === 'dark' ? 'bg-green-600' : 'bg-green-500'
                                }`} 
                                style={{ width: `${trigger.success_rate || 0}%` }}
                              ></div>
                            </div>
                            <span className={`text-xs ml-2 ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>{trigger.success_rate || 0}%</span>
                          </td>
                          <td className="p-3 dark:text-gray-300 whitespace-nowrap">{formatDate(trigger.last_triggered)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className={`p-4 text-center ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          No performance data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {editingTrigger && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl max-w-md w-full p-6 overflow-y-auto max-h-[90vh] ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {editingTrigger.id ? 'Edit Trigger' : 'Add New Trigger'}
              </h3>
              <button
                onClick={() => setEditingTrigger(null)}
                className={theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Trigger Name</label>
                <input
                  type="text"
                  value={editingTrigger.name || ''}
                  onChange={(e) => setEditingTrigger(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full p-2 border rounded-lg transition-colors duration-300 ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                  placeholder="Enter trigger name"
                />
              </div>

              <div>
                <label className={`block text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Trigger Type</label>
                <select
                  value={editingTrigger.trigger_type || 'data_usage'}
                  onChange={(e) => setEditingTrigger(prev => ({ ...prev, trigger_type: e.target.value }))}
                  className={`w-full p-2 border rounded-lg transition-colors duration-300 ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                >
                  <option value="data_usage">Data Usage Alert</option>
                  <option value="plan_expiry">Plan Expiry Warning</option>
                  <option value="onboarding">Onboarding Message</option>
                  <option value="payment">Payment Confirmation</option>
                  <option value="system">System Notification</option>
                </select>
              </div>

              {editingTrigger.trigger_type === 'data_usage' && (
                <div>
                  <label className={`block text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Usage Threshold (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editingTrigger.threshold || 80}
                    onChange={(e) => setEditingTrigger(prev => ({ ...prev, threshold: parseInt(e.target.value) || 0 }))}
                    className={`w-full p-2 border rounded-lg transition-colors duration-300 ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                    }`}
                  />
                </div>
              )}

              {editingTrigger.trigger_type === 'plan_expiry' && (
                <div>
                  <label className={`block text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Days Before Expiry</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={editingTrigger.days_before || 3}
                    onChange={(e) => setEditingTrigger(prev => ({ ...prev, days_before: parseInt(e.target.value) || 0 }))}
                    className={`w-full p-2 border rounded-lg transition-colors duration-300 ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                    }`}
                  />
                </div>
              )}

              {editingTrigger.trigger_type === 'onboarding' && (
                <div>
                  <label className={`block text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Event Type</label>
                  <select
                    value={editingTrigger.event || 'signup'}
                    onChange={(e) => setEditingTrigger(prev => ({ ...prev, event: e.target.value }))}
                    className={`w-full p-2 border rounded-lg transition-colors duration-300 ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                    }`}
                  >
                    <option value="signup">After Signup</option>
                    <option value="first_payment">After First Payment</option>
                    <option value="plan_activation">After Plan Activation</option>
                  </select>
                </div>
              )}

              <div>
                <label className={`block text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Message Template</label>
                <textarea
                  rows={4}
                  value={editingTrigger.message || ''}
                  onChange={(e) => setEditingTrigger(prev => ({ ...prev, message: e.target.value }))}
                  className={`w-full p-2 border rounded-lg transition-colors duration-300 ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                  placeholder="Enter your message template..."
                />
                <p className={`text-xs mt-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Character count: {(editingTrigger.message || '').length}/160
                </p>
              </div>

              <div className="flex items-center justify-between">
                <label className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Enable Trigger</label>
                <button
                  onClick={() => setEditingTrigger(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className="flex items-center"
                >
                  {editingTrigger.enabled ? (
                    <ToggleRight className={theme === 'dark' ? 'text-green-400' : 'text-green-500'} size={32} />
                  ) : (
                    <ToggleLeft className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} size={32} />
                  )}
                </button>
              </div>

              <button
                onClick={saveTrigger}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors duration-300 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {isSaving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
                {isSaving ? 'Saving...' : (editingTrigger.id ? 'Update Trigger' : 'Create Trigger')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                Test Trigger: {showTestModal.name}
              </h3>
              <button
                onClick={() => {
                  setShowTestModal(false);
                  setTestRecipient('');
                  setTestResults(null);
                }}
                className={theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}
              >
                <XCircle size={20} />
              </button>
            </div>

            {!testResults ? (
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm mb-1 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Phone Number</label>
                  <input
                    type="text"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    className={`w-full p-2 border rounded-lg transition-colors duration-300 ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                    }`}
                    placeholder="+254712345678"
                  />
                </div>

                <div className={`p-3 rounded border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <h4 className={`font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>Preview Message</h4>
                  <p className={`text-sm whitespace-pre-wrap ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {showTestModal.message
                      .replace('{client_id}', 'CLT-TEST123')
                      .replace('{username}', 'test_user')
                      .replace('{phone_number}', testRecipient || '+254712345678')
                      .replace('{plan_name}', 'Business 10GB')
                      .replace('{data_used}', '8.5')
                      .replace('{data_total}', '10')
                      .replace('{expiry_date}', '2023-12-31')
                      .replace('{renewal_link}', 'https://myisp.com/renew')
                      .replace('{remaining_days}', '5')
                      .replace('{usage_percentage}', '85')
                    }
                  </p>
                </div>

                <button
                  onClick={sendTestMessage}
                  disabled={!testRecipient.trim() || isTesting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors duration-300 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  {isTesting ? <Loader className="animate-spin" size={16} /> : <TestTube size={16} />}
                  {isTesting ? 'Sending...' : 'Send Test Message'}
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                {testResults.success ? (
                  <CheckCircle className="text-green-500 mx-auto mb-3" size={48} />
                ) : (
                  <XCircle className="text-red-500 mx-auto mb-3" size={48} />
                )}
                <p className={`font-medium text-xl ${
                  testResults.success 
                    ? theme === 'dark' ? 'text-green-400' : 'text-green-700'
                    : theme === 'dark' ? 'text-red-400' : 'text-red-700'
                }`}>
                  {testResults.message}
                </p>
                <p className={`text-sm mt-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Sent to: {testResults.recipient}
                </p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {new Date(testResults.timestamp).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SMSAutomation;