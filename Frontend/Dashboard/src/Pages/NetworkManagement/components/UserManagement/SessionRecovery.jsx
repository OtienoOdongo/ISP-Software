



// // src/Pages/NetworkManagement/components/UserManagement/SessionRecovery.jsx
// import React, { useState, useEffect } from "react";
// import { RefreshCw, Wifi, Cable, User, Clock, Calendar, CheckCircle, AlertCircle } from "lucide-react";
// import CustomModal from "../Common/CustomModal";
// import CustomButton from "../Common/CustomButton";
// import InputField from "../Common/InputField";
// import { toast } from "react-toastify";
// import { getThemeClasses } from  "../../../../components/ServiceManagement/Shared/components"


// const SessionRecovery = ({ 
//   isOpen = false, 
//   onClose, 
//   recoverableSessions = [], 
//   theme = "light", 
//   onRecoverSession,
//   onBulkRecover,
//   isLoading = false 
// }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [recoveryMethod, setRecoveryMethod] = useState("auto");
//   const [selectedSessions, setSelectedSessions] = useState([]);
//   const [manualRecoveryData, setManualRecoveryData] = useState({
//     phone_number: "",
//     mac_address: "",
//     username: ""
//   });

//   // Reset selections when modal closes
//   useEffect(() => {
//     if (!isOpen) {
//       setSelectedSessions([]);
//       setManualRecoveryData({
//         phone_number: "",
//         mac_address: "",
//         username: ""
//       });
//     }
//   }, [isOpen]);

//   const formatTime = (seconds) => {
//     if (!seconds || seconds <= 0) return "Expired";
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     if (hours > 0) return `${hours}h ${minutes}m`;
//     return `${minutes}m`;
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "Unknown";
//     try {
//       return new Date(dateString).toLocaleString();
//     } catch {
//       return "Invalid Date";
//     }
//   };

//   const handleSessionSelect = (sessionId) => {
//     setSelectedSessions(prev =>
//       prev.includes(sessionId)
//         ? prev.filter(id => id !== sessionId)
//         : [...prev, sessionId]
//     );
//   };

//   const handleSelectAll = () => {
//     const sessions = Array.isArray(recoverableSessions) ? recoverableSessions : [];
//     if (selectedSessions.length === sessions.length) {
//       setSelectedSessions([]);
//     } else {
//       setSelectedSessions(sessions.map(s => s.id));
//     }
//   };

//   const handleManualRecovery = async () => {
//     if (!manualRecoveryData.phone_number) {
//       toast.error("Phone number is required");
//       return;
//     }

//     if (!manualRecoveryData.mac_address && !manualRecoveryData.username) {
//       toast.error("Either MAC address or PPPoE username is required");
//       return;
//     }

//     try {
//       await onRecoverSession(manualRecoveryData);
//       setManualRecoveryData({
//         phone_number: "",
//         mac_address: "",
//         username: ""
//       });
//       onClose();
//     } catch (error) {
//       // Error handled in hook
//     }
//   };

//   const handleBulkRecovery = async () => {
//     if (selectedSessions.length === 0) {
//       toast.error("Please select sessions to recover");
//       return;
//     }

//     try {
//       const sessionsToRecover = (Array.isArray(recoverableSessions) ? recoverableSessions : [])
//         .filter(s => selectedSessions.includes(s.id))
//         .map(session => ({
//           phone_number: session.client?.user?.phone_number,
//           mac_address: session.mac,
//           username: session.username
//         }));

//       await onBulkRecover(sessionsToRecover);
//       setSelectedSessions([]);
//       onClose();
//     } catch (error) {
//       // Error handled in hook
//     }
//   };

//   const RecoverySessionCard = ({ session }) => {
//     if (!session) return null;
    
