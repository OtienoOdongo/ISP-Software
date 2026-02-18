





// ============================================================================
// PlanBasicDetails.js - COMPLETELY REWRITTEN
// ============================================================================

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { EnhancedSelect, getThemeClasses } from "../Shared/components";
import { planTypes, categories, priorityOptions } from "../Shared/constant";
import { 
  Wifi, Cable, Info, HelpCircle, X, Check, Lock, AlertCircle,
  AlertTriangle, CheckCircle, XCircle, DollarSign, Tag, FileText,
  Calendar, Users, Star, Activity
} from "lucide-react";

// ============================================================================
// CONSTANTS - Match backend exactly
// ============================================================================
const PLAN_TYPES = [
  { value: "paid", label: "Paid" },
  { value: "free_trial", label: "Free Trial" },
  { value: "promotional", label: "Promotional" }
];

const CATEGORIES = [
  { value: "residential", label: "Residential" },
  { value: "business", label: "Business" },
  { value: "promotional", label: "Promotional" },
  { value: "enterprise", label: "Enterprise" }
];

const ACCESS_TYPES = [
  { value: "hotspot", label: "Hotspot", icon: Wifi },
  { value: "pppoe", label: "PPPoE", icon: Cable },
  { value: "both", label: "Dual Access", icon: () => (
    <div className="flex">
      <Wifi className="w-3 h-3 mr-1" />
      <Cable className="w-3 h-3" />
    </div>
  )}
];

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

