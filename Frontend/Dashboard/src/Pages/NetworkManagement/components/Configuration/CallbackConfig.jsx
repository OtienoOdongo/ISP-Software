
// // src/Pages/NetworkManagement/components/Configuration/CallbackConfig.jsx
// import React from "react";
// import { Activity, Globe, Shield, ShieldCheck, Trash2, Plus, Clock, RefreshCw } from "lucide-react";
// import CustomModal from "../Common/CustomModal"
// import CustomButton from "../Common/CustomButton";
// import InputField from "../Common/InputField";
// import ConfirmationModal from "../Common/ConfirmationModal";
// import { getThemeClasses, EnhancedSelect } from "../../../../components/ServiceManagement/Shared/components"

// const CallbackConfig = ({ 
//   isOpen, 
//   onClose, 
//   callbackForm, 
//   callbackConfigs, 
//   theme = "light", 
//   onFormUpdate, 
//   onAddCallback,
//   onDeleteCallback,
//   isLoading 
// }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(null);

//   const securityLevels = [
//     { value: "low", label: "Low" },
//     { value: "medium", label: "Medium" },
//     { value: "high", label: "High" },
//     { value: "critical", label: "Critical" },
//   ];

//   const events = [
//     { value: "payment_received", label: "Payment Received" },
//     { value: "user_connected", label: "User Connected" },
//     { value: "user_disconnected", label: "User Disconnected" },
//     { value: "router_offline", label: "Router Offline" },
//     { value: "router_online", label: "Router Online" },
//     { value: "bandwidth_exceeded", label: "Bandwidth Exceeded" },
//     { value: "session_expired", label: "Session Expired" },
//   ];

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onAddCallback();
//   };

//   const handleDelete = (configId) => {
//     setShowDeleteConfirm(configId);
//   };

//   const confirmDelete = () => {
//     if (showDeleteConfirm) {
//       onDeleteCallback(showDeleteConfirm);
//       setShowDeleteConfirm(null);
//     }
//   };

//   const getSecurityLevelColor = (level) => {
//     const colors = {
//       low: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
//       medium: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
//       high: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
//       critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
//     };
//     return colors[level] || colors.medium;
//   };

//   const CallbackConfigCard = ({ config }) => (
//     <div className={`p-4 rounded-lg border ${
//       themeClasses.bg.card
//     } ${themeClasses.border.medium}`}>
//       <div className="flex items-center justify-between mb-3">
//         <div className="flex items-center space-x-3">
//           <div className={`p-2 rounded-full ${
//             config.is_active 
//               ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
//               : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
//           }`}>
//             <Activity className="w-4 h-4" />
//           </div>
//           <div>
//             <p className={`font-medium capitalize ${themeClasses.text.primary}`}>
//               {config.event.replace(/_/g, " ")}
//             </p>
//             <p className={`text-sm ${themeClasses.text.tertiary}`}>
//               {config.callback_url}
//             </p>
//           </div>
//         </div>
//         <div className="flex items-center space-x-2">
//           <span className={`px-2 py-1 rounded-full text-xs ${getSecurityLevelColor(config.security_level)}`}>
//             {config.security_level}
//           </span>
//           <CustomButton
//             onClick={() => handleDelete(config.id)}
//             icon={<Trash2 className="w-3 h-3" />}
//             variant="danger"
//             size="sm"
//             theme={theme}
//           />
//         </div>
//       </div>

