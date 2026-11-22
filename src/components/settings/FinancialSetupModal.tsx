'use client';

import React, { useState, useEffect } from 'react';
import { X, Sliders, Plus, Trash2, ShieldCheck, Check } from 'lucide-react';
import { IncomeConfig, Commitment, CreditCard, ExpenseCategory } from '@/types';
import { formatINR } from '@/lib/currency';
import { useToast } from '../ui/Toast';

interface FinancialSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  income: IncomeConfig;
  commitments: Commitment[];
  creditCards: CreditCard[];
  onUpdateIncome: (data: Partial<IncomeConfig>) => void;
  onAddCommitment: (c: Omit<Commitment, 'id'>) => void;
  onDeleteCommitment: (id: string) => void;
  onAddCreditCard: (c: Omit<CreditCard, 'id'>) => void;
  onDeleteCreditCard: (id: string) => void;
}

export function FinancialSetupModal({
  isOpen,
  onClose,
  income,
  commitments,
  creditCards,
  onUpdateIncome,
  onAddCommitment,
  onDeleteCommitment,
  onAddCreditCard,
  onDeleteCreditCard,
}: FinancialSetupModalProps) {
  const [pocketMoney, setPocketMoney] = useState(String(income.monthlyPocketMoney || 0));
  const [otherIncome, setOtherIncome] = useState(String(income.otherIncome || 0));
  const [allowanceDate, setAllowanceDate] = useState(String(income.allowanceReceivedDate || 1));
  const [monthlySavings, setMonthlySavings] = useState(String(income.monthlySavingsPlanned || 0));

  // Add commitment fields
  const [comName, setComName] = useState('');
  const [comAmount, setComAmount] = useState('');
  const [comDueDay, setComDueDay] = useState('5');
  const [comEssential, setComEssential] = useState(true);

  // Add card fields
  const [cardNickname, setCardNickname] = useState('');
  const [cardDue, setCardDue] = useState('');
  const [cardDueDay, setCardDueDay] = useState('25');

  const { showToast } = useToast();

  useEffect(() => {
    setPocketMoney(String(income.monthlyPocketMoney ?? 12000));
    setOtherIncome(String(income.otherIncome ?? 0));
    setAllowanceDate(String(income.allowanceReceivedDate ?? 1));
    setMonthlySavings(String(income.monthlySavingsPlanned ?? 0));
  }, [income, isOpen]);

  if (!isOpen) return null;

  const handleSaveIncome = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateIncome({
      monthlyPocketMoney: parseFloat(pocketMoney) || 0,
      otherIncome: parseFloat(otherIncome) || 0,
      allowanceReceivedDate: parseInt(allowanceDate, 10) || 1,
      monthlySavingsPlanned: parseFloat(monthlySavings) || 0,
    });
    showToast('Updated monthly inflow & savings settings', 'success');
  };

  const handleAddCommitment = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(comAmount);
    if (!comName.trim() || isNaN(amt) || amt <= 0) {
      showToast('Please enter a valid commitment name and amount', 'error');
      return;
    }

    onAddCommitment({
      name: comName.trim(),
      amount: amt,
      dueDay: parseInt(comDueDay, 10) || 1,
      recurrence: 'monthly',
      isEssential: comEssential,
      isPaid: false,
      category: 'Bills',
    });

    setComName('');
    setComAmount('');
    showToast(`Added commitment "${comName}"`, 'success');
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    const due = parseFloat(cardDue);
    if (!cardNickname.trim() || isNaN(due) || due <= 0) {
      showToast('Please enter a valid card nickname and due amount', 'error');
      return;
    }

    onAddCreditCard({
      nickname: cardNickname.trim(),
      upcomingDueAmount: due,
      outstandingBalance: due,
      dueDay: parseInt(cardDueDay, 10) || 20,
    });

    setCardNickname('');
    setCardDue('');
    showToast(`Added credit due for "${cardNickname}"`, 'success');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="setup-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#E9E1D3] max-h-[90vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#FAF7F0]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-forest-100 text-forest-800 flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 id="setup-modal-title" className="font-bold text-forest-900 text-base">
                Financial Setup & Rules
              </h3>
              <p className="text-[11px] text-gray-500">
                Configure pocket money, recurring commitments, and credit safety
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-charcoal-800 p-1 rounded-lg"
            aria-label="Close setup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Monthly Inflow Section */}
        <div className="p-4 bg-[#FAF7F0] rounded-2xl border border-[#E9E1D3] space-y-3">
          <h4 className="font-bold text-forest-900 text-sm">Monthly Pocket Money & Inflow</h4>
          <form onSubmit={handleSaveIncome} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label htmlFor="setup-pocket" className="block text-[11px] font-semibold text-charcoal-700 mb-1">
                Pocket Money (₹)
              </label>
              <input
                id="setup-pocket"
                type="number"
                value={pocketMoney}
                onChange={(e) => setPocketMoney(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-[#E9E1D3] rounded-lg text-xs font-bold"
              />
            </div>
            <div>
              <label htmlFor="setup-other" className="block text-[11px] font-semibold text-charcoal-700 mb-1">
                Other Inflow (₹)
              </label>
              <input
                id="setup-other"
                type="number"
                value={otherIncome}
                onChange={(e) => setOtherIncome(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-[#E9E1D3] rounded-lg text-xs font-bold"
              />
            </div>
            <div>
              <label htmlFor="setup-date" className="block text-[11px] font-semibold text-charcoal-700 mb-1">
                Arrival Day (1-31)
              </label>
              <input
                id="setup-date"
                type="number"
                min="1"
                max="31"
                value={allowanceDate}
                onChange={(e) => setAllowanceDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-[#E9E1D3] rounded-lg text-xs font-bold"
              />
            </div>
            <div>
              <label htmlFor="setup-savings" className="block text-[11px] font-semibold text-charcoal-700 mb-1">
                Planned Savings (₹)
              </label>
              <input
                id="setup-savings"
                type="number"
                min="0"
                value={monthlySavings}
                onChange={(e) => setMonthlySavings(e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-1.5 bg-white border border-[#E9E1D3] rounded-lg text-xs font-bold text-forest-800"
              />
            </div>
            <div className="flex items-end sm:col-span-4">
              <button
                type="submit"
                className="w-full py-2 bg-forest-700 hover:bg-forest-800 text-cream-50 font-semibold text-xs rounded-lg transition-smooth"
              >
                Save Inflow & Planned Savings
              </button>
            </div>
          </form>
        </div>

        {/* 2. Recurring Commitments Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-forest-900 text-sm">Recurring Monthly Commitments</h4>
            <span className="text-xs text-gray-500 font-medium">{commitments.length} active</span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {commitments.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">No recurring commitments added yet.</p>
            ) : (
              commitments.map(c => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2.5 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-xs"
                >
                  <div>
                    <span className="font-semibold text-charcoal-900">{c.name}</span>
                    <span className="text-[10px] text-gray-500 ml-2">Due Day {c.dueDay}</span>
                    {c.isEssential && (
                      <span className="ml-2 text-[9px] bg-red-100 text-red-800 font-semibold px-1 rounded">
                        Essential
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-forest-900">{formatINR(c.amount)}</span>
                    <button
                      type="button"
                      onClick={() => onDeleteCommitment(c.id)}
                      className="text-gray-400 hover:text-red-600 p-1"
                      aria-label={`Delete commitment ${c.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Commitment form */}
          <form onSubmit={handleAddCommitment} className="p-3 bg-forest-50/50 rounded-xl border border-forest-200 space-y-2">
            <span className="text-xs font-bold text-forest-900">+ Add Commitment</span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Name (e.g. WiFi Bill, Mess)"
                value={comName}
                onChange={(e) => setComName(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-[#E9E1D3] rounded-lg sm:col-span-2"
              />
              <input
                type="number"
                placeholder="Amount (₹)"
                value={comAmount}
                onChange={(e) => setComAmount(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-[#E9E1D3] rounded-lg"
              />
              <button
                type="submit"
                className="py-1.5 bg-forest-700 text-cream-50 font-semibold text-xs rounded-lg hover:bg-forest-800 transition-smooth"
              >
                Add
              </button>
            </div>
          </form>
        </div>

        {/* 3. Credit Cards Dues Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-forest-900 text-sm">Credit Cards & PayLater Dues</h4>
            <span className="text-xs text-gray-500 font-medium">{creditCards.length} cards</span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {creditCards.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">No credit card dues recorded.</p>
            ) : (
              creditCards.map(card => (
                <div
                  key={card.id}
                  className="flex items-center justify-between p-2.5 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-xs"
                >
                  <div>
                    <span className="font-semibold text-charcoal-900">{card.nickname}</span>
                    <span className="text-[10px] text-gray-500 ml-2">Due Day {card.dueDay}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-red-700">{formatINR(card.upcomingDueAmount)}</span>
                    <button
                      type="button"
                      onClick={() => onDeleteCreditCard(card.id)}
                      className="text-gray-400 hover:text-red-600 p-1"
                      aria-label={`Delete card ${card.nickname}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Card Form */}
          <form onSubmit={handleAddCard} className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2">
            <span className="text-xs font-bold text-amber-900">+ Add Card Due Buffer</span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Card (e.g. OneCard, Slice)"
                value={cardNickname}
                onChange={(e) => setCardNickname(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-[#E9E1D3] rounded-lg sm:col-span-2"
              />
              <input
                type="number"
                placeholder="Due Amount (₹)"
                value={cardDue}
                onChange={(e) => setCardDue(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-[#E9E1D3] rounded-lg"
              />
              <button
                type="submit"
                className="py-1.5 bg-amber-700 text-white font-semibold text-xs rounded-lg hover:bg-amber-800 transition-smooth"
              >
                Add Due
              </button>
            </div>
          </form>
        </div>

        {/* Done CTA */}
        <div className="pt-3 border-t border-[#FAF7F0] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-forest-700 hover:bg-forest-800 text-cream-50 font-bold text-xs rounded-xl shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
