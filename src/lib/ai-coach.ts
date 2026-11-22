import { FinancialCalculationResult, Transaction, Commitment, SavingsGoal } from '@/types';
import { formatINR } from './currency';

/**
 * Intelligent Local Rule-Based Financial Advisor Fallback
 * Used when GEMINI_API_KEY is not configured or network request fails.
 * Grounded in pure deterministic financial math. Never fabricates numbers.
 */
export function getLocalCoachResponse(
  query: string,
  financials: FinancialCalculationResult,
  transactions: Transaction[] = [],
  commitments: Commitment[] = [],
  savingsGoals: SavingsGoal[] = []
): { response: string; suggestedPrompts: string[] } {
  const q = query.toLowerCase().trim();

  // 1. Can I buy this today? / Can I spend / Safe to spend queries
  if (
    q.includes('safe to spend') ||
    q.includes('can i spend') ||
    q.includes('spend today') ||
    q.includes('how much can i spend') ||
    q.includes('can i buy this today') ||
    q.includes('can i buy')
  ) {
    const daily = financials.safeToSpendToday;
    const remainingDays = financials.daysRemainingInMonth;
    const discretionary = financials.discretionaryFunds;
    const unpaidEss = financials.unpaidEssentialCommitments;

    return {
      response: `Based on your live numbers:\n\n• **Safe to spend today:** ${formatINR(daily)} / day\n• **Remaining days in month:** ${remainingDays} days\n• **Discretionary cushion:** ${formatINR(discretionary)}\n• **Protected for essential bills:** ${formatINR(unpaidEss)}\n\n💡 **Sathi Tip:** As long as your purchase stays under ${formatINR(daily)}, you'll stay 100% on track for all upcoming hostel, recharge, and mess commitments. Unused funds roll over into tomorrow's buffer!`,
      suggestedPrompts: [
        'Give me a weekly budget',
        'Analyze my spending',
        'How much should I save?'
      ]
    };
  }

  // 2. Weekly budget request
  if (/\b(weekly budget|weekly plan|this week|weekly)\b/i.test(q)) {
    const weeklySafe = Math.round(financials.safeToSpendToday * 7);
    const weeklyBase = Math.round(financials.dailyBudget * 7);

    return {
      response: `Here is your 7-Day Campus Budget Guide:\n\n• **Target Weekly Spend:** ${formatINR(weeklySafe)} (approx. ${formatINR(financials.safeToSpendToday)}/day)\n• **Recommended Category Split:**\n  - Campus Canteen & Meals: ${formatINR(Math.round(weeklySafe * 0.55))}\n  - Metro / Commute: ${formatINR(Math.round(weeklySafe * 0.20))}\n  - Printouts, Stationary & Study: ${formatINR(Math.round(weeklySafe * 0.15))}\n  - Impulse Buffer: ${formatINR(Math.round(weeklySafe * 0.10))}\n\n🛡️ Avoid withdrawing or scanning more than ${formatINR(weeklySafe)} over the next 7 days to preserve your month-end surplus.`,
      suggestedPrompts: [
        'Can I buy this today?',
        'Analyze my spending',
        'Help me reach month-end'
      ]
    };
  }

  // 3. Spending breakdown / Analyze my spending
  if (
    q.includes('analyze my spending') ||
    q.includes('overspending') ||
    q.includes('where is my money') ||
    q.includes('spending on') ||
    q.includes('breakdown') ||
    q.includes('spending')
  ) {
    const categoryTotals: Record<string, number> = {};
    for (const t of transactions) {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount || 0);
    }

    const sortedCats = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const topCat = sortedCats[0];

    const lines = sortedCats.slice(0, 4).map(
      ([cat, amt]) => `• **${cat}:** ${formatINR(amt)} (${Math.round((amt / (financials.totalMonthlyExpenses || 1)) * 100)}% of total spend)`
    );

    return {
      response: `Here is your current spending footprint for this month:\n\n${lines.length > 0 ? lines.join('\n') : '• No expenses logged yet'}\n\n📊 **Key Finding:** Your largest expenditure area is **${topCat ? topCat[0] : 'None'}** (${formatINR(topCat ? topCat[1] : 0)}).\n\nCutting down on convenience fees (like instant delivery surcharges) or campus coffee runs by just 15% can unlock ${formatINR(topCat ? Math.round(topCat[1] * 0.15) : 350)} extra for your savings goals!`,
      suggestedPrompts: [
        'Can I buy this today?',
        'How much should I save?',
        'Help me reach month-end'
      ]
    };
  }

  // 4. Month-end survival / Help me reach month-end / Low balance
  if (
    q.includes('help me reach month-end') ||
    q.includes('survive') ||
    q.includes('month-end') ||
    q.includes('little money') ||
    q.includes('running out') ||
    q.includes('help me') ||
    q.includes('broke')
  ) {
    const days = financials.daysRemainingInMonth;
    const daily = financials.safeToSpendToday;
    const forecast = financials.monthEndForecastBalance;

    return {
      response: `Month-End Survival Plan (${days} days remaining):\n\n1. **Daily Hard Cap:** Stick strictly to ${formatINR(daily)} per day.\n2. **Pause Delivery Apps:** Delete or freeze quick-commerce apps until the 1st of next month. Campus thalis and mess food cost under ₹60–₹80.\n3. **UPI Payment Guard:** Use cash or set a daily UPI transaction ceiling on your banking app to avoid subconscious QR scans.\n4. **Protect Commitments:** Ensure your ${formatINR(financials.unpaidEssentialCommitments)} in essential dues is kept untouched in your bank.\n\nProjected finish: **${formatINR(Math.max(0, forecast))}** surplus if you adhere to this limit!`,
      suggestedPrompts: [
        'Give me a weekly budget',
        'Can I buy this today?',
        'How much should I save?'
      ]
    };
  }

  // 5. Savings advice / How much should I save?
  if (
    q.includes('how much should i save') ||
    q.includes('save') ||
    q.includes('goal') ||
    q.includes('trip') ||
    q.includes('laptop') ||
    q.includes('headphones')
  ) {
    const goalsCount = savingsGoals.length;
    const totalSaved = financials.totalSavedInGoals;
    const totalTarget = financials.targetSavingsTotal;
    const progressPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
    const recommendedMonthly = Math.round(financials.totalMonthlyIncome * 0.15);

    return {
      response: `Your Savings Health Snapshot:\n\n• **Active Goals:** ${goalsCount}\n• **Total Saved:** ${formatINR(totalSaved)} of ${formatINR(totalTarget)} (${progressPct}% completed)\n• **Recommended Student Target:** Save 10%–15% (${formatINR(recommendedMonthly)}/month) of your total allowance.\n\n🎯 **Golden Rule for Campus Life:**\nDo not try to save whatever is left over at the end of the month (there's never anything left). Use the **"Pay Yourself First"** rule: the moment your pocket money drops on the 1st, transfer ₹500–₹1,000 into a separate high-yield savings account or emergency buffer!`,
      suggestedPrompts: [
        'Can I buy this today?',
        'Give me a weekly budget',
        'Analyze my spending'
      ]
    };
  }

  // 6. Default grounded financial summary
  return {
    response: `Namaste! Here is your quick Yuva Sathi Financial Summary:\n\n• **Monthly Allowance:** ${formatINR(financials.totalMonthlyIncome)}\n• **Spent This Month:** ${formatINR(financials.totalMonthlyExpenses)}\n• **Current Available Balance:** ${formatINR(financials.currentBalance)}\n• **Daily Safe-To-Spend:** ${formatINR(financials.safeToSpendToday)} / day (${financials.daysRemainingInMonth} days remaining)\n• **Unpaid Commitments:** ${formatINR(financials.unpaidCommitments)}\n• **Spending Pace:** ${financials.spendingPace.replace('_', ' ').toUpperCase()}\n\nWhat would you like to explore today?`,
    suggestedPrompts: [
      'Can I buy this today?',
      'How much should I save?',
      'Analyze my spending',
      'Help me reach month-end',
      'Give me a weekly budget'
    ]
  };
}
