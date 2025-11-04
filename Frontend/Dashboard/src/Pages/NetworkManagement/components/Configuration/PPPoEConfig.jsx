// src/Pages/NetworkManagement/components/Configuration/PPPoEConfig.jsx
import React from "react";
import { Network, Globe, Gauge, Zap, Settings, Server } from "lucide-react";
import CustomModal from "../Common/CustomModal";
import CustomButton from "../Common/CustomButton";
import InputField from "../Common/InputField";

const PPPoEConfig = ({ 
  isOpen, 
  onClose, 
  pppoeForm, 
  activeRouter, 
  theme, 
  onFormUpdate, 
  onSubmit,
  isLoading 
}) => {
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
      title="Configure PPPoE Server" 
      onClose={onClose}
      size="lg"
      theme={theme}
    >
      <div className="space-y-6">
        {activeRouter && (
          <div className={`p-4 rounded-lg ${
            theme === "dark" ? "bg-green-900/20 border border-green-800" : "bg-green-50 border border-green-200"
          }`}>
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              Configuring PPPoE for: <strong>{activeRouter.name}</strong>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="IP Pool Name"
            value={pppoeForm.ip_pool}
            onChange={(e) => onFormUpdate({ ip_pool: e.target.value })}
            placeholder="pppoe-pool-1"
            icon={<Network className="w-4 h-4" />}
            required
            theme={theme}
          />
          
          <InputField
            label="Service Name"
            value={pppoeForm.service_name}
            onChange={(e) => onFormUpdate({ service_name: e.target.value })}
            placeholder="pppoe-service"
            icon={<Server className="w-4 h-4" />}
            theme={theme}
          />

          <InputField
            label="MTU (Maximum Transmission Unit)"
            type="number"
            value={pppoeForm.mtu}
            onChange={(e) => onFormUpdate({ mtu: parseInt(e.target.value) || 1492 })}
            placeholder="1492"
            icon={<Gauge className="w-4 h-4" />}
            required
            theme={theme}
          />

          <InputField
            label="Bandwidth Limit"
            value={pppoeForm.bandwidth_limit}
            onChange={(e) => onFormUpdate({ bandwidth_limit: e.target.value })}
            placeholder="10M"
            icon={<Zap className="w-4 h-4" />}
            theme={theme}
          />
        </div>

        <InputField
          label="DNS Servers"
          value={pppoeForm.dns_servers}
          onChange={(e) => onFormUpdate({ dns_servers: e.target.value })}
          placeholder="8.8.8.8,1.1.1.1"
          icon={<Globe className="w-4 h-4" />}
          required
          theme={theme}
          subtitle="Separate multiple DNS servers with commas"
        />

        {/* Authentication Settings */}
        <div className={`p-4 rounded-lg border ${
          theme === "dark" ? "border-gray-600 bg-gray-800" : "border-gray-300 bg-gray-50"
        }`}>
          <h4 className="font-medium mb-3 flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Authentication Settings
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={pppoeForm.enable_pap || false}
                onChange={(e) => onFormUpdate({ enable_pap: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                PAP Authentication
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={pppoeForm.enable_chap || false}
                onChange={(e) => onFormUpdate({ enable_chap: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                CHAP Authentication
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={pppoeForm.enable_mschap || false}
                onChange={(e) => onFormUpdate({ enable_mschap: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                MS-CHAP Authentication
              </label>
            </div>
          </div>
        </div>

        {/* Advanced PPPoE Settings */}
        <div className={`p-4 rounded-lg border ${
          theme === "dark" ? "border-gray-600 bg-gray-800" : "border-gray-300 bg-gray-50"
        }`}>
          <h4 className="font-medium mb-3">Advanced PPPoE Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Idle Timeout (seconds)"
              type="number"
              value={pppoeForm.idle_timeout || 300}
              onChange={(e) => onFormUpdate({ idle_timeout: parseInt(e.target.value) || 300 })}
              placeholder="300"
              theme={theme}
            />
            
            <InputField
              label="Session Timeout (minutes)"
              type="number"
              value={pppoeForm.session_timeout || 0}
              onChange={(e) => onFormUpdate({ session_timeout: parseInt(e.target.value) || 0 })}
              placeholder="0 (unlimited)"
              theme={theme}
            />

            <InputField
              label="Default Profile"
              value={pppoeForm.default_profile || "default"}
              onChange={(e) => onFormUpdate({ default_profile: e.target.value })}
              placeholder="default"
              theme={theme}
            />

            <InputField
              label="Interface"
              value={pppoeForm.interface || "bridge"}
              onChange={(e) => onFormUpdate({ interface: e.target.value })}
              placeholder="bridge"
              theme={theme}
            />
          </div>
        </div>

        {/* IP Pool Configuration */}
        <div className={`p-4 rounded-lg border ${
          theme === "dark" ? "border-blue-600 bg-blue-900/20" : "border-blue-300 bg-blue-50"
        }`}>
          <h4 className="font-medium mb-3 text-blue-800 dark:text-blue-300">
            IP Pool Configuration
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="IP Range Start"
              value={pppoeForm.ip_range_start || "192.168.100.10"}
              onChange={(e) => onFormUpdate({ ip_range_start: e.target.value })}
              placeholder="192.168.100.10"
              theme={theme}
            />
            
            <InputField
              label="IP Range End"
              value={pppoeForm.ip_range_end || "192.168.100.200"}
              onChange={(e) => onFormUpdate({ ip_range_end: e.target.value })}
              placeholder="192.168.100.200"
              theme={theme}
            />
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
            label={isLoading ? "Configuring..." : "Configure PPPoE"}
            variant="primary"
            disabled={isLoading}
            loading={isLoading}
          />
        </div>
      </div>
    </CustomModal>
  );
};

export default PPPoEConfig;