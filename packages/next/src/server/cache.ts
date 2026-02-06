import type { GenerateThemeResponse } from '@dheme/sdk';

interface CacheEntry {
  data: GenerateThemeResponse;
  timestamp: number;
}

class ThemeCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private ttl: number;

  constructor(maxSize = 100, ttlMs = 3_600_000) {
    this.maxSize = maxSize;
    this.ttl = ttlMs;
  }

  get(key: string): GenerateThemeResponse | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: GenerateThemeResponse): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const themeCache = new ThemeCache();
