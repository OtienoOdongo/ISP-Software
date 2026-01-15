// Currency formatting
export const formatCurrency = (amount, currency = 'KES', locale = 'en-KE') => {
  if (amount == null) return '—';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

// Date formatting
export const formatDate = (date, format = 'medium', locale = 'en-KE') => {
  if (!date) return '—';
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  
  const formats = {
    short: { 
      dateStyle: 'short',
      timeStyle: 'short'
    },
    medium: {
      dateStyle: 'medium',
      timeStyle: 'short'
    },
    long: {
      dateStyle: 'long',
      timeStyle: 'short'
    },
    dateOnly: {
      dateStyle: 'medium'
    },
    timeOnly: {
      timeStyle: 'short'
    },
    relative: (date) => {
      const now = new Date();
      const diffMs = now - dateObj;
      const diffSec = Math.round(diffMs / 1000);
      const diffMin = Math.round(diffSec / 60);
      const diffHour = Math.round(diffMin / 60);
      const diffDay = Math.round(diffHour / 24);
      
      if (diffSec < 60) return 'Just now';
      if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
      if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
      if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
      
      return new Intl.DateTimeFormat(locale, { 
        month: 'short', 
        day: 'numeric' 
      }).format(dateObj);
    }
  };
  
  if (format === 'relative') {
    return formats.relative(dateObj);
  }
  
  if (formats[format]) {
    return new Intl.DateTimeFormat(locale, formats[format]).format(dateObj);
  }
  
  return dateObj.toLocaleDateString(locale);
};

// Phone number formatting (Kenyan)
export const formatPhoneNumber = (phone, format = 'local') => {
  if (!phone) return '—';
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length < 9) return phone;
  
  const formats = {
    local: (num) => {
      if (num.startsWith('254')) {
        return `0${num.substring(3)}`;
      } else if (num.startsWith('7')) {
        return `0${num}`;
      }
      return num;
    },
    international: (num) => {
      if (num.startsWith('0')) {
        return `+254${num.substring(1)}`;
      } else if (num.startsWith('7')) {
        return `+254${num}`;
      } else if (num.startsWith('254')) {
        return `+${num}`;
      }
      return num;
    },
    masked: (num) => {
      const local = formatPhoneNumber(num, 'local');
      if (local.length <= 6) return local;
      return `${local.substring(0, 3)}***${local.substring(6)}`;
    }
  };
  
  return formats[format] ? formats[format](cleaned) : cleaned;
};

// Data size formatting
export const formatDataSize = (bytes, decimals = 2) => {
  if (bytes == null || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Percentage formatting
export const formatPercentage = (value, decimals = 1) => {
  if (value == null) return '—';
  
  const formatted = parseFloat(value).toFixed(decimals);
  return `${formatted}%`;
};

// Number formatting with abbreviations
export const formatNumber = (num, decimals = 1) => {
  if (num == null) return '—';
  
  const absNum = Math.abs(num);
  
  if (absNum >= 1.0e9) {
    return (num / 1.0e9).toFixed(decimals) + 'B';
  }
  if (absNum >= 1.0e6) {
    return (num / 1.0e6).toFixed(decimals) + 'M';
  }
  if (absNum >= 1.0e3) {
    return (num / 1.0e3).toFixed(decimals) + 'K';
  }
  
  return num.toFixed(decimals);
};

// Duration formatting
export const formatDuration = (seconds, format = 'auto') => {
  if (seconds == null) return '—';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const formats = {
    short: () => {
      if (days > 0) return `${days}d`;
      if (hours > 0) return `${hours}h`;
      if (minutes > 0) return `${minutes}m`;
      return `${secs}s`;
    },
    medium: () => {
      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      if (secs > 0 && days === 0) parts.push(`${secs}s`);
      return parts.join(' ');
    },
    long: () => {
      const parts = [];
      if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
      if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
      if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
      if (secs > 0 && days === 0 && hours === 0) {
        parts.push(`${secs} second${secs !== 1 ? 's' : ''}`);
      }
      return parts.join(', ');
    },
    auto: () => {
      if (days > 0) return formats.long();
      if (hours > 0) return `${hours}h ${minutes}m`;
      if (minutes > 0) return `${minutes}m ${secs}s`;
      return `${secs}s`;
    }
  };
  
  return formats[format] ? formats[format]() : formats.auto();
};

// File name formatting
export const formatFileName = (filename, maxLength = 30) => {
  if (!filename) return '';
  
  if (filename.length <= maxLength) return filename;
  
  const extension = filename.split('.').pop();
  const name = filename.substring(0, filename.lastIndexOf('.'));
  const charsToKeep = maxLength - extension.length - 4; // Account for "..."
  
  if (charsToKeep <= 3) {
    return `...${filename.substring(filename.length - maxLength)}`;
  }
  
  return `${name.substring(0, charsToKeep)}...${extension}`;
};

// Social media formatting
export const formatSocialMedia = {
  twitter: (username) => `@${username.replace('@', '')}`,
  instagram: (username) => `@${username.replace('@', '')}`,
  linkedin: (url) => {
    const match = url.match(/linkedin\.com\/in\/([^\/]+)/);
    return match ? match[1] : url;
  },
  facebook: (url) => {
    const match = url.match(/facebook\.com\/([^\/?]+)/);
    return match ? match[1] : url;
  }
};

// Address formatting
export const formatAddress = (address, format = 'single-line') => {
  if (!address || typeof address !== 'object') return '';
  
  const { street, city, state, postalCode, country } = address;
  const parts = [];
  
  if (street) parts.push(street);
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (postalCode) parts.push(postalCode);
  if (country) parts.push(country);
  
  if (format === 'multi-line') {
    return parts.join('\n');
  }
  
  return parts.join(', ');
};

// Time formatting from seconds
export const formatTimeFromSeconds = (totalSeconds, showSeconds = true) => {
  if (totalSeconds == null) return '—';
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  
  const parts = [];
  
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (showSeconds && seconds > 0) parts.push(`${seconds}s`);
  
  return parts.length > 0 ? parts.join(' ') : '0s';
};

// Truncate text
export const truncateText = (text, maxLength = 50, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength).trim() + suffix;
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Format enum value (converts snake_case to Title Case)
export const formatEnum = (value) => {
  if (!value) return '';
  
  return value
    .split('_')
    .map(word => capitalize(word))
    .join(' ');
};

// Format boolean to Yes/No
export const formatBoolean = (value) => {
  return value ? 'Yes' : 'No';
};

// Format rating (0-10 to stars)
export const formatRating = (rating, max = 10) => {
  const stars = Math.round((rating / max) * 5);
  return '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
};

// Export all formatters
export default {
  formatCurrency,
  formatDate,
  formatPhoneNumber,
  formatDataSize,
  formatPercentage,
  formatNumber,
  formatDuration,
  formatFileName,
  formatSocialMedia,
  formatAddress,
  formatTimeFromSeconds,
  truncateText,
  capitalize,
  formatEnum,
  formatBoolean,
  formatRating
};