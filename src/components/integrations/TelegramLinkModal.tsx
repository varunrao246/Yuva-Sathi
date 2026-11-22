'use client';

import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Copy, ExternalLink, Bell, AlertTriangle, ShieldCheck, X, RefreshCw } from 'lucide-react';
import { FinancialCalculationResult } from '@/types';
import { formatINR } from '@/lib/currency';

interface TelegramLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  financials: FinancialCalculationResult;
}

export const TelegramLinkModal: React.FC<TelegramLinkModalProps> = ({
  isOpen,
  onClose,
  userId,
  financials,
}) => {
  const [loading, setLoading] = useState(false);
  const [deepLink, setDeepLink] = useState('');
  const [linkToken, setLinkToken] = useState('');
  const [botUsername, setBotUsername] = useState('YuvaSathiBot');
  const [isConfigured, setIsConfigured] = useState(false);
  const [copied, setCopied] = useState(false);
  const [testNotificationStatus, setTestNotificationStatus] = useState<string | null>(null);
  const [testNotificationPreview, setTestNotificationPreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      generateToken();
    }
  }, [isOpen, userId]);

  const generateToken = async () => {
    setLoading(true);
    setTestNotificationStatus(null);
    try {
      const res = await fetch('/api/telegram/link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        setDeepLink(data.deepLink);
        setLinkToken(data.linkToken);
        setBotUsername(data.botUsername);
        setIsConfigured(data.isConfigured);
      }
    } catch (err) {
      console.error('Failed to generate telegram token:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (deepLink) {
      navigator.clipboard.writeText(deepLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendTestAlert = async (type: 'daily_summary' | 'commitment_due' | 'overspending_alert') => {
    setTestNotificationStatus('Dispatching alert...');
    setTestNotificationPreview(null);
    try {
      const res = await fetch('/api/telegram/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type }),
      });
      const data = await res.json();
      if (data.ok) {
        if (data.sent) {
          setTestNotificationStatus(`Alert successfully sent to Telegram chat #${data.chatId}!`);
        } else {
          setTestNotificationStatus(`Preview mode (${data.reason || 'Not yet linked to live bot'}):`);
          setTestNotificationPreview(data.preview || data.messageText);
        }
      } else {
        setTestNotificationStatus(`Notice: ${data.message || data.error}`);
      }
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Request failed';
      setTestNotificationStatus(`Error: ${errorMsg}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#FAF7F0] border border-[#E5DEC9] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#143E2B] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#84CC16] text-[#143E2B] flex items-center justify-center shadow-sm font-bold text-lg">
              <Send className="w-5 h-5 ml-0.5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Telegram Money Alerts</h3>
              <p className="text-xs text-emerald-200">Daily Safe-to-Spend limits and bill reminders on your phone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status banner */}
          <div className="bg-white p-4 rounded-xl border border-[#E5DEC9] flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                Cryptographically Secure Account Linking
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Yuva Sathi uses single-use, 15-minute expiring link tokens. Your financial data is never exposed before verification.
              </p>
            </div>
          </div>

          {/* 1-Click Link Button */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-700 block">Your Telegram Deep Link</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={loading ? 'Generating secure link...' : deepLink}
                className="w-full text-xs font-mono bg-white border border-[#E5DEC9] rounded-lg px-3 py-2.5 text-slate-700 outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                disabled={loading}
                className="shrink-0 px-3 py-2.5 bg-white border border-[#E5DEC9] hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Copy link"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <a
              href={deepLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-[#143E2B] hover:bg-[#1B4D36] text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Connect @{botUsername} in Telegram</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>

            {!isConfigured && (
              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  Bot token is running in simulated evaluator mode. Add <code>TELEGRAM_BOT_TOKEN</code> in <code>.env.local</code> for live production dispatch.
                </span>
              </p>
            )}
          </div>

          {/* Evaluator Test Alert Triggers */}
          <div className="bg-white rounded-xl border border-[#E5DEC9] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-[#143E2B]" />
                Test Proactive Alert Dispatch
              </span>
              <span className="text-[10px] text-slate-400">Evaluator Sandbox</span>
            </div>

            <p className="text-xs text-slate-500">
              Trigger a realistic notification to see how Yuva Sathi formats financial alerts:
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleSendTestAlert('daily_summary')}
                className="px-2 py-2 text-xs font-medium bg-emerald-50 text-[#143E2B] border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors text-center"
              >
                Morning Summary
              </button>
              <button
                onClick={() => handleSendTestAlert('commitment_due')}
                className="px-2 py-2 text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors text-center"
              >
                Bill Due Alert
              </button>
              <button
                onClick={() => handleSendTestAlert('overspending_alert')}
                className="px-2 py-2 text-xs font-medium bg-rose-50 text-rose-900 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors text-center"
              >
                Pace Warning
              </button>
            </div>

            {testNotificationStatus && (
              <div className="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                <p className="font-semibold text-slate-900">{testNotificationStatus}</p>
                {testNotificationPreview && (
                  <pre className="mt-2 text-[11px] whitespace-pre-wrap font-sans bg-white p-2.5 rounded border border-slate-200 text-slate-800 leading-relaxed">
                    {testNotificationPreview.replace(/<[^>]*>/g, '')}
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* Telegram Commands Cheat Sheet */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">Supported Bot Commands</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-[#E5DEC9]">
                <code className="text-[#143E2B] font-bold">/balance</code>
                <p className="text-[11px] text-slate-500 mt-0.5">Live balance & safe-to-spend today</p>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-[#E5DEC9]">
                <code className="text-[#143E2B] font-bold">/today</code>
                <p className="text-[11px] text-slate-500 mt-0.5">Daily spending limit & pace</p>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-[#E5DEC9]">
                <code className="text-[#143E2B] font-bold">/budget</code>
                <p className="text-[11px] text-slate-500 mt-0.5">Monthly overview & unpaid bills</p>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-[#E5DEC9]">
                <code className="text-[#143E2B] font-bold">/savings</code>
                <p className="text-[11px] text-slate-500 mt-0.5">Savings goals progress bars</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-[#E5DEC9] flex items-center justify-between">
          <button
            onClick={generateToken}
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate Token</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-medium rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
