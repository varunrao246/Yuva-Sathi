'use client';

import React from 'react';
import {
  Wallet,
  TrendingDown,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { formatINR } from '@/lib/currency';
import { FinancialCalculationResult, UserProfile } from '@/types';

interface FinancialPulseProps {
  financials: FinancialCalculationResult;
  profile: UserProfile;
}

export function FinancialPulse({ financials, profile }: FinancialPulseProps) {
  const getPaceBadge = (pace: FinancialCalculationResult['spendingPace']) => {
    switch (pace) {
      case 'frugal':
        return {
          label: 'Frugal / High Buffer',
          color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: ShieldCheck,
        };
      case 'on_track':
        return {
          label: 'Spending On Track',
          color: 'bg-forest-100 text-forest-900 border-forest-300',
          icon: CheckCircle2,
        };
      case 'fast':
        return {
          label: 'Spending Fast',
          color: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: Clock,
        };
      case 'critical':
        return {
          label: 'Essential Cushion Alert',
          color: 'bg-red-100 text-red-900 border-red-300',
          icon: ShieldAlert,
        };
    }
  };

  const paceInfo = getPaceBadge(financials.spendingPace);
  const PaceIcon = paceInfo.icon;

  const percentSpent = financials.totalMonthlyIncome > 0
    ? Math.min(100, Math.round((financials.totalMonthlyExpenses / financials.totalMonthlyIncome) * 100))
    : 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E9E1D3] shadow-xs">
      {/* Top greeting and status badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-[#FAF7F0]">
        <div>
          <h1 className="text-xl font-bold text-forest-900">
            {profile.name ? `Namaste, ${profile.name.split(' ')[0]}!` : 'Namaste!'}
          </h1>
          <p className="text-xs text-charcoal-700">
            Day {financials.currentDayOfMonth} of {financials.daysInMonth} • {financials.daysRemainingInMonth} days remaining in this budget cycle
          </p>
        </div>

        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${paceInfo.color}`}>
          <PaceIcon className="w-3.5 h-3.5" />
          <span>{paceInfo.label}</span>
        </div>
      </div>

      {/* 4 Pillars of Instant Student Financial Clarity */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. How much money do I have? */}
        <div className="p-3.5 bg-forest-50/70 rounded-xl border border-forest-200">
          <div className="flex items-center gap-1.5 text-xs text-forest-800 mb-1 font-medium">
            <Wallet className="w-3.5 h-3.5 text-forest-700" />
            <span>Current Balance</span>
          </div>
          <p className="text-lg md:text-2xl font-extrabold text-forest-900">
            {formatINR(financials.currentBalance)}
          </p>
          <p className="text-[11px] text-forest-700 mt-0.5">
            Liquid cash + bank inflow
          </p>
        </div>

        {/* 2. How much can I safely spend today? */}
        <div className="p-3.5 bg-lime-50/60 rounded-xl border border-lime-300">
          <div className="flex items-center gap-1.5 text-xs text-forest-900 mb-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-forest-700" />
            <span>Safe To Spend Today</span>
          </div>
          <p className="text-lg md:text-2xl font-extrabold text-forest-900">
            {formatINR(financials.safeToSpendToday)}
            <span className="text-xs font-normal text-forest-700 ml-1">/ day</span>
          </p>
          <p className="text-[11px] text-forest-800 mt-0.5">
            Guilt-free daily budget
          </p>
        </div>

        {/* 3. How much have I spent? */}
        <div className="p-3.5 bg-[#FAF7F0] rounded-xl border border-[#E9E1D3]">
          <div className="flex items-center gap-1.5 text-xs text-charcoal-700 mb-1 font-medium">
            <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
            <span>Spent This Month</span>
          </div>
          <p className="text-lg md:text-2xl font-extrabold text-charcoal-900">
            {formatINR(financials.totalMonthlyExpenses)}
          </p>
          <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                percentSpent > 80 ? 'bg-red-500' : percentSpent > 50 ? 'bg-amber-500' : 'bg-lime-500'
              }`}
              style={{ width: `${percentSpent}%` }}
            />
          </div>
        </div>

        {/* 4. What commitments are coming? */}
        <div className="p-3.5 bg-[#FAF7F0] rounded-xl border border-[#E9E1D3]">
          <div className="flex items-center gap-1.5 text-xs text-charcoal-700 mb-1 font-medium">
            <Calendar className="w-3.5 h-3.5 text-charcoal-800" />
            <span>Upcoming Due</span>
          </div>
          <p className="text-lg md:text-2xl font-extrabold text-charcoal-900">
            {formatINR(financials.unpaidCommitments + financials.creditCardTotalDue)}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {formatINR(financials.unpaidEssentialCommitments)} essential + {formatINR(financials.creditCardTotalDue)} card due
          </p>
        </div>
      </div>
    </div>
  );
}
