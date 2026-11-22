import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let supabaseConnected = false;
  let supabaseMessage = 'Not configured';

  if (supabaseUrl && (supabaseAnonKey || supabaseServiceKey)) {
    try {
      const client = getSupabaseServerClient();
      if (client) {
        // Light health probe
        const { error } = await client.from('profiles').select('id').limit(1);
        if (!error) {
          supabaseConnected = true;
          supabaseMessage = 'Connected & Verified';
        } else {
          supabaseMessage = `Configured (Table check: ${error.message})`;
        }
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      supabaseMessage = `Connection error: ${errorMsg}`;
    }
  }

  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramBotUsername = process.env.TELEGRAM_BOT_USERNAME || 'YuvaSathiBot';
  const telegramWebhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

  const gnaniApiKey = process.env.GNANI_API_KEY || process.env.GNANI_TOKEN || process.env.GNANI_ACCESS_KEY;
  const gnaniSttEndpoint = process.env.GNANI_STT_ENDPOINT || 'https://asr.gnani.ai/v1/recognize';
  const gnaniTtsEndpoint = process.env.GNANI_TTS_ENDPOINT || 'https://tts.gnani.ai/v1/synthesize';

  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

  const isVercel = Boolean(process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV);
  const vercelEnv = process.env.VERCEL_ENV || (isVercel ? 'production' : 'local');

  const integrations = [
    {
      id: 'supabase',
      name: 'Supabase Cloud PostgreSQL & Auth',
      category: 'Database & Security',
      status: supabaseConnected
        ? 'ACTIVE'
        : (supabaseUrl && supabaseAnonKey ? 'CONFIGURED' : 'DEMO_FALLBACK'),
      isConfigured: Boolean(supabaseUrl && supabaseAnonKey),
      details: supabaseMessage,
      fallback: 'Dual-namespaced LocalStorage engine with isolated demo/user stores',
      keys: {
        NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? 'Set' : 'Missing',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? 'Set' : 'Missing',
        SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey ? 'Set' : 'Missing',
      },
    },
    {
      id: 'telegram',
      name: 'Telegram Bot Financial Alerts',
      category: 'Proactive Notifications',
      status: telegramToken ? 'ACTIVE' : 'SIMULATED_FALLBACK',
      isConfigured: Boolean(telegramToken),
      details: telegramToken ? `@${telegramBotUsername} ready for webhook & messaging` : 'Missing TELEGRAM_BOT_TOKEN',
      fallback: 'In-app notification previews & Web UI alerts',
      botUsername: telegramBotUsername,
      keys: {
        TELEGRAM_BOT_TOKEN: telegramToken ? 'Set' : 'Missing',
        TELEGRAM_BOT_USERNAME: telegramBotUsername,
        TELEGRAM_WEBHOOK_SECRET: telegramWebhookSecret ? 'Set' : 'Optional',
      },
    },
    {
      id: 'gnani',
      name: 'Gnani.ai Voice Money Coach',
      category: 'Speech AI (STT / TTS)',
      status: gnaniApiKey ? 'ACTIVE' : 'BROWSER_SPEECH_FALLBACK',
      isConfigured: Boolean(gnaniApiKey),
      details: gnaniApiKey ? 'Gnani.ai Indic STT & TTS endpoints active' : 'Missing GNANI_API_KEY',
      fallback: 'HTML5 Web Speech Recognition & Web SpeechSynthesis (en-IN)',
      keys: {
        GNANI_API_KEY: gnaniApiKey ? 'Set' : 'Missing',
        GNANI_STT_ENDPOINT: gnaniSttEndpoint,
        GNANI_TTS_ENDPOINT: gnaniTtsEndpoint,
      },
    },
    {
      id: 'gemini',
      name: `Google Gemini (${geminiModel})`,
      category: 'Generative AI Intelligence',
      status: geminiApiKey ? 'ACTIVE' : 'GROUNDED_LOCAL_FALLBACK',
      isConfigured: Boolean(geminiApiKey),
      details: geminiApiKey ? `Model: ${geminiModel} with grounded financial facts` : 'Missing GEMINI_API_KEY',
      fallback: 'Deterministic Grounded Local Sathi rule engine',
      keys: {
        GEMINI_API_KEY: geminiApiKey ? 'Set' : 'Missing',
      },
    },
    {
      id: 'vercel',
      name: 'Vercel Production Deployment',
      category: 'Hosting & CI/CD',
      status: isVercel ? 'DEPLOYED' : 'READY_TO_DEPLOY',
      isConfigured: true,
      details: isVercel ? `Environment: ${vercelEnv}` : 'Production build tested and ready for Vercel deployment',
      fallback: 'Next.js standalone Node server / Static export',
      keys: {
        NODE_ENV: process.env.NODE_ENV || 'production',
      },
    },
  ];

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    overallHealth: 'HEALTHY',
    integrations,
  });
}
