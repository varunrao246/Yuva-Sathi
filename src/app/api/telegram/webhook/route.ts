import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAndLinkTelegramChat,
  unlinkTelegramChat,
  getLinkedUserId,
  getUserFinancialContext,
  sendTelegramMessage
} from '@/lib/telegram';
import { formatINR } from '@/lib/currency';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Secret Token if configured
    const configuredSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (configuredSecret) {
      const headerSecret = req.headers.get('x-telegram-bot-api-secret-token');
      if (headerSecret !== configuredSecret) {
        return NextResponse.json({ error: 'Unauthorized webhook caller' }, { status: 401 });
      }
    }

    const update = await req.json().catch(() => null);
    if (!update || !update.message) {
      return NextResponse.json({ ok: true, note: 'No message in update' });
    }

    const { message } = update;
    const chatId = message.chat?.id;
    const text: string = (message.text || '').trim();
    const username = message.from?.username || message.from?.first_name || 'Student';

    if (!chatId) {
      return NextResponse.json({ ok: true });
    }

    // 2. Command Dispatcher
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      const linkToken = parts[1]?.trim();

      if (linkToken) {
        // Attempt linking
        const linkResult = await verifyAndLinkTelegramChat(linkToken, chatId, username);
        if (linkResult.success) {
          const { profile, financials } = await getUserFinancialContext(linkResult.userId || 'demo');
          const welcomeMsg = `🌱 <b>Welcome to Yuva Sathi, ${profile.name}!</b>\n\n` +
            `Your Telegram is now securely connected to your personal money companion.\n\n` +
            `📊 <b>Quick Financial Snapshot:</b>\n` +
            `• <b>Available Funds:</b> ${formatINR(financials.currentBalance)}\n` +
            `• <b>Safe to Spend Today:</b> ${formatINR(financials.safeToSpendToday)}\n` +
            `• <b>Spending Pace:</b> ${financials.spendingPace.replace('_', ' ').toUpperCase()}\n\n` +
            `<b>Commands you can use:</b>\n` +
            `• /balance - Live balance & today's safe spend\n` +
            `• /today - Today's safe spending limit\n` +
            `• /budget - Monthly overview & upcoming commitments\n` +
            `• /savings - Track your savings goals\n` +
            `• /disconnect - Unlink this Telegram account\n` +
            `• /help - Show all commands`;

          await sendTelegramMessage(chatId, welcomeMsg);
          return NextResponse.json({ ok: true, action: 'linked' });
        } else {
          await sendTelegramMessage(chatId, `⚠️ <b>Linking Failed:</b> ${linkResult.message}`);
          return NextResponse.json({ ok: true, action: 'link_failed' });
        }
      } else {
        // No token provided
        const infoMsg = `👋 <b>Namaste from Yuva Sathi (युवा साथी)!</b>\n\n` +
          `To link your student account and get proactive safe-to-spend alerts:\n\n` +
          `1. Open Yuva Sathi in your browser\n` +
          `2. Go to <b>Settings → Telegram Money Alerts</b>\n` +
          `3. Click <b>"Connect to Telegram"</b> to get your 1-click linking link!\n\n` +
          `If you are testing evaluator demo mode, reply with <code>/balance</code> to view demo numbers.`;
        await sendTelegramMessage(chatId, infoMsg);
        return NextResponse.json({ ok: true, action: 'start_info' });
      }
    }

    // Handle Unlink / Disconnect
    if (text === '/disconnect') {
      await unlinkTelegramChat(chatId);
      await sendTelegramMessage(chatId, '✅ <b>Account unlinked.</b> You will no longer receive financial alerts here. You can re-link anytime from Yuva Sathi settings.');
      return NextResponse.json({ ok: true, action: 'disconnected' });
    }

    // Handle Help
    if (text === '/help') {
      const helpMsg = `🌱 <b>Yuva Sathi Bot Commands:</b>\n\n` +
        `• <b>/balance</b> — Real-time available balance & safe-to-spend today\n` +
        `• <b>/today</b> — Today's safe spending limit & daily pace\n` +
        `• <b>/budget</b> — Monthly income, expenses, & unpaid commitments\n` +
        `• <b>/savings</b> — Active savings goals & progress\n` +
        `• <b>/disconnect</b> — Unlink Telegram account\n\n` +
        `<i>Your money. Your life. Your साथी.</i>`;
      await sendTelegramMessage(chatId, helpMsg);
      return NextResponse.json({ ok: true, action: 'help' });
    }

    // For financial commands, check if linked
    const linkedUserId = await getLinkedUserId(chatId);
    const userIdToUse = linkedUserId || 'demo_rohan';

    const { profile, financials, commitments, savingsGoals } = await getUserFinancialContext(userIdToUse);

    if (text === '/balance') {
      const msg = `💰 <b>Yuva Sathi Balance Check</b>\n\n` +
        `• <b>Available Funds:</b> ${formatINR(financials.currentBalance)}\n` +
        `• <b>Safe to Spend Today:</b> ${formatINR(financials.safeToSpendToday)}\n` +
        `• <b>Monthly Allowance:</b> ${formatINR(financials.totalMonthlyIncome)}\n` +
        `• <b>Total Spent This Month:</b> ${formatINR(financials.totalMonthlyExpenses)}\n` +
        `• <b>Days Remaining:</b> ${financials.daysRemainingInMonth} days\n\n` +
        `🚦 <b>Spending Pace:</b> <b>${financials.spendingPace.replace('_', ' ').toUpperCase()}</b>`;
      await sendTelegramMessage(chatId, msg);
      return NextResponse.json({ ok: true, action: 'balance' });
    }

    if (text === '/today') {
      const msg = `📅 <b>Today's Spending Limit</b>\n\n` +
        `• <b>Safe to Spend Today:</b> <b>${formatINR(financials.safeToSpendToday)}</b>\n` +
        `• <b>Daily Base Budget:</b> ${formatINR(financials.dailyBudget)}/day\n` +
        `• <b>Remaining Days in Month:</b> ${financials.daysRemainingInMonth} days\n\n` +
        `💡 <i>Tip: Keeping today's purchases under ${formatINR(financials.safeToSpendToday)} ensures all your upcoming commitments and savings goals remain 100% funded!</i>`;
      await sendTelegramMessage(chatId, msg);
      return NextResponse.json({ ok: true, action: 'today' });
    }

    if (text === '/budget') {
      const upcomingEssential = commitments.filter(c => !c.isPaid && c.isEssential);
      const msg = `📊 <b>Monthly Budget Breakdown</b>\n\n` +
        `• <b>Total Income:</b> ${formatINR(financials.totalMonthlyIncome)}\n` +
        `• <b>Total Expenses:</b> ${formatINR(financials.totalMonthlyExpenses)}\n` +
        `• <b>Unpaid Commitments:</b> ${formatINR(financials.unpaidCommitments)} (${upcomingEssential.length} essential)\n` +
        `• <b>Credit Card Dues:</b> ${formatINR(financials.creditCardTotalDue)}\n` +
        `• <b>Month-End Forecast Balance:</b> ${formatINR(financials.monthEndForecastBalance)}\n\n` +
        `🌱 <i>Calculated with deterministic precision by Yuva Sathi.</i>`;
      await sendTelegramMessage(chatId, msg);
      return NextResponse.json({ ok: true, action: 'budget' });
    }

    if (text === '/savings') {
      if (!savingsGoals || savingsGoals.length === 0) {
        await sendTelegramMessage(chatId, '🎯 <b>No savings goals created yet.</b> Add one on the Yuva Sathi dashboard to start building your emergency fund or dream purchase!');
        return NextResponse.json({ ok: true, action: 'savings' });
      }

      let goalsList = '';
      savingsGoals.forEach(g => {
        const pct = Math.min(100, Math.round((g.currentSavings / (g.targetAmount || 1)) * 100));
        const filled = Math.round(pct / 10);
        const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);
        goalsList += `\n• <b>${g.name}</b>\n  ${bar} ${pct}%\n  ${formatINR(g.currentSavings)} / ${formatINR(g.targetAmount)}\n`;
      });

      const msg = `🎯 <b>Your Savings Goals (${savingsGoals.length}):</b>\n${goalsList}\n` +
        `Total Saved: <b>${formatINR(financials.totalSavedInGoals)}</b>`;
      await sendTelegramMessage(chatId, msg);
      return NextResponse.json({ ok: true, action: 'savings' });
    }

    // Default response for unmatched text
    const defaultMsg = `🤖 I received: "${text}"\n\n` +
      `Try one of these commands:\n` +
      `• /balance — Check your available balance\n` +
      `• /today — Today's safe spending limit\n` +
      `• /budget — Monthly overview\n` +
      `• /savings — Goals progress\n` +
      `• /help — Full command list`;
    await sendTelegramMessage(chatId, defaultMsg);
    return NextResponse.json({ ok: true, action: 'fallback' });
  } catch (err: any) {
    console.error('[Telegram Webhook Error]', err);
    return NextResponse.json({ error: err.message || 'Webhook processing failed' }, { status: 500 });
  }
}
