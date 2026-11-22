'use client';

import React from 'react';
import {
  Bell,
  Sliders,
  Sparkles,
  PlusCircle,
  RefreshCw,
  User,
  Layers,
  Send,
  Mic,
  GraduationCap,
  Briefcase,
  PiggyBank,
  Bot,
  LayoutDashboard,
  Wallet
} from 'lucide-react';
import { NavTab, isNavTabActive } from '@/types';
import { formatINR } from '@/lib/currency';
import { useYuvaStore } from '@/lib/storage';
import { useToast } from '../ui/Toast';

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAddExpense: () => void;
  onOpenPurchaseCheck: () => void;
  onOpenFinancialSetup: () => void;
  onOpenAuth: () => void;
  onOpenTelegram?: () => void;
  onOpenVoice?: () => void;
}

export function Header({
  activeTab,
  onSelectTab,
  onOpenAddExpense,
  onOpenPurchaseCheck,
  onOpenFinancialSetup,
  onOpenAuth,
  onOpenTelegram,
  onOpenVoice,
}: HeaderProps) {
  const { profile, financials, appMode, switchMode, resetDemoStudentData } = useYuvaStore();
  const { showToast } = useToast();

  const handleToggleMode = () => {
    if (appMode === 'demo') {
      switchMode('user');
      showToast('Switched to your Personal Account', 'info');
    } else {
      switchMode('demo');
      showToast('Switched to Demo Account (Rohan Sharma, Bangalore)', 'info');
    }
  };

  const navLinks = [
    { id: 'dashboard' as NavTab, label: 'Dashboard' },
    { id: 'my-money' as NavTab, label: 'My Money' },
    { id: 'scholarships' as NavTab, label: 'Scholarships' },
    { id: 'opportunities' as NavTab, label: 'Opportunities' },
    { id: 'savings' as NavTab, label: 'Savings' },
    { id: 'coach' as NavTab, label: 'AI Coach' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5DEC9] px-4 lg:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand Mark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-none"
            aria-label="Yuva Sathi Home Dashboard"
          >
            <div className="w-8 h-8 rounded-lg bg-[#143E2B] flex items-center justify-center text-[#84CC16] font-bold text-base shadow-2xs">
              य
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-slate-900 text-base md:text-lg">
                  YUVA SATHI
                </span>
                <span className="text-[10px] bg-[#FAF7F0] text-[#143E2B] font-semibold px-1.5 py-0.2 rounded border border-[#E5DEC9]">
                  युवा साथी
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Center: Desktop Fintech Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#FAF7F0] border border-[#E5DEC9] p-1 rounded-xl">
          {navLinks.map((link) => {
            const isSelected = isNavTabActive(activeTab, link.id);

            return (
              <button
                key={link.id}
                onClick={() => onSelectTab(link.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'bg-[#143E2B] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Controls, Notifications, Settings & Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Safe Limit Metric (Hidden on small mobile) */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs bg-[#FAF7F0] border border-[#E5DEC9] px-2.5 py-1.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-500 text-[11px]">Safe Today:</span>
            <span className="font-bold text-[#143E2B]">{formatINR(financials.safeToSpendToday)}</span>
          </div>

          {/* Telegram Notifications / Alerts */}
          {onOpenTelegram && (
            <button
              onClick={onOpenTelegram}
              className="p-1.5 rounded-lg border border-[#E5DEC9] bg-white hover:bg-[#FAF7F0] text-slate-700 transition-colors relative"
              title="Notifications & Telegram Money Alerts"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-slate-700" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-600" />
            </button>
          )}

          {/* Settings / Budget Setup */}
          <button
            onClick={onOpenFinancialSetup}
            className="p-1.5 rounded-lg border border-[#E5DEC9] bg-white hover:bg-[#FAF7F0] text-slate-700 transition-colors"
            title="Budget & Financial Settings"
            aria-label="Settings"
          >
            <Sliders className="w-4 h-4 text-slate-700" />
          </button>

          {/* Demo / Personal Account Mode Pill */}
          <button
            onClick={handleToggleMode}
            className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
              appMode === 'demo'
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                : 'bg-emerald-50 text-[#143E2B] border-emerald-300 hover:bg-emerald-100'
            }`}
            title="Toggle between Evaluator Demo and Personal Account"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>{appMode === 'demo' ? 'Demo Sandbox' : 'Personal'}</span>
          </button>

          {/* Profile / Avatar */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 rounded-lg p-0.5 hover:bg-slate-50 transition-colors"
            title="Profile & Student Details"
            aria-label="Profile"
          >
            <div className="w-8 h-8 rounded-full bg-[#143E2B] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              {profile.name ? profile.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="hidden 2xl:block text-left">
              <p className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[80px]">
                {profile.name.split(' ')[0]}
              </p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
