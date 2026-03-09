// useForm.ts

import { useState, ChangeEvent, FormEvent } from 'react';

interface ValidationRules<T> {
  [key: string]: {
    required?: boolean;
    pattern?: RegExp;
    custom?: (value: any, formData: T) => boolean;
    errorMessage?: string;
  };
}

interface FormErrors {
  [key: string]: string;
}

interface UseFormReturn<T> {
  values: T;
  errors: FormErrors;
  touched: { [key: string]: boolean };
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isValid: boolean;
  reset: () => void;
}

export const useForm = <T extends { [key: string]: any }>(
  initialValues: T,
  validationRules?: ValidationRules<T>,
  onSubmit?: (values: T) => void
): UseFormReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = (name: string, value: any): string => {
    if (!validationRules || !validationRules[name]) return '';

    const rules = validationRules[name];

    if (rules.required && !value) {
      return rules.errorMessage || 'This field is required';
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.errorMessage || 'Invalid format';
    }

    if (rules.custom && !rules.custom(value, values)) {
      return rules.errorMessage || 'Invalid value';
    }

    return '';
  };

  const validateForm = (): boolean => {
    if (!validationRules) return true;

    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach((key) => {
      const error = validateField(key, values[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    
    // Mark all fields as touched
    const touchedFields = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(touchedFields);

    const isValid = validateForm();
    if (isValid && onSubmit) {
      onSubmit(values);
    }
  };

  const reset = (): void => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isValid: Object.keys(errors).length === 0,
    reset
  };
};