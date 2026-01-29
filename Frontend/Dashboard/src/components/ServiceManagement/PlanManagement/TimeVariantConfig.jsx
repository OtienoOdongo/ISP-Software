import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Calendar, CalendarDays, CalendarClock, Globe, 
  Sun, Moon, AlertTriangle, CheckCircle, XCircle,
  ChevronDown, ChevronUp, Plus, Trash2, RefreshCw,
  Zap, Shield, Lock, Unlock, Filter, Save, X,
  Clock as ClockIcon, CalendarOff, Calendar as CalendarIcon,
  Users, Target, TrendingUp, PieChart, BarChart3,
  Bell, AlertCircle, Timer, Battery, BatteryCharging,
  Wifi, WifiOff, Radio, Smartphone, Router,
  HardDrive, Cpu, ShieldCheck, Cloud, Download, Upload
} from 'lucide-react';


import api from '../../../api';

// Theme and UI
// import { useTheme } from "../../context/"

import { EnhancedSelect, ConfirmationModal, MobileSuccessAlert, getThemeClasses } from '../Shared/components'

// Utils
import {
  deepClone,
  validateTimeVariant as validateTimeVariantUtil,
  debounce,
  calculateNextAvailableTime as calculateNextAvailableTimeUtil,
  getAvailabilitySummary as getAvailabilitySummaryUtil
} from '../Shared/utils'
import { formatDate, formatTime, formatDuration } from '../Shared/formatters'

// Constants
import {
  daysOfWeek,
  timeZoneOptions,
  timeUnits,
  timeRangePresets,
  recurrencePatterns,
  exclusionTypes
} from '../Shared/constant'

// Hooks
import useMediaQuery from './hooks/useMediaQuery'

// ============================================
// API SERVICE FOR TIME VARIANT
// ============================================

