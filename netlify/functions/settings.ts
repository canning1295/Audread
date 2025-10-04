// DEPRECATED: This function is no longer used as all settings are now stored locally in IndexedDB.
// Kept for reference or future cloud sync feature.
//
// Original purpose: Store user settings in Netlify Blobs with Auth0 authentication
// New approach: All settings stored locally in browser using IndexedDB (src/lib/indexeddb.ts)

import { Handler, HandlerContext } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

type AppSettings = {
  amazon?: { email?: string; token?: string };
  providers?: Record<string, string>; // e.g., { OPENAI_API_KEY: '...' }
  preferences?: Record<string, unknown>;
};

// Initialize Netlify Blobs
// In Netlify Functions v2, we need to pass context from the handler
let storeInstance: ReturnType<typeof getStore> | null = null;

const initStore = (context?: HandlerContext) => {
  if (storeInstance) return storeInstance;
  
  try {
    // Log available Netlify environment variables for debugging
    const netlifyEnvs = Object.keys(process.env).filter(k => k.includes('NETLIFY'));
    console.log('[Settings Function] Available Netlify env vars:', netlifyEnvs);
    console.log('[Settings Function] Context available:', !!context);
    
    // In Netlify Functions v2, context provides the necessary information
    // getStore will automatically use the deployment context
    storeInstance = getStore({ 
      name: 'audread-settings', 
      consistency: 'strong'
    });
    
    console.log('[Settings Function] Store initialized successfully');
    return storeInstance;
  } catch (error: any) {
    console.error('[Settings Function] Store initialization failed:', {
      error: error.message,
      stack: error.stack,
      hasContext: !!process.env.NETLIFY_BLOBS_CONTEXT,
      context: process.env.NETLIFY_BLOBS_CONTEXT,
      envKeys: Object.keys(process.env).filter(k => k.includes('NETLIFY') || k.includes('SITE'))
    });
    throw error;
  }
};

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

export const handler: Handler = async (event, context) => {
  console.log('[Settings Function] Request received:', event.httpMethod, event.path);
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }
  
  try {
    // Initialize store with context
    const currentStore = initStore(context);
    
    const authHeader = event.headers?.authorization || event.headers?.Authorization;
    console.log('[Settings Function] Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[Settings Function] Missing or invalid Authorization header');
      return { statusCode: 401, headers: corsHeaders, body: 'Missing or invalid Authorization header' };
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log('[Settings Function] Token extracted, length:', token.length);
    
    let decoded;
    try {
      decoded = await verifyAuth0Token(token);
      console.log('[Settings Function] Token verified, userId:', decoded.sub);
    } catch (err) {
      console.error('[Settings Function] Token verification failed:', err);
      return { statusCode: 401, headers: corsHeaders, body: 'Invalid Auth0 token' };
    }
    
    const userId = decoded.sub;
    if (!userId) {
      console.error('[Settings Function] No userId in token');
      return { statusCode: 401, headers: corsHeaders, body: 'Unauthorized' };
    }
    
    const key = `users/${userId}.json`;
    console.log('[Settings Function] Using key:', key);

    if (event.httpMethod === 'GET') {
      console.log('[Settings Function] GET request - loading settings');
      const s = (await currentStore.get(key, { type: 'json' })) as AppSettings | null;
      console.log('[Settings Function] Settings loaded:', !!s);
      return { statusCode: 200, headers: { ...corsHeaders, 'content-type': 'application/json' }, body: JSON.stringify(s || {}) };
    }
    
    if (event.httpMethod === 'PUT' || event.httpMethod === 'POST') {
      console.log('[Settings Function] PUT/POST request - saving settings');
      const incoming = JSON.parse(event.body || '{}') as AppSettings;
      console.log('[Settings Function] Incoming settings keys:', Object.keys(incoming));
      
      // Basic merge: load existing, shallow-merge, save
      const existing = ((await currentStore.get(key, { type: 'json' })) as AppSettings | null) || {};
      console.log('[Settings Function] Existing settings keys:', Object.keys(existing));
      
      const merged: AppSettings = {
        amazon: { ...(existing.amazon || {}), ...(incoming.amazon || {}) },
        providers: { ...(existing.providers || {}), ...(incoming.providers || {}) },
        preferences: { ...(existing.preferences || {}), ...(incoming.preferences || {}) }
      };
      
      await currentStore.setJSON(key, merged);
      console.log('[Settings Function] Settings saved successfully');
      return { statusCode: 204, headers: corsHeaders, body: '' };
    }
    
    console.log('[Settings Function] Method not allowed:', event.httpMethod);
    return { statusCode: 405, headers: corsHeaders, body: 'Method Not Allowed' };
  } catch (e: any) {
    console.error('[Settings Function] Error:', e);
    return { statusCode: 500, headers: corsHeaders, body: e?.message || 'internal error' };
  }
};
