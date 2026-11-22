'use client';

import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  GraduationCap,
  Briefcase,
  PiggyBank,
  Bot
} from 'lucide-react';
import { NavTab, isNavTabActive } from '@/types';

interface MobileNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export function MobileNav({ activeTab, onSelectTab }: MobileNavProps) {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-money' as NavTab, label: 'My Money', icon: Wallet },
    { id: 'scholarships' as NavTab, label: 'Scholarships', icon: GraduationCap },
    { id: 'opportunities' as NavTab, label: 'Gigs & Jobs', icon: Briefcase },
    { id: 'savings' as NavTab, label: 'Savings', icon: PiggyBank },
    { id: 'coach' as NavTab, label: 'Coach', icon: Bot },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5DEC9] py-1.5 px-2 flex items-center justify-around shadow-lg">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = isNavTabActive(activeTab, item.id);

        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
              isActive
                ? 'text-[#143E2B] font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div
              className={`p-1 rounded-md ${
                isActive ? 'bg-[#FAF7F0] text-[#143E2B]' : ''
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <span className="truncate max-w-[60px]">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
