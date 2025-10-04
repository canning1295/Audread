type User = { email?: string; jwt: () => Promise<string> } | null;
let netlifyIdentity: any = null;

function ensureScript() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('netlify-identity-widget')) return;
  const s = document.createElement('script');
  s.src = 'https://identity.netlify.com/v1/netlify-identity-widget.js';
  s.async = true;
  s.id = 'netlify-identity-widget';
  s.onload = () => { /* global will be ready after load */ };
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
        try { netlifyIdentity.init(); } catch {}
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
  const u = netlifyIdentity.currentUser();
  if (!netlifyIdentity) return null;
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
  netlifyIdentity?.open?.('login');
}

export function logout() {
  initIdentity();
  netlifyIdentity?.logout?.();
}
