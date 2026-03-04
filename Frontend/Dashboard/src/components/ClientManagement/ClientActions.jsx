


// import React, { useState } from 'react';
// import {
//   Send, Star, Lock, Edit, Download, Archive,
//   Check, X, Trash2, MoreVertical, RefreshCw
// } from 'lucide-react';
// import { FaSpinner } from 'react-icons/fa';
// import Modal from './UI/Modal'
// import { EnhancedSelect, getThemeClasses } from '../ServiceManagement/Shared/components'
// import ClientAPI from './constants/client'
// import { CLIENT_TIERS, CLIENT_STATUS } from './constants/clientConstants';

// const ClientActions = ({ client, onUpdate, onRefresh, onDelete, theme }) => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [showActions, setShowActions] = useState(false);
//   const [showSendMessageModal, setShowSendMessageModal] = useState(false);
//   const [showUpdateTierModal, setShowUpdateTierModal] = useState(false);
//   const [showResendCredentialsModal, setShowResendCredentialsModal] = useState(false);
//   const [showStatusModal, setShowStatusModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [actionMessage, setActionMessage] = useState('');
//   const [actionError, setActionError] = useState('');
//   const [messageContent, setMessageContent] = useState('');
//   const [selectedTier, setSelectedTier] = useState(client.tier || 'new');
//   const [selectedStatus, setSelectedStatus] = useState(client.status || 'active');
//   const [tierReason, setTierReason] = useState('');
//   const [statusReason, setStatusReason] = useState('');

//   const themeClasses = getThemeClasses(theme);

//   // Tier options for EnhancedSelect
//   const tierOptions = Object.entries(CLIENT_TIERS).map(([value, label]) => ({
//     value,
//     label
//   }));

//   // Status options for EnhancedSelect
//   const statusOptions = Object.entries(CLIENT_STATUS).map(([value, label]) => ({
//     value,
//     label
//   }));

//   // Update client tier
//   const handleUpdateTier = async () => {
//     try {
//       setIsLoading(true);
//       setActionError('');

//       const result = await ClientAPI.updateClientTier(
//         client.id,
//         selectedTier,
//         tierReason,
//         true
//       );

//       if (result.success) {
//         setActionMessage(`Tier updated to ${selectedTier} successfully`);
//         setShowUpdateTierModal(false);
//         onUpdate(client.id, { tier: selectedTier });
//         onRefresh();
//       }
//     } catch (error) {
//       setActionError(error.response?.data?.error || 'Failed to update tier');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Update client status
//   const handleUpdateStatus = async () => {
//     try {
//       setIsLoading(true);
//       setActionError('');

//       const result = await ClientAPI.updateClientStatus(
//         client.id,
//         selectedStatus,
//         statusReason
//       );

//       if (result.success) {
//         setActionMessage(`Status updated to ${selectedStatus} successfully`);
//         setShowStatusModal(false);
//         onUpdate(client.id, { status: selectedStatus });
//         onRefresh();
//       }
//     } catch (error) {
//       setActionError(error.response?.data?.error || 'Failed to update status');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Resend credentials
//   const handleResendCredentials = async () => {
//     try {
//       setIsLoading(true);
//       setActionError('');

//       const result = await ClientAPI.resendCredentials(client.id);

//       if (result.success) {
//         setActionMessage('Credentials resent successfully');
//         setShowResendCredentialsModal(false);
//       }
//     } catch (error) {
//       setActionError(error.response?.data?.error || 'Failed to resend credentials');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Send message
//   const handleSendMessage = async () => {
//     try {
//       setIsLoading(true);
//       setActionError('');

//       const result = await ClientAPI.sendClientMessage(client.id, {
//         message: messageContent,
//         channel: 'sms',
//         priority: 'normal'
//       });

