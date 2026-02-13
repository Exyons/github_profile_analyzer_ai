/**
 * Server-side LRU cache for AI analysis results.
 * 
 * Key: `${username}:${profile_updated_at}`
 * Value: serialized API response JSON
 * TTL: 1 hour
 */

interface CacheEntry<T> {
    value: T;
    createdAt: number;
}

const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_ENTRIES = 100;

class LRUCache<T> {
    private cache = new Map<string, CacheEntry<T>>();
    private readonly maxEntries: number;
    private readonly ttlMs: number;

    constructor(maxEntries = MAX_ENTRIES, ttlMs = DEFAULT_TTL_MS) {
        this.maxEntries = maxEntries;
        this.ttlMs = ttlMs;
    }

    get(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        // Check TTL
        if (Date.now() - entry.createdAt > this.ttlMs) {
            this.cache.delete(key);
            return null;
        }

        // Move to end (most recently used)
        this.cache.delete(key);
        this.cache.set(key, entry);

        return entry.value;
    }

    set(key: string, value: T): void {
        // Delete if exists (to refresh position)
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }

        // Evict oldest if at capacity
        if (this.cache.size >= this.maxEntries) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
            }
        }

        this.cache.set(key, { value, createdAt: Date.now() });
    }

    has(key: string): boolean {
        return this.get(key) !== null; // Also checks TTL
    }

    clear(): void {
        this.cache.clear();
    }

    get size(): number {
        return this.cache.size;
    }
}

// Singleton cache instances — survive between requests in the same server process
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const analysisCache = new LRUCache<any>(MAX_ENTRIES, DEFAULT_TTL_MS);

/**
 * Build a deterministic cache key from the username and the profile's updated_at timestamp.
 * When the user updates their profile, the `updated_at` changes → cache miss → fresh analysis.
 */
export function buildCacheKey(username: string, updatedAt: string): string {
    return `${username.toLowerCase()}:${updatedAt}`;
}
