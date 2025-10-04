import type { Handler } from '@netlify/functions';

// Proxy to PONS or serve from Wiktextract cache (stub)
export const handler: Handler = async (event) => {
  const term = event.queryStringParameters?.q;
  const lang = event.queryStringParameters?.lang || 'de';
  if (!term) {
    return { statusCode: 400, body: JSON.stringify({ error: 'missing q' }) };
  }
  // TODO: implement PONS API call with caching
  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ term, lang, definitions: [] })
  };
};
