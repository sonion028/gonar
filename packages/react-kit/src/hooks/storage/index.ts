import { useCallback, useEffect } from 'react';
import { useDistinctState } from '../state';

type StorageParams<T> = Omit<
  Parameters<typeof useDistinctState<T>>[0],
  'onlyEvent'
> & {
  /** 储存的key */
  key: string;
  /** 储存类型。 localStorage 或 sessionStorage */
  storage?: typeof localStorage | typeof sessionStorage;
  /** 初始化类型检查函数，检查不通过使用初始值。可避免类型不对引起的错误 */
  checkType?: (val: T) => boolean;
  /** tab关闭前的回调, 相同key的不同回调只有初始生效。 */
  beforeunload?: () => void;
};

/**
 * @author sonion
 * @description 本地储存
 * @param params - 参数对象
 * @param params.key - 储存的key
 * @param params.initialValue - 初始值
 * @param [params.hasDiff] - 对比函数，默认对比引用是否不相同。
 * @param params.onChange - 变化回调
 * @param [params.storage] - 储存类型。 localStorage 或 sessionStorage
 * @param [params.checkType] - 初始化类型检查函数，检查不通过使用初始值。可避免类型不对引起的错误
 * @param [params.beforeunload] - tab关闭前的回调, 相同key的不同回调只有初始生效。
 */
export const useStorage = <T>({
  key,
  initialValue,
  hasDiff,
  onChange,
  storage = localStorage,
  checkType = () => true,
  beforeunload,
}: StorageParams<T>) => {
  const [storedValue, setStoredValue] = useDistinctState<T>({
    initialValue: () => {
      try {
        const saved = storage.getItem(key);
        const saved2 = saved ? JSON.parse(saved) : initialValue;
        return checkType(saved2) ? saved2 : initialValue;
      } catch (err) {
        console.warn('初始化出错，已使用默认值', err);
        return initialValue;
      }
    },
    hasDiff,
    onChange,
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue((old) => {
          const valueToStore = value instanceof Function ? value(old) : value;
          const newValue = JSON.stringify(valueToStore);
          storage.setItem(key, newValue);
          window.dispatchEvent(
            new StorageEvent('storage', {
              key,
              newValue,
              storageArea: storage,
            })
          );
          return valueToStore;
        });
      } catch (error) {
        console.error('持久化储存错误', error);
      }
    },
    [key, storage, setStoredValue]
  );

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea !== storage || event.key !== key) {
        return;
      }
      try {
        const newValue = event.newValue
          ? JSON.parse(event.newValue)
          : initialValue;
        setStoredValue(newValue);
      } catch (error) {
        console.error('storage事件处理出错', error);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, storage, initialValue, setStoredValue]);

  useEffect(() => {
    if (!beforeunload) return;
    // eslint-disable-next-line @eslint-react/web-api-no-leaked-event-listener
    window.addEventListener('beforeunload', beforeunload);
    // 不用返回清理，因为组件卸载事件不移除
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, []);

  return [storedValue, setValue] as const;
};
