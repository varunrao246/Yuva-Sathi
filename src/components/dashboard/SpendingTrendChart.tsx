'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { Transaction, FinancialCalculationResult } from '@/types';
import { formatINR } from '@/lib/currency';

interface SpendingTrendChartProps {
  transactions: Transaction[];
  financials: FinancialCalculationResult;
}

export function SpendingTrendChart({ transactions, financials }: SpendingTrendChartProps) {
  // Aggregate transactions by day of current month
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const daysInMonth = financials.daysInMonth;
  const currentDay = financials.currentDayOfMonth;

  // Build daily cumulative curve
  const data: { day: string; actual: number | null; idealBudget: number }[] = [];
  const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  const dayTotals: Record<number, number> = {};
  for (const t of transactions) {
    if (t.date && t.date.startsWith(currentMonthPrefix)) {
      const d = parseInt(t.date.split('-')[2], 10);
      dayTotals[d] = (dayTotals[d] || 0) + Number(t.amount || 0);
    }
  }

  let cumulativeActual = 0;
  const dailyIdealStep = financials.totalMonthlyIncome > 0 ? financials.totalMonthlyIncome / daysInMonth : 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const isPastOrToday = d <= currentDay;
    if (isPastOrToday) {
      cumulativeActual += dayTotals[d] || 0;
    }

    data.push({
      day: `${d}`,
      actual: isPastOrToday ? cumulativeActual : null,
      idealBudget: Math.round(dailyIdealStep * d),
    });
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E9E1D3] shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-forest-900 text-sm md:text-base">
            Monthly Spending Trajectory
          </h3>
          <p className="text-xs text-gray-500">
            Cumulative spend (₹) vs baseline month budget
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-forest-600"></span>
            <span className="text-gray-600">Actual Spend</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-gray-300"></span>
            <span className="text-gray-400">Budget Baseline</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        {transactions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs">
            <p>No transactions recorded yet this month.</p>
            <p className="mt-1">Add your first expense to see your trajectory.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4EFE6" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={{ stroke: '#E9E1D3' }}
                tick={{ fontSize: 10, fill: '#64748B' }}
                interval={4}
              />
              <YAxis
                tickLine={false}
                axisLine={{ stroke: '#E9E1D3' }}
                tick={{ fontSize: 10, fill: '#64748B' }}
                tickFormatter={(val) => `₹${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
              />
              <Tooltip
                formatter={(value: unknown, name?: unknown) => [
                  formatINR(Number(value || 0)),
                  String(name) === 'actual' ? 'Actual Spend' : 'Target Budget',
                ]}
                labelFormatter={(label) => `Day ${label} of Month`}
                contentStyle={{
                  backgroundColor: '#0F2F20',
                  borderRadius: '10px',
                  color: '#FAF7F0',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="idealBudget"
                stroke="#CBD5E1"
                strokeDasharray="4 4"
                fill="none"
                strokeWidth={1.5}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#1E5139"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorSpend)"
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
