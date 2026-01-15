// Phone number validation (Kenyan)
export const isValidPhoneNumber = (phone) => {
  if (!phone) return false;
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Check length and format
  if (cleaned.length < 9 || cleaned.length > 12) return false;
  
  // Kenyan phone patterns
  const patterns = [
    /^2547\d{8}$/,    // +2547XXXXXXXX
    /^2541\d{8}$/,    // +2541XXXXXXXX
    /^07\d{8}$/,      // 07XXXXXXXX
    /^01\d{8}$/       // 01XXXXXXXX
  ];
  
  return patterns.some(pattern => pattern.test(cleaned));
};

// Email validation
export const isValidEmail = (email) => {
  if (!email) return false;
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Password validation
export const isValidPassword = (password) => {
  if (!password || password.length < 8) return false;
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  // Require at least 3 of 4 conditions
  const conditions = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar];
  const passedConditions = conditions.filter(Boolean).length;
  
  return passedConditions >= 3;
};

// URL validation
export const isValidUrl = (url) => {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Date validation
export const isValidDate = (date) => {
  if (!date) return false;
  
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

// Number validation
export const isValidNumber = (value, options = {}) => {
  if (value === null || value === undefined) return false;
  
  const num = Number(value);
  if (isNaN(num)) return false;
  
  if (options.min !== undefined && num < options.min) return false;
  if (options.max !== undefined && num > options.max) return false;
  if (options.integer && !Number.isInteger(num)) return false;
  if (options.positive && num <= 0) return false;
  
  return true;
};

// String validation
export const isValidString = (value, options = {}) => {
  if (value === null || value === undefined) return false;
  
  const str = String(value).trim();
  
  if (options.minLength !== undefined && str.length < options.minLength) return false;
  if (options.maxLength !== undefined && str.length > options.maxLength) return false;
  if (options.pattern && !options.pattern.test(str)) return false;
  if (options.required && str.length === 0) return false;
  
  return true;
};

// Array validation
export const isValidArray = (array, options = {}) => {
  if (!Array.isArray(array)) return false;
  
  if (options.minLength !== undefined && array.length < options.minLength) return false;
  if (options.maxLength !== undefined && array.length > options.maxLength) return false;
  if (options.unique && new Set(array).size !== array.length) return false;
  if (options.itemValidator) {
    return array.every(item => options.itemValidator(item));
  }
  
  return true;
};

// Object validation
export const isValidObject = (obj, schema = {}) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  
  for (const [key, validator] of Object.entries(schema)) {
    const value = obj[key];
    
    if (validator.required && (value === undefined || value === null)) {
      return false;
    }
    
    if (value !== undefined && value !== null) {
      if (validator.type) {
        switch (validator.type) {
          case 'string':
            if (!isValidString(value, validator)) return false;
            break;
          case 'number':
            if (!isValidNumber(value, validator)) return false;
            break;
          case 'boolean':
            if (typeof value !== 'boolean') return false;
            break;
          case 'date':
            if (!isValidDate(value)) return false;
            break;
          case 'array':
            if (!isValidArray(value, validator)) return false;
            break;
          case 'object':
            if (!isValidObject(value, validator.schema || {})) return false;
            break;
          case 'email':
            if (!isValidEmail(value)) return false;
            break;
          case 'phone':
            if (!isValidPhoneNumber(value)) return false;
            break;
          case 'url':
            if (!isValidUrl(value)) return false;
            break;
        }
      }
      
      if (validator.validator && !validator.validator(value)) {
        return false;
      }
    }
  }
  
  return true;
};

// Credit card validation (Luhn algorithm)
export const isValidCreditCard = (cardNumber) => {
  if (!cardNumber) return false;
  
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 13 || cleaned.length > 19) return false;
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// Kenyan ID number validation
export const isValidKenyanID = (idNumber) => {
  if (!idNumber) return false;
  
  // Remove any spaces or dashes
  const cleaned = idNumber.replace(/[\s-]/g, '');
  
  // Kenyan ID format: 8 digits
  if (!/^\d{8}$/.test(cleaned)) return false;
  
  // Basic checksum validation
  const digits = cleaned.split('').map(Number);
  let sum = 0;
  
  for (let i = 0; i < digits.length - 1; i++) {
    sum += digits[i];
  }
  
  const lastDigit = digits[digits.length - 1];
  return sum % 10 === lastDigit;
};

// M-Pesa transaction code validation
export const isValidMpesaCode = (code) => {
  if (!code) return false;
  
  // M-Pesa transaction codes are typically 10 characters
  // Format: ABC123DEF4 or similar
  return /^[A-Z0-9]{10}$/.test(code.toUpperCase());
};

// Amount validation
export const isValidAmount = (amount, currency = 'KES') => {
  if (!isValidNumber(amount, { min: 0 })) return false;
  
  const num = Number(amount);
  
  // Check decimal places based on currency
  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  
  switch (currency) {
    case 'KES':
      return decimalPlaces <= 2;
    case 'USD':
      return decimalPlaces <= 2;
    case 'JPY':
      return decimalPlaces <= 0;
    default:
      return decimalPlaces <= 2;
  }
};

// Percentage validation
export const isValidPercentage = (percentage) => {
  return isValidNumber(percentage, { min: 0, max: 100 });
};

// Time validation (HH:MM format)
export const isValidTime = (time) => {
  if (!time) return false;
  
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
};

// IPv4 validation
export const isValidIPv4 = (ip) => {
  if (!ip) return false;
  
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  
  return parts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255 && part === num.toString();
  });
};

