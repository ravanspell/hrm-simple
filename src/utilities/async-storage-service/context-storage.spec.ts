import { AsyncStorageService } from './async-storage.service';

describe('AsyncStorageService', () => {
  let service: AsyncStorageService;

  beforeEach(() => {
    service = new AsyncStorageService();
    // Clear the context before each test
    service.clear();
  });

  describe('get and set', () => {
    it('should set and get a string value', () => {
      service.set('testKey', 'testValue');
      expect(service.get('testKey')).toBe('testValue');
    });

    it('should set and get a number value', () => {
      service.set('numberKey', 42);
      expect(service.get('numberKey')).toBe(42);
    });

    it('should set and get an object value', () => {
      const testObject = { name: 'test', value: 123 };
      service.set('objectKey', testObject);
      expect(service.get('objectKey')).toEqual(testObject);
    });

    it('should return undefined for non-existent keys', () => {
      expect(service.get('nonexistentKey')).toBeUndefined();
    });

    it('should update existing values', () => {
      service.set('updateKey', 'initial');
      service.set('updateKey', 'updated');
      expect(service.get('updateKey')).toBe('updated');
    });
  });

  describe('runWithContext', () => {
    it('should run a function with the specified context', () => {
      const result = service.runWithContext('testKey', 'testValue', () =>
        service.get('testKey'),
      );
      expect(result).toBe('testValue');
    });

    it('should not affect the outer context', () => {
      service.set('outerKey', 'outerValue');

      service.runWithContext('innerKey', 'innerValue', () => {
        expect(service.get('innerKey')).toBe('innerValue');
        expect(service.get('outerKey')).toBeUndefined();
      });

      expect(service.get('outerKey')).toBe('outerValue');
      expect(service.get('innerKey')).toBeUndefined();
    });

    it('should return the result of the function', () => {
      const result = service.runWithContext(
        'testKey',
        'testValue',
        () => 'function result',
      );
      expect(result).toBe('function result');
    });
  });

  describe('clear', () => {
    it('should clear all values from the context', () => {
      service.set('key1', 'value1');
      service.set('key2', 'value2');

      service.clear();

      expect(service.get('key1')).toBeUndefined();
      expect(service.get('key2')).toBeUndefined();
    });
  });
});