//     return (
//       <div className={`p-4 rounded-lg border ${
//         themeClasses.bg.card
//       } ${themeClasses.border.medium}`}>
//         <div className="flex items-center justify-between mb-3">
//           <div className="flex items-center space-x-3">
//             <input
//               type="checkbox"
//               checked={selectedSessions.includes(session.id)}
//               onChange={() => handleSessionSelect(session.id)}
//               className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
//             />
//             <div className={`p-2 rounded-full ${
//               session.user_type === "hotspot" 
//                 ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
//                 : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
//             }`}>
//               {session.user_type === "hotspot" ? <Wifi className="w-4 h-4" /> : <Cable className="w-4 h-4" />}
//             </div>
//             <div>
//               <p className={`font-medium ${themeClasses.text.primary}`}>{session.client?.user?.username || "Unknown User"}</p>
//               <p className={`text-sm ${themeClasses.text.tertiary}`}>
//                 {session.client?.user?.phone_number || "No phone"}
//               </p>
//             </div>
//           </div>
//           <span className={`px-2 py-1 rounded-full text-xs ${
//             session.disconnected_reason === "power_outage"
//               ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
//               : session.disconnected_reason === "router_reboot"
//               ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
//               : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
//           }`}>
//             {session.disconnected_reason?.replace(/_/g, " ") || "Unknown"}
//           </span>
//         </div>

//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//           <div>
//             <p className={themeClasses.text.tertiary}>Type</p>
//             <p className={`font-medium ${themeClasses.text.primary} capitalize`}>{session.user_type || "unknown"}</p>
//           </div>
//           <div>
//             <p className={themeClasses.text.tertiary}>Remaining Time</p>
//             <p className="font-medium text-green-600 dark:text-green-400">
//               {formatTime(session.remaining_time)}
//             </p>
//           </div>
//           <div>
//             <p className={themeClasses.text.tertiary}>Disconnected</p>
//             <p className={`font-medium ${themeClasses.text.primary}`}>{formatDate(session.end_time)}</p>
//           </div>
//           <div>
//             <p className={themeClasses.text.tertiary}>
//               {session.user_type === "hotspot" ? "MAC Address" : "Username"}
//             </p>
//             <p className={`font-mono text-xs ${themeClasses.text.primary}`}>{session.mac || session.username || "N/A"}</p>
//           </div>
//         </div>

//         <div className="mt-3 flex justify-end">
//           <CustomButton
//             onClick={() => onRecoverSession({
//               phone_number: session.client?.user?.phone_number,
//               mac_address: session.mac,
//               username: session.username
//             })}
//             label="Recover"
//             variant="primary"
//             size="sm"
//             loading={isLoading}
//             theme={theme}
//           />
//         </div>
//       </div>
//     );
//   };

//   const sessions = Array.isArray(recoverableSessions) ? recoverableSessions : [];
//   const powerOutageCount = sessions.filter(s => s.disconnected_reason === "power_outage").length;
//   const routerRebootCount = sessions.filter(s => s.disconnected_reason === "router_reboot").length;

//   return (
//     <CustomModal 
//       isOpen={isOpen} 
//       title="Session Recovery" 
//       onClose={onClose}
//       size="xl"
//       theme={theme}
//     >
//       <div className="space-y-6">
//         {/* Recovery Method Selection */}
//         <div>
//           <label className={`block text-sm font-medium mb-3 ${themeClasses.text.secondary}`}>
//             Recovery Method
//           </label>
//           <div className="grid grid-cols-2 gap-4">
//             <button
//               type="button"
//               onClick={() => setRecoveryMethod("auto")}
//               className={`p-4 rounded-lg border-2 transition-all duration-200 ${
//                 recoveryMethod === "auto"
//                   ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
//                   : `${themeClasses.border.medium} hover:border-gray-400 dark:hover:border-gray-500`
//               }`}
//             >
//               <RefreshCw className="w-6 h-6 mx-auto mb-2" />
//               <span className="font-medium">Auto Recovery</span>
//               <p className={`text-xs mt-1 ${themeClasses.text.tertiary}`}>
//                 Recover from recent disconnections
//               </p>
//             </button>
            
