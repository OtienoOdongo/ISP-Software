


// /**
//  * Validation utilities
//  */

// /**
//  * Validate Kenyan phone number
//  */
// export const validatePhoneNumber = (phone) => {
//   if (!phone) return { valid: false, message: 'Phone number is required' };
  
//   // Remove all non-numeric characters
//   const cleaned = phone.replace(/\D/g, '');
  
//   // Check length and prefix
//   if (cleaned.length === 10 && cleaned.startsWith('07')) {
//     return { valid: true, normalized: `254${cleaned.slice(1)}` };
//   }
  
//   if (cleaned.length === 10 && cleaned.startsWith('01')) {
//     return { valid: true, normalized: `254${cleaned.slice(1)}` };
//   }
  
//   if (cleaned.length === 12 && cleaned.startsWith('254')) {
//     return { valid: true, normalized: cleaned };
//   }
  
//   if (cleaned.length === 9 && !cleaned.startsWith('0')) {
//     return { valid: true, normalized: `254${cleaned}` };
//   }
  
//   return { 
//     valid: false, 
//     message: 'Invalid phone number format. Use 07XXXXXXXX, 01XXXXXXXX, or 254XXXXXXXXX' 
//   };
// };

// /**
//  * Validate email
//  */
// export const validateEmail = (email) => {
//   if (!email) return { valid: false, message: 'Email is required' };
  
//   const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!regex.test(email)) {
//     return { valid: false, message: 'Invalid email format' };
//   }
  
//   return { valid: true };
// };

// /**
//  * Validate required field
//  */
// export const validateRequired = (value, fieldName = 'Field') => {
//   if (!value || (typeof value === 'string' && !value.trim())) {
//     return { valid: false, message: `${fieldName} is required` };
//   }
//   return { valid: true };
// };

// /**
//  * Validate min length
//  */
// export const validateMinLength = (value, minLength, fieldName = 'Field') => {
//   if (!value) return { valid: false, message: `${fieldName} is required` };
  
//   if (value.length < minLength) {
//     return { 
//       valid: false, 
//       message: `${fieldName} must be at least ${minLength} characters` 
//     };
//   }
  
//   return { valid: true };
// };

// /**
//  * Validate max length
//  */
// export const validateMaxLength = (value, maxLength, fieldName = 'Field') => {
//   if (!value) return { valid: true };
  
//   if (value.length > maxLength) {
//     return { 
//       valid: false, 
//       message: `${fieldName} must be at most ${maxLength} characters` 
//     };
//   }
  
//   return { valid: true };
// };

// /**
//  * Validate number range
//  */
// export const validateNumberRange = (value, min, max, fieldName = 'Field') => {
//   if (value === null || value === undefined) return { valid: true };
  
//   const num = Number(value);
//   if (isNaN(num)) {
//     return { valid: false, message: `${fieldName} must be a number` };
//   }
  
//   if (num < min || num > max) {
//     return { 
//       valid: false, 
//       message: `${fieldName} must be between ${min} and ${max}` 
//     };
//   }
  
//   return { valid: true };
// };

// /**
//  * Validate form data
//  */
// export const validateForm = (data, validations) => {
//   const errors = {};
  
//   Object.entries(validations).forEach(([field, rules]) => {
//     const value = data[field];
    
//     if (rules.required) {
//       const result = validateRequired(value, rules.label || field);
//       if (!result.valid) errors[field] = result.message;
//     }
    
//     if (rules.minLength && !errors[field]) {
//       const result = validateMinLength(value, rules.minLength, rules.label || field);
//       if (!result.valid) errors[field] = result.message;
//     }
    
//     if (rules.maxLength && !errors[field]) {
//       const result = validateMaxLength(value, rules.maxLength, rules.label || field);
//       if (!result.valid) errors[field] = result.message;
//     }
    
//     if (rules.pattern && !errors[field] && value) {
//       const regex = new RegExp(rules.pattern);
//       if (!regex.test(value)) {
//         errors[field] = rules.patternMessage || `Invalid ${rules.label || field} format`;
//       }
//     }
    
