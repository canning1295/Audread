// IndexedDB storage for AudRead - all data stored locally
// Stores: documents, sentences, settings, audio cache, and other app data

const DB_NAME = 'AudReadDB';
const DB_VERSION = 1;

// Object store names
const STORES = {
  DOCUMENTS: 'documents',
  SENTENCES: 'sentences',
  SETTINGS: 'settings',
  AUDIO_CACHE: 'audioCache',
  DICTIONARY_CACHE: 'dictionaryCache',
} as const;

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

export type AppSettings = {
  amazon?: { email?: string; token?: string };
  providers?: Record<string, string>;
  preferences?: Record<string, unknown>;
};

export type AudioCacheEntry = {
  key: string;
  blob: Blob;
  contentType: string;
  timestamp: number;
  ttl?: number;
};

export type DictionaryCacheEntry = {
  key: string;
  data: unknown;
  timestamp: number;
  ttl?: number;
};

let dbInstance: IDBDatabase | null = null;

// Initialize IndexedDB
function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[IndexedDB] Failed to open database:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      console.log('[IndexedDB] Database opened successfully');
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      console.log('[IndexedDB] Database upgrade needed, version:', db.version);

      // Create documents store
      if (!db.objectStoreNames.contains(STORES.DOCUMENTS)) {
        const docStore = db.createObjectStore(STORES.DOCUMENTS, { keyPath: 'id' });
        docStore.createIndex('createdAt', 'createdAt', { unique: false });
        console.log('[IndexedDB] Created documents store');
      }

      // Create sentences store
      if (!db.objectStoreNames.contains(STORES.SENTENCES)) {
        const sentenceStore = db.createObjectStore(STORES.SENTENCES, { keyPath: 'id' });
        sentenceStore.createIndex('docId', 'docId', { unique: false });
        sentenceStore.createIndex('docId_index', ['docId', 'index'], { unique: true });
        console.log('[IndexedDB] Created sentences store');
      }

      // Create settings store (single entry with key 'user-settings')
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        console.log('[IndexedDB] Created settings store');
      }

      // Create audio cache store
      if (!db.objectStoreNames.contains(STORES.AUDIO_CACHE)) {
        const audioStore = db.createObjectStore(STORES.AUDIO_CACHE, { keyPath: 'key' });
        audioStore.createIndex('timestamp', 'timestamp', { unique: false });
        console.log('[IndexedDB] Created audio cache store');
      }

      // Create dictionary cache store
      if (!db.objectStoreNames.contains(STORES.DICTIONARY_CACHE)) {
        const dictStore = db.createObjectStore(STORES.DICTIONARY_CACHE, { keyPath: 'key' });
        dictStore.createIndex('timestamp', 'timestamp', { unique: false });
        console.log('[IndexedDB] Created dictionary cache store');
      }
    };
  });
}