//       if (result.success) {
//         setActionMessage('Message sent successfully');
//         setShowSendMessageModal(false);
//         setMessageContent('');
//       }
//     } catch (error) {
//       setActionError(error.response?.data?.error || 'Failed to send message');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Export client data
//   const handleExportData = async () => {
//     try {
//       setIsLoading(true);
//       await ClientAPI.exportClients({ id: client.id }, 'json');
//       setActionMessage('Data exported successfully');
//     } catch (error) {
//       setActionError(error.response?.data?.error || 'Failed to export data');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Delete client
//   const handleDeleteClient = async () => {
//     try {
//       setIsLoading(true);
//       await ClientAPI.deleteClient(client.id);
//       setShowDeleteModal(false);
//       onDelete(client.id);
//     } catch (error) {
//       setActionError(error.response?.data?.error || 'Failed to delete client');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <>
//       {/* Action Buttons */}
//       <div className="flex items-center gap-2">
//         {/* Primary Actions */}
//         <button
//           onClick={() => setShowSendMessageModal(true)}
//           disabled={isLoading}
//           className={`p-2 rounded-lg transition-all hover:scale-105 ${themeClasses.button.primary}`}
//           title="Send Message"
//         >
//           <Send size={16} />
//         </button>

//         <button
//           onClick={() => setShowUpdateTierModal(true)}
//           disabled={isLoading}
//           className={`p-2 rounded-lg transition-all hover:scale-105 ${themeClasses.button.secondary}`}
//           title="Update Tier"
//         >
//           <Star size={16} />
//         </button>

//         {client.is_pppoe_client && (
//           <button
//             onClick={() => setShowResendCredentialsModal(true)}
//             disabled={isLoading}
//             className={`p-2 rounded-lg transition-all hover:scale-105 ${themeClasses.button.success}`}
//             title="Resend Credentials"
//           >
//             <Lock size={16} />
//           </button>
//         )}

//         {/* More Actions Dropdown */}
//         <div className="relative">
//           <button
//             onClick={() => setShowActions(!showActions)}
//             className={`p-2 rounded-lg transition-all hover:scale-105 ${themeClasses.button.secondary}`}
//             title="More Actions"
//           >
//             <MoreVertical size={16} />
//           </button>

//           {showActions && (
//             <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50 ${
//               theme === 'dark' 
//                 ? 'bg-gray-800 border-gray-700' 
//                 : 'bg-white border-gray-200'
//             }`}>
//               <div className="py-1">
//                 <button
//                   onClick={() => {
//                     setShowActions(false);
//                     handleExportData();
//                   }}
//                   className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
//                     theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
//                   }`}
//                 >
//                   <Download size={14} />
//                   Export Data
//                 </button>

//                 <button
//                   onClick={() => {
//                     setShowActions(false);
//                     setShowStatusModal(true);
//                   }}
//                   className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
//                     theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
//                   }`}
//                 >
//                   <Edit size={14} />
//                   Update Status
//                 </button>

//                 <button
//                   onClick={() => {
//                     setShowActions(false);
//                     setShowDeleteModal(true);
//                   }}
//                   className={`w-full text-left px-4 py-2 text-sm hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center gap-2 text-red-500`}
//                 >
//                   <Trash2 size={14} />
//                   Delete Client
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Action Messages */}
//       {(actionMessage || actionError) && (
//         <div className="mt-2">
//           {actionMessage && (
//             <div className={`p-2 rounded text-sm flex items-center justify-between ${themeClasses.bg.success}`}>
//               <span>{actionMessage}</span>
//               <button onClick={() => setActionMessage('')} className="ml-2">
//                 <X size={14} />
//               </button>
//             </div>
//           )}
//           {actionError && (
//             <div className={`p-2 rounded text-sm flex items-center justify-between ${themeClasses.bg.danger}`}>
//               <span>{actionError}</span>
//               <button onClick={() => setActionError('')} className="ml-2">
//                 <X size={14} />
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
//             <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//               Message to {client.username}
//             </label>
//             <textarea
//               value={messageContent}
//               onChange={(e) => setMessageContent(e.target.value)}
//               className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
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
//               className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.primary} ${
//                 isLoading || !messageContent.trim() ? 'opacity-50 cursor-not-allowed' : ''
//               }`}
//             >
//               {isLoading ? (
//                 <FaSpinner className="animate-spin inline mr-2" />
//               ) : (
//                 <Send className="inline mr-2" size={16} />
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
//           setSelectedTier(client.tier || 'new');
//           setTierReason('');
//         }}
//         title="Update Client Tier"
//         theme={theme}
//       >
//         <div className="space-y-4">
//           <div>
//             <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//               Select New Tier
//             </label>
//             <EnhancedSelect
//               value={selectedTier}
//               onChange={(value) => setSelectedTier(value)}
//               options={tierOptions}
//               theme={theme}
//               disabled={isLoading}
//             />
//           </div>
//           <div>
//             <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//               Reason (Optional)
//             </label>
//             <textarea
//               value={tierReason}
//               onChange={(e) => setTierReason(e.target.value)}
//               className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
//               rows="2"
//               placeholder="Reason for tier change..."
//               disabled={isLoading}
//             />
//           </div>
//           <div className="flex justify-end gap-2">
//             <button
//               onClick={() => {
//                 setShowUpdateTierModal(false);
//                 setSelectedTier(client.tier || 'new');
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
//                 <Star className="inline mr-2" size={16} />
//               )}
//               Update Tier
//             </button>
//           </div>
//         </div>
//       </Modal>

