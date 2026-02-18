// import { useState, useCallback, useEffect } from "react";
// import { validateTimeVariant as validateTimeVariantUtil } from "../../Shared/utils.js";
// import { timeZoneOptions, daysOfWeek, timeUnits } from "../../Shared/constant.js";

// // Initial time variant state
// export const getInitialTimeVariantState = () => ({
//   is_active: false,
//   start_time: null,
//   end_time: null,
//   available_days: [],
//   schedule_active: false,
//   schedule_start_date: null,
//   schedule_end_date: null,
//   duration_active: false,
//   duration_value: 0,
//   duration_unit: "days",
//   duration_start_date: null,
//   exclusion_dates: [],
//   timezone: "Africa/Nairobi",
//   force_available: false
// });

// const useTimeVariant = (initialState = getInitialTimeVariantState()) => {
//   const [timeVariant, setTimeVariant] = useState(initialState);
//   const [errors, setErrors] = useState({});
//   const [touched, setTouched] = useState({});

//   // Handle basic field changes
//   const handleChange = useCallback((field, value) => {
//     setTimeVariant(prev => ({ 
//       ...prev, 
//       [field]: value 
//     }));
    
//     // Clear error when user starts typing
//     if (errors[field]) {
//       setErrors(prev => ({ ...prev, [field]: '' }));
//     }
//   }, [errors]);

//   // Handle time field changes
//   const handleTimeChange = useCallback((field, timeString) => {
//     if (!timeString) {
//       handleChange(field, null);
//       return;
//     }

//     // Parse time string (accepts "HH:MM", "HH:MM:SS", "HH:MM AM/PM")
//     let parsedTime = null;
//     try {
//       const [timePart, period] = timeString.split(' ');
//       let [hours, minutes, seconds = "00"] = timePart.split(':');
      
//       hours = parseInt(hours);
//       minutes = parseInt(minutes);
      
//       if (period) {
//         if (period.toLowerCase() === 'pm' && hours < 12) hours += 12;
//         if (period.toLowerCase() === 'am' && hours === 12) hours = 0;
//       }
      
//       // Create time object
//       parsedTime = { hours, minutes, seconds: seconds ? parseInt(seconds) : 0 };
//     } catch (error) {
//       console.error('Error parsing time:', error);
//     }
    
//     handleChange(field, parsedTime);
//   }, [handleChange]);

//   // Handle date field changes
//   const handleDateChange = useCallback((field, dateString) => {
//     if (!dateString) {
//       handleChange(field, null);
//       return;
//     }

//     try {
//       const date = new Date(dateString);
//       handleChange(field, date);
//     } catch (error) {
//       console.error('Error parsing date:', error);
//     }
//   }, [handleChange]);

//   // Toggle day in available days
//   const toggleDay = useCallback((day) => {
//     setTimeVariant(prev => {
//       const availableDays = [...prev.available_days];
//       const index = availableDays.indexOf(day);
      
//       if (index > -1) {
//         // Remove day if already selected
//         availableDays.splice(index, 1);
//       } else {
//         // Add day if not selected
//         availableDays.push(day);
//       }
      
//       return { ...prev, available_days: availableDays };
//     });
//   }, []);

//   // Add exclusion date
//   const addExclusionDate = useCallback((dateString) => {
//     if (!dateString) return;
    
//     setTimeVariant(prev => {
//       const exclusionDates = [...prev.exclusion_dates];
//       if (!exclusionDates.includes(dateString)) {
//         exclusionDates.push(dateString);
//       }
//       return { ...prev, exclusion_dates: exclusionDates };
//     });
//   }, []);

//   // Remove exclusion date
//   const removeExclusionDate = useCallback((dateString) => {
//     setTimeVariant(prev => {
//       const exclusionDates = prev.exclusion_dates.filter(date => date !== dateString);
//       return { ...prev, exclusion_dates: exclusionDates };
//     });
//   }, []);

//   // Clear all exclusion dates
//   const clearExclusionDates = useCallback(() => {
//     setTimeVariant(prev => ({ ...prev, exclusion_dates: [] }));
//   }, []);

//   // Toggle schedule active
//   const toggleSchedule = useCallback((active) => {
//     setTimeVariant(prev => ({
//       ...prev,
//       schedule_active: active,
//       // Clear schedule dates when deactivating
//       schedule_start_date: active ? prev.schedule_start_date : null,
//       schedule_end_date: active ? prev.schedule_end_date : null
//     }));
//   }, []);

//   // Toggle duration active
//   const toggleDuration = useCallback((active) => {
//     setTimeVariant(prev => ({
//       ...prev,
//       duration_active: active,
//       // Clear duration dates when deactivating
//       duration_start_date: active ? prev.duration_start_date : null,
//       duration_value: active ? prev.duration_value : 0
//     }));
//   }, []);

//   // Handle field blur
//   const handleFieldBlur = useCallback((field) => {
//     if (!touched[field]) {
//       setTouched(prev => ({ ...prev, [field]: true }));
//     }
//   }, [touched]);

//   // Validate a specific field
//   const validateField = useCallback((field, value) => {
//     const fieldErrors = validateTimeVariantUtil({ [field]: value });
//     const error = fieldErrors[field];
    
