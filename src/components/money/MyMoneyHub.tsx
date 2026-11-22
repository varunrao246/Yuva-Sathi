'use client';

import React, { useState } from 'react';
import {
  Receipt,
  Sparkles,
  CalendarClock,
  Tag,
  CreditCard as CreditCardIcon,
  PlusCircle,
  Sliders
} from 'lucide-react';
import {
  FinancialCalculationResult,
  Transaction,
  Commitment,
  CreditCard,
  ExpenseCategory
} from '@/types';
import { TransactionManager } from '@/components/transactions/TransactionManager';
import { BeforeYouBuyChecker } from '@/components/purchase/BeforeYouBuyChecker';
import { CommitmentsTimeline } from '@/components/dashboard/CommitmentsTimeline';
import { OffersExplorer } from '@/components/offers/OffersExplorer';

export type MoneySubTab = 'expenses' | 'purchase-check' | 'commitments' | 'offers';

interface MyMoneyHubProps {
  initialSubTab?: MoneySubTab;
  financials: FinancialCalculationResult;
  transactions: Transaction[];
  commitments: Commitment[];
  creditCards: CreditCard[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onUpdateTransaction: (id: string, tx: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenAddExpense: (amount?: number, merchant?: string, category?: ExpenseCategory) => void;
  onEditTransaction: (tx: Transaction) => void;
  onToggleCommitmentPaid: (id: string) => void;
  onDeleteCommitment?: (id: string) => void;
  onOpenFinancialSetup: () => void;
}

export const MyMoneyHub: React.FC<MyMoneyHubProps> = ({
  initialSubTab = 'expenses',
  financials,
  transactions,
  commitments,
  creditCards,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onOpenAddExpense,
  onEditTransaction,
  onToggleCommitmentPaid,
  onDeleteCommitment,
  onOpenFinancialSetup,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<MoneySubTab>(initialSubTab);

  const subTabs = [
    {
      id: 'expenses' as MoneySubTab,
      label: 'Expenses & Ledger',
      icon: Receipt,
      count: transactions.length,
    },
    {
      id: 'purchase-check' as MoneySubTab,
      label: 'Before-You-Buy',
      icon: Sparkles,
      count: null,
    },
    {
      id: 'commitments' as MoneySubTab,
      label: 'Bills & Commitments',
      icon: CalendarClock,
      count: commitments.filter(c => !c.isPaid).length,
    },
    {
      id: 'offers' as MoneySubTab,
      label: 'Student Deals & Coupons',
      icon: Tag,
      count: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-navigation bar */}
      <div className="bg-white border border-[#E5DEC9] rounded-xl p-2.5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {subTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#143E2B] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-[#FAF7F0]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenFinancialSetup}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5DEC9] bg-[#FAF7F0] hover:bg-white text-xs font-medium text-slate-700 transition-colors"
              title="Configure Pocket Money & Fixed Commitments"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>Budget Setup</span>
            </button>

            <button
              onClick={() => onOpenAddExpense()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#143E2B] hover:bg-[#1B4D36] text-white text-xs font-semibold transition-colors shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render active subtab content */}
      <div>
        {activeSubTab === 'expenses' && (
          <TransactionManager
            transactions={transactions}
            onAddTransaction={onAddTransaction}
            onUpdateTransaction={onUpdateTransaction}
            onDeleteTransaction={onDeleteTransaction}
            onOpenAddModal={() => onOpenAddExpense()}
            onEditTransaction={onEditTransaction}
          />
        )}

        {activeSubTab === 'purchase-check' && (
          <BeforeYouBuyChecker
            financials={financials}
            onOpenAddExpense={(amount, merchant) => onOpenAddExpense(amount, merchant, 'Shopping')}
          />
        )}

        {activeSubTab === 'commitments' && (
          <div className="space-y-4">
            <CommitmentsTimeline
              commitments={commitments}
              onTogglePaid={onToggleCommitmentPaid}
              onOpenSettings={onOpenFinancialSetup}
            />
          </div>
        )}

        {activeSubTab === 'offers' && <OffersExplorer />}
      </div>
    </div>
  );
};
