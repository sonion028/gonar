import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useStorage } from '../../src/hooks/storage';

const OriginalStorageEvent = window.StorageEvent;

describe('useStorage', () => {
  const originalLocalStorage = window.localStorage;
  const originalSessionStorage = window.sessionStorage;

  beforeEach(() => {
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
    vi.clearAllMocks();
  });

  it('should return default value when storage is empty', () => {
    const { result } = renderHook(() =>
      useStorage({ key: 'test-key', defaultValue: 'initial' })
    );

    const [value] = result.current;
    expect(value).toBe('initial');
  });

  it('should return stored value when storage has value', () => {
    window.localStorage.setItem('test-key', JSON.stringify('stored'));

    const { result } = renderHook(() =>
      useStorage({ key: 'test-key', defaultValue: 'initial' })
    );

    const [value] = result.current;
    expect(value).toBe('stored');
  });

  it('should use defaultValue when checkType fails', () => {
    window.localStorage.setItem('test-key', JSON.stringify('invalid-type'));

    const checkType = (val: unknown): val is number => typeof val === 'number';

    const { result } = renderHook(() =>
      useStorage({
        key: 'test-key',
        defaultValue: 42,
        checkType,
      })
    );

    const [value] = result.current;
    expect(value).toBe(42);
  });

  it('should use stored value when checkType passes', () => {
    window.localStorage.setItem('test-key', JSON.stringify(100));

    const checkType = (val: unknown): val is number => typeof val === 'number';

    const { result } = renderHook(() =>
      useStorage({
        key: 'test-key',
        defaultValue: 42,
        checkType,
      })
    );

    const [value] = result.current;
    expect(value).toBe(100);
  });

  it('should save value to storage when setValue is called', () => {
    const { result } = renderHook(() =>
      useStorage({ key: 'test-key', defaultValue: 'initial' })
    );
    const [, setValue] = result.current;

    act(() => {
      setValue('new-value');
    });

    expect(window.localStorage.getItem('test-key')).toBe(
      JSON.stringify('new-value')
    );
  });

  it('should support functional update', () => {
    window.localStorage.setItem('test-key', JSON.stringify(10));

    const { result } = renderHook(() =>
      useStorage({ key: 'test-key', defaultValue: 0 })
    );
    const [, setValue] = result.current;

    act(() => {
      setValue((prev) => prev + 5);
    });

    expect(window.localStorage.getItem('test-key')).toBe(JSON.stringify(15));
  });

  it('should use sessionStorage when specified', () => {
    const { result } = renderHook(() =>
      useStorage({
        key: 'test-key',
        defaultValue: 'initial',
        storage: window.sessionStorage,
      })
    );
    const [, setValue] = result.current;

    act(() => {
      setValue('new-value');
    });

    expect(window.sessionStorage.getItem('test-key')).toBe(
      JSON.stringify('new-value')
    );
  });

  it('should handle JSON parse error gracefully', () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    window.localStorage.setItem('test-key', 'invalid-json');

    const { result } = renderHook(() =>
      useStorage({ key: 'test-key', defaultValue: 'initial' })
    );

    const [value] = result.current;
    expect(value).toBe('initial');
    expect(consoleWarnSpy).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  it('should handle complex objects', () => {
    const complexObject = {
      name: 'test',
      nested: { value: 42 },
      array: [1, 2, 3],
    };

    const { result } = renderHook(() =>
      useStorage({ key: 'test-key', defaultValue: complexObject })
    );
    const [, setValue] = result.current;

    act(() => {
      setValue(complexObject);
    });

    const stored = window.localStorage.getItem('test-key');
    expect(JSON.parse(stored!)).toEqual(complexObject);
  });

  it('should handle storage event from other tabs', () => {
    const { result } = renderHook(() =>
      useStorage({ key: 'test-key', defaultValue: 'initial' })
    );

    const event = new Event('storage') as StorageEvent;
    Object.defineProperty(event, 'key', { value: 'test-key' });
    Object.defineProperty(event, 'newValue', {
      value: JSON.stringify('from-other-tab'),
    });
    Object.defineProperty(event, 'storageArea', { value: window.localStorage });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(result.current[0]).toBe('from-other-tab');
  });

  it('should ignore storage event for different key', () => {
    const { result } = renderHook(() =>
      useStorage({ key: 'test-key', defaultValue: 'initial' })
    );

    const event = new Event('storage') as StorageEvent;
    Object.defineProperty(event, 'key', { value: 'other-key' });
    Object.defineProperty(event, 'newValue', {
      value: JSON.stringify('other-value'),
    });
    Object.defineProperty(event, 'storageArea', { value: window.localStorage });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(result.current[0]).toBe('initial');
  });

  it('should ignore storage event from different storage area', () => {
    const { result } = renderHook(() =>
      useStorage({ key: 'test-key', defaultValue: 'initial' })
    );

    const event = new Event('storage') as StorageEvent;
    Object.defineProperty(event, 'key', { value: 'test-key' });
    Object.defineProperty(event, 'newValue', {
      value: JSON.stringify('other-value'),
    });
    Object.defineProperty(event, 'storageArea', {
      value: window.sessionStorage,
    });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(result.current[0]).toBe('initial');
  });
});
