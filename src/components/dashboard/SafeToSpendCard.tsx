'use client';

import React from 'react';
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { formatINR } from '@/lib/currency';
import { FinancialCalculationResult } from '@/types';

interface SafeToSpendCardProps {
  financials: FinancialCalculationResult;
  onOpenPurchaseCheck: () => void;
}

export function SafeToSpendCard({ financials, onOpenPurchaseCheck }: SafeToSpendCardProps) {
  const isOverBudget = financials.freeMoneyRemaining < 0;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-forest-800 via-forest-700 to-forest-900 text-cream-50 rounded-2xl p-6 md:p-8 shadow-md border border-forest-600">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-lime-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Column: Number and Student-Friendly Explanation */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-lime-400/20 text-lime-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-lime-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              Guilt-Free Daily Allowance
            </span>
            <span className="text-xs text-forest-200">
              {financials.daysRemainingInMonth} days remaining this month
            </span>
          </div>

          <div>
            <h2 className="text-xs md:text-sm text-forest-200 uppercase tracking-wider font-bold">
              SAFE TO SPEND TODAY
            </h2>
            <div className="flex items-baseline gap-3 mt-1">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                {formatINR(financials.safeToSpendToday)}
              </h1>
              <span className="text-sm font-semibold text-forest-200">/ day</span>
            </div>
          </div>

          {isOverBudget ? (
            <div className="flex items-center gap-2 text-xs text-amber-200 bg-amber-950/40 border border-amber-500/30 px-3 py-2 rounded-xl max-w-lg">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Your upcoming commitments exceed current funds by {formatINR(Math.abs(financials.freeMoneyRemaining))}. Daily safe spending is ₹0 to protect your bills.
              </span>
            </div>
          ) : (
            <p className="text-xs md:text-sm text-forest-100 max-w-lg leading-relaxed">
              Based on <span className="font-bold text-lime-300">{formatINR(financials.freeMoneyRemaining)}</span> free money and <span className="font-bold text-lime-300">{financials.daysRemainingInMonth}</span> days remaining this month.
            </p>
          )}
        </div>

        {/* Right Column: Check Before I Buy Primary CTA */}
        <div className="flex flex-col justify-center shrink-0">
          <button
            onClick={onOpenPurchaseCheck}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-lime-400 hover:bg-lime-300 text-forest-900 font-extrabold text-sm md:text-base rounded-xl transition-smooth shadow-md hover:shadow-lg active:scale-95"
            aria-label="Check Before I Buy"
          >
            <span>Check Before I Buy</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