//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//         <div>
//           <p className={themeClasses.text.tertiary}>Security</p>
//           <p className={`font-medium ${themeClasses.text.primary}`}>{config.security_profile || "Default"}</p>
//         </div>
//         <div>
//           <p className={themeClasses.text.tertiary}>Retries</p>
//           <p className={`font-medium flex items-center ${themeClasses.text.primary}`}>
//             <RefreshCw className="w-3 h-3 mr-1" />
//             {config.max_retries}
//           </p>
//         </div>
//         <div>
//           <p className={themeClasses.text.tertiary}>Timeout</p>
//           <p className={`font-medium flex items-center ${themeClasses.text.primary}`}>
//             <Clock className="w-3 h-3 mr-1" />
//             {config.timeout_seconds}s
//           </p>
//         </div>
//         <div>
//           <p className={themeClasses.text.tertiary}>Status</p>
//           <span className={`px-2 py-1 rounded-full text-xs ${
//             config.is_active
//               ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
//               : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
//           }`}>
//             {config.is_active ? "Active" : "Inactive"}
//           </span>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <>
//       <CustomModal 
//         isOpen={isOpen} 
//         title="Callback Configuration" 
//         onClose={onClose}
//         size="xl"
//         theme={theme}
//       >
//         <div className="space-y-6">
//           {/* Add New Callback Form */}
//           <div className={`p-4 rounded-lg border ${
//             themeClasses.bg.card
//           } ${themeClasses.border.medium}`}>
//             <h4 className={`font-medium mb-4 flex items-center ${themeClasses.text.primary}`}>
//               <Plus className="w-4 h-4 mr-2" />
//               Add New Callback
//             </h4>
            
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <EnhancedSelect
//                   label="Event"
//                   value={callbackForm.event}
//                   onChange={(value) => onFormUpdate({ event: value })}
//                   options={events}
//                   placeholder="Select event type"
//                   icon={<Activity className="w-4 h-4" />}
//                   required
//                   theme={theme}
//                 />

//                 <EnhancedSelect
//                   label="Security Level"
//                   value={callbackForm.security_level}
//                   onChange={(value) => onFormUpdate({ security_level: value })}
//                   options={securityLevels}
//                   placeholder="Select security level"
//                   icon={<Shield className="w-4 h-4" />}
//                   required
//                   theme={theme}
//                 />
//               </div>

//               <InputField
//                 label="Callback URL"
//                 value={callbackForm.callback_url}
//                 onChange={(e) => onFormUpdate({ callback_url: e.target.value })}
//                 placeholder="https://example.com/callback"
//                 icon={<Globe className="w-4 h-4" />}
//                 required
//                 theme={theme}
//               />

//               <InputField
//                 label="Security Profile"
//                 value={callbackForm.security_profile}
//                 onChange={(e) => onFormUpdate({ security_profile: e.target.value })}
//                 placeholder="custom-profile"
//                 icon={<ShieldCheck className="w-4 h-4" />}
//                 theme={theme}
//               />

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <InputField
//                   label="Max Retries"
//                   type="number"
//                   value={callbackForm.max_retries}
//                   onChange={(e) => onFormUpdate({ max_retries: parseInt(e.target.value) || 3 })}
//                   placeholder="3"
//                   icon={<RefreshCw className="w-4 h-4" />}
//                   theme={theme}
//                 />

//                 <InputField
//                   label="Timeout (seconds)"
//                   type="number"
//                   value={callbackForm.timeout_seconds}
//                   onChange={(e) => onFormUpdate({ timeout_seconds: parseInt(e.target.value) || 30 })}
//                   placeholder="30"
//                   icon={<Clock className="w-4 h-4" />}
//                   theme={theme}
//                 />
//               </div>

//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-4">
//                   <div className={`flex items-center space-x-2 p-3 rounded-lg border ${themeClasses.border.light}`}>
//                     <input
//                       type="checkbox"
//                       checked={callbackForm.is_active}
//                       onChange={(e) => onFormUpdate({ is_active: e.target.checked })}
//                       className={`w-4 h-4 text-blue-600 rounded focus:ring-2 ${
//                         theme === "dark" 
//                           ? "bg-gray-700 border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600" 
//                           : "bg-gray-100 border-gray-300 focus:ring-blue-500"
//                       }`}
//                     />
//                     <label className={`text-sm ${themeClasses.text.primary}`}>
//                       Active
//                     </label>
//                   </div>
//                   <div className={`flex items-center space-x-2 p-3 rounded-lg border ${themeClasses.border.light}`}>
//                     <input
//                       type="checkbox"
//                       checked={callbackForm.retry_enabled}
//                       onChange={(e) => onFormUpdate({ retry_enabled: e.target.checked })}
//                       className={`w-4 h-4 text-blue-600 rounded focus:ring-2 ${
//                         theme === "dark" 
//                           ? "bg-gray-700 border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600" 
//                           : "bg-gray-100 border-gray-300 focus:ring-blue-500"
//                       }`}
//                     />
//                     <label className={`text-sm ${themeClasses.text.primary}`}>
//                       Enable Retries
//                     </label>
//                   </div>
//                 </div>

