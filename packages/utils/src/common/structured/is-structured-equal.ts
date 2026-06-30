import { isObject, isPlainObject, isSet, isMap } from './helpers';

type CompareStatus = 'checking' | 'equal' | 'different';

/**
 * @author sonion
 * @description 初始化缓存, 用于存储已对比过的结果，避免循环引用。
 */
const initCache = () => {
  const cache = new WeakMap<object, WeakMap<object, CompareStatus>>();
  // 读取循环引用缓存
  const getCompareStatus = (a: object, b: object) => cache.get(a)?.get(b);
  // 获取循环引用缓存对应的比较结果
  const getCompareResult = (status?: CompareStatus) => {
    if (status === 'checking' || status === 'equal') return true;
    if (status === 'different') return false;
    return void 0;
  };

  // 标记对象对正在比较，并返回完成比较的更新函数
  const startCompare = (a: object, b: object) => {
    let cachedResult = cache.get(a);
    if (!cachedResult) {
      cachedResult = new WeakMap<object, CompareStatus>();
      cache.set(a, cachedResult);
    }
    cachedResult.set(b, 'checking');
    return (result: boolean) => {
      cachedResult.set(b, result ? 'equal' : 'different');
      return result;
    };
  };
  return {
    getCompareStatus,
    getCompareResult,
    startCompare,
  };
};

/**
 * @author sonion
 * @description 比较两个结构化数据是否相等。
 * 支持 primitive、Array、Plain Object、Map、Set 及循环引用，不支持函数、Symbol、Date、RegExp、自定义类实例对比。
 * @param {unknown} a - 要比较的第一个值
 * @param {unknown} b - 要比较的第二个值
 * @param {object} options - 对比参数
 * @param {boolean} [options.ignoreArrayOrder] - 是否忽略数组顺序 -默认值：true
 * @param {boolean} [options.ignoreSetOrder] - 是否忽略 Set 顺序 -默认值：true
 * @returns 如果两个值相等则返回 true，否则返回 false
 */
export const isStructuredEqual = (
  a: unknown,
  b: unknown,
  { ignoreArrayOrder = true, ignoreSetOrder = true } = {}
): boolean => {
  // 比较数组是否相等
  const isArrayEqual = (a: unknown[], b: unknown[], ignoreOrder: boolean) => {
    if (a.length !== b.length) return false;
    // 不忽略数组顺序：逐项比较
    if (!ignoreOrder) {
      for (let i = 0, length = a.length; i < length; i++) {
        if (!_isStructuredEqual(a[i], b[i])) return false;
      }
      return true;
    }

    // 忽略数组顺序：按“多重集”匹配，正确处理重复元素
    const matched = new Array<boolean>(b.length).fill(false);
    outer: for (let i = 0, length = a.length; i < length; i++) {
      const aItem = a[i];
      for (let j = 0, len = b.length; j < len; j++) {
        if (matched[j]) continue;
        if (_isStructuredEqual(aItem, b[j])) {
          matched[j] = true;
          continue outer;
        }
      }
      return false;
    }
    return true;
  };

  // 比较键值集合是否相等
  const isKeyValueEqual = (
    aSize: number,
    bSize: number,
    aEntries: Iterable<[unknown, unknown]>,
    bHas: (key: unknown) => boolean,
    bGet: (key: unknown) => unknown
  ): boolean => {
    if (aSize !== bSize) return false;
    for (const [key, value] of aEntries) {
      if (!bHas(key)) return false;
      if (!_isStructuredEqual(value, bGet(key))) return false;
    }
    return true;
  };

  // 初始化缓存, 用于存储已对比过的结果
  const { getCompareStatus, getCompareResult, startCompare } = initCache();

  // 比较值是否相等
  const _isStructuredEqual = (a: unknown, b: unknown): boolean => {
    const aType = typeof a,
      bType = typeof b;
    if (aType === 'function' || bType === 'function') {
      throw new Error('Functions are not supported for deep comparison');
    }
    if (aType === 'symbol' || bType === 'symbol') {
      throw new Error('Symbols are not supported for deep comparison');
    }
    if (aType !== bType) return false;
    if (!isObject(a) || !isObject(b)) return Object.is(a, b);
    if (Object.is(a, b)) return true;

    const cachedCompareResult = getCompareResult(getCompareStatus(a, b));
    if (cachedCompareResult !== void 0) return cachedCompareResult;
    const finishCompare = startCompare(a, b);

    if (isSet(a) && isSet(b)) {
      if (a.size !== b.size) return finishCompare(false);
      return finishCompare(isArrayEqual([...a], [...b], ignoreSetOrder));
    }

    if (Array.isArray(a) && Array.isArray(b)) {
      return finishCompare(isArrayEqual(a, b, ignoreArrayOrder));
    }

    if (isMap(a) && isMap(b)) {
      return finishCompare(
        isKeyValueEqual(
          a.size,
          b.size,
          a,
          (key) => b.has(key),
          (key) => b.get(key)
        )
      );
    }
    if (!isPlainObject(a) || !isPlainObject(b)) {
      throw new Error('Only plain objects are supported for deep comparison');
    }
    const aEntries = Object.entries(a);
    return finishCompare(
      isKeyValueEqual(
        aEntries.length,
        Object.keys(b).length,
        aEntries,
        (key) => Object.hasOwnProperty.call(b, key as PropertyKey), // 解决无属性和有属性但值为 undefined 的情况
        (key) => b[key as string]
      )
    );
  };

  return _isStructuredEqual(a, b);
};
