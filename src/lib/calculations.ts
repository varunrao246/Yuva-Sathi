import {
  IncomeConfig,
  Commitment,
  CreditCard,
  SavingsGoal,
  Transaction,
  FinancialCalculationResult,
  PurchaseCheckResult,
  AffordabilityStatus,
  OfferItem
} from '@/types';

/**
 * Pure, deterministic financial calculation engine for Yuva Sathi.
 * Crucial Rule: AI NEVER computes financial numbers. Math is pure TypeScript.
 * Zero-division, NaN, Infinity, negative balance, and leap-year edge cases handled safely.
 */

export function calculateFinancials(
  income: IncomeConfig,
  commitments: Commitment[] = [],
  creditCards: CreditCard[] = [],
  savingsGoals: SavingsGoal[] = [],
  transactions: Transaction[] = [],
  customDate?: Date
): FinancialCalculationResult {
  const now = customDate || new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed (0 = Jan, 10 = Nov)
  const currentDayOfMonth = now.getDate();

  // Days in current calendar month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysRemainingInMonth = Math.max(1, daysInMonth - currentDayOfMonth + 1);
  const daysPassed = Math.max(1, currentDayOfMonth);

  // 1. Total Monthly Income
  const safePocketMoney = Math.max(0, Number(income?.monthlyPocketMoney) || 0);
  const safeOtherIncome = Math.max(0, Number(income?.otherIncome) || 0);
  const totalMonthlyIncome = safePocketMoney + safeOtherIncome;

  // 2. Total Monthly Expenses (Current month transactions only)
  const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const currentMonthTransactions = transactions.filter(t => {
    return t.date && typeof t.date === 'string' && t.date.trim().startsWith(currentMonthPrefix);
  });

  const totalMonthlyExpenses = currentMonthTransactions.reduce((acc, t) => {
    const val = Number(t.amount);
    return acc + (Number.isFinite(val) && val > 0 ? val : 0);
  }, 0);

  // 3. Commitments analysis
  let totalCommitments = 0;
  let paidCommitments = 0;
  let unpaidCommitments = 0;
  let unpaidEssentialCommitments = 0;
  let unpaidOptionalCommitments = 0;

  for (const c of commitments) {
    const amount = Math.max(0, Number(c.amount) || 0);
    totalCommitments += amount;
    if (c.isPaid) {
      paidCommitments += amount;
    } else {
      unpaidCommitments += amount;
      if (c.isEssential) {
        unpaidEssentialCommitments += amount;
      } else {
        unpaidOptionalCommitments += amount;
      }
    }
  }

  // 4. Credit Card Upcoming Due (Dues to isolate)
  const creditCardTotalDue = creditCards.reduce((acc, card) => {
    const due = Math.max(0, Number(card.upcomingDueAmount) || 0);
    return acc + (Number.isFinite(due) ? due : 0);
  }, 0);

  // 5. Total Saved in Goals & Monthly Savings Target Reserve
  let totalSavedInGoals = 0;
  let targetSavingsTotal = 0;
  let recommendedMonthlySavingsReserve = 0;

  for (const g of savingsGoals) {
    const currentSaved = Math.max(0, Number(g.currentSavings) || 0);
    const targetAmt = Math.max(0, Number(g.targetAmount) || 0);
    totalSavedInGoals += currentSaved;
    targetSavingsTotal += targetAmt;

    if (!g.isCompleted && targetAmt > currentSaved) {
      const remainingNeeded = targetAmt - currentSaved;
      // Calculate months until target date
      let monthsToTarget = 1;
      if (g.targetDate) {
        const tDate = new Date(g.targetDate);
        if (!isNaN(tDate.getTime())) {
          const diffMonths = (tDate.getFullYear() - currentYear) * 12 + (tDate.getMonth() - currentMonth);
          monthsToTarget = Math.max(1, diffMonths);
        }
      }
      const monthlyContribution = Math.ceil(remainingNeeded / monthsToTarget);
      recommendedMonthlySavingsReserve += monthlyContribution;
    }
  }

  // 6. Current liquid balance = Total Income - Total Expenses So Far
  const currentBalance = totalMonthlyIncome - totalMonthlyExpenses;

  // 7. Discretionary Funds Remaining:
  // Available money minus unpaid essential commitments, credit card dues, and reasonable savings reserve
  // Never negative
  const essentialReserves = unpaidEssentialCommitments + creditCardTotalDue;
  const fundsBeforeSavings = Math.max(0, currentBalance - essentialReserves);
  
  // Cap the savings reserve so it does not exceed 30% of discretionary buffer or create 0 budget
  const actualSavingsReserve = Math.min(
    recommendedMonthlySavingsReserve,
    Math.floor(fundsBeforeSavings * 0.3)
  );

  const discretionaryFunds = Math.max(0, fundsBeforeSavings - actualSavingsReserve);

  // 8. Safe-to-spend today:
  // Discretionary funds distributed evenly across the remaining days of the month
  const safeToSpendToday = daysRemainingInMonth > 0
    ? Math.max(0, Math.floor(discretionaryFunds / daysRemainingInMonth))
    : 0;

  // 9. Daily budget base:
  // Total income minus total essential commitments & savings divided by days in month
  const totalEssentialCommitments = commitments
    .filter(c => c.isEssential)
    .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  
  const baseMonthlyDiscretionary = Math.max(
    0,
    totalMonthlyIncome - totalEssentialCommitments - creditCardTotalDue - actualSavingsReserve
  );
  const dailyBudget = daysInMonth > 0 ? Math.floor(baseMonthlyDiscretionary / daysInMonth) : 0;

  // 10. Month-end Forecast:
  // Exclude fixed commitments from variable daily burn rate to avoid distorting projection
  const variableExpenses = Math.max(0, totalMonthlyExpenses - paidCommitments);
  const dailyVariableSpendRate = variableExpenses / daysPassed;
  const projectedVariableSpend = dailyVariableSpendRate * (daysRemainingInMonth - 1);
  const projectedTotalSpend = totalMonthlyExpenses + projectedVariableSpend + unpaidCommitments;
  const monthEndForecastBalance = Math.round(totalMonthlyIncome - projectedTotalSpend);

  // 11. Spending Pace indicator
  let spendingPace: 'frugal' | 'on_track' | 'fast' | 'critical' = 'on_track';
  if (currentBalance < unpaidEssentialCommitments) {
    spendingPace = 'critical';
  } else if (dailyBudget > 0 && dailyVariableSpendRate > dailyBudget * 1.35) {
    spendingPace = 'fast';
  } else if (dailyBudget > 0 && dailyVariableSpendRate < dailyBudget * 0.7) {
    spendingPace = 'frugal';
  } else {
    spendingPace = 'on_track';
  }

  return {
    totalMonthlyIncome,
    totalMonthlyExpenses,
    currentBalance,
    totalCommitments,
    paidCommitments,
    unpaidCommitments,
    unpaidEssentialCommitments,
    unpaidOptionalCommitments,
    safeToSpendToday,
    dailyBudget,
    currentDayOfMonth,
    daysInMonth,
    daysRemainingInMonth,
    spendingPace,
    monthEndForecastBalance,
    creditCardTotalDue,
    discretionaryFunds,
    totalSavedInGoals,
    targetSavingsTotal,
  };
}