//     if (error) {
//       setErrors(prev => ({ ...prev, [field]: error }));
//       return false;
//     }
    
//     // Clear error if validation passes
//     if (errors[field]) {
//       setErrors(prev => ({ ...prev, [field]: '' }));
//     }
    
//     return true;
//   }, [errors]);

//   // Validate entire time variant configuration
//   const validateTimeVariant = useCallback(() => {
//     const validationErrors = validateTimeVariantUtil(timeVariant);
//     setErrors(validationErrors);
//     return Object.keys(validationErrors).length === 0;
//   }, [timeVariant]);

//   // Check if time variant is valid for activation
//   const canActivate = useCallback(() => {
//     if (!timeVariant.is_active) return true;
    
//     const errors = validateTimeVariantUtil(timeVariant);
//     return Object.keys(errors).length === 0;
//   }, [timeVariant]);

//   // Calculate end date based on duration
//   const calculateDurationEnd = useCallback(() => {
//     if (!timeVariant.duration_active || !timeVariant.duration_start_date) {
//       return null;
//     }

//     const startDate = new Date(timeVariant.duration_start_date);
//     const durationValue = timeVariant.duration_value || 0;
    
//     switch (timeVariant.duration_unit) {
//       case 'hours':
//         startDate.setHours(startDate.getHours() + durationValue);
//         break;
//       case 'days':
//         startDate.setDate(startDate.getDate() + durationValue);
//         break;
//       case 'weeks':
//         startDate.setDate(startDate.getDate() + (durationValue * 7));
//         break;
//       case 'months':
//         startDate.setMonth(startDate.getMonth() + durationValue);
//         break;
//       default:
//         break;
//     }
    
//     return startDate;
//   }, [timeVariant]);

//   // Check if plan is available now (for real-time validation)
//   const isAvailableNow = useCallback(() => {
//     if (!timeVariant.is_active || timeVariant.force_available) {
//       return true;
//     }

//     const now = new Date();
//     const currentTime = now.toTimeString().split(' ')[0];
//     const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase().slice(0, 3);
    
//     // Check time of day restrictions
//     if (timeVariant.start_time && timeVariant.end_time) {
//       const startTimeStr = `${timeVariant.start_time.hours.toString().padStart(2, '0')}:${timeVariant.start_time.minutes.toString().padStart(2, '0')}`;
//       const endTimeStr = `${timeVariant.end_time.hours.toString().padStart(2, '0')}:${timeVariant.end_time.minutes.toString().padStart(2, '0')}`;
      
//       if (currentTime < startTimeStr || currentTime > endTimeStr) {
//         return false;
//       }
//     }
    
//     // Check day of week restrictions
//     if (timeVariant.available_days.length > 0 && !timeVariant.available_days.includes(currentDay)) {
//       return false;
//     }
    
//     // Check scheduled availability
//     if (timeVariant.schedule_active && timeVariant.schedule_start_date && timeVariant.schedule_end_date) {
//       const startDate = new Date(timeVariant.schedule_start_date);
//       const endDate = new Date(timeVariant.schedule_end_date);
      
//       if (now < startDate || now > endDate) {
//         return false;
//       }
//     }
    
//     // Check duration-based availability
//     if (timeVariant.duration_active && timeVariant.duration_start_date) {
//       const durationEnd = calculateDurationEnd();
//       if (durationEnd && now > durationEnd) {
//         return false;
//       }
//     }
    
//     // Check exclusion dates
//     if (timeVariant.exclusion_dates.length > 0) {
//       const currentDateStr = now.toISOString().split('T')[0];
//       if (timeVariant.exclusion_dates.includes(currentDateStr)) {
//         return false;
//       }
//     }
    
//     return true;
//   }, [timeVariant, calculateDurationEnd]);

//   // Get next available time
//   const getNextAvailableTime = useCallback(() => {
//     if (!timeVariant.is_active || isAvailableNow()) {
//       return null;
//     }

//     const now = new Date();
//     const currentTime = now.toTimeString().split(' ')[0];
//     const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase().slice(0, 3);
    
//     // Check time of day restrictions
//     if (timeVariant.start_time && timeVariant.end_time) {
//       const startTimeStr = `${timeVariant.start_time.hours.toString().padStart(2, '0')}:${timeVariant.start_time.minutes.toString().padStart(2, '0')}`;
      
//       if (currentTime < startTimeStr) {
//         return {
//           type: 'time_of_day',
//           time: startTimeStr,
//           message: `Available today at ${startTimeStr}`
//         };
//       } else {
//         // Available tomorrow
//         const tomorrow = new Date(now);
//         tomorrow.setDate(tomorrow.getDate() + 1);
//         return {
//           type: 'time_of_day',
//           time: `${tomorrow.toISOString().split('T')[0]}T${startTimeStr}`,
//           message: `Available tomorrow at ${startTimeStr}`
//         };
//       }
//     }
    
//     // Check day of week restrictions
//     if (timeVariant.available_days.length > 0 && !timeVariant.available_days.includes(currentDay)) {
//       // Find next available day
//       const daysAhead = [];
//       for (let i = 1; i <= 7; i++) {
//         const nextDay = new Date(now);
//         nextDay.setDate(nextDay.getDate() + i);
//         const nextDayStr = nextDay.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase().slice(0, 3);
        
