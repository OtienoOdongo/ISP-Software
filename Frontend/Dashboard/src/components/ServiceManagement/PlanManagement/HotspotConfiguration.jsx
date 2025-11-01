


import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { EnhancedSelect, getThemeClasses } from "../Shared/components";
import { 
  speedUnits, 
  dataLimitPresets,
  usageLimitPresets,
  validityPeriodPresets,
  deviceLimitOptions,
  sessionTimeoutOptions,
  idleTimeoutOptions,
  bandwidthPresets
} from "../Shared/constant"
import { Users, Clock, Shield, Calendar, Wifi, Database, Zap, Gauge, Smartphone, Globe, Infinity as InfinityIcon } from "lucide-react";

const HotspotConfiguration = ({ form, errors, onChange, onNestedChange, theme }) => {
  const themeClasses = getThemeClasses(theme);
  const hotspot = form.accessMethods.hotspot;

  // State for preset selections
  const [dataLimitPreset, setDataLimitPreset] = useState('custom');
  const [usageLimitPreset, setUsageLimitPreset] = useState('custom');
  const [validityPreset, setValidityPreset] = useState('custom');
  const [bandwidthPreset, setBandwidthPreset] = useState('custom');
  const [bandwidthUnit, setBandwidthUnit] = useState('Mbps');

  // Reset validity period when component mounts to remove 720 hours default
  useEffect(() => {
    if (hotspot.validityPeriod.value === 720 && hotspot.validityPeriod.unit === 'Hours') {
      onNestedChange('hotspot', 'validityPeriod', 'value', '');
    }
  }, []);

  // Auto-suggest DNS servers based on user type
  const getSuggestedDNS = () => {
    return ["8.8.8.8", "1.1.1.1"]; // Google + Cloudflare
  };

  const handleToggle = () => {
    onChange('hotspot', 'enabled', !hotspot.enabled);
  };

  const renderUnitDropdown = (field, value, onChange, units) => (
    <EnhancedSelect
      value={value}
      onChange={(newValue) => onChange('hotspot', field, 'unit', newValue)}
      options={units.map(unit => ({ value: unit, label: unit }))}
      className="text-xs min-w-20"
      theme={theme}
    />
  );

  // Handle preset selections
  const handleDataLimitPreset = (presetKey) => {
    setDataLimitPreset(presetKey);
    if (presetKey !== 'custom') {
      const preset = dataLimitPresets.find(p => p.value === presetKey);
      if (preset) {
        onNestedChange('hotspot', 'dataLimit', 'value', preset.value);
        onNestedChange('hotspot', 'dataLimit', 'unit', preset.unit);
      }
    } else {
      // Reset to empty when switching to custom
      onNestedChange('hotspot', 'dataLimit', 'value', '');
    }
  };

  const handleUsageLimitPreset = (presetKey) => {
    setUsageLimitPreset(presetKey);
    if (presetKey !== 'custom') {
      const preset = usageLimitPresets.find(p => p.value === presetKey);
      if (preset) {
        onNestedChange('hotspot', 'usageLimit', 'value', preset.value);
        onNestedChange('hotspot', 'usageLimit', 'unit', preset.unit);
      }
    } else {
      // Reset to empty when switching to custom
      onNestedChange('hotspot', 'usageLimit', 'value', '');
    }
  };

  const handleValidityPreset = (presetKey) => {
    setValidityPreset(presetKey);
    if (presetKey !== 'custom') {
      const preset = validityPeriodPresets.find(p => p.value === presetKey);
      if (preset) {
        onNestedChange('hotspot', 'validityPeriod', 'value', preset.value);
        onNestedChange('hotspot', 'validityPeriod', 'unit', preset.unit);
      }
    } else {
      // Reset to empty when switching to custom
      onNestedChange('hotspot', 'validityPeriod', 'value', '');
    }
  };

  const handleBandwidthPreset = (presetKey) => {
    setBandwidthPreset(presetKey);
    if (presetKey !== 'custom') {
      const preset = bandwidthPresets.find(p => p.value === parseInt(presetKey));
      if (preset) {
        onChange('hotspot', 'bandwidthLimit', preset.value);
      }
    }
  };

  // Function to convert Mbps to Kbps
  const convertToKbps = (value, unit) => {
    if (unit === 'Mbps') {
      return parseFloat(value) * 1000 || 0;
    }
    return parseFloat(value) || 0;
  };

  // Helper to format time for display
  const formatTimeDisplay = (seconds) => {
    if (seconds === 0) return "No Limit";
    const hours = seconds / 3600;
    if (hours >= 24) {
      const days = hours / 24;
      return days === 1 ? "1 Day" : `${days} Days`;
    }
    return hours === 1 ? "1 Hour" : `${hours} Hours`;
  };

  // Format bandwidth for display
  const formatBandwidthDisplay = (kbps) => {
    if (kbps === 0) return "Unlimited";
    if (kbps >= 1000) {
      const mbps = kbps / 1000;
      return `${mbps} Mbps`;
    }
    return `${kbps} Kbps`;
  };

  // Get display value for bandwidth input based on unit
  const getBandwidthDisplayValue = () => {
    if (bandwidthUnit === 'Mbps') {
      return (hotspot.bandwidthLimit / 1000) || '';
    }
    return hotspot.bandwidthLimit || '';
  };

  // Fixed plan summary with proper unlimited handling
  const planSummary = useMemo(() => {
    const maxDevicesValue = Number.isNaN(hotspot.maxDevices) || hotspot.maxDevices === undefined ? 0 : hotspot.maxDevices;
    
    // Fixed: Proper handling for unlimited data and time
    const dataLimitDisplay = hotspot.dataLimit.value === 'Unlimited' 
      ? 'Unlimited - No data Caps' 
      : `${hotspot.dataLimit.value || '0'} ${hotspot.dataLimit.unit}`;
    
    const usageLimitDisplay = hotspot.usageLimit.value === 'Unlimited' 
      ? 'Unlimited - No restrictions' 
      : `${hotspot.usageLimit.value || '0'} ${hotspot.usageLimit.unit}`;

    const validityDisplay = hotspot.validityPeriod.value === '0' || hotspot.validityPeriod.value === 0
      ? 'No Expiry'
      : `${hotspot.validityPeriod.value || ''} ${hotspot.validityPeriod.unit}`;

    return {
      dataLimit: dataLimitDisplay,
      usageLimit: usageLimitDisplay,
      validity: validityDisplay,
      maxDevices: maxDevicesValue === 0 ? 'Unlimited' : `${maxDevicesValue} device${maxDevicesValue > 1 ? 's' : ''}`,
      sessionTimeout: formatTimeDisplay(hotspot.sessionTimeout),
      idleTimeout: hotspot.idleTimeout === 0 ? 'No Timeout' : `${hotspot.idleTimeout / 60} minutes`,
      bandwidth: formatBandwidthDisplay(hotspot.bandwidthLimit),
      ipPool: hotspot.ipPool || 'Default Pool',
      dnsServers: Array.isArray(hotspot.dnsServers) ? hotspot.dnsServers.join(', ') : 'Default DNS'
    };
  }, [hotspot]);

  return (
    <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg lg:text-xl font-semibold flex items-center">
          <Wifi className="w-5 h-5 mr-2 text-blue-600" />
          Hotspot Configuration
        </h3>
        <div className="flex items-center">
          <label className={`block text-sm font-medium mr-4 ${themeClasses.text.primary}`}>
            Enable Hotspot
          </label>
          <div 
            onClick={handleToggle}
            className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
              hotspot.enabled 
                ? 'bg-blue-600'
                : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
              hotspot.enabled ? "translate-x-6" : "translate-x-1"
            }`} />
          </div>
        </div>
      </div>

      {hotspot.enabled && (
        <div className="space-y-6 lg:space-y-8">
          {/* Hotspot Network Settings - UPDATED: Removed service name duplication */}
          <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-blue-900/10' : 'bg-blue-50'}`}>
            <h4 className="text-md font-semibold mb-4 text-blue-700 dark:text-blue-300 flex items-center">
              <Wifi className="w-4 h-4 mr-2" />
              Hotspot Network Settings
            </h4>
            
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
              {/* IP Pool */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                  IP Address Range
                  <span className="text-xs text-gray-500 ml-2">- Network range for connected devices</span>
                </label>
                <EnhancedSelect
                  value={hotspot.ipPool}
                  onChange={(value) => onChange('hotspot', 'ipPool', value)}
                  options={[
                    { value: "hotspot-pool-1", label: "Default Range - For general use" },
                    { value: "hotspot-pool-2", label: "Extended Range - More IP addresses" },
                    { value: "dynamic-pool", label: "Dynamic Pool - Automatic assignment" },
                    { value: "guest-pool", label: "Guest Pool - Isolated network" },
                    { value: "premium-pool", label: "Premium Pool - Priority users" }
                  ]}
                  theme={theme}
                />
                <p className="text-xs text-gray-500 mt-1">Choose how IP addresses are assigned to users</p>
              </div>

              {/* DNS Servers with auto-suggestion */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                  <Globe className="w-4 h-4 inline mr-1" />
                  DNS Servers
                  <span className="text-xs text-gray-500 ml-2">- Domain name resolution for users</span>
                </label>
                <div className="flex gap-2">
                  <input 
                    value={Array.isArray(hotspot.dnsServers) ? hotspot.dnsServers.join(", ") : ""} 
                    onChange={(e) => onChange('hotspot', 'dnsServers', e.target.value.split(",").map(s => s.trim()))} 
                    className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                    placeholder="8.8.8.8, 1.1.1.1" 
                  />
                  <button
                    type="button"
                    onClick={() => onChange('hotspot', 'dnsServers', getSuggestedDNS())}
                    className="px-3 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Auto
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Domain name servers for users. Auto sets reliable public DNS servers.
                </p>
              </div>
            </div>
          </div>

          {/* Speed Configuration */}
          <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-blue-900/10' : 'bg-blue-50'}`}>
            <h4 className="text-md font-semibold mb-4 text-blue-700 dark:text-blue-300 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Speed & Bandwidth Settings
            </h4>
            
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
              {/* Download Speed */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                  Download Speed <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={hotspot.downloadSpeed.value || ""} 
                    onChange={(e) => onNestedChange('hotspot', 'downloadSpeed', 'value', e.target.value)} 
                    className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                    min="0.01" 
                    step="0.01" 
                    placeholder="e.g., 10" 
                    required 
                  />
                  {renderUnitDropdown('downloadSpeed', hotspot.downloadSpeed.unit, onNestedChange, speedUnits)}
                </div>
                <p className="text-xs text-gray-500 mt-1">Maximum download speed for users</p>
                {errors.hotspot_downloadSpeed && <p className="text-red-500 text-xs mt-1">{errors.hotspot_downloadSpeed}</p>}
              </div>
              
              {/* Upload Speed */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                  Upload Speed <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={hotspot.uploadSpeed.value || ""} 
                    onChange={(e) => onNestedChange('hotspot', 'uploadSpeed', 'value', e.target.value)} 
                    className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                    min="0.01" 
                    step="0.01" 
                    placeholder="e.g., 2" 
                    required 
                  />
                  {renderUnitDropdown('uploadSpeed', hotspot.uploadSpeed.unit, onNestedChange, speedUnits)}
                </div>
                <p className="text-xs text-gray-500 mt-1">Maximum upload speed for users</p>
                {errors.hotspot_uploadSpeed && <p className="text-red-500 text-xs mt-1">{errors.hotspot_uploadSpeed}</p>}
              </div>
            </div>

            {/* Bandwidth Limit */}
            <div className="mt-6">
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                <Gauge className="w-4 h-4 inline mr-1" />
                Total Bandwidth Limit
                <span className="text-xs text-gray-500 ml-2">- Shared bandwidth for all connected devices</span>
              </label>
              
              <div className="mb-3">
                <EnhancedSelect
                  value={bandwidthPreset}
                  onChange={handleBandwidthPreset}
                  options={bandwidthPresets.map(preset => ({
                    value: preset.value.toString(),
                    label: preset.value === 0 ? 'Unlimited - No restrictions' : `${preset.label} - ${preset.description}`
                  })).concat([
                    { value: 'custom', label: 'Set custom bandwidth' }
                  ])}
                  theme={theme}
                />
              </div>
              
              {bandwidthPreset === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3"
                >
                  <div className="flex gap-2 items-center">
                    <input 
                      type="number" 
                      value={getBandwidthDisplayValue()} 
                      onChange={(e) => onChange('hotspot', 'bandwidthLimit', convertToKbps(e.target.value, bandwidthUnit))} 
                      className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                      min="0" 
                      step="any" 
                      placeholder="Enter value (e.g., 5)" 
                    />
                    <EnhancedSelect
                      value={bandwidthUnit}
                      onChange={setBandwidthUnit}
                      options={[
                        { value: 'Mbps', label: 'Mbps' },
                        { value: 'Kbps', label: 'Kbps' }
                      ]}
                      className="text-xs min-w-20"
                      theme={theme}
                    />
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      ({formatBandwidthDisplay(hotspot.bandwidthLimit)})
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Enter bandwidth and select unit. Automatically converts to Kbps internally.
                  </p>
                </motion.div>
              )}
              
              {bandwidthPreset !== 'custom' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`p-3 rounded-lg flex items-center gap-2 ${theme === 'dark' ? 'bg-blue-800/20' : 'bg-blue-100'}`}
                >
                  {hotspot.bandwidthLimit === 0 && <InfinityIcon className="w-4 h-4 text-blue-600 dark:text-blue-300" />}
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Selected:</strong> {formatBandwidthDisplay(hotspot.bandwidthLimit)}
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Data & Usage Limits */}
          <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-purple-900/10' : 'bg-purple-50'}`}>
            <h4 className="text-md font-semibold mb-4 text-purple-700 dark:text-purple-300 flex items-center">
              <Database className="w-4 h-4 mr-2" />
              Plan Limits & Duration
            </h4>
            
            {/* Validity Period */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                <Calendar className="w-4 h-4 inline mr-1" />
                Plan Duration <span className="text-red-500">*</span>
              </label>
              <div className="mb-2">
                <EnhancedSelect
                  value={validityPreset}
                  onChange={handleValidityPreset}
                  options={validityPeriodPresets.map(preset => ({ 
                    value: preset.value, 
                    label: `${preset.label} - ${preset.description}`
                  })).concat([
                    { value: 'custom', label: 'Set custom duration' }
                  ])}
                  theme={theme}
                />
              </div>
              {validityPreset === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <div className="flex gap-2">
                    <input 
                      value={hotspot.validityPeriod.value || ""} 
                      onChange={(e) => onNestedChange('hotspot', 'validityPeriod', 'value', e.target.value)} 
                      className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                      placeholder="Enter duration value (e.g., 30)" 
                      required 
                    />
                    {renderUnitDropdown('validityPeriod', hotspot.validityPeriod.unit, onNestedChange, ['Hours', 'Days', 'Weeks', 'Months'])}
                  </div>
                  <p className="text-xs text-gray-500">
                    Set the custom duration for this plan
                  </p>
                </motion.div>
              )}
              <p className="text-xs text-gray-500 mt-1">How long the plan remains active after activation</p>
            </div>

            {/* Data Limit */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                Total Data Allowance <span className="text-red-500">*</span>
              </label>
              <div className="mb-2">
                <EnhancedSelect
                  value={dataLimitPreset}
                  onChange={handleDataLimitPreset}
                  options={dataLimitPresets.map(preset => ({ 
                    value: preset.value, 
                    label: `${preset.label} - ${preset.description}`
                  })).concat([
                    { value: 'custom', label: 'Set custom data amount' }
                  ])}
                  theme={theme}
                />
              </div>
              {dataLimitPreset === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <div className="flex gap-2">
                    <input 
                      value={hotspot.dataLimit.value || ""} 
                      onChange={(e) => onNestedChange('hotspot', 'dataLimit', 'value', e.target.value)} 
                      className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                      placeholder="Enter data amount (e.g., 100)" 
                      required 
                    />
                    {renderUnitDropdown('dataLimit', hotspot.dataLimit.unit, onNestedChange, ['MB', 'GB', 'TB', 'Unlimited'])}
                  </div>
                  <p className="text-xs text-gray-500">
                    Set the custom data limit for this plan
                  </p>
                </motion.div>
              )}
              <p className="text-xs text-gray-500 mt-1">Total data available for the entire plan duration</p>
              {errors.hotspot_dataLimit && <p className="text-red-500 text-xs mt-1">{errors.hotspot_dataLimit}</p>}
            </div>

            {/* Usage Limit */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                <Clock className="w-4 h-4 inline mr-1" />
                Daily Time Limit <span className="text-red-500">*</span>
              </label>
              <div className="mb-2">
                <EnhancedSelect
                  value={usageLimitPreset}
                  onChange={handleUsageLimitPreset}
                  options={usageLimitPresets.map(preset => ({ 
                    value: preset.value, 
                    label: `${preset.label} - ${preset.description}`
                  })).concat([
                    { value: 'custom', label: 'Set custom hours' }
                  ])}
                  theme={theme}
                />
              </div>
              {usageLimitPreset === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <div className="flex gap-2">
                    <input 
                      value={hotspot.usageLimit.value || ""} 
                      onChange={(e) => onNestedChange('hotspot', 'usageLimit', 'value', e.target.value)} 
                      className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                      placeholder="Enter hours per day (e.g., 8)" 
                      required 
                    />
                    {renderUnitDropdown('usageLimit', hotspot.usageLimit.unit, onNestedChange, ['Hours', 'Unlimited'])}
                  </div>
                  <p className="text-xs text-gray-500">
                    Set the custom daily usage limit in hours
                  </p>
                </motion.div>
              )}
              <p className="text-xs text-gray-500 mt-1">Maximum connection time allowed per day</p>
              {errors.hotspot_usageLimit && <p className="text-red-500 text-xs mt-1">{errors.hotspot_usageLimit}</p>}
            </div>
          </div>

          {/* Security & Management Features */}
          <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-green-900/10' : 'bg-green-50'}`}>
            <h4 className="text-md font-semibold mb-4 text-green-700 dark:text-green-300 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Security & Device Management
            </h4>
            
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
              {/* Maximum Devices */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                  <Users className="w-4 h-4 inline mr-1" />
                  Maximum Connected Devices
                </label>
                <EnhancedSelect
                  value={hotspot.maxDevices ?? 0}
                  onChange={(value) => onChange('hotspot', 'maxDevices', Number.isNaN(parseInt(value, 10)) ? 0 : parseInt(value, 10))}
                  options={deviceLimitOptions}
                  placeholder="Select device limit"
                  theme={theme}
                />
                <p className="text-xs text-gray-500 mt-1">Limit simultaneous connections</p>
              </div>

              {/* Session Timeout */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                  <Clock className="w-4 h-4 inline mr-1" />
                  Session Timeout
                </label>
                <EnhancedSelect
                  value={hotspot.sessionTimeout}
                  onChange={(value) => onChange('hotspot', 'sessionTimeout', parseInt(value, 10))}
                  options={sessionTimeoutOptions}
                  theme={theme}
                />
                <p className="text-xs text-gray-500 mt-1">Forces reconnection for security</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6 mt-4">
              {/* Idle Timeout */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                  Idle Timeout
                </label>
                <EnhancedSelect
                  value={hotspot.idleTimeout}
                  onChange={(value) => onChange('hotspot', 'idleTimeout', parseInt(value, 10))}
                  options={idleTimeoutOptions}
                  theme={theme}
                />
                <p className="text-xs text-gray-500 mt-1">Disconnects after inactivity</p>
              </div>

              {/* MAC Binding */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                    <Smartphone className="w-4 h-4 inline mr-1" />
                    Device Lock (MAC Binding)
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Restrict access to specific devices only
                  </p>
                </div>
                <div 
                  onClick={() => onChange('hotspot', 'macBinding', !hotspot.macBinding)} 
                  className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                    hotspot.macBinding 
                      ? 'bg-green-600'
                      : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                    hotspot.macBinding ? "translate-x-6" : "translate-x-1"
                  }`} />
                </div>
              </div>
            </div>
          </div>

          {/* Plan Summary - UPDATED: Removed service name */}
          <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-indigo-900/10' : 'bg-indigo-50'}`}>
            <h4 className="text-md font-semibold mb-4 text-indigo-700 dark:text-indigo-300 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Plan Summary
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <Calendar className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <div className="text-sm font-semibold">{planSummary.validity}</div>
                <div className="text-xs text-gray-500">Plan Duration</div>
              </div>
              <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <Database className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <div className="text-sm font-semibold">{planSummary.dataLimit}</div>
                <div className="text-xs text-gray-500">Total Data</div>
              </div>
              <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <div className="text-sm font-semibold">{planSummary.usageLimit}</div>
                <div className="text-xs text-gray-500">Daily Time</div>
              </div>
              <div className={`text-center p-3 rounded-lg flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <Users className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                <div className="text-sm font-semibold flex items-center gap-1">
                  {planSummary.maxDevices === 'Unlimited' && <InfinityIcon className="w-4 h-4" />}
                  {planSummary.maxDevices}
                </div>
                <div className="text-xs text-gray-500">Max Devices</div>
              </div>
              <div className={`text-center p-3 rounded-lg flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <Gauge className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                <div className="text-sm font-semibold flex items-center gap-1">
                  {planSummary.bandwidth === 'Unlimited' && <InfinityIcon className="w-4 h-4" />}
                  {planSummary.bandwidth}
                </div>
                <div className="text-xs text-gray-500">Bandwidth</div>
              </div>
              <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <Shield className="w-5 h-5 text-red-600 mx-auto mb-1" />
                <div className="text-sm font-semibold">{hotspot.macBinding ? 'Enabled' : 'Disabled'}</div>
                <div className="text-xs text-gray-500">Device Lock</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotspotConfiguration;