'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Calendar,
  ArrowUpDown,
  Tag,
  Pencil
} from 'lucide-react';
import { Transaction, ExpenseCategory } from '@/types';
import { formatINR, formatIndianDate } from '@/lib/currency';
import { useToast } from '../ui/Toast';

interface TransactionManagerProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onOpenAddModal: () => void;
  onEditTransaction?: (tx: Transaction) => void;
  /** Optional legacy callback for callers providing direct transaction addition */
  onAddTransaction?: (tx: Omit<Transaction, 'id'>) => void;
  /** Optional legacy callback for callers providing direct transaction mutation */
  onUpdateTransaction?: (id: string, tx: Partial<Transaction>) => void;
}

const CATEGORIES: (ExpenseCategory | 'All')[] = [
  'All',
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

export function TransactionManager({
  transactions,
  onDeleteTransaction,
  onOpenAddModal,
  onEditTransaction,
}: TransactionManagerProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'All'>('All');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const { showToast } = useToast();

  const filtered = transactions.filter(t => {
    const matchesSearch =
      t.merchant.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase())) ||
      (t.location && t.location.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sortBy === 'amount-desc') return b.amount - a.amount;
    if (sortBy === 'amount-asc') return a.amount - b.amount;
    return 0;
  });

  const handleDelete = (id: string, merchant: string) => {
    onDeleteTransaction(id);
    showToast(`Deleted expense at ${merchant}`, 'info');
  };

  const totalFilteredSpent = filtered.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E9E1D3] shadow-xs space-y-6">
      {/* Top Header & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#FAF7F0]">
        <div>
          <h2 className="text-xl font-bold text-forest-900">
            Expense Management
          </h2>
          <p className="text-xs text-charcoal-700">
            Track, filter, edit, and organize every rupee of your college spending.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <span className="text-[11px] text-gray-400 font-medium">Filtered Total:</span>
            <p className="text-sm font-bold text-forest-900">{formatINR(totalFilteredSpent)}</p>
          </div>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-forest-700 hover:bg-forest-800 text-cream-50 font-semibold text-xs md:text-sm rounded-xl transition-smooth shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Expense</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <label htmlFor="tx-search-input" className="sr-only">Search transactions</label>
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="tx-search-input"
            type="text"
            placeholder="Search by merchant, canteen, Maggi, stationary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl text-xs md:text-sm focus:outline-none focus:border-forest-600 focus:bg-white text-charcoal-900"
          />
        </div>

        {/* Category Pills & Sort dropdown */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <label htmlFor="category-filter" className="sr-only">Filter by category</label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl px-3 py-2 text-xs font-medium text-charcoal-800 focus:outline-none focus:border-forest-600"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          <label htmlFor="sort-filter" className="sr-only">Sort transactions</label>
          <select
            id="sort-filter"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#FAF7F0] border border-[#E9E1D3] rounded-xl px-3 py-2 text-xs font-medium text-charcoal-800 focus:outline-none focus:border-forest-600"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Transaction Table / List */}
      {sorted.length === 0 ? (
        <div className="py-12 text-center text-gray-400 text-xs">
          <p className="text-sm font-semibold text-charcoal-700">No transactions match your search.</p>
          <p className="mt-1">Try clearing filters or search terms.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" aria-label="Transaction ledger">
            <thead>
              <tr className="border-b border-[#E9E1D3] text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th scope="col" className="py-2.5 px-3">Date</th>
                <th scope="col" className="py-2.5 px-3">Merchant / Item</th>
                <th scope="col" className="py-2.5 px-3">Category</th>
                <th scope="col" className="py-2.5 px-3">Method</th>
                <th scope="col" className="py-2.5 px-3 text-right">Amount</th>
                <th scope="col" className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF7F0] text-xs">
              {sorted.map(t => (
                <tr key={t.id} className="hover:bg-[#FAF7F0]/80 transition-smooth">
                  <td className="py-3 px-3 text-gray-600 whitespace-nowrap">
                    {formatIndianDate(t.date)}
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-semibold text-charcoal-900">{t.merchant}</p>
                    {t.description && (
                      <p className="text-[11px] text-gray-500 truncate max-w-xs">{t.description}</p>
                    )}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-forest-50 text-forest-800 border border-forest-200">
                      {t.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                    <span className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">
                      {t.paymentMethod || 'UPI'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-charcoal-900 whitespace-nowrap">
                    {formatINR(t.amount)}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {onEditTransaction && (
                        <button
                          onClick={() => onEditTransaction(t)}
                          className="p-1.5 text-gray-400 hover:text-forest-700 hover:bg-forest-50 rounded-lg transition-smooth"
                          title="Edit expense"
                          aria-label={`Edit expense at ${t.merchant}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(t.id, t.merchant)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-smooth"
                        title="Delete expense"
                        aria-label={`Delete expense at ${t.merchant}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
