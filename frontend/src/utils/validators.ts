// Type definitions
export type ValidationResult = {
  isValid: boolean;
  message?: string;
};

// Email validation
export const isEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: emailRegex.test(email),
    message: emailRegex.test(email) ? undefined : 'Invalid email format'
  };
};

// URL validation
export const isUrl = (url: string): ValidationResult => {
  try {
    new URL(url);
    return {
      isValid: true
    };
  } catch {
    return {
      isValid: false,
      message: 'Invalid URL format'
    };
  }
};

// Phone number validation
export const isPhoneNumber = (phone: string): ValidationResult => {
  // Supports formats: +1234567890, 123-456-7890, (123) 456-7890
  const phoneRegex = /^(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
  return {
    isValid: phoneRegex.test(phone),
    message: phoneRegex.test(phone) ? undefined : 'Invalid phone number format'
  };
};

// Minimum length validation
export const minLength = (value: string, min: number): ValidationResult => {
  return {
    isValid: value.length >= min,
    message: value.length >= min ? undefined : `Minimum length should be ${min} characters`
  };
};

// Maximum length validation
export const maxLength = (value: string, max: number): ValidationResult => {
  return {
    isValid: value.length <= max,
    message: value.length <= max ? undefined : `Maximum length should be ${max} characters`
  };
};

// Combined length validation
export const lengthBetween = (value: string, min: number, max: number): ValidationResult => {
  const minCheck = minLength(value, min);
  const maxCheck = maxLength(value, max);

  if (!minCheck.isValid) return minCheck;
  if (!maxCheck.isValid) return maxCheck;

  return {
    isValid: true
  };
};

// Required field validation
export const isRequired = (value: string | null | undefined): ValidationResult => {
  const isValid = value !== null && value !== undefined && value.trim() !== '';
  return {
    isValid,
    message: isValid ? undefined : 'This field is required'
  };
};

// Numeric value validation
export const isNumeric = (value: string): ValidationResult => {
  const numericRegex = /^\d+$/;
  return {
    isValid: numericRegex.test(value),
    message: numericRegex.test(value) ? undefined : 'Value must be numeric'
  };
};