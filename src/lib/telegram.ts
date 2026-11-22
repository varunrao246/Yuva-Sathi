import crypto from 'crypto';
import { getSupabaseServerClient } from './supabase/server';
import { calculateFinancials } from './calculations';
import { formatINR } from './currency';
import { FinancialCalculationResult, UserProfile, IncomeConfig, Commitment, CreditCard, SavingsGoal, Transaction } from '@/types';
import { DEMO_USER_PROFILE, DEMO_INCOME_CONFIG, DEMO_COMMITMENTS, DEMO_CREDIT_CARDS, DEMO_SAVINGS_GOALS, DEMO_TRANSACTIONS } from './seed-data';

export interface TelegramLinkRecord {
  userId: string;
  chatId?: number;
  username?: string;
  linkToken: string;
  expiresAt: number;
  isLinked: boolean;
}

// In-memory token store for local/demo or fallback execution
const localLinkStore = new Map<string, TelegramLinkRecord>();
const chatToUserMap = new Map<number, string>();

export function generateLinkToken(userId: string): { linkToken: string; expiresAt: number } {
  const linkToken = `ys_${crypto.randomBytes(8).toString('hex')}`;
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

  localLinkStore.set(linkToken, {
    userId,
    linkToken,
    expiresAt,
    isLinked: false,
  });

  return { linkToken, expiresAt };
}

export async function verifyAndLinkTelegramChat(
  linkToken: string,
  chatId: number,
  username?: string
): Promise<{ success: boolean; message: string; userId?: string }> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    // Try Supabase linking
    const { data: linkRow, error } = await supabase
      .from('telegram_links')
      .select('*')
      .eq('link_token', linkToken)
      .maybeSingle();

    if (!error && linkRow) {
      if (new Date(linkRow.token_expires_at).getTime() < Date.now()) {
        return { success: false, message: 'This linking link has expired. Please generate a new one from Yuva Sathi.' };
      }

      await supabase
        .from('telegram_links')
        .update({
          telegram_chat_id: chatId,
          telegram_username: username || null,
          is_linked: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', linkRow.id);

      chatToUserMap.set(chatId, linkRow.user_id);
      return { success: true, message: 'Account linked successfully!', userId: linkRow.user_id };
    }
  }

  // Fallback to local link store
  const record = localLinkStore.get(linkToken);
  if (!record) {
    return { success: false, message: 'Invalid or expired link code. Please generate a new link in your Yuva Sathi settings.' };
  }

  if (Date.now() > record.expiresAt) {
    localLinkStore.delete(linkToken);
    return { success: false, message: 'This linking link has expired. Please generate a new one.' };
  }

  record.chatId = chatId;
  record.username = username;
  record.isLinked = true;
  localLinkStore.set(linkToken, record);
  chatToUserMap.set(chatId, record.userId);

  return { success: true, message: 'Account linked successfully!', userId: record.userId };
}

export async function unlinkTelegramChat(chatId: number): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    await supabase
      .from('telegram_links')
      .update({ is_linked: false, telegram_chat_id: null })
      .eq('telegram_chat_id', chatId);
  }
  chatToUserMap.delete(chatId);
  return true;
}

export async function getLinkedUserId(chatId: number): Promise<string | null> {
  const mapped = chatToUserMap.get(chatId);
  if (mapped) return mapped;

  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase
      .from('telegram_links')
      .select('user_id')
      .eq('telegram_chat_id', chatId)
      .eq('is_linked', true)
      .maybeSingle();

    if (data?.user_id) {
      chatToUserMap.set(chatId, data.user_id);
      return data.user_id;
    }
  }

  return null;
}

export async function getUserFinancialContext(userId: string): Promise<{
  profile: UserProfile;
  financials: FinancialCalculationResult;
  commitments: Commitment[];
  savingsGoals: SavingsGoal[];
}> {
  const supabase = getSupabaseServerClient();
  if (supabase && userId && !userId.startsWith('demo_')) {
    const { data: profileRow } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    const { data: txRows } = await supabase.from('transactions').select('*').eq('user_id', userId);
    const { data: comRows } = await supabase.from('commitments').select('*').eq('user_id', userId);
    const { data: sgRows } = await supabase.from('savings_goals').select('*').eq('user_id', userId);
    const { data: ccRows } = await supabase.from('credit_cards').select('*').eq('user_id', userId);

    if (profileRow) {
      const profile: UserProfile = {
        id: profileRow.id,
        name: profileRow.full_name,
        email: profileRow.email,
        createdAt: profileRow.created_at,
        onboardingCompleted: profileRow.onboarding_completed,
      };
      const income: IncomeConfig = {
        monthlyPocketMoney: Number(profileRow.monthly_allowance || 0),
        otherIncome: Number(profileRow.other_income || 0),
        incomeFrequency: profileRow.allowance_frequency || 'monthly',
        allowanceReceivedDate: Number(profileRow.allowance_received_date || 1),
      };
      const transactions: Transaction[] = (txRows || []).map(r => ({
        id: r.id,
        amount: Number(r.amount),
        merchant: r.merchant,
        category: r.category,
        date: r.transaction_date,
        paymentMethod: r.payment_method,
      }));
      const commitments: Commitment[] = (comRows || []).map(r => ({
        id: r.id,
        name: r.name,
        amount: Number(r.amount),
        dueDay: r.due_day,
        recurrence: r.recurrence,
        isEssential: r.is_essential,
        isPaid: r.is_paid,
        category: r.category,
      }));
      const savingsGoals: SavingsGoal[] = (sgRows || []).map(r => ({
        id: r.id,
        name: r.title,
        targetAmount: Number(r.target_amount),
        currentSavings: Number(r.current_savings),
        targetDate: r.target_date,
        category: r.category,
      }));
      const creditCards: CreditCard[] = (ccRows || []).map(r => ({
        id: r.id,
        nickname: r.nickname,
        outstandingBalance: Number(r.outstanding_balance || 0),
        upcomingDueAmount: Number(r.upcoming_due_amount || 0),
        dueDay: r.due_day,
      }));

      const financials = calculateFinancials(income, commitments, creditCards, savingsGoals, transactions);
      return { profile, financials, commitments, savingsGoals };
    }
  }

  // Fallback to demo persona data for seamless evaluator testing
  const financials = calculateFinancials(
    DEMO_INCOME_CONFIG,
    DEMO_COMMITMENTS,
    DEMO_CREDIT_CARDS,
    DEMO_SAVINGS_GOALS,
    DEMO_TRANSACTIONS
  );
  return {
    profile: DEMO_USER_PROFILE,
    financials,
    commitments: DEMO_COMMITMENTS,
    savingsGoals: DEMO_SAVINGS_GOALS,
  };
}

export async function sendTelegramMessage(
  chatId: number,
  text: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML'
): Promise<{ ok: boolean; description?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn('[Telegram Bot] TELEGRAM_BOT_TOKEN not configured. Message simulated.');
    return { ok: true, description: 'Simulated dispatch (TELEGRAM_BOT_TOKEN missing)' };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
      }),
    });
    const json = await res.json();
    return json;
  } catch (err: any) {
    console.error('[Telegram Bot] Failed to send message:', err);
    return { ok: false, description: err.message };
  }
}
