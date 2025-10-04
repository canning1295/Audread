// Storage abstraction for cached assets (JSON, audio)
export interface AssetStorage {
  putJSON(key: string, data: unknown, ttlSeconds?: number): Promise<void>;
  getJSON<T = unknown>(key: string): Promise<T | null>;
  putAudio(key: string, data: ArrayBuffer, contentType: string, ttlSeconds?: number): Promise<string | null>;
  getAudioURL(key: string): Promise<string | null>;
}

class MemoryStorage implements AssetStorage {
  private json = new Map<string, unknown>();
  private audio = new Map<string, Blob>();
  async putJSON(key: string, data: unknown) { this.json.set(key, data); }
  async getJSON<T>(key: string) { return (this.json.get(key) as T) ?? null; }
  async putAudio(key: string, data: ArrayBuffer, contentType: string) {
    this.audio.set(key, new Blob([data], { type: contentType }));
    return null; // no URL in memory
  }
  async getAudioURL(key: string) {
    const b = this.audio.get(key);
    return b ? URL.createObjectURL(b) : null;
  }
}

export function getStorage(): AssetStorage {
  // TODO(agent): In Netlify Functions runtime, use @netlify/blobs implementation.
  return new MemoryStorage();
}
