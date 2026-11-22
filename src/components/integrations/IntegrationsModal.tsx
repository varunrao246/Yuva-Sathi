'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Send,
  Mic,
  Sparkles,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  ExternalLink,
  Shield,
  Layers
} from 'lucide-react';

interface IntegrationItem {
  id: string;
  name: string;
  category: string;
  status: 'ACTIVE' | 'CONFIGURED' | 'DEMO_FALLBACK' | 'SIMULATED_FALLBACK' | 'BROWSER_SPEECH_FALLBACK' | 'GROUNDED_LOCAL_FALLBACK' | 'DEPLOYED' | 'READY_TO_DEPLOY';
  isConfigured: boolean;
  details: string;
  fallback: string;
  keys: Record<string, string>;
}

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTelegram: () => void;
  onOpenVoice: () => void;
}

export const IntegrationsModal: React.FC<IntegrationsModalProps> = ({
  isOpen,
  onClose,
  onOpenTelegram,
  onOpenVoice,
}) => {
  const [loading, setLoading] = useState(false);
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/integrations/status');
      const data = await res.json();
      if (data.integrations) {
        setIntegrations(data.integrations);
      }
    } catch (err) {
      console.error('Failed to fetch integrations status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getServiceIcon = (id: string) => {
    switch (id) {
      case 'supabase':
        return <Database className="w-5 h-5 text-emerald-600" />;
      case 'telegram':
        return <Send className="w-5 h-5 text-sky-600" />;
      case 'gnani':
        return <Mic className="w-5 h-5 text-purple-600" />;
      case 'gemini':
        return <Sparkles className="w-5 h-5 text-amber-600" />;
      case 'vercel':
        return <Cloud className="w-5 h-5 text-slate-800" />;
      default:
        return <Layers className="w-5 h-5 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ACTIVE' || status === 'DEPLOYED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          ACTIVE
        </span>
      );
    }
    if (status === 'CONFIGURED' || status === 'READY_TO_DEPLOY') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          <CheckCircle2 className="w-3 h-3 text-blue-600" />
          READY
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
        <AlertTriangle className="w-3 h-3 text-amber-600" />
        FALLBACK ACTIVE
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#FAF7F0] border border-[#E5DEC9] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#143E2B] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#84CC16] text-[#143E2B] flex items-center justify-center shadow-sm font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg text-white">Integrations & Cloud Architecture</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  Sprint 3 Production
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                Transparent live status across all 5 integrated services
              </p>
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
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="bg-white p-3.5 rounded-xl border border-[#E5DEC9] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-[#143E2B]" />
              <p className="text-xs text-slate-700 font-medium">
                All external services feature deterministic fallbacks. The application operates seamlessly even with zero configured API keys.
              </p>
            </div>
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="shrink-0 ml-3 p-1.5 rounded-lg border border-[#E5DEC9] text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              title="Refresh live connection status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-3">
            {integrations.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-[#E5DEC9] p-4 shadow-sm hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      {getServiceIcon(item.id)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-slate-900">{item.name}</h4>
                        <span className="text-[10px] text-slate-400 font-medium">{item.category}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{item.details}</p>
                    </div>
                  </div>
                  <div>{getStatusBadge(item.status)}</div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="text-slate-500">
                    <span className="font-semibold text-slate-700">Fallback:</span> {item.fallback}
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                    {Object.entries(item.keys).map(([k, v]) => (
                      <span key={k} className={v === 'Set' ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick actions for services */}
                {item.id === 'telegram' && (
                  <div className="mt-2.5 pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenTelegram();
                      }}
                      className="text-xs text-sky-700 font-medium hover:underline flex items-center gap-1"
                    >
                      <span>Connect Telegram Bot</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {item.id === 'gnani' && (
                  <div className="mt-2.5 pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenVoice();
                      }}
                      className="text-xs text-purple-700 font-medium hover:underline flex items-center gap-1"
                    >
                      <span>Launch Voice Money Coach</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-[#E5DEC9] flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Configure keys in <code>.env.local</code> to activate live API connections.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#143E2B] hover:bg-[#1B4D36] text-white text-xs font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
