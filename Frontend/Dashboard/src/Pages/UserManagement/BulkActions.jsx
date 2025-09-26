




// // src/pages/BulkActions.js
// import React, { useState } from 'react';
// import { 
//   Upload, 
//   Download, 
//   Send, 
//   Users, 
//   FileText, 
//   CheckCircle,
//   AlertCircle,
//   X,
//   Filter,
//   Search,
//   UserCheck,
//   UserX,
//   Mail,
//   MessageSquare,
//   Clock,
//   Edit3,
//   Trash2,
//   Plus,
//   ChevronDown,
//   ChevronUp,
//   Phone
// } from 'lucide-react';

// const BulkActions = () => {
//   const [activeTab, setActiveTab] = useState('import');
//   const [selectedUsers, setSelectedUsers] = useState([]);
//   const [importFile, setImportFile] = useState(null);
//   const [importResults, setImportResults] = useState(null);
//   const [messageForm, setMessageForm] = useState({
//     message: '',
//     message_type: 'sms',
//     subject: ''
//   });
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [planFilter, setPlanFilter] = useState('all');
//   const [showTemplates, setShowTemplates] = useState(false);
//   const [savedTemplates, setSavedTemplates] = useState([
//     { id: 1, name: 'Plan Renewal Reminder', message: 'Your {plan_name} is about to expire. Renew now to avoid service interruption.' },
//     { id: 2, name: 'Welcome Message', message: 'Welcome! Thank you for choosing our {plan_name}. Enjoy your internet experience.' },
//     { id: 3, name: 'Payment Received', message: 'We have received your payment for {plan_name}. Your service is now active.' }
//   ]);
//   const [showSchedule, setShowSchedule] = useState(false);
//   const [scheduleDate, setScheduleDate] = useState('');
//   const [scheduleTime, setScheduleTime] = useState('');
//   const [bulkActionType, setBulkActionType] = useState('');
//   const [selectedPlan, setSelectedPlan] = useState('');

//   // Mock user data for demonstration - updated to match your client model
//   const mockUsers = [
//     { id: 1, username: 'client_a1b2c3', phone: '+254712345678', plan: 'Business 10GB', status: 'active', location: 'Nairobi' },
//     { id: 2, username: 'client_d4e5f6', phone: '+254723456789', plan: 'Residential 5GB', status: 'active', location: 'Mombasa' },
//     { id: 3, username: 'client_g7h8i9', phone: '+254734567890', plan: 'Enterprise 20GB', status: 'expired', location: 'Kisumu' },
//     { id: 4, username: 'client_j1k2l3', phone: '+254745678901', plan: 'Business 15GB', status: 'active', location: 'Nakuru' },
//     { id: 5, username: 'client_m4n5o6', phone: '+254756789012', plan: 'Residential 10GB', status: 'inactive', location: 'Eldoret' },
//     { id: 6, username: 'client_p7q8r9', phone: '+254767890123', plan: 'Business 10GB', status: 'active', location: 'Nairobi' },
//     { id: 7, username: 'client_s1t2u3', phone: '+254778901234', plan: 'Enterprise 50GB', status: 'active', location: 'Mombasa' },
//     { id: 8, username: 'client_v4w5x6', phone: '+254789012345', plan: 'Residential 5GB', status: 'expired', location: 'Kisumu' }
//   ];

//   // Available plans for bulk operations
//   const availablePlans = [
//     'Business 10GB', 'Business 15GB', 'Residential 5GB', 
//     'Residential 10GB', 'Enterprise 20GB', 'Enterprise 50GB'
//   ];

//   // Filter users based on search and filters
//   const filteredUsers = mockUsers.filter(user => {
//     const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          user.phone.includes(searchTerm) ||
//                          user.plan.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
//     const matchesPlan = planFilter === 'all' || user.plan === planFilter;
    
//     return matchesSearch && matchesStatus && matchesPlan;
//   });

//   const handleFileUpload = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       setImportFile(file);
//       // Simulate file processing
//       setTimeout(() => {
//         setImportResults({
//           total: 15,
//           success: 12,
//           failed: 3,
//           errors: [
//             { row: 3, error: 'Invalid phone number format' },
//             { row: 7, error: 'Duplicate phone number' },
//             { row: 12, error: 'Missing required fields' }
//           ]
//         });
//       }, 2000);
//     }
//   };

//   const handleSendBulkMessage = () => {
//     if (!messageForm.message.trim()) {
//       alert('Please enter a message');
//       return;
//     }

//     if (selectedUsers.length === 0) {
//       alert('Please select at least one user');
//       return;
//     }

//     // Simulate sending
//     alert(`Message ${scheduleDate && scheduleTime ? 'scheduled' : 'sent'} to ${selectedUsers.length} users successfully!`);
//     setMessageForm({ message: '', message_type: 'sms', subject: '' });
//     setSelectedUsers([]);
//     setScheduleDate('');
//     setScheduleTime('');
//     setShowSchedule(false);
//   };

//   const handleBulkUserAction = () => {
//     if (selectedUsers.length === 0) {
//       alert('Please select at least one user');
//       return;
//     }

//     if (bulkActionType === 'change_plan' && !selectedPlan) {
//       alert('Please select a plan');
//       return;
//     }

//     // Simulate bulk action
//     let actionMessage = '';
//     switch (bulkActionType) {
//       case 'activate':
//         actionMessage = `Activated ${selectedUsers.length} users`;
//         break;
//       case 'deactivate':
//         actionMessage = `Deactivated ${selectedUsers.length} users`;
//         break;
//       case 'change_plan':
//         actionMessage = `Changed plan to ${selectedPlan} for ${selectedUsers.length} users`;
//         break;
//       case 'delete':
//         actionMessage = `Deleted ${selectedUsers.length} users`;
//         break;
//       default:
//         return;
//     }

//     alert(actionMessage);
//     setSelectedUsers([]);
//     setBulkActionType('');
//     setSelectedPlan('');
//   };

//   const toggleUserSelection = (userId) => {
//     if (selectedUsers.includes(userId)) {
//       setSelectedUsers(selectedUsers.filter(id => id !== userId));
//     } else {
//       setSelectedUsers([...selectedUsers, userId]);
//     }
//   };

//   const selectAllUsers = () => {
//     if (selectedUsers.length === filteredUsers.length) {
//       setSelectedUsers([]);
//     } else {
//       setSelectedUsers(filteredUsers.map(user => user.id));
//     }
//   };

//   const applyTemplate = (template) => {
//     setMessageForm({ ...messageForm, message: template.message });
//     setShowTemplates(false);
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'active': return 'bg-green-100 text-green-700';
//       case 'expired': return 'bg-yellow-100 text-yellow-700';
//       case 'inactive': return 'bg-red-100 text-red-700';
//       default: return 'bg-gray-100 text-gray-700';
//     }
//   };

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-800 mb-2">Bulk Actions</h1>
//         <p className="text-gray-600">Perform actions on multiple users at once</p>
//       </div>

//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
//         <div className="flex border-b border-gray-100">
//           <button
//             className={`px-6 py-3 font-medium text-sm ${activeTab === 'import' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
//             onClick={() => setActiveTab('import')}
//           >
//             Import Users
//           </button>
//           <button
//             className={`px-6 py-3 font-medium text-sm ${activeTab === 'message' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
//             onClick={() => setActiveTab('message')}
//           >
//             Bulk Message
//           </button>
//           <button
//             className={`px-6 py-3 font-medium text-sm ${activeTab === 'manage' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
//             onClick={() => setActiveTab('manage')}
//           >
//             Manage Users
//           </button>
//         </div>

//         <div className="p-6">
//           {/* Import Users Tab */}
//           {activeTab === 'import' && (
//             <div className="space-y-6">
//               <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
//                 <h3 className="font-medium text-blue-800 mb-2">Import Instructions</h3>
//                 <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
//                   <li>Download the template CSV file to ensure proper formatting</li>
//                   <li>Required field: Phone Number (must include country code)</li>
//                   <li>Optional fields: Plan, Location</li>
//                   <li>Phone numbers must be in international format (+254...)</li>
//                   <li>Maximum file size: 5MB</li>
//                   <li>Supported formats: CSV, XLSX</li>
//                 </ul>
//               </div>

//               <div className="flex gap-4">
//                 <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
//                   <Download size={16} />
//                   Download Template
//                 </button>

//                 <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer">
//                   <Upload size={16} />
//                   Upload File
//                   <input
//                     type="file"
//                     accept=".csv,.xlsx"
//                     onChange={handleFileUpload}
//                     className="hidden"
//                   />
//                 </label>
//               </div>

//               {importFile && (
//                 <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
//                   <div className="flex items-center justify-between mb-3">
//                     <div className="flex items-center gap-2">
//                       <FileText className="text-blue-500" size={18} />
//                       <span className="font-medium">{importFile.name}</span>
//                       <span className="text-xs text-gray-500">({(importFile.size / 1024).toFixed(1)} KB)</span>
//                     </div>
//                     <button
//                       onClick={() => {
//                         setImportFile(null);
//                         setImportResults(null);
//                       }}
//                       className="text-gray-400 hover:text-gray-600"
//                     >
//                       <X size={16} />
//                     </button>
//                   </div>

//                   {importResults ? (
//                     <div className="space-y-3">
//                       <div className="flex items-center gap-4">
//                         <div className="text-center">
//                           <div className="text-2xl font-bold text-green-600">{importResults.success}</div>
//                           <div className="text-sm text-gray-600">Successful</div>
//                         </div>
//                         <div className="text-center">
//                           <div className="text-2xl font-bold text-red-600">{importResults.failed}</div>
//                           <div className="text-sm text-gray-600">Failed</div>
//                         </div>
//                         <div className="text-center">
//                           <div className="text-2xl font-bold text-blue-600">{importResults.total}</div>
//                           <div className="text-sm text-gray-600">Total</div>
//                         </div>
//                       </div>

//                       {importResults.failed > 0 && (
//                         <div>
//                           <h4 className="font-medium text-gray-700 mb-2">Errors:</h4>
//                           <div className="space-y-1">
//                             {importResults.errors.map((error, index) => (
//                               <div key={index} className="flex items-center gap-2 text-sm text-red-600">
//                                 <AlertCircle size={14} />
//                                 <span>Row {error.row}: {error.error}</span>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )}

//                       <div className="flex gap-2">
//                         <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
//                           <Download size={16} />
//                           Download Error Report
//                         </button>
                        
//                         <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
//                           <UserCheck size={16} />
//                           View Imported Users
//                         </button>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="text-center py-4">
//                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
//                       <p className="text-sm text-gray-600">Processing file...</p>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Bulk Message Tab */}
//           {activeTab === 'message' && (
//             <div className="space-y-6">
//               <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
//                 <h3 className="font-medium text-gray-700 mb-3">Select Users</h3>
                
//                 <div className="flex flex-col md:flex-row gap-4 mb-4">
//                   <div className="relative flex-1">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
//                     <input
//                       type="text"
//                       placeholder="Search users by username, phone, or plan..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
//                     />
//                   </div>
                  
//                   <select
//                     value={statusFilter}
//                     onChange={(e) => setStatusFilter(e.target.value)}
//                     className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="all">All Status</option>
//                     <option value="active">Active</option>
//                     <option value="expired">Expired</option>
//                     <option value="inactive">Inactive</option>
//                   </select>
                  
//                   <select
//                     value={planFilter}
//                     onChange={(e) => setPlanFilter(e.target.value)}
//                     className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="all">All Plans</option>
//                     {availablePlans.map(plan => (
//                       <option key={plan} value={plan}>{plan}</option>
//                     ))}
//                   </select>
//                 </div>
                
//                 <div className="mb-4 flex items-center justify-between">
//                   <div>
//                     <button
//                       onClick={selectAllUsers}
//                       className="text-sm text-blue-500 hover:text-blue-700"
//                     >
//                       {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
//                     </button>
//                     <span className="text-sm text-gray-600 ml-2">
//                       {selectedUsers.length} of {filteredUsers.length} selected
//                     </span>
//                   </div>
                  
//                   <div className="text-sm text-gray-600">
//                     {filteredUsers.length} users found
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
//                   {filteredUsers.map(user => (
//                     <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-white rounded">
//                       <input
//                         type="checkbox"
//                         checked={selectedUsers.includes(user.id)}
//                         onChange={() => toggleUserSelection(user.id)}
//                         className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
//                       />
//                       <div className="flex-1">
//                         <div className="font-medium">{user.username}</div>
//                         <div className="text-sm text-gray-500 flex items-center gap-2">
//                           <Phone size={14} />
//                           {user.phone} • {user.plan} • {user.location}
//                         </div>
//                       </div>
//                       <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(user.status)}`}>
//                         {user.status}
//                       </span>
//                     </label>
//                   ))}
                  
//                   {filteredUsers.length === 0 && (
//                     <div className="text-center py-4 text-gray-500">
//                       <UserX size={20} className="mx-auto mb-1" />
//                       <p>No users found</p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
//                 <h3 className="font-medium text-gray-700 mb-3">Compose Message</h3>
                
