'use client';

import React from 'react';
import { ArrowUpRight, Receipt, Trash2 } from 'lucide-react';
import { Transaction } from '@/types';
import { formatINR, formatIndianDate } from '@/lib/currency';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onViewAll: () => void;
  onDeleteTransaction: (id: string) => void;
  onOpenAddExpense: () => void;
}

export function RecentTransactions({
  transactions,
  onViewAll,
  onDeleteTransaction,
  onOpenAddExpense,
}: RecentTransactionsProps) {
  const recent = transactions.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E9E1D3] shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-forest-900 text-sm md:text-base">
            Recent Expenses
          </h3>
          <p className="text-xs text-gray-500">
            Latest UPI and merchant transactions
          </p>
        </div>

        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-forest-700 hover:text-forest-900 flex items-center gap-1"
        >
          <span>View All ({transactions.length})</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {recent.length === 0 ? (
        <div className="py-8 text-center text-gray-400 text-xs">
          <Receipt className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p>No recent expenses logged.</p>
          <button
            onClick={onOpenAddExpense}
            className="mt-2 text-forest-700 font-semibold underline"
          >
            Add first expense
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {recent.map(t => (
            <div
              key={t.id}
              className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF7F0] transition-smooth border border-transparent hover:border-[#E9E1D3]"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-800 text-xs font-bold">
                  {t.category ? t.category.slice(0, 2).toUpperCase() : 'EX'}
                </div>

                <div>
                  <p className="text-xs font-semibold text-charcoal-900 leading-tight">
                    {t.merchant}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-0.5">
                    <span className="font-medium text-forest-700">{t.category}</span>
                    <span>•</span>
                    <span>{formatIndianDate(t.date)}</span>
                    {t.paymentMethod && (
                      <>
                        <span>•</span>
                        <span className="bg-gray-100 px-1 py-0.2 rounded text-gray-600 font-mono">
                          {t.paymentMethod}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-charcoal-900">
                  {formatINR(t.amount)}
                </span>
                <button
                  onClick={() => onDeleteTransaction(t.id)}
                  className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-gray-400 hover:text-red-600 p-1 rounded transition-smooth"
                  title="Delete transaction"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
