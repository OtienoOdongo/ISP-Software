

// ============================================================================
// PPPoEConfiguration.js - COMPLETELY FIXED: Proper number handling, type safety
// ============================================================================

import React, { useState, useMemo, useEffect, useCallback } from "react";
import PropTypes from 'prop-types';
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
  bandwidthPresets,
  ipPoolOptions,
  mtuOptions
} from "../Shared/constant";
import { 
  Users, Clock, Shield, Calendar, Cable, Database, Zap, Gauge, 
  Smartphone, Infinity as InfinityIcon, AlertCircle,
  Wifi, Server, HardDrive, Network
} from "lucide-react";

/**
 * PPPoE Configuration Component
 * Handles configuration for PPPoE plans with proper type safety and number handling
 */
const PPPoEConfiguration = ({ 
  form = {}, 
  errors = {}, 
  onChange, 
  onNestedChange, 
  theme = 'light' 
}) => {
  const themeClasses = getThemeClasses(theme);
  
  // Safely extract PPPoE configuration with fallbacks
  const access_methods = form.access_methods || {};
  const pppoe = access_methods.pppoe || {
    enabled: false,
    download_speed: { value: "", unit: "Mbps" },
    upload_speed: { value: "", unit: "Mbps" },
    data_limit: { value: "", unit: "GB" },
    usage_limit: { value: "", unit: "Hours" },
    bandwidth_limit: 0,
    max_devices: "",
    session_timeout: 0,
    idle_timeout: 0,
    validity_period: { value: "", unit: "Days" },
    mac_binding: false,
    ip_pool: "",
    service_name: "",
    mtu: ""
  };

  // State for preset selections
  const [dataLimitPreset, setDataLimitPreset] = useState('custom');
  const [usageLimitPreset, setUsageLimitPreset] = useState('custom');
  const [validityPreset, setValidityPreset] = useState('custom');
  const [bandwidthPreset, setBandwidthPreset] = useState('custom');
  const [bandwidthUnit, setBandwidthUnit] = useState('Mbps');

  // ==========================================================================
  // HELPER FUNCTIONS - Type conversion utilities
  // ==========================================================================

  /**
   * Safely converts any value to a number or returns 0
   * Used for backend-bound values that must be numbers
   */
  const toSafeNumber = (value) => {
    if (value === "" || value === null || value === undefined) return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  /**
   * Converts value to number or returns empty string for display
   * Used for UI display where empty means "not set"
   */
  const toDisplayNumber = (value) => {
    if (value === "" || value === null || value === undefined) return "";
    const num = Number(value);
    return isNaN(num) ? "" : num;
  };

  /**
   * Checks if a value is effectively empty (for UI logic)
   */
  const isEmpty = (value) => {
    return value === "" || value === null || value === undefined;
  };

  // ==========================================================================
  // EVENT HANDLERS - Change management
  // ==========================================================================

  /**
   * Handle input changes with proper type conversion
   * Special handling for fields that must be numbers in backend
   */
  const handleInputChange = useCallback((field, value) => {
    // Fields that must always be numbers in the backend
    const numericFields = ['session_timeout', 'idle_timeout', 'bandwidth_limit'];
    
    if (numericFields.includes(field)) {
      // Convert to number, default to 0 for empty values
      const numericValue = toSafeNumber(value);
      onChange('pppoe', field, numericValue);
    } else {
      // Pass through as-is for other fields
      onChange('pppoe', field, value);
    }
  }, [onChange]);

  /**
   * Handle nested field changes (objects like data_limit, validity_period)
   */
  const handleNestedChange = useCallback((field, subfield, value) => {
    onNestedChange('pppoe', field, subfield, value);
  }, [onNestedChange]);

  /**
   * Handle timeout fields specifically (always numbers)
   */
  const handleTimeoutChange = useCallback((field, value) => {
    const numericValue = toSafeNumber(value);
    handleInputChange(field, numericValue);
  }, [handleInputChange]);

  /**
   * Toggle PPPoE enabled state
   */
  const handleToggle = useCallback(() => {
    handleInputChange('enabled', !pppoe.enabled);
  }, [pppoe.enabled, handleInputChange]);

  // ==========================================================================
  // PRESET HANDLERS - Predefined value selections
  // ==========================================================================

  const handleDataLimitPreset = useCallback((presetKey) => {
    setDataLimitPreset(presetKey);
    if (presetKey !== 'custom') {
      const preset = dataLimitPresets.find(p => String(p.value) === presetKey);
      if (preset) {
        handleNestedChange('data_limit', 'value', preset.value);
        handleNestedChange('data_limit', 'unit', preset.unit);
      }
    } else {
      handleNestedChange('data_limit', 'value', "");
    }
  }, [dataLimitPresets, handleNestedChange]);

  const handleUsageLimitPreset = useCallback((presetKey) => {
    setUsageLimitPreset(presetKey);
    if (presetKey !== 'custom') {
      const preset = usageLimitPresets.find(p => String(p.value) === presetKey);
      if (preset) {
        handleNestedChange('usage_limit', 'value', preset.value);
        handleNestedChange('usage_limit', 'unit', preset.unit);
      }
    } else {
      handleNestedChange('usage_limit', 'value', "");
    }
  }, [usageLimitPresets, handleNestedChange]);

  const handleValidityPreset = useCallback((presetKey) => {
    setValidityPreset(presetKey);
    if (presetKey !== 'custom') {
      const preset = validityPeriodPresets.find(p => String(p.value) === presetKey);
      if (preset) {
        handleNestedChange('validity_period', 'value', preset.value);
        handleNestedChange('validity_period', 'unit', preset.unit);
      }
    } else {
      handleNestedChange('validity_period', 'value', "");
    }
  }, [validityPeriodPresets, handleNestedChange]);

  const handleBandwidthPreset = useCallback((presetKey) => {
    setBandwidthPreset(presetKey);
    if (presetKey !== 'custom') {
      const presetValue = parseInt(presetKey, 10);
      const preset = bandwidthPresets.find(p => p.value === presetValue);
      if (preset) {
        handleInputChange('bandwidth_limit', preset.value);
      }
    } else {
      handleInputChange('bandwidth_limit', 0);
    }
  }, [bandwidthPresets, handleInputChange]);

  // ==========================================================================
  // BANDWIDTH HANDLING - Unit conversion logic
  // ==========================================================================

  /**
   * Get display value for bandwidth (converted to selected unit)
   */
  const getBandwidthDisplayValue = useCallback(() => {
    const bandwidth = toSafeNumber(pppoe.bandwidth_limit);
    if (bandwidthUnit === 'Mbps') {
      const mbps = bandwidth / 1000;
      return mbps === 0 ? "" : mbps;
    }
    return bandwidth === 0 ? "" : bandwidth;
  }, [pppoe.bandwidth_limit, bandwidthUnit]);

  /**
   * Handle bandwidth change with unit conversion
   */
  const handleBandwidthChange = useCallback((value) => {
    const numValue = parseFloat(value) || 0;
    if (bandwidthUnit === 'Mbps') {
      handleInputChange('bandwidth_limit', numValue * 1000);
    } else {
      handleInputChange('bandwidth_limit', numValue);
    }
  }, [bandwidthUnit, handleInputChange]);

  // ==========================================================================
  // DOWNLOAD SPEED HANDLING - With MTU auto-suggest
  // ==========================================================================

  /**
   * Suggest MTU based on download speed
   */
  const getSuggestedMTU = useCallback((downloadSpeed) => {
    const speed = parseFloat(downloadSpeed) || 0;
    if (speed >= 100) return 1500;
    if (speed >= 50) return 1492;
    return 1480;
  }, []);

  /**
   * Handle download speed change with MTU auto-suggest
   */
  const handleDownloadSpeedChange = useCallback((value) => {
    handleNestedChange('download_speed', 'value', value);
    
    // Auto-suggest MTU if not already set
    if (isEmpty(pppoe.mtu)) {
      const suggestedMTU = getSuggestedMTU(value);
      handleInputChange('mtu', suggestedMTU);
    }
  }, [handleNestedChange, pppoe.mtu, getSuggestedMTU, handleInputChange]);

  // ==========================================================================
  // FORMATTING FUNCTIONS - Display helpers
  // ==========================================================================

  /**
   * Format seconds into human-readable time
   */
  const formatTimeDisplay = useCallback((seconds) => {
    const numSeconds = toSafeNumber(seconds);
    if (numSeconds === 0) return "No Limit";
    
    if (numSeconds >= 86400) {
      const days = numSeconds / 86400;
      return days === 1 ? "1 Day" : `${days} Days`;
    } else if (numSeconds >= 3600) {
      const hours = numSeconds / 3600;
      return hours === 1 ? "1 Hour" : `${hours} Hours`;
    } else if (numSeconds >= 60) {
      const minutes = numSeconds / 60;
      return minutes === 1 ? "1 Minute" : `${minutes} Minutes`;
    }
    return `${numSeconds} Seconds`;
  }, []);

  /**
   * Format Kbps into human-readable bandwidth
   */
  const formatBandwidthDisplay = useCallback((kbps) => {
    const numKbps = toSafeNumber(kbps);
    if (numKbps === 0) return "Unlimited";
    
    if (numKbps >= 1000) {
      const mbps = numKbps / 1000;
      return `${mbps.toFixed(mbps % 1 === 0 ? 0 : 1)} Mbps`;
    }
    return `${numKbps} Kbps`;
  }, []);

  // ==========================================================================
  // PLAN SUMMARY - Memoized display values
  // ==========================================================================

  const planSummary = useMemo(() => {
    const maxDevicesValue = toSafeNumber(pppoe.max_devices);
    
    const dataLimitValue = pppoe.data_limit?.value || '0';
    const dataLimitUnit = pppoe.data_limit?.unit || 'GB';
    const dataLimitDisplay = isEmpty(dataLimitValue) || dataLimitValue === '0' 
      ? 'No Limit' 
      : `${dataLimitValue} ${dataLimitUnit}`;
    
    const usageLimitValue = pppoe.usage_limit?.value || '0';
    const usageLimitUnit = pppoe.usage_limit?.unit || 'Hours';
    const usageLimitDisplay = isEmpty(usageLimitValue) || usageLimitValue === '0'
      ? 'No Limit' 
      : `${usageLimitValue} ${usageLimitUnit}`;

    const validityValue = pppoe.validity_period?.value || '0';
    const validityUnit = pppoe.validity_period?.unit || 'Days';
    const validityDisplay = isEmpty(validityValue) || validityValue === '0'
      ? 'No Expiry'
      : `${validityValue} ${validityUnit}`;

    return {
      dataLimit: dataLimitDisplay,
      usageLimit: usageLimitDisplay,
      validity: validityDisplay,
      maxDevices: maxDevicesValue === 0 ? 'Unlimited' : `${maxDevicesValue} device${maxDevicesValue > 1 ? 's' : ''}`,
      sessionTimeout: formatTimeDisplay(pppoe.session_timeout),
      idleTimeout: formatTimeDisplay(pppoe.idle_timeout),
      bandwidth: formatBandwidthDisplay(pppoe.bandwidth_limit),
      mtu: isEmpty(pppoe.mtu) ? 'Not set' : `${pppoe.mtu} bytes`,
      ipPool: isEmpty(pppoe.ip_pool) ? 'Not set' : pppoe.ip_pool,
      serviceName: isEmpty(pppoe.service_name) ? 'Not set' : pppoe.service_name
    };
  }, [pppoe, formatTimeDisplay, formatBandwidthDisplay, isEmpty]);

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg lg:text-xl font-semibold flex items-center">
          <Cable className="w-5 h-5 mr-2 text-green-600" />
          PPPoE Configuration
        </h3>
        <div className="flex items-center">
          <label className={`block text-sm font-medium mr-4 ${themeClasses.text.primary}`}>
            Enable PPPoE
          </label>
          <div 
            onClick={handleToggle}
            className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
              pppoe.enabled 
                ? 'bg-green-600'
                : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
            }`}
            role="switch"
            aria-checked={pppoe.enabled}
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && handleToggle()}
          >
            <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
              pppoe.enabled ? "translate-x-6" : "translate-x-1"
            }`} />
          </div>
        </div>
      </div>

      {pppoe.enabled ? (
        <div className="space-y-6 lg:space-y-8">
          {/* Speed Configuration */}
          <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-green-900/10' : 'bg-green-50'}`}>
            <h4 className="text-md font-semibold mb-4 text-green-700 dark:text-green-300 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Speed & Bandwidth Settings
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {/* Download Speed */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                  Download Speed <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="number" 
                    value={pppoe.download_speed?.value || ""} 
                    onChange={(e) => handleDownloadSpeedChange(e.target.value)} 
                    className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                    min="0.01" 
                    step="0.01" 
                    placeholder="e.g., 15" 
                    required 
                  />
                  <EnhancedSelect
                    value={pppoe.download_speed?.unit || "Mbps"}
                    onChange={(value) => handleNestedChange('download_speed', 'unit', value)}
                    options={speedUnits}
                    className="text-xs min-w-[5rem]"
                    theme={theme}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Maximum download speed for connection</p>
              </div>
              
              {/* Upload Speed */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                  Upload Speed <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="number" 
                    value={pppoe.upload_speed?.value || ""} 
                    onChange={(e) => handleNestedChange('upload_speed', 'value', e.target.value)} 
                    className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                    min="0.01" 
                    step="0.01" 
                    placeholder="e.g., 3" 
                    required 
                  />
                  <EnhancedSelect
                    value={pppoe.upload_speed?.unit || "Mbps"}
                    onChange={(value) => handleNestedChange('upload_speed', 'unit', value)}
                    options={speedUnits}
                    className="text-xs min-w-[5rem]"
                    theme={theme}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Maximum upload speed for connection</p>
              </div>
            </div>

            {/* Bandwidth Limit */}
            <div className="mt-6">
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                <Gauge className="w-4 h-4 inline mr-1" />
                Total Bandwidth Limit
                <span className="text-xs text-gray-500 ml-2">Shared bandwidth for this connection</span>
              </label>
              
              <div className="mb-3">
                <EnhancedSelect
                  value={bandwidthPreset}
                  onChange={handleBandwidthPreset}
                  options={bandwidthPresets.map(p => ({ 
                    value: String(p.value), 
                    label: p.label,
                    description: p.description 
                  })).concat([{ value: 'custom', label: 'Set custom bandwidth' }])}
                  theme={theme}
                />
              </div>
              
              {bandwidthPreset === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <input 
                      type="number" 
                      value={getBandwidthDisplayValue()} 
                      onChange={(e) => handleBandwidthChange(e.target.value)} 
                      className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                      min="0" 
                      step="any" 
                      placeholder="Enter value" 
                    />
                    <EnhancedSelect
                      value={bandwidthUnit}
                      onChange={setBandwidthUnit}
                      options={[
                        { value: 'Mbps', label: 'Mbps' },
                        { value: 'Kbps', label: 'Kbps' }
                      ]}
                      className="text-xs min-w-[5rem]"
                      theme={theme}
                    />
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      ({formatBandwidthDisplay(pppoe.bandwidth_limit)})
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Enter bandwidth and select unit. Internally stored as Kbps.
                  </p>
                </motion.div>
              )}
              
              {bandwidthPreset !== 'custom' && pppoe.bandwidth_limit !== 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`p-3 rounded-lg flex items-center gap-2 ${theme === 'dark' ? 'bg-green-800/20' : 'bg-green-100'}`}
                >
                  {pppoe.bandwidth_limit === 0 && <InfinityIcon className="w-4 h-4 text-green-600 dark:text-green-300" />}
                  <p className="text-sm text-green-700 dark:text-green-300">
                    <strong>Selected:</strong> {formatBandwidthDisplay(pppoe.bandwidth_limit)}
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
                  options={validityPeriodPresets.map(p => ({ 
                    value: String(p.value), 
                    label: p.label,
                    description: p.description 
                  })).concat([{ value: 'custom', label: 'Set custom duration' }])}
                  theme={theme}
                />
              </div>
              {validityPreset === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      value={pppoe.validity_period?.value || ""} 
                      onChange={(e) => handleNestedChange('validity_period', 'value', e.target.value)} 
                      className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                      placeholder="Enter duration value" 
                      required 
                    />
                    <EnhancedSelect
                      value={pppoe.validity_period?.unit || "Days"}
                      onChange={(value) => handleNestedChange('validity_period', 'unit', value)}
                      options={[
                        { value: 'Hours', label: 'Hours' },
                        { value: 'Days', label: 'Days' },
                        { value: 'Weeks', label: 'Weeks' },
                        { value: 'Months', label: 'Months' }
                      ]}
                      className="text-xs min-w-[5rem]"
                      theme={theme}
                    />
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
                  options={dataLimitPresets.map(p => ({ 
                    value: String(p.value), 
                    label: p.label,
                    description: p.description 
                  })).concat([{ value: 'custom', label: 'Set custom data amount' }])}
                  theme={theme}
                />
              </div>
              {dataLimitPreset === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      value={pppoe.data_limit?.value || ""} 
                      onChange={(e) => handleNestedChange('data_limit', 'value', e.target.value)} 
                      className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                      placeholder="Enter data amount" 
                      required 
                    />
                    <EnhancedSelect
                      value={pppoe.data_limit?.unit || "GB"}
                      onChange={(value) => handleNestedChange('data_limit', 'unit', value)}
                      options={[
                        { value: 'MB', label: 'MB' },
                        { value: 'GB', label: 'GB' },
                        { value: 'TB', label: 'TB' }
                      ]}
                      className="text-xs min-w-[5rem]"
                      theme={theme}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Set the custom data limit for this plan
                  </p>
                </motion.div>
              )}
              <p className="text-xs text-gray-500 mt-1">Total data available for the entire plan duration</p>
            </div>

            {/* Usage Limit */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                <Clock className="w-4 h-4 inline mr-1" />
                Daily Time Limit
              </label>
              <div className="mb-2">
                <EnhancedSelect
                  value={usageLimitPreset}
                  onChange={handleUsageLimitPreset}
                  options={usageLimitPresets.map(p => ({ 
                    value: String(p.value), 
                    label: p.label,
                    description: p.description 
                  })).concat([{ value: 'custom', label: 'Set custom hours' }])}
                  theme={theme}
                />
              </div>
              {usageLimitPreset === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      value={pppoe.usage_limit?.value || ""} 
                      onChange={(e) => handleNestedChange('usage_limit', 'value', e.target.value)} 
                      className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                      placeholder="Enter hours per day" 
                      required 
                    />
                    <EnhancedSelect
                      value={pppoe.usage_limit?.unit || "Hours"}
                      onChange={(value) => handleNestedChange('usage_limit', 'unit', value)}
                      options={[
                        { value: 'Minutes', label: 'Minutes' },
                        { value: 'Hours', label: 'Hours' }
                      ]}
                      className="text-xs min-w-[5rem]"
                      theme={theme}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Set the custom daily usage limit
                  </p>
                </motion.div>
              )}
              <p className="text-xs text-gray-500 mt-1">Maximum connection time allowed per day</p>
            </div>
          </div>

          {/* PPPoE Network Settings */}
          <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-blue-900/10' : 'bg-blue-50'}`}>
            <h4 className="text-md font-semibold mb-4 text-blue-700 dark:text-blue-300 flex items-center">
              <Network className="w-4 h-4 mr-2" />
              PPPoE Network Settings
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {/* IP Pool */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                  IP Pool
                </label>
                <EnhancedSelect
                  value={pppoe.ip_pool || ""}
                  onChange={(value) => handleInputChange('ip_pool', value)}
                  options={ipPoolOptions}
                  placeholder="Select IP pool"
                  theme={theme}
                />
                <p className="text-xs text-gray-500 mt-1">IP pool name for PPPoE users</p>
              </div>

              {/* Service Name */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                  Service Name
                </label>
                <input 
                  value={pppoe.service_name || ""} 
                  onChange={(e) => handleInputChange('service_name', e.target.value)} 
                  className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                  placeholder="PPPoE Service" 
                />
                <p className="text-xs text-gray-500 mt-1">Service identifier for PPPoE</p>
              </div>
            </div>

            {/* MTU */}
            <div className="mt-6">
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                MTU (Maximum Transmission Unit)
                <span className="text-xs text-gray-500 ml-2">Recommended: 1492 for most ISPs</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <div className="flex-1 flex flex-col sm:flex-row gap-2">
                  <EnhancedSelect
                    value={pppoe.mtu || ""}
                    onChange={(value) => handleInputChange('mtu', value ? parseInt(value, 10) : "")}
                    options={mtuOptions}
                    placeholder="Select MTU"
                    theme={theme}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const suggestedMTU = getSuggestedMTU(pppoe.download_speed?.value);
                      handleInputChange('mtu', suggestedMTU);
                    }}
                    className={`px-3 py-2 text-xs rounded-lg transition-colors whitespace-nowrap ${
                      theme === 'dark'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Auto Suggest
                  </button>
                </div>
                <div className={`text-sm px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                  <span className="font-medium">Current: </span>
                  {isEmpty(pppoe.mtu) ? 'Not set' : `${pppoe.mtu} bytes`}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Maximum data packet size. Auto suggests optimal value based on download speed.
              </p>
            </div>
          </div>

          {/* Security & Device Management */}
          <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-orange-900/10' : 'bg-orange-50'}`}>
            <h4 className="text-md font-semibold mb-4 text-orange-700 dark:text-orange-300 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Security & Device Management
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {/* Maximum Devices */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                  <Users className="w-4 h-4 inline mr-1" />
                  Maximum Connected Devices
                </label>
                <EnhancedSelect
                  value={pppoe.max_devices ?? ""}
                  onChange={(value) => handleInputChange('max_devices', value === "" ? "" : Number(value))}
                  options={deviceLimitOptions}
                  placeholder="Select device limit"
                  theme={theme}
                />
                <p className="text-xs text-gray-500 mt-1">Limit simultaneous connections</p>
              </div>

              {/* Session Timeout - ALWAYS sends number */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                  <Clock className="w-4 h-4 inline mr-1" />
                  Session Timeout
                </label>
                <EnhancedSelect
                  value={pppoe.session_timeout ?? 0}
                  onChange={(value) => handleTimeoutChange('session_timeout', value)}
                  options={sessionTimeoutOptions}
                  theme={theme}
                />
                <p className="text-xs text-gray-500 mt-1">Forces reconnection for security (0 = no timeout)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mt-4">
              {/* Idle Timeout - ALWAYS sends number */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                  Idle Timeout
                </label>
                <EnhancedSelect
                  value={pppoe.idle_timeout ?? 0}
                  onChange={(value) => handleTimeoutChange('idle_timeout', value)}
                  options={idleTimeoutOptions}
                  theme={theme}
                />
                <p className="text-xs text-gray-500 mt-1">Disconnects after inactivity (0 = no timeout)</p>
              </div>

              {/* MAC Binding */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg gap-2">
                <div className="flex-1">
                  <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                    <Smartphone className="w-4 h-4 inline mr-1" />
                    Device Lock (MAC Binding)
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Restrict access to specific devices only
                  </p>
                </div>
                <div 
                  onClick={() => handleInputChange('mac_binding', !pppoe.mac_binding)} 
                  className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out flex-shrink-0 ${
                    !pppoe.enabled 
                      ? 'cursor-not-allowed opacity-50 bg-gray-400' 
                      : pppoe.mac_binding 
                        ? 'bg-green-600'
                        : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                  }`}
                  role="switch"
                  aria-checked={pppoe.mac_binding}
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && handleInputChange('mac_binding', !pppoe.mac_binding)}
                >
                  <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                    pppoe.mac_binding ? "translate-x-6" : "translate-x-1"
                  }`} />
                </div>
              </div>
            </div>
          </div>

          {/* Plan Summary */}
          <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-indigo-900/10' : 'bg-indigo-50'}`}>
            <h4 className="text-md font-semibold mb-4 text-indigo-700 dark:text-indigo-300 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              PPPoE Plan Summary
            </h4>
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3">
              <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <Calendar className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <div className="text-sm font-semibold truncate">{planSummary.validity}</div>
                <div className="text-xs text-gray-500">Duration</div>
              </div>
              <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <Database className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <div className="text-sm font-semibold truncate">{planSummary.dataLimit}</div>
                <div className="text-xs text-gray-500">Total Data</div>
              </div>
              <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <div className="text-sm font-semibold truncate">{planSummary.usageLimit}</div>
                <div className="text-xs text-gray-500">Daily Time</div>
              </div>
              <div className={`text-center p-3 rounded-lg flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <Users className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                <div className="text-sm font-semibold flex items-center justify-center gap-1">
                  {planSummary.maxDevices === 'Unlimited' && <InfinityIcon className="w-4 h-4" />}
                  <span className="truncate">{planSummary.maxDevices}</span>
                </div>
                <div className="text-xs text-gray-500">Max Devices</div>
              </div>
              <div className={`text-center p-3 rounded-lg flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <Gauge className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                <div className="text-sm font-semibold flex items-center justify-center gap-1">
                  {planSummary.bandwidth === 'Unlimited' && <InfinityIcon className="w-4 h-4" />}
                  <span className="truncate">{planSummary.bandwidth}</span>
                </div>
                <div className="text-xs text-gray-500">Bandwidth</div>
              </div>
              <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <Shield className="w-5 h-5 text-red-600 mx-auto mb-1" />
                <div className="text-sm font-semibold truncate">{pppoe.mac_binding ? 'Enabled' : 'Disabled'}</div>
                <div className="text-xs text-gray-500">Device Lock</div>
              </div>
            </div>
            
            {/* Network Specific Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Network Configuration</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                  <span className="text-xs text-gray-600 dark:text-gray-400">IP Pool:</span>
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{planSummary.ipPool}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                  <span className="text-xs text-gray-600 dark:text-gray-400">MTU:</span>
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">{planSummary.mtu}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={`p-8 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <Cable className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h4 className="text-lg font-medium mb-2 text-gray-600">PPPoE Disabled</h4>
          <p className="text-sm text-gray-500 mb-4">
            Enable PPPoE to configure wired network access settings for this plan.
          </p>
          <button
            onClick={handleToggle}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Enable PPPoE
          </button>
        </div>
      )}
    </div>
  );
};

PPPoEConfiguration.propTypes = {
  form: PropTypes.object,
  errors: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onNestedChange: PropTypes.func.isRequired,
  theme: PropTypes.oneOf(['light', 'dark'])
};

PPPoEConfiguration.defaultProps = {
  form: {},
  errors: {},
  theme: 'light'
};

export default React.memo(PPPoEConfiguration);



















// // ============================================================================
// // PPPoEConfiguration.js - FIXED: Removed defaultProps, using default parameters
// // ============================================================================

// import React, { useState, useMemo, useEffect, useCallback } from "react";
// import PropTypes from 'prop-types';
// import { motion } from "framer-motion";
// import { EnhancedSelect, getThemeClasses } from "../Shared/components";
// import { 
//   speedUnits, 
//   dataLimitPresets,
//   usageLimitPresets,
//   validityPeriodPresets,
//   deviceLimitOptions,
//   sessionTimeoutOptions,
//   idleTimeoutOptions,
//   bandwidthPresets,
//   ipPoolOptions,
//   mtuOptions
// } from "../Shared/constant";
// import { 
//   Users, Clock, Shield, Calendar, Cable, Database, Zap, Gauge, 
//   Smartphone, Infinity as InfinityIcon, AlertCircle,
//   Wifi, Server, HardDrive, Network
// } from "lucide-react";

// /**
//  * PPPoE Configuration Component
//  * Handles configuration for PPPoE plans with proper type safety and number handling
//  */
// const PPPoEConfiguration = ({ 
//   form = {}, 
//   errors = {}, 
//   onChange, 
//   onNestedChange, 
//   theme = 'light' 
// }) => {
//   const themeClasses = getThemeClasses(theme);
  
//   // Safely extract PPPoE configuration with fallbacks
//   const access_methods = form.access_methods || {};
//   const pppoe = access_methods.pppoe || {
//     enabled: false,
//     download_speed: { value: "", unit: "Mbps" },
//     upload_speed: { value: "", unit: "Mbps" },
//     data_limit: { value: "", unit: "GB" },
//     usage_limit: { value: "", unit: "Hours" },
//     bandwidth_limit: 0,
//     max_devices: "",
//     session_timeout: 0,
//     idle_timeout: 0,
//     validity_period: { value: "", unit: "Days" },
//     mac_binding: false,
//     ip_pool: "",
//     service_name: "",
//     mtu: ""
//   };

//   // State for preset selections
//   const [dataLimitPreset, setDataLimitPreset] = useState('custom');
//   const [usageLimitPreset, setUsageLimitPreset] = useState('custom');
//   const [validityPreset, setValidityPreset] = useState('custom');
//   const [bandwidthPreset, setBandwidthPreset] = useState('custom');
//   const [bandwidthUnit, setBandwidthUnit] = useState('Mbps');

//   // ==========================================================================
//   // HELPER FUNCTIONS - Type conversion utilities
//   // ==========================================================================

//   /**
//    * Safely converts any value to a number or returns 0
//    * Used for backend-bound values that must be numbers
//    */
//   const toSafeNumber = useCallback((value) => {
//     if (value === "" || value === null || value === undefined) return 0;
//     const num = Number(value);
//     return isNaN(num) ? 0 : num;
//   }, []);

//   /**
//    * Converts value to number or returns empty string for display
//    * Used for UI display where empty means "not set"
//    */
//   const toDisplayNumber = useCallback((value) => {
//     if (value === "" || value === null || value === undefined) return "";
//     const num = Number(value);
//     return isNaN(num) ? "" : num;
//   }, []);

//   /**
//    * Checks if a value is effectively empty (for UI logic)
//    */
//   const isEmpty = useCallback((value) => {
//     return value === "" || value === null || value === undefined;
//   }, []);

//   // ==========================================================================
//   // PRESET OPTIONS WITH SAFETY CHECKS
//   // ==========================================================================

//   const getSafeBandwidthPresets = useCallback(() => {
//     if (!Array.isArray(bandwidthPresets) || bandwidthPresets.length === 0) {
//       return [{ value: 'custom', label: 'Set custom bandwidth' }];
//     }
    
//     const options = bandwidthPresets.map(preset => {
//       const value = preset?.value?.toString() || '';
//       const label = preset?.label || '';
//       const description = preset?.description || '';
      
//       return {
//         value,
//         label: value === '0' 
//           ? 'Unlimited - No restrictions' 
//           : description ? `${label} - ${description}` : label
//       };
//     }).filter(option => option.value !== undefined);
    
//     return [
//       ...options,
//       { value: 'custom', label: 'Set custom bandwidth' }
//     ];
//   }, []);

//   const getSafeValidityPeriodPresets = useCallback(() => {
//     if (!Array.isArray(validityPeriodPresets) || validityPeriodPresets.length === 0) {
//       return [{ value: 'custom', label: 'Set custom duration' }];
//     }
    
//     const options = validityPeriodPresets.map(preset => {
//       const value = preset?.value?.toString() || '';
//       const label = preset?.label || '';
//       const description = preset?.description || '';
      
//       return {
//         value,
//         label: description ? `${label} - ${description}` : label
//       };
//     }).filter(option => option.value && option.label);
    
//     return [
//       ...options,
//       { value: 'custom', label: 'Set custom duration' }
//     ];
//   }, []);

//   const getSafeDataLimitPresets = useCallback(() => {
//     if (!Array.isArray(dataLimitPresets) || dataLimitPresets.length === 0) {
//       return [{ value: 'custom', label: 'Set custom data amount' }];
//     }
    
//     const options = dataLimitPresets.map(preset => {
//       const value = preset?.value?.toString() || '';
//       const label = preset?.label || '';
//       const description = preset?.description || '';
      
//       return {
//         value,
//         label: description ? `${label} - ${description}` : label
//       };
//     }).filter(option => option.value && option.label);
    
//     return [
//       ...options,
//       { value: 'custom', label: 'Set custom data amount' }
//     ];
//   }, []);

//   const getSafeUsageLimitPresets = useCallback(() => {
//     if (!Array.isArray(usageLimitPresets) || usageLimitPresets.length === 0) {
//       return [{ value: 'custom', label: 'Set custom hours' }];
//     }
    
//     const options = usageLimitPresets.map(preset => {
//       const value = preset?.value?.toString() || '';
//       const label = preset?.label || '';
//       const description = preset?.description || '';
      
//       return {
//         value,
//         label: description ? `${label} - ${description}` : label
//       };
//     }).filter(option => option.value && option.label);
    
//     return [
//       ...options,
//       { value: 'custom', label: 'Set custom hours' }
//     ];
//   }, []);

//   // ==========================================================================
//   // EVENT HANDLERS - Change management
//   // ==========================================================================

//   /**
//    * Handle input changes with proper type conversion
//    * Special handling for fields that must be numbers in backend
//    */
//   const handleInputChange = useCallback((field, value) => {
//     // Fields that must always be numbers in the backend
//     const numericFields = ['session_timeout', 'idle_timeout', 'bandwidth_limit'];
    
//     if (numericFields.includes(field)) {
//       // Convert to number, default to 0 for empty values
//       const numericValue = toSafeNumber(value);
//       onChange('pppoe', field, numericValue);
//     } else {
//       // Pass through as-is for other fields
//       onChange('pppoe', field, value);
//     }
//   }, [onChange, toSafeNumber]);

//   /**
//    * Handle nested field changes (objects like data_limit, validity_period)
//    */
//   const handleNestedChange = useCallback((field, subfield, value) => {
//     onNestedChange('pppoe', field, subfield, value);
//   }, [onNestedChange]);

//   /**
//    * Handle timeout fields specifically (always numbers)
//    */
//   const handleTimeoutChange = useCallback((field, value) => {
//     const numericValue = toSafeNumber(value);
//     handleInputChange(field, numericValue);
//   }, [handleInputChange, toSafeNumber]);

//   /**
//    * Toggle PPPoE enabled state
//    */
//   const handleToggle = useCallback(() => {
//     handleInputChange('enabled', !pppoe.enabled);
//   }, [pppoe.enabled, handleInputChange]);

//   // ==========================================================================
//   // PRESET HANDLERS - Predefined value selections
//   // ==========================================================================

//   const handleDataLimitPreset = useCallback((presetKey) => {
//     setDataLimitPreset(presetKey);
//     if (presetKey !== 'custom') {
//       const preset = dataLimitPresets?.find(p => String(p.value) === presetKey);
//       if (preset) {
//         handleNestedChange('data_limit', 'value', preset.value);
//         handleNestedChange('data_limit', 'unit', preset.unit);
//       }
//     } else {
//       handleNestedChange('data_limit', 'value', "");
//     }
//   }, [dataLimitPresets, handleNestedChange]);

//   const handleUsageLimitPreset = useCallback((presetKey) => {
//     setUsageLimitPreset(presetKey);
//     if (presetKey !== 'custom') {
//       const preset = usageLimitPresets?.find(p => String(p.value) === presetKey);
//       if (preset) {
//         handleNestedChange('usage_limit', 'value', preset.value);
//         handleNestedChange('usage_limit', 'unit', preset.unit);
//       }
//     } else {
//       handleNestedChange('usage_limit', 'value', "");
//     }
//   }, [usageLimitPresets, handleNestedChange]);

//   const handleValidityPreset = useCallback((presetKey) => {
//     setValidityPreset(presetKey);
//     if (presetKey !== 'custom') {
//       const preset = validityPeriodPresets?.find(p => String(p.value) === presetKey);
//       if (preset) {
//         handleNestedChange('validity_period', 'value', preset.value);
//         handleNestedChange('validity_period', 'unit', preset.unit);
//       }
//     } else {
//       handleNestedChange('validity_period', 'value', "");
//     }
//   }, [validityPeriodPresets, handleNestedChange]);

//   const handleBandwidthPreset = useCallback((presetKey) => {
//     setBandwidthPreset(presetKey);
//     if (presetKey !== 'custom') {
//       const presetValue = parseInt(presetKey, 10);
//       const preset = bandwidthPresets?.find(p => p.value === presetValue);
//       if (preset) {
//         handleInputChange('bandwidth_limit', preset.value);
//       }
//     } else {
//       handleInputChange('bandwidth_limit', 0);
//     }
//   }, [bandwidthPresets, handleInputChange]);

//   // ==========================================================================
//   // BANDWIDTH HANDLING - Unit conversion logic
//   // ==========================================================================

//   /**
//    * Get display value for bandwidth (converted to selected unit)
//    */
//   const getBandwidthDisplayValue = useCallback(() => {
//     const bandwidth = toSafeNumber(pppoe.bandwidth_limit);
//     if (bandwidthUnit === 'Mbps') {
//       const mbps = bandwidth / 1000;
//       return mbps === 0 ? "" : mbps;
//     }
//     return bandwidth === 0 ? "" : bandwidth;
//   }, [pppoe.bandwidth_limit, bandwidthUnit, toSafeNumber]);

//   /**
//    * Handle bandwidth change with unit conversion
//    */
//   const handleBandwidthChange = useCallback((value) => {
//     const numValue = parseFloat(value) || 0;
//     if (bandwidthUnit === 'Mbps') {
//       handleInputChange('bandwidth_limit', numValue * 1000);
//     } else {
//       handleInputChange('bandwidth_limit', numValue);
//     }
//   }, [bandwidthUnit, handleInputChange]);

//   // ==========================================================================
//   // DOWNLOAD SPEED HANDLING - With MTU auto-suggest
//   // ==========================================================================

//   /**
//    * Suggest MTU based on download speed
//    */
//   const getSuggestedMTU = useCallback((downloadSpeed) => {
//     const speed = parseFloat(downloadSpeed) || 0;
//     if (speed >= 100) return 1500;
//     if (speed >= 50) return 1492;
//     return 1480;
//   }, []);

//   /**
//    * Handle download speed change with MTU auto-suggest
//    */
//   const handleDownloadSpeedChange = useCallback((value) => {
//     handleNestedChange('download_speed', 'value', value);
    
//     // Auto-suggest MTU if not already set
//     if (isEmpty(pppoe.mtu)) {
//       const suggestedMTU = getSuggestedMTU(value);
//       handleInputChange('mtu', suggestedMTU);
//     }
//   }, [handleNestedChange, pppoe.mtu, getSuggestedMTU, handleInputChange, isEmpty]);

//   // ==========================================================================
//   // FORMATTING FUNCTIONS - Display helpers
//   // ==========================================================================

//   /**
//    * Format seconds into human-readable time
//    */
//   const formatTimeDisplay = useCallback((seconds) => {
//     const numSeconds = toSafeNumber(seconds);
//     if (numSeconds === 0) return "No Limit";
    
//     if (numSeconds >= 86400) {
//       const days = numSeconds / 86400;
//       return days === 1 ? "1 Day" : `${days} Days`;
//     } else if (numSeconds >= 3600) {
//       const hours = numSeconds / 3600;
//       return hours === 1 ? "1 Hour" : `${hours} Hours`;
//     } else if (numSeconds >= 60) {
//       const minutes = numSeconds / 60;
//       return minutes === 1 ? "1 Minute" : `${minutes} Minutes`;
//     }
//     return `${numSeconds} Seconds`;
//   }, [toSafeNumber]);

//   /**
//    * Format Kbps into human-readable bandwidth
//    */
//   const formatBandwidthDisplay = useCallback((kbps) => {
//     const numKbps = toSafeNumber(kbps);
//     if (numKbps === 0) return "Unlimited";
    
//     if (numKbps >= 1000) {
//       const mbps = numKbps / 1000;
//       return `${mbps.toFixed(mbps % 1 === 0 ? 0 : 1)} Mbps`;
//     }
//     return `${numKbps} Kbps`;
//   }, [toSafeNumber]);

//   // ==========================================================================
//   // PLAN SUMMARY - Memoized display values
//   // ==========================================================================

//   const planSummary = useMemo(() => {
//     const maxDevicesValue = toSafeNumber(pppoe.max_devices);
    
//     const dataLimitValue = pppoe.data_limit?.value || '0';
//     const dataLimitUnit = pppoe.data_limit?.unit || 'GB';
//     const dataLimitDisplay = isEmpty(dataLimitValue) || dataLimitValue === '0' 
//       ? 'No Limit' 
//       : `${dataLimitValue} ${dataLimitUnit}`;
    
//     const usageLimitValue = pppoe.usage_limit?.value || '0';
//     const usageLimitUnit = pppoe.usage_limit?.unit || 'Hours';
//     const usageLimitDisplay = isEmpty(usageLimitValue) || usageLimitValue === '0'
//       ? 'No Limit' 
//       : `${usageLimitValue} ${usageLimitUnit}`;

//     const validityValue = pppoe.validity_period?.value || '0';
//     const validityUnit = pppoe.validity_period?.unit || 'Days';
//     const validityDisplay = isEmpty(validityValue) || validityValue === '0'
//       ? 'No Expiry'
//       : `${validityValue} ${validityUnit}`;

//     return {
//       dataLimit: dataLimitDisplay,
//       usageLimit: usageLimitDisplay,
//       validity: validityDisplay,
//       maxDevices: maxDevicesValue === 0 ? 'Unlimited' : `${maxDevicesValue} device${maxDevicesValue > 1 ? 's' : ''}`,
//       sessionTimeout: formatTimeDisplay(pppoe.session_timeout),
//       idleTimeout: formatTimeDisplay(pppoe.idle_timeout),
//       bandwidth: formatBandwidthDisplay(pppoe.bandwidth_limit),
//       mtu: isEmpty(pppoe.mtu) ? 'Not set' : `${pppoe.mtu} bytes`,
//       ipPool: isEmpty(pppoe.ip_pool) ? 'Not set' : pppoe.ip_pool,
//       serviceName: isEmpty(pppoe.service_name) ? 'Not set' : pppoe.service_name
//     };
//   }, [pppoe, formatTimeDisplay, formatBandwidthDisplay, toSafeNumber, isEmpty]);

//   // ==========================================================================
//   // RENDER
//   // ==========================================================================

//   return (
//     <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-lg lg:text-xl font-semibold flex items-center">
//           <Cable className="w-5 h-5 mr-2 text-green-600" />
//           PPPoE Configuration
//         </h3>
//         <div className="flex items-center">
//           <label className={`block text-sm font-medium mr-4 ${themeClasses.text.primary}`}>
//             Enable PPPoE
//           </label>
//           <div 
//             onClick={handleToggle}
//             className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
//               pppoe.enabled 
//                 ? 'bg-green-600'
//                 : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//             }`}
//             role="switch"
//             aria-checked={pppoe.enabled}
//             tabIndex={0}
//             onKeyPress={(e) => e.key === 'Enter' && handleToggle()}
//           >
//             <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//               pppoe.enabled ? "translate-x-6" : "translate-x-1"
//             }`} />
//           </div>
//         </div>
//       </div>

//       {pppoe.enabled ? (
//         <div className="space-y-6 lg:space-y-8">
//           {/* Speed Configuration */}
//           <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-green-900/10' : 'bg-green-50'}`}>
//             <h4 className="text-md font-semibold mb-4 text-green-700 dark:text-green-300 flex items-center">
//               <Zap className="w-4 h-4 mr-2" />
//               Speed & Bandwidth Settings
//             </h4>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
//               {/* Download Speed */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   Download Speed <span className="text-red-500">*</span>
//                 </label>
//                 <div className="flex flex-col sm:flex-row gap-2">
//                   <input 
//                     type="number" 
//                     value={pppoe.download_speed?.value || ""} 
//                     onChange={(e) => handleDownloadSpeedChange(e.target.value)} 
//                     className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                     min="0.01" 
//                     step="0.01" 
//                     placeholder="e.g., 15" 
//                     required 
//                   />
//                   <EnhancedSelect
//                     value={pppoe.download_speed?.unit || "Mbps"}
//                     onChange={(value) => handleNestedChange('download_speed', 'unit', value)}
//                     options={Array.isArray(speedUnits) ? speedUnits.map(unit => ({ value: unit, label: unit })) : []}
//                     className="text-xs min-w-[5rem]"
//                     theme={theme}
//                   />
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">Maximum download speed for connection</p>
//               </div>
              
//               {/* Upload Speed */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   Upload Speed <span className="text-red-500">*</span>
//                 </label>
//                 <div className="flex flex-col sm:flex-row gap-2">
//                   <input 
//                     type="number" 
//                     value={pppoe.upload_speed?.value || ""} 
//                     onChange={(e) => handleNestedChange('upload_speed', 'value', e.target.value)} 
//                     className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                     min="0.01" 
//                     step="0.01" 
//                     placeholder="e.g., 3" 
//                     required 
//                   />
//                   <EnhancedSelect
//                     value={pppoe.upload_speed?.unit || "Mbps"}
//                     onChange={(value) => handleNestedChange('upload_speed', 'unit', value)}
//                     options={Array.isArray(speedUnits) ? speedUnits.map(unit => ({ value: unit, label: unit })) : []}
//                     className="text-xs min-w-[5rem]"
//                     theme={theme}
//                   />
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">Maximum upload speed for connection</p>
//               </div>
//             </div>

//             {/* Bandwidth Limit */}
//             <div className="mt-6">
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 <Gauge className="w-4 h-4 inline mr-1" />
//                 Total Bandwidth Limit
//                 <span className="text-xs text-gray-500 ml-2">Shared bandwidth for this connection</span>
//               </label>
              
//               <div className="mb-3">
//                 <EnhancedSelect
//                   value={bandwidthPreset}
//                   onChange={handleBandwidthPreset}
//                   options={getSafeBandwidthPresets()}
//                   theme={theme}
//                 />
//               </div>
              
//               {bandwidthPreset === 'custom' && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   exit={{ opacity: 0, height: 0 }}
//                   className="space-y-3"
//                 >
//                   <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
//                     <input 
//                       type="number" 
//                       value={getBandwidthDisplayValue()} 
//                       onChange={(e) => handleBandwidthChange(e.target.value)} 
//                       className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                       min="0" 
//                       step="any" 
//                       placeholder="Enter value" 
//                     />
//                     <EnhancedSelect
//                       value={bandwidthUnit}
//                       onChange={setBandwidthUnit}
//                       options={[
//                         { value: 'Mbps', label: 'Mbps' },
//                         { value: 'Kbps', label: 'Kbps' }
//                       ]}
//                       className="text-xs min-w-[5rem]"
//                       theme={theme}
//                     />
//                     <span className="text-sm text-gray-500 whitespace-nowrap">
//                       ({formatBandwidthDisplay(pppoe.bandwidth_limit)})
//                     </span>
//                   </div>
//                   <p className="text-xs text-gray-500">
//                     Enter bandwidth and select unit. Internally stored as Kbps.
//                   </p>
//                 </motion.div>
//               )}
              
//               {bandwidthPreset !== 'custom' && pppoe.bandwidth_limit !== 0 && (
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.95 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ duration: 0.2 }}
//                   className={`p-3 rounded-lg flex items-center gap-2 ${theme === 'dark' ? 'bg-green-800/20' : 'bg-green-100'}`}
//                 >
//                   {pppoe.bandwidth_limit === 0 && <InfinityIcon className="w-4 h-4 text-green-600 dark:text-green-300" />}
//                   <p className="text-sm text-green-700 dark:text-green-300">
//                     <strong>Selected:</strong> {formatBandwidthDisplay(pppoe.bandwidth_limit)}
//                   </p>
//                 </motion.div>
//               )}
//             </div>
//           </div>

//           {/* Data & Usage Limits */}
//           <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-purple-900/10' : 'bg-purple-50'}`}>
//             <h4 className="text-md font-semibold mb-4 text-purple-700 dark:text-purple-300 flex items-center">
//               <Database className="w-4 h-4 mr-2" />
//               Plan Limits & Duration
//             </h4>
            
//             {/* Validity Period */}
//             <div className="mb-6">
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 <Calendar className="w-4 h-4 inline mr-1" />
//                 Plan Duration <span className="text-red-500">*</span>
//               </label>
//               <div className="mb-2">
//                 <EnhancedSelect
//                   value={validityPreset}
//                   onChange={handleValidityPreset}
//                   options={getSafeValidityPeriodPresets()}
//                   theme={theme}
//                 />
//               </div>
//               {validityPreset === 'custom' && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   exit={{ opacity: 0, height: 0 }}
//                   className="space-y-2"
//                 >
//                   <div className="flex flex-col sm:flex-row gap-2">
//                     <input 
//                       value={pppoe.validity_period?.value || ""} 
//                       onChange={(e) => handleNestedChange('validity_period', 'value', e.target.value)} 
//                       className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                       placeholder="Enter duration value" 
//                       required 
//                     />
//                     <EnhancedSelect
//                       value={pppoe.validity_period?.unit || "Days"}
//                       onChange={(value) => handleNestedChange('validity_period', 'unit', value)}
//                       options={[
//                         { value: 'Hours', label: 'Hours' },
//                         { value: 'Days', label: 'Days' },
//                         { value: 'Weeks', label: 'Weeks' },
//                         { value: 'Months', label: 'Months' }
//                       ]}
//                       className="text-xs min-w-[5rem]"
//                       theme={theme}
//                     />
//                   </div>
//                   <p className="text-xs text-gray-500">
//                     Set the custom duration for this plan
//                   </p>
//                 </motion.div>
//               )}
//               <p className="text-xs text-gray-500 mt-1">How long the plan remains active after activation</p>
//             </div>

//             {/* Data Limit */}
//             <div className="mb-6">
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 Total Data Allowance <span className="text-red-500">*</span>
//               </label>
//               <div className="mb-2">
//                 <EnhancedSelect
//                   value={dataLimitPreset}
//                   onChange={handleDataLimitPreset}
//                   options={getSafeDataLimitPresets()}
//                   theme={theme}
//                 />
//               </div>
//               {dataLimitPreset === 'custom' && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   exit={{ opacity: 0, height: 0 }}
//                   className="space-y-2"
//                 >
//                   <div className="flex flex-col sm:flex-row gap-2">
//                     <input 
//                       value={pppoe.data_limit?.value || ""} 
//                       onChange={(e) => handleNestedChange('data_limit', 'value', e.target.value)} 
//                       className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                       placeholder="Enter data amount" 
//                       required 
//                     />
//                     <EnhancedSelect
//                       value={pppoe.data_limit?.unit || "GB"}
//                       onChange={(value) => handleNestedChange('data_limit', 'unit', value)}
//                       options={[
//                         { value: 'MB', label: 'MB' },
//                         { value: 'GB', label: 'GB' },
//                         { value: 'TB', label: 'TB' }
//                       ]}
//                       className="text-xs min-w-[5rem]"
//                       theme={theme}
//                     />
//                   </div>
//                   <p className="text-xs text-gray-500">
//                     Set the custom data limit for this plan
//                   </p>
//                 </motion.div>
//               )}
//               <p className="text-xs text-gray-500 mt-1">Total data available for the entire plan duration</p>
//             </div>

//             {/* Usage Limit */}
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 <Clock className="w-4 h-4 inline mr-1" />
//                 Daily Time Limit
//               </label>
//               <div className="mb-2">
//                 <EnhancedSelect
//                   value={usageLimitPreset}
//                   onChange={handleUsageLimitPreset}
//                   options={getSafeUsageLimitPresets()}
//                   theme={theme}
//                 />
//               </div>
//               {usageLimitPreset === 'custom' && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   exit={{ opacity: 0, height: 0 }}
//                   className="space-y-2"
//                 >
//                   <div className="flex flex-col sm:flex-row gap-2">
//                     <input 
//                       value={pppoe.usage_limit?.value || ""} 
//                       onChange={(e) => handleNestedChange('usage_limit', 'value', e.target.value)} 
//                       className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                       placeholder="Enter hours per day" 
//                       required 
//                     />
//                     <EnhancedSelect
//                       value={pppoe.usage_limit?.unit || "Hours"}
//                       onChange={(value) => handleNestedChange('usage_limit', 'unit', value)}
//                       options={[
//                         { value: 'Minutes', label: 'Minutes' },
//                         { value: 'Hours', label: 'Hours' }
//                       ]}
//                       className="text-xs min-w-[5rem]"
//                       theme={theme}
//                     />
//                   </div>
//                   <p className="text-xs text-gray-500">
//                     Set the custom daily usage limit
//                   </p>
//                 </motion.div>
//               )}
//               <p className="text-xs text-gray-500 mt-1">Maximum connection time allowed per day</p>
//             </div>
//           </div>

//           {/* PPPoE Network Settings */}
//           <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-blue-900/10' : 'bg-blue-50'}`}>
//             <h4 className="text-md font-semibold mb-4 text-blue-700 dark:text-blue-300 flex items-center">
//               <Network className="w-4 h-4 mr-2" />
//               PPPoE Network Settings
//             </h4>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
//               {/* IP Pool */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   IP Pool
//                 </label>
//                 <EnhancedSelect
//                   value={pppoe.ip_pool || ""}
//                   onChange={(value) => handleInputChange('ip_pool', value)}
//                   options={Array.isArray(ipPoolOptions) ? ipPoolOptions : []}
//                   placeholder="Select IP pool"
//                   theme={theme}
//                 />
//                 <p className="text-xs text-gray-500 mt-1">IP pool name for PPPoE users</p>
//               </div>

//               {/* Service Name */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   Service Name
//                 </label>
//                 <input 
//                   value={pppoe.service_name || ""} 
//                   onChange={(e) => handleInputChange('service_name', e.target.value)} 
//                   className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                   placeholder="PPPoE Service" 
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Service identifier for PPPoE</p>
//               </div>
//             </div>

//             {/* MTU */}
//             <div className="mt-6">
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 MTU (Maximum Transmission Unit)
//                 <span className="text-xs text-gray-500 ml-2">Recommended: 1492 for most ISPs</span>
//               </label>
//               <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
//                 <div className="flex-1 flex flex-col sm:flex-row gap-2">
//                   <EnhancedSelect
//                     value={pppoe.mtu || ""}
//                     onChange={(value) => handleInputChange('mtu', value ? parseInt(value, 10) : "")}
//                     options={Array.isArray(mtuOptions) ? mtuOptions : []}
//                     placeholder="Select MTU"
//                     theme={theme}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => {
//                       const suggestedMTU = getSuggestedMTU(pppoe.download_speed?.value);
//                       handleInputChange('mtu', suggestedMTU);
//                     }}
//                     className={`px-3 py-2 text-xs rounded-lg transition-colors whitespace-nowrap ${
//                       theme === 'dark'
//                         ? 'bg-blue-600 text-white hover:bg-blue-700'
//                         : 'bg-blue-600 text-white hover:bg-blue-700'
//                     }`}
//                   >
//                     Auto Suggest
//                   </button>
//                 </div>
//                 <div className={`text-sm px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
//                   <span className="font-medium">Current: </span>
//                   {isEmpty(pppoe.mtu) ? 'Not set' : `${pppoe.mtu} bytes`}
//                 </div>
//               </div>
//               <p className="text-xs text-gray-500 mt-1">
//                 Maximum data packet size. Auto suggests optimal value based on download speed.
//               </p>
//             </div>
//           </div>

//           {/* Security & Device Management */}
//           <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-orange-900/10' : 'bg-orange-50'}`}>
//             <h4 className="text-md font-semibold mb-4 text-orange-700 dark:text-orange-300 flex items-center">
//               <Shield className="w-4 h-4 mr-2" />
//               Security & Device Management
//             </h4>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
//               {/* Maximum Devices */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   <Users className="w-4 h-4 inline mr-1" />
//                   Maximum Connected Devices
//                 </label>
//                 <EnhancedSelect
//                   value={pppoe.max_devices ?? ""}
//                   onChange={(value) => handleInputChange('max_devices', value === "" ? "" : Number(value))}
//                   options={Array.isArray(deviceLimitOptions) ? deviceLimitOptions : []}
//                   placeholder="Select device limit"
//                   theme={theme}
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Limit simultaneous connections</p>
//               </div>

//               {/* Session Timeout - ALWAYS sends number */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   <Clock className="w-4 h-4 inline mr-1" />
//                   Session Timeout
//                 </label>
//                 <EnhancedSelect
//                   value={pppoe.session_timeout ?? 0}
//                   onChange={(value) => handleTimeoutChange('session_timeout', value)}
//                   options={Array.isArray(sessionTimeoutOptions) ? sessionTimeoutOptions : []}
//                   theme={theme}
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Forces reconnection for security (0 = no timeout)</p>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mt-4">
//               {/* Idle Timeout - ALWAYS sends number */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   Idle Timeout
//                 </label>
//                 <EnhancedSelect
//                   value={pppoe.idle_timeout ?? 0}
//                   onChange={(value) => handleTimeoutChange('idle_timeout', value)}
//                   options={Array.isArray(idleTimeoutOptions) ? idleTimeoutOptions : []}
//                   theme={theme}
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Disconnects after inactivity (0 = no timeout)</p>
//               </div>

//               {/* MAC Binding */}
//               <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg gap-2">
//                 <div className="flex-1">
//                   <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                     <Smartphone className="w-4 h-4 inline mr-1" />
//                     Device Lock (MAC Binding)
//                   </label>
//                   <p className="text-xs text-gray-500 mt-1">
//                     Restrict access to specific devices only
//                   </p>
//                 </div>
//                 <div 
//                   onClick={() => handleInputChange('mac_binding', !pppoe.mac_binding)} 
//                   className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out flex-shrink-0 ${
//                     !pppoe.enabled 
//                       ? 'cursor-not-allowed opacity-50 bg-gray-400' 
//                       : pppoe.mac_binding 
//                         ? 'bg-green-600'
//                         : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//                   }`}
//                   role="switch"
//                   aria-checked={pppoe.mac_binding}
//                   tabIndex={0}
//                   onKeyPress={(e) => e.key === 'Enter' && handleInputChange('mac_binding', !pppoe.mac_binding)}
//                 >
//                   <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//                     pppoe.mac_binding ? "translate-x-6" : "translate-x-1"
//                   }`} />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Plan Summary */}
//           <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-indigo-900/10' : 'bg-indigo-50'}`}>
//             <h4 className="text-md font-semibold mb-4 text-indigo-700 dark:text-indigo-300 flex items-center">
//               <Calendar className="w-4 h-4 mr-2" />
//               PPPoE Plan Summary
//             </h4>
//             <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3">
//               <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//                 <Calendar className="w-5 h-5 text-blue-600 mx-auto mb-1" />
//                 <div className="text-sm font-semibold truncate">{planSummary.validity}</div>
//                 <div className="text-xs text-gray-500">Duration</div>
//               </div>
//               <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//                 <Database className="w-5 h-5 text-green-600 mx-auto mb-1" />
//                 <div className="text-sm font-semibold truncate">{planSummary.dataLimit}</div>
//                 <div className="text-xs text-gray-500">Total Data</div>
//               </div>
//               <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//                 <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
//                 <div className="text-sm font-semibold truncate">{planSummary.usageLimit}</div>
//                 <div className="text-xs text-gray-500">Daily Time</div>
//               </div>
//               <div className={`text-center p-3 rounded-lg flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//                 <Users className="w-5 h-5 text-orange-600 mx-auto mb-1" />
//                 <div className="text-sm font-semibold flex items-center justify-center gap-1">
//                   {planSummary.maxDevices === 'Unlimited' && <InfinityIcon className="w-4 h-4" />}
//                   <span className="truncate">{planSummary.maxDevices}</span>
//                 </div>
//                 <div className="text-xs text-gray-500">Max Devices</div>
//               </div>
//               <div className={`text-center p-3 rounded-lg flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//                 <Gauge className="w-5 h-5 text-teal-600 mx-auto mb-1" />
//                 <div className="text-sm font-semibold flex items-center justify-center gap-1">
//                   {planSummary.bandwidth === 'Unlimited' && <InfinityIcon className="w-4 h-4" />}
//                   <span className="truncate">{planSummary.bandwidth}</span>
//                 </div>
//                 <div className="text-xs text-gray-500">Bandwidth</div>
//               </div>
//               <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
//                 <Shield className="w-5 h-5 text-red-600 mx-auto mb-1" />
//                 <div className="text-sm font-semibold truncate">{pppoe.mac_binding ? 'Enabled' : 'Disabled'}</div>
//                 <div className="text-xs text-gray-500">Device Lock</div>
//               </div>
//             </div>
            
//             {/* Network Specific Summary */}
//             <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
//               <h5 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Network Configuration</h5>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
//                   <span className="text-xs text-gray-600 dark:text-gray-400">IP Pool:</span>
//                   <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{planSummary.ipPool}</span>
//                 </div>
//                 <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
//                   <span className="text-xs text-gray-600 dark:text-gray-400">MTU:</span>
//                   <span className="text-xs font-medium text-green-600 dark:text-green-400">{planSummary.mtu}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div className={`p-8 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
//           <Cable className="w-12 h-12 mx-auto mb-4 text-gray-400" />
//           <h4 className="text-lg font-medium mb-2 text-gray-600">PPPoE Disabled</h4>
//           <p className="text-sm text-gray-500 mb-4">
//             Enable PPPoE to configure wired network access settings for this plan.
//           </p>
//           <button
//             onClick={handleToggle}
//             className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//           >
//             Enable PPPoE
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// PPPoEConfiguration.propTypes = {
//   form: PropTypes.object,
//   errors: PropTypes.object,
//   onChange: PropTypes.func.isRequired,
//   onNestedChange: PropTypes.func.isRequired,
//   theme: PropTypes.oneOf(['light', 'dark'])
// };



// export default React.memo(PPPoEConfiguration);