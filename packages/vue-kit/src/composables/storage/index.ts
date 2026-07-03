import { computed, ref } from 'vue';

type StorageParams<T> = {
  /** 储存的key */
  key: string;
  /** 默认值 */
  defaultValue: T;
  /** 对比函数，默认对比引用是否不相同。 */
  hasDiff?: (prev: T, next: T) => boolean;
  /** 变化回调 */
  onChange?: (val: T) => void;
  /** 储存类型。 localStorage 或 sessionStorage */
  storage?: typeof localStorage | typeof sessionStorage;
  /** 初始化类型检查函数，检查不通过使用初始值。可避免类型不对引起的错误 */
  checkType?: (val: T) => boolean;
  /** tab关闭前的回调, 相同key的不同回调只有初始生效。 */
  beforeunload?: () => void;
};

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
  const normalizedValue = (val: string) => {
    try {
      const saved = val ? JSON.parse(val) : defaultValue;
      return checkType(saved) ? saved : defaultValue;
    } catch (err) {
      console.warn('规范化出错，已使用默认值', err);
      return defaultValue;
    }
  };

  const selfDispatchedEvents = new WeakSet<StorageEvent>();
  // 派发事件并持久化
  const dispatchPersist = (value: T) => {
    const newValue = JSON.stringify(value);
    storage.setItem(key, newValue);
    const event = new StorageEvent('storage', {
      key,
      newValue,
      storageArea: storage,
    });
    selfDispatchedEvents.add(event);
    window.dispatchEvent(event);
  };

  const internalRef = ref<T>(normalizedValue(storage.getItem(key) ?? ''));
  // 更新值
  const setInternalRef = (value: T, dispatch = false) => {
    const isDiff = hasDiff ?? ((prev: T, next: T) => prev !== next);
    if (!isDiff(internalRef.value, value)) {
      return;
    }
    onChange?.(value);
    internalRef.value = value;
    dispatch && dispatchPersist(value);
  };

  // 外部使用值
  const storedValue = computed<T>({
    get() {
      return internalRef.value;
    },
    set(value) {
      setInternalRef(value, true);
    },
  });
  // 处理storage事件
  const handleStorageChange = (event: StorageEvent) => {
    if (
      selfDispatchedEvents.has(event) ||
      event.storageArea !== storage ||
      event.key !== key
    ) {
      return;
    }
    try {
      const newValue = normalizedValue(event.newValue ?? '');
      setInternalRef(newValue, false);
    } catch (error) {
      console.error('storage事件处理出错', error);
    }
  };
  window.addEventListener('storage', handleStorageChange);
  beforeunload && window.addEventListener('beforeunload', beforeunload);
  return [
    storedValue,
    () => window.removeEventListener('storage', handleStorageChange),
    () =>
      beforeunload && window.removeEventListener('beforeunload', beforeunload),
  ] as const;
};