//             <button
//               type="button"
//               onClick={() => setRecoveryMethod("manual")}
//               className={`p-4 rounded-lg border-2 transition-all duration-200 ${
//                 recoveryMethod === "manual"
//                   ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
//                   : `${themeClasses.border.medium} hover:border-gray-400 dark:hover:border-gray-500`
//               }`}
//             >
//               <User className="w-6 h-6 mx-auto mb-2" />
//               <span className="font-medium">Manual Recovery</span>
//               <p className={`text-xs mt-1 ${themeClasses.text.tertiary}`}>
//                 Recover using user details
//               </p>
//             </button>
//           </div>
//         </div>

//         {/* Auto Recovery Section */}
//         {recoveryMethod === "auto" && (
//           <div className="space-y-4">
//             <div className="flex items-center justify-between">
//               <h3 className={`text-lg font-medium ${themeClasses.text.primary}`}>Recoverable Sessions</h3>
//               {sessions.length > 0 && (
//                 <div className="flex items-center space-x-4">
//                   <button
//                     onClick={handleSelectAll}
//                     className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
//                   >
//                     {selectedSessions.length === sessions.length ? "Deselect All" : "Select All"}
//                   </button>
//                   <CustomButton
//                     onClick={handleBulkRecovery}
//                     label={`Recover Selected (${selectedSessions.length})`}
//                     variant="primary"
//                     size="sm"
//                     disabled={selectedSessions.length === 0}
//                     loading={isLoading}
//                     theme={theme}
//                   />
//                 </div>
//               )}
//             </div>

//             {sessions.length === 0 ? (
//               <div className="text-center py-8">
//                 <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                 <p className={themeClasses.text.tertiary}>No recoverable sessions found</p>
//                 <p className={`text-sm ${themeClasses.text.tertiary} mt-1`}>
//                   Sessions that were disconnected due to power outages or router reboots will appear here
//                 </p>
//               </div>
//             ) : (
//               <div className="space-y-3 max-h-96 overflow-y-auto">
//                 {sessions.map(session => (
//                   <RecoverySessionCard key={session.id} session={session} />
//                 ))}
//               </div>
//             )}
//           </div>
//         )}

//         {/* Manual Recovery Section */}
//         {recoveryMethod === "manual" && (
//           <div className="space-y-4">
//             <h3 className={`text-lg font-medium ${themeClasses.text.primary}`}>Manual Session Recovery</h3>
            
//             <InputField
//               label="Phone Number"
//               value={manualRecoveryData.phone_number}
//               onChange={(e) => setManualRecoveryData(prev => ({
//                 ...prev,
//                 phone_number: e.target.value
//               }))}
//               placeholder="Client phone number"
//               icon={<User className="w-4 h-4" />}
//               required
//               theme={theme}
//             />

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <InputField
//                 label="MAC Address (for Hotspot)"
//                 value={manualRecoveryData.mac_address}
//                 onChange={(e) => setManualRecoveryData(prev => ({
//                   ...prev,
//                   mac_address: e.target.value
//                 }))}
//                 placeholder="00:11:22:33:44:55"
//                 icon={<Wifi className="w-4 h-4" />}
//                 theme={theme}
//                 subtitle="Required for hotspot recovery"
//               />

//               <InputField
//                 label="PPPoE Username"
//                 value={manualRecoveryData.username}
//                 onChange={(e) => setManualRecoveryData(prev => ({
//                   ...prev,
//                   username: e.target.value
//                 }))}
//                 placeholder="pppoe_username"
//                 icon={<Cable className="w-4 h-4" />}
//                 theme={theme}
//                 subtitle="Required for PPPoE recovery"
//               />
//             </div>

//             <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
//               <div className="flex items-start space-x-3">
//                 <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
//                 <div>
//                   <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
//                     Recovery Information
//                   </p>
//                   <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
//                     Provide either MAC address for hotspot recovery or PPPoE username for wired connection recovery.
//                     The system will automatically detect the appropriate session and restore it.
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="flex justify-end">
//               <CustomButton
//                 onClick={handleManualRecovery}
//                 label="Recover Session"
//                 variant="primary"
//                 loading={isLoading}
//                 disabled={!manualRecoveryData.phone_number || 
//                   (!manualRecoveryData.mac_address && !manualRecoveryData.username)}
//                 theme={theme}
//               />
//             </div>
//           </div>
//         )}

