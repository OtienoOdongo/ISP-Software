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
//   X
// } from 'lucide-react';

// const BulkActions = () => {
//   const [activeTab, setActiveTab] = useState('import');
//   const [selectedUsers, setSelectedUsers] = useState([]);
//   const [importFile, setImportFile] = useState(null);
//   const [importResults, setImportResults] = useState(null);
//   const [messageForm, setMessageForm] = useState({
//     message: '',
//     message_type: 'sms'
//   });

//   // Mock user data for demonstration
//   const mockUsers = [
//     { id: 1, name: 'John Doe', phone: '+254712345678', plan: 'Business 10GB', status: 'active' },
//     { id: 2, name: 'Jane Smith', phone: '+254723456789', plan: 'Residential 5GB', status: 'active' },
//     { id: 3, name: 'Mike Johnson', phone: '+254734567890', plan: 'Enterprise 20GB', status: 'expired' },
//     { id: 4, name: 'Sarah Wilson', phone: '+254745678901', plan: 'Business 15GB', status: 'active' },
//     { id: 5, name: 'David Brown', phone: '+254756789012', plan: 'Residential 10GB', status: 'inactive' }
//   ];

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
//     alert(`Message sent to ${selectedUsers.length} users successfully!`);
//     setMessageForm({ message: '', message_type: 'sms' });
//     setSelectedUsers([]);
//   };

//   const toggleUserSelection = (userId) => {
//     if (selectedUsers.includes(userId)) {
//       setSelectedUsers(selectedUsers.filter(id => id !== userId));
//     } else {
//       setSelectedUsers([...selectedUsers, userId]);
//     }
//   };

//   const selectAllUsers = () => {
//     if (selectedUsers.length === mockUsers.length) {
//       setSelectedUsers([]);
//     } else {
//       setSelectedUsers(mockUsers.map(user => user.id));
//     }
//   };

//   return (
//     <div className="p-6 max-w-6xl mx-auto">
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
//         </div>

//         <div className="p-6">
//           {/* Import Users Tab */}
//           {activeTab === 'import' && (
//             <div className="space-y-6">
//               <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
//                 <h3 className="font-medium text-blue-800 mb-2">Import Instructions</h3>
//                 <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
//                   <li>Download the template CSV file to ensure proper formatting</li>
//                   <li>Required fields: Name, Phone Number, Plan, Location</li>
//                   <li>Phone numbers must be in international format (+254...)</li>
//                   <li>Maximum file size: 5MB</li>
//                 </ul>
//               </div>

//               <div className="flex gap-4">
//                 <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
//                   <Download size={16} />
//                   Download Template
//                 </button>

//                 <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer">
//                   <Upload size={16} />
//                   Upload CSV
//                   <input
//                     type="file"
//                     accept=".csv"
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

//                       <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
//                         <Download size={16} />
//                         Download Error Report
//                       </button>
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
                
//                 <div className="mb-4">
//                   <button
//                     onClick={selectAllUsers}
//                     className="text-sm text-blue-500 hover:text-blue-700"
//                   >
//                     {selectedUsers.length === mockUsers.length ? 'Deselect All' : 'Select All'}
//                   </button>
//                   <span className="text-sm text-gray-600 ml-2">
//                     {selectedUsers.length} of {mockUsers.length} selected
//                   </span>
//                 </div>

//                 <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
//                   {mockUsers.map(user => (
//                     <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-white rounded">
//                       <input
//                         type="checkbox"
//                         checked={selectedUsers.includes(user.id)}
//                         onChange={() => toggleUserSelection(user.id)}
//                         className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
//                       />
//                       <div className="flex-1">
//                         <div className="font-medium">{user.name}</div>
//                         <div className="text-sm text-gray-500">{user.phone} • {user.plan}</div>
//                       </div>
//                       <span className={`px-2 py-1 rounded-full text-xs ${
//                         user.status === 'active' ? 'bg-green-100 text-green-700' :
//                         user.status === 'expired' ? 'bg-yellow-100 text-yellow-700' :
//                         'bg-red-100 text-red-700'
//                       }`}>
//                         {user.status}
//                       </span>
//                     </label>
//                   ))}
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
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm text-gray-600 mb-1">Message</label>
//                   <textarea
//                     rows={4}
//                     value={messageForm.message}
//                     onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
//                     className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                     placeholder="Type your message here..."
//                   />
//                 </div>

