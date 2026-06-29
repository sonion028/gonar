/**
 * @author sonion
 * @param value 要判断的值
 * @description 是否为null或undefined
 */
export const isNil = (value: unknown): value is null | undefined =>
  value === null || value === void 0;

/**
 * @author sonion
 * @description 是否为纯对象
 * @param val 要判断的值
 * @returns 如果为纯对象则返回 true，否则返回 false
 */
export const isPlainObject = (val: unknown): val is Record<string, unknown> => {
  if (Object(val) !== val) return false;
  const proto = Object.getPrototypeOf(val);
  return proto === Object.prototype || isNil(proto);
};

/**
 * @author sonion
 * @description 深度比较两个未知类型的值是否相等。支持 Plain Object。
 * 仅支持纯数据对象，不支持函数、Symbol、Date、RegExp、自定义类实例对比。
 * @param a 要比较的第一个值
 * @param b 要比较的第二个值
 * @param ignoreArrayOrder 是否忽略数组顺序 -默认值：true
 * @returns 如果两个值相等则返回 true，否则返回 false
 */
export const isDeepPlainEqual = (
  a: unknown,
  b: unknown,
  ignoreArrayOrder = true
): boolean => {
  const _isDeepPlainEqual = (a: unknown, b: unknown): boolean => {
    const aType = typeof a,
      bType = typeof b;
    if (aType === 'function' || bType === 'function') {
      throw new Error('Functions are not supported for deep comparison');
    }
    if (aType === 'symbol' || bType === 'symbol') {
      throw new Error('Symbols are not supported for deep comparison');
    }
    if (aType !== bType) return false;
    if (Object(a) !== a || Object(b) !== b) return Object.is(a, b);
    if (Object.is(a, b)) return true;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      // 不忽略数组顺序：逐项比较
      if (!ignoreArrayOrder) {
        for (let i = 0, length = a.length; i < length; i++) {
          if (!_isDeepPlainEqual(a[i], b[i])) return false;
        }
        return true;
      }

      // 忽略数组顺序：按“多重集”匹配，正确处理重复元素
      const matched = new Array<boolean>(b.length).fill(false);
      outer: for (let i = 0, length = a.length; i < length; i++) {
        const aItem = a[i];
        for (let j = 0, len = b.length; j < len; j++) {
          if (matched[j]) continue;
          if (_isDeepPlainEqual(aItem, b[j])) {
            matched[j] = true;
            continue outer;
          }
        }
        return false;
      }
      return true;
    }

    if (!isPlainObject(a) || !isPlainObject(b)) {
      throw new Error('Only plain objects are supported for deep comparison');
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    for (const key of aKeys) {
      if (!Object.hasOwnProperty.call(b, key)) return false; // 解决无属性和有属性但值为 undefined 的情况
      if (!_isDeepPlainEqual(a[key], b[key])) {
        return false;
      }
    }
    return true;
  };

  return _isDeepPlainEqual(a, b);
};
