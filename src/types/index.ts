export type RecurrenceType = 'monthly' | 'weekly' | 'yearly' | 'one-time';

export type ExpenseCategory =
  | 'Food'
  | 'Groceries'
  | 'Transport'
  | 'Shopping'
  | 'Education'
  | 'Entertainment'
  | 'Bills'
  | 'Health'
  | 'Subscriptions'
  | 'Other';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  college?: string;
  course?: string;
  studyYear?: string;
  createdAt: string;
  onboardingCompleted: boolean;
}

export interface IncomeConfig {
  monthlyPocketMoney: number;
  otherIncome: number;
  incomeFrequency: 'monthly' | 'biweekly' | 'irregular';
  allowanceReceivedDate: number; // 1 - 31
}

export interface Commitment {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // 1 - 31 day of month
  recurrence: RecurrenceType;
  isEssential: boolean;
  isPaid: boolean;
  category: ExpenseCategory;
  notes?: string;
}

export interface CreditCard {
  id: string;
  nickname: string;
  creditLimit?: number;
  outstandingBalance: number;
  upcomingDueAmount: number;
  dueDay: number; // 1 - 31 day of month
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentSavings: number;
  targetDate: string; // YYYY-MM-DD
  category: string;
  isCompleted?: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  merchant: string;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  description?: string;
  location?: string;
  paymentMethod?: 'UPI' | 'Debit Card' | 'Credit Card' | 'Cash' | 'NetBanking';
}

export type AffordabilityStatus = 'comfortable' | 'manageable' | 'risky';

export interface PurchaseCheckResult {
  purchaseAmount: number;
  currentAvailableFunds: number;
  remainingFundsAfterPurchase: number;
  impactOnDailyBudget: number;
  currentDailySafeToSpend: number;
  newDailySafeToSpend: number;
  status: AffordabilityStatus;
  headline: string;
  explanation: string;
  recommendations: string[];
  applicableOffers: OfferItem[];
}

export type OfferVerificationStatus = 'VERIFIED' | 'UNVERIFIED' | 'DEMO' | 'EXPIRED';

export interface OfferItem {
  id: string;
  merchant: string;
  title: string;
  discountSummary: string;
  couponCode?: string;
  minPurchase: number;
  paymentMethod: string;
  category: ExpenseCategory | 'Student Discounts' | 'Payment Offers';
  eligibility: string;
  expiry: string;
  sourceUrl: string;
  status: OfferVerificationStatus;
  termsNotes?: string;
  isVerified?: boolean;
  isDemo?: boolean;
}

export interface FinancialCalculationResult {
  totalMonthlyIncome: number;
  totalMonthlyExpenses: number;
  currentBalance: number;
  totalCommitments: number;
  paidCommitments: number;
  unpaidCommitments: number;
  unpaidEssentialCommitments: number;
  unpaidOptionalCommitments: number;
  safeToSpendToday: number;
  dailyBudget: number;
  currentDayOfMonth: number;
  daysInMonth: number;
  daysRemainingInMonth: number;
  spendingPace: 'frugal' | 'on_track' | 'fast' | 'critical';
  monthEndForecastBalance: number;
  creditCardTotalDue: number;
  discretionaryFunds: number;
  totalSavedInGoals: number;
  targetSavingsTotal: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isOfflineFallback?: boolean;
  suggestedPrompts?: string[];
}

export type ScholarshipType = 'Government' | 'Private' | 'Institutional';
export type ScholarshipEducationLevel = 'Undergraduate' | 'Postgraduate' | 'Diploma' | 'All';
export type ScholarshipApplicationStatus = 'saved' | 'applying' | 'applied' | 'awarded';

export interface ScholarshipItem {
  id: string;
  title: string;
  provider: string;
  type: ScholarshipType;
  amountText: string;
  amountNumeric?: number;
  educationLevel: ScholarshipEducationLevel;
  eligibleCourses: string[];
  eligibilityCriteria: string[];
  location: string;
  deadline: string; // YYYY-MM-DD
  officialUrl: string;
  isVerified: boolean;
  description: string;
  tags?: string[];
}

export type OpportunityType = 'Part-Time Job' | 'Internship' | 'Remote Work' | 'Campus Role' | 'Freelance Gig';

export interface OpportunityItem {
  id: string;
  title: string;
  organization: string;
  type: OpportunityType;
  compensation: string;
  compensationVerified: boolean;
  requiredSkills: string[];
  location: string;
  workingHours?: string;
  deadline?: string;
  applyUrl: string;
  isVerified: boolean;
  description: string;
  postedDate: string;
  tags?: string[];
}

export type NavTab =
  | 'dashboard'
  | 'my-money'
  | 'scholarships'
  | 'opportunities'
  | 'savings'
  | 'coach'
  | 'settings'
  // Legacy aliases for backward compatibility
  | 'transactions'
  | 'purchase-check'
  | 'offers';

/**
 * Determines whether a navigation target tab should be highlighted as active,
 * accounting for nested/aliased tabs grouped under 'my-money'.
 */
export function isNavTabActive(currentTab: NavTab, targetTab: NavTab): boolean {
  if (currentTab === targetTab) return true;
  if (targetTab === 'my-money') {
    return (
      currentTab === 'transactions' ||
      currentTab === 'purchase-check' ||
      currentTab === 'offers'
    );
  }
  return false;
}


