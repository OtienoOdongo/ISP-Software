


// import React, { useState } from 'react';
// import {
//   FiEdit,
//   FiSend,
//   FiCreditCard,
//   FiMessageSquare,
//   FiUserPlus,
//   FiStar,
//   FiRefreshCw,
//   FiDownload,
//   FiLock,
//   FiTrash2,
//   FiArchive,
//   FiCheck,
//   FiX
// } from 'react-icons/fi';
// import { FaSpinner } from 'react-icons/fa';
// import Modal from '../ClientManagement/UI/Modal'
// import { formatCurrency, formatDate } from '../../utils/formatters';
// import ClientService from '../ClientManagement/services/ClientService'

// const ClientActions = ({ client, onUpdate, onRefresh, theme, onDelete }) => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [showSendMessageModal, setShowSendMessageModal] = useState(false);
//   const [showUpdateTierModal, setShowUpdateTierModal] = useState(false);
//   const [showResendCredentialsModal, setShowResendCredentialsModal] = useState(false);
//   const [actionMessage, setActionMessage] = useState('');
//   const [actionError, setActionError] = useState('');
//   const [messageContent, setMessageContent] = useState('');
//   const [selectedTier, setSelectedTier] = useState(client.tier || 'bronze');
//   const [tierReason, setTierReason] = useState('');

//   const themeClasses = {
//     button: {
//       primary: theme === 'dark'
//         ? 'bg-blue-600 hover:bg-blue-700 text-white'
//         : 'bg-blue-500 hover:bg-blue-600 text-white',
//       secondary: theme === 'dark'
//         ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
//         : 'bg-gray-200 hover:bg-gray-300 text-gray-800',
//       success: theme === 'dark'
//         ? 'bg-green-600 hover:bg-green-700 text-white'
//         : 'bg-green-500 hover:bg-green-600 text-white',
//       danger: theme === 'dark'
//         ? 'bg-red-600 hover:bg-red-700 text-white'
//         : 'bg-red-500 hover:bg-red-600 text-white'
//     }
//   };

//   // Update client tier
//   const handleUpdateTier = async () => {
//     try {
//       setIsLoading(true);
//       setActionError('');
      
//       await ClientService.updateClientTier(client.id, {
//         tier: selectedTier,
//         reason: tierReason,
//         send_notification: true
//       });
      
//       setActionMessage(`Tier updated to ${selectedTier} successfully`);
//       setShowUpdateTierModal(false);
      
//       // Refresh client data
//       const updated = await ClientService.getClientById(client.id);
//       onUpdate(updated.data);
//       onRefresh();
      
//     } catch (error) {
//       setActionError(error.response?.data?.error || 'Failed to update tier');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Resend PPPoE credentials
//   const handleResendCredentials = async () => {
//     try {
//       setIsLoading(true);
//       setActionError('');
      
//       // Using updateClientTier for now - need to create proper endpoint
//       await ClientService.updateClientTier(client.id, {
//         action: 'resend_credentials',
//         send_notification: true
//       });
      
//       setActionMessage('Credentials resent successfully');
//       setShowResendCredentialsModal(false);
      
//     } catch (error) {
//       setActionError(error.response?.data?.error || 'Failed to resend credentials');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Send SMS message
//   const handleSendMessage = async () => {
//     try {
//       setIsLoading(true);
//       setActionError('');
      
//       // This would integrate with SMS service
//       // For now, simulate API call
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       setActionMessage('Message sent successfully');
//       setShowSendMessageModal(false);
//       setMessageContent('');
      
//     } catch (error) {
//       setActionError('Failed to send message');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Update client status
//   const handleUpdateStatus = async (newStatus) => {
//     try {
//       setIsLoading(true);
//       setActionError('');
      
//       // This would call the appropriate API endpoint
//       await ClientService.updateClientTier(client.id, {
//         action: 'update_status',
//         status: newStatus
//       });
      
//       setActionMessage(`Status updated to ${newStatus} successfully`);
      
//       // Refresh client data
//       const updated = await ClientService.getClientById(client.id);
//       onUpdate(updated.data);
//       onRefresh();
      
//     } catch (error) {
//       setActionError('Failed to update status');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Export client data
//   const handleExportData = async () => {
//     try {
//       setIsLoading(true);
      
