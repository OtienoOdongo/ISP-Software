






// import React, { useState, useEffect } from 'react';
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
//   Phone
// } from 'lucide-react';

// const SMSAutomation = () => {
//   const [triggers, setTriggers] = useState([
//     {
//       id: 1,
//       name: 'Data Usage 80%',
//       type: 'data_usage',
//       threshold: 80,
//       enabled: true,
//       message: 'Hi, your {plan_name} data is at 80% usage. You have used {data_used}GB of {data_total}GB.',
//       created_at: '2023-12-01T10:00:00Z',
//       last_triggered: '2023-12-15T14:30:00Z',
//       sent_count: 142,
//       success_rate: 98
//     },
//     {
//       id: 2,
//       name: 'Data Usage 100%',
//       type: 'data_usage',
//       threshold: 100,
//       enabled: true,
//       message: 'Your {plan_name} data has been exhausted. Please renew to continue browsing.',
//       created_at: '2023-12-01T10:00:00Z',
//       last_triggered: '2023-12-16T09:15:00Z',
//       sent_count: 87,
//       success_rate: 96
//     },
//     {
//       id: 3,
//       name: 'Plan Expiry 3 Days',
//       type: 'plan_expiry',
//       days_before: 3,
//       enabled: true,
//       message: 'Your {plan_name} will expire in 3 days on {expiry_date}. Renew now to avoid interruption.',
//       created_at: '2023-12-01T10:00:00Z',
//       last_triggered: '2023-12-14T08:45:00Z',
//       sent_count: 203,
//       success_rate: 99
//     },
//     {
//       id: 4,
//       name: 'Plan Expired',
//       type: 'plan_expiry',
//       days_before: 0,
//       enabled: true,
//       message: 'Your {plan_name} has expired. Please renew to restore your internet service.',
//       created_at: '2023-12-01T10:00:00Z',
//       last_triggered: '2023-12-16T11:20:00Z',
//       sent_count: 56,
//       success_rate: 95
//     },
//     {
//       id: 5,
//       name: 'Welcome Message',
//       type: 'onboarding',
//       event: 'signup',
//       enabled: false,
//       message: 'Welcome! Your {plan_name} is now active. Enjoy your internet experience.',
//       created_at: '2023-11-15T16:20:00Z',
//       last_triggered: '2023-11-30T13:40:00Z',
//       sent_count: 34,
//       success_rate: 100
//     }
//   ]);

//   const [settings, setSettings] = useState({
//     enabled: true,
//     sms_gateway: 'africas_talking',
//     api_key: '••••••••••••••••',
//     username: 'myisp',
//     sender_id: 'MYISP',
//     send_time_start: '08:00',
//     send_time_end: '20:00',
//     max_messages_per_day: 1000,
//     low_balance_alert: true,
//     balance_threshold: 100
//   });

//   const [editingTrigger, setEditingTrigger] = useState(null);
//   const [newTrigger, setNewTrigger] = useState({
//     type: 'data_usage',
//     threshold: 80,
//     days_before: 3,
//     event: 'signup',
//     message: ''
//   });

//   const [activeTab, setActiveTab] = useState('triggers');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [typeFilter, setTypeFilter] = useState('all');
//   const [showTestModal, setShowTestModal] = useState(false);
//   const [testRecipient, setTestRecipient] = useState('');
//   const [testResults, setTestResults] = useState(null);
//   const [expandedTrigger, setExpandedTrigger] = useState(null);

//   // Filter triggers based on search and filters
//   const filteredTriggers = triggers.filter(trigger => {
//     const matchesSearch = trigger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          trigger.message.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = statusFilter === 'all' || 
//                          (statusFilter === 'active' && trigger.enabled) ||
//                          (statusFilter === 'inactive' && !trigger.enabled);
//     const matchesType = typeFilter === 'all' || trigger.type === typeFilter;
    
//     return matchesSearch && matchesStatus && matchesType;
//   });

//   const toggleTrigger = (id) => {
//     setTriggers(triggers.map(trigger => 
//       trigger.id === id ? { ...trigger, enabled: !trigger.enabled } : trigger
//     ));
//   };

//   const saveSettings = () => {
//     console.log('Saving settings:', settings);
//     // Mock save operation
//     alert('Settings saved successfully!');
//   };

//   const saveTrigger = () => {
//     if (editingTrigger) {
//       // Update existing trigger
//       setTriggers(triggers.map(trigger => 
//         trigger.id === editingTrigger.id ? editingTrigger : trigger
//       ));
//       setEditingTrigger(null);
//     } else {
//       // Add new trigger
//       const newTriggerObj = {
//         id: Math.max(...triggers.map(t => t.id)) + 1,
//         name: newTrigger.type === 'data_usage' 
//           ? `Data Usage ${newTrigger.threshold}%`
//           : newTrigger.type === 'plan_expiry'
//           ? `Plan Expiry ${newTrigger.days_before} Days`
//           : 'Welcome Message',
//         type: newTrigger.type,
//         threshold: newTrigger.threshold,
//         days_before: newTrigger.days_before,
//         event: newTrigger.event,
//         enabled: true,
//         message: newTrigger.message,
//         created_at: new Date().toISOString(),
//         last_triggered: null,
//         sent_count: 0,
//         success_rate: 0
//       };
//       setTriggers([...triggers, newTriggerObj]);
//       setNewTrigger({ type: 'data_usage', threshold: 80, days_before: 3, event: 'signup', message: '' });
//     }
//   };

//   const deleteTrigger = (id) => {
//     setTriggers(triggers.filter(trigger => trigger.id !== id));
//   };

//   const sendTestMessage = () => {
//     if (!testRecipient.trim()) {
//       alert('Please enter a phone number');
//       return;
//     }

//     // Simulate sending test message
//     setTestResults({
//       success: true,
//       message: 'Test message sent successfully!',
//       recipient: testRecipient,
//       timestamp: new Date().toISOString()
//     });

