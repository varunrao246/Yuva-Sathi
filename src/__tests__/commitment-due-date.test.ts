import { describe, it, expect } from 'vitest';
import {
  formatCommitmentDueDate,
  isCommitmentOverdue,
  extractDueDayFromDate,
  validateCommitmentInput,
} from '@/lib/commitments';
import { calculateFinancials } from '@/lib/calculations';
import { Commitment, IncomeConfig } from '@/types';

describe('Commitment Manual Due Date Logic', () => {
  describe('extractDueDayFromDate', () => {
    it('correctly extracts the day of the month from YYYY-MM-DD string', () => {
      expect(extractDueDayFromDate('2026-12-05')).toBe(5);
      expect(extractDueDayFromDate('2026-12-18')).toBe(18);
      expect(extractDueDayFromDate('2026-12-10')).toBe(10);
      expect(extractDueDayFromDate('2026-02-28')).toBe(28);
      expect(extractDueDayFromDate('2026-01-01')).toBe(1);
    });

    it('falls back safely to default day when given undefined or empty string', () => {
      expect(extractDueDayFromDate(undefined, 10)).toBe(10);
      expect(extractDueDayFromDate('', 15)).toBe(15);
      expect(extractDueDayFromDate(undefined)).toBe(1);
    });
  });

  describe('formatCommitmentDueDate', () => {
    it('formats exact YYYY-MM-DD dates to readable Indian/English month strings', () => {
      expect(formatCommitmentDueDate('2026-12-05')).toBe('5 December 2026');
      expect(formatCommitmentDueDate('2026-12-18')).toBe('18 December 2026');
      expect(formatCommitmentDueDate('2026-12-10')).toBe('10 December 2026');
      expect(formatCommitmentDueDate('2026-08-15')).toBe('15 August 2026');
    });

    it('falls back to dueDay of current year/month when dueDate is not provided', () => {
      const now = new Date();
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const expected = `7 ${months[now.getMonth()]} ${now.getFullYear()}`;
      expect(formatCommitmentDueDate(undefined, 7)).toBe(expected);
    });

    it('returns "No due date" when both dueDate and dueDay are missing', () => {
      expect(formatCommitmentDueDate(undefined, undefined)).toBe('No due date');
    });
  });

  describe('isCommitmentOverdue', () => {
    const referenceDate = new Date(2026, 11, 15); // 15 December 2026

    it('identifies unpaid past-due commitments as overdue', () => {
      const pastCommitment: Commitment = {
        id: 'c1',
        name: 'Hostel Fees',
        amount: 3000,
        dueDate: '2026-12-05',
        dueDay: 5,
        recurrence: 'monthly',
        isEssential: true,
        isPaid: false,
        category: 'Bills',
      };
      expect(isCommitmentOverdue(pastCommitment, referenceDate)).toBe(true);
    });

    it('does not flag future commitments as overdue', () => {
      const futureCommitment: Commitment = {
        id: 'c2',
        name: 'Mobile Recharge',
        amount: 399,
        dueDate: '2026-12-18',
        dueDay: 18,
        recurrence: 'monthly',
        isEssential: true,
        isPaid: false,
        category: 'Bills',
      };
      expect(isCommitmentOverdue(futureCommitment, referenceDate)).toBe(false);
    });

    it('does not flag today as overdue', () => {
      const todayCommitment: Commitment = {
        id: 'c3',
        name: 'Gym Membership',
        amount: 2000,
        dueDate: '2026-12-15',
        dueDay: 15,
        recurrence: 'monthly',
        isEssential: true,
        isPaid: false,
        category: 'Health',
      };
      expect(isCommitmentOverdue(todayCommitment, referenceDate)).toBe(false);
    });

    it('never flags paid commitments as overdue regardless of due date', () => {
      const paidPastCommitment: Commitment = {
        id: 'c4',
        name: 'Hostel Fees Paid',
        amount: 3000,
        dueDate: '2026-12-01',
        dueDay: 1,
        recurrence: 'monthly',
        isEssential: true,
        isPaid: true,
        category: 'Bills',
      };
      expect(isCommitmentOverdue(paidPastCommitment, referenceDate)).toBe(false);
    });
  });

  describe('validateCommitmentInput', () => {
    it('validates required fields successfully', () => {
      const result = validateCommitmentInput({
        name: 'Hostel Fees',
        amount: 3000,
        dueDate: '2026-12-05',
      });
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('fails when name is missing or whitespace', () => {
      expect(validateCommitmentInput({ name: '', amount: 100, dueDate: '2026-12-05' }).isValid).toBe(false);
      expect(validateCommitmentInput({ name: '   ', amount: 100, dueDate: '2026-12-05' }).isValid).toBe(false);
    });

    it('fails when amount is 0, negative, or invalid', () => {
      expect(validateCommitmentInput({ name: 'WiFi', amount: 0, dueDate: '2026-12-05' }).isValid).toBe(false);
      expect(validateCommitmentInput({ name: 'WiFi', amount: -50, dueDate: '2026-12-05' }).isValid).toBe(false);
      expect(validateCommitmentInput({ name: 'WiFi', amount: 'abc', dueDate: '2026-12-05' }).isValid).toBe(false);
    });

    it('fails when dueDate is missing or malformed', () => {
      expect(validateCommitmentInput({ name: 'WiFi', amount: 500, dueDate: '' }).isValid).toBe(false);
      expect(validateCommitmentInput({ name: 'WiFi', amount: 500, dueDate: 'invalid-date' }).isValid).toBe(false);
    });
  });

  describe('Financial Calculations Integration with Commitments', () => {
    const baseIncome: IncomeConfig = {
      monthlyPocketMoney: 15000,
      otherIncome: 0,
      incomeFrequency: 'monthly',
      allowanceReceivedDate: 1,
      monthlySavingsPlanned: 2000,
    };

    const c1: Commitment = {
      id: 'com-1',
      name: 'Hostel Fees',
      amount: 3000,
      dueDate: '2026-12-05',
      dueDay: 5,
      recurrence: 'monthly',
      isEssential: true,
      isPaid: false,
      category: 'Bills',
    };

    const c2: Commitment = {
      id: 'com-2',
      name: 'Mobile Recharge',
      amount: 399,
      dueDate: '2026-12-18',
      dueDay: 18,
      recurrence: 'monthly',
      isEssential: true,
      isPaid: false,
      category: 'Bills',
    };

    const c3: Commitment = {
      id: 'com-3',
      name: 'Gym Membership',
      amount: 2000,
      dueDate: '2026-12-10',
      dueDay: 10,
      recurrence: 'monthly',
      isEssential: false,
      isPaid: false,
      category: 'Health',
    };

    it('correctly calculates totalReservedPayments for all unpaid commitments', () => {
      const result = calculateFinancials(baseIncome, [c1, c2, c3], [], [], [], new Date(2026, 11, 1));
      expect(result.moneyAvailable).toBe(15000);
      expect(result.totalReservedPayments).toBe(5399); // 3000 + 399 + 2000
      expect(result.unpaidCommitments).toBe(5399);
      expect(result.freeMoneyRemaining).toBe(15000 - 5399 - 2000); // 7601
    });

    it('excluding paid commitments reduces totalReservedPayments and frees up money', () => {
      const paidC1 = { ...c1, isPaid: true };
      const result = calculateFinancials(baseIncome, [paidC1, c2, c3], [], [], [], new Date(2026, 11, 1));
      expect(result.totalReservedPayments).toBe(2399); // 399 + 2000
      expect(result.paidCommitments).toBe(3000);
      expect(result.freeMoneyRemaining).toBe(15000 - 2399 - 2000); // 10601
    });

    it('deleting a commitment removes it completely from calculations', () => {
      // Removing c3 (Gym)
      const result = calculateFinancials(baseIncome, [c1, c2], [], [], [], new Date(2026, 11, 1));
      expect(result.totalReservedPayments).toBe(3399); // 3000 + 399
      expect(result.freeMoneyRemaining).toBe(15000 - 3399 - 2000); // 9601
    });
  });
});
