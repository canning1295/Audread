// Storage abstraction for cached assets (JSON, audio) using IndexedDB
import {
  putAudio as putAudioInDB,
  getAudio as getAudioFromDB,
  putDictionaryCache,
  getDictionaryCache,
} from './indexeddb';

export interface AssetStorage {
  putJSON(key: string, data: unknown, ttlSeconds?: number): Promise<void>;
  getJSON<T = unknown>(key: string): Promise<T | null>;
  putAudio(key: string, data: ArrayBuffer, contentType: string, ttlSeconds?: number): Promise<string | null>;
  getAudioURL(key: string): Promise<string | null>;
}

class IndexedDBStorage implements AssetStorage {
  async putJSON(key: string, data: unknown, ttlSeconds?: number): Promise<void> {
    await putDictionaryCache(key, data, ttlSeconds);
  }

  async getJSON<T>(key: string): Promise<T | null> {
    return getDictionaryCache<T>(key);
  }

  async putAudio(key: string, data: ArrayBuffer, contentType: string, ttlSeconds?: number): Promise<string | null> {
    await putAudioInDB(key, data, contentType, ttlSeconds);
    // Return the key which can be used later to retrieve the audio URL
    return key;
  }

  async getAudioURL(key: string): Promise<string | null> {
    const blob = await getAudioFromDB(key);
    return blob ? URL.createObjectURL(blob) : null;
  }
}

export function getStorage(): AssetStorage {
  return new IndexedDBStorage();
}
