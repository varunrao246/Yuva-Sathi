'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  IncomeConfig,
  Commitment,
  CreditCard,
  SavingsGoal,
  Transaction,
  FinancialCalculationResult,
  ScholarshipApplicationStatus
} from '@/types';
import {
  DEMO_USER_PROFILE,
  DEMO_INCOME_CONFIG,
  DEMO_COMMITMENTS,
  DEMO_CREDIT_CARDS,
  DEMO_SAVINGS_GOALS,
  DEMO_TRANSACTIONS
} from './seed-data';
import { calculateFinancials } from './calculations';
import { getSupabaseBrowserClient } from './supabase/client';
import {
  saveProfileToCloud,
  upsertTransactionToCloud,
  deleteTransactionFromCloud,
  upsertCommitmentToCloud,
  deleteCommitmentFromCloud,
  upsertSavingsGoalToCloud,
  deleteSavingsGoalFromCloud,
  upsertCreditCardToCloud,
  deleteCreditCardFromCloud,
  fetchCloudUserData,
} from './supabase/db';

export type AppMode = 'demo' | 'user';

const STORAGE_KEYS = {
  MODE: 'yuva_sathi_v1_app_mode',
  IS_LOGGED_IN: 'yuva_sathi_v1_is_logged_in',
  // User namespace
  USER_PROFILE: 'yuva_sathi_v1_user_profile',
  USER_INCOME: 'yuva_sathi_v1_user_income',
  USER_COMMITMENTS: 'yuva_sathi_v1_user_commitments',
  USER_CARDS: 'yuva_sathi_v1_user_cards',
  USER_SAVINGS: 'yuva_sathi_v1_user_savings',
  USER_TRANSACTIONS: 'yuva_sathi_v1_user_transactions',
  USER_SCHOLARSHIPS: 'yuva_sathi_v1_user_scholarships',
  USER_OPPORTUNITIES: 'yuva_sathi_v1_user_opportunities',
  // Demo namespace (isolated so real data is never contaminated)
  DEMO_PROFILE: 'yuva_sathi_v1_demo_profile',
  DEMO_INCOME: 'yuva_sathi_v1_demo_income',
  DEMO_COMMITMENTS: 'yuva_sathi_v1_demo_commitments',
  DEMO_CARDS: 'yuva_sathi_v1_demo_cards',
  DEMO_SAVINGS: 'yuva_sathi_v1_demo_savings',
  DEMO_TRANSACTIONS: 'yuva_sathi_v1_demo_transactions',
  DEMO_SCHOLARSHIPS: 'yuva_sathi_v1_demo_scholarships',
  DEMO_OPPORTUNITIES: 'yuva_sathi_v1_demo_opportunities',
};

const DEFAULT_DEMO_SCHOLARSHIPS: Record<string, ScholarshipApplicationStatus> = {
  sch_nsp_central_sector: 'saved',
  sch_reliance_foundation: 'applying',
};

const DEFAULT_DEMO_OPPORTUNITIES: string[] = ['opp_chegg_expert', 'opp_internshala_isp'];

const SYNC_EVENT = 'yuva_store_update';

function getStoredItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[Yuva Sathi Storage] Corrupt data in key "${key}", falling back to default`, err);
    return defaultValue;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(SYNC_EVENT));
  } catch (err) {
    console.error(`[Yuva Sathi Storage] Failed writing to key "${key}"`, err);
  }
}

export function initializeStoreIfEmpty(): void {
  if (typeof window === 'undefined') return;

  // Initialize demo data if missing
  if (!localStorage.getItem(STORAGE_KEYS.DEMO_PROFILE)) {
    localStorage.setItem(STORAGE_KEYS.DEMO_PROFILE, JSON.stringify(DEMO_USER_PROFILE));
    localStorage.setItem(STORAGE_KEYS.DEMO_INCOME, JSON.stringify(DEMO_INCOME_CONFIG));
    localStorage.setItem(STORAGE_KEYS.DEMO_COMMITMENTS, JSON.stringify(DEMO_COMMITMENTS));
    localStorage.setItem(STORAGE_KEYS.DEMO_CARDS, JSON.stringify(DEMO_CREDIT_CARDS));
    localStorage.setItem(STORAGE_KEYS.DEMO_SAVINGS, JSON.stringify(DEMO_SAVINGS_GOALS));
    localStorage.setItem(STORAGE_KEYS.DEMO_TRANSACTIONS, JSON.stringify(DEMO_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.DEMO_SCHOLARSHIPS, JSON.stringify(DEFAULT_DEMO_SCHOLARSHIPS));
    localStorage.setItem(STORAGE_KEYS.DEMO_OPPORTUNITIES, JSON.stringify(DEFAULT_DEMO_OPPORTUNITIES));
  }

  // Default to demo mode for instant evaluator presentation if no mode set
  if (!localStorage.getItem(STORAGE_KEYS.MODE)) {
    localStorage.setItem(STORAGE_KEYS.MODE, JSON.stringify('demo'));
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, JSON.stringify(true));
  }
}

export function resetDemoStudentData(): void {
  setStoredItem(STORAGE_KEYS.DEMO_PROFILE, DEMO_USER_PROFILE);
  setStoredItem(STORAGE_KEYS.DEMO_INCOME, DEMO_INCOME_CONFIG);
  setStoredItem(STORAGE_KEYS.DEMO_COMMITMENTS, DEMO_COMMITMENTS);
  setStoredItem(STORAGE_KEYS.DEMO_CARDS, DEMO_CREDIT_CARDS);
  setStoredItem(STORAGE_KEYS.DEMO_SAVINGS, DEMO_SAVINGS_GOALS);
  setStoredItem(STORAGE_KEYS.DEMO_TRANSACTIONS, DEMO_TRANSACTIONS);
  setStoredItem(STORAGE_KEYS.DEMO_SCHOLARSHIPS, DEFAULT_DEMO_SCHOLARSHIPS);
  setStoredItem(STORAGE_KEYS.DEMO_OPPORTUNITIES, DEFAULT_DEMO_OPPORTUNITIES);
}

export function useYuvaStore() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [appMode, setAppModeState] = useState<AppMode>('demo');
  const [isLoggedIn, setIsLoggedInState] = useState<boolean>(true);

  const [profile, setProfileState] = useState<UserProfile>(DEMO_USER_PROFILE);
  const [income, setIncomeState] = useState<IncomeConfig>(DEMO_INCOME_CONFIG);
  const [commitments, setCommitmentsState] = useState<Commitment[]>(DEMO_COMMITMENTS);
  const [creditCards, setCreditCardsState] = useState<CreditCard[]>(DEMO_CREDIT_CARDS);
  const [savingsGoals, setSavingsGoalsState] = useState<SavingsGoal[]>(DEMO_SAVINGS_GOALS);
  const [transactions, setTransactionsState] = useState<Transaction[]>(DEMO_TRANSACTIONS);
  const [trackedScholarships, setTrackedScholarshipsState] = useState<Record<string, ScholarshipApplicationStatus>>(DEFAULT_DEMO_SCHOLARSHIPS);
  const [bookmarkedOpportunities, setBookmarkedOpportunitiesState] = useState<string[]>(DEFAULT_DEMO_OPPORTUNITIES);

  const refreshFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return;
    const mode = getStoredItem<AppMode>(STORAGE_KEYS.MODE, 'demo');
    const loggedIn = getStoredItem<boolean>(STORAGE_KEYS.IS_LOGGED_IN, true);
    setAppModeState(mode);
    setIsLoggedInState(loggedIn);

    if (mode === 'demo') {
      setProfileState(getStoredItem(STORAGE_KEYS.DEMO_PROFILE, DEMO_USER_PROFILE));
      setIncomeState(getStoredItem(STORAGE_KEYS.DEMO_INCOME, DEMO_INCOME_CONFIG));
      setCommitmentsState(getStoredItem(STORAGE_KEYS.DEMO_COMMITMENTS, DEMO_COMMITMENTS));
      setCreditCardsState(getStoredItem(STORAGE_KEYS.DEMO_CARDS, DEMO_CREDIT_CARDS));
      setSavingsGoalsState(getStoredItem(STORAGE_KEYS.DEMO_SAVINGS, DEMO_SAVINGS_GOALS));
      setTransactionsState(getStoredItem(STORAGE_KEYS.DEMO_TRANSACTIONS, DEMO_TRANSACTIONS));
      setTrackedScholarshipsState(getStoredItem(STORAGE_KEYS.DEMO_SCHOLARSHIPS, DEFAULT_DEMO_SCHOLARSHIPS));
      setBookmarkedOpportunitiesState(getStoredItem(STORAGE_KEYS.DEMO_OPPORTUNITIES, DEFAULT_DEMO_OPPORTUNITIES));
    } else {
      // User mode
      const emptyUser: UserProfile = {
        id: `usr_${Date.now()}`,
        name: 'New Student',
        email: 'student@campus.ac.in',
        createdAt: new Date().toISOString(),
        onboardingCompleted: false,
      };
      const emptyIncome: IncomeConfig = {
        monthlyPocketMoney: 0,
        otherIncome: 0,
        incomeFrequency: 'monthly',
        allowanceReceivedDate: 1,
      };
      setProfileState(getStoredItem(STORAGE_KEYS.USER_PROFILE, emptyUser));
      setIncomeState(getStoredItem(STORAGE_KEYS.USER_INCOME, emptyIncome));
      setCommitmentsState(getStoredItem(STORAGE_KEYS.USER_COMMITMENTS, []));
      setCreditCardsState(getStoredItem(STORAGE_KEYS.USER_CARDS, []));
      setSavingsGoalsState(getStoredItem(STORAGE_KEYS.USER_SAVINGS, []));
      setTransactionsState(getStoredItem(STORAGE_KEYS.USER_TRANSACTIONS, []));
      setTrackedScholarshipsState(getStoredItem(STORAGE_KEYS.USER_SCHOLARSHIPS, {}));
      setBookmarkedOpportunitiesState(getStoredItem(STORAGE_KEYS.USER_OPPORTUNITIES, []));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    initializeStoreIfEmpty();
    refreshFromStorage();

    const handleUpdate = () => {
      refreshFromStorage();
    };

    window.addEventListener(SYNC_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(SYNC_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refreshFromStorage]);

  // Mode switcher
  const switchMode = (mode: AppMode) => {
    setStoredItem(STORAGE_KEYS.MODE, mode);
    setStoredItem(STORAGE_KEYS.IS_LOGGED_IN, true);
  };

  // Helper for background cloud sync with Supabase (strictly ignored in demo mode)
  const syncToCloud = useCallback((action: (supabase: any, userId: string) => Promise<any>) => {
    if (appMode !== 'user') return;
    const client = getSupabaseBrowserClient();
    if (!client || !profile.id) return;
    action(client, profile.id).catch((err: any) => {
      console.warn('[Yuva Sathi Supabase Sync Warning]', err);
    });
  }, [appMode, profile.id]);

  // Helper to get active keys based on current mode
  const getKeys = () => {
    const isDemo = appMode === 'demo';
    return {
      profileKey: isDemo ? STORAGE_KEYS.DEMO_PROFILE : STORAGE_KEYS.USER_PROFILE,
      incomeKey: isDemo ? STORAGE_KEYS.DEMO_INCOME : STORAGE_KEYS.USER_INCOME,
      commitmentsKey: isDemo ? STORAGE_KEYS.DEMO_COMMITMENTS : STORAGE_KEYS.USER_COMMITMENTS,
      cardsKey: isDemo ? STORAGE_KEYS.DEMO_CARDS : STORAGE_KEYS.USER_CARDS,
      savingsKey: isDemo ? STORAGE_KEYS.DEMO_SAVINGS : STORAGE_KEYS.USER_SAVINGS,
      txKey: isDemo ? STORAGE_KEYS.DEMO_TRANSACTIONS : STORAGE_KEYS.USER_TRANSACTIONS,
      scholarshipsKey: isDemo ? STORAGE_KEYS.DEMO_SCHOLARSHIPS : STORAGE_KEYS.USER_SCHOLARSHIPS,
      opportunitiesKey: isDemo ? STORAGE_KEYS.DEMO_OPPORTUNITIES : STORAGE_KEYS.USER_OPPORTUNITIES,
    };
  };

  // Actions
  const updateProfile = (data: Partial<UserProfile>) => {
    const { profileKey } = getKeys();
    const updated = { ...profile, ...data };
    setStoredItem(profileKey, updated);
    syncToCloud((supabase, uid) => saveProfileToCloud(supabase, uid, updated));
  };

  const updateIncome = (data: Partial<IncomeConfig>) => {
    const { incomeKey } = getKeys();
    const updated = { ...income, ...data };
    setStoredItem(incomeKey, updated);
    syncToCloud((supabase, uid) => saveProfileToCloud(supabase, uid, {}, updated));
  };

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const { txKey } = getKeys();
    const newTx: Transaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    const updated = [newTx, ...transactions];
    setStoredItem(txKey, updated);
    syncToCloud((supabase, uid) => upsertTransactionToCloud(supabase, uid, newTx));
  };

  const updateTransaction = (id: string, tx: Partial<Transaction>) => {
    const { txKey } = getKeys();
    const updated = transactions.map(t => (t.id === id ? { ...t, ...tx } : t));
    setStoredItem(txKey, updated);
    const targetTx = updated.find(t => t.id === id);
    if (targetTx) {
      syncToCloud((supabase, uid) => upsertTransactionToCloud(supabase, uid, targetTx));
    }
  };

  const deleteTransaction = (id: string) => {
    const { txKey } = getKeys();
    const updated = transactions.filter(t => t.id !== id);
    setStoredItem(txKey, updated);
    syncToCloud((supabase, uid) => deleteTransactionFromCloud(supabase, uid, id));
  };

  const addCommitment = (c: Omit<Commitment, 'id'>) => {
    const { commitmentsKey } = getKeys();
    const newC: Commitment = {
      ...c,
      id: `com_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [...commitments, newC];
    setStoredItem(commitmentsKey, updated);
    syncToCloud((supabase, uid) => upsertCommitmentToCloud(supabase, uid, newC));
  };

  const toggleCommitmentPaid = (id: string) => {
    const { commitmentsKey } = getKeys();
    const updated = commitments.map(c => (c.id === id ? { ...c, isPaid: !c.isPaid } : c));
    setStoredItem(commitmentsKey, updated);
    const targetC = updated.find(c => c.id === id);
    if (targetC) {
      syncToCloud((supabase, uid) => upsertCommitmentToCloud(supabase, uid, targetC));
    }
  };

  const deleteCommitment = (id: string) => {
    const { commitmentsKey } = getKeys();
    const updated = commitments.filter(c => c.id !== id);
    setStoredItem(commitmentsKey, updated);
    syncToCloud((supabase, uid) => deleteCommitmentFromCloud(supabase, uid, id));
  };

  const addCreditCard = (card: Omit<CreditCard, 'id'>) => {
    const { cardsKey } = getKeys();
    const newCard: CreditCard = {
      ...card,
      id: `cc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [...creditCards, newCard];
    setStoredItem(cardsKey, updated);
    syncToCloud((supabase, uid) => upsertCreditCardToCloud(supabase, uid, newCard));
  };

  const deleteCreditCard = (id: string) => {
    const { cardsKey } = getKeys();
    const updated = creditCards.filter(c => c.id !== id);
    setStoredItem(cardsKey, updated);
    syncToCloud((supabase, uid) => deleteCreditCardFromCloud(supabase, uid, id));
  };

  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id'>) => {
    const { savingsKey } = getKeys();
    const newGoal: SavingsGoal = {
      ...goal,
      id: `sg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [...savingsGoals, newGoal];
    setStoredItem(savingsKey, updated);
    syncToCloud((supabase, uid) => upsertSavingsGoalToCloud(supabase, uid, newGoal));
  };

  const updateSavingsGoal = (id: string, goal: Partial<SavingsGoal>) => {
    const { savingsKey } = getKeys();
    const updated = savingsGoals.map(g => (g.id === id ? { ...g, ...goal } : g));
    setStoredItem(savingsKey, updated);
    const targetGoal = updated.find(g => g.id === id);
    if (targetGoal) {
      syncToCloud((supabase, uid) => upsertSavingsGoalToCloud(supabase, uid, targetGoal));
    }
  };

  const deleteSavingsGoal = (id: string) => {
    const { savingsKey } = getKeys();
    const updated = savingsGoals.filter(g => g.id !== id);
    setStoredItem(savingsKey, updated);
    syncToCloud((supabase, uid) => deleteSavingsGoalFromCloud(supabase, uid, id));
  };

  const registerUser = (newProfile: Omit<UserProfile, 'id' | 'createdAt' | 'onboardingCompleted'>) => {
    const user: UserProfile = {
      ...newProfile,
      id: `usr_${Date.now()}`,
      createdAt: new Date().toISOString(),
      onboardingCompleted: false,
    };
    const emptyIncome: IncomeConfig = {
      monthlyPocketMoney: 0,
      otherIncome: 0,
      incomeFrequency: 'monthly',
      allowanceReceivedDate: 1,
    };
    setStoredItem(STORAGE_KEYS.USER_PROFILE, user);
    setStoredItem(STORAGE_KEYS.USER_INCOME, emptyIncome);
    setStoredItem(STORAGE_KEYS.USER_COMMITMENTS, []);
    setStoredItem(STORAGE_KEYS.USER_CARDS, []);
    setStoredItem(STORAGE_KEYS.USER_SAVINGS, []);
    setStoredItem(STORAGE_KEYS.USER_TRANSACTIONS, []);
    setStoredItem(STORAGE_KEYS.MODE, 'user');
    setStoredItem(STORAGE_KEYS.IS_LOGGED_IN, true);
    syncToCloud((supabase, uid) => saveProfileToCloud(supabase, uid, user, emptyIncome));
  };

  const logout = () => {
    setStoredItem(STORAGE_KEYS.IS_LOGGED_IN, false);
  };

  const loginDemo = (name: string, email: string) => {
    const updatedProfile: UserProfile = {
      ...profile,
      name,
      email,
      onboardingCompleted: true,
    };
    const { profileKey } = getKeys();
    setStoredItem(profileKey, updatedProfile);
    setStoredItem(STORAGE_KEYS.IS_LOGGED_IN, true);
  };

  const updateScholarshipStatus = (id: string, status: ScholarshipApplicationStatus | null) => {
    const { scholarshipsKey } = getKeys();
    const updated = { ...trackedScholarships };
    if (status === null) {
      delete updated[id];
    } else {
      updated[id] = status;
    }
    setTrackedScholarshipsState(updated);
    setStoredItem(scholarshipsKey, updated);
  };

  const toggleBookmarkOpportunity = (id: string) => {
    const { opportunitiesKey } = getKeys();
    let updated: string[];
    if (bookmarkedOpportunities.includes(id)) {
      updated = bookmarkedOpportunities.filter(item => item !== id);
    } else {
      updated = [...bookmarkedOpportunities, id];
    }
    setBookmarkedOpportunitiesState(updated);
    setStoredItem(opportunitiesKey, updated);
  };

  const financials: FinancialCalculationResult = calculateFinancials(
    income,
    commitments,
    creditCards,
    savingsGoals,
    transactions
  );

  return {
    isLoaded,
    appMode,
    isLoggedIn,
    profile,
    income,
    commitments,
    creditCards,
    savingsGoals,
    transactions,
    financials,
    trackedScholarships,
    bookmarkedOpportunities,
    // Actions
    switchMode,
    registerUser,
    updateProfile,
    updateIncome,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCommitment,
    toggleCommitmentPaid,
    deleteCommitment,
    addCreditCard,
    deleteCreditCard,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    updateScholarshipStatus,
    toggleBookmarkOpportunity,
    resetDemoStudentData,
    logout,
    loginDemo,
  };
}
