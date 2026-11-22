'use client';

import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  GraduationCap,
  Briefcase,
  PiggyBank,
  Bot,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { NavTab } from '@/types';
export type { NavTab };

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export function Sidebar({ activeTab, onSelectTab }: SidebarProps) {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'my-money' as NavTab,
      label: 'My Money',
      icon: Wallet,
      badge: 'Expenses & Bills',
    },
    {
      id: 'scholarships' as NavTab,
      label: 'Scholarships',
      icon: GraduationCap,
      badge: 'Grants',
    },
    {
      id: 'opportunities' as NavTab,
      label: 'Opportunities',
      icon: Briefcase,
      badge: 'Gigs',
    },
    {
      id: 'savings' as NavTab,
      label: 'Savings Goals',
      icon: PiggyBank,
      badge: null,
    },
    {
      id: 'coach' as NavTab,
      label: 'AI Coach',
      icon: Bot,
      badge: 'Smart',
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 bg-[#FAF7F0] border-r border-[#E5DEC9] p-4 min-h-[calc(100vh-60px)] shrink-0">
      {/* Student Badge Card */}
      <div className="mb-5 p-3.5 bg-[#143E2B] text-white rounded-xl shadow-2xs border border-[#143E2B]">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="w-4 h-4 text-[#84CC16]" />
          <span className="text-[10px] font-bold text-[#84CC16] uppercase tracking-wider">
            Student Companion
          </span>
        </div>
        <p className="text-xs text-emerald-100 leading-snug font-medium">
          Budgeting, scholarships & part-time opportunities made for Indian campus life.
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.id ||
            (item.id === 'my-money' &&
              (activeTab === 'transactions' ||
                activeTab === 'purchase-check' ||
                activeTab === 'offers'));

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium text-xs transition-colors ${
                isActive
                  ? 'bg-[#143E2B] text-white shadow-2xs'
                  : 'text-slate-700 hover:bg-white hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#84CC16]' : 'text-slate-500'
                  }`}
                />
                <span className="font-semibold">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/60 text-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="pt-4 border-t border-[#E5DEC9] text-[11px] text-slate-500">
        <p className="font-semibold text-slate-800">Yuva Sathi • युवा साथी</p>
        <p className="text-[10px] text-slate-500 mt-0.5">100% INR (₹) • Strict Privacy</p>
      </div>
    </aside>
  );
}
