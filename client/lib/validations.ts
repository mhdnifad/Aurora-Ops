/**
 * Comprehensive Form Validation Utilities
 * Professional real-time validation functions
 */

// Email validation with regex
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const getEmailError = (email: string): string => {
  if (!email) return 'Email is required';
  if (!validateEmail(email)) return 'Please enter a valid email address';
  return '';
};

// Password validation
export interface PasswordRequirement {
  label: string;
  met: boolean;
}

export const validatePassword = (password: string) => {
  return {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
};

export const getPasswordRequirements = (password: string): PasswordRequirement[] => {
  const validation = validatePassword(password);
  return [
    { label: 'At least 8 characters', met: validation.minLength },
    { label: 'One uppercase letter', met: validation.hasUpperCase },
    { label: 'One lowercase letter', met: validation.hasLowerCase },
    { label: 'One number', met: validation.hasNumber },
    { label: 'One special character', met: validation.hasSpecial },
  ];
};

export const isPasswordValid = (password: string): boolean => {
  const validation = validatePassword(password);
  return Object.values(validation).every(Boolean);
};

// Phone number validation and formatting
export const validatePhoneNumber = (phone: string): boolean => {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  // Check if it's 10 digits (US format) or 11 digits (with country code)
  return digitsOnly.length === 10 || digitsOnly.length === 11;
};

export const formatPhoneNumber = (value: string): string => {
  // Remove all non-digit characters
  const digitsOnly = value.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (digitsOnly.length <= 3) {
    return digitsOnly;
  } else if (digitsOnly.length <= 6) {
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
  } else if (digitsOnly.length <= 10) {
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  } else {
    // Handle country code
    return `+${digitsOnly.slice(0, 1)} (${digitsOnly.slice(1, 4)}) ${digitsOnly.slice(4, 7)}-${digitsOnly.slice(7, 11)}`;
  }
};

export const getPhoneError = (phone: string): string => {
  if (!phone) return 'Phone number is required';
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 10) return 'Phone number must be at least 10 digits';
  if (digitsOnly.length > 11) return 'Phone number is too long';
  return '';
};

// Number validation
export interface NumberValidationOptions {
  min?: number;
  max?: number;
  allowDecimal?: boolean;
  allowNegative?: boolean;
}

export const validateNumber = (
  value: string,
  options: NumberValidationOptions = {}
): { isValid: boolean; error: string } => {
  const { min, max, allowDecimal = true, allowNegative = true } = options;

  if (!value) {
    return { isValid: false, error: 'Value is required' };
  }

  const num = parseFloat(value);

  if (isNaN(num)) {
    return { isValid: false, error: 'Please enter a valid number' };
  }

  if (!allowNegative && num < 0) {
    return { isValid: false, error: 'Negative numbers are not allowed' };
  }

  if (!allowDecimal && !Number.isInteger(num)) {
    return { isValid: false, error: 'Decimal numbers are not allowed' };
  }

  if (min !== undefined && num < min) {
    return { isValid: false, error: `Value must be at least ${min}` };
  }

  if (max !== undefined && num > max) {
    return { isValid: false, error: `Value must be at most ${max}` };
  }

  return { isValid: true, error: '' };
};

export const formatNumber = (
  value: string,
  options: NumberValidationOptions = {}
): string => {
  const { allowDecimal = true, allowNegative = true } = options;

  let formatted = value;

  // Remove all non-numeric characters except decimal point and minus
  if (allowDecimal && allowNegative) {
    formatted = formatted.replace(/[^\d.-]/g, '');
  } else if (allowDecimal) {
    formatted = formatted.replace(/[^\d.]/g, '');
  } else if (allowNegative) {
    formatted = formatted.replace(/[^\d-]/g, '');
  } else {
    formatted = formatted.replace(/[^\d]/g, '');
  }

  // Ensure only one decimal point
  if (allowDecimal) {
    const parts = formatted.split('.');
    if (parts.length > 2) {
      formatted = parts[0] + '.' + parts.slice(1).join('');
    }
  }

  // Ensure minus only at the start
  if (allowNegative) {
    const minusCount = (formatted.match(/-/g) || []).length;
    if (minusCount > 0) {
      formatted = formatted.startsWith('-')
        ? '-' + formatted.slice(1).replace(/-/g, '')
        : formatted.replace(/-/g, '');
    }
  }

  return formatted;
};