const TimeVariantApiService = {
  // Get time variant by ID
  async getTimeVariant(id) {
    const response = await api.get(`/api/internet_plans/time-variant/${id}/`);
    return response.data;
  },

  // List time variants with filtering
  async getTimeVariants(params = {}) {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/api/internet_plans/time-variant/?${queryParams}`);
    return response.data;
  },

  // Create time variant
  async createTimeVariant(timeVariantData) {
    const response = await api.post('/api/internet_plans/time-variant/', timeVariantData);
    return response.data;
  },

  // Update time variant
  async updateTimeVariant(id, timeVariantData) {
    const response = await api.put(`/api/internet_plans/time-variant/${id}/`, timeVariantData);
    return response.data;
  },

  // Delete time variant
  async deleteTimeVariant(id) {
    const response = await api.delete(`/api/internet_plans/time-variant/${id}/`);
    return response.data;
  },

  // Test time variant configuration
  async testTimeVariant(testData) {
    const response = await api.post('/api/internet_plans/time-variant/test/', testData);
    return response.data;
  },

  // Check availability for multiple time variants
  async batchCheckAvailability(timeVariantIds) {
    const response = await api.post('/api/internet_plans/time-variant/batch-check/', {
      time_variant_ids: timeVariantIds
    });
    return response.data;
  },

  // Get usage statistics
  async getUsageStatistics(timeVariantId) {
    const response = await api.get(`/api/internet_plans/time-variant/${timeVariantId}/statistics/`);
    return response.data;
  }
};

// ============================================
// OPTIMIZED DATA STRUCTURES
// ============================================

class TimeVariantDataStructure {
  constructor() {
    this.configs = new Map();
    this.indexes = {
      byActiveStatus: new Map(),
      byType: new Map(),
      byTimeRange: new Map(),
      byUsageCount: new Map(),
      byComplexity: new Map()
    };
  }

  // Add or update time variant
  addOrUpdate(config) {
    const id = config.id || `temp_${Date.now()}`;
    const existing = this.configs.get(id);
    
    if (existing) {
      this.removeFromIndexes(existing);
    }
    
    this.configs.set(id, config);
    this.updateIndexes(config);
    return id;
  }

  // Remove time variant
  remove(id) {
    const config = this.configs.get(id);
    if (config) {
      this.removeFromIndexes(config);
      this.configs.delete(id);
    }
  }

  // Get by ID
  get(id) {
    return this.configs.get(id);
  }

  // Search configurations
  search(query, filters = {}) {
    const results = [];
    const queryLower = query.toLowerCase();
    
    for (const config of this.configs.values()) {
      let matches = false;
      
      // Text search in description and name
      if (queryLower) {
        const searchFields = [
          config.description || '',
          config.name || ''
        ];
        matches = searchFields.some(field => 
          field.toLowerCase().includes(queryLower)
        );
      } else {
        matches = true;
      }
      
      // Apply filters
      if (matches && filters.is_active !== undefined) {
        matches = config.is_active === filters.is_active;
      }
      
      if (matches && filters.type) {
        const configType = this.getConfigType(config);
        matches = configType === filters.type;
      }
      
      if (matches) {
        results.push(config);
      }
    }
    
    return this.sortResults(results, filters.sortBy || 'updated_at', filters.sortOrder || 'desc');
  }

  // Get configuration type
  getConfigType(config) {
    if (config.schedule_active && config.duration_active) {
      return 'hybrid';
    } else if (config.schedule_active) {
      return 'scheduled';
    } else if (config.duration_active) {
      return 'duration';
    } else if (config.start_time && config.end_time) {
      return 'time_range';
    } else {
      return 'basic';
    }
  }

  // Calculate configuration complexity score
  calculateComplexityScore(config) {
    let score = 0;
    
    if (config.is_active) score += 1;
    if (config.start_time && config.end_time) score += 2;
    if (config.available_days?.length > 0) score += config.available_days.length;
    if (config.schedule_active) score += 3;
    if (config.duration_active) score += 2;
    if (config.exclusion_dates?.length > 0) score += config.exclusion_dates.length;
    if (config.force_available) score -= 1; // Simpler
    
    return score;
  }

  // Update indexes
  updateIndexes(config) {
    const id = config.id;
    
    // By active status
    const statusKey = config.is_active ? 'active' : 'inactive';
    if (!this.indexes.byActiveStatus.has(statusKey)) {
      this.indexes.byActiveStatus.set(statusKey, new Set());
    }
    this.indexes.byActiveStatus.get(statusKey).add(id);
    
    // By type
    const type = this.getConfigType(config);
    if (!this.indexes.byType.has(type)) {
      this.indexes.byType.set(type, new Set());
    }
    this.indexes.byType.get(type).add(id);
    
    // By time range
    if (config.start_time && config.end_time) {
      const timeKey = `${config.start_time}-${config.end_time}`;
      if (!this.indexes.byTimeRange.has(timeKey)) {
        this.indexes.byTimeRange.set(timeKey, new Set());
      }
      this.indexes.byTimeRange.get(timeKey).add(id);
    }
    
    // By complexity
    const complexity = this.calculateComplexityScore(config);
    const complexityKey = complexity <= 3 ? 'simple' : complexity <= 6 ? 'medium' : 'complex';
    if (!this.indexes.byComplexity.has(complexityKey)) {
      this.indexes.byComplexity.set(complexityKey, new Set());
    }
    this.indexes.byComplexity.get(complexityKey).add(id);
  }

  // Remove from indexes
  removeFromIndexes(config) {
    const id = config.id;
    
    // Remove from all indexes
    for (const indexSet of Object.values(this.indexes)) {
      if (indexSet instanceof Map) {
        for (const ids of indexSet.values()) {
          ids.delete(id);
        }
      }
    }
  }

  // Sort results
  sortResults(results, field, direction) {
    return results.sort((a, b) => {
      let aValue, bValue;
      
      switch (field) {
        case 'complexity':
          aValue = this.calculateComplexityScore(a);
          bValue = this.calculateComplexityScore(b);
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at || a.updatedAt || 0).getTime();
          bValue = new Date(b.updated_at || b.updatedAt || 0).getTime();
          break;
        case 'created_at':
          aValue = new Date(a.created_at || a.createdAt || 0).getTime();
          bValue = new Date(b.created_at || b.createdAt || 0).getTime();
          break;
        default:
          aValue = a[field] || '';
          bValue = b[field] || '';
      }
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Get statistics
  getStatistics() {
    const stats = {
      total: this.configs.size,
      byType: {},
      byStatus: { active: 0, inactive: 0 },
      byComplexity: { simple: 0, medium: 0, complex: 0 },
      averageComplexity: 0
    };
    
    let totalComplexity = 0;
    
    for (const config of this.configs.values()) {
      // Type stats
      const type = this.getConfigType(config);
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      
      // Status stats
      if (config.is_active) {
        stats.byStatus.active++;
      } else {
        stats.byStatus.inactive++;
      }
      
      // Complexity stats
      const complexity = this.calculateComplexityScore(config);
      totalComplexity += complexity;
      
      if (complexity <= 3) {
        stats.byComplexity.simple++;
      } else if (complexity <= 6) {
        stats.byComplexity.medium++;
      } else {
        stats.byComplexity.complex++;
      }
    }
    
    stats.averageComplexity = this.configs.size > 0 ? totalComplexity / this.configs.size : 0;
    
    return stats;
  }
}

// ============================================
// VALIDATION ALGORITHMS
// ============================================

class TimeVariantValidator {
  // Validate time variant configuration
  static validate(config) {
    const errors = {};
    
    if (!config.is_active) {
      return errors; // No validation needed if inactive
    }
    
    // Time range validation
    if (config.start_time && config.end_time) {
      const start = this.parseTime(config.start_time);
      const end = this.parseTime(config.end_time);
      
      if (start >= end) {
        errors.end_time = 'End time must be after start time';
      }
      
      // Check if time range is valid (not spanning multiple days in this implementation)
      if (end - start > 24 * 60 * 60 * 1000) {
        errors.end_time = 'Time range cannot span more than 24 hours';
      }
    }
    
    // Available days validation
    if (config.available_days && config.available_days.length > 0) {
      const validDays = daysOfWeek.map(day => day.value);
      for (const day of config.available_days) {
        if (!validDays.includes(day)) {
          errors.available_days = `Invalid day: ${day}`;
          break;
        }
      }
    }
    
    // Schedule validation
    if (config.schedule_active) {
      if (!config.schedule_start_date) {
        errors.schedule_start_date = 'Schedule start date is required';
      }
      if (!config.schedule_end_date) {
        errors.schedule_end_date = 'Schedule end date is required';
      }
      
      if (config.schedule_start_date && config.schedule_end_date) {
        const startDate = new Date(config.schedule_start_date);
        const endDate = new Date(config.schedule_end_date);
        
        if (startDate >= endDate) {
          errors.schedule_end_date = 'Schedule end date must be after start date';
        }
        
        // Check if schedule is in the past
        const now = new Date();
        if (endDate < now) {
          errors.schedule_end_date = 'Schedule end date is in the past';
        }
      }
    }
    
    // Duration validation
    if (config.duration_active) {
      if (!config.duration_value || config.duration_value <= 0) {
        errors.duration_value = 'Duration value must be greater than 0';
      }
      
      if (!config.duration_start_date) {
        errors.duration_start_date = 'Duration start date is required';
      }
      
      if (!timeUnits.find(unit => unit.value === config.duration_unit)) {
        errors.duration_unit = 'Invalid duration unit';
      }
      
      // Calculate end date and validate
      if (config.duration_start_date && config.duration_value > 0) {
        const endDate = this.calculateDurationEnd(
          config.duration_start_date,
          config.duration_value,
          config.duration_unit
        );
        
        const now = new Date();
        if (endDate < now) {
          errors.duration_value = 'Duration ends in the past';
        }
      }
    }
    
    // Exclusion dates validation
    if (config.exclusion_dates && config.exclusion_dates.length > 0) {
      for (const dateStr of config.exclusion_dates) {
        if (!this.isValidDate(dateStr)) {
          errors.exclusion_dates = `Invalid date format: ${dateStr}`;
          break;
        }
      }
    }
    
    return errors;
  }
  
  // Parse time string to Date object
  static parseTime(timeStr) {
    if (!timeStr) return null;
    
    if (typeof timeStr === 'string') {
      const [hours, minutes, seconds] = timeStr.split(':').map(Number);
      const date = new Date();
      date.setHours(hours || 0, minutes || 0, seconds || 0, 0);
      return date;
    }
    
    return timeStr;
  }
  
  // Calculate duration end date
  static calculateDurationEnd(startDate, value, unit) {
    const date = new Date(startDate);
    
    switch (unit) {
      case 'hours':
        date.setHours(date.getHours() + value);
        break;
      case 'days':
        date.setDate(date.getDate() + value);
        break;
      case 'weeks':
        date.setDate(date.getDate() + (value * 7));
        break;
      case 'months':
        date.setMonth(date.getMonth() + value);
        break;
      default:
        date.setDate(date.getDate() + value);
    }
    
    return date;
  }
  
  // Check if string is valid date
  static isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) && date.toISOString().slice(0, 10) === dateString;
  }
  
  // Check for conflicts between different restrictions
  static checkForConflicts(config) {
    const conflicts = [];
    
    // Check if available days conflict with exclusion dates
    if (config.available_days?.length > 0 && config.exclusion_dates?.length > 0) {
      // This would require more complex logic to check actual date overlaps
      // For now, just note that both are set
      conflicts.push({
        type: 'potential_conflict',
        message: 'Both available days and exclusion dates are configured'
      });
    }
    
    // Check if schedule overlaps with duration
    if (config.schedule_active && config.duration_active) {
      const scheduleStart = new Date(config.schedule_start_date);
      const scheduleEnd = new Date(config.schedule_end_date);
      const durationStart = new Date(config.duration_start_date);
      const durationEnd = TimeVariantValidator.calculateDurationEnd(
        config.duration_start_date,
        config.duration_value,
        config.duration_unit
      );
      
      // Check for overlap
      if (scheduleStart <= durationEnd && durationStart <= scheduleEnd) {
        conflicts.push({
          type: 'overlap',
          message: 'Schedule and duration periods overlap'
        });
      }
    }
    
    return conflicts;
  }
}

// ============================================
// AVAILABILITY CALCULATION ENGINE
// ============================================

class AvailabilityCalculator {
  // Check if available at specific time
  static isAvailableAt(config, timestamp = new Date()) {
    if (!config.is_active) return true;
    if (config.force_available) return true;
    
    const date = new Date(timestamp);
    
    // 1. Check time of day
    if (config.start_time && config.end_time) {
      if (!this.isWithinTimeRange(date, config.start_time, config.end_time)) {
        return false;
      }
    }
    
    // 2. Check day of week
    if (config.available_days?.length > 0) {
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase().slice(0, 3);
      if (!config.available_days.includes(dayOfWeek)) {
        return false;
      }
    }
    
    // 3. Check schedule
    if (config.schedule_active && config.schedule_start_date && config.schedule_end_date) {
      const scheduleStart = new Date(config.schedule_start_date);
      const scheduleEnd = new Date(config.schedule_end_date);
      
      if (date < scheduleStart || date > scheduleEnd) {
        return false;
      }
    }
    
    // 4. Check duration
    if (config.duration_active && config.duration_start_date) {
      const durationStart = new Date(config.duration_start_date);
      const durationEnd = TimeVariantValidator.calculateDurationEnd(
        config.duration_start_date,
        config.duration_value,
        config.duration_unit
      );
      
      if (date < durationStart || date > durationEnd) {
        return false;
      }
    }
    
    // 5. Check exclusion dates
    if (config.exclusion_dates?.length > 0) {
      const dateStr = date.toISOString().slice(0, 10);
      if (config.exclusion_dates.includes(dateStr)) {
        return false;
      }
    }
    
    return true;
  }
  
  // Calculate next available time
  static calculateNextAvailable(config, fromTimestamp = new Date()) {
    if (!config.is_active) return null;
    if (config.force_available) return null;
    
    const fromDate = new Date(fromTimestamp);
    const now = fromDate;
    
    // Check current availability
    if (this.isAvailableAt(config, now)) {
      return {
        type: 'available_now',
        time: now,
        message: 'Available now'
      };
    }
    
    // Calculate next available based on restrictions
    const nextAvailableTimes = [];
    
    // 1. Check time of day restriction
    if (config.start_time && config.end_time) {
      const nextTime = this.getNextTimeInRange(now, config.start_time, config.end_time);
      if (nextTime) {
        nextAvailableTimes.push({
          type: 'time_of_day',
          time: nextTime,
          priority: 1
        });
      }
    }
    
    // 2. Check day of week restriction
    if (config.available_days?.length > 0) {
      const nextDay = this.getNextAvailableDay(now, config.available_days);
      if (nextDay) {
        nextAvailableTimes.push({
          type: 'day_of_week',
          time: nextDay,
          priority: 2
        });
      }
    }
    
    // 3. Check schedule restriction
    if (config.schedule_active && config.schedule_start_date) {
      const scheduleStart = new Date(config.schedule_start_date);
      if (now < scheduleStart) {
        nextAvailableTimes.push({
          type: 'schedule',
          time: scheduleStart,
          priority: 3
        });
      }
    }
    
    // 4. Check duration restriction
    if (config.duration_active && config.duration_start_date) {
      const durationStart = new Date(config.duration_start_date);
      if (now < durationStart) {
        nextAvailableTimes.push({
          type: 'duration',
          time: durationStart,
          priority: 4
        });
      }
    }
    
    // 5. Check exclusion dates
    if (config.exclusion_dates?.length > 0) {
      const nextAfterExclusion = this.getNextDateAfterExclusions(now, config.exclusion_dates);
      if (nextAfterExclusion) {
        nextAvailableTimes.push({
          type: 'exclusion',
          time: nextAfterExclusion,
          priority: 5
        });
      }
    }
    
    // Return the earliest next available time
    if (nextAvailableTimes.length === 0) {
      return null;
    }
    
    // Sort by time and priority
    nextAvailableTimes.sort((a, b) => {
      const timeDiff = a.time.getTime() - b.time.getTime();
      if (timeDiff !== 0) return timeDiff;
      return a.priority - b.priority;
    });
    
    const earliest = nextAvailableTimes[0];
    
    // Format message based on type
    let message = '';
    switch (earliest.type) {
      case 'time_of_day':
        message = `Available today at ${formatTime(earliest.time)}`;
        break;
      case 'day_of_week':
        const dayName = earliest.time.toLocaleDateString('en-US', { weekday: 'long' });
        message = `Available on ${dayName}`;
        break;
      case 'schedule':
        message = `Available from ${formatDate(earliest.time)}`;
        break;
      case 'duration':
        message = `Duration starts on ${formatDate(earliest.time)}`;
        break;
      case 'exclusion':
        message = `Available after ${formatDate(earliest.time)}`;
        break;
    }
    
    return {
      type: earliest.type,
      time: earliest.time,
      message
    };
  }
  
  // Helper: Check if time is within range
  static isWithinTimeRange(date, startTimeStr, endTimeStr) {
    const currentTime = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
    const [startHours, startMinutes] = startTimeStr.split(':').map(Number);
    const [endHours, endMinutes] = endTimeStr.split(':').map(Number);
    
    const startTime = startHours * 3600 + startMinutes * 60;
    const endTime = endHours * 3600 + endMinutes * 60;
    
    return currentTime >= startTime && currentTime <= endTime;
  }
  
  // Helper: Get next time within time range
  static getNextTimeInRange(now, startTimeStr, endTimeStr) {
    const [startHours, startMinutes] = startTimeStr.split(':').map(Number);
    const [endHours, endMinutes] = endTimeStr.split(':').map(Number);
    
    const today = new Date(now);
    today.setHours(startHours, startMinutes, 0, 0);
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(startHours, startMinutes, 0, 0);
    
    // Check if start time is today or tomorrow
    if (now < today) {
      return today;
    } else {
      return tomorrow;
    }
  }
  
  // Helper: Get next available day
  static getNextAvailableDay(now, availableDays) {
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase().slice(0, 3);
    
    // Find next available day
    const currentIndex = daysOfWeek.findIndex(day => day.value === currentDay);
    
    for (let i = 1; i <= 7; i++) {
      const nextIndex = (currentIndex + i) % 7;
      const nextDay = daysOfWeek[nextIndex].value;
      
      if (availableDays.includes(nextDay)) {
        const nextDate = new Date(now);
        nextDate.setDate(nextDate.getDate() + i);
        nextDate.setHours(0, 0, 0, 0);
        return nextDate;
      }
    }
    
    return null;
  }
  
  // Helper: Get next date after exclusions
  static getNextDateAfterExclusions(now, exclusionDates) {
    const currentDateStr = now.toISOString().slice(0, 10);
    
    // Check if today is excluded
    if (exclusionDates.includes(currentDateStr)) {
      // Find next non-excluded date
      let nextDate = new Date(now);
      nextDate.setDate(nextDate.getDate() + 1);
      
      while (exclusionDates.includes(nextDate.toISOString().slice(0, 10))) {
        nextDate.setDate(nextDate.getDate() + 1);
      }
      
      return nextDate;
    }
    
    return null;
  }
}

// ============================================
// MAIN COMPONENT
// ============================================

const TimeVariantConfig = ({ 
  timeVariant, 
  onChange, 
  errors = {}, 
  theme, 
  isMobile,
  showHeader = true,
  compactMode = false,
  onSave,
  onTest
}) => {
  const themeClasses = getThemeClasses(theme);
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  
  // State
  const [localConfig, setLocalConfig] = useState(() => deepClone(timeVariant || {}));
  const [localErrors, setLocalErrors] = useState({});
  const [activeSection, setActiveSection] = useState('time_of_day');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [showPresets, setShowPresets] = useState(false);
  const [mobileSuccessAlert, setMobileSuccessAlert] = useState({ visible: false, message: "" });
  const [conflicts, setConflicts] = useState([]);
  
  // Responsive grid configuration
  const gridConfig = useMemo(() => {
    if (isMobile) return { cols: 1, gap: 3 };
    if (isTablet) return { cols: 2, gap: 4 };
    return { cols: 3, gap: 6 };
  }, [isMobile, isTablet]);
  
  // Update local config when prop changes
  useEffect(() => {
    if (timeVariant) {
      setLocalConfig(deepClone(timeVariant));
    }
  }, [timeVariant]);
  
  // Validate configuration on changes
  useEffect(() => {
    const validationErrors = TimeVariantValidator.validate(localConfig);
    setLocalErrors(validationErrors);
    
    const newConflicts = TimeVariantValidator.checkForConflicts(localConfig);
    setConflicts(newConflicts);
  }, [localConfig]);
  
  // Handle field changes
  const handleFieldChange = useCallback((field, value) => {
    setLocalConfig(prev => {
      const updated = deepClone(prev);
      
      // Handle nested fields
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        if (!updated[parent]) updated[parent] = {};
        updated[parent][child] = value;
      } else {
        updated[field] = value;
      }
      
      // Special handling for activation
      if (field === 'is_active' && !value) {
        // When deactivating, clear validation errors
        setLocalErrors({});
      }
      
      return updated;
    });
    
    // Notify parent of change
    if (onChange) {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        onChange(parent, { ...localConfig[parent], [child]: value });
      } else {
        onChange(field, value);
      }
    }
  }, [localConfig, onChange]);
  
  // Toggle boolean field
  const toggleField = useCallback((field) => {
    handleFieldChange(field, !localConfig[field]);
  }, [handleFieldChange, localConfig]);
  
  // Handle time input
  const handleTimeChange = useCallback((field, timeString) => {
    // Ensure time is in HH:MM format
    let formattedTime = timeString;
    if (timeString && !timeString.includes(':')) {
      // Try to parse various formats
      const timeRegex = /(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?/;
      const match = timeString.match(timeRegex);
      if (match) {
        let hours = parseInt(match[1]);
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const seconds = match[3] ? parseInt(match[3]) : 0;
        
        // Handle 12-hour format
        if (timeString.toLowerCase().includes('pm') && hours < 12) hours += 12;
        if (timeString.toLowerCase().includes('am') && hours === 12) hours = 0;
        
        formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        if (seconds > 0) formattedTime += `:${seconds.toString().padStart(2, '0')}`;
      }
    }
    
    handleFieldChange(field, formattedTime);
  }, [handleFieldChange]);
  
  // Handle day selection
  const handleDayToggle = useCallback((day) => {
    const currentDays = localConfig.available_days || [];
    const updatedDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    handleFieldChange('available_days', updatedDays);
  }, [handleFieldChange, localConfig.available_days]);
  
  // Handle date change
  const handleDateChange = useCallback((field, date) => {
    if (date instanceof Date) {
      // Convert to ISO string without timezone offset
      const isoString = date.toISOString().slice(0, 19);
      handleFieldChange(field, isoString);
    } else {
      handleFieldChange(field, date);
    }
  }, [handleFieldChange]);
  
  // Add exclusion date
  const addExclusionDate = useCallback(() => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);
    const currentExclusions = localConfig.exclusion_dates || [];
    
    if (!currentExclusions.includes(dateStr)) {
      handleFieldChange('exclusion_dates', [...currentExclusions, dateStr]);
    }
  }, [handleFieldChange, localConfig.exclusion_dates]);
  
  // Remove exclusion date
  const removeExclusionDate = useCallback((dateStr) => {
    const currentExclusions = localConfig.exclusion_dates || [];
    handleFieldChange('exclusion_dates', currentExclusions.filter(d => d !== dateStr));
  }, [handleFieldChange, localConfig.exclusion_dates]);
  
  // Apply preset
  const applyPreset = useCallback((preset) => {
    setLocalConfig(prev => ({
      ...prev,
      ...preset.config,
      is_active: true
    }));
    setShowPresets(false);
  }, []);
  
  // Test configuration
  const testConfiguration = useCallback(async () => {
    if (isTesting) return;
    
    setIsTesting(true);
    try {
      const result = await TimeVariantApiService.testTimeVariant({
        ...localConfig,
        test_at: new Date().toISOString()
      });
      
      setTestResults(result);
      
      if (isMobile) {
        setMobileSuccessAlert({
          visible: true,
          message: result.success ? 'Test passed!' : 'Test failed'
        });
      }
    } catch (error) {
      console.error('Test failed:', error);
      setTestResults({
        success: false,
        error: error.message
      });
    } finally {
      setIsTesting(false);
    }
  }, [localConfig, isTesting, isMobile]);
  
  // Save configuration
  const saveConfiguration = useCallback(async () => {
    if (isSaving) return;
    
    // Validate
    const validationErrors = TimeVariantValidator.validate(localConfig);
    if (Object.keys(validationErrors).length > 0) {
      setLocalErrors(validationErrors);
      const message = 'Please fix validation errors';
      isMobile ? setMobileSuccessAlert({ visible: true, message }) : alert(message);
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (onSave) {
        await onSave(localConfig);
      }
      
      if (isMobile) {
        setMobileSuccessAlert({ visible: true, message: 'Configuration saved!' });
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [localConfig, isSaving, onSave, isMobile]);
  
  // Calculate availability
  const availabilityInfo = useMemo(() => {
    if (!localConfig.is_active) {
      return {
        is_available_now: true,
        summary: { status: 'always_available', message: 'Available at all times' },
        next_available: null
      };
    }
    
    const isAvailableNow = AvailabilityCalculator.isAvailableAt(localConfig);
    const nextAvailable = AvailabilityCalculator.calculateNextAvailable(localConfig);
    
    return {
      is_available_now: isAvailableNow,
      summary: getAvailabilitySummaryUtil(localConfig),
      next_available: nextAvailable
    };
  }, [localConfig]);
  
  // Check if form is valid
  const isFormValid = useMemo(() => {
    if (!localConfig.is_active) return true;
    
    const errors = TimeVariantValidator.validate(localConfig);
    return Object.keys(errors).length === 0;
  }, [localConfig]);
  
  // Render sections based on screen size
  const renderSections = () => {
    const sections = [
      {
        id: 'time_of_day',
        title: 'Time of Day',
        icon: Clock,
        enabled: localConfig.is_active,
        component: renderTimeOfDaySection
      },
      {
        id: 'days_of_week',
        title: 'Days of Week',
        icon: CalendarDays,
        enabled: localConfig.is_active,
        component: renderDaysOfWeekSection
      },
      {
        id: 'schedule',
        title: 'Schedule',
        icon: CalendarClock,
        enabled: localConfig.is_active && localConfig.schedule_active,
        component: renderScheduleSection
      },
      {
        id: 'duration',
        title: 'Duration',
        icon: Timer,
        enabled: localConfig.is_active && localConfig.duration_active,
        component: renderDurationSection
      },
      {
        id: 'exclusions',
        title: 'Exclusions',
        icon: CalendarOff,
        enabled: localConfig.is_active,
        component: renderExclusionsSection
      },
      {
        id: 'advanced',
        title: 'Advanced',
        icon: Settings,
        enabled: localConfig.is_active,
        component: renderAdvancedSection
      }
    ];
    
    if (compactMode || isMobile) {
      // Mobile: Show active section only
      const active = sections.find(s => s.id === activeSection);
      return active ? (
        <div key={active.id} className="space-y-4">
          {active.component()}
        </div>
      ) : null;
    }
    
    // Desktop/Tablet: Show all sections in grid
    return (
      <div className={`grid grid-cols-${gridConfig.cols} gap-${gridConfig.gap}`}>
        {sections.map(section => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${
              section.enabled 
                ? themeClasses.bg.card 
                : `${themeClasses.bg.card} opacity-50`
            } p-4 rounded-xl border ${themeClasses.border.light} shadow-sm`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center">
                <section.icon className="w-4 h-4 mr-2" />
                {section.title}
              </h3>
              {section.id !== 'time_of_day' && section.id !== 'exclusions' && (
                <button
                  onClick={() => toggleField(
                    section.id === 'schedule' ? 'schedule_active' :
                    section.id === 'duration' ? 'duration_active' :
                    'is_active'
                  )}
                  className={`text-xs px-2 py-1 rounded ${
                    section.enabled
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  {section.enabled ? 'ON' : 'OFF'}
                </button>
              )}
            </div>
            {section.component()}
          </motion.div>
        ))}
      </div>
    );
  };
  
  // Section renderers
  const renderTimeOfDaySection = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs mb-1">Start Time</label>
          <input
            type="time"
            value={localConfig.start_time || ''}
            onChange={(e) => handleTimeChange('start_time', e.target.value)}
            className={`w-full px-3 py-2 text-sm rounded-lg border ${
              localErrors.start_time ? 'border-red-500' : themeClasses.border.normal
            } ${themeClasses.bg.input} ${themeClasses.text.primary}`}
            disabled={!localConfig.is_active}
          />
          {localErrors.start_time && (
            <p className="text-xs text-red-500 mt-1">{localErrors.start_time}</p>
          )}
        </div>
        <div>
          <label className="block text-xs mb-1">End Time</label>
          <input
            type="time"
            value={localConfig.end_time || ''}
            onChange={(e) => handleTimeChange('end_time', e.target.value)}
            className={`w-full px-3 py-2 text-sm rounded-lg border ${
              localErrors.end_time ? 'border-red-500' : themeClasses.border.normal
            } ${themeClasses.bg.input} ${themeClasses.text.primary}`}
            disabled={!localConfig.is_active}
          />
          {localErrors.end_time && (
            <p className="text-xs text-red-500 mt-1">{localErrors.end_time}</p>
          )}
        </div>
      </div>
      <div className="text-xs text-gray-500">
        Plan will be available only between these times
      </div>
    </div>
  );
  
  const renderDaysOfWeekSection = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {daysOfWeek.map(day => {
          const isSelected = (localConfig.available_days || []).includes(day.value);
          return (
            <button
              key={day.value}
              type="button"
              onClick={() => handleDayToggle(day.value)}
              disabled={!localConfig.is_active}
              className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                isSelected
                  ? 'bg-indigo-600 text-white'
                  : `${themeClasses.bg.input} ${themeClasses.text.secondary}`
              } ${!localConfig.is_active ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {day.label.slice(0, 3)}
            </button>
          );
        })}
      </div>
      <div className="text-xs text-gray-500">
        {localConfig.available_days?.length === 0 
          ? 'Select days when plan is available'
          : `Available on: ${localConfig.available_days?.map(d => 
              daysOfWeek.find(day => day.value === d)?.label
            ).join(', ')}`
        }
      </div>
    </div>
  );
  
  const renderScheduleSection = () => (
    <div className="space-y-3">
      <div className="space-y-3">
        <div>
          <label className="block text-xs mb-1">Start Date</label>
          <input
            type="datetime-local"
            value={localConfig.schedule_start_date?.slice(0, 16) || ''}
            onChange={(e) => handleDateChange('schedule_start_date', e.target.value)}
            className={`w-full px-3 py-2 text-sm rounded-lg border ${
              localErrors.schedule_start_date ? 'border-red-500' : themeClasses.border.normal
            } ${themeClasses.bg.input} ${themeClasses.text.primary}`}
            disabled={!localConfig.is_active}
          />
          {localErrors.schedule_start_date && (
            <p className="text-xs text-red-500 mt-1">{localErrors.schedule_start_date}</p>
          )}
        </div>
        <div>
          <label className="block text-xs mb-1">End Date</label>
          <input
            type="datetime-local"
            value={localConfig.schedule_end_date?.slice(0, 16) || ''}
            onChange={(e) => handleDateChange('schedule_end_date', e.target.value)}
            className={`w-full px-3 py-2 text-sm rounded-lg border ${
              localErrors.schedule_end_date ? 'border-red-500' : themeClasses.border.normal
            } ${themeClasses.bg.input} ${themeClasses.text.primary}`}
            disabled={!localConfig.is_active}
          />
          {localErrors.schedule_end_date && (
            <p className="text-xs text-red-500 mt-1">{localErrors.schedule_end_date}</p>
          )}
        </div>
      </div>
      <div className="text-xs text-gray-500">
        Plan will be available only within this date range
      </div>
    </div>
  );
  
  const renderDurationSection = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs mb-1">Duration</label>
          <input
            type="number"
            min="1"
            value={localConfig.duration_value || ''}
            onChange={(e) => handleFieldChange('duration_value', parseInt(e.target.value))}
            className={`w-full px-3 py-2 text-sm rounded-lg border ${
              localErrors.duration_value ? 'border-red-500' : themeClasses.border.normal
            } ${themeClasses.bg.input} ${themeClasses.text.primary}`}
            disabled={!localConfig.is_active}
          />
          {localErrors.duration_value && (
            <p className="text-xs text-red-500 mt-1">{localErrors.duration_value}</p>
          )}
        </div>
        <div>
          <label className="block text-xs mb-1">Unit</label>
          <EnhancedSelect
            options={timeUnits}
            value={localConfig.duration_unit || 'days'}
            onChange={(value) => handleFieldChange('duration_unit', value)}
            theme={theme}
            size="sm"
            disabled={!localConfig.is_active}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs mb-1">Start Date</label>
        <input
          type="datetime-local"
          value={localConfig.duration_start_date?.slice(0, 16) || ''}
          onChange={(e) => handleDateChange('duration_start_date', e.target.value)}
          className={`w-full px-3 py-2 text-sm rounded-lg border ${
            localErrors.duration_start_date ? 'border-red-500' : themeClasses.border.normal
          } ${themeClasses.bg.input} ${themeClasses.text.primary}`}
          disabled={!localConfig.is_active}
        />
        {localErrors.duration_start_date && (
          <p className="text-xs text-red-500 mt-1">{localErrors.duration_start_date}</p>
        )}
      </div>
    </div>
  );
  
  const renderExclusionsSection = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-xs">Exclusion Dates</label>
        <button
          type="button"
          onClick={addExclusionDate}
          disabled={!localConfig.is_active}
          className={`text-xs px-2 py-1 rounded ${
            theme === 'dark' 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } ${!localConfig.is_active ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Plus className="w-3 h-3 inline mr-1" />
          Add Date
        </button>
      </div>
      
      <div className="max-h-32 overflow-y-auto">
        {(localConfig.exclusion_dates || []).map(date => (
          <div key={date} className="flex items-center justify-between py-2 border-b last:border-0">
            <span className="text-sm">{formatDate(date)}</span>
            <button
              type="button"
              onClick={() => removeExclusionDate(date)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {(localConfig.exclusion_dates || []).length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No exclusion dates added
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500">
        Plan will not be available on these dates
      </div>
    </div>
  );
  
  const renderAdvancedSection = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs mb-1">Timezone</label>
        <EnhancedSelect
          options={timeZoneOptions}
          value={localConfig.timezone || 'Africa/Nairobi'}
          onChange={(value) => handleFieldChange('timezone', value)}
          theme={theme}
          size="sm"
          disabled={!localConfig.is_active}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs mb-1">Force Available</label>
          <p className="text-xs text-gray-500">
            Override all restrictions
          </p>
        </div>
        <button
          type="button"
          onClick={() => toggleField('force_available')}
          disabled={!localConfig.is_active}
          className={`relative inline-flex h-6 w-11 items-center rounded-full ${
            localConfig.force_available 
              ? 'bg-green-500' 
              : 'bg-gray-300 dark:bg-gray-700'
          } ${!localConfig.is_active ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            localConfig.force_available ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>
      
      {conflicts.length > 0 && (
        <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start">
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2" />
            <div className="text-xs">
              <p className="font-medium text-yellow-800 dark:text-yellow-300">
                Potential conflicts detected
              </p>
              <ul className="mt-1 space-y-1">
                {conflicts.map((conflict, idx) => (
                  <li key={idx} className="text-yellow-700 dark:text-yellow-400">
                    • {conflict.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  // Mobile navigation for sections
  const renderMobileNavigation = () => (
    <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
      <div className="flex overflow-x-auto space-x-1 p-2">
        {[
          { id: 'time_of_day', label: 'Time', icon: Clock },
          { id: 'days_of_week', label: 'Days', icon: CalendarDays },
          { id: 'schedule', label: 'Schedule', icon: CalendarClock },
          { id: 'duration', label: 'Duration', icon: Timer },
          { id: 'exclusions', label: 'Exclude', icon: CalendarOff },
          { id: 'advanced', label: 'Advanced', icon: Settings }
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex flex-col items-center px-3 py-2 rounded-lg min-w-[70px] transition-colors ${
                isActive
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
  
  // Render availability preview
  const renderAvailabilityPreview = () => (
    <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${
      availabilityInfo.is_available_now
        ? 'bg-green-50 dark:bg-green-900/20'
        : 'bg-red-50 dark:bg-red-900/20'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-semibold mb-2 flex items-center">
            <Clock className={`w-4 h-4 mr-2 ${
              availabilityInfo.is_available_now 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`} />
            Availability Status
          </h4>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                availabilityInfo.is_available_now 
                  ? 'bg-green-500' 
                  : 'bg-red-500'
              }`} />
              <span className="text-sm">
                {availabilityInfo.is_available_now 
                  ? 'Available for purchase now' 
                  : 'Not available at this time'}
              </span>
            </div>
            
            {!availabilityInfo.is_available_now && availabilityInfo.next_available && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Next available: {availabilityInfo.next_available.message}
              </div>
            )}
            
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {availabilityInfo.summary.message}
            </div>
          </div>
        </div>
        
        <button
          onClick={testConfiguration}
          disabled={isTesting || !localConfig.is_active}
          className={`ml-4 px-3 py-1 rounded-lg text-xs ${
            theme === 'dark' 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          } ${(isTesting || !localConfig.is_active) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isTesting ? 'Testing...' : 'Test'}
        </button>
      </div>
      
      {testResults && (
        <div className={`mt-3 p-3 rounded-lg text-sm ${
          testResults.success
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          <div className="flex items-center">
            {testResults.success ? (
              <CheckCircle className="w-4 h-4 mr-2" />
            ) : (
              <XCircle className="w-4 h-4 mr-2" />
            )}
            {testResults.success ? 'Test passed!' : `Test failed: ${testResults.error}`}
          </div>
        </div>
      )}
    </div>
  );
  
  // Render presets modal
  const renderPresetsModal = () => (
    <AnimatePresence>
      {showPresets && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowPresets(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className={`w-full max-w-md rounded-xl p-6 ${themeClasses.bg.card} border ${themeClasses.border.light} shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Quick Presets</h3>
              <button
                onClick={() => setShowPresets(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              {timeRangePresets.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    theme === 'dark' 
                      ? 'border-gray-700 hover:border-gray-600 hover:bg-gray-800' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{preset.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{preset.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowPresets(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative">
      {showHeader && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center">
                <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                Time Variant Configuration
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Configure when this plan is available for purchase
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPresets(true)}
                className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Apply Preset
              </button>
              
              <div className="flex items-center">
                <span className="text-sm mr-2">Enabled</span>
                <button
                  onClick={() => toggleField('is_active')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    localConfig.is_active 
                      ? 'bg-green-500' 
                      : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    localConfig.is_active ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>
          
          {!localConfig.is_active && (
            <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Time variant controls are disabled. Enable to configure availability restrictions.
              </p>
            </div>
          )}
        </div>
      )}
      
      {localConfig.is_active ? (
        <>
          {isMobile && renderMobileNavigation()}
          
          <div className="space-y-6">
            {renderAvailabilityPreview()}
            {renderSections()}
          </div>
          
          <div className={`mt-8 pt-6 border-t ${themeClasses.border.light}`}>
            <div className="flex justify-between">
              <div className="text-sm text-gray-500">
                {isFormValid ? (
                  <span className="text-green-600 dark:text-green-400 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Configuration is valid
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Fix errors to save
                  </span>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setLocalConfig(deepClone(timeVariant || {}))}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Reset
                </button>
                
                <button
                  onClick={saveConfiguration}
                  disabled={isSaving || !isFormValid}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    isFormValid && !isSaving
                      ? themeClasses.button.success
                      : 'bg-gray-400 cursor-not-allowed dark:bg-gray-700'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Configuration
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Time Variant Disabled</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            This plan is currently available at all times. Enable time variant controls to restrict availability.
          </p>
          <button
            onClick={() => toggleField('is_active')}
            className="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Enable Time Controls
          </button>
        </div>
      )}
      
      {renderPresetsModal()}
      
      <MobileSuccessAlert 
        message={mobileSuccessAlert.message}
        isVisible={mobileSuccessAlert.visible}
        onClose={() => setMobileSuccessAlert({ visible: false, message: "" })}
        theme={theme}
      />
    </div>
  );
};

// Helper component (ChevronRight)
const ChevronRight = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

// Settings icon
const Settings = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default TimeVariantConfig;
export { TimeVariantApiService, TimeVariantDataStructure, TimeVariantValidator, AvailabilityCalculator };