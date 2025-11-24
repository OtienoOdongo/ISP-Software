

// // src/Pages/NetworkManagement/components/RouterForms/EditRouterForm.jsx
// import React, { useMemo } from "react";
// import { User, Globe, Router, Hash, Key, Settings, MapPin, Wifi, Users, FileText } from "lucide-react";
// import CustomModal from "../Common/CustomModal";
// import CustomButton from "../Common/CustomButton";
// import InputField from "../Common/InputField";
// import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components"

// const EditRouterForm = ({ 
//   isOpen, 
//   onClose, 
//   routerForm, 
//   touchedFields, 
//   isLoading, 
//   theme = "light", 
//   onFormUpdate, 
//   onFieldBlur, 
//   onSubmit,
//   activeRouter 
// }) => {
//   const themeClasses = getThemeClasses(theme);

//   const routerTypes = [
//     { value: "mikrotik", label: "MikroTik" },
//     { value: "ubiquiti", label: "Ubiquiti" },
//     { value: "cisco", label: "Cisco" },
//     { value: "other", label: "Other" },
//   ];

//   const getFormErrors = useMemo(() => {
//     const errors = {};
//     if (touchedFields.name && !routerForm.name.trim()) errors.name = "Name is required";
//     if (touchedFields.ip && !routerForm.ip.trim()) errors.ip = "IP Address is required";
//     if (touchedFields.type && !routerForm.type) errors.type = "Type is required";
    
//     // IP validation
//     if (touchedFields.ip && routerForm.ip.trim()) {
//       const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
//       if (!ipRegex.test(routerForm.ip)) {
//         errors.ip = "Invalid IP address format";
//       }
//     }
    
//     return errors;
//   }, [routerForm, touchedFields]);

//   const isFormValid = useMemo(() => 
//     routerForm.name.trim() && 
//     routerForm.ip.trim() && 
//     routerForm.type && 
//     !getFormErrors.ip,
//     [routerForm, getFormErrors]
//   );

//   return (
//     <CustomModal 
//       isOpen={isOpen} 
//       title={`Edit Router: ${routerForm.name}`} 
//       onClose={onClose}
//       size="lg"
//       theme={theme}
//     >
//       <div className="space-y-6">
//         {Object.keys(getFormErrors).length > 0 && (
//           <div className={`p-4 rounded-lg border ${
//             theme === "dark" 
//               ? "bg-red-900/30 border-red-800 text-red-300" 
//               : "bg-red-50 border-red-200 text-red-700"
//           }`}>
//             <p className="text-sm font-medium mb-2">
//               Please fix the following errors:
//             </p>
//             <ul className="text-sm space-y-1">
//               {Object.values(getFormErrors).map((error, i) => (
//                 <li key={i}>• {error}</li>
//               ))}
//             </ul>
//           </div>
//         )}

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <InputField
//             label="Router Name"
//             value={routerForm.name}
//             onChange={(e) => onFormUpdate({ name: e.target.value })}
//             onBlur={() => onFieldBlur('name')}
//             placeholder="Office Router"
//             icon={<User className="w-4 h-4" />}
//             required
//             error={getFormErrors.name}
//             touched={touchedFields.name}
//             theme={theme}
//           />
          
//           <InputField
//             label="IP Address"
//             value={routerForm.ip}
//             onChange={(e) => onFormUpdate({ ip: e.target.value })}
//             onBlur={() => onFieldBlur('ip')}
//             placeholder="192.168.1.1"
//             icon={<Globe className="w-4 h-4" />}
//             required
//             error={getFormErrors.ip}
//             touched={touchedFields.ip}
//             theme={theme}
//           />
          
//           <InputField
//             label="Router Type"
//             value={routerForm.type}
//             onChange={(e) => onFormUpdate({ type: e.target.value })}
//             onBlur={() => onFieldBlur('type')}
//             type="select"
//             options={routerTypes}
//             icon={<Router className="w-4 h-4" />}
//             required
//             error={getFormErrors.type}
//             touched={touchedFields.type}
//             theme={theme}
//           />

