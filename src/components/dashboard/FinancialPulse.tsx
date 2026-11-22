'use client';

import React, { useState } from 'react';
import {
  Wallet,
  Calendar,
  PiggyBank,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard as CreditCardIcon,
  HelpCircle
} from 'lucide-react';
import { formatINR } from '@/lib/currency';
import { FinancialCalculationResult, UserProfile, Commitment, CreditCard } from '@/types';

interface FinancialPulseProps {
  financials: FinancialCalculationResult;
  profile: UserProfile;
  commitments?: Commitment[];
  creditCards?: CreditCard[];
}

export function FinancialPulse({
  financials,
  profile,
  commitments = [],
  creditCards = [],
}: FinancialPulseProps) {
  const [showPaymentsBreakdown, setShowPaymentsBreakdown] = useState(false);

  // Unpaid commitments list
  const unpaidList = commitments.filter(c => !c.isPaid);
  // Cards with upcoming dues
  const cardDuesList = creditCards.filter(c => (Number(c.upcomingDueAmount) || 0) > 0);

  const hasPlannedSavings = financials.plannedSavingsMonthly > 0;

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#E9E1D3] shadow-xs space-y-6">
      {/* Header Greeting & Cycle Progress (No judgment/personality labels) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#FAF7F0]">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-forest-900">
            {profile.name ? `Namaste, ${profile.name.split(' ')[0]}!` : 'Namaste!'}
          </h1>
          <p className="text-xs text-charcoal-700 mt-0.5">
            Day {financials.currentDayOfMonth} of {financials.daysInMonth} • {financials.daysRemainingInMonth} days remaining in this budget cycle
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-50 border border-forest-200 text-xs text-forest-800 font-semibold self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
          <span>Sathi Budget Tracker Active</span>
        </div>
      </div>

      {/* Main Financial Cards: 4 Student Questions Answered Clearly */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${hasPlannedSavings ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
        {/* 1. How much money do I have? -> Money Available */}
        <div className="p-4 bg-forest-50/70 rounded-2xl border border-forest-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-forest-800 mb-1 font-semibold">
              <Wallet className="w-4 h-4 text-forest-700" />
              <span>Money Available</span>
            </div>
            <p className="text-2xl md:text-3xl font-extrabold text-forest-900 mt-1">
              {formatINR(financials.moneyAvailable)}
            </p>
          </div>
          <p className="text-[11px] text-forest-700 mt-2">
            Monthly pocket money & inflows
          </p>
        </div>

        {/* 2. How much must I keep aside? -> Payments to Keep Aside */}
        <div className="p-4 bg-[#FAF7F0] rounded-2xl border border-[#E9E1D3] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <div className="flex items-center gap-1.5 text-xs text-charcoal-800 font-semibold">
                <Calendar className="w-4 h-4 text-charcoal-700" />
                <span>Payments to Keep Aside</span>
              </div>
              {(unpaidList.length > 0 || cardDuesList.length > 0) && (
                <button
                  type="button"
                  onClick={() => setShowPaymentsBreakdown(prev => !prev)}
                  className="text-[11px] font-semibold text-forest-800 hover:text-forest-950 flex items-center gap-0.5"
                  aria-expanded={showPaymentsBreakdown}
                >
                  <span>{showPaymentsBreakdown ? 'Hide' : 'Details'}</span>
                  {showPaymentsBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </div>
            <p className="text-2xl md:text-3xl font-extrabold text-charcoal-900 mt-1">
              {formatINR(financials.totalReservedPayments)}
            </p>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            {unpaidList.length} recurring {unpaidList.length === 1 ? 'bill' : 'bills'}
            {financials.creditCardTotalDue > 0 ? ` + ${formatINR(financials.creditCardTotalDue)} card due` : ''}
          </p>
        </div>

        {/* 3. Savings You Plan This Month (Only shown when monthly contribution is set) */}
        {hasPlannedSavings && (
          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-900 mb-1 font-semibold">
                <PiggyBank className="w-4 h-4 text-emerald-700" />
                <span>Savings You Plan This Month</span>
              </div>
              <p className="text-2xl md:text-3xl font-extrabold text-emerald-900 mt-1">
                {formatINR(financials.plannedSavingsMonthly)}
              </p>
            </div>
            <p className="text-[11px] text-emerald-700 mt-2">
              Reserved for your savings goals
            </p>
          </div>
        )}

        {/* 4. How much money is actually left? -> Free Money Remaining */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
          financials.freeMoneyRemaining >= 0
            ? 'bg-lime-50/80 border-lime-300'
            : 'bg-red-50 border-red-300'
        }`}>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold mb-1 text-forest-900">
              <CheckCircle2 className="w-4 h-4 text-forest-700" />
              <span>Free Money Remaining</span>
            </div>
            <p className={`text-2xl md:text-3xl font-extrabold mt-1 ${
              financials.freeMoneyRemaining >= 0 ? 'text-forest-900' : 'text-red-700'
            }`}>
              {formatINR(financials.freeMoneyRemaining)}
            </p>
          </div>
          <p className="text-[11px] text-forest-800 mt-2 leading-tight">
            Money left after upcoming payments, planned savings, and recorded spending.
          </p>
        </div>
      </div>

      {/* Expandable Breakdown of Payments to Keep Aside */}
      {showPaymentsBreakdown && (
        <div className="p-4 bg-[#FAF7F0] rounded-2xl border border-[#E9E1D3] space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-forest-900 uppercase tracking-wider">
              Payments Contributing to Reserved Total ({formatINR(financials.totalReservedPayments)})
            </h4>
            <span className="text-[11px] text-gray-500">Quarantined from daily spending</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {unpaidList.map(c => (
              <div
                key={c.id}
                className="flex items-center justify-between p-2.5 bg-white border border-[#E9E1D3] rounded-xl text-xs"
              >
                <div>
                  <p className="font-semibold text-charcoal-900">{c.name}</p>
                  <p className="text-[10px] text-gray-500">Due Day {c.dueDay}</p>
                </div>
                <span className="font-bold text-forest-900">{formatINR(c.amount)}</span>
              </div>
            ))}

            {cardDuesList.map(card => (
              <div
                key={card.id}
                className="flex items-center justify-between p-2.5 bg-white border border-red-200 rounded-xl text-xs"
              >
                <div className="flex items-center gap-2">
                  <CreditCardIcon className="w-3.5 h-3.5 text-red-600" />
                  <div>
                    <p className="font-semibold text-charcoal-900">{card.nickname}</p>
                    <p className="text-[10px] text-gray-500">Due Day {card.dueDay}</p>
                  </div>
                </div>
                <span className="font-bold text-red-700">{formatINR(card.upcomingDueAmount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
