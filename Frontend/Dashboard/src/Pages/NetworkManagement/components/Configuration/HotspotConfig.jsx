// src/Pages/NetworkManagement/components/Configuration/HotspotConfig.jsx
import React from "react";
import { Wifi, Globe, Zap, Clock, Upload, Settings } from "lucide-react";
import CustomModal from "../Common/CustomModal";
import CustomButton from "../Common/CustomButton";
import InputField from "../Common/InputField";

const HotspotConfig = ({ 
  isOpen, 
  onClose, 
  hotspotForm, 
  activeRouter, 
  theme, 
  onFormUpdate, 
  onSubmit,
  isLoading 
}) => {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFormUpdate({ landingPage: file });
    }
  };

  const handleSubmit = () => {
    if (!activeRouter) {
      toast.error("No active router selected");
      return;
    }
    onSubmit();
  };

  return (
    <CustomModal 
      isOpen={isOpen} 
      title="Configure Hotspot" 
      onClose={onClose}
      size="lg"
      theme={theme}
    >
      <div className="space-y-6">
        {activeRouter && (
          <div className={`p-4 rounded-lg ${
            theme === "dark" ? "bg-blue-900/20 border border-blue-800" : "bg-blue-50 border border-blue-200"
          }`}>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Configuring hotspot for: <strong>{activeRouter.name}</strong>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="SSID (Network Name)"
            value={hotspotForm.ssid}
            onChange={(e) => onFormUpdate({ ssid: e.target.value })}
            placeholder="SurfZone-WiFi"
            icon={<Wifi className="w-4 h-4" />}
            required
            theme={theme}
          />
          
          <InputField
            label="Redirect URL"
            value={hotspotForm.redirectUrl}
            onChange={(e) => onFormUpdate({ redirectUrl: e.target.value })}
            placeholder="http://captive.surfzone.local"
            icon={<Globe className="w-4 h-4" />}
            required
            theme={theme}
          />

          <InputField
            label="Bandwidth Limit"
            value={hotspotForm.bandwidthLimit}
            onChange={(e) => onFormUpdate({ bandwidthLimit: e.target.value })}
            placeholder="10M"
            icon={<Zap className="w-4 h-4" />}
            theme={theme}
            subtitle="Per user limit (e.g., 10M, 100M)"
          />

          <InputField
            label="Session Timeout (minutes)"
            type="number"
            value={hotspotForm.sessionTimeout}
            onChange={(e) => onFormUpdate({ sessionTimeout: e.target.value })}
            placeholder="60"
            icon={<Clock className="w-4 h-4" />}
            theme={theme}
          />
        </div>

        {/* Landing Page Upload */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Landing Page (HTML File)
          </label>
          <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            theme === "dark" 
              ? "border-gray-600 hover:border-gray-500 bg-gray-800/50" 
              : "border-gray-300 hover:border-gray-400 bg-gray-50"
          }`}>
            <Upload className="w-8 h-8 mx-auto mb-3 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {hotspotForm.landingPage 
                ? `Selected: ${hotspotForm.landingPage.name}`
                : "Drag and drop your HTML file here, or click to browse"
              }
            </p>
            <input
              type="file"
              accept=".html,.htm,.js"
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
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Upload the captive portal landing page (HTML/JavaScript file)
          </p>
        </div>

        {/* Authentication Method */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Authentication Method
          </label>
          <select
            value={hotspotForm.authMethod}
            onChange={(e) => onFormUpdate({ authMethod: e.target.value })}
            className={`w-full p-3 rounded-lg border transition-colors ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                : "bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
            }`}
          >
            <option value="universal">Universal (Payment-based)</option>
            <option value="voucher">Voucher-based</option>
            <option value="radius">RADIUS Authentication</option>
            <option value="mixed">Mixed Mode</option>
          </select>
        </div>

        {/* Advanced Settings */}
        <div className={`p-4 rounded-lg border ${
          theme === "dark" ? "border-gray-600 bg-gray-800" : "border-gray-300 bg-gray-50"
        }`}>
          <h4 className="font-medium mb-3 flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Advanced Settings
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={hotspotForm.enableSplashPage || false}
                onChange={(e) => onFormUpdate({ enableSplashPage: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Enable Splash Page
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={hotspotForm.allowSocialLogin || false}
                onChange={(e) => onFormUpdate({ allowSocialLogin: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Allow Social Login
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={hotspotForm.enableBandwidthShaping || false}
                onChange={(e) => onFormUpdate({ enableBandwidthShaping: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Enable Bandwidth Shaping
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={hotspotForm.logUserActivity || false}
                onChange={(e) => onFormUpdate({ logUserActivity: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Log User Activity
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <CustomButton
            onClick={onClose}
            label="Cancel"
            variant="secondary"
            disabled={isLoading}
          />
          <CustomButton
            onClick={handleSubmit}
            label={isLoading ? "Configuring..." : "Configure Hotspot"}
            variant="primary"
            disabled={isLoading || !hotspotForm.landingPage}
            loading={isLoading}
          />
        </div>
      </div>
    </CustomModal>
  );
};

export default HotspotConfig;