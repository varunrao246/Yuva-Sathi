'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { Transaction } from '@/types';
import { formatINR } from '@/lib/currency';

interface CategoryBreakdownChartProps {
  transactions: Transaction[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#1E5139', // deep forest
  Groceries: '#2D6A4F', // forest green
  Transport: '#3B82F6', // blue
  Bills: '#D97706', // amber
  Education: '#8B5CF6', // purple
  Entertainment: '#EC4899', // pink
  Shopping: '#F59E0B', // gold
  Health: '#10B981', // emerald
  Subscriptions: '#6366F1', // indigo
  Other: '#94A3B8', // slate
};

export function CategoryBreakdownChart({ transactions }: CategoryBreakdownChartProps) {
  // Aggregate totals
  const categoryMap: Record<string, number> = {};
  let total = 0;

  for (const t of transactions) {
    const amt = Number(t.amount || 0);
    categoryMap[t.category] = (categoryMap[t.category] || 0) + amt;
    total += amt;
  }

  const data = Object.entries(categoryMap)
    .map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E9E1D3] shadow-xs flex flex-col justify-between">
      <div className="mb-2">
        <h3 className="font-bold text-forest-900 text-sm md:text-base">
          Category Distribution
        </h3>
        <p className="text-xs text-gray-500">
          Where student pocket money flows
        </p>
      </div>

      {data.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-xs text-gray-400">
          No expenses recorded yet.
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Donut Chart */}
          <div className="w-44 h-44 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  formatter={(val: unknown) => [formatINR(Number(val || 0)), 'Spent']}
                  contentStyle={{
                    backgroundColor: '#0F2F20',
                    borderRadius: '8px',
                    color: '#FAF7F0',
                    border: 'none',
                    fontSize: '11px',
                  }}
                />
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[entry.name] || '#94A3B8'}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-gray-400 font-medium">Total Spent</span>
              <span className="text-xs font-bold text-forest-900">{formatINR(total)}</span>
            </div>
          </div>

          {/* Category List */}
          <div className="flex-1 w-full space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {data.slice(0, 5).map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[item.name] || '#94A3B8' }}
                  />
                  <span className="font-medium text-charcoal-800">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-forest-900">{formatINR(item.value)}</span>
                  <span className="text-[10px] text-gray-400 font-medium w-8 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