//           <InputField
//             label="Port"
//             type="number"
//             value={routerForm.port}
//             onChange={(e) => onFormUpdate({ port: e.target.value })}
//             placeholder="8728"
//             icon={<Hash className="w-4 h-4" />}
//             theme={theme}
//           />

//           <InputField
//             label="Username"
//             value={routerForm.username}
//             onChange={(e) => onFormUpdate({ username: e.target.value })}
//             placeholder="admin"
//             icon={<User className="w-4 h-4" />}
//             theme={theme}
//           />

//           <InputField
//             label="Password"
//             type="password"
//             value={routerForm.password}
//             onChange={(e) => onFormUpdate({ password: e.target.value })}
//             placeholder="Leave blank to keep current"
//             icon={<Key className="w-4 h-4" />}
//             theme={theme}
//           />

//           <InputField
//             label="Model"
//             value={routerForm.model}
//             onChange={(e) => onFormUpdate({ model: e.target.value })}
//             placeholder="Router model"
//             icon={<Settings className="w-4 h-4" />}
//             theme={theme}
//           />

//           <InputField
//             label="Max Clients"
//             type="number"
//             value={routerForm.max_clients}
//             onChange={(e) => onFormUpdate({ max_clients: parseInt(e.target.value) || 50 })}
//             placeholder="50"
//             icon={<Users className="w-4 h-4" />}
//             theme={theme}
//           />
//         </div>

//         <InputField
//           label="Location"
//           value={routerForm.location}
//           onChange={(e) => onFormUpdate({ location: e.target.value })}
//           placeholder="Router location"
//           icon={<MapPin className="w-4 h-4" />}
//           theme={theme}
//         />

//         <InputField
//           label="Description"
//           value={routerForm.description}
//           onChange={(e) => onFormUpdate({ description: e.target.value })}
//           placeholder="Router description"
//           icon={<FileText className="w-4 h-4" />}
//           isTextArea
//           rows={3}
//           theme={theme}
//         />

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className={`flex items-center space-x-3 p-3 rounded-lg border ${
//             themeClasses.border.light
//           }`}>
//             <input
//               type="checkbox"
//               checked={routerForm.is_default}
//               onChange={(e) => onFormUpdate({ is_default: e.target.checked })}
//               className={`w-4 h-4 text-blue-600 rounded focus:ring-2 ${
//                 theme === "dark" 
//                   ? "bg-gray-700 border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600" 
//                   : "bg-gray-100 border-gray-300 focus:ring-blue-500"
//               }`}
//             />
//             <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
//               Set as default router
//             </label>
//           </div>

//           <div className={`flex items-center space-x-3 p-3 rounded-lg border ${
//             themeClasses.border.light
//           }`}>
//             <input
//               type="checkbox"
//               checked={routerForm.captive_portal_enabled}
//               onChange={(e) => onFormUpdate({ captive_portal_enabled: e.target.checked })}
//               className={`w-4 h-4 text-blue-600 rounded focus:ring-2 ${
//                 theme === "dark" 
//                   ? "bg-gray-700 border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600" 
//                   : "bg-gray-100 border-gray-300 focus:ring-blue-500"
//               }`}
//             />
//             <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
//               Enable captive portal
//             </label>
//           </div>
//         </div>

//         <div className={`flex justify-end space-x-3 pt-4 border-t ${
//           themeClasses.border.light
//         }`}>
//           <CustomButton
//             onClick={onClose}
//             label="Cancel"
//             variant="secondary"
//             disabled={isLoading}
//             theme={theme}
//           />
//           <CustomButton
//             onClick={onSubmit}
//             label={isLoading ? "Updating..." : "Update Router"}
//             variant="primary"
//             disabled={isLoading || !isFormValid}
//             loading={isLoading}
//             theme={theme}
//           />
//         </div>
//       </div>
//     </CustomModal>
//   );
// };

// export default EditRouterForm;











