/**
 * YUVA SATHI - Indian Currency & Date Formatting Utilities
 * Adheres strictly to Indian Number System (Lakhs, Crores) and en-IN locale.
 * Never formats in foreign currency.
 */

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const inrDecimalFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

/**
 * Formats a number into Indian Rupee string, e.g., ₹8,500 or ₹1,25,000.
 * Handles zero, negative amounts, floats, and edge cases safely.
 */
export function formatINR(
  amount: number | undefined | null,
  options?: {
    showDecimals?: boolean;
    compact?: boolean;
    signDisplay?: 'auto' | 'never' | 'always' | 'exceptZero';
  }
): string {
  if (amount === undefined || amount === null || Number.isNaN(amount)) {
    return '₹0';
  }

  // Handle negative amounts cleanly
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  if (options?.compact && absAmount >= 10000000) {
    // Crores
    const cr = (absAmount / 10000000).toFixed(1).replace(/\.0$/, '');
    return `${isNegative ? '-' : ''}₹${cr} Cr`;
  }

  if (options?.compact && absAmount >= 100000) {
    // Lakhs
    const lk = (absAmount / 100000).toFixed(1).replace(/\.0$/, '');
    return `${isNegative ? '-' : ''}₹${lk} L`;
  }

  if (options?.compact && absAmount >= 1000) {
    // Thousands (k)
    const k = (absAmount / 1000).toFixed(1).replace(/\.0$/, '');
    return `${isNegative ? '-' : ''}₹${k}k`;
  }

  const formatter = options?.showDecimals ? inrDecimalFormatter : inrFormatter;
  const formatted = formatter.format(absAmount);

  if (options?.signDisplay === 'always' && amount > 0) {
    return `+${formatted}`;
  }

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Formats a date string or Date object into DD MMM YYYY (e.g., 22 Nov 2026).
 */
export function formatIndianDate(
  dateInput: string | Date | undefined | null,
  options?: { includeTime?: boolean }
): string {
  if (!dateInput) return '—';

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return 'Invalid date';

  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  if (options?.includeTime) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  }

  return `${day} ${month} ${year}`;
}
