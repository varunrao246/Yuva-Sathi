'use client';

import React from 'react';
import { X } from 'lucide-react';
import { SavingsGoal } from '@/types';

interface DepositGoalModalProps {
  goal: SavingsGoal | null;
  depositAmount: string;
  onDepositAmountChange: (amount: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const DepositGoalModal: React.FC<DepositGoalModalProps> = ({
  goal,
  depositAmount,
  onDepositAmountChange,
  onClose,
  onSubmit,
}) => {
  if (!goal) return null;

  return (
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
              <p className="text-[11px] text-gray-500">{goal.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-charcoal-800 p-1"
            aria-label="Close deposit dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
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
                onChange={(e) => onDepositAmountChange(e.target.value)}
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
                onClick={() => onDepositAmountChange(String(amt))}
                className="flex-1 py-1 text-xs font-semibold bg-[#FAF7F0] hover:bg-forest-100 border border-[#E9E1D3] rounded-lg text-forest-800"
              >
                +₹{amt}
              </button>
            ))}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
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
  );
};
