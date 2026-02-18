

// // ============================================================================
// // TimeVariantConfig.js - COMPLETELY REWRITTEN
// // ============================================================================

// import React, { useState, useEffect, useMemo, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Clock, Calendar, CalendarDays, CalendarClock, Globe, 
//   Sun, Moon, AlertTriangle, CheckCircle, XCircle,
//   ChevronDown, ChevronUp, Plus, Trash2, RefreshCw,
//   Zap, Shield, Lock, Unlock, Filter, Save, X,
//   Clock as ClockIcon, CalendarOff, Calendar as CalendarIcon,
//   Users, Target, TrendingUp, PieChart, BarChart3,
//   Bell, AlertCircle, Timer, Battery, BatteryCharging,
//   Wifi, WifiOff, Radio, Smartphone, Router,
//   HardDrive, Cpu, ShieldCheck, Cloud, Download, Upload,
//   Settings, Info, HelpCircle, Check, Infinity
// } from 'lucide-react';

// import { getThemeClasses, EnhancedSelect, ConfirmationModal, MobileSuccessAlert } from '../Shared/components';
// import { formatDate, formatTime, formatDateTime } from '../Shared/formatters';
// import { daysOfWeek, timeZoneOptions, timeUnits } from '../Shared/constant';

// // ============================================================================
// // CONSTANTS - Match Django backend exactly
// // ============================================================================

// const TIME_UNITS = [
//   { value: 'hours', label: 'Hours' },
//   { value: 'days', label: 'Days' },
//   { value: 'weeks', label: 'Weeks' },
//   { value: 'months', label: 'Months' }
// ];

// const DAYS_OF_WEEK = [
//   { value: 'mon', label: 'Monday' },
//   { value: 'tue', label: 'Tuesday' },
//   { value: 'wed', label: 'Wednesday' },
//   { value: 'thu', label: 'Thursday' },
//   { value: 'fri', label: 'Friday' },
//   { value: 'sat', label: 'Saturday' },
//   { value: 'sun', label: 'Sunday' }
// ];

// const TIME_PRESETS = [
//   {
//     id: 'business_hours',
//     name: 'Business Hours',
//     description: 'Available Monday-Friday, 9 AM - 5 PM',
//     config: {
//       is_active: true,
//       start_time: '09:00',
//       end_time: '17:00',
//       available_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
//       schedule_active: false,
//       duration_active: false,
//       exclusion_dates: [],
//       timezone: 'Africa/Nairobi',
//       force_available: false
//     }
//   },
//   {
//     id: 'evenings_weekends',
//     name: 'Evenings & Weekends',
//     description: 'Available weekdays 6 PM - 11 PM, all day weekends',
//     config: {
//       is_active: true,
//       start_time: '18:00',
//       end_time: '23:00',
//       available_days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
//       schedule_active: false,
//       duration_active: false,
//       exclusion_dates: [],
//       timezone: 'Africa/Nairobi',
//       force_available: false
//     }
//   },
//   {
//     id: 'weekend_only',
//     name: 'Weekend Only',
//     description: 'Available Saturday and Sunday only',
//     config: {
//       is_active: true,
//       start_time: null,
//       end_time: null,
//       available_days: ['sat', 'sun'],
//       schedule_active: false,
//       duration_active: false,
//       exclusion_dates: [],
//       timezone: 'Africa/Nairobi',
//       force_available: false
//     }
//   },
//   {
//     id: 'limited_time_promo',
//     name: 'Limited Time Promo',
//     description: 'Available for 30 days starting now',
//     config: {
//       is_active: true,
//       start_time: null,
//       end_time: null,
//       available_days: [],
//       schedule_active: true,
//       schedule_start_date: new Date().toISOString().slice(0, 16),
//       schedule_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
//       duration_active: false,
//       exclusion_dates: [],
//       timezone: 'Africa/Nairobi',
//       force_available: false
//     }
//   }
// ];

// // ============================================================================
// // HELPER FUNCTIONS
// // ============================================================================

// /**
//  * Parse time string to comparable value
//  */
// const parseTime = (timeStr) => {
//   if (!timeStr) return null;
//   const [hours, minutes] = timeStr.split(':').map(Number);
//   return { hours, minutes, value: hours * 60 + minutes };
// };

// /**
//  * Format time for display
//  */
// const formatTimeForDisplay = (timeStr) => {
//   if (!timeStr) return 'Not set';
//   const [hours, minutes] = timeStr.split(':');
//   const date = new Date();
//   date.setHours(hours, minutes);
//   return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
// };

// /**
//  * Calculate duration end date
//  */
// const calculateDurationEnd = (startDate, value, unit) => {
//   if (!startDate) return null;
  
//   const date = new Date(startDate);
  
//   switch (unit) {
//     case 'hours':
//       date.setHours(date.getHours() + value);
//       break;
//     case 'days':
//       date.setDate(date.getDate() + value);
//       break;
//     case 'weeks':
//       date.setDate(date.getDate() + (value * 7));
//       break;
//     case 'months':
//       date.setMonth(date.getMonth() + value);
//       break;
//     default:
//       date.setDate(date.getDate() + value);
//   }
  
//   return date;
// };

// /**
//  * Check if a date is within schedule
//  */
// const isWithinSchedule = (date, scheduleStart, scheduleEnd) => {
//   if (!scheduleStart || !scheduleEnd) return true;
  
//   const checkDate = new Date(date);
//   const start = new Date(scheduleStart);
//   const end = new Date(scheduleEnd);
  
//   return checkDate >= start && checkDate <= end;
// };

// /**
//  * Check if a date is within time range
//  */
// const isWithinTimeRange = (date, startTime, endTime) => {
//   if (!startTime || !endTime) return true;
  
//   const [startHours, startMinutes] = startTime.split(':').map(Number);
//   const [endHours, endMinutes] = endTime.split(':').map(Number);
  
//   const checkValue = date.getHours() * 60 + date.getMinutes();
//   const startValue = startHours * 60 + startMinutes;
//   const endValue = endHours * 60 + endMinutes;
  
//   return checkValue >= startValue && checkValue <= endValue;
// };

// /**
//  * Check if a date is an allowed day of week
//  */
// const isAllowedDayOfWeek = (date, allowedDays) => {
//   if (!allowedDays || allowedDays.length === 0) return true;
  
//   const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
//   const dayOfWeek = dayMap[date.getDay()];
  
//   return allowedDays.includes(dayOfWeek);
// };

// /**
//  * Check if a date is excluded
//  */
// const isExcludedDate = (date, exclusionDates) => {
//   if (!exclusionDates || exclusionDates.length === 0) return false;
  
//   const dateStr = date.toISOString().split('T')[0];
//   return exclusionDates.includes(dateStr);
// };

// /**
//  * Calculate next available time
//  */
// const calculateNextAvailable = (config) => {
//   if (!config.is_active || config.force_available) return null;
  
//   const now = new Date();
//   const checks = [];
  
//   // Check time of day
//   if (config.start_time && config.end_time) {
//     const [startHours, startMinutes] = config.start_time.split(':').map(Number);
//     const startToday = new Date(now);
//     startToday.setHours(startHours, startMinutes, 0, 0);
    
//     if (now < startToday) {
//       checks.push({
//         type: 'time_of_day',
//         time: startToday,
//         message: `Available today at ${formatTime(config.start_time)}`
//       });
//     } else {
//       const startTomorrow = new Date(now);
//       startTomorrow.setDate(startTomorrow.getDate() + 1);
//       startTomorrow.setHours(startHours, startMinutes, 0, 0);
//       checks.push({
//         type: 'time_of_day',
//         time: startTomorrow,
//         message: `Available tomorrow at ${formatTime(config.start_time)}`
//       });
//     }
//   }
  
//   // Check day of week
//   if (config.available_days && config.available_days.length > 0) {
//     const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
//     const currentDay = dayMap[now.getDay()];
//     const currentIndex = DAYS_OF_WEEK.findIndex(d => d.value === currentDay);
    
//     for (let i = 1; i <= 7; i++) {
//       const nextIndex = (currentIndex + i) % 7;
//       const nextDay = DAYS_OF_WEEK[nextIndex].value;
      
//       if (config.available_days.includes(nextDay)) {
//         const nextDate = new Date(now);
//         nextDate.setDate(nextDate.getDate() + i);
//         nextDate.setHours(0, 0, 0, 0);
        
//         // If this day also has time restrictions, set to start time
//         if (config.start_time) {
//           const [hours, minutes] = config.start_time.split(':');
//           nextDate.setHours(hours, minutes, 0, 0);
//         }
        
//         checks.push({
//           type: 'day_of_week',
//           time: nextDate,
//           message: `Available on ${DAYS_OF_WEEK[nextIndex].label}`
//         });
//         break;
//       }
//     }
//   }
  
//   // Check schedule start
//   if (config.schedule_active && config.schedule_start_date) {
//     const scheduleStart = new Date(config.schedule_start_date);
//     if (now < scheduleStart) {
//       checks.push({
//         type: 'schedule',
//         time: scheduleStart,
//         message: `Available from ${formatDateTime(config.schedule_start_date)}`
//       });
//     }
//   }
  
//   // Check duration start
//   if (config.duration_active && config.duration_start_date) {
//     const durationStart = new Date(config.duration_start_date);
//     if (now < durationStart) {
//       checks.push({
//         type: 'duration',
//         time: durationStart,
//         message: `Duration starts on ${formatDateTime(config.duration_start_date)}`
//       });
//     }
//   }
  