//       {/* Update Status Modal */}
//       <Modal
//         isOpen={showStatusModal}
//         onClose={() => {
//           setShowStatusModal(false);
//           setSelectedStatus(client.status || 'active');
//           setStatusReason('');
//         }}
//         title="Update Client Status"
//         theme={theme}
//       >
//         <div className="space-y-4">
//           <div>
//             <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//               Select New Status
//             </label>
//             <EnhancedSelect
//               value={selectedStatus}
//               onChange={(value) => setSelectedStatus(value)}
//               options={statusOptions}
//               theme={theme}
//               disabled={isLoading}
//             />
//           </div>
//           <div>
//             <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//               Reason (Optional)
//             </label>
//             <textarea
//               value={statusReason}
//               onChange={(e) => setStatusReason(e.target.value)}
//               className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
//               rows="2"
//               placeholder="Reason for status change..."
//               disabled={isLoading}
//             />
//           </div>
//           <div className="flex justify-end gap-2">
//             <button
//               onClick={() => {
//                 setShowStatusModal(false);
//                 setSelectedStatus(client.status || 'active');
//                 setStatusReason('');
//               }}
//               disabled={isLoading}
//               className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.secondary}`}
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleUpdateStatus}
//               disabled={isLoading}
//               className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.primary}`}
//             >
//               {isLoading ? (
//                 <FaSpinner className="animate-spin inline mr-2" />
//               ) : (
//                 <Check className="inline mr-2" size={16} />
//               )}
//               Update Status
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
//           <div className={`p-4 rounded-lg ${themeClasses.bg.warning}`}>
//             <p className="text-sm">
//               This will send an SMS with PPPoE credentials to {client.phone_display}.
//               Are you sure you want to proceed?
//             </p>
//           </div>
//           {client.pppoe_username && (
//             <div className={`p-3 rounded-lg ${themeClasses.bg.secondary}`}>
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
//                 <Lock className="inline mr-2" size={16} />
//               )}
//               Resend Credentials
//             </button>
//           </div>
//         </div>
//       </Modal>

//       {/* Delete Confirmation Modal */}
//       <Modal
//         isOpen={showDeleteModal}
//         onClose={() => setShowDeleteModal(false)}
//         title="Delete Client"
//         theme={theme}
//       >
//         <div className="space-y-4">
//           <div className={`p-4 rounded-lg ${themeClasses.bg.danger}`}>
//             <p className="text-sm">
//               Are you sure you want to delete {client.username}? This action cannot be undone.
//             </p>
//           </div>
//           <div className="flex justify-end gap-2">
//             <button
//               onClick={() => setShowDeleteModal(false)}
//               disabled={isLoading}
//               className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.secondary}`}
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleDeleteClient}
//               disabled={isLoading}
//               className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.danger}`}
//             >
//               {isLoading ? (
//                 <FaSpinner className="animate-spin inline mr-2" />
//               ) : (
//                 <Trash2 className="inline mr-2" size={16} />
//               )}
//               Delete Client
//             </button>
//           </div>
//         </div>
//       </Modal>
//     </>
//   );
// };

