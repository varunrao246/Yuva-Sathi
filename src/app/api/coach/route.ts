import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, GenerateContentResult } from '@google/generative-ai';
import { FinancialCalculationResult, Transaction, Commitment, SavingsGoal } from '@/types';
import { getLocalCoachResponse } from '@/lib/ai-coach';
import { formatINR } from '@/lib/currency';

// Simple in-memory sliding window rate limiter for the route
const ipRequestTimestamps = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = (ipRequestTimestamps.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  timestamps.push(now);
  ipRequestTimestamps.set(ip, timestamps);
  return true;
}

const DEFAULT_EMPTY_FINANCIALS: FinancialCalculationResult = {
  moneyAvailable: 0,
  totalMonthlyIncome: 0,
  totalMonthlyExpenses: 0,
  currentBalance: 0,
  totalCommitments: 0,
  paidCommitments: 0,
  unpaidCommitments: 0,
  unpaidEssentialCommitments: 0,
  unpaidOptionalCommitments: 0,
  creditCardTotalDue: 0,
  totalReservedPayments: 0,
  plannedSavingsMonthly: 0,
  freeMoneyRemaining: 0,
  safeToSpendToday: 0,
  dailyBudget: 0,
  currentDayOfMonth: 1,
  daysInMonth: 30,
  daysRemainingInMonth: 1,
  spendingPace: 'on_track',
  monthEndForecastBalance: 0,
  discretionaryFunds: 0,
  totalSavedInGoals: 0,
  targetSavingsTotal: 0,
};

interface CoachRequestBody {
  query: string;
  financials: FinancialCalculationResult;
  transactions: Transaction[];
  commitments: Commitment[];
  savingsGoals: SavingsGoal[];
}

export async function POST(req: NextRequest) {
  let body: Partial<CoachRequestBody> | null = null;
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'localhost';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment before sending another message.' },
        { status: 429 }
      );
    }

    body = (await req.json().catch(() => null)) as Partial<CoachRequestBody> | null;
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { query, financials, transactions, commitments, savingsGoals } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Input sanitization and bounds check
    const sanitizedQuery = query.trim().replace(/[\x00-\x1F\x7F]/g, '');
    if (sanitizedQuery.length > 500) {
      return NextResponse.json({ error: 'Query is too long (max 500 characters)' }, { status: 400 });
    }

    const safeFinancials: FinancialCalculationResult = financials || DEFAULT_EMPTY_FINANCIALS;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    // If Gemini API Key is NOT configured, use our grounded local advisor fallback
    if (!apiKey) {
      const fallback = getLocalCoachResponse(
        sanitizedQuery,
        safeFinancials,
        transactions || [],
        commitments || [],
        savingsGoals || []
      );
      return NextResponse.json({
        response: fallback.response,
        suggestedPrompts: fallback.suggestedPrompts,
        isOfflineFallback: true,
        source: 'Local Rule Engine (Add GEMINI_API_KEY in .env to activate live Gemini AI)',
      });
    }

    // Initialize Google Generative AI with 8s timeout
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    // Ground the model strictly with the user's real calculation numbers
    // AI must NEVER invent or hallucinate balances or safe-to-spend.
    const groundContext = `
You are Yuva Sathi (युवा साथी), an empathetic, smart, practical financial companion for Indian college students.
Tone: Youthful, friendly, encouraging, culturally fluent in Indian campus life (hostels, canteen, chai, Maggi, UPI, metro, semester exams, pocket money).
Currency: STRICTLY Indian Rupee (₹). Never use dollars or foreign financial products.

GROUNDED FINANCIAL TRUTH (Calculated by deterministic engine - DO NOT ALTER):
- Monthly Pocket Money / Allowance: ${formatINR(financials?.totalMonthlyIncome ?? 0)}
- Total Spent This Month: ${formatINR(financials?.totalMonthlyExpenses ?? 0)}
- Current Available Balance: ${formatINR(financials?.currentBalance ?? 0)}
- Safe-To-Spend Today: ${formatINR(financials?.safeToSpendToday ?? 0)}
- Remaining Days in Month: ${financials?.daysRemainingInMonth ?? 30} days
- Total Unpaid Commitments: ${formatINR(financials?.unpaidCommitments ?? 0)}
  (Essential unpaid: ${formatINR(financials?.unpaidEssentialCommitments ?? 0)})
- Credit Card Due: ${formatINR(financials?.creditCardTotalDue ?? 0)}
- Total Saved in Goals: ${formatINR(financials?.totalSavedInGoals ?? 0)}
- Spending Pace: ${financials?.spendingPace ?? 'on_track'}
- Month-end Forecast: ${formatINR(financials?.monthEndForecastBalance ?? 0)}

Recent Transactions Count: ${transactions?.length ?? 0}
Upcoming Commitments Count: ${commitments?.length ?? 0}
Active Savings Goals Count: ${savingsGoals?.length ?? 0}

INSTRUCTIONS:
1. Provide a concise, highly practical response (2 to 4 paragraphs or bullet points).
2. Answer the student's question directly using the grounded numbers above.
3. Suggest 2-3 realistic action steps (e.g. UPI limits, campus hacks, offer usage, splitting costs).
4. Never guilt-trip or shame the student. Be supportive!
`;

    const prompt = `${groundContext}\n\nStudent's Question: "${sanitizedQuery}"\n\nYour Answer:`;

    // Timeout Promise wrapper (8 seconds)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout')), 8000)
    );

    const generatePromise = model.generateContent(prompt);
    const result = (await Promise.race([generatePromise, timeoutPromise])) as GenerateContentResult;
    const textResponse = result.response.text();

    return NextResponse.json({
      response: textResponse,
      suggestedPrompts: [
        'Can I buy this today?',
        'How much should I save?',
        'Analyze my spending',
        'Help me reach month-end',
        'Give me a weekly budget'
      ],
      isOfflineFallback: false,
      source: `Google Gemini (${modelName} Live AI)`,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[Yuva Sathi API] Gemini call error or timeout:', errorMsg);

    // Fall back safely to local engine on API error or timeout
    const fallback = getLocalCoachResponse(
      body?.query || '',
      body?.financials || DEFAULT_EMPTY_FINANCIALS,
      body?.transactions || [],
      body?.commitments || [],
      body?.savingsGoals || []
    );

    return NextResponse.json({
      response: fallback.response,
      suggestedPrompts: fallback.suggestedPrompts,
      isOfflineFallback: true,
      source: 'Local Rule Engine (Gemini fallback)',
      errorDetails: errorMsg.substring(0, 80),
    });
  }
}
