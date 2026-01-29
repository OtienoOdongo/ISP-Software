

// // ============================================================================
// // FORMATTING UTILITIES
// // ============================================================================

// // Format bytes to human readable
// export const formatBytes = (bytes, decimals = 2) => {
//   if (bytes === 0 || bytes === null || bytes === undefined) return "0 Bytes";
//   if (bytes === -1 || bytes === "Unlimited") return "Unlimited";
  
//   const k = 1024;
//   const dm = decimals < 0 ? 0 : decimals;
//   const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
  
//   if (i >= sizes.length) return "Very Large";
  
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
// };

// // Format time duration
// export const formatDuration = (seconds) => {
//   if (!seconds || seconds <= 0) return "0s";
  
//   const days = Math.floor(seconds / 86400);
//   const hours = Math.floor((seconds % 86400) / 3600);
//   const minutes = Math.floor((seconds % 3600) / 60);
//   const secs = seconds % 60;
  
//   const parts = [];
//   if (days > 0) parts.push(`${days}d`);
//   if (hours > 0) parts.push(`${hours}h`);
//   if (minutes > 0) parts.push(`${minutes}m`);
//   if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
//   return parts.join(" ");
// };

// // Format time in HH:MM:SS format
// export const formatTime = (seconds) => {
//   if (seconds === null || seconds === undefined) return "--:--";
//   if (typeof seconds === 'string' && seconds.includes(':')) return seconds;
  
//   const totalSeconds = parseInt(seconds);
//   if (isNaN(totalSeconds)) return "--:--";
  
//   const hours = Math.floor(totalSeconds / 3600);
//   const minutes = Math.floor((totalSeconds % 3600) / 60);
  
//   if (hours > 0) {
//     return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
//   }
//   return `${minutes.toString().padStart(2, '0')}`;
// };

// // Format time range
// export const formatTimeRange = (startTime, endTime) => {
//   if (!startTime && !endTime) return "All day";
  
//   const start = formatTime(startTime);
//   const end = formatTime(endTime);
  
//   return `${start} - ${end}`;
// };

// // Format date
// export const formatDate = (dateString, includeTime = false) => {
//   if (!dateString) return "No date";
  
//   try {
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) return "Invalid date";
    
//     const options = {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       ...(includeTime && { hour: '2-digit', minute: '2-digit' })
//     };
    
//     return date.toLocaleDateString('en-US', options);
//   } catch (error) {
//     return "Invalid date";
//   }
// };

// // Format date range
// export const formatDateRange = (startDate, endDate) => {
//   if (!startDate && !endDate) return "No date range";
//   if (!endDate) return `From ${formatDate(startDate)}`;
//   if (!startDate) return `Until ${formatDate(endDate)}`;
  
//   return `${formatDate(startDate)} - ${formatDate(endDate)}`;
// };

// // Format number with commas for thousands
// export const formatNumber = (number, decimals = 0) => {
//   if (number === null || number === undefined || isNaN(number)) return '0';
  
//   const num = typeof number === 'number' ? number : parseFloat(number);
//   if (isNaN(num)) return '0';
  
//   return num.toLocaleString('en-US', {
//     minimumFractionDigits: decimals,
//     maximumFractionDigits: decimals
//   });
// };

// // Format currency (Kenyan Shillings)
// export const formatCurrency = (amount, includeSymbol = true) => {
//   if (amount === null || amount === undefined || isNaN(amount)) {
//     return includeSymbol ? 'KES 0' : '0';
//   }
  
//   const num = typeof amount === 'number' ? amount : parseFloat(amount);
//   if (isNaN(num)) return includeSymbol ? 'KES 0' : '0';
  
//   const formatted = new Intl.NumberFormat('en-KE', {
//     style: 'currency',
//     currency: 'KES',
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0
//   }).format(num);
  
//   return includeSymbol ? formatted : formatted.replace('KES', '').trim();
// };

// // Format discount percentage
// export const formatDiscount = (discount) => {
//   if (!discount || discount === 0) return "No discount";
  
