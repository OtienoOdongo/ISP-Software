import React, { useState, useEffect } from "react";
import { 
  Shield, Server, Key, Download, Upload, CheckCircle, 
  AlertCircle, Clock, Users, Network, Settings, Zap
} from "lucide-react";
import CustomModal from "../Common/CustomModal";
import CustomButton from "../Common/CustomButton";
import InputField from "../Common/InputField";
import { getThemeClasses, EnhancedSelect } from "../../../../components/ServiceManagement/Shared/components";
import { toast } from "react-toastify";

const VPNConfiguration = ({ 
  isOpen, 
  onClose, 
  router, 
  theme = "light", 
  onConfigureVPN,
  onDisableVPN,
  isLoading = false 
}) => {
  const themeClasses = getThemeClasses(theme);
  const [vpnType, setVpnType] = useState("openvpn");
  const [vpnConfig, setVpnConfig] = useState({});
  const [vpnStatus, setVpnStatus] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const vpnTypes = {
    openvpn: {
      name: "OpenVPN",
      description: "SSL-based VPN with strong security and compatibility",
      icon: Shield,
      parameters: {
        port: { type: "number", default: 1194, min: 1, max: 65535 },
        protocol: { type: "select", options: ["udp", "tcp"], default: "udp" },
        encryption: { type: "select", options: ["aes-256-cbc", "aes-192-cbc", "aes-128-cbc"], default: "aes-256-cbc" },
        generate_certificates: { type: "boolean", default: true },
        max_clients: { type: "number", default: 10, min: 1, max: 100 },
        compression: { type: "select", options: ["none", "lzo", "lz4"], default: "none" }
      }
    },
    wireguard: {
      name: "WireGuard",
      description: "Modern, high-performance VPN with state-of-the-art cryptography",
      icon: Zap,
      parameters: {
        port: { type: "number", default: 51820, min: 1, max: 65535 },
        generate_keys: { type: "boolean", default: true },
        allowed_ips: { type: "string", default: "0.0.0.0/0" },
        persistent_keepalive: { type: "number", default: 25, min: 0, max: 300 },
        mtu: { type: "number", default: 1420, min: 576, max: 1500 }
      }
    },
    sstp: {
      name: "SSTP",
      description: "Secure Socket Tunneling Protocol with Windows compatibility",
      icon: Server,
      parameters: {
        port: { type: "number", default: 443, min: 1, max: 65535 },
        authentication: { type: "select", options: ["mschap2", "mschap1", "pap"], default: "mschap2" },
        default_profile: { type: "string", default: "default" },
        max_mru: { type: "number", default: 1460, min: 576, max: 1500 },
        max_mtu: { type: "number", default: 1460, min: 576, max: 1500 }
      }
    }
  };

  useEffect(() => {
    if (isOpen && router) {
      fetchVPNStatus();
      // Initialize with default values
      const defaultConfig = {};
      Object.entries(vpnTypes[vpnType].parameters).forEach(([key, param]) => {
        defaultConfig[key] = param.default;
      });
      setVpnConfig(defaultConfig);
    }
  }, [isOpen, router, vpnType]);

  const fetchVPNStatus = async () => {
    if (!router) return;
    
    try {
      const response = await fetch(`/api/network_management/routers/${router.id}/vpn-status/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVpnStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch VPN status:', error);
    }
  };

  const handleConfigureVPN = async () => {
    if (!router) {
      toast.error("No router selected");
      return;
    }

    try {
      const configuration = {
        vpn_type: vpnType,
        configuration: vpnConfig
      };

      const result = await onConfigureVPN(router.id, configuration);
      if (result.success) {
        toast.success(`VPN configuration applied successfully: ${result.message}`);
        onClose();
        fetchVPNStatus();
      } else {
        toast.error(`VPN configuration failed: ${result.message}`);
      }
    } catch (error) {
      toast.error("Failed to configure VPN");
    }
  };

  const handleDisableVPN = async () => {
    if (!router) {
      toast.error("No router selected");
      return;
    }

    try {
      const result = await onDisableVPN(router.id);
      if (result.success) {
        toast.success("VPN disabled successfully");
        onClose();
        fetchVPNStatus();
      } else {
        toast.error(`Failed to disable VPN: ${result.message}`);
      }
    } catch (error) {
      toast.error("Failed to disable VPN");
    }
  };

  const handleTestVPN = async () => {
    if (!router) return;
    
    setIsTesting(true);
    try {
      const response = await fetch(`/api/network_management/routers/${router.id}/test-vpn/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(`VPN test successful: ${data.message}`);
      } else {
        toast.error("VPN test failed");
      }
    } catch (error) {
      toast.error("VPN test failed");
    } finally {
      setIsTesting(false);
    }
  };

  const renderParameterInputs = () => {
    const vpnTemplate = vpnTypes[vpnType];
    if (!vpnTemplate?.parameters) return null;

    return Object.entries(vpnTemplate.parameters).map(([key, param]) => {
      if (param.type === "select") {
        return (
          <EnhancedSelect
            key={key}
            label={key.replace(/_/g, ' ').toUpperCase()}
            value={vpnConfig[key] || param.default}
            onChange={(value) => setVpnConfig(prev => ({ ...prev, [key]: value }))}
            options={param.options.map(opt => ({ value: opt, label: opt.toUpperCase() }))}
            placeholder={`Select ${key}`}
            theme={theme}
          />
        );
      } else if (param.type === "boolean") {
        return (
          <div key={key} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
            <input
              type="checkbox"
              checked={vpnConfig[key] ?? param.default}
              onChange={(e) => setVpnConfig(prev => ({ ...prev, [key]: e.target.checked }))}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label className={`text-sm ${themeClasses.text.primary}`}>
              {key.replace(/_/g, ' ').toUpperCase()}
            </label>
          </div>
        );
      } else if (param.type === "number") {
        return (
          <InputField
            key={key}
            label={key.replace(/_/g, ' ').toUpperCase()}
            type="number"
            value={vpnConfig[key] || param.default}
            onChange={(e) => setVpnConfig(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
            min={param.min}
            max={param.max}
            theme={theme}
          />
        );
      } else {
        return (
          <InputField
            key={key}
            label={key.replace(/_/g, ' ').toUpperCase()}
            value={vpnConfig[key] || param.default}
            onChange={(e) => setVpnConfig(prev => ({ ...prev, [key]: e.target.value }))}
            theme={theme}
          />
        );
      }
    });
  };

  const VPNTypeCard = ({ type, template }) => {
    const IconComponent = template.icon;
    return (
      <button
        onClick={() => setVpnType(type)}
        className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
          vpnType === type
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
            : `${themeClasses.border.medium} hover:border-gray-400 dark:hover:border-gray-500`
        }`}
      >
        <IconComponent className="w-6 h-6 mb-2" />
        <span className="font-medium block">{template.name}</span>
        <p className={`text-xs mt-1 ${themeClasses.text.tertiary}`}>
          {template.description}
        </p>
      </button>
    );
  };

  return (
    <CustomModal 
      isOpen={isOpen} 
      title="VPN Configuration" 
      onClose={onClose}
      size="xl"
      theme={theme}
    >
      <div className="space-y-6">
        {router && (
          <div className={`p-4 rounded-lg border ${
            theme === "dark" ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"
          }`}>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Configuring VPN for: <strong>{router.name}</strong> ({router.ip})
            </p>
          </div>
        )}

        {/* VPN Status */}
        {vpnStatus && (
          <div className={`p-4 rounded-lg border ${
            vpnStatus.enabled 
              ? "bg-green-100 border-green-200 dark:bg-green-900/20 dark:border-green-800"
              : "bg-gray-100 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {vpnStatus.enabled ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
                <div>
                  <p className={`font-medium ${
                    vpnStatus.enabled 
                      ? "text-green-800 dark:text-green-300" 
                      : "text-gray-800 dark:text-gray-300"
                  }`}>
                    VPN Status: {vpnStatus.enabled ? "Enabled" : "Disabled"}
                  </p>
                  {vpnStatus.enabled && (
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Type: {vpnStatus.vpn_type} • Clients: {vpnStatus.active_clients || 0}
                    </p>
                  )}
                </div>
              </div>
              {vpnStatus.enabled && (
                <div className="flex space-x-2">
                  <CustomButton
                    onClick={handleTestVPN}
                    label="Test VPN"
                    variant="secondary"
                    size="sm"
                    loading={isTesting}
                    theme={theme}
                  />
                  <CustomButton
                    onClick={handleDisableVPN}
                    label="Disable VPN"
                    variant="danger"
                    size="sm"
                    theme={theme}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* VPN Type Selection */}
        <div>
          <label className={`block text-sm font-medium mb-3 ${themeClasses.text.secondary}`}>
            VPN Protocol
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(vpnTypes).map(([type, template]) => (
              <VPNTypeCard key={type} type={type} template={template} />
            ))}
          </div>
        </div>

        {/* Configuration Parameters */}
        <div>
          <h4 className={`font-medium mb-3 ${themeClasses.text.primary}`}>
            {vpnTypes[vpnType].name} Configuration
          </h4>
          <div className="space-y-4">
            {renderParameterInputs()}
          </div>
        </div>

        {/* Security Considerations */}
        <div className={`p-4 rounded-lg border ${
          theme === "dark" ? "bg-yellow-900/20 border-yellow-800" : "bg-yellow-50 border-yellow-200"
        }`}>
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h4 className={`font-medium text-yellow-800 dark:text-yellow-300`}>
                Security Recommendations
              </h4>
              <ul className={`text-sm text-yellow-700 dark:text-yellow-400 mt-1 space-y-1`}>
                <li>• Use strong encryption algorithms (AES-256 recommended)</li>
                <li>• Change default ports for better security</li>
                <li>• Enable certificate-based authentication when possible</li>
                <li>• Regularly update VPN software and certificates</li>
                <li>• Monitor VPN connections for suspicious activity</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
          <CustomButton
            onClick={onClose}
            label="Cancel"
            variant="secondary"
            theme={theme}
          />
          <CustomButton
            onClick={handleConfigureVPN}
            label={isLoading ? "Configuring..." : "Configure VPN"}
            variant="primary"
            loading={isLoading}
            disabled={!router}
            theme={theme}
          />
        </div>
      </div>
    </CustomModal>
  );
};

export default VPNConfiguration;