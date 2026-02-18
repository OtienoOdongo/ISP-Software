



import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Copy, Eye, ChevronDown, ChevronUp, X, Save,
  Users, Download, Upload, BarChart3, Wifi, Cable, Server, Check,
  ArrowLeft, Settings, Zap, Clock, Shield, DollarSign, Package,
  TrendingUp, PieChart, Box, Calendar, Filter, Search, Star,
  Tag, Percent, Layers, Activity, Award, Target, FileText,
  Globe, Smartphone, Gauge, Database, Network, RefreshCw,
  Bell, AlertCircle, Timer, CalendarDays,
  CalendarClock, AlertTriangle,
  CreditCard, TrendingDown, BadgePercent, ArrowRight,
  CalendarOff, Sun, Moon, CheckCircle, XCircle,
  EyeOff, Radio, Router,
  HardDrive, Cpu, ShieldCheck, Cloud, Lock, Unlock,
  Battery, BatteryCharging, WifiOff, Infinity as InfinityIcon
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// Context and API
import { useTheme } from "../../context/ThemeContext";
import api, { AuthError } from "../../api";
import { useAuth } from "../../context/AuthContext";


// Shared components and utilities
import {
  getThemeClasses,
  ConfirmationModal,
  MobileSuccessAlert,
  LoadingOverlay,
  AvailabilityBadge,
  PlanTypeBadge,
} from "../../components/ServiceManagement/Shared/components";

import {
  deepClone,
  isPlanAvailableNow,
  calculateRating,
  calculatePopularity,
  calculatePlanPerformance,
} from "../../components/ServiceManagement/Shared/utils";

import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatSpeed,
  formatDataLimit,
  formatDeviceCount,
  formatDaysOfWeek,
  formatPlanType,
  formatAccessType,
  formatTimezone,
  formatTimeRange
} from "../../components/ServiceManagement/Shared/formatters";

// Components
import PlanList from "../../components/ServiceManagement/PlanManagement/PlanList";
import PlanBasicDetails from "../../components/ServiceManagement/PlanManagement/PlanBasicDetails";
import HotspotConfiguration from "../../components/ServiceManagement/PlanManagement/HotspotConfiguration";
import PPPoEConfiguration from "../../components/ServiceManagement/PlanManagement/PPPoEConfiguration";
import PlanAdvancedSettings from "../../components/ServiceManagement/PlanManagement/PlanAdvancedSettings";
import PlanAnalytics from "../../components/ServiceManagement/PlanManagement/PlanAnalytics";
import PlanTemplates from "../../components/ServiceManagement/Templates/PlanTemplates";
import AnalyticsTypeSelectionModal from "../../components/ServiceManagement/PlanManagement/AnalyticsTypeSelectionModal";
import TimeVariantConfig from "../../components/ServiceManagement/PlanManagement/TimeVariantConfig";
import PricingConfiguration from "../../components/ServiceManagement/PlanManagement/PricingConfiguration";

// Hooks
import usePlanForm, { getInitialFormState } from "../../components/ServiceManagement/PlanManagement/hooks/usePlanForm";
import useTimeVariant, { getInitialTimeVariantState } from "../../components/ServiceManagement/PlanManagement/hooks/useTimeVariant";
import usePricing, { getInitialPricingState } from "../../components/ServiceManagement/PlanManagement/hooks/usePricing";

// Custom hook for responsive design
import useMediaQuery from "../../components/ServiceManagement/PlanManagement/hooks/useMediaQuery";

// ============================================================================
// CONSTANTS FOR BACKEND VALUE MAPPING
// ============================================================================

// Map frontend values to backend expected values
const BACKEND_VALUE_MAPPINGS = {
  plan_type: {
    'paid': 'Paid',
    'free_trial': 'Free_trial',
    'promotional': 'Promotional'
  },
  category: {
    'residential': 'Residential',
    'business': 'Business',
    'promotional': 'Promotional',
    'enterprise': 'Enterprise'
  },
  // Reverse mapping for normalization
  FROM_BACKEND: {
    plan_type: {
      'Paid': 'paid',
      'Free_trial': 'free_trial',
      'Promotional': 'promotional'
    },
    category: {
      'Residential': 'residential',
      'Business': 'business',
      'Promotional': 'promotional',
      'Enterprise': 'enterprise'
    }
  }
};

// ============================================================================
// ERROR CLASSES
// ============================================================================

class ApiError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', details = null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

class ValidationError extends Error {
  constructor(message, fieldErrors = {}) {
    super(message);
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
    this.timestamp = new Date().toISOString();
  }
}

