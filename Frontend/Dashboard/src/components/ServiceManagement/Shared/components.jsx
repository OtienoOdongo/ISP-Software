
import React, { useState, useRef, useEffect, useMemo } from "react";
import { FaCalendarAlt, FaChartBar, FaNetworkWired, FaWifi } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, AlertTriangle, Check, TrendingUp, Users, DollarSign } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                         THEME-AWARE STYLING SYSTEM                         */
/* -------------------------------------------------------------------------- */
export const getThemeClasses = (theme) => ({
  bg: {
    primary:
      theme === "dark"
        ? "bg-gradient-to-br from-gray-900 to-indigo-900"
        : "bg-gradient-to-br from-white to-indigo-50",
    card:
      theme === "dark"
        ? "bg-gray-800/60 backdrop-blur-md"
        : "bg-white/80 backdrop-blur-md",
    secondary:
      theme === "dark"
        ? "bg-gray-800/80 backdrop-blur-md"
        : "bg-white/80 backdrop-blur-md",
    dropdown: theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900",
  },
  text: {
    primary: theme === "dark" ? "text-white" : "text-gray-800",
    secondary: theme === "dark" ? "text-gray-300" : "text-gray-600",
    tertiary: theme === "dark" ? "text-gray-400" : "text-gray-500",
  },
  border: {
    light: theme === "dark" ? "border-gray-700" : "border-gray-200",
    medium: theme === "dark" ? "border-gray-600" : "border-gray-300",
  },
  input:
    theme === "dark"
      ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
      : "bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500",
  button: {
    primary:
      "bg-indigo-600 hover:bg-indigo-700 text-white",
    secondary:
      theme === "dark"
        ? "bg-gray-700 hover:bg-gray-600 text-white"
        : "bg-gray-200 hover:bg-gray-300 text-gray-800",
    success: "bg-green-600 hover:bg-green-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  },
});

/* -------------------------------------------------------------------------- */
/*                      ENHANCED SELECT (STACKING FIXED)                      */
/* -------------------------------------------------------------------------- */
export const EnhancedSelect = ({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
  disabled = false,
  theme = "light",
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 });
  const buttonRef = React.useRef(null);
  const dropdownRef = React.useRef(null);
  const themeClasses = getThemeClasses(theme);

  // Update dropdown position when opened
  React.useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption =
    options.find((opt) => opt.value === value) ||
    options.find((opt) => opt === value);

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center justify-between w-full px-3 py-2 rounded-lg border text-sm
          transition-all duration-200 ease-in-out
          ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
          ${themeClasses.input}
          focus:outline-none focus:ring-2 focus:ring-indigo-500
        `}
      >
        <span className="truncate text-left text-sm">
          {selectedOption ? selectedOption.label || selectedOption : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 ml-2 transition-transform ${
            isOpen ? "rotate-180" : ""
          } ${themeClasses.text.tertiary}`}
        />
      </button>

      {/* Dropdown rendered via Portal for proper stacking */}
      {typeof window !== "undefined" &&
        ReactDOM.createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/10 z-[9998]"
                  onClick={() => setIsOpen(false)}
                />

                {/* Dropdown List */}
                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`fixed z-[9999] shadow-xl border rounded-lg overflow-hidden
                    ${themeClasses.bg.dropdown} ${themeClasses.border.light}`}
                  style={{
                    top: position.top,
                    left: position.left,
                    width: position.width,
                  }}
                >
                  <div className="py-1 max-h-60 overflow-y-auto">
                    {options.map((option, index) => {
                      const optionValue = option.value || option;
                      const optionLabel = option.label || option;
                      const isSelected = value === optionValue;
                      const isDisabled = option.disabled;

                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            if (!isDisabled) {
                              onChange(optionValue);
                              setIsOpen(false);
                            }
                          }}
                          disabled={isDisabled}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors
                            ${
                              isDisabled
                                ? "cursor-not-allowed opacity-50 text-gray-500"
                                : "cursor-pointer"
                            }
                            ${
                              !isDisabled && isSelected
                                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                : !isDisabled
                                ? `${themeClasses.text.primary} hover:bg-indigo-50 hover:text-indigo-900 dark:hover:bg-indigo-900 dark:hover:text-indigo-50`
                                : ""
                            }
                            focus:outline-none focus:bg-indigo-100 focus:text-indigo-900
                            dark:focus:bg-indigo-900 dark:focus:text-indigo-50`}
                        >
                          {optionLabel}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                            CONFIRMATION MODAL                              */
/* -------------------------------------------------------------------------- */
export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  type = "danger",
  theme = "light",
}) => {
  const themeClasses = getThemeClasses(theme);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`w-full max-w-md rounded-xl shadow-lg border p-6 ${themeClasses.bg.card} ${themeClasses.border.light}`}
      >
        <div className="flex items-center mb-4">
          <div
            className={`p-2 rounded-full ${
              type === "danger"
                ? "bg-red-100 text-red-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3
            className={`ml-3 text-lg font-semibold ${themeClasses.text.primary}`}
          >
            {title}
          </h3>
        </div>

        <p className={`mb-6 ${themeClasses.text.secondary}`}>{message}</p>

        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${themeClasses.button.secondary}`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
              type === "danger"
                ? themeClasses.button.danger
                : themeClasses.button.success
            }`}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                           MOBILE SUCCESS ALERT                             */
/* -------------------------------------------------------------------------- */
export const MobileSuccessAlert = ({ message, isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-sm px-4"
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


// Enhanced DatePicker Component using Portal (same logic as EnhancedSelect)
export const EnhancedDatePicker = ({
  selected,
  onChange,
  selectsStart,
  selectsEnd,
  startDate,
  endDate,
  minDate,
  placeholderText = "Select date",
  className = "",
  theme = "light",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef(null);
  const calendarRef = useRef(null);

  // Update calendar position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themeClasses = {
    input: theme === "dark"
      ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
      : "bg-white border-gray-300 text-gray-800 placeholder-gray-500",
    calendar: theme === "dark" 
      ? "bg-gray-800 border-gray-700 text-white" 
      : "bg-white border-gray-200 text-gray-800"
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between w-full px-3 py-2 rounded-lg border text-sm
          transition-all duration-200 ease-in-out cursor-pointer
          ${themeClasses.input}
          focus:outline-none focus:ring-2 focus:ring-indigo-500
        `}
      >
        <span className="truncate text-left text-sm">
          {selected ? selected.toLocaleDateString() : placeholderText}
        </span>
        <FaCalendarAlt className={`w-4 h-4 ml-2 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
      </button>

      {/* Calendar rendered via Portal for proper stacking */}
      {typeof window !== 'undefined' && ReactDOM.createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/10 z-[9998]"
                onClick={() => setIsOpen(false)}
              />

              {/* Calendar */}
              <motion.div
                ref={calendarRef}
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`fixed z-[9999] shadow-xl border rounded-lg overflow-hidden ${themeClasses.calendar}`}
                style={{
                  top: position.top,
                  left: position.left,
                }}
              >
                <DatePicker
                  selected={selected}
                  onChange={(date) => {
                    onChange(date);
                    setIsOpen(false);
                  }}
                  selectsStart={selectsStart}
                  selectsEnd={selectsEnd}
                  startDate={startDate}
                  endDate={endDate}
                  minDate={minDate}
                  inline
                  className="border-0"
                  calendarClassName={`border-0 ${themeClasses.calendar}`}
                  dayClassName={(date) => 
                    theme === 'dark' 
                      ? 'text-white hover:bg-indigo-600' 
                      : 'text-gray-800 hover:bg-indigo-100'
                  }
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};





/* -------------------------------------------------------------------------- */
/*                         ACCESS TYPE BADGE COMPONENT                        */
/* -------------------------------------------------------------------------- */
export const AccessTypeBadge = ({ accessType, theme = "light", size = "md" }) => {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base"
  };

  const accessTypeConfig = {
    hotspot: {
      icon: FaWifi,
      color: theme === "dark" ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-800",
      border: theme === "dark" ? "border-blue-700" : "border-blue-300"
    },
    pppoe: {
      icon: FaNetworkWired,
      color: theme === "dark" ? "bg-green-900 text-green-300" : "bg-green-100 text-green-800",
      border: theme === "dark" ? "border-green-700" : "border-green-300"
    },
    both: {
      icon: Users,
      color: theme === "dark" ? "bg-purple-900 text-purple-300" : "bg-purple-100 text-purple-800",
      border: theme === "dark" ? "border-purple-700" : "border-purple-300"
    },
    general: {
      icon: DollarSign,
      color: theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-800",
      border: theme === "dark" ? "border-gray-600" : "border-gray-300"
    }
  };

  const config = accessTypeConfig[accessType] || accessTypeConfig.general;
  const IconComponent = config.icon;

  return (
    <span className={`
      inline-flex items-center rounded-full border font-medium ${sizeClasses[size]}
      ${config.color} ${config.border}
    `}>
      <IconComponent className="w-3 h-3 mr-1" />
      {accessType.charAt(0).toUpperCase() + accessType.slice(1)}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/*                         REVENUE DISTRIBUTION CHART                         */
/* -------------------------------------------------------------------------- */
export const RevenueDistributionChart = ({ distribution, theme = "light" }) => {
  if (!distribution || Object.keys(distribution).length === 0) {
    return (
      <div className={`text-center py-8 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
        No revenue distribution data available
      </div>
    );
  }

  const total = Object.values(distribution).reduce((sum, value) => sum + value, 0);
  
  const segments = [
    { type: 'hotspot', percentage: distribution.hotspot || 0, color: theme === "dark" ? "#3b82f6" : "#60a5fa" },
    { type: 'pppoe', percentage: distribution.pppoe || 0, color: theme === "dark" ? "#10b981" : "#34d399" },
    { type: 'both', percentage: distribution.both || 0, color: theme === "dark" ? "#8b5cf6" : "#a78bfa" }
  ].filter(segment => segment.percentage > 0);

  return (
    <div className="w-full">
      {/* Chart */}
      <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
        {segments.map((segment, index) => (
          <div
            key={segment.type}
            className="absolute h-full transition-all duration-500 ease-out"
            style={{
              left: `${segments.slice(0, index).reduce((sum, s) => sum + s.percentage, 0)}%`,
              width: `${segment.percentage}%`,
              backgroundColor: segment.color
            }}
          />
        ))}
      </div>
      
      {/* Legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {segments.map(segment => (
          <div key={segment.type} className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: segment.color }}
              />
              <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                {segment.type.charAt(0).toUpperCase() + segment.type.slice(1)}
              </span>
            </div>
            <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
              {segment.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
      
      {total === 0 && (
        <div className={`text-center text-sm mt-2 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
          No revenue recorded in selected period
        </div>
      )}
    </div>
  );
};