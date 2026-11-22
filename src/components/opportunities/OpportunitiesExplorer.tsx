'use client';

import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Calendar,
  Building,
  MapPin,
  Clock,
  Sparkles,
  Tag,
  DollarSign
} from 'lucide-react';
import { OpportunityItem, OpportunityType } from '@/types';
import { OPPORTUNITIES_DATA } from '@/lib/opportunities-data';
import { useToast } from '../ui/Toast';

interface OpportunitiesExplorerProps {
  bookmarkedOpportunities: string[];
  onToggleBookmark: (id: string) => void;
}

export const OpportunitiesExplorer: React.FC<OpportunitiesExplorerProps> = ({
  bookmarkedOpportunities,
  onToggleBookmark,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<OpportunityType | 'All'>('All');
  const [filterRemoteOnly, setFilterRemoteOnly] = useState(false);
  const [filterBookmarkedOnly, setFilterBookmarkedOnly] = useState(false);

  const { showToast } = useToast();

  const filteredOpportunities = useMemo(() => {
    return OPPORTUNITIES_DATA.filter(item => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesOrg = item.organization.toLowerCase().includes(q);
        const matchesSkills = item.requiredSkills.some(s => s.toLowerCase().includes(q));
        const matchesDesc = item.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesOrg && !matchesSkills && !matchesDesc) {
          return false;
        }
      }

      // Type filter
      if (selectedType !== 'All' && item.type !== selectedType) {
        return false;
      }

      // Remote only filter
      if (filterRemoteOnly && !item.location.toLowerCase().includes('remote')) {
        return false;
      }

      // Bookmarked filter
      if (filterBookmarkedOnly && !bookmarkedOpportunities.includes(item.id)) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedType, filterRemoteOnly, filterBookmarkedOnly, bookmarkedOpportunities]);

  const handleBookmark = (id: string) => {
    onToggleBookmark(id);
    const isNowSaved = !bookmarkedOpportunities.includes(id);
    showToast(isNowSaved ? 'Saved opportunity to your shortlist' : 'Removed from saved opportunities', 'info');
  };

  const getTypeBadge = (type: OpportunityType) => {
    switch (type) {
      case 'Internship':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">Internship</span>;
      case 'Part-Time Job':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">Part-Time</span>;
      case 'Remote Work':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">100% Remote</span>;
      case 'Campus Role':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">Campus Role</span>;
      case 'Freelance Gig':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">Freelance Gig</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-[#E5DEC9] rounded-xl p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#143E2B]">
                Student Income & Experience
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Verified Compensation
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 mt-1">
              Part-Time & Student Opportunity Hub
            </h1>
            <p className="text-xs md:text-sm text-slate-600 mt-1 max-w-2xl">
              Legitimate, student-friendly part-time gigs, campus ambassador posts, subject tutoring, and tech internships designed to fit around Indian college timetables.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="bg-[#FAF7F0] border border-[#E5DEC9] rounded-lg px-3.5 py-2 text-center">
              <span className="text-[10px] font-medium text-slate-500 block uppercase">Active Roles</span>
              <span className="text-base font-bold text-[#143E2B]">{OPPORTUNITIES_DATA.length} Open</span>
            </div>
            <div className="bg-[#FAF7F0] border border-[#E5DEC9] rounded-lg px-3.5 py-2 text-center">
              <span className="text-[10px] font-medium text-slate-500 block uppercase">Bookmarked</span>
              <span className="text-base font-bold text-[#143E2B]">{bookmarkedOpportunities.length} Saved</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by role, company (e.g. Internshala, Chegg), skills (React, Python), or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search part-time opportunities and gigs"
                className="w-full text-xs md:text-sm bg-[#FAF7F0]/60 border border-[#E5DEC9] rounded-lg pl-9 pr-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#143E2B] focus:bg-white transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                aria-label="Filter opportunities by work type"
                className="text-xs bg-[#FAF7F0]/60 border border-[#E5DEC9] rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-[#143E2B]"
              >
                <option value="All">All Opportunity Types</option>
                <option value="Internship">Internships</option>
                <option value="Part-Time Job">Part-Time Jobs</option>
                <option value="Remote Work">100% Remote Work</option>
                <option value="Campus Role">Campus Roles & Ambassador</option>
                <option value="Freelance Gig">Freelance Gigs</option>
              </select>

              {/* Toggle Filters */}
              <button
                onClick={() => setFilterRemoteOnly(!filterRemoteOnly)}
                className={`text-xs px-3 py-2 rounded-lg border transition-colors ${
                  filterRemoteOnly
                    ? 'bg-[#143E2B] text-white border-[#143E2B]'
                    : 'bg-[#FAF7F0]/60 text-slate-700 border-[#E5DEC9] hover:bg-white'
                }`}
              >
                Remote Only
              </button>

              <button
                onClick={() => setFilterBookmarkedOnly(!filterBookmarkedOnly)}
                className={`text-xs px-3 py-2 rounded-lg border transition-colors ${
                  filterBookmarkedOnly
                    ? 'bg-[#143E2B] text-white border-[#143E2B]'
                    : 'bg-[#FAF7F0]/60 text-slate-700 border-[#E5DEC9] hover:bg-white'
                }`}
              >
                Bookmarked ({bookmarkedOpportunities.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Opportunities Grid */}
      {filteredOpportunities.length === 0 ? (
        <div className="bg-white border border-[#E5DEC9] rounded-xl p-12 text-center">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-semibold text-slate-800 text-sm">No opportunities found matching your criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting your search query or disabling filters.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('All');
              setFilterRemoteOnly(false);
              setFilterBookmarkedOnly(false);
            }}
            className="mt-4 px-3.5 py-1.5 bg-[#143E2B] text-white text-xs font-medium rounded-lg hover:bg-[#1B4D36] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOpportunities.map((opportunity) => {
            const isSaved = bookmarkedOpportunities.includes(opportunity.id);

            return (
              <div
                key={opportunity.id}
                className="bg-white border border-[#E5DEC9] rounded-xl p-5 shadow-2xs hover:border-[#143E2B]/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  {/* Top metadata line */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {getTypeBadge(opportunity.type)}

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified Listing
                      </span>

                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {opportunity.location}
                      </span>
                    </div>

                    {/* Bookmark Toggle */}
                    <button
                      onClick={() => handleBookmark(opportunity.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isSaved
                          ? 'bg-[#143E2B] text-white border-[#143E2B]'
                          : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700'
                      }`}
                      title={isSaved ? 'Remove bookmark' : 'Save opportunity'}
                    >
                      {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Title & Organization */}
                  <h3 className="font-bold text-slate-900 text-base mt-2.5 leading-snug">
                    {opportunity.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1 flex items-center gap-1 font-medium">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{opportunity.organization}</span>
                  </p>

                  {/* Compensation & Working Hours Box */}
                  <div className="mt-3.5 p-3 rounded-lg bg-[#FAF7F0] border border-[#E5DEC9] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                        Stipend / Pay
                      </span>
                      <span className="text-sm font-bold text-[#143E2B]">
                        {opportunity.compensation}
                      </span>
                    </div>

                    {opportunity.workingHours && (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                          Commitment
                        </span>
                        <span className="text-xs font-semibold text-slate-800 flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {opportunity.workingHours}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    {opportunity.description}
                  </p>

                  {/* Required Skills */}
                  <div className="mt-3.5">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Skills & Requirements
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {opportunity.requiredSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-[10px] rounded bg-slate-100 text-slate-700 font-medium border border-slate-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Controls: Deadline + Direct Apply Link */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Deadline: <strong className="text-slate-700">{opportunity.deadline || 'Rolling'}</strong>
                  </span>

                  <a
                    href={opportunity.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#143E2B] hover:bg-[#1B4D36] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors shrink-0"
                  >
                    <span>View & Apply</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