//   if (typeof discount === 'object') {
//     if (discount.type === 'percentage') {
//       return `${discount.value}% off`;
//     } else if (discount.type === 'fixed') {
//       return `KES ${formatNumber(discount.value)} off`;
//     }
//   }
  
//   return `${discount}% off`;
// };

// // Format bandwidth
// export const formatBandwidth = (kbps, includeUnit = true) => {
//   if (kbps === 0 || kbps === null || kbps === undefined) {
//     return includeUnit ? "Unlimited" : "Unlimited";
//   }
  
//   if (kbps >= 1000000) {
//     const value = (kbps / 1000000).toFixed(2);
//     return includeUnit ? `${value} Gbps` : value;
//   } else if (kbps >= 1000) {
//     const value = (kbps / 1000).toFixed(1);
//     return includeUnit ? `${value} Mbps` : value;
//   } else {
//     return includeUnit ? `${kbps} Kbps` : kbps.toString();
//   }
// };

// // Format speed (download/upload)
// export const formatSpeed = (speedObj) => {
//   if (!speedObj || !speedObj.value) return "N/A";
  
//   const value = parseFloat(speedObj.value);
//   const unit = speedObj.unit || "Mbps";
  
//   if (isNaN(value)) return "N/A";
  
//   return `${formatNumber(value, 1)} ${unit}`;
// };

// // Format data limit
// export const formatDataLimit = (dataLimitObj) => {
//   if (!dataLimitObj) return "N/A";
  
//   if (dataLimitObj.unit === 'Unlimited' || dataLimitObj.value === 'Unlimited') {
//     return "Unlimited";
//   }
  
//   const value = parseFloat(dataLimitObj.value);
//   const unit = dataLimitObj.unit || "GB";
  
//   if (isNaN(value)) return "N/A";
  
//   return `${formatNumber(value, 1)} ${unit}`;
// };

// // Format usage limit
// export const formatUsageLimit = (usageLimitObj) => {
//   if (!usageLimitObj) return "N/A";
  
//   if (usageLimitObj.unit === 'Unlimited' || usageLimitObj.value === 'Unlimited') {
//     return "Unlimited";
//   }
  
//   const value = parseFloat(usageLimitObj.value);
//   const unit = usageLimitObj.unit || "Hours";
  
//   if (isNaN(value)) return "N/A";
  
//   return `${formatNumber(value)} ${unit}`;
// };

// // Format validity period
// export const formatValidityPeriod = (validityPeriodObj) => {
//   if (!validityPeriodObj) return "No expiry";
  
//   if (validityPeriodObj.unit === 'Unlimited' || validityPeriodObj.value === '0') {
//     return "No expiry";
//   }
  
//   const value = parseFloat(validityPeriodObj.value);
//   const unit = validityPeriodObj.unit || "Days";
  
//   if (isNaN(value)) return "No expiry";
  
//   if (unit === "Hours") {
//     if (value >= 24) {
//       const days = Math.floor(value / 24);
//       const hours = value % 24;
//       if (hours > 0) {
//         return `${days}d ${hours}h`;
//       }
//       return `${days} day${days > 1 ? 's' : ''}`;
//     }
//     return `${value} hour${value > 1 ? 's' : ''}`;
//   }
  
//   return `${value} ${unit.toLowerCase().slice(0, -1)}${value > 1 ? 's' : ''}`;
// };

// // Format rating stars
// export const formatRating = (rating, maxRating = 5) => {
//   if (!rating || rating === 0) return "No rating";
  
//   const filledStars = Math.floor(rating);
//   const hasHalfStar = rating % 1 >= 0.5;
//   const emptyStars = maxRating - filledStars - (hasHalfStar ? 1 : 0);
  
//   return {
//     filled: filledStars,
//     half: hasHalfStar ? 1 : 0,
//     empty: emptyStars,
//     value: rating.toFixed(1)
//   };
// };

// // Format availability status
// export const formatAvailabilityStatus = (isAvailable, nextAvailableTime) => {
//   if (isAvailable) {
//     return { status: "available", label: "Available Now", color: "green" };
//   } else if (nextAvailableTime) {
//     return { 
//       status: "scheduled", 
//       label: `Available at ${formatTime(nextAvailableTime)}`, 
//       color: "blue" 
//     };
//   } else {
//     return { status: "unavailable", label: "Currently Unavailable", color: "red" };
//   }
// };

