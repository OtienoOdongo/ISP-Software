import { useState, useCallback, useEffect } from "react";
import { validateTimeVariant as validateTimeVariantUtil } from "../../Shared/utils.js";
import { timeZoneOptions, daysOfWeek, timeUnits } from "../../Shared/constant.js";

// Initial time variant state
export const getInitialTimeVariantState = () => ({
  is_active: false,
  start_time: null,
  end_time: null,
  available_days: [],
  schedule_active: false,
  schedule_start_date: null,
  schedule_end_date: null,
  duration_active: false,
  duration_value: 0,
  duration_unit: "days",
  duration_start_date: null,
  exclusion_dates: [],
  timezone: "Africa/Nairobi",
  force_available: false
});

const useTimeVariant = (initialState = getInitialTimeVariantState()) => {
  const [timeVariant, setTimeVariant] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Handle basic field changes
  const handleChange = useCallback((field, value) => {
    setTimeVariant(prev => ({ 
      ...prev, 
      [field]: value 
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Handle time field changes
  const handleTimeChange = useCallback((field, timeString) => {
    if (!timeString) {
      handleChange(field, null);
      return;
    }

    // Parse time string (accepts "HH:MM", "HH:MM:SS", "HH:MM AM/PM")
    let parsedTime = null;
    try {
      const [timePart, period] = timeString.split(' ');
      let [hours, minutes, seconds = "00"] = timePart.split(':');
      
      hours = parseInt(hours);
      minutes = parseInt(minutes);
      
      if (period) {
        if (period.toLowerCase() === 'pm' && hours < 12) hours += 12;
        if (period.toLowerCase() === 'am' && hours === 12) hours = 0;
      }
      
      // Create time object
      parsedTime = { hours, minutes, seconds: seconds ? parseInt(seconds) : 0 };
    } catch (error) {
      console.error('Error parsing time:', error);
    }
    
    handleChange(field, parsedTime);
  }, [handleChange]);

  // Handle date field changes
  const handleDateChange = useCallback((field, dateString) => {
    if (!dateString) {
      handleChange(field, null);
      return;
    }

    try {
      const date = new Date(dateString);
      handleChange(field, date);
    } catch (error) {
      console.error('Error parsing date:', error);
    }
  }, [handleChange]);

  // Toggle day in available days
  const toggleDay = useCallback((day) => {
    setTimeVariant(prev => {
      const availableDays = [...prev.available_days];
      const index = availableDays.indexOf(day);
      
      if (index > -1) {
        // Remove day if already selected
        availableDays.splice(index, 1);
      } else {
        // Add day if not selected
        availableDays.push(day);
      }
      
      return { ...prev, available_days: availableDays };
    });
  }, []);

  // Add exclusion date
  const addExclusionDate = useCallback((dateString) => {
    if (!dateString) return;
    
    setTimeVariant(prev => {
      const exclusionDates = [...prev.exclusion_dates];
      if (!exclusionDates.includes(dateString)) {
        exclusionDates.push(dateString);
      }
      return { ...prev, exclusion_dates: exclusionDates };
    });
  }, []);

  // Remove exclusion date
  const removeExclusionDate = useCallback((dateString) => {
    setTimeVariant(prev => {
      const exclusionDates = prev.exclusion_dates.filter(date => date !== dateString);
      return { ...prev, exclusion_dates: exclusionDates };
    });
  }, []);

  // Clear all exclusion dates
  const clearExclusionDates = useCallback(() => {
    setTimeVariant(prev => ({ ...prev, exclusion_dates: [] }));
  }, []);

  // Toggle schedule active
  const toggleSchedule = useCallback((active) => {
    setTimeVariant(prev => ({
      ...prev,
      schedule_active: active,
      // Clear schedule dates when deactivating
      schedule_start_date: active ? prev.schedule_start_date : null,
      schedule_end_date: active ? prev.schedule_end_date : null
    }));
  }, []);

  // Toggle duration active
  const toggleDuration = useCallback((active) => {
    setTimeVariant(prev => ({
      ...prev,
      duration_active: active,
      // Clear duration dates when deactivating
      duration_start_date: active ? prev.duration_start_date : null,
      duration_value: active ? prev.duration_value : 0
    }));
  }, []);

  // Handle field blur
  const handleFieldBlur = useCallback((field) => {
    if (!touched[field]) {
      setTouched(prev => ({ ...prev, [field]: true }));
    }
  }, [touched]);

  // Validate a specific field
  const validateField = useCallback((field, value) => {
    const fieldErrors = validateTimeVariantUtil({ [field]: value });
    const error = fieldErrors[field];
    
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
      return false;
    }
    
    // Clear error if validation passes
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    return true;
  }, [errors]);

  // Validate entire time variant configuration
  const validateTimeVariant = useCallback(() => {
    const validationErrors = validateTimeVariantUtil(timeVariant);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [timeVariant]);

  // Check if time variant is valid for activation
  const canActivate = useCallback(() => {
    if (!timeVariant.is_active) return true;
    
    const errors = validateTimeVariantUtil(timeVariant);
    return Object.keys(errors).length === 0;
  }, [timeVariant]);

  // Calculate end date based on duration
  const calculateDurationEnd = useCallback(() => {
    if (!timeVariant.duration_active || !timeVariant.duration_start_date) {
      return null;
    }

    const startDate = new Date(timeVariant.duration_start_date);
    const durationValue = timeVariant.duration_value || 0;
    
    switch (timeVariant.duration_unit) {
      case 'hours':
        startDate.setHours(startDate.getHours() + durationValue);
        break;
      case 'days':
        startDate.setDate(startDate.getDate() + durationValue);
        break;
      case 'weeks':
        startDate.setDate(startDate.getDate() + (durationValue * 7));
        break;
      case 'months':
        startDate.setMonth(startDate.getMonth() + durationValue);
        break;
      default:
        break;
    }
    
    return startDate;
  }, [timeVariant]);

  // Check if plan is available now (for real-time validation)
  const isAvailableNow = useCallback(() => {
    if (!timeVariant.is_active || timeVariant.force_available) {
      return true;
    }

    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0];
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase().slice(0, 3);
    
    // Check time of day restrictions
    if (timeVariant.start_time && timeVariant.end_time) {
      const startTimeStr = `${timeVariant.start_time.hours.toString().padStart(2, '0')}:${timeVariant.start_time.minutes.toString().padStart(2, '0')}`;
      const endTimeStr = `${timeVariant.end_time.hours.toString().padStart(2, '0')}:${timeVariant.end_time.minutes.toString().padStart(2, '0')}`;
      
      if (currentTime < startTimeStr || currentTime > endTimeStr) {
        return false;
      }
    }
    
    // Check day of week restrictions
    if (timeVariant.available_days.length > 0 && !timeVariant.available_days.includes(currentDay)) {
      return false;
    }
    
    // Check scheduled availability
    if (timeVariant.schedule_active && timeVariant.schedule_start_date && timeVariant.schedule_end_date) {
      const startDate = new Date(timeVariant.schedule_start_date);
      const endDate = new Date(timeVariant.schedule_end_date);
      
      if (now < startDate || now > endDate) {
        return false;
      }
    }
    
    // Check duration-based availability
    if (timeVariant.duration_active && timeVariant.duration_start_date) {
      const durationEnd = calculateDurationEnd();
      if (durationEnd && now > durationEnd) {
        return false;
      }
    }
    
    // Check exclusion dates
    if (timeVariant.exclusion_dates.length > 0) {
      const currentDateStr = now.toISOString().split('T')[0];
      if (timeVariant.exclusion_dates.includes(currentDateStr)) {
        return false;
      }
    }
    
    return true;
  }, [timeVariant, calculateDurationEnd]);

  // Get next available time
  const getNextAvailableTime = useCallback(() => {
    if (!timeVariant.is_active || isAvailableNow()) {
      return null;
    }

    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0];
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase().slice(0, 3);
    
    // Check time of day restrictions
    if (timeVariant.start_time && timeVariant.end_time) {
      const startTimeStr = `${timeVariant.start_time.hours.toString().padStart(2, '0')}:${timeVariant.start_time.minutes.toString().padStart(2, '0')}`;
      
      if (currentTime < startTimeStr) {
        return {
          type: 'time_of_day',
          time: startTimeStr,
          message: `Available today at ${startTimeStr}`
        };
      } else {
        // Available tomorrow
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return {
          type: 'time_of_day',
          time: `${tomorrow.toISOString().split('T')[0]}T${startTimeStr}`,
          message: `Available tomorrow at ${startTimeStr}`
        };
      }
    }
    
    // Check day of week restrictions
    if (timeVariant.available_days.length > 0 && !timeVariant.available_days.includes(currentDay)) {
      // Find next available day
      const daysAhead = [];
      for (let i = 1; i <= 7; i++) {
        const nextDay = new Date(now);
        nextDay.setDate(nextDay.getDate() + i);
        const nextDayStr = nextDay.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase().slice(0, 3);
        
        if (timeVariant.available_days.includes(nextDayStr)) {
          daysAhead.push({
            day: nextDayStr,
            date: nextDay,
            daysAhead: i
          });
        }
      }
      
      if (daysAhead.length > 0) {
        const next = daysAhead[0];
        const dayName = daysOfWeek.find(d => d.value === next.day)?.label || next.day;
        return {
          type: 'day_of_week',
          date: next.date.toISOString(),
          daysAhead: next.daysAhead,
          message: `Available on ${dayName} (${next.date.toLocaleDateString()})`
        };
      }
    }
    
    return null;
  }, [timeVariant, isAvailableNow]);

  // Reset time variant
  const resetTimeVariant = useCallback(() => {
    setTimeVariant(getInitialTimeVariantState());
    setErrors({});
    setTouched({});
  }, []);

  // Load time variant from data
  const loadTimeVariant = useCallback((data) => {
    if (!data) {
      resetTimeVariant();
      return;
    }

    // Parse time objects if they're strings
    const parsedData = { ...data };
    
    if (parsedData.start_time && typeof parsedData.start_time === 'string') {
      const [hours, minutes] = parsedData.start_time.split(':');
      parsedData.start_time = { 
        hours: parseInt(hours), 
        minutes: parseInt(minutes), 
        seconds: 0 
      };
    }
    
    if (parsedData.end_time && typeof parsedData.end_time === 'string') {
      const [hours, minutes] = parsedData.end_time.split(':');
      parsedData.end_time = { 
        hours: parseInt(hours), 
        minutes: parseInt(minutes), 
        seconds: 0 
      };
    }
    
    setTimeVariant(parsedData);
    setErrors({});
    setTouched({});
  }, [resetTimeVariant]);

  // Get availability summary
  const getAvailabilitySummary = useCallback(() => {
    if (!timeVariant.is_active) {
      return {
        status: 'always_available',
        message: 'Available at all times',
        restrictions: []
      };
    }

    const summary = {
      status: 'time_restricted',
      is_available_now: isAvailableNow(),
      restrictions: []
    };

    if (timeVariant.start_time && timeVariant.end_time) {
      const startTime = `${timeVariant.start_time.hours.toString().padStart(2, '0')}:${timeVariant.start_time.minutes.toString().padStart(2, '0')}`;
      const endTime = `${timeVariant.end_time.hours.toString().padStart(2, '0')}:${timeVariant.end_time.minutes.toString().padStart(2, '0')}`;
      
      summary.restrictions.push({
        type: 'time_of_day',
        start: startTime,
        end: endTime,
        description: `Available from ${startTime} to ${endTime}`
      });
    }

    if (timeVariant.available_days.length > 0) {
      const dayNames = timeVariant.available_days.map(day => 
        daysOfWeek.find(d => d.value === day)?.label || day
      );
      
      summary.restrictions.push({
        type: 'days_of_week',
        days: timeVariant.available_days,
        day_names: dayNames,
        description: `Available on ${dayNames.join(', ')}`
      });
    }

    if (timeVariant.schedule_active && timeVariant.schedule_start_date && timeVariant.schedule_end_date) {
      const startDate = new Date(timeVariant.schedule_start_date).toLocaleDateString();
      const endDate = new Date(timeVariant.schedule_end_date).toLocaleDateString();
      
      summary.restrictions.push({
        type: 'scheduled',
        start: timeVariant.schedule_start_date,
        end: timeVariant.schedule_end_date,
        description: `Scheduled from ${startDate} to ${endDate}`
      });
    }

    if (timeVariant.duration_active && timeVariant.duration_start_date) {
      const durationEnd = calculateDurationEnd();
      const startDate = new Date(timeVariant.duration_start_date).toLocaleDateString();
      const endDate = durationEnd ? durationEnd.toLocaleDateString() : 'Not calculated';
      
      summary.restrictions.push({
        type: 'duration',
        value: timeVariant.duration_value,
        unit: timeVariant.duration_unit,
        start: timeVariant.duration_start_date,
        end: durationEnd,
        description: `Available for ${timeVariant.duration_value} ${timeVariant.duration_unit} from ${startDate} to ${endDate}`
      });
    }

    if (timeVariant.exclusion_dates.length > 0) {
      summary.restrictions.push({
        type: 'exclusions',
        dates: timeVariant.exclusion_dates,
        count: timeVariant.exclusion_dates.length,
        description: `Not available on ${timeVariant.exclusion_dates.length} specific dates`
      });
    }

    return summary;
  }, [timeVariant, isAvailableNow, calculateDurationEnd]);

  // Effect to validate when time variant changes
  useEffect(() => {
    if (timeVariant.is_active) {
      const validationErrors = validateTimeVariantUtil(timeVariant);
      setErrors(validationErrors);
    } else {
      setErrors({});
    }
  }, [timeVariant]);

  return {
    timeVariant,
    setTimeVariant: loadTimeVariant,
    errors,
    touched,
    handleChange,
    handleTimeChange,
    handleDateChange,
    toggleDay,
    addExclusionDate,
    removeExclusionDate,
    clearExclusionDates,
    toggleSchedule,
    toggleDuration,
    handleFieldBlur,
    validateField,
    validateTimeVariant,
    canActivate,
    calculateDurationEnd,
    isAvailableNow,
    getNextAvailableTime,
    resetTimeVariant,
    getAvailabilitySummary,
    timeZoneOptions,
    daysOfWeek,
    timeUnits
  };
};

export default useTimeVariant;