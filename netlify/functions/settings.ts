import type { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

type AppSettings = {
  amazon?: { email?: string; token?: string };
  providers?: Record<string, string>; // e.g., { OPENAI_API_KEY: '...' }
  preferences?: Record<string, unknown>;
};

const store = getStore({ name: 'audread-settings', consistency: 'strong' });

export const handler: Handler = async (event) => {
  try {
    const ctx = (event as any).context?.clientContext || (event as any).clientContext;
    const user = ctx?.user as { sub?: string } | undefined;
    if (!user?.sub) return { statusCode: 401, body: 'Unauthorized' };
    const key = `users/${user.sub}.json`;

    if (event.httpMethod === 'GET') {
      const s = (await store.get(key, { type: 'json' })) as AppSettings | null;
      return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify(s || {}) };
    }
    if (event.httpMethod === 'PUT' || event.httpMethod === 'POST') {
      const incoming = JSON.parse(event.body || '{}') as AppSettings;
      // Basic merge: load existing, shallow-merge, save
      const existing = ((await store.get(key, { type: 'json' })) as AppSettings | null) || {};
      const merged: AppSettings = {
        amazon: { ...(existing.amazon || {}), ...(incoming.amazon || {}) },
        providers: { ...(existing.providers || {}), ...(incoming.providers || {}) },
        preferences: { ...(existing.preferences || {}), ...(incoming.preferences || {}) }
      };
      await store.setJSON(key, merged);
      return { statusCode: 204, body: '' };
    }
    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (e: any) {
    return { statusCode: 500, body: e?.message || 'internal error' };
  }
};