//   // Check exclusion dates
//   if (config.exclusion_dates && config.exclusion_dates.length > 0) {
//     const todayStr = now.toISOString().split('T')[0];
//     if (config.exclusion_dates.includes(todayStr)) {
//       let nextDate = new Date(now);
//       nextDate.setDate(nextDate.getDate() + 1);
      
//       while (config.exclusion_dates.includes(nextDate.toISOString().split('T')[0])) {
//         nextDate.setDate(nextDate.getDate() + 1);
//       }
      
//       checks.push({
//         type: 'exclusion',
//         time: nextDate,
//         message: `Available after ${formatDate(nextDate.toISOString())}`
//       });
//     }
//   }
  
//   // Return the earliest time
//   if (checks.length === 0) return null;
  
//   return checks.sort((a, b) => a.time - b.time)[0];
// };

// // ============================================================================
// // AVAILABILITY PREVIEW COMPONENT
// // ============================================================================
// const AvailabilityPreview = ({ config, theme }) => {
//   const themeClasses = getThemeClasses(theme);
  
//   const checkCurrentAvailability = useCallback(() => {
//     if (!config.is_active) return { available: true, reason: 'Time controls disabled' };
//     if (config.force_available) return { available: true, reason: 'Force enabled' };
    
//     const now = new Date();
    
//     // Check time of day
//     if (config.start_time && config.end_time) {
//       if (!isWithinTimeRange(now, config.start_time, config.end_time)) {
//         return { available: false, reason: 'Outside operating hours' };
//       }
//     }
    
//     // Check day of week
//     if (config.available_days && config.available_days.length > 0) {
//       if (!isAllowedDayOfWeek(now, config.available_days)) {
//         return { available: false, reason: 'Not available on this day' };
//       }
//     }
    
//     // Check schedule
//     if (config.schedule_active && config.schedule_start_date && config.schedule_end_date) {
//       if (!isWithinSchedule(now, config.schedule_start_date, config.schedule_end_date)) {
//         return { available: false, reason: 'Outside scheduled dates' };
//       }
//     }
    
//     // Check duration
//     if (config.duration_active && config.duration_start_date) {
//       const durationEnd = calculateDurationEnd(
//         config.duration_start_date,
//         config.duration_value,
//         config.duration_unit
//       );
      
//       if (now < new Date(config.duration_start_date) || now > durationEnd) {
//         return { available: false, reason: 'Outside duration period' };
//       }
//     }
    
//     // Check exclusion dates
//     if (config.exclusion_dates && config.exclusion_dates.length > 0) {
//       const todayStr = now.toISOString().split('T')[0];
//       if (config.exclusion_dates.includes(todayStr)) {
//         return { available: false, reason: 'Excluded date' };
//       }
//     }
    
//     return { available: true, reason: 'Available now' };
//   }, [config]);
  
//   const availability = checkCurrentAvailability();
//   const nextAvailable = useMemo(() => calculateNextAvailable(config), [config]);

//   return (
//     <div className={`p-4 rounded-xl border ${
//       availability.available
//         ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
//         : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
//     }`}>
//       <div className="flex items-start justify-between">
//         <div className="flex-1">
//           <h4 className="text-sm font-semibold mb-2 flex items-center">
//             {availability.available ? (
//               <CheckCircle className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
//             ) : (
//               <XCircle className="w-4 h-4 mr-2 text-red-600 dark:text-red-400" />
//             )}
//             Availability Status
//           </h4>
          
//           <div className="space-y-2">
//             <div className="flex items-center">
//               <div className={`w-2 h-2 rounded-full mr-2 ${
//                 availability.available ? 'bg-green-500' : 'bg-red-500'
//               }`} />
//               <span className="text-sm">
//                 {availability.available ? 'Available for purchase now' : 'Not available at this time'}
//               </span>
//             </div>
            
//             {!availability.available && nextAvailable && (
//               <div className="text-sm text-gray-600 dark:text-gray-400">
//                 {nextAvailable.message}
//               </div>
//             )}
            
//             <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
//               {availability.reason}
//             </div>
//           </div>
//         </div>
        
//         {config.is_active && (
//           <div className={`text-xs px-2 py-1 rounded-full ${
//             config.force_available
//               ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
//               : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
//           }`}>
//             {config.force_available ? 'Force Enabled' : 'Time Controlled'}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // ============================================================================
// // TIME OF DAY SECTION
// // ============================================================================
// const TimeOfDaySection = ({ config, onChange, errors, theme }) => {
//   const themeClasses = getThemeClasses(theme);

//   return (
//     <div className="space-y-4">
//       <h3 className="text-sm font-semibold flex items-center">
//         <Clock className="w-4 h-4 mr-2 text-blue-600" />
//         Time of Day Restrictions
//       </h3>
      
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <div>
//           <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>
//             Start Time
//           </label>
//           <input
//             type="time"
//             value={config.start_time || ''}
//             onChange={(e) => onChange('start_time', e.target.value || null)}
//             className={`w-full px-3 py-2 rounded-lg border ${
//               errors.start_time ? 'border-red-500' : themeClasses.border.normal
//             } ${themeClasses.bg.input} ${themeClasses.text.primary}`}
//             disabled={!config.is_active}
//           />
//           {errors.start_time && (
//             <p className="text-xs text-red-500 mt-1">{errors.start_time}</p>
//           )}
//         </div>
        
//         <div>
//           <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>
//             End Time
//           </label>
//           <input
//             type="time"
//             value={config.end_time || ''}
//             onChange={(e) => onChange('end_time', e.target.value || null)}
//             className={`w-full px-3 py-2 rounded-lg border ${
//               errors.end_time ? 'border-red-500' : themeClasses.border.normal
//             } ${themeClasses.bg.input} ${themeClasses.text.primary}`}
//             disabled={!config.is_active}
//           />
//           {errors.end_time && (
//             <p className="text-xs text-red-500 mt-1">{errors.end_time}</p>
//           )}
//         </div>
//       </div>
      
//       {config.start_time && config.end_time && (
//         <div className={`text-xs p-2 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
//           <span className="font-medium">Time Range: </span>
//           {formatTimeForDisplay(config.start_time)} - {formatTimeForDisplay(config.end_time)}
//         </div>
//       )}
      
//       <p className="text-xs text-gray-500">
//         Plan will be available only between these times each day
//       </p>
//     </div>
//   );
// };

// // ============================================================================
// // DAYS OF WEEK SECTION
// // ============================================================================
// const DaysOfWeekSection = ({ config, onChange, errors, theme }) => {
//   const themeClasses = getThemeClasses(theme);
  
//   const toggleDay = useCallback((day) => {
//     const current = config.available_days || [];
//     const updated = current.includes(day)
//       ? current.filter(d => d !== day)
//       : [...current, day];
//     onChange('available_days', updated);
//   }, [config.available_days, onChange]);

//   return (
//     <div className="space-y-4">
//       <h3 className="text-sm font-semibold flex items-center">
//         <CalendarDays className="w-4 h-4 mr-2 text-green-600" />
//         Days of Week Restrictions
//       </h3>
      
//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
//         {DAYS_OF_WEEK.map(day => {
//           const isSelected = (config.available_days || []).includes(day.value);
          
//           return (
//             <button
//               key={day.value}
//               type="button"
//               onClick={() => toggleDay(day.value)}
//               disabled={!config.is_active}
//               className={`py-2 px-1 rounded-lg text-xs font-medium transition-colors ${
//                 isSelected
//                   ? 'bg-green-600 text-white'
//                   : theme === 'dark'
//                     ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
//                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//               } ${!config.is_active ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               {day.label.slice(0, 3)}
//             </button>
//           );
//         })}
//       </div>
      
//       {config.available_days && config.available_days.length > 0 && (
//         <div className={`text-xs p-2 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
//           <span className="font-medium">Selected Days: </span>
//           {config.available_days
//             .map(day => DAYS_OF_WEEK.find(d => d.value === day)?.label)
//             .join(', ')}
//         </div>
//       )}
      
//       {errors.available_days && (
//         <p className="text-xs text-red-500 mt-1">{errors.available_days}</p>
//       )}
      
//       <p className="text-xs text-gray-500">
//         Plan will be available only on selected days
//       </p>
//     </div>
//   );
// };

// // ============================================================================
// // SCHEDULE SECTION
// // ============================================================================
// const ScheduleSection = ({ config, onChange, errors, theme }) => {
//   const themeClasses = getThemeClasses(theme);

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <h3 className="text-sm font-semibold flex items-center">
//           <CalendarClock className="w-4 h-4 mr-2 text-purple-600" />
//           Schedule Restrictions
//         </h3>
        
//         <button
//           type="button"
//           onClick={() => onChange('schedule_active', !config.schedule_active)}
//           disabled={!config.is_active}
//           className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
//             config.schedule_active
//               ? 'bg-purple-600'
//               : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//           } ${!config.is_active ? 'opacity-50 cursor-not-allowed' : ''}`}
//         >
//           <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
//             config.schedule_active ? 'translate-x-5' : 'translate-x-1'
//           }`} />
//         </button>
//       </div>
      
