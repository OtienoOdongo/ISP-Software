






// src/components/Plans/CreatePlans_2.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Copy, Eye, ChevronDown, ChevronUp, X, Gift, Wifi, Star, Home, Briefcase,
  Server, Users, Download, Upload, Calendar, Zap, Shield, Clock, Save, Info, Timer, Crown,
  Cpu, HardDrive, Network, BarChart3, Gauge, Cable, UserCheck, Cloud, CloudRain, CloudSnow,
  CloudDrizzle, CloudLightning, CloudOff, Router, Check, Filter, AlertTriangle, DollarSign,
  Menu, Search, Settings, Package, TrendingUp, Clipboard, ClipboardCheck
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import MDEditor from "@uiw/react-md-editor";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../api";
import { useTheme } from "../../context/ThemeContext";

// Custom hook for form management with theme support
const useForm = (initialState) => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleNestedChange = useCallback((field, key, value) => {
    setForm(prev => ({ 
      ...prev, 
      [field]: { ...prev[field], [key]: value } 
    }));
  }, []);

  const validateField = useCallback((name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'name':
        if (!value.trim()) newErrors[name] = 'Plan name is required';
        else if (value.trim().length < 2) newErrors[name] = 'Plan name must be at least 2 characters';
        break;
      case 'price':
        if (form.planType === 'Paid' && (!value || parseFloat(value) <= 0)) {
          newErrors[name] = 'Price must be a positive number for paid plans';
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return !newErrors[name];
  }, [errors, form.planType]);

  return { 
    form, 
    setForm, 
    errors,
    setErrors,
    handleChange, 
    handleNestedChange,
    validateField
  };
};

// Utility functions with theme consideration
const formatNumber = (value, decimals = 2) => {
  const num = typeof value === "number" ? value : parseFloat(value) || 0;
  return num.toLocaleString(undefined, { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  });
};

const calculateRating = (purchases) => Math.min(5, Math.log10((purchases || 0) + 1) * 1.5);

const deepClone = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  return JSON.parse(JSON.stringify(obj));
};

// Memoized initial state to prevent unnecessary recreations
const getInitialFormState = () => ({
  planType: "Paid", 
  name: "", 
  price: "", 
  active: true,
  downloadSpeed: { value: "", unit: "Mbps" }, 
  uploadSpeed: { value: "", unit: "Mbps" },
  expiry: { value: "", unit: "Days" }, 
  dataLimit: { value: "", unit: "GB" },
  usageLimit: { value: "", unit: "Hours" }, 
  description: "", 
  category: "Residential",
  purchases: 0, 
  features: [], 
  restrictions: [], 
  createdAt: new Date().toISOString().split("T")[0],
  client_sessions: {},
  bandwidth_limit: 0,
  concurrent_connections: 1,
  priority_level: 4,
  router_specific: false,
  allowed_routers_ids: [],
  FUP_policy: "",
  FUP_threshold: 80,
});

// Memoized constants for better performance
const speedUnits = Object.freeze(["Kbps", "Mbps", "Gbps"]);
const expiryUnits = Object.freeze(["Days", "Months"]);
const dataUnits = Object.freeze(["GB", "TB", "Unlimited"]);
const usageUnits = Object.freeze(["Hours", "Unlimited"]);
const categories = Object.freeze(["Residential", "Business", "Promotional", "Enterprise"]);
const planTypes = Object.freeze(["Paid", "Free Trial"]);

const featuresOptions = Object.freeze([
  "Portable Router", "Multi-User Support", "Extended Range", "Solar-Powered Option",
  "24/7 Support", "Low Latency", "Prepaid Access", "High Priority Bandwidth", 
  "Multiple Device Support", "Static IP Address", "VPN Access", "Gaming Optimized", 
  "Streaming Optimized", "No Throttling", "Premium Routing"
]);

const restrictionsOptions = Object.freeze([
  "Resale Only in Designated Area", "No Refunds After Activation", "Max 20 Users per Plan",
  "Rural Use Only", "Requires Signal Booster", "Speed may be reduced after fair use threshold", 
  "Limited to specific router locations", "No torrenting or P2P allowed", 
  "Streaming limited to SD quality", "Business use only", "Non-transferable", 
  "Subject to fair usage policy", "Speed varies by location"
]);

const priorityOptions = Object.freeze([
  { value: 1, label: "Lowest", icon: CloudOff, color: "text-gray-500" },
  { value: 2, label: "Low", icon: CloudDrizzle, color: "text-blue-500" },
  { value: 3, label: "Medium", icon: CloudRain, color: "text-green-500" },
  { value: 4, label: "High", icon: Cloud, color: "text-yellow-500" },
  { value: 5, label: "Highest", icon: CloudSnow, color: "text-orange-500" },
  { value: 6, label: "Critical", icon: CloudLightning, color: "text-red-500" },
  { value: 7, label: "Premium", icon: Server, color: "text-purple-500" },
  { value: 8, label: "VIP", icon: Crown, color: "text-pink-500" },
]);

const bandwidthPresets = Object.freeze([
  { value: 1024, label: "1 Mbps" },
  { value: 2048, label: "2 Mbps" },
  { value: 5120, label: "5 Mbps" },
  { value: 10240, label: "10 Mbps" },
  { value: 20480, label: "20 Mbps" },
  { value: 51200, label: "50 Mbps" },
  { value: 102400, label: "100 Mbps" },
  { value: 0, label: "Unlimited" },
]);

const usageLimitPresets = Object.freeze([
  { hours: "168", days: "7", description: "Perfect for short trials or promotional offers.", icon: Gift },
  { hours: "240", days: "10", description: "Great for light residential use or testing.", icon: Home },
  { hours: "360", days: "15", description: "Ideal for small business or moderate use.", icon: Briefcase },
  { hours: "720", days: "30", description: "Standard for monthly residential or enterprise plans.", icon: Calendar },
  { hours: "1440", days: "60", description: "Extended duration for premium or heavy users.", icon: Server },
]);

// Utility functions
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const formatTime = (seconds) => {
  if (seconds <= 0) return "Expired";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

const formatBandwidth = (kbps) => {
  if (kbps === 0) return "Unlimited";
  if (kbps >= 1000) {
    return `${(kbps / 1000).toFixed(1)} Mbps`;
  }
  return `${kbps} Kbps`;
};

const safeObjectEntries = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return [];
  }
  return Object.entries(obj);
};

// Theme-aware styling functions
const getThemeClasses = (theme) => ({
  // Background classes matching AdminProfile
  bg: {
    primary: theme === 'dark' 
      ? 'bg-gradient-to-br from-gray-900 to-indigo-900' 
      : 'bg-gradient-to-br from-white to-indigo-50',
    card: theme === 'dark' 
      ? 'bg-gray-800/60 backdrop-blur-md' 
      : 'bg-white/80 backdrop-blur-md',
    secondary: theme === 'dark' 
      ? 'bg-gray-800/80 backdrop-blur-md' 
      : 'bg-white/80 backdrop-blur-md',
    // NEW: Solid backgrounds for dropdowns to ensure proper contrast
    dropdown: theme === 'dark' 
      ? 'bg-gray-800' 
      : 'bg-white',
  },
  // Text classes
  text: {
    primary: theme === 'dark' ? 'text-white' : 'text-gray-800',
    secondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    tertiary: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
  },
  // Border classes
  border: {
    light: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    medium: theme === 'dark' ? 'border-gray-600' : 'border-gray-300',
  },
  // Input classes matching AdminProfile pattern
  input: theme === 'dark' 
    ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500'
    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500',
  // Button classes
  button: {
    primary: theme === 'dark' 
      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
      : 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: theme === 'dark'
      ? 'bg-gray-700 hover:bg-gray-600 text-white'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    success: theme === 'dark'
      ? 'bg-green-600 hover:bg-green-700 text-white'
      : 'bg-green-600 hover:bg-green-700 text-white',
    danger: theme === 'dark'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-red-600 hover:bg-red-700 text-white',
  }
});

// Mobile-friendly Confirmation Modal
const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  type = "danger"
}) => {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`w-full max-w-md rounded-xl shadow-lg ${themeClasses.bg.card} ${themeClasses.border.light} border p-6`}
      >
        <div className="flex items-center mb-4">
          <div className={`p-2 rounded-full ${
            type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className={`ml-3 text-lg font-semibold ${themeClasses.text.primary}`}>
            {title}
          </h3>
        </div>
        
        <p className={`mb-6 ${themeClasses.text.secondary}`}>
          {message}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              theme === 'dark' 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
              type === 'danger' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Enhanced Responsive Dropdown Component with improved mobile support
const ResponsiveDropdown = ({ 
  isOpen, 
  onToggle, 
  children, 
  trigger, 
  position = "left",
  className = "",
  mobileFullWidth = true,
  maxHeight = "max-h-96"
}) => {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div className={`relative ${className}`}>
      {/* Trigger */}
      <div onClick={onToggle} className="cursor-pointer">
        {trigger}
      </div>

      {/* Dropdown Content */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={onToggle}
            />
            
            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`
                fixed lg:absolute z-50 mt-2 rounded-lg shadow-lg border
                ${themeClasses.bg.dropdown} ${themeClasses.border.light} ${themeClasses.text.primary}
                ${position === 'right' ? 'right-2 lg:right-0' : 'left-2 lg:left-0'}
                ${mobileFullWidth 
                  ? 'w-[calc(100vw-2rem)] lg:w-auto lg:min-w-[200px]' 
                  : 'min-w-[200px]'
                }
                ${maxHeight} overflow-y-auto
                max-w-[calc(100vw-2rem)]
              `}
              style={{
                maxHeight: 'calc(100vh - 120px)'
              }}
            >
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ENHANCED: Improved EnhancedSelect Component with better theme handling
const EnhancedSelect = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select an option",
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  const selectedOption = options.find(opt => opt.value === value) || 
                       options.find(opt => opt === value);

  return (
    <ResponsiveDropdown
      isOpen={isOpen}
      onToggle={() => !disabled && setIsOpen(!isOpen)}
      trigger={
        <div className={`
          flex items-center justify-between w-full px-3 py-2 rounded-lg border text-sm
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          ${themeClasses.input} ${className}
        `}>
          <span className="truncate text-sm">
            {selectedOption ? (selectedOption.label || selectedOption) : placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${themeClasses.text.tertiary}`} />
        </div>
      }
      mobileFullWidth={true}
      maxHeight="max-h-60"
    >
      <div className="py-1 max-h-60 overflow-y-auto">
        {options.map((option, index) => {
          const optionValue = option.value || option;
          const optionLabel = option.label || option;
          const isSelected = value === optionValue;
          
          return (
            <div
              key={index}
              onClick={() => {
                onChange(optionValue);
                setIsOpen(false);
              }}
              className={`
                px-3 py-2 cursor-pointer transition-colors text-sm
                ${isSelected 
                  ? 'bg-indigo-600 text-white' 
                  : `${themeClasses.text.primary} ${
                      theme === 'dark'
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-gray-100'
                    }`
                }
              `}
            >
              {optionLabel}
            </div>
          );
        })}
      </div>
    </ResponsiveDropdown>
  );
};

