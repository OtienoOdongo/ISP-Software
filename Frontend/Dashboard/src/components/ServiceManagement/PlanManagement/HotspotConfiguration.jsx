
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
  bandwidthPresets
} from "../Shared/constant";
import { 
  Users, Clock, Shield, Calendar, Wifi, Database, Zap, Gauge, 
  Smartphone, Infinity as InfinityIcon, AlertCircle 
} from "lucide-react";

// FIXED: Using default parameters instead of defaultProps
const HotspotConfiguration = ({ 
  form = {}, 
  errors = {}, 
  onChange, 
  onNestedChange, 
  theme = 'light' 
}) => {
  const themeClasses = getThemeClasses(theme);
  
  // Safely extract hotspot configuration with fallbacks
  const access_methods = form.access_methods || form.accessMethods || {};
  const hotspot = access_methods.hotspot || {
    enabled: false,
    download_speed: { value: "", unit: "Mbps" },
    upload_speed: { value: "", unit: "Mbps" },
    data_limit: { value: "", unit: "GB" },
    usage_limit: { value: "", unit: "Hours" },
    bandwidth_limit: 0,
    max_devices: "",
    session_timeout: "",
    idle_timeout: "",
    validity_period: { value: "", unit: "Days" },
    mac_binding: false
  };

  // State for preset selections
  const [dataLimitPreset, setDataLimitPreset] = useState('custom');
  const [usageLimitPreset, setUsageLimitPreset] = useState('custom');
  const [validityPreset, setValidityPreset] = useState('custom');
  const [bandwidthPreset, setBandwidthPreset] = useState('custom');
  const [bandwidthUnit, setBandwidthUnit] = useState('Mbps');

  // FIXED: Ensure all options have proper labels
  const getSafeSpeedUnits = useCallback(() => {
    if (!Array.isArray(speedUnits) || speedUnits.length === 0) {
      return [{ value: 'Mbps', label: 'Mbps' }];
    }
    
    return speedUnits.map(unit => {
      if (typeof unit === 'string') {
        return { value: unit, label: unit };
      }
      return {
        value: unit?.value || 'Mbps',
        label: unit?.label || unit?.value || 'Mbps'
      };
    });
  }, []);

  const getSafeDataLimitPresets = useCallback(() => {
    if (!Array.isArray(dataLimitPresets) || dataLimitPresets.length === 0) {
      return [{ value: 'custom', label: 'Set custom data amount' }];
    }
    
    const options = dataLimitPresets.map(preset => {
      const value = preset?.value?.toString() || '';
      const label = preset?.label || '';
      const description = preset?.description || '';
      
      return {
        value,
        label: description ? `${label} - ${description}` : label
      };
    }).filter(option => option.value && option.label);
    
    return [
      ...options,
      { value: 'custom', label: 'Set custom data amount' }
    ];
  }, []);

  const getSafeUsageLimitPresets = useCallback(() => {
    if (!Array.isArray(usageLimitPresets) || usageLimitPresets.length === 0) {
      return [{ value: 'custom', label: 'Set custom hours' }];
    }
    
    const options = usageLimitPresets.map(preset => {
      const value = preset?.value?.toString() || '';
      const label = preset?.label || '';
      const description = preset?.description || '';
      
      return {
        value,
        label: description ? `${label} - ${description}` : label
      };
    }).filter(option => option.value && option.label);
    
    return [
      ...options,
      { value: 'custom', label: 'Set custom hours' }
    ];
  }, []);

  const getSafeValidityPeriodPresets = useCallback(() => {
    if (!Array.isArray(validityPeriodPresets) || validityPeriodPresets.length === 0) {
      return [{ value: 'custom', label: 'Set custom duration' }];
    }
    
    const options = validityPeriodPresets.map(preset => {
      const value = preset?.value?.toString() || '';
      const label = preset?.label || '';
      const description = preset?.description || '';
      
      return {
        value,
        label: description ? `${label} - ${description}` : label
      };
    }).filter(option => option.value && option.label);
    
    return [
      ...options,
      { value: 'custom', label: 'Set custom duration' }
    ];
  }, []);

  const getSafeBandwidthPresets = useCallback(() => {
    if (!Array.isArray(bandwidthPresets) || bandwidthPresets.length === 0) {
      return [{ value: 'custom', label: 'Set custom bandwidth' }];
    }
    
    const options = bandwidthPresets.map(preset => {
      const value = preset?.value?.toString() || '';
      const label = preset?.label || '';
      const description = preset?.description || '';
      
      return {
        value,
        label: value === '0' 
          ? 'Unlimited - No restrictions' 
          : description ? `${label} - ${description}` : label
      };
    }).filter(option => option.value !== undefined);
    
    return [
      ...options,
      { value: 'custom', label: 'Set custom bandwidth' }
    ];
  }, []);

  // FIXED: Get device limit options with proper labels
  const getSafeDeviceLimitOptions = useCallback(() => {
    if (!Array.isArray(deviceLimitOptions) || deviceLimitOptions.length === 0) {
      return [
        { value: 1, label: '1 Device' },
        { value: 2, label: '2 Devices' },
        { value: 3, label: '3 Devices' },
        { value: 4, label: '4 Devices' },
        { value: 5, label: '5 Devices' }
      ];
    }
    
    return deviceLimitOptions.map(option => {
      if (typeof option === 'object' && option !== null) {
        const value = option.value;
        const label = option.label || `${value} Device${value > 1 ? 's' : ''}`;
        return { value, label };
      }
      const value = option;
      return { 
        value, 
        label: `${value} Device${value > 1 ? 's' : ''}` 
      };
    });
  }, []);

  // FIXED: Get timeout options with proper labels
  const getSafeTimeoutOptions = useCallback((optionsArray, type = 'session') => {
    if (!Array.isArray(optionsArray) || optionsArray.length === 0) {
      if (type === 'session') {
        return [
          { value: 3600, label: '1 Hour' },
          { value: 7200, label: '2 Hours' },
          { value: 14400, label: '4 Hours' },
          { value: 28800, label: '8 Hours' },
          { value: 43200, label: '12 Hours' },
          { value: 86400, label: '24 Hours' }
        ];
      } else {
        return [
          { value: 300, label: '5 Minutes' },
          { value: 600, label: '10 Minutes' },
          { value: 900, label: '15 Minutes' },
          { value: 1800, label: '30 Minutes' },
          { value: 3600, label: '1 Hour' }
        ];
      }
    }
    
    return optionsArray.map(option => {
      if (typeof option === 'object' && option !== null) {
        const value = option.value;
        let label = option.label;
        
        // If no label, create one
        if (!label) {
          const hours = value / 3600;
          const minutes = value / 60;
          
          if (hours >= 24) {
            const days = hours / 24;
            label = days === 1 ? '1 Day' : `${days} Days`;
          } else if (hours >= 1) {
            label = hours === 1 ? '1 Hour' : `${hours} Hours`;
          } else {
            label = minutes === 1 ? '1 Minute' : `${minutes} Minutes`;
          }
        }
        
        return { value, label };
      }
      
      const value = option;
      const hours = value / 3600;
      const minutes = value / 60;
      
      let label;
      if (hours >= 24) {
        const days = hours / 24;
        label = days === 1 ? '1 Day' : `${days} Days`;
      } else if (hours >= 1) {
        label = hours === 1 ? '1 Hour' : `${hours} Hours`;
      } else {
        label = minutes === 1 ? '1 Minute' : `${minutes} Minutes`;
      }
      
      return { value, label };
    });
  }, []);

  // Get unit options with proper labels
  const getUnitOptions = useCallback((units) => {
    if (!Array.isArray(units)) {
      return [{ value: 'Mbps', label: 'Mbps' }];
    }
    
    return units.map(unit => {
      if (typeof unit === 'string') {
        return { value: unit, label: unit };
      }
      return {
        value: unit?.value || 'Mbps',
        label: unit?.label || unit?.value || 'Mbps'
      };
    });
  }, []);

  // Safe unit renderer
  const renderUnitDropdown = useCallback((field, value, onChangeFunc, units) => {
    const safeValue = value || 'Mbps';
    const safeOptions = getUnitOptions(units);

    return (
      <EnhancedSelect
        value={safeValue}
        onChange={(newValue) => onNestedChange('hotspot', field, 'unit', newValue)}
        options={safeOptions}
        className="text-xs min-w-[5rem]"
        theme={theme}
      />
    );
  }, [theme, onNestedChange, getUnitOptions]);

  // Handle data limit preset with validation
  const handleDataLimitPreset = useCallback((presetKey) => {
    setDataLimitPreset(presetKey);
    if (presetKey !== 'custom') {
      const preset = dataLimitPresets.find(p => String(p.value) === presetKey);
      if (preset) {
        onNestedChange('hotspot', 'data_limit', 'value', preset.value);
        onNestedChange('hotspot', 'data_limit', 'unit', preset.unit);
      }
    } else {
      onNestedChange('hotspot', 'data_limit', 'value', '');
    }
  }, [dataLimitPresets, onNestedChange]);

  const handleUsageLimitPreset = useCallback((presetKey) => {
    setUsageLimitPreset(presetKey);
    if (presetKey !== 'custom') {
      const preset = usageLimitPresets.find(p => String(p.value) === presetKey);
      if (preset) {
        onNestedChange('hotspot', 'usage_limit', 'value', preset.value);
        onNestedChange('hotspot', 'usage_limit', 'unit', preset.unit);
      }
    } else {
      onNestedChange('hotspot', 'usage_limit', 'value', '');
    }
  }, [usageLimitPresets, onNestedChange]);

  const handleValidityPreset = useCallback((presetKey) => {
    setValidityPreset(presetKey);
    if (presetKey !== 'custom') {
      const preset = validityPeriodPresets.find(p => String(p.value) === presetKey);
      if (preset) {
        onNestedChange('hotspot', 'validity_period', 'value', preset.value);
        onNestedChange('hotspot', 'validity_period', 'unit', preset.unit);
      }
    } else {
      onNestedChange('hotspot', 'validity_period', 'value', '');
    }
  }, [validityPeriodPresets, onNestedChange]);

  const handleBandwidthPreset = useCallback((presetKey) => {
    setBandwidthPreset(presetKey);
    if (presetKey !== 'custom') {
      const presetValue = parseInt(presetKey, 10);
      const preset = bandwidthPresets.find(p => p.value === presetValue);
      if (preset) {
        onChange('hotspot', 'bandwidth_limit', preset.value);
      }
    }
  }, [bandwidthPresets, onChange]);

  // Format time for display
  const formatTimeDisplay = useCallback((seconds) => {
    if (!seconds || seconds === 0) return "No Limit";
    const hours = seconds / 3600;
    if (hours >= 24) {
      const days = hours / 24;
      return days === 1 ? "1 Day" : `${days} Days`;
    }
    return hours === 1 ? "1 Hour" : `${hours} Hours`;
  }, []);

  // Format bandwidth for display
  const formatBandwidthDisplay = useCallback((kbps) => {
    if (!kbps || kbps === 0) return "Unlimited";
    const numKbps = Number(kbps);
    if (numKbps >= 1000) {
      const mbps = numKbps / 1000;
      return `${mbps.toFixed(mbps % 1 === 0 ? 0 : 1)} Mbps`;
    }
    return `${numKbps} Kbps`;
  }, []);

  // Get display value for bandwidth input based on unit
  const getBandwidthDisplayValue = useCallback(() => {
    const bandwidth = Number(hotspot.bandwidth_limit) || 0;
    if (bandwidthUnit === 'Mbps') {
      return (bandwidth / 1000) || '';
    }
    return bandwidth || '';
  }, [hotspot.bandwidth_limit, bandwidthUnit]);

  // Handle bandwidth input change
  const handleBandwidthChange = useCallback((value) => {
    const numValue = parseFloat(value) || 0;
    if (bandwidthUnit === 'Mbps') {
      onChange('hotspot', 'bandwidth_limit', numValue * 1000);
    } else {
      onChange('hotspot', 'bandwidth_limit', numValue);
    }
  }, [bandwidthUnit, onChange]);

  // Handle input change with validation
  const handleInputChange = useCallback((field, subfield, value) => {
    onNestedChange('hotspot', field, subfield, value);
  }, [onNestedChange]);

  const handleToggle = useCallback(() => {
    onChange('hotspot', 'enabled', !hotspot.enabled);
  }, [onChange, hotspot.enabled]);

  // Plan summary
  const planSummary = useMemo(() => {
    const maxDevicesValue = Number.isNaN(hotspot.max_devices) || hotspot.max_devices === undefined 
      ? 0 
      : Number(hotspot.max_devices);
    
    const dataLimitValue = hotspot.data_limit?.value || '0';
    const dataLimitUnit = hotspot.data_limit?.unit || 'GB';
    const dataLimitDisplay = dataLimitValue === 'Unlimited' 
      ? 'Unlimited' 
      : `${dataLimitValue} ${dataLimitUnit}`;
    
    const usageLimitValue = hotspot.usage_limit?.value || '0';
    const usageLimitUnit = hotspot.usage_limit?.unit || 'Hours';
    const usageLimitDisplay = usageLimitValue === 'Unlimited' 
      ? 'Unlimited' 
      : `${usageLimitValue} ${usageLimitUnit}`;

    const validityValue = hotspot.validity_period?.value || '0';
    const validityUnit = hotspot.validity_period?.unit || 'Days';
    const validityDisplay = validityValue === '0' || validityValue === 0
      ? 'No Expiry'
      : `${validityValue} ${validityUnit}`;

    return {
      dataLimit: dataLimitDisplay,
      usageLimit: usageLimitDisplay,
      validity: validityDisplay,
      maxDevices: maxDevicesValue === 0 ? 'Unlimited' : `${maxDevicesValue} device${maxDevicesValue > 1 ? 's' : ''}`,
      sessionTimeout: formatTimeDisplay(hotspot.session_timeout),
      idleTimeout: hotspot.idle_timeout === 0 ? 'No Timeout' : `${(hotspot.idle_timeout / 60)} minutes`,
      bandwidth: formatBandwidthDisplay(hotspot.bandwidth_limit)
    };
  }, [hotspot, formatTimeDisplay, formatBandwidthDisplay]);

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

      {hotspot.enabled ? (
        <div className="space-y-6 lg:space-y-8">
          {/* Speed Configuration */}
          <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-blue-900/10' : 'bg-blue-50'}`}>
            <h4 className="text-md font-semibold mb-4 text-blue-700 dark:text-blue-300 flex items-center">
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
                    value={hotspot.download_speed?.value || ""} 
                    onChange={(e) => handleInputChange('download_speed', 'value', e.target.value)} 
                    className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                    min="0.01" 
                    step="0.01" 
                    placeholder="e.g., 10" 
                    required 
                  />
                  <div className="w-full sm:w-auto">
                    {renderUnitDropdown('download_speed', hotspot.download_speed?.unit, onNestedChange, speedUnits)}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Maximum download speed for users</p>
              </div>
              
              {/* Upload Speed */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                  Upload Speed <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="number" 
                    value={hotspot.upload_speed?.value || ""} 
                    onChange={(e) => handleInputChange('upload_speed', 'value', e.target.value)} 
                    className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                    min="0.01" 
                    step="0.01" 
                    placeholder="e.g., 2" 
                    required 
                  />
                  <div className="w-full sm:w-auto">
                    {renderUnitDropdown('upload_speed', hotspot.upload_speed?.unit, onNestedChange, speedUnits)}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Maximum upload speed for users</p>
              </div>
            </div>

            {/* Bandwidth Limit */}
            <div className="mt-6">
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                Total Bandwidth Limit
                <span className="text-xs text-gray-500 ml-2">Shared bandwidth for all connected devices</span>
              </label>
              
              <div className="mb-3">
                <EnhancedSelect
                  value={bandwidthPreset}
                  onChange={handleBandwidthPreset}
                  options={getSafeBandwidthPresets()}
                  theme={theme}
                  disabled={!hotspot.enabled}
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
                      disabled={!hotspot.enabled}
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
                      disabled={!hotspot.enabled}
                    />
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      ({formatBandwidthDisplay(hotspot.bandwidth_limit)})
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Enter bandwidth and select unit. Internally stored as Kbps.
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
                  {hotspot.bandwidth_limit === 0 && <InfinityIcon className="w-4 h-4 text-blue-600 dark:text-blue-300" />}
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Selected:</strong> {formatBandwidthDisplay(hotspot.bandwidth_limit)}
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
                  options={getSafeValidityPeriodPresets()}
                  theme={theme}
                  disabled={!hotspot.enabled}
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
                      value={hotspot.validity_period?.value || ""} 
                      onChange={(e) => handleInputChange('validity_period', 'value', e.target.value)} 
                      className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                      placeholder="Enter duration value" 
                      required 
                      disabled={!hotspot.enabled}
                    />
                    <div className="w-full sm:w-auto">
                      {renderUnitDropdown('validity_period', hotspot.validity_period?.unit, onNestedChange, ['Hours', 'Days', 'Weeks', 'Months'])}
                    </div>
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
                  options={getSafeDataLimitPresets()}
                  theme={theme}
                  disabled={!hotspot.enabled}
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
                      value={hotspot.data_limit?.value || ""} 
                      onChange={(e) => handleInputChange('data_limit', 'value', e.target.value)} 
                      className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                      placeholder="Enter data amount" 
                      required 
                      disabled={!hotspot.enabled}
                    />
                    <div className="w-full sm:w-auto">
                      {renderUnitDropdown('data_limit', hotspot.data_limit?.unit, onNestedChange, ['MB', 'GB', 'TB', 'Unlimited'])}
                    </div>
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
                Daily Time Limit <span className="text-red-500">*</span>
              </label>
              <div className="mb-2">
                <EnhancedSelect
                  value={usageLimitPreset}
                  onChange={handleUsageLimitPreset}
                  options={getSafeUsageLimitPresets()}
                  theme={theme}
                  disabled={!hotspot.enabled}
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
                      value={hotspot.usage_limit?.value || ""} 
                      onChange={(e) => handleInputChange('usage_limit', 'value', e.target.value)} 
                      className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                      placeholder="Enter hours per day" 
                      required 
                      disabled={!hotspot.enabled}
                    />
                    <div className="w-full sm:w-auto">
                      {renderUnitDropdown('usage_limit', hotspot.usage_limit?.unit, onNestedChange, ['Hours', 'Unlimited'])}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Set the custom daily usage limit in hours
                  </p>
                </motion.div>
              )}
              <p className="text-xs text-gray-500 mt-1">Maximum connection time allowed per day</p>
            </div>
          </div>

          {/* Security Features */}
          <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-green-900/10' : 'bg-green-50'}`}>
            <h4 className="text-md font-semibold mb-4 text-green-700 dark:text-green-300 flex items-center">
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
                  value={hotspot.max_devices ?? ""}
                  onChange={(value) => onChange('hotspot', 'max_devices', parseInt(value, 10) || 0)}
                  options={getSafeDeviceLimitOptions()}
                  placeholder="Select device limit"
                  theme={theme}
                  disabled={!hotspot.enabled}
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
                  value={hotspot.session_timeout}
                  onChange={(value) => onChange('hotspot', 'session_timeout', parseInt(value, 10))}
                  options={getSafeTimeoutOptions(sessionTimeoutOptions, 'session')}
                  theme={theme}
                  disabled={!hotspot.enabled}
                />
                <p className="text-xs text-gray-500 mt-1">Forces reconnection for security</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mt-4">
              {/* Idle Timeout */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                  Idle Timeout
                </label>
                <EnhancedSelect
                  value={hotspot.idle_timeout}
                  onChange={(value) => onChange('hotspot', 'idle_timeout', parseInt(value, 10))}
                  options={getSafeTimeoutOptions(idleTimeoutOptions, 'idle')}
                  theme={theme}
                  disabled={!hotspot.enabled}
                />
                <p className="text-xs text-gray-500 mt-1">Disconnects after inactivity</p>
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
                  onClick={() => hotspot.enabled && onChange('hotspot', 'mac_binding', !hotspot.mac_binding)} 
                  className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out flex-shrink-0 ${
                    !hotspot.enabled 
                      ? 'cursor-not-allowed opacity-50 bg-gray-400' 
                      : hotspot.mac_binding 
                        ? 'bg-green-600'
                        : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                    hotspot.mac_binding ? "translate-x-6" : "translate-x-1"
                  }`} />
                </div>
              </div>
            </div>
          </div>

          {/* Plan Summary */}
          <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-indigo-900/10' : 'bg-indigo-50'}`}>
            <h4 className="text-md font-semibold mb-4 text-indigo-700 dark:text-indigo-300 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Plan Summary
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
                <div className="text-sm font-semibold truncate">{hotspot.mac_binding ? 'Enabled' : 'Disabled'}</div>
                <div className="text-xs text-gray-500">Device Lock</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={`p-8 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <Wifi className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h4 className="text-lg font-medium mb-2 text-gray-600">Hotspot Disabled</h4>
          <p className="text-sm text-gray-500 mb-4">
            Enable Hotspot to configure wireless access settings for this plan.
          </p>
          <button
            onClick={handleToggle}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Enable Hotspot
          </button>
        </div>
      )}
    </div>
  );
};

HotspotConfiguration.propTypes = {
  form: PropTypes.object,
  errors: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onNestedChange: PropTypes.func.isRequired,
  theme: PropTypes.oneOf(['light', 'dark'])
};

// FIXED: Removed defaultProps, using default parameters in function definition

export default React.memo(HotspotConfiguration);


















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
//   bandwidthPresets
// } from "../Shared/constant";
// import { 
//   Users, Clock, Shield, Calendar, Wifi, Database, Zap, Gauge, 
//   Smartphone, Infinity as InfinityIcon, AlertCircle 
// } from "lucide-react";

// // Using default parameters instead of defaultProps
// const HotspotConfiguration = ({ 
//   form = {}, 
//   errors = {}, 
//   onChange, 
//   onNestedChange, 
//   theme = 'light' 
// }) => {
//   const themeClasses = getThemeClasses(theme);
  
//   // Safely extract hotspot configuration with fallbacks
//   const access_methods = form.access_methods || form.accessMethods || {};
//   const hotspot = access_methods.hotspot || {
//     enabled: false,
//     download_speed: { value: "", unit: "Mbps" },
//     upload_speed: { value: "", unit: "Mbps" },
//     data_limit: { value: "", unit: "GB" },
//     usage_limit: { value: "", unit: "Hours" },
//     bandwidth_limit: 0,
//     max_devices: "",
//     session_timeout: "",
//     idle_timeout: "",
//     validity_period: { value: "", unit: "Days" },
//     mac_binding: false
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

//   const toSafeNumber = useCallback((value) => {
//     if (value === "" || value === null || value === undefined) return 0;
//     const num = Number(value);
//     return isNaN(num) ? 0 : num;
//   }, []);

//   const isEmpty = useCallback((value) => {
//     return value === "" || value === null || value === undefined;
//   }, []);

//   // ==========================================================================
//   // SAFE OPTIONS WITH FALLBACKS
//   // ==========================================================================

//   const getSafeSpeedUnits = useCallback(() => {
//     if (!Array.isArray(speedUnits) || speedUnits.length === 0) {
//       return [{ value: 'Mbps', label: 'Mbps' }];
//     }
    
//     return speedUnits.map(unit => {
//       if (typeof unit === 'string') {
//         return { value: unit, label: unit };
//       }
//       return {
//         value: unit?.value || 'Mbps',
//         label: unit?.label || unit?.value || 'Mbps'
//       };
//     });
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

//   const getSafeDeviceLimitOptions = useCallback(() => {
//     if (!Array.isArray(deviceLimitOptions) || deviceLimitOptions.length === 0) {
//       return [
//         { value: 1, label: '1 Device' },
//         { value: 2, label: '2 Devices' },
//         { value: 3, label: '3 Devices' },
//         { value: 4, label: '4 Devices' },
//         { value: 5, label: '5 Devices' }
//       ];
//     }
    
//     return deviceLimitOptions.map(option => {
//       if (typeof option === 'object' && option !== null) {
//         const value = option.value;
//         const label = option.label || `${value} Device${value > 1 ? 's' : ''}`;
//         return { value, label };
//       }
//       const value = option;
//       return { 
//         value, 
//         label: `${value} Device${value > 1 ? 's' : ''}` 
//       };
//     });
//   }, []);

//   const getSafeTimeoutOptions = useCallback((optionsArray, type = 'session') => {
//     if (!Array.isArray(optionsArray) || optionsArray.length === 0) {
//       if (type === 'session') {
//         return [
//           { value: 3600, label: '1 Hour' },
//           { value: 7200, label: '2 Hours' },
//           { value: 14400, label: '4 Hours' },
//           { value: 28800, label: '8 Hours' },
//           { value: 43200, label: '12 Hours' },
//           { value: 86400, label: '24 Hours' }
//         ];
//       } else {
//         return [
//           { value: 300, label: '5 Minutes' },
//           { value: 600, label: '10 Minutes' },
//           { value: 900, label: '15 Minutes' },
//           { value: 1800, label: '30 Minutes' },
//           { value: 3600, label: '1 Hour' }
//         ];
//       }
//     }
    
//     return optionsArray.map(option => {
//       if (typeof option === 'object' && option !== null) {
//         const value = option.value;
//         let label = option.label;
        
//         if (!label) {
//           const hours = value / 3600;
//           const minutes = value / 60;
          
//           if (hours >= 24) {
//             const days = hours / 24;
//             label = days === 1 ? '1 Day' : `${days} Days`;
//           } else if (hours >= 1) {
//             label = hours === 1 ? '1 Hour' : `${hours} Hours`;
//           } else {
//             label = minutes === 1 ? '1 Minute' : `${minutes} Minutes`;
//           }
//         }
        
//         return { value, label };
//       }
      
//       const value = option;
//       const hours = value / 3600;
//       const minutes = value / 60;
      
//       let label;
//       if (hours >= 24) {
//         const days = hours / 24;
//         label = days === 1 ? '1 Day' : `${days} Days`;
//       } else if (hours >= 1) {
//         label = hours === 1 ? '1 Hour' : `${hours} Hours`;
//       } else {
//         label = minutes === 1 ? '1 Minute' : `${minutes} Minutes`;
//       }
      
//       return { value, label };
//     });
//   }, []);

//   const getUnitOptions = useCallback((units) => {
//     if (!Array.isArray(units)) {
//       return [{ value: 'Mbps', label: 'Mbps' }];
//     }
    
//     return units.map(unit => {
//       if (typeof unit === 'string') {
//         return { value: unit, label: unit };
//       }
//       return {
//         value: unit?.value || 'Mbps',
//         label: unit?.label || unit?.value || 'Mbps'
//       };
//     });
//   }, []);

//   // ==========================================================================
//   // RENDER HELPERS
//   // ==========================================================================

//   const renderUnitDropdown = useCallback((field, value, onChangeFunc, units) => {
//     const safeValue = value || 'Mbps';
//     const safeOptions = getUnitOptions(units);

//     return (
//       <EnhancedSelect
//         value={safeValue}
//         onChange={(newValue) => onNestedChange('hotspot', field, 'unit', newValue)}
//         options={safeOptions}
//         className="text-xs min-w-[5rem]"
//         theme={theme}
//       />
//     );
//   }, [theme, onNestedChange, getUnitOptions]);

//   // ==========================================================================
//   // PRESET HANDLERS
//   // ==========================================================================

//   const handleDataLimitPreset = useCallback((presetKey) => {
//     setDataLimitPreset(presetKey);
//     if (presetKey !== 'custom') {
//       const preset = dataLimitPresets?.find(p => String(p.value) === presetKey);
//       if (preset) {
//         onNestedChange('hotspot', 'data_limit', 'value', preset.value);
//         onNestedChange('hotspot', 'data_limit', 'unit', preset.unit);
//       }
//     } else {
//       onNestedChange('hotspot', 'data_limit', 'value', '');
//     }
//   }, [dataLimitPresets, onNestedChange]);

//   const handleUsageLimitPreset = useCallback((presetKey) => {
//     setUsageLimitPreset(presetKey);
//     if (presetKey !== 'custom') {
//       const preset = usageLimitPresets?.find(p => String(p.value) === presetKey);
//       if (preset) {
//         onNestedChange('hotspot', 'usage_limit', 'value', preset.value);
//         onNestedChange('hotspot', 'usage_limit', 'unit', preset.unit);
//       }
//     } else {
//       onNestedChange('hotspot', 'usage_limit', 'value', '');
//     }
//   }, [usageLimitPresets, onNestedChange]);

//   const handleValidityPreset = useCallback((presetKey) => {
//     setValidityPreset(presetKey);
//     if (presetKey !== 'custom') {
//       const preset = validityPeriodPresets?.find(p => String(p.value) === presetKey);
//       if (preset) {
//         onNestedChange('hotspot', 'validity_period', 'value', preset.value);
//         onNestedChange('hotspot', 'validity_period', 'unit', preset.unit);
//       }
//     } else {
//       onNestedChange('hotspot', 'validity_period', 'value', '');
//     }
//   }, [validityPeriodPresets, onNestedChange]);

//   const handleBandwidthPreset = useCallback((presetKey) => {
//     setBandwidthPreset(presetKey);
//     if (presetKey !== 'custom') {
//       const presetValue = parseInt(presetKey, 10);
//       const preset = bandwidthPresets?.find(p => p.value === presetValue);
//       if (preset) {
//         onChange('hotspot', 'bandwidth_limit', preset.value);
//       }
//     }
//   }, [bandwidthPresets, onChange]);

//   // ==========================================================================
//   // BANDWIDTH HANDLING
//   // ==========================================================================

//   const getBandwidthDisplayValue = useCallback(() => {
//     const bandwidth = toSafeNumber(hotspot.bandwidth_limit);
//     if (bandwidthUnit === 'Mbps') {
//       return (bandwidth / 1000) || '';
//     }
//     return bandwidth || '';
//   }, [hotspot.bandwidth_limit, bandwidthUnit, toSafeNumber]);

//   const handleBandwidthChange = useCallback((value) => {
//     const numValue = parseFloat(value) || 0;
//     if (bandwidthUnit === 'Mbps') {
//       onChange('hotspot', 'bandwidth_limit', numValue * 1000);
//     } else {
//       onChange('hotspot', 'bandwidth_limit', numValue);
//     }
//   }, [bandwidthUnit, onChange]);

//   // ==========================================================================
//   // EVENT HANDLERS
//   // ==========================================================================

//   const handleInputChange = useCallback((field, subfield, value) => {
//     onNestedChange('hotspot', field, subfield, value);
//   }, [onNestedChange]);

//   const handleToggle = useCallback(() => {
//     onChange('hotspot', 'enabled', !hotspot.enabled);
//   }, [onChange, hotspot.enabled]);

//   // ==========================================================================
//   // FORMATTING FUNCTIONS
//   // ==========================================================================

//   const formatTimeDisplay = useCallback((seconds) => {
//     const numSeconds = toSafeNumber(seconds);
//     if (numSeconds === 0) return "No Limit";
//     const hours = numSeconds / 3600;
//     if (hours >= 24) {
//       const days = hours / 24;
//       return days === 1 ? "1 Day" : `${days} Days`;
//     }
//     return hours === 1 ? "1 Hour" : `${hours} Hours`;
//   }, [toSafeNumber]);

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
//   // PLAN SUMMARY
//   // ==========================================================================

//   const planSummary = useMemo(() => {
//     const maxDevicesValue = toSafeNumber(hotspot.max_devices);
    
//     const dataLimitValue = hotspot.data_limit?.value || '0';
//     const dataLimitUnit = hotspot.data_limit?.unit || 'GB';
//     const dataLimitDisplay = dataLimitValue === 'Unlimited' 
//       ? 'Unlimited' 
//       : `${dataLimitValue} ${dataLimitUnit}`;
    
//     const usageLimitValue = hotspot.usage_limit?.value || '0';
//     const usageLimitUnit = hotspot.usage_limit?.unit || 'Hours';
//     const usageLimitDisplay = usageLimitValue === 'Unlimited' 
//       ? 'Unlimited' 
//       : `${usageLimitValue} ${usageLimitUnit}`;

//     const validityValue = hotspot.validity_period?.value || '0';
//     const validityUnit = hotspot.validity_period?.unit || 'Days';
//     const validityDisplay = validityValue === '0' || validityValue === 0
//       ? 'No Expiry'
//       : `${validityValue} ${validityUnit}`;

//     return {
//       dataLimit: dataLimitDisplay,
//       usageLimit: usageLimitDisplay,
//       validity: validityDisplay,
//       maxDevices: maxDevicesValue === 0 ? 'Unlimited' : `${maxDevicesValue} device${maxDevicesValue > 1 ? 's' : ''}`,
//       sessionTimeout: formatTimeDisplay(hotspot.session_timeout),
//       idleTimeout: hotspot.idle_timeout === 0 ? 'No Timeout' : `${(hotspot.idle_timeout / 60)} minutes`,
//       bandwidth: formatBandwidthDisplay(hotspot.bandwidth_limit)
//     };
//   }, [hotspot, formatTimeDisplay, formatBandwidthDisplay, toSafeNumber]);

//   // ==========================================================================
//   // RENDER
//   // ==========================================================================

//   return (
//     <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-lg lg:text-xl font-semibold flex items-center">
//           <Wifi className="w-5 h-5 mr-2 text-blue-600" />
//           Hotspot Configuration
//         </h3>
//         <div className="flex items-center">
//           <label className={`block text-sm font-medium mr-4 ${themeClasses.text.primary}`}>
//             Enable Hotspot
//           </label>
//           <div 
//             onClick={handleToggle}
//             className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
//               hotspot.enabled 
//                 ? 'bg-blue-600'
//                 : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//             }`}
//             role="switch"
//             aria-checked={hotspot.enabled}
//             tabIndex={0}
//             onKeyPress={(e) => e.key === 'Enter' && handleToggle()}
//           >
//             <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//               hotspot.enabled ? "translate-x-6" : "translate-x-1"
//             }`} />
//           </div>
//         </div>
//       </div>

//       {hotspot.enabled ? (
//         <div className="space-y-6 lg:space-y-8">
//           {/* Speed Configuration */}
//           <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-blue-900/10' : 'bg-blue-50'}`}>
//             <h4 className="text-md font-semibold mb-4 text-blue-700 dark:text-blue-300 flex items-center">
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
//                     value={hotspot.download_speed?.value || ""} 
//                     onChange={(e) => handleInputChange('download_speed', 'value', e.target.value)} 
//                     className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                     min="0.01" 
//                     step="0.01" 
//                     placeholder="e.g., 10" 
//                     required 
//                   />
//                   <div className="w-full sm:w-auto">
//                     {renderUnitDropdown('download_speed', hotspot.download_speed?.unit, onNestedChange, speedUnits)}
//                   </div>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">Maximum download speed for users</p>
//               </div>
              
//               {/* Upload Speed */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   Upload Speed <span className="text-red-500">*</span>
//                 </label>
//                 <div className="flex flex-col sm:flex-row gap-2">
//                   <input 
//                     type="number" 
//                     value={hotspot.upload_speed?.value || ""} 
//                     onChange={(e) => handleInputChange('upload_speed', 'value', e.target.value)} 
//                     className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                     min="0.01" 
//                     step="0.01" 
//                     placeholder="e.g., 2" 
//                     required 
//                   />
//                   <div className="w-full sm:w-auto">
//                     {renderUnitDropdown('upload_speed', hotspot.upload_speed?.unit, onNestedChange, speedUnits)}
//                   </div>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">Maximum upload speed for users</p>
//               </div>
//             </div>

//             {/* Bandwidth Limit */}
//             <div className="mt-6">
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 Total Bandwidth Limit
//                 <span className="text-xs text-gray-500 ml-2">Shared bandwidth for all connected devices</span>
//               </label>
              
//               <div className="mb-3">
//                 <EnhancedSelect
//                   value={bandwidthPreset}
//                   onChange={handleBandwidthPreset}
//                   options={getSafeBandwidthPresets()}
//                   theme={theme}
//                   disabled={!hotspot.enabled}
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
//                       disabled={!hotspot.enabled}
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
//                       disabled={!hotspot.enabled}
//                     />
//                     <span className="text-sm text-gray-500 whitespace-nowrap">
//                       ({formatBandwidthDisplay(hotspot.bandwidth_limit)})
//                     </span>
//                   </div>
//                   <p className="text-xs text-gray-500">
//                     Enter bandwidth and select unit. Internally stored as Kbps.
//                   </p>
//                 </motion.div>
//               )}
              
//               {bandwidthPreset !== 'custom' && (
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.95 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ duration: 0.2 }}
//                   className={`p-3 rounded-lg flex items-center gap-2 ${theme === 'dark' ? 'bg-blue-800/20' : 'bg-blue-100'}`}
//                 >
//                   {hotspot.bandwidth_limit === 0 && <InfinityIcon className="w-4 h-4 text-blue-600 dark:text-blue-300" />}
//                   <p className="text-sm text-blue-700 dark:text-blue-300">
//                     <strong>Selected:</strong> {formatBandwidthDisplay(hotspot.bandwidth_limit)}
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
//                   disabled={!hotspot.enabled}
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
//                       value={hotspot.validity_period?.value || ""} 
//                       onChange={(e) => handleInputChange('validity_period', 'value', e.target.value)} 
//                       className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                       placeholder="Enter duration value" 
//                       required 
//                       disabled={!hotspot.enabled}
//                     />
//                     <div className="w-full sm:w-auto">
//                       {renderUnitDropdown('validity_period', hotspot.validity_period?.unit, onNestedChange, ['Hours', 'Days', 'Weeks', 'Months'])}
//                     </div>
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
//                   disabled={!hotspot.enabled}
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
//                       value={hotspot.data_limit?.value || ""} 
//                       onChange={(e) => handleInputChange('data_limit', 'value', e.target.value)} 
//                       className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                       placeholder="Enter data amount" 
//                       required 
//                       disabled={!hotspot.enabled}
//                     />
//                     <div className="w-full sm:w-auto">
//                       {renderUnitDropdown('data_limit', hotspot.data_limit?.unit, onNestedChange, ['MB', 'GB', 'TB', 'Unlimited'])}
//                     </div>
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
//                 Daily Time Limit <span className="text-red-500">*</span>
//               </label>
//               <div className="mb-2">
//                 <EnhancedSelect
//                   value={usageLimitPreset}
//                   onChange={handleUsageLimitPreset}
//                   options={getSafeUsageLimitPresets()}
//                   theme={theme}
//                   disabled={!hotspot.enabled}
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
//                       value={hotspot.usage_limit?.value || ""} 
//                       onChange={(e) => handleInputChange('usage_limit', 'value', e.target.value)} 
//                       className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
//                       placeholder="Enter hours per day" 
//                       required 
//                       disabled={!hotspot.enabled}
//                     />
//                     <div className="w-full sm:w-auto">
//                       {renderUnitDropdown('usage_limit', hotspot.usage_limit?.unit, onNestedChange, ['Hours', 'Unlimited'])}
//                     </div>
//                   </div>
//                   <p className="text-xs text-gray-500">
//                     Set the custom daily usage limit in hours
//                   </p>
//                 </motion.div>
//               )}
//               <p className="text-xs text-gray-500 mt-1">Maximum connection time allowed per day</p>
//             </div>
//           </div>

