



// // src/Pages/NetworkManagement/components/RouterForms/RouterFormFields.jsx
// import React from "react";
// import { User, Globe, Router, Hash, Key, Settings, MapPin, Users, FileText } from "lucide-react";
// import InputField from "../Common/InputField";
// import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components"

// const RouterFormFields = ({ 
//   routerForm, 
//   onFormUpdate, 
//   onFieldBlur, 
//   touchedFields, 
//   formErrors, 
//   theme = "light",
//   isEdit = false 
// }) => {
//   const themeClasses = getThemeClasses(theme);

//   const routerTypes = [
//     { value: "mikrotik", label: "MikroTik" },
//     { value: "ubiquiti", label: "Ubiquiti" },
//     { value: "cisco", label: "Cisco" },
//     { value: "other", label: "Other" },
//   ];

//   return (
//     <div className="space-y-4">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <InputField
//           label="Router Name"
//           value={routerForm.name}
//           onChange={(e) => onFormUpdate({ name: e.target.value })}
//           onBlur={() => onFieldBlur('name')}
//           placeholder="Office Router"
//           icon={<User className="w-4 h-4" />}
//           required
//           error={formErrors.name}
//           touched={touchedFields.name}
//           theme={theme}
//         />
        
//         <InputField
//           label="IP Address"
//           value={routerForm.ip}
//           onChange={(e) => onFormUpdate({ ip: e.target.value })}
//           onBlur={() => onFieldBlur('ip')}
//           placeholder="192.168.1.1"
//           icon={<Globe className="w-4 h-4" />}
//           required
//           error={formErrors.ip}
//           touched={touchedFields.ip}
//           theme={theme}
//         />
        
//         <InputField
//           label="Router Type"
//           value={routerForm.type}
//           onChange={(e) => onFormUpdate({ type: e.target.value })}
//           onBlur={() => onFieldBlur('type')}
//           type="select"
//           options={routerTypes}
//           icon={<Router className="w-4 h-4" />}
//           required
//           error={formErrors.type}
//           touched={touchedFields.type}
//           theme={theme}
//         />

//         <InputField
//           label="Port"
//           type="number"
//           value={routerForm.port}
//           onChange={(e) => onFormUpdate({ port: e.target.value })}
//           placeholder="8728"
//           icon={<Hash className="w-4 h-4" />}
//           theme={theme}
//         />

//         <InputField
//           label="Username"
//           value={routerForm.username}
//           onChange={(e) => onFormUpdate({ username: e.target.value })}
//           placeholder="admin"
//           icon={<User className="w-4 h-4" />}
//           theme={theme}
//         />

//         <InputField
//           label="Password"
//           type="password"
//           value={routerForm.password}
//           onChange={(e) => onFormUpdate({ password: e.target.value })}
//           placeholder={isEdit ? "Leave blank to keep current" : "••••••••"}
//           icon={<Key className="w-4 h-4" />}
//           theme={theme}
//         />

//         <InputField
//           label="Model"
//           value={routerForm.model}
//           onChange={(e) => onFormUpdate({ model: e.target.value })}
//           placeholder="Router model"
//           icon={<Settings className="w-4 h-4" />}
//           theme={theme}
//         />

//         <InputField
//           label="Max Clients"
//           type="number"
//           value={routerForm.max_clients}
//           onChange={(e) => onFormUpdate({ max_clients: parseInt(e.target.value) || 50 })}
//           placeholder="50"
//           icon={<Users className="w-4 h-4" />}
//           theme={theme}
//         />
//       </div>

//       <InputField
//         label="Location"
//         value={routerForm.location}
//         onChange={(e) => onFormUpdate({ location: e.target.value })}
//         placeholder="Router location"
//         icon={<MapPin className="w-4 h-4" />}
//         theme={theme}
//       />

//       <InputField
//         label="Description"
//         value={routerForm.description}
//         onChange={(e) => onFormUpdate({ description: e.target.value })}
//         placeholder="Router description"
//         icon={<FileText className="w-4 h-4" />}
//         isTextArea
//         rows={3}
//         theme={theme}
//       />

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div className={`flex items-center space-x-3 p-3 rounded-lg border ${
//           themeClasses.border.light
//         }`}>
//           <input
//             type="checkbox"
//             checked={routerForm.is_default}
//             onChange={(e) => onFormUpdate({ is_default: e.target.checked })}
//             className={`w-4 h-4 text-blue-600 rounded focus:ring-2 ${
//               theme === "dark" 
//                 ? "bg-gray-700 border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600" 
//                 : "bg-gray-100 border-gray-300 focus:ring-blue-500"
//             }`}
//           />
//           <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
//             Set as default router
//           </label>
//         </div>

//         <div className={`flex items-center space-x-3 p-3 rounded-lg border ${
//           themeClasses.border.light
//         }`}>
//           <input
//             type="checkbox"
//             checked={routerForm.captive_portal_enabled}
//             onChange={(e) => onFormUpdate({ captive_portal_enabled: e.target.checked })}
//             className={`w-4 h-4 text-blue-600 rounded focus:ring-2 ${
//               theme === "dark" 
//                 ? "bg-gray-700 border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600" 
//                 : "bg-gray-100 border-gray-300 focus:ring-blue-500"
//             }`}
//           />
//           <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
//             Enable captive portal
//           </label>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RouterFormFields;







// src/Pages/NetworkManagement/components/RouterForms/RouterFormFields.jsx
import React from "react";
import { 
  User, Globe, Router, Hash, Key, Settings, MapPin, 
  Users, FileText, Wifi, Server, Cpu 
} from "lucide-react";
import InputField from "../Common/InputField";
import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components"

const RouterFormFields = ({ 
  routerForm, 
  onFormUpdate, 
  onFieldBlur, 
  touchedFields, 
  formErrors, 
  theme = "light",
  isEdit = false,
  showAdvanced = true 
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

  const generateSSID = () => {
    const baseName = routerForm.name.replace(/\s+/g, '-');
    const ssid = `${baseName}-WiFi`;
    onFormUpdate({ ssid });
  };

  return (
    <div className="space-y-4">
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
          error={formErrors.name}
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
          error={formErrors.ip}
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
          error={formErrors.type}
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
          placeholder={isEdit ? "Leave blank to keep current" : "••••••••"}
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
          <button
            type="button"
            onClick={generateSSID}
            className={`w-full px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
              theme === "dark" 
                ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500" 
                : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400"
            }`}
          >
            Generate SSID
          </button>
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

      {/* Configuration Type */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Configuration Type"
            value={routerForm.configuration_type}
            onChange={(e) => onFormUpdate({ configuration_type: e.target.value })}
            type="select"
            options={configurationTypes}
            icon={<Server className="w-4 h-4" />}
            theme={theme}
            subtitle="Service configuration type"
          />
        </div>
      )}

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`flex items-center space-x-3 p-3 rounded-lg border ${
            themeClasses.border.light
          }`}>
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

          <div className={`flex items-center space-x-3 p-3 rounded-lg border ${
            themeClasses.border.light
          }`}>
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

          <div className={`flex items-center space-x-3 p-3 rounded-lg border ${
            themeClasses.border.light
          }`}>
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
              Test connection automatically
            </label>
          </div>

          <div className={`flex items-center space-x-3 p-3 rounded-lg border ${
            themeClasses.border.light
          }`}>
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
      )}
    </div>
  );
};

export default RouterFormFields;