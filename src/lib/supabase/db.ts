import { SupabaseClient } from '@supabase/supabase-js';
import {
  UserProfile,
  IncomeConfig,
  Transaction,
  Commitment,
  CreditCard,
  SavingsGoal
} from '@/types';

export interface CloudUserData {
  profile: UserProfile | null;
  income: IncomeConfig | null;
  transactions: Transaction[];
  commitments: Commitment[];
  creditCards: CreditCard[];
  savingsGoals: SavingsGoal[];
}

export async function fetchCloudUserData(
  supabase: SupabaseClient,
  userId: string
): Promise<CloudUserData | null> {
  try {
    // 1. Fetch Profile
    const { data: profileRow, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileErr) {
      console.error('[Supabase DB] Error fetching profile:', profileErr.message);
      return null;
    }

    let profile: UserProfile | null = null;
    let income: IncomeConfig | null = null;

    if (profileRow) {
      profile = {
        id: profileRow.id,
        name: profileRow.full_name,
        email: profileRow.email,
        college: profileRow.college || undefined,
        course: profileRow.course || undefined,
        studyYear: profileRow.study_year || undefined,
        createdAt: profileRow.created_at,
        onboardingCompleted: profileRow.onboarding_completed,
      };

      income = {
        monthlyPocketMoney: Number(profileRow.monthly_allowance || 0),
        otherIncome: Number(profileRow.other_income || 0),
        incomeFrequency: profileRow.allowance_frequency || 'monthly',
        allowanceReceivedDate: Number(profileRow.allowance_received_date || 1),
      };
    }

    // 2. Fetch Transactions, Commitments, Savings Goals, and Credit Cards in parallel
    const [
      { data: txRows },
      { data: comRows },
      { data: sgRows },
      { data: ccRows }
    ] = await Promise.all([
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('transaction_date', { ascending: false }),
      supabase
        .from('commitments')
        .select('*')
        .eq('user_id', userId)
        .order('due_day', { ascending: true }),
      supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId)
        .order('target_date', { ascending: true }),
      supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', userId)
        .order('due_day', { ascending: true }),
    ]);

    const transactions: Transaction[] = (txRows || []).map(r => ({
      id: r.id,
      amount: Number(r.amount),
      merchant: r.merchant,
      category: r.category,
      date: r.transaction_date,
      description: r.description || undefined,
      location: r.location || undefined,
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
      notes: r.notes || undefined,
    }));

    const savingsGoals: SavingsGoal[] = (sgRows || []).map(r => ({
      id: r.id,
      name: r.title,
      targetAmount: Number(r.target_amount),
      currentSavings: Number(r.current_savings),
      targetDate: r.target_date,
      category: r.category,
      isCompleted: r.is_completed,
    }));

    const creditCards: CreditCard[] = (ccRows || []).map(r => ({
      id: r.id,
      nickname: r.nickname,
      creditLimit: Number(r.credit_limit || 0),
      outstandingBalance: Number(r.outstanding_balance || 0),
      upcomingDueAmount: Number(r.upcoming_due_amount || 0),
      dueDay: r.due_day,
    }));

    return {
      profile,
      income,
      transactions,
      commitments,
      savingsGoals,
      creditCards,
    };
  } catch (err) {
    console.error('[Supabase DB] Error loading user cloud data:', err);
    return null;
  }
}

export async function saveProfileToCloud(
  supabase: SupabaseClient,
  userId: string,
  profile: Partial<UserProfile>,
  income?: Partial<IncomeConfig>
): Promise<boolean> {
  try {
    const payload: Record<string, any> = {
      id: userId,
      updated_at: new Date().toISOString(),
    };

    if (profile.name) payload.full_name = profile.name;
    if (profile.email) payload.email = profile.email;
    if (profile.college !== undefined) payload.college = profile.college;
    if (profile.course !== undefined) payload.course = profile.course;
    if (profile.studyYear !== undefined) payload.study_year = profile.studyYear;
    if (profile.onboardingCompleted !== undefined) payload.onboarding_completed = profile.onboardingCompleted;

    if (income) {
      if (income.monthlyPocketMoney !== undefined) payload.monthly_allowance = income.monthlyPocketMoney;
      if (income.otherIncome !== undefined) payload.other_income = income.otherIncome;
      if (income.incomeFrequency !== undefined) payload.allowance_frequency = income.incomeFrequency;
      if (income.allowanceReceivedDate !== undefined) payload.allowance_received_date = income.allowanceReceivedDate;
    }

    const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.error('[Supabase DB] Failed saving profile:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase DB] Error saving profile:', err);
    return false;
  }
}

