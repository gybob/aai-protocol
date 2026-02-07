interface CacheEntry {
  value: any;
  expiry: number;
}

export class ResultCache {
  private cache: Map<string, CacheEntry> = new Map();

  set(key: string, value: any, ttlSeconds: number): void {
    const expiry = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiry });
  }

  get(key: string): any | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  clear(): void {
    this.cache.clear();
  }
}
