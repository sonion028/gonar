import { useCallback, useEffect, useRef } from 'react';
import { useDistinctState, useLatestCallback } from '../state';

type StorageType = typeof localStorage | typeof sessionStorage;

type StorageParams<T> = Omit<
  Parameters<typeof useDistinctState<T>>[0],
  'onlyEvent' | 'initialValue'
> & {
  /** 储存的key */
  key: string;
  /** 默认值 */
  defaultValue: T;
  /** 储存类型。 localStorage 或 sessionStorage */
  storage?: StorageType;
  /** 初始化类型检查函数，检查不通过使用初始值。可避免类型不对引起的错误 */
  checkType?: (val: T) => boolean;
  /** tab关闭前的回调, 相同key的不同回调只有初始生效。 */
  beforeunload?: (key: string, value: T, storage: StorageType) => void;
};

/**
 * @author sonion
 * @description 本地储存
 * @param params - 参数对象
 * @param params.key - 储存的key
 * @param params.defaultValue - 默认值
 * @param [params.hasDiff] - 对比函数，默认对比引用是否不相同。
 * @param params.onChange - 变化回调
 * @param [params.storage] - 储存类型。 localStorage 或 sessionStorage
 * @param [params.checkType] - 初始化类型检查函数，检查不通过使用初始值。可避免类型不对引起的错误
 * @param [params.beforeunload] - tab关闭前的回调。
 */
export const useStorage = <T>({
  key,
  defaultValue,
  hasDiff,
  onChange,
  storage = localStorage,
  checkType = () => true,
  beforeunload,
}: StorageParams<T>) => {
  // 值规范化
  const normalizedValue = useLatestCallback((val: string) => {
    try {
      const saved = val ? JSON.parse(val) : defaultValue;
      return checkType(saved) ? saved : defaultValue;
    } catch (err) {
      console.warn('规范化出错，已使用默认值', err);
      return defaultValue;
    }
  });

  const [storedValue, setStoredValue] = useDistinctState<T>({
    initialValue: () => normalizedValue(storage.getItem(key) ?? ''),
    hasDiff,
    onChange,
  });

  const selfDispatchedEventsRef = useRef(new WeakSet<StorageEvent>());

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue((old) => {
          const valueToStore = value instanceof Function ? value(old) : value;
          const newValue = JSON.stringify(valueToStore);
          storage.setItem(key, newValue);
          const event = new StorageEvent('storage', {
            key,
            newValue,
            storageArea: storage,
          });
          selfDispatchedEventsRef.current.add(event);
          window.dispatchEvent(event);
          return valueToStore;
        });
      } catch (error) {
        console.error('持久化储存错误', error);
      }
    },
    [key, storage, setStoredValue]
  );

  const handleStorageChange = useLatestCallback((event: StorageEvent) => {
    if (
      selfDispatchedEventsRef.current.has(event) ||
      event.storageArea !== storage ||
      event.key !== key
    ) {
      return;
    }
    try {
      const newValue = normalizedValue(event.newValue ?? '');
      setStoredValue(newValue);
    } catch (error) {
      console.error('storage事件处理出错', error);
    }
  });

  useEffect(() => {
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [handleStorageChange]);

  const handleBeforeunload = useLatestCallback(() =>
    beforeunload?.(key, storedValue, storage)
  );
  useEffect(() => {
    // 不用返回清理，因为组件卸载事件不移除
    // eslint-disable-next-line @eslint-react/web-api-no-leaked-event-listener
    beforeunload && window.addEventListener('beforeunload', handleBeforeunload);
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, []);

  return [
    storedValue,
    setValue,
    () => window.removeEventListener('storage', handleStorageChange),
    () =>
      beforeunload &&
      window.removeEventListener('beforeunload', handleBeforeunload),
  ] as const;
};
