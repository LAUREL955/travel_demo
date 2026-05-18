export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheEntry> = new Map();
  private storage: Storage;

  private constructor() {
    this.storage = typeof window !== 'undefined' ? localStorage : ({} as Storage);
    this.loadFromStorage();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private loadFromStorage() {
    try {
      const cachedData = this.storage.getItem('appCache');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        Object.entries(parsed).forEach(([key, value]) => {
          this.cache.set(key, value as CacheEntry);
        });
      }
    } catch (e) {
      console.warn('Failed to load cache from storage:', e);
    }
  }

  private saveToStorage() {
    try {
      const data = Object.fromEntries(this.cache);
      this.storage.setItem('appCache', JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save cache to storage:', e);
    }
  }

  set(key: string, value: any, ttl: number = 3600000) {
    const entry: CacheEntry = {
      value,
      timestamp: Date.now(),
      ttl
    };
    this.cache.set(key, entry);
    this.saveToStorage();
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return null;
    }

    return entry.value;
  }

  delete(key: string) {
    this.cache.delete(key);
    this.saveToStorage();
  }

  clear() {
    this.cache.clear();
    this.saveToStorage();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    return Date.now() - entry.timestamp <= entry.ttl;
  }

  getExpiredKeys(): string[] {
    const now = Date.now();
    const expired: string[] = [];
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        expired.push(key);
      }
    });
    return expired;
  }

  clearExpired() {
    const expiredKeys = this.getExpiredKeys();
    expiredKeys.forEach(key => this.delete(key));
  }
}

export interface CacheEntry {
  value: any;
  timestamp: number;
  ttl: number;
}

export const cacheManager = CacheManager.getInstance();