//       {config.schedule_active && (
//         <div className="space-y-4 mt-4">
//           <div>
//             <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>
//               Start Date & Time *
//             </label>
//             <input
//               type="datetime-local"
//               value={config.schedule_start_date?.slice(0, 16) || ''}
//               onChange={(e) => onChange('schedule_start_date', e.target.value)}
//               className={`w-full px-3 py-2 rounded-lg border ${
//                 errors.schedule_start_date ? 'border-red-500' : themeClasses.border.normal
//               } ${themeClasses.bg.input} ${themeClasses.text.primary}`}
//               disabled={!config.is_active}
//             />
//             {errors.schedule_start_date && (
//               <p className="text-xs text-red-500 mt-1">{errors.schedule_start_date}</p>
//             )}
//           </div>
          
//           <div>
//             <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>
//               End Date & Time *
//             </label>
//             <input
//               type="datetime-local"
//               value={config.schedule_end_date?.slice(0, 16) || ''}
//               onChange={(e) => onChange('schedule_end_date', e.target.value)}
//               className={`w-full px-3 py-2 rounded-lg border ${
//                 errors.schedule_end_date ? 'border-red-500' : themeClasses.border.normal
//               } ${themeClasses.bg.input} ${themeClasses.text.primary}`}
//               disabled={!config.is_active}
//             />
//             {errors.schedule_end_date && (
//               <p className="text-xs text-red-500 mt-1">{errors.schedule_end_date}</p>
//             )}
//           </div>
//         </div>
//       )}
      
//       <p className="text-xs text-gray-500">
//         Plan will be available only within this date range
//       </p>
//     </div>
//   );
// };

// // ============================================================================
// // DURATION SECTION
// // ============================================================================
// const DurationSection = ({ config, onChange, errors, theme }) => {
//   const themeClasses = getThemeClasses(theme);
  
//   const durationEnd = useMemo(() => {
//     if (!config.duration_active || !config.duration_start_date || !config.duration_value) return null;
//     return calculateDurationEnd(
//       config.duration_start_date,
//       config.duration_value,
//       config.duration_unit
//     );
//   }, [config.duration_active, config.duration_start_date, config.duration_value, config.duration_unit]);

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <h3 className="text-sm font-semibold flex items-center">
//           <Timer className="w-4 h-4 mr-2 text-orange-600" />
//           Duration Restrictions
//         </h3>
        
//         <button
//           type="button"
//           onClick={() => onChange('duration_active', !config.duration_active)}
//           disabled={!config.is_active}
//           className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
//             config.duration_active
//               ? 'bg-orange-600'
//               : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//           } ${!config.is_active ? 'opacity-50 cursor-not-allowed' : ''}`}
//         >
//           <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
//             config.duration_active ? 'translate-x-5' : 'translate-x-1'
//           }`} />
//         </button>
//       </div>
      
//       {config.duration_active && (
//         <div className="space-y-4 mt-4">
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>
//                 Duration Value *
//               </label>
//               <input
//                 type="number"
//                 min="1"
//                 value={config.duration_value || ''}
//                 onChange={(e) => onChange('duration_value', parseInt(e.target.value) || 0)}
//                 className={`w-full px-3 py-2 rounded-lg border ${
//                   errors.duration_value ? 'border-red-500' : themeClasses.border.normal
//                 } ${themeClasses.bg.input} ${themeClasses.text.primary}`}
//                 disabled={!config.is_active}
//               />
//               {errors.duration_value && (
//                 <p className="text-xs text-red-500 mt-1">{errors.duration_value}</p>
//               )}
//             </div>
            
//             <div>
//               <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>
//                 Duration Unit *
//               </label>
//               <EnhancedSelect
//                 value={config.duration_unit || 'days'}
//                 onChange={(value) => onChange('duration_unit', value)}
//                 options={TIME_UNITS}
//                 theme={theme}
//                 disabled={!config.is_active}
//               />
//             </div>
//           </div>
          
//           <div>
//             <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>
//               Start Date & Time *
//             </label>
//             <input
//               type="datetime-local"
//               value={config.duration_start_date?.slice(0, 16) || ''}
//               onChange={(e) => onChange('duration_start_date', e.target.value)}
//               className={`w-full px-3 py-2 rounded-lg border ${
//                 errors.duration_start_date ? 'border-red-500' : themeClasses.border.normal
//               } ${themeClasses.bg.input} ${themeClasses.text.primary}`}
//               disabled={!config.is_active}
//             />
//             {errors.duration_start_date && (
//               <p className="text-xs text-red-500 mt-1">{errors.duration_start_date}</p>
//             )}
//           </div>
          
//           {durationEnd && (
//             <div className={`text-xs p-2 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
//               <span className="font-medium">End Date: </span>
//               {formatDateTime(durationEnd.toISOString())}
//             </div>
//           )}
//         </div>
//       )}
      
//       <p className="text-xs text-gray-500">
//         Plan will be available for a fixed duration from the start date
//       </p>
//     </div>
//   );
// };

// // ============================================================================
// // EXCLUSIONS SECTION
// // ============================================================================
// const ExclusionsSection = ({ config, onChange, errors, theme }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [newExclusion, setNewExclusion] = useState('');
  
//   const addExclusion = useCallback(() => {
//     if (!newExclusion) return;
    
//     const current = config.exclusion_dates || [];
//     if (!current.includes(newExclusion)) {
//       onChange('exclusion_dates', [...current, newExclusion]);
//       setNewExclusion('');
//     }
//   }, [config.exclusion_dates, newExclusion, onChange]);
  
//   const removeExclusion = useCallback((date) => {
//     const current = config.exclusion_dates || [];
//     onChange('exclusion_dates', current.filter(d => d !== date));
//   }, [config.exclusion_dates, onChange]);

//   return (
//     <div className="space-y-4">
//       <h3 className="text-sm font-semibold flex items-center">
//         <CalendarOff className="w-4 h-4 mr-2 text-red-600" />
//         Exclusion Dates
//       </h3>
      
//       <div className="flex gap-2">
//         <input
//           type="date"
//           value={newExclusion}
//           onChange={(e) => setNewExclusion(e.target.value)}
//           min={new Date().toISOString().split('T')[0]}
//           className={`flex-1 px-3 py-2 rounded-lg border ${themeClasses.border.normal} ${themeClasses.bg.input} ${themeClasses.text.primary}`}
//           disabled={!config.is_active}
//         />
//         <button
//           type="button"
//           onClick={addExclusion}
//           disabled={!config.is_active || !newExclusion}
//           className={`px-3 py-2 rounded-lg ${
//             theme === 'dark'
//               ? 'bg-blue-600 hover:bg-blue-700'
//               : 'bg-blue-500 hover:bg-blue-600'
//           } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
//         >
//           <Plus className="w-4 h-4" />
//         </button>
//       </div>
      
//       <div className="space-y-2 max-h-40 overflow-y-auto">
//         {(config.exclusion_dates || []).map(date => (
//           <div
//             key={date}
//             className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
//           >
//             <span className="text-sm">{formatDate(date)}</span>
//             <button
//               type="button"
//               onClick={() => removeExclusion(date)}
//               className="p-1 text-red-600 hover:text-red-800"
//             >
//               <Trash2 className="w-4 h-4" />
//             </button>
//           </div>
//         ))}
        
//         {(config.exclusion_dates || []).length === 0 && (
//           <p className="text-sm text-gray-500 text-center py-4">
//             No exclusion dates added
//           </p>
//         )}
//       </div>
      
//       {errors.exclusion_dates && (
//         <p className="text-xs text-red-500 mt-1">{errors.exclusion_dates}</p>
//       )}
      
//       <p className="text-xs text-gray-500">
//         Plan will NOT be available on these specific dates
//       </p>
//     </div>
//   );
// };

// // ============================================================================
// // ADVANCED SECTION
// // ============================================================================
// const AdvancedSection = ({ config, onChange, errors, theme }) => {
//   const themeClasses = getThemeClasses(theme);

//   return (
//     <div className="space-y-4">
//       <h3 className="text-sm font-semibold flex items-center">
//         <Settings className="w-4 h-4 mr-2 text-gray-600" />
//         Advanced Settings
//       </h3>
      
//       <div>
//         <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>
//           Timezone
//         </label>
//         <EnhancedSelect
//           value={config.timezone || 'Africa/Nairobi'}
//           onChange={(value) => onChange('timezone', value)}
//           options={timeZoneOptions}
//           theme={theme}
//           disabled={!config.is_active}
//         />
//       </div>
      
//       <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
//         <div>
//           <p className={`text-sm font-medium ${themeClasses.text.primary}`}>
//             Force Available
//           </p>
//           <p className="text-xs text-gray-500">
//             Override all restrictions and make plan always available
//           </p>
//         </div>
        
//         <button
//           type="button"
//           onClick={() => onChange('force_available', !config.force_available)}
//           disabled={!config.is_active}
//           className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
//             config.force_available
//               ? 'bg-yellow-600'
//               : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//           } ${!config.is_active ? 'opacity-50 cursor-not-allowed' : ''}`}
//         >
//           <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
//             config.force_available ? 'translate-x-6' : 'translate-x-1'
//           }`} />
//         </button>
//       </div>
//     </div>
//   );
// };