//       // Generate export data
//       const exportData = {
//         client: {
//           ...client,
//           // Remove sensitive data
//           pppoe_password: undefined,
//           password: undefined
//         },
//         export_date: new Date().toISOString(),
//         exported_by: 'system'
//       };
      
//       // Create download
//       const dataStr = JSON.stringify(exportData, null, 2);
//       const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
//       const exportFileDefaultName = `client_${client.username}_${new Date().toISOString().split('T')[0]}.json`;
      
//       const linkElement = document.createElement('a');
//       linkElement.setAttribute('href', dataUri);
//       linkElement.setAttribute('download', exportFileDefaultName);
//       document.body.appendChild(linkElement);
//       linkElement.click();
//       linkElement.remove();
      
//       setActionMessage('Data exported successfully');
      
//     } catch (error) {
//       setActionError('Failed to export data');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Delete client
//   const handleDeleteClient = async () => {
//     if (window.confirm(`Are you sure you want to delete ${client.username}? This action cannot be undone.`)) {
//       try {
//         setIsLoading(true);
//         // Call parent delete handler
//         await onDelete(client.id);
//       } catch (error) {
//         setActionError('Failed to delete client');
//       } finally {
//         setIsLoading(false);
//       }
//     }
//   };

//   // Clear messages
//   const clearMessages = () => {
//     setActionMessage('');
//     setActionError('');
//   };

//   // Get tier options
//   const tierOptions = [
//     { value: 'new', label: 'New Client' },
//     { value: 'bronze', label: 'Bronze' },
//     { value: 'silver', label: 'Silver' },
//     { value: 'gold', label: 'Gold' },
//     { value: 'platinum', label: 'Platinum' },
//     { value: 'diamond', label: 'Diamond' },
//     { value: 'vip', label: 'VIP' }
//   ];

//   return (
//     <>
//       <div className="flex flex-wrap gap-2">
//         {/* Primary Actions */}
//         <button
//           onClick={() => setShowSendMessageModal(true)}
//           disabled={isLoading}
//           className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${themeClasses.button.primary}`}
//         >
//           <FiSend size={14} />
//           <span className="hidden sm:inline">Message</span>
//         </button>
        
//         <button
//           onClick={() => setShowUpdateTierModal(true)}
//           disabled={isLoading}
//           className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${themeClasses.button.secondary}`}
//         >
//           <FiStar size={14} />
//           <span className="hidden sm:inline">Update Tier</span>
//         </button>
        
//         {client.is_pppoe_client && (
//           <button
//             onClick={() => setShowResendCredentialsModal(true)}
//             disabled={isLoading}
//             className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${themeClasses.button.success}`}
//           >
//             <FiLock size={14} />
//             <span className="hidden sm:inline">Resend Credentials</span>
//           </button>
//         )}
        
//         {/* More Actions Dropdown */}
//         <div className="relative group">
//           <button
//             disabled={isLoading}
//             className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${themeClasses.button.secondary}`}
//           >
//             <FiEdit size={14} />
//             <span className="hidden sm:inline">More</span>
//           </button>
          
//           <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${
//             theme === 'dark' 
//               ? 'bg-gray-800 border border-gray-700' 
//               : 'bg-white border border-gray-200'
//           }`}>
//             <div className="py-1">
//               <button
//                 onClick={handleExportData}
//                 disabled={isLoading}
//                 className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 dark:hover:bg-gray-700 flex items-center gap-2 ${
//                   theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
//                 }`}
//               >
//                 <FiDownload size={14} />
//                 Export Data
//               </button>
              
//               {client.status === 'active' && (
//                 <button
//                   onClick={() => handleUpdateStatus('suspended')}
//                   disabled={isLoading}
//                   className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 dark:hover:bg-gray-700 flex items-center gap-2 ${
//                     theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
//                   }`}
//                 >
//                   <FiArchive size={14} />
//                   Suspend Account
//                 </button>
//               )}
              
//               {client.status === 'suspended' && (
//                 <button
//                   onClick={() => handleUpdateStatus('active')}
//                   disabled={isLoading}
//                   className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 dark:hover:bg-gray-700 flex items-center gap-2 ${
//                     theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
//                   }`}
//                 >
//                   <FiCheck size={14} />
//                   Activate Account
//                 </button>
//               )}
              
