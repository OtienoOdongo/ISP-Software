
// src/Pages/NetworkManagement/components/Configuration/CallbackConfig.jsx
import React from "react";
import { Activity, Globe, Shield, ShieldCheck, Trash2, Plus, Clock, RefreshCw } from "lucide-react";
import CustomModal from "../Common/CustomModal"
import CustomButton from "../Common/CustomButton";
import InputField from "../Common/InputField";
import ConfirmationModal from "../Common/ConfirmationModal";
import { getThemeClasses, EnhancedSelect } from "../../../../components/ServiceManagement/Shared/components"

const CallbackConfig = ({ 
  isOpen, 
  onClose, 
  callbackForm, 
  callbackConfigs, 
  theme = "light", 
  onFormUpdate, 
  onAddCallback,
  onDeleteCallback,
  isLoading 
}) => {
  const themeClasses = getThemeClasses(theme);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(null);

  const securityLevels = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

  const events = [
    { value: "payment_received", label: "Payment Received" },
    { value: "user_connected", label: "User Connected" },
    { value: "user_disconnected", label: "User Disconnected" },
    { value: "router_offline", label: "Router Offline" },
    { value: "router_online", label: "Router Online" },
    { value: "bandwidth_exceeded", label: "Bandwidth Exceeded" },
    { value: "session_expired", label: "Session Expired" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
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

  const getSecurityLevelColor = (level) => {
    const colors = {
      low: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      medium: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      high: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    };
    return colors[level] || colors.medium;
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
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <p className={`font-medium capitalize ${themeClasses.text.primary}`}>
              {config.event.replace(/_/g, " ")}
            </p>
            <p className={`text-sm ${themeClasses.text.tertiary}`}>
              {config.callback_url}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs ${getSecurityLevelColor(config.security_level)}`}>
            {config.security_level}
          </span>
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
          <p className={themeClasses.text.tertiary}>Security</p>
          <p className={`font-medium ${themeClasses.text.primary}`}>{config.security_profile || "Default"}</p>
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
                  label="Event"
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
                placeholder="https://example.com/callback"
                icon={<Globe className="w-4 h-4" />}
                required
                theme={theme}
              />

              <InputField
                label="Security Profile"
                value={callbackForm.security_profile}
                onChange={(e) => onFormUpdate({ security_profile: e.target.value })}
                placeholder="custom-profile"
                icon={<ShieldCheck className="w-4 h-4" />}
                theme={theme}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField
                  label="Max Retries"
                  type="number"
                  value={callbackForm.max_retries}
                  onChange={(e) => onFormUpdate({ max_retries: parseInt(e.target.value) || 3 })}
                  placeholder="3"
                  icon={<RefreshCw className="w-4 h-4" />}
                  theme={theme}
                />

                <InputField
                  label="Timeout (seconds)"
                  type="number"
                  value={callbackForm.timeout_seconds}
                  onChange={(e) => onFormUpdate({ timeout_seconds: parseInt(e.target.value) || 30 })}
                  placeholder="30"
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
            <h4 className={`font-medium mb-4 ${themeClasses.text.primary}`}>Existing Callback Configurations</h4>
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