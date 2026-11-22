'use client';

import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Check } from 'lucide-react';
import { ExpenseCategory, Transaction } from '@/types';
import { useToast } from '../ui/Toast';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onUpdateTransaction?: (id: string, tx: Partial<Transaction>) => void;
  editTransaction?: Transaction | null;
  initialData?: {
    amount?: number;
    merchant?: string;
    category?: ExpenseCategory;
  };
}

const CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Groceries',
  'Transport',
  'Shopping',
  'Education',
  'Entertainment',
  'Bills',
  'Health',
  'Subscriptions',
  'Other',
];

export function AddTransactionModal({
  isOpen,
  onClose,
  onAddTransaction,
  onUpdateTransaction,
  editTransaction,
  initialData,
}: AddTransactionModalProps) {
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Debit Card' | 'Credit Card' | 'Cash' | 'NetBanking'>('UPI');
  const { showToast } = useToast();

  useEffect(() => {
    if (editTransaction) {
      setAmount(String(editTransaction.amount));
      setMerchant(editTransaction.merchant);
      setCategory(editTransaction.category);
      setDate(editTransaction.date || new Date().toISOString().split('T')[0]);
      setDescription(editTransaction.description || '');
      setLocation(editTransaction.location || '');
      setPaymentMethod(editTransaction.paymentMethod || 'UPI');
    } else if (initialData) {
      if (initialData.amount) setAmount(String(initialData.amount));
      if (initialData.merchant) setMerchant(initialData.merchant);
      if (initialData.category) setCategory(initialData.category);
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setLocation('');
      setPaymentMethod('UPI');
    } else {
      setAmount('');
      setMerchant('');
      setCategory('Food');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setLocation('');
      setPaymentMethod('UPI');
    }
  }, [editTransaction, initialData, isOpen]);

  if (!isOpen) return null;

  const isEditing = !!editTransaction;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('Please enter a valid amount greater than ₹0', 'error');
      return;
    }
    if (!merchant.trim()) {
      showToast('Please specify the merchant or place', 'error');
      return;
    }

    if (isEditing && editTransaction && onUpdateTransaction) {
      onUpdateTransaction(editTransaction.id, {
        amount: numAmount,
        merchant: merchant.trim(),
        category,
        date,
        description: description.trim(),
        location: location.trim(),
        paymentMethod,
      });
      showToast(`Updated expense: ₹${numAmount} at ${merchant}`, 'success');
    } else {
      onAddTransaction({
        amount: numAmount,
        merchant: merchant.trim(),
        category,
        date,
        description: description.trim(),
        location: location.trim(),
        paymentMethod,
      });
      showToast(`Logged ₹${numAmount} at ${merchant}`, 'success');
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E9E1D3] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#FAF7F0] mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-forest-100 text-forest-800 flex items-center justify-center font-bold">
              ₹
            </div>
            <div>
              <h3 id="transaction-modal-title" className="font-bold text-forest-900 text-base">
                {isEditing ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              <p className="text-[11px] text-gray-500">
                {isEditing ? 'Modify your expense record' : 'Fast UPI & campus transaction log'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-charcoal-800 p-1 rounded-lg"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount input */}
          <div>
            <label htmlFor="tx-amount" className="block text-xs font-semibold text-charcoal-800 mb-1">
              Amount (₹ INR) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-forest-800 text-base pointer-events-none">
                ₹
              </span>
              <input
                id="tx-amount"
                type="number"
                step="any"
                min="1"
                placeholder="250"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
                className="w-full pl-8 pr-4 py-2.5 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-base font-bold text-charcoal-900 focus:outline-none focus:border-forest-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Merchant / Place */}
          <div>
            <label htmlFor="tx-merchant" className="block text-xs font-semibold text-charcoal-800 mb-1">
              Merchant / Where did you spend? *
            </label>
            <input
              id="tx-merchant"
              type="text"
              placeholder="e.g. Swiggy Instamart, Campus Canteen, Metro"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              required
              className="w-full px-3.5 py-2 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-xs md:text-sm text-charcoal-900 focus:outline-none focus:border-forest-600 focus:bg-white"
            />
          </div>

          {/* Category & Payment Method Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="tx-category" className="block text-xs font-semibold text-charcoal-800 mb-1">
                Category
              </label>
              <select
                id="tx-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-xs font-medium text-charcoal-900 focus:outline-none focus:border-forest-600"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tx-payment" className="block text-xs font-semibold text-charcoal-800 mb-1">
                Payment Mode
              </label>
              <select
                id="tx-payment"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-xs font-medium text-charcoal-900 focus:outline-none focus:border-forest-600"
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Cash">Cash</option>
                <option value="NetBanking">Net Banking</option>
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="tx-date" className="block text-xs font-semibold text-charcoal-800 mb-1">
              Date
            </label>
            <input
              id="tx-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-xs text-charcoal-900 focus:outline-none focus:border-forest-600"
            />
          </div>

          {/* Optional description */}
          <div>
            <label htmlFor="tx-desc" className="block text-xs font-semibold text-charcoal-800 mb-1">
              Notes / Description (Optional)
            </label>
            <input
              id="tx-desc"
              type="text"
              placeholder="e.g. Split with Ananya, Lab practical stationery"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-xs text-charcoal-900 focus:outline-none focus:border-forest-600"
            />
          </div>

          {/* Submit CTA */}
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
              className="flex items-center gap-1.5 px-5 py-2.2 bg-forest-700 hover:bg-forest-800 text-cream-50 font-semibold text-xs md:text-sm rounded-xl transition-smooth shadow-sm"
            >
              {isEditing ? <Check className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
              <span>{isEditing ? 'Save Changes' : 'Save Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