// URL validation
export const validateURL = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

export const getURLError = (url: string): string => {
  if (!url) return 'URL is required';
  if (!validateURL(url)) return 'Please enter a valid URL (must start with http:// or https://)';
  return '';
};

export const formatURL = (value: string): string => {
  // Auto-add https:// if not present
  if (value && !value.match(/^https?:\/\//i)) {
    return `https://${value}`;
  }
  return value;
};

// File validation
export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[]; // MIME types or extensions
}

export const validateFile = (
  file: File,
  options: FileValidationOptions = {}
): { isValid: boolean; error: string } => {
  const { maxSize, allowedTypes } = options;

  if (maxSize && file.size > maxSize) {
    const sizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `File size must be less than ${sizeMB}MB`,
    };
  }

  if (allowedTypes && allowedTypes.length > 0) {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isTypeAllowed =
      allowedTypes.some((type) => file.type === type) ||
      allowedTypes.some((type) => `.${fileExtension}` === type.toLowerCase());

    if (!isTypeAllowed) {
      return {
        isValid: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }
  }

  return { isValid: true, error: '' };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Date validation
export const validateDate = (date: string): boolean => {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

export const validateDateRange = (
  startDate: string,
  endDate: string
): { isValid: boolean; error: string } => {
  if (!startDate || !endDate) {
    return { isValid: false, error: 'Both dates are required' };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }

  if (start > end) {
    return { isValid: false, error: 'Start date must be before end date' };
  }

  return { isValid: true, error: '' };
};

export const isDateInFuture = (date: string): boolean => {
  const dateObj = new Date(date);
  return dateObj > new Date();
};

export const isDateInPast = (date: string): boolean => {
  const dateObj = new Date(date);
  return dateObj < new Date();
};

// Credit card validation (Luhn algorithm)
export const validateCreditCard = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\D/g, '');
  
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

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

export const formatCreditCard = (value: string): string => {
  const digitsOnly = value.replace(/\D/g, '');
  const parts = digitsOnly.match(/.{1,4}/g) || [];
  return parts.join(' ');
};

// Username validation
export const validateUsername = (username: string): { isValid: boolean; error: string } => {
  if (!username) {
    return { isValid: false, error: 'Username is required' };
  }

  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }

  if (username.length > 20) {
    return { isValid: false, error: 'Username must be at most 20 characters' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return {
      isValid: false,
      error: 'Username can only contain letters, numbers, underscores, and hyphens',
    };
  }

  return { isValid: true, error: '' };
};

// Zip/Postal code validation
export const validateZipCode = (zip: string, country: 'US' | 'CA' | 'UK' = 'US'): boolean => {
  const patterns = {
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
    UK: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
  };

  return patterns[country].test(zip);
};

export const formatZipCode = (value: string, country: 'US' | 'CA' = 'US'): string => {
  if (country === 'US') {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length <= 5) {
      return digitsOnly;
    }
    return `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5, 9)}`;
  } else if (country === 'CA') {
    const alphanumeric = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (alphanumeric.length <= 3) {
      return alphanumeric;
    }
    return `${alphanumeric.slice(0, 3)} ${alphanumeric.slice(3, 6)}`;
  }
  return value;
};

// General required field validation
export const validateRequired = (value: any, fieldName: string = 'This field'): string => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return `${fieldName} is required`;
  }
  return '';
};

// Min/Max length validation
export const validateLength = (
  value: string,
  min?: number,
  max?: number,
  fieldName: string = 'This field'
): string => {
  if (min !== undefined && value.length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  if (max !== undefined && value.length > max) {
    return `${fieldName} must be at most ${max} characters`;
  }
  return '';
};