//               <button
//                 onClick={handleDeleteClient}
//                 disabled={isLoading}
//                 className={`w-full text-left px-4 py-2 text-sm hover:bg-red-700 hover:text-white flex items-center gap-2 ${
//                   theme === 'dark' ? 'text-red-400' : 'text-red-600'
//                 }`}
//               >
//                 <FiTrash2 size={14} />
//                 Delete Client
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Action Messages */}
//       {(actionMessage || actionError) && (
//         <div className="mt-2">
//           {actionMessage && (
//             <div className={`p-2 rounded text-sm flex items-center justify-between ${
//               theme === 'dark' 
//                 ? 'bg-green-900/30 text-green-300' 
//                 : 'bg-green-100 text-green-700'
//             }`}>
//               <span>{actionMessage}</span>
//               <button 
//                 onClick={clearMessages}
//                 className="ml-2"
//               >
//                 <FiX size={14} />
//               </button>
//             </div>
//           )}
          
//           {actionError && (
//             <div className={`p-2 rounded text-sm flex items-center justify-between ${
//               theme === 'dark' 
//                 ? 'bg-red-900/30 text-red-300' 
//                 : 'bg-red-100 text-red-700'
//             }`}>
//               <span>{actionError}</span>
//               <button 
//                 onClick={clearMessages}
//                 className="ml-2"
//               >
//                 <FiX size={14} />
//               </button>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Send Message Modal */}
//       <Modal
//         isOpen={showSendMessageModal}
//         onClose={() => {
//           setShowSendMessageModal(false);
//           setMessageContent('');
//         }}
//         title="Send Message"
//         theme={theme}
//       >
//         <div className="space-y-4">
//           <div>
//             <label className={`block text-sm font-medium mb-2 ${
//               theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
//             }`}>
//               Message to {client.username}
//             </label>
//             <textarea
//               value={messageContent}
//               onChange={(e) => setMessageContent(e.target.value)}
//               className={`w-full px-3 py-2 rounded-lg border ${
//                 theme === 'dark'
//                   ? 'bg-gray-700 border-gray-600 text-white'
//                   : 'bg-white border-gray-300 text-gray-900'
//               }`}
//               rows="4"
//               placeholder="Type your message here..."
//               disabled={isLoading}
//             />
//           </div>
//           <div className="flex justify-end gap-2">
//             <button
//               onClick={() => {
//                 setShowSendMessageModal(false);
//                 setMessageContent('');
//               }}
//               disabled={isLoading}
//               className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.secondary}`}
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSendMessage}
//               disabled={isLoading || !messageContent.trim()}
//               className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.primary}`}
//             >
//               {isLoading ? (
//                 <FaSpinner className="animate-spin inline mr-2" />
//               ) : (
//                 <FiSend className="inline mr-2" />
//               )}
//               Send Message
//             </button>
//           </div>
//         </div>
//       </Modal>

//       {/* Update Tier Modal */}
//       <Modal
//         isOpen={showUpdateTierModal}
//         onClose={() => {
//           setShowUpdateTierModal(false);
//           setSelectedTier(client.tier || 'bronze');
//           setTierReason('');
//         }}
//         title="Update Client Tier"
//         theme={theme}
//       >
//         <div className="space-y-4">
//           <div>
//             <label className={`block text-sm font-medium mb-2 ${
//               theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
//             }`}>
//               Select New Tier
//             </label>
//             <select
//               value={selectedTier}
//               onChange={(e) => setSelectedTier(e.target.value)}
//               className={`w-full px-3 py-2 rounded-lg border ${
//                 theme === 'dark'
//                   ? 'bg-gray-700 border-gray-600 text-white'
//                   : 'bg-white border-gray-300 text-gray-900'
//               }`}
//               disabled={isLoading}
//             >
//               {tierOptions.map(option => (
//                 <option key={option.value} value={option.value}>
//                   {option.label}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className={`block text-sm font-medium mb-2 ${
//               theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
//             }`}>
//               Reason (Optional)
//             </label>
//             <textarea
//               value={tierReason}
//               onChange={(e) => setTierReason(e.target.value)}
//               className={`w-full px-3 py-2 rounded-lg border ${
//                 theme === 'dark'
//                   ? 'bg-gray-700 border-gray-600 text-white'
//                   : 'bg-white border-gray-300 text-gray-900'
//               }`}
//               rows="2"
//               placeholder="Reason for tier change..."
//               disabled={isLoading}
//             />
//           </div>
//           <div className="flex justify-end gap-2">
//             <button
//               onClick={() => {
//                 setShowUpdateTierModal(false);
//                 setSelectedTier(client.tier || 'bronze');
//                 setTierReason('');
//               }}
//               disabled={isLoading}
//               className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.secondary}`}
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleUpdateTier}
//               disabled={isLoading}
//               className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.primary}`}
//             >
//               {isLoading ? (
//                 <FaSpinner className="animate-spin inline mr-2" />
//               ) : (
//                 <FiStar className="inline mr-2" />
//               )}
//               Update Tier
//             </button>
//           </div>
//         </div>
//       </Modal>

