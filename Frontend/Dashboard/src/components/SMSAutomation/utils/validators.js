/**
 * Utility functions for validating SMS data
 */

// Validate phone number (Kenyan format)
export const validatePhoneNumber = (phone) => {
  if (!phone) return { valid: false, message: 'Phone number is required' };
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check length and format
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    // Valid Kenyan number starting with 0
    return { 
      valid: true, 
      normalized: `254${cleaned.substring(1)}`,
      formatted: `+254 ${cleaned.substring(1, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`
    };
  } else if (cleaned.length === 9) {
    // Valid Kenyan number without leading 0
    return { 
      valid: true, 
      normalized: `254${cleaned}`,
      formatted: `+254 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`
    };
  } else if (cleaned.length === 12 && cleaned.startsWith('254')) {
    // Already in international format
    return { 
      valid: true, 
      normalized: cleaned,
      formatted: `+${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 9)} ${cleaned.substring(9)}`
    };
  }
  
  return { valid: false, message: 'Invalid phone number format. Use 07XXXXXXXX or 01XXXXXXXX' };
};

// Validate email
export const validateEmail = (email) => {
  if (!email) return { valid: false, message: 'Email is required' };
  
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) {
    return { valid: false, message: 'Invalid email format' };
  }
  
  return { valid: true };
};

// Validate SMS message
export const validateMessage = (message, options = {}) => {
  const {
    maxLength = 1600,
    minLength = 1,
    allowEmpty = false
  } = options;
  
  if (!message && !allowEmpty) {
    return { valid: false, message: 'Message is required' };
  }
  
  if (message && message.length < minLength) {
    return { valid: false, message: `Message must be at least ${minLength} characters` };
  }
  
  if (message && message.length > maxLength) {
    return { valid: false, message: `Message cannot exceed ${maxLength} characters` };
  }
  
  // Calculate message parts
  const chars = message?.length || 0;
  let parts = 1;
  if (chars > 160) {
    parts = Math.ceil(chars / 153);
  }
  
  return {
    valid: true,
    characters: chars,
    parts,
    encoding: chars > 160 ? 'Unicode' : 'GSM'
  };
};

// Validate template variables
export const validateTemplateVariables = (template, context) => {
  if (!template || !template.variables) {
    return { valid: true, missing: [] };
  }
  
  const variables = template.variables || {};
  const required = template.required_variables || [];
  const missing = [];
  
  required.forEach(varName => {
    if (context[varName] === undefined || context[varName] === null) {
      missing.push(varName);
    }
  });
  
  if (missing.length > 0) {
    return {
      valid: false,
      missing,
      message: `Missing required variables: ${missing.join(', ')}`
    };
  }
  
  return { valid: true, missing: [] };
};

// Validate gateway configuration
export const validateGatewayConfig = (config) => {
  const errors = {};
  
  if (!config.name) {
    errors.name = 'Gateway name is required';
  }
  
  if (!config.gateway_type) {
    errors.gateway_type = 'Gateway type is required';
  }
  
  // Validate based on gateway type
  if (config.gateway_type === 'africas_talking') {
    if (!config.api_key) {
      errors.api_key = 'API username is required for Africa\'s Talking';
    }
    if (!config.api_secret) {
      errors.api_secret = 'API key is required for Africa\'s Talking';
    }
  } else if (config.gateway_type === 'twilio') {
    if (!config.api_key) {
      errors.api_key = 'Account SID is required for Twilio';
    }
    if (!config.api_secret) {
      errors.api_secret = 'Auth Token is required for Twilio';
    }
  } else if (config.gateway_type === 'smpp') {
    if (!config.smpp_host) {
      errors.smpp_host = 'SMPP host is required';
    }
    if (!config.smpp_system_id) {
      errors.smpp_system_id = 'System ID is required';
    }
  } else if (config.gateway_type === 'custom') {
    if (!config.api_url) {
      errors.api_url = 'API URL is required for custom gateway';
    }
  }
  
  // Validate rate limits
  if (config.max_messages_per_minute && config.max_messages_per_minute < 1) {
    errors.max_messages_per_minute = 'Must be greater than 0';
  }
  
  if (config.max_messages_per_hour && config.max_messages_per_hour < 1) {
    errors.max_messages_per_hour = 'Must be greater than 0';
  }
  
  if (config.max_messages_per_day && config.max_messages_per_day < 1) {
    errors.max_messages_per_day = 'Must be greater than 0';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

// Validate date range
export const validateDateRange = (startDate, endDate) => {
  if (!startDate && !endDate) {
    return { valid: true };
  }
  
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  
  if (start && isNaN(start.getTime())) {
    return { valid: false, message: 'Invalid start date' };
  }
  
  if (end && isNaN(end.getTime())) {
    return { valid: false, message: 'Invalid end date' };
  }
  
  if (start && end && start > end) {
    return { valid: false, message: 'Start date must be before end date' };
  }
  
  return { valid: true };
};

// Validate pagination parameters
export const validatePagination = (page, pageSize) => {
  const errors = {};
  
  if (page !== undefined) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      errors.page = 'Page must be a positive integer';
    }
  }
  
  if (pageSize !== undefined) {
    const sizeNum = parseInt(pageSize);
    if (isNaN(sizeNum) || sizeNum < 1 || sizeNum > 1000) {
      errors.pageSize = 'Page size must be between 1 and 1000';
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};