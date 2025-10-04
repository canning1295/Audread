type AppSettings = {
  amazon?: { email?: string; token?: string };
  providers?: Record<string, string>; // e.g., { OPENAI_API_KEY: '...' }
  preferences?: Record<string, unknown>;
};

const store = getStore({ name: 'audread-settings', consistency: 'strong' });


import jwt from 'jsonwebtoken';

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;
const AUTH0_JWKS_URI = `https://${AUTH0_DOMAIN}/.well-known/jwks.json`;

import jwksClient from 'jwks-rsa';

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
  try {
    const authHeader = event.headers?.authorization || event.headers?.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { statusCode: 401, body: 'Missing or invalid Authorization header' };
    }
    const token = authHeader.replace('Bearer ', '');
    let decoded;
    try {
      decoded = await verifyAuth0Token(token);
    } catch (err) {
      return { statusCode: 401, body: 'Invalid Auth0 token' };
    }
    const userId = decoded.sub;
    if (!userId) return { statusCode: 401, body: 'Unauthorized' };
    const key = `users/${userId}.json`;

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
