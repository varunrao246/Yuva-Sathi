'use client';

import React, { useState } from 'react';
import {
  PiggyBank,
  Plus,
  Trash2,
  CheckCircle,
  Target,
  Calendar,
  Sparkles,
  X,
  Coins
} from 'lucide-react';
import { SavingsGoal, FinancialCalculationResult } from '@/types';
import { formatINR, formatIndianDate } from '@/lib/currency';
import { useToast } from '../ui/Toast';

interface SavingsManagerProps {
  savingsGoals: SavingsGoal[];
  financials: FinancialCalculationResult;
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  onUpdateGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  onDeleteGoal: (id: string) => void;
}

export function SavingsManager({
  savingsGoals,
  financials,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
}: SavingsManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [depositGoal, setDepositGoal] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('500');

  // Form fields
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentSavings, setCurrentSavings] = useState('');
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [category, setCategory] = useState('Tech Gadget');
  const { showToast } = useToast();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const saved = parseFloat(currentSavings) || 0;

    if (isNaN(target) || target <= 0) {
      showToast('Please enter a valid target amount', 'error');
      return;
    }
    if (!name.trim()) {
      showToast('Please enter a goal name', 'error');
      return;
    }

    onAddGoal({
      name: name.trim(),
      targetAmount: target,
      currentSavings: Math.max(0, saved),
      targetDate: targetDate || '2026-12-31',
      category,
      isCompleted: saved >= target,
    });

    showToast(`Created savings goal "${name}"!`, 'success');
    setName('');
    setTargetAmount('');
    setCurrentSavings('');
    setIsModalOpen(false);
  };

  const handleConfirmDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoal) return;
    const num = parseFloat(depositAmount);
    if (isNaN(num) || num <= 0) {
      showToast('Please enter a valid deposit amount', 'error');
      return;
    }

    const updatedSavings = depositGoal.currentSavings + num;
    const isCompleted = updatedSavings >= depositGoal.targetAmount;
    onUpdateGoal(depositGoal.id, { currentSavings: updatedSavings, isCompleted });

    if (isCompleted) {
      showToast(`🎉 Goal reached! You accomplished "${depositGoal.name}"!`, 'success');
    } else {
      showToast(`Deposited ${formatINR(num)} into "${depositGoal.name}"!`, 'success');
    }
    setDepositGoal(null);
    setDepositAmount('500');
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E9E1D3] shadow-xs space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#FAF7F0]">
        <div>
          <h2 className="text-xl font-bold text-forest-900">
            Student Savings Goals
          </h2>
          <p className="text-xs text-charcoal-700">
            Save for laptops, semester trips, certifications, and emergency cushions without stress.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-forest-700 hover:bg-forest-800 text-cream-50 font-semibold text-xs md:text-sm rounded-xl transition-smooth shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Aggregate Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-[#FAF7F0] rounded-xl border border-[#E9E1D3]">
        <div>
          <span className="text-[11px] text-gray-500 font-medium">Total Saved in Goals</span>
          <p className="text-xl font-bold text-forest-900">
            {formatINR(financials.totalSavedInGoals)}
          </p>
        </div>

        <div>
          <span className="text-[11px] text-gray-500 font-medium">Target Goals Total</span>
          <p className="text-xl font-bold text-charcoal-900">
            {formatINR(financials.targetSavingsTotal)}
          </p>
        </div>

        <div>
          <span className="text-[11px] text-gray-500 font-medium">Overall Progress</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 bg-gray-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-forest-700 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${
                    financials.targetSavingsTotal > 0
                      ? Math.min(100, Math.round((financials.totalSavedInGoals / financials.targetSavingsTotal) * 100))
                      : 0
                  }%`,
                }}
              />
            </div>
            <span className="text-xs font-bold text-forest-900">
              {financials.targetSavingsTotal > 0
                ? Math.round((financials.totalSavedInGoals / financials.targetSavingsTotal) * 100)
                : 0}
              %
            </span>
          </div>
        </div>
      </div>

      {/* Goals Cards Grid */}
      {savingsGoals.length === 0 ? (
        <div className="py-12 text-center text-gray-400 text-xs">
          <PiggyBank className="w-10 h-10 mx-auto mb-2 text-forest-600" />
          <p className="font-semibold text-charcoal-800">No active savings goals yet.</p>
          <p className="mt-1">Create your first goal to set aside money for trips, headphones, or emergency reserves.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savingsGoals.map(goal => {
            const pct = Math.min(100, Math.round((goal.currentSavings / goal.targetAmount) * 100));
            const remaining = Math.max(0, goal.targetAmount - goal.currentSavings);

            return (
              <div
                key={goal.id}
                className="p-4 rounded-2xl border border-[#E9E1D3] bg-[#FAF7F0]/40 flex flex-col justify-between hover:border-forest-300 transition-smooth"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
                        {goal.category}
                      </span>
                      <h3 className="font-bold text-charcoal-900 text-sm">
                        {goal.name}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteGoal(goal.id)}
                      className="text-gray-400 hover:text-red-600 p-1 rounded"
                      title="Delete goal"
                      aria-label={`Delete ${goal.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Amounts */}
                  <div className="flex items-baseline justify-between mt-3 mb-1">
                    <span className="text-xs text-gray-500 font-medium">Saved:</span>
                    <span className="text-sm font-bold text-forest-900">
                      {formatINR(goal.currentSavings)} / {formatINR(goal.targetAmount)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        pct >= 100 ? 'bg-forest-600' : 'bg-lime-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 mb-4">
                    <span>{pct}% reached</span>
                    <span className="font-semibold text-charcoal-800">
                      {remaining === 0 ? 'Goal Achieved!' : `${formatINR(remaining)} to go`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 bg-white p-2 rounded-lg border border-[#E9E1D3] mb-3">
                    <Calendar className="w-3.5 h-3.5 text-forest-700" />
                    <span>Target Date: {formatIndianDate(goal.targetDate)}</span>
                  </div>
                </div>

                {/* Add Deposit Button */}
                <button
                  type="button"
                  onClick={() => setDepositGoal(goal)}
                  className="w-full py-2 bg-white hover:bg-forest-50 border border-[#E9E1D3] hover:border-forest-300 text-forest-800 font-bold text-xs rounded-xl transition-smooth shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <Coins className="w-3.5 h-3.5 text-forest-700" />
                  <span>Deposit Savings (₹)</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Deposit Modal */}
      {depositGoal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#E9E1D3]">
            <div className="flex items-center justify-between pb-3 border-b border-[#FAF7F0] mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-forest-100 text-forest-800 flex items-center justify-center font-bold">
                  ₹
                </div>
                <div>
                  <h3 className="font-bold text-forest-900 text-sm">Add Savings Deposit</h3>
                  <p className="text-[11px] text-gray-500">{depositGoal.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDepositGoal(null)}
                className="text-gray-400 hover:text-charcoal-800 p-1"
                aria-label="Close deposit dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmDeposit} className="space-y-4">
              <div>
                <label htmlFor="deposit-input" className="block text-xs font-semibold text-charcoal-800 mb-1">
                  Deposit Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-forest-800">₹</span>
                  <input
                    id="deposit-input"
                    type="number"
                    min="1"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    autoFocus
                    required
                    className="w-full pl-8 pr-4 py-2 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-base font-bold text-charcoal-900 focus:outline-none focus:border-forest-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Quick Pills */}
              <div className="flex gap-2">
                {[200, 500, 1000, 2000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(String(amt))}
                    className="flex-1 py-1 text-xs font-semibold bg-[#FAF7F0] hover:bg-forest-100 border border-[#E9E1D3] rounded-lg text-forest-800"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDepositGoal(null)}
                  className="px-4 py-2 text-xs font-medium text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-forest-700 hover:bg-forest-800 text-cream-50 font-bold text-xs rounded-xl shadow-xs"
                >
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Creating Goal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E9E1D3]">
            <div className="flex items-center justify-between pb-2 border-b border-[#FAF7F0] mb-3">
              <div>
                <h3 className="font-bold text-forest-900 text-base">New Savings Goal</h3>
                <p className="text-xs text-gray-500">Set a target to keep your student dreams on track.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-charcoal-800 p-1"
                aria-label="Close goal dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label htmlFor="goal-name" className="block text-xs font-semibold text-charcoal-800 mb-1">
                  Goal Name *
                </label>
                <input
                  id="goal-name"
                  type="text"
                  placeholder="e.g. Goa Semester Trip, Sony Headphones, Exam Fees"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-xs md:text-sm text-charcoal-900 focus:outline-none focus:border-forest-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="goal-target" className="block text-xs font-semibold text-charcoal-800 mb-1">
                    Target Amount (₹) *
                  </label>
                  <input
                    id="goal-target"
                    type="number"
                    min="1"
                    placeholder="8000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-xs md:text-sm text-charcoal-900 focus:outline-none focus:border-forest-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="goal-saved" className="block text-xs font-semibold text-charcoal-800 mb-1">
                    Initial Saved (₹)
                  </label>
                  <input
                    id="goal-saved"
                    type="number"
                    min="0"
                    placeholder="1000"
                    value={currentSavings}
                    onChange={(e) => setCurrentSavings(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-xs md:text-sm text-charcoal-900 focus:outline-none focus:border-forest-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="goal-category" className="block text-xs font-semibold text-charcoal-800 mb-1">
                    Category
                  </label>
                  <select
                    id="goal-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-xs font-medium text-charcoal-900 focus:outline-none focus:border-forest-600"
                  >
                    <option value="Tech Gadget">Tech Gadget</option>
                    <option value="Travel">Travel</option>
                    <option value="Emergency">Emergency Cushion</option>
                    <option value="Education">Course / Certification</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="goal-date" className="block text-xs font-semibold text-charcoal-800 mb-1">
                    Target Date
                  </label>
                  <input
                    id="goal-date"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-xs text-charcoal-900 focus:outline-none focus:border-forest-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-500 hover:text-charcoal-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-forest-700 hover:bg-forest-800 text-cream-50 font-semibold text-xs rounded-xl shadow-xs"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
