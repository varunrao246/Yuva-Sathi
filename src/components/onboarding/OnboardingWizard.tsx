'use client';

import React, { useState } from 'react';
import {
  Wallet,
  Calendar,
  CreditCard as CardIcon,
  PiggyBank,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  Sparkles
} from 'lucide-react';
import { IncomeConfig, Commitment, CreditCard, SavingsGoal, ExpenseCategory } from '@/types';
import { formatINR } from '@/lib/currency';
import { useToast } from '../ui/Toast';

interface OnboardingWizardProps {
  isOpen: boolean;
  onComplete: (data: {
    income: IncomeConfig;
    commitments: Commitment[];
    creditCards: CreditCard[];
    savingsGoals: SavingsGoal[];
  }) => void;
  onSkip: () => void;
}

export function OnboardingWizard({ isOpen, onComplete, onSkip }: OnboardingWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const { showToast } = useToast();

  // Step 1: Income
  const [pocketMoney, setPocketMoney] = useState('12000');
  const [otherIncome, setOtherIncome] = useState('2000');
  const [allowanceDate, setAllowanceDate] = useState('1');

  // Step 2: Commitments
  const [commitmentsList, setCommitmentsList] = useState<Commitment[]>([
    {
      id: 'com-init-1',
      name: 'Hostel Rent / Mess Advance',
      amount: 3000,
      dueDay: 5,
      recurrence: 'monthly',
      isEssential: true,
      isPaid: false,
      category: 'Bills',
    },
    {
      id: 'com-init-2',
      name: 'Jio / Airtel 5G Recharge',
      amount: 399,
      dueDay: 18,
      recurrence: 'monthly',
      isEssential: true,
      isPaid: false,
      category: 'Bills',
    },
  ]);
  const [newComName, setNewComName] = useState('');
  const [newComAmount, setNewComAmount] = useState('');
  const [newComDueDay, setNewComDueDay] = useState('10');
  const [newComEssential, setNewComEssential] = useState(true);

  // Step 3: Credit Cards
  const [cardsList, setCardsList] = useState<CreditCard[]>([]);
  const [newCardNickname, setNewCardNickname] = useState('');
  const [newCardDue, setNewCardDue] = useState('');
  const [newCardDueDay, setNewCardDueDay] = useState('25');

  // Step 4: Savings
  const [goalsList, setGoalsList] = useState<SavingsGoal[]>([
    {
      id: 'goal-init-1',
      name: 'Semester Tech Gadget / Headphones',
      targetAmount: 5000,
      currentSavings: 1500,
      targetDate: '2026-12-31',
      category: 'Tech Gadget',
    },
  ]);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalSaved, setNewGoalSaved] = useState('');

  if (!isOpen) return null;

  const handleAddCommitment = () => {
    const amt = parseFloat(newComAmount);
    if (!newComName.trim() || isNaN(amt) || amt <= 0) {
      showToast('Please enter commitment name and amount', 'error');
      return;
    }
    setCommitmentsList(prev => [
      ...prev,
      {
        id: `com_${Date.now()}`,
        name: newComName.trim(),
        amount: amt,
        dueDay: parseInt(newComDueDay, 10) || 1,
        recurrence: 'monthly',
        isEssential: newComEssential,
        isPaid: false,
        category: 'Bills',
      },
    ]);
    setNewComName('');
    setNewComAmount('');
    showToast(`Added commitment "${newComName}"`, 'success');
  };

  const handleAddCard = () => {
    const due = parseFloat(newCardDue);
    if (!newCardNickname.trim() || isNaN(due) || due <= 0) {
      showToast('Please enter card nickname and upcoming due amount', 'error');
      return;
    }
    setCardsList(prev => [
      ...prev,
      {
        id: `cc_${Date.now()}`,
        nickname: newCardNickname.trim(),
        upcomingDueAmount: due,
        outstandingBalance: due,
        dueDay: parseInt(newCardDueDay, 10) || 20,
      },
    ]);
    setNewCardNickname('');
    setNewCardDue('');
    showToast(`Added card due for "${newCardNickname}"`, 'success');
  };

  const handleAddGoal = () => {
    const tgt = parseFloat(newGoalTarget);
    if (!newGoalName.trim() || isNaN(tgt) || tgt <= 0) {
      showToast('Please enter goal name and target amount', 'error');
      return;
    }
    setGoalsList(prev => [
      ...prev,
      {
        id: `sg_${Date.now()}`,
        name: newGoalName.trim(),
        targetAmount: tgt,
        currentSavings: parseFloat(newGoalSaved) || 0,
        targetDate: '2026-12-31',
        category: 'Student Goal',
      },
    ]);
    setNewGoalName('');
    setNewGoalTarget('');
    setNewGoalSaved('');
    showToast(`Added goal "${newGoalName}"`, 'success');
  };

  const handleFinish = () => {
    onComplete({
      income: {
        monthlyPocketMoney: parseFloat(pocketMoney) || 0,
        otherIncome: parseFloat(otherIncome) || 0,
        incomeFrequency: 'monthly',
        allowanceReceivedDate: parseInt(allowanceDate, 10) || 1,
      },
      commitments: commitmentsList,
      creditCards: cardsList,
      savingsGoals: goalsList,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-step-title"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#E9E1D3] flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Progress header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#FAF7F0] mb-6">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-forest-700 text-lime-400 flex items-center justify-center font-bold text-sm">
              {step}
            </span>
            <div>
              <p className="text-[11px] font-bold text-forest-700 uppercase tracking-wider">
                Step {step} of 4
              </p>
              <h2 id="onboarding-step-title" className="text-base sm:text-lg font-bold text-forest-900">
                {step === 1 && 'Your Monthly Inflow'}
                {step === 2 && 'Recurring Commitments'}
                {step === 3 && 'Credit Cards (Safe Dues)'}
                {step === 4 && 'Student Savings Goals'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onSkip}
            className="text-xs font-semibold text-gray-400 hover:text-charcoal-800"
          >
            Skip for now
          </button>
        </div>

        {/* STEP 1: Monthly Pocket Money */}
        {step === 1 && (
          <div className="space-y-4 flex-1">
            <p className="text-xs text-charcoal-700">
              Enter what you receive from parents, guardians, stipends, or freelance tutoring.
            </p>

            <div>
              <label htmlFor="ob-pocket-money" className="block text-xs font-semibold text-charcoal-800 mb-1">
                Monthly Allowance / Pocket Money (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-forest-800">
                  ₹
                </span>
                <input
                  id="ob-pocket-money"
                  type="number"
                  min="0"
                  value={pocketMoney}
                  onChange={(e) => setPocketMoney(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-base font-bold text-charcoal-900 focus:outline-none focus:border-forest-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="ob-other-income" className="block text-xs font-semibold text-charcoal-800 mb-1">
                Other Inflow (Freelance / Tutoring / Stipend) (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-forest-800">
                  ₹
                </span>
                <input
                  id="ob-other-income"
                  type="number"
                  min="0"
                  value={otherIncome}
                  onChange={(e) => setOtherIncome(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-base font-bold text-charcoal-900 focus:outline-none focus:border-forest-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="ob-date" className="block text-xs font-semibold text-charcoal-800 mb-1">
                Day of Month Allowance is Received (1–31)
              </label>
              <input
                id="ob-date"
                type="number"
                min="1"
                max="31"
                value={allowanceDate}
                onChange={(e) => setAllowanceDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-xs text-charcoal-900 focus:outline-none focus:border-forest-600 focus:bg-white"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Commitments */}
        {step === 2 && (
          <div className="space-y-4 flex-1">
            <p className="text-xs text-charcoal-700">
              Add non-negotiable costs like hostel rent, mobile recharge, internet, or subscriptions.
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {commitmentsList.map(c => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2.5 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-xs"
                >
                  <div>
                    <span className="font-semibold text-charcoal-900">{c.name}</span>
                    <span className="text-[10px] text-gray-500 ml-2">Due day {c.dueDay}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-forest-900">{formatINR(c.amount)}</span>
                    <button
                      type="button"
                      onClick={() => setCommitmentsList(prev => prev.filter(item => item.id !== c.id))}
                      className="text-gray-400 hover:text-red-600"
                      aria-label={`Remove ${c.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Add Commitment Form */}
            <div className="p-3 bg-forest-50/50 rounded-xl border border-forest-200 space-y-2">
              <span className="text-xs font-bold text-forest-900">+ Add Commitment</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="e.g. WiFi Bill, Gym"
                  value={newComName}
                  onChange={(e) => setNewComName(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-[#E9E1D3] rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Amount ₹"
                  value={newComAmount}
                  onChange={(e) => setNewComAmount(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-[#E9E1D3] rounded-lg"
                />
              </div>
              <button
                type="button"
                onClick={handleAddCommitment}
                className="w-full py-1.5 bg-forest-700 text-cream-50 font-semibold text-xs rounded-lg hover:bg-forest-800 transition-smooth"
              >
                Add to List
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Credit Cards */}
        {step === 3 && (
          <div className="space-y-4 flex-1">
            <p className="text-xs text-charcoal-700">
              Only track upcoming dues so you never get hit with late fees. 
              <span className="font-bold text-forest-800"> We NEVER ask for card numbers, CVVs, or OTPs.</span>
            </p>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {cardsList.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">
                  No credit cards added. Skip if you only use UPI/debit!
                </p>
              ) : (
                cardsList.map(c => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2.5 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-xs"
                  >
                    <div>
                      <span className="font-semibold text-charcoal-900">{c.nickname}</span>
                      <span className="text-[10px] text-gray-500 ml-2">Due day {c.dueDay}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-red-700">{formatINR(c.upcomingDueAmount)}</span>
                      <button
                        type="button"
                        onClick={() => setCardsList(prev => prev.filter(item => item.id !== c.id))}
                        className="text-gray-400 hover:text-red-600"
                        aria-label={`Remove ${c.nickname}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Add Card Form */}
            <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E9E1D3] space-y-2">
              <span className="text-xs font-bold text-forest-900">+ Add Card Due</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nickname (e.g. OneCard, Slice)"
                  value={newCardNickname}
                  onChange={(e) => setNewCardNickname(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-[#E9E1D3] rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Upcoming Due ₹"
                  value={newCardDue}
                  onChange={(e) => setNewCardDue(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-[#E9E1D3] rounded-lg"
                />
              </div>
              <button
                type="button"
                onClick={handleAddCard}
                className="w-full py-1.5 bg-forest-700 text-cream-50 font-semibold text-xs rounded-lg hover:bg-forest-800 transition-smooth"
              >
                Add Card Due
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Savings Goals */}
        {step === 4 && (
          <div className="space-y-4 flex-1">
            <p className="text-xs text-charcoal-700">
              What are you saving for this semester? A road trip, headphones, or emergency cushion?
            </p>

            <div className="space-y-2 max-h-44 overflow-y-auto">
              {goalsList.map(g => (
                <div
                  key={g.id}
                  className="flex items-center justify-between p-2.5 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-xs"
                >
                  <span className="font-semibold text-charcoal-900">{g.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-forest-900">
                      {formatINR(g.currentSavings)} / {formatINR(g.targetAmount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setGoalsList(prev => prev.filter(item => item.id !== g.id))}
                      className="text-gray-400 hover:text-red-600"
                      aria-label={`Remove ${g.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Add Goal Form */}
            <div className="p-3 bg-forest-50/50 rounded-xl border border-forest-200 space-y-2">
              <span className="text-xs font-bold text-forest-900">+ Add Savings Goal</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Goal (e.g. Goa Trip)"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-[#E9E1D3] rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Target (₹)"
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-[#E9E1D3] rounded-lg"
                />
              </div>
              <button
                type="button"
                onClick={handleAddGoal}
                className="w-full py-1.5 bg-forest-700 text-cream-50 font-semibold text-xs rounded-lg hover:bg-forest-800 transition-smooth"
              >
                Add Goal
              </button>
            </div>
          </div>
        )}

        {/* Bottom Nav Controls */}
        <div className="pt-6 border-t border-[#FAF7F0] mt-6 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-forest-800 hover:bg-forest-50 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as any)}
              className="flex items-center gap-1 px-5 py-2.2 bg-forest-700 hover:bg-forest-800 text-cream-50 font-semibold text-xs rounded-xl shadow-xs"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-6 py-2.2 bg-lime-400 hover:bg-lime-300 text-forest-900 font-bold text-xs sm:text-sm rounded-xl shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Launch Yuva Sathi</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