//       {/* Resend Credentials Modal */}
//       <Modal
//         isOpen={showResendCredentialsModal}
//         onClose={() => setShowResendCredentialsModal(false)}
//         title="Resend PPPoE Credentials"
//         theme={theme}
//       >
//         <div className="space-y-4">
//           <div className={`p-4 rounded-lg ${
//             theme === 'dark' 
//               ? 'bg-yellow-900/30 text-yellow-300' 
//               : 'bg-yellow-100 text-yellow-700'
//           }`}>
//             <p className="text-sm">
//               This will send an SMS with PPPoE credentials to {client.phone_display}.
//               Are you sure you want to proceed?
//             </p>
//           </div>
          
//           {client.pppoe_username && (
//             <div className={`p-3 rounded-lg ${
//               theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
//             }`}>
//               <p className="text-sm font-medium mb-1">Current Credentials</p>
//               <p className="text-sm">Username: {client.pppoe_username}</p>
//               <p className="text-sm">Password: ••••••••</p>
//             </div>
//           )}
          
//           <div className="flex justify-end gap-2">
//             <button
//               onClick={() => setShowResendCredentialsModal(false)}
//               disabled={isLoading}
//               className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.secondary}`}
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleResendCredentials}
//               disabled={isLoading}
//               className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.success}`}
//             >
//               {isLoading ? (
//                 <FaSpinner className="animate-spin inline mr-2" />
//               ) : (
//                 <FiLock className="inline mr-2" />
//               )}
//               Resend Credentials
//             </button>
//           </div>
//         </div>
//       </Modal>
//     </>
//   );
// };

// export default ClientActions;









// components/ClientManagement/ClientActions.jsx
import React, { useState } from 'react';
import {
  FiEdit,
  FiSend,
  FiCreditCard,
  FiMessageSquare,
  FiUserPlus,
  FiStar,
  FiRefreshCw,
  FiDownload,
  FiLock,
  FiTrash2,
  FiArchive,
  FiCheck,
  FiX
} from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import Modal from '../ClientManagement/UI/Modal'
import { formatCurrency, formatDate } from './utils/formatters';
import ClientService from '../ClientManagement/services/ClientService'
import { getThemeClasses, EnhancedSelect } from '../ServiceManagement/Shared/components' 