// ============================================================================
// ERROR BOUNDARY
// ============================================================================

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
      errorInfo: error instanceof ApiError ? {
        code: error.code,
        details: error.details,
        timestamp: error.timestamp
      } : null
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component error caught:', {
      error,
      errorInfo,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href
    });
  }

  render() {
    if (this.state.hasError) {
      const { theme } = this.context || { theme: 'light' };
      const themeClasses = getThemeClasses(theme);

      return (
        <div className={`p-6 rounded-lg ${themeClasses.bg.danger} ${themeClasses.border.danger} border`}>
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
            <h3 className={`text-lg font-semibold ${themeClasses.text.danger}`}>
              Something went wrong
            </h3>
          </div>
          <p className={`mb-3 ${themeClasses.text.danger}`}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          {this.state.errorInfo && (
            <div className={`text-sm mb-3 ${themeClasses.text.danger}`}>
              <p>Error Code: {this.state.errorInfo.code}</p>
              {this.state.errorInfo.timestamp && (
                <p>Time: {new Date(this.state.errorInfo.timestamp).toLocaleTimeString()}</p>
              )}
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className={`px-4 py-2 rounded-lg ${themeClasses.button.danger} transition-colors`}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.contextType = React.createContext();

// ============================================================================
// API SERVICE - SIMPLIFIED LIKE OPTION 1
// ============================================================================

class PlanApiService {
  // ========================================================================
  // PLAN ENDPOINTS - SIMPLIFIED LIKE OPTION 1
  // ========================================================================

  /**
   * Get all plans - List all internet plans (GET) - AUTH REQUIRED
   * Endpoint: /api/internet_plans/plans/
   */
  static async getPlans(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/api/internet_plans/plans/${queryString ? `?${queryString}` : ''}`;
      console.log('📡 Fetching plans from:', endpoint);
      const response = await api.get(endpoint);

      console.log('📥 Raw API response:', response.data);

      // Handle response structure exactly like Option 1
      if (response.data.success === true && Array.isArray(response.data.plans)) {
        return response.data.plans;
      } else if (response.data.results) {
        return response.data.results;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      console.warn('Unexpected response format:', response.data);
      return [];
    } catch (error) {
      console.error('❌ Error fetching plans:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Get single plan by ID - Get specific plan (GET) - AUTH REQUIRED
   * Endpoint: /api/internet_plans/plans/<uuid:plan_id>/
   */
  static async getPlan(id) {
    try {
      const response = await api.get(`/api/internet_plans/plans/${id}/`);
      if (response.data.success === true && response.data.plan) {
        return response.data.plan;
      }
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching plan ${id}:`, error);
      throw this._handleError(error);
    }
  }

  /**
   * Create a new plan - Create new plan (POST) - AUTH REQUIRED
   * Endpoint: /api/internet_plans/plans/
   */
  static async createPlan(planData) {
    try {
      console.log('📤 Creating plan with data:', planData);
      const response = await api.post('/api/internet_plans/plans/', planData);
      console.log('📥 Create plan response:', response.data);

      if (response.data.success === true && response.data.plan) {
        return response.data.plan;
      }

      return response.data;
    } catch (error) {
      console.error('❌ Error creating plan:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Update an existing plan - Update specific plan (PUT) - AUTH REQUIRED
   * Endpoint: /api/internet_plans/plans/<uuid:plan_id>/
   */
  static async updatePlan(id, planData) {
    try {
      const response = await api.put(`/api/internet_plans/plans/${id}/`, planData);

      if (response.data.success === true && response.data.plan) {
        return response.data.plan;
      }

      return response.data;
    } catch (error) {
      console.error(`❌ Error updating plan ${id}:`, error);
      throw this._handleError(error);
    }
  }

  /**
   * Delete a plan - Delete specific plan (DELETE) - AUTH REQUIRED
   * Endpoint: /api/internet_plans/plans/<uuid:plan_id>/
   */
  static async deletePlan(id) {
    try {
      const response = await api.delete(`/api/internet_plans/plans/${id}/`);
      return response.data || { success: true };
    } catch (error) {
      console.error(`❌ Error deleting plan ${id}:`, error);
      throw this._handleError(error);
    }
  }

  /**
   * Get public plans - Public endpoint (NO AUTH REQUIRED)
   * Endpoint: /api/internet_plans/plans/public/
   */
  static async getPublicPlans(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/api/internet_plans/plans/public/${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching public plans:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Get plan statistics - AUTH REQUIRED
   * Endpoint: /api/internet_plans/plans/statistics/
   */
  static async getPlanStatistics() {
    try {
      const response = await api.get('/api/internet_plans/plans/statistics/');
      if (response.data.success === true && response.data.statistics) {
        return response.data.statistics;
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching plan statistics:', error);
      throw this._handleError(error);
    }
  }

  // ========================================================================
  // TIME VARIANT ENDPOINTS
  // ========================================================================

  static async getTimeVariants(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/api/internet_plans/time-variant/${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(endpoint);

      if (response.data.results) {
        return response.data.results;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching time variants:', error);
      throw this._handleError(error);
    }
  }

  static async getTimeVariant(id) {
    try {
      const response = await api.get(`/api/internet_plans/time-variant/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching time variant ${id}:`, error);
      throw this._handleError(error);
    }
  }

  static async createTimeVariant(timeVariantData) {
    try {
      const response = await api.post('/api/internet_plans/time-variant/', timeVariantData);
      return response.data;
    } catch (error) {
      console.error('Error creating time variant:', error);
      throw this._handleError(error);
    }
  }

  static async updateTimeVariant(id, timeVariantData) {
    try {
      const response = await api.put(`/api/internet_plans/time-variant/${id}/`, timeVariantData);
      return response.data;
    } catch (error) {
      console.error(`Error updating time variant ${id}:`, error);
      throw this._handleError(error);
    }
  }

  static async deleteTimeVariant(id) {
    try {
      const response = await api.delete(`/api/internet_plans/time-variant/${id}/`);
      return response.data || { success: true };
    } catch (error) {
      console.error(`Error deleting time variant ${id}:`, error);
      throw this._handleError(error);
    }
  }

  // ========================================================================
  // TEMPLATE ENDPOINTS
  // ========================================================================

  static async getTemplates(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/api/internet_plans/templates/${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(endpoint);

      if (response.data.results) {
        return response.data.results;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw this._handleError(error);
    }
  }

  static async getTemplate(id) {
    try {
      const response = await api.get(`/api/internet_plans/templates/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching template ${id}:`, error);
      throw this._handleError(error);
    }
  }

  static async createTemplate(templateData) {
    try {
      const response = await api.post('/api/internet_plans/templates/', templateData);
      return response.data;
    } catch (error) {
      console.error('Error creating template:', error);
      throw this._handleError(error);
    }
  }

  static async createPlanFromTemplate(templateId, planData) {
    try {
      const response = await api.post(`/api/internet_plans/templates/${templateId}/create-plan/`, planData);
      return response.data;
    } catch (error) {
      console.error(`Error creating plan from template ${templateId}:`, error);
      throw this._handleError(error);
    }
  }

  // ========================================================================
  // PRICING ENDPOINTS
  // ========================================================================

  static async getPriceMatrices(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/api/internet_plans/pricing/matrices/${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(endpoint);

      if (response.data.results) {
        return response.data.results;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching price matrices:', error);
      throw this._handleError(error);
    }
  }

  static async getDiscountRules(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/api/internet_plans/pricing/rules/${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(endpoint);

      if (response.data.results) {
        return response.data.results;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching discount rules:', error);
      throw this._handleError(error);
    }
  }

  static async calculatePrice(planId, quantity = 1, discountCode = null, clientData = {}) {
    try {
      const response = await api.post('/api/internet_plans/pricing/calculate/', {
        plan_id: planId,
        quantity,
        discount_code: discountCode,
        client_data: clientData
      });
      return response.data;
    } catch (error) {
      console.error('Error calculating price:', error);
      throw this._handleError(error);
    }
  }

  // ========================================================================
  // ROUTER ENDPOINTS
  // ========================================================================

  static async getRouters(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/api/network_management/routers/${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(endpoint);

      if (response.data.results) {
        return response.data.results;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching routers:', error);
      return [];
    }
  }

  // ========================================================================
  // ERROR HANDLER
  // ========================================================================

  static _handleError(error) {
    if (error instanceof AuthError) {
      return new ApiError(
        'Authentication required. Please log in.',
        'UNAUTHORIZED',
        { originalError: error }
      );
    }

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        return new ApiError(
          'Authentication required. Please log in.',
          'UNAUTHORIZED',
          data
        );
      }

      if (status === 403) {
        return new ApiError(
          'You do not have permission to perform this action.',
          'FORBIDDEN',
          data
        );
      }

      if (status === 404) {
        return new ApiError(
          'Resource not found.',
          'NOT_FOUND',
          data
        );
      }

      if (status === 422 || status === 400) {
        return new ApiError(
          data.detail || data.message || 'Validation error occurred',
          'VALIDATION_ERROR',
          data
        );
      }

      return new ApiError(
        data.detail || data.message || `HTTP ${status}: ${error.response.statusText}`,
        `HTTP_${status}`,
        data
      );
    }

    if (error.request) {
      return new ApiError(
        'Network error. Please check your connection.',
        'NETWORK_ERROR',
        { originalError: error.message }
      );
    }

    return new ApiError(
      error.message || 'An unexpected error occurred',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

// ============================================================================
// PLAN NORMALIZATION UTILITIES - FIXED ACCESS TYPE ISSUE
// ============================================================================

/**
 * Get access methods from plan, ensuring proper boolean values
 */
const getAccessMethodsFromPlan = (plan) => {
  const accessMethods = plan.access_methods || {};
  
  // Ensure both methods exist with proper structure
  const hotspot = accessMethods.hotspot || { enabled: false };
  const pppoe = accessMethods.pppoe || { enabled: false };
  
  // Ensure enabled is boolean
  return {
    hotspot: {
      ...hotspot,
      enabled: hotspot.enabled === true
    },
    pppoe: {
      ...pppoe,
      enabled: pppoe.enabled === true
    }
  };
};

/**
 * Get access type from access methods
 */
const getAccessTypeFromMethods = (accessMethods) => {
  const hotspotEnabled = accessMethods?.hotspot?.enabled === true;
  const pppoeEnabled = accessMethods?.pppoe?.enabled === true;
  
  if (hotspotEnabled && pppoeEnabled) return 'both';
  if (hotspotEnabled) return 'hotspot';
  if (pppoeEnabled) return 'pppoe';
  return 'none';
};

/**
 * Get enabled access methods array
 */
const getEnabledAccessMethodsFromPlan = (plan) => {
  const accessMethods = getAccessMethodsFromPlan(plan);
  const enabled = [];
  if (accessMethods.hotspot.enabled) enabled.push('hotspot');
  if (accessMethods.pppoe.enabled) enabled.push('pppoe');
  return enabled;
};

/**
 * Normalize a plan from backend format to frontend format
 * FIXED: Now correctly handles access methods and prevents "none" issue
 */
const normalizeBackendPlan = (backendPlan) => {
  try {
    if (!backendPlan || typeof backendPlan !== 'object') {
      console.error('Invalid plan data:', backendPlan);
      return null;
    }

    console.log('🔄 Normalizing plan:', backendPlan.id, backendPlan.name);

    // Get access methods with proper structure
    const accessMethods = getAccessMethodsFromPlan(backendPlan);
    const enabledAccessMethods = getEnabledAccessMethodsFromPlan(backendPlan);
    const accessType = getAccessTypeFromMethods(accessMethods);

    // Map backend values to frontend format
    const planType = BACKEND_VALUE_MAPPINGS.FROM_BACKEND.plan_type[backendPlan.plan_type] || 'paid';
    const category = BACKEND_VALUE_MAPPINGS.FROM_BACKEND.category[backendPlan.category] || 'residential';

    const normalized = {
      // Core fields
      id: backendPlan.id,
      name: backendPlan.name || '',
      description: backendPlan.description || '',
      category: category,
      original_category: backendPlan.category,
      plan_type: planType,
      original_plan_type: backendPlan.plan_type,
      price: parseFloat(backendPlan.price) || 0,
      active: backendPlan.active !== false,

      // Tracking fields
      purchases: parseInt(backendPlan.purchases) || 0,
      priority_level: parseInt(backendPlan.priority_level) || 4,

      // Router specific settings
      router_specific: Boolean(backendPlan.router_specific),
      allowed_routers_ids: Array.isArray(backendPlan.allowed_routers)
        ? backendPlan.allowed_routers.map(r => r.id)
        : [],
      allowed_routers: backendPlan.allowed_routers || [],

      // FUP settings
      fup_policy: backendPlan.fup_policy || '',
      fup_threshold: parseInt(backendPlan.fup_threshold) || 80,

      // Relations
      template_id: backendPlan.template_id || null,
      time_variant_id: backendPlan.time_variant_id || null,
      template: backendPlan.template || null,
      time_variant: backendPlan.time_variant || null,

      // Timestamps
      created_at: backendPlan.created_at || new Date().toISOString(),
      updated_at: backendPlan.updated_at || new Date().toISOString(),
      created_by: backendPlan.created_by || null,
      created_by_info: backendPlan.created_by_info || null,

      // ACCESS METHODS - CRITICAL FIX
      access_methods: accessMethods,
      enabled_access_methods: enabledAccessMethods,
      access_type: accessType,

      // Computed fields
      has_time_variant: backendPlan.has_time_variant || Boolean(backendPlan.time_variant),
      is_available_now: backendPlan.is_available_now || false,
      availability_info: backendPlan.availability_info || null,
      time_variant_summary: backendPlan.time_variant_summary || null,
      technical_config: backendPlan.technical_config || {},

      // Formatted fields
      price_formatted: backendPlan.price_formatted || `KSH ${parseFloat(backendPlan.price || 0).toFixed(2)}`,

      // Metadata
      _metadata: {
        normalized_at: new Date().toISOString(),
        source: 'backend',
        original_id: backendPlan.id
      }
    };

    // Calculate is_available_now if not provided
    if (normalized.is_available_now === undefined) {
      try {
        normalized.is_available_now = isPlanAvailableNow(normalized);
      } catch (e) {
        normalized.is_available_now = false;
      }
    }

    console.log('✅ Normalized plan:', {
      id: normalized.id,
      name: normalized.name,
      accessType: normalized.access_type,
      enabledMethods: normalized.enabled_access_methods,
      hotspot: normalized.access_methods.hotspot.enabled,
      pppoe: normalized.access_methods.pppoe.enabled
    });

    return normalized;

  } catch (error) {
    console.error('❌ Error normalizing backend plan:', error, backendPlan);
    return null;
  }
};

/**
 * Normalize a template from backend
 */
const normalizeBackendTemplate = (backendTemplate) => {
  try {
    if (!backendTemplate) return null;

    const category = BACKEND_VALUE_MAPPINGS.FROM_BACKEND.category[backendTemplate.category] || 'residential';

    // Get access methods
    const accessMethods = getAccessMethodsFromPlan(backendTemplate);
    const enabledAccessMethods = getEnabledAccessMethodsFromPlan(backendTemplate);
    const accessType = getAccessTypeFromMethods(accessMethods);

    return {
      id: backendTemplate.id,
      name: backendTemplate.name || '',
      description: backendTemplate.description || '',
      category: category,
      original_category: backendTemplate.category,
      base_price: parseFloat(backendTemplate.base_price) || 0,
      base_price_formatted: backendTemplate.base_price_formatted || 
        `KSH ${parseFloat(backendTemplate.base_price || 0).toFixed(2)}`,
      is_public: backendTemplate.is_public !== false,
      is_active: backendTemplate.is_active !== false,
      usage_count: parseInt(backendTemplate.usage_count) || 0,
      
      // ACCESS METHODS
      access_methods: accessMethods,
      enabled_access_methods: enabledAccessMethods,
      access_type: accessType,
      
      time_variant: backendTemplate.time_variant || null,
      created_at: backendTemplate.created_at,
      updated_at: backendTemplate.updated_at,
      created_by: backendTemplate.created_by,
      created_by_info: backendTemplate.created_by_info
    };
  } catch (error) {
    console.error('Error normalizing template:', error);
    return null;
  }
};

/**
 * Normalize a router from network_management app
 */
const normalizeBackendRouter = (backendRouter) => {
  try {
    if (!backendRouter) return null;

    return {
      id: parseInt(backendRouter.id) || backendRouter.id,
      name: backendRouter.name || '',
      ip_address: backendRouter.ip_address || '',
      status: backendRouter.status || 'unknown',
      is_active: backendRouter.is_active !== false,
      location: backendRouter.location || '',
      model: backendRouter.model || ''
    };
  } catch (error) {
    console.error('Error normalizing router:', error);
    return null;
  }
};

/**
 * Normalize a price matrix from backend
 */
const normalizePriceMatrix = (backendMatrix) => {
  try {
    if (!backendMatrix) return null;

    return {
      id: backendMatrix.id,
      name: backendMatrix.name || '',
      description: backendMatrix.description || '',
      discount_type: backendMatrix.discount_type || 'percentage',
      applies_to: backendMatrix.applies_to || 'plan',
      target_plan_id: backendMatrix.target_plan_id,
      target_plan_name: backendMatrix.target_plan_name,
      target_category: backendMatrix.target_category || '',
      percentage: parseFloat(backendMatrix.percentage) || 0,
      fixed_amount: parseFloat(backendMatrix.fixed_amount) || 0,
      tier_config: backendMatrix.tier_config || [],
      min_quantity: parseInt(backendMatrix.min_quantity) || 1,
      max_quantity: backendMatrix.max_quantity ? parseInt(backendMatrix.max_quantity) : null,
      valid_from: backendMatrix.valid_from,
      valid_to: backendMatrix.valid_to,
      is_active: backendMatrix.is_active !== false,
      usage_count: parseInt(backendMatrix.usage_count) || 0,
      total_discount_amount: parseFloat(backendMatrix.total_discount_amount) || 0,
      created_at: backendMatrix.created_at,
      updated_at: backendMatrix.updated_at
    };
  } catch (error) {
    console.error('Error normalizing price matrix:', error);
    return null;
  }
};

/**
 * Normalize a discount rule from backend
 */
const normalizeDiscountRule = (backendRule) => {
  try {
    if (!backendRule) return null;

    return {
      id: backendRule.id,
      name: backendRule.name || '',
      rule_type: backendRule.rule_type || 'first_time',
      description: backendRule.description || '',
      price_matrix_id: backendRule.price_matrix,
      price_matrix_name: backendRule.price_matrix_details?.name,
      eligibility_criteria: backendRule.eligibility_criteria || {},
      priority: parseInt(backendRule.priority) || 1,
      max_uses_per_client: backendRule.max_uses_per_client ? parseInt(backendRule.max_uses_per_client) : null,
      total_usage_limit: backendRule.total_usage_limit ? parseInt(backendRule.total_usage_limit) : null,
      current_usage: parseInt(backendRule.current_usage) || 0,
      is_active: backendRule.is_active !== false,
      can_be_applied: backendRule.can_be_applied || false,
      usage_percentage: backendRule.usage_percentage,
      created_at: backendRule.created_at,
      updated_at: backendRule.updated_at
    };
  } catch (error) {
    console.error('Error normalizing discount rule:', error);
    return null;
  }
};

// ============================================================================
// RESET ACCESS METHOD DEFAULTS
// ============================================================================

const resetAccessMethodDefaults = (formData) => {
  // Ensure access_methods exists
  if (!formData.access_methods) {
    formData.access_methods = {
      hotspot: { enabled: false },
      pppoe: { enabled: false }
    };
  }

  // Hotspot defaults
  if (formData.access_methods.hotspot) {
    formData.access_methods.hotspot = {
      enabled: formData.access_methods.hotspot.enabled || false,
      download_speed: { value: '', unit: 'Mbps' },
      upload_speed: { value: '', unit: 'Mbps' },
      data_limit: { value: '', unit: 'GB' },
      usage_limit: { value: '', unit: 'hours' },
      bandwidth_limit: '',
      max_devices: '',
      session_timeout: '',
      idle_timeout: '',
      validity_period: { value: '', unit: 'days' },
      mac_binding: false
    };
  }
  
  // PPPoE defaults
  if (formData.access_methods.pppoe) {
    formData.access_methods.pppoe = {
      enabled: formData.access_methods.pppoe.enabled || false,
      download_speed: { value: '', unit: 'Mbps' },
      upload_speed: { value: '', unit: 'Mbps' },
      data_limit: { value: '', unit: 'GB' },
      usage_limit: { value: '', unit: 'hours' },
      bandwidth_limit: '',
      max_devices: '',
      session_timeout: '',
      idle_timeout: '',
      validity_period: { value: '', unit: 'days' },
      mac_binding: false,
      ip_pool: '',
      service_name: '',
      mtu: ''
    };
  }
  
  return formData;
};

// ============================================================================
// MAIN PLAN MANAGEMENT COMPONENT
// ============================================================================

const PlanManagement = () => {
  const { theme } = useTheme();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const themeClasses = getThemeClasses(theme);

  // Responsive breakpoints
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');

  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================

  // Form state - using your custom hook
  const {
    form,
    setForm,
    errors,
    touched,
    handleChange,
    handleAccessTypeChange,
    handleAccessMethodChange,
    handleAccessMethodNestedChange,
    handleFieldBlur,
    validateForm,
    resetForm,
    prepareForBackend,
    getEnabledAccessMethods
  } = usePlanForm();

  // Time variant state - using your custom hook
  const {
    timeVariant: timeVariantState,
    setTimeVariant: setTimeVariantState,
    errors: timeVariantErrors,
    validateTimeVariant: validateTimeVariantHook,
    resetTimeVariant
  } = useTimeVariant();

  // Pricing state - using your custom hook
  const {
    pricing: pricingState,
    setPricing: setPricingState,
    errors: pricingErrors,
    validatePricing: validatePricingHook,
    calculatePriceForQuantity,
    calculatePriceBreakdown,
    resetPricing: resetPricingHook
  } = usePricing();

  // Data state
  const [plans, setPlans] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [routers, setRouters] = useState([]);
  const [priceMatrices, setPriceMatrices] = useState([]);
  const [discountRules, setDiscountRules] = useState([]);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [viewMode, setViewMode] = useState("list");
  const [editingPlan, setEditingPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [mobileSuccessAlert, setMobileSuccessAlert] = useState({ visible: false, message: "" });
  const [showAnalyticsTypeModal, setShowAnalyticsTypeModal] = useState(false);
  const [selectedAnalyticsType, setSelectedAnalyticsType] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState("30d");
  const [priceCalculationResult, setPriceCalculationResult] = useState(null);
  const [availabilityCheckResult, setAvailabilityCheckResult] = useState(null);

  // Filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    category: 'all',
    planType: 'all',
    accessType: 'all',
    availability: 'all',
    active: 'all',
    priceRange: null,
    hasTimeVariant: 'all',
    routerSpecific: 'all'
  });

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    field: "created_at",
    direction: "desc"
  });

  // Statistics state
  const [planStatistics, setPlanStatistics] = useState(null);

  // Error state
  const [apiError, setApiError] = useState(null);
  const [validationSummary, setValidationSummary] = useState([]);

  // Refs
  const searchDebounceRef = useRef(null);
  const fetchDataRef = useRef(false);

  // ========================================================================
  // HELPER FUNCTIONS
  // ========================================================================

  const showMobileSuccess = useCallback((message) => {
    setMobileSuccessAlert({ visible: true, message });
    setTimeout(() => {
      setMobileSuccessAlert({ visible: false, message: "" });
    }, 3000);
  }, []);

  const getAccessTypeFromPlan = useCallback((plan) => {
    const hotspot = plan.access_methods?.hotspot?.enabled === true;
    const pppoe = plan.access_methods?.pppoe?.enabled === true;
    
    if (hotspot && pppoe) return 'both';
    if (hotspot) return 'hotspot';
    if (pppoe) return 'pppoe';
    return 'none';
  }, []);

  // ========================================================================
  // DATA FETCHING
  // ========================================================================

  const fetchPlans = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping plan fetch');
      return [];
    }

    try {
      console.log('📡 Fetching plans from backend...');
      const plansData = await PlanApiService.getPlans();

      console.log(`📦 Received ${plansData.length} plans from backend`);

      // Normalize each plan - filter out nulls from failed normalization
      const normalizedPlans = plansData
        .map(plan => normalizeBackendPlan(plan))
        .filter(plan => plan !== null);

      console.log(`🔄 Normalized ${normalizedPlans.length} plans successfully`);
      
      // Log access types for debugging
      normalizedPlans.forEach(plan => {
        console.log(`Plan ${plan.name}: accessType=${plan.access_type}, hotspot=${plan.access_methods?.hotspot?.enabled}, pppoe=${plan.access_methods?.pppoe?.enabled}`);
      });

      return normalizedPlans;
    } catch (error) {
      console.error('❌ Error fetching plans:', error);
      throw error;
    }
  }, [isAuthenticated]);

  const fetchTemplates = useCallback(async () => {
    if (!isAuthenticated) return [];

    try {
      const templatesData = await PlanApiService.getTemplates();
      return templatesData
        .map(template => normalizeBackendTemplate(template))
        .filter(template => template !== null);
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  }, [isAuthenticated]);

  const fetchRouters = useCallback(async () => {
    if (!isAuthenticated) return [];

    try {
      const routersData = await PlanApiService.getRouters();
      return routersData
        .map(router => normalizeBackendRouter(router))
        .filter(router => router !== null);
    } catch (error) {
      console.error('Error fetching routers:', error);
      return [];
    }
  }, [isAuthenticated]);

  const fetchPriceMatrices = useCallback(async () => {
    if (!isAuthenticated) return [];

    try {
      const matricesData = await PlanApiService.getPriceMatrices();
      return matricesData
        .map(matrix => normalizePriceMatrix(matrix))
        .filter(matrix => matrix !== null);
    } catch (error) {
      console.error('Error fetching price matrices:', error);
      return [];
    }
  }, [isAuthenticated]);

  const fetchDiscountRules = useCallback(async () => {
    if (!isAuthenticated) return [];

    try {
      const rulesData = await PlanApiService.getDiscountRules();
      return rulesData
        .map(rule => normalizeDiscountRule(rule))
        .filter(rule => rule !== null);
    } catch (error) {
      console.error('Error fetching discount rules:', error);
      return [];
    }
  }, [isAuthenticated]);

  const fetchPlanStatistics = useCallback(async () => {
    if (!isAuthenticated) return null;

    try {
      const statsData = await PlanApiService.getPlanStatistics();
      return statsData;
    } catch (error) {
      console.error('Error fetching plan statistics:', error);
      return null;
    }
  }, [isAuthenticated]);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping data fetch');
      setIsInitialLoad(false);
      return;
    }

    if (fetchDataRef.current && !forceRefresh) {
      console.log('Fetch already in progress, skipping');
      return;
    }

    setIsLoading(true);
    setApiError(null);
    fetchDataRef.current = true;

    try {
      console.log('🚀 Fetching all data from backend...');

      const [plans, templatesData, routersData, matricesData, rulesData, statsData] = await Promise.all([
        fetchPlans(),
        fetchTemplates(),
        fetchRouters(),
        fetchPriceMatrices(),
        fetchDiscountRules(),
        fetchPlanStatistics()
      ]);

      console.log(`✅ Loaded ${plans.length} plans from backend`);
      console.log(`✅ Loaded ${templatesData.length} templates`);
      console.log(`✅ Loaded ${routersData.length} routers`);
      console.log(`✅ Loaded ${matricesData.length} price matrices`);
      console.log(`✅ Loaded ${rulesData.length} discount rules`);

      setPlans(plans);
      setFilteredPlans(plans);
      setTemplates(templatesData);
      setRouters(routersData);
      setPriceMatrices(matricesData);
      setDiscountRules(rulesData);
      setPlanStatistics(statsData);

    } catch (error) {
      console.error('❌ Error in fetchData:', error);
      setApiError(error);
      toast.error(`Failed to load data: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
      fetchDataRef.current = false;
    }
  }, [isAuthenticated, fetchPlans, fetchTemplates, fetchRouters,
    fetchPriceMatrices, fetchDiscountRules, fetchPlanStatistics]);

  const fetchAnalyticsData = useCallback(async () => {
    if (!selectedAnalyticsType || !isAuthenticated) return;

    setIsLoading(true);
    setApiError(null);

    try {
      const stats = await fetchPlanStatistics();

      const performanceMetrics = plans.map(plan => {
        const subscribers = plan.purchases || 0;
        const revenue = (plan.price || 0) * subscribers;
        const rating = calculateRating(subscribers);
        const popularity = calculatePopularity(subscribers);

        return {
          id: plan.id,
          name: plan.name,
          subscribers,
          revenue,
          rating,
          popularity: popularity.label,
          performanceScore: calculatePlanPerformance(plan, stats?.total_subscribers || 0).performanceScore
        };
      }).sort((a, b) => b.performanceScore - a.performanceScore);

      const analyticsData = {
        type: selectedAnalyticsType,
        timeRange: analyticsTimeRange,
        timestamp: new Date().toISOString(),
        data: {
          totalPlans: plans.length,
          activePlans: plans.filter(p => p.active).length,
          inactivePlans: plans.filter(p => !p.active).length,
          byCategory: plans.reduce((acc, p) => {
            acc[p.category] = (acc[p.category] || 0) + 1;
            return acc;
          }, {}),
          byPlanType: plans.reduce((acc, p) => {
            acc[p.plan_type] = (acc[p.plan_type] || 0) + 1;
            return acc;
          }, {}),
          performance: {
            topPerforming: performanceMetrics.slice(0, 5),
            bottomPerforming: performanceMetrics.slice(-5).reverse(),
            averagePerformance: performanceMetrics.reduce((sum, p) => sum + p.performanceScore, 0) / performanceMetrics.length || 0
          }
        }
      };

      setAnalyticsData(analyticsData);
      toast.success('Analytics data loaded');

    } catch (error) {
      console.error('Error fetching analytics:', error);
      setApiError(error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedAnalyticsType, analyticsTimeRange, plans, fetchPlanStatistics, isAuthenticated]);

  // ========================================================================
  // FILTERING & SEARCH
  // ========================================================================

  const applyFilter = useCallback((filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters({
      category: 'all',
      planType: 'all',
      accessType: 'all',
      availability: 'all',
      active: 'all',
      priceRange: null,
      hasTimeVariant: 'all',
      routerSpecific: 'all'
    });
    setSearchQuery("");
  }, []);

  const handleSort = useCallback((field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      try {
        let results = [...plans];

        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          results = results.filter(plan =>
            plan.name?.toLowerCase().includes(query) ||
            plan.description?.toLowerCase().includes(query) ||
            plan.category?.toLowerCase().includes(query)
          );
        }

        if (activeFilters.category && activeFilters.category !== 'all') {
          results = results.filter(plan => plan.category === activeFilters.category);
        }

        if (activeFilters.planType && activeFilters.planType !== 'all') {
          results = results.filter(plan => plan.plan_type === activeFilters.planType);
        }

        if (activeFilters.accessType && activeFilters.accessType !== 'all') {
          results = results.filter(plan => {
            if (activeFilters.accessType === 'hotspot') {
              return plan.enabled_access_methods?.includes('hotspot');
            } else if (activeFilters.accessType === 'pppoe') {
              return plan.enabled_access_methods?.includes('pppoe');
            } else if (activeFilters.accessType === 'both') {
              return plan.enabled_access_methods?.includes('hotspot') && 
                     plan.enabled_access_methods?.includes('pppoe');
            }
            return true;
          });
        }

        if (activeFilters.active && activeFilters.active !== 'all') {
          const isActive = activeFilters.active === 'active';
          results = results.filter(plan => plan.active === isActive);
        }

        if (activeFilters.hasTimeVariant && activeFilters.hasTimeVariant !== 'all') {
          const hasVariant = activeFilters.hasTimeVariant === 'yes';
          results = results.filter(plan => plan.has_time_variant === hasVariant);
        }

        if (activeFilters.routerSpecific && activeFilters.routerSpecific !== 'all') {
          const isRouterSpecific = activeFilters.routerSpecific === 'yes';
          results = results.filter(plan => plan.router_specific === isRouterSpecific);
        }

        results.sort((a, b) => {
          let aValue = a[sortConfig.field];
          let bValue = b[sortConfig.field];

          if (sortConfig.field === 'price' || sortConfig.field === 'purchases' || sortConfig.field === 'priority_level') {
            aValue = parseFloat(aValue) || 0;
            bValue = parseFloat(bValue) || 0;
          } else if (sortConfig.field === 'created_at' || sortConfig.field === 'updated_at') {
            aValue = new Date(aValue || 0).getTime();
            bValue = new Date(bValue || 0).getTime();
          } else if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = (bValue || '').toLowerCase();
          }

          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        });

        setFilteredPlans(results);

      } catch (error) {
        console.error('Error in search/filter:', error);
      }
    }, 300);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery, activeFilters, sortConfig, plans]);

  // ========================================================================
  // INITIAL DATA LOAD
  // ========================================================================

  useEffect(() => {
    if (isAuthenticated && !fetchDataRef.current) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  useEffect(() => {
    if (viewMode === "analytics" && selectedAnalyticsType && isAuthenticated) {
      fetchAnalyticsData();
    }
  }, [viewMode, selectedAnalyticsType, analyticsTimeRange, fetchAnalyticsData, isAuthenticated]);

  // ========================================================================
  // PLAN CRUD OPERATIONS
  // ========================================================================

  const startNewPlan = useCallback((planType = "hotspot", creationMethod = "create", templateId = null) => {
    if (!isAuthenticated) {
      toast.error('Please log in to create plans');
      return;
    }

    try {
      console.log('🚀 Starting new plan creation...');

      resetForm();
      resetPricingHook();
      resetTimeVariant();
      setValidationSummary([]);
      setApiError(null);
      setPriceCalculationResult(null);
      setAvailabilityCheckResult(null);

      const initialForm = getInitialFormState();
      const cleanedForm = resetAccessMethodDefaults(initialForm);

      cleanedForm.accessType = planType === 'dual' ? 'both' : planType;
      cleanedForm.access_methods.hotspot.enabled = planType === 'hotspot' || planType === 'dual';
      cleanedForm.access_methods.pppoe.enabled = planType === 'pppoe' || planType === 'dual';

      if (creationMethod === 'template' && templateId) {
        const template = templates.find(t => t.id === templateId);
        if (template) {
          console.log('📋 Applying template:', template.name);
          cleanedForm.name = `${template.name} - Copy`;
          cleanedForm.category = template.category || "";
          cleanedForm.price = template.base_price?.toString() || "";
          cleanedForm.description = template.description || "";

          if (template.access_methods) {
            cleanedForm.access_methods = deepClone(template.access_methods);
          }

          if (template.time_variant) {
            setTimeVariantState(template.time_variant);
          }
        }
      }

      setForm(cleanedForm);
      setEditingPlan(null);
      setActiveTab("basic");
      setViewMode("form");

      toast.success('Ready to create new plan');

    } catch (error) {
      console.error('Error starting new plan:', error);
      toast.error('Failed to initialize new plan form');
    }
  }, [resetForm, resetPricingHook, resetTimeVariant, templates, setForm, setTimeVariantState, isAuthenticated]);

  const editPlan = useCallback((plan) => {
    if (!isAuthenticated) {
      toast.error('Please log in to edit plans');
      return;
    }

    try {
      console.log('✏️ Editing plan:', plan.id, plan.name);

      const normalizedPlan = normalizeBackendPlan(plan);

      if (!normalizedPlan || !normalizedPlan.id) {
        toast.error('Failed to load plan for editing. The plan data may be corrupted.');
        return;
      }

      setForm({
        ...normalizedPlan,
        accessType: getAccessTypeFromPlan(normalizedPlan)
      });

      if (normalizedPlan.time_variant) {
        setTimeVariantState(normalizedPlan.time_variant);
      }

      setEditingPlan(deepClone(normalizedPlan));
      setActiveTab("basic");
      setViewMode("form");
      setValidationSummary([]);
      setApiError(null);

      toast.success(`Editing plan: ${normalizedPlan.name}`);

    } catch (error) {
      console.error('Error editing plan:', error);
      toast.error('Failed to load plan for editing');
    }
  }, [setForm, setTimeVariantState, getAccessTypeFromPlan, isAuthenticated]);

  const viewPlanDetails = useCallback((plan) => {
    if (!isAuthenticated) {
      toast.error('Please log in to view plan details');
      return;
    }

    try {
      const normalizedPlan = normalizeBackendPlan(plan);
      if (normalizedPlan && normalizedPlan.id) {
        setSelectedPlan(normalizedPlan);
        setViewMode("details");
      } else {
        toast.error('Failed to load plan details. The plan data may be corrupted.');
      }
    } catch (error) {
      console.error('Error viewing plan details:', error);
      toast.error('Failed to load plan details');
    }
  }, [isAuthenticated]);

  const preparePlanDataForBackend = useCallback(() => {
    const formData = { ...form };

    const backendPlanType = BACKEND_VALUE_MAPPINGS.plan_type[formData.plan_type] || 'Paid';
    const backendCategory = BACKEND_VALUE_MAPPINGS.category[formData.category] || 'Residential';

    const planData = {
      name: formData.name?.trim(),
      description: formData.description?.trim() || '',
      category: backendCategory,
      plan_type: backendPlanType,
      price: parseFloat(formData.price) || 0,
      active: formData.active !== false,

      access_methods: {
        hotspot: {
          enabled: formData.access_methods?.hotspot?.enabled || false,
          download_speed: formData.access_methods?.hotspot?.download_speed || { value: '', unit: 'Mbps' },
          upload_speed: formData.access_methods?.hotspot?.upload_speed || { value: '', unit: 'Mbps' },
          data_limit: formData.access_methods?.hotspot?.data_limit || { value: '', unit: 'GB' },
          usage_limit: formData.access_methods?.hotspot?.usage_limit || { value: '', unit: 'hours' },
          bandwidth_limit: parseInt(formData.access_methods?.hotspot?.bandwidth_limit) || '',
          max_devices: parseInt(formData.access_methods?.hotspot?.max_devices) || '',
          session_timeout: parseInt(formData.access_methods?.hotspot?.session_timeout) || '',
          idle_timeout: parseInt(formData.access_methods?.hotspot?.idle_timeout) || '',
          validity_period: formData.access_methods?.hotspot?.validity_period || { value: '', unit: 'days' },
          mac_binding: Boolean(formData.access_methods?.hotspot?.mac_binding)
        },
        pppoe: {
          enabled: formData.access_methods?.pppoe?.enabled || false,
          download_speed: formData.access_methods?.pppoe?.download_speed || { value: '', unit: 'Mbps' },
          upload_speed: formData.access_methods?.pppoe?.upload_speed || { value: '', unit: 'Mbps' },
          data_limit: formData.access_methods?.pppoe?.data_limit || { value: '', unit: 'GB' },
          usage_limit: formData.access_methods?.pppoe?.usage_limit || { value: '', unit: 'hours' },
          bandwidth_limit: parseInt(formData.access_methods?.pppoe?.bandwidth_limit) || '',
          max_devices: parseInt(formData.access_methods?.pppoe?.max_devices) || '',
          session_timeout: parseInt(formData.access_methods?.pppoe?.session_timeout) || '',
          idle_timeout: parseInt(formData.access_methods?.pppoe?.idle_timeout) || '',
          validity_period: formData.access_methods?.pppoe?.validity_period || { value: '', unit: 'days' },
          mac_binding: Boolean(formData.access_methods?.pppoe?.mac_binding),
          ip_pool: formData.access_methods?.pppoe?.ip_pool || '',
          service_name: formData.access_methods?.pppoe?.service_name || '',
          mtu: parseInt(formData.access_methods?.pppoe?.mtu) || ''
        }
      },

      priority_level: parseInt(formData.priority_level) || 4,
      router_specific: Boolean(formData.router_specific),
      allowed_routers_ids: Array.isArray(formData.allowed_routers_ids) ? formData.allowed_routers_ids : [],

      fup_policy: formData.fup_policy || '',
      fup_threshold: parseInt(formData.fup_threshold) || 80,

      template_id: formData.template_id || null,
      time_variant_id: formData.time_variant_id || null
    };

    return planData;
  }, [form]);

  const savePlan = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save plans');
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      console.log('💾 Starting plan save operation...');

      const isFormValid = validateForm();
      if (!isFormValid) {
        const message = "Please fix validation errors before saving";
        isMobile ? showMobileSuccess(message) : toast.error(message);
        setIsLoading(false);
        return;
      }

      const planData = preparePlanDataForBackend();
      console.log('📤 Prepared plan data:', planData);

      let timeVariantId = null;
      if (timeVariantState.is_active) {
        const timeVariantValid = validateTimeVariantHook();
        if (!timeVariantValid) {
          const message = "Please fix time variant validation errors";
          isMobile ? showMobileSuccess(message) : toast.error(message);
          setIsLoading(false);
          return;
        }

        const timeVariantData = {
          is_active: true,
          start_time: timeVariantState.start_time,
          end_time: timeVariantState.end_time,
          available_days: timeVariantState.available_days || [],
          schedule_active: timeVariantState.schedule_active || false,
          schedule_start_date: timeVariantState.schedule_start_date,
          schedule_end_date: timeVariantState.schedule_end_date,
          duration_active: timeVariantState.duration_active || false,
          duration_value: timeVariantState.duration_value || 0,
          duration_unit: timeVariantState.duration_unit || 'days',
          duration_start_date: timeVariantState.duration_start_date,
          exclusion_dates: timeVariantState.exclusion_dates || [],
          timezone: timeVariantState.timezone || 'Africa/Nairobi',
          force_available: timeVariantState.force_available || false
        };

        try {
          let timeVariantResponse;
          if (editingPlan?.time_variant_id) {
            console.log('⏰ Updating existing time variant:', editingPlan.time_variant_id);
            timeVariantResponse = await PlanApiService.updateTimeVariant(
              editingPlan.time_variant_id,
              timeVariantData
            );
          } else {
            console.log('⏰ Creating new time variant');
            timeVariantResponse = await PlanApiService.createTimeVariant(timeVariantData);
          }

          if (timeVariantResponse.config?.id) {
            timeVariantId = timeVariantResponse.config.id;
          } else if (timeVariantResponse.id) {
            timeVariantId = timeVariantResponse.id;
          }

          console.log('✅ Time variant saved with ID:', timeVariantId);
          planData.time_variant_id = timeVariantId;

        } catch (error) {
          console.error('❌ Error saving time variant:', error);
          toast.error(`Failed to save time variant: ${error.message}`);
          setIsLoading(false);
          return;
        }
      }

      let response;
      if (editingPlan) {
        console.log(`📝 Updating plan ${editingPlan.id}...`);
        response = await PlanApiService.updatePlan(editingPlan.id, planData);
        toast.success('Plan updated successfully');
      } else {
        console.log('➕ Creating new plan...');
        response = await PlanApiService.createPlan(planData);
        toast.success('Plan created successfully');
      }

      console.log('📥 Backend response:', response);

      const savedPlan = normalizeBackendPlan(response);

      if (!savedPlan || !savedPlan.id) {
        console.error('❌ Failed to normalize plan response');
        toast.warning('Plan was saved but failed to load. Refreshing data...');
        await fetchData(true);
        setViewMode("list");
        resetForm();
        resetPricingHook();
        resetTimeVariant();
        setEditingPlan(null);
        setIsLoading(false);
        return;
      }

      console.log('✅ Plan saved successfully:', savedPlan.id, savedPlan.name);

      setPlans(prevPlans => {
        if (editingPlan) {
          return prevPlans.map(p => p.id === savedPlan.id ? savedPlan : p);
        } else {
          return [...prevPlans, savedPlan];
        }
      });

      setFilteredPlans(prevFiltered => {
        if (editingPlan) {
          return prevFiltered.map(p => p.id === savedPlan.id ? savedPlan : p);
        } else {
          return [...prevFiltered, savedPlan];
        }
      });

      setViewMode("list");
      resetForm();
      resetPricingHook();
      resetTimeVariant();
      setEditingPlan(null);
      setValidationSummary([]);
      setApiError(null);

    } catch (error) {
      console.error('❌ Error in savePlan:', error);
      setApiError(error);

      if (error.code === 'VALIDATION_ERROR') {
        const fieldErrors = error.details?.field_errors || error.details || {};
        console.error('Validation errors:', fieldErrors);
        toast.error(`Validation failed: ${error.message}`);
      } else if (error.code === 'UNAUTHORIZED') {
        toast.error('Session expired. Please log in again.');
      } else if (error.code === 'FORBIDDEN') {
        toast.error('You do not have permission to perform this action.');
      } else {
        toast.error(`Failed to save plan: ${error.message || 'Unknown error'}`);
      }

      if (isAuthenticated) {
        fetchData(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    isAuthenticated, validateForm, timeVariantState,
    validateTimeVariantHook, editingPlan, isMobile, showMobileSuccess,
    resetForm, resetPricingHook, resetTimeVariant, setViewMode, fetchData,
    preparePlanDataForBackend
  ]);

  const confirmDelete = useCallback((plan) => {
    if (!isAuthenticated) {
      toast.error('Please log in to delete plans');
      return;
    }
    setPlanToDelete(plan);
    setDeleteModalOpen(true);
  }, [isAuthenticated]);

  const deletePlan = useCallback(async () => {
    if (!planToDelete || !isAuthenticated) return;

    setIsLoading(true);
    setApiError(null);

    try {
      console.log('🗑️ Deleting plan:', planToDelete.id, planToDelete.name);

      await PlanApiService.deletePlan(planToDelete.id);

      setPlans(prevPlans => prevPlans.filter(p => p.id !== planToDelete.id));
      setFilteredPlans(prevPlans => prevPlans.filter(p => p.id !== planToDelete.id));

      if (selectedPlan?.id === planToDelete.id) {
        setSelectedPlan(null);
        setViewMode("list");
      }

      toast.success(`Plan "${planToDelete.name}" deleted successfully`);

    } catch (error) {
      console.error('Error deleting plan:', error);
      setApiError(error);

      if (error.code === 'UNAUTHORIZED') {
        toast.error('Session expired. Please log in again.');
      } else if (error.code === 'FORBIDDEN') {
        toast.error('You do not have permission to delete this plan.');
      } else {
        toast.error(`Failed to delete plan: ${error.message || 'Unknown error'}`);
      }

      if (isAuthenticated) {
        fetchData(true);
      }
    } finally {
      setIsLoading(false);
      setDeleteModalOpen(false);
      setPlanToDelete(null);
    }
  }, [planToDelete, isAuthenticated, selectedPlan, setViewMode, fetchData]);

  const duplicatePlan = useCallback(async (plan) => {
    if (!isAuthenticated) {
      toast.error('Please log in to duplicate plans');
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      console.log('📋 Duplicating plan:', plan.id, plan.name);

      const planCopy = {
        ...plan,
        id: undefined,
        name: `${plan.name} (Copy)`,
        purchases: 0,
        created_at: undefined,
        updated_at: undefined,
        template_id: plan.template_id,
        time_variant_id: plan.time_variant_id
      };

      const planData = preparePlanDataForBackend();

      const response = await PlanApiService.createPlan(planData);
      const newPlan = normalizeBackendPlan(response);

      if (newPlan && newPlan.id) {
        setPlans(prevPlans => [...prevPlans, newPlan]);
        setFilteredPlans(prevPlans => [...prevPlans, newPlan]);
        toast.success(`Plan "${newPlan.name}" duplicated successfully`);
      } else {
        throw new Error('Failed to normalize duplicated plan');
      }

    } catch (error) {
      console.error('Error duplicating plan:', error);
      setApiError(error);

      if (error.code === 'UNAUTHORIZED') {
        toast.error('Session expired. Please log in again.');
      } else if (error.code === 'FORBIDDEN') {
        toast.error('You do not have permission to duplicate plans.');
      } else {
        toast.error(`Failed to duplicate plan: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, preparePlanDataForBackend]);

  const togglePlanStatus = useCallback(async (plan) => {
    if (!isAuthenticated) {
      toast.error('Please log in to update plan status');
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      console.log('🔄 Toggling plan status:', plan.id, plan.name, 'active:', !plan.active);

      const planData = {
        ...plan,
        active: !plan.active
      };

      const response = await PlanApiService.updatePlan(plan.id, planData);
      const updatedPlan = normalizeBackendPlan(response);

      if (updatedPlan && updatedPlan.id) {
        setPlans(prevPlans => prevPlans.map(p => p.id === plan.id ? updatedPlan : p));
        setFilteredPlans(prevPlans => prevPlans.map(p => p.id === plan.id ? updatedPlan : p));
        toast.success(`Plan "${plan.name}" ${updatedPlan.active ? 'activated' : 'deactivated'} successfully`);
      }

    } catch (error) {
      console.error('Error toggling plan status:', error);
      setApiError(error);

      if (error.code === 'UNAUTHORIZED') {
        toast.error('Session expired. Please log in again.');
      } else if (error.code === 'FORBIDDEN') {
        toast.error('You do not have permission to update this plan.');
      } else {
        toast.error(`Failed to update plan status: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const applyTemplate = useCallback((template) => {
    if (!isAuthenticated) {
      toast.error('Please log in to apply templates');
      return;
    }

    try {
      console.log('📋 Applying template:', template.name);

      const newForm = getInitialFormState();
      const cleanedForm = resetAccessMethodDefaults(newForm);

      cleanedForm.name = template.name || "";
      cleanedForm.category = template.category || "";
      cleanedForm.price = template.base_price?.toString() || "";
      cleanedForm.description = template.description || "";

      if (template.access_methods) {
        cleanedForm.access_methods = deepClone(template.access_methods);
      }

      const enabledMethods = [];
      if (cleanedForm.access_methods.hotspot?.enabled) enabledMethods.push('hotspot');
      if (cleanedForm.access_methods.pppoe?.enabled) enabledMethods.push('pppoe');
      cleanedForm.accessType = enabledMethods.length === 2 ? 'both' :
        enabledMethods.length === 1 ? enabledMethods[0] : 'hotspot';

      if (template.time_variant) {
        setTimeVariantState(template.time_variant);
      }

      setForm(cleanedForm);
      setEditingPlan(null);
      setActiveTab("basic");
      setViewMode("form");

      toast.success(`Template "${template.name}" applied`);

    } catch (error) {
      console.error('Error applying template:', error);
      toast.error('Failed to apply template');
    }
  }, [setForm, setTimeVariantState, isAuthenticated]);

  const createPlanFromTemplate = useCallback(async (templateId, planData) => {
    if (!isAuthenticated) {
      toast.error('Please log in to create plans from templates');
      throw new Error('Authentication required');
    }

    setIsLoading(true);
    setApiError(null);

    try {
      console.log('📋 Creating plan from template:', templateId);

      const response = await PlanApiService.createPlanFromTemplate(templateId, planData);
      const newPlan = normalizeBackendPlan(response);

      if (newPlan && newPlan.id) {
        setPlans(prevPlans => [...prevPlans, newPlan]);
        setFilteredPlans(prevPlans => [...prevPlans, newPlan]);
        setViewMode("list");
        toast.success('Plan created from template successfully');
      }

      return response;

    } catch (error) {
      console.error('Error creating plan from template:', error);
      setApiError(error);

      if (error.code === 'UNAUTHORIZED') {
        toast.error('Session expired. Please log in again.');
      } else if (error.code === 'FORBIDDEN') {
        toast.error('You do not have permission to use this template.');
      } else {
        toast.error(`Failed to create plan from template: ${error.message || 'Unknown error'}`);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const calculatePrice = useCallback(async (planId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please log in to calculate prices');
      return null;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      const result = await PlanApiService.calculatePrice(planId, quantity);
      setPriceCalculationResult(result);
      toast.success('Price calculation completed');
      return result;
    } catch (error) {
      console.error('Error calculating price:', error);
      setApiError(error);

      if (error.code === 'UNAUTHORIZED') {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error(`Failed to calculate price: ${error.message || 'Unknown error'}`);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const handleAnalyticsSelect = useCallback(async (analyticsType) => {
    if (!isAuthenticated) {
      toast.error('Please log in to view analytics');
      return;
    }
    setSelectedAnalyticsType(analyticsType);
    setShowAnalyticsTypeModal(false);
    setViewMode("analytics");
  }, [isAuthenticated]);

  const handleAnalyticsTimeRangeChange = useCallback((timeRange) => {
    setAnalyticsTimeRange(timeRange);
  }, []);

  const exportAnalyticsData = useCallback(() => {
    if (!analyticsData) {
      toast.error('No analytics data to export');
      return;
    }

    try {
      const dataStr = JSON.stringify(analyticsData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `plan-analytics-${selectedAnalyticsType}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Analytics data exported successfully');
    } catch (error) {
      console.error('Error exporting analytics:', error);
      toast.error('Failed to export analytics data');
    }
  }, [analyticsData, selectedAnalyticsType]);

  const validatePlanForm = useCallback(() => {
    const validationErrors = [];

    if (!form.name?.trim()) {
      validationErrors.push('Plan name is required');
    }

    if (!form.plan_type) {
      validationErrors.push('Plan type is required');
    }

    if (form.plan_type === 'paid' && (!form.price || parseFloat(form.price) < 0)) {
      validationErrors.push('Valid price is required for paid plans');
    }

    if (form.plan_type === 'free_trial' && parseFloat(form.price) !== 0) {
      validationErrors.push('Free trial plans must have price 0');
    }

    if (!form.category) {
      validationErrors.push('Category is required');
    }

    const hasEnabledMethods = form.access_methods?.hotspot?.enabled ||
      form.access_methods?.pppoe?.enabled;
    if (!hasEnabledMethods) {
      validationErrors.push('At least one access method must be enabled');
    }

    setValidationSummary(validationErrors);
    return validationErrors.length === 0;
  }, [form]);

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================

  const getTabs = useCallback(() => {
    const baseTabs = [
      { id: "basic", label: "Basic Details", icon: Settings },
      { id: "advanced", label: "Advanced", icon: Server },
    ];

    const enabledMethods = getEnabledAccessMethods();

    if (enabledMethods.includes('hotspot')) {
      baseTabs.splice(1, 0, { id: "hotspot", label: "Hotspot", icon: Wifi });
    }
    if (enabledMethods.includes('pppoe')) {
      const insertIndex = enabledMethods.includes('hotspot') ? 2 : 1;
      baseTabs.splice(insertIndex, 0, { id: "pppoe", label: "PPPoE", icon: Cable });
    }

    if (timeVariantState.is_active) {
      baseTabs.push({ id: "time_variant", label: "Time Settings", icon: Clock });
    }

    baseTabs.push({ id: "pricing", label: "Pricing", icon: DollarSign });

    return baseTabs;
  }, [getEnabledAccessMethods, timeVariantState.is_active]);

  const renderTabs = useCallback(() => {
    const tabs = getTabs();

    return (
      <div className={`p-2 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light} mb-4 overflow-x-auto`}>
        <div className="flex space-x-1 min-w-max">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            const buttonSize = isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm';
            const iconSize = isMobile ? 'w-3 h-3' : 'w-4 h-4';

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  ${buttonSize} rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap
                  ${isActive
                    ? "bg-indigo-600 text-white shadow-md"
                    : `${themeClasses.text.secondary} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`
                  }
                `}
              >
                <IconComponent className={`${iconSize}`} />
                <span className={isMobile ? 'hidden sm:inline' : 'inline'}>
                  {isMobile && !isDesktop ? tab.label.split(' ')[0] : tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }, [getTabs, activeTab, theme, themeClasses, isMobile, isDesktop]);

  const renderFormContent = useCallback(() => {
    const commonProps = {
      form,
      errors,
      theme,
      isMobile
    };

    switch (activeTab) {
      case "basic":
        return (
          <>
            <PlanBasicDetails
              {...commonProps}
              touched={touched}
              onChange={handleChange}
              onAccessTypeChange={handleAccessTypeChange}
              onBlur={handleFieldBlur}
            />
            {(validationSummary.length > 0 || apiError) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-lg border ${
                  apiError
                    ? themeClasses.bg.danger
                    : themeClasses.bg.warning
                } ${apiError ? themeClasses.border.danger : themeClasses.border.warning}`}
              >
                <div className="flex items-start">
                  <AlertCircle className={`w-5 h-5 mr-3 ${
                    apiError ? themeClasses.text.danger : themeClasses.text.warning
                  }`} />
                  <div className="flex-1">
                    <h4 className={`font-medium mb-2 ${
                      apiError ? themeClasses.text.danger : themeClasses.text.warning
                    }`}>
                      {apiError ? 'Error Saving Plan' : 'Please fix the following errors:'}
                    </h4>
                    {apiError ? (
                      <p className={`text-sm ${themeClasses.text.danger}`}>
                        {apiError.message}
                      </p>
                    ) : (
                      <ul className={`text-sm space-y-1 ${themeClasses.text.warning}`}>
                        {validationSummary.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </>
        );

      case "hotspot":
        return (
          <HotspotConfiguration
            {...commonProps}
            onChange={handleAccessMethodChange}
            onNestedChange={handleAccessMethodNestedChange}
          />
        );

      case "pppoe":
        return (
          <PPPoEConfiguration
            {...commonProps}
            onChange={handleAccessMethodChange}
            onNestedChange={handleAccessMethodNestedChange}
          />
        );

      case "advanced":
        return (
          <PlanAdvancedSettings
            {...commonProps}
            onChange={handleChange}
            routers={routers}
          />
        );

      case "time_variant":
        return (
          <TimeVariantConfig
            timeVariant={timeVariantState}
            onChange={(field, value) => {
              const newTimeVariant = { ...timeVariantState, [field]: value };
              setTimeVariantState(newTimeVariant);
            }}
            errors={timeVariantErrors}
            theme={theme}
            isMobile={isMobile}
          />
        );

      case "pricing":
        return (
          <PricingConfiguration
            {...commonProps}
            priceMatrices={priceMatrices}
            discountRules={discountRules}
            onChange={handleChange}
            onCalculatePrice={() => editingPlan && calculatePrice(editingPlan.id)}
            priceCalculationResult={priceCalculationResult}
            pricingState={pricingState}
            pricingErrors={pricingErrors}
            onPricingChange={(field, value) => {
              const newPricing = { ...pricingState, [field]: value };
              setPricingState(newPricing);
            }}
            onCalculatePricing={(quantity) => {
              if (pricingState.price) {
                const breakdown = calculatePriceBreakdown(quantity);
                setPriceCalculationResult({
                  success: true,
                  data: breakdown
                });
                return breakdown;
              }
              return null;
            }}
          />
        );

      default:
        return null;
    }
  }, [
    activeTab, form, errors, touched, theme, isMobile, validationSummary, apiError,
    handleChange, handleAccessTypeChange, handleAccessMethodChange,
    handleAccessMethodNestedChange, handleFieldBlur, routers,
    timeVariantState, timeVariantErrors, setTimeVariantState,
    priceMatrices, discountRules, editingPlan, calculatePrice,
    priceCalculationResult, pricingState, pricingErrors, setPricingState,
    calculatePriceBreakdown, themeClasses
  ]);

  const DetailRow = useCallback(({ label, value, icon: Icon }) => {
    return (
      <div className="flex items-center py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
        {Icon && <Icon className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />}
        <div className="flex-1">
          <p className={`text-sm ${themeClasses.text.secondary}`}>{label}</p>
          <p className={`font-medium ${themeClasses.text.primary}`}>{value || '—'}</p>
        </div>
      </div>
    );
  }, [themeClasses]);

  const DetailCard = useCallback(({ title, children, icon: Icon }) => {
    return (
      <div className={`p-4 rounded-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
        <div className="flex items-center mb-4">
          {Icon && <Icon className="w-5 h-5 mr-2 text-indigo-600" />}
          <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>{title}</h3>
        </div>
        {children}
      </div>
    );
  }, [themeClasses]);

  const renderPlanDetails = useCallback(() => {
    if (!selectedPlan) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`${themeClasses.bg.primary} p-4 md:p-6`}
      >
        <button
          onClick={() => setViewMode("list")}
          className={`mb-4 flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300`}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to List
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className={`text-2xl font-bold ${themeClasses.text.primary}`}>{selectedPlan.name}</h2>
          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <PlanTypeBadge type={selectedPlan.plan_type} theme={theme} size="md" />
            <AvailabilityBadge
              status={selectedPlan.is_available_now ? 'available' :
                selectedPlan.has_time_variant ? 'restricted' :
                  selectedPlan.active ? 'available' : 'unavailable'}
              theme={theme}
              size="md"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DetailCard title="Basic Information" icon={FileText}>
            <DetailRow label="Plan Type" value={formatPlanType(selectedPlan.plan_type)} icon={Package} />
            <DetailRow label="Price" value={selectedPlan.price_formatted || formatCurrency(selectedPlan.price)} icon={DollarSign} />
            <DetailRow label="Category" value={selectedPlan.category} icon={Tag} />
            <DetailRow label="Description" value={selectedPlan.description || "No description"} icon={FileText} />
            <DetailRow label="Priority" value={`Level ${selectedPlan.priority_level}`} icon={Zap} />
            <DetailRow label="Purchases" value={formatNumber(selectedPlan.purchases)} icon={Users} />
            <DetailRow label="Created" value={formatDate(selectedPlan.created_at, true)} icon={Calendar} />
            <DetailRow label="Last Updated" value={formatDate(selectedPlan.updated_at, true)} icon={Clock} />
          </DetailCard>

          <DetailCard title="Access Methods" icon={Network}>
            <DetailRow
              label="Access Type"
              value={formatAccessType(selectedPlan.enabled_access_methods?.join(', ') || 'None')}
              icon={Globe}
            />
            {selectedPlan.access_methods?.hotspot?.enabled && (
              <>
                <DetailRow label="Hotspot Status" value="Enabled" icon={Wifi} />
                <DetailRow
                  label="Download Speed"
                  value={formatSpeed(selectedPlan.access_methods.hotspot.download_speed)}
                  icon={Download}
                />
                <DetailRow
                  label="Upload Speed"
                  value={formatSpeed(selectedPlan.access_methods.hotspot.upload_speed)}
                  icon={Upload}
                />
                <DetailRow
                  label="Data Limit"
                  value={formatDataLimit(selectedPlan.access_methods.hotspot.data_limit)}
                  icon={Database}
                />
                <DetailRow
                  label="Max Devices"
                  value={formatDeviceCount(selectedPlan.access_methods.hotspot.max_devices)}
                  icon={Smartphone}
                />
              </>
            )}
            {selectedPlan.access_methods?.pppoe?.enabled && (
              <>
                <DetailRow label="PPPoE Status" value="Enabled" icon={Cable} />
                <DetailRow
                  label="Download Speed"
                  value={formatSpeed(selectedPlan.access_methods.pppoe.download_speed)}
                  icon={Download}
                />
                <DetailRow
                  label="Upload Speed"
                  value={formatSpeed(selectedPlan.access_methods.pppoe.upload_speed)}
                  icon={Upload}
                />
                <DetailRow
                  label="Data Limit"
                  value={formatDataLimit(selectedPlan.access_methods.pppoe.data_limit)}
                  icon={Database}
                />
                <DetailRow
                  label="IP Pool"
                  value={selectedPlan.access_methods.pppoe.ip_pool || 'Default'}
                  icon={Network}
                />
              </>
            )}
          </DetailCard>

          {selectedPlan.time_variant?.is_active && (
            <DetailCard title="Time Settings" icon={Clock}>
              <DetailRow
                label="Status"
                value="Time Restricted"
                icon={CalendarClock}
              />
              <DetailRow
                label="Available Now"
                value={selectedPlan.is_available_now ? 'Yes' : 'No'}
                icon={selectedPlan.is_available_now ? Check : X}
              />
              {selectedPlan.time_variant.schedule?.map((rule, index) => (
                <DetailRow
                  key={index}
                  label={`Schedule ${index + 1}`}
                  value={`${formatDaysOfWeek(rule.days, true)}: ${formatTimeRange(rule.start_time, rule.end_time)}`}
                  icon={Calendar}
                />
              ))}
              <DetailRow
                label="Timezone"
                value={formatTimezone(selectedPlan.time_variant.timezone)}
                icon={Globe}
              />
            </DetailCard>
          )}

          <DetailCard title="Status & Configuration" icon={Activity}>
            <DetailRow
              label="Active Status"
              value={selectedPlan.active ? 'Active' : 'Inactive'}
              icon={selectedPlan.active ? CheckCircle : XCircle}
            />
            <DetailRow
              label="Time Restricted"
              value={selectedPlan.has_time_variant ? 'Yes' : 'No'}
              icon={selectedPlan.has_time_variant ? Clock : X}
            />
            <DetailRow
              label="Router Specific"
              value={selectedPlan.router_specific ? 'Yes' : 'No'}
              icon={Router}
            />
            {selectedPlan.router_specific && (
              <DetailRow
                label="Allowed Routers"
                value={`${selectedPlan.allowed_routers_ids?.length || 0} routers`}
                icon={Server}
              />
            )}
            <DetailRow
              label="FUP Policy"
              value={selectedPlan.fup_policy || 'None'}
              icon={Shield}
            />
            {selectedPlan.fup_policy && (
              <DetailRow
                label="FUP Threshold"
                value={`${selectedPlan.fup_threshold}%`}
                icon={Activity}
              />
            )}
          </DetailCard>

          <DetailCard title="Performance Metrics" icon={BarChart3}>
            <DetailRow
              label="Total Purchases"
              value={formatNumber(selectedPlan.purchases)}
              icon={TrendingUp}
            />
            <DetailRow
              label="Rating"
              value={`${calculateRating(selectedPlan.purchases)}/5`}
              icon={Star}
            />
            <DetailRow
              label="Popularity"
              value={calculatePopularity(selectedPlan.purchases).label}
              icon={TrendingUp}
            />
          </DetailCard>

          {selectedPlan.template_id && (
            <DetailCard title="Template Information" icon={Copy}>
              <DetailRow
                label="Template ID"
                value={selectedPlan.template_id}
                icon={FileText}
              />
            </DetailCard>
          )}
        </div>
      </motion.div>
    );
  }, [selectedPlan, theme, themeClasses, setViewMode]);

  const isFormValid = useMemo(() => {
    return validatePlanForm();
  }, [validatePlanForm]);

  // ========================================================================
  // AUTHENTICATION CHECK
  // ========================================================================

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 dark:border-gray-600 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className={themeClasses.text.secondary}>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClasses.bg.primary}`}>
        <div className={`p-8 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light} max-w-md text-center`}>
          <div className={`p-4 rounded-full mx-auto mb-4 ${themeClasses.bg.warning} w-20 h-20 flex items-center justify-center`}>
            <AlertTriangle className={`w-10 h-10 ${themeClasses.text.warning}`} />
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${themeClasses.text.primary}`}>
            Authentication Required
          </h2>
          <p className={`mb-6 ${themeClasses.text.secondary}`}>
            Please log in to access plan management features.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className={`px-6 py-3 rounded-lg font-medium ${themeClasses.button.primary} w-full`}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <ErrorBoundary>
      <div className={`min-h-screen transition-colors duration-300 ${themeClasses.bg.primary}`}>

        {apiError && viewMode !== 'form' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mx-4 mt-4 p-4 rounded-lg ${
              apiError.code === 'UNAUTHORIZED'
                ? themeClasses.bg.warning
                : themeClasses.bg.danger
            } ${
              apiError.code === 'UNAUTHORIZED'
                ? themeClasses.border.warning
                : themeClasses.border.danger
            } border`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className={`w-5 h-5 mr-3 ${
                  apiError.code === 'UNAUTHORIZED'
                    ? themeClasses.text.warning
                    : themeClasses.text.danger
                }`} />
                <div>
                  <p className={`font-medium ${
                    apiError.code === 'UNAUTHORIZED'
                      ? themeClasses.text.warning
                      : themeClasses.text.danger
                  }`}>
                    {apiError.code === 'UNAUTHORIZED' ? 'Authentication Error' : 'API Error'}
                  </p>
                  <p className={`text-sm ${
                    apiError.code === 'UNAUTHORIZED'
                      ? themeClasses.text.warning
                      : themeClasses.text.danger
                  }`}>
                    {apiError.message}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setApiError(null)}
                className={`${
                  apiError.code === 'UNAUTHORIZED'
                    ? themeClasses.text.warning
                    : themeClasses.text.danger
                } hover:opacity-80`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {viewMode === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={themeClasses.bg.primary}
            >
              <PlanAnalytics
                plans={filteredPlans}
                templates={templates}
                onBack={() => {
                  setViewMode("list");
                  setSelectedAnalyticsType(null);
                  setAnalyticsData(null);
                }}
                analyticsType={selectedAnalyticsType}
                analyticsData={analyticsData}
                timeRange={analyticsTimeRange}
                onTimeRangeChange={handleAnalyticsTimeRangeChange}
                onExportData={exportAnalyticsData}
                onRefreshAnalytics={fetchAnalyticsData}
                theme={theme}
                isMobile={isMobile}
              />
            </motion.div>
          )}

          {viewMode === "templates" && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={themeClasses.bg.primary}
            >
              <PlanTemplates
                templates={templates}
                onApplyTemplate={applyTemplate}
                onCreateFromTemplate={createPlanFromTemplate}
                onBack={() => setViewMode("list")}
                theme={theme}
                isMobile={isMobile}
              />
            </motion.div>
          )}

          {viewMode === "list" && (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={themeClasses.bg.primary}
            >
              <PlanList
                plans={filteredPlans}
                allPlans={plans}
                isLoading={isLoading || isInitialLoad}
                onEditPlan={editPlan}
                onViewDetails={viewPlanDetails}
                onDeletePlan={confirmDelete}
                onDuplicatePlan={duplicatePlan}
                onToggleStatus={togglePlanStatus}
                onNewPlan={() => {
                  if (!isAuthenticated) {
                    toast.error('Please log in to create new plans');
                    return;
                  }
                  // Directly start new plan with hotspot as default
                  startNewPlan('hotspot', 'create', null);
                }}
                onViewAnalytics={() => {
                  if (!isAuthenticated) {
                    toast.error('Please log in to view analytics');
                    return;
                  }
                  setShowAnalyticsTypeModal(true);
                }}
                onViewTemplates={() => {
                  if (!isAuthenticated) {
                    toast.error('Please log in to view templates');
                    return;
                  }
                  setViewMode("templates");
                }}
                onRefresh={() => fetchData(true)}
                theme={theme}
                isMobile={isMobile}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filters={activeFilters}
                onFilterChange={applyFilter}
                onClearFilters={clearFilters}
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </motion.div>
          )}

          {viewMode === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`min-h-screen p-3 sm:p-4 md:p-6 transition-colors duration-300 ${themeClasses.bg.primary}`}
            >
              <main className="max-w-6xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => {
                        setViewMode("list");
                        resetForm();
                        resetPricingHook();
                        resetTimeVariant();
                        setEditingPlan(null);
                        setValidationSummary([]);
                        setApiError(null);
                        setPriceCalculationResult(null);
                        setAvailabilityCheckResult(null);
                      }}
                      className={`mb-3 flex items-center text-sm ${themeClasses.text.secondary} hover:${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Plans
                    </button>
                    <h1 className={`text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 truncate`}>
                      {editingPlan ? "Edit Plan" : "Create New Plan"}
                    </h1>
                    <p className={`mt-1 text-sm sm:text-base ${themeClasses.text.secondary}`}>
                      {editingPlan ? "Update your internet plan details" : "Configure your new internet service plan"}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-auto">
                    {timeVariantState.is_active && (
                      <motion.button
                        onClick={() => {
                          const newTimeVariant = {
                            ...timeVariantState,
                            force_available: !timeVariantState.force_available
                          };
                          setTimeVariantState(newTimeVariant);
                        }}
                        className={`px-3 py-1 text-xs rounded-full flex items-center ${
                          timeVariantState.force_available
                            ? themeClasses.bg.success
                            : themeClasses.bg.warning
                        } ${
                          timeVariantState.force_available
                            ? themeClasses.text.success
                            : themeClasses.text.warning
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {timeVariantState.force_available ? 'Forced Available' : 'Time Restricted'}
                      </motion.button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg border ${
                    form.accessType === 'hotspot'
                      ? (theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200')
                      : form.accessType === 'pppoe'
                        ? (theme === 'dark' ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200')
                        : (theme === 'dark' ? 'bg-purple-900/20 border-purple-700' : 'bg-purple-50 border-purple-200')
                  }`}>
                    <div className="flex items-center">
                      {form.accessType === 'hotspot' ? (
                        <Wifi className="w-5 h-5 text-blue-600 mr-3" />
                      ) : form.accessType === 'pppoe' ? (
                        <Cable className="w-5 h-5 text-green-600 mr-3" />
                      ) : (
                        <Server className="w-5 h-5 text-purple-600 mr-3" />
                      )}
                      <div>
                        <span className="text-sm font-medium">
                          {form.accessType === 'hotspot' ? 'Hotspot Plan' :
                           form.accessType === 'pppoe' ? 'PPPoE Plan' : 'Dual Access Plan'}
                        </span>
                        <div className="text-xs mt-1 opacity-75">
                          {form.access_methods?.hotspot?.enabled && form.access_methods?.pppoe?.enabled
                            ? 'Both access methods enabled'
                            : form.access_methods?.hotspot?.enabled
                              ? 'Hotspot only'
                              : 'PPPoE only'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`text-sm font-medium ${themeClasses.text.primary}`}>Availability</span>
                        <div className={`text-xs mt-1 ${themeClasses.text.secondary}`}>
                          {timeVariantState.is_active
                            ? 'Time restricted'
                            : 'Available at all times'}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const newTimeVariant = {
                            ...timeVariantState,
                            is_active: !timeVariantState.is_active
                          };
                          setTimeVariantState(newTimeVariant);
                          if (newTimeVariant.is_active) {
                            setActiveTab("time_variant");
                          }
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                      >
                        {timeVariantState.is_active ? 'Disable' : 'Configure'}
                      </button>
                    </div>
                  </div>
                </div>

                {renderTabs()}

                <div className="space-y-4 lg:space-y-6">
                  {renderFormContent()}
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                  <motion.button
                    onClick={() => {
                      setViewMode("list");
                      resetForm();
                      resetPricingHook();
                      resetTimeVariant();
                      setEditingPlan(null);
                      setValidationSummary([]);
                      setApiError(null);
                      setPriceCalculationResult(null);
                      setAvailabilityCheckResult(null);
                    }}
                    className={`px-4 py-3 rounded-lg shadow-md ${themeClasses.button.secondary} flex-1 sm:flex-none text-sm sm:text-base`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>

                  <motion.button
                    onClick={() => editingPlan && calculatePrice(editingPlan.id)}
                    disabled={!editingPlan || isLoading || !isAuthenticated}
                    className={`px-4 py-3 rounded-lg shadow-md ${
                      theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                    } text-white flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base`}
                    whileHover={{ scale: editingPlan && isAuthenticated ? 1.05 : 1 }}
                    whileTap={{ scale: editingPlan && isAuthenticated ? 0.95 : 1 }}
                  >
                    <DollarSign className="w-4 h-4 mr-2 inline" />
                    Calculate Price
                  </motion.button>

                  <motion.button
                    onClick={savePlan}
                    disabled={!isFormValid || isLoading || !isAuthenticated}
                    className={`px-4 py-3 rounded-lg shadow-md flex items-center justify-center ${
                      isFormValid && !isLoading && isAuthenticated
                        ? themeClasses.button.success
                        : 'bg-gray-400 cursor-not-allowed dark:bg-gray-700'
                    } flex-1 sm:flex-none text-sm sm:text-base`}
                    whileHover={isFormValid && !isLoading && isAuthenticated ? { scale: 1.05 } : {}}
                    whileTap={isFormValid && !isLoading && isAuthenticated ? { scale: 0.95 } : {}}
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {editingPlan ? "Update Plan" : "Create Plan"}
                      </>
                    )}
                  </motion.button>
                </div>
              </main>
            </motion.div>
          )}

          {viewMode === "details" && renderPlanDetails()}
        </AnimatePresence>

        <AnalyticsTypeSelectionModal
          isOpen={showAnalyticsTypeModal}
          onClose={() => setShowAnalyticsTypeModal(false)}
          onSelect={handleAnalyticsSelect}
          plans={plans}
          theme={theme}
          isMobile={isMobile}
          isAuthenticated={isAuthenticated}
        />

        <MobileSuccessAlert
          message={mobileSuccessAlert.message}
          isVisible={mobileSuccessAlert.visible}
          onClose={() => setMobileSuccessAlert({ visible: false, message: "" })}
          theme={theme}
        />

        <ConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setPlanToDelete(null);
          }}
          onConfirm={deletePlan}
          title="Delete Plan"
          message={`Are you sure you want to delete "${planToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          theme={theme}
          isMobile={isMobile}
          isLoading={isLoading}
        />

        <LoadingOverlay
          isVisible={isLoading && viewMode === 'list'}
          message="Loading plans..."
          theme={theme}
        />

        <ToastContainer
          position={isMobile ? "top-center" : "top-right"}
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={theme}
          style={{
            fontSize: isMobile ? '12px' : '14px',
            width: isMobile ? '90%' : 'auto'
          }}
        />
      </div>
    </ErrorBoundary>
  );
};

export default PlanManagement;