//                 <CustomButton
//                   type="submit"
//                   label="Add Callback"
//                   variant="primary"
//                   disabled={isLoading || !callbackForm.event || !callbackForm.callback_url}
//                   loading={isLoading}
//                   theme={theme}
//                 />
//               </div>
//             </form>
//           </div>

//           {/* Existing Callback Configurations */}
//           <div>
//             <h4 className={`font-medium mb-4 ${themeClasses.text.primary}`}>Existing Callback Configurations</h4>
//             {callbackConfigs.length === 0 ? (
//               <div className="text-center py-8">
//                 <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                 <p className={themeClasses.text.tertiary}>No callback configurations found</p>
//                 <p className={`text-sm ${themeClasses.text.tertiary} mt-1`}>
//                   Add a callback configuration to receive notifications for router events
//                 </p>
//               </div>
//             ) : (
//               <div className="space-y-3 max-h-96 overflow-y-auto">
//                 {callbackConfigs.map(config => (
//                   <CallbackConfigCard key={config.id} config={config} />
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Callback Statistics */}
//           <div className={`p-4 rounded-lg border ${
//             themeClasses.bg.card
//           } ${themeClasses.border.medium}`}>
//             <h4 className={`font-medium mb-3 ${themeClasses.text.primary}`}>Callback Statistics</h4>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
//               <div>
//                 <p className={`text-sm ${themeClasses.text.tertiary}`}>Total Configs</p>
//                 <p className={`text-xl font-bold ${themeClasses.text.primary}`}>{callbackConfigs.length}</p>
//               </div>
//               <div>
//                 <p className={`text-sm ${themeClasses.text.tertiary}`}>Active</p>
//                 <p className="text-xl font-bold text-green-600 dark:text-green-400">
//                   {callbackConfigs.filter(c => c.is_active).length}
//                 </p>
//               </div>
//               <div>
//                 <p className={`text-sm ${themeClasses.text.tertiary}`}>High Security</p>
//                 <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
//                   {callbackConfigs.filter(c => c.security_level === "high" || c.security_level === "critical").length}
//                 </p>
//               </div>
//               <div>
//                 <p className={`text-sm ${themeClasses.text.tertiary}`}>With Retries</p>
//                 <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
//                   {callbackConfigs.filter(c => c.retry_enabled).length}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </CustomModal>

//       {/* Delete Confirmation Modal */}
//       <ConfirmationModal
//         isOpen={!!showDeleteConfirm}
//         title="Delete Callback Configuration"
//         message="Are you sure you want to delete this callback configuration? This action cannot be undone."
//         onConfirm={confirmDelete}
//         onCancel={() => setShowDeleteConfirm(null)}
//         theme={theme}
//       />
//     </>
//   );
// };

// export default CallbackConfig;










