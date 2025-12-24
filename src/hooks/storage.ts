import { useCallback, useEffect, useState } from 'react';

const handleMap = new Map<string, () => void>();

/**
 * @author sonion
 * @description 本地储存
 * @param params - 参数对象
 * @param {string} params.key - 储存的key
 * @param {T} params.initialValue - 初始值
 * @param {typeof localStorage | typeof sessionStorage} [params.storage] - 储存类型
 * @param {() => void} [params.beforeunload] - tab关闭前的回调, 相同key的不同回调会被覆盖。
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
  }, [key, storage, initialValue]);

  // 不用useEffect，因为组件卸载事件不移除。不用useRef存旧事件函数，因为组件卸载就没有了
  // 不用担心Map造成内存泄漏，因为beforeunload事件还在，事件处理函数本就该存在，所以不存在泄漏
  const oldBeforeunload = handleMap.get(key);
  if (oldBeforeunload && beforeunload !== oldBeforeunload) {
    window.removeEventListener('beforeunload', oldBeforeunload);
    handleMap.delete(key);
  }

  if (beforeunload && beforeunload !== oldBeforeunload) {
    window.addEventListener('beforeunload', beforeunload);
    handleMap.set(key, beforeunload);
  }

  return [storedValue, setValue] as const;
};