//         {/* Recovery Statistics */}
//         <div className={`p-4 rounded-lg border ${
//           themeClasses.bg.card
//         } ${themeClasses.border.medium}`}>
//           <h4 className={`font-medium mb-3 ${themeClasses.text.primary}`}>Recovery Statistics</h4>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
//             <div>
//               <p className={`text-sm ${themeClasses.text.tertiary}`}>Total Recoverable</p>
//               <p className={`text-xl font-bold ${themeClasses.text.primary}`}>{sessions.length}</p>
//             </div>
//             <div>
//               <p className={`text-sm ${themeClasses.text.tertiary}`}>Power Outages</p>
//               <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
//                 {powerOutageCount}
//               </p>
//             </div>
//             <div>
//               <p className={`text-sm ${themeClasses.text.tertiary}`}>Router Reboots</p>
//               <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
//                 {routerRebootCount}
//               </p>
//             </div>
//             <div>
//               <p className={`text-sm ${themeClasses.text.tertiary}`}>Selected</p>
//               <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
//                 {selectedSessions.length}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </CustomModal>
//   );
// };

// export default SessionRecovery;









// src/Pages/NetworkManagement/components/UserManagement/SessionRecovery.jsx
import React, { useState, useEffect } from "react";
import { 
  RefreshCw, 
  Wifi, 
  Cable, 
  User, 
  Clock, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  Router,
  Power,
  Server
} from "lucide-react";
import CustomModal from "../Common/CustomModal";
import CustomButton from "../Common/CustomButton";
import InputField from "../Common/InputField";
import { toast } from "react-toastify";
import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components";

