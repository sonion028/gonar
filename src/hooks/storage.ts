import { useCallback, useEffect, useState } from 'react';

/**
 * @author sonion
 * @description 本地储存
 * @param params - 参数对象
 * @param {string} params.key - 储存的key
 * @param {T} params.initialValue - 初始值
 * @param {typeof localStorage | typeof sessionStorage} [params.storage] - 储存类型
 * @param {() => void} [params.beforeunload] - tab关闭前的回调, 相同key的不同回调只有初始生效。
 * @param {(val: T) => boolean} [params.checkType] - 初始化类型检查函数，检查不通过使用初始值。可避免类型不对引起的错误
 */
export const useStorage = <T>({
  key,
  initialValue,
  storage = localStorage,
  beforeunload,
  checkType = () => true,
}: {
  key: string;
  initialValue: T;
  storage?: typeof localStorage | typeof sessionStorage;
  beforeunload?: () => void;
  checkType?: (val: T) => boolean;
}) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const saved = storage.getItem(key);
      const saved2 = saved ? JSON.parse(saved) : initialValue;
      return checkType(saved2) ? saved2 : initialValue;
    } catch (err) {
      console.warn('初始化出错，已使用默认值', err);
      return initialValue;
    }
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
    [key, storage]
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
  }, [key, storage, initialValue]);

  useEffect(() => {
    if (!beforeunload) return;
    window.addEventListener('beforeunload', beforeunload);
    // 不用返回清理，因为组件卸载事件不移除
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [storedValue, setValue] as const;
};
