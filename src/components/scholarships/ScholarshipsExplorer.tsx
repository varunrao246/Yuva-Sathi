'use client';

import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Search,
  Filter,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Calendar,
  Building,
  MapPin,
  Tag,
  AlertCircle,
  Clock,
  Layers,
  ChevronDown
} from 'lucide-react';
import { ScholarshipItem, ScholarshipType, ScholarshipEducationLevel, ScholarshipApplicationStatus } from '@/types';
import { SCHOLARSHIPS_DATA } from '@/lib/scholarships-data';
import { useToast } from '../ui/Toast';

interface ScholarshipsExplorerProps {
  trackedScholarships: Record<string, ScholarshipApplicationStatus>;
  onUpdateStatus: (id: string, status: ScholarshipApplicationStatus | null) => void;
}

export const ScholarshipsExplorer: React.FC<ScholarshipsExplorerProps> = ({
  trackedScholarships,
  onUpdateStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ScholarshipType | 'All'>('All');
  const [selectedLevel, setSelectedLevel] = useState<ScholarshipEducationLevel | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<ScholarshipApplicationStatus | 'All' | 'Tracked'>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');

  const { showToast } = useToast();

  // Unique locations from data
  const locations = useMemo(() => {
    const locSet = new Set<string>();
    SCHOLARSHIPS_DATA.forEach(s => locSet.add(s.location));
    return ['All', ...Array.from(locSet)];
  }, []);

  const filteredScholarships = useMemo(() => {
    return SCHOLARSHIPS_DATA.filter(item => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesProvider = item.provider.toLowerCase().includes(q);
        const matchesCourses = item.eligibleCourses.some(c => c.toLowerCase().includes(q));
        const matchesDesc = item.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesProvider && !matchesCourses && !matchesDesc) {
          return false;
        }
      }

      // Type filter
      if (selectedType !== 'All' && item.type !== selectedType) {
        return false;
      }

      // Education Level
      if (selectedLevel !== 'All' && item.educationLevel !== selectedLevel && item.educationLevel !== 'All') {
        return false;
      }

      // Location
      if (selectedLocation !== 'All' && item.location !== selectedLocation && item.location !== 'All India') {
        return false;
      }

      // Status tracker filter
      const currentStatus = trackedScholarships[item.id];
      if (selectedStatus === 'Tracked') {
        if (!currentStatus) return false;
      } else if (selectedStatus !== 'All') {
        if (currentStatus !== selectedStatus) return false;
      }

      return true;
    });
  }, [searchQuery, selectedType, selectedLevel, selectedLocation, selectedStatus, trackedScholarships]);

  const trackedCount = Object.keys(trackedScholarships).length;

  const handleStatusChange = (id: string, status: ScholarshipApplicationStatus) => {
    const prev = trackedScholarships[id];
    if (prev === status) {
      // Toggle off
      onUpdateStatus(id, null);
      showToast('Removed scholarship from tracker', 'info');
    } else {
      onUpdateStatus(id, status);
      showToast(`Marked scholarship as "${status.toUpperCase()}"`, 'success');
    }
  };

  const getStatusBadge = (status?: ScholarshipApplicationStatus) => {
    if (!status) return null;
    switch (status) {
      case 'saved':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">Bookmarked</span>;
      case 'applying':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">Applying</span>;
      case 'applied':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">Applied</span>;
      case 'awarded':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">Awarded</span>;
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
                Financial Support
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                100% Verified Portals
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 mt-1">
              Indian College Scholarships
            </h1>
            <p className="text-xs md:text-sm text-slate-600 mt-1 max-w-2xl">
              Curated central, state, and corporate educational grants for Indian undergraduates. Direct official portal links with zero intermediary charges.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="bg-[#FAF7F0] border border-[#E5DEC9] rounded-lg px-3.5 py-2 text-center">
              <span className="text-[10px] font-medium text-slate-500 block uppercase">Available</span>
              <span className="text-base font-bold text-[#143E2B]">{SCHOLARSHIPS_DATA.length} Grants</span>
            </div>
            <div className="bg-[#FAF7F0] border border-[#E5DEC9] rounded-lg px-3.5 py-2 text-center">
              <span className="text-[10px] font-medium text-slate-500 block uppercase">In Your Tracker</span>
              <span className="text-base font-bold text-[#143E2B]">{trackedCount} Tracked</span>
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
                placeholder="Search by scholarship title, ministry, course (e.g. B.Tech, MBBS), or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search scholarships by title, ministry, or course"
                className="w-full text-xs md:text-sm bg-[#FAF7F0]/60 border border-[#E5DEC9] rounded-lg pl-9 pr-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#143E2B] focus:bg-white transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                aria-label="Filter scholarships by type"
                className="text-xs bg-[#FAF7F0]/60 border border-[#E5DEC9] rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-[#143E2B]"
              >
                <option value="All">All Types</option>
                <option value="Government">Government (Central/State)</option>
                <option value="Private">Private / Corporate Foundations</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                aria-label="Filter scholarships by tracking status"
                className="text-xs bg-[#FAF7F0]/60 border border-[#E5DEC9] rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-[#143E2B]"
              >
                <option value="All">All Tracker Status</option>
                <option value="Tracked">Only Tracked / Saved</option>
                <option value="saved">Bookmarked</option>
                <option value="applying">Applying</option>
                <option value="applied">Applied</option>
                <option value="awarded">Awarded</option>
              </select>

              {/* Location */}
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="text-xs bg-[#FAF7F0]/60 border border-[#E5DEC9] rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-[#143E2B]"
              >
                <option value="All">All Regions</option>
                {locations.filter(l => l !== 'All').map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Scholarships Listing */}
      {filteredScholarships.length === 0 ? (
        <div className="bg-white border border-[#E5DEC9] rounded-xl p-12 text-center">
          <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-semibold text-slate-800 text-sm">No scholarships match your filters</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting "All Types".</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('All');
              setSelectedStatus('All');
              setSelectedLocation('All');
            }}
            className="mt-4 px-3.5 py-1.5 bg-[#143E2B] text-white text-xs font-medium rounded-lg hover:bg-[#1B4D36] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredScholarships.map((scholarship) => {
            const currentStatus = trackedScholarships[scholarship.id];
            const isSaved = Boolean(currentStatus);

            return (
              <div
                key={scholarship.id}
                className="bg-white border border-[#E5DEC9] rounded-xl p-5 shadow-2xs hover:border-[#143E2B]/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  {/* Top Header line */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        scholarship.type === 'Government'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {scholarship.type}
                      </span>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified Portal
                      </span>

                      {getStatusBadge(currentStatus)}
                    </div>

                    {/* Bookmark Toggle */}
                    <button
                      onClick={() => handleStatusChange(scholarship.id, currentStatus || 'saved')}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isSaved
                          ? 'bg-[#143E2B] text-white border-[#143E2B]'
                          : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700'
                      }`}
                      title={isSaved ? 'Remove bookmark' : 'Bookmark scholarship'}
                    >
                      {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Title & Provider */}
                  <h3 className="font-bold text-slate-900 text-base mt-2.5 leading-snug">
                    {scholarship.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1 flex items-center gap-1 font-medium">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{scholarship.provider}</span>
                  </p>

                  {/* Grant Amount Callout */}
                  <div className="mt-3.5 p-3 rounded-lg bg-[#FAF7F0] border border-[#E5DEC9] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                        Scholarship Value
                      </span>
                      <span className="text-base font-bold text-[#143E2B]">
                        {scholarship.amountText}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                        Application Deadline
                      </span>
                      <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {scholarship.deadline}
                      </span>
                    </div>
                  </div>

                  {/* Eligibility Checklist */}
                  <div className="mt-3.5">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Eligibility Checklist
                    </span>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {scholarship.eligibilityCriteria.map((crit, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#143E2B] mt-1.5 shrink-0" />
                          <span>{crit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Eligible Courses Pills */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {scholarship.eligibleCourses.slice(0, 4).map((c, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[10px] rounded bg-slate-100 text-slate-700 font-medium border border-slate-200"
                      >
                        {c}
                      </span>
                    ))}
                    {scholarship.eligibleCourses.length > 4 && (
                      <span className="px-1.5 py-0.5 text-[10px] text-slate-500">
                        +{scholarship.eligibleCourses.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Controls: Status Tracker + Direct Official Link */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Status Picker */}
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-slate-500 font-medium">Status:</span>
                    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                      {(['saved', 'applying', 'applied', 'awarded'] as ScholarshipApplicationStatus[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(scholarship.id, st)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize transition-colors ${
                            currentStatus === st
                              ? 'bg-[#143E2B] text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Apply Official Portal Link */}
                  <a
                    href={scholarship.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#143E2B] hover:bg-[#1B4D36] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors shrink-0"
                  >
                    <span>Apply on Official Portal</span>
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
