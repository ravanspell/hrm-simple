import { Injectable } from '@nestjs/common';
import { Cache } from './cache.interface';
import { MemoryCacheService } from './memory-cache.service';

@Injectable()
export class CacheService {
    private cacheService: Cache;

    constructor(memoryCacheService: MemoryCacheService) {
        // Initialize with the default in-memory cache
        this.cacheService = memoryCacheService;
    }

    async get<T>(key: string): Promise<T | null> {
        return this.cacheService.get<T>(key);
    }

    async set<T>(key: string, value: T, ttl: number): Promise<void> {
        await this.cacheService.set<T>(key, value, ttl);
    }

    async delete(key: string): Promise<void> {
        await this.cacheService.delete(key);
    }

    async clear(): Promise<void> {
        await this.cacheService.clear();
    }
}