//                 <div className="mb-3">
//                   <label className="block text-sm text-gray-600 mb-1">Message Type</label>
//                   <select
//                     value={messageForm.message_type}
//                     onChange={(e) => setMessageForm({ ...messageForm, message_type: e.target.value })}
//                     className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="sms">SMS</option>
//                     <option value="email">Email</option>
//                     <option value="push">Push Notification</option>
//                   </select>
//                 </div>

//                 {messageForm.message_type === 'email' && (
//                   <div className="mb-3">
//                     <label className="block text-sm text-gray-600 mb-1">Subject</label>
//                     <input
//                       type="text"
//                       value={messageForm.subject}
//                       onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
//                       className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                       placeholder="Email subject"
//                     />
//                   </div>
//                 )}

//                 <div className="mb-3">
//                   <div className="flex items-center justify-between mb-1">
//                     <label className="block text-sm text-gray-600">Message</label>
//                     <button
//                       type="button"
//                       onClick={() => setShowTemplates(!showTemplates)}
//                       className="text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1"
//                     >
//                       {showTemplates ? 'Hide Templates' : 'Load Template'}
//                       {showTemplates ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
//                     </button>
//                   </div>
                  
//                   {showTemplates && (
//                     <div className="mb-3 bg-white p-3 rounded border">
//                       <h4 className="font-medium text-gray-700 mb-2">Saved Templates</h4>
//                       <div className="space-y-2">
//                         {savedTemplates.map(template => (
//                           <div key={template.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
//                             <div>
//                               <div className="font-medium">{template.name}</div>
//                               <div className="text-sm text-gray-500 truncate">{template.message}</div>
//                             </div>
//                             <button
//                               onClick={() => applyTemplate(template)}
//                               className="text-blue-500 hover:text-blue-700 text-sm"
//                             >
//                               Apply
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                       <button className="mt-2 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700">
//                         <Plus size={14} />
//                         Create New Template
//                       </button>
//                     </div>
//                   )}
                  
//                   <textarea
//                     rows={4}
//                     value={messageForm.message}
//                     onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
//                     className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                     placeholder="Type your message here..."
//                   />
//                 </div>

//                 <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
//                   <div>
//                     {messageForm.message_type === 'sms' ? (
//                       <>
//                         <p>Character count: {messageForm.message.length}/160</p>
//                         <p>Estimated cost: {selectedUsers.length * 1} SMS credits</p>
//                       </>
//                     ) : (
//                       <p>{selectedUsers.length} recipients</p>
//                     )}
//                   </div>
                  
//                   <button
//                     type="button"
//                     onClick={() => setShowSchedule(!showSchedule)}
//                     className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
//                     disabled={messageForm.message_type !== 'sms'}
//                   >
//                     <Clock size={14} />
//                     {showSchedule ? 'Hide Schedule' : 'Schedule Message'}
//                   </button>
//                 </div>
                
//                 {showSchedule && (
//                   <div className="mb-3 bg-white p-3 rounded border">
//                     <h4 className="font-medium text-gray-700 mb-2">Schedule Message</h4>
//                     <div className="grid grid-cols-2 gap-3">
//                       <div>
//                         <label className="block text-sm text-gray-600 mb-1">Date</label>
//                         <input
//                           type="date"
//                           value={scheduleDate}
//                           onChange={(e) => setScheduleDate(e.target.value)}
//                           className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                           min={new Date().toISOString().split('T')[0]}
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm text-gray-600 mb-1">Time</label>
//                         <input
//                           type="time"
//                           value={scheduleTime}
//                           onChange={(e) => setScheduleTime(e.target.value)}
//                           className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 <button
//                   onClick={handleSendBulkMessage}
//                   disabled={selectedUsers.length === 0 || !messageForm.message.trim()}
//                   className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {scheduleDate && scheduleTime ? <Clock size={16} /> : <Send size={16} />}
//                   {scheduleDate && scheduleTime ? 'Schedule Message' : 'Send Message'} to {selectedUsers.length} Users
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Manage Users Tab */}
//           {activeTab === 'manage' && (
//             <div className="space-y-6">
//               <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
//                 <h3 className="font-medium text-blue-800 mb-2">Bulk User Management</h3>
//                 <p className="text-sm text-blue-700">Perform actions on multiple users simultaneously</p>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                 <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
//                   <div className="bg-blue-100 text-blue-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
//                     <UserCheck size={20} />
//                   </div>
//                   <h3 className="font-medium text-gray-800 mb-1">Activate Users</h3>
//                   <p className="text-sm text-gray-500">Enable service for selected users</p>
//                   <button 
//                     className="mt-3 px-4 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
//                     onClick={() => {
//                       setBulkActionType('activate');
//                       document.getElementById('manageUsersSection').scrollIntoView({ behavior: 'smooth' });
//                     }}
//                   >
//                     Select Users
//                   </button>
//                 </div>
                
//                 <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
//                   <div className="bg-amber-100 text-amber-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
//                     <UserX size={20} />
//                   </div>
//                   <h3 className="font-medium text-gray-800 mb-1">Deactivate Users</h3>
//                   <p className="text-sm text-gray-500">Disable service for selected users</p>
//                   <button 
//                     className="mt-3 px-4 py-1 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600"
//                     onClick={() => {
//                       setBulkActionType('deactivate');
//                       document.getElementById('manageUsersSection').scrollIntoView({ behavior: 'smooth' });
//                     }}
//                   >
//                     Select Users
//                   </button>
//                 </div>
                
//                 <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
//                   <div className="bg-purple-100 text-purple-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
//                     <Edit3 size={20} />
//                   </div>
//                   <h3 className="font-medium text-gray-800 mb-1">Change Plan</h3>
//                   <p className="text-sm text-gray-500">Update plan for selected users</p>
//                   <button 
//                     className="mt-3 px-4 py-1 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600"
//                     onClick={() => {
//                       setBulkActionType('change_plan');
//                       document.getElementById('manageUsersSection').scrollIntoView({ behavior: 'smooth' });
//                     }}
//                   >
//                     Select Users
//                   </button>
//                 </div>
                
//                 <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
//                   <div className="bg-red-100 text-red-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
//                     <Trash2 size={20} />
//                   </div>
//                   <h3 className="font-medium text-gray-800 mb-1">Delete Users</h3>
//                   <p className="text-sm text-gray-500">Remove selected users from system</p>
//                   <button 
//                     className="mt-3 px-4 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
//                     onClick={() => {
//                       setBulkActionType('delete');
//                       document.getElementById('manageUsersSection').scrollIntoView({ behavior: 'smooth' });
//                     }}
//                   >
//                     Select Users
//                   </button>
//                 </div>
//               </div>

//               <div id="manageUsersSection" className="bg-gray-50 p-4 rounded-lg border border-gray-100">
//                 <h3 className="font-medium text-gray-700 mb-3">Select Users</h3>
                
//                 <div className="flex flex-col md:flex-row gap-4 mb-4">
//                   <div className="relative flex-1">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
//                     <input
//                       type="text"
//                       placeholder="Search users by username, phone, or plan..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
//                     />
//                   </div>
                  
//                   <select
//                     value={statusFilter}
//                     onChange={(e) => setStatusFilter(e.target.value)}
//                     className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="all">All Status</option>
//                     <option value="active">Active</option>
//                     <option value="expired">Expired</option>
//                     <option value="inactive">Inactive</option>
//                   </select>
                  
//                   <select
//                     value={planFilter}
//                     onChange={(e) => setPlanFilter(e.target.value)}
//                     className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="all">All Plans</option>
//                     {availablePlans.map(plan => (
//                       <option key={plan} value={plan}>{plan}</option>
//                     ))}
//                   </select>
//                 </div>
                
//                 <div className="mb-4 flex items-center justify-between">
//                   <div>
//                     <button
//                       onClick={selectAllUsers}
//                       className="text-sm text-blue-500 hover:text-blue-700"
//                     >
//                       {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
//                     </button>
//                     <span className="text-sm text-gray-600 ml-2">
//                       {selectedUsers.length} of {filteredUsers.length} selected
//                     </span>
//                   </div>
                  
//                   <div className="text-sm text-gray-600">
//                     {filteredUsers.length} users found
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
//                   {filteredUsers.map(user => (
//                     <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-white rounded">
//                       <input
//                         type="checkbox"
//                         checked={selectedUsers.includes(user.id)}
//                         onChange={() => toggleUserSelection(user.id)}
//                         className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
//                       />
//                       <div className="flex-1">
//                         <div className="font-medium">{user.username}</div>
//                         <div className="text-sm text-gray-500 flex items-center gap-2">
//                           <Phone size={14} />
//                           {user.phone} • {user.plan} • {user.location}
//                         </div>
//                       </div>
//                       <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(user.status)}`}>
//                         {user.status}
//                       </span>
//                     </label>
//                   ))}
                  
//                   {filteredUsers.length === 0 && (
//                     <div className="text-center py-4 text-gray-500">
//                       <UserX size={20} className="mx-auto mb-1" />
//                       <p>No users found</p>
//                     </div>
//                   )}
//                 </div>

//                 {(bulkActionType) && (
//                   <div className="mt-4 bg-white p-4 rounded-lg border border-gray-100">
//                     <h3 className="font-medium text-gray-700 mb-3">Selected Action: {
//                       bulkActionType === 'activate' ? 'Activate Users' :
//                       bulkActionType === 'deactivate' ? 'Deactivate Users' :
//                       bulkActionType === 'change_plan' ? 'Change Plan' : 'Delete Users'
//                     }</h3>
                    
//                     {bulkActionType === 'change_plan' && (
//                       <div className="mb-4">
//                         <label className="block text-sm text-gray-600 mb-1">Select Plan</label>
//                         <select
//                           value={selectedPlan}
//                           onChange={(e) => setSelectedPlan(e.target.value)}
//                           className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                         >
//                           <option value="">Select a plan</option>
//                           {availablePlans.map(plan => (
//                             <option key={plan} value={plan}>{plan}</option>
//                           ))}
//                         </select>
//                       </div>
//                     )}

//                     <button
//                       onClick={handleBulkUserAction}
//                       disabled={selectedUsers.length === 0 || (bulkActionType === 'change_plan' && !selectedPlan)}
//                       className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       {bulkActionType === 'activate' && <UserCheck size={16} />}
//                       {bulkActionType === 'deactivate' && <UserX size={16} />}
//                       {bulkActionType === 'change_plan' && <Edit3 size={16} />}
//                       {bulkActionType === 'delete' && <Trash2 size={16} />}
//                       Apply to {selectedUsers.length} Users
//                     </button>
//                   </div>
//                 )}
//               </div>

//               <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
//                 <h3 className="font-medium text-gray-700 mb-3">Recent Bulk Actions</h3>
                
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-sm">
//                     <thead>
//                       <tr className="bg-gray-100">
//                         <th className="p-3 text-left">Action</th>
//                         <th className="p-3 text-left">Type</th>
//                         <th className="p-3 text-left">Users</th>
//                         <th className="p-3 text-left">Status</th>
//                         <th className="p-3 text-left">Date</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       <tr className="border-b hover:bg-gray-50">
//                         <td className="p-3">Bulk Message</td>
//                         <td className="p-3">SMS</td>
//                         <td className="p-3">25 users</td>
//                         <td className="p-3">
//                           <span className="flex items-center gap-1 text-green-600">
//                             <CheckCircle size={14} />
//                             Completed
//                           </span>
//                         </td>
//                         <td className="p-3">2 hours ago</td>
//                       </tr>
//                       <tr className="border-b hover:bg-gray-50">
//                         <td className="p-3">User Import</td>
//                         <td className="p-3">CSV</td>
//                         <td className="p-3">15 users</td>
//                         <td className="p-3">
//                           <span className="flex items-center gap-1 text-yellow-600">
//                             <AlertCircle size={14} />
//                             Partial (3 failed)
//                           </span>
//                         </td>
//                         <td className="p-3">1 day ago</td>
//                       </tr>
//                       <tr className="border-b hover:bg-gray-50">
//                         <td className="p-3">Bulk Message</td>
//                         <td className="p-3">Email</td>
//                         <td className="p-3">42 users</td>
//                         <td className="p-3">
//                           <span className="flex items-center gap-1 text-blue-600">
//                             <AlertCircle size={14} />
//                             In Progress
//                           </span>
//                         </td>
//                         <td className="p-3">3 days ago</td>
//                       </tr>
//                       <tr className="border-b hover:bg-gray-50">
//                         <td className="p-3">Plan Change</td>
//                         <td className="p-3">Bulk Update</td>
//                         <td className="p-3">18 users</td>
//                         <td className="p-3">
//                           <span className="flex items-center gap-1 text-green-600">
//                             <CheckCircle size={14} />
//                             Completed
//                           </span>
//                         </td>
//                         <td className="p-3">5 days ago</td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Quick Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
//           <div className="flex items-center gap-3">
//             <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
//               <Users size={20} />
//             </div>
//             <div>
//               <p className="text-xs text-gray-500">Total Users</p>
//               <p className="font-medium text-lg">1,247</p>
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
//           <div className="flex items-center gap-3">
//             <div className="p-2 rounded-lg bg-green-100 text-green-600">
//               <MessageSquare size={20} />
//             </div>
//             <div>
//               <p className="text-xs text-gray-500">Messages Sent (30 days)</p>
//               <p className="font-medium text-lg">2,458</p>
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
//           <div className="flex items-center gap-3">
//             <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
//               <Download size={20} />
//             </div>
//             <div>
//               <p className="text-xs text-gray-500">Last Import</p>
//               <p className="font-medium text-lg">15 users</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BulkActions;









