'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  Cpu,
  RefreshCw,
  User,
  Info,
  Mic,
  MessageSquare
} from 'lucide-react';
import {
  FinancialCalculationResult,
  Transaction,
  Commitment,
  SavingsGoal,
  ChatMessage
} from '@/types';
import { formatINR } from '@/lib/currency';
import { useToast } from '../ui/Toast';
import { VoiceMoneyCoach } from './VoiceMoneyCoach';

interface AICoachChatProps {
  financials: FinancialCalculationResult;
  transactions: Transaction[];
  commitments: Commitment[];
  savingsGoals: SavingsGoal[];
}

const DEFAULT_PROMPTS = [
  'Can I buy this today?',
  'How much should I save?',
  'Analyze my spending',
  'Help me reach month-end',
  'Give me a weekly budget'
];

export function AICoachChat({
  financials,
  transactions,
  commitments,
  savingsGoals,
}: AICoachChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Namaste! I am your Yuva Sathi AI Financial Companion. 

I understand Indian campus life — from mess dues and campus canteens to mobile 5G plans and semester trips. 

Your current daily safe-to-spend is **${formatINR(financials.safeToSpendToday)}**, with **${formatINR(financials.discretionaryFunds)}** in safe cushion. 

Ask me anything or choose a suggested question below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedPrompts: DEFAULT_PROMPTS,
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [activeEngine, setActiveEngine] = useState<string>('Grounded Local Advisor');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          financials,
          transactions,
          commitments,
          savingsGoals,
        }),
      });

      const data = await res.json();

      if (data.source) {
        setActiveEngine(data.source);
      }

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        content: data.response || 'I am having trouble evaluating that right now. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOfflineFallback: data.isOfflineFallback,
        suggestedPrompts: data.suggestedPrompts || DEFAULT_PROMPTS,
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Coach API Error:', err);
      showToast('Offline fallback activated', 'info');
      // Emergency client-side fallback
      const fallbackMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        content: `Based on your live numbers:\n• Safe-to-spend: **${formatINR(financials.safeToSpendToday)}/day**\n• Days remaining: **${financials.daysRemainingInMonth} days**\n• Balance: **${formatINR(financials.currentBalance)}**\n\nStick to ${formatINR(financials.safeToSpendToday)} per day to finish this month with all bills covered!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOfflineFallback: true,
        suggestedPrompts: DEFAULT_PROMPTS,
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isVoiceMode) {
    return (
      <VoiceMoneyCoach
        financials={financials}
        transactions={transactions}
        commitments={commitments}
        savingsGoals={savingsGoals}
        onClose={() => setIsVoiceMode(false)}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E9E1D3] shadow-xs flex flex-col h-[650px] overflow-hidden">
      {/* Header with Engine transparency & Voice switch */}
      <div className="p-4 border-b border-[#FAF7F0] bg-[#FAF7F0]/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-forest-800 text-lime-400 flex items-center justify-center font-bold shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-forest-900 text-sm md:text-base">
                AI Money Coach
              </h3>
              <span className="text-[10px] bg-forest-100 text-forest-800 font-semibold px-2 py-0.5 rounded-full border border-forest-200">
                Grounded in INR
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              Engine: <span className="font-semibold text-charcoal-800">{activeEngine}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVoiceMode(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold text-[#143E2B] transition-colors shadow-2xs"
            title="Switch to Gnani.ai Voice Money Coach"
          >
            <Mic className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Voice Coach</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-charcoal-700 bg-white px-2.5 py-1.5 rounded-lg border border-[#E9E1D3]">
            <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
            <span>Zero Hallucinated Numbers</span>
          </div>
        </div>
      </div>

      {/* Suggested prompts strip */}
      <div className="px-4 py-2 bg-[#FAF7F0]/40 border-b border-[#FAF7F0] flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-bold text-forest-800 uppercase tracking-wider whitespace-nowrap">
          Quick Ask:
        </span>
        {DEFAULT_PROMPTS.map(p => (
          <button
            key={p}
            type="button"
            onClick={() => handleSendMessage(p)}
            className="px-2.5 py-1 bg-white hover:bg-forest-50 border border-[#E9E1D3] hover:border-forest-300 rounded-lg text-xs font-medium text-forest-800 whitespace-nowrap transition-smooth shadow-2xs"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite">
        {messages.map(msg => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-xs text-xs md:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-forest-700 text-cream-50 rounded-br-xs'
                    : 'bg-[#FAF7F0] text-charcoal-900 rounded-bl-xs border border-[#E9E1D3]'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center gap-1.5 mb-1.5 text-[10px] text-forest-700 font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-forest-600" />
                    <span>Yuva Sathi</span>
                    {msg.isOfflineFallback && (
                      <span className="bg-amber-100 text-amber-900 font-medium px-1 rounded lowercase">
                        local advisor
                      </span>
                    )}
                  </div>
                )}

                <div className="whitespace-pre-wrap">{msg.content}</div>

                <div
                  className={`mt-2 text-[10px] ${
                    isUser ? 'text-forest-200 text-right' : 'text-gray-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {/* Suggested Followup Prompts */}
              {!isUser && msg.suggestedPrompts && (
                <div className="mt-2 flex flex-wrap gap-1.5 max-w-[85%]">
                  {msg.suggestedPrompts.map(prompt => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                      className="px-2.5 py-1 bg-white hover:bg-forest-50 border border-[#E9E1D3] hover:border-forest-300 rounded-lg text-[11px] font-medium text-forest-800 transition-smooth"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-[#FAF7F0] rounded-2xl border border-[#E9E1D3] max-w-xs text-xs text-forest-800">
            <RefreshCw className="w-4 h-4 animate-spin text-forest-700" />
            <span>Consulting financial model...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-3 bg-[#FAF7F0] border-t border-[#E9E1D3]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <label htmlFor="coach-query-input" className="sr-only">Ask AI coach a financial question</label>
          <input
            id="coach-query-input"
            type="text"
            placeholder="Ask anything... e.g. 'Can I buy this today?', 'How much should I save?'"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-white border border-[#E9E1D3] rounded-xl text-xs md:text-sm text-charcoal-900 focus:outline-none focus:border-forest-600 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2.5 bg-forest-700 hover:bg-forest-800 disabled:bg-gray-300 text-cream-50 rounded-xl transition-smooth shadow-xs"
            title="Send query"
            aria-label="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