// export default ClientActions;








import React, { useState } from 'react';
import {
  Send, Star, Lock, Edit, Download, Archive,
  Check, X, Trash2, MoreVertical, RefreshCw
} from 'lucide-react';
import { FaSpinner } from 'react-icons/fa';
import { EnhancedSelect, getThemeClasses } from '../ServiceManagement/Shared/components';
import ClientService from './services/ClientService';
import ExportService from './services/ExportService';
import { CLIENT_TIERS, CLIENT_STATUS } from './constants/clientConstants';

const ClientActions = ({ client, onUpdate, onRefresh, onDelete, theme }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showSendMessageModal, setShowSendMessageModal] = useState(false);
  const [showUpdateTierModal, setShowUpdateTierModal] = useState(false);
  const [showResendCredentialsModal, setShowResendCredentialsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [selectedTier, setSelectedTier] = useState(client.tier || 'new');
  const [selectedStatus, setSelectedStatus] = useState(client.status || 'active');
  const [tierReason, setTierReason] = useState('');
  const [statusReason, setStatusReason] = useState('');

  const themeClasses = getThemeClasses(theme);

  // Modal component
  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className={`w-full max-w-md rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
          <div className={`p-4 border-b flex justify-between items-center ${themeClasses.border.light}`}>
            <h3 className={`font-semibold ${themeClasses.text.primary}`}>{title}</h3>
            <button onClick={onClose} className={`p-1 rounded ${themeClasses.button.secondary}`}>
              <X size={18} />
            </button>
          </div>
          <div className="p-4">{children}</div>
        </div>
      </div>
    );
  };

  // Tier options
  const tierOptions = Object.entries(CLIENT_TIERS).map(([value, label]) => ({
    value,
    label
  }));

  // Status options
  const statusOptions = Object.entries(CLIENT_STATUS).map(([value, label]) => ({
    value,
    label
  }));

  // Update client tier
  const handleUpdateTier = async () => {
    try {
      setIsLoading(true);
      setActionError('');

      const result = await ClientService.updateClientTier(
        client.id,
        selectedTier,
        tierReason,
        true
      );

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

  // Update client status
  const handleUpdateStatus = async () => {
    try {
      setIsLoading(true);
      setActionError('');

      const result = await ClientService.updateClientStatus(client.id, selectedStatus, statusReason);

      if (result.success) {
        setActionMessage(`Status updated to ${selectedStatus} successfully`);
        setShowStatusModal(false);
        onUpdate(client.id, { status: selectedStatus });
        onRefresh();
      }
    } catch (error) {
      setActionError(error.response?.data?.error || 'Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend credentials
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

  // Send message
  const handleSendMessage = async () => {
    try {
      setIsLoading(true);
      setActionError('');

      const result = await ClientService.sendClientMessage(client.id, {
        message: messageContent,
        channel: 'sms',
        priority: 'normal'
      });

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

  // Export client data
  const handleExportData = async () => {
    try {
      setIsLoading(true);
      const formattedData = ExportService.prepareClientExportData([client]);
      await ExportService.exportAsJSON(formattedData, `client_${client.username}_${new Date().toISOString().split('T')[0]}`);
      setActionMessage('Data exported successfully');
      setShowActions(false);
    } catch (error) {
      setActionError(error.response?.data?.error || 'Failed to export data');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete client
  const handleDeleteClient = async () => {
    try {
      setIsLoading(true);
      await ClientService.deleteClient(client.id);
      setShowDeleteModal(false);
      onDelete(client.id);
    } catch (error) {
      setActionError(error.response?.data?.error || 'Failed to delete client');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowSendMessageModal(true)}
          disabled={isLoading}
          className={`p-2 rounded-lg transition-all hover:scale-105 ${themeClasses.button.primary}`}
          title="Send Message"
        >
          <Send size={16} />
        </button>

        <button
          onClick={() => setShowUpdateTierModal(true)}
          disabled={isLoading}
          className={`p-2 rounded-lg transition-all hover:scale-105 ${themeClasses.button.secondary}`}
          title="Update Tier"
        >
          <Star size={16} />
        </button>

        {client.connection_type === 'pppoe' && (
          <button
            onClick={() => setShowResendCredentialsModal(true)}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-all hover:scale-105 ${themeClasses.button.success}`}
            title="Resend Credentials"
          >
            <Lock size={16} />
          </button>
        )}

        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className={`p-2 rounded-lg transition-all hover:scale-105 ${themeClasses.button.secondary}`}
            title="More Actions"
          >
            <MoreVertical size={16} />
          </button>

          {showActions && (
            <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50 ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="py-1">
                <button
                  onClick={handleExportData}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  <Download size={14} />
                  Export Data
                </button>

                <button
                  onClick={() => {
                    setShowActions(false);
                    setShowStatusModal(true);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  <Edit size={14} />
                  Update Status
                </button>

                <button
                  onClick={() => {
                    setShowActions(false);
                    setShowDeleteModal(true);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center gap-2 text-red-500`}
                >
                  <Trash2 size={14} />
                  Delete Client
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Messages */}
      {(actionMessage || actionError) && (
        <div className="mt-2">
          {actionMessage && (
            <div className={`p-2 rounded text-sm flex items-center justify-between ${themeClasses.bg.success}`}>
              <span>{actionMessage}</span>
              <button onClick={() => setActionMessage('')} className="ml-2">
                <X size={14} />
              </button>
            </div>
          )}
          {actionError && (
            <div className={`p-2 rounded text-sm flex items-center justify-between ${themeClasses.bg.danger}`}>
              <span>{actionError}</span>
              <button onClick={() => setActionError('')} className="ml-2">
                <X size={14} />
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
              className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.secondary}`}
            >
              Cancel
            </button>
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !messageContent.trim()}
              className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.primary} ${
                isLoading || !messageContent.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <FaSpinner className="animate-spin inline mr-2" />
              ) : (
                <Send className="inline mr-2" size={16} />
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
          setSelectedTier(client.tier || 'new');
          setTierReason('');
        }}
        title="Update Client Tier"
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
                setSelectedTier(client.tier || 'new');
                setTierReason('');
              }}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.secondary}`}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateTier}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.primary}`}
            >
              {isLoading ? (
                <FaSpinner className="animate-spin inline mr-2" />
              ) : (
                <Star className="inline mr-2" size={16} />
              )}
              Update Tier
            </button>
          </div>
        </div>
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedStatus(client.status || 'active');
          setStatusReason('');
        }}
        title="Update Client Status"
      >
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
              Select New Status
            </label>
            <EnhancedSelect
              value={selectedStatus}
              onChange={(value) => setSelectedStatus(value)}
              options={statusOptions}
              theme={theme}
              disabled={isLoading}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
              Reason (Optional)
            </label>
            <textarea
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
              rows="2"
              placeholder="Reason for status change..."
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowStatusModal(false);
                setSelectedStatus(client.status || 'active');
                setStatusReason('');
              }}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.secondary}`}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateStatus}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.primary}`}
            >
              {isLoading ? (
                <FaSpinner className="animate-spin inline mr-2" />
              ) : (
                <Check className="inline mr-2" size={16} />
              )}
              Update Status
            </button>
          </div>
        </div>
      </Modal>

      {/* Resend Credentials Modal */}
      <Modal
        isOpen={showResendCredentialsModal}
        onClose={() => setShowResendCredentialsModal(false)}
        title="Resend PPPoE Credentials"
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
              className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.secondary}`}
            >
              Cancel
            </button>
            <button
              onClick={handleResendCredentials}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.success}`}
            >
              {isLoading ? (
                <FaSpinner className="animate-spin inline mr-2" />
              ) : (
                <Lock className="inline mr-2" size={16} />
              )}
              Resend Credentials
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Client"
      >
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${themeClasses.bg.danger}`}>
            <p className="text-sm">
              Are you sure you want to delete {client.username}? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.secondary}`}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteClient}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.danger}`}
            >
              {isLoading ? (
                <FaSpinner className="animate-spin inline mr-2" />
              ) : (
                <Trash2 className="inline mr-2" size={16} />
              )}
              Delete Client
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ClientActions;