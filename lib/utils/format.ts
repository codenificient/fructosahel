import { format as formatDate } from "date-fns";
import {
  type CurrencyCode,
  formatAmountFromXOF,
} from "@/lib/currency";

/**
 * Format a number as currency
 * @param amount - The amount to format (in XOF)
 * @param localeOrCurrency - Locale string or CurrencyCode. Defaults to "XOF".
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  localeOrCurrency: string = "XOF",
): string {
  // If passed a CurrencyCode, use the new multi-currency formatter
  if (
    localeOrCurrency === "XOF" ||
    localeOrCurrency === "USD" ||
    localeOrCurrency === "ECO"
  ) {
    return formatAmountFromXOF(amount, localeOrCurrency as CurrencyCode);
  }

  // Legacy: locale-based formatting (backward compat)
  return new Intl.NumberFormat(localeOrCurrency, {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date using date-fns
 * @param date - The date to format
 * @param formatStr - The format string (default: 'PP')
 * @returns Formatted date string
 */
export function formatDateString(
  date: Date | string,
  formatStr = "PP",
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatDate(dateObj, formatStr);
}

/**
 * Format a date for display in a relative format
 * @param date - The date to format
 * @returns Formatted date string (e.g., "2 days ago")
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      if (diffInMinutes === 0) {
        return "just now";
      }
      return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
    }
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  }

  if (diffInDays === 1) {
    return "yesterday";
  }

  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }

  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }

  const years = Math.floor(diffInDays / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

/**
 * Format a number with thousand separators
 * @param num - The number to format
 * @param locale - The locale to use (default: 'fr-BF')
 * @returns Formatted number string
 */
export function formatNumber(num: number, locale = "fr-BF"): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Format hectares with proper unit
 * @param hectares - The number of hectares
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with unit
 */
export function formatHectares(hectares: number, decimals = 2): string {
  return `${hectares.toFixed(decimals)} ha`;
}

/**
 * Format percentage
 * @param value - The percentage value (0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}
