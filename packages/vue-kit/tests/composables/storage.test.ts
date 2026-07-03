import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useStorage } from '../../src/composables/storage';

const OriginalStorageEvent = window.StorageEvent;

const storageMock = (): Storage => {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
    length: 0,
    key: vi.fn(),
  } as unknown as Storage;
};

describe('vue useStorage', () => {
  const originalLocalStorage = window.localStorage;
  const originalSessionStorage = window.sessionStorage;

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: storageMock(),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'sessionStorage', {
      value: storageMock(),
      writable: true,
      configurable: true,
    });
    window.StorageEvent = function (
      type: string,
      eventInitDict?: StorageEventInit
    ) {
      const event = new OriginalStorageEvent(type, {
        ...eventInitDict,
        storageArea: null,
      });
      Object.defineProperty(event, 'storageArea', {
        value: eventInitDict?.storageArea ?? null,
        writable: false,
      });
      return event;
    } as unknown as typeof StorageEvent;
  });

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'sessionStorage', {
      value: originalSessionStorage,
      writable: true,
      configurable: true,
    });
    window.StorageEvent = OriginalStorageEvent;
    vi.restoreAllMocks();
  });

  it('returns default value when storage is empty and stored value when present', () => {
    const [emptyValue, cleanupEmpty] = useStorage({
      key: 'empty',
      defaultValue: 'fallback',
    });
    window.localStorage.setItem('stored', JSON.stringify('saved'));
    const [storedValue, cleanupStored] = useStorage({
      key: 'stored',
      defaultValue: 'fallback',
    });

    expect(emptyValue.value).toBe('fallback');
    expect(storedValue.value).toBe('saved');

    cleanupEmpty();
    cleanupStored();
  });

  it('falls back to default value when JSON parsing or type checking fails', () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    window.localStorage.setItem('bad-json', 'bad-json');
    window.localStorage.setItem('bad-type', JSON.stringify('42'));

    const [badJson, cleanupBadJson] = useStorage({
      key: 'bad-json',
      defaultValue: 1,
    });
    const [badType, cleanupBadType] = useStorage({
      key: 'bad-type',
      defaultValue: 2,
      checkType: (val): val is number => typeof val === 'number',
    });

    expect(badJson.value).toBe(1);
    expect(badType.value).toBe(2);
    expect(consoleWarn).toHaveBeenCalled();

    cleanupBadJson();
    cleanupBadType();
  });

  it('writes through computed setter and calls onChange only when value differs', () => {
    const onChange = vi.fn();
    const [storedValue, cleanup] = useStorage({
      key: 'counter',
      defaultValue: 0,
      onChange,
    });

    storedValue.value = 1;
    storedValue.value = 1;

    expect(storedValue.value).toBe(1);
    expect(window.localStorage.getItem('counter')).toBe(JSON.stringify(1));
    expect(onChange).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it('honors custom hasDiff and custom storage target', () => {
    const onChange = vi.fn();
    const [storedValue, cleanup] = useStorage({
      key: 'session-key',
      defaultValue: 'a',
      storage: window.sessionStorage,
      hasDiff: () => false,
      onChange,
    });

    storedValue.value = 'b';

    expect(storedValue.value).toBe('a');
    expect(window.sessionStorage.getItem('session-key')).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
    cleanup();
  });

  it('updates from external storage events and ignores unrelated events', () => {
    const [storedValue, cleanup] = useStorage({
      key: 'sync-key',
      defaultValue: 'initial',
    });

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'other-key',
        newValue: JSON.stringify('other'),
        storageArea: window.localStorage,
      })
    );
    expect(storedValue.value).toBe('initial');

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'sync-key',
        newValue: JSON.stringify('next'),
        storageArea: window.localStorage,
      })
    );
    expect(storedValue.value).toBe('next');
    cleanup();
  });

  it('registers and cleans beforeunload listener', () => {
    const beforeunload = vi.fn();
    const [, cleanupStorage, cleanupBeforeunload] = useStorage({
      key: 'beforeunload-key',
      defaultValue: 'value',
      beforeunload,
    });

    window.dispatchEvent(new Event('beforeunload'));
    expect(beforeunload).toHaveBeenCalledTimes(1);

    cleanupBeforeunload();
    window.dispatchEvent(new Event('beforeunload'));
    expect(beforeunload).toHaveBeenCalledTimes(1);
    cleanupStorage();
  });
});