// import React, { useState, useEffect } from 'react';
// import { 
//   Upload, 
//   Download, 
//   Send, 
//   Users, 
//   FileText, 
//   CheckCircle,
//   AlertCircle,
//   X,
//   Filter,
//   Search,
//   UserCheck,
//   UserX,
//   Mail,
//   MessageSquare,
//   Clock,
//   Edit3,
//   Trash2,
//   Plus,
//   ChevronDown,
//   ChevronUp,
//   Phone,
//   Loader,
//   RefreshCw
// } from 'lucide-react';
// import api from '../../api';
// import { useAuth } from '../../context/AuthContext';
// import { FaSpinner } from 'react-icons/fa';

// const BulkActions = () => {
//   const { isAuthenticated } = useAuth();
//   const [activeTab, setActiveTab] = useState('import');
//   const [selectedUsers, setSelectedUsers] = useState([]);
//   const [importFile, setImportFile] = useState(null);
//   const [importResults, setImportResults] = useState(null);
//   const [messageForm, setMessageForm] = useState({
//     message: '',
//     message_type: 'sms',
//     subject: ''
//   });
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [planFilter, setPlanFilter] = useState('all');
//   const [showTemplates, setShowTemplates] = useState(false);
//   const [savedTemplates, setSavedTemplates] = useState([]);
//   const [showSchedule, setShowSchedule] = useState(false);
//   const [scheduleDate, setScheduleDate] = useState('');
//   const [scheduleTime, setScheduleTime] = useState('');
//   const [bulkActionType, setBulkActionType] = useState('');
//   const [selectedPlan, setSelectedPlan] = useState('');
//   const [availablePlans, setAvailablePlans] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [actionHistory, setActionHistory] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [stats, setStats] = useState({
//     total_users: 0,
//     total_messages: 0,
//     last_import: 0
//   });

//   // Fetch data on component mount
//   useEffect(() => {
//     if (isAuthenticated) {
//       fetchData();
//     }
//   }, [isAuthenticated]);

//   const fetchData = async () => {
//     try {
//       setIsLoading(true);
//       setError(null);
      
//       // Fetch users
//       const usersResponse = await api.get('/api/user_management/bulk-users/');
//       setUsers(usersResponse.data.users || []);
//       setStats({
//         total_users: usersResponse.data.total_count || 0,
//         total_messages: 2458, // This would come from analytics
//         last_import: 15 // This would come from import history
//       });
      
//       // Fetch templates
//       const templatesResponse = await api.get('/api/user_management/message-templates/');
//       setSavedTemplates(templatesResponse.data);
      
//       // Fetch action history
//       const historyResponse = await api.get('/api/user_management/bulk-history/');
//       setActionHistory(historyResponse.data.actions || []);
      
//       // Fetch available plans (this would come from your plans API)
//       setAvailablePlans([
//         'Business 10GB', 'Business 15GB', 'Residential 5GB', 
//         'Residential 10GB', 'Enterprise 20GB', 'Enterprise 50GB'
//       ]);
      
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to load bulk actions data');
//       console.error('Error fetching data:', err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Filter users based on search and filters
//   const filteredUsers = users.filter(user => {
//     const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          user.phone_number.includes(searchTerm) ||
//                          (user.plan_name && user.plan_name.toLowerCase().includes(searchTerm.toLowerCase()));
//     const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
//     const matchesPlan = planFilter === 'all' || user.plan_name === planFilter;
    
//     return matchesSearch && matchesStatus && matchesPlan;
//   });

//   const handleFileUpload = async (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     setImportFile(file);
//     setIsProcessing(true);
    
//     try {
//       const formData = new FormData();
//       formData.append('file', file);
      
//       const response = await api.post('/api/user_management/bulk-import/', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
      
//       setImportResults(response.data);
//       // Refresh users after import
//       fetchData();
      
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to import users');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleSendBulkMessage = async () => {
//     if (!messageForm.message.trim()) {
//       setError('Please enter a message');
//       return;
//     }

//     if (selectedUsers.length === 0) {
//       setError('Please select at least one user');
//       return;
//     }

//     setIsProcessing(true);
    
//     try {
//       const payload = {
//         action_type: 'message',
//         user_ids: selectedUsers,
//         message: messageForm.message,
//         message_type: messageForm.message_type,
//         subject: messageForm.subject
//       };

//       if (scheduleDate && scheduleTime) {
//         payload.schedule_time = `${scheduleDate}T${scheduleTime}:00Z`;
//       }

//       const response = await api.post('/api/user_management/bulk-action/', payload);
      
//       if (response.data.status === 'pending') {
//         alert('Message scheduled successfully!');
//       } else {
//         alert(`Message sent to ${response.data.success_count} users successfully!`);
//       }
      
//       // Reset form
//       setMessageForm({ message: '', message_type: 'sms', subject: '' });
//       setSelectedUsers([]);
//       setScheduleDate('');
//       setScheduleTime('');
//       setShowSchedule(false);
      
//       // Refresh history
//       fetchData();
      
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to send bulk message');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleBulkUserAction = async () => {
//     if (selectedUsers.length === 0) {
//       setError('Please select at least one user');
//       return;
//     }

//     if (bulkActionType === 'change_plan' && !selectedPlan) {
//       setError('Please select a plan');
//       return;
//     }

//     setIsProcessing(true);
    
//     try {
//       const payload = {
//         action_type: bulkActionType,
//         user_ids: selectedUsers
//       };

//       if (bulkActionType === 'change_plan') {
//         payload.plan_name = selectedPlan;
//       }

//       const response = await api.post('/api/user_management/bulk-action/', payload);
      
//       alert(`Action completed: ${response.data.success_count} users processed successfully`);
      
//       // Reset selection
//       setSelectedUsers([]);
//       setBulkActionType('');
//       setSelectedPlan('');
      
//       // Refresh users and history
//       fetchData();
      
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to perform bulk action');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const toggleUserSelection = (userId) => {
//     if (selectedUsers.includes(userId)) {
//       setSelectedUsers(selectedUsers.filter(id => id !== userId));
//     } else {
//       setSelectedUsers([...selectedUsers, userId]);
//     }
//   };

//   const selectAllUsers = () => {
//     if (selectedUsers.length === filteredUsers.length) {
//       setSelectedUsers([]);
//     } else {
//       setSelectedUsers(filteredUsers.map(user => user.id));
//     }
//   };

//   const applyTemplate = (template) => {
//     setMessageForm({ ...messageForm, message: template.message });
//     setShowTemplates(false);
//   };

//   const downloadTemplate = () => {
//     // Create CSV template
//     const headers = ['username,phone_number,plan_name,location'];
//     const templateData = [
//       ['john_doe', '+254712345678', 'Business 10GB', 'Nairobi'],
//       ['jane_smith', '+254723456789', 'Residential 5GB', 'Mombasa']
//     ];
    
//     const csv = [...headers, ...templateData.map(row => row.join(','))].join('\n');
    
//     // Download CSV
//     const blob = new Blob([csv], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.setAttribute('href', url);
//     a.setAttribute('download', 'user_import_template.csv');
//     a.click();
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'active': return 'bg-green-100 text-green-700';
//       case 'expired': return 'bg-yellow-100 text-yellow-700';
//       case 'inactive': return 'bg-red-100 text-red-700';
//       default: return 'bg-gray-100 text-gray-700';
//     }
//   };

//   const getStatusDisplay = (status) => {
//     switch (status) {
//       case 'active': return 'Active';
//       case 'expired': return 'Expired';
//       case 'inactive': return 'Inactive';
//       default: return status;
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="p-6 max-w-7xl mx-auto flex justify-center items-center min-h-screen">
//         <FaSpinner className="animate-spin text-4xl text-blue-600" />
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <div className="p-6 max-w-7xl mx-auto">
//         <p className="text-center text-red-500">Please log in to access bulk actions.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       {error && (
//         <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex justify-between items-center">
//           <span>{error}</span>
//           <button onClick={() => setError(null)} className="text-red-700">
//             <X size={20} />
//           </button>
//         </div>
//       )}

//       <div className="mb-8 flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800 mb-2">Bulk Actions</h1>
//           <p className="text-gray-600">Perform actions on multiple users at once</p>
//         </div>
//         <button
//           onClick={fetchData}
//           className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
//         >
//           <RefreshCw size={16} />
//           Refresh
//         </button>
//       </div>

//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
//         <div className="flex border-b border-gray-100">
//           <button
//             className={`px-6 py-3 font-medium text-sm ${activeTab === 'import' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
//             onClick={() => setActiveTab('import')}
//           >
//             Import Users
//           </button>
//           <button
//             className={`px-6 py-3 font-medium text-sm ${activeTab === 'message' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
//             onClick={() => setActiveTab('message')}
//           >
//             Bulk Message
//           </button>
//           <button
//             className={`px-6 py-3 font-medium text-sm ${activeTab === 'manage' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
//             onClick={() => setActiveTab('manage')}
//           >
//             Manage Users
//           </button>
//         </div>

//         <div className="p-6">
//           {/* Import Users Tab */}
//           {activeTab === 'import' && (
//             <div className="space-y-6">
//               <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
//                 <h3 className="font-medium text-blue-800 mb-2">Import Instructions</h3>
//                 <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
//                   <li>Download the template CSV file to ensure proper formatting</li>
//                   <li>Required field: Phone Number (must include country code)</li>
//                   <li>Optional fields: Plan, Location</li>
//                   <li>Phone numbers must be in international format (+254...)</li>
//                   <li>Maximum file size: 5MB</li>
//                   <li>Supported formats: CSV, XLSX</li>
//                 </ul>
//               </div>

//               <div className="flex gap-4">
//                 <button 
//                   className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
//                   onClick={downloadTemplate}
//                 >
//                   <Download size={16} />
//                   Download Template
//                 </button>

//                 <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer">
//                   <Upload size={16} />
//                   Upload File
//                   <input
//                     type="file"
//                     accept=".csv,.xlsx"
//                     onChange={handleFileUpload}
//                     className="hidden"
//                     disabled={isProcessing}
//                   />
//                 </label>
//               </div>

//               {importFile && (
//                 <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
//                   <div className="flex items-center justify-between mb-3">
//                     <div className="flex items-center gap-2">
//                       <FileText className="text-blue-500" size={18} />
//                       <span className="font-medium">{importFile.name}</span>
//                       <span className="text-xs text-gray-500">({(importFile.size / 1024).toFixed(1)} KB)</span>
//                     </div>
//                     <button
//                       onClick={() => {
//                         setImportFile(null);
//                         setImportResults(null);
//                       }}
//                       className="text-gray-400 hover:text-gray-600"
//                       disabled={isProcessing}
//                     >
//                       <X size={16} />
//                     </button>
//                   </div>

//                   {importResults ? (
//                     <div className="space-y-3">
//                       <div className="flex items-center gap-4">
//                         <div className="text-center">
//                           <div className="text-2xl font-bold text-green-600">{importResults.success_count}</div>
//                           <div className="text-sm text-gray-600">Successful</div>
//                         </div>
//                         <div className="text-center">
//                           <div className="text-2xl font-bold text-red-600">{importResults.failed_count}</div>
//                           <div className="text-sm text-gray-600">Failed</div>
//                         </div>
//                         <div className="text-center">
//                           <div className="text-2xl font-bold text-blue-600">{importResults.total_users}</div>
//                           <div className="text-sm text-gray-600">Total</div>
//                         </div>
//                       </div>

//                       {importResults.errors && importResults.errors.length > 0 && (
//                         <div>
//                           <h4 className="font-medium text-gray-700 mb-2">Errors:</h4>
//                           <div className="space-y-1">
//                             {importResults.errors.map((error, index) => (
//                               <div key={index} className="flex items-center gap-2 text-sm text-red-600">
//                                 <AlertCircle size={14} />
//                                 <span>Row {error.row}: {error.error}</span>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )}

//                       <div className="flex gap-2">
//                         <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
//                           <Download size={16} />
//                           Download Error Report
//                         </button>
                        
//                         <button 
//                           className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
//                           onClick={() => setActiveTab('manage')}
//                         >
//                           <UserCheck size={16} />
//                           View Imported Users
//                         </button>
//                       </div>
//                     </div>
//                   ) : isProcessing ? (
//                     <div className="text-center py-4">
//                       <Loader className="animate-spin mx-auto mb-2" size={20} />
//                       <p className="text-sm text-gray-600">Processing file...</p>
//                     </div>
//                   ) : null}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Bulk Message Tab */}
//           {activeTab === 'message' && (
//             <div className="space-y-6">
//               <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
//                 <h3 className="font-medium text-gray-700 mb-3">Select Users</h3>
                