const SessionRecovery = ({ 
  isOpen = false, 
  onClose, 
  recoverableSessions = [], 
  theme = "light", 
  onRecoverSession,
  onBulkRecover,
  onTestRouterConnection,
  availableRouters = [],
  isLoading = false 
}) => {
  const themeClasses = getThemeClasses(theme);
  const [recoveryMethod, setRecoveryMethod] = useState("auto");
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [selectedRouter, setSelectedRouter] = useState("");
  const [connectionStatus, setConnectionStatus] = useState({});
  const [manualRecoveryData, setManualRecoveryData] = useState({
    phone_number: "",
    mac_address: "",
    username: "",
    router_id: ""
  });

  // Enhanced session types based on backend capabilities
  const DISCONNECTION_REASONS = {
    power_outage: { label: "Power Outage", color: "yellow", icon: Power },
    router_reboot: { label: "Router Reboot", color: "orange", icon: Router },
    connection_loss: { label: "Connection Loss", color: "red", icon: Server },
    maintenance: { label: "Maintenance", color: "blue", icon: RefreshCw },
    unknown: { label: "Unknown", color: "gray", icon: AlertCircle }
  };

  // Reset selections when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedSessions([]);
      setManualRecoveryData({
        phone_number: "",
        mac_address: "",
        username: "",
        router_id: ""
      });
      setSelectedRouter("");
    }
  }, [isOpen]);

  // Auto-select first router if available
  useEffect(() => {
    if (availableRouters.length > 0 && !selectedRouter) {
      setSelectedRouter(availableRouters[0].id);
      setManualRecoveryData(prev => ({ ...prev, router_id: availableRouters[0].id }));
    }
  }, [availableRouters, selectedRouter]);

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return "Expired";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return "Invalid Date";
    }
  };

  const handleSessionSelect = (sessionId) => {
    setSelectedSessions(prev =>
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const handleSelectAll = () => {
    const sessions = Array.isArray(recoverableSessions) ? recoverableSessions : [];
    if (selectedSessions.length === sessions.length) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(sessions.map(s => s.id));
    }
  };

  const handleTestConnection = async (routerId) => {
    if (!routerId) {
      toast.error("Please select a router first");
      return;
    }

    try {
      setConnectionStatus(prev => ({ ...prev, [routerId]: "testing" }));
      await onTestRouterConnection(routerId);
      setConnectionStatus(prev => ({ ...prev, [routerId]: "connected" }));
      toast.success("Router connection test successful");
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, [routerId]: "failed" }));
      toast.error("Router connection test failed");
    }
  };

  const handleManualRecovery = async () => {
    if (!manualRecoveryData.phone_number) {
      toast.error("Phone number is required");
      return;
    }

    if (!manualRecoveryData.mac_address && !manualRecoveryData.username) {
      toast.error("Either MAC address or PPPoE username is required");
      return;
    }

    if (!manualRecoveryData.router_id) {
      toast.error("Please select a target router");
      return;
    }

    try {
      await onRecoverSession(manualRecoveryData);
      setManualRecoveryData({
        phone_number: "",
        mac_address: "",
        username: "",
        router_id: selectedRouter
      });
      onClose();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleBulkRecovery = async () => {
    if (selectedSessions.length === 0) {
      toast.error("Please select sessions to recover");
      return;
    }

    if (!selectedRouter) {
      toast.error("Please select a target router");
      return;
    }

    try {
      const sessionsToRecover = (Array.isArray(recoverableSessions) ? recoverableSessions : [])
        .filter(s => selectedSessions.includes(s.id))
        .map(session => ({
          phone_number: session.client?.user?.phone_number,
          mac_address: session.mac,
          username: session.username,
          router_id: selectedRouter
        }));

      await onBulkRecover(sessionsToRecover);
      setSelectedSessions([]);
      onClose();
    } catch (error) {
      // Error handled in hook
    }
  };

  const RecoverySessionCard = ({ session }) => {
    if (!session) return null;
    
    const reasonInfo = DISCONNECTION_REASONS[session.disconnected_reason] || DISCONNECTION_REASONS.unknown;
    const ReasonIcon = reasonInfo.icon;
    
    return (
      <div className={`p-4 rounded-lg border ${
        themeClasses.bg.card
      } ${themeClasses.border.medium}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={selectedSessions.includes(session.id)}
              onChange={() => handleSessionSelect(session.id)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div className={`p-2 rounded-full ${
              session.user_type === "hotspot" 
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
            }`}>
              {session.user_type === "hotspot" ? <Wifi className="w-4 h-4" /> : <Cable className="w-4 h-4" />}
            </div>
            <div>
              <p className={`font-medium ${themeClasses.text.primary}`}>
                {session.client?.user?.username || "Unknown User"}
              </p>
              <p className={`text-sm ${themeClasses.text.tertiary}`}>
                {session.client?.user?.phone_number || "No phone"}
              </p>
              {session.router && (
                <p className={`text-xs ${themeClasses.text.tertiary}`}>
                  Router: {session.router.name} ({session.router.ip})
                </p>
              )}
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 ${
            reasonInfo.color === "yellow" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
            reasonInfo.color === "orange" ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" :
            reasonInfo.color === "red" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
            reasonInfo.color === "blue" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
            "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
          }`}>
            <ReasonIcon className="w-3 h-3" />
            <span>{reasonInfo.label}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className={themeClasses.text.tertiary}>Type</p>
            <p className={`font-medium ${themeClasses.text.primary} capitalize`}>
              {session.user_type || "unknown"}
            </p>
          </div>
          <div>
            <p className={themeClasses.text.tertiary}>Remaining Time</p>
            <p className="font-medium text-green-600 dark:text-green-400">
              {formatTime(session.remaining_time)}
            </p>
          </div>
          <div>
            <p className={themeClasses.text.tertiary}>Disconnected</p>
            <p className={`font-medium ${themeClasses.text.primary}`}>
              {formatDate(session.end_time)}
            </p>
          </div>
          <div>
            <p className={themeClasses.text.tertiary}>
              {session.user_type === "hotspot" ? "MAC Address" : "Username"}
            </p>
            <p className={`font-mono text-xs ${themeClasses.text.primary}`}>
              {session.mac || session.username || "N/A"}
            </p>
          </div>
        </div>

        <div className="mt-3 flex justify-end space-x-2">
          <CustomButton
            onClick={() => onRecoverSession({
              phone_number: session.client?.user?.phone_number,
              mac_address: session.mac,
              username: session.username,
              router_id: session.router?.id || selectedRouter
            })}
            label="Recover"
            variant="primary"
            size="sm"
            loading={isLoading}
            theme={theme}
          />
        </div>
      </div>
    );
  };

  const sessions = Array.isArray(recoverableSessions) ? recoverableSessions : [];
  
  // Enhanced statistics based on backend capabilities
  const recoveryStats = {
    total: sessions.length,
    power_outage: sessions.filter(s => s.disconnected_reason === "power_outage").length,
    router_reboot: sessions.filter(s => s.disconnected_reason === "router_reboot").length,
    connection_loss: sessions.filter(s => s.disconnected_reason === "connection_loss").length,
    maintenance: sessions.filter(s => s.disconnected_reason === "maintenance").length,
    selected: selectedSessions.length
  };

  return (
    <CustomModal 
      isOpen={isOpen} 
      title="Enhanced Session Recovery" 
      onClose={onClose}
      size="xl"
      theme={theme}
    >
      <div className="space-y-6">
        {/* Router Selection */}
        {availableRouters.length > 0 && (
          <div className="flex items-center justify-between p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-300">Target Router</p>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Select the router where sessions will be recovered
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedRouter}
                onChange={(e) => {
                  setSelectedRouter(e.target.value);
                  setManualRecoveryData(prev => ({ ...prev, router_id: e.target.value }));
                }}
                className={`px-3 py-2 border rounded-lg text-sm ${
                  themeClasses.input
                }`}
              >
                <option value="">Select Router</option>
                {availableRouters.map(router => (
                  <option key={router.id} value={router.id}>
                    {router.name} ({router.ip}) - {router.connection_status || "Unknown"}
                  </option>
                ))}
              </select>
              {selectedRouter && (
                <CustomButton
                  onClick={() => handleTestConnection(selectedRouter)}
                  label={
                    connectionStatus[selectedRouter] === "testing" ? "Testing..." :
                    connectionStatus[selectedRouter] === "connected" ? "Connected" :
                    connectionStatus[selectedRouter] === "failed" ? "Failed" : "Test Connection"
                  }
                  variant={
                    connectionStatus[selectedRouter] === "connected" ? "success" :
                    connectionStatus[selectedRouter] === "failed" ? "danger" : "secondary"
                  }
                  size="sm"
                  loading={connectionStatus[selectedRouter] === "testing"}
                  theme={theme}
                />
              )}
            </div>
          </div>
        )}

        {/* Recovery Method Selection */}
        <div>
          <label className={`block text-sm font-medium mb-3 ${themeClasses.text.secondary}`}>
            Recovery Method
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRecoveryMethod("auto")}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                recoveryMethod === "auto"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  : `${themeClasses.border.medium} hover:border-gray-400 dark:hover:border-gray-500`
              }`}
            >
              <RefreshCw className="w-6 h-6 mx-auto mb-2" />
              <span className="font-medium">Auto Recovery</span>
              <p className={`text-xs mt-1 ${themeClasses.text.tertiary}`}>
                Recover from recent disconnections
              </p>
            </button>
            
            <button
              type="button"
              onClick={() => setRecoveryMethod("manual")}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                recoveryMethod === "manual"
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                  : `${themeClasses.border.medium} hover:border-gray-400 dark:hover:border-gray-500`
              }`}
            >
              <User className="w-6 h-6 mx-auto mb-2" />
              <span className="font-medium">Manual Recovery</span>
              <p className={`text-xs mt-1 ${themeClasses.text.tertiary}`}>
                Recover using user details
              </p>
            </button>
          </div>
        </div>

        {/* Auto Recovery Section */}
        {recoveryMethod === "auto" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-medium ${themeClasses.text.primary}`}>
                Recoverable Sessions
              </h3>
              {sessions.length > 0 && (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {selectedSessions.length === sessions.length ? "Deselect All" : "Select All"}
                  </button>
                  <CustomButton
                    onClick={handleBulkRecovery}
                    label={`Recover Selected (${selectedSessions.length})`}
                    variant="primary"
                    size="sm"
                    disabled={selectedSessions.length === 0 || !selectedRouter}
                    loading={isLoading}
                    theme={theme}
                  />
                </div>
              )}
            </div>

            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className={themeClasses.text.tertiary}>No recoverable sessions found</p>
                <p className={`text-sm ${themeClasses.text.tertiary} mt-1`}>
                  Sessions that were disconnected due to power outages, router reboots, or maintenance will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sessions.map(session => (
                  <RecoverySessionCard key={session.id} session={session} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Manual Recovery Section */}
        {recoveryMethod === "manual" && (
          <div className="space-y-4">
            <h3 className={`text-lg font-medium ${themeClasses.text.primary}`}>
              Manual Session Recovery
            </h3>
            
            <InputField
              label="Phone Number"
              value={manualRecoveryData.phone_number}
              onChange={(e) => setManualRecoveryData(prev => ({
                ...prev,
                phone_number: e.target.value
              }))}
              placeholder="Client phone number"
              icon={<User className="w-4 h-4" />}
              required
              theme={theme}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="MAC Address (for Hotspot)"
                value={manualRecoveryData.mac_address}
                onChange={(e) => setManualRecoveryData(prev => ({
                  ...prev,
                  mac_address: e.target.value
                }))}
                placeholder="00:11:22:33:44:55"
                icon={<Wifi className="w-4 h-4" />}
                theme={theme}
                subtitle="Required for hotspot recovery"
              />

              <InputField
                label="PPPoE Username"
                value={manualRecoveryData.username}
                onChange={(e) => setManualRecoveryData(prev => ({
                  ...prev,
                  username: e.target.value
                }))}
                placeholder="pppoe_username"
                icon={<Cable className="w-4 h-4" />}
                theme={theme}
                subtitle="Required for PPPoE recovery"
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Enhanced Recovery Information
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                    Provide either MAC address for hotspot recovery or PPPoE username for wired connection recovery.
                    The system will automatically detect the appropriate session and restore it with comprehensive
                    error handling and audit logging.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <CustomButton
                onClick={handleManualRecovery}
                label="Recover Session"
                variant="primary"
                loading={isLoading}
                disabled={!manualRecoveryData.phone_number || 
                  (!manualRecoveryData.mac_address && !manualRecoveryData.username) ||
                  !manualRecoveryData.router_id}
                theme={theme}
              />
            </div>
          </div>
        )}

        {/* Enhanced Recovery Statistics */}
        <div className={`p-4 rounded-lg border ${
          themeClasses.bg.card
        } ${themeClasses.border.medium}`}>
          <h4 className={`font-medium mb-3 ${themeClasses.text.primary}`}>
            Recovery Statistics
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
            <div>
              <p className={`text-sm ${themeClasses.text.tertiary}`}>Total</p>
              <p className={`text-xl font-bold ${themeClasses.text.primary}`}>
                {recoveryStats.total}
              </p>
            </div>
            <div>
              <p className={`text-sm ${themeClasses.text.tertiary}`}>Power Outages</p>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                {recoveryStats.power_outage}
              </p>
            </div>
            <div>
              <p className={`text-sm ${themeClasses.text.tertiary}`}>Router Reboots</p>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                {recoveryStats.router_reboot}
              </p>
            </div>
            <div>
              <p className={`text-sm ${themeClasses.text.tertiary}`}>Connection Loss</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {recoveryStats.connection_loss}
              </p>
            </div>
            <div>
              <p className={`text-sm ${themeClasses.text.tertiary}`}>Maintenance</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {recoveryStats.maintenance}
              </p>
            </div>
            <div>
              <p className={`text-sm ${themeClasses.text.tertiary}`}>Selected</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {recoveryStats.selected}
              </p>
            </div>
          </div>
        </div>
      </div>
    </CustomModal>
  );
};

export default SessionRecovery;