//     setTimeout(() => {
//       setShowTestModal(false);
//       setTestRecipient('');
//       setTestResults(null);
//     }, 2000);
//   };

//   const exportTriggers = () => {
//     // Simulate export
//     alert('Triggers exported successfully!');
//   };

//   const importTriggers = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       // Simulate import
//       alert(`Imported ${file.name} successfully!`);
//     }
//   };

//   const getTriggerTypeIcon = (type) => {
//     switch (type) {
//       case 'data_usage': return <BarChart3 size={16} />;
//       case 'plan_expiry': return <Calendar size={16} />;
//       case 'onboarding': return <User size={16} />;
//       default: return <Bell size={16} />;
//     }
//   };

//   const getTriggerTypeColor = (type) => {
//     switch (type) {
//       case 'data_usage': return 'bg-blue-100 text-blue-600';
//       case 'plan_expiry': return 'bg-amber-100 text-amber-600';
//       case 'onboarding': return 'bg-green-100 text-green-600';
//       default: return 'bg-gray-100 text-gray-600';
//     }
//   };

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-800 mb-2">SMS Automation</h1>
//         <p className="text-gray-600">Configure automated SMS messages based on user triggers and events</p>
//       </div>

//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
//         <div className="flex border-b border-gray-100">
//           <button
//             className={`px-6 py-3 font-medium text-sm ${activeTab === 'triggers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
//             onClick={() => setActiveTab('triggers')}
//           >
//             Automation Triggers
//           </button>
//           <button
//             className={`px-6 py-3 font-medium text-sm ${activeTab === 'settings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
//             onClick={() => setActiveTab('settings')}
//           >
//             Settings
//           </button>
//           <button
//             className={`px-6 py-3 font-medium text-sm ${activeTab === 'analytics' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
//             onClick={() => setActiveTab('analytics')}
//           >
//             Analytics
//           </button>
//         </div>

//         <div className="p-6">
//           {/* Triggers Tab */}
//           {activeTab === 'triggers' && (
//             <div className="space-y-6">
//               <div className="flex flex-col md:flex-row gap-4 justify-between">
//                 <div className="flex flex-col md:flex-row gap-2">
//                   <div className="relative">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
//                     <input
//                       type="text"
//                       placeholder="Search triggers..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
                  
//                   <select
//                     value={statusFilter}
//                     onChange={(e) => setStatusFilter(e.target.value)}
//                     className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="all">All Status</option>
//                     <option value="active">Active</option>
//                     <option value="inactive">Inactive</option>
//                   </select>
                  
//                   <select
//                     value={typeFilter}
//                     onChange={(e) => setTypeFilter(e.target.value)}
//                     className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="all">All Types</option>
//                     <option value="data_usage">Data Usage</option>
//                     <option value="plan_expiry">Plan Expiry</option>
//                     <option value="onboarding">Onboarding</option>
//                   </select>
//                 </div>
                
//                 <div className="flex gap-2">
//                   <button
//                     className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
//                     onClick={exportTriggers}
//                   >
//                     <Download size={16} />
//                     Export
//                   </button>
                  
//                   <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer">
//                     <Upload size={16} />
//                     Import
//                     <input
//                       type="file"
//                       accept=".json,.csv"
//                       onChange={importTriggers}
//                       className="hidden"
//                     />
//                   </label>
                  
//                   <button
//                     className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                     onClick={() => setEditingTrigger({})}
//                   >
//                     <Plus size={16} />
//                     New Trigger
//                   </button>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 gap-4">
//                 {filteredTriggers.length > 0 ? (
//                   filteredTriggers.map(trigger => (
//                     <div key={trigger.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
//                       <div className="flex items-start justify-between">
//                         <div className="flex items-start gap-3 flex-1">
//                           <div className={`p-2 rounded-lg ${getTriggerTypeColor(trigger.type)}`}>
//                             {getTriggerTypeIcon(trigger.type)}
//                           </div>
                          
//                           <div className="flex-1">
//                             <div className="flex items-center gap-2 mb-1">
//                               <h3 className="font-medium">{trigger.name}</h3>
//                               <span className={`px-2 py-1 rounded-full text-xs ${
//                                 trigger.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
//                               }`}>
//                                 {trigger.enabled ? 'Active' : 'Inactive'}
//                               </span>
//                             </div>
                            
//                             <p className="text-sm text-gray-500 mb-2">
//                               {trigger.type === 'data_usage' 
//                                 ? `Sends when data usage reaches ${trigger.threshold}%`
//                                 : trigger.type === 'plan_expiry'
//                                 ? `Sends ${trigger.days_before} day${trigger.days_before !== 1 ? 's' : ''} before plan expiry`
//                                 : 'Sends when a new user signs up'
//                               }
//                             </p>
                            
//                             <div className="flex items-center gap-4 text-xs text-gray-500">
//                               <span>Created: {new Date(trigger.created_at).toLocaleDateString()}</span>
//                               {trigger.last_triggered && (
//                                 <span>Last sent: {new Date(trigger.last_triggered).toLocaleDateString()}</span>
//                               )}
//                               <span>Sent: {trigger.sent_count} times</span>
//                               <span>Success: {trigger.success_rate}%</span>
//                             </div>
//                           </div>
//                         </div>
                        
//                         <div className="flex items-center gap-2">
//                           <button
//                             className="text-gray-400 hover:text-blue-500"
//                             onClick={() => setShowTestModal(trigger)}
//                             title="Test this trigger"
//                           >
//                             <TestTube size={16} />
//                           </button>
                          
//                           <button
//                             className="text-gray-400 hover:text-gray-600"
//                             onClick={() => setEditingTrigger(trigger)}
//                             title="Edit trigger"
//                           >
//                             <Edit size={16} />
//                           </button>
                          