// // Format days of week list
// export const formatDaysOfWeek = (daysArray, shortForm = false) => {
//   if (!daysArray || daysArray.length === 0) return "Every day";
  
//   const dayMap = {
//     monday: shortForm ? "Mon" : "Monday",
//     tuesday: shortForm ? "Tue" : "Tuesday",
//     wednesday: shortForm ? "Wed" : "Wednesday",
//     thursday: shortForm ? "Thu" : "Thursday",
//     friday: shortForm ? "Fri" : "Friday",
//     saturday: shortForm ? "Sat" : "Saturday",
//     sunday: shortForm ? "Sun" : "Sunday"
//   };
  
//   const formattedDays = daysArray.map(day => dayMap[day] || day);
  
//   if (formattedDays.length === 7) return "Every day";
//   if (formattedDays.length === 5 && 
//       formattedDays.includes("Monday") && 
//       formattedDays.includes("Friday")) {
//     return "Weekdays only";
//   }
  
//   return formattedDays.join(", ");
// };

// // Format exclusion dates
// export const formatExclusionDates = (datesArray) => {
//   if (!datesArray || datesArray.length === 0) return "None";
//   if (datesArray.length === 1) return formatDate(datesArray[0]);
  
//   return `${datesArray.length} excluded dates`;
// };

// // Format percentage
// export const formatPercentage = (value, decimals = 1) => {
//   if (value === null || value === undefined || isNaN(value)) return "0%";
  
//   const num = typeof value === 'number' ? value : parseFloat(value);
//   if (isNaN(num)) return "0%";
  
//   return `${num.toFixed(decimals)}%`;
// };

// // Format pricing tier
// export const formatPricingTier = (tier) => {
//   if (!tier) return "Standard";
  
//   return {
//     basic: "Basic",
//     standard: "Standard",
//     premium: "Premium",
//     business: "Business",
//     enterprise: "Enterprise"
//   }[tier] || tier.charAt(0).toUpperCase() + tier.slice(1);
// };






// ============================================================================
// FORMATTING UTILITIES
// ALIGNED WITH DJANGO BACKEND DATA STRUCTURES
// ============================================================================

// Format bytes to human readable
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === null || bytes === undefined) return "0 Bytes";
  if (bytes === 0) return "0 Bytes";
  if (bytes === "Unlimited" || bytes === -1) return "Unlimited";
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  
  if (typeof bytes === 'string') {
    try {
      bytes = parseInt(bytes);
    } catch {
      return "Invalid";
    }
  }
  
  if (isNaN(bytes)) return "Invalid";
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  if (i >= sizes.length) {
    return `${(bytes / Math.pow(k, sizes.length - 1)).toFixed(dm)} ${sizes[sizes.length - 1]}`;
  }
  
  return `${(bytes / Math.pow(k, i)).toFixed(dm)} ${sizes[i]}`;
};

// Format time duration from seconds
export const formatDuration = (seconds) => {
  if (seconds === null || seconds === undefined) return "0s";
  if (seconds === 0) return "0s";
  if (seconds === "Unlimited" || seconds === -1) return "Unlimited";
  
  const totalSeconds = parseInt(seconds);
  if (isNaN(totalSeconds)) return "Invalid";
  
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(" ");
};

// Format time in HH:MM format (handles seconds or time string)
export const formatTime = (timeValue) => {
  if (!timeValue && timeValue !== 0) return "--:--";
  
  // If it's already a time string like "09:00"
  if (typeof timeValue === 'string' && timeValue.includes(':')) {
    return timeValue.length === 5 ? timeValue : timeValue.slice(0, 5);
  }
  
  // If it's seconds
  const totalSeconds = parseInt(timeValue);
  if (isNaN(totalSeconds)) return "--:--";
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Format time range
export const formatTimeRange = (startTime, endTime) => {
  if (!startTime && !endTime) return "All day";
  
  const start = formatTime(startTime);
  const end = formatTime(endTime);
  
  if (start === "--:--" && end === "--:--") return "All day";
  if (start === "--:--") return `Until ${end}`;
  if (end === "--:--") return `From ${start}`;
  
  return `${start} - ${end}`;
};

// Format date
export const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return "No date";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...(includeTime && { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true, 
      })
    };
    
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error('Date formatting error:', error);
    return "Invalid date";
  }
};

