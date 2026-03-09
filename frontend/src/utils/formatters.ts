/**
 * Utility functions for data formatting
 */

/**
 * Format options for date formatting
 */
type DateFormatOptions = {
  includeTime?: boolean;
  locale?: string;
}

/**
 * Currency format options
 */
type CurrencyFormatOptions = {
  currency?: string;
  locale?: string;
  decimals?: number;
}

/**
 * Number format options
 */
type NumberFormatOptions = {
  decimals?: number;
  thousandsSeparator?: boolean;
  locale?: string;
}

/**
 * Formats a date string or Date object into localized string
 */
export const formatDate = (
  date: Date | string,
  options: DateFormatOptions = {}
): string => {
  const {
    includeTime = false,
    locale = 'en-US'
  } = options;

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (includeTime) {
    return dateObj.toLocaleString(locale);
  }
  return dateObj.toLocaleDateString(locale);
};

/**
 * Formats a number as currency
 */
export const formatCurrency = (
  amount: number,
  options: CurrencyFormatOptions = {}
): string => {
  const {
    currency = 'USD',
    locale = 'en-US',
    decimals = 2
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
};

/**
 * Formats a number with thousand separators and decimal places
 */
export const formatNumber = (
  num: number,
  options: NumberFormatOptions = {}
): string => {
  const {
    decimals = 0,
    thousandsSeparator = true,
    locale = 'en-US'
  } = options;

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: thousandsSeparator
  }).format(num);
};

/**
 * Truncates text to specified length and adds ellipsis
 */
export const truncateText = (
  text: string,
  maxLength: number,
  ellipsis: string = '...'
): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + ellipsis;
};