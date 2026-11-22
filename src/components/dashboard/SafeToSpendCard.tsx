'use client';

import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { formatINR } from '@/lib/currency';
import { FinancialCalculationResult } from '@/types';

interface SafeToSpendCardProps {
  financials: FinancialCalculationResult;
  onOpenPurchaseCheck: () => void;
}

export function SafeToSpendCard({ financials, onOpenPurchaseCheck }: SafeToSpendCardProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-forest-800 via-forest-700 to-forest-900 text-cream-50 rounded-2xl p-6 shadow-md border border-forest-600">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-lime-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Column: Number and Explanation */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-lime-400/20 text-lime-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-lime-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              Guilt-Free Spending
            </span>
            <span className="text-xs text-forest-200">
              {financials.daysRemainingInMonth} days left in month
            </span>
          </div>

          <div>
            <p className="text-xs text-forest-200 uppercase tracking-wider font-semibold">
              Safe To Spend Today
            </p>
            <div className="flex items-baseline gap-3 mt-1">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {formatINR(financials.safeToSpendToday)}
              </h1>
              <span className="text-xs text-forest-200">/ day</span>
            </div>
          </div>

          <p className="text-xs text-forest-100 max-w-lg leading-relaxed">
            Calculated after reserving <span className="font-semibold text-lime-300">{formatINR(financials.unpaidEssentialCommitments)}</span> for unpaid essentials (mess, rent, recharge) and credit dues.
          </p>
        </div>

        {/* Right Column: Breakdown & Quick CTA */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 justify-center">
          <div className="bg-forest-900/60 backdrop-blur-xs rounded-xl p-3 border border-forest-600/50 text-xs space-y-1.5">
            <div className="flex justify-between gap-4 text-forest-200">
              <span>Discretionary Buffer:</span>
              <span className="font-semibold text-white">{formatINR(financials.discretionaryFunds)}</span>
            </div>
            <div className="flex justify-between gap-4 text-forest-200">
              <span>Forecast Surplus:</span>
              <span className="font-semibold text-lime-300">
                {financials.monthEndForecastBalance >= 0 ? '+' : ''}{formatINR(financials.monthEndForecastBalance)}
              </span>
            </div>
          </div>

          <button
            onClick={onOpenPurchaseCheck}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-lime-400 hover:bg-lime-300 text-forest-900 font-bold text-xs md:text-sm rounded-xl transition-smooth shadow-sm"
          >
            <span>Check A Purchase Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
