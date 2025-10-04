import type { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

type TTSRequest = {
  text: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  docId?: string;
  sentenceId?: string;
};

type TTSResponse = {
  voice: string;
  url: string | null;
  cached: boolean;
  error?: string;
};

// Cache TTS audio in Netlify Blobs
const audioCache = getStore({ name: 'audread-audio', consistency: 'strong' });

function getCacheKey(text: string, voice: string): string {
  // Create a hash of the text + voice for consistent caching
  const content = `${text.trim()}:${voice}`;
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `tts_${Math.abs(hash).toString(36)}`;
}

async function getCachedAudio(text: string, voice: string): Promise<string | null> {
  try {
    const key = getCacheKey(text, voice);
    const cached = await audioCache.get(key, { type: 'arrayBuffer' });
    
    if (!cached) return null;
    
    // Convert ArrayBuffer to base64 data URL for immediate playback
    const base64 = Buffer.from(cached).toString('base64');
    return `data:audio/mpeg;base64,${base64}`;
  } catch {
    return null;
  }
}

async function cacheAudio(text: string, voice: string, audioBuffer: ArrayBuffer): Promise<void> {
  try {
    const key = getCacheKey(text, voice);
    await audioCache.set(key, audioBuffer);
  } catch (error) {
    console.error('Failed to cache audio:', error);
  }
}

async function generateTTSWithOpenAI(text: string, voice: string): Promise<ArrayBuffer> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      voice: voice,
      input: text,
      response_format: 'mp3',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI TTS API error: ${response.status} ${error}`);
  }

  return response.arrayBuffer();
}

function generateFallbackTTS(text: string): string {
  // Create a simple fallback using Web Speech API on client side
  // For now, return a data URL that triggers browser TTS
  const encoded = encodeURIComponent(text);
  return `data:text/plain;charset=utf-8,${encoded}`;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { text, voice = 'alloy', docId, sentenceId }: TTSRequest = JSON.parse(event.body || '{}');
    
    if (!text?.trim()) {
      return {
        statusCode: 400,
        headers: { 'content-type': 'application/json' } as Record<string, string>,
        body: JSON.stringify({ error: 'Missing or empty text' }),
      };
    }

    // Limit text length to prevent abuse
    const maxLength = 1000;
    const trimmedText = text.trim().slice(0, maxLength);

    // Check cache first
    const cachedUrl = await getCachedAudio(trimmedText, voice);
    if (cachedUrl) {
      const response: TTSResponse = {
        voice,
        url: cachedUrl,
        cached: true,
      };
      
      return {
        statusCode: 200,
        headers: { 
          'content-type': 'application/json',
          'cache-control': 'public, max-age=86400', // 24 hours
        } as Record<string, string>,
        body: JSON.stringify(response),
      };
    }

    // Try to generate with OpenAI
    try {
      const audioBuffer = await generateTTSWithOpenAI(trimmedText, voice);
      
      // Cache the audio (fire and forget)
      cacheAudio(trimmedText, voice, audioBuffer).catch(error =>
        console.error('Failed to cache audio:', error)
      );
      
      // Convert to base64 data URL for response
      const base64 = Buffer.from(audioBuffer).toString('base64');
      const dataUrl = `data:audio/mpeg;base64,${base64}`;
      
      const response: TTSResponse = {
        voice,
        url: dataUrl,
        cached: false,
      };

      return {
        statusCode: 200,
        headers: { 
          'content-type': 'application/json',
          'cache-control': 'public, max-age=86400', // 24 hours
        } as Record<string, string>,
        body: JSON.stringify(response),
      };

    } catch (openaiError) {
      console.error('OpenAI TTS failed:', openaiError);
      
      // Return fallback response
      const response: TTSResponse = {
        voice,
        url: generateFallbackTTS(trimmedText),
        cached: false,
        error: 'TTS service unavailable, using fallback',
      };

      return {
        statusCode: 200,
        headers: { 'content-type': 'application/json' } as Record<string, string>,
        body: JSON.stringify(response),
      };
    }

  } catch (error: any) {
    console.error('TTS handler error:', error);
    
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' } as Record<string, string>,
      body: JSON.stringify({ 
        error: 'Internal server error',
        voice: 'alloy',
        url: null,
        cached: false,
      }),
    };
  }
};