// Format date range
export const formatDateRange = (startDate, endDate) => {
  if (!startDate && !endDate) return "No date range";
  if (!endDate) return `From ${formatDate(startDate)}`;
  if (!startDate) return `Until ${formatDate(endDate)}`;
  
  // If same day
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start.toDateString() === end.toDateString()) {
    return `${formatDate(startDate, true)} - ${formatDate(endDate, true).split(' ').pop()}`;
  }
  
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

// Format number with commas
export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined || number === "") return '0';
  
  const num = typeof number === 'number' ? number : parseFloat(number);
  if (isNaN(num)) return '0';
  
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

// Format currency (Kenyan Shillings)
export const formatCurrency = (amount, includeSymbol = true, decimals = 0) => {
  if (amount === null || amount === undefined || amount === "") {
    return includeSymbol ? 'KES 0' : '0';
  }
  
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(num)) return includeSymbol ? 'KES 0' : '0';
  
  const formatted = new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
  
  return includeSymbol ? `KES ${formatted}` : formatted;
};

// Format discount
export const formatDiscount = (discountInfo) => {
  if (!discountInfo) return "No discount";
  
  if (typeof discountInfo === 'object') {
    if (discountInfo.type === 'percentage') {
      return `${discountInfo.value}% off`;
    } else if (discountInfo.type === 'fixed') {
      return `KES ${formatNumber(discountInfo.value)} off`;
    }
  }
  
  // If it's just a number, assume percentage
  const discountValue = parseFloat(discountInfo);
  if (!isNaN(discountValue)) {
    return `${discountValue}% off`;
  }
  
  return "Discount";
};

// Format bandwidth (Kbps to readable)
export const formatBandwidth = (kbps, includeUnit = true) => {
  if (kbps === null || kbps === undefined) {
    return includeUnit ? "N/A" : "0";
  }
  
  if (kbps === 0 || kbps === "Unlimited" || kbps === -1) {
    return includeUnit ? "Unlimited" : "Unlimited";
  }
  
  const numKbps = typeof kbps === 'number' ? kbps : parseFloat(kbps);
  if (isNaN(numKbps)) return includeUnit ? "N/A" : "0";
  
  if (numKbps >= 1000000) {
    const value = (numKbps / 1000000).toFixed(2);
    return includeUnit ? `${value} Gbps` : value;
  } else if (numKbps >= 1000) {
    const value = (numKbps / 1000).toFixed(1);
    return includeUnit ? `${value} Mbps` : value;
  } else {
    return includeUnit ? `${numKbps} Kbps` : numKbps.toString();
  }
};

// Format speed object (download/upload)
export const formatSpeed = (speedObj) => {
  if (!speedObj || !speedObj.value) return "N/A";
  
  if (speedObj.value === "Unlimited" || speedObj.value === -1) {
    return "Unlimited";
  }
  
  const value = parseFloat(speedObj.value);
  const unit = speedObj.unit || "Mbps";
  
  if (isNaN(value)) return "N/A";
  
  return `${formatNumber(value, 1)} ${unit}`;
};

// Format data limit object
export const formatDataLimit = (dataLimitObj) => {
  if (!dataLimitObj) return "N/A";
  
  if (dataLimitObj.unit === 'Unlimited' || dataLimitObj.value === 'Unlimited') {
    return "Unlimited";
  }
  
  const value = parseFloat(dataLimitObj.value);
  const unit = dataLimitObj.unit || "GB";
  
  if (isNaN(value)) return "N/A";
  
  if (unit === "GB" && value >= 1000) {
    return `${(value / 1000).toFixed(1)} TB`;
  }
  
  return `${formatNumber(value, 1)} ${unit}`;
};

