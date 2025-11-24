









// src/Pages/NetworkManagement/components/Configuration/HotspotConfig.jsx
import React from "react";
import { Wifi, Globe, Zap, Clock, Upload, Settings, Users, Shield } from "lucide-react";
import CustomModal from "../Common/CustomModal";
import CustomButton from "../Common/CustomButton";
import InputField from "../Common/InputField";
import { getThemeClasses, EnhancedSelect } from "../../../../components/ServiceManagement/Shared/components"
import { toast } from "react-toastify";

const HotspotConfig = ({ 
  isOpen, 
  onClose, 
  hotspotForm, 
  activeRouter, 
  theme = "light", 
  onFormUpdate, 
  onSubmit,
  isLoading 
}) => {
  const themeClasses = getThemeClasses(theme);

  const authMethods = [
    { value: "universal", label: "Universal (Payment-based)" },
    { value: "voucher", label: "Voucher-based" },
    { value: "radius", label: "RADIUS Authentication" },
    { value: "mixed", label: "Mixed Mode" },
  ];

  const securityLevels = [
    { value: "low", label: "Low (Open)" },
    { value: "medium", label: "Medium (WPA2)" },
    { value: "high", label: "High (WPA3)" },
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedExtensions = ['.html', '.htm', '.js', '.css'];
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      if (!allowedExtensions.includes(`.${fileExtension}`)) {
        toast.error("Invalid file type. Please upload HTML, JS, or CSS files.");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size too large. Maximum size is 5MB.");
        return;
      }

      onFormUpdate({ landing_page_file: file });
    }
  };

  const handleSubmit = () => {
    if (!activeRouter) {
      toast.error("No active router selected");
      return;
    }

    // Validate required fields
    if (!hotspotForm.ssid) {
      toast.error("SSID is required");
      return;
    }

    onSubmit();
  };

  const removeFile = () => {
    onFormUpdate({ landing_page_file: null });
  };

  return (
    <CustomModal 
      isOpen={isOpen} 
      title="Configure Hotspot" 
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
              Configuring hotspot for: <strong>{activeRouter.name}</strong> ({activeRouter.ip})
            </p>
            {activeRouter.ssid && (
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                Current SSID: {activeRouter.ssid}
              </p>
            )}
          </div>
        )}

        {/* Basic Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="SSID (Network Name)"
            value={hotspotForm.ssid}
            onChange={(e) => onFormUpdate({ ssid: e.target.value })}
            placeholder="SurfZone-WiFi"
            icon={<Wifi className="w-4 h-4" />}
            required
            theme={theme}
            subtitle="Visible WiFi network name"
          />
          
          <InputField
            label="Redirect URL"
            value={hotspotForm.redirect_url}
            onChange={(e) => onFormUpdate({ redirect_url: e.target.value })}
            placeholder="http://captive.surfzone.local"
            icon={<Globe className="w-4 h-4" />}
            required
            theme={theme}
            subtitle="Captive portal redirect URL"
          />

          <InputField
            label="Bandwidth Limit"
            value={hotspotForm.bandwidth_limit}
            onChange={(e) => onFormUpdate({ bandwidth_limit: e.target.value })}
            placeholder="10M"
            icon={<Zap className="w-4 h-4" />}
            theme={theme}
            subtitle="Per user limit (e.g., 10M, 100M)"
          />

          <InputField
            label="Session Timeout (minutes)"
            type="number"
            value={hotspotForm.session_timeout}
            onChange={(e) => onFormUpdate({ session_timeout: parseInt(e.target.value) || 60 })}
            placeholder="60"
            icon={<Clock className="w-4 h-4" />}
            theme={theme}
            subtitle="User session duration"
          />

          <InputField
            label="Max Users"
            type="number"
            value={hotspotForm.max_users}
            onChange={(e) => onFormUpdate({ max_users: parseInt(e.target.value) || 50 })}
            placeholder="50"
            icon={<Users className="w-4 h-4" />}
            theme={theme}
            subtitle="Maximum concurrent users"
          />
        </div>

        {/* Authentication Method */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
            Authentication Method
          </label>
          <EnhancedSelect
            value={hotspotForm.auth_method}
            onChange={(value) => onFormUpdate({ auth_method: value })}
            options={authMethods}
            placeholder="Select authentication method"
            theme={theme}
          />
        </div>

        {/* Landing Page Upload */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
            Landing Page File
          </label>
          <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            theme === "dark" 
              ? "border-gray-600 hover:border-gray-500 bg-gray-800/50" 
              : "border-gray-300 hover:border-gray-400 bg-gray-50"
          } ${hotspotForm.landing_page_file ? 'border-green-500 dark:border-green-600' : ''}`}>
            <Upload className="w-8 h-8 mx-auto mb-3 text-gray-400" />
            
            {hotspotForm.landing_page_file ? (
              <div className="space-y-2">
                <p className={`text-sm font-medium ${themeClasses.text.primary}`}>
                  {hotspotForm.landing_page_file.name}
                </p>
                <p className={`text-xs ${themeClasses.text.tertiary}`}>
                  {(hotspotForm.landing_page_file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  onClick={removeFile}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Remove File
                </button>
              </div>
            ) : (
              <>
                <p className={`text-sm ${themeClasses.text.tertiary} mb-2`}>
                  Drag and drop your HTML file here, or click to browse
                </p>
                <p className={`text-xs ${themeClasses.text.tertiary} mb-3`}>
                  Supported: HTML, JS, CSS (Max 5MB)
                </p>
                <input
                  type="file"
                  accept=".html,.htm,.js,.css"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="landingPage"
                />
                <label
                  htmlFor="landingPage"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Choose File
                </label>
              </>
            )}
          </div>
        </div>

        {/* Security Settings */}
        <div className={`p-4 rounded-lg border ${themeClasses.border.medium}`}>
          <h4 className={`font-medium mb-3 flex items-center ${themeClasses.text.primary}`}>
            <Shield className="w-4 h-4 mr-2" />
            Security Settings
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                Security Level
              </label>
              <EnhancedSelect
                value={hotspotForm.security_level || "medium"}
                onChange={(value) => onFormUpdate({ security_level: value })}
                options={securityLevels}
                theme={theme}
              />
            </div>
            
            <InputField
              label="Welcome Message"
              value={hotspotForm.welcome_message}
              onChange={(e) => onFormUpdate({ welcome_message: e.target.value })}
              placeholder="Welcome to our WiFi service"
              theme={theme}
              subtitle="Displayed on captive portal"
            />
          </div>
        </div>

        {/* Advanced Settings */}
        <div className={`p-4 rounded-lg border ${themeClasses.border.medium}`}>
          <h4 className={`font-medium mb-3 flex items-center ${themeClasses.text.primary}`}>
            <Settings className="w-4 h-4 mr-2" />
            Advanced Settings
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`flex items-center space-x-3 p-3 rounded-lg border ${themeClasses.border.light}`}>
              <input
                type="checkbox"
                checked={hotspotForm.enable_splash_page || true}
                onChange={(e) => onFormUpdate({ enable_splash_page: e.target.checked })}
                className={`w-4 h-4 text-blue-600 rounded focus:ring-2 ${
                  theme === "dark" 
                    ? "bg-gray-700 border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600" 
                    : "bg-gray-100 border-gray-300 focus:ring-blue-500"
                }`}
              />
              <label className={`text-sm ${themeClasses.text.primary}`}>
                Enable Splash Page
              </label>
            </div>
            <div className={`flex items-center space-x-3 p-3 rounded-lg border ${themeClasses.border.light}`}>
              <input
                type="checkbox"
                checked={hotspotForm.allow_social_login || false}
                onChange={(e) => onFormUpdate({ allow_social_login: e.target.checked })}
                className={`w-4 h-4 text-blue-600 rounded focus:ring-2 ${
                  theme === "dark" 
                    ? "bg-gray-700 border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600" 
                    : "bg-gray-100 border-gray-300 focus:ring-blue-500"
                }`}
              />
              <label className={`text-sm ${themeClasses.text.primary}`}>
                Allow Social Login
              </label>
            </div>
            <div className={`flex items-center space-x-3 p-3 rounded-lg border ${themeClasses.border.light}`}>
              <input
                type="checkbox"
                checked={hotspotForm.enable_bandwidth_shaping || true}
                onChange={(e) => onFormUpdate({ enable_bandwidth_shaping: e.target.checked })}
                className={`w-4 h-4 text-blue-600 rounded focus:ring-2 ${
                  theme === "dark" 
                    ? "bg-gray-700 border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600" 
                    : "bg-gray-100 border-gray-300 focus:ring-blue-500"
                }`}
              />
              <label className={`text-sm ${themeClasses.text.primary}`}>
                Enable Bandwidth Shaping
              </label>
            </div>
            <div className={`flex items-center space-x-3 p-3 rounded-lg border ${themeClasses.border.light}`}>
              <input
                type="checkbox"
                checked={hotspotForm.log_user_activity || true}
                onChange={(e) => onFormUpdate({ log_user_activity: e.target.checked })}
                className={`w-4 h-4 text-blue-600 rounded focus:ring-2 ${
                  theme === "dark" 
                    ? "bg-gray-700 border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600" 
                    : "bg-gray-100 border-gray-300 focus:ring-blue-500"
                }`}
              />
              <label className={`text-sm ${themeClasses.text.primary}`}>
                Log User Activity
              </label>
            </div>
          </div>
        </div>

        {/* Auto-Apply Configuration */}
        <div className={`flex items-center space-x-3 p-4 rounded-lg border ${themeClasses.border.light}`}>
          <input
            type="checkbox"
            checked={hotspotForm.auto_apply !== false}
            onChange={(e) => onFormUpdate({ auto_apply: e.target.checked })}
            className={`w-4 h-4 text-blue-600 rounded focus:ring-2 ${
              theme === "dark" 
                ? "bg-gray-700 border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600" 
                : "bg-gray-100 border-gray-300 focus:ring-blue-500"
            }`}
          />
          <div>
            <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
              Apply Configuration Automatically
            </label>
            <p className={`text-xs ${themeClasses.text.tertiary}`}>
              Apply hotspot configuration to router immediately after saving
            </p>
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
            onClick={handleSubmit}
            label={isLoading ? "Configuring..." : "Configure Hotspot"}
            variant="primary"
            disabled={isLoading || !hotspotForm.ssid}
            loading={isLoading}
            theme={theme}
          />
        </div>
      </div>
    </CustomModal>
  );
};

export default HotspotConfig;