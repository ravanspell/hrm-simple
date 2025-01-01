/**
 * Cache Interface
 * 
 * This interface defines the contract for caching implementations. By adhering to this interface,
 * the caching backend (e.g., in-memory, Redis, etc.) can be swapped seamlessly.
 */
export interface Cache {
    /**
     * Retrieve a cached value by its key.
     * 
     * @param key - The cache key to retrieve.
     * @returns The cached value, or `null` if the key is not found or expired.
     */
    get<T>(key: string): Promise<T | null>;
  
    /**
     * Store a value in the cache with a specified TTL.
     * 
     * @param key - The cache key to store the value under.
     * @param value - The value to store in the cache.
     * @param ttl - The time-to-live for the cache entry (in seconds).
     */
    set<T>(key: string, value: T, ttl: number): Promise<void>;
  
    /**
     * Delete a specific cache entry by its key.
     * 
     * @param key - The cache key to delete.
     */
    delete(key: string): Promise<void>;
  
    /**
     * Clear all entries in the cache.
     */
    clear(): Promise<void>;
  }
  