// MAC address validation
export const isValidMAC = (mac) => {
  if (!mac) return false;
  
  // Supports formats: 00:1A:2B:3C:4D:5E or 00-1A-2B-3C-4D-5E
  return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(mac);
};

// UUID validation
export const isValidUUID = (uuid) => {
  if (!uuid) return false;
  
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
};

// Coordinate validation (latitude, longitude)
export const isValidCoordinate = (lat, lng) => {
  return isValidNumber(lat, { min: -90, max: 90 }) && 
         isValidNumber(lng, { min: -180, max: 180 });
};

// File validation
export const isValidFile = (file, options = {}) => {
  if (!file || !(file instanceof File)) return false;
  
  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    return false;
  }
  
  if (options.maxSize && file.size > options.maxSize) {
    return false;
  }
  
  if (options.allowedExtensions) {
    const extension = file.name.split('.').pop().toLowerCase();
    if (!options.allowedExtensions.includes(extension)) {
      return false;
    }
  }
  
  return true;
};

// Form validation helper
export const validateForm = (formData, schema) => {
  const errors = {};
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = formData[field];
    
    // Check required
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors[field] = rules.requiredMessage || `${field} is required`;
      continue;
    }
    
    // Skip further validation if value is empty and not required
    if (value === undefined || value === null || value === '') {
      continue;
    }
    
    // Type-specific validation
    if (rules.type === 'email' && !isValidEmail(value)) {
      errors[field] = rules.message || 'Invalid email address';
    } else if (rules.type === 'phone' && !isValidPhoneNumber(value)) {
      errors[field] = rules.message || 'Invalid phone number';
    } else if (rules.type === 'url' && !isValidUrl(value)) {
      errors[field] = rules.message || 'Invalid URL';
    } else if (rules.type === 'number' && !isValidNumber(value, rules)) {
      errors[field] = rules.message || 'Invalid number';
    } else if (rules.type === 'string' && !isValidString(value, rules)) {
      errors[field] = rules.message || 'Invalid text';
    } else if (rules.validator && !rules.validator(value, formData)) {
      errors[field] = rules.message || 'Invalid value';
    }
    
    // Custom validation
    if (rules.validate) {
      const customError = rules.validate(value, formData);
      if (customError) {
        errors[field] = customError;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Export all validators
export default {
  isValidPhoneNumber,
  isValidEmail,
  isValidPassword,
  isValidUrl,
  isValidDate,
  isValidNumber,
  isValidString,
  isValidArray,
  isValidObject,
  isValidCreditCard,
  isValidKenyanID,
  isValidMpesaCode,
  isValidAmount,
  isValidPercentage,
  isValidTime,
  isValidIPv4,
  isValidMAC,
  isValidUUID,
  isValidCoordinate,
  isValidFile,
  validateForm
};