// // ============================================================================
// // PRESETS MODAL
// // ============================================================================
// const PresetsModal = ({ isOpen, onClose, onApply, theme }) => {
//   const themeClasses = getThemeClasses(theme);

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.9 }}
//         className={`rounded-2xl shadow-2xl w-full max-w-md ${
//           theme === 'dark' ? 'bg-gray-900' : 'bg-white'
//         }`}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="p-6 border-b border-gray-200 dark:border-gray-700">
//           <div className="flex items-center justify-between">
//             <h2 className={`text-xl font-bold ${themeClasses.text.primary}`}>
//               Quick Presets
//             </h2>
//             <button
//               onClick={onClose}
//               className={`p-2 rounded-lg ${
//                 theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
//               }`}
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>
//         </div>
        
//         <div className="p-6 space-y-3">
//           {TIME_PRESETS.map(preset => (
//             <button
//               key={preset.id}
//               onClick={() => {
//                 onApply(preset.config);
//                 onClose();
//               }}
//               className={`w-full text-left p-4 rounded-lg border transition-colors ${
//                 theme === 'dark'
//                   ? 'border-gray-700 hover:border-gray-600 hover:bg-gray-800'
//                   : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//               }`}
//             >
//               <h3 className="font-semibold">{preset.name}</h3>
//               <p className="text-sm text-gray-500 mt-1">{preset.description}</p>
//             </button>
//           ))}
//         </div>
        
//         <div className="p-6 border-t border-gray-200 dark:border-gray-700">
//           <button
//             onClick={onClose}
//             className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
//           >
//             Cancel
//           </button>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// // ============================================================================
// // VALIDATION FUNCTIONS
// // ============================================================================
// const validateTimeVariant = (config) => {
//   const errors = {};
  
//   if (!config.is_active) return errors;
  
//   // Validate time range
//   if (config.start_time && config.end_time) {
//     const start = parseTime(config.start_time);
//     const end = parseTime(config.end_time);
    
//     if (start && end && start.value >= end.value) {
//       errors.end_time = 'End time must be after start time';
//     }
//   }
  
//   // Validate available days
//   if (config.available_days && config.available_days.length > 0) {
//     const validDays = DAYS_OF_WEEK.map(d => d.value);
//     for (const day of config.available_days) {
//       if (!validDays.includes(day)) {
//         errors.available_days = `Invalid day: ${day}`;
//         break;
//       }
//     }
//   }
  
//   // Validate schedule
//   if (config.schedule_active) {
//     if (!config.schedule_start_date) {
//       errors.schedule_start_date = 'Schedule start date is required';
//     }
//     if (!config.schedule_end_date) {
//       errors.schedule_end_date = 'Schedule end date is required';
//     }
    
//     if (config.schedule_start_date && config.schedule_end_date) {
//       const start = new Date(config.schedule_start_date);
//       const end = new Date(config.schedule_end_date);
      
//       if (start >= end) {
//         errors.schedule_end_date = 'End date must be after start date';
//       }
      
//       if (end < new Date()) {
//         errors.schedule_end_date = 'Schedule has already ended';
//       }
//     }
//   }
  
//   // Validate duration
//   if (config.duration_active) {
//     if (!config.duration_value || config.duration_value <= 0) {
//       errors.duration_value = 'Duration value must be greater than 0';
//     }
    
//     if (!config.duration_start_date) {
//       errors.duration_start_date = 'Duration start date is required';
//     }
//   }
  
//   // Validate exclusion dates
//   if (config.exclusion_dates && config.exclusion_dates.length > 0) {
//     const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
//     for (const date of config.exclusion_dates) {
//       if (!dateRegex.test(date)) {
//         errors.exclusion_dates = `Invalid date format: ${date}`;
//         break;
//       }
//     }
//   }
  
//   return errors;
// };

// // ============================================================================
// // MAIN TIME VARIANT CONFIG COMPONENT
// // ============================================================================
// const TimeVariantConfig = ({
//   timeVariant = {},
//   onChange,
//   errors: externalErrors = {},
//   theme = 'light',
//   isMobile = false,
//   showHeader = true,
//   compactMode = false,
//   onSave,
//   onTest
// }) => {
//   const themeClasses = getThemeClasses(theme);
  
//   // Local state
//   const [config, setConfig] = useState(() => ({
//     is_active: false,
//     start_time: null,
//     end_time: null,
//     available_days: [],
//     schedule_active: false,
//     schedule_start_date: null,
//     schedule_end_date: null,
//     duration_active: false,
//     duration_value: 0,
//     duration_unit: 'days',
//     duration_start_date: null,
//     exclusion_dates: [],
//     timezone: 'Africa/Nairobi',
//     force_available: false,
//     ...timeVariant
//   }));
  
//   const [localErrors, setLocalErrors] = useState({});
//   const [activeSection, setActiveSection] = useState('time_of_day');
//   const [showPresets, setShowPresets] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [isTesting, setIsTesting] = useState(false);
//   const [testResults, setTestResults] = useState(null);
//   const [mobileSuccessAlert, setMobileSuccessAlert] = useState({ visible: false, message: '' });
  
//   // Combine errors
//   const errors = { ...localErrors, ...externalErrors };
  
//   // Update local config when prop changes
//   useEffect(() => {
//     setConfig(prev => ({
//       ...prev,
//       ...timeVariant
//     }));
//   }, [timeVariant]);
  
//   // Validate on changes
//   useEffect(() => {
//     const validationErrors = validateTimeVariant(config);
//     setLocalErrors(validationErrors);
//   }, [config]);
  
//   // Handle field changes
//   const handleFieldChange = useCallback((field, value) => {
//     setConfig(prev => {
//       const updated = { ...prev, [field]: value };
      
//       // Special handling for deactivation
//       if (field === 'is_active' && !value) {
//         // Clear errors when deactivating
//         setLocalErrors({});
//       }
      
//       // Notify parent
//       if (onChange) {
//         onChange(field, value);
//       }
      
//       return updated;
//     });
//   }, [onChange]);
  
//   // Handle test
//   const handleTest = useCallback(async () => {
//     setIsTesting(true);
//     try {
//       // Simulate API call - replace with actual API
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       const now = new Date();
//       const isAvailable = !Object.keys(validateTimeVariant(config)).length > 0;
      
//       setTestResults({
//         success: isAvailable,
//         timestamp: now.toISOString(),
//         config: { ...config },
//         next_available: calculateNextAvailable(config)
//       });
      
//       if (isMobile) {
//         setMobileSuccessAlert({
//           visible: true,
//           message: isAvailable ? 'Configuration is valid' : 'Configuration has issues'
//         });
//       }
      
//       if (onTest) onTest(config);
//     } catch (error) {
//       setTestResults({
//         success: false,
//         error: error.message
//       });
//     } finally {
//       setIsTesting(false);
//     }
//   }, [config, isMobile, onTest]);
  
//   // Handle save
//   const handleSave = useCallback(async () => {
//     const validationErrors = validateTimeVariant(config);
//     if (Object.keys(validationErrors).length > 0) {
//       setLocalErrors(validationErrors);
//       const message = 'Please fix validation errors before saving';
//       if (isMobile) {
//         setMobileSuccessAlert({ visible: true, message });
//       } else {
//         alert(message);
//       }
//       return;
//     }
    