// Format usage limit object
export const formatUsageLimit = (usageLimitObj) => {
  if (!usageLimitObj) return "N/A";
  
  if (usageLimitObj.unit === 'Unlimited' || usageLimitObj.value === 'Unlimited') {
    return "Unlimited";
  }
  
  const value = parseFloat(usageLimitObj.value);
  const unit = usageLimitObj.unit || "Hours";
  
  if (isNaN(value)) return "N/A";
  
  if (unit === "Hours" && value >= 24) {
    const days = Math.floor(value / 24);
    const hours = value % 24;
    if (hours > 0) {
      return `${days}d ${hours}h`;
    }
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  
  return `${formatNumber(value)} ${unit.toLowerCase()}`;
};

// Format validity period object
export const formatValidityPeriod = (validityPeriodObj) => {
  if (!validityPeriodObj) return "No expiry";
  
  if (validityPeriodObj.unit === 'Unlimited' || validityPeriodObj.value === '0') {
    return "No expiry";
  }
  
  const value = parseFloat(validityPeriodObj.value);
  const unit = validityPeriodObj.unit || "Days";
  
  if (isNaN(value)) return "No expiry";
  
  // Convert hours to days if applicable
  if (unit === "Hours") {
    if (value >= 24) {
      const days = Math.floor(value / 24);
      const hours = value % 24;
      if (hours > 0) {
        return `${days}d ${hours}h`;
      }
      return `${days} day${days > 1 ? 's' : ''}`;
    }
    return `${value} hour${value > 1 ? 's' : ''}`;
  }
  
  // Handle pluralization
  const unitName = unit.toLowerCase();
  const singularUnit = unitName.endsWith('s') ? unitName.slice(0, -1) : unitName;
  
  if (value === 1) {
    return `${value} ${singularUnit}`;
  }
  
  return `${value} ${unitName}`;
};

// Format days of week array (3-letter codes to readable)
export const formatDaysOfWeek = (daysArray, shortForm = false) => {
  if (!daysArray || !Array.isArray(daysArray) || daysArray.length === 0) {
    return "Every day";
  }
  
  const dayMap = {
    mon: shortForm ? "Mon" : "Monday",
    tue: shortForm ? "Tue" : "Tuesday",
    wed: shortForm ? "Wed" : "Wednesday",
    thu: shortForm ? "Thu" : "Thursday",
    fri: shortForm ? "Fri" : "Friday",
    sat: shortForm ? "Sat" : "Saturday",
    sun: shortForm ? "Sun" : "Sunday"
  };
  
  const formattedDays = daysArray
    .map(day => dayMap[day] || day)
    .filter(Boolean);
  
  if (formattedDays.length === 7) return "Every day";
  
  // Check for weekdays
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const shortWeekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  
  const targetDays = shortForm ? shortWeekdays : weekdays;
  if (formattedDays.length === 5 && 
      formattedDays.every(day => targetDays.includes(day))) {
    return shortForm ? "Mon-Fri" : "Weekdays only";
  }
  
  // Check for weekends
  const weekends = ["Saturday", "Sunday"];
  const shortWeekends = ["Sat", "Sun"];
  
  const targetWeekends = shortForm ? shortWeekends : weekends;
  if (formattedDays.length === 2 && 
      formattedDays.every(day => targetWeekends.includes(day))) {
    return shortForm ? "Sat-Sun" : "Weekends only";
  }
  
  return formattedDays.join(", ");
};

// Format exclusion dates
export const formatExclusionDates = (datesArray) => {
  if (!datesArray || !Array.isArray(datesArray) || datesArray.length === 0) {
    return "None";
  }
  
  if (datesArray.length === 1) {
    return formatDate(datesArray[0]);
  }
  
  if (datesArray.length <= 3) {
    return datesArray.map(date => formatDate(date)).join(", ");
  }
  
  return `${datesArray.length} excluded dates`;
};

// Format percentage
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || value === "") return "0%";
  
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(num)) return "0%";
  
  return `${num.toFixed(decimals)}%`;
};