// src/Pages/NetworkManagement/components/RouterForms/EditRouterForm.jsx
import React, { useMemo } from "react";
import { 
  User, Globe, Router, Hash, Key, Settings, MapPin, 
  Wifi, Users, FileText, TestTube, Cpu, Server, RefreshCw 
} from "lucide-react";
import CustomModal from "../Common/CustomModal";
import CustomButton from "../Common/CustomButton";
import InputField from "../Common/InputField";
import { getThemeClasses, EnhancedSelect } from "../../../../components/ServiceManagement/Shared/components"

const EditRouterForm = ({ 
  isOpen, 
  onClose, 
  routerForm, 
  touchedFields, 
  isLoading, 
  theme = "light", 
  onFormUpdate, 
  onFieldBlur, 
  onSubmit,
  activeRouter,
  onTestConnection 
}) => {
  const themeClasses = getThemeClasses(theme);

  const routerTypes = [
    { value: "mikrotik", label: "MikroTik" },
    { value: "ubiquiti", label: "Ubiquiti" },
    { value: "cisco", label: "Cisco" },
    { value: "other", label: "Other" },
  ];

  const configurationTypes = [
    { value: "", label: "Not Configured" },
    { value: "hotspot", label: "Hotspot" },
    { value: "pppoe", label: "PPPoE" },
    { value: "both", label: "Hotspot & PPPoE" },
    { value: "vpn", label: "VPN" },
  ];

  const connectionStatuses = [
    { value: "connected", label: "Connected" },
    { value: "disconnected", label: "Disconnected" },
  ];

  const configurationStatuses = [
    { value: "not_configured", label: "Not Configured" },
    { value: "partially_configured", label: "Partially Configured" },
    { value: "configured", label: "Configured" },
    { value: "configuration_failed", label: "Configuration Failed" },
  ];

  const getFormErrors = useMemo(() => {
    const errors = {};
    if (touchedFields.name && !routerForm.name.trim()) errors.name = "Name is required";
    if (touchedFields.ip && !routerForm.ip.trim()) errors.ip = "IP Address is required";
    if (touchedFields.type && !routerForm.type) errors.type = "Type is required";
    
    // IP validation
    if (touchedFields.ip && routerForm.ip.trim()) {
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipRegex.test(routerForm.ip)) {
        errors.ip = "Invalid IP address format";
      }
    }
    
    return errors;
  }, [routerForm, touchedFields]);

  const isFormValid = useMemo(() => 
    routerForm.name.trim() && 
    routerForm.ip.trim() && 
    routerForm.type && 
    !getFormErrors.ip,
    [routerForm, getFormErrors]
  );

  const handleTestConnection = async () => {
    if (activeRouter?.id) {
      await onTestConnection(activeRouter.id);
    }
  };

  const generateSSID = () => {
    const baseName = routerForm.name.replace(/\s+/g, '-');
    const ssid = `${baseName}-WiFi`;
    onFormUpdate({ ssid });
  };

  return (
    <CustomModal 
      isOpen={isOpen} 
      title={`Edit Router: ${routerForm.name}`} 
      onClose={onClose}
      size="xl"
      theme={theme}
    >
      <div className="space-y-6">
        {Object.keys(getFormErrors).length > 0 && (
          <div className={`p-4 rounded-lg border ${
            theme === "dark" 
              ? "bg-red-900/30 border-red-800 text-red-300" 
              : "bg-red-50 border-red-200 text-red-700"
          }`}>
            <p className="text-sm font-medium mb-2">
              Please fix the following errors:
            </p>
            <ul className="text-sm space-y-1">
              {Object.values(getFormErrors).map((error, i) => (
                <li key={i}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Connection & Configuration Status */}
        <div className={`p-4 rounded-lg border ${
          theme === "dark" ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"
        }`}>
          <div className="flex justify-between items-center mb-3">
            <h4 className={`font-medium flex items-center ${themeClasses.text.primary}`}>
              <Server className="w-4 h-4 mr-2" />
              Connection & Configuration
            </h4>
            <CustomButton
              onClick={handleTestConnection}
              icon={<RefreshCw className="w-4 h-4" />}
              label="Test Connection"
              variant="secondary"
              size="sm"
              theme={theme}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                Connection Status
              </label>
              <EnhancedSelect
                value={routerForm.connection_status}
                onChange={(value) => onFormUpdate({ connection_status: value })}
                options={connectionStatuses}
                theme={theme}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                Configuration Status
              </label>
              <EnhancedSelect
                value={routerForm.configuration_status}
                onChange={(value) => onFormUpdate({ configuration_status: value })}
                options={configurationStatuses}
                theme={theme}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                Configuration Type
              </label>
              <EnhancedSelect
                value={routerForm.configuration_type}
                onChange={(value) => onFormUpdate({ configuration_type: value })}
                options={configurationTypes}
                placeholder="Select configuration type"
                theme={theme}
              />
            </div>
          </div>

          {/* Firmware Version */}
          {routerForm.firmware_version && (
            <div className="mt-3">
              <label className={`block text-sm font-medium ${themeClasses.text.secondary}`}>
                Firmware Version
              </label>
              <p className={`text-sm ${themeClasses.text.primary}`}>
                {routerForm.firmware_version}
              </p>
            </div>
          )}
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Router Name"
            value={routerForm.name}
            onChange={(e) => onFormUpdate({ name: e.target.value })}
            onBlur={() => onFieldBlur('name')}
            placeholder="Office Router"
            icon={<User className="w-4 h-4" />}
            required
            error={getFormErrors.name}
            touched={touchedFields.name}
            theme={theme}
          />
          
          <InputField
            label="IP Address"
            value={routerForm.ip}
            onChange={(e) => onFormUpdate({ ip: e.target.value })}
            onBlur={() => onFieldBlur('ip')}
            placeholder="192.168.1.1"
            icon={<Globe className="w-4 h-4" />}
            required
            error={getFormErrors.ip}
            touched={touchedFields.ip}
            theme={theme}
          />
          
          <InputField
            label="Router Type"
            value={routerForm.type}
            onChange={(e) => onFormUpdate({ type: e.target.value })}
            onBlur={() => onFieldBlur('type')}
            type="select"
            options={routerTypes}
            icon={<Router className="w-4 h-4" />}
            required
            error={getFormErrors.type}
            touched={touchedFields.type}
            theme={theme}
          />

          <InputField
            label="Port"
            type="number"
            value={routerForm.port}
            onChange={(e) => onFormUpdate({ port: e.target.value })}
            placeholder="8728"
            icon={<Hash className="w-4 h-4" />}
            theme={theme}
          />

          <InputField
            label="Username"
            value={routerForm.username}
            onChange={(e) => onFormUpdate({ username: e.target.value })}
            placeholder="admin"
            icon={<User className="w-4 h-4" />}
            theme={theme}
          />

          <InputField
            label="Password"
            type="password"
            value={routerForm.password}
            onChange={(e) => onFormUpdate({ password: e.target.value })}
            placeholder="Leave blank to keep current"
            icon={<Key className="w-4 h-4" />}
            theme={theme}
          />

          <InputField
            label="Model"
            value={routerForm.model}
            onChange={(e) => onFormUpdate({ model: e.target.value })}
            placeholder="Router model"
            icon={<Settings className="w-4 h-4" />}
            theme={theme}
          />

          <InputField
            label="Max Clients"
            type="number"
            value={routerForm.max_clients}
            onChange={(e) => onFormUpdate({ max_clients: parseInt(e.target.value) || 50 })}
            placeholder="50"
            icon={<Users className="w-4 h-4" />}
            theme={theme}
          />
        </div>

        {/* SSID Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="SSID (WiFi Name)"
            value={routerForm.ssid}
            onChange={(e) => onFormUpdate({ ssid: e.target.value })}
            placeholder="Office-WiFi"
            icon={<Wifi className="w-4 h-4" />}
            theme={theme}
            subtitle="Wireless network name"
          />
          
          <div className="flex items-end">
            <CustomButton
              onClick={generateSSID}
              label="Generate SSID"
              variant="secondary"
              size="sm"
              theme={theme}
              className="w-full"
            />
          </div>
        </div>

        <InputField
          label="Location"
          value={routerForm.location}
          onChange={(e) => onFormUpdate({ location: e.target.value })}
          placeholder="Router location"
          icon={<MapPin className="w-4 h-4" />}
          theme={theme}
        />

        <InputField
          label="Description"
          value={routerForm.description}
          onChange={(e) => onFormUpdate({ description: e.target.value })}
          placeholder="Router description"
          icon={<FileText className="w-4 h-4" />}
          isTextArea
          rows={3}
          theme={theme}
        />

        {/* Advanced Settings */}
        <div className={`p-4 rounded-lg border ${themeClasses.border.medium}`}>
          <h4 className={`font-medium mb-3 flex items-center ${themeClasses.text.primary}`}>
            <Cpu className="w-4 h-4 mr-2" />
            Advanced Settings
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`flex items-center space-x-3 p-3 rounded-lg border ${themeClasses.border.light}`}>
              <input
                type="checkbox"
                checked={routerForm.is_default}
                onChange={(e) => onFormUpdate({ is_default: e.target.checked })}
                className={`w-4 h-4 text-blue-600 rounded focus:ring-2 ${
                  theme === "dark" 
                    ? "bg-gray-700 border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600" 
                    : "bg-gray-100 border-gray-300 focus:ring-blue-500"
                }`}
              />
              <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
                Set as default router
              </label>
            </div>

            <div className={`flex items-center space-x-3 p-3 rounded-lg border ${themeClasses.border.light}`}>
              <input
                type="checkbox"
                checked={routerForm.captive_portal_enabled}
                onChange={(e) => onFormUpdate({ captive_portal_enabled: e.target.checked })}
                className={`w-4 h-4 text-blue-600 rounded focus:ring-2 ${
                  theme === "dark" 
                    ? "bg-gray-700 border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600" 
                    : "bg-gray-100 border-gray-300 focus:ring-blue-500"
                }`}
              />
              <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
                Enable captive portal
              </label>
            </div>

            <div className={`flex items-center space-x-3 p-3 rounded-lg border ${themeClasses.border.light}`}>
              <input
                type="checkbox"
                checked={routerForm.auto_test_connection}
                onChange={(e) => onFormUpdate({ auto_test_connection: e.target.checked })}
                className={`w-4 h-4 text-blue-600 rounded focus:ring-2 ${
                  theme === "dark" 
                    ? "bg-gray-700 border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600" 
                    : "bg-gray-100 border-gray-300 focus:ring-blue-500"
                }`}
              />
              <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
                <div className="flex items-center">
                  <TestTube className="w-4 h-4 mr-2" />
                  Test connection on save
                </div>
              </label>
            </div>

            <div className={`flex items-center space-x-3 p-3 rounded-lg border ${themeClasses.border.light}`}>
              <input
                type="checkbox"
                checked={routerForm.is_active}
                onChange={(e) => onFormUpdate({ is_active: e.target.checked })}
                className={`w-4 h-4 text-blue-600 rounded focus:ring-2 ${
                  theme === "dark" 
                    ? "bg-gray-700 border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600" 
                    : "bg-gray-100 border-gray-300 focus:ring-blue-500"
                }`}
              />
              <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
                Active router
              </label>
            </div>
          </div>
        </div>

        <div className={`flex justify-end space-x-3 pt-4 border-t ${themeClasses.border.light}`}>
          <CustomButton
            onClick={onClose}
            label="Cancel"
            variant="secondary"
            disabled={isLoading}
            theme={theme}
          />
          <CustomButton
            onClick={onSubmit}
            label={isLoading ? "Updating..." : "Update Router"}
            variant="primary"
            disabled={isLoading || !isFormValid}
            loading={isLoading}
            theme={theme}
          />
        </div>
      </div>
    </CustomModal>
  );
};

export default EditRouterForm;