//                           <button
//                             className="text-gray-400 hover:text-red-500"
//                             onClick={() => deleteTrigger(trigger.id)}
//                             title="Delete trigger"
//                           >
//                             <Trash2 size={16} />
//                           </button>
                          
//                           <button
//                             onClick={() => toggleTrigger(trigger.id)}
//                             className="flex items-center"
//                             title={trigger.enabled ? 'Disable trigger' : 'Enable trigger'}
//                           >
//                             {trigger.enabled ? (
//                               <ToggleRight className="text-green-500" size={32} />
//                             ) : (
//                               <ToggleLeft className="text-gray-400" size={32} />
//                             )}
//                           </button>
                          
//                           <button
//                             onClick={() => setExpandedTrigger(expandedTrigger === trigger.id ? null : trigger.id)}
//                             className="text-gray-400 hover:text-gray-600 ml-2"
//                           >
//                             {expandedTrigger === trigger.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//                           </button>
//                         </div>
//                       </div>
                      
//                       {expandedTrigger === trigger.id && (
//                         <div className="mt-4 p-3 bg-white rounded border">
//                           <h4 className="font-medium text-gray-700 mb-2">Message Template</h4>
//                           <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{trigger.message}</p>
                          
//                           <div className="mt-3 flex gap-2">
//                             <button
//                               className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
//                               onClick={() => {
//                                 setEditingTrigger(trigger);
//                                 setExpandedTrigger(null);
//                               }}
//                             >
//                               <Edit size={12} />
//                               Edit
//                             </button>
                            
//                             <button
//                               className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
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
//                   <div className="text-center py-8 text-gray-500">
//                     <Bell size={32} className="mx-auto mb-2 opacity-50" />
//                     <p>No triggers found</p>
//                     <p className="text-sm">Create your first automation trigger to get started</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Settings Tab */}
//           {activeTab === 'settings' && (
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               <div className="lg:col-span-2 space-y-6">
//                 <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//                   <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                     <Settings className="text-blue-500" size={20} />
//                     SMS Gateway Settings
//                   </h2>

//                   <div className="space-y-4">
//                     <div className="flex items-center justify-between">
//                       <label className="text-gray-700">Enable Automation</label>
//                       <button
//                         onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
//                         className="flex items-center"
//                       >
//                         {settings.enabled ? (
//                           <ToggleRight className="text-green-500" size={32} />
//                         ) : (
//                           <ToggleLeft className="text-gray-400" size={32} />
//                         )}
//                       </button>
//                     </div>

//                     <div>
//                       <label className="block text-sm text-gray-600 mb-1">SMS Gateway</label>
//                       <select
//                         value={settings.sms_gateway}
//                         onChange={(e) => setSettings({ ...settings, sms_gateway: e.target.value })}
//                         className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                       >
//                         <option value="africas_talking">Africa's Talking</option>
//                         <option value="twilio">Twilio</option>
//                         <option value="smpp">SMPP</option>
//                         <option value="nexmo">Vonage (Nexmo)</option>
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm text-gray-600 mb-1">API Key</label>
//                       <input
//                         type="password"
//                         value={settings.api_key}
//                         onChange={(e) => setSettings({ ...settings, api_key: e.target.value })}
//                         className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                         placeholder="Enter API key"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm text-gray-600 mb-1">Username</label>
//                       <input
//                         type="text"
//                         value={settings.username}
//                         onChange={(e) => setSettings({ ...settings, username: e.target.value })}
//                         className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                         placeholder="Enter username"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm text-gray-600 mb-1">Sender ID</label>
//                       <input
//                         type="text"
//                         value={settings.sender_id}
//                         onChange={(e) => setSettings({ ...settings, sender_id: e.target.value })}
//                         className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                         placeholder="Enter sender ID"
//                       />
//                     </div>

//                     <div className="grid grid-cols-2 gap-3">
//                       <div>
//                         <label className="block text-sm text-gray-600 mb-1">Send Time Start</label>
//                         <input
//                           type="time"
//                           value={settings.send_time_start}
//                           onChange={(e) => setSettings({ ...settings, send_time_start: e.target.value })}
//                           className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm text-gray-600 mb-1">Send Time End</label>
//                         <input
//                           type="time"
//                           value={settings.send_time_end}
//                           onChange={(e) => setSettings({ ...settings, send_time_end: e.target.value })}
//                           className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                         />
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm text-gray-600 mb-1">Max Messages Per Day</label>
//                       <input
//                         type="number"
//                         value={settings.max_messages_per_day}
//                         onChange={(e) => setSettings({ ...settings, max_messages_per_day: parseInt(e.target.value) })}
//                         className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                         min="1"
//                       />
//                     </div>

//                     <div className="flex items-center justify-between">
//                       <div>
//                         <label className="text-gray-700">Low Balance Alert</label>
//                         <p className="text-sm text-gray-500">Get notified when SMS balance is low</p>
//                       </div>
//                       <button
//                         onClick={() => setSettings({ ...settings, low_balance_alert: !settings.low_balance_alert })}
//                         className="flex items-center"
//                       >
//                         {settings.low_balance_alert ? (
//                           <ToggleRight className="text-green-500" size={32} />
//                         ) : (
//                           <ToggleLeft className="text-gray-400" size={32} />
//                         )}
//                       </button>
//                     </div>

//                     {settings.low_balance_alert && (
//                       <div>
//                         <label className="block text-sm text-gray-600 mb-1">Balance Threshold</label>
//                         <input
//                           type="number"
//                           value={settings.balance_threshold}
//                           onChange={(e) => setSettings({ ...settings, balance_threshold: parseInt(e.target.value) })}
//                           className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                           min="1"
//                         />
//                       </div>
//                     )}

