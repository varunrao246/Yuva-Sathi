import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.text) {
      return NextResponse.json({ error: 'Text is required for TTS' }, { status: 400 });
    }

    const { text, language = 'en-IN', voice = 'sathi_indic' } = body;
    const sanitizedText = String(text).trim().slice(0, 600); // cap to 600 chars

    const gnaniApiKey = process.env.GNANI_API_KEY || process.env.GNANI_TOKEN || process.env.GNANI_ACCESS_KEY;
    const ttsEndpoint = process.env.GNANI_TTS_ENDPOINT || 'https://tts.gnani.ai/v1/synthesize';

    if (!gnaniApiKey) {
      return NextResponse.json({
        audioUrl: null,
        isConfigured: false,
        engine: 'browser_speech_synthesis',
        text: sanitizedText,
        language: 'en-IN',
        message: 'GNANI_API_KEY not configured. Client will use Web Speech Synthesis (en-IN).',
      });
    }

    // Call Gnani.ai TTS API with 8s timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(ttsEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${gnaniApiKey}`,
          'x-api-key': gnaniApiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/wav',
        },
        body: JSON.stringify({
          text: sanitizedText,
          language,
          voice,
          format: 'wav',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        console.error('[Gnani.ai TTS Error]', response.status);
        return NextResponse.json({
          audioUrl: null,
          isConfigured: true,
          error: `Gnani TTS API responded with ${response.status}`,
          engine: 'browser_speech_synthesis',
          text: sanitizedText,
        });
      }

      const audioArrayBuffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(audioArrayBuffer).toString('base64');
      const dataUri = `data:audio/wav;base64,${base64Audio}`;

      return NextResponse.json({
        audioUrl: dataUri,
        isConfigured: true,
        engine: 'gnani.ai',
        language,
      });
    } catch (fetchErr: any) {
      clearTimeout(timeout);
      console.warn('[Gnani.ai TTS Fetch Warning]', fetchErr.message);
      return NextResponse.json({
        audioUrl: null,
        isConfigured: true,
        error: fetchErr.name === 'AbortError' ? 'Gnani TTS timed out' : fetchErr.message,
        engine: 'browser_speech_synthesis',
        text: sanitizedText,
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'TTS synthesis failed' }, { status: 500 });
  }
}
