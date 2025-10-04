type User = { email?: string; jwt: () => Promise<string> } | null;
type IdentityOptions = { APIUrl: string };
type IdentityDiagnostics = {
  configured: boolean;
  apiUrl: string | null;
  error: string | null;
  ready: boolean;
};

let netlifyIdentity: any = null;
let handlersAttached = false;
let initConfigApplied = false;
let latestIdentityError: string | null = null;
const diagnosticsListeners = new Set<(diagnostics: IdentityDiagnostics) => void>();

function emitDiagnostics() {
  const snapshot = getIdentityDiagnostics();
  diagnosticsListeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn('[audread] identity diagnostics listener error:', err);
      }
    }
  });
}

function setLatestIdentityError(message: string | null) {
  latestIdentityError = message ?? null;
  emitDiagnostics();
}

function trimTrailingSlash(input: string) {
  return input.replace(/\/+$/, '');
}

function normalizeIdentityApi(url: string) {
  const trimmed = trimTrailingSlash(url.trim());
  return trimmed.endsWith('/.netlify/identity') ? trimmed : `${trimmed}/.netlify/identity`;
}

function getEnv(name: string): string | undefined {
  const raw = (import.meta.env as Record<string, string | undefined>)[name];
  if (!raw) return undefined;
  const val = raw.trim();
  return val ? val : undefined;
}

function detectIdentityOptions(): IdentityOptions | undefined {
  const explicit =
    getEnv('VITE_NETLIFY_IDENTITY_URL') ||
    getEnv('VITE_NETLIFY_IDENTITY_API_URL') ||
    getEnv('VITE_IDENTITY_API_URL');
  if (explicit) return { APIUrl: normalizeIdentityApi(explicit) };

  const siteUrl =
    getEnv('VITE_NETLIFY_SITE_URL') ||
    getEnv('VITE_SITE_URL') ||
    getEnv('PUBLIC_SITE_URL');
  if (siteUrl) return { APIUrl: normalizeIdentityApi(siteUrl) };

  if (typeof window !== 'undefined') {
    const origin = trimTrailingSlash(window.location.origin);
    if (/localhost:5173$/i.test(origin)) {
      const proxyOrigin = getEnv('VITE_NETLIFY_IDENTITY_PROXY_ORIGIN') || 'http://localhost:8888';
      return { APIUrl: normalizeIdentityApi(proxyOrigin) };
    }
    return { APIUrl: `${origin}/.netlify/identity` };
  }

  return undefined;
}

const identityOptions = detectIdentityOptions();
const missingIdentityConfigMessage = identityOptions
  ? null
  : 'Netlify Identity endpoint is not configured for this environment. Set VITE_NETLIFY_IDENTITY_URL (e.g., https://your-site.netlify.app/.netlify/identity) or run `netlify dev` so /.netlify/identity is proxied.';

function ensureScript() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('netlify-identity-widget')) return;
  const s = document.createElement('script');
  s.src = 'https://identity.netlify.com/v1/netlify-identity-widget.js';
  s.async = true;
  s.id = 'netlify-identity-widget';
  s.onload = () => {
    /* global will be ready after load */
  };
  s.onerror = () => {
    setLatestIdentityError('The Netlify Identity widget script could not be loaded. Check your network connection or ad blockers.');
  };
  document.head.appendChild(s);
}

let initialized = false;

export function initIdentity() {
  if (!initialized) {
    initialized = true;
    ensureScript();
    // poll for global window.netlifyIdentity
    const tryInit = () => {
      // @ts-ignore
      const w = typeof window !== 'undefined' ? (window as any) : undefined;
      if (w && w.netlifyIdentity) {
        netlifyIdentity = w.netlifyIdentity;
        emitDiagnostics();
        try {
          if (!initConfigApplied) {
            initConfigApplied = true;
            if (identityOptions) {
              netlifyIdentity.init(identityOptions);
            } else {
              netlifyIdentity.init();
              if (import.meta.env.DEV && missingIdentityConfigMessage && !latestIdentityError) {
                setLatestIdentityError(missingIdentityConfigMessage);
              }
            }
          }
          if (!handlersAttached) {
            handlersAttached = true;
            netlifyIdentity.on?.('error', (err: unknown) => {
              const message =
                (typeof err === 'string' && err) ||
                ((err as { message?: string })?.message ?? 'Unknown Netlify Identity error');
              setLatestIdentityError(message);
              if (import.meta.env.DEV) {
                console.error('[audread] Netlify Identity error:', message);
              }
            });
            netlifyIdentity.on?.('init', () => {
              setLatestIdentityError(null);
            });
          }
        } catch (error) {
          setLatestIdentityError(
            (error as { message?: string })?.message || 'Failed to initialize Netlify Identity.'
          );
        }
      } else {
        setTimeout(tryInit, 300);
      }
    };
    tryInit();
  }
}

export function currentUser(): User | null {
  initIdentity();
  return netlifyIdentity?.currentUser?.() ?? null;
}

export async function getToken(): Promise<string | null> {
  initIdentity();
  if (!netlifyIdentity?.currentUser) return null;
  const u = netlifyIdentity.currentUser();
  if (!u) return null;
  try {
    const token = await u.jwt();
    return token;
  } catch {
    return null;
  }
}

export function onAuthChange(cb: (user: User | null) => void) {
  initIdentity();
  if (!netlifyIdentity?.on) return;
  netlifyIdentity.on('login', (u: User) => cb(u));
  netlifyIdentity.on('logout', () => cb(null));
}

export function openLogin() {
  initIdentity();
  if (latestIdentityError && typeof window !== 'undefined') {
    window.alert(`${latestIdentityError}\n\nTroubleshooting steps:\n• Ensure Netlify Identity is enabled on your site.\n• If developing locally, run "netlify dev" or set VITE_NETLIFY_IDENTITY_URL to your deployed site (e.g., https://example.netlify.app/.netlify/identity).`);
    return;
  }
  if (!netlifyIdentity?.open) {
    if (typeof window !== 'undefined' && import.meta.env.DEV) {
      window.alert('Netlify Identity is still loading. Please try again in a moment.');
    }
    return;
  }
  netlifyIdentity.open('login');
}

export function logout() {
  initIdentity();
  netlifyIdentity?.logout?.();
}

export function getIdentityDiagnostics(): IdentityDiagnostics {
  return {
    configured: Boolean(identityOptions),
    apiUrl: identityOptions?.APIUrl ?? null,
    error: latestIdentityError,
    ready: Boolean(netlifyIdentity)
  };
}

export function subscribeIdentityDiagnostics(
  listener: (diagnostics: IdentityDiagnostics) => void
): () => void {
  diagnosticsListeners.add(listener);
  try {
    listener(getIdentityDiagnostics());
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[audread] identity diagnostics listener initialization failed:', err);
    }
  }
  return () => {
    diagnosticsListeners.delete(listener);
  };
}