// Mobile-friendly Preset Dropdown Component
const PresetDropdown = ({ 
  isOpen, 
  onToggle, 
  presets, 
  onSelect, 
  triggerText,
  type = "usage"
}) => {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <ResponsiveDropdown
      isOpen={isOpen}
      onToggle={onToggle}
      trigger={
        <motion.button 
          className={`px-3 py-2 text-sm rounded-lg border flex items-center space-x-2 ${themeClasses.input}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-xs sm:text-sm">{triggerText}</span>
          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
        </motion.button>
      }
      mobileFullWidth={true}
      maxHeight="max-h-80"
    >
      <div className="p-2">
        <div className={`text-xs font-medium px-2 py-1 border-b mb-1 ${themeClasses.border.light} ${themeClasses.text.secondary}`}>
          {type === "usage" ? "Usage Limit Presets" : "Bandwidth Presets"}
        </div>
        <div className="max-h-60 overflow-y-auto">
          {presets.map((preset, index) => {
            const IconComponent = preset.icon;
            const displayValue = type === "usage" ? preset.hours : preset.value;
            const displayLabel = type === "usage" ? `${preset.days} Days (${preset.hours} Hours)` : preset.label;
            
            return (
              <div
                key={index}
                onClick={() => onSelect(displayValue)}
                className={`p-2 hover:bg-opacity-50 cursor-pointer flex items-start space-x-2 rounded-lg mb-1 ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
              >
                {IconComponent && <IconComponent className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${themeClasses.text.primary}`}>
                    {displayLabel}
                  </p>
                  {preset.description && (
                    <p className={`text-xs mt-0.5 ${themeClasses.text.secondary} line-clamp-2`}>
                      {preset.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ResponsiveDropdown>
  );
};

// Mobile Success Alert Component
const MobileSuccessAlert = ({ message, isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-4"
    >
      <div className="bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center justify-between">
        <div className="flex items-center">
          <Check className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">{message}</span>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-green-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

// FIXED: CategoryDropdown with proper theme handling
const CategoryDropdown = ({ 
  value, 
  onChange, 
  className = "", 
  availableCategories = categories, 
  includeAll = true 
}) => {
  const { theme } = useTheme();

  // Prepare options based on whether to include "All" option
  const categoryOptions = includeAll 
    ? [{ value: "All", label: "All Categories" }, ...availableCategories.map(cat => ({ value: cat, label: cat }))]
    : availableCategories.map(cat => ({ value: cat, label: cat }));

  return (
    <EnhancedSelect
      value={value}
      onChange={onChange}
      options={categoryOptions}
      placeholder={includeAll ? "All Categories" : "Select Category"}
      className={className}
    />
  );
};

const CreatePlans = () => {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  
  const { form, setForm, errors, setErrors, handleChange, handleNestedChange, validateField } = useForm(getInitialFormState());
  const [plans, setPlans] = useState([]);
  const [routers, setRouters] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [analytics, setAnalytics] = useState({
    total_subscriptions: 0,
    active_subscriptions: 0,
    total_revenue: 0,
    status_counts: {},
    plans: [],
    recent_subscriptions: []
  });
  const [compatibleRouters, setCompatibleRouters] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isFetchingSubs, setIsFetchingSubs] = useState(false);
  const [isFetchingAnalytics, setIsFetchingAnalytics] = useState(false);
  const [isFetchingRouters, setIsFetchingRouters] = useState(false);
  const [isFetchingCompatible, setIsFetchingCompatible] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [editingPlan, setEditingPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [newFeature, setNewFeature] = useState("");
  const [newRestriction, setNewRestriction] = useState("");
  const [isUsageMenuOpen, setIsUsageMenuOpen] = useState(false);
  const [isBandwidthMenuOpen, setIsBandwidthMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [subscriptionFilters, setSubscriptionFilters] = useState({
    status: "",
    plan: "",
    router: ""
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copiedPlanId, setCopiedPlanId] = useState(null);
  
  // Mobile-friendly states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [mobileSuccessAlert, setMobileSuccessAlert] = useState({ visible: false, message: "" });

  // Memoized used categories from existing plans (for filter only)
  const usedCategories = useMemo(() => {
    return [...new Set(plans.map(p => p.category).filter(Boolean))];
  }, [plans]);

  // For filter: use used categories if available, else all
  const availableCategoriesForFilter = useMemo(() => 
    usedCategories.length > 0 ? usedCategories : categories, [usedCategories]
  );

  // For form: always use all four categories
  const availableCategoriesForForm = categories;

  // Show mobile success alert
  const showMobileSuccess = useCallback((message) => {
    setMobileSuccessAlert({ visible: true, message });
    setTimeout(() => {
      setMobileSuccessAlert({ visible: false, message: "" });
    }, 3000);
  }, []);

  // Calculate form validity for Create Plan button
  const isFormValid = useMemo(() => {
    const requiredFields = [
      form.name?.trim(),
      form.downloadSpeed.value,
      form.uploadSpeed.value,
      form.expiry.value,
      form.dataLimit.value,
      form.usageLimit.value,
      form.description?.trim()
    ];

    // Check if all required fields are filled
    const allRequiredFilled = requiredFields.every(field => field && field.toString().trim() !== '');

    // Check if there are no validation errors
    const noErrors = Object.keys(errors).length === 0;

    // For paid plans, price must be valid
    const priceValid = form.planType !== "Paid" || (form.price && parseFloat(form.price) > 0);

    return allRequiredFilled && noErrors && priceValid;
  }, [form, errors]);

  // Memoized filtered and sorted plans for better performance
  const sortedPlans = useMemo(() => {
    if (!plans.length) return [];
    
    const filtered = plans.filter(
      (plan) =>
        (filterCategory === "All" || plan.category === filterCategory) &&
        (plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plan.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return filtered.sort((a, b) => {
      let aValue, bValue;
      if (sortConfig.key.includes(".")) {
        const [parent, child] = sortConfig.key.split(".");
        aValue = a[parent] ? a[parent][child] : "";
        bValue = b[parent] ? b[parent][child] : "";
      } else {
        aValue = a[sortConfig.key] || "";
        bValue = b[sortConfig.key] || "";
      }
      
      if (!isNaN(parseFloat(aValue)) && !isNaN(parseFloat(bValue))) {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }
      
      return sortConfig.direction === "asc"
        ? typeof aValue === "string"
          ? aValue.localeCompare(bValue)
          : aValue - bValue
        : typeof bValue === "string"
          ? bValue.localeCompare(aValue)
          : bValue - aValue;
    });
  }, [plans, filterCategory, searchTerm, sortConfig]);

  // Data fetching effects
  useEffect(() => {
    const fetchPlans = async () => {
      setIsFetching(true);
      try {
        const response = await api.get("/api/internet_plans/");
        const plansData = response.data.results || response.data;
        if (!Array.isArray(plansData)) throw new Error("Expected an array of plans");
        const normalizedPlans = plansData.map((plan) => ({
          ...getInitialFormState(),
          id: plan.id,
          planType: plan.planType || plan.plan_type,
          name: plan.name,
          price: plan.price.toString(),
          active: plan.active,
          downloadSpeed: { value: plan.downloadSpeed?.value || "", unit: plan.downloadSpeed?.unit || "Mbps" },
          uploadSpeed: { value: plan.uploadSpeed?.value || "", unit: plan.uploadSpeed?.unit || "Mbps" },
          expiry: { value: plan.expiry?.value || "", unit: plan.expiry?.unit || "Days" },
          dataLimit: { value: plan.dataLimit?.value || "", unit: plan.dataLimit?.unit || "GB" },
          usageLimit: { value: plan.usageLimit?.value || "", unit: plan.usageLimit?.unit || "Hours" },
          description: plan.description,
          category: plan.category,
          purchases: plan.purchases,
          features: Array.isArray(plan.features) ? plan.features : [],
          restrictions: Array.isArray(plan.restrictions) ? plan.restrictions : [],
          createdAt: plan.created_at || plan.createdAt,
          client_sessions: plan.client_sessions || {},
          bandwidth_limit: plan.bandwidth_limit || 0,
          concurrent_connections: plan.concurrent_connections || 1,
          priority_level: plan.priority_level || 4,
          router_specific: plan.router_specific || false,
          allowed_routers_ids: plan.allowed_routers_ids || [],
          FUP_policy: plan.FUP_policy || "",
          FUP_threshold: plan.FUP_threshold || 80,
          bandwidth_limit_display: plan.bandwidth_limit_display || formatBandwidth(plan.bandwidth_limit || 0),
          is_unlimited_data: plan.is_unlimited_data || false,
          is_unlimited_time: plan.is_unlimited_time || false,
        }));
        setPlans(normalizedPlans);
      } catch (error) {
        console.error("Error fetching plans:", error);
        if (window.innerWidth <= 768) {
          showMobileSuccess("Failed to load plans from server");
        } else {
          toast.error("Failed to load plans from server.");
        }
        setPlans([]);
      } finally {
        setIsFetching(false);
      }
    };
    fetchPlans();
  }, [showMobileSuccess]);

  useEffect(() => {
    const fetchRouters = async () => {
      setIsFetchingRouters(true);
      try {
        const response = await api.get("/api/network_management/routers/");
        setRouters(response.data);
      } catch (error) {
        console.error("Error fetching routers:", error);
        if (window.innerWidth <= 768) {
          showMobileSuccess("Failed to load routers");
        } else {
          toast.error("Failed to load routers from server.");
        }
        setRouters([]);
      } finally {
        setIsFetchingRouters(false);
      }
    };
    
    if (viewMode === "form" || viewMode === "subscriptions" || viewMode === "details") {
      fetchRouters();
    }
  }, [viewMode, showMobileSuccess]);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setIsFetchingSubs(true);
      try {
        let url = "/api/internet_plans/subscriptions/";
        const params = new URLSearchParams();
        
        if (subscriptionFilters.status) params.append('status', subscriptionFilters.status);
        if (subscriptionFilters.plan) params.append('plan', subscriptionFilters.plan);
        if (subscriptionFilters.router) params.append('router', subscriptionFilters.router);
        
        if (params.toString()) url += `?${params.toString()}`;
        
        const response = await api.get(url);
        const subsData = response.data;
        if (!Array.isArray(subsData)) throw new Error("Expected an array of subscriptions");
        setSubscriptions(subsData);
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
        if (window.innerWidth <= 768) {
          showMobileSuccess("Failed to load subscriptions");
        } else {
          toast.error("Failed to load subscriptions from server.");
        }
        setSubscriptions([]);
      } finally {
        setIsFetchingSubs(false);
      }
    };
    if (viewMode === "subscriptions") {
      fetchSubscriptions();
    }
  }, [viewMode, subscriptionFilters, showMobileSuccess]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsFetchingAnalytics(true);
      try {
        const response = await api.get("/api/internet_plans/subscription-analytics/");
        setAnalytics(response.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        if (window.innerWidth <= 768) {
          showMobileSuccess("Failed to load analytics");
        } else {
          toast.error("Failed to load analytics from server.");
        }
        setAnalytics({
          total_subscriptions: 0,
          active_subscriptions: 0,
          total_revenue: 0,
          status_counts: {},
          plans: [],
          recent_subscriptions: []
        });
      } finally {
        setIsFetchingAnalytics(false);
      }
    };
    if (viewMode === "analytics") {
      fetchAnalytics();
    }
  }, [viewMode, showMobileSuccess]);

  useEffect(() => {
    const fetchCompatibleRouters = async () => {
      if (!selectedPlan?.id || !selectedPlan.router_specific) return;
      setIsFetchingCompatible(true);
      try {
        const response = await api.get(`/api/internet_plans/${selectedPlan.id}/compatible-routers/`);
        setCompatibleRouters(response.data);
      } catch (error) {
        console.error("Error fetching compatible routers:", error);
        if (window.innerWidth <= 768) {
          showMobileSuccess("Failed to load compatible routers");
        } else {
          toast.error("Failed to load compatible routers.");
        }
        setCompatibleRouters([]);
      } finally {
        setIsFetchingCompatible(false);
      }
    };
    if (viewMode === "details") {
      fetchCompatibleRouters();
    }
  }, [viewMode, selectedPlan, showMobileSuccess]);

  // Form validation effects
  useEffect(() => {
    if (form.planType === "Free Trial" && form.price !== "0") {
      setForm((prev) => ({ ...prev, price: "0" }));
    }
  }, [form.planType, setForm]);

  useEffect(() => {
    if (form.dataLimit.unit === "Unlimited") {
      handleNestedChange("dataLimit", "value", "Unlimited");
    }
  }, [form.dataLimit.unit, handleNestedChange]);

  useEffect(() => {
    if (form.usageLimit.unit === "Unlimited") {
      handleNestedChange("usageLimit", "value", "Unlimited");
    }
  }, [form.usageLimit.unit, handleNestedChange]);

  // Event handlers with useCallback for performance
  const addFeature = useCallback(() => {
    if (newFeature && !form.features.includes(newFeature)) {
      setForm((prev) => {
        const updatedFeatures = [...prev.features, newFeature];
        return { ...prev, features: updatedFeatures };
      });
      setNewFeature("");
    }
  }, [newFeature, form.features, setForm]);

  const addRestriction = useCallback(() => {
    if (newRestriction && !form.restrictions.includes(newRestriction)) {
      setForm((prev) => {
        const updatedRestrictions = [...prev.restrictions, newRestriction];
        return { ...prev, restrictions: updatedRestrictions };
      });
      setNewRestriction("");
    }
  }, [newRestriction, form.restrictions, setForm]);

  const removeListItem = useCallback((list, item) => {
    setForm((prev) => {
      const updatedList = prev[list].filter((i) => i !== item);
      return { ...prev, [list]: updatedList };
    });
  }, [setForm]);

  const toggleRouterSelection = useCallback((routerId) => {
    setForm((prev) => {
      const currentRouters = [...prev.allowed_routers_ids];
      const index = currentRouters.indexOf(routerId);
      
      if (index > -1) {
        currentRouters.splice(index, 1);
      } else {
        currentRouters.push(routerId);
      }
      
      return { ...prev, allowed_routers_ids: currentRouters };
    });
  }, [setForm]);

  const requestSort = useCallback((key) => {
    setSortConfig({ 
      key, 
      direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc" 
    });
  }, [sortConfig]);

  // Enhanced Copy Plan functionality
  const copyPlanToClipboard = useCallback(async (plan) => {
    try {
      // Create a simplified version of the plan for clipboard
      const planSummary = {
        name: plan.name,
        type: plan.planType,
        category: plan.category,
        price: plan.planType === "Paid" ? `Ksh ${formatNumber(plan.price)}` : "Free",
        download: `${plan.downloadSpeed.value} ${plan.downloadSpeed.unit}`,
        upload: `${plan.uploadSpeed.value} ${plan.uploadSpeed.unit}`,
        dataLimit: `${plan.dataLimit.value} ${plan.dataLimit.unit}`,
        usageLimit: `${plan.usageLimit.value} ${plan.usageLimit.unit}`,
        expiry: `${plan.expiry.value} ${plan.expiry.unit}`,
        bandwidth: formatBandwidth(plan.bandwidth_limit),
        features: plan.features.slice(0, 3).join(', '), // First 3 features
        subscribers: plan.purchases
      };

      const textContent = `Plan: ${planSummary.name}
Type: ${planSummary.type}
Category: ${planSummary.category}
Price: ${planSummary.price}
Download: ${planSummary.download}
Upload: ${planSummary.upload}
Data: ${planSummary.dataLimit}
Usage: ${planSummary.usageLimit}
Expiry: ${planSummary.expiry}
Bandwidth: ${planSummary.bandwidth}
Key Features: ${planSummary.features}
Subscribers: ${planSummary.subscribers}`;

      await navigator.clipboard.writeText(textContent);
      setCopiedPlanId(plan.id);
      
      if (window.innerWidth <= 768) {
        showMobileSuccess(`Plan "${plan.name}" details copied!`);
      } else {
        toast.success(`Plan "${plan.name}" details copied to clipboard!`);
      }
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopiedPlanId(null), 2000);
    } catch (error) {
      console.error('Failed to copy plan details:', error);
      if (window.innerWidth <= 768) {
        showMobileSuccess("Failed to copy plan details");
      } else {
        toast.error('Failed to copy plan details to clipboard');
      }
    }
  }, [showMobileSuccess]);

  // Quick duplicate plan function
  const quickDuplicatePlan = useCallback((plan) => {
    const duplicatedPlan = {
      ...deepClone(plan),
      name: `${plan.name} (Copy)`,
      id: null,
      purchases: 0,
      client_sessions: {},
      createdAt: new Date().toISOString().split("T")[0],
      active: true // Reset to active by default for duplicates
    };
    
    setForm(duplicatedPlan);
    setEditingPlan(null);
    setActiveTab("basic");
    setViewMode("form");
    
    if (window.innerWidth <= 768) {
      showMobileSuccess(`Ready to create duplicate of "${plan.name}"`);
    } else {
      toast.success(`Ready to create duplicate of "${plan.name}"`);
    }
  }, [setForm, setEditingPlan, setActiveTab, setViewMode, showMobileSuccess]);

  // Mobile-friendly delete confirmation
  const confirmDelete = useCallback((plan) => {
    setPlanToDelete(plan);
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!planToDelete) return;
    
    try {
      await api.delete(`/api/internet_plans/${planToDelete.id}/`);
      setPlans((prev) => prev.filter((p) => p.id !== planToDelete.id));
      if (selectedPlan && selectedPlan.id === planToDelete.id) {
        setSelectedPlan(null);
        setViewMode("list");
      }
      
      if (window.innerWidth <= 768) {
        showMobileSuccess(`Deleted plan: ${planToDelete.name}`);
      } else {
        toast.success(`Deleted plan: ${planToDelete.name}`);
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
      if (window.innerWidth <= 768) {
        showMobileSuccess(`Failed to delete plan: ${planToDelete.name}`);
      } else {
        toast.error(`Failed to delete plan: ${error.response?.data?.detail || error.message}`);
      }
    } finally {
      setDeleteModalOpen(false);
      setPlanToDelete(null);
    }
  }, [planToDelete, selectedPlan, showMobileSuccess]);

  const validateAndSavePlan = async () => {
    if (!isFormValid) {
      if (window.innerWidth <= 768) {
        showMobileSuccess("Please complete all required fields");
      } else {
        toast.error("Please complete all required fields before saving.");
      }
      return;
    }

    const newErrors = {};
    
    // Comprehensive validation
    if (!form.planType) newErrors.planType = "Plan type is required";
    if (!form.name?.trim()) newErrors.name = "Plan name is required";
    if (!form.category) newErrors.category = "Category is required";
    
    if (form.planType === "Paid") {
      const price = parseFloat(form.price);
      if (!form.price || isNaN(price) || price <= 0) {
        newErrors.price = "Price must be a positive number for paid plans";
      }
    }
    
    if (!form.downloadSpeed.value) newErrors.downloadSpeed = "Download speed is required";
    if (!form.uploadSpeed.value) newErrors.uploadSpeed = "Upload speed is required";
    if (!form.expiry.value) newErrors.expiry = "Expiry duration is required";
    if (!form.dataLimit.value) newErrors.dataLimit = "Data limit is required";
    if (!form.usageLimit.value) newErrors.usageLimit = "Usage limit is required";
    if (!form.description?.trim()) newErrors.description = "Description is required";

    // Numeric validations
    const downloadSpeed = parseFloat(form.downloadSpeed.value);
    const uploadSpeed = parseFloat(form.uploadSpeed.value);
    const expiry = parseInt(form.expiry.value, 10);

    if (isNaN(downloadSpeed) || downloadSpeed <= 0) {
      newErrors.downloadSpeed = "Download speed must be a positive number";
    }
    if (isNaN(uploadSpeed) || uploadSpeed <= 0) {
      newErrors.uploadSpeed = "Upload speed must be a positive number";
    }
    if (isNaN(expiry) || expiry <= 0) {
      newErrors.expiry = "Expiry duration must be a positive integer";
    }

    // Data limit validation
    if (form.dataLimit.unit === "Unlimited" && form.dataLimit.value !== "Unlimited") {
      newErrors.dataLimit = "When data unit is Unlimited, value must be 'Unlimited'";
    } else if (form.dataLimit.unit !== "Unlimited") {
      const dataValue = parseFloat(form.dataLimit.value);
      if (isNaN(dataValue) || dataValue <= 0) {
        newErrors.dataLimit = "Data limit must be a positive number";
      }
    }

    // Usage limit validation
    if (form.usageLimit.unit === "Unlimited" && form.usageLimit.value !== "Unlimited") {
      newErrors.usageLimit = "When usage unit is Unlimited, value must be 'Unlimited'";
    } else if (form.usageLimit.unit !== "Unlimited") {
      const usageValue = parseFloat(form.usageLimit.value);
      if (isNaN(usageValue) || usageValue <= 0) {
        newErrors.usageLimit = "Usage limit must be a positive number";
      }
    }

    // Free trial specific validations
    if (form.planType === "Free Trial") {
      if (parseFloat(form.price) !== 0) {
        newErrors.price = "Free Trial plans must have price set to 0";
      }
      if (form.router_specific) {
        newErrors.router_specific = "Free Trial plans cannot be router-specific";
      }
      if (form.priority_level > 4) {
        newErrors.priority_level = "Free Trial plans cannot have premium priority levels";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      if (window.innerWidth <= 768) {
        showMobileSuccess("Please fix validation errors");
      } else {
        toast.error("Please fix the validation errors before saving.");
      }
      return;
    }

    // Prepare data for API
    const planData = {
      planType: form.planType,
      name: form.name.trim(),
      price: parseFloat(form.price) || 0,
      active: form.active,
      downloadSpeed: form.downloadSpeed,
      uploadSpeed: form.uploadSpeed,
      expiry: form.expiry,
      dataLimit: form.dataLimit,
      usageLimit: form.usageLimit,
      description: form.description.trim(),
      category: form.category,
      purchases: editingPlan ? editingPlan.purchases : 0,
      features: form.features,
      restrictions: form.restrictions,
      createdAt: editingPlan ? editingPlan.createdAt : new Date().toISOString().split("T")[0],
      client_sessions: editingPlan ? editingPlan.client_sessions : {},
      bandwidth_limit: form.bandwidth_limit,
      concurrent_connections: form.concurrent_connections,
      priority_level: form.priority_level,
      router_specific: form.router_specific,
      allowed_routers_ids: form.router_specific ? form.allowed_routers_ids : [],
      FUP_policy: form.FUP_policy,
      FUP_threshold: form.FUP_threshold,
    };

    try {
      let response;
      if (editingPlan) {
        response = await api.put(`/api/internet_plans/${editingPlan.id}/`, planData);
        setPlans((prev) => prev.map((p) => (p.id === editingPlan.id ? { ...p, ...response.data } : p)));
        
        if (window.innerWidth <= 768) {
          showMobileSuccess(`Updated plan: ${planData.name}`);
        } else {
          toast.success(`Updated plan: ${planData.name}`);
        }
      } else {
        response = await api.post("/api/internet_plans/", planData);
        setPlans((prev) => [...prev, response.data]);
        
        if (window.innerWidth <= 768) {
          showMobileSuccess(`Created plan: ${planData.name}`);
        } else {
          toast.success(`Created plan: ${planData.name}`);
        }
      }
      setForm(deepClone(getInitialFormState()));
      setEditingPlan(null);
      setViewMode("list");
      setErrors({});
    } catch (error) {
      console.error("Error saving plan:", error.response?.data || error.message);
      const errorDetails = error.response?.data?.details || error.response?.data || error.message;
      
      if (window.innerWidth <= 768) {
        showMobileSuccess(`Failed to ${editingPlan ? "update" : "create"} plan`);
      } else {
        toast.error(`Failed to ${editingPlan ? "update" : "create"} plan: ${JSON.stringify(errorDetails)}`);
      }
    }
  };

  const activatePlanOnRouter = async (planId, routerId) => {
    try {
      const response = await api.post(`/api/internet_plans/${planId}/activate-on-router/${routerId}/`);
      
      if (window.innerWidth <= 768) {
        showMobileSuccess("Plan activated successfully");
      } else {
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error("Error activating plan on router:", error);
      
      if (window.innerWidth <= 768) {
        showMobileSuccess("Failed to activate plan");
      } else {
        toast.error(`Failed to activate: ${error.response?.data?.error || error.message}`);
      }
    }
  };

  const handleUsagePresetSelect = useCallback((hours) => {
    handleNestedChange("usageLimit", "value", hours);
    handleNestedChange("usageLimit", "unit", "Hours");
    setIsUsageMenuOpen(false);
  }, [handleNestedChange]);

  const handleBandwidthPresetSelect = useCallback((value) => {
    setForm((prev) => ({ ...prev, bandwidth_limit: value }));
    setIsBandwidthMenuOpen(false);
  }, [setForm]);

  const handleSubscriptionFilterChange = useCallback((filter, value) => {
    setSubscriptionFilters((prev) => ({ ...prev, [filter]: value }));
  }, []);

  // Helper functions
  const getCategoryIcon = useCallback((category) => {
    const icons = {
      Residential: <Home className="w-4 h-4 text-teal-600" />,
      Business: <Briefcase className="w-4 h-4 text-emerald-600" />,
      Promotional: <Gift className="w-4 h-4 text-purple-600" />,
      Enterprise: <Server className="w-4 h-4 text-indigo-600" />,
    };
    return icons[category] || null;
  }, []);

  const getPriorityIcon = useCallback((level) => {
    const option = priorityOptions.find(opt => opt.value === level);
    if (!option) return null;
    const IconComponent = option.icon;
    return <IconComponent className={`w-4 h-4 ${option.color}`} />;
  }, []);

  const renderStars = useCallback((purchases) => {
    const rating = calculateRating(purchases);
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-3 h-3 lg:w-4 lg:h-4 ${i < Math.round(rating) 
              ? "text-amber-400 fill-current" 
              : theme === 'dark' ? "text-gray-600" : "text-gray-300"}`} 
          />
        ))}
        <span className={`ml-1 text-xs ${themeClasses.text.secondary}`}>
          {rating.toFixed(1)}
        </span>
      </div>
    );
  }, [theme, themeClasses.text.secondary]);

  // Enhanced dropdown components for mobile responsiveness
  const renderUnitDropdown = (field, value, onChange, units, className = "") => (
    <EnhancedSelect
      value={value}
      onChange={(newValue) => onChange(field, "unit", newValue)}
      options={units.map(unit => ({ value: unit, label: unit }))}
      className={`text-xs ${className}`}
    />
  );

  // Enhanced Copy button with dropdown functionality
  const renderCopyDropdown = (plan) => (
    <ResponsiveDropdown
      isOpen={isMobileMenuOpen && copiedPlanId === plan.id}
      onToggle={() => setCopiedPlanId(copiedPlanId === plan.id ? null : plan.id)}
      trigger={
        <motion.button 
          className="focus:outline-none p-1" 
          animate={{ scale: [1, 1.1, 1] }} 
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Copy className="w-3 h-3 lg:w-4 lg:h-4 text-orange-600 hover:text-orange-800" />
        </motion.button>
      }
      position="right"
    >
      <div className="p-2 w-48">
        <div className="space-y-1">
          <button
            onClick={() => {
              copyPlanToClipboard(plan);
              setCopiedPlanId(null);
            }}
            className="w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Clipboard className="w-4 h-4" />
            <span>Copy Plan Details</span>
          </button>
          <button
            onClick={() => {
              quickDuplicatePlan(plan);
              setCopiedPlanId(null);
            }}
            className="w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Copy className="w-4 h-4" />
            <span>Duplicate Plan</span>
          </button>
        </div>
      </div>
    </ResponsiveDropdown>
  );

  // Main render functions
  const renderPlanList = () => (
    <div className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${themeClasses.bg.primary}`}>
      <main className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 lg:gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 truncate">
              Internet Plans Management
            </h1>
            <p className={`mt-1 lg:mt-2 text-sm lg:text-lg ${themeClasses.text.secondary}`}>
              Create and manage your internet service plans
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 lg:gap-3 w-full md:w-auto justify-start md:justify-end">
            <motion.button
              onClick={() => { setViewMode("analytics"); }}
              className={`px-3 py-2 lg:px-4 lg:py-2 rounded-lg shadow-md flex items-center justify-center text-xs lg:text-sm ${themeClasses.button.primary}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BarChart3 className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              <span>Analytics</span>
            </motion.button>
            
            <motion.button
              onClick={() => { setViewMode("subscriptions"); }}
              className={`px-3 py-2 lg:px-4 lg:py-2 rounded-lg shadow-md flex items-center justify-center text-xs lg:text-sm ${themeClasses.button.primary}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Users className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              <span>Subscriptions</span>
            </motion.button>
            
            <motion.button
              onClick={() => { 
                setForm(deepClone(getInitialFormState())); 
                setEditingPlan(null); 
                setActiveTab("basic");
                setViewMode("form"); 
              }}
              className={`px-3 py-2 lg:px-4 lg:py-2 rounded-lg shadow-md flex items-center justify-center text-xs lg:text-sm ${themeClasses.button.success}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              <span>New Plan</span>
            </motion.button>
          </div>
        </div>

        {/* Filters Section - FIXED CATEGORY DROPDOWN */}
        <div className={`p-4 lg:p-6 rounded-xl shadow-lg ${themeClasses.bg.card}`}>
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
            {/* Category Filter - UPDATED WITH createplans_1 LOGIC */}
            <div className="w-full sm:w-40 lg:w-48">
              <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                Category
              </label>
              <CategoryDropdown
                value={filterCategory}
                onChange={setFilterCategory}
                className="w-full"
                availableCategories={availableCategoriesForFilter}
                includeAll={true}
              />
            </div>
            
            <div className="relative flex-1">
              <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                Search Plans
              </label>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 ${themeClasses.text.tertiary}`} />
                <input
                  type="text" 
                  placeholder="Search plans..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 lg:pl-10 pr-4 py-2 rounded-lg shadow-sm text-sm lg:text-base ${themeClasses.input}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Plans Table */}
        {isFetching ? (
          <div className={`flex justify-center items-center py-12 rounded-xl ${themeClasses.bg.card}`}>
            <FaSpinner className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : plans.length === 0 ? (
          <div className={`rounded-xl shadow-lg p-6 lg:p-8 text-center ${themeClasses.bg.card}`}>
            <Package className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-3 lg:mb-4" />
            <h3 className="text-lg lg:text-xl font-semibold mb-2">No Plans Available</h3>
            <p className={`mb-4 lg:mb-6 text-sm lg:text-base ${themeClasses.text.secondary}`}>
              Create your first internet plan to get started!
            </p>
            <motion.button
              onClick={() => setViewMode("form")}
              className={`px-4 py-2 lg:px-6 lg:py-3 rounded-lg shadow-md text-sm lg:text-base ${themeClasses.button.primary}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2" />
              Create Your First Plan
            </motion.button>
          </div>
        ) : (
          <div className={`rounded-xl shadow-lg overflow-hidden ${themeClasses.bg.card}`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y text-sm">
                <thead className={theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}>
                  <tr>
                    {[
                      { key: "name", label: "Plan Name" }, 
                      { key: "planType", label: "Type" },
                      { key: "category", label: "Category" }, 
                      { key: "price", label: "Price" },
                      { key: "bandwidth_limit", label: "Bandwidth" }, 
                      { key: "purchases", label: "Subscribers" },
                      { key: "actions", label: "Actions" },
                    ].map((column) => (
                      <th
                        key={column.key} 
                        onClick={() => column.key !== "actions" && requestSort(column.key)}
                        className={`px-3 py-2 lg:px-4 lg:py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          column.key !== "actions" ? "cursor-pointer hover:text-indigo-600" : ""
                        } ${themeClasses.text.secondary}`}
                      >
                        <div className="flex items-center">
                          <span className="truncate">{column.label}</span>
                          {sortConfig.key === column.key && (
                            sortConfig.direction === "asc" ? 
                              <ChevronUp className="ml-1 w-3 h-3 lg:w-4 lg:h-4" /> : 
                              <ChevronDown className="ml-1 w-3 h-3 lg:w-4 lg:h-4" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y text-sm ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {sortedPlans.map((plan) => (
                    <tr 
                      key={plan.id} 
                      className={`hover:${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                    >
                      <td className="px-3 py-3 lg:px-4 lg:py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getCategoryIcon(plan.category)}
                          <span className={`ml-2 text-sm font-medium truncate max-w-[120px] lg:max-w-none ${themeClasses.text.primary}`}>
                            {plan.name}
                          </span>
                        </div>
                      </td>
                      <td className={`px-3 py-3 lg:px-4 lg:py-4 whitespace-nowrap text-sm ${themeClasses.text.secondary}`}>
                        {plan.planType}
                      </td>
                      <td className={`px-3 py-3 lg:px-4 lg:py-4 whitespace-nowrap text-sm ${themeClasses.text.secondary}`}>
                        {plan.category}
                      </td>
                      <td className={`px-3 py-3 lg:px-4 lg:py-4 whitespace-nowrap text-sm ${themeClasses.text.secondary}`}>
                        {plan.planType === "Paid" ? `Ksh ${formatNumber(plan.price)}` : "Free"}
                      </td>
                      <td className={`px-3 py-3 lg:px-4 lg:py-4 whitespace-nowrap text-sm ${themeClasses.text.secondary}`}>
                        {plan.bandwidth_limit_display}
                      </td>
                      <td className="px-3 py-3 lg:px-4 lg:py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Users className={`w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2 ${themeClasses.text.tertiary}`} />
                          <span className={`text-sm mr-2 lg:mr-3 ${themeClasses.text.secondary}`}>
                            {plan.purchases}
                          </span>
                          {renderStars(plan.purchases)}
                        </div>
                      </td>
                      <td className="px-3 py-3 lg:px-4 lg:py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-1 lg:space-x-2">
                          <motion.button 
                            onClick={() => { setSelectedPlan(deepClone(plan)); setViewMode("details"); }} 
                            className="focus:outline-none p-1" 
                            whileHover={{ scale: 1.2 }} 
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Eye className="w-3 h-3 lg:w-4 lg:h-4 text-indigo-600 hover:text-indigo-800" />
                          </motion.button>
                          <motion.button 
                            onClick={() => { 
                              setForm(deepClone(plan)); 
                              setEditingPlan(deepClone(plan)); 
                              setActiveTab("basic");
                              setViewMode("form"); 
                            }} 
                            className="focus:outline-none p-1" 
                            whileHover={{ rotate: 90 }} 
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Pencil className="w-3 h-3 lg:w-4 lg:h-4 text-emerald-600 hover:text-emerald-800" />
                          </motion.button>
                          {renderCopyDropdown(plan)}
                          <motion.button 
                            onClick={() => confirmDelete(plan)} 
                            className="focus:outline-none p-1" 
                            whileHover={{ x: [0, -2, 2, -2, 0] }} 
                            transition={{ duration: 0.3 }}
                          >
                            <Trash2 className="w-3 h-3 lg:w-4 lg:h-4 text-red-600 hover:text-red-800" />
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );

  const renderPlanForm = () => (
    <div className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${themeClasses.bg.primary}`}>
      <main className="max-w-6xl mx-auto space-y-6 lg:space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 truncate">
              {editingPlan ? "Edit Plan" : "Create New Plan"}
            </h1>
            <p className={`mt-1 lg:mt-2 text-sm lg:text-lg ${themeClasses.text.secondary}`}>
              {editingPlan ? "Update your internet plan details" : "Configure your new internet service plan"}
            </p>
          </div>
          <motion.button 
            onClick={() => { setViewMode("list"); setForm(deepClone(getInitialFormState())); setEditingPlan(null); }} 
            className="p-2 hover:bg-opacity-20 hover:bg-gray-500 rounded-lg flex-shrink-0"
            whileHover={{ rotate: 90 }}
          >
            <X className="w-5 h-5 lg:w-6 lg:h-6" />
          </motion.button>
        </div>

        {/* Tab Navigation */}
        <div className={`p-2 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
          <div className="flex flex-wrap gap-1 lg:gap-2">
            {["basic", "specifications", "advanced", "description", "features"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 lg:px-4 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                  activeTab === tab 
                    ? "bg-indigo-600 text-white" 
                    : `${themeClasses.text.secondary} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 lg:space-y-6">
          {/* Basic Details Tab */}
          {activeTab === "basic" && (
            <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
              <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4">Basic Details</h3>
              <div className="space-y-4 lg:space-y-6">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                      Plan Type <span className="text-red-500">*</span>
                    </label>
                    <EnhancedSelect
                      value={form.planType}
                      onChange={(value) => setForm(prev => ({ ...prev, planType: value }))}
                      options={planTypes.map(type => ({ value: type, label: type }))}
                      placeholder="Select Plan Type"
                    />
                    {errors.planType && <p className="text-red-500 text-xs mt-1">{errors.planType}</p>}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      name="name" 
                      value={form.name || ""} 
                      onChange={handleChange} 
                      className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                      placeholder="e.g., Rural Wi-Fi Pro" 
                      required 
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                      Category <span className="text-red-500">*</span>
                    </label>
                    {/* UPDATED CATEGORY DROPDOWN - Using createplans_1 logic */}
                    <CategoryDropdown
                      value={form.category}
                      onChange={(value) => setForm(prev => ({ ...prev, category: value }))}
                      className="w-full"
                      availableCategories={availableCategoriesForForm}
                      includeAll={false}
                    />
                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                      Price (Ksh) {form.planType === "Paid" && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="number" 
                      name="price" 
                      value={form.price || ""} 
                      onChange={handleChange} 
                      disabled={form.planType !== "Paid"}
                      className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${
                        form.planType !== "Paid" 
                          ? "bg-gray-100 cursor-not-allowed border-gray-300" 
                          : themeClasses.input
                      }`}
                      placeholder="e.g., 29.99" 
                      step="0.01" 
                      min="0" 
                      required={form.planType === "Paid"}
                    />
                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                  </div>
                </div>
                <div className="flex items-center">
                  <label className={`block text-sm font-medium mr-4 ${themeClasses.text.primary}`}>
                    Active
                  </label>
                  <div 
                    onClick={() => setForm((prev) => ({ ...prev, active: !prev.active }))} 
                    className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                      form.active 
                        ? 'bg-indigo-600'
                        : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                      form.active ? "translate-x-6" : "translate-x-1"
                    }`} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Specifications Tab */}
          {activeTab === "specifications" && (
            <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
              <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4">Specifications</h3>
              <div className="space-y-4 lg:space-y-6">
                {/* Download Speed */}
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-6">
                  <div className="lg:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                      Download Speed <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      value={form.downloadSpeed.value || ""} 
                      onChange={(e) => handleNestedChange("downloadSpeed", "value", e.target.value)} 
                      className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                      min="0.01" 
                      step="0.01" 
                      placeholder="e.g., 10" 
                      required 
                    />
                    {errors.downloadSpeed && <p className="text-red-500 text-xs mt-1">{errors.downloadSpeed}</p>}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                      Unit
                    </label>
                    {renderUnitDropdown("downloadSpeed", form.downloadSpeed.unit, handleNestedChange, speedUnits, "text-xs")}
                  </div>
                </div>
                
                {/* Upload Speed */}
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-6">
                  <div className="lg:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                      Upload Speed <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      value={form.uploadSpeed.value || ""} 
                      onChange={(e) => handleNestedChange("uploadSpeed", "value", e.target.value)} 
                      className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                      min="0.01" 
                      step="0.01" 
                      placeholder="e.g., 2" 
                      required 
                    />
                    {errors.uploadSpeed && <p className="text-red-500 text-xs mt-1">{errors.uploadSpeed}</p>}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                      Unit
                    </label>
                    {renderUnitDropdown("uploadSpeed", form.uploadSpeed.unit, handleNestedChange, speedUnits, "text-xs")}
                  </div>
                </div>

                {/* Expiry */}
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-6">
                  <div className="lg:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                      Expiry <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      value={form.expiry.value || ""} 
                      onChange={(e) => handleNestedChange("expiry", "value", e.target.value)} 
                      className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                      min="1" 
                      step="1" 
                      placeholder="e.g., 30" 
                      required 
                    />
                    {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                      Unit
                    </label>
                    {renderUnitDropdown("expiry", form.expiry.unit, handleNestedChange, expiryUnits, "text-xs")}
                  </div>
                </div>

                {/* Data Limit */}
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-6">
                  <div className="lg:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                      Data Limit <span className="text-red-500">*</span>
                    </label>
                    <input 
                      value={form.dataLimit.value || ""} 
                      onChange={(e) => handleNestedChange("dataLimit", "value", e.target.value)} 
                      className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                      placeholder={form.dataLimit.unit === "Unlimited" ? "Unlimited" : "e.g., 50"} 
                      disabled={form.dataLimit.unit === "Unlimited"} 
                      required 
                    />
                    {errors.dataLimit && <p className="text-red-500 text-xs mt-1">{errors.dataLimit}</p>}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                      Unit
                    </label>
                    {renderUnitDropdown("dataLimit", form.dataLimit.unit, handleNestedChange, dataUnits, "text-xs")}
                  </div>
                </div>

                {/* Usage Limit */}
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-6">
                  <div className="lg:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                      Usage Limit <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input 
                        value={form.usageLimit.value || ""} 
                        onChange={(e) => handleNestedChange("usageLimit", "value", e.target.value)} 
                        className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                        placeholder={form.usageLimit.unit === "Unlimited" ? "Unlimited" : "e.g., 720"} 
                        disabled={form.usageLimit.unit === "Unlimited"} 
                        required 
                      />
                      <PresetDropdown
                        isOpen={isUsageMenuOpen}
                        onToggle={() => setIsUsageMenuOpen(!isUsageMenuOpen)}
                        presets={usageLimitPresets}
                        onSelect={handleUsagePresetSelect}
                        triggerText="Presets"
                        type="usage"
                      />
                    </div>
                    {errors.usageLimit && <p className="text-red-500 text-xs mt-1">{errors.usageLimit}</p>}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                      Unit
                    </label>
                    {renderUnitDropdown("usageLimit", form.usageLimit.unit, handleNestedChange, usageUnits, "text-xs")}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Settings Tab */}
          {activeTab === "advanced" && (
            <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
              <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4">Advanced Settings</h3>
              <div className="space-y-4 lg:space-y-6">
                {/* Bandwidth Limit */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                    Bandwidth Limit (Kbps)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="number" 
                      value={form.bandwidth_limit || 0} 
                      onChange={(e) => setForm((prev) => ({ ...prev, bandwidth_limit: parseInt(e.target.value, 10) || 0 }))} 
                      className={`flex-1 px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                      min="0" 
                      step="1" 
                      placeholder="e.g., 10240" 
                    />
                    <PresetDropdown
                      isOpen={isBandwidthMenuOpen}
                      onToggle={() => setIsBandwidthMenuOpen(!isBandwidthMenuOpen)}
                      presets={bandwidthPresets}
                      onSelect={handleBandwidthPresetSelect}
                      triggerText="Presets"
                      type="bandwidth"
                    />
                  </div>
                </div>
                
                {/* Concurrent Connections */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                    Concurrent Connections
                  </label>
                  <input 
                    type="number" 
                    value={form.concurrent_connections || 1} 
                    onChange={(e) => setForm((prev) => ({ ...prev, concurrent_connections: parseInt(e.target.value, 10) || 1 }))} 
                    className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                    min="1" 
                    step="1" 
                    placeholder="e.g., 5" 
                  />
                </div>
                
                {/* Priority Level */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                    Priority Level
                  </label>
                  <EnhancedSelect
                    value={form.priority_level}
                    onChange={(value) => setForm(prev => ({ ...prev, priority_level: parseInt(value, 10) }))}
                    options={priorityOptions.map(opt => ({ 
                      value: opt.value, 
                      label: (
                        <div className="flex items-center space-x-2">
                          {getPriorityIcon(opt.value)}
                          <span className="text-sm">{opt.label}</span>
                        </div>
                      )
                    }))}
                  />
                  {errors.priority_level && <p className="text-red-500 text-xs mt-1">{errors.priority_level}</p>}
                </div>
                
                {/* Router Specific Toggle */}
                <div className="flex items-center justify-between">
                  <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                    Router Specific
                  </label>
                  <div 
                    onClick={() => setForm((prev) => ({ ...prev, router_specific: !prev.router_specific }))} 
                    className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                      form.router_specific 
                        ? 'bg-indigo-600'
                        : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                      form.router_specific ? "translate-x-6" : "translate-x-1"
                    }`} />
                  </div>
                  {errors.router_specific && <p className="text-red-500 text-xs ml-2">{errors.router_specific}</p>}
                </div>
                
                {/* Allowed Routers */}
                {form.router_specific && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                      Allowed Routers
                    </label>
                    {isFetchingRouters ? (
                      <div className="flex justify-center py-4">
                        <FaSpinner className="w-6 h-6 text-indigo-600 animate-spin" />
                      </div>
                    ) : routers.length === 0 ? (
                      <p className={`text-sm ${themeClasses.text.secondary}`}>No routers available.</p>
                    ) : (
                      <div className={`space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2 ${themeClasses.border.light} ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        {routers.map((router) => (
                          <div key={router.id} className="flex items-center">
                            <input 
                              type="checkbox" 
                              checked={form.allowed_routers_ids.includes(router.id)} 
                              onChange={() => toggleRouterSelection(router.id)} 
                              className={`h-4 w-4 focus:ring-indigo-500 border rounded ${
                                theme === 'dark' 
                                  ? 'bg-gray-600 border-gray-500 text-indigo-600' 
                                  : 'text-indigo-600 border-gray-300'
                              }`}
                            />
                            <label className={`ml-2 text-sm ${themeClasses.text.primary} truncate`}>
                              {router.name || `Router ${router.id}`}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* FUP Policy */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                    FUP Policy
                  </label>
                  <input 
                    value={form.FUP_policy || ""} 
                    onChange={(e) => setForm((prev) => ({ ...prev, FUP_policy: e.target.value }))} 
                    className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                    placeholder="e.g., Speed reduced to 1Mbps after threshold" 
                  />
                </div>
                
                {/* FUP Threshold */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
                    FUP Threshold (%)
                  </label>
                  <input 
                    type="number" 
                    value={form.FUP_threshold || 80} 
                    onChange={(e) => setForm((prev) => ({ ...prev, FUP_threshold: parseInt(e.target.value, 10) || 80 }))} 
                    className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                    min="0" 
                    max="100" 
                    step="1" 
                    placeholder="e.g., 80" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Description Tab */}
          {activeTab === "description" && (
            <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
              <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4">Plan Description</h3>
              <div data-color-mode={theme} className="text-sm">
                <MDEditor 
                  value={form.description || ""} 
                  onChange={(value) => setForm((prev) => ({ ...prev, description: value }))} 
                  height={300}
                  preview="edit" 
                />
              </div>
              {errors.description && <p className="text-red-500 text-xs mt-2">{errors.description}</p>}
            </div>
          )}

          {/* Features & Restrictions Tab */}
          {activeTab === "features" && (
            <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
              <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4">Features & Restrictions</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Features */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                    Features
                  </label>
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1">
                        <EnhancedSelect
                          value={newFeature}
                          onChange={setNewFeature}
                          options={featuresOptions.map(feature => ({ value: feature, label: feature }))}
                          placeholder="Select feature"
                        />
                      </div>
                      <motion.button 
                        onClick={addFeature} 
                        className={`px-3 py-2 rounded-lg text-sm flex items-center justify-center ${themeClasses.button.primary}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    </div>
                    <div className={`space-y-1 max-h-40 overflow-y-auto border rounded-lg p-2 ${themeClasses.border.light} ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      {form.features.map((feature) => (
                        <div key={feature} className={`flex items-center justify-between p-2 hover:${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} rounded text-sm`}>
                          <span className={`truncate ${themeClasses.text.primary}`}>{feature}</span>
                          <button 
                            onClick={() => removeListItem("features", feature)} 
                            className="text-red-600 hover:text-red-800 transition-colors flex-shrink-0 ml-2"
                          >
                            <X className="w-3 h-3 lg:w-4 lg:h-4" />
                          </button>
                        </div>
                      ))}
                      {form.features.length === 0 && (
                        <p className={`text-sm text-center py-2 ${themeClasses.text.secondary}`}>
                          No features added yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Restrictions */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                    Restrictions
                  </label>
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1">
                        <EnhancedSelect
                          value={newRestriction}
                          onChange={setNewRestriction}
                          options={restrictionsOptions.map(restriction => ({ value: restriction, label: restriction }))}
                          placeholder="Select restriction"
                        />
                      </div>
                      <motion.button 
                        onClick={addRestriction} 
                        className={`px-3 py-2 rounded-lg text-sm flex items-center justify-center ${themeClasses.button.primary}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    </div>
                    <div className={`space-y-1 max-h-40 overflow-y-auto border rounded-lg p-2 ${themeClasses.border.light} ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      {form.restrictions.map((restriction) => (
                        <div key={restriction} className={`flex items-center justify-between p-2 hover:${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} rounded text-sm`}>
                          <span className={`truncate ${themeClasses.text.primary}`}>{restriction}</span>
                          <button 
                            onClick={() => removeListItem("restrictions", restriction)} 
                            className="text-red-600 hover:text-red-800 transition-colors flex-shrink-0 ml-2"
                          >
                            <X className="w-3 h-3 lg:w-4 lg:h-4" />
                          </button>
                        </div>
                      ))}
                      {form.restrictions.length === 0 && (
                        <p className={`text-sm text-center py-2 ${themeClasses.text.secondary}`}>
                          No restrictions added yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
          <motion.button 
            onClick={() => { setViewMode("list"); setForm(deepClone(getInitialFormState())); setEditingPlan(null); }} 
            className={`px-4 py-2 lg:px-6 lg:py-2 rounded-lg shadow-md text-sm lg:text-base ${themeClasses.button.secondary}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>
          <motion.button 
            onClick={validateAndSavePlan} 
            disabled={!isFormValid}
            className={`px-4 py-2 lg:px-6 lg:py-2 rounded-lg shadow-md flex items-center justify-center text-sm lg:text-base ${
              isFormValid ? themeClasses.button.success : 'bg-gray-400 cursor-not-allowed'
            }`}
            whileHover={isFormValid ? { scale: 1.05 } : {}}
            whileTap={isFormValid ? { scale: 0.95 } : {}}
          >
            <Save className="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2" />
            {editingPlan ? "Update Plan" : "Create Plan"}
          </motion.button>
        </div>
      </main>
    </div>
  );

  const renderPlanDetails = () => {
    if (!selectedPlan) return null;

    return (
      <div className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${themeClasses.bg.primary}`}>
        <main className="max-w-6xl mx-auto space-y-6 lg:space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 truncate">
                {selectedPlan.name} Details
              </h1>
              <p className={`mt-1 lg:mt-2 text-sm lg:text-lg ${themeClasses.text.secondary}`}>
                Complete plan information and specifications
              </p>
            </div>
            <motion.button 
              onClick={() => { setViewMode("list"); setSelectedPlan(null); }} 
              className="p-2 hover:bg-opacity-20 hover:bg-gray-500 rounded-lg flex-shrink-0"
              whileHover={{ rotate: 90 }}
            >
              <X className="w-5 h-5 lg:w-6 lg:h-6" />
            </motion.button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Plan Overview */}
            <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
              <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4">Plan Overview</h3>
              <div className="space-y-3 lg:space-y-4">
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${themeClasses.text.secondary}`}>Type:</span>
                  <span className={`text-sm ${themeClasses.text.primary}`}>{selectedPlan.planType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${themeClasses.text.secondary}`}>Category:</span>
                  <span className={`text-sm ${themeClasses.text.primary}`}>{selectedPlan.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${themeClasses.text.secondary}`}>Price:</span>
                  <span className={`text-sm ${themeClasses.text.primary}`}>
                    {selectedPlan.planType === "Paid" ? `Ksh ${formatNumber(selectedPlan.price)}` : "Free"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${themeClasses.text.secondary}`}>Active:</span>
                  <span className={`text-sm ${selectedPlan.active ? "text-green-600" : "text-red-600"}`}>
                    {selectedPlan.active ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${themeClasses.text.secondary}`}>Subscribers:</span>
                  <div className="flex items-center">
                    <span className={`text-sm mr-2 ${themeClasses.text.primary}`}>
                      {selectedPlan.purchases}
                    </span>
                    {renderStars(selectedPlan.purchases)}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${themeClasses.text.secondary}`}>Created:</span>
                  <span className={`text-sm ${themeClasses.text.primary}`}>
                    {new Date(selectedPlan.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Technical Specs */}
            <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
              <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4">Technical Specs</h3>
              <div className="space-y-3 lg:space-y-4">
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${themeClasses.text.secondary}`}>Download Speed:</span>
                  <span className={`text-sm ${themeClasses.text.primary}`}>
                    {selectedPlan.downloadSpeed.value} {selectedPlan.downloadSpeed.unit}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${themeClasses.text.secondary}`}>Upload Speed:</span>
                  <span className={`text-sm ${themeClasses.text.primary}`}>
                    {selectedPlan.uploadSpeed.value} {selectedPlan.uploadSpeed.unit}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${themeClasses.text.secondary}`}>Bandwidth Limit:</span>
                  <span className={`text-sm ${themeClasses.text.primary}`}>
                    {formatBandwidth(selectedPlan.bandwidth_limit)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${themeClasses.text.secondary}`}>Expiry:</span>
                  <span className={`text-sm ${themeClasses.text.primary}`}>
                    {selectedPlan.expiry.value} {selectedPlan.expiry.unit}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${themeClasses.text.secondary}`}>Data Limit:</span>
                  <span className={`text-sm ${themeClasses.text.primary}`}>
                    {selectedPlan.dataLimit.value} {selectedPlan.dataLimit.unit}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${themeClasses.text.secondary}`}>Usage Limit:</span>
                  <span className={`text-sm ${themeClasses.text.primary}`}>
                    {selectedPlan.usageLimit.value} {selectedPlan.usageLimit.unit}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${themeClasses.text.secondary}`}>Concurrent Connections:</span>
                  <span className={`text-sm ${themeClasses.text.primary}`}>
                    {selectedPlan.concurrent_connections}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${themeClasses.text.secondary}`}>Priority Level:</span>
                  <span className={`text-sm ${themeClasses.text.primary}`}>
                    {priorityOptions.find(opt => opt.value === selectedPlan.priority_level)?.label || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${themeClasses.text.secondary}`}>Router Specific:</span>
                  <span className={`text-sm ${selectedPlan.router_specific ? "text-green-600" : "text-red-600"}`}>
                    {selectedPlan.router_specific ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between itemsCenter">
                  <span className={`text-sm font-medium ${themeClasses.text.secondary}`}>FUP Threshold:</span>
                  <span className={`text-sm ${themeClasses.text.primary}`}>
                    {selectedPlan.FUP_threshold}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${themeClasses.text.secondary}`}>FUP Policy:</span>
                  <span className={`text-sm ${themeClasses.text.primary}`}>
                    {selectedPlan.FUP_policy || "None"}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className={`p-4 lg:p-6 rounded-xl shadow-lg border lg:col-span-2 ${themeClasses.bg.card} ${themeClasses.border.light}`}>
              <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4">Description</h3>
              <div data-color-mode={theme} className="text-sm">
                <MDEditor.Markdown source={selectedPlan.description || "No description provided."} />
              </div>
            </div>

            {/* Features */}
            <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
              <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4">Features</h3>
              {selectedPlan.features.length > 0 ? (
                <ul className="space-y-2">
                  {selectedPlan.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      <span className={themeClasses.text.primary}>{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`text-sm ${themeClasses.text.secondary}`}>No features listed.</p>
              )}
            </div>

            {/* Restrictions */}
            <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
              <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4">Restrictions</h3>
              {selectedPlan.restrictions.length > 0 ? (
                <ul className="space-y-2">
                  {selectedPlan.restrictions.map((restriction) => (
                    <li key={restriction} className="flex items-center text-sm">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                      <span className={themeClasses.text.primary}>{restriction}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`text-sm ${themeClasses.text.secondary}`}>No restrictions listed.</p>
              )}
            </div>

            {/* Compatible Routers */}
            {selectedPlan.router_specific && (
              <div className={`p-4 lg:p-6 rounded-xl shadow-lg border lg:col-span-2 ${themeClasses.bg.card} ${themeClasses.border.light}`}>
                <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4">Compatible Routers</h3>
                {isFetchingCompatible ? (
                  <div className="flex justify-center py-4">
                    <FaSpinner className="w-6 h-6 text-indigo-600 animate-spin" />
                  </div>
                ) : compatibleRouters.length === 0 ? (
                  <p className={`text-sm ${themeClasses.text.secondary}`}>No compatible routers found.</p>
                ) : (
                  <div className="space-y-3 lg:space-y-4">
                    {compatibleRouters.map((router) => (
                      <div key={router.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                          <Router className="w-5 h-5 text-indigo-600" />
                          <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
                            {router.name || `Router ${router.id}`}
                          </span>
                        </div>
                        <motion.button 
                          onClick={() => activatePlanOnRouter(selectedPlan.id, router.id)} 
                          className={`px-3 py-2 rounded-lg text-sm flex items-center ${themeClasses.button.primary}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Zap className="w-4 h-4 mr-2" /> Activate
                        </motion.button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Active Sessions */}
            <div className={`p-4 lg:p-6 rounded-xl shadow-lg border lg:col-span-2 ${themeClasses.bg.card} ${themeClasses.border.light}`}>
              <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4">Active Sessions</h3>
              {Object.keys(selectedPlan.client_sessions).length > 0 ? (
                <div className="space-y-3 lg:space-y-4">
                  {safeObjectEntries(selectedPlan.client_sessions).map(([clientId, session]) => (
                    <div key={clientId} className={`p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
                        <div>
                          <span className={`text-sm font-medium ${themeClasses.text.secondary}`}>Client ID:</span>
                          <p className={`text-sm ${themeClasses.text.primary}`}>{clientId}</p>
                        </div>
                        <div>
                          <span className={`text-sm font-medium ${themeClasses.text.secondary}`}>Remaining Time:</span>
                          <p className={`text-sm ${themeClasses.text.primary}`}>{formatTime(session.remaining_time)}</p>
                        </div>
                        <div>
                          <span className={`text-sm font-medium ${themeClasses.text.secondary}`}>Data Used:</span>
                          <p className={`text-sm ${themeClasses.text.primary}`}>{formatBytes(session.data_used)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-sm ${themeClasses.text.secondary}`}>No active sessions.</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
            <motion.button 
              onClick={() => { 
                setForm(deepClone(selectedPlan)); 
                setEditingPlan(selectedPlan); 
                setActiveTab("basic");
                setViewMode("form"); 
              }} 
              className={`px-4 py-2 lg:px-6 lg:py-2 rounded-lg shadow-md flex items-center justify-center text-sm lg:text-base ${themeClasses.button.primary}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Pencil className="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2" /> Edit Plan
            </motion.button>
            <motion.button 
              onClick={() => confirmDelete(selectedPlan)} 
              className={`px-4 py-2 lg:px-6 lg:py-2 rounded-lg shadow-md flex items-center justify-center text-sm lg:text-base ${themeClasses.button.danger}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trash2 className="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2" /> Delete Plan
            </motion.button>
          </div>
        </main>
      </div>
    );
  };

  const renderSubscriptions = () => (
    <div className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${themeClasses.bg.primary}`}>
      <main className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 truncate">
              Subscriptions Management
            </h1>
            <p className={`mt-1 lg:mt-2 text-sm lg:text-lg ${themeClasses.text.secondary}`}>
              Monitor and manage plan subscriptions
            </p>
          </div>
          <motion.button 
            onClick={() => setViewMode("list")} 
            className="p-2 hover:bg-opacity-20 hover:bg-gray-500 rounded-lg flex-shrink-0"
            whileHover={{ rotate: 90 }}
          >
            <X className="w-5 h-5 lg:w-6 lg:h-6" />
          </motion.button>
        </div>

        {/* Subscription Filters */}
        <div className={`p-4 lg:p-6 rounded-xl shadow-lg ${themeClasses.bg.card}`}>
          <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4">Filter Subscriptions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>Status</label>
              <EnhancedSelect
                value={subscriptionFilters.status}
                onChange={(value) => handleSubscriptionFilterChange("status", value)}
                options={[
                  { value: "", label: "All Statuses" },
                  { value: "active", label: "Active" },
                  { value: "expired", label: "Expired" },
                  { value: "suspended", label: "Suspended" }
                ]}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>Plan</label>
              <EnhancedSelect
                value={subscriptionFilters.plan}
                onChange={(value) => handleSubscriptionFilterChange("plan", value)}
                options={[
                  { value: "", label: "All Plans" },
                  ...plans.map(plan => ({ value: plan.id, label: plan.name }))
                ]}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>Router</label>
              <EnhancedSelect
                value={subscriptionFilters.router}
                onChange={(value) => handleSubscriptionFilterChange("router", value)}
                options={[
                  { value: "", label: "All Routers" },
                  ...routers.map(router => ({ value: router.id, label: router.name || `Router ${router.id}` }))
                ]}
              />
            </div>
          </div>
        </div>

        {/* Subscriptions Table */}
        {isFetchingSubs ? (
          <div className={`flex justify-center items-center py-12 rounded-xl ${themeClasses.bg.card}`}>
            <FaSpinner className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
        ) : subscriptions.length === 0 ? (
          <div className={`rounded-xl shadow-lg p-6 lg:p-8 text-center ${themeClasses.bg.card}`}>
            <Users className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-3 lg:mb-4" />
            <h3 className="text-lg lg:text-xl font-semibold mb-2">No Subscriptions Found</h3>
            <p className={`mb-4 lg:mb-6 text-sm lg:text-base ${themeClasses.text.secondary}`}>Try adjusting the filters or check back later.</p>
          </div>
        ) : (
          <div className={`rounded-xl shadow-lg overflow-hidden ${themeClasses.bg.card}`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y text-sm">
                <thead className={theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}>
                  <tr>
                    {["ID", "User", "Plan", "Router", "Status", "Start Date", "End Date", "Data Used", "Time Remaining"].map((header) => (
                      <th key={header} className={`px-3 py-2 lg:px-4 lg:py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClasses.text.secondary}`}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y text-sm ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className={`hover:${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <td className={`px-3 py-3 lg:px-4 lg:py-4 whitespace-nowrap text-sm ${themeClasses.text.primary}`}>
                        {sub.id}
                      </td>
                      <td className={`px-3 py-3 lg:px-4 lg:py-4 whitespace-nowrap text-sm ${themeClasses.text.primary}`}>
                        {sub.user?.username || "Unknown"}
                      </td>
                      <td className={`px-3 py-3 lg:px-4 lg:py-4 whitespace-nowrap text-sm ${themeClasses.text.primary}`}>
                        {sub.plan?.name || "Unknown"}
                      </td>
                      <td className={`px-3 py-3 lg:px-4 lg:py-4 whitespace-nowrap text-sm ${themeClasses.text.primary}`}>
                        {sub.router?.name || "Unknown"}
                      </td>
                      <td className="px-3 py-3 lg:px-4 lg:py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          sub.status === "active" 
                            ? "bg-green-100 text-green-800" 
                            : sub.status === "expired" 
                              ? "bg-red-100 text-red-800" 
                              : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className={`px-3 py-3 lg:px-4 lg:py-4 whitespace-nowrap text-sm ${themeClasses.text.primary}`}>
                        {new Date(sub.start_date).toLocaleDateString()}
                      </td>
                      <td className={`px-3 py-3 lg:px-4 lg:py-4 whitespace-nowrap text-sm ${themeClasses.text.primary}`}>
                        {new Date(sub.end_date).toLocaleDateString()}
                      </td>
                      <td className={`px-3 py-3 lg:px-4 lg:py-4 whitespace-nowrap text-sm ${themeClasses.text.primary}`}>
                        {formatBytes(sub.data_used)}
                      </td>
                      <td className={`px-3 py-3 lg:px-4 lg:py-4 whitespace-nowrap text-sm ${themeClasses.text.primary}`}>
                        {formatTime(sub.remaining_time)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );

  const renderAnalytics = () => (
    <div className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${themeClasses.bg.primary}`}>
      <main className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 truncate">
              Subscription Analytics
            </h1>
            <p className={`mt-1 lg:mt-2 text-sm lg:text-lg ${themeClasses.text.secondary}`}>
              Insights and performance metrics for your plans
            </p>
          </div>
          <motion.button 
            onClick={() => setViewMode("list")} 
            className="p-2 hover:bg-opacity-20 hover:bg-gray-500 rounded-lg flex-shrink-0"
            whileHover={{ rotate: 90 }}
          >
            <X className="w-5 h-5 lg:w-6 lg:h-6" />
          </motion.button>
        </div>

        {isFetchingAnalytics ? (
          <div className={`flex justify-center items-center py-12 rounded-xl ${themeClasses.bg.card}`}>
            <FaSpinner className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
                <div className="flex items-center">
                  <Users className="w-6 h-6 lg:w-8 lg:h-8 text-indigo-600 mr-3 lg:mr-4" />
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold">{analytics.total_subscriptions}</h3>
                    <p className={`text-xs lg:text-sm ${themeClasses.text.secondary}`}>Total Subscriptions</p>
                  </div>
                </div>
              </div>
              <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
                <div className="flex items-center">
                  <Shield className="w-6 h-6 lg:w-8 lg:h-8 text-green-600 mr-3 lg:mr-4" />
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold">{analytics.active_subscriptions}</h3>
                    <p className={`text-xs lg:text-sm ${themeClasses.text.secondary}`}>Active Subscriptions</p>
                  </div>
                </div>
              </div>
              <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
                <div className="flex items-center">
                  <DollarSign className="w-6 h-6 lg:w-8 lg:h-8 text-purple-600 mr-3 lg:mr-4" />
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold">Ksh {formatNumber(analytics.total_revenue)}</h3>
                    <p className={`text-xs lg:text-sm ${themeClasses.text.secondary}`}>Total Revenue</p>
                  </div>
                </div>
              </div>
              <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
                <div className="flex items-center">
                  <BarChart3 className="w-6 h-6 lg:w-8 lg:h-8 text-indigo-600 mr-3 lg:mr-4" />
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold">{(analytics.plans || []).length}</h3>
                    <p className={`text-xs lg:text-sm ${themeClasses.text.secondary}`}>Plans Analyzed</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Status Distribution */}
              <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
                <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4">Status Distribution</h3>
                {Object.keys(analytics.status_counts || {}).length > 0 ? (
                  <div className="space-y-3 lg:space-y-4">
                    {safeObjectEntries(analytics.status_counts || {}).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className={`text-sm font-medium capitalize ${themeClasses.text.secondary}`}>
                          {status}
                        </span>
                        <span className={`text-sm ${themeClasses.text.primary}`}>{count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${themeClasses.text.secondary}`}>No status data available.</p>
                )}
              </div>

              {/* Top Plans */}
              <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
                <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4">Top Plans</h3>
                {(analytics.plans || []).length > 0 ? (
                  <div className="space-y-3 lg:space-y-4">
                    {(analytics.plans || []).map((plan) => (
                      <div key={plan.id} className={`flex items-center justify-between p-3 lg:p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                      }`}>
                        <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
                          {plan.name}
                        </span>
                        <span className={`text-sm ${themeClasses.text.secondary}`}>
                          {plan.subscriptions} subs | Ksh {formatNumber(plan.revenue)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${themeClasses.text.secondary}`}>No plan data available.</p>
                )}
              </div>

              {/* Recent Subscriptions */}
              <div className={`p-4 lg:p-6 rounded-xl shadow-lg border lg:col-span-2 ${themeClasses.bg.card} ${themeClasses.border.light}`}>
                <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4">Recent Subscriptions</h3>
                {(analytics.recent_subscriptions || []).length > 0 ? (
                  <div className="space-y-3 lg:space-y-4">
                    {(analytics.recent_subscriptions || []).map((sub) => (
                      <div key={sub.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 lg:p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                          <UserCheck className="w-5 h-5 text-indigo-600" />
                          <span className={`text-sm ${themeClasses.text.primary}`}>
                            {sub.user?.username || "Unknown"} - {sub.plan?.name || "Unknown"}
                          </span>
                        </div>
                        <span className={`text-sm ${themeClasses.text.secondary}`}>
                          {new Date(sub.start_date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${themeClasses.text.secondary}`}>No recent subscriptions.</p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );

  return (
    <>
      {viewMode === "list" && renderPlanList()}
      {viewMode === "form" && renderPlanForm()}
      {viewMode === "details" && selectedPlan && renderPlanDetails()}
      {viewMode === "subscriptions" && renderSubscriptions()}
      {viewMode === "analytics" && renderAnalytics()}
      
      {/* Mobile Success Alert */}
      <MobileSuccessAlert 
        message={mobileSuccessAlert.message}
        isVisible={mobileSuccessAlert.visible}
        onClose={() => setMobileSuccessAlert({ visible: false, message: "" })}
      />
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setPlanToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Plan"
        message={`Are you sure you want to delete "${planToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
      
      {/* Desktop Toast Container */}
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme={theme}
      />
    </>
  );
};

export default CreatePlans;