import React, { useState, useEffect } from "react";
import { 
  Users, Wrench, Server, Zap, CheckCircle, AlertCircle, 
  Clock, MapPin, Router, Shield, Download, Upload,
  BarChart3, Activity, Play, Pause, RefreshCw
} from "lucide-react";
import CustomModal from "../Common/CustomModal";
import CustomButton from "../Common/CustomButton";
import InputField from "../Common/InputField";
import { getThemeClasses, EnhancedSelect } from "../../../../components/ServiceManagement/Shared/components";
import { toast } from "react-toastify";

const TechnicianWorkflow = ({ 
  isOpen, 
  onClose, 
  theme = "light", 
  availableRouters = [],
  onStartWorkflow,
  onBulkWorkflow,
  isLoading = false 
}) => {
  const themeClasses = getThemeClasses(theme);
  const [workflowType, setWorkflowType] = useState("new_router_deployment");
  const [selectedRouter, setSelectedRouter] = useState("");
  const [deploymentSite, setDeploymentSite] = useState("");
  const [externalRouterConfig, setExternalRouterConfig] = useState({
    host: "",
    username: "admin",
    password: "",
    port: "8728",
    name: ""
  });
  const [workflowParameters, setWorkflowParameters] = useState({});
  const [workflowHistory, setWorkflowHistory] = useState([]);
  const [activeWorkflows, setActiveWorkflows] = useState([]);

  const workflowTemplates = {
    new_router_deployment: {
      name: "New Router Deployment",
      description: "Complete deployment and configuration of a new router",
      icon: Server,
      steps: [
        "Connect to router",
        "Configure basic settings",
        "Set up wireless interfaces",
        "Configure hotspot/PPPoE",
        "Enable security features",
        "Test connectivity",
        "Finalize configuration"
      ],
      estimatedDuration: "20-30 minutes",
      parameters: {
        setup_type: {
          type: "select",
          options: [
            { value: "hotspot", label: "Hotspot Only" },
            { value: "pppoe", label: "PPPoE Only" },
            { value: "both", label: "Hotspot & PPPoE" }
          ],
          required: true,
          default: "hotspot"
        },
        vpn_type: {
          type: "select",
          options: [
            { value: "openvpn", label: "OpenVPN" },
            { value: "wireguard", label: "WireGuard" },
            { value: "sstp", label: "SSTP" }
          ],
          required: false,
          default: "openvpn"
        }
      }
    },
    vpn_enablement: {
      name: "VPN Enablement",
      description: "Configure VPN services on existing router",
      icon: Shield,
      steps: [
        "Test router connectivity",
        "Configure VPN server",
        "Generate certificates/keys",
        "Set up firewall rules",
        "Test VPN connectivity",
        "Document configuration"
      ],
      estimatedDuration: "10-15 minutes",
      parameters: {
        vpn_type: {
          type: "select",
          options: [
            { value: "openvpn", label: "OpenVPN" },
            { value: "wireguard", label: "WireGuard" },
            { value: "sstp", label: "SSTP" }
          ],
          required: true,
          default: "openvpn"
        },
        generate_certificates: {
          type: "boolean",
          required: false,
          default: true,
          description: "Automatically generate SSL certificates"
        },
        port: {
          type: "number",
          required: false,
          default: 1194,
          description: "VPN server port"
        }
      }
    },
    troubleshooting: {
      name: "Troubleshooting",
      description: "Diagnose and resolve router issues",
      icon: Wrench,
      steps: [
        "Connection diagnostics",
        "Configuration audit",
        "Performance analysis",
        "Issue identification",
        "Automated fixes",
        "Verification testing"
      ],
      estimatedDuration: "15-45 minutes",
      parameters: {
        diagnostic_level: {
          type: "select",
          options: [
            { value: "basic", label: "Basic Diagnostics" },
            { value: "advanced", label: "Advanced Diagnostics" },
            { value: "comprehensive", label: "Comprehensive Analysis" }
          ],
          required: true,
          default: "basic"
        },
        auto_fix: {
          type: "boolean",
          required: false,
          default: true,
          description: "Automatically apply fixes when possible"
        }
      }
    }
  };

  // Fetch workflow history on component mount
  useEffect(() => {
    if (isOpen) {
      fetchWorkflowHistory();
      fetchActiveWorkflows();
    }
  }, [isOpen]);

  const fetchWorkflowHistory = async () => {
    try {
      const response = await fetch('/api/network_management/technician-deployments/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkflowHistory(data.deployments || []);
      }
    } catch (error) {
      console.error('Failed to fetch workflow history:', error);
    }
  };

  const fetchActiveWorkflows = async () => {
    try {
      const response = await fetch('/api/network_management/technician-dashboard/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setActiveWorkflows(data.recent_activities || []);
      }
    } catch (error) {
      console.error('Failed to fetch active workflows:', error);
    }
  };

  const handleStartWorkflow = async () => {
    if (!deploymentSite) {
      toast.error("Deployment site is required");
      return;
    }

    const workflowData = {
      workflow_type: workflowType,
      deployment_site: deploymentSite,
      ...workflowParameters
    };

    // Add router configuration
    if (selectedRouter) {
      workflowData.router_id = selectedRouter;
    } else {
      if (!externalRouterConfig.host) {
        toast.error("Router host is required for external routers");
        return;
      }
      workflowData.router_config = externalRouterConfig;
    }

    try {
      const result = await onStartWorkflow(workflowData);
      if (result.success) {
        toast.success(`Workflow started successfully: ${result.message}`);
        onClose();
        // Refresh history
        fetchWorkflowHistory();
        fetchActiveWorkflows();
      } else {
        toast.error(`Workflow failed: ${result.message}`);
      }
    } catch (error) {
      toast.error("Failed to start workflow");
    }
  };

  const handleBulkWorkflow = async () => {
    if (!deploymentSite) {
      toast.error("Deployment site is required");
      return;
    }

    if (availableRouters.length === 0) {
      toast.error("No routers available for bulk operation");
      return;
    }

    const routerIds = availableRouters.map(router => router.id);
    const bulkData = {
      router_ids: routerIds,
      workflow_type: workflowType,
      deployment_site: deploymentSite,
      ...workflowParameters
    };

    try {
      const result = await onBulkWorkflow(bulkData);
      toast.success(`Bulk workflow started for ${routerIds.length} routers`);
      onClose();
      fetchWorkflowHistory();
      fetchActiveWorkflows();
    } catch (error) {
      toast.error("Failed to start bulk workflow");
    }
  };

  const renderParameterInputs = () => {
    const template = workflowTemplates[workflowType];
    if (!template?.parameters) return null;

    return Object.entries(template.parameters).map(([key, param]) => {
      if (param.type === "select") {
        return (
          <EnhancedSelect
            key={key}
            label={key.replace(/_/g, ' ').toUpperCase()}
            value={workflowParameters[key] || param.default}
            onChange={(value) => setWorkflowParameters(prev => ({ ...prev, [key]: value }))}
            options={param.options}
            placeholder={`Select ${key}`}
            theme={theme}
          />
        );
      } else if (param.type === "boolean") {
        return (
          <div key={key} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
            <input
              type="checkbox"
              checked={workflowParameters[key] ?? param.default}
              onChange={(e) => setWorkflowParameters(prev => ({ ...prev, [key]: e.target.checked }))}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label className={`text-sm ${themeClasses.text.primary}`}>
              {key.replace(/_/g, ' ').toUpperCase()}
            </label>
            {param.description && (
              <span className={`text-xs ${themeClasses.text.tertiary}`}>
                {param.description}
              </span>
            )}
          </div>
        );
      } else if (param.type === "number") {
        return (
          <InputField
            key={key}
            label={key.replace(/_/g, ' ').toUpperCase()}
            type="number"
            value={workflowParameters[key] || param.default}
            onChange={(e) => setWorkflowParameters(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
            placeholder={param.description}
            theme={theme}
          />
        );
      }
      return null;
    });
  };

  const WorkflowStep = ({ step, index, total }) => (
    <div className="flex items-start space-x-3">
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'
      }`}>
        {index + 1}
      </div>
      <div className="flex-1">
        <p className={`text-sm ${themeClasses.text.primary}`}>{step}</p>
        {index < total - 1 && (
          <div className={`h-6 border-l-2 ${
            theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
          } ml-4 mt-2`}></div>
        )}
      </div>
    </div>
  );

  return (
    <CustomModal 
      isOpen={isOpen} 
      title="Technician Workflow Management" 
      onClose={onClose}
      size="xl"
      theme={theme}
    >
      <div className="space-y-6">
        {/* Workflow Type Selection */}
        <div>
          <label className={`block text-sm font-medium mb-3 ${themeClasses.text.secondary}`}>
            Workflow Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(workflowTemplates).map(([key, template]) => {
              const IconComponent = template.icon;
              return (
                <button
                  key={key}
                  onClick={() => setWorkflowType(key)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    workflowType === key
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : `${themeClasses.border.medium} hover:border-gray-400 dark:hover:border-gray-500`
                  }`}
                >
                  <IconComponent className="w-6 h-6 mb-2" />
                  <span className="font-medium block">{template.name}</span>
                  <p className={`text-xs mt-1 ${themeClasses.text.tertiary}`}>
                    {template.description}
                  </p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {template.estimatedDuration}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Deployment Site */}
        <InputField
          label="Deployment Site"
          value={deploymentSite}
          onChange={(e) => setDeploymentSite(e.target.value)}
          placeholder="Enter deployment site name"
          icon={<MapPin className="w-4 h-4" />}
          required
          theme={theme}
        />

        {/* Router Selection */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
            Target Router
          </label>
          <div className="space-y-4">
            <select
              value={selectedRouter}
              onChange={(e) => setSelectedRouter(e.target.value)}
              className={`w-full p-3 border rounded-lg ${themeClasses.input}`}
            >
              <option value="">Select existing router</option>
              {availableRouters.map(router => (
                <option key={router.id} value={router.id}>
                  {router.name} ({router.ip}) - {router.connection_status}
                </option>
              ))}
            </select>

            <div className="text-center text-gray-500">OR</div>

            {/* External Router Configuration */}
            <div className={`p-4 rounded-lg border ${themeClasses.border.medium}`}>
              <h4 className={`font-medium mb-3 ${themeClasses.text.primary}`}>
                External Router Configuration
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Host/IP"
                  value={externalRouterConfig.host}
                  onChange={(e) => setExternalRouterConfig(prev => ({ ...prev, host: e.target.value }))}
                  placeholder="192.168.1.1"
                  theme={theme}
                />
                <InputField
                  label="Port"
                  value={externalRouterConfig.port}
                  onChange={(e) => setExternalRouterConfig(prev => ({ ...prev, port: e.target.value }))}
                  placeholder="8728"
                  theme={theme}
                />
                <InputField
                  label="Username"
                  value={externalRouterConfig.username}
                  onChange={(e) => setExternalRouterConfig(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="admin"
                  theme={theme}
                />
                <InputField
                  label="Password"
                  type="password"
                  value={externalRouterConfig.password}
                  onChange={(e) => setExternalRouterConfig(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  theme={theme}
                />
                <InputField
                  label="Router Name"
                  value={externalRouterConfig.name}
                  onChange={(e) => setExternalRouterConfig(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Router identification name"
                  theme={theme}
                  className="md:col-span-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Parameters */}
        <div>
          <h4 className={`font-medium mb-3 ${themeClasses.text.primary}`}>
            Workflow Parameters
          </h4>
          <div className="space-y-4">
            {renderParameterInputs()}
          </div>
        </div>

        {/* Workflow Steps Preview */}
        <div className={`p-4 rounded-lg border ${themeClasses.border.medium}`}>
          <h4 className={`font-medium mb-3 ${themeClasses.text.primary}`}>
            Workflow Steps
          </h4>
          <div className="space-y-2">
            {workflowTemplates[workflowType]?.steps.map((step, index) => (
              <WorkflowStep
                key={index}
                step={step}
                index={index}
                total={workflowTemplates[workflowType].steps.length}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
          <CustomButton
            onClick={onClose}
            label="Cancel"
            variant="secondary"
            theme={theme}
          />
          {availableRouters.length > 0 && (
            <CustomButton
              onClick={handleBulkWorkflow}
              label={`Bulk Deploy (${availableRouters.length} routers)`}
              variant="warning"
              theme={theme}
              loading={isLoading}
            />
          )}
          <CustomButton
            onClick={handleStartWorkflow}
            label="Start Workflow"
            variant="primary"
            loading={isLoading}
            disabled={!deploymentSite || (!selectedRouter && !externalRouterConfig.host)}
            theme={theme}
          />
        </div>

        {/* Recent Activity */}
        <div className={`p-4 rounded-lg border ${themeClasses.border.medium}`}>
          <h4 className={`font-medium mb-3 ${themeClasses.text.primary}`}>
            Recent Workflows
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {workflowHistory.slice(0, 5).map((workflow, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  {workflow.success ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={themeClasses.text.primary}>
                    {workflow.workflow_type}
                  </span>
                </div>
                <span className={themeClasses.text.tertiary}>
                  {new Date(workflow.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
            {workflowHistory.length === 0 && (
              <p className={`text-sm ${themeClasses.text.tertiary} text-center py-4`}>
                No recent workflows
              </p>
            )}
          </div>
        </div>
      </div>
    </CustomModal>
  );
};

export default TechnicianWorkflow;