//                 <div className="mt-3 text-sm text-gray-600">
//                   <p>Estimated cost: {selectedUsers.length * 1} SMS credits</p>
//                   <p>Character count: {messageForm.message.length}/160</p>
//                 </div>

//                 <button
//                   onClick={handleSendBulkMessage}
//                   disabled={selectedUsers.length === 0 || !messageForm.message.trim()}
//                   className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <Send size={16} />
//                   Send to {selectedUsers.length} Users
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Recent Bulk Actions */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//         <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
//           <Users className="text-blue-500" size={20} />
//           Recent Bulk Actions
//         </h2>

//         <div className="overflow-x-auto">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="p-3 text-left">Action</th>
//                 <th className="p-3 text-left">Type</th>
//                 <th className="p-3 text-left">Users</th>
//                 <th className="p-3 text-left">Status</th>
//                 <th className="p-3 text-left">Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr className="border-b hover:bg-gray-50">
//                 <td className="p-3">Bulk Message</td>
//                 <td className="p-3">SMS</td>
//                 <td className="p-3">25 users</td>
//                 <td className="p-3">
//                   <span className="flex items-center gap-1 text-green-600">
//                     <CheckCircle size={14} />
//                     Completed
//                   </span>
//                 </td>
//                 <td className="p-3">2 hours ago</td>
//               </tr>
//               <tr className="border-b hover:bg-gray-50">
//                 <td className="p-3">User Import</td>
//                 <td className="p-3">CSV</td>
//                 <td className="p-3">15 users</td>
//                 <td className="p-3">
//                   <span className="flex items-center gap-1 text-yellow-600">
//                     <AlertCircle size={14} />
//                     Partial (3 failed)
//                   </span>
//                 </td>
//                 <td className="p-3">1 day ago</td>
//               </tr>
//               <tr className="border-b hover:bg-gray-50">
//                 <td className="p-3">Bulk Message</td>
//                 <td className="p-3">Email</td>
//                 <td className="p-3">42 users</td>
//                 <td className="p-3">
//                   <span className="flex items-center gap-1 text-blue-600">
//                     <AlertCircle size={14} />
//                     In Progress
//                   </span>
//                 </td>
//                 <td className="p-3">3 days ago</td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BulkActions;





// src/pages/BulkActions.js
import React, { useState } from 'react';
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
  Phone
} from 'lucide-react';

