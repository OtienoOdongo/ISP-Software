// src/Pages/NetworkManagement/components/Configuration/ScriptConfigurationModal.jsx
import React, { useState, useEffect } from 'react';
import { Zap, Play, FileText, Settings, AlertTriangle, CheckCircle } from 'lucide-react';
import CustomModal from '../Common/CustomModal';
import CustomButton from '../Common/CustomButton';
import InputField from '../Common/InputField';
import { getThemeClasses, EnhancedSelect } from '../../../../components/ServiceManagement/Shared/components';
import { toast } from 'react-toastify';

const ScriptConfigurationModal = ({ 
  isOpen, 
  onClose, 
  router, 
  theme = "light", 
  scriptForm, 
  onFormUpdate, 
  onExecuteScript,
  isLoading,
  availableScripts = [] 
}) => {
  const themeClasses = getThemeClasses(theme);
  const [selectedScript, setSelectedScript] = useState(scriptForm.script_type || 'basic_setup');

  const scriptTypes = [
    { value: 'basic_setup', label: 'Basic Router Setup', description: 'Configure basic router settings and enable API access' },
    { value: 'hotspot_setup', label: 'Hotspot Setup', description: 'Configure wireless hotspot with captive portal' },
    { value: 'pppoe_setup', label: 'PPPoE Setup', description: 'Configure PPPoE server for user authentication' },
    { value: 'full_setup', label: 'Full Setup', description: 'Complete setup with both hotspot and PPPoE' },
  ];

  const getScriptParameters = (scriptType) => {
    const parameters = {
      basic_setup: [
        { name: 'router_name', label: 'Router Name', type: 'text', required: true, value: router?.name || '' }
      ],
      hotspot_setup: [
        { name: 'ssid', label: 'SSID', type: 'text', required: true, value: router?.ssid || `${router?.name}-WiFi` },
        { name: 'bandwidth_limit', label: 'Bandwidth Limit', type: 'text', required: false, value: '10M' },
        { name: 'session_timeout', label: 'Session Timeout (min)', type: 'number', required: false, value: 60 }
      ],
      pppoe_setup: [
        { name: 'service_name', label: 'Service Name', type: 'text', required: true, value: `${router?.name}-PPPoE` },
        { name: 'bandwidth_limit', label: 'Bandwidth Limit', type: 'text', required: false, value: '10M' },
        { name: 'mtu', label: 'MTU', type: 'number', required: false, value: 1492 }
      ],
      full_setup: [
        { name: 'router_name', label: 'Router Name', type: 'text', required: true, value: router?.name || '' },
        { name: 'ssid', label: 'SSID', type: 'text', required: true, value: router?.ssid || `${router?.name}-WiFi` },
        { name: 'service_name', label: 'PPPoE Service Name', type: 'text', required: true, value: `${router?.name}-PPPoE` }
      ]
    };
    return parameters[scriptType] || [];
  };

  const handleScriptChange = (scriptType) => {
    setSelectedScript(scriptType);
    onFormUpdate({ script_type: scriptType });
    
    // Set default parameters
    const parameters = {};
    getScriptParameters(scriptType).forEach(param => {
      parameters[param.name] = param.value;
    });
    onFormUpdate({ parameters });
  };

  const handleParameterChange = (paramName, value) => {
    const currentParams = scriptForm.parameters || {};
    onFormUpdate({ 
      parameters: { ...currentParams, [paramName]: value } 
    });
  };

  const handleExecute = () => {
    if (!router) {
      toast.error('No router selected');
      return;
    }

    const requiredParams = getScriptParameters(selectedScript).filter(p => p.required);
    const missingParams = requiredParams.filter(p => !scriptForm.parameters?.[p.name]);

    if (missingParams.length > 0) {
      toast.error(`Missing required parameters: ${missingParams.map(p => p.label).join(', ')}`);
      return;
    }

    onExecuteScript(router.id, {
      script_type: selectedScript,
      parameters: scriptForm.parameters || {},
      dry_run: scriptForm.dry_run || false
    });
  };

  const currentScript = scriptTypes.find(s => s.value === selectedScript);
  const parameters = getScriptParameters(selectedScript);

  return (
    <CustomModal 
      isOpen={isOpen} 
      title="Script-Based Configuration" 
      onClose={onClose}
      size="lg"
      theme={theme}
    >
      <div className="space-y-6">
        {router && (
          <div className={`p-4 rounded-lg border ${
            theme === "dark" ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"
          }`}>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Configuring: <strong>{router.name}</strong> ({router.ip})
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
              Current Status: {router.connection_status} • {router.configuration_status}
            </p>
          </div>
        )}

        {/* Script Selection */}
        <div>
          <label className={`block text-sm font-medium mb-3 ${themeClasses.text.secondary}`}>
            Select Configuration Script
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scriptTypes.map((script) => (
              <div
                key={script.value}
                onClick={() => handleScriptChange(script.value)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedScript === script.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : `${themeClasses.border.medium} hover:border-gray-400 dark:hover:border-gray-500`
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    selectedScript === script.value 
                      ? 'bg-blue-100 dark:bg-blue-800' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      selectedScript === script.value 
                        ? 'text-blue-900 dark:text-blue-100' 
                        : themeClasses.text.primary
                    }`}>
                      {script.label}
                    </h4>
                    <p className={`text-xs mt-1 ${
                      selectedScript === script.value 
                        ? 'text-blue-700 dark:text-blue-300' 
                        : themeClasses.text.tertiary
                    }`}>
                      {script.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Script Description */}
        {currentScript && (
          <div className={`p-4 rounded-lg border ${
            theme === "dark" ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"
          }`}>
            <h4 className={`font-medium mb-2 flex items-center ${themeClasses.text.primary}`}>
              <FileText className="w-4 h-4 mr-2" />
              {currentScript.label}
            </h4>
            <p className={`text-sm ${themeClasses.text.secondary}`}>
              {currentScript.description}
            </p>
            <div className="mt-2 flex items-center text-sm">
              <AlertTriangle className="w-4 h-4 text-yellow-500 mr-1" />
              <span className={themeClasses.text.tertiary}>
                Estimated duration: {
                  selectedScript === 'basic_setup' ? '2-5 minutes' :
                  selectedScript === 'hotspot_setup' ? '5-10 minutes' :
                  selectedScript === 'pppoe_setup' ? '3-7 minutes' :
                  '10-15 minutes'
                }
              </span>
            </div>
          </div>
        )}

        {/* Script Parameters */}
        {parameters.length > 0 && (
          <div>
            <h4 className={`font-medium mb-3 flex items-center ${themeClasses.text.primary}`}>
              <Settings className="w-4 h-4 mr-2" />
              Configuration Parameters
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parameters.map((param) => (
                <InputField
                  key={param.name}
                  label={param.label}
                  type={param.type}
                  value={scriptForm.parameters?.[param.name] || param.value}
                  onChange={(e) => handleParameterChange(param.name, e.target.value)}
                  placeholder={param.label}
                  required={param.required}
                  theme={theme}
                />
              ))}
            </div>
          </div>
        )}

        {/* Dry Run Option */}
        <div className={`flex items-center space-x-3 p-4 rounded-lg border ${themeClasses.border.light}`}>
          <input
            type="checkbox"
            checked={scriptForm.dry_run || false}
            onChange={(e) => onFormUpdate({ dry_run: e.target.checked })}
            className={`w-4 h-4 text-blue-600 rounded focus:ring-2 ${
              theme === "dark" 
                ? "bg-gray-700 border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600" 
                : "bg-gray-100 border-gray-300 focus:ring-blue-500"
            }`}
          />
          <div>
            <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
              Dry Run (Simulation)
            </label>
            <p className={`text-xs ${themeClasses.text.tertiary}`}>
              Test the script without applying changes to the router
            </p>
          </div>
        </div>

        {/* Warnings */}
        {!scriptForm.dry_run && (
          <div className={`p-4 rounded-lg border ${
            theme === "dark" ? "bg-yellow-900/20 border-yellow-800" : "bg-yellow-50 border-yellow-200"
          }`}>
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h4 className={`font-medium text-yellow-800 dark:text-yellow-300`}>
                  Important Notice
                </h4>
                <ul className={`text-sm text-yellow-700 dark:text-yellow-400 mt-1 space-y-1`}>
                  <li>• This will modify your router configuration</li>
                  <li>• Ensure you have a backup before proceeding</li>
                  <li>• Some changes may require router restart</li>
                  <li>• Check prerequisites in script documentation</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className={`flex justify-end space-x-3 pt-4 border-t ${themeClasses.border.light}`}>
          <CustomButton
            onClick={onClose}
            label="Cancel"
            variant="secondary"
            disabled={isLoading}
            theme={theme}
          />
          <CustomButton
            onClick={handleExecute}
            label={
              isLoading 
                ? "Executing..." 
                : scriptForm.dry_run 
                  ? "Test Script (Dry Run)" 
                  : `Execute ${currentScript?.label}`
            }
            icon={scriptForm.dry_run ? <FileText className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            variant={scriptForm.dry_run ? "secondary" : "primary"}
            disabled={isLoading}
            loading={isLoading}
            theme={theme}
          />
        </div>
      </div>
    </CustomModal>
  );
};

export default ScriptConfigurationModal;