//                 <div className="flex flex-col md:flex-row gap-4 mb-4">
//                   <div className="relative flex-1">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
//                     <input
//                       type="text"
//                       placeholder="Search users by username, phone, or plan..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
//                     />
//                   </div>
                  
//                   <select
//                     value={statusFilter}
//                     onChange={(e) => setStatusFilter(e.target.value)}
//                     className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="all">All Status</option>
//                     <option value="active">Active</option>
//                     <option value="expired">Expired</option>
//                     <option value="inactive">Inactive</option>
//                   </select>
                  
//                   <select
//                     value={planFilter}
//                     onChange={(e) => setPlanFilter(e.target.value)}
//                     className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="all">All Plans</option>
//                     {availablePlans.map(plan => (
//                       <option key={plan} value={plan}>{plan}</option>
//                     ))}
//                   </select>
//                 </div>
                
//                 <div className="mb-4 flex items-center justify-between">
//                   <div>
//                     <button
//                       onClick={selectAllUsers}
//                       className="text-sm text-blue-500 hover:text-blue-700"
//                     >
//                       {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
//                     </button>
//                     <span className="text-sm text-gray-600 ml-2">
//                       {selectedUsers.length} of {filteredUsers.length} selected
//                     </span>
//                   </div>
                  
//                   <div className="text-sm text-gray-600">
//                     {filteredUsers.length} users found
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
//                   {filteredUsers.length > 0 ? (
//                     filteredUsers.map(user => (
//                       <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-white rounded">
//                         <input
//                           type="checkbox"
//                           checked={selectedUsers.includes(user.id)}
//                           onChange={() => toggleUserSelection(user.id)}
//                           className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
//                         />
//                         <div className="flex-1">
//                           <div className="font-medium">{user.username}</div>
//                           <div className="text-sm text-gray-500 flex items-center gap-2">
//                             <Phone size={14} />
//                             {user.phone_number} • {user.plan_name} • {user.location}
//                           </div>
//                         </div>
//                         <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(user.status)}`}>
//                           {getStatusDisplay(user.status)}
//                         </span>
//                       </label>
//                     ))
//                   ) : (
//                     <div className="text-center py-4 text-gray-500">
//                       <UserX size={20} className="mx-auto mb-1" />
//                       <p>No users found</p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
//                 <h3 className="font-medium text-gray-700 mb-3">Compose Message</h3>
                
//                 <div className="mb-3">
//                   <label className="block text-sm text-gray-600 mb-1">Message Type</label>
//                   <select
//                     value={messageForm.message_type}
//                     onChange={(e) => setMessageForm({ ...messageForm, message_type: e.target.value })}
//                     className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="sms">SMS</option>
//                     <option value="email">Email</option>
//                     <option value="push">Push Notification</option>
//                   </select>
//                 </div>

//                 {messageForm.message_type === 'email' && (
//                   <div className="mb-3">
//                     <label className="block text-sm text-gray-600 mb-1">Subject</label>
//                     <input
//                       type="text"
//                       value={messageForm.subject}
//                       onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
//                       className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                       placeholder="Email subject"
//                     />
//                   </div>
//                 )}

//                 <div className="mb-3">
//                   <div className="flex items-center justify-between mb-1">
//                     <label className="block text-sm text-gray-600">Message</label>
//                     <button
//                       type="button"
//                       onClick={() => setShowTemplates(!showTemplates)}
//                       className="text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1"
//                     >
//                       {showTemplates ? 'Hide Templates' : 'Load Template'}
//                       {showTemplates ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
//                     </button>
//                   </div>
                  
//                   {showTemplates && (
//                     <div className="mb-3 bg-white p-3 rounded border">
//                       <h4 className="font-medium text-gray-700 mb-2">Saved Templates</h4>
//                       <div className="space-y-2">
//                         {savedTemplates.length > 0 ? (
//                           savedTemplates.map(template => (
//                             <div key={template.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
//                               <div>
//                                 <div className="font-medium">{template.name}</div>
//                                 <div className="text-sm text-gray-500 truncate">{template.message}</div>
//                               </div>
//                               <button
//                                 onClick={() => applyTemplate(template)}
//                                 className="text-blue-500 hover:text-blue-700 text-sm"
//                               >
//                                 Apply
//                               </button>
//                             </div>
//                           ))
//                         ) : (
//                           <p className="text-sm text-gray-500 text-center py-2">No templates found</p>
//                         )}
//                       </div>
//                       <button className="mt-2 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700">
//                         <Plus size={14} />
//                         Create New Template
//                       </button>
//                     </div>
//                   )}
                  
//                   <textarea
//                     rows={4}
//                     value={messageForm.message}
//                     onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
//                     className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                     placeholder="Type your message here..."
//                   />
//                 </div>

//                 <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
//                   <div>
//                     {messageForm.message_type === 'sms' ? (
//                       <>
//                         <p>Character count: {messageForm.message.length}/160</p>
//                         <p>Estimated cost: {selectedUsers.length * 1} SMS credits</p>
//                       </>
//                     ) : (
//                       <p>{selectedUsers.length} recipients</p>
//                     )}
//                   </div>
                  
//                   <button
//                     type="button"
//                     onClick={() => setShowSchedule(!showSchedule)}
//                     className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
//                     disabled={messageForm.message_type !== 'sms'}
//                   >
//                     <Clock size={14} />
//                     {showSchedule ? 'Hide Schedule' : 'Schedule Message'}
//                   </button>
//                 </div>
                
//                 {showSchedule && (
//                   <div className="mb-3 bg-white p-3 rounded border">
//                     <h4 className="font-medium text-gray-700 mb-2">Schedule Message</h4>
//                     <div className="grid grid-cols-2 gap-3">
//                       <div>
//                         <label className="block text-sm text-gray-600 mb-1">Date</label>
//                         <input
//                           type="date"
//                           value={scheduleDate}
//                           onChange={(e) => setScheduleDate(e.target.value)}
//                           className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                           min={new Date().toISOString().split('T')[0]}
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm text-gray-600 mb-1">Time</label>
//                         <input
//                           type="time"
//                           value={scheduleTime}
//                           onChange={(e) => setScheduleTime(e.target.value)}
//                           className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 <button
//                   onClick={handleSendBulkMessage}
//                   disabled={selectedUsers.length === 0 || !messageForm.message.trim() || isProcessing}
//                   className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {isProcessing ? (
//                     <Loader className="animate-spin" size={16} />
//                   ) : scheduleDate && scheduleTime ? (
//                     <Clock size={16} />
//                   ) : (
//                     <Send size={16} />
//                   )}
//                   {isProcessing ? 'Processing...' : scheduleDate && scheduleTime ? 'Schedule Message' : 'Send Message'} to {selectedUsers.length} Users
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Manage Users Tab */}
//           {activeTab === 'manage' && (
//             <div className="space-y-6">
//               <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
//                 <h3 className="font-medium text-blue-800 mb-2">Bulk User Management</h3>
//                 <p className="text-sm text-blue-700">Perform actions on multiple users simultaneously</p>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                 <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
//                   <div className="bg-blue-100 text-blue-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
//                     <UserCheck size={20} />
//                   </div>
//                   <h3 className="font-medium text-gray-800 mb-1">Activate Users</h3>
//                   <p className="text-sm text-gray-500">Enable service for selected users</p>
//                   <button 
//                     className="mt-3 px-4 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
//                     onClick={() => {
//                       setBulkActionType('activate');
//                       document.getElementById('manageUsersSection').scrollIntoView({ behavior: 'smooth' });
//                     }}
//                   >
//                     Select Users
//                   </button>
//                 </div>
                
//                 <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
//                   <div className="bg-amber-100 text-amber-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
//                     <UserX size={20} />
//                   </div>
//                   <h3 className="font-medium text-gray-800 mb-1">Deactivate Users</h3>
//                   <p className="text-sm text-gray-500">Disable service for selected users</p>
//                   <button 
//                     className="mt-3 px-4 py-1 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600"
//                     onClick={() => {
//                       setBulkActionType('deactivate');
//                       document.getElementById('manageUsersSection').scrollIntoView({ behavior: 'smooth' });
//                     }}
//                   >
//                     Select Users
//                   </button>
//                 </div>
                
//                 <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
//                   <div className="bg-purple-100 text-purple-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
//                     <Edit3 size={20} />
//                   </div>
//                   <h3 className="font-medium text-gray-800 mb-1">Change Plan</h3>
//                   <p className="text-sm text-gray-500">Update plan for selected users</p>
//                   <button 
//                     className="mt-3 px-4 py-1 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600"
//                     onClick={() => {
//                       setBulkActionType('change_plan');
//                       document.getElementById('manageUsersSection').scrollIntoView({ behavior: 'smooth' });
//                     }}
//                   >
//                     Select Users
//                   </button>
//                 </div>
                
//                 <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
//                   <div className="bg-red-100 text-red-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
//                     <Trash2 size={20} />
//                   </div>
//                   <h3 className="font-medium text-gray-800 mb-1">Delete Users</h3>
//                   <p className="text-sm text-gray-500">Remove selected users from system</p>
//                   <button 
//                     className="mt-3 px-4 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
//                     onClick={() => {
//                       setBulkActionType('delete');
//                       document.getElementById('manageUsersSection').scrollIntoView({ behavior: 'smooth' });
//                     }}
//                   >
//                     Select Users
//                   </button>
//                 </div>
//               </div>

//               <div id="manageUsersSection" className="bg-gray-50 p-4 rounded-lg border border-gray-100">
//                 <h3 className="font-medium text-gray-700 mb-3">Select Users</h3>
                
//                 <div className="flex flex-col md:flex-row gap-4 mb-4">
//                   <div className="relative flex-1">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
//                     <input
//                       type="text"
//                       placeholder="Search users by username, phone, or plan..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
//                     />
//                   </div>
                  
//                   <select
//                     value={statusFilter}
//                     onChange={(e) => setStatusFilter(e.target.value)}
//                     className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="all">All Status</option>
//                     <option value="active">Active</option>
//                     <option value="expired">Expired</option>
//                     <option value="inactive">Inactive</option>
//                   </select>
                  
//                   <select
//                     value={planFilter}
//                     onChange={(e) => setPlanFilter(e.target.value)}
//                     className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="all">All Plans</option>
//                     {availablePlans.map(plan => (
//                       <option key={plan} value={plan}>{plan}</option>
//                     ))}
//                   </select>
//                 </div>
                
//                 <div className="mb-4 flex items-center justify-between">
//                   <div>
//                     <button
//                       onClick={selectAllUsers}
//                       className="text-sm text-blue-500 hover:text-blue-700"
//                     >
//                       {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
//                     </button>
//                     <span className="text-sm text-gray-600 ml-2">
//                       {selectedUsers.length} of {filteredUsers.length} selected
//                     </span>
//                   </div>
                  
//                   <div className="text-sm text-gray-600">
//                     {filteredUsers.length} users found
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
//                   {filteredUsers.length > 0 ? (
//                     filteredUsers.map(user => (
//                       <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-white rounded">
//                         <input
//                           type="checkbox"
//                           checked={selectedUsers.includes(user.id)}
//                           onChange={() => toggleUserSelection(user.id)}
//                           className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
//                         />
//                         <div className="flex-1">
//                           <div className="font-medium">{user.username}</div>
//                           <div className="text-sm text-gray-500 flex items-center gap-2">
//                             <Phone size={14} />
//                             {user.phone_number} • {user.plan_name} • {user.location}
//                           </div>
//                         </div>
//                         <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(user.status)}`}>
//                           {getStatusDisplay(user.status)}
//                         </span>
//                       </label>
//                     ))
//                   ) : (
//                     <div className="text-center py-4 text-gray-500">
//                       <UserX size={20} className="mx-auto mb-1" />
//                       <p>No users found</p>
//                     </div>
//                   )}
//                 </div>

//                 {(bulkActionType) && (
//                   <div className="mt-4 bg-white p-4 rounded-lg border border-gray-100">
//                     <h3 className="font-medium text-gray-700 mb-3">Selected Action: {
//                       bulkActionType === 'activate' ? 'Activate Users' :
//                       bulkActionType === 'deactivate' ? 'Deactivate Users' :
//                       bulkActionType === 'change_plan' ? 'Change Plan' : 'Delete Users'
//                     }</h3>
                    
//                     {bulkActionType === 'change_plan' && (
//                       <div className="mb-4">
//                         <label className="block text-sm text-gray-600 mb-1">Select Plan</label>
//                         <select
//                           value={selectedPlan}
//                           onChange={(e) => setSelectedPlan(e.target.value)}
//                           className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                         >
//                           <option value="">Select a plan</option>
//                           {availablePlans.map(plan => (
//                             <option key={plan} value={plan}>{plan}</option>
//                           ))}
//                         </select>
//                       </div>
//                     )}

//                     <button
//                       onClick={handleBulkUserAction}
//                       disabled={selectedUsers.length === 0 || (bulkActionType === 'change_plan' && !selectedPlan) || isProcessing}
//                       className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       {isProcessing ? (
//                         <Loader className="animate-spin" size={16} />
//                       ) : (
//                         <>
//                           {bulkActionType === 'activate' && <UserCheck size={16} />}
//                           {bulkActionType === 'deactivate' && <UserX size={16} />}
//                           {bulkActionType === 'change_plan' && <Edit3 size={16} />}
//                           {bulkActionType === 'delete' && <Trash2 size={16} />}
//                         </>
//                       )}
//                       {isProcessing ? 'Processing...' : `Apply to ${selectedUsers.length} Users`}
//                     </button>
//                   </div>
//                 )}
//               </div>

