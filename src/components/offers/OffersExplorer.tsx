'use client';

import React, { useState } from 'react';
import {
  Tag,
  Search,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Info,
  Clock
} from 'lucide-react';
import { INDIAN_OFFERS } from '@/lib/offers-data';
import { OfferItem, OfferVerificationStatus } from '@/types';
import { formatINR } from '@/lib/currency';
import { useToast } from '../ui/Toast';

export function OffersExplorer() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'ALL' | OfferVerificationStatus>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { showToast } = useToast();

  const categories = [
    'All',
    'Student Discounts',
    'Subscriptions',
    'Education',
    'Transport',
    'Groceries',
    'Food',
    'Entertainment',
    'Shopping',
    'Payment Offers',
  ];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Copied code "${code}"!`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const filtered = INDIAN_OFFERS.filter(offer => {
    const matchesSearch =
      offer.merchant.toLowerCase().includes(search.toLowerCase()) ||
      offer.title.toLowerCase().includes(search.toLowerCase()) ||
      offer.discountSummary.toLowerCase().includes(search.toLowerCase()) ||
      offer.eligibility.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || offer.category === selectedCategory;

    const matchesStatus =
      statusFilter === 'ALL' || offer.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: OfferVerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-forest-100 text-forest-900 border border-forest-300">
            <ShieldCheck className="w-3 h-3 text-forest-700" />
            VERIFIED
          </span>
        );
      case 'UNVERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
            <HelpCircle className="w-3 h-3 text-blue-700" />
            UNVERIFIED
          </span>
        );
      case 'DEMO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Info className="w-3 h-3 text-amber-700" />
            DEMO
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-900 border border-red-300">
            <Clock className="w-3 h-3 text-red-700" />
            EXPIRED
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E9E1D3] shadow-xs space-y-6">
      {/* Top Banner & Honest Transparency Notice */}
      <div className="border-b border-[#FAF7F0] pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-forest-700 text-lime-400 flex items-center justify-center font-bold">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-forest-900">
                Indian Student Discounts & Offers
              </h2>
              <p className="text-xs text-charcoal-700">
                Verified campus student programs and merchant deals. Real-time deal feeds are not connected.
              </p>
            </div>
          </div>

          {/* Verification Status Legend */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF7F0] border border-[#E9E1D3] rounded-full text-[11px] font-semibold text-charcoal-800">
            <span>Verified (4) • Unverified (3) • Demo (3)</span>
          </div>
        </div>

        {/* Audit Disclosure Note */}
        <div className="mt-3 p-3 bg-[#FAF7F0] rounded-xl border border-[#E9E1D3] text-[11px] text-charcoal-700 leading-relaxed space-y-1">
          <p>
            <strong className="text-forest-900">Status Definitions:</strong>
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
            <li className="bg-white p-1.5 rounded border border-[#E9E1D3]">
              <strong className="text-forest-800">VERIFIED:</strong> Direct active institutional student program (Spotify SheerID, Prime Youth, Apple UNiDAYS, MMT Student).
            </li>
            <li className="bg-white p-1.5 rounded border border-[#E9E1D3]">
              <strong className="text-blue-800">UNVERIFIED:</strong> Campaign exists, but daily quota or city pincode terms vary and cannot be verified without merchant API.
            </li>
            <li className="bg-white p-1.5 rounded border border-[#E9E1D3]">
              <strong className="text-amber-800">DEMO:</strong> Illustrative promotional templates. Not currently redeemable.
            </li>
          </ul>
        </div>
      </div>

      {/* Verification Filter Bar & Search */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <label htmlFor="offer-search-input" className="sr-only">Search deals</label>
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="offer-search-input"
              type="text"
              placeholder="Search by merchant (Spotify, Amazon, Apple, Swiggy, MakeMyTrip)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-xs md:text-sm text-charcoal-900 focus:outline-none focus:border-forest-600 focus:bg-white"
            />
          </div>

          {/* Verification Status Filter Tabs */}
          <div className="flex rounded-xl bg-[#FAF7F0] p-1 border border-[#E9E1D3]" role="tablist">
            {(['ALL', 'VERIFIED', 'UNVERIFIED', 'DEMO'] as const).map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-smooth ${
                  statusFilter === st
                    ? 'bg-white text-forest-900 shadow-2xs'
                    : 'text-charcoal-700 hover:text-forest-800'
                }`}
              >
                {st === 'ALL' ? 'All (10)' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1" role="tablist">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-smooth ${
                selectedCategory === cat
                  ? 'bg-forest-700 text-cream-50 shadow-2xs'
                  : 'bg-[#FAF7F0] text-charcoal-700 hover:bg-forest-50 hover:text-forest-800 border border-[#E9E1D3]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Offers Cards Grid */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-gray-400 text-xs">
          <p className="font-semibold text-charcoal-800">No deals match your search criteria.</p>
          <p className="mt-1">Try resetting the status filter or clearing search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(offer => (
            <div
              key={offer.id}
              className="p-4 rounded-2xl border border-[#E9E1D3] bg-[#FAF7F0]/40 hover:bg-white hover:border-forest-300 transition-smooth shadow-2xs flex flex-col justify-between"
            >
              <div>
                {/* Header: Merchant + Badges */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
                      {offer.category}
                    </span>
                    <h3 className="text-sm md:text-base font-bold text-charcoal-900 leading-snug">
                      {offer.merchant}
                    </h3>
                  </div>

                  {getStatusBadge(offer.status)}
                </div>

                {/* Title & Discount Highlight */}
                <div className="mb-3">
                  <p className="text-xs font-semibold text-charcoal-800">
                    {offer.title}
                  </p>
                  <div className="mt-1 inline-block bg-lime-100 border border-lime-300 text-forest-900 font-extrabold text-xs px-2.5 py-0.5 rounded-md">
                    {offer.discountSummary}
                  </div>
                </div>

                {/* Terms and conditions */}
                <div className="space-y-1 text-[11px] text-gray-600 mb-4 bg-white/80 p-2.5 rounded-xl border border-[#E9E1D3]">
                  <p>
                    <span className="font-semibold text-charcoal-800">Eligibility:</span>{' '}
                    {offer.eligibility}
                  </p>
                  <p>
                    <span className="font-semibold text-charcoal-800">Min. Order:</span>{' '}
                    {offer.minPurchase > 0 ? formatINR(offer.minPurchase) : 'None'} •{' '}
                    <span className="font-semibold text-charcoal-800">Payment:</span> {offer.paymentMethod}
                  </p>
                  <p>
                    <span className="font-semibold text-charcoal-800">Validity:</span> {offer.expiry}
                  </p>
                  {offer.termsNotes && (
                    <p className="text-[10px] text-gray-500 italic pt-0.5 border-t border-gray-100">
                      Note: {offer.termsNotes}
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom: Coupon Code + Direct Source Link */}
              <div className="pt-2 border-t border-[#E9E1D3] flex items-center justify-between gap-2">
                {offer.couponCode ? (
                  <button
                    type="button"
                    onClick={() => handleCopyCode(offer.couponCode!)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-forest-700 hover:bg-forest-800 text-cream-50 rounded-lg text-xs font-mono font-bold transition-smooth"
                    title="Copy coupon code"
                    aria-label={`Copy coupon code ${offer.couponCode}`}
                  >
                    {copiedCode === offer.couponCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-lime-300" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{offer.couponCode}</span>
                      </>
                    )}
                  </button>
                ) : (
                  <span className="text-[11px] text-gray-500 font-medium">
                    Direct Institutional Verification
                  </span>
                )}

                <a
                  href={offer.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-semibold text-forest-700 hover:text-forest-900 underline"
                  aria-label={`Visit official source for ${offer.merchant}`}
                >
                  <span>Visit Source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
