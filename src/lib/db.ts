import { getToken } from './auth';

// Data layer abstraction; default to Netlify DB (stub interfaces)
export type DocMeta = {
  id: string;
  title: string;
  language?: string;
  createdAt: string;
  sentenceCount?: number;
};

export type SentenceData = {
  id: string;
  docId: string;
  text: string;
  index: number;
  hash: string;
};

export type DocumentWithSentences = {
  meta: DocMeta;
  sentences: SentenceData[];
};

export interface DataStore {
  listDocs(): Promise<DocMeta[]>;
  saveDoc(meta: DocMeta): Promise<void>;
  getDoc(id: string): Promise<DocumentWithSentences | null>;
  saveSentences(docId: string, sentences: SentenceData[]): Promise<void>;
  getSentences(docId: string): Promise<SentenceData[]>;
}

class MemoryStore implements DataStore {
  private docs: DocMeta[] = [];
  private sentences: Map<string, SentenceData[]> = new Map();
  
  async listDocs() { return this.docs; }
  async saveDoc(meta: DocMeta) {
    const existing = this.docs.findIndex(d => d.id === meta.id);
    if (existing >= 0) {
      this.docs[existing] = meta;
    } else {
      this.docs.push(meta);
    }
  }
  async getDoc(id: string): Promise<DocumentWithSentences | null> {
    const meta = this.docs.find(d => d.id === id);
    if (!meta) return null;
    const sentences = this.sentences.get(id) || [];
    return { meta, sentences };
  }
  async saveSentences(docId: string, sentences: SentenceData[]) {
    this.sentences.set(docId, sentences);
  }
  async getSentences(docId: string): Promise<SentenceData[]> {
    return this.sentences.get(docId) || [];
  }
}

class LocalStore implements DataStore {
  private key: string;
  private sentencesKey: string;
  constructor(uid: string) { 
    this.key = `audread:docs:${uid}`;
    this.sentencesKey = `audread:sentences:${uid}`;
  }
  private read(): DocMeta[] {
    try { return JSON.parse(localStorage.getItem(this.key) || '[]'); } catch { return []; }
  }
  private write(items: DocMeta[]) { localStorage.setItem(this.key, JSON.stringify(items)); }
  private readSentences(): Map<string, SentenceData[]> {
    try {
      const data = localStorage.getItem(this.sentencesKey) || '{}';
      const obj = JSON.parse(data);
      return new Map(Object.entries(obj));
    } catch { return new Map(); }
  }
  private writeSentences(sentences: Map<string, SentenceData[]>) {
    const obj = Object.fromEntries(sentences);
    localStorage.setItem(this.sentencesKey, JSON.stringify(obj));
  }
  async listDocs() { return this.read(); }
  async saveDoc(meta: DocMeta) {
    const items = this.read();
    const i = items.findIndex(d => d.id === meta.id);
    if (i >= 0) items[i] = meta; else items.push(meta);
    this.write(items);
  }
  async getDoc(id: string): Promise<DocumentWithSentences | null> {
    const docs = this.read();
    const meta = docs.find(d => d.id === id);
    if (!meta) return null;
    const sentences = await this.getSentences(id);
    return { meta, sentences };
  }
  async saveSentences(docId: string, sentences: SentenceData[]) {
    const allSentences = this.readSentences();
    allSentences.set(docId, sentences);
    this.writeSentences(allSentences);
  }
  async getSentences(docId: string): Promise<SentenceData[]> {
    const allSentences = this.readSentences();
    return allSentences.get(docId) || [];
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
  async getDoc(id: string): Promise<DocumentWithSentences | null> {
    const headers = await this.headers();
    if (!('Authorization' in headers)) {
      return this.fallback.getDoc(id);
    }
    const res = await fetch(`/api/docs/${id}`, { headers });
    if (res.status === 401) return this.fallback.getDoc(id);
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    return data;
  }
  async saveSentences(docId: string, sentences: SentenceData[]): Promise<void> {
    const headers = await this.headers();
    if (!('Authorization' in headers)) {
      return this.fallback.saveSentences(docId, sentences);
    }
    const res = await fetch(`/api/docs/${docId}/sentences`, { 
      method: 'POST', 
      headers, 
      body: JSON.stringify({ sentences }) 
    });
    if (res.status === 401) return this.fallback.saveSentences(docId, sentences);
  }
  async getSentences(docId: string): Promise<SentenceData[]> {
    const headers = await this.headers();
    if (!('Authorization' in headers)) {
      return this.fallback.getSentences(docId);
    }
    const res = await fetch(`/api/docs/${docId}/sentences`, { headers });
    if (res.status === 401) return this.fallback.getSentences(docId);
    if (!res.ok) return [];
    const data = await res.json().catch(() => ({ sentences: [] }));
    return Array.isArray(data.sentences) ? data.sentences : [];
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