//         if (timeVariant.available_days.includes(nextDayStr)) {
//           daysAhead.push({
//             day: nextDayStr,
//             date: nextDay,
//             daysAhead: i
//           });
//         }
//       }
      
//       if (daysAhead.length > 0) {
//         const next = daysAhead[0];
//         const dayName = daysOfWeek.find(d => d.value === next.day)?.label || next.day;
//         return {
//           type: 'day_of_week',
//           date: next.date.toISOString(),
//           daysAhead: next.daysAhead,
//           message: `Available on ${dayName} (${next.date.toLocaleDateString()})`
//         };
//       }
//     }
    
//     return null;
//   }, [timeVariant, isAvailableNow]);

//   // Reset time variant
//   const resetTimeVariant = useCallback(() => {
//     setTimeVariant(getInitialTimeVariantState());
//     setErrors({});
//     setTouched({});
//   }, []);

//   // Load time variant from data
//   const loadTimeVariant = useCallback((data) => {
//     if (!data) {
//       resetTimeVariant();
//       return;
//     }

//     // Parse time objects if they're strings
//     const parsedData = { ...data };
    
//     if (parsedData.start_time && typeof parsedData.start_time === 'string') {
//       const [hours, minutes] = parsedData.start_time.split(':');
//       parsedData.start_time = { 
//         hours: parseInt(hours), 
//         minutes: parseInt(minutes), 
//         seconds: 0 
//       };
//     }
    
//     if (parsedData.end_time && typeof parsedData.end_time === 'string') {
//       const [hours, minutes] = parsedData.end_time.split(':');
//       parsedData.end_time = { 
//         hours: parseInt(hours), 
//         minutes: parseInt(minutes), 
//         seconds: 0 
//       };
//     }
    
//     setTimeVariant(parsedData);
//     setErrors({});
//     setTouched({});
//   }, [resetTimeVariant]);

//   // Get availability summary
//   const getAvailabilitySummary = useCallback(() => {
//     if (!timeVariant.is_active) {
//       return {
//         status: 'always_available',
//         message: 'Available at all times',
//         restrictions: []
//       };
//     }

//     const summary = {
//       status: 'time_restricted',
//       is_available_now: isAvailableNow(),
//       restrictions: []
//     };

//     if (timeVariant.start_time && timeVariant.end_time) {
//       const startTime = `${timeVariant.start_time.hours.toString().padStart(2, '0')}:${timeVariant.start_time.minutes.toString().padStart(2, '0')}`;
//       const endTime = `${timeVariant.end_time.hours.toString().padStart(2, '0')}:${timeVariant.end_time.minutes.toString().padStart(2, '0')}`;
      
//       summary.restrictions.push({
//         type: 'time_of_day',
//         start: startTime,
//         end: endTime,
//         description: `Available from ${startTime} to ${endTime}`
//       });
//     }

//     if (timeVariant.available_days.length > 0) {
//       const dayNames = timeVariant.available_days.map(day => 
//         daysOfWeek.find(d => d.value === day)?.label || day
//       );
      
//       summary.restrictions.push({
//         type: 'days_of_week',
//         days: timeVariant.available_days,
//         day_names: dayNames,
//         description: `Available on ${dayNames.join(', ')}`
//       });
//     }

//     if (timeVariant.schedule_active && timeVariant.schedule_start_date && timeVariant.schedule_end_date) {
//       const startDate = new Date(timeVariant.schedule_start_date).toLocaleDateString();
//       const endDate = new Date(timeVariant.schedule_end_date).toLocaleDateString();
      
//       summary.restrictions.push({
//         type: 'scheduled',
//         start: timeVariant.schedule_start_date,
//         end: timeVariant.schedule_end_date,
//         description: `Scheduled from ${startDate} to ${endDate}`
//       });
//     }

//     if (timeVariant.duration_active && timeVariant.duration_start_date) {
//       const durationEnd = calculateDurationEnd();
//       const startDate = new Date(timeVariant.duration_start_date).toLocaleDateString();
//       const endDate = durationEnd ? durationEnd.toLocaleDateString() : 'Not calculated';
      
//       summary.restrictions.push({
//         type: 'duration',
//         value: timeVariant.duration_value,
//         unit: timeVariant.duration_unit,
//         start: timeVariant.duration_start_date,
//         end: durationEnd,
//         description: `Available for ${timeVariant.duration_value} ${timeVariant.duration_unit} from ${startDate} to ${endDate}`
//       });
//     }

//     if (timeVariant.exclusion_dates.length > 0) {
//       summary.restrictions.push({
//         type: 'exclusions',
//         dates: timeVariant.exclusion_dates,
//         count: timeVariant.exclusion_dates.length,
//         description: `Not available on ${timeVariant.exclusion_dates.length} specific dates`
//       });
//     }

//     return summary;
//   }, [timeVariant, isAvailableNow, calculateDurationEnd]);

//   // Effect to validate when time variant changes
//   useEffect(() => {
//     if (timeVariant.is_active) {
//       const validationErrors = validateTimeVariantUtil(timeVariant);
//       setErrors(validationErrors);
//     } else {
//       setErrors({});
//     }
//   }, [timeVariant]);

