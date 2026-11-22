'use client';

import React, { useState } from 'react';
import { useYuvaStore } from '@/lib/storage';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { FinancialPulse } from '@/components/dashboard/FinancialPulse';
import { SafeToSpendCard } from '@/components/dashboard/SafeToSpendCard';
import { SpendingTrendChart } from '@/components/dashboard/SpendingTrendChart';
import { CategoryBreakdownChart } from '@/components/dashboard/CategoryBreakdownChart';
import { CommitmentsTimeline } from '@/components/dashboard/CommitmentsTimeline';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { SmartInsights } from '@/components/dashboard/SmartInsights';
import { TransactionManager } from '@/components/transactions/TransactionManager';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { BeforeYouBuyChecker } from '@/components/purchase/BeforeYouBuyChecker';
import { OffersExplorer } from '@/components/offers/OffersExplorer';
import { SavingsManager } from '@/components/savings/SavingsManager';
import { AICoachChat } from '@/components/coach/AICoachChat';
import { AuthModal } from '@/components/auth/AuthModal';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { FinancialSetupModal } from '@/components/settings/FinancialSetupModal';
import { TelegramLinkModal } from '@/components/integrations/TelegramLinkModal';
import { ScholarshipsExplorer } from '@/components/scholarships/ScholarshipsExplorer';
import { OpportunitiesExplorer } from '@/components/opportunities/OpportunitiesExplorer';
import { MyMoneyHub } from '@/components/money/MyMoneyHub';
import { StudentOpportunitySummary } from '@/components/dashboard/StudentOpportunitySummary';
import { useToast } from '@/components/ui/Toast';
import {
  NavTab,
  Transaction,
  ExpenseCategory,
  IncomeConfig,
  Commitment,
  CreditCard,
  SavingsGoal,
  isNavTabActive,
} from '@/types';
import {
  Sparkles,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  TrendingUp,
  Tag,
  Bot,
  UserCheck
} from 'lucide-react';

