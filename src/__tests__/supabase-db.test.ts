import { describe, it, expect, vi } from 'vitest';
import {
  fetchCloudUserData,
  saveProfileToCloud,
  upsertTransactionToCloud,
  deleteTransactionFromCloud,
} from '../lib/supabase/db';
import { Transaction } from '../types';

describe('Supabase Database Cloud Layer', () => {
  it('maps database rows correctly to Yuva Sathi types', async () => {
    const mockSupabase: any = {
      from: vi.fn((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                id: 'usr_mock_1',
                full_name: 'Ananya Verma',
                email: 'ananya@campus.ac.in',
                college: 'IIT Bombay',
                monthly_allowance: '15000',
                other_income: '2000',
                allowance_frequency: 'monthly',
                allowance_received_date: 5,
                onboarding_completed: true,
                created_at: '2026-01-01T00:00:00Z',
              },
              error: null,
            }),
          };
        }
        if (table === 'transactions') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: [
                {
                  id: 'tx_1',
                  amount: '450',
                  merchant: 'Campus Bookstore',
                  category: 'Education',
                  transaction_date: '2026-11-10',
                  payment_method: 'UPI',
                },
              ],
              error: null,
            }),
          };
        }
        // Commitments, savings_goals, credit_cards
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }),
    };

    const userData = await fetchCloudUserData(mockSupabase, 'usr_mock_1');
    expect(userData).not.toBeNull();
    expect(userData?.profile?.name).toBe('Ananya Verma');
    expect(userData?.income?.monthlyPocketMoney).toBe(15000);
    expect(userData?.transactions.length).toBe(1);
    expect(userData?.transactions[0].amount).toBe(450);
    expect(userData?.transactions[0].merchant).toBe('Campus Bookstore');
  });

  it('upserts a transaction with correct user_id foreign key', async () => {
    const upsertSpy = vi.fn().mockResolvedValue({ error: null });
    const mockSupabase: any = {
      from: vi.fn().mockReturnValue({
        upsert: upsertSpy,
      }),
    };

    const tx: Transaction = {
      id: 'tx_test_99',
      amount: 120,
      merchant: 'Tapri Chai',
      category: 'Food',
      date: '2026-11-20',
      paymentMethod: 'UPI',
    };

    const success = await upsertTransactionToCloud(mockSupabase, 'usr_mock_1', tx);
    expect(success).toBe(true);
    expect(upsertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'tx_test_99',
        user_id: 'usr_mock_1',
        amount: 120,
        merchant: 'Tapri Chai',
      })
    );
  });

  it('deletes a transaction with both id and user_id check for strict RLS safety', async () => {
    const eqSpy2 = vi.fn().mockResolvedValue({ error: null });
    const eqSpy1 = vi.fn().mockReturnValue({ eq: eqSpy2 });
    const deleteSpy = vi.fn().mockReturnValue({ eq: eqSpy1 });
    const mockSupabase: any = {
      from: vi.fn().mockReturnValue({
        delete: deleteSpy,
      }),
    };

    const success = await deleteTransactionFromCloud(mockSupabase, 'usr_safe_1', 'tx_delete_1');
    expect(success).toBe(true);
    expect(eqSpy1).toHaveBeenCalledWith('id', 'tx_delete_1');
    expect(eqSpy2).toHaveBeenCalledWith('user_id', 'usr_safe_1');
  });
});
