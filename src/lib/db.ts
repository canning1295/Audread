// Data layer using IndexedDB for local storage
import {
  listDocuments,
  saveDocument,
  getDocument,
  getSentences,
  saveSentences as saveSentencesToDB,
  type DocMeta,
  type SentenceData,
} from './indexeddb';

export type { DocMeta, SentenceData };

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

class IndexedDBStore implements DataStore {
  async listDocs(): Promise<DocMeta[]> {
    return listDocuments();
  }

  async saveDoc(meta: DocMeta): Promise<void> {
    await saveDocument(meta);
  }

  async getDoc(id: string): Promise<DocumentWithSentences | null> {
    const meta = await getDocument(id);
    if (!meta) return null;
    const sentences = await getSentences(id);
    return { meta, sentences };
  }

  async saveSentences(docId: string, sentences: SentenceData[]): Promise<void> {
    await saveSentencesToDB(docId, sentences);
  }

  async getSentences(docId: string): Promise<SentenceData[]> {
    return getSentences(docId);
  }
}

// Export single instance
export const db: DataStore = new IndexedDBStore();

