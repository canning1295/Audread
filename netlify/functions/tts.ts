import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  const { text, voice = 'alloy' } = JSON.parse(event.body || '{}');
  if (!text) return { statusCode: 400, body: 'Missing text' };
  // TODO: call OpenAI TTS and store in Netlify Blobs; return blob URL
  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ voice, url: null })
  };
};