/**
 * Signature "Before-You-Buy" Purchase Affordability Checker
 * Analyzes whether an intended purchase is Comfortable, Manageable, or Risky.
 * Empowers students without guilt.
 */
export function analyzePurchaseAffordability(
  amount: number,
  financials: FinancialCalculationResult,
  availableOffers: OfferItem[] = [],
  categoryOrPurpose?: string
): PurchaseCheckResult {
  const safeAmount = Math.max(0, Number(amount) || 0);
  const currentAvailableFunds = financials.discretionaryFunds;
  const remainingFundsAfterPurchase = currentAvailableFunds - safeAmount;
  const daysRemaining = financials.daysRemainingInMonth;

  // New daily safe to spend if this purchase happens
  const newDailySafeToSpend = daysRemaining > 0
    ? Math.max(0, Math.floor(Math.max(0, remainingFundsAfterPurchase) / daysRemaining))
    : 0;

  const impactOnDailyBudget = Math.max(0, financials.safeToSpendToday - newDailySafeToSpend);

  let status: AffordabilityStatus = 'comfortable';
  let headline = '';
  let explanation = '';
  const recommendations: string[] = [];

  if (safeAmount <= 0) {
    return {
      purchaseAmount: 0,
      currentAvailableFunds,
      remainingFundsAfterPurchase: currentAvailableFunds,
      impactOnDailyBudget: 0,
      currentDailySafeToSpend: financials.safeToSpendToday,
      newDailySafeToSpend: financials.safeToSpendToday,
      status: 'comfortable',
      headline: 'Enter a purchase amount to test',
      explanation: 'Simulate any planned campus expense without modifying your ledger.',
      recommendations: [
        'Try typing ₹350 for Canteen, ₹850 for Instamart, or ₹1,200 for Shoes.',
      ],
      applicableOffers: [],
    };
  }

  if (safeAmount > currentAvailableFunds) {
    status = 'risky';
    headline = 'High Risk: Dips into funds reserved for essential bills';
    explanation = `This ₹${safeAmount.toLocaleString('en-IN')} purchase exceeds your safe spendable cushion of ₹${currentAvailableFunds.toLocaleString('en-IN')}. Spending this leaves you short by ₹${Math.abs(remainingFundsAfterPurchase).toLocaleString('en-IN')} for upcoming essential commitments (like rent, mess, or recharge).`;
    recommendations.push('Delay this purchase until next month’s pocket money arrives.');
    recommendations.push('Check for student coupons or split the cost with a roommate.');
    recommendations.push(`Keep ₹${financials.unpaidEssentialCommitments.toLocaleString('en-IN')} protected for your unpaid essentials.`);
  } else if (
    remainingFundsAfterPurchase < financials.unpaidOptionalCommitments ||
    (financials.dailyBudget > 0 && newDailySafeToSpend < financials.dailyBudget * 0.45) ||
    newDailySafeToSpend < 50
  ) {
    status = 'manageable';
    headline = 'Manageable: Fits your wallet, but tightens your daily budget';
    explanation = `You have enough cash to cover this, but your daily safe-to-spend drops by ₹${impactOnDailyBudget.toLocaleString('en-IN')} (from ₹${financials.safeToSpendToday.toLocaleString('en-IN')}/day down to ₹${newDailySafeToSpend.toLocaleString('en-IN')}/day for the remaining ${daysRemaining} days).`;
    recommendations.push('Limit impulse snacks or Swiggy orders for the next 48 hours to balance the scale.');
    recommendations.push('Cook in the hostel or choose mess meals tomorrow to protect your cushion.');
  } else {
    status = 'comfortable';
    headline = 'Comfortable: Well within your guilt-free spending limits';
    explanation = `Great news! This purchase leaves ₹${remainingFundsAfterPurchase.toLocaleString('en-IN')} in discretionary cushion and maintains a healthy safe-to-spend of ₹${newDailySafeToSpend.toLocaleString('en-IN')}/day.`;
    recommendations.push('Go ahead safely! All upcoming commitments and credit dues remain protected.');
    recommendations.push('Use the verified coupon below at checkout to save even more.');
  }

  // Filter applicable offers
  const term = (categoryOrPurpose || '').toLowerCase();
  const applicableOffers = availableOffers.filter(offer => {
    const matchesSearch = term
      ? offer.merchant.toLowerCase().includes(term) ||
        offer.category.toLowerCase().includes(term) ||
        offer.title.toLowerCase().includes(term)
      : true;
    const matchesMin = safeAmount >= offer.minPurchase;
    return matchesSearch && matchesMin;
  }).slice(0, 3);

  // If none matched by specific search, fallback to highest discount applicable by minPurchase
  const finalOffers = applicableOffers.length > 0
    ? applicableOffers
    : availableOffers.filter(o => safeAmount >= o.minPurchase).slice(0, 2);

  return {
    purchaseAmount: safeAmount,
    currentAvailableFunds,
    remainingFundsAfterPurchase,
    impactOnDailyBudget,
    currentDailySafeToSpend: financials.safeToSpendToday,
    newDailySafeToSpend,
    status,
    headline,
    explanation,
    recommendations,
    applicableOffers: finalOffers,
  };
}