//               <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
//                 <h3 className="font-medium text-gray-700 mb-3">Recent Bulk Actions</h3>
                
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-sm">
//                     <thead>
//                       <tr className="bg-gray-100">
//                         <th className="p-3 text-left">Action</th>
//                         <th className="p-3 text-left">Type</th>
//                         <th className="p-3 text-left">Users</th>
//                         <th className="p-3 text-left">Status</th>
//                         <th className="p-3 text-left">Date</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {actionHistory.length > 0 ? (
//                         actionHistory.map((action, index) => (
//                           <tr key={index} className="border-b hover:bg-gray-50">
//                             <td className="p-3">{action.action_type_display}</td>
//                             <td className="p-3">{action.message_type || 'N/A'}</td>
//                             <td className="p-3">{action.total_users}</td>
//                             <td className="p-3">
//                               <span className={`flex items-center gap-1 ${
//                                 action.status === 'completed' ? 'text-green-600' :
//                                 action.status === 'partial' ? 'text-yellow-600' :
//                                 action.status === 'failed' ? 'text-red-600' : 'text-blue-600'
//                               }`}>
//                                 {action.status === 'completed' && <CheckCircle size={14} />}
//                                 {action.status === 'partial' && <AlertCircle size={14} />}
//                                 {action.status === 'failed' && <AlertCircle size={14} />}
//                                 {action.status === 'pending' && <Clock size={14} />}
//                                 {action.status_display}
//                               </span>
//                             </td>
//                             <td className="p-3">{new Date(action.created_at).toLocaleDateString()}</td>
//                           </tr>
//                         ))
//                       ) : (
//                         <tr>
//                           <td colSpan="5" className="p-4 text-center text-gray-500">
//                             No bulk actions history found
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Quick Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
//           <div className="flex items-center gap-3">
//             <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
//               <Users size={20} />
//             </div>
//             <div>
//               <p className="text-xs text-gray-500">Total Users</p>
//               <p className="font-medium text-lg">{stats.total_users}</p>
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
//           <div className="flex items-center gap-3">
//             <div className="p-2 rounded-lg bg-green-100 text-green-600">
//               <MessageSquare size={20} />
//             </div>
//             <div>
//               <p className="text-xs text-gray-500">Messages Sent (30 days)</p>
//               <p className="font-medium text-lg">{stats.total_messages}</p>
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
//           <div className="flex items-center gap-3">
//             <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
//               <Download size={20} />
//             </div>
//             <div>
//               <p className="text-xs text-gray-500">Last Import</p>
//               <p className="font-medium text-lg">{stats.last_import} users</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BulkActions;







// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { 
//   Upload, 
//   Download, 
//   Send, 
//   Users, 
//   FileText, 
//   CheckCircle,
//   AlertCircle,
//   X,
//   Filter,
//   Search,
//   UserCheck,
//   UserX,
//   Mail,
//   MessageSquare,
//   Clock,
//   Edit3,
//   Trash2,
//   Plus,
//   ChevronDown,
//   ChevronUp,
//   Phone,
//   Loader,
//   RefreshCw
// } from 'lucide-react';
// import api from '../../api';
// import { useAuth } from '../../context/AuthContext';
// import { useTheme } from "../../context/ThemeContext";
// import { FaSpinner } from 'react-icons/fa';

// const BulkActions = () => {
//   const { isAuthenticated } = useAuth();
//   const { theme, toggleTheme } = useTheme();
//   const [activeTab, setActiveTab] = useState('import');
//   const [selectedUsers, setSelectedUsers] = useState(new Set());
//   const [importFile, setImportFile] = useState(null);
//   const [importResults, setImportResults] = useState(null);
//   const [messageForm, setMessageForm] = useState({
//     message: '',
//     message_type: 'sms',
//     subject: ''
//   });
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [planFilter, setPlanFilter] = useState('all');
//   const [showTemplates, setShowTemplates] = useState(false);
//   const [savedTemplates, setSavedTemplates] = useState([]);
//   const [showSchedule, setShowSchedule] = useState(false);
//   const [scheduleDate, setScheduleDate] = useState('');
//   const [scheduleTime, setScheduleTime] = useState('');
//   const [bulkActionType, setBulkActionType] = useState('');
//   const [selectedPlan, setSelectedPlan] = useState('');
//   const [availablePlans, setAvailablePlans] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [actionHistory, setActionHistory] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [stats, setStats] = useState({
//     total_users: 0,
//     total_messages: 0,
//     last_import: 0
//   });

//   // Fetch data on component mount
//   useEffect(() => {
//     if (isAuthenticated) {
//       fetchData();
//     }
//   }, [isAuthenticated]);

//   const fetchData = async () => {
//     try {
//       setIsLoading(true);
//       setError(null);
      
//       // Fetch users
//       const usersResponse = await api.get('/api/user_management/bulk-users/');
//       setUsers(usersResponse.data.users || []);
//       setStats({
//         total_users: usersResponse.data.total_count || 0,
//         total_messages: 2458, // This would come from analytics
//         last_import: 15 // This would come from import history
//       });
      
//       // Fetch templates
//       const templatesResponse = await api.get('/api/user_management/message-templates/');
//       setSavedTemplates(templatesResponse.data);
      
//       // Fetch action history
//       const historyResponse = await api.get('/api/user_management/bulk-history/');
//       setActionHistory(historyResponse.data.actions || []);
      
//       // Fetch available plans (this would come from your plans API)
//       setAvailablePlans([
//         'Business 10GB', 'Business 15GB', 'Residential 5GB', 
//         'Residential 10GB', 'Enterprise 20GB', 'Enterprise 50GB'
//       ]);
      
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to load bulk actions data');
//       console.error('Error fetching data:', err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Filter users based on search and filters
//   const filteredUsers = useMemo(() => {
//     return users.filter(user => {
//       const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                            user.phone_number.includes(searchTerm) ||
//                            (user.plan_name && user.plan_name.toLowerCase().includes(searchTerm.toLowerCase()));
//       const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
//       const matchesPlan = planFilter === 'all' || user.plan_name === planFilter;
      
//       return matchesSearch && matchesStatus && matchesPlan;
//     });
//   }, [users, searchTerm, statusFilter, planFilter]);

//   const handleFileUpload = async (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     setImportFile(file);
//     setIsProcessing(true);
    
//     try {
//       const formData = new FormData();
//       formData.append('file', file);
      
//       const response = await api.post('/api/user_management/bulk-import/', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
      
//       setImportResults(response.data);
//       // Refresh users after import
//       fetchData();
      
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to import users');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleSendBulkMessage = async () => {
//     if (!messageForm.message.trim()) {
//       setError('Please enter a message');
//       return;
//     }

//     if (selectedUsers.size === 0) {
//       setError('Please select at least one user');
//       return;
//     }

//     setIsProcessing(true);
    
//     try {
//       const payload = {
//         action_type: 'message',
//         user_ids: Array.from(selectedUsers),
//         message: messageForm.message,
//         message_type: messageForm.message_type,
//         subject: messageForm.subject
//       };

//       if (scheduleDate && scheduleTime) {
//         payload.schedule_time = `${scheduleDate}T${scheduleTime}:00Z`;
//       }

//       const response = await api.post('/api/user_management/bulk-action/', payload);
      
//       if (response.data.status === 'pending') {
//         alert('Message scheduled successfully!');
//       } else {
//         alert(`Message sent to ${response.data.success_count} users successfully!`);
//       }
      
//       // Reset form
//       setMessageForm({ message: '', message_type: 'sms', subject: '' });
//       setSelectedUsers(new Set());
//       setScheduleDate('');
//       setScheduleTime('');
//       setShowSchedule(false);
      
//       // Refresh history
//       fetchData();
      
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to send bulk message');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleBulkUserAction = async () => {
//     if (selectedUsers.size === 0) {
//       setError('Please select at least one user');
//       return;
//     }

//     if (bulkActionType === 'change_plan' && !selectedPlan) {
//       setError('Please select a plan');
//       return;
//     }

//     setIsProcessing(true);
    
//     try {
//       const payload = {
//         action_type: bulkActionType,
//         user_ids: Array.from(selectedUsers)
//       };

//       if (bulkActionType === 'change_plan') {
//         payload.plan_name = selectedPlan;
//       }

//       const response = await api.post('/api/user_management/bulk-action/', payload);
      
//       alert(`Action completed: ${response.data.success_count} users processed successfully`);
      
//       // Reset selection
//       setSelectedUsers(new Set());
//       setBulkActionType('');
//       setSelectedPlan('');
      
//       // Refresh users and history
//       fetchData();
      
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to perform bulk action');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const toggleUserSelection = useCallback((userId) => {
//     setSelectedUsers(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(userId)) {
//         newSet.delete(userId);
//       } else {
//         newSet.add(userId);
//       }
//       return newSet;
//     });
//   }, []);

//   const selectAllUsers = useCallback(() => {
//     if (selectedUsers.size === filteredUsers.length) {
//       setSelectedUsers(new Set());
//     } else {
//       const newSet = new Set(filteredUsers.map(user => user.id));
//       setSelectedUsers(newSet);
//     }
//   }, [selectedUsers.size, filteredUsers]);

//   const applyTemplate = (template) => {
//     setMessageForm({ ...messageForm, message: template.message });
//     setShowTemplates(false);
//   };

//   const downloadTemplate = () => {
//     // Create CSV template
//     const headers = ['username,phone_number,plan_name,location'];
//     const templateData = [
//       ['john_doe', '+254712345678', 'Business 10GB', 'Nairobi'],
//       ['jane_smith', '+254723456789', 'Residential 5GB', 'Mombasa']
//     ];
    
//     const csv = [...headers, ...templateData.map(row => row.join(','))].join('\n');
    
//     // Download CSV
//     const blob = new Blob([csv], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.setAttribute('href', url);
//     a.setAttribute('download', 'user_import_template.csv');
//     a.click();
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
//       case 'expired': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
//       case 'inactive': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
//       default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
//     }
//   };

//   const getStatusDisplay = (status) => {
//     switch (status) {
//       case 'active': return 'Active';
//       case 'expired': return 'Expired';
//       case 'inactive': return 'Inactive';
//       default: return status;
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="p-6 max-w-7xl mx-auto flex justify-center items-center min-h-screen bg-white dark:bg-gray-900">
//         <FaSpinner className="animate-spin text-4xl text-blue-600 dark:text-blue-400" />
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <div className="p-6 max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900">
//         <p className="text-center text-red-500 dark:text-red-400">Please log in to access bulk actions.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900">
//       <button onClick={toggleTheme} className="mb-4 px-4 py-2 bg-blue-500 dark:bg-blue-700 text-white rounded-lg">
//         Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
//       </button>
//       {error && (
//         <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg flex justify-between items-center">
//           <span>{error}</span>
//           <button onClick={() => setError(null)} className="text-red-700 dark:text-red-300">
//             <X size={20} />
//           </button>
//         </div>
//       )}

//       <div className="mb-8 flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">Bulk Actions</h1>
//           <p className="text-gray-600 dark:text-gray-400">Perform actions on multiple users at once</p>
//         </div>
//         <button
//           onClick={fetchData}
//           className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
//         >
//           <RefreshCw size={16} />
//           Refresh
//         </button>
//       </div>

//       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
//         <div className="flex border-b border-gray-100 dark:border-gray-700">
//           <button
//             className={`px-6 py-3 font-medium text-sm ${activeTab === 'import' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
//             onClick={() => setActiveTab('import')}
//           >
//             Import Users
//           </button>
//           <button
//             className={`px-6 py-3 font-medium text-sm ${activeTab === 'message' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
//             onClick={() => setActiveTab('message')}
//           >
//             Bulk Message
//           </button>
//           <button
//             className={`px-6 py-3 font-medium text-sm ${activeTab === 'manage' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
//             onClick={() => setActiveTab('manage')}
//           >
//             Manage Users
//           </button>
//         </div>

//         <div className="p-6">
//           {/* Import Users Tab */}
//           {activeTab === 'import' && (
//             <div className="space-y-6">
//               <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
//                 <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Import Instructions</h3>
//                 <ul className="text-sm text-blue-700 dark:text-blue-300 list-disc list-inside space-y-1">
//                   <li>Download the template CSV file to ensure proper formatting</li>
//                   <li>Required field: Phone Number (must include country code)</li>
//                   <li>Optional fields: Plan, Location</li>
//                   <li>Phone numbers must be in international format (+254...)</li>
//                   <li>Maximum file size: 5MB</li>
//                   <li>Supported formats: CSV, XLSX</li>
//                 </ul>
//               </div>

//               <div className="flex gap-4">
//                 <button 
//                   className="flex items-center gap-2 px-4 py-2 bg-green-500 dark:bg-green-700 text-white rounded-lg hover:bg-green-600 dark:hover:bg-green-600"
//                   onClick={downloadTemplate}
//                 >
//                   <Download size={16} />
//                   Download Template
//                 </button>