export default function HomePage() {
  const {
    isLoaded,
    appMode,
    isLoggedIn,
    profile,
    income,
    commitments,
    creditCards,
    savingsGoals,
    transactions,
    financials,
    switchMode,
    registerUser,
    updateProfile,
    updateIncome,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCommitment,
    setAllCommitments,
    toggleCommitmentPaid,
    deleteCommitment,
    addCreditCard,
    setAllCreditCards,
    deleteCreditCard,
    addSavingsGoal,
    setAllSavingsGoals,
    updateSavingsGoal,
    deleteSavingsGoal,
    trackedScholarships,
    bookmarkedOpportunities,
    updateScholarshipStatus,
    toggleBookmarkOpportunity,
    loginDemo,
    logout,
  } = useYuvaStore();

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isTelegramOpen, setIsTelegramOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [initialExpenseData, setInitialExpenseData] = useState<{
    amount?: number;
    merchant?: string;
    category?: ExpenseCategory;
  }>({});

  const { showToast } = useToast();

  const handleOpenAddExpense = (amount?: number, merchant?: string, category?: ExpenseCategory) => {
    setEditingTransaction(null);
    if (amount || merchant) {
      setInitialExpenseData({ amount, merchant, category });
    } else {
      setInitialExpenseData({});
    }
    setIsAddExpenseOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setInitialExpenseData({});
    setEditingTransaction(tx);
    setIsAddExpenseOpen(true);
  };

  const handleOnboardingComplete = (data: {
    income: IncomeConfig;
    commitments: Commitment[];
    creditCards: CreditCard[];
    savingsGoals: SavingsGoal[];
  }) => {
    updateIncome(data.income);
    setAllCommitments(data.commitments);
    setAllCreditCards(data.creditCards);
    setAllSavingsGoals(data.savingsGoals);
    updateProfile({ onboardingCompleted: true });
    showToast('Onboarding complete! Your personalized ledger is ready.', 'success');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-forest-800 text-lime-400 font-bold text-2xl flex items-center justify-center animate-pulse mb-3">
          य
        </div>
        <p className="text-xs font-semibold text-forest-800">Starting Yuva Sathi...</p>
      </div>
    );
  }

  // Welcome / Authentication Screen if logged out
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] flex flex-col justify-between p-4 sm:p-8">
        <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-forest-700 flex items-center justify-center text-lime-400 font-bold text-xl shadow-xs">
              य
            </div>
            <div>
              <span className="font-bold tracking-tight text-forest-900 text-lg sm:text-xl">
                YUVA SATHI
              </span>
              <p className="text-[11px] text-gray-500 font-medium">Your money. Your life. Your साथी.</p>
            </div>
          </div>

          <button
            onClick={() => {
              switchMode('demo');
              showToast('Logged in as Demo Student (Rohan Sharma)', 'success');
            }}
            className="text-xs font-bold text-forest-800 hover:text-forest-950 px-3 py-1.5 rounded-lg border border-forest-300 bg-white hover:bg-forest-50 transition-smooth"
          >
            Instant Evaluator Demo
          </button>
        </header>

        <main className="max-w-3xl mx-auto w-full my-auto text-center py-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-100 text-forest-900 text-xs font-semibold border border-forest-200">
            <GraduationCap className="w-4 h-4 text-forest-700" />
            <span>AI Financial Companion for Indian College Students</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-forest-900 tracking-tight leading-tight">
            Know your money.<br />Make smarter decisions.<br />Never go broke before month-end.
          </h1>

          <p className="text-xs sm:text-sm text-charcoal-700 max-w-xl mx-auto leading-relaxed">
            From hostel mess dues and mobile recharges to quick-commerce cravings and weekend movies. Yuva Sathi tells you exactly how much is safe to spend today in Indian Rupees (₹).
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              onClick={() => setIsAuthOpen(true)}
              className="w-full sm:w-auto px-6 py-3 bg-forest-700 hover:bg-forest-800 text-cream-50 font-bold text-sm rounded-xl transition-smooth shadow-sm flex items-center justify-center gap-2"
            >
              <span>Register as Student</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                switchMode('demo');
                showToast('Welcome, Evaluator! Demo mode active.', 'success');
              }}
              className="w-full sm:w-auto px-6 py-3 bg-lime-300 hover:bg-lime-400 text-forest-900 font-bold text-sm rounded-xl transition-smooth shadow-xs border border-lime-400 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Demo Account</span>
            </button>
          </div>

          {/* Value Props Grid */}
          <div className="pt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="bg-white p-4 rounded-2xl border border-[#E9E1D3]">
              <span className="text-xs font-bold text-forest-900 block mb-1">Guilt-Free Safe-To-Spend</span>
              <p className="text-[11px] text-gray-600">Calculates your safe daily spend after protecting unpaid mess, rent, and recharge bills.</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#E9E1D3]">
              <span className="text-xs font-bold text-forest-900 block mb-1">Before-You-Buy Decision</span>
              <p className="text-[11px] text-gray-600">Simulate purchases in real-time to know if an expense is Comfortable, Manageable, or Risky.</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#E9E1D3]">
              <span className="text-xs font-bold text-forest-900 block mb-1">Verified Indian Deals</span>
              <p className="text-[11px] text-gray-600">Direct student plans on Spotify SheerID, Prime Youth, Apple UNiDAYS, and campus promos.</p>
            </div>
          </div>
        </main>

        <footer className="text-center text-xs text-gray-500 py-4">
          YUVA SATHI (युवा साथी) • 100% Indian Rupees (₹) • Strict Local Privacy
        </footer>

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          currentUser={profile}
          appMode={appMode}
          onSaveProfile={updateProfile}
          onRegisterUser={registerUser}
          onSwitchMode={switchMode}
          onLoginDemo={loginDemo}
          onLogout={logout}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col">
      {/* Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenAddExpense={() => handleOpenAddExpense()}
        onOpenPurchaseCheck={() => setActiveTab('purchase-check')}
        onOpenFinancialSetup={() => setIsSetupOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenTelegram={() => setIsTelegramOpen(true)}
        onOpenVoice={() => setActiveTab('coach')}
      />

      {/* Mode Status Banner for Evaluator Clarity */}
      {appMode === 'demo' && (
        <div className="bg-amber-500/10 border-b border-amber-300/60 px-4 py-2 text-center text-xs font-medium text-amber-900 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" aria-hidden="true"></span>
          <span>
            <strong>Evaluator Demo Mode:</strong> Viewing <strong>{profile.name}</strong> ({profile.college ? profile.college.split(',')[0] : 'Campus'}).
          </span>
          <button
            onClick={() => {
              switchMode('user');
              showToast('Switched to Personal Account', 'info');
            }}
            className="underline font-bold text-forest-900 hover:text-forest-700 ml-1"
          >
            Switch to My Account
          </button>
        </div>
      )}

      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 md:pb-8">
        {/* Sidebar Navigation */}
        <Sidebar activeTab={activeTab} onSelectTab={(tab) => setActiveTab(tab)} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 overflow-x-hidden">
          {/* TAB 1: OVERVIEW / DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Financial Pulse */}
              <FinancialPulse
                financials={financials}
                profile={profile}
                commitments={commitments}
                creditCards={creditCards}
              />

              {/* Safe To Spend Highlight */}
              <SafeToSpendCard
                financials={financials}
                onOpenPurchaseCheck={() => setActiveTab('purchase-check')}
              />

              {/* Student Opportunity & Scholarship Summary */}
              <StudentOpportunitySummary
                savingsGoals={savingsGoals}
                trackedScholarships={trackedScholarships}
                bookmarkedOpportunities={bookmarkedOpportunities}
                onNavigateToScholarships={() => setActiveTab('scholarships')}
                onNavigateToOpportunities={() => setActiveTab('opportunities')}
                onNavigateToSavings={() => setActiveTab('savings')}
              />

              {/* Proactive Sathi Insights */}
              <SmartInsights
                financials={financials}
                transactions={transactions}
                onOpenCoach={() => setActiveTab('coach')}
                onOpenPurchaseCheck={() => setActiveTab('purchase-check')}
              />

              {/* Visualizations: Trajectory & Category Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SpendingTrendChart
                  transactions={transactions}
                  financials={financials}
                />
                <CategoryBreakdownChart transactions={transactions} />
              </div>

              {/* Commitments & Recent Transactions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CommitmentsTimeline
                  commitments={commitments}
                  onTogglePaid={toggleCommitmentPaid}
                  onOpenSettings={() => setIsSetupOpen(true)}
                />
                <RecentTransactions
                  transactions={transactions}
                  onViewAll={() => setActiveTab('transactions')}
                  onDeleteTransaction={deleteTransaction}
                  onOpenAddExpense={() => handleOpenAddExpense()}
                />
              </div>
            </div>
          )}

          {/* TAB 2: MY MONEY (Unified Financial Suite) */}
          {isNavTabActive(activeTab, 'my-money') && (
            <MyMoneyHub
              initialSubTab={
                activeTab === 'purchase-check'
                  ? 'purchase-check'
                  : activeTab === 'offers'
                  ? 'offers'
                  : 'expenses'
              }
              financials={financials}
              transactions={transactions}
              commitments={commitments}
              creditCards={creditCards}
              onAddTransaction={addTransaction}
              onUpdateTransaction={updateTransaction}
              onOpenAddExpense={handleOpenAddExpense}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={deleteTransaction}
              onToggleCommitmentPaid={toggleCommitmentPaid}
              onDeleteCommitment={deleteCommitment}
              onOpenFinancialSetup={() => setIsSetupOpen(true)}
            />
          )}

          {/* TAB 3: SCHOLARSHIPS */}
          {activeTab === 'scholarships' && (
            <ScholarshipsExplorer
              trackedScholarships={trackedScholarships}
              onUpdateStatus={updateScholarshipStatus}
            />
          )}

          {/* TAB 4: PART-TIME & STUDENT OPPORTUNITIES */}
          {activeTab === 'opportunities' && (
            <OpportunitiesExplorer
              bookmarkedOpportunities={bookmarkedOpportunities}
              onToggleBookmark={toggleBookmarkOpportunity}
            />
          )}

          {/* TAB 5: SAVINGS GOALS */}
          {activeTab === 'savings' && (
            <SavingsManager
              savingsGoals={savingsGoals}
              financials={financials}
              onAddGoal={addSavingsGoal}
              onUpdateGoal={updateSavingsGoal}
              onDeleteGoal={deleteSavingsGoal}
            />
          )}

          {/* TAB 6: AI MONEY COACH */}
          {activeTab === 'coach' && (
            <AICoachChat
              financials={financials}
              transactions={transactions}
              commitments={commitments}
              savingsGoals={savingsGoals}
            />
          )}

          {/* TAB 7: SETTINGS & BUDGET SETUP */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-[#E9E1D3] shadow-xs">
                <h2 className="text-xl font-bold text-forest-900 mb-1">
                  Financial Setup & Inflow Rules
                </h2>
                <p className="text-xs text-charcoal-700 mb-6">
                  Adjust your monthly allowance, credit cards, and recurring commitments anytime.
                </p>

                <button
                  onClick={() => setIsSetupOpen(true)}
                  className="px-5 py-2.5 bg-forest-700 hover:bg-forest-800 text-cream-50 font-semibold text-xs md:text-sm rounded-xl transition-smooth shadow-sm"
                >
                  Configure Budget & Commitments
                </button>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-[#E9E1D3] shadow-xs">
                <h3 className="text-base font-bold text-forest-900 mb-1">
                  Profile & Campus Persona
                </h3>
                <p className="text-xs text-charcoal-700 mb-4">
                  Manage your name, college, and study year. Current mode: <strong>{appMode === 'demo' ? 'Demo Sandbox' : 'Personal Account'}</strong>.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="px-4 py-2 bg-[#FAF7F0] hover:bg-forest-50 border border-[#E9E1D3] text-forest-800 font-semibold text-xs rounded-xl transition-smooth"
                  >
                    Edit Profile / Switch Persona
                  </button>

                  <button
                    onClick={() => {
                      switchMode(appMode === 'demo' ? 'user' : 'demo');
                      showToast(appMode === 'demo' ? 'Switched to Personal Account' : 'Switched to Demo Account', 'info');
                    }}
                    className="px-4 py-2 bg-white hover:bg-forest-50 border border-[#E9E1D3] text-forest-800 font-semibold text-xs rounded-xl transition-smooth"
                  >
                    Toggle to {appMode === 'demo' ? 'My Account' : 'Demo Account'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav activeTab={activeTab} onSelectTab={(tab) => setActiveTab(tab)} />

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setEditingTransaction(null);
          setInitialExpenseData({});
        }}
        onAddTransaction={addTransaction}
        onUpdateTransaction={updateTransaction}
        editTransaction={editingTransaction}
        initialData={initialExpenseData}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={profile}
        appMode={appMode}
        onSaveProfile={updateProfile}
        onRegisterUser={registerUser}
        onSwitchMode={switchMode}
        onLoginDemo={loginDemo}
        onLogout={logout}
      />

      <FinancialSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        income={income}
        commitments={commitments}
        creditCards={creditCards}
        onUpdateIncome={updateIncome}
        onAddCommitment={addCommitment}
        onDeleteCommitment={deleteCommitment}
        onAddCreditCard={addCreditCard}
        onDeleteCreditCard={deleteCreditCard}
      />

      <TelegramLinkModal
        isOpen={isTelegramOpen}
        onClose={() => setIsTelegramOpen(false)}
        userId={profile.id}
        financials={financials}
      />

      {/* Onboarding Wizard (shown for registered users who haven't finished onboarding) */}
      {appMode === 'user' && !profile.onboardingCompleted && (
        <OnboardingWizard
          isOpen={!profile.onboardingCompleted}
          onComplete={handleOnboardingComplete}
          onSkip={() => updateProfile({ onboardingCompleted: true })}
        />
      )}
    </div>
  );
}