const ClientActions = ({ client, onUpdate, onRefresh, theme, onDelete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSendMessageModal, setShowSendMessageModal] = useState(false);
  const [showUpdateTierModal, setShowUpdateTierModal] = useState(false);
  const [showResendCredentialsModal, setShowResendCredentialsModal] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [selectedTier, setSelectedTier] = useState(client.tier || 'bronze');
  const [tierReason, setTierReason] = useState('');

  const themeClasses = getThemeClasses(theme);

  // Tier options
  const tierOptions = [
    { value: 'new', label: 'New Client' },
    { value: 'bronze', label: 'Bronze' },
    { value: 'silver', label: 'Silver' },
    { value: 'gold', label: 'Gold' },
    { value: 'platinum', label: 'Platinum' },
    { value: 'diamond', label: 'Diamond' },
    { value: 'vip', label: 'VIP' }
  ];

  // Update client tier
  const handleUpdateTier = async () => {
    try {
      setIsLoading(true);
      setActionError('');

      const result = await ClientService.updateClientTier(client.id, selectedTier, tierReason, true);
      if (result.success) {
        setActionMessage(`Tier updated to ${selectedTier} successfully`);
        setShowUpdateTierModal(false);
        onUpdate(client.id, { tier: selectedTier });
        onRefresh();
      }
    } catch (error) {
      setActionError(error.response?.data?.error || 'Failed to update tier');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend PPPoE credentials
  const handleResendCredentials = async () => {
    try {
      setIsLoading(true);
      setActionError('');

      const result = await ClientService.resendCredentials(client.id);
      if (result.success) {
        setActionMessage('Credentials resent successfully');
        setShowResendCredentialsModal(false);
      }
    } catch (error) {
      setActionError(error.response?.data?.error || 'Failed to resend credentials');
    } finally {
      setIsLoading(false);
    }
  };

  // Send SMS message
  const handleSendMessage = async () => {
    try {
      setIsLoading(true);
      setActionError('');

      const result = await ClientService.sendClientMessage(client.id, { message: messageContent });
      if (result.success) {
        setActionMessage('Message sent successfully');
        setShowSendMessageModal(false);
        setMessageContent('');
      }
    } catch (error) {
      setActionError(error.response?.data?.error || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  // Update client status
  const handleUpdateStatus = async (newStatus) => {
    try {
      setIsLoading(true);
      setActionError('');

      const result = await ClientService.updateClientStatus(client.id, newStatus);
      if (result.success) {
        setActionMessage(`Status updated to ${newStatus} successfully`);
        onUpdate(client.id, { status: newStatus });
        onRefresh();
      }
    } catch (error) {
      setActionError(error.response?.data?.error || 'Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  // Export client data
  const handleExportData = async () => {
    try {
      setIsLoading(true);
      const format = 'json'; // Or 'csv' based on need
      const result = await ClientService.exportClients({ id: client.id }, format);
      if (result.success) {
        setActionMessage('Data exported successfully');
      }
    } catch (error) {
      setActionError(error.response?.data?.error || 'Failed to export data');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete client
  const handleDeleteClient = async (clientId) => {
    if (window.confirm(`Are you sure you want to delete ${client.username}? This action cannot be undone.`)) {
      try {
        setIsLoading(true);
        const result = await ClientService.deleteClient(clientId);
        if (result.success) {
          onDelete(clientId);
        }
      } catch (error) {
        setActionError(error.response?.data?.error || 'Failed to delete client');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Clear messages
  const clearMessages = () => {
    setActionMessage('');
    setActionError('');
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {/* Primary Actions */}
        <button
          onClick={() => setShowSendMessageModal(true)}
          disabled={isLoading}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${themeClasses.button.primary}`}
        >
          <FiSend size={14} />
          <span className="hidden sm:inline">Message</span>
        </button>
        <button
          onClick={() => setShowUpdateTierModal(true)}
          disabled={isLoading}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${themeClasses.button.secondary}`}
        >
          <FiStar size={14} />
          <span className="hidden sm:inline">Update Tier</span>
        </button>
        {client.is_pppoe_client && (
          <button
            onClick={() => setShowResendCredentialsModal(true)}
            disabled={isLoading}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${themeClasses.button.success}`}
          >
            <FiLock size={14} />
            <span className="hidden sm:inline">Resend Credentials</span>
          </button>
        )}
        {/* More Actions Dropdown */}
        <div className="relative group">
          <button
            disabled={isLoading}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${themeClasses.button.secondary}`}
          >
            <FiEdit size={14} />
            <span className="hidden sm:inline">More</span>
          </button>
          <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${
            theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <div className="py-1">
              <button
                onClick={handleExportData}
                disabled={isLoading}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 dark:hover:bg-gray-700 flex items-center gap-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                <FiDownload size={14} />
                Export Data
              </button>
              {client.status === 'active' && (
                <button
                  onClick={() => handleUpdateStatus('suspended')}
                  disabled={isLoading}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 dark:hover:bg-gray-700 flex items-center gap-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  <FiArchive size={14} />
                  Suspend Account
                </button>
              )}
              {client.status === 'suspended' && (
                <button
                  onClick={() => handleUpdateStatus('active')}
                  disabled={isLoading}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 dark:hover:bg-gray-700 flex items-center gap-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  <FiCheck size={14} />
                  Activate Account
                </button>
              )}
              <button
                onClick={() => handleDeleteClient(client.id)}
                disabled={isLoading}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-red-700 hover:text-white flex items-center gap-2 ${
                  theme === 'dark' ? 'text-red-400' : 'text-red-600'
                }`}
              >
                <FiTrash2 size={14} />
                Delete Client
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Action Messages */}
      {(actionMessage || actionError) && (
        <div className="mt-2">
          {actionMessage && (
            <div className={`p-2 rounded text-sm flex items-center justify-between ${themeClasses.bg.success}`}>
              <span>{actionMessage}</span>
              <button onClick={clearMessages} className="ml-2">
                <FiX size={14} />
              </button>
            </div>
          )}
          {actionError && (
            <div className={`p-2 rounded text-sm flex items-center justify-between ${themeClasses.bg.danger}`}>
              <span>{actionError}</span>
              <button onClick={clearMessages} className="ml-2">
                <FiX size={14} />
              </button>
            </div>
          )}
        </div>
      )}
      {/* Send Message Modal */}
      <Modal
        isOpen={showSendMessageModal}
        onClose={() => {
          setShowSendMessageModal(false);
          setMessageContent('');
        }}
        title="Send Message"
        theme={theme}
      >
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
              Message to {client.username}
            </label>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
              rows="4"
              placeholder="Type your message here..."
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowSendMessageModal(false);
                setMessageContent('');
              }}
              disabled={isLoading}
              className={`${themeClasses.button.secondary} px-4 py-2 rounded-lg font-medium`}
            >
              Cancel
            </button>
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !messageContent.trim()}
              className={`${themeClasses.button.primary} px-4 py-2 rounded-lg font-medium`}
            >
              {isLoading ? (
                <FaSpinner className="animate-spin inline mr-2" />
              ) : (
                <FiSend className="inline mr-2" />
              )}
              Send Message
            </button>
          </div>
        </div>
      </Modal>
      {/* Update Tier Modal */}
      <Modal
        isOpen={showUpdateTierModal}
        onClose={() => {
          setShowUpdateTierModal(false);
          setSelectedTier(client.tier || 'bronze');
          setTierReason('');
        }}
        title="Update Client Tier"
        theme={theme}
      >
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
              Select New Tier
            </label>
            <EnhancedSelect
              value={selectedTier}
              onChange={(value) => setSelectedTier(value)}
              options={tierOptions}
              theme={theme}
              disabled={isLoading}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
              Reason (Optional)
            </label>
            <textarea
              value={tierReason}
              onChange={(e) => setTierReason(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
              rows="2"
              placeholder="Reason for tier change..."
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowUpdateTierModal(false);
                setSelectedTier(client.tier || 'bronze');
                setTierReason('');
              }}
              disabled={isLoading}
              className={`${themeClasses.button.secondary} px-4 py-2 rounded-lg font-medium`}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateTier}
              disabled={isLoading}
              className={`${themeClasses.button.primary} px-4 py-2 rounded-lg font-medium`}
            >
              {isLoading ? (
                <FaSpinner className="animate-spin inline mr-2" />
              ) : (
                <FiStar className="inline mr-2" />
              )}
              Update Tier
            </button>
          </div>
        </div>
      </Modal>
      {/* Resend Credentials Modal */}
      <Modal
        isOpen={showResendCredentialsModal}
        onClose={() => setShowResendCredentialsModal(false)}
        title="Resend PPPoE Credentials"
        theme={theme}
      >
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${themeClasses.bg.warning}`}>
            <p className="text-sm">
              This will send an SMS with PPPoE credentials to {client.phone_display}.
              Are you sure you want to proceed?
            </p>
          </div>
          {client.pppoe_username && (
            <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
              <p className="text-sm font-medium mb-1">Current Credentials</p>
              <p className="text-sm">Username: {client.pppoe_username}</p>
              <p className="text-sm">Password: ••••••••</p>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowResendCredentialsModal(false)}
              disabled={isLoading}
              className={`${themeClasses.button.secondary} px-4 py-2 rounded-lg font-medium`}
            >
              Cancel
            </button>
            <button
              onClick={handleResendCredentials}
              disabled={isLoading}
              className={`${themeClasses.button.success} px-4 py-2 rounded-lg font-medium`}
            >
              {isLoading ? (
                <FaSpinner className="animate-spin inline mr-2" />
              ) : (
                <FiLock className="inline mr-2" />
              )}
              Resend Credentials
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ClientActions;