//                 <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-600 cursor-pointer">
//                   <Upload size={16} />
//                   Upload File
//                   <input
//                     type="file"
//                     accept=".csv,.xlsx"
//                     onChange={handleFileUpload}
//                     className="hidden"
//                     disabled={isProcessing}
//                   />
//                 </label>
//               </div>

//               {importFile && (
//                 <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
//                   <div className="flex items-center justify-between mb-3">
//                     <div className="flex items-center gap-2">
//                       <FileText className="text-blue-500 dark:text-blue-400" size={18} />
//                       <span className="font-medium text-gray-800 dark:text-gray-200">{importFile.name}</span>
//                       <span className="text-xs text-gray-500 dark:text-gray-400">({(importFile.size / 1024).toFixed(1)} KB)</span>
//                     </div>
//                     <button
//                       onClick={() => {
//                         setImportFile(null);
//                         setImportResults(null);
//                       }}
//                       className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
//                       disabled={isProcessing}
//                     >
//                       <X size={16} />
//                     </button>
//                   </div>

//                   {importResults ? (
//                     <div className="space-y-3">
//                       <div className="flex items-center gap-4">
//                         <div className="text-center">
//                           <div className="text-2xl font-bold text-green-600 dark:text-green-400">{importResults.success_count}</div>
//                           <div className="text-sm text-gray-600 dark:text-gray-400">Successful</div>
//                         </div>
//                         <div className="text-center">
//                           <div className="text-2xl font-bold text-red-600 dark:text-red-400">{importResults.failed_count}</div>
//                           <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
//                         </div>
//                         <div className="text-center">
//                           <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{importResults.total_users}</div>
//                           <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
//                         </div>
//                       </div>

//                       {importResults.errors && importResults.errors.length > 0 && (
//                         <div>
//                           <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Errors:</h4>
//                           <div className="space-y-1">
//                             {importResults.errors.map((error, index) => (
//                               <div key={index} className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
//                                 <AlertCircle size={14} />
//                                 <span>Row {error.row}: {error.error}</span>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )}

//                       <div className="flex gap-2">
//                         <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-600">
//                           <Download size={16} />
//                           Download Error Report
//                         </button>
                        
//                         <button 
//                           className="flex items-center gap-2 px-4 py-2 bg-green-500 dark:bg-green-700 text-white rounded-lg hover:bg-green-600 dark:hover:bg-green-600"
//                           onClick={() => setActiveTab('manage')}
//                         >
//                           <UserCheck size={16} />
//                           View Imported Users
//                         </button>
//                       </div>
//                     </div>
//                   ) : isProcessing ? (
//                     <div className="text-center py-4">
//                       <Loader className="animate-spin mx-auto mb-2 text-gray-800 dark:text-gray-200" size={20} />
//                       <p className="text-sm text-gray-600 dark:text-gray-400">Processing file...</p>
//                     </div>
//                   ) : null}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Bulk Message Tab */}
//           {activeTab === 'message' && (
//             <div className="space-y-6">
//               <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
//                 <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Select Users</h3>
                
//                 <div className="flex flex-col md:flex-row gap-4 mb-4">
//                   <div className="relative flex-1">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
//                     <input
//                       type="text"
//                       placeholder="Search users by username, phone, or plan..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
//                     />
//                   </div>
                  
//                   <select
//                     value={statusFilter}
//                     onChange={(e) => setStatusFilter(e.target.value)}
//                     className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
//                   >
//                     <option value="all">All Status</option>
//                     <option value="active">Active</option>
//                     <option value="expired">Expired</option>
//                     <option value="inactive">Inactive</option>
//                   </select>
                  
//                   <select
//                     value={planFilter}
//                     onChange={(e) => setPlanFilter(e.target.value)}
//                     className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
//                   >
//                     <option value="all">All Plans</option>
//                     {availablePlans.map(plan => (
//                       <option key={plan} value={plan}>{plan}</option>
//                     ))}
//                   </select>
//                 </div>
                
//                 <div className="mb-4 flex items-center justify-between">
//                   <div>
//                     <button
//                       onClick={selectAllUsers}
//                       className="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
//                     >
//                       {selectedUsers.size === filteredUsers.length ? 'Deselect All' : 'Select All'}
//                     </button>
//                     <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
//                       {selectedUsers.size} of {filteredUsers.length} selected
//                     </span>
//                   </div>
                  
//                   <div className="text-sm text-gray-600 dark:text-gray-400">
//                     {filteredUsers.length} users found
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
//                   {filteredUsers.length > 0 ? (
//                     filteredUsers.map(user => (
//                       <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-gray-800 rounded">
//                         <input
//                           type="checkbox"
//                           checked={selectedUsers.has(user.id)}
//                           onChange={() => toggleUserSelection(user.id)}
//                           className="rounded border-gray-300 dark:border-gray-600 text-blue-500 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
//                         />
//                         <div className="flex-1">
//                           <div className="font-medium text-gray-800 dark:text-gray-200">{user.username}</div>
//                           <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
//                             <Phone size={14} />
//                             {user.phone_number} • {user.plan_name} • {user.location}
//                           </div>
//                         </div>
//                         <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(user.status)}`}>
//                           {getStatusDisplay(user.status)}
//                         </span>
//                       </label>
//                     ))
//                   ) : (
//                     <div className="text-center py-4 text-gray-500 dark:text-gray-400">
//                       <UserX size={20} className="mx-auto mb-1" />
//                       <p>No users found</p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
//                 <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Compose Message</h3>
                
//                 <div className="mb-3">
//                   <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Message Type</label>
//                   <select
//                     value={messageForm.message_type}
//                     onChange={(e) => setMessageForm({ ...messageForm, message_type: e.target.value })}
//                     className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
//                   >
//                     <option value="sms">SMS</option>
//                     <option value="email">Email</option>
//                     <option value="push">Push Notification</option>
//                   </select>
//                 </div>

//                 {messageForm.message_type === 'email' && (
//                   <div className="mb-3">
//                     <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Subject</label>
//                     <input
//                       type="text"
//                       value={messageForm.subject}
//                       onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
//                       className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
//                       placeholder="Email subject"
//                     />
//                   </div>
//                 )}

//                 <div className="mb-3">
//                   <div className="flex items-center justify-between mb-1">
//                     <label className="block text-sm text-gray-600 dark:text-gray-400">Message</label>
//                     <button
//                       type="button"
//                       onClick={() => setShowTemplates(!showTemplates)}
//                       className="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
//                     >
//                       {showTemplates ? 'Hide Templates' : 'Load Template'}
//                       {showTemplates ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
//                     </button>
//                   </div>
                  
//                   {showTemplates && (
//                     <div className="mb-3 bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600">
//                       <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Saved Templates</h4>
//                       <div className="space-y-2">
//                         {savedTemplates.length > 0 ? (
//                           savedTemplates.map(template => (
//                             <div key={template.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
//                               <div>
//                                 <div className="font-medium text-gray-800 dark:text-gray-200">{template.name}</div>
//                                 <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{template.message}</div>
//                               </div>
//                               <button
//                                 onClick={() => applyTemplate(template)}
//                                 className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
//                               >
//                                 Apply
//                               </button>
//                             </div>
//                           ))
//                         ) : (
//                           <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">No templates found</p>
//                         )}
//                       </div>
//                       <button className="mt-2 flex items-center gap-1 text-sm text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
//                         <Plus size={14} />
//                         Create New Template
//                       </button>
//                     </div>
//                   )}
                  
//                   <textarea
//                     rows={4}
//                     value={messageForm.message}
//                     onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
//                     className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
//                     placeholder="Type your message here..."
//                   />
//                 </div>

//                 <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
//                   <div>
//                     {messageForm.message_type === 'sms' ? (
//                       <>
//                         <p>Character count: {messageForm.message.length}/160</p>
//                         <p>Estimated cost: {selectedUsers.size * 1} SMS credits</p>
//                       </>
//                     ) : (
//                       <p>{selectedUsers.size} recipients</p>
//                     )}
//                   </div>
                  
//                   <button
//                     type="button"
//                     onClick={() => setShowSchedule(!showSchedule)}
//                     className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
//                     disabled={messageForm.message_type !== 'sms'}
//                   >
//                     <Clock size={14} />
//                     {showSchedule ? 'Hide Schedule' : 'Schedule Message'}
//                   </button>
//                 </div>
                
//                 {showSchedule && (
//                   <div className="mb-3 bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600">
//                     <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Schedule Message</h4>
//                     <div className="grid grid-cols-2 gap-3">
//                       <div>
//                         <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Date</label>
//                         <input
//                           type="date"
//                           value={scheduleDate}
//                           onChange={(e) => setScheduleDate(e.target.value)}
//                           className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
//                           min={new Date().toISOString().split('T')[0]}
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Time</label>
//                         <input
//                           type="time"
//                           value={scheduleTime}
//                           onChange={(e) => setScheduleTime(e.target.value)}
//                           className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 <button
//                   onClick={handleSendBulkMessage}
//                   disabled={selectedUsers.size === 0 || !messageForm.message.trim() || isProcessing}
//                   className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {isProcessing ? (
//                     <Loader className="animate-spin" size={16} />
//                   ) : scheduleDate && scheduleTime ? (
//                     <Clock size={16} />
//                   ) : (
//                     <Send size={16} />
//                   )}
//                   {isProcessing ? 'Processing...' : scheduleDate && scheduleTime ? 'Schedule Message' : 'Send Message'} to {selectedUsers.size} Users
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Manage Users Tab */}
//           {activeTab === 'manage' && (
//             <div className="space-y-6">
//               <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
//                 <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Bulk User Management</h3>
//                 <p className="text-sm text-blue-700 dark:text-blue-300">Perform actions on multiple users simultaneously</p>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                 <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 text-center">
//                   <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
//                     <UserCheck size={20} />
//                   </div>
//                   <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Activate Users</h3>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">Enable service for selected users</p>
//                   <button 
//                     className="mt-3 px-4 py-1 bg-blue-500 dark:bg-blue-700 text-white rounded-lg text-sm hover:bg-blue-600 dark:hover:bg-blue-600"
//                     onClick={() => {
//                       setBulkActionType('activate');
//                       document.getElementById('manageUsersSection').scrollIntoView({ behavior: 'smooth' });
//                     }}
//                   >
//                     Select Users
//                   </button>
//                 </div>
                
//                 <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 text-center">
//                   <div className="bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
//                     <UserX size={20} />
//                   </div>
//                   <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Deactivate Users</h3>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">Disable service for selected users</p>
//                   <button 
//                     className="mt-3 px-4 py-1 bg-amber-500 dark:bg-amber-700 text-white rounded-lg text-sm hover:bg-amber-600 dark:hover:bg-amber-600"
//                     onClick={() => {
//                       setBulkActionType('deactivate');
//                       document.getElementById('manageUsersSection').scrollIntoView({ behavior: 'smooth' });
//                     }}
//                   >
//                     Select Users
//                   </button>
//                 </div>
                
//                 <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 text-center">
//                   <div className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
//                     <Edit3 size={20} />
//                   </div>
//                   <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Change Plan</h3>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">Update plan for selected users</p>
//                   <button 
//                     className="mt-3 px-4 py-1 bg-purple-500 dark:bg-purple-700 text-white rounded-lg text-sm hover:bg-purple-600 dark:hover:bg-purple-600"
//                     onClick={() => {
//                       setBulkActionType('change_plan');
//                       document.getElementById('manageUsersSection').scrollIntoView({ behavior: 'smooth' });
//                     }}
//                   >
//                     Select Users
//                   </button>
//                 </div>
                
//                 <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 text-center">
//                   <div className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
//                     <Trash2 size={20} />
//                   </div>
//                   <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Delete Users</h3>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">Remove selected users from system</p>
//                   <button 
//                     className="mt-3 px-4 py-1 bg-red-500 dark:bg-red-700 text-white rounded-lg text-sm hover:bg-red-600 dark:hover:bg-red-600"
//                     onClick={() => {
//                       setBulkActionType('delete');
//                       document.getElementById('manageUsersSection').scrollIntoView({ behavior: 'smooth' });
//                     }}
//                   >
//                     Select Users
//                   </button>
//                 </div>
//               </div>

//               <div id="manageUsersSection" className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
//                 <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Select Users</h3>
                
//                 <div className="flex flex-col md:flex-row gap-4 mb-4">
//                   <div className="relative flex-1">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
//                     <input
//                       type="text"
//                       placeholder="Search users by username, phone, or plan..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
//                     />
//                   </div>
                  
//                   <select
//                     value={statusFilter}
//                     onChange={(e) => setStatusFilter(e.target.value)}
//                     className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
//                   >
//                     <option value="all">All Status</option>
//                     <option value="active">Active</option>
//                     <option value="expired">Expired</option>
//                     <option value="inactive">Inactive</option>
//                   </select>
                  
//                   <select
//                     value={planFilter}
//                     onChange={(e) => setPlanFilter(e.target.value)}
//                     className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
//                   >
//                     <option value="all">All Plans</option>
//                     {availablePlans.map(plan => (
//                       <option key={plan} value={plan}>{plan}</option>
//                     ))}
//                   </select>
//                 </div>
                
