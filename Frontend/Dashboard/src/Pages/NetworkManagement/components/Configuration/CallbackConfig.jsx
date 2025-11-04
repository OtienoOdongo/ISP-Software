// src/Pages/NetworkManagement/components/Configuration/CallbackConfig.jsx
import React from "react";
import { Activity, Globe, Shield, ShieldCheck, Trash2, Plus, Clock, RefreshCw } from "lucide-react";
import CustomModal from "../Common/CustomModal";
import CustomButton from "../Common/CustomButton";
import InputField from "../Common/InputField";
import ConfirmationModal from "../Common/ConfirmationModal";

const CallbackConfig = ({ 
  isOpen, 
  onClose, 
  callbackForm, 
  callbackConfigs, 
  theme, 
  onFormUpdate, 
  onAddCallback,
  onDeleteCallback,
  isLoading 
}) => {
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
      theme === "dark" ? "border-gray-600 bg-gray-800" : "border-gray-300 bg-white"
    }`}>
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
            <p className="font-medium capitalize">
              {config.event.replace(/_/g, " ")}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
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
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Security</p>
          <p className="font-medium">{config.security_profile || "Default"}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Retries</p>
          <p className="font-medium flex items-center">
            <RefreshCw className="w-3 h-3 mr-1" />
            {config.max_retries}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Timeout</p>
          <p className="font-medium flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {config.timeout_seconds}s
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Status</p>
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
            theme === "dark" ? "border-gray-600 bg-gray-800" : "border-gray-300 bg-gray-50"
          }`}>
            <h4 className="font-medium mb-4 flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add New Callback
            </h4>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Event"
                  value={callbackForm.event}
                  onChange={(e) => onFormUpdate({ event: e.target.value })}
                  type="select"
                  options={events}
                  icon={<Activity className="w-4 h-4" />}
                  required
                  theme={theme}
                />

                <InputField
                  label="Security Level"
                  value={callbackForm.security_level}
                  onChange={(e) => onFormUpdate({ security_level: e.target.value })}
                  type="select"
                  options={securityLevels}
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
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={callbackForm.is_active}
                      onChange={(e) => onFormUpdate({ is_active: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      Active
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={callbackForm.retry_enabled}
                      onChange={(e) => onFormUpdate({ retry_enabled: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label className="text-sm text-gray-700 dark:text-gray-300">
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
                />
              </div>
            </form>
          </div>

          {/* Existing Callback Configurations */}
          <div>
            <h4 className="font-medium mb-4">Existing Callback Configurations</h4>
            {callbackConfigs.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No callback configurations found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
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
            theme === "dark" ? "border-gray-600 bg-gray-800" : "border-gray-300 bg-gray-50"
          }`}>
            <h4 className="font-medium mb-3">Callback Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Configs</p>
                <p className="text-xl font-bold">{callbackConfigs.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {callbackConfigs.filter(c => c.is_active).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">High Security</p>
                <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                  {callbackConfigs.filter(c => c.security_level === "high" || c.security_level === "critical").length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">With Retries</p>
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