export async function upsertTransactionToCloud(
  supabase: SupabaseClient,
  userId: string,
  tx: Transaction
): Promise<boolean> {
  try {
    const { error } = await supabase.from('transactions').upsert({
      id: tx.id,
      user_id: userId,
      amount: tx.amount,
      merchant: tx.merchant,
      category: tx.category,
      transaction_date: tx.date,
      description: tx.description || null,
      location: tx.location || null,
      payment_method: tx.paymentMethod || 'UPI',
    });
    if (error) {
      console.error('[Supabase DB] Failed upserting transaction:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase DB] Error upserting transaction:', err);
    return false;
  }
}

export async function deleteTransactionFromCloud(
  supabase: SupabaseClient,
  userId: string,
  txId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', txId)
      .eq('user_id', userId);
    return !error;
  } catch (err) {
    console.error('[Supabase DB] Error deleting transaction:', err);
    return false;
  }
}

export async function upsertCommitmentToCloud(
  supabase: SupabaseClient,
  userId: string,
  c: Commitment
): Promise<boolean> {
  try {
    const { error } = await supabase.from('commitments').upsert({
      id: c.id,
      user_id: userId,
      name: c.name,
      amount: c.amount,
      due_day: c.dueDay,
      recurrence: c.recurrence,
      is_essential: c.isEssential,
      is_paid: c.isPaid,
      category: c.category,
      notes: c.notes || null,
    });
    return !error;
  } catch (err) {
    console.error('[Supabase DB] Error upserting commitment:', err);
    return false;
  }
}

export async function deleteCommitmentFromCloud(
  supabase: SupabaseClient,
  userId: string,
  cId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('commitments')
      .delete()
      .eq('id', cId)
      .eq('user_id', userId);
    return !error;
  } catch (err) {
    console.error('[Supabase DB] Error deleting commitment:', err);
    return false;
  }
}

export async function upsertSavingsGoalToCloud(
  supabase: SupabaseClient,
  userId: string,
  sg: SavingsGoal
): Promise<boolean> {
  try {
    const { error } = await supabase.from('savings_goals').upsert({
      id: sg.id,
      user_id: userId,
      title: sg.name,
      target_amount: sg.targetAmount,
      current_savings: sg.currentSavings,
      target_date: sg.targetDate,
      category: sg.category,
      is_completed: sg.isCompleted || false,
    });
    return !error;
  } catch (err) {
    console.error('[Supabase DB] Error upserting savings goal:', err);
    return false;
  }
}

export async function deleteSavingsGoalFromCloud(
  supabase: SupabaseClient,
  userId: string,
  sgId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', sgId)
      .eq('user_id', userId);
    return !error;
  } catch (err) {
    console.error('[Supabase DB] Error deleting savings goal:', err);
    return false;
  }
}

export async function upsertCreditCardToCloud(
  supabase: SupabaseClient,
  userId: string,
  cc: CreditCard
): Promise<boolean> {
  try {
    const { error } = await supabase.from('credit_cards').upsert({
      id: cc.id,
      user_id: userId,
      nickname: cc.nickname,
      credit_limit: cc.creditLimit || 0,
      outstanding_balance: cc.outstandingBalance,
      upcoming_due_amount: cc.upcomingDueAmount,
      due_day: cc.dueDay,
    });
    return !error;
  } catch (err) {
    console.error('[Supabase DB] Error upserting credit card:', err);
    return false;
  }
}

export async function deleteCreditCardFromCloud(
  supabase: SupabaseClient,
  userId: string,
  ccId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('credit_cards')
      .delete()
      .eq('id', ccId)
      .eq('user_id', userId);
    return !error;
  } catch (err) {
    console.error('[Supabase DB] Error deleting credit card:', err);
    return false;
  }
}