//   return {
//     timeVariant,
//     setTimeVariant: loadTimeVariant,
//     errors,
//     touched,
//     handleChange,
//     handleTimeChange,
//     handleDateChange,
//     toggleDay,
//     addExclusionDate,
//     removeExclusionDate,
//     clearExclusionDates,
//     toggleSchedule,
//     toggleDuration,
//     handleFieldBlur,
//     validateField,
//     validateTimeVariant,
//     canActivate,
//     calculateDurationEnd,
//     isAvailableNow,
//     getNextAvailableTime,
//     resetTimeVariant,
//     getAvailabilitySummary,
//     timeZoneOptions,
//     daysOfWeek,
//     timeUnits
//   };
// };

// export default useTimeVariant;




import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { validateTimeVariant as validateTimeVariantUtil } from "../../Shared/utils.js";

// Time units - matches backend TIME_UNITS choices exactly
export const TIME_UNITS = [
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' }
];

// Days of week - matches backend DAYS_OF_WEEK choices exactly
export const DAYS_OF_WEEK = [
  { value: 'mon', label: 'Monday' },
  { value: 'tue', label: 'Tuesday' },
  { value: 'wed', label: 'Wednesday' },
  { value: 'thu', label: 'Thursday' },
  { value: 'fri', label: 'Friday' },
  { value: 'sat', label: 'Saturday' },
  { value: 'sun', label: 'Sunday' }
];

// Timezone options - matches common IANA timezones
export const TIMEZONE_OPTIONS = [
  { value: 'Africa/Nairobi', label: 'Nairobi (EAT)' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)' },
  { value: 'Africa/Lagos', label: 'Lagos (WAT)' },
  { value: 'Africa/Cairo', label: 'Cairo (EET)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)' },
  { value: 'America/Denver', label: 'Denver (MST/MDT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' }
];

// Quick presets - common time variant configurations
export const TIME_PRESETS = [
  {
    id: 'business_hours',
    name: 'Business Hours',
    description: 'Available Monday-Friday, 9 AM - 5 PM',
    config: {
      is_active: true,
      start_time: '09:00',
      end_time: '17:00',
      available_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
      schedule_active: false,
      duration_active: false,
      exclusion_dates: [],
      timezone: 'Africa/Nairobi',
      force_available: false
    }
  },
  {
    id: 'evenings_weekends',
    name: 'Evenings & Weekends',
    description: 'Available weekdays 6 PM - 11 PM, all day weekends',
    config: {
      is_active: true,
      start_time: '18:00',
      end_time: '23:00',
      available_days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      schedule_active: false,
      duration_active: false,
      exclusion_dates: [],
      timezone: 'Africa/Nairobi',
      force_available: false
    }
  },
  {
    id: 'weekend_only',
    name: 'Weekend Only',
    description: 'Available Saturday and Sunday only',
    config: {
      is_active: true,
      start_time: null,
      end_time: null,
      available_days: ['sat', 'sun'],
      schedule_active: false,
      duration_active: false,
      exclusion_dates: [],
      timezone: 'Africa/Nairobi',
      force_available: false
    }
  },
  {
    id: 'limited_time_promo',
    name: 'Limited Time Promo',
    description: 'Available for 30 days starting now',
    config: {
      is_active: true,
      start_time: null,
      end_time: null,
      available_days: [],
      schedule_active: true,
      schedule_start_date: new Date().toISOString().slice(0, 16),
      schedule_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      duration_active: false,
      exclusion_dates: [],
      timezone: 'Africa/Nairobi',
      force_available: false
    }
  },
  {
    id: 'peak_hours',
    name: 'Peak Hours Only',
    description: 'Available during peak hours (6 PM - 10 PM weekdays)',
    config: {
      is_active: true,
      start_time: '18:00',
      end_time: '22:00',
      available_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
      schedule_active: false,
      duration_active: false,
      exclusion_dates: [],
      timezone: 'Africa/Nairobi',
      force_available: false
    }
  }
];

// Initial time variant state - MATCHES BACKEND TIMEVARIANTCONFIG MODEL
export const getInitialTimeVariantState = () => ({
  is_active: false,
  start_time: null,           // HH:MM format string
  end_time: null,              // HH:MM format string
  available_days: [],          // ['mon', 'tue', ...]
  schedule_active: false,
  schedule_start_date: null,   // ISO datetime string (YYYY-MM-DDTHH:MM)
  schedule_end_date: null,     // ISO datetime string (YYYY-MM-DDTHH:MM)
  duration_active: false,
  duration_value: 0,           // Positive integer
  duration_unit: 'days',       // 'hours', 'days', 'weeks', 'months'
  duration_start_date: null,   // ISO datetime string (YYYY-MM-DDTHH:MM)
  exclusion_dates: [],         // ['YYYY-MM-DD', ...]
  timezone: 'Africa/Nairobi',  // IANA timezone
  force_available: false,
  
  // Metadata
  id: null,                    // Backend ID when loaded
  created_at: null,
  updated_at: null
});

/**
 * Custom hook for managing time variant configuration
 * Matches backend TimeVariantConfig model exactly
 */
