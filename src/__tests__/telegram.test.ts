import { describe, it, expect } from 'vitest';
import {
  generateLinkToken,
  verifyAndLinkTelegramChat,
  getLinkedUserId,
  unlinkTelegramChat,
  getUserFinancialContext
} from '../lib/telegram';

describe('Telegram Bot Integration & Account Linking', () => {
  it('generates cryptographically secure, 15-minute expiring link tokens', () => {
    const { linkToken, expiresAt } = generateLinkToken('user_test_123');
    expect(linkToken).toMatch(/^ys_[a-f0-9]{16}$/);
    expect(expiresAt).toBeGreaterThan(Date.now() + 14 * 60 * 1000);
    expect(expiresAt).toBeLessThanOrEqual(Date.now() + 15 * 60 * 1000 + 1000);
  });

  it('successfully links Telegram chat using a valid token', async () => {
    const { linkToken } = generateLinkToken('student_blr_456');
    const chatId = 987654321;
    const result = await verifyAndLinkTelegramChat(linkToken, chatId, 'rohan_sathi');

    expect(result.success).toBe(true);
    expect(result.userId).toBe('student_blr_456');

    const mappedUserId = await getLinkedUserId(chatId);
    expect(mappedUserId).toBe('student_blr_456');
  });

  it('rejects invalid or tampered link tokens', async () => {
    const result = await verifyAndLinkTelegramChat('invalid_fake_token', 123456789);
    expect(result.success).toBe(false);
    expect(result.message).toContain('Invalid or expired');
  });

  it('safely unlinks Telegram chat upon /disconnect command', async () => {
    const { linkToken } = generateLinkToken('user_disconnect_test');
    const chatId = 555666777;
    await verifyAndLinkTelegramChat(linkToken, chatId);

    const unlinked = await unlinkTelegramChat(chatId);
    expect(unlinked).toBe(true);

    const check = await getLinkedUserId(chatId);
    expect(check).toBeNull();
  });

  it('returns valid grounded financial numbers for linked user', async () => {
    const context = await getUserFinancialContext('demo_rohan');
    expect(context.profile.name).toBe('Rohan Sharma');
    expect(context.financials.totalMonthlyIncome).toBe(15000);
    expect(context.financials.safeToSpendToday).toBeGreaterThan(0);
    expect(context.commitments.length).toBeGreaterThan(0);
  });
});
