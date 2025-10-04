import type { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

type DocMeta = {
  id: string;
  title: string;
  language?: string;
  createdAt: string;
};

// Simple per-user store using Netlify Blobs
const store = getStore({ name: 'audread-docs', consistency: 'strong' });

function userKey(uid?: string | null) {
  if (!uid) throw new Error('missing uid');
  // Sanitize to limit key chars
  const safe = uid.replace(/[^a-zA-Z0-9_@.-]/g, '').slice(0, 200);
  if (!safe) throw new Error('invalid uid');
  return `users/${safe}.json`;
}

export const handler: Handler = async (event) => {
  try {
    const user = (event as any).context?.clientContext?.user || (event as any).clientContext?.user;
  const uid: string | undefined = user?.sub || user?.email || undefined;
  if (!uid) return { statusCode: 401, body: 'Unauthorized' };
  const key = userKey(uid);

    if (event.httpMethod === 'GET') {
      const items = (await store.get(key, { type: 'json' })) as DocMeta[] | null ?? [];
      return {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items })
      };
    }

    if (event.httpMethod === 'POST') {
      const meta: DocMeta = JSON.parse(event.body || '{}');
      if (!meta?.id || !meta?.title) {
        return { statusCode: 400, body: 'missing id/title' };
      }
      const items = (await store.get(key, { type: 'json' })) as DocMeta[] | null ?? [];
      const idx = items.findIndex((i: DocMeta) => i.id === meta.id);
      if (idx >= 0) items[idx] = meta; else items.push(meta);
      await store.setJSON(key, items);
      return { statusCode: 204, body: '' };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (err: any) {
    const msg = typeof err?.message === 'string' ? err.message : 'internal error';
    return { statusCode: 500, body: msg };
  }
};