const BulkActions = () => {
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
  const [savedTemplates, setSavedTemplates] = useState([
    { id: 1, name: 'Plan Renewal Reminder', message: 'Your {plan_name} is about to expire. Renew now to avoid service interruption.' },
    { id: 2, name: 'Welcome Message', message: 'Welcome! Thank you for choosing our {plan_name}. Enjoy your internet experience.' },
    { id: 3, name: 'Payment Received', message: 'We have received your payment for {plan_name}. Your service is now active.' }
  ]);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [bulkActionType, setBulkActionType] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');

  // Mock user data for demonstration - updated to match your client model
  const mockUsers = [
    { id: 1, username: 'client_a1b2c3', phone: '+254712345678', plan: 'Business 10GB', status: 'active', location: 'Nairobi' },
    { id: 2, username: 'client_d4e5f6', phone: '+254723456789', plan: 'Residential 5GB', status: 'active', location: 'Mombasa' },
    { id: 3, username: 'client_g7h8i9', phone: '+254734567890', plan: 'Enterprise 20GB', status: 'expired', location: 'Kisumu' },
    { id: 4, username: 'client_j1k2l3', phone: '+254745678901', plan: 'Business 15GB', status: 'active', location: 'Nakuru' },
    { id: 5, username: 'client_m4n5o6', phone: '+254756789012', plan: 'Residential 10GB', status: 'inactive', location: 'Eldoret' },
    { id: 6, username: 'client_p7q8r9', phone: '+254767890123', plan: 'Business 10GB', status: 'active', location: 'Nairobi' },
    { id: 7, username: 'client_s1t2u3', phone: '+254778901234', plan: 'Enterprise 50GB', status: 'active', location: 'Mombasa' },
    { id: 8, username: 'client_v4w5x6', phone: '+254789012345', plan: 'Residential 5GB', status: 'expired', location: 'Kisumu' }
  ];

  // Available plans for bulk operations
  const availablePlans = [
    'Business 10GB', 'Business 15GB', 'Residential 5GB', 
    'Residential 10GB', 'Enterprise 20GB', 'Enterprise 50GB'
  ];

  // Filter users based on search and filters
  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm) ||
                         user.plan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesPlan = planFilter === 'all' || user.plan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImportFile(file);
      // Simulate file processing
      setTimeout(() => {
        setImportResults({
          total: 15,
          success: 12,
          failed: 3,
          errors: [
            { row: 3, error: 'Invalid phone number format' },
            { row: 7, error: 'Duplicate phone number' },
            { row: 12, error: 'Missing required fields' }
          ]
        });
      }, 2000);
    }
  };

  const handleSendBulkMessage = () => {
    if (!messageForm.message.trim()) {
      alert('Please enter a message');
      return;
    }

    if (selectedUsers.length === 0) {
      alert('Please select at least one user');
      return;
    }

    // Simulate sending
    alert(`Message ${scheduleDate && scheduleTime ? 'scheduled' : 'sent'} to ${selectedUsers.length} users successfully!`);
    setMessageForm({ message: '', message_type: 'sms', subject: '' });
    setSelectedUsers([]);
    setScheduleDate('');
    setScheduleTime('');
    setShowSchedule(false);
  };

  const handleBulkUserAction = () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user');
      return;
    }

    if (bulkActionType === 'change_plan' && !selectedPlan) {
      alert('Please select a plan');
      return;
    }

    // Simulate bulk action
    let actionMessage = '';
    switch (bulkActionType) {
      case 'activate':
        actionMessage = `Activated ${selectedUsers.length} users`;
        break;
      case 'deactivate':
        actionMessage = `Deactivated ${selectedUsers.length} users`;
        break;
      case 'change_plan':
        actionMessage = `Changed plan to ${selectedPlan} for ${selectedUsers.length} users`;
        break;
      case 'delete':
        actionMessage = `Deleted ${selectedUsers.length} users`;
        break;
      default:
        return;
    }

    alert(actionMessage);
    setSelectedUsers([]);
    setBulkActionType('');
    setSelectedPlan('');
  };

  const toggleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const applyTemplate = (template) => {
    setMessageForm({ ...messageForm, message: template.message });
    setShowTemplates(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'expired': return 'bg-yellow-100 text-yellow-700';
      case 'inactive': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Bulk Actions</h1>
        <p className="text-gray-600">Perform actions on multiple users at once</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="flex border-b border-gray-100">
          <button
            className={`px-6 py-3 font-medium text-sm ${activeTab === 'import' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('import')}
          >
            Import Users
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm ${activeTab === 'message' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('message')}
          >
            Bulk Message
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm ${activeTab === 'manage' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('manage')}
          >
            Manage Users
          </button>
        </div>

        <div className="p-6">
          {/* Import Users Tab */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-medium text-blue-800 mb-2">Import Instructions</h3>
                <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                  <li>Download the template CSV file to ensure proper formatting</li>
                  <li>Required field: Phone Number (must include country code)</li>
                  <li>Optional fields: Plan, Location</li>
                  <li>Phone numbers must be in international format (+254...)</li>
                  <li>Maximum file size: 5MB</li>
                  <li>Supported formats: CSV, XLSX</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                  <Download size={16} />
                  Download Template
                </button>

                <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer">
                  <Upload size={16} />
                  Upload File
                  <input
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {importFile && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="text-blue-500" size={18} />
                      <span className="font-medium">{importFile.name}</span>
                      <span className="text-xs text-gray-500">({(importFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button
                      onClick={() => {
                        setImportFile(null);
                        setImportResults(null);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {importResults ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{importResults.success}</div>
                          <div className="text-sm text-gray-600">Successful</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{importResults.failed}</div>
                          <div className="text-sm text-gray-600">Failed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{importResults.total}</div>
                          <div className="text-sm text-gray-600">Total</div>
                        </div>
                      </div>

                      {importResults.failed > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Errors:</h4>
                          <div className="space-y-1">
                            {importResults.errors.map((error, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm text-red-600">
                                <AlertCircle size={14} />
                                <span>Row {error.row}: {error.error}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                          <Download size={16} />
                          Download Error Report
                        </button>
                        
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                          <UserCheck size={16} />
                          View Imported Users
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Processing file...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Bulk Message Tab */}
          {activeTab === 'message' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="font-medium text-gray-700 mb-3">Select Users</h3>
                
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search users by username, phone, or plan..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
                    />
                  </div>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  
                  <select
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                      className="text-sm text-blue-500 hover:text-blue-700"
                    >
                      {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <span className="text-sm text-gray-600 ml-2">
                      {selectedUsers.length} of {filteredUsers.length} selected
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {filteredUsers.length} users found
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                  {filteredUsers.map(user => (
                    <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-white rounded">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <Phone size={14} />
                          {user.phone} • {user.plan} • {user.location}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </label>
                  ))}
                  
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <UserX size={20} className="mx-auto mb-1" />
                      <p>No users found</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="font-medium text-gray-700 mb-3">Compose Message</h3>
                
                <div className="mb-3">
                  <label className="block text-sm text-gray-600 mb-1">Message Type</label>
                  <select
                    value={messageForm.message_type}
                    onChange={(e) => setMessageForm({ ...messageForm, message_type: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sms">SMS</option>
                    <option value="email">Email</option>
                    <option value="push">Push Notification</option>
                  </select>
                </div>

                {messageForm.message_type === 'email' && (
                  <div className="mb-3">
                    <label className="block text-sm text-gray-600 mb-1">Subject</label>
                    <input
                      type="text"
                      value={messageForm.subject}
                      onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Email subject"
                    />
                  </div>
                )}

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm text-gray-600">Message</label>
                    <button
                      type="button"
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1"
                    >
                      {showTemplates ? 'Hide Templates' : 'Load Template'}
                      {showTemplates ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                  
                  {showTemplates && (
                    <div className="mb-3 bg-white p-3 rounded border">
                      <h4 className="font-medium text-gray-700 mb-2">Saved Templates</h4>
                      <div className="space-y-2">
                        {savedTemplates.map(template => (
                          <div key={template.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                            <div>
                              <div className="font-medium">{template.name}</div>
                              <div className="text-sm text-gray-500 truncate">{template.message}</div>
                            </div>
                            <button
                              onClick={() => applyTemplate(template)}
                              className="text-blue-500 hover:text-blue-700 text-sm"
                            >
                              Apply
                            </button>
                          </div>
                        ))}
                      </div>
                      <button className="mt-2 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700">
                        <Plus size={14} />
                        Create New Template
                      </button>
                    </div>
                  )}
                  
                  <textarea
                    rows={4}
                    value={messageForm.message}
                    onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your message here..."
                  />
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
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
                    className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                    disabled={messageForm.message_type !== 'sms'}
                  >
                    <Clock size={14} />
                    {showSchedule ? 'Hide Schedule' : 'Schedule Message'}
                  </button>
                </div>
                
                {showSchedule && (
                  <div className="mb-3 bg-white p-3 rounded border">
                    <h4 className="font-medium text-gray-700 mb-2">Schedule Message</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Date</label>
                        <input
                          type="date"
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Time</label>
                        <input
                          type="time"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSendBulkMessage}
                  disabled={selectedUsers.length === 0 || !messageForm.message.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {scheduleDate && scheduleTime ? <Clock size={16} /> : <Send size={16} />}
                  {scheduleDate && scheduleTime ? 'Schedule Message' : 'Send Message'} to {selectedUsers.length} Users
                </button>
              </div>
            </div>
          )}

          {/* Manage Users Tab */}
          {activeTab === 'manage' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-medium text-blue-800 mb-2">Bulk User Management</h3>
                <p className="text-sm text-blue-700">Perform actions on multiple users simultaneously</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <UserCheck size={20} />
                  </div>
                  <h3 className="font-medium text-gray-800 mb-1">Activate Users</h3>
                  <p className="text-sm text-gray-500">Enable service for selected users</p>
                  <button 
                    className="mt-3 px-4 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                    onClick={() => {
                      setBulkActionType('activate');
                      document.getElementById('manageUsersSection').scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Select Users
                  </button>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
                  <div className="bg-amber-100 text-amber-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <UserX size={20} />
                  </div>
                  <h3 className="font-medium text-gray-800 mb-1">Deactivate Users</h3>
                  <p className="text-sm text-gray-500">Disable service for selected users</p>
                  <button 
                    className="mt-3 px-4 py-1 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600"
                    onClick={() => {
                      setBulkActionType('deactivate');
                      document.getElementById('manageUsersSection').scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Select Users
                  </button>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
                  <div className="bg-purple-100 text-purple-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <Edit3 size={20} />
                  </div>
                  <h3 className="font-medium text-gray-800 mb-1">Change Plan</h3>
                  <p className="text-sm text-gray-500">Update plan for selected users</p>
                  <button 
                    className="mt-3 px-4 py-1 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600"
                    onClick={() => {
                      setBulkActionType('change_plan');
                      document.getElementById('manageUsersSection').scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Select Users
                  </button>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
                  <div className="bg-red-100 text-red-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <Trash2 size={20} />
                  </div>
                  <h3 className="font-medium text-gray-800 mb-1">Delete Users</h3>
                  <p className="text-sm text-gray-500">Remove selected users from system</p>
                  <button 
                    className="mt-3 px-4 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                    onClick={() => {
                      setBulkActionType('delete');
                      document.getElementById('manageUsersSection').scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Select Users
                  </button>
                </div>
              </div>

              <div id="manageUsersSection" className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="font-medium text-gray-700 mb-3">Select Users</h3>
                
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search users by username, phone, or plan..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
                    />
                  </div>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  
                  <select
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                      className="text-sm text-blue-500 hover:text-blue-700"
                    >
                      {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <span className="text-sm text-gray-600 ml-2">
                      {selectedUsers.length} of {filteredUsers.length} selected
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {filteredUsers.length} users found
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                  {filteredUsers.map(user => (
                    <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-white rounded">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <Phone size={14} />
                          {user.phone} • {user.plan} • {user.location}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </label>
                  ))}
                  
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <UserX size={20} className="mx-auto mb-1" />
                      <p>No users found</p>
                    </div>
                  )}
                </div>

                {(bulkActionType) && (
                  <div className="mt-4 bg-white p-4 rounded-lg border border-gray-100">
                    <h3 className="font-medium text-gray-700 mb-3">Selected Action: {
                      bulkActionType === 'activate' ? 'Activate Users' :
                      bulkActionType === 'deactivate' ? 'Deactivate Users' :
                      bulkActionType === 'change_plan' ? 'Change Plan' : 'Delete Users'
                    }</h3>
                    
                    {bulkActionType === 'change_plan' && (
                      <div className="mb-4">
                        <label className="block text-sm text-gray-600 mb-1">Select Plan</label>
                        <select
                          value={selectedPlan}
                          onChange={(e) => setSelectedPlan(e.target.value)}
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                      disabled={selectedUsers.length === 0 || (bulkActionType === 'change_plan' && !selectedPlan)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bulkActionType === 'activate' && <UserCheck size={16} />}
                      {bulkActionType === 'deactivate' && <UserX size={16} />}
                      {bulkActionType === 'change_plan' && <Edit3 size={16} />}
                      {bulkActionType === 'delete' && <Trash2 size={16} />}
                      Apply to {selectedUsers.length} Users
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-medium text-gray-700 mb-3">Recent Bulk Actions</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-3 text-left">Action</th>
                        <th className="p-3 text-left">Type</th>
                        <th className="p-3 text-left">Users</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="p-3">Bulk Message</td>
                        <td className="p-3">SMS</td>
                        <td className="p-3">25 users</td>
                        <td className="p-3">
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle size={14} />
                            Completed
                          </span>
                        </td>
                        <td className="p-3">2 hours ago</td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="p-3">User Import</td>
                        <td className="p-3">CSV</td>
                        <td className="p-3">15 users</td>
                        <td className="p-3">
                          <span className="flex items-center gap-1 text-yellow-600">
                            <AlertCircle size={14} />
                            Partial (3 failed)
                          </span>
                        </td>
                        <td className="p-3">1 day ago</td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="p-3">Bulk Message</td>
                        <td className="p-3">Email</td>
                        <td className="p-3">42 users</td>
                        <td className="p-3">
                          <span className="flex items-center gap-1 text-blue-600">
                            <AlertCircle size={14} />
                            In Progress
                          </span>
                        </td>
                        <td className="p-3">3 days ago</td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="p-3">Plan Change</td>
                        <td className="p-3">Bulk Update</td>
                        <td className="p-3">18 users</td>
                        <td className="p-3">
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle size={14} />
                            Completed
                          </span>
                        </td>
                        <td className="p-3">5 days ago</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Users</p>
              <p className="font-medium text-lg">1,247</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <MessageSquare size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Messages Sent (30 days)</p>
              <p className="font-medium text-lg">2,458</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
              <Download size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Last Import</p>
              <p className="font-medium text-lg">15 users</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;