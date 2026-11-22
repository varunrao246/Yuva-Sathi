import { NextRequest, NextResponse } from 'next/server';
import { generateLinkToken } from '@/lib/telegram';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = body.userId || 'demo_rohan';

    const { linkToken, expiresAt } = generateLinkToken(userId);

    // If Supabase server client is available, persist in telegram_links table
    const supabase = getSupabaseServerClient();
    if (supabase && userId && !userId.startsWith('demo_')) {
      await supabase.from('telegram_links').upsert(
        {
          user_id: userId,
          link_token: linkToken,
          token_expires_at: new Date(expiresAt).toISOString(),
          is_linked: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
    }

    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'YuvaSathiBot';
    const deepLink = `https://t.me/${botUsername}?start=${linkToken}`;

    return NextResponse.json({
      success: true,
      linkToken,
      expiresAt,
      botUsername,
      deepLink,
      isConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to generate link token' }, { status: 500 });
  }
}
