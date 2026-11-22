'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, RefreshCw, AlertCircle, Play, Pause, ChevronRight } from 'lucide-react';
import { FinancialCalculationResult, Transaction, Commitment, SavingsGoal } from '@/types';
import {
  ISpeechRecognition,
  IWindowWithSpeech,
  ISpeechRecognitionEvent,
  ISpeechRecognitionErrorEvent,
} from '@/types/speech';
import { formatINR } from '@/lib/currency';

interface VoiceMoneyCoachProps {
  financials: FinancialCalculationResult;
  transactions: Transaction[];
  commitments: Commitment[];
  savingsGoals: SavingsGoal[];
  onClose?: () => void;
}

type VoiceStatus = 'idle' | 'listening' | 'processing' | 'answering' | 'error';

export const VoiceMoneyCoach: React.FC<VoiceMoneyCoachProps> = ({
  financials,
  transactions,
  commitments,
  savingsGoals,
  onClose,
}) => {
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [engineSource, setEngineSource] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const transcriptRef = useRef<string>('');
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Check Web Speech API support
  const isSpeechSupported = typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  // Suggested voice queries
  const suggestedQueries = [
    'How much can I safely spend today?',
    'Can I afford a dinner out with friends?',
    'How much should I save this week?',
    'Explain my biggest expenses this month',
    'Will I have enough money at the end of the month?',
  ];

  useEffect(() => {
    return () => {
      stopListening();
      stopSpeaking();
    };
  }, []);

  const startListening = () => {
    setErrorMessage('');
    setResponse('');
    setTranscript('');
    transcriptRef.current = '';
    stopSpeaking();

    if (!isSpeechSupported) {
      setErrorMessage('Speech recognition is not supported in this browser. Please use Google Chrome or typed chat.');
      setStatus('error');
      return;
    }

    try {
      const speechWindow = window as unknown as IWindowWithSpeech;
      const SpeechRecognitionClass = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
      if (!SpeechRecognitionClass) {
        throw new Error('Speech recognition not available in this environment');
      }
      const recognition = new SpeechRecognitionClass();
      recognition.lang = 'en-IN';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setStatus('listening');
      };

      recognition.onresult = (event: ISpeechRecognitionEvent) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        transcriptRef.current = currentTranscript;
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
        console.error('[Voice Speech Error]', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions in browser settings.');
        } else if (event.error !== 'no-speech') {
          setErrorMessage(`Speech recognition error: ${event.error}`);
        }
        setStatus('idle');
      };

      recognition.onend = () => {
        const recordedQuery = transcriptRef.current.trim();
        if (recordedQuery.length > 0) {
          processVoiceQuery(recordedQuery);
        } else {
          setStatus('idle');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: unknown) {
      console.error('[Voice Start Error]', err);
      const msg = err instanceof Error ? err.message : 'Failed to start microphone';
      setErrorMessage(msg);
      setStatus('error');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const processVoiceQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    setStatus('processing');
    try {
      // 1. Send query to financial AI coach
      const coachRes = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          financials,
          transactions,
          commitments,
          savingsGoals,
        }),
      });

      const coachData = await coachRes.json();
      const replyText = coachData.response || 'I am here to guide your money choices!';
      setResponse(replyText);
      setEngineSource(coachData.source || 'Yuva Sathi Advisor');
      setStatus('answering');

      // 2. Synthesize speech via Gnani.ai TTS or Browser SpeechSynthesis
      speakResponse(replyText);
    } catch (err: unknown) {
      console.error('[Voice Query Error]', err);
      setErrorMessage('Could not process voice query. Please try again.');
      setStatus('error');
    }
  };

  const speakResponse = async (text: string) => {
    stopSpeaking();
    setIsSpeaking(true);

    try {
      // Try Gnani TTS API first
      const ttsRes = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.slice(0, 300), // Speak concise intro
          language: 'en-IN',
        }),
      });

      const ttsData = await ttsRes.json();

      if (ttsData.audioUrl) {
        // Gnani.ai audio returned
        setAudioUrl(ttsData.audioUrl);
        const audio = new Audio(ttsData.audioUrl);
        audioPlayerRef.current = audio;
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => fallbackBrowserSpeech(text);
        audio.play().catch(() => fallbackBrowserSpeech(text));
      } else {
        // Use browser SpeechSynthesis
        fallbackBrowserSpeech(text);
      }
    } catch (e) {
      fallbackBrowserSpeech(text);
    }
  };

  const fallbackBrowserSpeech = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`]/g, '').slice(0, 350);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-IN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    setIsSpeaking(false);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="bg-[#FAF7F0] border border-[#E5DEC9] rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#143E2B] text-[#84CC16] flex items-center justify-center shadow-sm">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 text-lg">Voice Money Coach</h3>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-[#143E2B] border border-emerald-200">
                Gnani.ai + Gemini
              </span>
            </div>
            <p className="text-xs text-slate-500">Ask your companion in plain speech — hands-free financial clarity</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800 underline decoration-dotted"
          >
            Switch to Text
          </button>
        )}
      </div>

      {/* Main Voice Interaction Canvas */}
      <div className="bg-white rounded-xl border border-[#E5DEC9] p-6 text-center mb-5 relative overflow-hidden">
        {/* Visual Pulse Waves when listening */}
        {status === 'listening' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-32 h-32 rounded-full bg-emerald-200/40 animate-ping" />
            <div className="w-48 h-48 rounded-full bg-lime-100/30 animate-pulse" />
          </div>
        )}

        {/* Mic Control Button */}
        <div className="relative z-10 flex flex-col items-center justify-center py-4">
          <button
            onClick={status === 'listening' ? stopListening : startListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
              status === 'listening'
                ? 'bg-rose-600 text-white hover:bg-rose-700 animate-pulse ring-4 ring-rose-200'
                : status === 'processing'
                ? 'bg-amber-500 text-white animate-spin ring-4 ring-amber-100'
                : 'bg-[#143E2B] text-white hover:bg-[#1B4D36] ring-4 ring-emerald-100'
            }`}
            title={status === 'listening' ? 'Click to stop listening' : 'Click to speak'}
          >
            {status === 'listening' ? (
              <MicOff className="w-8 h-8" />
            ) : status === 'processing' ? (
              <RefreshCw className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>

          <p className="mt-4 font-medium text-slate-800 text-sm">
            {status === 'idle' && 'Tap the mic and ask your money question'}
            {status === 'listening' && 'Listening to your voice... Speak naturally'}
            {status === 'processing' && 'Transcribing with Gnani.ai & reasoning with Gemini...'}
            {status === 'answering' && (isSpeaking ? 'Sathi is speaking...' : 'Answer ready')}
            {status === 'error' && 'Something went wrong'}
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Safe to spend today: <span className="font-semibold text-[#143E2B]">{formatINR(financials.safeToSpendToday)}</span>
          </p>
        </div>

        {/* Live Transcript Bubble */}
        {transcript && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-left">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              You Said
            </span>
            <p className="text-sm text-slate-800 font-medium italic">"{transcript}"</p>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-left">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <p className="text-xs text-rose-700">{errorMessage}</p>
          </div>
        )}

        {/* Response Box */}
        {response && (
          <div className="mt-4 p-4 bg-[#FAF7F0] border border-[#E5DEC9] rounded-xl text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#143E2B] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#84CC16]" />
                Yuva Sathi Advice
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">{engineSource}</span>
                {isSpeaking ? (
                  <button
                    onClick={stopSpeaking}
                    className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
                    title="Stop Audio"
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => speakResponse(response)}
                    className="p-1 rounded bg-emerald-100 text-[#143E2B] hover:bg-emerald-200"
                    title="Replay Voice"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line font-sans">
              {response}
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Questions */}
      <div>
        <p className="text-xs font-medium text-slate-600 mb-2">Or try asking:</p>
        <div className="flex flex-wrap gap-2">
          {suggestedQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTranscript(q);
                processVoiceQuery(q);
              }}
              className="text-xs text-slate-700 bg-white hover:bg-emerald-50 border border-[#E5DEC9] hover:border-emerald-300 rounded-lg px-3 py-1.5 text-left transition-colors flex items-center gap-1"
            >
              <span>{q}</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
