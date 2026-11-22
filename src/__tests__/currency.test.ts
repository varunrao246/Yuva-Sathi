import { describe, it, expect } from 'vitest';
import { formatINR, formatIndianDate } from '../lib/currency';

describe('INR Currency Formatting Utility', () => {
  it('formats standard Indian rupee values with comma separation', () => {
    expect(formatINR(500)).toBe('₹500');
    expect(formatINR(8500)).toBe('₹8,500');
    expect(formatINR(125000)).toBe('₹1,25,000');
  });

  it('formats zero safely without NaN or undefined', () => {
    expect(formatINR(0)).toBe('₹0');
    expect(formatINR(undefined)).toBe('₹0');
    expect(formatINR(null)).toBe('₹0');
    expect(formatINR(NaN)).toBe('₹0');
  });

  it('formats negative amounts cleanly with leading minus', () => {
    expect(formatINR(-500)).toBe('-₹500');
    expect(formatINR(-12500)).toBe('-₹12,500');
  });

  it('formats compact values in Indian denominations (k, L, Cr)', () => {
    expect(formatINR(5000, { compact: true })).toBe('₹5k');
    expect(formatINR(150000, { compact: true })).toBe('₹1.5 L');
    expect(formatINR(25000000, { compact: true })).toBe('₹2.5 Cr');
  });

  it('formats decimals when requested', () => {
    expect(formatINR(499.5, { showDecimals: true })).toBe('₹499.50');
  });
});

describe('Indian Date Formatting Utility', () => {
  it('formats date to DD MMM YYYY', () => {
    const formatted = formatIndianDate('2026-11-22');
    expect(formatted).toBe('22 Nov 2026');
  });

  it('handles empty or invalid date gracefully', () => {
    expect(formatIndianDate(null)).toBe('—');
    expect(formatIndianDate('invalid-date')).toBe('Invalid date');
  });
});
