

// src/Pages/NetworkManagement/components/RouterForms/EditRouterForm.jsx
import React, { useMemo } from "react";
import { User, Globe, Router, Hash, Key, Settings, MapPin, Wifi, Users, FileText } from "lucide-react";
import CustomModal from "../Common/CustomModal";
import CustomButton from "../Common/CustomButton";
import InputField from "../Common/InputField";
import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components"

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
  activeRouter 
}) => {
  const themeClasses = getThemeClasses(theme);

  const routerTypes = [
    { value: "mikrotik", label: "MikroTik" },
    { value: "ubiquiti", label: "Ubiquiti" },
    { value: "cisco", label: "Cisco" },
    { value: "other", label: "Other" },
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

  return (
    <CustomModal 
      isOpen={isOpen} 
      title={`Edit Router: ${routerForm.name}`} 
      onClose={onClose}
      size="lg"
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
        </div>

        <div className={`flex justify-end space-x-3 pt-4 border-t ${
          themeClasses.border.light
        }`}>
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