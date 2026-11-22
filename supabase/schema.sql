-- ==============================================================================
-- YUVA SATHI (युवा साथी) - COMPLETE SUPABASE DATABASE SCHEMA
-- "Your money. Your life. Your साथी."
-- 
-- Includes:
-- 1. Profiles (Student profile & allowance settings)
-- 2. Transactions (Income/Expense ledger)
-- 3. Commitments (Recurring bills, mess fees, rent, subscriptions)
-- 4. Savings Goals (Target goals & current contributions)
-- 5. Credit Cards (Limits, balances, dues)
-- 6. Telegram Links (Secure one-time linking tokens & notification prefs)
-- 7. Row Level Security (RLS) on 100% of tables for zero data leakage
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  college TEXT,
  course TEXT,
  study_year TEXT,
  monthly_allowance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  other_income NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  allowance_frequency TEXT NOT NULL DEFAULT 'monthly',
  allowance_received_date INTEGER NOT NULL DEFAULT 1 CHECK (allowance_received_date >= 1 AND allowance_received_date <= 31),
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 2. TRANSACTIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  merchant TEXT NOT NULL,
  category TEXT NOT NULL,
  transaction_date DATE NOT NULL,
  description TEXT,
  location TEXT,
  payment_method TEXT NOT NULL DEFAULT 'UPI',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date);

-- ------------------------------------------------------------------------------
-- 3. COMMITMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.commitments (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
  recurrence TEXT NOT NULL DEFAULT 'monthly',
  is_essential BOOLEAN NOT NULL DEFAULT true,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  category TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commitments_user_id ON public.commitments(user_id);

-- ------------------------------------------------------------------------------
-- 4. SAVINGS GOALS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount NUMERIC(12, 2) NOT NULL CHECK (target_amount >= 0),
  current_savings NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (current_savings >= 0),
  target_date DATE NOT NULL,
  category TEXT NOT NULL DEFAULT 'Gadgets',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_savings_goals_updated_at
  BEFORE UPDATE ON public.savings_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON public.savings_goals(user_id);

-- ------------------------------------------------------------------------------
-- 5. CREDIT CARDS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.credit_cards (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  credit_limit NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  outstanding_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  upcoming_due_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_cards_user_id ON public.credit_cards(user_id);

-- ------------------------------------------------------------------------------
-- 6. TELEGRAM LINKS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.telegram_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_chat_id BIGINT UNIQUE,
  telegram_username TEXT,
  link_token TEXT UNIQUE,
  token_expires_at TIMESTAMPTZ,
  is_linked BOOLEAN NOT NULL DEFAULT false,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  daily_summary_time TEXT NOT NULL DEFAULT '09:00',
  quiet_hours_start TEXT NOT NULL DEFAULT '22:00',
  quiet_hours_end TEXT NOT NULL DEFAULT '07:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_telegram_links_updated_at
  BEFORE UPDATE ON public.telegram_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_telegram_links_user_id ON public.telegram_links(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_links_token ON public.telegram_links(link_token);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict isolation: Users can NEVER read or write another user's financial records.
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_links ENABLE ROW LEVEL SECURITY;

-- 1. Profiles RLS
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Transactions RLS
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Commitments RLS
CREATE POLICY "Users can view own commitments"
  ON public.commitments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own commitments"
  ON public.commitments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own commitments"
  ON public.commitments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own commitments"
  ON public.commitments FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Savings Goals RLS
CREATE POLICY "Users can view own savings goals"
  ON public.savings_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings goals"
  ON public.savings_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings goals"
  ON public.savings_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings goals"
  ON public.savings_goals FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Credit Cards RLS
CREATE POLICY "Users can view own credit cards"
  ON public.credit_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credit cards"
  ON public.credit_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credit cards"
  ON public.credit_cards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own credit cards"
  ON public.credit_cards FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Telegram Links RLS
CREATE POLICY "Users can view own telegram links"
  ON public.telegram_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own telegram links"
  ON public.telegram_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own telegram links"
  ON public.telegram_links FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own telegram links"
  ON public.telegram_links FOR DELETE
  USING (auth.uid() = user_id);