// Generic transaction helper
async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const request = callback(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Documents API
export async function listDocuments(): Promise<DocMeta[]> {
  return withStore(STORES.DOCUMENTS, 'readonly', (store) => store.getAll());
}

export async function saveDocument(meta: DocMeta): Promise<void> {
  await withStore(STORES.DOCUMENTS, 'readwrite', (store) => store.put(meta));
  console.log('[IndexedDB] Document saved:', meta.id);
}

export async function getDocument(id: string): Promise<DocMeta | null> {
  const result = await withStore(STORES.DOCUMENTS, 'readonly', (store) => store.get(id));
  return result || null;
}

export async function deleteDocument(id: string): Promise<void> {
  await withStore(STORES.DOCUMENTS, 'readwrite', (store) => store.delete(id));
  console.log('[IndexedDB] Document deleted:', id);
}

// Sentences API
export async function saveSentences(docId: string, sentences: SentenceData[]): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.SENTENCES, 'readwrite');
    const store = transaction.objectStore(STORES.SENTENCES);

    // First, delete existing sentences for this document
    const index = store.index('docId');
    const deleteRequest = index.openCursor(IDBKeyRange.only(docId));

    deleteRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        // Now add all new sentences
        for (const sentence of sentences) {
          store.put(sentence);
        }
      }
    };

    transaction.oncomplete = () => {
      console.log('[IndexedDB] Sentences saved for document:', docId, 'count:', sentences.length);
      resolve();
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getSentences(docId: string): Promise<SentenceData[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.SENTENCES, 'readonly');
    const store = transaction.objectStore(STORES.SENTENCES);
    const index = store.index('docId');
    const request = index.getAll(IDBKeyRange.only(docId));

    request.onsuccess = () => {
      const sentences = request.result as SentenceData[];
      // Sort by index to ensure correct order
      sentences.sort((a, b) => a.index - b.index);
      resolve(sentences);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteSentences(docId: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.SENTENCES, 'readwrite');
    const store = transaction.objectStore(STORES.SENTENCES);
    const index = store.index('docId');
    const request = index.openCursor(IDBKeyRange.only(docId));

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    transaction.oncomplete = () => {
      console.log('[IndexedDB] Sentences deleted for document:', docId);
      resolve();
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

// Settings API
const SETTINGS_KEY = 'user-settings';

export async function loadSettings(): Promise<AppSettings> {
  const result = await withStore(STORES.SETTINGS, 'readonly', (store) =>
    store.get(SETTINGS_KEY)
  );
  return result?.value || {};
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await withStore(STORES.SETTINGS, 'readwrite', (store) =>
    store.put({ key: SETTINGS_KEY, value: settings })
  );
  console.log('[IndexedDB] Settings saved');
}

// Audio Cache API
export async function putAudio(
  key: string,
  data: ArrayBuffer,
  contentType: string,
  ttlSeconds?: number
): Promise<void> {
  const entry: AudioCacheEntry = {
    key,
    blob: new Blob([data], { type: contentType }),
    contentType,
    timestamp: Date.now(),
    ttl: ttlSeconds,
  };
  await withStore(STORES.AUDIO_CACHE, 'readwrite', (store) => store.put(entry));
  console.log('[IndexedDB] Audio cached:', key);
}

export async function getAudio(key: string): Promise<Blob | null> {
  const entry = await withStore<AudioCacheEntry>(STORES.AUDIO_CACHE, 'readonly', (store) =>
    store.get(key)
  );

  if (!entry) return null;

  // Check if expired
  if (entry.ttl) {
    const age = (Date.now() - entry.timestamp) / 1000;
    if (age > entry.ttl) {
      // Expired, delete it
      await withStore(STORES.AUDIO_CACHE, 'readwrite', (store) => store.delete(key));
      console.log('[IndexedDB] Audio cache expired:', key);
      return null;
    }
  }

  return entry.blob;
}

export async function deleteAudio(key: string): Promise<void> {
  await withStore(STORES.AUDIO_CACHE, 'readwrite', (store) => store.delete(key));
}

// Dictionary Cache API
export async function putDictionaryCache(key: string, data: unknown, ttlSeconds?: number): Promise<void> {
  const entry: DictionaryCacheEntry = {
    key,
    data,
    timestamp: Date.now(),
    ttl: ttlSeconds,
  };
  await withStore(STORES.DICTIONARY_CACHE, 'readwrite', (store) => store.put(entry));
  console.log('[IndexedDB] Dictionary entry cached:', key);
}

export async function getDictionaryCache<T = unknown>(key: string): Promise<T | null> {
  const entry = await withStore<DictionaryCacheEntry>(STORES.DICTIONARY_CACHE, 'readonly', (store) =>
    store.get(key)
  );

  if (!entry) return null;

  // Check if expired
  if (entry.ttl) {
    const age = (Date.now() - entry.timestamp) / 1000;
    if (age > entry.ttl) {
      // Expired, delete it
      await withStore(STORES.DICTIONARY_CACHE, 'readwrite', (store) => store.delete(key));
      console.log('[IndexedDB] Dictionary cache expired:', key);
      return null;
    }
  }

  return entry.data as T;
}

// Utility: Clean up expired cache entries
export async function cleanupExpiredCache(): Promise<void> {
  const now = Date.now();
  const db = await initDB();

  // Clean audio cache
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORES.AUDIO_CACHE, 'readwrite');
    const store = transaction.objectStore(STORES.AUDIO_CACHE);
    const request = store.openCursor();

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        const entry = cursor.value as AudioCacheEntry;
        if (entry.ttl) {
          const age = (now - entry.timestamp) / 1000;
          if (age > entry.ttl) {
            cursor.delete();
          }
        }
        cursor.continue();
      }
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });

  // Clean dictionary cache
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORES.DICTIONARY_CACHE, 'readwrite');
    const store = transaction.objectStore(STORES.DICTIONARY_CACHE);
    const request = store.openCursor();

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        const entry = cursor.value as DictionaryCacheEntry;
        if (entry.ttl) {
          const age = (now - entry.timestamp) / 1000;
          if (age > entry.ttl) {
            cursor.delete();
          }
        }
        cursor.continue();
      }
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });

  console.log('[IndexedDB] Expired cache entries cleaned up');
}

// Export a cleanup function to be called on app startup
export function initCleanup(): void {
  // Clean up expired entries on startup
  cleanupExpiredCache().catch((err) =>
    console.error('[IndexedDB] Cleanup failed:', err)
  );

  // Schedule periodic cleanup (every hour)
  setInterval(() => {
    cleanupExpiredCache().catch((err) =>
      console.error('[IndexedDB] Cleanup failed:', err)
    );
  }, 60 * 60 * 1000);
}