//     if (rules.min !== undefined && !errors[field] && value) {
//       const result = validateNumberRange(value, rules.min, rules.max || Infinity, rules.label || field);
//       if (!result.valid) errors[field] = result.message;
//     }
//   });
  
//   return errors;
// };









/**
 * Validation utilities
 */

/**
 * Validate Kenyan phone number
 */
export const validatePhoneNumber = (phone) => {
  if (!phone) return { valid: false, message: 'Phone number is required' };
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check length and prefix
  if (cleaned.length === 10 && cleaned.startsWith('07')) {
    return { valid: true, normalized: `254${cleaned.slice(1)}` };
  }
  
  if (cleaned.length === 10 && cleaned.startsWith('01')) {
    return { valid: true, normalized: `254${cleaned.slice(1)}` };
  }
  
  if (cleaned.length === 12 && cleaned.startsWith('254')) {
    return { valid: true, normalized: cleaned };
  }
  
  if (cleaned.length === 9 && !cleaned.startsWith('0')) {
    return { valid: true, normalized: `254${cleaned}` };
  }
  
  return { 
    valid: false, 
    message: 'Invalid phone number format. Use 07XXXXXXXX, 01XXXXXXXX, or 254XXXXXXXXX' 
  };
};

/**
 * Validate email
 */
export const validateEmail = (email) => {
  if (!email) return { valid: false, message: 'Email is required' };
  
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return { valid: false, message: 'Invalid email format' };
  }
  
  return { valid: true };
};

/**
 * Validate required field
 */
export const validateRequired = (value, fieldName = 'Field') => {
  if (value === null || value === undefined) {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  if (typeof value === 'string' && !value.trim()) {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  return { valid: true };
};

/**
 * Validate min length
 */
export const validateMinLength = (value, minLength, fieldName = 'Field') => {
  if (!value) return { valid: false, message: `${fieldName} is required` };
  
  if (value.length < minLength) {
    return { 
      valid: false, 
      message: `${fieldName} must be at least ${minLength} characters` 
    };
  }
  
  return { valid: true };
};

/**
 * Validate max length
 */
export const validateMaxLength = (value, maxLength, fieldName = 'Field') => {
  if (!value) return { valid: true };
  
  if (value.length > maxLength) {
    return { 
      valid: false, 
      message: `${fieldName} must be at most ${maxLength} characters` 
    };
  }
  
  return { valid: true };
};

/**
 * Validate number range
 */
export const validateNumberRange = (value, min, max, fieldName = 'Field') => {
  if (value === null || value === undefined) return { valid: true };
  
  const num = Number(value);
  if (isNaN(num)) {
    return { valid: false, message: `${fieldName} must be a number` };
  }
  
  if (num < min || num > max) {
    return { 
      valid: false, 
      message: `${fieldName} must be between ${min} and ${max}` 
    };
  }
  
  return { valid: true };
};

/**
 * Validate form data
 */
export const validateForm = (data, validations) => {
  const errors = {};
  
  Object.entries(validations).forEach(([field, rules]) => {
    const value = data[field];
    
    if (rules.required) {
      const result = validateRequired(value, rules.label || field);
      if (!result.valid) errors[field] = result.message;
    }
    
    if (rules.minLength && !errors[field] && value) {
      const result = validateMinLength(value, rules.minLength, rules.label || field);
      if (!result.valid) errors[field] = result.message;
    }
    
    if (rules.maxLength && !errors[field] && value) {
      const result = validateMaxLength(value, rules.maxLength, rules.label || field);
      if (!result.valid) errors[field] = result.message;
    }
    
    if (rules.pattern && !errors[field] && value) {
      const regex = new RegExp(rules.pattern);
      if (!regex.test(value)) {
        errors[field] = rules.patternMessage || `Invalid ${rules.label || field} format`;
      }
    }
    
    if (rules.min !== undefined && !errors[field] && value) {
      const result = validateNumberRange(value, rules.min, rules.max || Infinity, rules.label || field);
      if (!result.valid) errors[field] = result.message;
    }
  });
  
  return errors;
};