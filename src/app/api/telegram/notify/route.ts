import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getUserFinancialContext, sendTelegramMessage } from '@/lib/telegram';
import { formatINR } from '@/lib/currency';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, type = 'daily_summary', customMessage } = body;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'Valid userId string is required' }, { status: 400 });
    }

    const validNotificationTypes = ['daily_summary', 'commitment_due', 'overspending_alert'];
    if (!customMessage && !validNotificationTypes.includes(type)) {
      return NextResponse.json({ error: `Invalid notification type. Must be one of: ${validNotificationTypes.join(', ')}` }, { status: 400 });
    }

    // Lookup telegram link
    const supabase = getSupabaseServerClient();
    let chatId: number | null = null;

    if (supabase && !userId.startsWith('demo_')) {
      const { data } = await supabase
        .from('telegram_links')
        .select('*')
        .eq('user_id', userId)
        .eq('is_linked', true)
        .maybeSingle();

      if (data?.telegram_chat_id) {
        // Check quiet hours if configured (defaults 22:00 to 07:00 IST)
        // IST is UTC+5:30 (19,800,000 ms offset)
        const now = new Date();
        const istDate = new Date(now.getTime() + 19800000);
        const currentHour = istDate.getUTCHours();
        if (currentHour >= 22 || currentHour < 7) {
          return NextResponse.json({
            ok: false,
            reason: 'quiet_hours',
            message: 'Notification skipped: user is in quiet hours (10:00 PM - 7:00 AM IST)',
          });
        }
        chatId = Number(data.telegram_chat_id);
      }
    }

    const { profile, financials, commitments, savingsGoals } = await getUserFinancialContext(userId);

    let messageText = '';

    if (customMessage) {
      messageText = customMessage;
    } else if (type === 'daily_summary') {
      const upcomingCommitmentTotal = commitments
        .filter(c => !c.isPaid && c.dueDay >= financials.currentDayOfMonth)
        .reduce((sum, c) => sum + c.amount, 0);

      const topGoal = savingsGoals[0];
      const goalPct = topGoal
        ? Math.min(100, Math.round((topGoal.currentSavings / (topGoal.targetAmount || 1)) * 100))
        : 0;

      messageText =
        `🌅 <b>Good morning, ${profile.name}! 🌱</b>\n\n` +
        `• You have <b>${formatINR(financials.currentBalance)}</b> available.\n` +
        `• Your safe spending limit today is <b>${formatINR(financials.safeToSpendToday)}</b>.\n` +
        (upcomingCommitmentTotal > 0
          ? `• <b>${formatINR(upcomingCommitmentTotal)}</b> in commitments are approaching this month.\n`
          : '') +
        (topGoal
          ? `• You have saved <b>${goalPct}%</b> toward your "${topGoal.name}" goal.\n\n`
          : '\n') +
        `<i>Have a productive day! Your साथी has your back.</i>`;
    } else if (type === 'commitment_due') {
      const urgent = commitments.filter(c => !c.isPaid && c.dueDay <= financials.currentDayOfMonth + 3);
      if (urgent.length === 0) {
        return NextResponse.json({ ok: true, message: 'No urgent commitments due' });
      }
      messageText =
        `⚠️ <b>Commitment Due Reminder</b>\n\n` +
        `The following bills are approaching in the next 3 days:\n` +
        urgent.map(c => `• ${c.name}: <b>${formatINR(c.amount)}</b> (Due Day ${c.dueDay})`).join('\n') +
        `\n\n<i>These amounts are quarantined from your safe-to-spend limit to keep you stress-free!</i>`;
    } else if (type === 'overspending_alert') {
      messageText =
        `🚨 <b>Spending Alert from Yuva Sathi</b>\n\n` +
        `Your spending pace is currently <b>${financials.spendingPace.replace('_', ' ').toUpperCase()}</b>.\n` +
        `• Current Balance: <b>${formatINR(financials.currentBalance)}</b>\n` +
        `• Adjusted Safe Limit Today: <b>${formatINR(financials.safeToSpendToday)}</b>\n\n` +
        `Try capping discretionary purchases for the next 2-3 days to comfortably reach month-end!`;
    }

    if (chatId) {
      const result = await sendTelegramMessage(chatId, messageText);
      return NextResponse.json({
        ok: true,
        sent: true,
        chatId,
        messageText,
        result,
      });
    } else {
      // Telegram not linked or in demo mode: return message preview
      return NextResponse.json({
        ok: true,
        sent: false,
        reason: 'chat_not_linked',
        message: 'User has not connected Telegram yet. Generated notification preview below.',
        preview: messageText,
      });
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to dispatch notification';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