//                 <div className="mb-4 flex items-center justify-between">
//                   <div>
//                     <button
//                       onClick={selectAllUsers}
//                       className="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
//                     >
//                       {selectedUsers.size === filteredUsers.length ? 'Deselect All' : 'Select All'}
//                     </button>
//                     <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
//                       {selectedUsers.size} of {filteredUsers.length} selected
//                     </span>
//                   </div>
                  
//                   <div className="text-sm text-gray-600 dark:text-gray-400">
//                     {filteredUsers.length} users found
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
//                   {filteredUsers.length > 0 ? (
//                     filteredUsers.map(user => (
//                       <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-gray-800 rounded">
//                         <input
//                           type="checkbox"
//                           checked={selectedUsers.has(user.id)}
//                           onChange={() => toggleUserSelection(user.id)}
//                           className="rounded border-gray-300 dark:border-gray-600 text-blue-500 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
//                         />
//                         <div className="flex-1">
//                           <div className="font-medium text-gray-800 dark:text-gray-200">{user.username}</div>
//                           <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
//                             <Phone size={14} />
//                             {user.phone_number} • {user.plan_name} • {user.location}
//                           </div>
//                         </div>
//                         <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(user.status)}`}>
//                           {getStatusDisplay(user.status)}
//                         </span>
//                       </label>
//                     ))
//                   ) : (
//                     <div className="text-center py-4 text-gray-500 dark:text-gray-400">
//                       <UserX size={20} className="mx-auto mb-1" />
//                       <p>No users found</p>
//                     </div>
//                   )}
//                 </div>

//                 {(bulkActionType) && (
//                   <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
//                     <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Selected Action: {
//                       bulkActionType === 'activate' ? 'Activate Users' :
//                       bulkActionType === 'deactivate' ? 'Deactivate Users' :
//                       bulkActionType === 'change_plan' ? 'Change Plan' : 'Delete Users'
//                     }</h3>
                    
//                     {bulkActionType === 'change_plan' && (
//                       <div className="mb-4">
//                         <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Select Plan</label>
//                         <select
//                           value={selectedPlan}
//                           onChange={(e) => setSelectedPlan(e.target.value)}
//                           className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
//                         >
//                           <option value="">Select a plan</option>
//                           {availablePlans.map(plan => (
//                             <option key={plan} value={plan}>{plan}</option>
//                           ))}
//                         </select>
//                       </div>
//                     )}

//                     <button
//                       onClick={handleBulkUserAction}
//                       disabled={selectedUsers.size === 0 || (bulkActionType === 'change_plan' && !selectedPlan) || isProcessing}
//                       className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       {isProcessing ? (
//                         <Loader className="animate-spin" size={16} />
//                       ) : (
//                         <>
//                           {bulkActionType === 'activate' && <UserCheck size={16} />}
//                           {bulkActionType === 'deactivate' && <UserX size={16} />}
//                           {bulkActionType === 'change_plan' && <Edit3 size={16} />}
//                           {bulkActionType === 'delete' && <Trash2 size={16} />}
//                         </>
//                       )}
//                       {isProcessing ? 'Processing...' : `Apply to ${selectedUsers.size} Users`}
//                     </button>
//                   </div>
//                 )}
//               </div>

//               <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
//                 <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Bulk Actions</h3>
                
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-sm">
//                     <thead>
//                       <tr className="bg-gray-100 dark:bg-gray-700">
//                         <th className="p-2 text-left text-gray-700 dark:text-gray-300">Action</th>
//                         <th className="p-2 text-left text-gray-700 dark:text-gray-300">Type</th>
//                         <th className="p-2 text-left text-gray-700 dark:text-gray-300">Users</th>
//                         <th className="p-2 text-left text-gray-700 dark:text-gray-300">Status</th>
//                         <th className="p-2 text-left text-gray-700 dark:text-gray-300">Date</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {actionHistory.length > 0 ? (
//                         actionHistory.map((action, index) => (
//                           <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
//                             <td className="p-2 text-gray-800 dark:text-gray-200">{action.action_type_display}</td>
//                             <td className="p-2 text-gray-800 dark:text-gray-200">{action.message_type || 'N/A'}</td>
//                             <td className="p-2 text-gray-800 dark:text-gray-200">{action.total_users}</td>
//                             <td className="p-2">
//                               <span className={`flex items-center gap-1 ${
//                                 action.status === 'completed' ? 'text-green-600 dark:text-green-400' :
//                                 action.status === 'partial' ? 'text-yellow-600 dark:text-yellow-400' :
//                                 action.status === 'failed' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'
//                               }`}>
//                                 {action.status === 'completed' && <CheckCircle size={14} />}
//                                 {action.status === 'partial' && <AlertCircle size={14} />}
//                                 {action.status === 'failed' && <AlertCircle size={14} />}
//                                 {action.status === 'pending' && <Clock size={14} />}
//                                 {action.status_display}
//                               </span>
//                             </td>
//                             <td className="p-2 text-gray-800 dark:text-gray-200">{new Date(action.created_at).toLocaleDateString()}</td>
//                           </tr>
//                         ))
//                       ) : (
//                         <tr>
//                           <td colSpan="5" className="p-4 text-center text-gray-500 dark:text-gray-400">
//                             No bulk actions history found
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Quick Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
//           <div className="flex items-center gap-3">
//             <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
//               <Users size={20} />
//             </div>
//             <div>
//               <p className="text-xs text-gray-500 dark:text-gray-400">Total Users</p>
//               <p className="font-medium text-lg text-gray-800 dark:text-gray-200">{stats.total_users}</p>
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
//           <div className="flex items-center gap-3">
//             <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
//               <MessageSquare size={20} />
//             </div>
//             <div>
//               <p className="text-xs text-gray-500 dark:text-gray-400">Messages Sent (30 days)</p>
//               <p className="font-medium text-lg text-gray-800 dark:text-gray-200">{stats.total_messages}</p>
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
//           <div className="flex items-center gap-3">
//             <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400">
//               <Download size={20} />
//             </div>
//             <div>
//               <p className="text-xs text-gray-500 dark:text-gray-400">Last Import</p>
//               <p className="font-medium text-lg text-gray-800 dark:text-gray-200">{stats.last_import} users</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BulkActions;






import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Upload, 
  Download, 
  Send, 
  Users, 
  FileText, 
  CheckCircle,
  AlertCircle,
  X,
  Filter,
  Search,
  UserCheck,
  UserX,
  Mail,
  MessageSquare,
  Clock,
  Edit3,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  Phone,
  Loader,
  RefreshCw
} from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FaSpinner } from 'react-icons/fa';

