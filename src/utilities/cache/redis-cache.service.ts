// redis-cache.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisCacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private getCacheKey(group: string | undefined, key: string): string {
    return group ? `${group}:${key}` : key;
  }

  // Generic method to get or set cache with optional group
  async getOrSetCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    group?: string,
    ttl?: number,
  ): Promise<T> {
    try {
      const cacheKey = this.getCacheKey(group, key);
      const cachedData = await this.cacheManager.get<T>(cacheKey);
      
      if (cachedData) {
        return cachedData; // Cache hit
      }

      // Cache miss - fetch fresh data
      const freshData = await fetchFn();
      
      // Store in cache with optional group prefix
      await this.cacheManager.set(cacheKey, freshData, ttl);
      
      return freshData;
    } catch (error) {
      console.error(`Cache operation failed for ${group ? `${group}:` : ''}${key}:`, error);
      return fetchFn(); // Fallback to fetch
    }
  }

  // Update cache with new data
  async updateCache<T>(
    key: string,
    data: T,
    group?: string,
    ttl?: number,
  ): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(group, key);
      await this.cacheManager.set(cacheKey, data, ttl);
    } catch (error) {
      console.error(`Failed to update cache for ${group ? `${group}:` : ''}${key}:`, error);
      throw error;
    }
  }

  // Invalidate specific cache key
  async invalidateCache(key: string, group?: string): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(group, key);
      await this.cacheManager.del(cacheKey);
    } catch (error) {
      console.error(`Failed to invalidate cache for ${group ? `${group}:` : ''}${key}:`, error);
      throw error;
    }
  }

  // Invalidate entire cache group
  async invalidateCacheGroup(group: string): Promise<void> {
    try {
      // Note: This is a simplified version. In a real implementation,
      // you might want to use Redis SCAN to iterate over keys matching the group pattern
      // For now, we'll rely on the cache manager's implementation
      const pattern = `${group}:*`;
      await this.cacheManager.del(pattern);
    } catch (error) {
      console.error(`Failed to invalidate cache group ${group}:`, error);
      throw error;
    }
  }

  // Clear all cache
  async clearAllCache(): Promise<void> {
    try {
      await this.cacheManager.del('*');
    } catch (error) {
      console.error('Failed to clear all cache:', error);
      throw error;
    }
  }
}