import { describe, it, expect } from 'vitest';
import { calculateFinancials, analyzePurchaseAffordability } from '../lib/calculations';
import { IncomeConfig, Commitment, CreditCard, SavingsGoal, Transaction } from '../types';

describe('Yuva Sathi Financial Calculation Engine', () => {
  const baseIncome: IncomeConfig = {
    monthlyPocketMoney: 12000,
    otherIncome: 3000,
    incomeFrequency: 'monthly',
    allowanceReceivedDate: 1,
  };

  const sampleCommitments: Commitment[] = [
    {
      id: 'c1',
      name: 'Hostel Mess',
      amount: 3500,
      dueDay: 5,
      recurrence: 'monthly',
      isEssential: true,
      isPaid: true,
      category: 'Bills',
    },
    {
      id: 'c2',
      name: 'Mobile Plan',
      amount: 400,
      dueDay: 18,
      recurrence: 'monthly',
      isEssential: true,
      isPaid: false, // Unpaid essential
      category: 'Bills',
    },
    {
      id: 'c3',
      name: 'Spotify Student',
      amount: 60,
      dueDay: 25,
      recurrence: 'monthly',
      isEssential: false,
      isPaid: false, // Unpaid optional
      category: 'Subscriptions',
    },
  ];

  const sampleCards: CreditCard[] = [
    {
      id: 'cc1',
      nickname: 'OneCard',
      upcomingDueAmount: 500,
      outstandingBalance: 500,
      dueDay: 28,
    },
  ];

  const sampleGoals: SavingsGoal[] = [
    {
      id: 'g1',
      name: 'Goa Trip',
      targetAmount: 8000,
      currentSavings: 3000,
      targetDate: '2026-12-31',
      category: 'Travel',
    },
  ];

  const sampleTransactions: Transaction[] = [
    {
      id: 't1',
      amount: 500,
      merchant: 'Canteen',
      category: 'Food',
      date: '2026-11-10',
    },
    {
      id: 't2',
      amount: 1500,
      merchant: 'Instamart',
      category: 'Groceries',
      date: '2026-11-15',
    },
  ];

  // Fix current date to 2026-11-20 (Day 20 of 30, 11 days remaining)
  const fixedDate = new Date(2026, 10, 20);

  it('calculates total monthly income accurately', () => {
    const res = calculateFinancials(baseIncome, [], [], [], [], fixedDate);
    expect(res.totalMonthlyIncome).toBe(15000); // 12000 + 3000
  });

  it('calculates total monthly expenses from current month transactions', () => {
    const res = calculateFinancials(baseIncome, [], [], [], sampleTransactions, fixedDate);
    expect(res.totalMonthlyExpenses).toBe(2000); // 500 + 1500
    expect(res.currentBalance).toBe(13000); // 15000 - 2000
  });

  it('correctly isolates unpaid essential commitments & credit dues from safe buffer', () => {
    const res = calculateFinancials(
      baseIncome,
      sampleCommitments,
      sampleCards,
      [], // Without savings goals
      sampleTransactions,
      fixedDate
    );

    // Current balance = 15000 - 2000 = 13000
    // Unpaid recurring commitments = 400 (Mobile Plan) + 60 (Spotify) = 460
    // Credit card due = 500 (OneCard)
    // Total Reserved = 460 + 500 = 960
    // Discretionary / Free Money = 13000 - 960 = 12040
    expect(res.unpaidCommitments).toBe(460);
    expect(res.creditCardTotalDue).toBe(500);
    expect(res.discretionaryFunds).toBe(12040);

    // Days remaining = 30 - 20 + 1 = 11 days
    // Safe to spend today = floor(12040 / 11) = 1094
    expect(res.daysRemainingInMonth).toBe(11);
    expect(res.safeToSpendToday).toBe(1094);
  });

  it('reserves portion for active savings goals', () => {
    const res = calculateFinancials(
      baseIncome,
      sampleCommitments,
      sampleCards,
      sampleGoals,
      sampleTransactions,
      fixedDate
    );

    // With savings goals, discretionary buffer reserves up to 30% of buffer for goal
    expect(res.discretionaryFunds).toBeLessThan(12100);
    expect(res.safeToSpendToday).toBeGreaterThan(0);
    expect(res.totalSavedInGoals).toBe(3000);
  });

  it('handles edge case: zero income without NaN or division by zero', () => {
    const zeroIncome: IncomeConfig = {
      monthlyPocketMoney: 0,
      otherIncome: 0,
      incomeFrequency: 'monthly',
      allowanceReceivedDate: 1,
    };
    const res = calculateFinancials(zeroIncome, [], [], [], [], fixedDate);
    expect(res.totalMonthlyIncome).toBe(0);
    expect(res.safeToSpendToday).toBe(0);
    expect(Number.isNaN(res.safeToSpendToday)).toBe(false);
    expect(Number.isFinite(res.safeToSpendToday)).toBe(true);
  });

  it('handles edge case: negative balance / overspending gracefully', () => {
    const heavyTransactions: Transaction[] = [
      { id: 't1', amount: 20000, merchant: 'Electronics', category: 'Shopping', date: '2026-11-05' },
    ];
    const res = calculateFinancials(baseIncome, [], [], [], heavyTransactions, fixedDate);
    expect(res.currentBalance).toBe(-5000); // 15000 - 20000
    expect(res.discretionaryFunds).toBe(0);
    expect(res.safeToSpendToday).toBe(0);
    expect(res.spendingPace).toBe('critical');
  });

  it('handles edge case: last day of month (1 day remaining)', () => {
    const lastDay = new Date(2026, 10, 30); // 30 Nov 2026
    const res = calculateFinancials(baseIncome, [], [], [], [], lastDay);
    expect(res.daysRemainingInMonth).toBe(1);
    expect(res.safeToSpendToday).toBe(15000);
  });

  it('handles completely empty data without crashing', () => {
    const emptyIncome = { monthlyPocketMoney: 0, otherIncome: 0, incomeFrequency: 'monthly' as const, allowanceReceivedDate: 1 };
    const res = calculateFinancials(emptyIncome);
    expect(res.totalMonthlyIncome).toBe(0);
    expect(res.totalMonthlyExpenses).toBe(0);
    expect(res.safeToSpendToday).toBe(0);
  });
});