//     setIsSaving(true);
//     try {
//       // Simulate API call - replace with actual API
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       if (onSave) {
//         await onSave(config);
//       }
      
//       if (isMobile) {
//         setMobileSuccessAlert({ visible: true, message: 'Configuration saved!' });
//       } else {
//         // Show success notification
//       }
//     } catch (error) {
//       console.error('Save failed:', error);
//     } finally {
//       setIsSaving(false);
//     }
//   }, [config, isMobile, onSave]);
  
//   // Handle reset
//   const handleReset = useCallback(() => {
//     setConfig({
//       is_active: false,
//       start_time: null,
//       end_time: null,
//       available_days: [],
//       schedule_active: false,
//       schedule_start_date: null,
//       schedule_end_date: null,
//       duration_active: false,
//       duration_value: 0,
//       duration_unit: 'days',
//       duration_start_date: null,
//       exclusion_dates: [],
//       timezone: 'Africa/Nairobi',
//       force_available: false,
//       ...timeVariant
//     });
//     setLocalErrors({});
//   }, [timeVariant]);
  
//   // Apply preset
//   const handleApplyPreset = useCallback((presetConfig) => {
//     setConfig(prev => ({
//       ...prev,
//       ...presetConfig,
//       is_active: true
//     }));
//   }, []);
  
//   // Check if form is valid
//   const isFormValid = useMemo(() => {
//     if (!config.is_active) return true;
//     return Object.keys(validateTimeVariant(config)).length === 0;
//   }, [config]);

//   // Mobile navigation sections
//   const sections = [
//     { id: 'time_of_day', label: 'Time', icon: Clock },
//     { id: 'days_of_week', label: 'Days', icon: CalendarDays },
//     { id: 'schedule', label: 'Schedule', icon: CalendarClock },
//     { id: 'duration', label: 'Duration', icon: Timer },
//     { id: 'exclusions', label: 'Exclude', icon: CalendarOff },
//     { id: 'advanced', label: 'Advanced', icon: Settings }
//   ];

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       {showHeader && (
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//           <div>
//             <h2 className={`text-xl font-bold flex items-center ${themeClasses.text.primary}`}>
//               <Clock className="w-5 h-5 mr-2 text-indigo-600" />
//               Time Variant Configuration
//             </h2>
//             <p className={`text-sm mt-1 ${themeClasses.text.secondary}`}>
//               Configure when this plan is available for purchase
//             </p>
//           </div>
          
//           <div className="flex items-center gap-3">
//             <button
//               onClick={() => setShowPresets(true)}
//               className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
//             >
//               Apply Preset
//             </button>
            
//             <div className="flex items-center gap-2">
//               <span className={`text-sm ${themeClasses.text.secondary}`}>
//                 {config.is_active ? 'Enabled' : 'Disabled'}
//               </span>
//               <button
//                 type="button"
//                 onClick={() => handleFieldChange('is_active', !config.is_active)}
//                 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
//                   config.is_active
//                     ? 'bg-green-600'
//                     : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//                 }`}
//               >
//                 <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
//                   config.is_active ? 'translate-x-6' : 'translate-x-1'
//                 }`} />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Disabled State */}
//       {!config.is_active ? (
//         <div className="text-center py-12">
//           <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
//           <h3 className="text-lg font-medium mb-2">Time Variant Disabled</h3>
//           <p className="text-gray-500 mb-6 max-w-md mx-auto">
//             This plan is currently available at all times. Enable time variant controls to restrict availability.
//           </p>
//           <button
//             onClick={() => handleFieldChange('is_active', true)}
//             className="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
//           >
//             Enable Time Controls
//           </button>
//         </div>
//       ) : (
//         <>
//           {/* Availability Preview */}
//           <AvailabilityPreview config={config} theme={theme} />

//           {/* Mobile Navigation */}
//           {isMobile && (
//             <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b dark:border-gray-800 overflow-x-auto">
//               <div className="flex space-x-1 p-2">
//                 {sections.map(section => {
//                   const Icon = section.icon;
//                   const isActive = activeSection === section.id;
                  
//                   return (
//                     <button
//                       key={section.id}
//                       onClick={() => setActiveSection(section.id)}
//                       className={`flex flex-col items-center px-3 py-2 rounded-lg min-w-[60px] transition-colors ${
//                         isActive
//                           ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
//                           : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
//                       }`}
//                     >
//                       <Icon className="w-4 h-4 mb-1" />
//                       <span className="text-xs font-medium">{section.label}</span>
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           )}

//           {/* Content */}
//           <div className="space-y-6">
//             {isMobile ? (
//               // Mobile: Show only active section
//               <div className="p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}">
//                 {activeSection === 'time_of_day' && (
//                   <TimeOfDaySection
//                     config={config}
//                     onChange={handleFieldChange}
//                     errors={errors}
//                     theme={theme}
//                   />
//                 )}
//                 {activeSection === 'days_of_week' && (
//                   <DaysOfWeekSection
//                     config={config}
//                     onChange={handleFieldChange}
//                     errors={errors}
//                     theme={theme}
//                   />
//                 )}
//                 {activeSection === 'schedule' && (
//                   <ScheduleSection
//                     config={config}
//                     onChange={handleFieldChange}
//                     errors={errors}
//                     theme={theme}
//                   />
//                 )}
//                 {activeSection === 'duration' && (
//                   <DurationSection
//                     config={config}
//                     onChange={handleFieldChange}
//                     errors={errors}
//                     theme={theme}
//                   />
//                 )}
//                 {activeSection === 'exclusions' && (
//                   <ExclusionsSection
//                     config={config}
//                     onChange={handleFieldChange}
//                     errors={errors}
//                     theme={theme}
//                   />
//                 )}
//                 {activeSection === 'advanced' && (
//                   <AdvancedSection
//                     config={config}
//                     onChange={handleFieldChange}
//                     errors={errors}
//                     theme={theme}
//                   />
//                 )}
//               </div>
//             ) : (
//               // Desktop: Show all sections in grid
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
//                   <TimeOfDaySection
//                     config={config}
//                     onChange={handleFieldChange}
//                     errors={errors}
//                     theme={theme}
//                   />
//                 </div>
                
//                 <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
//                   <DaysOfWeekSection
//                     config={config}
//                     onChange={handleFieldChange}
//                     errors={errors}
//                     theme={theme}
//                   />
//                 </div>
                
//                 <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
//                   <ScheduleSection
//                     config={config}
//                     onChange={handleFieldChange}
//                     errors={errors}
//                     theme={theme}
//                   />
//                 </div>
                
//                 <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
//                   <DurationSection
//                     config={config}
//                     onChange={handleFieldChange}
//                     errors={errors}
//                     theme={theme}
//                   />
//                 </div>
                
//                 <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
//                   <ExclusionsSection
//                     config={config}
//                     onChange={handleFieldChange}
//                     errors={errors}
//                     theme={theme}
//                   />
//                 </div>
                
//                 <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
//                   <AdvancedSection
//                     config={config}
//                     onChange={handleFieldChange}
//                     errors={errors}
//                     theme={theme}
//                   />
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Action Buttons */}
//           <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
//             <div className="flex-1">
//               {Object.keys(errors).length > 0 && (
//                 <span className="text-sm text-red-600 dark:text-red-400 flex items-center">
//                   <AlertCircle className="w-4 h-4 mr-1" />
//                   Fix errors to save
//                 </span>
//               )}
//             </div>
            
//             <button
//               onClick={handleTest}
//               disabled={isTesting}
//               className={`px-4 py-2 rounded-lg text-sm ${
//                 theme === 'dark'
//                   ? 'bg-blue-600 hover:bg-blue-700'
//                   : 'bg-blue-500 hover:bg-blue-600'
//               } text-white disabled:opacity-50`}
//             >
//               {isTesting ? 'Testing...' : 'Test Configuration'}
//             </button>
            
//             <button
//               onClick={handleReset}
//               className={`px-4 py-2 rounded-lg text-sm ${
//                 theme === 'dark'
//                   ? 'bg-gray-700 hover:bg-gray-600'
//                   : 'bg-gray-100 hover:bg-gray-200'
//               }`}
//             >
//               Reset
//             </button>
            
//             <button
//               onClick={handleSave}
//               disabled={isSaving || !isFormValid}
//               className={`px-4 py-2 rounded-lg text-sm ${
//                 isFormValid && !isSaving
//                   ? theme === 'dark'
//                     ? 'bg-green-600 hover:bg-green-700'
//                     : 'bg-green-500 hover:bg-green-600'
//                   : 'bg-gray-400 cursor-not-allowed'
//               } text-white`}
//             >
//               {isSaving ? (
//                 <>
//                   <RefreshCw className="w-4 h-4 mr-2 inline animate-spin" />
//                   Saving...
//                 </>
//               ) : (
//                 <>
//                   <Save className="w-4 h-4 mr-2 inline" />
//                   Save Configuration
//                 </>
//               )}
//             </button>
//           </div>

//           {/* Test Results */}
//           {testResults && (
//             <div className={`mt-4 p-4 rounded-lg ${
//               testResults.success
//                 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
//                 : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
//             }`}>
//               <div className="flex items-start">
//                 {testResults.success ? (
//                   <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
//                 ) : (
//                   <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
//                 )}
//                 <div>
//                   <p className="font-medium">
//                     {testResults.success ? 'Configuration is valid' : 'Configuration has issues'}
//                   </p>
//                   {testResults.next_available && (
//                     <p className="text-sm mt-1">{testResults.next_available.message}</p>
//                   )}
//                   {testResults.error && (
//                     <p className="text-sm mt-1">{testResults.error}</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}
//         </>
//       )}

//       {/* Presets Modal */}
//       <PresetsModal
//         isOpen={showPresets}
//         onClose={() => setShowPresets(false)}
//         onApply={handleApplyPreset}
//         theme={theme}
//       />

//       {/* Mobile Success Alert */}
//       <MobileSuccessAlert
//         message={mobileSuccessAlert.message}
//         isVisible={mobileSuccessAlert.visible}
//         onClose={() => setMobileSuccessAlert({ visible: false, message: '' })}
//         theme={theme}
//       />
//     </div>
//   );
// };

// export default TimeVariantConfig;





import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Calendar, CalendarDays, CalendarClock, Globe,
  Sun, Moon, AlertTriangle, CheckCircle, XCircle,
  ChevronDown, ChevronUp, Plus, Trash2, RefreshCw,
  Zap, Shield, Lock, Unlock, Filter, Save, X,
  Timer, CalendarOff, Settings, Info, HelpCircle, Check,
  AlertCircle, Download, Upload, Copy, Eye, EyeOff,
  Wifi, WifiOff, Radio, Smartphone, Router,
  HardDrive, Cpu, ShieldCheck, Cloud
} from 'lucide-react';
import { toast } from 'react-toastify';

import { getThemeClasses } from '../Shared/components';
import { formatDate, formatTime, formatDateTime } from '../Shared/formatters';
import useTimeVariant, {
  DAYS_OF_WEEK,
  TIME_UNITS,
  TIMEZONE_OPTIONS,
  TIME_PRESETS
} from './hooks/useTimeVariant';

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/**
 * Section Header Component
 */
const SectionHeader = ({ icon: Icon, title, description, theme }) => {
  const themeClasses = getThemeClasses(theme);
  
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <Icon className={`w-5 h-5 ${themeClasses.text.primary}`} />
      </div>
      <div>
        <h3 className={`font-semibold ${themeClasses.text.primary}`}>{title}</h3>
        {description && (
          <p className={`text-sm mt-1 ${themeClasses.text.secondary}`}>{description}</p>
        )}
      </div>
    </div>
  );
};

