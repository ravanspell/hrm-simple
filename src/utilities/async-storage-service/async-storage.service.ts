import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

/**
 * Generic context storage utility using AsyncLocalStorage
 * Allows storing and retrieving context data across async operations
 */
@Injectable()
export class AsyncStorageService {
  private static storage = new AsyncLocalStorage<Record<string, any>>();

  /**
   * Get a value from the current context
   * @param key The key to retrieve
   * @returns The value associated with the key, or undefined if not found
   */
  get<T>(key: string): T | undefined {
    return AsyncStorageService.storage.getStore()?.[key] as T | undefined;
  }

  /**
   * Set a value in the current context
   * @param key The key to set
   * @param value The value to store
   */
  set<T>(key: string, value: T): void {
    const store = AsyncStorageService.storage.getStore() || {};
    AsyncStorageService.storage.enterWith({ ...store, [key]: value });
  }

  /**
   * Run a function with specific context values
   * @param key The key to set in the context
   * @param value The value to store
   * @param fn The function to run with the specified context
   * @returns The result of the function
   */
  runWithContext<T, R>(key: string, value: T, fn: () => R): R {
    return AsyncStorageService.storage.run({ [key]: value }, fn);
  }

  /**
   * Clear all values from the current context
   */
  clear(): void {
    AsyncStorageService.storage.enterWith({});
  }
}