describe('Before-You-Buy Purchase Affordability Decision Engine', () => {
  const mockFinancials: any = {
    totalMonthlyIncome: 15000,
    currentBalance: 12000,
    discretionaryFunds: 6000,
    safeToSpendToday: 600,
    daysRemainingInMonth: 10,
    dailyBudget: 500,
    unpaidEssentialCommitments: 1000,
    unpaidOptionalCommitments: 500,
  };

  it('evaluates a ₹100 purchase as Comfortable', () => {
    const analysis = analyzePurchaseAffordability(100, mockFinancials, []);
    expect(analysis.status).toBe('comfortable');
    expect(analysis.purchaseAmount).toBe(100);
    expect(analysis.remainingFundsAfterPurchase).toBe(5900);
    expect(analysis.newDailySafeToSpend).toBe(590);
    expect(analysis.impactOnDailyBudget).toBe(10);
  });

  it('evaluates a ₹1,000 purchase within buffer as Manageable or Comfortable', () => {
    const analysis = analyzePurchaseAffordability(1000, mockFinancials, []);
    expect(analysis.purchaseAmount).toBe(1000);
    expect(analysis.remainingFundsAfterPurchase).toBe(5000);
    expect(analysis.newDailySafeToSpend).toBe(500);
    expect(analysis.impactOnDailyBudget).toBe(100);
    expect(['comfortable', 'manageable']).toContain(analysis.status);
  });

  it('categorizes a purchase exceeding discretionary funds as Risky', () => {
    const analysis = analyzePurchaseAffordability(8000, mockFinancials, []);
    expect(analysis.status).toBe('risky');
    expect(analysis.remainingFundsAfterPurchase).toBe(-2000);
    expect(analysis.headline).toContain('High Risk');
  });

  it('handles zero or negative purchase amount safely', () => {
    const analysis = analyzePurchaseAffordability(0, mockFinancials, []);
    expect(analysis.purchaseAmount).toBe(0);
    expect(analysis.headline).toContain('Enter a purchase amount');
  });

  it('handles invalid / NaN purchase amount gracefully', () => {
    const analysis = analyzePurchaseAffordability(NaN as any, mockFinancials, []);
    expect(analysis.purchaseAmount).toBe(0);
    expect(analysis.status).toBe('comfortable');
  });
});