/**
 * Toggle Switch Component
 */
const ToggleSwitch = ({ enabled, onChange, label, description, theme }) => {
  const themeClasses = getThemeClasses(theme);
  
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <div>
        <p className={`text-sm font-medium ${themeClasses.text.primary}`}>{label}</p>
        {description && (
          <p className={`text-xs mt-1 ${themeClasses.text.secondary}`}>{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-indigo-600' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

/**
 * Input Field Component
 */
const InputField = ({
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  min,
  max,
  step,
  disabled,
  theme,
  icon: Icon,
  required
}) => {
  const themeClasses = getThemeClasses(theme);
  
  return (
    <div className="space-y-1">
      {label && (
        <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className={`w-4 h-4 ${themeClasses.text.secondary}`} />
          </div>
        )}
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={`w-full px-3 py-2 rounded-lg border ${
            Icon ? 'pl-10' : ''
          } ${
            error
              ? 'border-red-500 focus:ring-red-500'
              : theme === 'dark'
                ? 'border-gray-700 bg-gray-800 focus:ring-indigo-500 focus:border-indigo-500'
                : 'border-gray-300 bg-white focus:ring-indigo-500 focus:border-indigo-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${themeClasses.text.primary}`}
        />
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

/**
 * Day Button Component
 */
const DayButton = ({ day, selected, onClick, theme }) => {
  const themeClasses = getThemeClasses(theme);
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        selected
          ? 'bg-indigo-600 text-white'
          : theme === 'dark'
            ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {day.label.slice(0, 3)}
    </button>
  );
};

/**
 * Exclusion Date Item Component
 */
const ExclusionDateItem = ({ date, onRemove, theme }) => {
  const themeClasses = getThemeClasses(theme);
  
  return (
    <div className={`flex items-center justify-between p-2 rounded-lg ${
      theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
    }`}>
      <span className={`text-sm ${themeClasses.text.primary}`}>
        {formatDate(date)}
      </span>
      <button
        type="button"
        onClick={() => onRemove(date)}
        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

/**
 * Preset Card Component
 */
const PresetCard = ({ preset, onSelect, theme }) => {
  const themeClasses = getThemeClasses(theme);
  
  return (
    <button
      onClick={() => onSelect(preset)}
      className={`w-full text-left p-4 rounded-lg border transition-all hover:shadow-md ${
        theme === 'dark'
          ? 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <h4 className={`font-semibold ${themeClasses.text.primary}`}>{preset.name}</h4>
      <p className={`text-sm mt-1 ${themeClasses.text.secondary}`}>{preset.description}</p>
    </button>
  );
};

/**
 * Presets Modal Component
 */
const PresetsModal = ({ isOpen, onClose, onSelect, theme }) => {
  const themeClasses = getThemeClasses(theme);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`rounded-2xl shadow-2xl w-full max-w-md ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-bold ${themeClasses.text.primary}`}>
              Quick Presets
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${
                theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {TIME_PRESETS.map(preset => (
            <PresetCard
              key={preset.id}
              preset={preset}
              onSelect={() => {
                onSelect(preset);
                onClose();
              }}
              theme={theme}
            />
          ))}
        </div>
        
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * Availability Preview Component
 */
const AvailabilityPreview = ({ isAvailable, nextAvailable, summary, theme }) => {
  const themeClasses = getThemeClasses(theme);
  
  return (
    <div className={`p-4 rounded-xl border ${
      isAvailable
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            {isAvailable ? (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            )}
            <span className={`font-medium ${isAvailable ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
              {isAvailable ? 'Available Now' : 'Not Available'}
            </span>
          </div>
          
          {!isAvailable && nextAvailable && (
            <div className="mb-3 p-3 rounded-lg bg-white/50 dark:bg-black/30">
              <p className={`text-sm ${themeClasses.text.primary}`}>
                <Clock className="w-4 h-4 inline mr-2" />
                {nextAvailable.message}
              </p>
            </div>
          )}
          
          {summary && summary.restrictions && summary.restrictions.length > 0 && (
            <div className="space-y-2 mt-3">
              <p className={`text-xs font-medium ${themeClasses.text.secondary}`}>
                Active Restrictions:
              </p>
              {summary.restrictions.map((restriction, index) => (
                <div key={index} className="flex items-start gap-2 text-xs">
                  <div className="w-1 h-1 rounded-full bg-gray-400 mt-1.5" />
                  <span className={themeClasses.text.secondary}>
                    {restriction.description}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TimeVariantConfig = ({
  timeVariant: externalTimeVariant,
  onChange,
  errors: externalErrors = {},
  theme = 'light',
  isMobile = false,
  showHeader = true,
  onSave,
  onTest
}) => {
  const themeClasses = getThemeClasses(theme);
  
  // Use refs to prevent infinite loops
  const isInitialMount = useRef(true);
  const prevExternalTimeVariantRef = useRef(externalTimeVariant);
  
  // Use the custom hook for all time variant logic
  const {
    timeVariant,
    setTimeVariant,
    errors: internalErrors,
    availabilityStatus,
    handleChange,
    handleTimeChange,
    handleDateChange,
    toggleDay,
    addExclusionDate,
    removeExclusionDate,
    clearExclusionDates,
    toggleSchedule,
    toggleDuration,
    toggleForceAvailable,
    validateTimeVariant,
    isFormValid,
    isAvailableNow,
    getNextAvailableTime,
    getAvailabilitySummary,
    testAvailability,
    applyPreset,
    prepareForBackend,
    resetTimeVariant,
    formattedTimeRange,
    formattedScheduleRange,
    formattedDuration
  } = useTimeVariant(externalTimeVariant);

  // Local UI state
  const [activeSection, setActiveSection] = useState('time_of_day');
  const [showPresets, setShowPresets] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [newExclusionDate, setNewExclusionDate] = useState('');
  const [testResult, setTestResult] = useState(null);

  // Combine errors
  const errors = useMemo(() => ({ ...internalErrors, ...externalErrors }), [internalErrors, externalErrors]);

  // FIXED: Sync with external timeVariant prop with deep comparison
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevExternalTimeVariantRef.current = externalTimeVariant;
      return;
    }
    
    // Only update if externalTimeVariant actually changed (deep comparison)
    if (externalTimeVariant && 
        JSON.stringify(externalTimeVariant) !== JSON.stringify(prevExternalTimeVariantRef.current)) {
      setTimeVariant(externalTimeVariant);
      prevExternalTimeVariantRef.current = externalTimeVariant;
    }
  }, [externalTimeVariant, setTimeVariant]);

  // FIXED: Notify parent of changes - with debounce to prevent rapid updates
  useEffect(() => {
    if (!onChange) return;
    
    // Use timeout to debounce rapid changes
    const timeoutId = setTimeout(() => {
      onChange(timeVariant);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [timeVariant, onChange]);

  // Handle test
  const handleTest = useCallback(async () => {
    setIsTesting(true);
    try {
      const result = await testAvailability();
      setTestResult(result);
      if (onTest) onTest(result);
      
      toast[result?.is_available_now ? 'success' : 'info'](
        result?.is_available_now ? 'Configuration is valid and available now' : 'Configuration is valid but not currently available'
      );
    } catch (error) {
      toast.error('Test failed: ' + error.message);
    } finally {
      setIsTesting(false);
    }
  }, [testAvailability, onTest]);

  // Handle save
  const handleSave = useCallback(() => {
    if (!validateTimeVariant()) {
      toast.error('Please fix validation errors before saving');
      return;
    }
    
    const backendData = prepareForBackend();
    if (onSave) {
      onSave(backendData);
    }
    toast.success('Time variant configuration saved');
  }, [validateTimeVariant, prepareForBackend, onSave]);

  // Handle preset selection
  const handlePresetSelect = useCallback((preset) => {
    applyPreset(preset.id);
    toast.success(`Applied preset: ${preset.name}`);
  }, [applyPreset]);

  // Handle add exclusion date
  const handleAddExclusionDate = useCallback(() => {
    if (!newExclusionDate) return;
    addExclusionDate(newExclusionDate);
    setNewExclusionDate('');
  }, [newExclusionDate, addExclusionDate]);

  // Mobile navigation sections
  const sections = useMemo(() => [
    { id: 'time_of_day', label: 'Time', icon: Clock },
    { id: 'days_of_week', label: 'Days', icon: CalendarDays },
    { id: 'schedule', label: 'Schedule', icon: CalendarClock },
    { id: 'duration', label: 'Duration', icon: Timer },
    { id: 'exclusions', label: 'Exclude', icon: CalendarOff },
    { id: 'advanced', label: 'Advanced', icon: Settings }
  ], []);

  // Current availability status
  const currentAvailability = useMemo(() => {
    if (!timeVariant.is_active) return { available: true, reason: 'Time controls disabled' };
    if (timeVariant.force_available) return { available: true, reason: 'Force enabled' };
    
    return {
      available: isAvailableNow(),
      nextAvailable: getNextAvailableTime(),
      summary: getAvailabilitySummary()
    };
  }, [timeVariant.is_active, timeVariant.force_available, isAvailableNow, getNextAvailableTime, getAvailabilitySummary]);

  return (
    <div className="space-y-6">
      {/* Header */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className={`text-xl font-bold flex items-center ${themeClasses.text.primary}`}>
              <Clock className="w-5 h-5 mr-2 text-indigo-600" />
              Time Variant Configuration
            </h2>
            <p className={`text-sm mt-1 ${themeClasses.text.secondary}`}>
              Control when this plan is available for purchase
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPresets(true)}
              className="px-3 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Presets
            </button>
            
            <div className="flex items-center gap-2">
              <span className={`text-sm ${themeClasses.text.secondary}`}>
                {timeVariant.is_active ? 'Enabled' : 'Disabled'}
              </span>
              <button
                type="button"
                onClick={() => handleChange('is_active', !timeVariant.is_active)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  timeVariant.is_active
                    ? 'bg-indigo-600'
                    : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  timeVariant.is_active ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disabled State */}
      {!timeVariant.is_active ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className={`text-lg font-medium mb-2 ${themeClasses.text.primary}`}>
            Time Variant Disabled
          </h3>
          <p className={`text-sm mb-6 max-w-md mx-auto ${themeClasses.text.secondary}`}>
            This plan is currently available at all times. Enable time variant controls to restrict availability.
          </p>
          <button
            onClick={() => handleChange('is_active', true)}
            className="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Enable Time Controls
          </button>
        </div>
      ) : (
        <>
          {/* Availability Preview */}
          <AvailabilityPreview
            isAvailable={currentAvailability.available}
            nextAvailable={currentAvailability.nextAvailable}
            summary={currentAvailability.summary}
            theme={theme}
          />

          {/* Mobile Navigation */}
          {isMobile && (
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b dark:border-gray-800 overflow-x-auto">
              <div className="flex space-x-1 p-2">
                {sections.map(section => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex flex-col items-center px-3 py-2 rounded-lg min-w-[60px] transition-colors ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="text-xs font-medium">{section.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="space-y-6">
            {isMobile ? (
              // Mobile: Show only active section
              <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
                {activeSection === 'time_of_day' && (
                  <div className="space-y-4">
                    <SectionHeader
                      icon={Clock}
                      title="Time of Day Restrictions"
                      description="Set specific hours when plan is available"
                      theme={theme}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <InputField
                        label="Start Time"
                        type="time"
                        value={timeVariant.start_time}
                        onChange={(value) => handleTimeChange('start_time', value)}
                        error={errors.start_time}
                        theme={theme}
                        icon={Sun}
                      />
                      
                      <InputField
                        label="End Time"
                        type="time"
                        value={timeVariant.end_time}
                        onChange={(value) => handleTimeChange('end_time', value)}
                        error={errors.end_time}
                        theme={theme}
                        icon={Moon}
                      />
                    </div>
                    
                    {formattedTimeRange && (
                      <div className={`text-sm p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <span className="font-medium">Time Range: </span>
                        {formattedTimeRange.range}
                      </div>
                    )}
                    
                    <p className={`text-xs ${themeClasses.text.secondary}`}>
                      Plan will be available only between these times each day
                    </p>
                  </div>
                )}

                {activeSection === 'days_of_week' && (
                  <div className="space-y-4">
                    <SectionHeader
                      icon={CalendarDays}
                      title="Days of Week Restrictions"
                      description="Select which days plan is available"
                      theme={theme}
                    />
                    
                    <div className="grid grid-cols-4 gap-2">
                      {DAYS_OF_WEEK.map(day => (
                        <DayButton
                          key={day.value}
                          day={day}
                          selected={timeVariant.available_days?.includes(day.value)}
                          onClick={() => toggleDay(day.value)}
                          theme={theme}
                        />
                      ))}
                    </div>
                    
                    {timeVariant.available_days && timeVariant.available_days.length > 0 && (
                      <div className={`text-sm p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <span className="font-medium">Selected Days: </span>
                        {timeVariant.available_days
                          .map(day => DAYS_OF_WEEK.find(d => d.value === day)?.label)
                          .join(', ')}
                      </div>
                    )}
                    
                    {errors.available_days && (
                      <p className="text-xs text-red-500">{errors.available_days}</p>
                    )}
                    
                    <p className={`text-xs ${themeClasses.text.secondary}`}>
                      Plan will be available only on selected days
                    </p>
                  </div>
                )}

                {activeSection === 'schedule' && (
                  <div className="space-y-4">
                    <SectionHeader
                      icon={CalendarClock}
                      title="Schedule Restrictions"
                      description="Set a date range for availability"
                      theme={theme}
                    />
                    
                    <ToggleSwitch
                      enabled={timeVariant.schedule_active}
                      onChange={toggleSchedule}
                      label="Enable Schedule"
                      description="Restrict to specific date range"
                      theme={theme}
                    />
                    
                    {timeVariant.schedule_active && (
                      <>
                        <InputField
                          label="Start Date & Time"
                          type="datetime-local"
                          value={timeVariant.schedule_start_date || ''}
                          onChange={(value) => handleDateChange('schedule_start_date', value)}
                          error={errors.schedule_start_date}
                          theme={theme}
                          required
                        />
                        
                        <InputField
                          label="End Date & Time"
                          type="datetime-local"
                          value={timeVariant.schedule_end_date || ''}
                          onChange={(value) => handleDateChange('schedule_end_date', value)}
                          error={errors.schedule_end_date}
                          theme={theme}
                          required
                        />
                        
                        {formattedScheduleRange && (
                          <div className={`text-sm p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <span className="font-medium">Schedule: </span>
                            {formattedScheduleRange.range}
                          </div>
                        )}
                      </>
                    )}
                    
                    <p className={`text-xs ${themeClasses.text.secondary}`}>
                      Plan will be available only within this date range
                    </p>
                  </div>
                )}

                {activeSection === 'duration' && (
                  <div className="space-y-4">
                    <SectionHeader
                      icon={Timer}
                      title="Duration Restrictions"
                      description="Set a fixed duration from a start date"
                      theme={theme}
                    />
                    
                    <ToggleSwitch
                      enabled={timeVariant.duration_active}
                      onChange={toggleDuration}
                      label="Enable Duration"
                      description="Restrict to a fixed time period"
                      theme={theme}
                    />
                    
                    {timeVariant.duration_active && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <InputField
                            label="Duration Value"
                            type="number"
                            min="1"
                            value={timeVariant.duration_value}
                            onChange={(value) => handleChange('duration_value', parseInt(value) || 0)}
                            error={errors.duration_value}
                            theme={theme}
                            required
                          />
                          
                          <div className="space-y-1">
                            <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                              Unit
                            </label>
                            <select
                              value={timeVariant.duration_unit}
                              onChange={(e) => handleChange('duration_unit', e.target.value)}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                theme === 'dark'
                                  ? 'bg-gray-800 border-gray-700'
                                  : 'bg-white border-gray-300'
                              } ${themeClasses.text.primary}`}
                            >
                              {TIME_UNITS.map(unit => (
                                <option key={unit.value} value={unit.value}>
                                  {unit.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        <InputField
                          label="Start Date & Time"
                          type="datetime-local"
                          value={timeVariant.duration_start_date || ''}
                          onChange={(value) => handleDateChange('duration_start_date', value)}
                          error={errors.duration_start_date}
                          theme={theme}
                          required
                        />
                        
                        {formattedDuration && (
                          <div className={`text-sm p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <span className="font-medium">Duration: </span>
                            {formattedDuration}
                          </div>
                        )}
                      </>
                    )}
                    
                    <p className={`text-xs ${themeClasses.text.secondary}`}>
                      Plan will be available for a fixed duration from the start date
                    </p>
                  </div>
                )}

                {activeSection === 'exclusions' && (
                  <div className="space-y-4">
                    <SectionHeader
                      icon={CalendarOff}
                      title="Exclusion Dates"
                      description="Specific dates when plan is NOT available"
                      theme={theme}
                    />
                    
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={newExclusionDate}
                        onChange={(e) => setNewExclusionDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className={`flex-1 px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700'
                            : 'bg-white border-gray-300'
                        } ${themeClasses.text.primary}`}
                      />
                      <button
                        onClick={handleAddExclusionDate}
                        disabled={!newExclusionDate}
                        className={`px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {timeVariant.exclusion_dates?.map(date => (
                        <ExclusionDateItem
                          key={date}
                          date={date}
                          onRemove={removeExclusionDate}
                          theme={theme}
                        />
                      ))}
                      
                      {(!timeVariant.exclusion_dates || timeVariant.exclusion_dates.length === 0) && (
                        <p className={`text-sm text-center py-4 ${themeClasses.text.secondary}`}>
                          No exclusion dates added
                        </p>
                      )}
                    </div>
                    
                    {timeVariant.exclusion_dates?.length > 0 && (
                      <button
                        onClick={clearExclusionDates}
                        className="text-sm text-red-600 hover:text-red-800 dark:text-red-400"
                      >
                        Clear All
                      </button>
                    )}
                    
                    {errors.exclusion_dates && (
                      <p className="text-xs text-red-500">{errors.exclusion_dates}</p>
                    )}
                    
                    <p className={`text-xs ${themeClasses.text.secondary}`}>
                      Plan will NOT be available on these specific dates
                    </p>
                  </div>
                )}

                {activeSection === 'advanced' && (
                  <div className="space-y-4">
                    <SectionHeader
                      icon={Settings}
                      title="Advanced Settings"
                      description="Timezone and override options"
                      theme={theme}
                    />
                    
                    <div className="space-y-1">
                      <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                        Timezone
                      </label>
                      <select
                        value={timeVariant.timezone}
                        onChange={(e) => handleChange('timezone', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700'
                            : 'bg-white border-gray-300'
                        } ${themeClasses.text.primary}`}
                      >
                        {TIMEZONE_OPTIONS.map(tz => (
                          <option key={tz.value} value={tz.value}>
                            {tz.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <ToggleSwitch
                      enabled={timeVariant.force_available}
                      onChange={toggleForceAvailable}
                      label="Force Available"
                      description="Override all restrictions and make plan always available"
                      theme={theme}
                    />
                    
                    {timeVariant.force_available && (
                      <div className={`p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800`}>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          Force available overrides all time restrictions. Use with caution.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Desktop: Grid layout
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Time of Day */}
                <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
                  <SectionHeader
                    icon={Clock}
                    title="Time of Day Restrictions"
                    description="Set specific hours when plan is available"
                    theme={theme}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Start Time"
                      type="time"
                      value={timeVariant.start_time}
                      onChange={(value) => handleTimeChange('start_time', value)}
                      error={errors.start_time}
                      theme={theme}
                      icon={Sun}
                    />
                    
                    <InputField
                      label="End Time"
                      type="time"
                      value={timeVariant.end_time}
                      onChange={(value) => handleTimeChange('end_time', value)}
                      error={errors.end_time}
                      theme={theme}
                      icon={Moon}
                    />
                  </div>
                  
                  {formattedTimeRange && (
                    <div className={`mt-3 text-sm p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <span className="font-medium">Time Range: </span>
                      {formattedTimeRange.range}
                    </div>
                  )}
                </div>

                {/* Days of Week */}
                <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
                  <SectionHeader
                    icon={CalendarDays}
                    title="Days of Week Restrictions"
                    description="Select which days plan is available"
                    theme={theme}
                  />
                  
                  <div className="grid grid-cols-4 gap-2">
                    {DAYS_OF_WEEK.map(day => (
                      <DayButton
                        key={day.value}
                        day={day}
                        selected={timeVariant.available_days?.includes(day.value)}
                        onClick={() => toggleDay(day.value)}
                        theme={theme}
                      />
                    ))}
                  </div>
                  
                  {timeVariant.available_days && timeVariant.available_days.length > 0 && (
                    <div className={`mt-3 text-sm p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <span className="font-medium">Selected Days: </span>
                      {timeVariant.available_days
                        .map(day => DAYS_OF_WEEK.find(d => d.value === day)?.label)
                        .join(', ')}
                    </div>
                  )}
                  
                  {errors.available_days && (
                    <p className="text-xs text-red-500 mt-2">{errors.available_days}</p>
                  )}
                </div>

                {/* Schedule */}
                <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
                  <SectionHeader
                    icon={CalendarClock}
                    title="Schedule Restrictions"
                    description="Set a date range for availability"
                    theme={theme}
                  />
                  
                  <ToggleSwitch
                    enabled={timeVariant.schedule_active}
                    onChange={toggleSchedule}
                    label="Enable Schedule"
                    description="Restrict to specific date range"
                    theme={theme}
                  />
                  
                  {timeVariant.schedule_active && (
                    <>
                      <div className="mt-4 space-y-4">
                        <InputField
                          label="Start Date & Time"
                          type="datetime-local"
                          value={timeVariant.schedule_start_date || ''}
                          onChange={(value) => handleDateChange('schedule_start_date', value)}
                          error={errors.schedule_start_date}
                          theme={theme}
                          required
                        />
                        
                        <InputField
                          label="End Date & Time"
                          type="datetime-local"
                          value={timeVariant.schedule_end_date || ''}
                          onChange={(value) => handleDateChange('schedule_end_date', value)}
                          error={errors.schedule_end_date}
                          theme={theme}
                          required
                        />
                      </div>
                      
                      {formattedScheduleRange && (
                        <div className={`mt-3 text-sm p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          <span className="font-medium">Schedule: </span>
                          {formattedScheduleRange.range}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Duration */}
                <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
                  <SectionHeader
                    icon={Timer}
                    title="Duration Restrictions"
                    description="Set a fixed duration from a start date"
                    theme={theme}
                  />
                  
                  <ToggleSwitch
                    enabled={timeVariant.duration_active}
                    onChange={toggleDuration}
                    label="Enable Duration"
                    description="Restrict to a fixed time period"
                    theme={theme}
                  />
                  
                  {timeVariant.duration_active && (
                    <>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <InputField
                          label="Duration Value"
                          type="number"
                          min="1"
                          value={timeVariant.duration_value}
                          onChange={(value) => handleChange('duration_value', parseInt(value) || 0)}
                          error={errors.duration_value}
                          theme={theme}
                          required
                        />
                        
                        <div className="space-y-1">
                          <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                            Unit
                          </label>
                          <select
                            value={timeVariant.duration_unit}
                            onChange={(e) => handleChange('duration_unit', e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-800 border-gray-700'
                                : 'bg-white border-gray-300'
                            } ${themeClasses.text.primary}`}
                          >
                            {TIME_UNITS.map(unit => (
                              <option key={unit.value} value={unit.value}>
                                {unit.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <InputField
                        label="Start Date & Time"
                        type="datetime-local"
                        value={timeVariant.duration_start_date || ''}
                        onChange={(value) => handleDateChange('duration_start_date', value)}
                        error={errors.duration_start_date}
                        theme={theme}
                        required
                      />
                      
                      {formattedDuration && (
                        <div className={`mt-3 text-sm p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          <span className="font-medium">Duration: </span>
                          {formattedDuration}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Exclusions */}
                <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
                  <SectionHeader
                    icon={CalendarOff}
                    title="Exclusion Dates"
                    description="Specific dates when plan is NOT available"
                    theme={theme}
                  />
                  
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={newExclusionDate}
                      onChange={(e) => setNewExclusionDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className={`flex-1 px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700'
                          : 'bg-white border-gray-300'
                      } ${themeClasses.text.primary}`}
                    />
                    <button
                      onClick={handleAddExclusionDate}
                      disabled={!newExclusionDate}
                      className={`px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                    {timeVariant.exclusion_dates?.map(date => (
                      <ExclusionDateItem
                        key={date}
                        date={date}
                        onRemove={removeExclusionDate}
                        theme={theme}
                      />
                    ))}
                    
                    {(!timeVariant.exclusion_dates || timeVariant.exclusion_dates.length === 0) && (
                      <p className={`text-sm text-center py-4 ${themeClasses.text.secondary}`}>
                        No exclusion dates added
                      </p>
                    )}
                  </div>
                  
                  {timeVariant.exclusion_dates?.length > 0 && (
                    <button
                      onClick={clearExclusionDates}
                      className="mt-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400"
                    >
                      Clear All
                    </button>
                  )}
                  
                  {errors.exclusion_dates && (
                    <p className="text-xs text-red-500 mt-2">{errors.exclusion_dates}</p>
                  )}
                </div>

                {/* Advanced */}
                <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
                  <SectionHeader
                    icon={Settings}
                    title="Advanced Settings"
                    description="Timezone and override options"
                    theme={theme}
                  />
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                        Timezone
                      </label>
                      <select
                        value={timeVariant.timezone}
                        onChange={(e) => handleChange('timezone', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700'
                            : 'bg-white border-gray-300'
                        } ${themeClasses.text.primary}`}
                      >
                        {TIMEZONE_OPTIONS.map(tz => (
                          <option key={tz.value} value={tz.value}>
                            {tz.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <ToggleSwitch
                      enabled={timeVariant.force_available}
                      onChange={toggleForceAvailable}
                      label="Force Available"
                      description="Override all restrictions"
                      theme={theme}
                    />
                    
                    {timeVariant.force_available && (
                      <div className={`p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800`}>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          Force available overrides all restrictions
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Test Results */}
          {testResult && (
            <div className={`p-4 rounded-lg ${
              testResult.is_available_now
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
            }`}>
              <div className="flex items-start gap-3">
                {testResult.is_available_now ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                )}
                <div>
                  <p className={`font-medium ${
                    testResult.is_available_now
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-yellow-800 dark:text-yellow-200'
                  }`}>
                    {testResult.is_available_now ? 'Configuration Valid' : 'Configuration Valid but Not Available'}
                  </p>
                  {testResult.next_available && (
                    <p className={`text-sm mt-1 ${
                      testResult.is_available_now
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-yellow-700 dark:text-yellow-300'
                    }`}>
                      {testResult.next_available.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex-1">
              {Object.keys(errors).length > 0 && (
                <span className="text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Fix errors to save
                </span>
              )}
            </div>
            
            <button
              onClick={handleTest}
              disabled={isTesting}
              className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white disabled:opacity-50`}
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Test
                </>
              )}
            </button>
            
            <button
              onClick={resetTimeVariant}
              className={`px-4 py-2 rounded-lg text-sm ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Reset
            </button>
            
            <button
              onClick={handleSave}
              disabled={!isFormValid}
              className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
                isFormValid
                  ? theme === 'dark'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-400 cursor-not-allowed'
              } text-white`}
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </>
      )}

      {/* Presets Modal */}
      <PresetsModal
        isOpen={showPresets}
        onClose={() => setShowPresets(false)}
        onSelect={handlePresetSelect}
        theme={theme}
      />
    </div>
  );
};

export default TimeVariantConfig;