/**
 * MemoryCacheService
 *
 * This service provides an in-memory caching mechanism using the `node-cache` library.
 * It supports TTL (time-to-live) for cache entries and is suitable for lightweight caching
 * needs in small to medium-sized applications.
 */
import { Injectable } from '@nestjs/common';
import * as NodeCache from 'node-cache';
import { Cache } from './cache.interface';

@Injectable()
export class MemoryCacheService implements Cache {
  private cache: NodeCache;

  constructor() {
    /**
     * Initialize NodeCache instance with default settings.
     * - `stdTTL`: Default time-to-live for all cache entries (in seconds).
     */
    // this.c = new NodeCache.NodeCache({ stdTTL: 0 });
    this.cache = new NodeCache({ stdTTL: 0 });
  }

  /**
   * Retrieve a value from the cache by its key.
   *
   * @param key - The cache key to retrieve.
   * @returns The cached value, or `null` if the key is not found or expired.
   */
  async get<T>(key: string): Promise<T | null> {
    const value = this.cache.get<T>(key);
    return value || null; // Return null if the value is not found
  }

  /**
   * Store a value in the cache with a specified TTL.
   *
   * @param key - The cache key to store the value under.
   * @param value - The value to store in the cache.
   * @param ttl - The time-to-live for the cache entry (in seconds).
   */
  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    this.cache.set(key, value, ttl); // Store value with TTL
  }

  /**
   * Delete a specific cache entry by its key.
   *
   * @param key - The cache key to delete.
   */
  async delete(key: string): Promise<void> {
    this.cache.del(key); // Delete the cache entry
  }

  /**
   * Clear all entries in the cache.
   */
  async clear(): Promise<void> {
    this.cache.flushAll(); // Remove all cache entries
  }
}
