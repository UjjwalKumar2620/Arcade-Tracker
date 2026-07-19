// ============================================================
// Arcade Tracker — In-Memory Cache Service
// Caches Google Sheet responses for 60 seconds to reduce API usage.
// No database. No persistence. Pure in-memory.
// ============================================================
import { config } from '../config/index.js';
import type { SheetFetchResult } from './sheets.service.js';

interface CacheEntry {
  data: SheetFetchResult;
  timestamp: number;
}

let cache: CacheEntry | null = null;

/**
 * Get cached data if it's still fresh (within TTL).
 * Returns null if cache is stale or empty.
 */
export function getCached(): { data: SheetFetchResult; ageMs: number } | null {
  if (!cache) return null;

  const ageMs = Date.now() - cache.timestamp;
  if (ageMs > config.cache.ttlMs) {
    return null; // Stale
  }

  return { data: cache.data, ageMs };
}

/**
 * Store fetched data in cache.
 */
export function setCache(data: SheetFetchResult): void {
  cache = {
    data,
    timestamp: Date.now(),
  };
}

/**
 * Clear the cache (force next request to fetch fresh data).
 */
export function clearCache(): void {
  cache = null;
}

/**
 * Get cache age in seconds (or -1 if no cache).
 */
export function getCacheAgeSeconds(): number {
  if (!cache) return -1;
  return Math.round((Date.now() - cache.timestamp) / 1000);
}