// Format pricing tier
export const formatPricingTier = (tier) => {
  if (!tier) return "Standard";
  
  const tierMap = {
    basic: "Basic",
    standard: "Standard",
    premium: "Premium",
    business: "Business",
    enterprise: "Enterprise",
    residential: "Residential",
    promotional: "Promotional"
  };
  
  return tierMap[tier.toLowerCase()] || tier.charAt(0).toUpperCase() + tier.slice(1);
};

// Format plan type
export const formatPlanType = (planType) => {
  const typeMap = {
    paid: "Paid",
    free_trial: "Free Trial",
    promotional: "Promotional"
  };
  
  return typeMap[planType] || planType.charAt(0).toUpperCase() + planType.slice(1);
};

// Format access type
export const formatAccessType = (accessType) => {
  const typeMap = {
    hotspot: "Hotspot Only",
    pppoe: "PPPoE Only",
    both: "Hotspot & PPPoE",
    dual: "Hotspot & PPPoE"
  };
  
  return typeMap[accessType] || accessType.charAt(0).toUpperCase() + accessType.slice(1);
};

// Format availability status
export const formatAvailabilityStatus = (availabilityInfo) => {
  if (!availabilityInfo) return { status: "unknown", label: "Status Unknown", color: "gray" };
  
  if (typeof availabilityInfo === 'boolean') {
    return availabilityInfo 
      ? { status: "available", label: "Available Now", color: "green" }
      : { status: "unavailable", label: "Currently Unavailable", color: "red" };
  }
  
  if (typeof availabilityInfo === 'object') {
    const { available, code, reason } = availabilityInfo;
    
    if (available) {
      return { status: "available", label: "Available Now", color: "green" };
    }
    
    switch (code) {
      case 'time_restricted':
        return { status: "time_restricted", label: "Time Restricted", color: "yellow" };
      case 'plan_inactive':
        return { status: "unavailable", label: "Plan Inactive", color: "red" };
      case 'scheduled':
        return { status: "scheduled", label: "Scheduled", color: "blue" };
      default:
        return { 
          status: "unavailable", 
          label: reason || "Currently Unavailable", 
          color: "red" 
        };
    }
  }
  
  return { status: "unknown", label: "Status Unknown", color: "gray" };
};

// Format device count
export const formatDeviceCount = (count) => {
  if (count === null || count === undefined) return "1 Device";
  if (count === 0) return "Unlimited Devices";
  if (count === 1) return "1 Device";
  return `${count} Devices`;
};

// Format MTU value
export const formatMTU = (mtu) => {
  if (!mtu) return "1492 (Default)";
  return `${mtu}`;
};

// Format timezone
export const formatTimezone = (timezone) => {
  if (!timezone) return "Africa/Nairobi";
  
  const timezoneMap = {
    "Africa/Nairobi": "EAT (Nairobi)",
    "UTC": "UTC",
    "America/New_York": "EST (New York)",
    "Europe/London": "GMT (London)",
    "Asia/Dubai": "GST (Dubai)",
    "Asia/Singapore": "SGT (Singapore)"
  };
  
  return timezoneMap[timezone] || timezone;
};

// Format duration for time variant
export const formatDurationForDisplay = (durationValue, durationUnit) => {
  if (!durationValue || durationValue === 0) return "No duration";
  
  const value = parseInt(durationValue);
  if (isNaN(value)) return "Invalid duration";
  
  const unitMap = {
    hours: value === 1 ? "hour" : "hours",
    days: value === 1 ? "day" : "days",
    weeks: value === 1 ? "week" : "weeks",
    months: value === 1 ? "month" : "months"
  };
  
  const unit = unitMap[durationUnit] || durationUnit;
  return `${value} ${unit}`;
};

// Format price matrix type
export const formatPriceMatrixType = (type) => {
  const typeMap = {
    percentage: "Percentage Discount",
    fixed: "Fixed Amount",
    tiered: "Tiered Pricing",
    volume: "Volume Discount"
  };
  
  return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
};

// Format discount rule type
export const formatDiscountRuleType = (type) => {
  const typeMap = {
    first_time: "First Time Purchase",
    loyalty: "Loyalty Discount",
    seasonal: "Seasonal Promotion",
    referral: "Referral Bonus",
    bulk: "Bulk Purchase"
  };
  
  return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
};

