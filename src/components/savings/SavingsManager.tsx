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
import { CreateGoalModal } from './CreateGoalModal';
import { DepositGoalModal } from './DepositGoalModal';

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
  const { showToast } = useToast();

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
      <DepositGoalModal
        goal={depositGoal}
        depositAmount={depositAmount}
        onDepositAmountChange={setDepositAmount}
        onClose={() => setDepositGoal(null)}
        onSubmit={handleConfirmDeposit}
      />

      {/* Modal for Creating Goal */}
      <CreateGoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddGoal={onAddGoal}
      />
    </div>
  );
}
