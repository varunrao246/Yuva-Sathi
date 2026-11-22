'use client';

import React, { useState, useEffect } from 'react';
import { X, Sliders, Plus, Trash2, ShieldCheck, Check, Pencil, AlertCircle } from 'lucide-react';
import { IncomeConfig, Commitment, CreditCard, ExpenseCategory, RecurrenceType } from '@/types';
import { formatINR } from '@/lib/currency';
import { formatCommitmentDueDate, isCommitmentOverdue, validateCommitmentInput, extractDueDayFromDate } from '@/lib/commitments';
import { useToast } from '../ui/Toast';

interface FinancialSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  income: IncomeConfig;
  commitments: Commitment[];
  creditCards: CreditCard[];
  onUpdateIncome: (data: Partial<IncomeConfig>) => void;
  onAddCommitment: (c: Omit<Commitment, 'id'>) => void;
  onUpdateCommitment?: (id: string, c: Partial<Commitment>) => void;
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
  onUpdateCommitment,
  onDeleteCommitment,
  onAddCreditCard,
  onDeleteCreditCard,
}: FinancialSetupModalProps) {
  const [pocketMoney, setPocketMoney] = useState(String(income.monthlyPocketMoney || 0));
  const [otherIncome, setOtherIncome] = useState(String(income.otherIncome || 0));
  const [allowanceDate, setAllowanceDate] = useState(String(income.allowanceReceivedDate || 1));
  const [monthlySavings, setMonthlySavings] = useState(String(income.monthlySavingsPlanned || 0));

  // Commitment fields
  const [comName, setComName] = useState('');
  const [comAmount, setComAmount] = useState('');
  const [comDueDate, setComDueDate] = useState('');
  const [comCategory, setComCategory] = useState<ExpenseCategory>('Bills');
  const [comEssential, setComEssential] = useState(true);
  const [comRecurrence, setComRecurrence] = useState<RecurrenceType>('monthly');
  const [editingCommitmentId, setEditingCommitmentId] = useState<string | null>(null);

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

  const handleStartEditCommitment = (c: Commitment) => {
    setEditingCommitmentId(c.id);
    setComName(c.name);
    setComAmount(String(c.amount));
    setComCategory(c.category);
    setComDueDate(c.dueDate || '');
    setComEssential(c.isEssential);
    setComRecurrence(c.recurrence || 'monthly');
  };

  const handleCancelEditCommitment = () => {
    setEditingCommitmentId(null);
    setComName('');
    setComAmount('');
    setComDueDate('');
    setComCategory('Bills');
    setComEssential(true);
    setComRecurrence('monthly');
  };

  const handleSaveCommitment = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateCommitmentInput({
      name: comName,
      amount: comAmount,
      dueDate: comDueDate,
    });

    if (!validation.isValid) {
      showToast(validation.error || 'Please enter valid commitment details', 'error');
      return;
    }

    const amt = parseFloat(comAmount);
    const dueDay = extractDueDayFromDate(comDueDate);

    if (editingCommitmentId && onUpdateCommitment) {
      onUpdateCommitment(editingCommitmentId, {
        name: comName.trim(),
        amount: amt,
        dueDate: comDueDate,
        dueDay,
        category: comCategory,
        isEssential: comEssential,
        recurrence: comRecurrence,
      });
      showToast(`Updated commitment "${comName}"`, 'success');
      handleCancelEditCommitment();
    } else {
      onAddCommitment({
        name: comName.trim(),
        amount: amt,
        dueDate: comDueDate,
        dueDay,
        recurrence: comRecurrence,
        isEssential: comEssential,
        isPaid: false,
        category: comCategory,
      });
      showToast(`Added commitment "${comName}"`, 'success');
      setComName('');
      setComAmount('');
      setComDueDate('');
    }
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
              commitments.map(c => {
                const overdue = isCommitmentOverdue(c);
                return (
                  <div
                    key={c.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-smooth ${
                      c.id === editingCommitmentId
                        ? 'bg-forest-50 border-forest-400 ring-1 ring-forest-400'
                        : overdue
                        ? 'bg-red-50/50 border-red-200'
                        : 'bg-[#FAF7F0] border-[#E9E1D3]'
                    }`}
                  >
                    <div className="flex-1 min-w-0 mr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-charcoal-900 truncate">{c.name}</span>
                        {c.isEssential && (
                          <span className="text-[9px] bg-red-100 text-red-800 font-semibold px-1 rounded">
                            Essential
                          </span>
                        )}
                        {overdue && (
                          <span className="text-[9px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded inline-flex items-center gap-0.5">
                            <AlertCircle className="w-2.5 h-2.5" /> Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Due: <span className="font-medium text-charcoal-700">{formatCommitmentDueDate(c.dueDate, c.dueDay)}</span>
                        {c.category && ` • ${c.category}`}
                        {c.recurrence && c.recurrence !== 'monthly' && ` • ${c.recurrence}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-forest-900">{formatINR(c.amount)}</span>
                      {onUpdateCommitment && (
                        <button
                          type="button"
                          onClick={() => handleStartEditCommitment(c)}
                          className="text-gray-400 hover:text-forest-700 p-1 transition-smooth"
                          title={`Edit ${c.name}`}
                          aria-label={`Edit ${c.name}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDeleteCommitment(c.id)}
                        className="text-gray-400 hover:text-red-600 p-1 transition-smooth"
                        aria-label={`Delete commitment ${c.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Add / Edit Commitment form */}
          <form onSubmit={handleSaveCommitment} className="p-3 bg-forest-50/50 rounded-xl border border-forest-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-forest-900">
                {editingCommitmentId ? '✏️ Edit Commitment' : '+ Add Commitment'}
              </span>
              {editingCommitmentId && (
                <button
                  type="button"
                  onClick={handleCancelEditCommitment}
                  className="text-[11px] text-gray-500 hover:text-gray-700 underline"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-charcoal-700 mb-0.5">
                  Commitment Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hostel Fees, Mobile Recharge, Gym"
                  value={comName}
                  onChange={(e) => setComName(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E9E1D3] rounded-lg focus:outline-none focus:border-forest-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-charcoal-700 mb-0.5">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="Amount (₹)"
                  value={comAmount}
                  onChange={(e) => setComAmount(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E9E1D3] rounded-lg focus:outline-none focus:border-forest-600 font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-charcoal-700 mb-0.5">
                  Due Date (Manually Selectable) *
                </label>
                <input
                  type="date"
                  value={comDueDate}
                  onChange={(e) => setComDueDate(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E9E1D3] rounded-lg focus:outline-none focus:border-forest-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-charcoal-700 mb-0.5">
                  Category
                </label>
                <select
                  value={comCategory}
                  onChange={(e) => setComCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E9E1D3] rounded-lg focus:outline-none focus:border-forest-600"
                >
                  <option value="Bills">Bills & Utilities</option>
                  <option value="Academics">Academics & Tuition</option>
                  <option value="Food">Food & Mess</option>
                  <option value="Subscriptions">Subscriptions</option>
                  <option value="Health">Health & Fitness</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-forest-100">
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer text-charcoal-800">
                  <input
                    type="checkbox"
                    checked={comEssential}
                    onChange={(e) => setComEssential(e.target.checked)}
                    className="rounded text-forest-700 focus:ring-forest-500"
                  />
                  <span className="text-[11px] font-medium">Essential expense</span>
                </label>

                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-gray-500 font-medium">Repeat:</span>
                  <select
                    value={comRecurrence}
                    onChange={(e) => setComRecurrence(e.target.value as RecurrenceType)}
                    className="text-[11px] bg-white border border-[#E9E1D3] rounded px-1.5 py-0.5"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="daily">Daily</option>
                    <option value="one-time">One-time</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {editingCommitmentId && (
                  <button
                    type="button"
                    onClick={handleCancelEditCommitment}
                    className="py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-charcoal-700 font-semibold text-xs rounded-lg transition-smooth"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="py-1.5 px-4 bg-forest-700 text-cream-50 font-semibold text-xs rounded-lg hover:bg-forest-800 transition-smooth shadow-xs"
                >
                  {editingCommitmentId ? 'Update Commitment' : 'Add Commitment'}
                </button>
              </div>
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
