'use client';

import React from 'react';
import { Calendar, CheckCircle, Circle, AlertCircle, Plus } from 'lucide-react';
import { Commitment } from '@/types';
import { formatINR } from '@/lib/currency';

interface CommitmentsTimelineProps {
  commitments: Commitment[];
  onTogglePaid: (id: string) => void;
  onOpenSettings: () => void;
}

export function CommitmentsTimeline({
  commitments,
  onTogglePaid,
  onOpenSettings
}: CommitmentsTimelineProps) {
  const sorted = [...commitments].sort((a, b) => a.dueDay - b.dueDay);

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E9E1D3] shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-forest-900 text-sm md:text-base">
            Recurring Commitments
          </h3>
          <p className="text-xs text-gray-500">
            Rent, hostel mess, mobile plans, and subscriptions
          </p>
        </div>

        <button
          onClick={onOpenSettings}
          className="text-xs font-semibold text-forest-700 hover:text-forest-900 flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Manage</span>
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="py-8 text-center text-gray-400 text-xs">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p>No monthly commitments configured.</p>
          <button
            onClick={onOpenSettings}
            className="mt-2 text-forest-700 font-semibold underline"
          >
            Add commitments
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sorted.map(c => (
            <div
              key={c.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-smooth ${
                c.isPaid
                  ? 'bg-gray-50 border-gray-200 opacity-60'
                  : c.isEssential
                  ? 'bg-forest-50/50 border-forest-200'
                  : 'bg-white border-[#E9E1D3]'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onTogglePaid(c.id)}
                  title={c.isPaid ? 'Mark as unpaid' : 'Mark as paid'}
                  className="text-forest-700 hover:text-forest-900 transition-smooth"
                >
                  {c.isPaid ? (
                    <CheckCircle className="w-5 h-5 text-forest-700" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 hover:text-forest-600" />
                  )}
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${c.isPaid ? 'line-through text-gray-500' : 'text-charcoal-900'}`}>
                      {c.name}
                    </span>
                    {c.isEssential && (
                      <span className="text-[9px] bg-red-100 text-red-800 font-semibold px-1.5 py-0.2 rounded">
                        Essential
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500">
                    Due Day {c.dueDay} of each month {c.notes ? `• ${c.notes}` : ''}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-xs font-bold ${c.isPaid ? 'text-gray-400' : 'text-forest-900'}`}>
                  {formatINR(c.amount)}
                </span>
                <p className="text-[10px] text-gray-500 font-medium">
                  {c.isPaid ? 'Paid' : 'Unpaid'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