//           {/* Security Features */}
//           <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-green-900/10' : 'bg-green-50'}`}>
//             <h4 className="text-md font-semibold mb-4 text-green-700 dark:text-green-300 flex items-center">
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
//                   value={hotspot.max_devices ?? ""}
//                   onChange={(value) => onChange('hotspot', 'max_devices', parseInt(value, 10) || 0)}
//                   options={getSafeDeviceLimitOptions()}
//                   placeholder="Select device limit"
//                   theme={theme}
//                   disabled={!hotspot.enabled}
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Limit simultaneous connections</p>
//               </div>

//               {/* Session Timeout */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   <Clock className="w-4 h-4 inline mr-1" />
//                   Session Timeout
//                 </label>
//                 <EnhancedSelect
//                   value={hotspot.session_timeout}
//                   onChange={(value) => onChange('hotspot', 'session_timeout', parseInt(value, 10))}
//                   options={getSafeTimeoutOptions(sessionTimeoutOptions, 'session')}
//                   theme={theme}
//                   disabled={!hotspot.enabled}
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Forces reconnection for security</p>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mt-4">
//               {/* Idle Timeout */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//                   Idle Timeout
//                 </label>
//                 <EnhancedSelect
//                   value={hotspot.idle_timeout}
//                   onChange={(value) => onChange('hotspot', 'idle_timeout', parseInt(value, 10))}
//                   options={getSafeTimeoutOptions(idleTimeoutOptions, 'idle')}
//                   theme={theme}
//                   disabled={!hotspot.enabled}
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Disconnects after inactivity</p>
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
//                   onClick={() => hotspot.enabled && onChange('hotspot', 'mac_binding', !hotspot.mac_binding)} 
//                   className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out flex-shrink-0 ${
//                     !hotspot.enabled 
//                       ? 'cursor-not-allowed opacity-50 bg-gray-400' 
//                       : hotspot.mac_binding 
//                         ? 'bg-green-600'
//                         : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//                   }`}
//                   role="switch"
//                   aria-checked={hotspot.mac_binding}
//                   tabIndex={0}
//                   onKeyPress={(e) => e.key === 'Enter' && hotspot.enabled && onChange('hotspot', 'mac_binding', !hotspot.mac_binding)}
//                 >
//                   <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//                     hotspot.mac_binding ? "translate-x-6" : "translate-x-1"
//                   }`} />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Plan Summary */}
//           <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-indigo-900/10' : 'bg-indigo-50'}`}>
//             <h4 className="text-md font-semibold mb-4 text-indigo-700 dark:text-indigo-300 flex items-center">
//               <Calendar className="w-4 h-4 mr-2" />
//               Plan Summary
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
//                 <div className="text-sm font-semibold truncate">{hotspot.mac_binding ? 'Enabled' : 'Disabled'}</div>
//                 <div className="text-xs text-gray-500">Device Lock</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div className={`p-8 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
//           <Wifi className="w-12 h-12 mx-auto mb-4 text-gray-400" />
//           <h4 className="text-lg font-medium mb-2 text-gray-600">Hotspot Disabled</h4>
//           <p className="text-sm text-gray-500 mb-4">
//             Enable Hotspot to configure wireless access settings for this plan.
//           </p>
//           <button
//             onClick={handleToggle}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Enable Hotspot
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// HotspotConfiguration.propTypes = {
//   form: PropTypes.object,
//   errors: PropTypes.object,
//   onChange: PropTypes.func.isRequired,
//   onNestedChange: PropTypes.func.isRequired,
//   theme: PropTypes.oneOf(['light', 'dark'])
// };



// export default React.memo(HotspotConfiguration);