// Memoized components
const StatusBadge = React.memo(({ status }) => {
  const colorMap = useMemo(() => ({
    active: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    expired: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    inactive: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }), []);

  const displayMap = useMemo(() => ({
    active: 'Active',
    expired: 'Expired',
    inactive: 'Inactive'
  }), []);

  const colorClass = colorMap[status] || colorMap.default;
  const displayText = displayMap[status] || status;

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${colorClass}`}>
      {displayText}
    </span>
  );
});

const BulkActions = () => {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('import');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [importFile, setImportFile] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [messageForm, setMessageForm] = useState({
    message: '',
    message_type: 'sms',
    subject: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [showTemplates, setShowTemplates] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [bulkActionType, setBulkActionType] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [availablePlans, setAvailablePlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [actionHistory, setActionHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({
    total_users: 0,
    total_messages: 0,
    last_import: 0
  });

  // Memoized filtered users with optimized filtering
  const filteredUsers = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return users.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(lowerSearch) ||
                            user.phone_number.includes(lowerSearch) ||
                            (user.plan_name && user.plan_name.toLowerCase().includes(lowerSearch));
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      const matchesPlan = planFilter === 'all' || user.plan_name === planFilter;
      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [users, searchTerm, statusFilter, planFilter]);

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
      
      const [usersRes, templatesRes, historyRes] = await Promise.all([
        api.get('/api/user_management/bulk-users/'),
        api.get('/api/user_management/message-templates/'),
        api.get('/api/user_management/bulk-history/')
      ]);

      setUsers(usersRes.data.users || []);
      setStats({
        total_users: usersRes.data.total_count || 0,
        total_messages: 2458, // Replace with actual from analytics
        last_import: 15 // Replace with actual from history
      });
      
      setSavedTemplates(templatesRes.data || []);
      setActionHistory(historyRes.data.actions || []);
      
      // Fetch plans - assume API call
      setAvailablePlans([
        'Business 10GB', 'Business 15GB', 'Residential 5GB', 
        'Residential 10GB', 'Enterprise 20GB', 'Enterprise 50GB'
      ]);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load bulk actions data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImportFile(file);
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/api/user_management/bulk-import/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setImportResults(response.data);
      fetchData();
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to import users');
    } finally {
      setIsProcessing(false);
    }
  }, [fetchData]);

  const handleSendBulkMessage = useCallback(async () => {
    if (!messageForm.message.trim() || selectedUsers.length === 0) {
      setError(!messageForm.message.trim() ? 'Please enter a message' : 'Please select at least one user');
      return;
    }

    setIsProcessing(true);
    
    try {
      const payload = {
        action_type: 'message',
        user_ids: selectedUsers,
        ...messageForm
      };

      if (scheduleDate && scheduleTime) {
        payload.schedule_time = `${scheduleDate}T${scheduleTime}:00Z`;
      }

      const response = await api.post('/api/user_management/bulk-action/', payload);
      
      alert(response.data.status === 'pending' ? 'Message scheduled successfully!' : `Message sent to ${response.data.success_count} users successfully!`);
      
      setMessageForm({ message: '', message_type: 'sms', subject: '' });
      setSelectedUsers([]);
      setScheduleDate('');
      setScheduleTime('');
      setShowSchedule(false);
      fetchData();
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send bulk message');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedUsers, messageForm, scheduleDate, scheduleTime, fetchData]);

  const handleBulkUserAction = useCallback(async () => {
    if (selectedUsers.length === 0 || (bulkActionType === 'change_plan' && !selectedPlan)) {
      setError(selectedUsers.length === 0 ? 'Please select at least one user' : 'Please select a plan');
      return;
    }

    setIsProcessing(true);
    
    try {
      const payload = {
        action_type: bulkActionType,
        user_ids: selectedUsers
      };

      if (bulkActionType === 'change_plan') {
        payload.plan_name = selectedPlan;
      }

      const response = await api.post('/api/user_management/bulk-action/', payload);
      
      alert(`Action completed: ${response.data.success_count} users processed successfully`);
      
      setSelectedUsers([]);
      setBulkActionType('');
      setSelectedPlan('');
      fetchData();
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to perform bulk action');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedUsers, bulkActionType, selectedPlan, fetchData]);

  const toggleUserSelection = useCallback((userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  }, []);

  const selectAllUsers = useCallback(() => {
    setSelectedUsers(prev => 
      prev.length === filteredUsers.length ? [] : filteredUsers.map(user => user.id)
    );
  }, [filteredUsers]);

  const applyTemplate = useCallback((template) => {
    setMessageForm(prev => ({ ...prev, message: template.message }));
    setShowTemplates(false);
  }, []);

  const downloadTemplate = useCallback(() => {
    const csvContent = 'username,phone_number,plan_name,location\njohn_doe,+254712345678,Business 10GB,Nairobi\njane_smith,+254723456789,Residential 5GB,Mombasa';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  if (isLoading) return (
    <div className="p-6 max-w-7xl mx-auto flex justify-center items-center min-h-screen">
      <FaSpinner className="animate-spin text-4xl text-blue-600 dark:text-blue-400" />
    </div>
  );

  if (!isAuthenticated) return (
    <div className="p-6 max-w-7xl mx-auto">
      <p className="text-center text-red-500 dark:text-red-400">Please log in to access bulk actions.</p>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto theme-transition">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex justify-between items-center dark:bg-red-900/20 dark:text-red-400">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-700 dark:text-red-400">
            <X size={20} />
          </button>
        </div>
      )}

      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Bulk Actions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Perform actions on multiple users at once</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
          <button
            className={`flex-shrink-0 px-6 py-3 font-medium text-sm ${activeTab === 'import' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('import')}
          >
            Import Users
          </button>
          <button
            className={`flex-shrink-0 px-6 py-3 font-medium text-sm ${activeTab === 'message' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('message')}
          >
            Bulk Message
          </button>
          <button
            className={`flex-shrink-0 px-6 py-3 font-medium text-sm ${activeTab === 'manage' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('manage')}
          >
            Manage Users
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'import' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30">
                <h3 className="font-medium text-blue-800 mb-2 dark:text-blue-400">Import Instructions</h3>
                <ul className="text-sm text-blue-700 list-disc list-inside space-y-1 dark:text-blue-300">
                  <li>Download the template CSV file to ensure proper formatting</li>
                  <li>Required field: Phone Number (must include country code)</li>
                  <li>Optional fields: Plan, Location</li>
                  <li>Phone numbers must be in international format (+254...)</li>
                  <li>Maximum file size: 5MB</li>
                  <li>Supported formats: CSV, XLSX</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                  onClick={downloadTemplate}
                >
                  <Download size={16} />
                  Download Template
                </button>

                <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer dark:bg-blue-600 dark:hover:bg-blue-700">
                  <Upload size={16} />
                  Upload File
                  <input
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isProcessing}
                  />
                </label>
              </div>

              {importFile && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 dark:bg-gray-700 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="text-blue-500 dark:text-blue-400" size={18} />
                      <span className="font-medium dark:text-white">{importFile.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">({(importFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button
                      onClick={() => {
                        setImportFile(null);
                        setImportResults(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                      disabled={isProcessing}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {importResults ? (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="text-center flex-1">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-500">{importResults.success_count}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Successful</div>
                        </div>
                        <div className="text-center flex-1">
                          <div className="text-2xl font-bold text-red-600 dark:text-red-500">{importResults.failed_count}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
                        </div>
                        <div className="text-center flex-1">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">{importResults.total_users}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                        </div>
                      </div>

                      {importResults.errors && importResults.errors.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2 dark:text-gray-300">Errors:</h4>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {importResults.errors.map((error, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                <AlertCircle size={14} />
                                <span>Row {error.row}: {error.error}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 flex-1">
                          <Download size={16} />
                          Download Error Report
                        </button>
                        
                        <button 
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 flex-1"
                          onClick={() => setActiveTab('manage')}
                        >
                          <UserCheck size={16} />
                          View Imported Users
                        </button>
                      </div>
                    </div>
                  ) : isProcessing ? (
                    <div className="text-center py-4">
                      <Loader className="animate-spin mx-auto mb-2 dark:text-white" size={20} />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Processing file...</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {activeTab === 'message' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 dark:bg-gray-700 dark:border-gray-600">
                <h3 className="font-medium text-gray-700 mb-3 dark:text-gray-300">Select Users</h3>
                
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search users by username, phone, or plan..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  
                  <select
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value="all">All Plans</option>
                    {availablePlans.map(plan => (
                      <option key={plan} value={plan}>{plan}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <button
                      onClick={selectAllUsers}
                      className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <span className="text-sm text-gray-600 ml-2 dark:text-gray-400">
                      {selectedUsers.length} of {filteredUsers.length} selected
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredUsers.length} users found
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-white rounded dark:hover:bg-gray-600">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate dark:text-white">{user.username}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-2 truncate dark:text-gray-400">
                            <Phone size={14} />
                            {user.phone_number} • {user.plan_name} • {user.location}
                          </div>
                        </div>
                        <StatusBadge status={user.status} />
                      </label>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      <UserX size={20} className="mx-auto mb-1" />
                      <p>No users found</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 dark:bg-gray-700 dark:border-gray-600">
                <h3 className="font-medium text-gray-700 mb-3 dark:text-gray-300">Compose Message</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1 dark:text-gray-400">Message Type</label>
                    <select
                      value={messageForm.message_type}
                      onChange={(e) => setMessageForm({ ...messageForm, message_type: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    >
                      <option value="sms">SMS</option>
                      <option value="email">Email</option>
                      <option value="push">Push Notification</option>
                    </select>
                  </div>

                  {messageForm.message_type === 'email' && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1 dark:text-gray-400">Subject</label>
                      <input
                        type="text"
                        value={messageForm.subject}
                        onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        placeholder="Email subject"
                      />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm text-gray-600 dark:text-gray-400">Message</label>
                      <button
                        type="button"
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {showTemplates ? 'Hide Templates' : 'Load Template'}
                        {showTemplates ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                    
                    {showTemplates && (
                      <div className="mb-3 bg-white p-3 rounded border dark:bg-gray-800 dark:border-gray-600 max-h-48 overflow-y-auto">
                        <h4 className="font-medium text-gray-700 mb-2 dark:text-gray-300">Saved Templates</h4>
                        <div className="space-y-2">
                          {savedTemplates.length > 0 ? (
                            savedTemplates.map(template => (
                              <div key={template.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded dark:hover:bg-gray-700">
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium truncate dark:text-white">{template.name}</div>
                                  <div className="text-sm text-gray-500 truncate dark:text-gray-400">{template.message}</div>
                                </div>
                                <button
                                  onClick={() => applyTemplate(template)}
                                  className="text-blue-500 hover:text-blue-700 text-sm dark:text-blue-400 dark:hover:text-blue-300 ml-2"
                                >
                                  Apply
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-2 dark:text-gray-400">No templates found</p>
                          )}
                        </div>
                        <button className="mt-2 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                          <Plus size={14} />
                          Create New Template
                        </button>
                      </div>
                    )}
                    
                    <textarea
                      rows={4}
                      value={messageForm.message}
                      onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      placeholder="Type your message here..."
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-gray-600 gap-4 sm:gap-0 dark:text-gray-400">
                    <div>
                      {messageForm.message_type === 'sms' ? (
                        <>
                          <p>Character count: {messageForm.message.length}/160</p>
                          <p>Estimated cost: {selectedUsers.length * 1} SMS credits</p>
                        </>
                      ) : (
                        <p>{selectedUsers.length} recipients</p>
                      )}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setShowSchedule(!showSchedule)}
                      className="text-blue-500 hover:text-blue-700 flex items-center gap-1 dark:text-blue-400 dark:hover:text-blue-300"
                      disabled={messageForm.message_type !== 'sms'}
                    >
                      <Clock size={14} />
                      {showSchedule ? 'Hide Schedule' : 'Schedule Message'}
                    </button>
                  </div>
                  
                  {showSchedule && (
                    <div className="bg-white p-3 rounded border dark:bg-gray-800 dark:border-gray-600">
                      <h4 className="font-medium text-gray-700 mb-2 dark:text-gray-300">Schedule Message</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1 dark:text-gray-400">Date</label>
                          <input
                            type="date"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1 dark:text-gray-400">Time</label>
                          <input
                            type="time"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSendBulkMessage}
                    disabled={selectedUsers.length === 0 || !messageForm.message.trim() || isProcessing}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    {isProcessing ? <Loader className="animate-spin" size={16} /> : scheduleDate && scheduleTime ? <Clock size={16} /> : <Send size={16} />}
                    {isProcessing ? 'Processing...' : scheduleDate && scheduleTime ? 'Schedule Message' : 'Send Message'} to {selectedUsers.length} Users
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30">
                <h3 className="font-medium text-blue-800 mb-2 dark:text-blue-400">Bulk User Management</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">Perform actions on multiple users simultaneously</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center dark:bg-gray-800 dark:border-gray-700">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 dark:bg-blue-900/20 dark:text-blue-400">
                    <UserCheck size={20} />
                  </div>
                  <h3 className="font-medium text-gray-800 mb-1 dark:text-white">Activate Users</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Enable service for selected users</p>
                  <button 
                    className="mt-3 px-4 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 w-full"
                    onClick={() => {
                      setBulkActionType('activate');
                      document.getElementById('manageUsersSection')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Select Users
                  </button>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center dark:bg-gray-800 dark:border-gray-700">
                  <div className="bg-amber-100 text-amber-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 dark:bg-amber-900/20 dark:text-amber-400">
                    <UserX size={20} />
                  </div>
                  <h3 className="font-medium text-gray-800 mb-1 dark:text-white">Deactivate Users</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Disable service for selected users</p>
                  <button 
                    className="mt-3 px-4 py-1 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 w-full"
                    onClick={() => {
                      setBulkActionType('deactivate');
                      document.getElementById('manageUsersSection')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Select Users
                  </button>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center dark:bg-gray-800 dark:border-gray-700">
                  <div className="bg-purple-100 text-purple-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 dark:bg-purple-900/20 dark:text-purple-400">
                    <Edit3 size={20} />
                  </div>
                  <h3 className="font-medium text-gray-800 mb-1 dark:text-white">Change Plan</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Update plan for selected users</p>
                  <button 
                    className="mt-3 px-4 py-1 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 w-full"
                    onClick={() => {
                      setBulkActionType('change_plan');
                      document.getElementById('manageUsersSection')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Select Users
                  </button>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center dark:bg-gray-800 dark:border-gray-700">
                  <div className="bg-red-100 text-red-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 dark:bg-red-900/20 dark:text-red-400">
                    <Trash2 size={20} />
                  </div>
                  <h3 className="font-medium text-gray-800 mb-1 dark:text-white">Delete Users</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Remove selected users from system</p>
                  <button 
                    className="mt-3 px-4 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 w-full"
                    onClick={() => {
                      setBulkActionType('delete');
                      document.getElementById('manageUsersSection')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Select Users
                  </button>
                </div>
              </div>

              <div id="manageUsersSection" className="bg-gray-50 p-4 rounded-lg border border-gray-100 dark:bg-gray-700 dark:border-gray-600">
                <h3 className="font-medium text-gray-700 mb-3 dark:text-gray-300">Select Users</h3>
                
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search users by username, phone, or plan..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  
                  <select
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value="all">All Plans</option>
                    {availablePlans.map(plan => (
                      <option key={plan} value={plan}>{plan}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <button
                      onClick={selectAllUsers}
                      className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <span className="text-sm text-gray-600 ml-2 dark:text-gray-400">
                      {selectedUsers.length} of {filteredUsers.length} selected
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredUsers.length} users found
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-white rounded dark:hover:bg-gray-600">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate dark:text-white">{user.username}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-2 truncate dark:text-gray-400">
                            <Phone size={14} />
                            {user.phone_number} • {user.plan_name} • {user.location}
                          </div>
                        </div>
                        <StatusBadge status={user.status} />
                      </label>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      <UserX size={20} className="mx-auto mb-1" />
                      <p>No users found</p>
                    </div>
                  )}
                </div>

                {bulkActionType && (
                  <div className="mt-4 bg-white p-4 rounded-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="font-medium text-gray-700 mb-3 dark:text-gray-300">Selected Action: {
                      bulkActionType === 'activate' ? 'Activate Users' :
                      bulkActionType === 'deactivate' ? 'Deactivate Users' :
                      bulkActionType === 'change_plan' ? 'Change Plan' : 'Delete Users'
                    }</h3>
                    
                    {bulkActionType === 'change_plan' && (
                      <div className="mb-4">
                        <label className="block text-sm text-gray-600 mb-1 dark:text-gray-400">Select Plan</label>
                        <select
                          value={selectedPlan}
                          onChange={(e) => setSelectedPlan(e.target.value)}
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        >
                          <option value="">Select a plan</option>
                          {availablePlans.map(plan => (
                            <option key={plan} value={plan}>{plan}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <button
                      onClick={handleBulkUserAction}
                      disabled={selectedUsers.length === 0 || (bulkActionType === 'change_plan' && !selectedPlan) || isProcessing}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                      {isProcessing ? <Loader className="animate-spin" size={16} /> : (
                        <>
                          {bulkActionType === 'activate' && <UserCheck size={16} />}
                          {bulkActionType === 'deactivate' && <UserX size={16} />}
                          {bulkActionType === 'change_plan' && <Edit3 size={16} />}
                          {bulkActionType === 'delete' && <Trash2 size={16} />}
                        </>
                      )}
                      {isProcessing ? 'Processing...' : `Apply to ${selectedUsers.length} Users`}
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 overflow-x-auto">
                <h3 className="font-medium text-gray-700 mb-3 dark:text-gray-300">Recent Bulk Actions</h3>
                
                <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="p-3 text-left text-gray-600 dark:text-gray-300">Action</th>
                      <th className="p-3 text-left text-gray-600 dark:text-gray-300">Type</th>
                      <th className="p-3 text-left text-gray-600 dark:text-gray-300">Users</th>
                      <th className="p-3 text-left text-gray-600 dark:text-gray-300">Status</th>
                      <th className="p-3 text-left text-gray-600 dark:text-gray-300">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {actionHistory.length > 0 ? (
                      actionHistory.map((action, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="p-3 dark:text-gray-300 truncate">{action.action_type_display}</td>
                          <td className="p-3 dark:text-gray-300 truncate">{action.message_type || 'N/A'}</td>
                          <td className="p-3 dark:text-gray-300">{action.total_users}</td>
                          <td className="p-3">
                            <span className={`flex items-center gap-1 truncate ${
                              action.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                              action.status === 'partial' ? 'text-yellow-600 dark:text-yellow-400' :
                              action.status === 'failed' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'
                            }`}>
                              {action.status === 'completed' && <CheckCircle size={14} />}
                              {action.status === 'partial' && <AlertCircle size={14} />}
                              {action.status === 'failed' && <AlertCircle size={14} />}
                              {action.status === 'pending' && <Clock size={14} />}
                              {action.status_display}
                            </span>
                          </td>
                          <td className="p-3 dark:text-gray-300 whitespace-nowrap">{new Date(action.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-4 text-center text-gray-500 dark:text-gray-400">
                          No bulk actions history found
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Users</p>
              <p className="font-medium text-lg dark:text-white">{stats.total_users}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
              <MessageSquare size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Messages Sent (30 days)</p>
              <p className="font-medium text-lg dark:text-white">{stats.total_messages}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
              <Download size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Last Import</p>
              <p className="font-medium text-lg dark:text-white">{stats.last_import} users</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;