const validateBasicDetails = (form) => {
  const errors = {};
  
  // Plan name validation
  if (!form.name?.trim()) {
    errors.name = 'Plan name is required';
  } else if (form.name.length > 100) {
    errors.name = 'Plan name must be less than 100 characters';
  }
  
  // Plan type validation
  if (!form.plan_type) {
    errors.plan_type = 'Plan type is required';
  }
  
  // Category validation
  if (!form.category && form.plan_type !== 'free_trial') {
    errors.category = 'Category is required';
  }
  
  // Price validation
  if (form.plan_type === 'paid') {
    if (!form.price || parseFloat(form.price) < 0) {
      errors.price = 'Valid price is required for paid plans';
    }
  } else if (form.plan_type === 'free_trial') {
    if (parseFloat(form.price || 0) !== 0) {
      errors.price = 'Free trial plans must have price 0';
    }
  }
  
  // Access type validation
  if (!form.access_method) {
    errors.access_method = 'Access type is required';
  }
  
  // Priority validation
  const priority = parseInt(form.priority_level);
  if (isNaN(priority) || priority < 1 || priority > 8) {
    errors.priority_level = 'Priority level must be between 1 and 8';
  }
  
  // Free trial specific validation
  if (form.plan_type === 'free_trial') {
    if (form.router_specific) {
      errors.router_specific = 'Free trial plans cannot be router-specific';
    }
    if (priority > 4) {
      errors.priority_level = 'Free trial plans cannot have priority > 4';
    }
  }
  
  return errors;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PlanBasicDetails = ({ 
  form, 
  errors: externalErrors, 
  touched, 
  onChange, 
  onAccessTypeChange, 
  onBlur, 
  theme,
  onValidationChange
}) => {
  const themeClasses = getThemeClasses(theme);
  const [localErrors, setLocalErrors] = useState({});
  const [localTouched, setLocalTouched] = useState({});

  // Combine errors
  const errors = { ...localErrors, ...externalErrors };

  // ==========================================================================
  // FIELD HANDLERS
  // ==========================================================================

  const handleFieldChange = useCallback((field, value) => {
    onChange(field, value);
    
    // Clear error for this field
    setLocalErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, [onChange]);

  const handleBlur = useCallback((field) => {
    setLocalTouched(prev => ({ ...prev, [field]: true }));
    if (onBlur) onBlur(field);
  }, [onBlur]);

  // ==========================================================================
  // ACCESS TYPE HANDLER
  // ==========================================================================

  const handleAccessType = useCallback((value) => {
    handleFieldChange('access_method', value);
    if (onAccessTypeChange) {
      onAccessTypeChange(value);
    }
  }, [handleFieldChange, onAccessTypeChange]);

  // ==========================================================================
  // PRICE HANDLING
  // ==========================================================================

  const handlePriceChange = useCallback((value) => {
    // Remove non-numeric characters except decimal point
    const sanitized = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = sanitized.split('.');
    const formatted = parts[0] + (parts.length > 1 ? '.' + parts[1].slice(0, 2) : '');
    
    handleFieldChange('price', formatted);
  }, [handleFieldChange]);

  // ==========================================================================
  // PLAN TYPE EFFECTS - Auto-set fields based on plan type
  // ==========================================================================

  useEffect(() => {
    if (form.plan_type === 'free_trial') {
      // Auto-set price to 0 for free trial
      if (form.price !== '0' && form.price !== '0.00') {
        handleFieldChange('price', '0.00');
      }
      
      // Auto-set category to promotional for free trial
      if (form.category !== 'promotional') {
        handleFieldChange('category', 'promotional');
      }
      
      // Auto-set access method to hotspot for free trial
      if (form.access_method && form.access_method !== 'hotspot') {
        handleFieldChange('access_method', 'hotspot');
        if (onAccessTypeChange) onAccessTypeChange('hotspot');
      }
      
      // Auto-set priority to 4 or less
      const priority = parseInt(form.priority_level);
      if (priority > 4) {
        handleFieldChange('priority_level', '4');
      }
      
      // Disable router-specific
      if (form.router_specific) {
        handleFieldChange('router_specific', false);
      }
    } else if (form.plan_type === 'promotional') {
      // Auto-set category to promotional for promotional plans
      if (form.category !== 'promotional') {
        handleFieldChange('category', 'promotional');
      }
    }
  }, [form.plan_type, form.price, form.category, form.access_method, form.priority_level, form.router_specific, handleFieldChange, onAccessTypeChange]);

  // ==========================================================================
  // VALIDATION ON CHANGE
  // ==========================================================================

  useEffect(() => {
    const validationErrors = validateBasicDetails(form);
    setLocalErrors(validationErrors);
    
    if (onValidationChange) {
      onValidationChange(Object.keys(validationErrors).length === 0);
    }
  }, [form, onValidationChange]);

  // ==========================================================================
  // HELPER FUNCTIONS
  // ==========================================================================

  const shouldShowError = useCallback((fieldName) => {
    return errors[fieldName] && (touched[fieldName] || localTouched[fieldName]);
  }, [errors, touched, localTouched]);

  const getPriorityDescription = useCallback((level) => {
    const descriptions = {
      1: "Lowest - Background tasks",
      2: "Low - Basic browsing",
      3: "Medium - Standard usage",
      4: "High - Streaming",
      5: "Highest - Gaming",
      6: "Critical - VoIP",
      7: "Premium - VIP",
      8: "VIP - Reserved"
    };
    return descriptions[level] || "Standard priority";
  }, []);

  // ==========================================================================
  // OPTIONS WITH EMPTY PLACEHOLDERS
  // ==========================================================================

  const planTypeOptions = useMemo(() => [
    { value: "", label: "Select plan type", disabled: true },
    ...PLAN_TYPES
  ], []);

  const categoryOptions = useMemo(() => [
    { value: "", label: "Select category", disabled: true },
    ...CATEGORIES
  ], []);

  const priorityOptionsWithEmpty = useMemo(() => [
    { value: "", label: "Select priority level", disabled: true },
    ...priorityOptions.map(opt => ({
      value: opt.value,
      label: `${opt.label} (${opt.value})`,
      description: opt.description,
      disabled: form.plan_type === "free_trial" && opt.value > 4
    }))
  ], [form.plan_type]);

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <h3 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6 flex items-center">
        <Info className="w-5 h-5 mr-2 text-indigo-600" />
        Basic Details
        <span className="ml-2 text-xs text-gray-500">(Fields with * are required)</span>
      </h3>
      
      <div className="space-y-6 lg:space-y-8">
        {/* Access Type Selection */}
        <div>
          <div className="flex items-center mb-3">
            <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
              Access Type <span className="text-red-500">*</span>
            </label>
            <div className="ml-2 group relative">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50">
                <p className="font-medium mb-1">Select how users will connect:</p>
                <ul className="space-y-1 text-gray-300">
                  <li>• <span className="text-white">Hotspot</span>: Wireless Wi-Fi connection</li>
                  <li>• <span className="text-white">PPPoE</span>: Wired username/password</li>
                  <li>• <span className="text-white">Dual</span>: Both methods available</li>
                </ul>
                {form.plan_type === 'free_trial' && (
                  <p className="mt-2 text-yellow-300 font-medium">
                    Free trial plans are limited to Hotspot only
                  </p>
                )}
              </div>
            </div>
            {!form.access_method && (
              <span className="ml-2 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 px-2 py-1 rounded-full flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                Required
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {ACCESS_TYPES.map((option) => {
              const IconComponent = option.icon;
              const isSelected = form.access_method === option.value;
              const isDisabled = form.plan_type === 'free_trial' && option.value !== 'hotspot';
              
              return (
                <motion.button
                  key={option.value}
                  type="button"
                  disabled={isDisabled}
                  whileHover={!isDisabled ? { scale: 1.02 } : {}}
                  whileTap={!isDisabled ? { scale: 0.98 } : {}}
                  onClick={() => !isDisabled && handleAccessType(option.value)}
                  onBlur={() => handleBlur('access_method')}
                  className={`p-4 border-2 rounded-lg transition-all duration-200 relative text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'
                  } ${
                    isSelected
                      ? option.value === 'hotspot'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800'
                        : option.value === 'pppoe'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-200 dark:ring-green-800'
                        : 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-2 ring-purple-200 dark:ring-purple-800'
                      : `${themeClasses.border.light} ${themeClasses.bg.card} hover:bg-gray-50 dark:hover:bg-gray-700/50`
                  }`}
                >
                  {isDisabled && (
                    <div className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                      Restricted
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      isSelected
                        ? option.value === 'hotspot'
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300'
                          : option.value === 'pppoe'
                          ? 'bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-300'
                          : 'bg-purple-100 text-purple-600 dark:bg-purple-800 dark:text-purple-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${
                        isSelected ? themeClasses.text.primary : themeClasses.text.secondary
                      }`}>
                        {option.label}
                      </h4>
                    </div>
                    {isSelected && (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        option.value === 'hotspot'
                          ? 'bg-blue-500 text-white'
                          : option.value === 'pppoe'
                          ? 'bg-green-500 text-white'
                          : 'bg-purple-500 text-white'
                      }`}>
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
          
          {shouldShowError('access_method') && (
            <p className="text-red-500 text-xs mt-2 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.access_method}
            </p>
          )}
        </div>

        {/* Plan Type and Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
              Plan Type <span className="text-red-500">*</span>
            </label>
            <EnhancedSelect
              value={form.plan_type || ""}
              onChange={(value) => handleFieldChange('plan_type', value)}
              onBlur={() => handleBlur('plan_type')}
              options={planTypeOptions}
              placeholder="Select Plan Type"
              theme={theme}
              isSearchable={true}
            />
            {form.plan_type === 'free_trial' && (
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
                  <Info className="w-3 h-3 mr-1" />
                  Free Trial: Price = 0, Category = Promotional, Access = Hotspot only
                </p>
              </div>
            )}
            {shouldShowError('plan_type') && (
              <p className="text-red-500 text-xs mt-1">{errors.plan_type}</p>
            )}
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
              Plan Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input 
                type="text"
                name="name"
                value={form.name || ""}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${
                  shouldShowError('name') 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : themeClasses.input
                }`}
                placeholder="e.g., Business Broadband Pro"
                maxLength={100}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                {form.name?.length || 0}/100
              </div>
            </div>
            {shouldShowError('name') ? (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Use a descriptive name customers will recognize
              </p>
            )}
          </div>
        </div>
        
        {/* Category and Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <EnhancedSelect
                value={form.category || ""}
                onChange={(value) => handleFieldChange('category', value)}
                onBlur={() => handleBlur('category')}
                options={categoryOptions}
                placeholder="Select category"
                theme={theme}
                isSearchable={true}
                disabled={form.plan_type === 'free_trial'}
              />
              {form.plan_type === 'free_trial' && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-10 pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
            {form.plan_type === 'free_trial' && (
              <p className="text-xs text-blue-500 mt-1 flex items-center">
                <Lock className="w-3 h-3 mr-1" />
                Automatically set to "Promotional" for free trials
              </p>
            )}
            {shouldShowError('category') && form.plan_type !== 'free_trial' && (
              <p className="text-red-500 text-xs mt-1">{errors.category}</p>
            )}
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
              Price (KES) {form.plan_type === "paid" && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                KES
              </div>
              <input
                type="text"
                name="price"
                value={form.price || ""}
                onChange={(e) => handlePriceChange(e.target.value)}
                onBlur={() => handleBlur('price')}
                disabled={form.plan_type === "free_trial"}
                className={`w-full pl-12 pr-3 py-2 rounded-lg shadow-sm text-sm ${
                  form.plan_type === "free_trial" 
                    ? "bg-gray-100 cursor-not-allowed border-gray-300 text-gray-500 dark:bg-gray-800 dark:border-gray-700" 
                    : shouldShowError('price')
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : themeClasses.input
                }`}
                placeholder={form.plan_type === "free_trial" ? "0.00" : "Enter price"}
              />
            </div>
            {form.plan_type === "free_trial" ? (
              <p className="text-xs text-blue-500 mt-1 flex items-center">
                <Lock className="w-3 h-3 mr-1" />
                Free Trial: Price automatically set to 0
              </p>
            ) : shouldShowError('price') ? (
              <p className="text-red-500 text-xs mt-1">{errors.price}</p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Enter price in Kenyan Shillings (KES)
              </p>
            )}
          </div>
        </div>
        
        {/* Priority */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
            Priority Level <span className="text-red-500">*</span>
          </label>
          <EnhancedSelect
            value={form.priority_level || ""}
            onChange={(value) => handleFieldChange('priority_level', value)}
            onBlur={() => handleBlur('priority_level')}
            options={priorityOptionsWithEmpty}
            placeholder="Select Priority Level"
            theme={theme}
            isSearchable={true}
          />
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm">
              <span className="font-medium">Level {form.priority_level || 4}:</span>{' '}
              {getPriorityDescription(form.priority_level || 4)}
            </p>
          </div>
          {shouldShowError('priority_level') && (
            <p className="text-red-500 text-xs mt-1">{errors.priority_level}</p>
          )}
        </div>
        
        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
              Description
            </label>
            <span className={`text-xs ${form.description?.length > 500 ? 'text-red-500' : 'text-gray-500'}`}>
              {form.description?.length || 0}/500
            </span>
          </div>
          <textarea 
            name="description" 
            value={form.description || ""} 
            onChange={(e) => handleFieldChange('description', e.target.value)}
            onBlur={() => handleBlur('description')}
            rows={3}
            className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${
              form.description?.length > 500 ? 'border-red-500 focus:border-red-500' : themeClasses.input
            }`}
            placeholder="Describe the plan features and benefits..."
            maxLength={500}
          />
          {form.description?.length > 500 ? (
            <p className="text-red-500 text-xs mt-1">
              Description is too long (max 500 characters)
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-2">
              Be descriptive to help customers understand your plan
            </p>
          )}
        </div>
        
        {/* Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center">
              <label className={`block text-sm font-medium mr-4 ${themeClasses.text.primary}`}>
                Active Status
              </label>
              <button
                type="button"
                onClick={() => handleFieldChange('active', !form.active)}
                className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  form.active 
                    ? 'bg-green-600'
                    : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={form.active}
              >
                <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                  form.active ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            </div>
            <div className="text-sm text-gray-500">
              {form.active ? 'Plan is active and visible' : 'Plan is inactive and hidden'}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center">
              <label className={`block text-sm font-medium mr-4 ${themeClasses.text.primary}`}>
                Router Specific
              </label>
              <button
                type="button"
                onClick={() => !form.plan_type === 'free_trial' && 
                  handleFieldChange('router_specific', !form.router_specific)}
                disabled={form.plan_type === 'free_trial'}
                className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  form.plan_type === 'free_trial'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : form.router_specific 
                      ? 'bg-blue-600'
                      : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={form.router_specific}
              >
                <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                  form.router_specific ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            </div>
            <div className="text-sm text-gray-500">
              {form.router_specific ? 'Limited to specific routers' : 'Available on all routers'}
            </div>
          </div>
        </div>

        {/* Validation Summary */}
        {Object.keys(errors).length > 0 && (
          <div className={`p-4 rounded-lg border border-red-300 ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`}>
            <h4 className="text-md font-semibold mb-2 text-red-700 dark:text-red-300 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Please fix the following errors:
            </h4>
            <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    <strong className="capitalize">{field.replace(/_/g, ' ')}:</strong> {error}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanBasicDetails;