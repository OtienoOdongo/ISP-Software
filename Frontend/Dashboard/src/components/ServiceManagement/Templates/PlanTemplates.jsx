







import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Plus, Search, Box, Check, X, RefreshCw, Clock, 
  AlertCircle, Filter, Grid, List, Edit, Trash2, Copy, Eye,
  Wifi, Cable, Server, DollarSign, Users, Star, Calendar,
  Download, Upload, Settings, Zap, Shield, Package, Globe,
  HelpCircle
} from "lucide-react";
import { getThemeClasses, ConfirmationModal } from "../Shared/components";
import { deepClone } from "../Shared/utils";
import { EnhancedSelect } from "../Shared/components";
import api from "../../../api";
import { useAuth } from "../../../context/AuthContext";

// Components
import TemplateTypeSelection from "./TemplateTypeSelection";
import TemplateCard from "./TemplateCard";
import TemplateForm from "./TemplateForm";
import TemplatePreview from "./TemplatePreview";

// ============================================================================
// CONSTANTS - TRY MULTIPLE FORMATS TO HANDLE BACKEND INCONSISTENCIES
// ============================================================================

// Try all possible formats the backend might accept
const CATEGORY_VARIANTS = {
  // Capitalized (from model)
  'Residential': ['Residential', 'residential', 'RESIDENTIAL'],
  'Business': ['Business', 'business', 'BUSINESS'],
  'Promotional': ['Promotional', 'promotional', 'PROMOTIONAL'],
  'Enterprise': ['Enterprise', 'enterprise', 'ENTERPRISE'],
  
  // Common variations
  'Resi': ['Resi', 'resi'],
  'Biz': ['Biz', 'biz'],
  'Promo': ['Promo', 'promo'],
  'Ent': ['Ent', 'ent']
};

// Default to try capitalized first, then fallback to lowercase
const DEFAULT_CATEGORY = "Residential";
const FALLBACK_CATEGORY = "residential";

// Access method types
const ACCESS_TYPES = [
  { value: "all", label: "All Types" },
  { value: "hotspot", label: "Hotspot Only" },
  { value: "pppoe", label: "PPPoE Only" },
  { value: "dual", label: "Both Enabled" }
];

// Visibility options
const VISIBILITY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "public", label: "Public" },
  { value: "private", label: "Private" }
];

// Time variant options
const TIME_VARIANT_OPTIONS = [
  { value: "all", label: "All" },
  { value: "has", label: "Has Time Variant" },
  { value: "none", label: "No Time Variant" }
];

// Sort options
const SORT_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "base_price", label: "Price" },
  { value: "usage_count", label: "Usage Count" },
  { value: "created_at", label: "Date Created" },
  { value: "updated_at", label: "Last Updated" }
];

// ============================================================================
// ERROR BOUNDARY COMPONENT
// ============================================================================

class TemplateErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Template component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">
              Something went wrong
            </h3>
          </div>
          <p className="text-red-600 dark:text-red-400 mb-4">
            {this.state.error?.message || 'An unexpected error occurred in the template component'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Enhanced category normalization that tries multiple formats
 */
const normalizeCategory = (category, attempt = 1) => {
  if (!category) return attempt === 1 ? DEFAULT_CATEGORY : FALLBACK_CATEGORY;
  
  // If it's an object from select
  if (typeof category === 'object') {
    category = category.value || category.label || '';
  }
  
  // Convert to string and clean
  const categoryStr = String(category).trim();
  
  // If empty, return default
  if (!categoryStr) return attempt === 1 ? DEFAULT_CATEGORY : FALLBACK_CATEGORY;
  
  // First attempt: try to match against known patterns
  const lowerStr = categoryStr.toLowerCase();
  
  if (lowerStr.includes('resid') || lowerStr === 'resi') {
    return attempt === 1 ? 'Residential' : 'residential';
  }
  if (lowerStr.includes('busi') || lowerStr === 'biz') {
    return attempt === 1 ? 'Business' : 'business';
  }
  if (lowerStr.includes('promo')) {
    return attempt === 1 ? 'Promotional' : 'promotional';
  }
  if (lowerStr.includes('enter') || lowerStr === 'ent') {
    return attempt === 1 ? 'Enterprise' : 'enterprise';
  }
  
  // Second attempt: check if it's already in correct format
  const validCapitalized = ['Residential', 'Business', 'Promotional', 'Enterprise'];
  const validLowercase = ['residential', 'business', 'promotional', 'enterprise'];
  
  if (attempt === 1) {
    if (validCapitalized.includes(categoryStr)) return categoryStr;
    if (validLowercase.includes(categoryStr)) {
      // Convert lowercase to capitalized
      const index = validLowercase.indexOf(categoryStr);
      return validCapitalized[index];
    }
  } else {
    if (validLowercase.includes(categoryStr)) return categoryStr;
    if (validCapitalized.includes(categoryStr)) {
      // Convert capitalized to lowercase
      const index = validCapitalized.indexOf(categoryStr);
      return validLowercase[index];
    }
  }
  
  // Final fallback
  return attempt === 1 ? DEFAULT_CATEGORY : FALLBACK_CATEGORY;
};

/**
 * Parse backend error messages to extract useful information
 */
const parseBackendError = (error) => {
  const result = {
    message: 'An unknown error occurred',
    fieldErrors: {},
    suggestion: ''
  };

  try {
    if (error.response?.data) {
      const data = error.response.data;
      
      // Handle string errors that contain Python dict representation
      if (typeof data.details === 'string' && data.details.includes('{')) {
        try {
          // Try to extract category error
          const match = data.details.match(/'category':\s*\[([^\]]+)\]/);
          if (match) {
            result.fieldErrors.category = match[1].replace(/[{}']/g, '').trim();
            result.message = 'Category validation failed';
            result.suggestion = 'Try using "Residential", "Business", "Promotional", or "Enterprise"';
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
      
      // Handle structured errors
      if (data.details?.category) {
        result.fieldErrors.category = Array.isArray(data.details.category) 
          ? data.details.category.join(', ') 
          : String(data.details.category);
        result.message = 'Category validation failed';
      }
      
      if (data.error) {
        result.message = data.error;
      }
      
      if (data.detail) {
        result.message = data.detail;
      }
    }
  } catch (e) {
    console.error('Error parsing backend error:', e);
  }

  return result;
};

/**
 * Normalize unit values to match backend expectations
 */
const normalizeUnit = (unit) => {
  if (!unit || typeof unit !== 'string') return '';
  
  const normalized = unit.toLowerCase().trim();
  
  const unitMap = {
    'gb': 'gb', 'gbs': 'gb', 'gigabyte': 'gb', 'gigabytes': 'gb',
    'mb': 'mb', 'mbs': 'mb', 'megabyte': 'mb', 'megabytes': 'mb',
    'tb': 'tb', 'tbs': 'tb', 'terabyte': 'tb', 'terabytes': 'tb',
    'unlimited': 'unlimited', 'unl': 'unlimited',
    'hours': 'hours', 'hour': 'hours', 'hrs': 'hours', 'hr': 'hours',
    'days': 'days', 'day': 'days',
    'weeks': 'weeks', 'week': 'weeks',
    'months': 'months', 'month': 'months',
    'mbps': 'mbps', 'mbp': 'mbps',
    'kbps': 'kbps', 'kbp': 'kbps',
    'gbps': 'gbps', 'gbp': 'gbps'
  };
  
  return unitMap[normalized] || normalized;
};

/**
 * Convert value to empty string if falsy
 */
const toEmptyString = (value) => {
  if (value === undefined || value === null || value === '') {
    return '';
  }
  return String(value);
};

/**
 * Normalize nested field object
 */
const normalizeField = (field) => {
  if (!field || typeof field !== 'object') {
    return { value: "", unit: "" };
  }
  
  return {
    value: field.value !== undefined && field.value !== null && field.value !== '' 
      ? String(field.value) 
      : "",
    unit: normalizeUnit(field.unit)
  };
};

/**
 * Get default unit for a field type
 */
const getDefaultUnit = (field) => {
  const units = {
    download_speed: 'mbps',
    upload_speed: 'mbps',
    data_limit: 'gb',
    usage_limit: 'hours',
    validity_period: 'days'
  };
  return units[field] || '';
};

/**
 * Get default access method configuration
 */
const getDefaultAccessMethod = (method, enabled = false) => {
  const baseConfig = {
    enabled,
    download_speed: { value: "10", unit: "mbps" },
    upload_speed: { value: "5", unit: "mbps" },
    data_limit: { value: "10", unit: "gb" },
    usage_limit: { value: "24", unit: "hours" },
    bandwidth_limit: "",
    max_devices: "",
    session_timeout: "",
    idle_timeout: "",
    validity_period: { value: "30", unit: "days" },
    mac_binding: false
  };
  
  if (method === 'pppoe') {
    return {
      ...baseConfig,
      ip_pool: "",
      service_name: "",
      mtu: ""
    };
  }
  
  return baseConfig;
};

/**
 * Get initial template form state
 */
const getInitialFormState = (templateType = 'hotspot') => {
  return {
    name: "",
    description: "",
    category: DEFAULT_CATEGORY,
    base_price: "",
    is_public: true,
    is_active: true,
    priority_level: 4,
    router_specific: false,
    allowed_routers_ids: [],
    fup_policy: "",
    fup_threshold: 80,
    access_methods: {
      hotspot: getDefaultAccessMethod('hotspot', templateType === 'hotspot' || templateType === 'dual'),
      pppoe: getDefaultAccessMethod('pppoe', templateType === 'pppoe' || templateType === 'dual')
    },
    time_variant: null,
    time_variant_id: null
  };
};

/**
 * Get initial time variant state
 */
const getInitialTimeVariantState = () => ({
  is_active: false,
  start_time: "",
  end_time: "",
  available_days: [],
  schedule_active: false,
  schedule_start_date: "",
  schedule_end_date: "",
  duration_active: false,
  duration_value: 0,
  duration_unit: "days",
  duration_start_date: "",
  exclusion_dates: [],
  timezone: "Africa/Nairobi",
  force_available: false
});

// ============================================================================
// NOTIFICATION COMPONENT
// ============================================================================

const ToastNotification = ({ visible, message, type, suggestion, onClose }) => {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.8 }}
      className={`fixed top-4 right-4 z-50 max-w-md w-full ${
        type === "success" 
          ? "bg-green-500 border-green-600" 
          : "bg-red-500 border-red-600"
      } text-white p-4 rounded-lg shadow-lg border`}
    >
      <div className="flex items-start">
        {type === "success" ? (
          <Check className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <p className="font-medium">{message}</p>
          {suggestion && (
            <p className="text-sm mt-1 text-white/90">{suggestion}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 transition-colors flex-shrink-0"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PlanTemplates = ({ 
  templates: initialTemplates = [], 
  onApplyTemplate, 
  onCreateFromTemplate,
  onTemplatesChange,
  onRefresh,
  onBack, 
  theme,
  isMobile = false,
  isLoading: externalLoading = false
}) => {
  const themeClasses = getThemeClasses(theme);
  const { isAuthenticated, user, token } = useAuth();

  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================

  // Templates state
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState("browse");

  // Form state
  const [templateType, setTemplateType] = useState("hotspot");
  const [templateForm, setTemplateForm] = useState(getInitialFormState());
  const [timeVariantConfig, setTimeVariantConfig] = useState(getInitialTimeVariantState());
  const [showTimeVariant, setShowTimeVariant] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Filtering state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterVisibility, setFilterVisibility] = useState("all");
  const [filterAccessType, setFilterAccessType] = useState("all");
  const [filterTimeVariant, setFilterTimeVariant] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewType, setViewType] = useState("grid");

  // UI state
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
    suggestion: ""
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    template: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState(false);

  // ========================================================================
  // EFFECTS
  // ========================================================================

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      setAuthError(true);
      showToast("Please log in to access templates", "error");
    } else {
      setAuthError(false);
    }
  }, [isAuthenticated]);

  // Sync with parent templates
  useEffect(() => {
    if (initialTemplates && initialTemplates.length > 0) {
      setTemplates(initialTemplates);
    }
  }, [initialTemplates]);

  // ========================================================================
  // HELPER FUNCTIONS
  // ========================================================================

  const showToast = useCallback((message, type = "success", suggestion = "") => {
    setToast({
      visible: true,
      message,
      type,
      suggestion
    });
    setTimeout(() => {
      setToast({ visible: false, message: "", type: "success", suggestion: "" });
    }, 5000);
  }, []);

  const hideToast = useCallback(() => {
    setToast({ visible: false, message: "", type: "success", suggestion: "" });
  }, []);

  const resetForm = useCallback(() => {
    setTemplateForm(getInitialFormState(templateType));
    setTimeVariantConfig(getInitialTimeVariantState());
    setShowTimeVariant(false);
    setFormErrors({});
    setSelectedTemplate(null);
  }, [templateType]);

  const resetTimeVariant = useCallback(() => {
    setTimeVariantConfig(getInitialTimeVariantState());
    setShowTimeVariant(false);
  }, []);

  // ========================================================================
  // API FUNCTIONS
  // ========================================================================

  const fetchTemplates = useCallback(async () => {
    if (!isAuthenticated) {
      showToast("Please log in to view templates", "error");
      return;
    }

    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      const response = await api.get("/api/internet_plans/templates/");
      
      let templatesData = [];
      if (response.data?.results) {
        templatesData = response.data.results;
      } else if (Array.isArray(response.data)) {
        templatesData = response.data;
      } else if (response.data?.data) {
        templatesData = response.data.data;
      }
      
      if (Array.isArray(templatesData)) {
        const normalizedTemplates = templatesData.map(template => ({
          ...template,
          access_methods: template.access_methods || {
            hotspot: { enabled: false },
            pppoe: { enabled: false }
          },
          has_time_variant: template.has_time_variant || !!template.time_variant
        }));
        
        setTemplates(normalizedTemplates);
        
        if (onTemplatesChange) {
          onTemplatesChange(normalizedTemplates);
        }
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      
      if (error.response?.status === 401) {
        setAuthError(true);
        showToast("Authentication failed. Please log in again.", "error");
      } else {
        showToast("Failed to load templates", "error");
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [isAuthenticated, isRefreshing, onTemplatesChange, showToast]);

  // ========================================================================
  // DATA TRANSFORMATIONS
  // ========================================================================

  /**
   * Transform form data to backend format with multiple category attempts
   */
  const transformFormToBackend = useCallback((categoryAttempt = 1) => {
    // Normalize category with specified attempt
    const category = normalizeCategory(templateForm.category, categoryAttempt);

    const data = {
      name: templateForm.name?.trim() || "",
      description: templateForm.description?.trim() || "",
      category: category,
      base_price: parseFloat(templateForm.base_price) || 0,
      is_public: templateForm.is_public === true,
      is_active: templateForm.is_active === true,
      priority_level: parseInt(templateForm.priority_level) || 4,
      router_specific: templateForm.router_specific === true,
      allowed_routers_ids: templateForm.allowed_routers_ids || [],
      fup_policy: templateForm.fup_policy || "",
      fup_threshold: parseInt(templateForm.fup_threshold) || 80,
      access_methods: {
        hotspot: {
          enabled: templateForm.access_methods.hotspot.enabled === true,
          download_speed: normalizeField(templateForm.access_methods.hotspot.download_speed),
          upload_speed: normalizeField(templateForm.access_methods.hotspot.upload_speed),
          data_limit: normalizeField(templateForm.access_methods.hotspot.data_limit),
          usage_limit: normalizeField(templateForm.access_methods.hotspot.usage_limit),
          bandwidth_limit: toEmptyString(templateForm.access_methods.hotspot.bandwidth_limit),
          max_devices: toEmptyString(templateForm.access_methods.hotspot.max_devices),
          session_timeout: toEmptyString(templateForm.access_methods.hotspot.session_timeout),
          idle_timeout: toEmptyString(templateForm.access_methods.hotspot.idle_timeout),
          validity_period: normalizeField(templateForm.access_methods.hotspot.validity_period),
          mac_binding: templateForm.access_methods.hotspot.mac_binding === true
        },
        pppoe: {
          enabled: templateForm.access_methods.pppoe.enabled === true,
          download_speed: normalizeField(templateForm.access_methods.pppoe.download_speed),
          upload_speed: normalizeField(templateForm.access_methods.pppoe.upload_speed),
          data_limit: normalizeField(templateForm.access_methods.pppoe.data_limit),
          usage_limit: normalizeField(templateForm.access_methods.pppoe.usage_limit),
          bandwidth_limit: toEmptyString(templateForm.access_methods.pppoe.bandwidth_limit),
          max_devices: toEmptyString(templateForm.access_methods.pppoe.max_devices),
          session_timeout: toEmptyString(templateForm.access_methods.pppoe.session_timeout),
          idle_timeout: toEmptyString(templateForm.access_methods.pppoe.idle_timeout),
          validity_period: normalizeField(templateForm.access_methods.pppoe.validity_period),
          mac_binding: templateForm.access_methods.pppoe.mac_binding === true,
          ip_pool: toEmptyString(templateForm.access_methods.pppoe.ip_pool),
          service_name: toEmptyString(templateForm.access_methods.pppoe.service_name),
          mtu: toEmptyString(templateForm.access_methods.pppoe.mtu)
        }
      }
    };

    // Add time variant if configured
    if (showTimeVariant && timeVariantConfig.is_active) {
      data.time_variant = {
        is_active: timeVariantConfig.is_active,
        start_time: timeVariantConfig.start_time || null,
        end_time: timeVariantConfig.end_time || null,
        available_days: timeVariantConfig.available_days || [],
        schedule_active: timeVariantConfig.schedule_active || false,
        schedule_start_date: timeVariantConfig.schedule_start_date || null,
        schedule_end_date: timeVariantConfig.schedule_end_date || null,
        duration_active: timeVariantConfig.duration_active || false,
        duration_value: timeVariantConfig.duration_value || 0,
        duration_unit: timeVariantConfig.duration_unit || "days",
        duration_start_date: timeVariantConfig.duration_start_date || null,
        exclusion_dates: timeVariantConfig.exclusion_dates || [],
        timezone: timeVariantConfig.timezone || "Africa/Nairobi",
        force_available: timeVariantConfig.force_available || false
      };
    }

    return data;
  }, [templateForm, showTimeVariant, timeVariantConfig]);

  /**
   * Validate form before submission
   */
  const validateForm = useCallback(() => {
    const errors = {};

    if (!templateForm.name?.trim()) {
      errors.name = "Template name is required";
    }

    if (!templateForm.category) {
      errors.category = "Category is required";
    } else {
      // Check if category is valid
      const category = String(templateForm.category).toLowerCase();
      const validCategories = ['residential', 'business', 'promotional', 'enterprise'];
      if (!validCategories.some(vc => category.includes(vc))) {
        errors.category = "Category must be Residential, Business, Promotional, or Enterprise";
      }
    }

    if (templateForm.base_price === "" || isNaN(parseFloat(templateForm.base_price))) {
      errors.base_price = "Valid base price is required";
    } else if (parseFloat(templateForm.base_price) < 0) {
      errors.base_price = "Base price cannot be negative";
    }

    const hasEnabledMethod = 
      templateForm.access_methods.hotspot.enabled || 
      templateForm.access_methods.pppoe.enabled;
    
    if (!hasEnabledMethod) {
      errors.access_methods = "At least one access method must be enabled";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [templateForm]);

  // ========================================================================
  // CRUD OPERATIONS
  // ========================================================================

  /**
   * Handle form submit with retry logic for category issues
   */
  const handleFormSubmit = useCallback(async () => {
    if (!isAuthenticated) {
      showToast("Please log in to save templates", "error");
      return;
    }

    if (!validateForm()) {
      showToast("Please fix validation errors", "error");
      return;
    }

    setIsSubmitting(true);
    
    // Try with different category formats
    let lastError = null;
    let attempt = 1;
    const maxAttempts = 2; // Try capitalized first, then lowercase

    while (attempt <= maxAttempts) {
      try {
        const templateData = transformFormToBackend(attempt);
        
        console.log(`📤 Attempt ${attempt} - Submitting template with category:`, templateData.category);

        let response;
        if (viewMode === "create") {
          response = await api.post("/api/internet_plans/templates/", templateData);
          
          const newTemplate = response.data?.template || response.data;
          if (newTemplate) {
            const normalizedTemplate = {
              ...newTemplate,
              access_methods: newTemplate.access_methods || templateData.access_methods,
              has_time_variant: newTemplate.has_time_variant || !!newTemplate.time_variant
            };
            
            setTemplates(prev => [normalizedTemplate, ...prev]);
            
            if (onTemplatesChange) {
              onTemplatesChange([normalizedTemplate, ...templates]);
            }
          }
          
          showToast(`Template "${templateData.name}" created successfully!`);
        } else if (viewMode === "edit" && selectedTemplate) {
          response = await api.put(
            `/api/internet_plans/templates/${selectedTemplate.id}/`, 
            templateData
          );
          
          const updatedTemplate = response.data?.template || response.data;
          if (updatedTemplate) {
            const normalizedTemplate = {
              ...updatedTemplate,
              access_methods: updatedTemplate.access_methods || templateData.access_methods,
              has_time_variant: updatedTemplate.has_time_variant || !!updatedTemplate.time_variant
            };
            
            setTemplates(prev => prev.map(t => 
              t.id === selectedTemplate.id ? normalizedTemplate : t
            ));
            
            if (onTemplatesChange) {
              onTemplatesChange(templates.map(t => 
                t.id === selectedTemplate.id ? normalizedTemplate : t
              ));
            }
          }
          
          showToast(`Template "${templateData.name}" updated successfully!`);
        }

        // Success - exit the retry loop
        setViewMode("browse");
        resetForm();
        
        if (onRefresh) {
          onRefresh();
        }
        
        return; // Exit function on success
        
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        lastError = error;
        
        // Check if this is a category error and we should retry
        const errorData = error.response?.data;
        const isCategoryError = 
          errorData?.details?.category || 
          (typeof errorData?.details === 'string' && errorData.details.includes('category'));
        
        if (isCategoryError && attempt < maxAttempts) {
          // Try next category format
          attempt++;
          continue;
        }
        
        // If it's the last attempt or not a category error, break
        break;
      }
    }

    // If we get here, all attempts failed
    console.error(`All ${maxAttempts} attempts failed:`, lastError);
    
    // Parse and show appropriate error
    if (lastError) {
      const parsedError = parseBackendError(lastError);
      
      if (parsedError.fieldErrors.category) {
        showToast(
          "Category validation failed",
          "error",
          parsedError.suggestion || 'Please select Residential, Business, Promotional, or Enterprise'
        );
      } else {
        showToast(parsedError.message, "error", parsedError.suggestion);
      }
    } else {
      showToast("Failed to save template", "error");
    }
    
    setIsSubmitting(false);
  }, [
    isAuthenticated, viewMode, selectedTemplate, templates, 
    validateForm, transformFormToBackend, resetForm, showToast, 
    onTemplatesChange, onRefresh
  ]);

  /**
   * Handle apply template
   */
  const handleApplyTemplate = useCallback(async (template) => {
    if (!isAuthenticated) {
      showToast("Please log in to apply templates", "error");
      return;
    }

    try {
      setIsLoading(true);
      
      if (onApplyTemplate) {
        onApplyTemplate(template);
      }
      
      showToast(`Template "${template.name}" applied successfully!`);
    } catch (error) {
      console.error("Error applying template:", error);
      showToast("Failed to apply template", "error");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, onApplyTemplate, showToast]);

  /**
   * Handle create plan from template
   */
  const handleCreateFromTemplate = useCallback(async (template, planName = null) => {
    if (!isAuthenticated) {
      showToast("Please log in to create plans", "error");
      throw new Error("Authentication required");
    }

    try {
      let finalPlanName = planName;
      
      if (!finalPlanName) {
        return new Promise((resolve, reject) => {
          reject(new Error("Plan name required"));
        });
      }

      setIsLoading(true);
      
      const response = await api.post(`/api/internet_plans/templates/${template.id}/create-plan/`, {
        plan_name: finalPlanName.trim()
      });

      if (onCreateFromTemplate) {
        await onCreateFromTemplate(response.data);
      }
      
      showToast(`Plan "${finalPlanName}" created successfully!`);
      
      return response.data;
    } catch (error) {
      console.error("Error creating plan from template:", error);
      
      if (error.response?.status === 401) {
        setAuthError(true);
        showToast("Authentication failed. Please log in again.", "error");
        throw new Error("Authentication failed");
      }
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.details?.[0] || 
                          error.response?.data?.detail || 
                          "Failed to create plan from template";
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, onCreateFromTemplate, showToast]);

  /**
   * Handle edit template
   */
  const handleEditTemplate = useCallback((template) => {
    if (!isAuthenticated) {
      showToast("Please log in to edit templates", "error");
      return;
    }

    const isHotspotEnabled = template.access_methods?.hotspot?.enabled;
    const isPPPoEEnabled = template.access_methods?.pppoe?.enabled;
    
    let type = 'hotspot';
    if (isHotspotEnabled && isPPPoEEnabled) {
      type = 'dual';
    } else if (isPPPoEEnabled) {
      type = 'pppoe';
    }
    
    setTemplateType(type);
    
    setTemplateForm({
      name: template.name || "",
      description: template.description || "",
      category: template.category || DEFAULT_CATEGORY,
      base_price: template.base_price?.toString() || "0",
      is_public: template.is_public === true,
      is_active: template.is_active === true,
      priority_level: template.priority_level || 4,
      router_specific: template.router_specific || false,
      allowed_routers_ids: template.allowed_routers_ids || [],
      fup_policy: template.fup_policy || "",
      fup_threshold: template.fup_threshold || 80,
      access_methods: deepClone(template.access_methods || getInitialFormState(type).access_methods),
      time_variant: template.time_variant || null,
      time_variant_id: template.time_variant?.id || null
    });

    if (template.time_variant) {
      setTimeVariantConfig(template.time_variant);
      setShowTimeVariant(true);
    } else {
      resetTimeVariant();
    }

    setSelectedTemplate(template);
    setViewMode("edit");
    setFormErrors({});
  }, [isAuthenticated, resetTimeVariant, showToast]);

  /**
   * Handle delete template
   */
  const handleDeleteTemplate = useCallback((template) => {
    if (!isAuthenticated) {
      showToast("Please log in to delete templates", "error");
      return;
    }
    
    setDeleteModal({
      isOpen: true,
      template
    });
  }, [isAuthenticated, showToast]);

  /**
   * Confirm delete template
   */
  const confirmDeleteTemplate = useCallback(async () => {
    if (!isAuthenticated) {
      showToast("Please log in to delete templates", "error");
      setDeleteModal({ isOpen: false, template: null });
      return;
    }

    const { template } = deleteModal;
    
    setIsLoading(true);
    try {
      await api.delete(`/api/internet_plans/templates/${template.id}/delete/`);
      
      setTemplates(prev => prev.filter(t => t.id !== template.id));
      
      if (onTemplatesChange) {
        onTemplatesChange(templates.filter(t => t.id !== template.id));
      }
      
      if (selectedTemplate?.id === template.id) {
        setSelectedTemplate(null);
      }
      
      showToast(`Template "${template.name}" deleted successfully!`);
      
      if (onRefresh) {
        onRefresh();
      }
      
    } catch (error) {
      console.error("Error deleting template:", error);
      
      if (error.response?.status === 401) {
        setAuthError(true);
        showToast("Authentication failed. Please log in again.", "error");
      } else {
        showToast("Failed to delete template", "error");
      }
    } finally {
      setIsLoading(false);
      setDeleteModal({ isOpen: false, template: null });
    }
  }, [isAuthenticated, deleteModal, selectedTemplate, templates, onTemplatesChange, onRefresh, showToast]);

  /**
   * Handle duplicate template
   */
  const handleDuplicateTemplate = useCallback(async (template) => {
    if (!isAuthenticated) {
      showToast("Please log in to duplicate templates", "error");
      return;
    }

    try {
      setIsLoading(true);
      
      const duplicateData = {
        ...template,
        name: `${template.name} (Copy)`,
        id: undefined,
        usage_count: 0,
        created_at: undefined,
        updated_at: undefined
      };
      
      if (duplicateData.time_variant) {
        duplicateData.time_variant = undefined;
        duplicateData.time_variant_id = undefined;
      }
      
      const response = await api.post("/api/internet_plans/templates/", duplicateData);
      
      const newTemplate = response.data?.template || response.data;
      if (newTemplate) {
        const normalizedTemplate = {
          ...newTemplate,
          access_methods: newTemplate.access_methods || template.access_methods,
          has_time_variant: newTemplate.has_time_variant || false
        };
        
        setTemplates(prev => [normalizedTemplate, ...prev]);
        
        if (onTemplatesChange) {
          onTemplatesChange([normalizedTemplate, ...templates]);
        }
      }
      
      showToast(`Template "${newTemplate.name}" created successfully!`);
      
    } catch (error) {
      console.error("Error duplicating template:", error);
      
      if (error.response?.status === 401) {
        setAuthError(true);
        showToast("Authentication failed. Please log in again.", "error");
      } else {
        showToast("Failed to duplicate template", "error");
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, templates, onTemplatesChange, showToast]);

  // ========================================================================
  // FILTERING AND SORTING
  // ========================================================================

  const filteredTemplates = useMemo(() => {
    return templates
      .filter(template => {
        const matchesSearch = searchTerm === "" || 
          template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = filterCategory === "all" || 
          template.category?.toLowerCase() === filterCategory.toLowerCase();
        
        const matchesVisibility = filterVisibility === "all" || 
          (filterVisibility === "public" && template.is_public === true) ||
          (filterVisibility === "private" && template.is_public === false);
        
        const hotspotEnabled = template.access_methods?.hotspot?.enabled === true;
        const pppoeEnabled = template.access_methods?.pppoe?.enabled === true;
        
        const matchesAccessType = filterAccessType === "all" ||
          (filterAccessType === "hotspot" && hotspotEnabled && !pppoeEnabled) ||
          (filterAccessType === "pppoe" && pppoeEnabled && !hotspotEnabled) ||
          (filterAccessType === "dual" && hotspotEnabled && pppoeEnabled);
        
        const hasTimeVariant = template.has_time_variant === true || template.time_variant;
        const matchesTimeVariant = filterTimeVariant === "all" ||
          (filterTimeVariant === "has" && hasTimeVariant) ||
          (filterTimeVariant === "none" && !hasTimeVariant);
        
        return matchesSearch && matchesCategory && matchesVisibility && 
               matchesAccessType && matchesTimeVariant;
      })
      .sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];
        
        if (sortBy === 'base_price') {
          aValue = parseFloat(a.base_price) || 0;
          bValue = parseFloat(b.base_price) || 0;
        } else if (sortBy === 'usage_count') {
          aValue = parseInt(a.usage_count) || 0;
          bValue = parseInt(b.usage_count) || 0;
        } else if (sortBy === 'created_at' || sortBy === 'updated_at') {
          aValue = new Date(a[sortBy] || 0).getTime();
          bValue = new Date(b[sortBy] || 0).getTime();
        } else if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = (bValue || '').toLowerCase();
        }
        
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [templates, searchTerm, filterCategory, filterVisibility, filterAccessType, filterTimeVariant, sortBy, sortOrder]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setFilterCategory("all");
    setFilterVisibility("all");
    setFilterAccessType("all");
    setFilterTimeVariant("all");
  }, []);

  const templateStats = useMemo(() => ({
    total: templates.length,
    hotspot: templates.filter(t => t.access_methods?.hotspot?.enabled).length,
    pppoe: templates.filter(t => t.access_methods?.pppoe?.enabled).length,
    dual: templates.filter(t => t.access_methods?.hotspot?.enabled && t.access_methods?.pppoe?.enabled).length,
    public: templates.filter(t => t.is_public).length,
    private: templates.filter(t => !t.is_public).length,
    timeVariant: templates.filter(t => t.has_time_variant || t.time_variant).length
  }), [templates]);

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================

  if (authError) {
    return (
      <div className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${themeClasses.bg.primary}`}>
        <main className="max-w-7xl mx-auto">
          <div className={`p-8 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light} text-center`}>
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className={`mb-6 ${themeClasses.text.secondary}`}>
              Please log in to access plan templates.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className={`px-6 py-3 rounded-lg font-medium ${themeClasses.button.primary}`}
            >
              Go to Login
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <TemplateErrorBoundary>
      <div className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${themeClasses.bg.primary}`}>
        <main className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
          
          <ToastNotification 
            visible={toast.visible}
            message={toast.message}
            type={toast.type}
            suggestion={toast.suggestion}
            onClose={hideToast}
          />

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 truncate">
                  Plan Templates
                </h1>
                <p className={`mt-1 lg:mt-2 text-sm lg:text-lg ${themeClasses.text.secondary}`}>
                  {viewMode === "browse" ? "Quick start with pre-configured plan templates" : 
                   viewMode === "create" ? "Create a new template" : 
                   viewMode === "type-select" ? "Select template type" : "Edit template"}
                </p>
              </div>
            </div>
            
            {viewMode === "browse" && (
              <div className="flex items-center space-x-3 flex-wrap gap-2">
                <motion.button
                  onClick={fetchTemplates}
                  disabled={isRefreshing}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Refresh Templates"
                >
                  <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </motion.button>
                
                <motion.button
                  onClick={() => {
                    resetForm();
                    setViewMode("type-select");
                  }}
                  className={`px-4 py-2 rounded-lg flex items-center ${themeClasses.button.success} flex-shrink-0`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">New Template</span>
                </motion.button>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {viewMode === "browse" && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className={`p-4 rounded-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
                      <div className="text-2xl font-bold">{templateStats.total}</div>
                      <div className={`text-sm ${themeClasses.text.secondary}`}>Total Templates</div>
                    </div>
                    <div className={`p-4 rounded-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
                      <div className="text-2xl font-bold text-blue-600">{templateStats.hotspot}</div>
                      <div className={`text-sm ${themeClasses.text.secondary}`}>Hotspot</div>
                    </div>
                    <div className={`p-4 rounded-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
                      <div className="text-2xl font-bold text-green-600">{templateStats.pppoe}</div>
                      <div className={`text-sm ${themeClasses.text.secondary}`}>PPPoE</div>
                    </div>
                    <div className={`p-4 rounded-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
                      <div className="text-2xl font-bold text-purple-600">{templateStats.dual}</div>
                      <div className={`text-sm ${themeClasses.text.secondary}`}>Dual Access</div>
                    </div>
                    <div className={`p-4 rounded-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
                      <div className="text-2xl font-bold text-indigo-600">{templateStats.public}</div>
                      <div className={`text-sm ${themeClasses.text.secondary}`}>Public</div>
                    </div>
                    <div className={`p-4 rounded-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
                      <div className="text-2xl font-bold text-orange-600">{templateStats.timeVariant}</div>
                      <div className={`text-sm ${themeClasses.text.secondary}`}>Time Restricted</div>
                    </div>
                  </div>

                  <div className={`p-4 lg:p-6 rounded-xl shadow-lg ${themeClasses.bg.card}`}>
                    <div className="flex flex-col lg:flex-row gap-4 items-end">
                      <div className="flex-1 min-w-0">
                        <div className="relative">
                          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.text.tertiary}`} />
                          <input
                            type="text"
                            placeholder="Search templates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                          />
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                        <div className="flex-1 min-w-[140px] lg:w-40">
                          <EnhancedSelect
                            value={filterCategory}
                            onChange={setFilterCategory}
                            options={[
                              { value: "all", label: "All Categories" },
                              { value: "Residential", label: "Residential" },
                              { value: "Business", label: "Business" },
                              { value: "Promotional", label: "Promotional" },
                              { value: "Enterprise", label: "Enterprise" }
                            ]}
                            theme={theme}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-[120px] lg:w-32">
                          <EnhancedSelect
                            value={filterVisibility}
                            onChange={setFilterVisibility}
                            options={VISIBILITY_OPTIONS}
                            theme={theme}
                          />
                        </div>

                        <div className="flex-1 min-w-[140px] lg:w-36">
                          <EnhancedSelect
                            value={filterAccessType}
                            onChange={setFilterAccessType}
                            options={ACCESS_TYPES}
                            theme={theme}
                          />
                        </div>

                        <div className="flex-1 min-w-[140px] lg:w-36">
                          <EnhancedSelect
                            value={filterTimeVariant}
                            onChange={setFilterTimeVariant}
                            options={TIME_VARIANT_OPTIONS}
                            theme={theme}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center gap-4">
                        <p className={`text-sm ${themeClasses.text.secondary}`}>
                          Showing {filteredTemplates.length} of {templates.length} templates
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewType("grid")}
                            className={`p-2 rounded-lg transition-colors ${
                              viewType === "grid" 
                                ? "bg-indigo-600 text-white" 
                                : themeClasses.text.secondary
                            }`}
                            title="Grid view"
                          >
                            <Grid className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setViewType("list")}
                            className={`p-2 rounded-lg transition-colors ${
                              viewType === "list" 
                                ? "bg-indigo-600 text-white" 
                                : themeClasses.text.secondary
                            }`}
                            title="List view"
                          >
                            <List className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${themeClasses.text.secondary}`}>Sort by:</span>
                          <EnhancedSelect
                            value={sortBy}
                            onChange={setSortBy}
                            options={SORT_OPTIONS}
                            theme={theme}
                            className="w-32"
                          />
                          <button
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className={`p-2 rounded-lg ${themeClasses.button.secondary}`}
                          >
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </button>
                        </div>
                        
                        {(searchTerm || filterCategory !== "all" || filterVisibility !== "all" || 
                          filterAccessType !== "all" || filterTimeVariant !== "all") && (
                          <button
                            onClick={clearFilters}
                            className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 whitespace-nowrap"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {filteredTemplates.length === 0 ? (
                    <div className={`rounded-xl shadow-lg p-8 sm:p-12 text-center ${themeClasses.bg.card}`}>
                      <HelpCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg sm:text-xl font-semibold mb-2">
                        {templates.length === 0 ? "No Templates Available" : "No Templates Found"}
                      </h3>
                      <p className={`mb-4 sm:mb-6 text-sm sm:text-base ${themeClasses.text.secondary}`}>
                        {templates.length === 0 
                          ? "Create your first template to get started!" 
                          : "Try adjusting your search or filters"}
                      </p>
                      <button
                        onClick={() => {
                          resetForm();
                          setViewMode("type-select");
                        }}
                        className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg ${themeClasses.button.primary} text-sm sm:text-base`}
                      >
                        <Plus className="w-4 h-4 mr-2 inline" />
                        Create First Template
                      </button>
                    </div>
                  ) : (
                    <div className={
                      viewType === "grid" 
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
                        : "space-y-4"
                    }>
                      {filteredTemplates.map((template) => (
                        <TemplateCard 
                          key={String(template.id)}
                          template={template}
                          viewType={viewType}
                          onSelect={setSelectedTemplate}
                          onApplyTemplate={handleApplyTemplate}
                          onCreateFromTemplate={handleCreateFromTemplate}
                          onEditTemplate={handleEditTemplate}
                          onDeleteTemplate={handleDeleteTemplate}
                          onDuplicateTemplate={handleDuplicateTemplate}
                          theme={theme}
                          isAuthenticated={isAuthenticated}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {viewMode === "type-select" && (
                <TemplateTypeSelection
                  templateType={templateType}
                  onTemplateTypeSelect={setTemplateType}
                  onContinue={() => setViewMode("create")}
                  onCancel={() => setViewMode("browse")}
                  theme={theme}
                />
              )}

              {(viewMode === "create" || viewMode === "edit") && (
                <TemplateForm
                  templateForm={templateForm}
                  templateType={templateType}
                  viewMode={viewMode}
                  isLoading={isSubmitting}
                  errors={formErrors}
                  showTimeVariant={showTimeVariant}
                  timeVariantConfig={timeVariantConfig}
                  onFormChange={(field, value) => {
                    setTemplateForm(prev => ({ ...prev, [field]: value }));
                    if (formErrors[field]) {
                      setFormErrors(prev => ({ ...prev, [field]: undefined }));
                    }
                  }}
                  onAccessMethodChange={(method, field, value) => {
                    setTemplateForm(prev => ({
                      ...prev,
                      access_methods: {
                        ...prev.access_methods,
                        [method]: {
                          ...prev.access_methods[method],
                          [field]: value
                        }
                      }
                    }));
                  }}
                  onAccessMethodNestedChange={(method, parent, key, value) => {
                    setTemplateForm(prev => ({
                      ...prev,
                      access_methods: {
                        ...prev.access_methods,
                        [method]: {
                          ...prev.access_methods[method],
                          [parent]: {
                            ...prev.access_methods[method][parent],
                            [key]: value
                          }
                        }
                      }
                    }));
                  }}
                  onTimeVariantChange={(field, value) => {
                    setTimeVariantConfig(prev => ({ ...prev, [field]: value }));
                  }}
                  onTimeVariantToggle={() => setShowTimeVariant(!showTimeVariant)}
                  onCancel={() => {
                    setViewMode("browse");
                    resetForm();
                  }}
                  onSubmit={handleFormSubmit}
                  theme={theme}
                  isMobile={isMobile}
                />
              )}

              {selectedTemplate && viewMode === "browse" && (
                <TemplatePreview
                  template={selectedTemplate}
                  onClose={() => setSelectedTemplate(null)}
                  onApplyTemplate={handleApplyTemplate}
                  onCreateFromTemplate={handleCreateFromTemplate}
                  onEditTemplate={() => handleEditTemplate(selectedTemplate)}
                  onDeleteTemplate={() => handleDeleteTemplate(selectedTemplate)}
                  theme={theme}
                />
              )}
            </motion.div>
          </AnimatePresence>

          <ConfirmationModal
            isOpen={deleteModal.isOpen}
            onClose={() => setDeleteModal({ isOpen: false, template: null })}
            onConfirm={confirmDeleteTemplate}
            title="Delete Template"
            message={`Are you sure you want to delete template "${deleteModal.template?.name}"? This action cannot be undone.`}
            confirmText="Delete Template"
            cancelText="Cancel"
            type="danger"
            theme={theme}
            isLoading={isLoading}
          />
        </main>
      </div>
    </TemplateErrorBoundary>
  );
};

export default PlanTemplates;