//                     <button
//                       onClick={saveSettings}
//                       className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                     >
//                       <Save size={16} />
//                       Save Settings
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               <div className="space-y-6">
//                 {/* Trigger Template Variables */}
//                 <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//                   <h3 className="font-semibold text-gray-800 mb-3">Available Variables</h3>
//                   <div className="space-y-3 text-sm">
//                     <div className="flex justify-between items-start">
//                       <span className="text-blue-600 font-mono bg-blue-50 px-1 rounded">{'{client_id}'}</span>
//                       <span className="text-gray-400 text-right">Client's unique ID</span>
//                     </div>
//                     <div className="flex justify-between items-start">
//                       <span className="text-blue-600 font-mono bg-blue-50 px-1 rounded">{'{username}'}</span>
//                       <span className="text-gray-400 text-right">Client's username</span>
//                     </div>
//                     <div className="flex justify-between items-start">
//                       <span className="text-blue-600 font-mono bg-blue-50 px-1 rounded">{'{phone_number}'}</span>
//                       <span className="text-gray-400 text-right">Client's phone number</span>
//                     </div>
//                     <div className="flex justify-between items-start">
//                       <span className="text-blue-600 font-mono bg-blue-50 px-1 rounded">{'{plan_name}'}</span>
//                       <span className="text-gray-400 text-right">Current plan name</span>
//                     </div>
//                     <div className="flex justify-between items-start">
//                       <span className="text-blue-600 font-mono bg-blue-50 px-1 rounded">{'{data_used}'}</span>
//                       <span className="text-gray-400 text-right">Data used in GB</span>
//                     </div>
//                     <div className="flex justify-between items-start">
//                       <span className="text-blue-600 font-mono bg-blue-50 px-1 rounded">{'{data_total}'}</span>
//                       <span className="text-gray-400 text-right">Total data allowance</span>
//                     </div>
//                     <div className="flex justify-between items-start">
//                       <span className="text-blue-600 font-mono bg-blue-50 px-1 rounded">{'{expiry_date}'}</span>
//                       <span className="text-gray-400 text-right">Plan expiry date</span>
//                     </div>
//                     <div className="flex justify-between items-start">
//                       <span className="text-blue-600 font-mono bg-blue-50 px-1 rounded">{'{renewal_link}'}</span>
//                       <span className="text-gray-400 text-right">Renewal URL</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* SMS Balance */}
//                 <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//                   <h3 className="font-semibold text-gray-800 mb-3">SMS Balance</h3>
//                   <div className="text-center py-4">
//                     <div className="text-3xl font-bold text-blue-600 mb-2">1,247</div>
//                     <p className="text-sm text-gray-500">SMS credits remaining</p>
//                   </div>
//                   <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
//                     Buy More Credits
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Analytics Tab */}
//           {activeTab === 'analytics' && (
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                 <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
//                       <MessageSquare size={20} />
//                     </div>
//                     <div>
//                       <p className="text-xs text-gray-500">Total Messages Sent</p>
//                       <p className="font-medium text-lg">2,458</p>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 rounded-lg bg-green-100 text-green-600">
//                       <CheckCircle size={20} />
//                     </div>
//                     <div>
//                       <p className="text-xs text-gray-500">Success Rate</p>
//                       <p className="font-medium text-lg">97.8%</p>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
//                       <AlertCircle size={20} />
//                     </div>
//                     <div>
//                       <p className="text-xs text-gray-500">Failed Messages</p>
//                       <p className="font-medium text-lg">54</p>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
//                       <Bell size={20} />
//                     </div>
//                     <div>
//                       <p className="text-xs text-gray-500">Active Triggers</p>
//                       <p className="font-medium text-lg">4/5</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
//                 <h3 className="font-semibold text-gray-800 mb-4">Messages Sent (Last 30 Days)</h3>
//                 <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
//                   <p className="text-gray-500">Message analytics chart would appear here</p>
//                 </div>
//               </div>
              
//               <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
//                 <h3 className="font-semibold text-gray-800 mb-4">Trigger Performance</h3>
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-sm">
//                     <thead>
//                       <tr className="bg-gray-100">
//                         <th className="p-3 text-left">Trigger</th>
//                         <th className="p-3 text-left">Type</th>
//                         <th className="p-3 text-left">Sent</th>
//                         <th className="p-3 text-left">Success Rate</th>
//                         <th className="p-3 text-left">Last Triggered</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {triggers.filter(t => t.sent_count > 0).map(trigger => (
//                         <tr key={trigger.id} className="border-b hover:bg-gray-50">
//                           <td className="p-3">{trigger.name}</td>
//                           <td className="p-3 capitalize">{trigger.type.replace('_', ' ')}</td>
//                           <td className="p-3">{trigger.sent_count}</td>
//                           <td className="p-3">
//                             <div className="w-full bg-gray-200 rounded-full h-2">
//                               <div 
//                                 className="bg-green-500 h-2 rounded-full" 
//                                 style={{ width: `${trigger.success_rate}%` }}
//                               ></div>
//                             </div>
//                             <span className="text-xs text-gray-500">{trigger.success_rate}%</span>
//                           </td>
//                           <td className="p-3">
//                             {trigger.last_triggered ? new Date(trigger.last_triggered).toLocaleDateString() : 'Never'}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Edit Trigger Modal */}
//       {(editingTrigger || newTrigger.message) && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-xl max-w-md w-full p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-bold text-gray-800">
//                 {editingTrigger ? 'Edit Trigger' : 'Add New Trigger'}
//               </h3>
//               <button
//                 onClick={() => {
//                   setEditingTrigger(null);
//                   setNewTrigger({ type: 'data_usage', threshold: 80, days_before: 3, event: 'signup', message: '' });
//                 }}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>

