'use client';

import React from 'react';
import {
  GraduationCap,
  Briefcase,
  Calendar,
  ChevronRight,
  BookmarkCheck,
  Target,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { SCHOLARSHIPS_DATA } from '@/lib/scholarships-data';
import { OPPORTUNITIES_DATA } from '@/lib/opportunities-data';
import { SavingsGoal, ScholarshipApplicationStatus } from '@/types';
import { formatINR } from '@/lib/currency';

interface StudentOpportunitySummaryProps {
  savingsGoals: SavingsGoal[];
  trackedScholarships: Record<string, ScholarshipApplicationStatus>;
  bookmarkedOpportunities: string[];
  onNavigateToScholarships: () => void;
  onNavigateToOpportunities: () => void;
  onNavigateToSavings: () => void;
}

export const StudentOpportunitySummary: React.FC<StudentOpportunitySummaryProps> = ({
  savingsGoals,
  trackedScholarships,
  bookmarkedOpportunities,
  onNavigateToScholarships,
  onNavigateToOpportunities,
  onNavigateToSavings,
}) => {
  // Top upcoming scholarship deadlines sorted chronologically
  const upcomingScholarships = [...SCHOLARSHIPS_DATA]
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 2);
  const featuredOpportunities = OPPORTUNITIES_DATA.slice(0, 2);
  const primaryGoal = savingsGoals[0];

  const trackedCount = Object.keys(trackedScholarships).length;
  const bookmarkedCount = bookmarkedOpportunities.length;

  return (
    <div className="bg-white border border-[#E5DEC9] rounded-xl p-5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] border border-[#E5DEC9] flex items-center justify-center text-[#143E2B]">
            <Sparkles className="w-4 h-4 text-[#143E2B]" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Student Growth & Opportunities</h3>
            <p className="text-[11px] text-slate-500">Scholarship deadlines, part-time student work & active savings</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToScholarships}
            className="text-xs font-semibold text-[#143E2B] hover:underline flex items-center gap-0.5"
          >
            <span>All Grants</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3-Column Clean Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Column 1: Upcoming Scholarship Deadlines */}
        <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#143E2B]" />
                Upcoming Scholarships
              </span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                {trackedCount} Saved
              </span>
            </div>

            <div className="space-y-2.5">
              {upcomingScholarships.map(s => (
                <div key={s.id} className="text-xs">
                  <p className="font-semibold text-slate-900 line-clamp-1 leading-snug">
                    {s.title}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
                    <span className="font-medium text-[#143E2B]">{s.amountText.split('(')[0]}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {s.deadline}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onNavigateToScholarships}
            className="mt-3 w-full py-1.5 text-center text-xs font-semibold text-[#143E2B] bg-white border border-[#E5DEC9] rounded-lg hover:bg-emerald-50 transition-colors"
          >
            Explore 8 Scholarships
          </button>
        </div>

        {/* Column 2: Student Gigs & Part-time Jobs */}
        <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-700" />
                Student Income Opportunities
              </span>
              <span className="text-[10px] font-semibold text-blue-800 bg-blue-100/60 px-1.5 py-0.5 rounded">
                {bookmarkedCount} Saved
              </span>
            </div>

            <div className="space-y-2.5">
              {featuredOpportunities.map(opp => (
                <div key={opp.id} className="text-xs">
                  <p className="font-semibold text-slate-900 line-clamp-1 leading-snug">
                    {opp.title}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
                    <span className="text-slate-600 truncate max-w-[120px]">{opp.organization}</span>
                    <span className="font-semibold text-blue-800">{opp.compensation.split('(')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onNavigateToOpportunities}
            className="mt-3 w-full py-1.5 text-center text-xs font-semibold text-slate-800 bg-white border border-[#E5DEC9] rounded-lg hover:bg-slate-50 transition-colors"
          >
            Browse Gigs & Internships
          </button>
        </div>

        {/* Column 3: Active Savings Target */}
        <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-700" />
                Active Savings Milestone
              </span>
              {primaryGoal && (
                <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/60 px-1.5 py-0.5 rounded">
                  {Math.round((primaryGoal.currentSavings / (primaryGoal.targetAmount || 1)) * 100)}%
                </span>
              )}
            </div>

            {primaryGoal ? (
              <div className="text-xs space-y-2">
                <div>
                  <p className="font-semibold text-slate-900">{primaryGoal.name}</p>
                  <p className="text-[11px] text-slate-500">
                    Saved <strong className="text-[#143E2B]">{formatINR(primaryGoal.currentSavings)}</strong> of {formatINR(primaryGoal.targetAmount)}
                  </p>
                </div>

                {/* Mini progress bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#143E2B] h-full transition-all duration-300 rounded-full"
                    style={{
                      width: `${Math.min(100, (primaryGoal.currentSavings / (primaryGoal.targetAmount || 1)) * 100)}%`
                    }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-2">
                No active savings goals yet. Create one to start saving for your next tech gear or campus trip.
              </p>
            )}
          </div>

          <button
            onClick={onNavigateToSavings}
            className="mt-3 w-full py-1.5 text-center text-xs font-semibold text-slate-800 bg-white border border-[#E5DEC9] rounded-lg hover:bg-slate-50 transition-colors"
          >
            Manage Savings Goals
          </button>
        </div>
      </div>
    </div>
  );
};
