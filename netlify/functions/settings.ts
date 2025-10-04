import { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

type AppSettings = {
  amazon?: { email?: string; token?: string };
  providers?: Record<string, string>; // e.g., { OPENAI_API_KEY: '...' }
  preferences?: Record<string, unknown>;
};

const store = getStore({ name: 'audread-settings', consistency: 'strong' });

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;
const AUTH0_JWKS_URI = `https://${AUTH0_DOMAIN}/.well-known/jwks.json`;

const client = jwksClient({ jwksUri: AUTH0_JWKS_URI });

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, function (err, key) {
    const signingKey = key?.getPublicKey();
    callback(err, signingKey);
  });
}

async function verifyAuth0Token(token: string): Promise<any> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        audience: AUTH0_AUDIENCE,
        issuer: `https://${AUTH0_DOMAIN}/`,
        algorithms: ['RS256'],
      },
      (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded);
      }
    );
  });
}

export const handler: Handler = async (event) => {
  console.log('[Settings Function] Request received:', event.httpMethod, event.path);
  
  try {
    const authHeader = event.headers?.authorization || event.headers?.Authorization;
    console.log('[Settings Function] Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[Settings Function] Missing or invalid Authorization header');
      return { statusCode: 401, body: 'Missing or invalid Authorization header' };
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log('[Settings Function] Token extracted, length:', token.length);
    
    let decoded;
    try {
      decoded = await verifyAuth0Token(token);
      console.log('[Settings Function] Token verified, userId:', decoded.sub);
    } catch (err) {
      console.error('[Settings Function] Token verification failed:', err);
      return { statusCode: 401, body: 'Invalid Auth0 token' };
    }
    
    const userId = decoded.sub;
    if (!userId) {
      console.error('[Settings Function] No userId in token');
      return { statusCode: 401, body: 'Unauthorized' };
    }
    
    const key = `users/${userId}.json`;
    console.log('[Settings Function] Using key:', key);

    if (event.httpMethod === 'GET') {
      console.log('[Settings Function] GET request - loading settings');
      const s = (await store.get(key, { type: 'json' })) as AppSettings | null;
      console.log('[Settings Function] Settings loaded:', !!s);
      return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify(s || {}) };
    }
    
    if (event.httpMethod === 'PUT' || event.httpMethod === 'POST') {
      console.log('[Settings Function] PUT/POST request - saving settings');
      const incoming = JSON.parse(event.body || '{}') as AppSettings;
      console.log('[Settings Function] Incoming settings keys:', Object.keys(incoming));
      
      // Basic merge: load existing, shallow-merge, save
      const existing = ((await store.get(key, { type: 'json' })) as AppSettings | null) || {};
      console.log('[Settings Function] Existing settings keys:', Object.keys(existing));
      
      const merged: AppSettings = {
        amazon: { ...(existing.amazon || {}), ...(incoming.amazon || {}) },
        providers: { ...(existing.providers || {}), ...(incoming.providers || {}) },
        preferences: { ...(existing.preferences || {}), ...(incoming.preferences || {}) }
      };
      
      await store.setJSON(key, merged);
      console.log('[Settings Function] Settings saved successfully');
      return { statusCode: 204, body: '' };
    }
    
    console.log('[Settings Function] Method not allowed:', event.httpMethod);
    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (e: any) {
    console.error('[Settings Function] Error:', e);
    return { statusCode: 500, body: e?.message || 'internal error' };
  }
};