//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm text-gray-600 mb-1">Trigger Type</label>
//                 <select
//                   value={editingTrigger?.type || newTrigger.type}
//                   onChange={(e) => {
//                     if (editingTrigger) {
//                       setEditingTrigger({ ...editingTrigger, type: e.target.value });
//                     } else {
//                       setNewTrigger({ ...newTrigger, type: e.target.value });
//                     }
//                   }}
//                   className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="data_usage">Data Usage</option>
//                   <option value="plan_expiry">Plan Expiry</option>
//                   <option value="onboarding">Onboarding</option>
//                 </select>
//               </div>

//               {(editingTrigger?.type === 'data_usage' || newTrigger.type === 'data_usage') && (
//                 <div>
//                   <label className="block text-sm text-gray-600 mb-1">Usage Threshold (%)</label>
//                   <input
//                     type="number"
//                     min="1"
//                     max="100"
//                     value={editingTrigger?.threshold || newTrigger.threshold}
//                     onChange={(e) => {
//                       if (editingTrigger) {
//                         setEditingTrigger({ ...editingTrigger, threshold: parseInt(e.target.value) });
//                       } else {
//                         setNewTrigger({ ...newTrigger, threshold: parseInt(e.target.value) });
//                       }
//                     }}
//                     className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//               )}

//               {(editingTrigger?.type === 'plan_expiry' || newTrigger.type === 'plan_expiry') && (
//                 <div>
//                   <label className="block text-sm text-gray-600 mb-1">Days Before Expiry</label>
//                   <input
//                     type="number"
//                     min="0"
//                     max="30"
//                     value={editingTrigger?.days_before || newTrigger.days_before}
//                     onChange={(e) => {
//                       if (editingTrigger) {
//                         setEditingTrigger({ ...editingTrigger, days_before: parseInt(e.target.value) });
//                       } else {
//                         setNewTrigger({ ...newTrigger, days_before: parseInt(e.target.value) });
//                       }
//                     }}
//                     className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//               )}

//               {(editingTrigger?.type === 'onboarding' || newTrigger.type === 'onboarding') && (
//                 <div>
//                   <label className="block text-sm text-gray-600 mb-1">Event Type</label>
//                   <select
//                     value={editingTrigger?.event || newTrigger.event}
//                     onChange={(e) => {
//                       if (editingTrigger) {
//                         setEditingTrigger({ ...editingTrigger, event: e.target.value });
//                       } else {
//                         setNewTrigger({ ...newTrigger, event: e.target.value });
//                       }
//                     }}
//                     className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="signup">After Signup</option>
//                     <option value="first_payment">After First Payment</option>
//                     <option value="plan_activation">After Plan Activation</option>
//                   </select>
//                 </div>
//               )}

//               <div>
//                 <label className="block text-sm text-gray-600 mb-1">Message Template</label>
//                 <textarea
//                   rows={4}
//                   value={editingTrigger?.message || newTrigger.message}
//                   onChange={(e) => {
//                     if (editingTrigger) {
//                       setEditingTrigger({ ...editingTrigger, message: e.target.value });
//                     } else {
//                       setNewTrigger({ ...newTrigger, message: e.target.value });
//                     }
//                   }}
//                   className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter your message template..."
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   Character count: {(editingTrigger?.message || newTrigger.message).length}/160
//                 </p>
//               </div>

//               <button
//                 onClick={saveTrigger}
//                 className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//               >
//                 <Save size={16} />
//                 {editingTrigger ? 'Update Trigger' : 'Create Trigger'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Test Message Modal */}
//       {showTestModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-xl max-w-md w-full p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-bold text-gray-800">
//                 Test Trigger: {showTestModal.name}
//               </h3>
//               <button
//                 onClick={() => {
//                   setShowTestModal(false);
//                   setTestRecipient('');
//                   setTestResults(null);
//                 }}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>

//             {!testResults ? (
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
//                   <input
//                     type="text"
//                     value={testRecipient}
//                     onChange={(e) => setTestRecipient(e.target.value)}
//                     className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                     placeholder="+254712345678"
//                   />
//                 </div>

//                 <div className="bg-gray-50 p-3 rounded border">
//                   <h4 className="font-medium text-gray-700 mb-2">Preview Message</h4>
//                   <p className="text-sm text-gray-700">
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
//                   disabled={!testRecipient.trim()}
//                   className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <TestTube size={16} />
//                   Send Test Message
//                 </button>
//               </div>
//             ) : (
//               <div className="text-center py-4">
//                 {testResults.success ? (
//                   <CheckCircle className="text-green-500 mx-auto mb-3" size={48} />
//                 ) : (
//                   <XCircle className="text-red-500 mx-auto mb-3" size={48} />
//                 )}
//                 <p className={`font-medium ${testResults.success ? 'text-green-700' : 'text-red-700'}`}>
//                   {testResults.message}
//                 </p>
//                 <p className="text-sm text-gray-500 mt-2">
//                   Sent to: {testResults.recipient}
//                 </p>
//                 <p className="text-sm text-gray-500">
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







import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Bell, 
  MessageSquare, 
  Clock, 
  ToggleLeft, 
  ToggleRight,
  Save,
  Plus,
  Trash2,
  Edit,
  Filter,
  Search,
  Download,
  Upload,
  Play,
  Pause,
  TestTube,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Calendar,
  BarChart3,
  Phone,
  Loader,
  RefreshCw,
  BarChart2,
  PieChart
} from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { FaSpinner } from 'react-icons/fa';

const SMSAutomation = () => {
  const { isAuthenticated } = useAuth();
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

  // Fetch data on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch triggers
      const triggersResponse = await api.get('/api/user_management/sms-triggers/');
      setTriggers(triggersResponse.data);
      
      // Fetch settings
      const settingsResponse = await api.get('/api/user_management/sms-settings/');
      setSettings(settingsResponse.data);
      
      // Fetch analytics
      const analyticsResponse = await api.get('/api/user_management/sms-analytics/');
      setAnalytics(analyticsResponse.data);
      
      // Fetch performance data
      const performanceResponse = await api.get('/api/user_management/sms-performance/');
      setPerformanceData(performanceResponse.data);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load SMS automation data');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter triggers based on search and filters
  const filteredTriggers = triggers.filter(trigger => {
    const matchesSearch = trigger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trigger.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && trigger.enabled) ||
                         (statusFilter === 'inactive' && !trigger.enabled);
    const matchesType = typeFilter === 'all' || trigger.trigger_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const toggleTrigger = async (id, enabled) => {
    try {
      const response = await api.patch(`/api/user_management/sms-triggers/${id}/`, {
        enabled: !enabled
      });
      setTriggers(triggers.map(trigger => 
        trigger.id === id ? response.data : trigger
      ));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update trigger');
    }
  };

  const saveSettings = async () => {
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
  };

  const saveTrigger = async () => {
    try {
      setIsSaving(true);
      let response;
      
      if (editingTrigger) {
        // Update existing trigger
        response = await api.put(`/api/user_management/sms-triggers/${editingTrigger.id}/`, editingTrigger);
        setTriggers(triggers.map(trigger => 
          trigger.id === editingTrigger.id ? response.data : trigger
        ));
      } else {
        // Add new trigger
        response = await api.post('/api/user_management/sms-triggers/', newTrigger);
        setTriggers([...triggers, response.data]);
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
  };

  const deleteTrigger = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trigger?')) return;
    
    try {
      await api.delete(`/api/user_management/sms-triggers/${id}/`);
      setTriggers(triggers.filter(trigger => trigger.id !== id));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete trigger');
    }
  };

  const sendTestMessage = async () => {
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
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send test message');
    } finally {
      setIsTesting(false);
    }
  };

  const exportTriggers = () => {
    // Convert triggers to CSV
    const headers = ['Name,Type,Threshold,Days Before,Event,Message,Enabled,Sent Count,Success Rate,Last Triggered'];
    const rows = triggers.map(trigger => 
      `"${trigger.name}",${trigger.trigger_type},${trigger.threshold || ''},${trigger.days_before || ''},${trigger.event || ''},"${trigger.message}",${trigger.enabled},${trigger.sent_count},${trigger.success_rate},${trigger.last_triggered || ''}`
    );
    const csv = [...headers, ...rows].join('\n');
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'sms_triggers_export.csv');
    a.click();
  };

  const importTriggers = (event) => {
    const file = event.target.files[0];
    if (file) {
      // TODO: Implement import functionality
      alert('Import functionality will be implemented in a future version');
    }
  };

  const getTriggerTypeIcon = (type) => {
    switch (type) {
      case 'data_usage': return <BarChart3 size={16} />;
      case 'plan_expiry': return <Calendar size={16} />;
      case 'onboarding': return <User size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const getTriggerTypeColor = (type) => {
    switch (type) {
      case 'data_usage': return 'bg-blue-100 text-blue-600';
      case 'plan_expiry': return 'bg-amber-100 text-amber-600';
      case 'onboarding': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <p className="text-center text-red-500">Please log in to access SMS automation.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-700">
            <XCircle size={20} />
          </button>
        </div>
      )}

      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">SMS Automation</h1>
          <p className="text-gray-600">Configure automated SMS messages based on user triggers and events</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="flex border-b border-gray-100">
          <button
            className={`px-6 py-3 font-medium text-sm ${activeTab === 'triggers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('triggers')}
          >
            Automation Triggers
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm ${activeTab === 'settings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm ${activeTab === 'analytics' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>

        <div className="p-6">
          {/* Triggers Tab */}
          {activeTab === 'triggers' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search triggers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="data_usage">Data Usage</option>
                    <option value="plan_expiry">Plan Expiry</option>
                    <option value="onboarding">Onboarding</option>
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                    onClick={exportTriggers}
                  >
                    <Download size={16} />
                    Export
                  </button>
                  
                  <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer">
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
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    onClick={() => setEditingTrigger({})}
                  >
                    <Plus size={16} />
                    New Trigger
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredTriggers.length > 0 ? (
                  filteredTriggers.map(trigger => (
                    <div key={trigger.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${getTriggerTypeColor(trigger.trigger_type)}`}>
                            {getTriggerTypeIcon(trigger.trigger_type)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{trigger.name}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                trigger.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {trigger.enabled ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-500 mb-2">
                              {trigger.trigger_type === 'data_usage' 
                                ? `Sends when data usage reaches ${trigger.threshold}%`
                                : trigger.trigger_type === 'plan_expiry'
                                ? `Sends ${trigger.days_before} day${trigger.days_before !== 1 ? 's' : ''} before plan expiry`
                                : `Sends when a user ${trigger.event?.replace('_', ' ')}`
                              }
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Created: {formatDate(trigger.created_at)}</span>
                              <span>Last sent: {formatDate(trigger.last_triggered)}</span>
                              <span>Sent: {trigger.sent_count} times</span>
                              <span>Success: {trigger.success_rate}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            className="text-gray-400 hover:text-blue-500"
                            onClick={() => setShowTestModal(trigger)}
                            title="Test this trigger"
                          >
                            <TestTube size={16} />
                          </button>
                          
                          <button
                            className="text-gray-400 hover:text-gray-600"
                            onClick={() => setEditingTrigger(trigger)}
                            title="Edit trigger"
                          >
                            <Edit size={16} />
                          </button>
                          
                          <button
                            className="text-gray-400 hover:text-red-500"
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
                              <ToggleRight className="text-green-500" size={32} />
                            ) : (
                              <ToggleLeft className="text-gray-400" size={32} />
                            )}
                          </button>
                          
                          <button
                            onClick={() => setExpandedTrigger(expandedTrigger === trigger.id ? null : trigger.id)}
                            className="text-gray-400 hover:text-gray-600 ml-2"
                          >
                            {expandedTrigger === trigger.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>
                      
                      {expandedTrigger === trigger.id && (
                        <div className="mt-4 p-3 bg-white rounded border">
                          <h4 className="font-medium text-gray-700 mb-2">Message Template</h4>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{trigger.message}</p>
                          
                          <div className="mt-3 flex gap-2">
                            <button
                              className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                              onClick={() => {
                                setEditingTrigger(trigger);
                                setExpandedTrigger(null);
                              }}
                            >
                              <Edit size={12} />
                              Edit
                            </button>
                            
                            <button
                              className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
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
                  <div className="text-center py-8 text-gray-500">
                    <Bell size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No triggers found</p>
                    <p className="text-sm">Create your first automation trigger to get started</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Settings className="text-blue-500" size={20} />
                    SMS Gateway Settings
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-gray-700">Enable Automation</label>
                      <button
                        onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                        className="flex items-center"
                      >
                        {settings.enabled ? (
                          <ToggleRight className="text-green-500" size={32} />
                        ) : (
                          <ToggleLeft className="text-gray-400" size={32} />
                        )}
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">SMS Gateway</label>
                      <select
                        value={settings.sms_gateway}
                        onChange={(e) => setSettings({ ...settings, sms_gateway: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="africas_talking">Africa's Talking</option>
                        <option value="twilio">Twilio</option>
                        <option value="smpp">SMPP</option>
                        <option value="nexmo">Vonage (Nexmo)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">API Key</label>
                      <input
                        type="password"
                        value={settings.api_key}
                        onChange={(e) => setSettings({ ...settings, api_key: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter API key"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Username</label>
                      <input
                        type="text"
                        value={settings.username}
                        onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter username"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Sender ID</label>
                      <input
                        type="text"
                        value={settings.sender_id}
                        onChange={(e) => setSettings({ ...settings, sender_id: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter sender ID"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Send Time Start</label>
                        <input
                          type="time"
                          value={settings.send_time_start}
                          onChange={(e) => setSettings({ ...settings, send_time_start: e.target.value })}
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Send Time End</label>
                        <input
                          type="time"
                          value={settings.send_time_end}
                          onChange={(e) => setSettings({ ...settings, send_time_end: e.target.value })}
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Max Messages Per Day</label>
                      <input
                        type="number"
                        value={settings.max_messages_per_day}
                        onChange={(e) => setSettings({ ...settings, max_messages_per_day: parseInt(e.target.value) })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        min="1"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-gray-700">Low Balance Alert</label>
                        <p className="text-sm text-gray-500">Get notified when SMS balance is low</p>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, low_balance_alert: !settings.low_balance_alert })}
                        className="flex items-center"
                      >
                        {settings.low_balance_alert ? (
                          <ToggleRight className="text-green-500" size={32} />
                        ) : (
                          <ToggleLeft className="text-gray-400" size={32} />
                        )}
                      </button>
                    </div>

                    {settings.low_balance_alert && (
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Balance Threshold</label>
                        <input
                          type="number"
                          value={settings.balance_threshold}
                          onChange={(e) => setSettings({ ...settings, balance_threshold: parseInt(e.target.value) })}
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          min="1"
                        />
                      </div>
                    )}

                    <button
                      onClick={saveSettings}
                      disabled={isSaving}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                      {isSaving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
                      {isSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Trigger Template Variables */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Available Variables</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-start">
                      <span className="text-blue-600 font-mono bg-blue-50 px-1 rounded">{'{client_id}'}</span>
                      <span className="text-gray-400 text-right">Client's unique ID</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-blue-600 font-mono bg-blue-50 px-1 rounded">{'{username}'}</span>
                      <span className="text-gray-400 text-right">Client's username</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-blue-600 font-mono bg-blue-50 px-1 rounded">{'{phone_number}'}</span>
                      <span className="text-gray-400 text-right">Client's phone number</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-blue-600 font-mono bg-blue-50 px-1 rounded">{'{plan_name}'}</span>
                      <span className="text-gray-400 text-right">Current plan name</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-blue-600 font-mono bg-blue-50 px-1 rounded">{'{data_used}'}</span>
                      <span className="text-gray-400 text-right">Data used in GB</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-blue-600 font-mono bg-blue-50 px-1 rounded">{'{data_total}'}</span>
                      <span className="text-gray-400 text-right">Total data allowance</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-blue-600 font-mono bg-blue-50 px-1 rounded">{'{expiry_date}'}</span>
                      <span className="text-gray-400 text-right">Plan expiry date</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-blue-600 font-mono bg-blue-50 px-1 rounded">{'{renewal_link}'}</span>
                      <span className="text-gray-400 text-right">Renewal URL</span>
                    </div>
                  </div>
                </div>

                {/* SMS Balance */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-800 mb-3">SMS Balance</h3>
                  <div className="text-center py-4">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{settings.sms_balance}</div>
                    <p className="text-sm text-gray-500">SMS credits remaining</p>
                  </div>
                  <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                    Buy More Credits
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Messages Sent</p>
                      <p className="font-medium text-lg">{analytics.total_messages}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 text-green-600">
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Success Rate</p>
                      <p className="font-medium text-lg">{analytics.success_rate}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                      <AlertCircle size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Failed Messages</p>
                      <p className="font-medium text-lg">{analytics.failed_messages}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                      <Bell size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Active Triggers</p>
                      <p className="font-medium text-lg">{analytics.active_triggers}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4">Messages Sent (Last 30 Days)</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  {analytics.daily_messages && analytics.daily_messages.length > 0 ? (
                    <div className="w-full h-full p-4">
                      <div className="flex items-end h-48 gap-1">
                        {analytics.daily_messages.map((day, index) => (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div 
                              className="w-full bg-blue-500 rounded-t transition-all duration-500"
                              style={{ height: `${(day.count / Math.max(...analytics.daily_messages.map(d => d.count)) * 100)}%` }}
                            ></div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(day.day).getDate()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No message data available</p>
                  )}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4">Trigger Performance</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-3 text-left">Trigger</th>
                        <th className="p-3 text-left">Type</th>
                        <th className="p-3 text-left">Sent</th>
                        <th className="p-3 text-left">Success Rate</th>
                        <th className="p-3 text-left">Last Triggered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {performanceData.length > 0 ? (
                        performanceData.map(trigger => (
                          <tr key={trigger.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">{trigger.name}</td>
                            <td className="p-3 capitalize">{trigger.type.replace('_', ' ')}</td>
                            <td className="p-3">{trigger.sent}</td>
                            <td className="p-3">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                                  style={{ width: `${trigger.success_rate}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500">{trigger.success_rate}%</span>
                            </td>
                            <td className="p-3">
                              {trigger.last_triggered ? new Date(trigger.last_triggered).toLocaleDateString() : 'Never'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="p-4 text-center text-gray-500">
                            No performance data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Trigger Modal */}
      {(editingTrigger || newTrigger.message) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {editingTrigger ? 'Edit Trigger' : 'Add New Trigger'}
              </h3>
              <button
                onClick={() => {
                  setEditingTrigger(null);
                  setNewTrigger({
                    name: '',
                    trigger_type: 'data_usage',
                    threshold: 80,
                    days_before: 3,
                    event: 'signup',
                    message: '',
                    enabled: true
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Trigger Name</label>
                <input
                  type="text"
                  value={editingTrigger?.name || newTrigger.name}
                  onChange={(e) => {
                    if (editingTrigger) {
                      setEditingTrigger({ ...editingTrigger, name: e.target.value });
                    } else {
                      setNewTrigger({ ...newTrigger, name: e.target.value });
                    }
                  }}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter trigger name"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Trigger Type</label>
                <select
                  value={editingTrigger?.trigger_type || newTrigger.trigger_type}
                  onChange={(e) => {
                    if (editingTrigger) {
                      setEditingTrigger({ ...editingTrigger, trigger_type: e.target.value });
                    } else {
                      setNewTrigger({ ...newTrigger, trigger_type: e.target.value });
                    }
                  }}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="data_usage">Data Usage</option>
                  <option value="plan_expiry">Plan Expiry</option>
                  <option value="onboarding">Onboarding</option>
                </select>
              </div>

              {(editingTrigger?.trigger_type === 'data_usage' || newTrigger.trigger_type === 'data_usage') && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Usage Threshold (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editingTrigger?.threshold || newTrigger.threshold}
                    onChange={(e) => {
                      if (editingTrigger) {
                        setEditingTrigger({ ...editingTrigger, threshold: parseInt(e.target.value) });
                      } else {
                        setNewTrigger({ ...newTrigger, threshold: parseInt(e.target.value) });
                      }
                    }}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {(editingTrigger?.trigger_type === 'plan_expiry' || newTrigger.trigger_type === 'plan_expiry') && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Days Before Expiry</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={editingTrigger?.days_before || newTrigger.days_before}
                    onChange={(e) => {
                      if (editingTrigger) {
                        setEditingTrigger({ ...editingTrigger, days_before: parseInt(e.target.value) });
                      } else {
                        setNewTrigger({ ...newTrigger, days_before: parseInt(e.target.value) });
                      }
                    }}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {(editingTrigger?.trigger_type === 'onboarding' || newTrigger.trigger_type === 'onboarding') && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Event Type</label>
                  <select
                    value={editingTrigger?.event || newTrigger.event}
                    onChange={(e) => {
                      if (editingTrigger) {
                        setEditingTrigger({ ...editingTrigger, event: e.target.value });
                      } else {
                        setNewTrigger({ ...newTrigger, event: e.target.value });
                      }
                    }}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="signup">After Signup</option>
                    <option value="first_payment">After First Payment</option>
                    <option value="plan_activation">After Plan Activation</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-600 mb-1">Message Template</label>
                <textarea
                  rows={4}
                  value={editingTrigger?.message || newTrigger.message}
                  onChange={(e) => {
                    if (editingTrigger) {
                      setEditingTrigger({ ...editingTrigger, message: e.target.value });
                    } else {
                      setNewTrigger({ ...newTrigger, message: e.target.value });
                    }
                  }}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your message template..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Character count: {(editingTrigger?.message || newTrigger.message).length}/160
                </p>
              </div>

              <button
                onClick={saveTrigger}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {isSaving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
                {isSaving ? 'Saving...' : (editingTrigger ? 'Update Trigger' : 'Create Trigger')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Message Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Test Trigger: {showTestModal.name}
              </h3>
              <button
                onClick={() => {
                  setShowTestModal(false);
                  setTestRecipient('');
                  setTestResults(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={20} />
              </button>
            </div>

            {!testResults ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="+254712345678"
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded border">
                  <h4 className="font-medium text-gray-700 mb-2">Preview Message</h4>
                  <p className="text-sm text-gray-700">
                    {showTestModal.message
                      .replace('{client_id}', 'CLT-A1B2C3D4')
                      .replace('{username}', 'client_abc123')
                      .replace('{phone_number}', testRecipient || '+254712345678')
                      .replace('{plan_name}', 'Business 10GB')
                      .replace('{data_used}', '8.5')
                      .replace('{data_total}', '10')
                      .replace('{expiry_date}', '2023-12-31')
                      .replace('{renewal_link}', 'https://myisp.com/renew')
                    }
                  </p>
                </div>

                <button
                  onClick={sendTestMessage}
                  disabled={!testRecipient.trim() || isTesting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <p className={`font-medium ${testResults.success ? 'text-green-700' : 'text-red-700'}`}>
                  {testResults.message}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Sent to: {testResults.recipient}
                </p>
                <p className="text-sm text-gray-500">
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