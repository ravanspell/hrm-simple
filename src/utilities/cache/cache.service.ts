/**
 * CacheService
 * 
 * This service acts as an abstraction layer for caching operations. It uses a 
 * pluggable backend architecture to allow seamless switching between different 
 * caching implementations (e.g., in-memory, Redis, DynamoDB).
 * 
 * Key Features:
 * - Abstracts caching logic for consistent usage across the application.
 * - Supports multiple cache backends with minimal code changes.
 * - Facilitates caching operations such as get, set, delete, and clear.
 */
import { Injectable } from '@nestjs/common';
import { Cache } from './cache.interface';
import { MemoryCacheService } from './memory-cache.service';

@Injectable()
export class CacheService {
    private cacheService: Cache;

    /**
     * Initializes the CacheManagerService with a default caching implementation.
     * 
     * @param memoryCacheService - The default in-memory caching service.
     */
    constructor(memoryCacheService: MemoryCacheService) {
        this.cacheService = memoryCacheService; // Default to in-memory caching
    }

    /**
     * Retrieve a cached value by its key.
     * 
     * @param key - The cache key to retrieve.
     * @returns The cached value, or `null` if the key is not found or expired.
     */
    async get<T>(key: string): Promise<T | null> {
        return this.cacheService.get<T>(key);
    }

    /**
     * Store a value in the cache with a specified TTL (time-to-live).
     * 
     * @param key - The cache key to store the value under.
     * @param value - The value to store in the cache.
     * @param ttl - The time-to-live for the cache entry (in seconds).
     */
    async set<T>(key: string, value: T, ttl: number): Promise<void> {
        await this.cacheService.set<T>(key, value, ttl);
    }

    /**
     * Delete a specific cache entry by its key.
     * 
     * @param key - The cache key to delete.
     */
    async delete(key: string): Promise<void> {
        await this.cacheService.delete(key);
    }

    /**
     * Clear all entries in the cache.
     */
    async clear(): Promise<void> {
        await this.cacheService.clear();
    }

    /**
     * Dynamically switch the caching backend at runtime.
     * 
     * @param cacheService - The new caching implementation to use.
     */
    setCacheService(cacheService: Cache): void {
        this.cacheService = cacheService;
    }
}
