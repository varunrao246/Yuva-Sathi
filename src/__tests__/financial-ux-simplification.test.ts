import { describe, it, expect } from 'vitest';
import { calculateFinancials } from '@/lib/calculations';
import { IncomeConfig, Commitment, CreditCard, SavingsGoal, Transaction } from '@/types';

describe('Financial UX Simplification & Official Test Cases', () => {
  /**
   * Test Case A
   * Available money: ₹15,000
   * Recurring commitments:
   * - Hostel: ₹3,000
   * - Gym: ₹2,000
   * - Recharge: ₹399
   * Credit card dues:
   * - Slice: ₹500
   * Planned savings contribution: ₹1,000
   * Tracked expenses not already deducted from balance: ₹0
   * Days remaining: 10
   *
   * Expected calculation:
   * Total recurring commitments = ₹5,399
   * Total credit card dues = ₹500
   * Total reserved payments = ₹5,899
   * Planned savings = ₹1,000
   * Free money remaining = ₹15,000 − ₹5,899 − ₹1,000 = ₹8,101
   * Safe to spend today = ₹810/day (round down)
   */
  it('Test Case A: accurately computes free money and safe-to-spend today', () => {
    const income: IncomeConfig = {
      monthlyPocketMoney: 15000,
      otherIncome: 0,
      incomeFrequency: 'monthly',
      allowanceReceivedDate: 1,
      monthlySavingsPlanned: 1000,
    };

    const commitments: Commitment[] = [
      { id: 'c1', name: 'Hostel', amount: 3000, dueDay: 5, recurrence: 'monthly', isEssential: true, isPaid: false, category: 'Bills' },
      { id: 'c2', name: 'Gym', amount: 2000, dueDay: 10, recurrence: 'monthly', isEssential: false, isPaid: false, category: 'Bills' },
      { id: 'c3', name: 'Recharge', amount: 399, dueDay: 15, recurrence: 'monthly', isEssential: true, isPaid: false, category: 'Bills' },
    ];

    const cards: CreditCard[] = [
      { id: 'card1', nickname: 'Slice', upcomingDueAmount: 500, outstandingBalance: 500, dueDay: 25 },
    ];

    // Mock date with 10 days remaining in a 30-day month (Day 21: 30 - 21 + 1 = 10)
    const fixedDate = new Date(2026, 10, 21); // November (30 days), 21st

    const res = calculateFinancials(income, commitments, cards, [], [], fixedDate);

    expect(res.moneyAvailable).toBe(15000);
    expect(res.unpaidCommitments).toBe(5399); // 3000 + 2000 + 399
    expect(res.creditCardTotalDue).toBe(500);
    expect(res.totalReservedPayments).toBe(5899); // 5399 + 500
    expect(res.plannedSavingsMonthly).toBe(1000);
    expect(res.freeMoneyRemaining).toBe(8101); // 15000 - 5899 - 1000
    expect(res.daysRemainingInMonth).toBe(10);
    expect(res.safeToSpendToday).toBe(810); // floor(8101 / 10)
  });

  /**
   * Test Case B — Multiple Commitments
   * Available money: ₹20,000
   * Add:
   * - Hostel: ₹3,000
   * - Gym: ₹2,000
   * - Recharge: ₹399
   * - Wi-Fi: ₹500
   * - Transport: ₹800
   *
   * Expected:
   * - All five commitments persist
   * - All five display
   * - Total recurring payments = ₹6,699
   */
  it('Test Case B: retains and sums all multiple recurring commitments without overwriting', () => {
    const income: IncomeConfig = {
      monthlyPocketMoney: 20000,
      otherIncome: 0,
      incomeFrequency: 'monthly',
      allowanceReceivedDate: 1,
    };

    const commitments: Commitment[] = [
      { id: 'c1', name: 'Hostel', amount: 3000, dueDay: 5, recurrence: 'monthly', isEssential: true, isPaid: false, category: 'Bills' },
      { id: 'c2', name: 'Gym', amount: 2000, dueDay: 10, recurrence: 'monthly', isEssential: false, isPaid: false, category: 'Bills' },
      { id: 'c3', name: 'Recharge', amount: 399, dueDay: 15, recurrence: 'monthly', isEssential: true, isPaid: false, category: 'Bills' },
      { id: 'c4', name: 'Wi-Fi', amount: 500, dueDay: 18, recurrence: 'monthly', isEssential: true, isPaid: false, category: 'Bills' },
      { id: 'c5', name: 'Transport', amount: 800, dueDay: 2, recurrence: 'monthly', isEssential: true, isPaid: false, category: 'Transport' },
    ];

    const res = calculateFinancials(income, commitments, [], [], []);

    expect(commitments.length).toBe(5);
    expect(res.totalCommitments).toBe(6699); // 3000 + 2000 + 399 + 500 + 800
    expect(res.unpaidCommitments).toBe(6699);
    expect(res.totalReservedPayments).toBe(6699);
  });

  /**
   * Test Case C — Savings Target Is Not Monthly Deduction
   * Available money: ₹15,000
   * Savings target: ₹10,000
   * Monthly savings contribution: ₹0
   *
   * Expected:
   * - Savings target displays ₹10,000
   * - Monthly savings deduction = ₹0
   * - The full target must NOT be subtracted from free money
   */
  it('Test Case C: does NOT deduct full savings target from monthly free money', () => {
    const income: IncomeConfig = {
      monthlyPocketMoney: 15000,
      otherIncome: 0,
      incomeFrequency: 'monthly',
      allowanceReceivedDate: 1,
      monthlySavingsPlanned: 0, // No explicit monthly contribution set
    };

    const goals: SavingsGoal[] = [
      {
        id: 'g1',
        name: 'GTA 6',
        targetAmount: 10000,
        currentSavings: 2000,
        targetDate: '2026-12-31',
        category: 'Gaming',
      },
    ];

    const res = calculateFinancials(income, [], [], goals, []);

    expect(res.targetSavingsTotal).toBe(10000);
    expect(res.totalSavedInGoals).toBe(2000);
    expect(res.plannedSavingsMonthly).toBe(0);
    // Free money remains full ₹15,000 since target is not deducted:
    expect(res.freeMoneyRemaining).toBe(15000);
  });

  /**
   * Test Case D — Credit Card Due
   * Available money: ₹15,000
   * Recurring commitments: ₹3,399
   * Credit card due: ₹1,000
   * Planned savings: ₹500
   *
   * Expected:
   * Free money remaining = ₹10,101
   * Verify card dues are counted exactly once.
   */
  it('Test Case D: counts credit card dues exactly once in total reserved payments', () => {
    const income: IncomeConfig = {
      monthlyPocketMoney: 15000,
      otherIncome: 0,
      incomeFrequency: 'monthly',
      allowanceReceivedDate: 1,
      monthlySavingsPlanned: 500,
    };

    const commitments: Commitment[] = [
      { id: 'c1', name: 'Mess', amount: 3000, dueDay: 5, recurrence: 'monthly', isEssential: true, isPaid: false, category: 'Bills' },
      { id: 'c2', name: 'Recharge', amount: 399, dueDay: 18, recurrence: 'monthly', isEssential: true, isPaid: false, category: 'Bills' },
    ];

    const cards: CreditCard[] = [
      { id: 'card1', nickname: 'OneCard', upcomingDueAmount: 1000, outstandingBalance: 1000, dueDay: 25 },
    ];

    const res = calculateFinancials(income, commitments, cards, [], []);

    expect(res.unpaidCommitments).toBe(3399);
    expect(res.creditCardTotalDue).toBe(1000);
    expect(res.totalReservedPayments).toBe(4399); // 3399 + 1000
    expect(res.plannedSavingsMonthly).toBe(500);
    // Free money: 15000 - 4399 - 500 = 10101
    expect(res.freeMoneyRemaining).toBe(10101);
  });

  /**
   * Test Case E — No Negative Daily Spending
   * If free money remaining is negative:
   * Safe to Spend Today = ₹0/day
   */
  it('Test Case E: enforces ₹0/day safe spending when commitments exceed available money', () => {
    const income: IncomeConfig = {
      monthlyPocketMoney: 5000,
      otherIncome: 0,
      incomeFrequency: 'monthly',
      allowanceReceivedDate: 1,
    };

    const heavyCommitments: Commitment[] = [
      { id: 'c1', name: 'Hostel Fees', amount: 7000, dueDay: 5, recurrence: 'monthly', isEssential: true, isPaid: false, category: 'Bills' },
    ];

    const res = calculateFinancials(income, heavyCommitments, [], [], []);

    expect(res.freeMoneyRemaining).toBe(-2000); // 5000 - 7000 = -2000
    expect(res.safeToSpendToday).toBe(0);
    expect(res.discretionaryFunds).toBe(0); // Clamped to zero
  });

  describe('Sequential Commitment Addition Safety', () => {
    it('appends multiple commitments without overwriting previous additions', () => {
      let storeCommitments: Commitment[] = [];

      const addCommitmentMock = (c: Omit<Commitment, 'id'>) => {
        const newC: Commitment = {
          ...c,
          id: `com_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        };
        storeCommitments = [...storeCommitments.filter(item => item.id !== newC.id), newC];
      };

      const testItems = [
        { name: 'Hostel', amount: 3000, dueDay: 5, recurrence: 'monthly' as const, isEssential: true, isPaid: false, category: 'Bills' as const },
        { name: 'Gym', amount: 2000, dueDay: 10, recurrence: 'monthly' as const, isEssential: false, isPaid: false, category: 'Bills' as const },
        { name: 'Recharge', amount: 399, dueDay: 15, recurrence: 'monthly' as const, isEssential: true, isPaid: false, category: 'Bills' as const },
        { name: 'Wi-Fi', amount: 500, dueDay: 18, recurrence: 'monthly' as const, isEssential: true, isPaid: false, category: 'Bills' as const },
        { name: 'Transport', amount: 800, dueDay: 2, recurrence: 'monthly' as const, isEssential: true, isPaid: false, category: 'Transport' as const },
      ];

      for (const item of testItems) {
        addCommitmentMock(item);
      }

      expect(storeCommitments.length).toBe(5);
      const total = storeCommitments.reduce((sum, c) => sum + c.amount, 0);
      expect(total).toBe(6699);
      // Ensure all IDs are unique
      const idSet = new Set(storeCommitments.map(c => c.id));
      expect(idSet.size).toBe(5);
    });
  });
});
