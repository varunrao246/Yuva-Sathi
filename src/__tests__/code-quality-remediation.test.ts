import { describe, it, expect } from 'vitest';
import { isNavTabActive, NavTab } from '@/types';
import { getLocalCoachResponse } from '@/lib/ai-coach';
import { FinancialCalculationResult } from '@/types';

describe('Code Quality Remediation — Architecture & Logic Unit Tests', () => {
  describe('isNavTabActive Helper', () => {
    it('returns true when currentTab equals targetTab', () => {
      expect(isNavTabActive('dashboard', 'dashboard')).toBe(true);
      expect(isNavTabActive('savings', 'savings')).toBe(true);
      expect(isNavTabActive('scholarships', 'scholarships')).toBe(true);
    });

    it('correctly maps legacy and nested financial tabs to my-money', () => {
      expect(isNavTabActive('transactions', 'my-money')).toBe(true);
      expect(isNavTabActive('purchase-check', 'my-money')).toBe(true);
      expect(isNavTabActive('offers', 'my-money')).toBe(true);
      expect(isNavTabActive('my-money', 'my-money')).toBe(true);
    });

    it('returns false for unrelated tabs', () => {
      expect(isNavTabActive('dashboard', 'my-money')).toBe(false);
      expect(isNavTabActive('coach', 'savings')).toBe(false);
      expect(isNavTabActive('scholarships', 'opportunities')).toBe(false);
    });
  });

  describe('AI Coach — Precision Regex Matching (P2-4 Regression Test)', () => {
    const mockFinancials: FinancialCalculationResult = {
      moneyAvailable: 10000,
      totalMonthlyIncome: 10000,
      totalMonthlyExpenses: 4000,
      currentBalance: 6000,
      totalCommitments: 2000,
      paidCommitments: 1000,
      unpaidCommitments: 1000,
      unpaidEssentialCommitments: 1000,
      unpaidOptionalCommitments: 0,
      creditCardTotalDue: 0,
      totalReservedPayments: 1000,
      plannedSavingsMonthly: 0,
      freeMoneyRemaining: 5000,
      safeToSpendToday: 200,
      dailyBudget: 250,
      currentDayOfMonth: 10,
      daysInMonth: 30,
      daysRemainingInMonth: 20,
      spendingPace: 'on_track',
      monthEndForecastBalance: 2000,
      discretionaryFunds: 5000,
      totalSavedInGoals: 1000,
      targetSavingsTotal: 5000,
    };

    it('triggers weekly budget advice on explicit weekly requests', () => {
      const res1 = getLocalCoachResponse('give me a weekly budget', mockFinancials);
      expect(res1.response).toContain('7-Day Campus Budget Guide');

      const res2 = getLocalCoachResponse('what is my weekly plan', mockFinancials);
      expect(res2.response).toContain('7-Day Campus Budget Guide');

      const res3 = getLocalCoachResponse('how much to spend this week', mockFinancials);
      expect(res3.response).toContain('7-Day Campus Budget Guide');
    });

    it('does NOT trigger weekly budget advice on unrelated words like "weekend" or "weak"', () => {
      const resWeekend = getLocalCoachResponse('planning a weekend trip to lonavala', mockFinancials);
      expect(resWeekend.response).not.toContain('7-Day Campus Budget Guide');

      const resWeak = getLocalCoachResponse('my finances feel weak this month', mockFinancials);
      expect(resWeak.response).not.toContain('7-Day Campus Budget Guide');
    });
  });
});
