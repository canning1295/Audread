import { getToken } from './auth';
// Data layer abstraction; default to Netlify DB (stub interfaces)
export type DocMeta = {
  id: string;
  title: string;
  language?: string;
  createdAt: string;
};

export interface DataStore {
  listDocs(): Promise<DocMeta[]>;
  saveDoc(meta: DocMeta): Promise<void>;
}

class MemoryStore implements DataStore {
  private docs: DocMeta[] = [];
  async listDocs() { return this.docs; }
  async saveDoc(meta: DocMeta) { this.docs.push(meta); }
}

class LocalStore implements DataStore {
  private key: string;
  constructor(uid: string) { this.key = `audread:docs:${uid}`; }
  private read(): DocMeta[] {
    try { return JSON.parse(localStorage.getItem(this.key) || '[]'); } catch { return []; }
  }
  private write(items: DocMeta[]) { localStorage.setItem(this.key, JSON.stringify(items)); }
  async listDocs() { return this.read(); }
  async saveDoc(meta: DocMeta) {
    const items = this.read();
    const i = items.findIndex(d => d.id === meta.id);
    if (i >= 0) items[i] = meta; else items.push(meta);
    this.write(items);
  }
}

class NetlifyDbStore implements DataStore {
  private fallback: LocalStore;
  constructor(private uid: string) { this.fallback = new LocalStore(uid); }
  private async headers(): Promise<Record<string, string>> {
    const token = await getToken();
    const h: Record<string, string> = { 'content-type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }
  async listDocs(): Promise<DocMeta[]> {
    const headers = await this.headers();
    if (!('Authorization' in headers)) {
      // No identity; use local fallback
      return this.fallback.listDocs();
    }
    const res = await fetch('/api/docs', { headers });
    if (res.status === 401) return this.fallback.listDocs();
    if (!res.ok) return [];
    const data = await res.json().catch(() => ({ items: [] }));
    return Array.isArray(data.items) ? data.items as DocMeta[] : [];
  }
  async saveDoc(meta: DocMeta): Promise<void> {
    const headers = await this.headers();
    if (!('Authorization' in headers)) {
      return this.fallback.saveDoc(meta);
    }
    const res = await fetch('/api/docs', { method: 'POST', headers, body: JSON.stringify(meta) });
    if (res.status === 401) return this.fallback.saveDoc(meta);
  }
}

function getClientUID(): string {
  // Generate a stable anonymous UID per browser; in production, replace with Netlify Identity.
  const key = 'audread:uid';
  let uid = '';
  try { uid = localStorage.getItem(key) || ''; } catch {}
  if (!uid) {
    uid = `u_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    try { localStorage.setItem(key, uid); } catch {}
  }
  return uid;
}

function selectProvider(): DataStore {
  let provider: string | undefined;
  try {
    // Vite client env
    // @ts-ignore
    provider = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_DATA_PROVIDER) as string | undefined;
  } catch {}
  // Server-side overrides can be wired per-function; client uses Vite env only for now.
  switch ((provider || 'netlify-db').toLowerCase()) {
    case 'netlify-db':
      return new NetlifyDbStore(getClientUID());
    case 'memory':
    default:
      // Prefer local persistence over ephemeral memory when available
      try { return new LocalStore(getClientUID()); } catch { return new MemoryStore(); }
  }
}

export const db: DataStore = selectProvider();

