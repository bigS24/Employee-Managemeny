// Form validation utilities and hooks
import { useState } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: any) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export function useFormValidation(rules: ValidationRules) {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = (name: string, value: any): string | null => {
    const rule = rules[name];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return 'هذا الحقل مطلوب';
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    // String validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return `يجب أن يكون ${rule.minLength} أحرف على الأقل`;
      }
      
      if (rule.maxLength && value.length > rule.maxLength) {
        return `يجب أن يكون ${rule.maxLength} أحرف كحد أقصى`;
      }
      
      if (rule.pattern && !rule.pattern.test(value)) {
        if (name.includes('email')) {
          return 'البريد الإلكتروني غير صحيح';
        }
        if (name.includes('phone')) {
          return 'رقم الهاتف غير صحيح';
        }
        return 'التنسيق غير صحيح';
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        return `يجب أن يكون ${rule.min} أو أكثر`;
      }
      
      if (rule.max !== undefined && value > rule.max) {
        return `يجب أن يكون ${rule.max} أو أقل`;
      }
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  };

  const validateForm = (formData: any): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const validateSingleField = (name: string, value: any) => {
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error || ''
    }));
    return !error;
  };

  const clearErrors = () => {
    setErrors({});
  };

  const clearFieldError = (fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  return {
    errors,
    validateForm,
    validateSingleField,
    clearErrors,
    clearFieldError
  };
}

// Common validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(05|5)[0-9]{8}$/,
  nationalId: /^[0-9]{10}$/,
  employeeNumber: /^[A-Z]{3}[0-9]{3,6}$/i,
  arabicText: /^[\u0600-\u06FF\s]+$/,
  englishText: /^[A-Za-z\s]+$/,
  alphanumeric: /^[A-Za-z0-9\s]+$/
};

// Common validation rules
export const commonRules = {
  required: { required: true },
  email: { 
    required: true, 
    pattern: validationPatterns.email 
  },
  phone: { 
    required: true, 
    pattern: validationPatterns.phone 
  },
  nationalId: { 
    required: true, 
    pattern: validationPatterns.nationalId 
  },
  employeeNumber: { 
    required: true, 
    pattern: validationPatterns.employeeNumber 
  },
  name: { 
    required: true, 
    minLength: 2, 
    maxLength: 100 
  },
  salary: { 
    required: true, 
    min: 1000, 
    max: 100000 
  },
  positiveNumber: { 
    required: true, 
    min: 0 
  },
  dateRange: (startDate: string, endDate: string) => ({
    custom: (value: string) => {
      if (!value) return null;
      const start = new Date(startDate);
      const end = new Date(endDate);
      const current = new Date(value);
      
      if (current < start) {
        return `التاريخ يجب أن يكون بعد ${start.toLocaleDateString('ar-SA')}`;
      }
      
      if (current > end) {
        return `التاريخ يجب أن يكون قبل ${end.toLocaleDateString('ar-SA')}`;
      }
      
      return null;
    }
  })
};