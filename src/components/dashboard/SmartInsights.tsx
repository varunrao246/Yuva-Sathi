'use client';

import React from 'react';
import { Lightbulb, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';
import { FinancialCalculationResult, Transaction } from '@/types';
import { formatINR } from '@/lib/currency';

interface SmartInsightsProps {
  financials: FinancialCalculationResult;
  transactions: Transaction[];
  onOpenCoach: () => void;
  onOpenPurchaseCheck: () => void;
}

export function SmartInsights({
  financials,
  transactions,
  onOpenCoach,
  onOpenPurchaseCheck,
}: SmartInsightsProps) {
  // Compute top category
  const categoryMap: Record<string, number> = {};
  for (const t of transactions) {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + Number(t.amount || 0);
  }
  const topCategoryEntry = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];

  const insights = [
    {
      id: 'ins-1',
      icon: Lightbulb,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50/70 border-amber-200',
      title: 'Daily Spend Pacing',
      description: `With ${financials.daysRemainingInMonth} days remaining, keeping your daily spends under ${formatINR(financials.safeToSpendToday)} guarantees your essential bills stay protected.`,
    },
    topCategoryEntry
      ? {
          id: 'ins-2',
          icon: TrendingUp,
          iconColor: 'text-forest-700',
          bgColor: 'bg-forest-50/70 border-forest-200',
          title: `Highest Outflow: ${topCategoryEntry[0]}`,
          description: `You've spent ${formatINR(topCategoryEntry[1])} on ${topCategoryEntry[0]} this month. Consider checking available campus deals to trim this by 10-15%.`,
        }
      : {
          id: 'ins-2',
          icon: Sparkles,
          iconColor: 'text-forest-700',
          bgColor: 'bg-forest-50/70 border-forest-200',
          title: 'Campus Discounts Available',
          description: 'Explore verified student discounts on Spotify, Amazon Prime Youth, and quick groceries to cut monthly recurring costs.',
        },
    financials.creditCardTotalDue > 0
      ? {
          id: 'ins-3',
          icon: AlertTriangle,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50/70 border-red-200',
          title: 'Credit Dues Reserved',
          description: `₹${formatINR(financials.creditCardTotalDue)} is automatically quarantined from your safe-to-spend so you never incur credit interest charges.`,
        }
      : {
          id: 'ins-3',
          icon: Sparkles,
          iconColor: 'text-emerald-700',
          bgColor: 'bg-emerald-50/70 border-emerald-200',
          title: 'Surplus Opportunity',
          description: `You are projected to finish this month with ${formatINR(Math.max(0, financials.monthEndForecastBalance))} in surplus. You can divert this toward your savings goals!`,
        },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E9E1D3] shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-forest-900 text-sm md:text-base">
            Smart Sathi Insights
          </h3>
          <p className="text-xs text-gray-500">
            Real-time proactive financial intelligence
          </p>
        </div>

        <button
          onClick={onOpenCoach}
          className="text-xs font-semibold text-forest-700 hover:text-forest-900 flex items-center gap-1"
        >
          <span>Ask AI Coach</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {insights.map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border ${item.bgColor} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className={`w-4 h-4 ${item.iconColor}`} />
                  <span className="text-xs font-bold text-charcoal-900">
                    {item.title}
                  </span>
                </div>
                <p className="text-xs text-charcoal-700 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
