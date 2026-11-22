'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { SavingsGoal } from '@/types';
import { useToast } from '../ui/Toast';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
}

export const CreateGoalModal: React.FC<CreateGoalModalProps> = ({
  isOpen,
  onClose,
  onAddGoal,
}) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentSavings, setCurrentSavings] = useState('');
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [category, setCategory] = useState('Tech Gadget');
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
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
    onClose();
  };

  return (
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
            onClick={onClose}
            className="text-gray-400 hover:text-charcoal-800 p-1"
            aria-label="Close goal dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              onClick={onClose}
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
  );
};
