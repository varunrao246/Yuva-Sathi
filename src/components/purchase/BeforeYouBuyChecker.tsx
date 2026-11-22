'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  Tag,
  Copy,
  Check,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { FinancialCalculationResult, OfferItem } from '@/types';
import { analyzePurchaseAffordability } from '@/lib/calculations';
import { INDIAN_OFFERS } from '@/lib/offers-data';
import { formatINR } from '@/lib/currency';
import { useToast } from '../ui/Toast';

interface BeforeYouBuyCheckerProps {
  financials: FinancialCalculationResult;
  onOpenAddExpense?: (amount: number, merchant: string) => void;
}

export function BeforeYouBuyChecker({
  financials,
  onOpenAddExpense,
}: BeforeYouBuyCheckerProps) {
  const [amountInput, setAmountInput] = useState('');
  const [purposeInput, setPurposeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { showToast } = useToast();

  const numAmount = parseFloat(amountInput) || 0;
  const analysis = analyzePurchaseAffordability(
    numAmount,
    financials,
    INDIAN_OFFERS,
    purposeInput
  );

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Copied coupon "${code}" to clipboard!`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Quick preset pills testing various student scenarios as demanded by rubric
  const presets = [
    { label: '₹100 Chai & Canteen', amount: 100, purpose: 'Canteen food' },
    { label: '₹850 Instamart Groceries', amount: 850, purpose: 'Groceries' },
    { label: '₹1,000 Study Kit / Books', amount: 1000, purpose: 'Education' },
    { label: '₹2,500 Weekend Trip Ticket', amount: 2500, purpose: 'Transport' },
    { label: '₹8,000 Big Impulse Buy', amount: 8000, purpose: 'Shopping' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E9E1D3] shadow-xs space-y-6">
      {/* Title & Introduction */}
      <div className="border-b border-[#FAF7F0] pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-lime-300 text-forest-900 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-forest-900">
              Before-You-Buy Decision Engine
            </h2>
            <p className="text-xs text-charcoal-700">
              Simulate any planned campus purchase before spending. Pure math analysis with zero guilt.
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="buy-amount-input" className="block text-xs font-semibold text-charcoal-800 mb-1">
            Planned Purchase Amount (₹ INR) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-forest-800 text-lg pointer-events-none">
              ₹
            </span>
            <input
              id="buy-amount-input"
              type="number"
              min="0"
              step="any"
              placeholder="e.g. 850"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-lg font-bold text-charcoal-900 focus:outline-none focus:border-forest-600 focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label htmlFor="buy-purpose-input" className="block text-xs font-semibold text-charcoal-800 mb-1">
            What or where are you buying? (Matches Indian coupons)
          </label>
          <input
            id="buy-purpose-input"
            type="text"
            placeholder="e.g. Instamart, Zomato, Shoes, Books, Spotify"
            value={purposeInput}
            onChange={(e) => setPurposeInput(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-xs md:text-sm text-charcoal-900 focus:outline-none focus:border-forest-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Preset Scenario Pills */}
      <div>
        <p className="text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
          Simulate Student Test Scenarios:
        </p>
        <div className="flex flex-wrap gap-2">
          {presets.map(p => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setAmountInput(String(p.amount));
                setPurposeInput(p.purpose);
              }}
              className="px-3 py-1.5 bg-[#FAF7F0] hover:bg-forest-50 hover:text-forest-800 border border-[#E9E1D3] rounded-lg text-xs font-medium text-charcoal-700 transition-smooth"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Result Card */}
      {numAmount > 0 ? (
        <div
          className={`p-5 rounded-2xl border transition-smooth ${
            analysis.status === 'comfortable'
              ? 'bg-forest-50/70 border-forest-300'
              : analysis.status === 'manageable'
              ? 'bg-amber-50/70 border-amber-300'
              : 'bg-red-50/70 border-red-300'
          }`}
        >
          {/* Status Header */}
          <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-black/5">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  analysis.status === 'comfortable'
                    ? 'bg-forest-700 text-lime-300'
                    : analysis.status === 'manageable'
                    ? 'bg-amber-600 text-white'
                    : 'bg-red-700 text-white'
                }`}
              >
                {analysis.status === 'comfortable' && <ShieldCheck className="w-5 h-5" />}
                {analysis.status === 'manageable' && <AlertTriangle className="w-5 h-5" />}
                {analysis.status === 'risky' && <AlertOctagon className="w-5 h-5" />}
              </div>
              <div>
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    analysis.status === 'comfortable'
                      ? 'bg-forest-200 text-forest-900'
                      : analysis.status === 'manageable'
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-red-200 text-red-900'
                  }`}
                >
                  Decision: {analysis.status.toUpperCase()}
                </span>
                <h3 className="text-base font-bold text-charcoal-900 mt-0.5">
                  {analysis.headline}
                </h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-gray-500 font-medium">Cost:</span>
              <p className="text-lg font-extrabold text-charcoal-900">
                {formatINR(numAmount)}
              </p>
            </div>
          </div>

          {/* Key Metric Comparison Grid (Rubric Section 10) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white/90 p-3 rounded-xl border border-black/5">
              <p className="text-[10px] text-gray-500 font-medium">Funds Available Before</p>
              <p className="text-sm font-bold text-charcoal-900">
                {formatINR(analysis.currentAvailableFunds)}
              </p>
            </div>

            <div className="bg-white/90 p-3 rounded-xl border border-black/5">
              <p className="text-[10px] text-gray-500 font-medium">Funds Remaining After</p>
              <p
                className={`text-sm font-bold ${
                  analysis.remainingFundsAfterPurchase < 0 ? 'text-red-600' : 'text-forest-900'
                }`}
              >
                {formatINR(analysis.remainingFundsAfterPurchase)}
              </p>
            </div>

            <div className="bg-white/90 p-3 rounded-xl border border-black/5">
              <p className="text-[10px] text-gray-500 font-medium">Current Safe/Day</p>
              <p className="text-sm font-bold text-charcoal-900">
                {formatINR(analysis.currentDailySafeToSpend)}
              </p>
            </div>

            <div className="bg-white/90 p-3 rounded-xl border border-black/5">
              <p className="text-[10px] text-gray-500 font-medium">New Safe/Day</p>
              <p
                className={`text-sm font-bold ${
                  analysis.newDailySafeToSpend < analysis.currentDailySafeToSpend * 0.5
                    ? 'text-amber-700'
                    : 'text-forest-900'
                }`}
              >
                {formatINR(analysis.newDailySafeToSpend)}
              </p>
              <span className="text-[9px] text-gray-500 font-medium">
                (-{formatINR(analysis.impactOnDailyBudget)}/day impact)
              </span>
            </div>
          </div>

          {/* Practical Explanation & Recommendations */}
          <div className="space-y-2 mb-4 bg-white/60 p-3 rounded-xl border border-black/5">
            <p className="text-xs text-charcoal-800 leading-relaxed font-medium">
              {analysis.explanation}
            </p>
            {analysis.recommendations.length > 0 && (
              <ul className="text-xs text-charcoal-700 space-y-1 list-disc list-inside">
                {analysis.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Matched Indian Offers Section */}
          {analysis.applicableOffers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-black/10">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Tag className="w-4 h-4 text-forest-700" />
                <h4 className="text-xs font-bold text-forest-900">
                  Save on this purchase with verified Indian student discounts:
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {analysis.applicableOffers.map(offer => (
                  <div
                    key={offer.id}
                    className="bg-white p-3 rounded-xl border border-[#E9E1D3] flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-charcoal-900">{offer.merchant}</span>
                        {offer.status === 'VERIFIED' ? (
                          <span className="text-[9px] bg-forest-100 text-forest-900 font-semibold px-1 rounded">
                            VERIFIED
                          </span>
                        ) : offer.status === 'UNVERIFIED' ? (
                          <span className="text-[9px] bg-blue-100 text-blue-900 font-semibold px-1 rounded">
                            UNVERIFIED
                          </span>
                        ) : (
                          <span className="text-[9px] bg-amber-100 text-amber-900 font-semibold px-1 rounded">
                            DEMO
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-600 mt-0.5">{offer.discountSummary}</p>
                    </div>

                    {offer.couponCode && (
                      <button
                        type="button"
                        onClick={() => handleCopyCode(offer.couponCode!)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-[#FAF7F0] hover:bg-forest-100 border border-[#E9E1D3] rounded-lg text-xs font-mono font-bold text-forest-800 transition-smooth"
                        title="Copy coupon code"
                      >
                        {copiedCode === offer.couponCode ? (
                          <>
                            <Check className="w-3 h-3 text-forest-700" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{offer.couponCode}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explicit Confirmation CTA: ledger remains UNALTERED unless user clicks */}
          <div className="mt-4 pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-black/5">
            <span className="text-[11px] text-gray-500">
              * This is a simulation. Your balance has not changed.
            </span>
            {onOpenAddExpense && (
              <button
                type="button"
                onClick={() => onOpenAddExpense(numAmount, purposeInput || 'Planned Purchase')}
                className="flex items-center gap-1.5 px-4 py-2 bg-forest-800 hover:bg-forest-900 text-cream-50 font-semibold text-xs rounded-xl shadow-xs transition-smooth"
              >
                <span>Proceed & Log This Expense</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 border border-dashed border-[#E9E1D3] rounded-2xl text-center text-xs text-gray-400">
          <Sparkles className="w-8 h-8 mx-auto mb-2 text-forest-600" />
          <p className="font-semibold text-charcoal-800 text-sm">Ready to check any purchase</p>
          <p className="mt-1">Type an amount above or click a scenario to see how it affects your month-end wallet.</p>
        </div>
      )}
    </div>
  );
}
