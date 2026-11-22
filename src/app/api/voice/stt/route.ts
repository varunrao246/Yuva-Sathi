import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const gnaniApiKey = process.env.GNANI_API_KEY || process.env.GNANI_TOKEN || process.env.GNANI_ACCESS_KEY;
    const sttEndpoint = process.env.GNANI_STT_ENDPOINT || 'https://asr.gnani.ai/v1/recognize';

    const contentType = req.headers.get('content-type') || '';
    let audioBuffer: Buffer | null = null;
    let audioFormat = 'audio/wav';

    const MAX_AUDIO_BYTES = 5 * 1024 * 1024; // 5 MB upper bound to protect memory

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('audio') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No audio file provided in form-data' }, { status: 400 });
      }
      if (file.size > MAX_AUDIO_BYTES) {
        return NextResponse.json({ error: 'Audio file too large (max 5 MB allowed)' }, { status: 413 });
      }
      const arrayBuffer = await file.arrayBuffer();
      audioBuffer = Buffer.from(arrayBuffer);
      audioFormat = file.type || 'audio/wav';
    } else {
      const json = await req.json().catch(() => null);
      if (json && json.audioBase64) {
        if (typeof json.audioBase64 === 'string' && json.audioBase64.length > 7 * 1024 * 1024) {
          return NextResponse.json({ error: 'Audio payload too large (max 5 MB allowed)' }, { status: 413 });
        }
        audioBuffer = Buffer.from(json.audioBase64, 'base64');
        audioFormat = json.format || 'audio/wav';
      }
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      return NextResponse.json({ error: 'Empty audio buffer received' }, { status: 400 });
    }

    // Check if Gnani credentials are configured
    if (!gnaniApiKey) {
      return NextResponse.json({
        transcript: null,
        isConfigured: false,
        engine: 'browser_fallback',
        message: 'GNANI_API_KEY is not configured in .env.local. The Voice Coach will automatically use browser Web Speech Recognition.',
      });
    }

    // Call Gnani.ai STT API with 8s timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const gnaniResponse = await fetch(sttEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${gnaniApiKey}`,
          'x-api-key': gnaniApiKey,
          'Content-Type': audioFormat,
          'Accept': 'application/json',
          'language': 'en-IN',
        },
        body: audioBuffer,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!gnaniResponse.ok) {
        const errorText = await gnaniResponse.text();
        console.error('[Gnani.ai STT Error]', gnaniResponse.status, errorText);
        return NextResponse.json({
          transcript: null,
          isConfigured: true,
          error: `Gnani STT API responded with status ${gnaniResponse.status}`,
          engine: 'browser_fallback',
        });
      }

      const result = await gnaniResponse.json();
      const transcript = result.transcript || result.text || result.data?.transcript || '';

      return NextResponse.json({
        transcript,
        confidence: result.confidence || 0.95,
        engine: 'gnani.ai',
        isConfigured: true,
      });
    } catch (fetchErr: any) {
      clearTimeout(timeout);
      console.warn('[Gnani.ai STT Fetch Warning]', fetchErr.message);
      return NextResponse.json({
        transcript: null,
        isConfigured: true,
        error: fetchErr.name === 'AbortError' ? 'Gnani STT timed out after 8s' : fetchErr.message,
        engine: 'browser_fallback',
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'STT processing failed' }, { status: 500 });
  }
}