// src/Pages/NetworkManagement/components/Configuration/CallbackConfig.jsx
import React from "react";
import { Activity, Globe, Shield, ShieldCheck, Trash2, Plus, Clock, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import CustomModal from "../Common/CustomModal"
import CustomButton from "../Common/CustomButton";
import InputField from "../Common/InputField";
import ConfirmationModal from "../Common/ConfirmationModal";
import { getThemeClasses, EnhancedSelect } from "../../../../components/ServiceManagement/Shared/components"
import { toast } from "react-toastify";

const CallbackConfig = ({ 
  isOpen, 
  onClose, 
  callbackForm, 
  callbackConfigs, 
  activeRouter,
  theme = "light", 
  onFormUpdate, 
  onAddCallback,
  onDeleteCallback,
  onTestCallback,
  isLoading 
}) => {
  const themeClasses = getThemeClasses(theme);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(null);
  const [testingCallback, setTestingCallback] = React.useState(null);

  const securityLevels = [
    { value: "low", label: "Low", description: "Basic validation only" },
    { value: "medium", label: "Medium", description: "Standard security with signature" },
    { value: "high", label: "High", description: "Enhanced security with encryption" },
    { value: "critical", label: "Critical", description: "Maximum security with full validation" },
  ];

  const events = [
    { value: "payment_received", label: "Payment Received", description: "When a payment is successfully processed" },
    { value: "user_connected", label: "User Connected", description: "When a user connects to the network" },
    { value: "user_disconnected", label: "User Disconnected", description: "When a user disconnects from the network" },
    { value: "router_online", label: "Router Online", description: "When router comes online" },
    { value: "router_offline", label: "Router Offline", description: "When router goes offline" },
    { value: "bandwidth_exceeded", label: "Bandwidth Exceeded", description: "When user exceeds bandwidth limit" },
    { value: "session_expired", label: "Session Expired", description: "When user session expires" },
    { value: "hotspot_user_added", label: "Hotspot User Added", description: "When new hotspot user is created" },
    { value: "pppoe_user_added", label: "PPPoE User Added", description: "When new PPPoE user is created" },
    { value: "configuration_updated", label: "Configuration Updated", description: "When router configuration changes" },
  ];

  const securityProfiles = [
    { value: "default", label: "Default", description: "Standard security profile" },
    { value: "enhanced", label: "Enhanced", description: "Enhanced security with HMAC" },
    { value: "strict", label: "Strict", description: "Strict validation with IP whitelisting" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!callbackForm.event) {
      toast.error("Event type is required");
      return;
    }
    
    if (!callbackForm.callback_url) {
      toast.error("Callback URL is required");
      return;
    }

    // Validate URL format
    try {
      new URL(callbackForm.callback_url);
    } catch (error) {
      toast.error("Please enter a valid URL");
      return;
    }

    onAddCallback();
  };

  const handleDelete = (configId) => {
    setShowDeleteConfirm(configId);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      onDeleteCallback(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  };

  const handleTestCallback = async (configId) => {
    setTestingCallback(configId);
    try {
      await onTestCallback(configId);
      toast.success("Callback test initiated");
    } catch (error) {
      toast.error("Callback test failed");
    } finally {
      setTestingCallback(null);
    }
  };

  const getSecurityLevelColor = (level) => {
    const colors = {
      low: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      medium: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      high: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    };
    return colors[level] || colors.medium;
  };

  const getEventIcon = (eventType) => {
    const icons = {
      payment_received: "💰",
      user_connected: "🔗", 
      user_disconnected: "🔌",
      router_online: "🟢",
      router_offline: "🔴",
      bandwidth_exceeded: "📊",
      session_expired: "⏰",
      hotspot_user_added: "📱",
      pppoe_user_added: "🌐",
      configuration_updated: "⚙️"
    };
    return icons[eventType] || "📢";
  };

  const CallbackConfigCard = ({ config }) => (
    <div className={`p-4 rounded-lg border ${
      themeClasses.bg.card
    } ${themeClasses.border.medium}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${
            config.is_active 
              ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
          }`}>
            <span className="text-sm">{getEventIcon(config.event)}</span>
          </div>
          <div className="flex-1">
            <p className={`font-medium capitalize ${themeClasses.text.primary}`}>
              {config.event.replace(/_/g, " ")}
            </p>
            <p className={`text-sm ${themeClasses.text.tertiary} truncate`}>
              {config.callback_url}
            </p>
            {config.last_called && (
              <p className={`text-xs ${themeClasses.text.tertiary}`}>
                Last called: {new Date(config.last_called).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs ${getSecurityLevelColor(config.security_level)}`}>
            {config.security_level}
          </span>
          <CustomButton
            onClick={() => handleTestCallback(config.id)}
            icon={<RefreshCw className={`w-3 h-3 ${testingCallback === config.id ? 'animate-spin' : ''}`} />}
            variant="secondary"
            size="sm"
            theme={theme}
            disabled={testingCallback === config.id}
            loading={testingCallback === config.id}
          />
          <CustomButton
            onClick={() => handleDelete(config.id)}
            icon={<Trash2 className="w-3 h-3" />}
            variant="danger"
            size="sm"
            theme={theme}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className={themeClasses.text.tertiary}>Security Profile</p>
          <p className={`font-medium ${themeClasses.text.primary}`}>
            {config.security_profile || "Default"}
          </p>
        </div>
        <div>
          <p className={themeClasses.text.tertiary}>Retries</p>
          <p className={`font-medium flex items-center ${themeClasses.text.primary}`}>
            <RefreshCw className="w-3 h-3 mr-1" />
            {config.max_retries}
          </p>
        </div>
        <div>
          <p className={themeClasses.text.tertiary}>Timeout</p>
          <p className={`font-medium flex items-center ${themeClasses.text.primary}`}>
            <Clock className="w-3 h-3 mr-1" />
            {config.timeout_seconds}s
          </p>
        </div>
        <div>
          <p className={themeClasses.text.tertiary}>Status</p>
          <span className={`px-2 py-1 rounded-full text-xs ${
            config.is_active
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
          }`}>
            {config.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Success/Failure Stats */}
      {(config.success_count !== undefined || config.failure_count !== undefined) && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between text-xs">
            <span className={themeClasses.text.tertiary}>Success: <strong className={themeClasses.text.primary}>{config.success_count || 0}</strong></span>
            <span className={themeClasses.text.tertiary}>Failures: <strong className={themeClasses.text.primary}>{config.failure_count || 0}</strong></span>
            <span className={themeClasses.text.tertiary}>
              Success Rate: <strong className={themeClasses.text.primary}>
                {config.success_count && config.failure_count 
                  ? `${Math.round((config.success_count / (config.success_count + config.failure_count)) * 100)}%`
                  : '0%'
                }
              </strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <CustomModal 
        isOpen={isOpen} 
        title="Callback Configuration" 
        onClose={onClose}
        size="xl"
        theme={theme}
      >
        <div className="space-y-6">
          {activeRouter && (
            <div className={`p-4 rounded-lg border ${
              theme === "dark" ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"
            }`}>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Configuring callbacks for: <strong>{activeRouter.name}</strong> ({activeRouter.ip})
              </p>
            </div>
          )}

          {/* Add New Callback Form */}
          <div className={`p-4 rounded-lg border ${
            themeClasses.bg.card
          } ${themeClasses.border.medium}`}>
            <h4 className={`font-medium mb-4 flex items-center ${themeClasses.text.primary}`}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Callback
            </h4>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EnhancedSelect
                  label="Event Type"
                  value={callbackForm.event}
                  onChange={(value) => onFormUpdate({ event: value })}
                  options={events}
                  placeholder="Select event type"
                  icon={<Activity className="w-4 h-4" />}
                  required
                  theme={theme}
                />

                <EnhancedSelect
                  label="Security Level"
                  value={callbackForm.security_level}
                  onChange={(value) => onFormUpdate({ security_level: value })}
                  options={securityLevels}
                  placeholder="Select security level"
                  icon={<Shield className="w-4 h-4" />}
                  required
                  theme={theme}
                />
              </div>

              <InputField
                label="Callback URL"
                value={callbackForm.callback_url}
                onChange={(e) => onFormUpdate({ callback_url: e.target.value })}
                placeholder="https://your-server.com/api/callbacks"
                icon={<Globe className="w-4 h-4" />}
                required
                theme={theme}
                subtitle="URL to receive callback notifications"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EnhancedSelect
                  label="Security Profile"
                  value={callbackForm.security_profile}
                  onChange={(value) => onFormUpdate({ security_profile: value })}
                  options={securityProfiles}
                  placeholder="Select security profile"
                  icon={<ShieldCheck className="w-4 h-4" />}
                  theme={theme}
                />

                <InputField
                  label="Secret Key"
                  type="password"
                  value={callbackForm.secret_key}
                  onChange={(e) => onFormUpdate({ secret_key: e.target.value })}
                  placeholder="Enter secret for HMAC validation"
                  icon={<ShieldCheck className="w-4 h-4" />}
                  theme={theme}
                  subtitle="Optional: For request validation"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField
                  label="Max Retries"
                  type="number"
                  value={callbackForm.max_retries}
                  onChange={(e) => onFormUpdate({ max_retries: parseInt(e.target.value) || 3 })}
                  placeholder="3"
                  min="0"
                  max="10"
                  icon={<RefreshCw className="w-4 h-4" />}
                  theme={theme}
                />

                <InputField
                  label="Timeout (seconds)"
                  type="number"
                  value={callbackForm.timeout_seconds}
                  onChange={(e) => onFormUpdate({ timeout_seconds: parseInt(e.target.value) || 30 })}
                  placeholder="30"
                  min="5"
                  max="120"
                  icon={<Clock className="w-4 h-4" />}
                  theme={theme}
                />

                <InputField
                  label="Retry Delay (seconds)"
                  type="number"
                  value={callbackForm.retry_delay}
                  onChange={(e) => onFormUpdate({ retry_delay: parseInt(e.target.value) || 5 })}
                  placeholder="5"
                  min="1"
                  max="60"
                  icon={<Clock className="w-4 h-4" />}
                  theme={theme}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center space-x-2 p-3 rounded-lg border ${themeClasses.border.light}`}>
                    <input
                      type="checkbox"
                      checked={callbackForm.is_active}
                      onChange={(e) => onFormUpdate({ is_active: e.target.checked })}
                      className={`w-4 h-4 text-blue-600 rounded focus:ring-2 ${
                        theme === "dark" 
                          ? "bg-gray-700 border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600" 
                          : "bg-gray-100 border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    <label className={`text-sm ${themeClasses.text.primary}`}>
                      Active
                    </label>
                  </div>
                  <div className={`flex items-center space-x-2 p-3 rounded-lg border ${themeClasses.border.light}`}>
                    <input
                      type="checkbox"
                      checked={callbackForm.retry_enabled}
                      onChange={(e) => onFormUpdate({ retry_enabled: e.target.checked })}
                      className={`w-4 h-4 text-blue-600 rounded focus:ring-2 ${
                        theme === "dark" 
                          ? "bg-gray-700 border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600" 
                          : "bg-gray-100 border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    <label className={`text-sm ${themeClasses.text.primary}`}>
                      Enable Retries
                    </label>
                  </div>
                </div>

                <CustomButton
                  type="submit"
                  label="Add Callback"
                  variant="primary"
                  disabled={isLoading || !callbackForm.event || !callbackForm.callback_url}
                  loading={isLoading}
                  theme={theme}
                />
              </div>
            </form>
          </div>

          {/* Existing Callback Configurations */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`font-medium ${themeClasses.text.primary}`}>
                Existing Callback Configurations
              </h4>
              <span className={`text-sm ${themeClasses.text.tertiary}`}>
                {callbackConfigs.length} configured
              </span>
            </div>
            
            {callbackConfigs.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className={themeClasses.text.tertiary}>No callback configurations found</p>
                <p className={`text-sm ${themeClasses.text.tertiary} mt-1`}>
                  Add a callback configuration to receive notifications for router events
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {callbackConfigs.map(config => (
                  <CallbackConfigCard key={config.id} config={config} />
                ))}
              </div>
            )}
          </div>

          {/* Callback Statistics */}
          <div className={`p-4 rounded-lg border ${
            themeClasses.bg.card
          } ${themeClasses.border.medium}`}>
            <h4 className={`font-medium mb-3 ${themeClasses.text.primary}`}>Callback Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className={`text-sm ${themeClasses.text.tertiary}`}>Total Configs</p>
                <p className={`text-xl font-bold ${themeClasses.text.primary}`}>{callbackConfigs.length}</p>
              </div>
              <div>
                <p className={`text-sm ${themeClasses.text.tertiary}`}>Active</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {callbackConfigs.filter(c => c.is_active).length}
                </p>
              </div>
              <div>
                <p className={`text-sm ${themeClasses.text.tertiary}`}>High Security</p>
                <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                  {callbackConfigs.filter(c => c.security_level === "high" || c.security_level === "critical").length}
                </p>
              </div>
              <div>
                <p className={`text-sm ${themeClasses.text.tertiary}`}>With Retries</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {callbackConfigs.filter(c => c.retry_enabled).length}
                </p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className={`p-4 rounded-lg border ${
            theme === "dark" ? "bg-yellow-900/20 border-yellow-800" : "bg-yellow-50 border-yellow-200"
          }`}>
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h4 className={`font-medium text-yellow-800 dark:text-yellow-300`}>
                  Security Best Practices
                </h4>
                <ul className={`text-sm text-yellow-700 dark:text-yellow-400 mt-1 space-y-1`}>
                  <li>• Use HTTPS for callback URLs to ensure data encryption</li>
                  <li>• Implement request validation using secret keys or HMAC</li>
                  <li>• Set appropriate timeout values to prevent hanging requests</li>
                  <li>• Monitor callback success rates and failures regularly</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!showDeleteConfirm}
        title="Delete Callback Configuration"
        message="Are you sure you want to delete this callback configuration? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(null)}
        theme={theme}
      />
    </>
  );
};

export default CallbackConfig;