const useTimeVariant = (initialState = getInitialTimeVariantState()) => {
  const [timeVariant, setTimeVariant] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [availabilityStatus, setAvailabilityStatus] = useState(null);
  
  // Use refs to prevent infinite loops
  const isInitialMount = useRef(true);
  const prevTimeVariantRef = useRef(timeVariant);

  // ==========================================================================
  // HELPER FUNCTIONS
  // ==========================================================================

  /**
   * Parse time string to comparable value
   */
  const parseTimeString = useCallback((timeStr) => {
    if (!timeStr) return null;
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours, minutes, value: hours * 60 + minutes };
  }, []);

  /**
   * Format time object to HH:MM string for backend
   */
  const formatTimeForBackend = useCallback((timeObj) => {
    if (!timeObj) return null;
    
    if (typeof timeObj === 'string') return timeObj;
    
    const hours = timeObj.hours?.toString().padStart(2, '0') || '00';
    const minutes = timeObj.minutes?.toString().padStart(2, '0') || '00';
    return `${hours}:${minutes}`;
  }, []);

  /**
   * Prepare time variant data for backend submission
   */
  const prepareForBackend = useCallback(() => {
    return {
      is_active: timeVariant.is_active,
      start_time: timeVariant.start_time || null,
      end_time: timeVariant.end_time || null,
      available_days: timeVariant.available_days || [],
      schedule_active: timeVariant.schedule_active,
      schedule_start_date: timeVariant.schedule_start_date || null,
      schedule_end_date: timeVariant.schedule_end_date || null,
      duration_active: timeVariant.duration_active,
      duration_value: parseInt(timeVariant.duration_value) || 0,
      duration_unit: timeVariant.duration_unit,
      duration_start_date: timeVariant.duration_start_date || null,
      exclusion_dates: timeVariant.exclusion_dates || [],
      timezone: timeVariant.timezone,
      force_available: timeVariant.force_available
    };
  }, [timeVariant]);

  // ==========================================================================
  // FIELD CHANGE HANDLERS - FIXED VERSIONS
  // ==========================================================================

  /**
   * Handle basic field changes
   */
  const handleChange = useCallback((field, value) => {
    setTimeVariant(prev => ({ 
      ...prev, 
      [field]: value 
    }));
  }, []);

  /**
   * Handle time field changes - directly accepts HH:MM string from input
   */
  const handleTimeChange = useCallback((field, timeString) => {
    // Directly store the time string - input type="time" gives HH:MM format
    setTimeVariant(prev => ({ 
      ...prev, 
      [field]: timeString || null 
    }));
  }, []);

  /**
   * Handle date field changes - stores datetime-local string directly
   */
  const handleDateChange = useCallback((field, dateString) => {
    // Directly store the datetime-local string - input type="datetime-local" gives YYYY-MM-DDTHH:MM
    setTimeVariant(prev => ({ 
      ...prev, 
      [field]: dateString || null 
    }));
  }, []);

  /**
   * Toggle day in available days
   */
  const toggleDay = useCallback((day) => {
    setTimeVariant(prev => {
      const availableDays = [...(prev.available_days || [])];
      const index = availableDays.indexOf(day);
      
      if (index > -1) {
        // Remove day if already selected
        availableDays.splice(index, 1);
      } else {
        // Add day if not selected
        availableDays.push(day);
      }
      
      return { ...prev, available_days: availableDays.sort() };
    });
  }, []);

  /**
   * Add exclusion date
   */
  const addExclusionDate = useCallback((dateString) => {
    if (!dateString) return;
    
    setTimeVariant(prev => {
      const exclusionDates = [...(prev.exclusion_dates || [])];
      if (!exclusionDates.includes(dateString)) {
        exclusionDates.push(dateString);
      }
      return { ...prev, exclusion_dates: exclusionDates.sort() };
    });
  }, []);

  /**
   * Remove exclusion date
   */
  const removeExclusionDate = useCallback((dateString) => {
    setTimeVariant(prev => ({
      ...prev,
      exclusion_dates: (prev.exclusion_dates || []).filter(date => date !== dateString)
    }));
  }, []);

  /**
   * Clear all exclusion dates
   */
  const clearExclusionDates = useCallback(() => {
    setTimeVariant(prev => ({ ...prev, exclusion_dates: [] }));
  }, []);

  /**
   * Toggle schedule active
   */
  const toggleSchedule = useCallback((active) => {
    setTimeVariant(prev => ({
      ...prev,
      schedule_active: active,
      // Clear schedule dates when deactivating
      schedule_start_date: active ? prev.schedule_start_date : null,
      schedule_end_date: active ? prev.schedule_end_date : null
    }));
  }, []);

  /**
   * Toggle duration active
   */
  const toggleDuration = useCallback((active) => {
    setTimeVariant(prev => ({
      ...prev,
      duration_active: active,
      // Clear duration values when deactivating
      duration_start_date: active ? prev.duration_start_date : null,
      duration_value: active ? prev.duration_value : 0
    }));
  }, []);

  /**
   * Toggle force available
   */
  const toggleForceAvailable = useCallback(() => {
    setTimeVariant(prev => ({ 
      ...prev, 
      force_available: !prev.force_available 
    }));
  }, []);

  /**
   * Handle field blur
   */
  const handleFieldBlur = useCallback((field) => {
    if (!touched[field]) {
      setTouched(prev => ({ ...prev, [field]: true }));
    }
  }, [touched]);

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  /**
   * Validate a specific field
   */
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

  /**
   * Validate entire time variant configuration
   * Matches backend TimeVariantConfig.clean() validation
   */
  const validateTimeVariant = useCallback(() => {
    const validationErrors = {};
    
    if (!timeVariant.is_active) {
      return true;
    }
    
    // Validate time range
    if (timeVariant.start_time && timeVariant.end_time) {
      const start = parseTimeString(timeVariant.start_time);
      const end = parseTimeString(timeVariant.end_time);
      
      if (start && end && start.value >= end.value) {
        validationErrors.end_time = 'End time must be after start time';
      }
    }
    
    // Validate available days
    if (timeVariant.available_days && timeVariant.available_days.length > 0) {
      const validDays = DAYS_OF_WEEK.map(d => d.value);
      for (const day of timeVariant.available_days) {
        if (!validDays.includes(day)) {
          validationErrors.available_days = `Invalid day: ${day}`;
          break;
        }
      }
    }
    
    // Validate schedule
    if (timeVariant.schedule_active) {
      if (!timeVariant.schedule_start_date) {
        validationErrors.schedule_start_date = 'Schedule start date is required';
      }
      if (!timeVariant.schedule_end_date) {
        validationErrors.schedule_end_date = 'Schedule end date is required';
      }
      
      if (timeVariant.schedule_start_date && timeVariant.schedule_end_date) {
        const start = new Date(timeVariant.schedule_start_date);
        const end = new Date(timeVariant.schedule_end_date);
        
        if (start >= end) {
          validationErrors.schedule_end_date = 'End date must be after start date';
        }
      }
    }
    
    // Validate duration
    if (timeVariant.duration_active) {
      if (!timeVariant.duration_value || timeVariant.duration_value <= 0) {
        validationErrors.duration_value = 'Duration value must be greater than 0';
      }
      
      if (!timeVariant.duration_start_date) {
        validationErrors.duration_start_date = 'Duration start date is required';
      }
    }
    
    // Validate exclusion dates
    if (timeVariant.exclusion_dates && timeVariant.exclusion_dates.length > 0) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      for (const date of timeVariant.exclusion_dates) {
        if (!dateRegex.test(date)) {
          validationErrors.exclusion_dates = `Invalid date format: ${date}. Use YYYY-MM-DD`;
          break;
        }
      }
    }
    
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [timeVariant, parseTimeString]);

  /**
   * Check if time variant can be activated
   */
  const canActivate = useCallback(() => {
    if (!timeVariant.is_active) return true;
    return validateTimeVariant();
  }, [timeVariant.is_active, validateTimeVariant]);

  // ==========================================================================
  // AVAILABILITY CHECKS - MATCHES BACKEND METHODS
  // ==========================================================================

  /**
   * Calculate duration end date - matches backend calculate_duration_end()
   */
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
        // Approximate month as 30 days (matches backend)
        startDate.setDate(startDate.getDate() + (durationValue * 30));
        break;
      default:
        startDate.setDate(startDate.getDate() + durationValue);
    }
    
    return startDate;
  }, [timeVariant]);

  /**
   * Check if plan is available now - matches backend is_available_now()
   */
  const isAvailableNow = useCallback(() => {
    if (!timeVariant.is_active || timeVariant.force_available) {
      return true;
    }

    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0].slice(0, 5);
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase().slice(0, 3);
    
    // 1. Check time of day availability
    if (timeVariant.start_time && timeVariant.end_time) {
      if (currentTime < timeVariant.start_time || currentTime > timeVariant.end_time) {
        return false;
      }
    }
    
    // 2. Check day of week availability
    if (timeVariant.available_days && timeVariant.available_days.length > 0) {
      if (!timeVariant.available_days.includes(currentDay)) {
        return false;
      }
    }
    
    // 3. Check scheduled availability
    if (timeVariant.schedule_active && timeVariant.schedule_start_date && timeVariant.schedule_end_date) {
      const startDate = new Date(timeVariant.schedule_start_date);
      const endDate = new Date(timeVariant.schedule_end_date);
      
      if (now < startDate || now > endDate) {
        return false;
      }
    }
    
    // 4. Check duration-based availability
    if (timeVariant.duration_active && timeVariant.duration_start_date) {
      const durationEnd = calculateDurationEnd();
      if (durationEnd && now > durationEnd) {
        return false;
      }
    }
    
    // 5. Check exclusion dates
    if (timeVariant.exclusion_dates && timeVariant.exclusion_dates.length > 0) {
      const currentDateStr = now.toISOString().split('T')[0];
      if (timeVariant.exclusion_dates.includes(currentDateStr)) {
        return false;
      }
    }
    
    return true;
  }, [timeVariant, calculateDurationEnd]);

  /**
   * Get next available time - matches backend get_next_available_time()
   */
  const getNextAvailableTime = useCallback(() => {
    if (!timeVariant.is_active || isAvailableNow() || timeVariant.force_available) {
      return null;
    }

    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0].slice(0, 5);
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase().slice(0, 3);
    
    const nextAvailable = [];
    
    // Check time of day restrictions
    if (timeVariant.start_time && timeVariant.end_time) {
      if (currentTime < timeVariant.start_time) {
        // Available later today
        nextAvailable.push({
          type: 'time_of_day',
          time: timeVariant.start_time,
          datetime: `${now.toISOString().split('T')[0]}T${timeVariant.start_time}:00`,
          message: `Available today at ${timeVariant.start_time}`
        });
      } else if (currentTime > timeVariant.end_time) {
        // Available tomorrow
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        nextAvailable.push({
          type: 'time_of_day',
          time: timeVariant.start_time,
          datetime: `${tomorrow.toISOString().split('T')[0]}T${timeVariant.start_time}:00`,
          message: `Available tomorrow at ${timeVariant.start_time}`
        });
      }
    }
    
    // Check day of week restrictions
    if (timeVariant.available_days && timeVariant.available_days.length > 0) {
      // Find next available day
      for (let i = 1; i <= 7; i++) {
        const nextDate = new Date(now);
        nextDate.setDate(nextDate.getDate() + i);
        const nextDayStr = nextDate.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase().slice(0, 3);
        
        if (timeVariant.available_days.includes(nextDayStr)) {
          const dayName = DAYS_OF_WEEK.find(d => d.value === nextDayStr)?.label || nextDayStr;
          nextAvailable.push({
            type: 'day_of_week',
            date: nextDate.toISOString().split('T')[0],
            datetime: nextDate.toISOString(),
            daysAhead: i,
            dayName,
            message: `Available on ${dayName} (${nextDate.toLocaleDateString()})`
          });
          break;
        }
      }
    }
    
    // Check schedule start
    if (timeVariant.schedule_active && timeVariant.schedule_start_date) {
      const scheduleStart = new Date(timeVariant.schedule_start_date);
      if (now < scheduleStart) {
        nextAvailable.push({
          type: 'schedule',
          datetime: scheduleStart.toISOString(),
          message: `Available from ${scheduleStart.toLocaleDateString()} ${scheduleStart.toLocaleTimeString()}`
        });
      }
    }
    
    // Return earliest next available time
    if (nextAvailable.length === 0) return null;
    
    return nextAvailable.sort((a, b) => {
      const dateA = new Date(a.datetime || a.date);
      const dateB = new Date(b.datetime || b.date);
      return dateA - dateB;
    })[0];
  }, [timeVariant, isAvailableNow]);

  /**
   * Get availability summary - matches backend get_availability_summary()
   */
  const getAvailabilitySummary = useCallback(() => {
    if (!timeVariant.is_active) {
      return {
        status: 'always_available',
        message: 'Available at all times',
        is_available_now: true,
        restrictions: []
      };
    }

    const summary = {
      status: 'time_restricted',
      is_available_now: isAvailableNow(),
      restrictions: []
    };

    if (timeVariant.start_time && timeVariant.end_time) {
      summary.restrictions.push({
        type: 'time_of_day',
        start: timeVariant.start_time,
        end: timeVariant.end_time,
        description: `Available from ${timeVariant.start_time} to ${timeVariant.end_time}`
      });
    }

    if (timeVariant.available_days && timeVariant.available_days.length > 0) {
      const dayNames = timeVariant.available_days.map(day => 
        DAYS_OF_WEEK.find(d => d.value === day)?.label || day
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
      const endDate = durationEnd ? durationEnd.toLocaleDateString() : 'N/A';
      
      summary.restrictions.push({
        type: 'duration',
        value: timeVariant.duration_value,
        unit: timeVariant.duration_unit,
        start: timeVariant.duration_start_date,
        end: durationEnd?.toISOString(),
        description: `Available for ${timeVariant.duration_value} ${timeVariant.duration_unit} from ${startDate}`
      });
    }

    if (timeVariant.exclusion_dates && timeVariant.exclusion_dates.length > 0) {
      summary.restrictions.push({
        type: 'exclusions',
        dates: timeVariant.exclusion_dates,
        count: timeVariant.exclusion_dates.length,
        description: `Not available on ${timeVariant.exclusion_dates.length} specific dates`
      });
    }

    return summary;
  }, [timeVariant, isAvailableNow, calculateDurationEnd]);

  // ==========================================================================
  // BACKEND INTEGRATION
  // ==========================================================================

  /**
   * Load time variant from backend data
   */
  const loadTimeVariant = useCallback((data) => {
    if (!data) {
      resetTimeVariant();
      return;
    }

    setTimeVariant({
      ...getInitialTimeVariantState(),
      id: data.id,
      is_active: data.is_active || false,
      start_time: data.start_time || null,
      end_time: data.end_time || null,
      available_days: data.available_days || [],
      schedule_active: data.schedule_active || false,
      schedule_start_date: data.schedule_start_date || null,
      schedule_end_date: data.schedule_end_date || null,
      duration_active: data.duration_active || false,
      duration_value: data.duration_value || 0,
      duration_unit: data.duration_unit || 'days',
      duration_start_date: data.duration_start_date || null,
      exclusion_dates: data.exclusion_dates || [],
      timezone: data.timezone || 'Africa/Nairobi',
      force_available: data.force_available || false,
      created_at: data.created_at,
      updated_at: data.updated_at
    });
    
    setErrors({});
    setTouched({});
  }, []);

  /**
   * Reset time variant to initial state
   */
  const resetTimeVariant = useCallback(() => {
    setTimeVariant(getInitialTimeVariantState());
    setErrors({});
    setTouched({});
    setAvailabilityStatus(null);
  }, []);

  /**
   * Apply a preset configuration
   */
  const applyPreset = useCallback((presetId) => {
    const preset = TIME_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setTimeVariant(prev => ({
        ...prev,
        ...preset.config,
        is_active: true
      }));
    }
  }, []);

  /**
   * Test configuration and get availability status
   */
  const testAvailability = useCallback(async () => {
    const isValid = validateTimeVariant();
    if (!isValid) return false;

    const status = {
      is_available_now: isAvailableNow(),
      summary: getAvailabilitySummary(),
      next_available: getNextAvailableTime(),
      timestamp: new Date().toISOString()
    };

    setAvailabilityStatus(status);
    return status;
  }, [validateTimeVariant, isAvailableNow, getAvailabilitySummary, getNextAvailableTime]);

  // ==========================================================================
  // MEMOIZED VALUES
  // ==========================================================================

  /**
   * Get formatted time range for display
   */
  const formattedTimeRange = useMemo(() => {
    if (!timeVariant.start_time || !timeVariant.end_time) return null;
    
    return {
      start: timeVariant.start_time,
      end: timeVariant.end_time,
      range: `${timeVariant.start_time} - ${timeVariant.end_time}`
    };
  }, [timeVariant.start_time, timeVariant.end_time]);

  /**
   * Get formatted schedule range for display
   */
  const formattedScheduleRange = useMemo(() => {
    if (!timeVariant.schedule_start_date || !timeVariant.schedule_end_date) return null;
    
    const start = new Date(timeVariant.schedule_start_date);
    const end = new Date(timeVariant.schedule_end_date);
    
    return {
      start: start.toLocaleDateString(),
      end: end.toLocaleDateString(),
      range: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
    };
  }, [timeVariant.schedule_start_date, timeVariant.schedule_end_date]);

  /**
   * Get formatted duration for display
   */
  const formattedDuration = useMemo(() => {
    if (!timeVariant.duration_active || !timeVariant.duration_value) return null;
    
    const unit = TIME_UNITS.find(u => u.value === timeVariant.duration_unit)?.label || timeVariant.duration_unit;
    return `${timeVariant.duration_value} ${unit}`;
  }, [timeVariant.duration_active, timeVariant.duration_value, timeVariant.duration_unit]);

  /**
   * Check if form is valid
   */
  const isFormValid = useMemo(() => {
    return validateTimeVariant();
  }, [timeVariant, validateTimeVariant]); // Added timeVariant as dependency

  // ==========================================================================
  // EFFECTS - FIXED TO PREVENT INFINITE LOOPS
  // ==========================================================================

  // Update prevTimeVariantRef when timeVariant changes
  useEffect(() => {
    prevTimeVariantRef.current = timeVariant;
  }, [timeVariant]);

  // Validate when time variant changes - but only when not initial mount
  useEffect(() => {
    // Skip validation on initial mount to prevent infinite loop
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (timeVariant.is_active) {
      validateTimeVariant();
    } else {
      setErrors({});
    }
  }, [timeVariant.is_active, timeVariant.start_time, timeVariant.end_time, 
      timeVariant.available_days, timeVariant.schedule_active, 
      timeVariant.schedule_start_date, timeVariant.schedule_end_date,
      timeVariant.duration_active, timeVariant.duration_value, 
      timeVariant.duration_start_date, timeVariant.exclusion_dates,
      validateTimeVariant]); // Added specific dependencies

  // Update availability status periodically when active - FIXED with cleanup
  useEffect(() => {
    if (!timeVariant.is_active) return;

    const updateAvailability = () => {
      setAvailabilityStatus({
        is_available_now: isAvailableNow(),
        timestamp: new Date().toISOString()
      });
    };

    updateAvailability();
    const interval = setInterval(updateAvailability, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [timeVariant.is_active, isAvailableNow]); // Only depend on is_active and isAvailableNow

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    // State
    timeVariant,
    setTimeVariant: loadTimeVariant,
    errors,
    touched,
    availabilityStatus,
    
    // Basic handlers
    handleChange,
    handleTimeChange,
    handleDateChange,
    handleFieldBlur,
    
    // Day handlers
    toggleDay,
    
    // Exclusion date handlers
    addExclusionDate,
    removeExclusionDate,
    clearExclusionDates,
    
    // Toggle handlers
    toggleSchedule,
    toggleDuration,
    toggleForceAvailable,
    
    // Validation
    validateField,
    validateTimeVariant,
    canActivate,
    isFormValid,
    
    // Availability methods
    isAvailableNow,
    getNextAvailableTime,
    getAvailabilitySummary,
    calculateDurationEnd,
    testAvailability,
    
    // Presets
    applyPreset,
    TIME_PRESETS,
    
    // Formatted values
    formattedTimeRange,
    formattedScheduleRange,
    formattedDuration,
    
    // Backend preparation
    prepareForBackend,
    
    // Reset
    resetTimeVariant,
    
    // Constants (exported for components)
    DAYS_OF_WEEK,
    TIME_UNITS,
    TIMEZONE_OPTIONS
  };
};

export default useTimeVariant;